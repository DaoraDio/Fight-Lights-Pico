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



#timer interrupt function
#increases timer counter for every timer interrupt
def tick(timer):
    state = machine.disable_irq()
    init.sleep_counter += 1
    init.timer_counter += 1
    machine.enable_irq(state)
    
#sets the sleep_counter to the setback value which wakes the leds up from 'sleep mode'
def clear_led(pin):
    init.sleep_counter = init.setback_value
    
#frequenzy in hz 0.016hz = 60sec, one timer interrupt every 60seconds
#freq=1 = 1hz = 1 interrupt every second
#fre=62.5 = 1 interrupt every 0.016 seconds (1 Frame in a 60FPS Fighting Game)
init.timer1.init(freq=init.frequency, mode=machine.Timer.PERIODIC, callback=tick)

#interrupt routine to debounce the brightness button
#all credits to Kaspars Dambis @ https://kaspars.net/blog/micropython-button-debounce
def debounce_brightness(pin):
    # Start or replace a timer for 200ms, and trigger change_brightness.
    init.timer2.init(mode=machine.Timer.ONE_SHOT, period=200, callback=change_brightness)
    
#interrupt routine to debounce buttons, calls the clear_led method
def debounce_clear_led(pin):
    #print(get_id(pin))
    init.timer3.init(mode=machine.Timer.ONE_SHOT, period=50, callback=clear_led)

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

#sets a color at pos i, takes HSV color as value
def pixels_setHSV(i,color):
    #print(color)
    rgbcolor = HSVtoRGB(color)
    pixels_set(i, rgbcolor)
    
        
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

#shuffles an array
def shuffle_array(arr):
    last_index = len(arr)-1
    while last_index > 0:
        rand_index = random.randint(0,last_index)
        temp = arr[last_index]
        arr[last_index] = arr[rand_index]
        arr[rand_index] = temp
        last_index -= 1

#breathing light sleep mode
#all credits for the breathing light goes to Joshua Hrisko, Maker Portal LLC (c) 2021
def sleep_mode1(): #breathin LED
    if config.sleep_after == 0:
        pixels_fill((0,0,0))
        pixels_show(config.brightness_mod)
    
    
    shuffle_array(config.colors)
    
    speed = 5 
    breath_amps = [ii for ii in range(0,255,speed)]
    breath_amps.extend([ii for ii in range(255,-1,-speed)])
    for color in config.colors: # emulate breathing LED
        if init.sleep_counter < config.sleep_after:
                return
        for ii in breath_amps:
            if init.sleep_counter < config.sleep_after:
                    return
            for jj in range(len(statemachine.ar)):
                if init.sleep_counter < config.sleep_after:
                    return
                pixels_set(jj, color) # show all colors
            pixels_show((ii/255) * config.brightness_mod)
            time.sleep(0.02)            
        

#https://core-electronics.com.au/tutorials/how-to-use-ws2812b-rgb-leds-with-raspberry-pi-pico.html
def sleep_mode2(): #Color Palette
    pixels_fill((0,0,0))
    pixels_show(config.brightness_mod)
        
    while True:
        if init.sleep_counter <= sleep_after():
            return
        for j in range(255):
            if init.sleep_counter <= sleep_after():
                return
            for i in range(config.led_count):
                if init.sleep_counter <= sleep_after():
                    return
                rc_index = (i * 256 // config.led_count) + j
                pixels_set(i, wheel(rc_index & 255))
            pixels_show(config.brightness_mod)
            
#sets all leds to color in RGB
def pixels_fill(color):
    for i in range(len(statemachine.ar)):
        pixels_set(i, color)
        
#sets all leds to color in HSV      
def pixels_fillHSV(colorHSV):
    colorRGB = HSVtoRGB(colorHSV)
    pixels_fill(colorRGB)
    

def inverse_ledlist(ledlist):
    leds = []
    for i in range(config.led_count):
        leds.append(i)
        
    for i in range(len(ledlist)):
        leds.remove(ledlist[i])
                
    return leds
    
    
#interrupt routine to change the overall brightness
#goes from values between 0 and 1, wraps around after 1
def change_brightness(pin):
    global brightness_mod
    if config.brightness_mod >= 1:
        config.brightness_mod = 0
        print("brightness_mod =", config.brightness_mod)
    else:
        config.brightness_mod = config.brightness_mod + config.brightness_steps
        print("brightness_mod =", config.brightness_mod)
    

#converts the value of the sleep_after variable in config.py to ticks of the timer interrupt
#example: if sleep_after = 1 in config.py, then it would take 20 ticks for 1 second to pass, at a frequency of 20hz
def sleep_after():
    if config.sleep_after == 0:
        return 0
    else:
        ticks = 1/(1/init.frequency)
        return ticks * config.sleep_after
    
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
    if isinstance(config.background_color[0], int):
        if init.bg_initialized == False:
            init.background_color_HSV = RGBtoHSV(config.background_color)
            init.background_color_HSV = (init.background_color_HSV[0],init.background_color_HSV[1],init.background_color_HSV[2]*config.background_brightness)
            init.bg_initialized = True
        
        pixels_fillHSV(init.background_color_HSV)
    else:
        #initialize the background colors
        if init.bg_initialized == False:
            different_tuple = len(config.background_color)
        
            #appends all the different tuple into ranges
            if different_tuple > 1:
                for i in range(different_tuple):
                    #print("tuple ",config.background_color[i])
                    init.ranges.append(list(config.background_color[i]))
                    
            for i in range(different_tuple):
                hsv_col = list(RGBtoHSV(init.ranges[i][0]))
                hsv_col[2] = hsv_col[2] * config.background_brightness
                
                init.colors.append(hsv_col)
                init.ranges[i].pop(0)
                
            init.bg_initialized = True
        
        #display the background colors
        for i in range(len(init.ranges)):
            for j in range(len(init.ranges[i])):
                pixels_setHSV(init.ranges[i][j]-1,init.colors[i])
    

    
    

    
    
    
    
    
    

    
    
    
    
