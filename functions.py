if __name__ == "__main__":
    import main
    main.run()

print("\033[32mfunctions\033[0m")

import errno
import io
import math
import os
import random
import time

import machine
import micropython

import init


def configure(active_config, pixel_driver):
    global config, statemachine
    config = active_config
    statemachine = pixel_driver
    if not config.colors:
        config.colors = ((0, 0, 0),)


def start_timers():
    micropython.alloc_emergency_exception_buf(100)
    init.timer1.init(freq=init.frequency, mode=machine.Timer.PERIODIC, callback=tick)
    if config.save_stats:
        print_stats()
        init.stats_updated_ms = time.ticks_ms()
        init.timer3.init(period=30_000, mode=machine.Timer.PERIODIC, callback=request_stats_save)


def measure_execution_time(func):
    def wrapper(*args, **kwargs):
        started = time.ticks_us()
        result = func(*args, **kwargs)
        print("Took %.3f ms" % (time.ticks_diff(time.ticks_us(), started) / 1000))
        return result
    return wrapper


def dummy(pin):
    pass

#timer interrupt function
#increases timer counter for every timer interrupt
def tick(timer):
    init.idle_counter += 1
    init.timer_counter += 1
    init.string_leniency += 1


def read_stats():
    values = {}
    try:
        with open(init.file_name, "r") as stats:
            for line in stats:
                if not line.strip() or line.lstrip().startswith("#"):
                    continue
                fields = line.split(":", 1)
                if len(fields) != 2:
                    continue
                try:
                    values[fields[0].strip()] = int(fields[1])
                except ValueError:
                    continue
    except OSError as error:
        if error.args[0] != errno.ENOENT:
            raise
    return values


def save_stats():
    now = time.ticks_ms()
    elapsed = time.ticks_diff(now, init.stats_updated_ms) // 1000
    counts = [(button, button.num_presses) for button in config.button_list]
    try:
        values = read_stats()
        values["uptime"] = values.get("uptime", 0) + elapsed
        for button, count in counts:
            values[button.name] = values.get(button.name, 0) + count

        pending_file = init.file_name + ".tmp"
        with open(pending_file, "w") as stats:
            stats.write(init.header_text)
            for name, value in values.items():
                stats.write("%s: %d\n" % (name, value))
        os.rename(pending_file, init.file_name)
    except OSError as error:
        print("Could not save stats:", error)
        return

    init.stats_updated_ms = time.ticks_add(init.stats_updated_ms, elapsed * 1000)
    for button, count in counts:
        button.num_presses -= count


def clear_led(pin):
    init.idle_counter = init.setback_value


def request_stats_save(timer):
    init.run_savestats = True


def service_stats():
    if init.run_savestats:
        init.run_savestats = False
        save_stats()


def debounce_brightness(pin):
    init.timer2.init(mode=machine.Timer.ONE_SHOT, period=100, callback=open_options)


def open_options(timer):
    init.idle_counter = init.setback_value
    init.options_requested = True


def increase_brightness(step):
    config.brightness_mod = min(1, max(0, config.brightness_mod + step))


def decrease_brightness(step):
    increase_brightness(-step)


def pixels_show(brightness_input):
    visible = statemachine.visible_ar
    scale = int(256 * min(1, max(0, brightness_input)))
    for index, pixel in enumerate(statemachine.ar):
        visible[index] = statemachine.scale_pixel(pixel, scale)
    statemachine.write_pixels(statemachine.sm, visible)


def pixels_show_idle(brightness_input, active_leds=None):
    visible = statemachine.visible_ar
    scale = int(256 * min(1, max(0, brightness_input)))
    base_scale = int(256 * min(1, max(0, config.brightness_mod)))
    for index, pixel in enumerate(statemachine.ar):
        selected_scale = scale if active_leds is not None and index in active_leds else base_scale
        visible[index] = statemachine.scale_pixel(pixel, selected_scale)
    statemachine.write_pixels(statemachine.sm, visible)


def pixels_set(index, color):
    statemachine.ar[index] = statemachine.pack_rgb(color)


