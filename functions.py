import statemachine
import config
import array, time
import random
import io
from machine import Timer
############################################
# Functions for RGB Coloring
############################################
#

frequency = 60 #frequency in hz at which the timer interrups happen
timer_counter_setback = -5 #value to which the timer counter gets reset after a button press,
                            #ideally it should be 0, but if the frequency is too high and the setback value is too high as well (aka 0 or >-5) the interrupt
                            #timer interrupt overrides the value too fast for other functions to register properly

#do not change (except you know what you are doing)
timer_counter = 0
tim = Timer()
timer = Timer()
timer2 = Timer()



#timer interrupt function
#increases timer counter for every timer interrupt
def tick(timer):
    global timer_counter
    #print(timer_counter)
    timer_counter = timer_counter + 1
    
    
    
#frequenzy in hz 0.016hz = 60sec, one timer interrupt every 60seconds
#freq=1 = 1hz = 1 interrupt every second
#fre=62.5 = 1 interrupt every 0.016 seconds (1 Frame in a 60FPS Fighting Game)
tim.init(freq=frequency, mode=Timer.PERIODIC, callback=tick)

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
        if timer_counter < config.sleep_after:
                return
        for ii in breath_amps:
            if timer_counter < config.sleep_after:
                    return
            for jj in range(len(statemachine.ar)):
                if timer_counter < config.sleep_after:
                    return
                pixels_set(jj, color) # show all colors
            pixels_show((ii/255) * config.brightness_mod)
            time.sleep(0.02)            
        

#https://core-electronics.com.au/tutorials/how-to-use-ws2812b-rgb-leds-with-raspberry-pi-pico.html
def sleep_mode2(): #Color Palette
    if config.sleep_after == 0:
        pixels_fill((0,0,0))
        pixels_show(config.brightness_mod)
        
    
    speed = 0
    while True:
        if timer_counter <= sleep_after():
            return
        for j in range(255):
            if timer_counter <= sleep_after():
                return
            for i in range(config.led_count):
                if timer_counter <= sleep_after():
                    return
                rc_index = (i * 256 // config.led_count) + j
                pixels_set(i, wheel(rc_index & 255))
            pixels_show(config.brightness_mod)
            time.sleep(speed)
            

def pixels_fill(color):
    for i in range(len(statemachine.ar)):
        pixels_set(i, color)
        
#interrupt routine to set all leds to blank(off) on button release
#also sets the timer_counter to 0 which wakes the leds up from breathing
def clear_led(pin):
    global timer_counter, background
    pixels_fill((0,0,0))
    timer_counter = timer_counter_setback
    
    
    
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

#interrupt routine to debounce the brightness button
#all credits to Kaspars Dambis @ https://kaspars.net/blog/micropython-button-debounce
def debounce_brightness(pin):
    # Start or replace a timer for 200ms, and trigger change_brightness.
    timer.init(mode=Timer.ONE_SHOT, period=200, callback=change_brightness)
    
#interrupt routine to debounce buttons, calls the clear_led method
def debounce_clear_led(pin):
    #print(get_id(pin))
    timer2.init(mode=Timer.ONE_SHOT, period=50, callback=clear_led)
    

#converts the value of the sleep_after variable in config.py to ticks of the timer interrupt
#example: if sleep_after = 1 in config.py, then it would take 20 ticks for 1 second to pass, at a frequency of 20hz
def sleep_after():
    if config.sleep_after == 0:
        return 0
    else:
        global frequency
        ticks = 1/(1/frequency)
        return ticks * config.sleep_after
    
#reutnr the id of a pin
def get_id(*args, **kwargs):
    output = io.StringIO()
    print(*args, file=output, **kwargs)
    s = output.getvalue()
    output.close()
    myid=s[s.find('(')+1:s.find(',')]
    return myid


def fade_in(pin_num, color):
    speed = 50
    breath_amps = [ii for ii in range(0,255,speed)]
    for i in range(10):
        pixels_set(pin_num, color)
        pixels_show((i/255) * config.brightness_mod)
        
def color_chase(color, wait):
    for i in range(config.led_count):
        pixels_set(i, color)
        time.sleep(wait)
        pixels_show(config.brightness_mod)
    time.sleep(0.2)    

def fade_led(pin_num, color):
    brightness = config.brightness_mod
    
    while brightness > 0:
        time.sleep(0.01)
        brightness -= (config.brightness_mod / 10)
        pixels_set(pin_num, color)
        pixels_show(brightness)

    pixels_set(pin_num, config.blank)
    pixels_show(brightness)
    return
    

    
    
