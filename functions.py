print("functions")
import statemachine
import config
import array, time
import random
import io
import math
import button
import init
import machine
import os
import micropython
import animation

micropython.alloc_emergency_exception_buf(100)

#decorator to measure the execution time of a function in ms
def measure_execution_time(func):
    def wrapper(*args, **kwargs):
        times = []
        iterations = 100
        for i in range(iterations):
            t1 = time.ticks_us()
            func(*args, **kwargs)
            t2 = time.ticks_us()-t1
            times.append(t2)
        average = sum(times) / len(times)
        #print(f'Took {t2/1000:.3f} ms')
        print(f'Took on average {average/1000:.3f} ms')
    return wrapper

#dummy interrupt, does nothing. Set a button handler to this if you want to do nothing on interrupt
def dummy(pin):
    pass

#timer interrupt function
#increases timer counter for every timer interrupt
def tick(timer):
    init.idle_counter += 1
    init.timer_counter += 1
    init.string_leniency += 1


#this function is called every 30 seconds
def save_stats(timer):
    if config.save_stats == False:
        return
    
    init.seconds_counter += 30
    
    lines = init.file_content
    updated_lines = []
            
    for line in lines:
        if line[0] == "#" or line == '\n':
            continue
        
        name, value = line.split(":")
        #name = name.strip()
        value = int(value)
                    
        if name == 'uptime':
            value += init.seconds_counter
            init.idle_file_counter = 0
            init.seconds_counter = 0
                    
        for button in config.button_list:
            if button.name == name:
                value += button.num_presses
                button.num_presses = 0

        updated_lines.append(f"{name}: {value}\n")
    
    content = init.header_text + ''.join(updated_lines)

    with open(init.file_name, "w") as f:
        f.write(content)
    
    content = [line + "\n" for line in content.split("\n")]
    init.file_content = content


#sets the idle_counter to the setback value which wakes the leds up from idle mode
def clear_led(pin):
    init.idle_counter = init.setback_value


#frequenzy in hz 0.016hz = 60sec, one timer interrupt every 60seconds
#freq=1 = 1hz = 1 interrupt every second
#freq=62.5 = 1 interrupt every 0.016 seconds (1 Frame in a 60FPS Fighting Game)
init.timer1.init(freq=init.frequency, mode=machine.Timer.PERIODIC, callback=tick)
init.timer3.init(freq=1/30, mode=machine.Timer.PERIODIC, callback=save_stats) 

#interrupt routine to debounce the brightness button
#all credits to Kaspars Dambis @ https://kaspars.net/blog/micropython-button-debounce
def debounce_brightness(pin):
    # Start or replace a timer for 100ms, and trigger change_brightness.
    init.timer2.init(mode=machine.Timer.ONE_SHOT, period=100, callback=mode_select)#change_brightness)
    
#interrupt routine to debounce buttons, calls the clear_led method
#def debounce_clear_led(pin):
#    init.timer3.init(mode=machine.Timer.ONE_SHOT, period=50, callback=clear_led)


def increase_brightness(steps_size):
    brightness = config.brightness_mod
    while config.brightness_mod < (brightness + steps_size):
        pixels_show(config.brightness_mod)
        config.brightness_mod += 0.005
        if config.brightness_mod >= 1:
            config.brightness_mod = 1
            return

def decrease_brightness(steps_size):
    brightness = config.brightness_mod
    while config.brightness_mod > (brightness - steps_size):
        pixels_show(config.brightness_mod)
        config.brightness_mod -= 0.005
        if config.brightness_mod <= 0:
            config.brightness_mod = 0
            return
        
def pixels_show(brightness_input):
    dimmer_ar = array.array("I", [0 for _ in range(config.led_count)])
    brightness_scale = int(255 * brightness_input)
    for ii, cc in enumerate(statemachine.ar):
        r = (cc >> 8) & 0xFF
        g = (cc >> 16) & 0xFF
        b = cc & 0xFF
        r_scaled = (r * brightness_scale) >> 8
        g_scaled = (g * brightness_scale) >> 8
        b_scaled = (b * brightness_scale) >> 8
        dimmer_ar[ii] = (g_scaled << 16) | (r_scaled << 8) | b_scaled
    statemachine.sm.put(dimmer_ar, 8)

def pixels_set(i, color):
    statemachine.ar[i] = (color[1]<<16) + (color[0]<<8) + color[2] # set 24-bit color
    
def pixels_set_range(list, color):
    for i in list:
        pixels_set(i, color)

#sets a color at pos i, takes HSV color as value
def pixels_setHSV(i,color):
    rgbcolor = HSVtoRGB(color)
    pixels_set(i, rgbcolor)
    