def pixels_set_range(indices, color):
    packed = statemachine.pack_rgb(color)
    for index in indices:
        statemachine.ar[index] = packed


def pixels_setHSV(i,color):
    rgbcolor = HSVtoRGB(color)
    pixels_set(i, rgbcolor)

#sets all leds to color in RGB
def pixels_fill(color):
    pixels_set_range(range(len(statemachine.ar)), color)

#sets all leds to color in HSV
def pixels_fillHSV(colorHSV):
    colorRGB = HSVtoRGB(colorHSV)
    pixels_fill(colorRGB)


def print_stats():
    try:
        values = read_stats()
    except OSError as error:
        print("Could not read stats:", error)
        return

    uptime = values.pop("uptime", 0)
    for name, count in sorted(values.items(), key=lambda item: item[1]):
        print("%s: %d" % (name, count))
    print("uptime:", seconds_to_time(uptime))


def seconds_to_time(seconds):
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return "%dh:%dm:%ds" % (hours, minutes, seconds)

# Input a value 0 to 255 to get a color value.
# The colours are a transition r - g - b - back to r.
def wheel(pos):
    if pos < 0 or pos > 255:
        return (0, 0, 0)
    if pos < 85:
        return (255 - pos * 3, pos * 3, 0)
    if pos < 170:
        pos -= 85
        return (0, 255 - pos * 3, pos * 3)
    pos -= 170
    return (pos * 3, 0, 255 - pos * 3)

def alt_wheel(pos):
    if pos < 85:
        return (pos * 3, 255 - pos * 3, 0)
    elif pos < 170:
        pos -= 85
        return (255 - pos * 3, 0, pos * 3)
    else:
        pos -= 170
        return (0, pos * 3, 255 - pos * 3)

#returns the color in rgb of a LED
#not fully implemented yet
def get_pixelcolor(pos):
    r = int(((statemachine.ar[pos] >> 8) & 0xFF))
    g = int(((statemachine.ar[pos] >> 16) & 0xFF))
    b = int((statemachine.ar[pos] & 0xFF))
    return (r,g,b)

#shuffles an array
def shuffle_array(arr):
    last_index = len(arr)-1
    while last_index > 0:
        rand_index = random.randint(0,last_index)
        temp = arr[last_index]
        arr[last_index] = arr[rand_index]
        arr[rand_index] = temp
        last_index -= 1

#unused
def inverse_ledlist(ledlist):
    leds = []
    for i in range(config.led_count):
        leds.append(i)

    for i in range(len(ledlist)):
        leds.remove(ledlist[i])

    return leds


# Convert the configured idle timeout from seconds to timer ticks.
def idle_after():
    return get_seconds(config.idle_after)


def get_seconds(seconds):
    return init.frequency * seconds


#returns the id of a pin
def get_id(*args, **kwargs):
    output = io.StringIO()
    print(*args, file=output, **kwargs)
    s = output.getvalue()
    output.close()
    myid=s[s.find('(')+1:s.find(',')]
    return myid



# Convert hue in degrees and saturation/value percentages to RGB bytes.
def HSVtoRGB(hsvcolor):
    hue, saturation, value = hsvcolor
    sector = (hue % 360) / 60
    value = min(100, max(0, value)) / 100
    chroma = value * min(100, max(0, saturation)) / 100
    cross = chroma * (1 - abs(sector % 2 - 1))

    if sector < 1:
        rgb = chroma, cross, 0
    elif sector < 2:
        rgb = cross, chroma, 0
    elif sector < 3:
        rgb = 0, chroma, cross
    elif sector < 4:
        rgb = 0, cross, chroma
    elif sector < 5:
        rgb = cross, 0, chroma
    else:
        rgb = chroma, 0, cross

    offset = value - chroma
    return tuple(math.ceil((channel + offset) * 255) for channel in rgb)


