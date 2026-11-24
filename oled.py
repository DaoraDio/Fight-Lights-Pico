if __name__ == "__main__":
    import main
    main.run()

print("\033[32moled\033[0m")

import _thread
import math
import time
from binascii import unhexlify

import framebuf
from machine import I2C, Pin

import config
import functions
import init


WIDTH = 128
HEIGHT = 64
FRAME_HEX_SIZE = WIDTH * HEIGHT // 4
COMBO_FILE = "oled_combo_sprites.flan"
ANIMATION_FILE = "oled_animation.flan"
_combo_frame = None
_unreadable_frame = None
_blank_visible = False
_combos = ()
_animation_running = False


def setup_oled():
    global oled, _combos
    i2c = I2C(config.i2c_interface, scl=Pin(config.oled_scl),
              sda=Pin(config.oled_sda), freq=1_000_000)
    addresses = i2c.scan()
    addr = next((address for address in (0x3C, 0x3D) if address in addresses), None)
    if addr is None:
        print("OLED not found")
        return False

    if config.oled_type == 0:
        from sh1106 import SH1106_I2C as display_driver
    elif config.oled_type == 1:
        from ssd1306 import SSD1306_I2C as display_driver
    else:
        raise ValueError("unknown OLED type")

    oled = display_driver(WIDTH, HEIGHT, i2c, addr=addr)
    oled.invert(config.invert_oled)
    oled.rotate(not config.rotate_oled)
    _combos = sorted((combo for combo in config.user_combos if len(combo) > 1),
                     key=len, reverse=True)
    print("OLED found at", hex(addr))
    return True


def round_half_up(n):
    if n - math.floor(n) >= 0.5:
        return math.ceil(n)
    else:
        return math.floor(n)



def draw_rectangle(x, y, radius, angle):
    # Convert angle to radians
    rad = angle * math.pi / 180
    cos_angle = math.cos(rad)
    sin_angle = math.sin(rad)

    # Calculate half-side length
    half_side = radius / 2  # Assuming radius is the side length of the square

    # Calculate the square corners relative to the center
    corners = [
        [-half_side, -half_side],
        [half_side, -half_side],
        [half_side, half_side],
        [-half_side, half_side]
    ]

    # Apply rotation and translation to each corner
    rotated_corners = []
    for (corner_x, corner_y) in corners:
        # Apply rotation
        x_rot = corner_x * cos_angle - corner_y * sin_angle
        y_rot = corner_x * sin_angle + corner_y * cos_angle

        # Translate to the center
        rotated_corners.append((x_rot + x, y_rot + y))

    # Draw lines between the rotated corners
    for i in range(len(rotated_corners)):
        x1, y1 = rotated_corners[i]
        x2, y2 = rotated_corners[(i + 1) % len(rotated_corners)]
        oled.line(round_half_up(x1), round_half_up(y1), round_half_up(x2), round_half_up(y2),1)

def draw_filled_circle(x_centre, y_centre, r):
    x = r
    y = 0

    oled.pixel(x + x_centre, y + y_centre,1)
    if r > 0:
        oled.pixel(x+x_centre, -y + y_centre,1)
        oled.pixel(y+x_centre, x+y_centre,1)
        oled.pixel(-y + x_centre, x+y_centre,1)

    P = 1 - r
    while x > y:
        y = y+1
        if P <= 0:
            P = P+2*y+1
        else:
            x = x-1
            P = P + 2*y - 2*x +1

        if x < y:
            break

        oled.line(-x + x_centre, y+y_centre,x+x_centre, y+y_centre,1)
        oled.line(-x+x_centre,-y+y_centre,x+x_centre, -y+y_centre,1)

        if x != y:
            oled.line(-y+x_centre,x+y_centre,y+x_centre, x+y_centre,1)
            oled.line(-y+x_centre, -x+y_centre,y+x_centre,-x+y_centre,1)
        oled.line(x_centre-r,y_centre, x_centre+r,y_centre,1)