#sets all leds to color in RGB
def pixels_fill(color):
    for i in range(len(statemachine.ar)):
        pixels_set(i, color)
        
#sets all leds to color in HSV      
def pixels_fillHSV(colorHSV):
    colorRGB = HSVtoRGB(colorHSV)
    pixels_fill(colorRGB)


def print_stats():
    f = open(init.file_name, "r")
    lines = f.readlines()
    values = {}
    
    for line in lines:
        if line[0] == '#':
            continue
        
        var_name = ""
        value = ""
        for i in range(len(line)):
            if line[i] == ':':
                i += 2
                for j in range(i, len(line)):
                    value += line[j]
                break
            var_name += line[i]

        value = int(value[:-1])
        values[var_name] = value
    
    uptime = values['uptime']
    del values['uptime']
    
    print("-------------------------------")
    for key, value in sorted(values.items(), key=lambda item: item[1]):
        print("%s: %s" % (key, value))
    print('uptime:', seconds_to_time(uptime))
            
            
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
        

#converts the value of the idle_after variable in config.py to ticks of the timer interrupt
#example: if idle_after = 1 in config.py, then it would take 20 ticks for 1 second to pass, at a frequency of 20hz
def idle_after():
    if config.idle_after == 0:
        return 0
    else:
        ticks = 1/(1/init.frequency)
        return ticks * config.idle_after
    
def get_seconds(input):
    ticks = 1/(1/init.frequency)
    return ticks * input
    
    
#returns the id of a pin
def get_id(*args, **kwargs):
    output = io.StringIO()
    print(*args, file=output, **kwargs)
    s = output.getvalue()
    output.close()
    myid=s[s.find('(')+1:s.find(',')]
    return myid


    
#converts HSV to RGB, the RGB values go from 0-255
#the HSV Values go between:
#H between 0 and 359 (0° - 359°)
#S between 0 and 100 (0% - 100%)
#V between 0 and 100 (0% - 100%)
#might give error if Hs is undefined
#takes a HSV color as a tupel as argument (H,S,V)
#returns RGB as a tupel (R,G,B)
def HSVtoRGB(hsvcolor):
    H = hsvcolor[0]
    S = hsvcolor[1]
    V = hsvcolor[2]
    
    if H > 359:
        print("ERROR H can only take values from 0-359")
    if S > 100:
        print("ERROR S can only take values from 0-100")
    if V > 100:
        print("ERROR V can only take values from 0-100")
    
    S = S / 100
    V = V / 100
    
    C = V * S
    Hs = H / 60
    det = (Hs%2) - 1
  
    if det < 0:
        det = det * (-1)
    
    X = C * (1-det)
    if Hs >= 0 and Hs < 1:
        R = C
        G = X
        B = 0
    if Hs >= 1 and Hs < 2:
        R = X
        G = C
        B = 0
    if Hs >= 2 and Hs < 3:
        R = 0
        G = C
        B = X
    if Hs >= 3 and Hs < 4:
        R = 0
        G = X
        B = C
    if Hs >=4 and Hs < 5:
        R = X
        G = 0
        B = C
    if Hs >= 5 and Hs < 6:
        R = C
        G = 0
        B = X
    
    m = V-C
    
    R = (R+m)*255
    G = (G+m)*255
    B = (B+m)*255
    return (math.ceil(R), math.ceil(G), math.ceil(B))


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
#decreses the value defined by config.fed_speed and returns it
#if the value becomes negative it sets the value to 0
def fade_val_dec(color_val, speed):
    if color_val >= 0:
        color_val -= speed
        if color_val < 0:
            color_val = 0
    return color_val

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
    for button in config.button_list:
        if button.is_pressed == True:
            return False
    
    return True
    
    
