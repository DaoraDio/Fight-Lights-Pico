print("animation")
import init
import functions
import config
import time
import statemachine
import math

#breathing light idle mode
#all credits for the breathing light goes to Joshua Hrisko, Maker Portal LLC (c) 2021
def idle_mode1(): #breathin LED
    if config.idle_after == 0:
        functions.pixels_fill((0,0,0))
        functions.pixels_show(config.brightness_mod)
    
    functions.shuffle_array(config.colors)
    
    speed = 2
    breath_amps = [ii for ii in range(0,255,speed)]
    breath_amps.extend([ii for ii in range(255,-1,-speed)])
    for color in config.colors: # emulate breathing LED
        if init.idle_counter < init.idle_ticks:
                return
        for ii in breath_amps:
            if init.idle_counter < init.idle_ticks:
                    return
            for jj in range(len(statemachine.ar)):
                if init.idle_counter < init.idle_ticks:
                    return
                functions.pixels_set(jj, color) # show all colors
            functions.pixels_show((ii/255) * config.brightness_mod)
            time.sleep(0.02)            
        

#https://core-electronics.com.au/tutorials/how-to-use-ws2812b-rgb-leds-with-raspberry-pi-pico.html
def idle_mode2(): #Color Palette
    functions.pixels_fill((0,0,0))
    functions.pixels_show(config.brightness_mod)
    steps = 1
    wait_time = 3
    
    while True:
        if init.idle_counter <= init.idle_ticks:
            return
        for j in range(0,255,steps):
            time.sleep_ms(wait_time)
            if init.idle_counter <= init.idle_ticks:
                return
            for i in range(config.led_count):
                if init.idle_counter <= init.idle_ticks:
                    return
                rc_index = (i * 256 // config.led_count) + j
                functions.pixels_set(i, functions.wheel(rc_index & 255))
            functions.pixels_show(config.brightness_mod)
            
def color_change():
    for i in range(360):
        #time.sleep_ms(2)
        functions.pixels_fillHSV((i,100,100))
        functions.pixels_show(config.brightness_mod)
        if i == 359:
            hsv_col = [359,100,100]
            for j in range(0,100):
                functions.pixels_fillHSV((359,100,100-j))
                functions.pixels_show(config.brightness_mod)
                
def pulsing_light(wait_ms=100):
    position = 0
    for i in range(config.led_count * 2):
        position = position+1
        for j in range(config.led_count):
            functions.pixels_set(j,(round(((math.sin(j+position) * 127 + 128)/255)*255),round(((math.sin(j+position) * 127 + 128) /255)*100), round(((math.sin(j+position) * 127 + 128) /255)*100)))
        functions.pixels_show(config.brightness_mod)
        time.sleep(wait_ms/1000.0)
        