def draw_filled_rectangle(x, y, radius, angle):
    # Convert angle to radians
    rad = math.radians(angle)
    cos_angle = math.cos(rad)
    sin_angle = math.sin(rad)

    # Calculate half-side length
    half_side = radius / 2  # Assuming radius is the side length of the square

    # Calculate the square corners relative to the center
    corners = [
        [-half_side, -half_side],
        [half_side, -half_side],
        [half_side, half_side],
        [-half_side, half_side]
    ]

    # Apply rotation and translation to each corner
    rotated_corners = []
    for (corner_x, corner_y) in corners:
        x_rot = corner_x * cos_angle - corner_y * sin_angle + x
        y_rot = corner_x * sin_angle + corner_y * cos_angle + y
        rotated_corners.append((x_rot, y_rot))

    # Determine the bounding box of the polygon
    min_y = math.ceil(min(p[1] for p in rotated_corners))
    max_y = math.floor(max(p[1] for p in rotated_corners))

    # Iterate over each scanline within the bounding box
    for scan_y in range(min_y, max_y + 1):
        intersections = []

        # Find intersections of the polygon with the scanline
        for i in range(len(rotated_corners)):
            x1, y1 = rotated_corners[i]
            x2, y2 = rotated_corners[(i + 1) % len(rotated_corners)]

            if y1 == y2:
                continue  # Ignore horizontal edges

            if (y1 <= scan_y < y2) or (y2 <= scan_y < y1):
                intersect_x = x1 + (scan_y - y1) * (x2 - x1) / (y2 - y1)
                intersections.append(intersect_x)

        # Sort intersections and fill between them
        intersections.sort()

        if len(intersections) >= 2:
            x_start = math.ceil(intersections[0])
            x_end = math.floor(intersections[-1])

            for x_fill in range(x_start, x_end + 1):
                oled.pixel(x_fill, scan_y, 1)



def draw_circle(x_centre, y_centre, r):
    x = r
    y = 0

    oled.pixel(x + x_centre, y + y_centre,1)
    if r > 0:
        oled.pixel(x+x_centre, -y + y_centre,1)
        oled.pixel(y+x_centre, x+y_centre,1)
        oled.pixel(-y + x_centre, x+y_centre,1)


    P = 1 - r
    while x > y:
        y = y+1
        if P <= 0:
            P = P+2*y+1
        else:
            x = x-1
            P = P + 2*y - 2*x +1

        if x < y:
            break

        oled.pixel(x+x_centre, y+y_centre,1)
        oled.pixel(-x + x_centre, y+y_centre,1)

        oled.pixel(x+x_centre, -y+y_centre,1)
        oled.pixel(-x+x_centre,-y+y_centre,1)


        if x != y:
            oled.pixel(y+x_centre, x+y_centre,1)
            oled.pixel(-y+x_centre,x+y_centre,1)

            oled.pixel(y+x_centre,-x+y_centre,1)
            oled.pixel(-y+x_centre, -x+y_centre,1)
    oled.pixel(x_centre-r, y_centre,1)
    oled.pixel(x_centre, y_centre-r,1)


def oled_draw_button(x,y,radius,button):
    if button is not None and button.is_pressed:
        draw_filled_circle(x,y,radius)
    else:
        draw_circle(x,y,radius)

def oled_draw_key(x,y,radius,angle,button):
    draw_rectangle(x,y,radius,angle)
    if button is not None and button.is_pressed:
        draw_filled_rectangle(x,y,radius,angle)

def oled_set_overlay_coordinates():
    x = 0
    y = 0
    for byte in config.overlay:
        for i in range(8):
            bit = (byte >> (7 - i)) & 1
            if bit == 1:
                init.pixel_coordinates.append((x + i, y))
        x += 8
        if x >= 128:
            x = 0
            y += 1

def oled_draw_overlay():
    for values in init.pixel_coordinates:
        x, y = values
        oled.pixel(x,y,1)


def invalidate_combo_frame():
    global _combo_frame
    _combo_frame = None


def oled_clear_screen():
    global _blank_visible
    init.oled_stop_animation = True
    if _blank_visible:
        return
    with init.lock:
        oled.fill(0)
        oled.show()
        invalidate_combo_frame()
        _blank_visible = True


def oled_draw_splash():
    global _blank_visible
    init.oled_stop_animation = True
    splash = framebuf.FrameBuffer(config.splash, WIDTH, HEIGHT, framebuf.MONO_HLSB)
    with init.lock:
        oled.blit(splash, 0, 0)
        oled.show()
        invalidate_combo_frame()
        _blank_visible = False
        init.oled_splash_drawn = True


def start_animation():
    global _animation_running
    if not _animation_running and functions.oled_animation_exists():
        _animation_running = True
        try:
            _thread.start_new_thread(play_animation, ())
        except (OSError, RuntimeError) as error:
            _animation_running = False
            print("Could not start OLED animation:", error)