def set_background(background):
    #speed = 1000 #speed for colorwheel, higher = slower
    
    #if background it only a color
    if isinstance(background[0], int):
        if init.bg_initialized == False:
            init.bg_initialized = True
        
        pixels_fill(background)
        return
    elif background == 'rainbow':#if background is only 'rainbow'
        hsv_col = ((time.ticks_ms()/config.rainbow_speed)%359,100,100)
        pixels_fillHSV(hsv_col)
        return
    elif not isinstance(background[0], tuple) and init.bg_initialized == False:#if background is a single tuple
        init.ranges = list(background)
        init.brightness_values.append(init.ranges.pop(0))
        if init.brightness_values[0] > 1:
            init.brightness_values[0] = 1
        init.colors.append(init.ranges.pop(0))
        if not isinstance(init.colors[0], str):
            init.background_color = list(RGBtoHSV(init.colors[0]))
            init.background_color[2] *= init.brightness_values[0]
            init.background_color = HSVtoRGB(init.background_color)
             
        init.bg_initialized = True
        init.single_tuple = True
        
    elif init.bg_initialized == False:#if background is tuple of tuple
        #initialize the background colors
        different_tuple = len(background)
        
        #appends all the different tuple into ranges
        for tupel in background:
            init.ranges.append(list(tupel))
        
        for tupel in init.ranges:
            init.brightness_values.append(tupel.pop(0))
        
        
        #converts all the different colors into HSV and apppends them into the list init.colors
        for i in range(different_tuple):
            if isinstance(init.ranges[i][0], str):
                init.colors.append(init.ranges[i][0])
            else:
                hsv_col = list(RGBtoHSV(init.ranges[i][0]))
                hsv_col[2] *= init.brightness_values[i]
                hsv_col = HSVtoRGB(hsv_col)
                init.colors.append(hsv_col)
            
            init.ranges[i].pop(0)
        init.bg_initialized = True
        
    #display the background colors
    if init.single_tuple == True:
        for ranges in init.ranges:
            if init.colors[0] == 'rainbow':
                hsv_col = ((time.ticks_ms()/config.rainbow_speed)%359,100,100*init.brightness_values[0])
                pixels_setHSV(ranges-1,hsv_col)
            else:
                pixels_set(ranges-1, init.background_color)
    else:
        for i in range(len(init.ranges)):
            for j in range(len(init.ranges[i])):
                if init.colors[i] == 'rainbow':
                    hsv_col = ((time.ticks_ms()/config.rainbow_speed)%359,100,100*init.brightness_values[i])
                    pixels_setHSV(init.ranges[i][j]-1,hsv_col)
                else:
                    pixels_set(init.ranges[i][j]-1,init.colors[i])


def get_profile_color(config_name):
    file = open(config_name, 'r')
    color = 'blank'
    value = '(0,0,0)'
    #get the color name from 'profile_color' and save it in variable 'color'
    while True:
        line = file.readline()
        if 'profile_color' in line:
            line = line.replace('profile_color = ', '')
            line = line.strip()
            line = line.replace(' ', '')
            line = line.split('#',1)
            line = line[0]
            color = line
            file.close()
            break
        if not line:
            file.close()
            
    if color.startswith('('):
            color = color.replace('(','')
            color = color.replace(')','')
            color = eval(color)
            return color
        
    #get the value for 'color'
    file = open(config_name, 'r')
    color_def = color + ' = '
    while True:
        line = file.readline()
        if color_def in line:
            line = line.replace(color_def, '')
            line = line.strip()
            line = line.replace(' ', '')
            line = line.split('#',1)
            value = line[0]
            file.close()
            break
        if not line:
            file.close()
            break
    
    value = value.replace('(','')
    value = value.replace(')','')
    value = eval(value)
    return value


def list_to_string(list):
    my_string = ''
    
    for elements in list:
        my_string = my_string + elements + "+"
    
    return my_string[:-1]
    

def add_fgc_input(str, num):
    init.fgc_strings.append(str)
    copy = str[:]
    init.copy_strings.append(copy)
    init.animation_num.append(num)
    init.fgc_strings_length += 1
    
def play_animation(num):
        if num == 1:
            animation.fireball((7,8,6,9,5,10,4,11,3,12,2,13,1,14,0,15),config.orange) #example for led-chain with 15 leds
        if num == 2:
            animation.fireball((15,0,14,1,13,2,12,3,11,4,10,5,9,6,8,7),config.red) #example for led-chain with 15 leds
        if num == 3:
            animation.flash_all(config.red)
        return

def check_fgc_string():
    if init.fgc_strings_length == 0:
        return
    else:
        for i in range(init.fgc_strings_length):
            if init.fgc_strings[i][0] == init.current_input or not init.fgc_strings[i]:
                del init.fgc_strings[i][0]
            if not init.fgc_strings[i]:
                play_animation(init.animation_num[i])
                init.fgc_strings[i] = init.copy_strings[i].copy()
                
            if init.string_leniency > config.input_reset_time:
                init.string_leniency = 0
                for j in range(init.fgc_strings_length):
                    init.fgc_strings[j] = init.copy_strings[j].copy()


