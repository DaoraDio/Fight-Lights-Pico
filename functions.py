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
micropython.alloc_emergency_exception_buf(100)

#dummy interrupt, does nothing. Set a button handler to this if you want to do nothing on interrupt
def dummy(pin):
    pass

#timer interrupt function
#increases timer counter for every timer interrupt
def tick(timer):
    init.idle_counter += 1
    init.timer_counter += 1
    init.string_leniency += 1

    
#sets the idle_counter to the setback value which wakes the leds up from idle mode
def clear_led(pin):
    init.idle_counter = init.setback_value

    
#frequenzy in hz 0.016hz = 60sec, one timer interrupt every 60seconds
#freq=1 = 1hz = 1 interrupt every second
#fre=62.5 = 1 interrupt every 0.016 seconds (1 Frame in a 60FPS Fighting Game)
init.timer1.init(freq=init.frequency, mode=machine.Timer.PERIODIC, callback=tick)

#interrupt routine to debounce the brightness button
#all credits to Kaspars Dambis @ https://kaspars.net/blog/micropython-button-debounce
def debounce_brightness(pin):
    # Start or replace a timer for 100ms, and trigger change_brightness.
    init.timer2.init(mode=machine.Timer.ONE_SHOT, period=100, callback=mode_select)#change_brightness)
    
#interrupt routine to debounce buttons, calls the clear_led method
#def debounce_clear_led(pin):
#    init.timer3.init(mode=machine.Timer.ONE_SHOT, period=50, callback=clear_led)

#interrupt routine to change the overall brightness
#goes from values between 0 and 1, wraps around after 1
def increase_brightness():
    if config.brightness_mod >= 1:
        config.brightness_mod = 1
    else:
        config.brightness_mod += config.brightness_steps
def decrease_brightness():
    epsilon = 0.0001
    if config.brightness_mod <= epsilon:
        config.brightness_mod = 0
    else:
        config.brightness_mod -= config.brightness_steps
        
def pixels_show(brightness_input):
    dimmer_ar = array.array("I", [0 for _ in range(config.led_count)])
    for ii,cc in enumerate(statemachine.ar):
        r = int(((cc >> 8) & 0xFF) * brightness_input) # 8-bit red dimmed to brightness
        g = int(((cc >> 16) & 0xFF) * brightness_input) # 8-bit green dimmed to brightness
        b = int((cc & 0xFF) * brightness_input) # 8-bit blue dimmed to brightness
        dimmer_ar[ii] = (g<<16) + (r<<8) + b # 24-bit color dimmed to brightness
    statemachine.sm.put(dimmer_ar, 8) # update the state machine with new colors
    time.sleep_ms(10)

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

#returns the color in rgb of a LED
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

#breathing light idle mode
#all credits for the breathing light goes to Joshua Hrisko, Maker Portal LLC (c) 2021
def idle_mode1(): #breathin LED
    if config.idle_after == 0:
        pixels_fill((0,0,0))
        pixels_show(config.brightness_mod)
    
    shuffle_array(config.colors)
    
    speed = 5
    breath_amps = [ii for ii in range(0,255,speed)]
    breath_amps.extend([ii for ii in range(255,-1,-speed)])
    for color in config.colors: # emulate breathing LED
        if init.idle_counter < idle_after():
                return
        for ii in breath_amps:
            if init.idle_counter < idle_after():
                    return
            for jj in range(len(statemachine.ar)):
                if init.idle_counter < idle_after():
                    return
                pixels_set(jj, color) # show all colors
            pixels_show((ii/255) * config.brightness_mod)
            time.sleep(0.02)            
        