#converts RGB Colors in range of 0-255 to HSV colors (0-359,0-100,0-100)
#takes an RGB tupel (R,G,B) as input, returns a HSV tupel (H,S,V)
def RGBtoHSV(rgbcolor):
    R = rgbcolor[0]/255
    G = rgbcolor[1]/255
    B = rgbcolor[2]/255
    Cmax = max(R,G)
    Cmax = max(Cmax, B)

    Cmin = min(R,G)
    Cmin = min(Cmin,B)

    delta = Cmax-Cmin


    if delta == 0:
        H = 0
    elif Cmax == R:
        modulus = ((G-B)/delta)
        H = 60*(modulus%6)
    elif Cmax == G:
        H = 60*(((B-R)/delta)+2)
    elif Cmax == B:
        H = 60*(((R-G)/delta)+4)


    if Cmax == 0:
        S = 0
    else:
        S = delta/Cmax

    V = Cmax

    H = math.ceil(H)
    S = math.ceil(S*100)
    V = math.ceil(V*100)

    if H > 359:
        H = 359
    if S > 100:
        S = 100
    if V > 100:
        V = 100

    return (H,S,V)

#helper function that helps with LED fade
#gets a value (usually the V of a HSV color)
#decreses the value defined by speed and returns it
#if the value becomes negative it sets the value to 0
def fade_val_dec(color_val, speed):
    if color_val >= 0:
        color_val -= speed
        if color_val < 0:
            color_val = 0
    return color_val

def fade_val_dec_exp(color_val, speed):
    if color_val >= 0:
        color_val -= math.exp((2*speed) / 10)
    return max(color_val, 0)

def fade_val_inc(color_val, speed):
    if color_val <= 100:
        color_val += speed
        if color_val > 100:
            color_val = 100
    return color_val


#helper function
#return true if no button is pressed at the moment
#returns false when a button is currently pressed
def no_buttons_pressed():
    return not any(button.is_pressed for button in config.button_list)


def buttons_held(buttons):
    return bool(buttons) and all(button.is_pressed for button in buttons)


def oled_animation_exists():
    try:
        return os.stat("oled_animation.flan")[6] >= 2048
    except OSError:
        return False


def set_background(background):
    if init.cached_background is not background:
        init.cached_background = background
        entries = []
        # A one-row Configurator export omits the outer tuple's trailing comma.
        if background and not isinstance(background[0], (tuple, list)):
            background = (background,)
        for brightness, color, *positions in background:
            if color != init.rainbow:
                hue, saturation, value = RGBtoHSV(color)
                color = HSVtoRGB((hue, saturation, value * brightness))
            entries.append((brightness, color, tuple(pos - 1 for pos in positions)))
        init.background_entries = entries
        init.cached_background = background

    # Rebuild the base layer so unmapped LEDs cannot retain a previous effect.
    pixels_fill((0, 0, 0))
    hue = None
    for brightness, color, indices in init.background_entries:
        if color == init.rainbow:
            if hue is None:
                hue = (time.ticks_ms() / (config.rainbow_speed or 1)) % 360
            color = HSVtoRGB((hue, 100, 100 * brightness))
        pixels_set_range(indices, color)


def read_profile(filename):
    name = filename
    color_source = ""
    palette = {}
    with open(filename, "r") as profile:
        for line in profile:
            fields = line.split("=", 1)
            if len(fields) != 2 or line[:1].isspace():
                continue
            key, value = (field.strip() for field in fields)
            if key == "profile_name" and value[:1] in ('"', "'"):
                closing_quote = value.rfind(value[0])
                if closing_quote > 0:
                    name = value[1:closing_quote]
            else:
                value = value.split("#", 1)[0].strip()
                if key == "profile_color":
                    color_source = value
                elif value.startswith("(") and value.endswith(")"):
                    color = parse_rgb(value)
                    if color is not None:
                        palette[key] = color
            if key == "profile_color" and name != filename:
                break

    return name, parse_rgb(color_source) or palette.get(color_source, (0, 0, 0))