def mode_select():
    init.mode_selector = 0
    config_name = 'config.py'
    epsilon = 0.00001
    delay = 25
    bg_color = config.ledOptions_color

    #small animation at the beginning
    time.sleep_ms(delay)
    pixels_fill((0,0,0))
    pixels_show(config.brightness_mod)
    
    time.sleep_ms(delay)
    pixels_fill(bg_color)
    pixels_show(config.brightness_mod)
    
    time.sleep_ms(delay)
    pixels_fill((0,0,0))
    pixels_show(config.brightness_mod)
    
    time.sleep_ms(delay)
    pixels_fill(bg_color)
    pixels_show(config.brightness_mod)
    
    
    while True:
        pixels_fill(bg_color)
        profile_color = get_profile_color(config_name)
        
        if config.ledOptions_profile_color_use_all_LEDs:
            bg_color = profile_color
        else:
            pixels_set(init.mode_selector, profile_color)
            
        if config.brightness_mod > 0:
            pixels_show(config.brightness_mod)
        if config.brightness_mod < epsilon:
            pixels_show(0.01)
            
        if config.ledOptions_increase_brightness:
            config.ledOptions_increase_brightness[0].run(0)
            
        if config.ledOptions_decrease_brightness:
            config.ledOptions_decrease_brightness[0].run(0)
            
        if config.ledOptions_confirm and config.ledOptions_confirm[0] not in config.ledOptions_led_buttons:
            config.ledOptions_confirm[0].run(0)
            
        if config.ledOptions_left_button:
            config.ledOptions_left_button[0].run(0)
            
        if config.ledOptions_right_button:
            config.ledOptions_right_button[0].run(0)
            
        if config.brightness_steps != 'smooth':
            if config.ledOptions_increase_brightness and config.ledOptions_increase_brightness[0].was_pressed:
                increase_brightness(config.brightness_steps)
                #print("brightness:", config.brightness_mod)
            if config.ledOptions_decrease_brightness and config.ledOptions_decrease_brightness[0].was_pressed:
                decrease_brightness(config.brightness_steps)
                #print("brightness:", config.brightness_mod)
        else:
            if config.ledOptions_increase_brightness and config.ledOptions_increase_brightness[0].is_pressed:
                increase_brightness(0.01)
                #print("brightness:", config.brightness_mod)
            if config.ledOptions_decrease_brightness and config.ledOptions_decrease_brightness[0].is_pressed:
                decrease_brightness(0.01)
                #print("brightness:", config.brightness_mod)

            
                
        if config.ledOptions_right_button and config.ledOptions_right_button[0].was_pressed:
            init.mode_selector -= 1
            if init.mode_selector <= 0:
                init.mode_selector = 0
                config_name = "config.py"
            else:
                config_name = "config" + str(init.mode_selector) + ".py"
                
            try:
                f = open(config_name, "r")
                f.close()
            except OSError:
                init.mode_selector -= 1
                
        if config.ledOptions_left_button and config.ledOptions_left_button[0].was_pressed:
            init.mode_selector += 1
            config_name = "config" + str(init.mode_selector) + ".py"
            
            try:
                f = open(config_name, "r")
                f.close()
                
            except OSError:
                init.mode_selector -= 1
                config_name = "config" + str(init.mode_selector) + ".py"
                if init.mode_selector == 0:
                    config_name = "config.py"
        

        for button in config.ledOptions_led_buttons:
            button.run(0)
        
        #checks if all options button have been pressed at the same time
        all_pressed = True
        for button in config.ledOptions_led_buttons:
            if not button.was_pressed:
                all_pressed = False
                break
 
        
        if config.ledOptions_confirm[0].was_pressed or all_pressed: #confirm button
            if init.mode_selector == 0:
                config_name = 'config.py'
                pixels_fill((0,0,0))
                init.timer_counter = 0
                return
            else:
                path = os.rename(config_name, 'configtmp.py')
                path = os.rename('config.py', config_name)
                path = os.rename('configtmp.py', 'config.py')
                machine.reset()
            

                

#return interpolated (r,g,b) tuble between color1 and color2 depending on t (time)
#c1 and c2 = (r,g,b)
#t takes values between tstart and tend
def lerp_rgb(color1, color2, t):
    tstart = 0
    tend = 100
    red = color1[0] + (color2[0] - color1[0]) * ((t-tstart) / (tend - tstart))
    green = color1[1] + (color2[1] - color1[1]) * ((t-tstart) / (tend - tstart))
    blue = color1[2] + (color2[2] - color1[2]) * ((t-tstart) / (tend - tstart))

    return (int(red), int(green), int(blue))

def reset_background():
    init.bg_initialized = False
    init.single_tuple = False
    init.ranges = []
    init.colors = []
    init.brightness_values = []
    init.background_color_HSV = (0,0,0)
    init.background = 0
    
    
    
def lerp(tstart,tend,t, ystart, yend):
    #ystart = 0
    #yend = 255
    y = ystart + (yend - ystart) * ((t-tstart)/(tend-tstart))
    return y
    
    
    

