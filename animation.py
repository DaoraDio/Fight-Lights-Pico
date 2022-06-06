print("animation")
import init
import functions
import config
import time
import statemachine
import math
import init
import button

#breathing light idle mode
#all credits for the breathing light goes to Joshua Hrisko, Maker Portal LLC (c) 2021
def idle_mode1(): #breathing LED
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
    epsilon = 0.0001
    brightness = config.brightness_mod
    config.brightness_mod = 0
    while True:
        if init.idle_counter <= init.idle_ticks:
            config.brightness_mod = brightness
            return
        for j in range(0,255,steps):
            if brightness-epsilon < config.brightness_mod:
                config.brightness_mod = brightness
            if config.brightness_mod < brightness:
                config.brightness_mod += 0.01
            time.sleep_ms(wait_time)
            if init.idle_counter <= init.idle_ticks:
                config.brightness_mod = brightness
                return
            for i in range(config.led_count):
                if init.idle_counter <= init.idle_ticks:
                    config.brightness_mod = brightness
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


def color_fade_out(led_pos, color_rgb, speed=1):
    color_hsv = functions.RGBtoHSV(color_rgb)
    val = color_hsv[2]
    
    while val > 0:
        new_hsv = [color_hsv[0],color_hsv[1],val]
        for i in range(len(led_pos)):
            functions.pixels_setHSV(led_pos[i], new_hsv)
        functions.pixels_show(config.brightness_mod)
        val -= speed
        if val < 0:
            val = 0
        
        

        
#fades in an led at led_pos, into color of color_rgb
def color_fade_in(led_pos, color_rgb, speed=1):
    color_hsv = functions.RGBtoHSV(color_rgb)
    
    val = 0
    while val < color_hsv[2]:
        val += speed
        if val > 100:
            val = 100
        new_hsv = [color_hsv[0],color_hsv[1],val]
        for i in range(len(led_pos)):
            functions.pixels_setHSV(led_pos[i], new_hsv)
        functions.pixels_show(config.brightness_mod)

def fireball(led_order, color_rgb, speed=16):
    #led_order = (7,8,6,9,5,10,4,11,3,12,2,13,1,14,0,15)

    for i in range(0,len(led_order),2):
        color_fade_in((led_order[i],led_order[i+1]), color_rgb, speed)

    #time.sleep_ms(50)
    for j in range(0,len(led_order),2):
        color_fade_out((led_order[j],led_order[j+1]), color_rgb, speed)
        
    for but in button.button_list:
        but.time = 0
        
def flash_all(color_rgb):
    functions.pixels_fill(color_rgb)
    functions.pixels_show(config.brightness_mod)
    time.sleep_ms(10)
    
    functions.pixels_fill((0,0,0))
    functions.pixels_show(config.brightness_mod)
    time.sleep_ms(10)
    
    functions.pixels_fill(color_rgb)
    functions.pixels_show(config.brightness_mod)
    time.sleep_ms(10)
    
    functions.pixels_fill((0,0,0))
    functions.pixels_show(config.brightness_mod)

#lights up the led at pos with color
def light_led(pos, color):
    for i in pos:
        functions.pixels_set(i,config.colors[init.random_color])
        #functions.pixels_show(config.brightness_mod)
    
        
