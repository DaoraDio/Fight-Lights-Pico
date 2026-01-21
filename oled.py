if __name__ == '__main__':
    import init
    with open('main.py', 'r') as f:
        init.code = f.read()
    exec(init.code)

print("\033[32moled\033[0m")

from machine import I2C, ADC, Pin
from sh1106 import SH1106_I2C
from ssd1306 import SSD1306_I2C
import ssd1306
import framebuf
import time
import functions
import _thread
import gc
import init
import math
import config
import sys

def setup_oled():
    global oled
    global i2c
    
    i2c = I2C(config.i2c_interface, scl=Pin(config.oled_scl), sda=Pin(config.oled_sda), freq=1000000)
    print("\033[32mOled Found\033[0m at Address: " + hex(i2c.scan()[0]).upper())

    WIDTH  = 128
    HEIGHT = 64

    if config.oled_type == 0:
        oled = SH1106_I2C(WIDTH, HEIGHT, i2c)
    elif config.oled_type == 1:
        oled = SSD1306_I2C(WIDTH, HEIGHT, i2c)

    oled.invert(config.invert_oled) #invert colors
    oled.rotate(not config.rotate_oled) #rotate display
    

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
        #print(round_half_up(x1), round_half_up(y1), round_half_up(x2), round_half_up(y2))
        oled.line(round_half_up(x1), round_half_up(y1), round_half_up(x2), round_half_up(y2),1)

def draw_filled_circle(x_centre, y_centre, r):
    x = r
    y = 0
    
    oled.pixel(x + x_centre, y + y_centre,1)
    if r > 0:
        oled.pixel(x+x_centre, -y + y_centre,1)
        oled.pixel(y+x_centre, x+y_centre,1)
        oled.pixel(-y + x_centre, x+y_centre,1)

    P = 1-r;
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

    
    P = 1-r;
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
        

#@functions.measure_execution_time
def oled_clear_screen():
    oled.fill(0)
    with init.lock:
        oled.show()

def oled_draw_splash():
    fb = framebuf.FrameBuffer(config.splash, 128, 64, framebuf.MONO_HLSB)
    oled.blit(fb, 0, 0)
    with init.lock:
        oled.show()


def measure_execution_time(func):
    def wrapper(*args, **kwargs):
        times = []
        iterations = 1
        for i in range(iterations):
            t1 = time.ticks_us()
            func(*args, **kwargs)
            t2 = time.ticks_us()-t1
            times.append(t2)
        average = sum(times) / len(times)
        #print(f'Took {t2/1000:.3f} ms')
        print(f'Took on average {average/1000:.3f} ms')
    return wrapper

def string_to_bytearray(data_str):
    hex_values = data_str.split(',')
    return bytearray(int(value, 16) for value in hex_values)

  
         
#@measure_execution_time
def play_animation():
    characters_to_read = 32
    while True:
        y = 0
        if init.oled_stop_animation == False:
            with open('oled_animation.flan', 'r') as f:
                init.t2 = time.ticks_ms()  # Start time
                while init.oled_stop_animation == False:
                    chars = f.read(characters_to_read)
                    if not chars:
                        break
                    num = bytearray.fromhex(chars)
                    init.framebuffer = framebuf.FrameBuffer(num, characters_to_read * 4, 1, framebuf.MONO_HLSB)
                    oled.blit(init.framebuffer, 0, y)

                    y = (y + 1) % 64
                    if y == 0:
                        with init.lock:
                            oled.show()
                            init.t1 = time.ticks_ms()  # End time
                            frame_duration = time.ticks_diff(init.t1, init.t2)
                            if frame_duration > 0:
                                fps = 1000 / frame_duration
                                #print("FPS:", fps)
                            else:
                                #print("Frame too fast to measure accurately.")
                                pass
                            init.t2 = init.t1
                            time.sleep_ms(config.oled_animation_delay)
                
                