def parse_rgb(value):
    if not value.startswith("(") or not value.endswith(")"):
        return None
    channels = value[1:-1].split(",")
    if len(channels) == 4 and not channels[-1].strip():
        channels.pop()
    if len(channels) != 3:
        return None
    try:
        rgb = tuple(int(channel.strip()) for channel in channels)
    except ValueError:
        return None
    return rgb if all(0 <= channel <= 255 for channel in rgb) else None


def get_profile_name(config_name):
    return read_profile(config_name)[0]


def get_profile_color(config_name):
    return read_profile(config_name)[1]


def set_profile_list():
    profiles = [(0, "config.py", config.profile_name, config.profile_color)]
    for filename in os.listdir():
        if filename.startswith("config") and filename.endswith(".py"):
            number = filename[6:-3]
            if number.isdigit() and int(number) > 0:
                try:
                    name, color = read_profile(filename)
                    profiles.append((int(number), filename, name, color))
                except OSError as error:
                    print("Could not read profile %s:" % filename, error)

    profiles.sort()
    init.profiles = profiles
    init.profile_names = [entry[2] for entry in profiles]


def recover_profile_swap():
    names = os.listdir()
    for pending in names:
        if not (pending.startswith("config") and pending.endswith(".swap")
                and pending[6:-5].isdigit()):
            continue

        original_slot = pending[:-5] + ".py"
        if "config.py" not in names and original_slot in names:
            # The former active profile is already safe in its new slot.
            os.rename(pending, "config.py")
        elif "config.py" in names and original_slot not in names:
            # The active profile was never moved. Restore the selected slot.
            os.rename(pending, original_slot)
        return


def activate_profile(filename):
    pending = filename[:-3] + ".swap"
    os.rename(filename, pending)
    try:
        os.rename("config.py", filename)
        os.rename(pending, "config.py")
    except OSError:
        recover_profile_swap()
        raise
    machine.reset()


def list_to_string(values):
    return "+".join(values)


def add_fgc_input(sequence, num):
    if not sequence:
        return
    init.fgc_strings.append(list(sequence))
    init.copy_strings.append(tuple(sequence))
    init.animation_num.append(num)
    init.fgc_strings_length += 1


def play_animation(num):
    import animation

    if num == 3:
        animation.flash_all(config.RED)
    elif num in (1, 2):
        order = (7, 8, 6, 9, 5, 10, 4, 11, 3, 12, 2, 13, 1, 14, 0, 15)
        if num == 2:
            order = order[::-1]
        color = config.ORANGE if num == 1 else config.RED
        animation.fireball(tuple(pos for pos in order if pos < config.led_count), color)


def check_fgc_string():
    if init.string_leniency > config.input_reset_time:
        init.string_leniency = 0
        for index, sequence in enumerate(init.copy_strings):
            init.fgc_strings[index] = list(sequence)

    if init.current_input == init.previous_input:
        return
    init.previous_input = init.current_input
    for index, remaining in enumerate(init.fgc_strings):
        if remaining[0] == init.current_input:
            remaining.pop(0)
            init.string_leniency = 0
            if not remaining:
                play_animation(init.animation_num[index])
                init.fgc_strings[index] = list(init.copy_strings[index])