#https://core-electronics.com.au/tutorials/how-to-use-ws2812b-rgb-leds-with-raspberry-pi-pico.html
def idle_mode2(): #Color Palette
    pixels_fill((0,0,0))
    pixels_show(config.brightness_mod)
        
    while True:
        if init.idle_counter <= idle_after():
            return
        for j in range(255):
            if init.idle_counter <= idle_after():
                return
            for i in range(config.led_count):
                if init.idle_counter <= idle_after():
                    return
                rc_index = (i * 256 // config.led_count) + j
                pixels_set(i, wheel(rc_index & 255))
            pixels_show(config.brightness_mod)
            

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
def fade_val(color_val):
    if color_val >= 0:
        color_val -= config.fade_speed
        if (color_val-config.fade_speed) < 0:
            color_val = 0
    return color_val

#helper function
#return true if no button is pressed at the moment
#returns false when a button is currently pressed
def no_buttons_pressed():
    for j in range(len(button.button_list)):
        if button.button_list[j].is_pressed == True:
            return False
    
    return True
    

def set_background():
    speed = 30 #speed for colorwheel, higher = slower
    
    #if background it only a color
    if isinstance(config.background[0], int):
        if init.bg_initialized == False:
            init.background_color_HSV = RGBtoHSV(config.background)
            init.bg_initialized = True
        
        pixels_fillHSV(init.background_color_HSV)
    elif config.background == 'rainbow':#if background is only 'rainbow'
        hsv_col = ((time.ticks_ms()/speed)%359,100,100)
        pixels_fillHSV(hsv_col)
    elif not isinstance(config.background[0], tuple) and init.bg_initialized == False:#if background is a single tuple
        init.ranges = list(config.background)
        init.brightness_values.append(init.ranges.pop(0))
        if init.brightness_values[0] > 1:
            init.brightness_values[0] = 1
        init.colors.append(init.ranges.pop(0))
        if not isinstance(init.colors[0], str):
            init.background_color_HSV = list(RGBtoHSV(init.colors[0]))
            init.background_color_HSV[2] *= init.brightness_values[0]
        init.bg_initialized = True
        init.single_tuple = True
        
        
    elif init.bg_initialized == False:#if background is tuple of tuple
        #initialize the background colors
        different_tuple = len(config.background)
        
        #appends all the different tuple into ranges
        for tupel in config.background:
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
                init.colors.append(hsv_col)
            
            init.ranges[i].pop(0)
        init.bg_initialized = True
        
    #display the background colors
    else:
        if init.single_tuple == True:
            for ranges in init.ranges:
                if init.colors[0] == 'rainbow':
                    hsv_col = ((time.ticks_ms()/speed)%359,100,100*init.brightness_values[0])
                    pixels_setHSV(ranges-1,hsv_col)
                else:
                    pixels_setHSV(ranges-1, init.background_color_HSV)
        else:
            for i in range(len(init.ranges)):
                for j in range(len(init.ranges[i])):
                    if init.colors[i] == 'rainbow':
                        hsv_col = ((time.ticks_ms()/speed)%359,100,100*init.brightness_values[i])
                        pixels_setHSV(init.ranges[i][j]-1,hsv_col)
                    else:
                        pixels_setHSV(init.ranges[i][j]-1,init.colors[i])
    
def mode_select(pin):
    button.up.was_pressed = False
    button.down.was_pressed = False
    button.left.was_pressed = False
    button.right.was_pressed = False
    button.led_options.was_pressed = False
    init.mode_selector = 0
    config_name = 'config.py'
    while True:
        if config_name == 'config0.py':
            config_name = 'config.py'
        pixels_fill((255,255,255))
        profile_color = get_profile_color(config_name)
        pixels_set(init.mode_selector, profile_color)
        if config.brightness_mod > 0.0:
            pixels_show(config.brightness_mod)
        else:
            pixels_show(0.004)
        button.led_options.run(0) #change to mode
        button.up.run(0) 
        button.down.run(0) 
        button.left.run(0) 
        button.right.run(0)

        if button.up.was_pressed:
            increase_brightness()

        if button.down.was_pressed:
            decrease_brightness()

        if button.right.was_pressed:
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
                

        if button.left.was_pressed:
            init.mode_selector += 1
            config_name = "config" + str(init.mode_selector) + ".py"
            
            try:
                f = open(config_name, "r")
                f.close()
                
            except OSError:
                init.mode_selector -= 1
                config_name = "config" + str(init.mode_selector) + ".py"
                
        if button.led_options.released:
            if init.mode_selector == 0:
                config_name = 'config.py'
                return
            else:
                path = os.rename(config_name, 'configtmp.py')
                path = os.rename('config.py', config_name)
                path = os.rename('configtmp.py', 'config.py')
                machine.reset()

#reset every neccessary value in init
def reset_init():
    init.leniency_counter = 0
    init.string_counter = 0
    init.main_cnt = 0
    init.i = 0
    init.timer_counter = 0
    init.idle_counter = 0
    init.bg_initialized = False
    init.single_tuple = False
    init.ranges = []
    init.colors = []
    init.brightness_values = []
    init.background_color_HSV = (0,0,0)
    init.mode_selector = 0

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
    
    return my_string
    
    
    

    
    
    
    