def play_animation2():
    import oled_animation
    while True:
        for frame in oled_animation.frames:
            if init.oled_stop_animation == False:
                fb = framebuf.FrameBuffer(frame, 128, 64, framebuf.MONO_HLSB)
                oled.blit(fb, 0, 0)
                with init.lock:
                    oled.show()
                time.sleep_ms(config.oled_animation_delay)
            
def oled_draw_options_mode(profile_num=0):
    oled.fill(0)
    oled.text("SELECT PROFILE:",5,0)
    oled.line(0,8, 128,8,1)
    
    profile_name_length = len(init.profile_names[profile_num])
    text_position = int((130 - profile_name_length*8)/2)
    if text_position > 0:
        oled.text(init.profile_names[profile_num],text_position,18)
    else:
        text_position = 0
        oled.text(init.profile_names[profile_num][:16],text_position,18)
        oled.text(init.profile_names[profile_num][16:],text_position,26)
    
    
    if profile_num != len(init.profile_names)-1:
        oled.text("<",50,35)
    if profile_num > 0:
        oled.text(">",60,35)
    
    oled.text("Brightness:" + str(round(config.brightness_mod*100)) + '%', 0, 50)
    with init.lock:
        oled.show()
    
def oled_draw_lever(x,y,radius):
    offset_y = 0
    offset_x = 0
    if config.eight_way_up[2].is_pressed:
        offset_y = int(-radius/1.4)
    if config.eight_way_down[2].is_pressed:
        offset_y = int(radius/1.4)
    if config.eight_way_left[2].is_pressed:
        offset_x = int(-radius/1.4)
    if config.eight_way_right[2].is_pressed:
        offset_x = int(radius/1.4)
    
    
    draw_circle(x,y,radius)
    draw_filled_circle(offset_x+x,offset_y+y,radius-2)
    
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
        
def display_single_frame(frame_index):
    CHARS_PER_FRAME = 2048 
    
    try:
        with open('oled_combo_sprites.flan', 'r') as f:
            f.seek(frame_index * CHARS_PER_FRAME)
            hex_data = f.read(CHARS_PER_FRAME)
            
            if len(hex_data) < CHARS_PER_FRAME:
                return #incomplete data

            raw_bytes = bytearray.fromhex(hex_data)
            fb = framebuf.FrameBuffer(raw_bytes, 128, 64, framebuf.MONO_HLSB)
            
            oled.blit(fb, 0, 0)
            with init.lock:
                oled.show()
                
    except Exception as e:
        print("Frame Error:", e)
            
def oled_draw_combo_animation():
    config.user_combos.sort(key=lambda x: (len(x[:-1]), any(getattr(b, 'highest_prio', False) for b in x[:-1])),reverse=True)
    
    init.combo_triggered = False 
    
    for combo_data in config.user_combos:
        frame_index = combo_data[-1]
        combo_buttons = combo_data[:-1] 
        
        if all(button.is_pressed for button in combo_buttons):
            display_single_frame(frame_index)
            init.combo_triggered = True 
            break 

    if not init.combo_triggered and config.oled_combo_idle_frame >= 0:
        display_single_frame(config.oled_combo_idle_frame)
    
        
#--------------------------------------------------------------------------------------------
#@functions.measure_execution_time
def oled_draw_stick(overwrite = False):
    
    if overwrite:
        action_taken = True
    else:
        action_taken = False

    for button in config.button_list:
        if button.was_pressed or button.released:
            action_taken = True
            init.oled_overlay_drawn = False
            

    
    if action_taken:
        oled.fill(0)
        
        for oled_button in config.oled_buttons:
            if oled_button[2] == 'is_lever':
                oled_draw_lever(oled_button[0],oled_button[1],oled_button[4])
            if oled_button[2] == 'is_key':
                oled_draw_key(oled_button[0],oled_button[1],oled_button[4],oled_button[5],oled_button[3])
            if oled_button[2] == 'is_button':
                oled_draw_button(oled_button[0],oled_button[1],oled_button[4],oled_button[3])
        
        if init.pixel_coordinates:
            oled_draw_overlay()
        
        with init.lock:
            oled.show()
        
        action_taken = False