def play_animation():
    global _animation_running, _blank_visible
    try:
        while True:
            if init.oled_stop_animation:
                time.sleep_ms(20)
                continue
            with open(ANIMATION_FILE, "rb") as stream:
                while not init.oled_stop_animation:
                    data = stream.read(FRAME_HEX_SIZE)
                    if len(data) != FRAME_HEX_SIZE:
                        break
                    frame = framebuf.FrameBuffer(bytearray(unhexlify(data)), WIDTH, HEIGHT,
                                                 framebuf.MONO_HLSB)
                    with init.lock:
                        if init.oled_stop_animation:
                            break
                        oled.blit(frame, 0, 0)
                        oled.show()
                        _blank_visible = False
                    if config.oled_animation_delay:
                        time.sleep_ms(config.oled_animation_delay)
    except (OSError, ValueError) as error:
        print("OLED animation error:", error)
    finally:
        _animation_running = False


def draw_options_progress(value):
    global _blank_visible
    init.oled_stop_animation = True
    with init.lock:
        oled.fill(0)
        oled.text("Entering", 30, 0)
        oled.text("LED Options Mode", 0, 13)
        oled.rect(10, 30, 100, 20, 1)
        if value:
            oled.fill_rect(10, 30, value, 20, 1)
        oled.text(str(value) + "%", 54, 53)
        oled.show()
        invalidate_combo_frame()
        _blank_visible = False


def oled_draw_options_mode(profile_num=0):
    global _blank_visible
    init.oled_stop_animation = True
    with init.lock:
        oled.fill(0)
        oled.text("SELECT PROFILE:", 5, 0)
        oled.hline(0, 8, 128, 1)
        name = init.profile_names[profile_num]
        oled.text(name[:16], max(0, (WIDTH - len(name) * 8) // 2), 18)
        if len(name) > 16:
            oled.text(name[16:32], 0, 26)
        if profile_num < len(init.profile_names) - 1:
            oled.text("<", 50, 35)
        if profile_num > 0:
            oled.text(">", 60, 35)
        oled.text("Brightness:" + str(round(config.brightness_mod * 100)) + "%", 0, 50)
        oled.show()
        invalidate_combo_frame()
        _blank_visible = False


def oled_draw_lever(x, y, radius):
    distance = int(radius / 1.4)
    offset_x = -distance if functions.direction_pressed(config.eight_way_left) else 0
    offset_y = -distance if functions.direction_pressed(config.eight_way_up) else 0
    if functions.direction_pressed(config.eight_way_right):
        offset_x = distance
    if functions.direction_pressed(config.eight_way_down):
        offset_y = distance
    draw_circle(x, y, radius)
    draw_filled_circle(x + offset_x, y + offset_y, radius - 2)


def display_single_frame(frame_index):
    global _combo_frame, _unreadable_frame, _blank_visible
    if frame_index == _combo_frame:
        return True
    if frame_index == _unreadable_frame or frame_index < 0:
        return False

    try:
        with open(COMBO_FILE, "rb") as stream:
            stream.seek(frame_index * FRAME_HEX_SIZE)
            data = stream.read(FRAME_HEX_SIZE)
        if len(data) != FRAME_HEX_SIZE:
            raise ValueError("incomplete frame")
        pixels = bytearray(unhexlify(data))
    except (OSError, ValueError) as error:
        print("OLED combo frame", frame_index, ":", error)
        _unreadable_frame = frame_index
        return False

    init.oled_stop_animation = True
    frame = framebuf.FrameBuffer(pixels, WIDTH, HEIGHT, framebuf.MONO_HLSB)
    with init.lock:
        oled.blit(frame, 0, 0)
        oled.show()
        _combo_frame = frame_index
        _blank_visible = False
    return True


def combo_frame_visible():
    return _combo_frame is not None


def oled_draw_combo_animation():
    frame_index = config.oled_combo_idle_frame
    best_length = 0
    has_priority = False
    for combo in _combos:
        if len(combo) < best_length:
            break
        buttons = combo[:-1]
        if all(button.is_pressed for button in buttons):
            priority = any(button.highest_prio for button in buttons)
            if not best_length or priority and not has_priority:
                frame_index = combo[-1]
                best_length = len(combo)
                has_priority = priority

    shown = frame_index >= 0 and display_single_frame(frame_index)
    init.combo_triggered = shown and bool(best_length)
    if not shown:
        invalidate_combo_frame()


def oled_draw_stick(overwrite=False):
    global _blank_visible
    if not overwrite and not any(button.was_pressed or button.released
                                 for button in config.button_list):
        return

    init.oled_stop_animation = True
    with init.lock:
        oled.fill(0)
        for x, y, kind, button, radius, angle in config.oled_buttons:
            if kind == "is_lever":
                oled_draw_lever(x, y, radius)
            elif kind == "is_key":
                oled_draw_key(x, y, radius, angle, button)
            elif kind == "is_button":
                oled_draw_button(x, y, radius, button)
        oled_draw_overlay()
        oled.show()
        invalidate_combo_frame()
        _blank_visible = False
        init.oled_stick_drawn = True
