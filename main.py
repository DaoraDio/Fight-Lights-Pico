print("\033[32mmain\033[0m")
import sys
import time

import machine

import functions
import init


oled = None


def setup_oled():
    if not config.activate_oled:
        return

    global oled
    try:
        import oled as display
        if not display.setup_oled():
            return
        display.oled_draw_splash()
    except (OSError, ValueError) as error:
        print("OLED setup failed:", error)
        return

    oled = display
    init.oled_active = True
    init.oled_splash_drawn = True
    if config.overlay:
        oled.oled_set_overlay_coordinates()
    if sum(button.is_pressed for button in config.button_list) < 3:
        oled.start_animation()


def draw_display():
    if not init.oled_active:
        return

    oled.oled_draw_combo_animation()
    if init.combo_triggered or oled.combo_frame_visible():
        init.oled_splash_drawn = False
        init.oled_stick_drawn = False
        return

    layout = config.oled_layout
    init.oled_stop_animation = layout != 3
    if layout == 0:
        oled.oled_draw_stick(not init.oled_stick_drawn)
    elif layout == 1 and not init.oled_splash_drawn:
        oled.oled_draw_splash()
    elif layout == 2:
        oled.oled_clear_screen()


def render_options_entry():
    chord_held = functions.buttons_held(config.ledOptions_led_buttons)
    if init.options_require_release:
        if not chord_held:
            init.options_require_release = False
        return False

    if init.options_requested:
        init.options_requested = False
        functions.mode_select(config.brightness_steps)
        init.oled_splash_drawn = False
        init.oled_stick_drawn = False
        return True

    if not chord_held:
        if init.timer_lock:
            init.timer_lock = False
            init.oled_splash_drawn = False
            init.oled_stick_drawn = False
        return False

    if not init.timer_lock:
        init.timer_start = init.timer_counter
        init.timer_target = init.timer_start + functions.get_seconds(config.ledOptions_start_time)
        init.timer_lock = True

    progress = functions.lerp(init.timer_start, init.timer_target, init.timer_counter, 0, 100)
    functions.pixels_fill(functions.lerp_rgb((0, 0, 0), config.ledOptions_color, progress))
    functions.pixels_show(config.brightness_mod)

    if init.oled_active:
        oled.draw_options_progress(round(progress))

    if init.timer_counter >= init.timer_target:
        functions.mode_select(config.brightness_steps)
        init.timer_lock = False
        init.oled_splash_drawn = False
        init.oled_stick_drawn = False
    return True


def run_idle_mode():
    if init.oled_active:
        layout = config.oled_idle
        init.oled_stop_animation = layout != 3
        if layout == 0:
            oled.oled_draw_splash()
        elif layout == 1:
            oled.oled_clear_screen()
        elif layout == 2:
            oled.oled_draw_stick(True)

    idle_modes[config.idle_mode - 1]()
    init.oled_splash_drawn = False
    init.oled_stick_drawn = False
    if init.oled_active:
        oled.invalidate_combo_frame()


def main():
    if config.leniency >= 1:
        init.leniency_counter += 1
        if init.leniency_counter >= config.leniency:
            init.i += 1
            init.leniency_counter = 0
        init.random_color_id = init.i % len(config.colors)
    else:
        init.random_color_id = time.ticks_cpu() % len(config.colors)

    # Poll each GPIO once so background, effects and controls agree on this frame.
    buttons = config.button_list
    for button in buttons:
        color_id = init.random_color_id
        if config.leniency < 1:
            color_id = time.ticks_cpu() % len(config.colors)
        button.poll(color_id)

    if config.clear_background_on_press and not functions.no_buttons_pressed():
        functions.pixels_fill((0, 0, 0))
    else:
        functions.set_background(config.background)

    if render_options_entry():
        functions.service_stats()
        return

    # Render the latest pressed button last so its effect wins on shared LEDs.
    for index, button in enumerate(buttons):
        if button.highest_prio:
            init.start_pos = (index + 1) % len(buttons)
            break
    for offset in range(len(buttons)):
        buttons[(init.start_pos + offset) % len(buttons)].render()

    functions.run_eight_way_joystick()
    if init.fgc_strings_length:
        pressed_names = [button.name for button in buttons if button.is_pressed]
        init.current_input = functions.list_to_string(pressed_names) if pressed_names else "n"
        functions.check_fgc_string()

    on_off_held = functions.buttons_held(config.OnOff_button)
    if on_off_held and not init.on_off_cnt:
        if config.brightness_mod > 0:
            init.tmp_brightness = config.brightness_mod
            config.brightness_mod = 0
        else:
            config.brightness_mod = init.tmp_brightness
    init.on_off_cnt = on_off_held

    draw_display()
    functions.service_stats()
    functions.pixels_show(min(init.temp_brightness, config.brightness_mod))
    init.temp_brightness = min(1, init.temp_brightness + 0.04)
    if 1 <= config.idle_mode <= len(idle_modes) and init.idle_counter > init.idle_ticks:
        run_idle_mode()


def run():
    global config, idle_modes
    # Recover a profile swap before anything attempts to import config.py.
    functions.recover_profile_swap()
    import config
    import animation
    import statemachine

    functions.configure(config, statemachine)
    init.code = ""
    idle_modes = (
        animation.idle_mode1, animation.idle_mode2, animation.idle_mode3,
        animation.idle_mode4, animation.idle_mode5, animation.idle_mode6,
    )
    if config.activate_player_led:
        import playerLED
        playerLED.start()

    try:
        onboard_led = machine.Pin("LED", machine.Pin.OUT)
    except (TypeError, ValueError):
        onboard_led = machine.Pin(25, machine.Pin.OUT)
    onboard_led.value(config.onboard_led_on)

    init.idle_ticks = functions.idle_after()
    functions.set_profile_list()
    functions.start_timers()
    for button in config.button_list:
        button.poll(0)
    setup_oled()

    while True:
        try:
            main()
        except Exception as error:
            sys.print_exception(error)
            time.sleep_ms(100)
            machine.reset()


if __name__ == "__main__":
    run()

