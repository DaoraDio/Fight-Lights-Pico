if __name__ == "__main__":
    import main
    main.run()

print("\033[32manimation\033[0m")

import math
import random
import time

import config
import functions
import init


BLACK = (0, 0, 0)


def is_idle():
    functions.service_stats()
    return init.idle_counter > init.idle_ticks


def idle_mode1():
    colors = list(config.idle_mode1_colors)
    leds = config.idlemode_leds
    speed = config.idle_mode1_speed
    if not colors or not leds or speed <= 0:
        idle_mode6()
        return

    functions.shuffle_array(colors)
    while is_idle():
        for color in colors:
            hue, saturation, _ = functions.RGBtoHSV(color)
            value = 0
            step = min(100, speed * len(leds))
            for target, delta in ((100, step), (0, -step)):
                while value != target:
                    if not is_idle():
                        return
                    value = max(0, min(100, value + delta))
                    rgb = functions.HSVtoRGB((hue, saturation, value))
                    functions.pixels_set_range(leds, rgb)
                    functions.pixels_show(config.brightness_mod)


def idle_mode2():
    leds = config.idlemode_leds
    if not leds:
        idle_mode6()
        return

    brightness = 0
    phase = 0
    while is_idle():
        brightness = min(config.brightness_mod, brightness + 0.01)
        for led in leds:
            color_index = (led * 256 // config.led_count + phase) & 255
            functions.pixels_set(led, functions.wheel(color_index))
        functions.pixels_show(brightness)
        phase = (phase + 1) & 255
        time.sleep_ms(3)


def idle_mode3():
    brightness = config.brightness_mod
    target = min(brightness, max(0, config.idle_mode3_brightness))
    while is_idle():
        brightness = max(target, brightness - 0.01)
        functions.set_background(config.background)
        functions.pixels_show_idle(brightness, config.idlemode_leds)
        time.sleep_ms(3)


def idle_mode4():
    leds = config.idlemode_leds
    if not leds:
        idle_mode6()
        return

    drops = []
    until_flash = random.randint(5, 15)
    flash_colors = ((255, 0, 0), (255, 255, 0), (255, 0, 255), (0, 0, 255))
    while is_idle():
        for _ in range(5):
            drops.append((random.choice(leds), 200, random.randint(45, 90)))
        functions.pixels_set_range(leds, BLACK)
        surviving_drops = []
        for led, brightness, decay in drops:
            functions.pixels_set(led, (0, 0, brightness))
            if brightness > decay:
                surviving_drops.append((led, brightness - decay, decay))
        drops = surviving_drops
        functions.pixels_show(config.brightness_mod)

        until_flash -= 1
        if until_flash == 0:
            for brightness in range(255, -1, -40):
                if not is_idle():
                    return
                color = functions.lerp_rgb(BLACK, random.choice(flash_colors), 100 * brightness / 255)
                functions.pixels_set_range(leds, color)
                functions.pixels_show(config.brightness_mod)
                time.sleep_ms(80)
            until_flash = random.randint(5, 15)
        time.sleep_ms(110)


def idle_mode5():
    leds = config.idlemode_leds
    if not leds:
        idle_mode6()
        return

    hue = random.randint(0, 359)
    delay_ms = 50
    delay_step = -1
    while is_idle():
        hue = (hue + 60) % 360
        color = functions.HSVtoRGB((hue, 100, 100))
        for led in leds:
            if not is_idle():
                return
            functions.pixels_set(led, color)
            functions.pixels_show(config.brightness_mod)
            for pos in leds:
                old_hue, old_saturation, value = functions.RGBtoHSV(functions.get_pixelcolor(pos))
                faded = functions.HSVtoRGB((old_hue, old_saturation, max(10, value - 10)))
                functions.pixels_set(pos, faded)
            time.sleep_ms(delay_ms)
        delay_ms += delay_step
        if delay_ms in (0, 50):
            delay_step = -delay_step


def idle_mode6():
    # Keep the last LED frame while the OLED uses its idle layout.
    while is_idle():
        time.sleep_ms(10)


def color_change():
    for hue in range(360):
        functions.pixels_fillHSV((hue, 100, 100))
        functions.pixels_show(config.brightness_mod)
    for value in range(99, -1, -1):
        functions.pixels_fillHSV((359, 100, value))
        functions.pixels_show(config.brightness_mod)


def pulsing_light(wait_ms=100):
    for phase in range(1, config.led_count * 2 + 1):
        for led in range(config.led_count):
            wave = (math.sin(led + phase) * 127 + 128) / 255
            functions.pixels_set(led, (round(wave * 255), round(wave * 100), round(wave * 100)))
        functions.pixels_show(config.brightness_mod)
        time.sleep_ms(wait_ms)


def color_fade_out(led_pos, color_rgb, speed=1):
    hue, saturation, value = functions.RGBtoHSV(color_rgb)
    if speed <= 0:
        return
    while value > 0:
        value = max(0, value - speed)
        functions.pixels_set_range(led_pos, functions.HSVtoRGB((hue, saturation, value)))
        functions.pixels_show(config.brightness_mod)


def color_fade_in(led_pos, color_rgb, speed=1):
    hue, saturation, target = functions.RGBtoHSV(color_rgb)
    if speed <= 0:
        return
    value = 0
    while value < target:
        value = min(target, value + speed)
        functions.pixels_set_range(led_pos, functions.HSVtoRGB((hue, saturation, value)))
        functions.pixels_show(config.brightness_mod)


def fireball(led_order, color_rgb, speed=16):
    for index in range(0, len(led_order), 2):
        color_fade_in(led_order[index:index + 2], color_rgb, speed)
    for index in range(0, len(led_order), 2):
        color_fade_out(led_order[index:index + 2], color_rgb, speed)
    for button in config.button_list:
        button.time = 0


def flash_all(color_rgb):
    for color in (color_rgb, BLACK, color_rgb, BLACK):
        functions.pixels_fill(color)
        functions.pixels_show(config.brightness_mod)
        time.sleep_ms(10)


def light_led(pos, color):
    functions.pixels_set_range(pos, color)

