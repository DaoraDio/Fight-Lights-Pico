import array, time
from machine import Pin, Timer
import rp2
import random
import sys
import statemachine
import config
import functions
import button

#--------------------------main program-------------------------------------------------------
#lights up the onborad led to have an indication of wether the board is running or not
onboard_led = Pin(25, Pin.OUT)
onboard_led.value(True)

#variable for background color in HSV with decreased V
background_color_HSV = functions.RGBtoHSV(config.background_color)
background_color_HSV = (background_color_HSV[0],background_color_HSV[1],background_color_HSV[2]*config.background_brightness)
#main loop
i = 0
while True:
    no_buttons_pressed = functions.no_buttons_pressed()

    #chooses a "random" number from the color array 'colors' in config.py
    i = i + 1
    random_color_id = i % len(config.colors)
    
    #goes into sleep mode after seconds defined in the variable 'sleep_after' has been exceeded
    if functions.timer_counter > functions.sleep_after():
        if config.mode == 1:
            functions.sleep_mode1()
        if config.mode == 2:
            functions.sleep_mode2()
    
    
    
    if config.clear_background_on_press == False:
        functions.pixels_fillHSV(background_color_HSV)
    else:
        if no_buttons_pressed == True:
            functions.pixels_fillHSV(background_color_HSV)
        else:
            functions.pixels_fill((0,0,0))
    
    #calls the run function for each button
    button.up.run(random_color_id)
    button.down.run(random_color_id)
    button.right.run(random_color_id)
    button.left.run(random_color_id)
    button.select.run(random_color_id)
    button.ps.run(random_color_id)
    button.start.run(random_color_id)

    button.r2.run(random_color_id)
    button.l2.run(random_color_id)
    button.x.run(random_color_id)
    button.circle.run(random_color_id)
    button.l1.run(random_color_id)
    button.square.run(random_color_id)
    button.triangle.run(random_color_id)
    button.r1.run(random_color_id)
    
    button.brightness.run(random_color_id)
    

    #displays the led colors
    functions.pixels_show(config.brightness_mod)