def mode_select(brightness_steps):
    init.mode_selector = 0
    init.timer_lock = True
    use_smooth_steps = brightness_steps == init.smooth
    step = config.smooth_brightness_speed if use_smooth_steps else brightness_steps
    brightness_up = first_button(config.ledOptions_increase_brightness)
    brightness_down = first_button(config.ledOptions_decrease_brightness)
    left = first_button(config.ledOptions_left_button)
    right = first_button(config.ledOptions_right_button)
    confirm = first_button(config.ledOptions_confirm)
    entry_buttons = config.ledOptions_led_buttons
    entry_held = buttons_held(entry_buttons)
    controls = []
    menu_buttons = (brightness_up, brightness_down, left, right, confirm)
    for button in menu_buttons + tuple(entry_buttons):
        if button is not None and button not in controls:
            controls.append(button)

    display = None
    if init.oled_active:
        import oled as display

    base_color = config.ledOptions_color
    for color in ((0, 0, 0), base_color, (0, 0, 0), base_color):
        time.sleep_ms(25)
        pixels_fill(color)
        pixels_show(config.brightness_mod)

    previous_view = None
    while True:
        for button in controls:
            button.poll(0)
        if control_pressed(brightness_up, use_smooth_steps):
            increase_brightness(step)
        if control_pressed(brightness_down, use_smooth_steps):
            decrease_brightness(step)
        if control_pressed(right):
            init.mode_selector = max(0, init.mode_selector - 1)
        if control_pressed(left):
            init.mode_selector = min(len(init.profiles) - 1, init.mode_selector + 1)

        _, filename, _, color = init.profiles[init.mode_selector]
        chord_pressed = buttons_held(entry_buttons)
        if control_pressed(confirm) or (chord_pressed and not entry_held):
            if init.mode_selector != 0:
                activate_profile(filename)
            init.timer_lock = False
            init.options_require_release = chord_pressed
            return
        entry_held = chord_pressed

        view = (init.mode_selector, config.brightness_mod)
        if view != previous_view:
            if config.ledOptions_profile_color_use_all_LEDs:
                pixels_fill(color)
            else:
                pixels_fill(base_color)
                if config.led_count:
                    pixels_set(init.mode_selector % config.led_count, color)
            pixels_show(max(0.01, config.brightness_mod))
            if display is not None:
                display.oled_draw_options_mode(init.mode_selector)
            previous_view = view

        service_stats()
        time.sleep_ms(10)


def first_button(buttons):
    return buttons[0] if buttons else None


def control_pressed(button, held=False):
    return button is not None and (button.is_pressed if held else button.was_pressed)


# Interpolate RGB channels at a progress value from 0 to 100.
def lerp_rgb(color1, color2, t):
    fraction = t / 100
    red = color1[0] + (color2[0] - color1[0]) * fraction
    green = color1[1] + (color2[1] - color1[1]) * fraction
    blue = color1[2] + (color2[2] - color1[2]) * fraction
    return int(red), int(green), int(blue)

def reset_background():
    init.cached_background = None
    init.background_entries = []


def lerp(tstart, tend, t, ystart, yend):
    if tend <= tstart:
        return yend
    fraction = min(1, max(0, (t - tstart) / (tend - tstart)))
    return ystart + (yend - ystart) * fraction


def direction_button(direction):
    if len(direction) > 2 and direction[2] != init.notSet:
        return direction[2]
    return None


def direction_pressed(direction):
    button = direction_button(direction)
    return button is not None and button.is_pressed


def run_eight_way_joystick():
    up = direction_pressed(config.eight_way_up)
    down = direction_pressed(config.eight_way_down)
    left = direction_pressed(config.eight_way_left)
    right = direction_pressed(config.eight_way_right)

    direction_bits = up | (down << 1) | (left << 2) | (right << 3)
    if direction_bits != init.direction_bits or not direction_bits:
        color_id = init.random_color_id
        if direction_bits and color_id == init.last_color_id:
            color_id = (color_id + 1) % len(config.colors)
        init.saved_RGB = config.colors[color_id]
        init.last_color_id = color_id
        init.direction_bits = direction_bits

    if up and left:
        direction = config.eight_way_upleft
    elif up and right:
        direction = config.eight_way_upright
    elif down and left:
        direction = config.eight_way_leftdown
    elif down and right:
        direction = config.eight_way_rightdown
    elif up:
        direction = config.eight_way_up
    elif down:
        direction = config.eight_way_down
    elif left:
        direction = config.eight_way_left
    elif right:
        direction = config.eight_way_right
    else:
        return

    indices, color = direction[:2]
    if indices and indices[0] >= 0:
        pixels_set_range(indices, init.saved_RGB if color == init.random else color)


def remove_idle_skips(led_count=None, skipped=None):
    if led_count is None:
        # Older Configurator files call this with no arguments during import.
        import config as active_config
        led_count = active_config.led_count
        skipped = active_config.skip_leds_in_idle
    return [index for index in range(led_count) if index not in skipped]
