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

#give every color on bootup a color
#otherwise if the pico starts with a button already pressed, it will crash because no color has been assigned yet
color0 = config.blank;
color1 = config.blank;
color2 = config.blank;
color3 = config.blank;
color4 = config.blank;
color5 = config.blank;
color6 = config.blank;
color7 = config.blank;

color8 = config.blank;
color9 = config.blank;
color10 = config.blank;
color11 = config.blank;
color12 = config.blank;
color13 = config.blank;
color14 = config.blank;




#main loop
i = 0
while True:
    #chooses a random number from the color array 'colors'
    i = i + 1
    random_color_id = i % len(config.colors)
    
    #goes into sleep mode after seconds defined in the variable 'sleep_after' has been exceeded
    if functions.timer_counter > functions.sleep_after():
        if config.mode == 1:
            functions.sleep_mode1()
        if config.mode == 2:
            functions.sleep_mode2()
    
    
    #on r2 button press
    if not button.r2.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.r2[1] == 'random':
            functions.pixels_set(config.r2[0], color0)
        else:
            functions.pixels_set(config.r2[0], config.r2[1])
        brightness = 1 * config.brightness_mod 
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color0 = config.colors[random_color_id]
        
    #on l2 button press
    if not button.l2.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.l2[1] == 'random':
            functions.pixels_set(config.l2[0], color1)
        else:
            functions.pixels_set(config.l2[0], config.l2[1])
        brightness = 1 * config.brightness_mod 
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color1 = config.colors[random_color_id]
        
    #on circle button press
    if not button.circle.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.circle[1] == 'random':
            functions.pixels_set(config.circle[0], color2)
        else:
            functions.pixels_set(config.circle[0], config.circle[1])
        brightness = 1 * config.brightness_mod 
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color2 = config.colors[random_color_id]
        
    #on x button press
    if not button.x.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.x[1] == 'random':
            functions.pixels_set(config.x[0], color3)
        else:
            functions.pixels_set(config.x[0], config.x[1]) 
        brightness = 1 * config.brightness_mod 
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color3 = config.colors[random_color_id]
        
    #on square button press
    if not button.square.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.square[1] == 'random':
            functions.pixels_set(config.square[0], color4)
        else:
            functions.pixels_set(config.square[0], config.square[1])
        brightness = 1 * config.brightness_mod 
        functions.pixels_show(brightness * config.brightness_mod)
        square_pressed = True
    else:
        color4 = config.colors[random_color_id]
          
        
    #on triangle button press
    if not button.triangle.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.triangle[1] == 'random':
            functions.pixels_set(config.triangle[0], color5)
        else:
            functions.pixels_set(config.triangle[0], config.triangle[1])
        brightness = 1 * config.brightness_mod 
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color5 = config.colors[random_color_id]
        
        
    #on l1 button press
    if not button.l1.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.l1[1] == 'random':
            functions.pixels_set(config.l1[0], color6)
        else:
            functions.pixels_set(config.l1[0], config.l1[1])
        brightness = 1 * config.brightness_mod 
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color6 = config.colors[random_color_id]   
        
    #on r1 button press
    if not button.r1.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.r1[1] == 'random':
            functions.pixels_set(config.r1[0], color7)
        else:
            functions.pixels_set(config.r1[0], config.r1[1])
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color7 = config.colors[random_color_id]
    
    #----
    #on up button press
    if not button.up.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.up[1] == 'random':
            functions.pixels_set(config.up[0], color8)
        else:
            functions.pixels_set(config.up[0], config.up[1]) 
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color8 = config.colors[random_color_id]
        
    #on down button press
    if not button.down.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.down[1] == 'random':
            functions.pixels_set(config.down[0], color9)
        else:
            functions.pixels_set(config.down[0], config.down[1]) 
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color9 = config.colors[random_color_id]
        
    #on right button press
    if not button.right.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.right[1] == 'random':
            functions.pixels_set(config.right[0], color10)
        else:
            functions.pixels_set(config.right[0], config.right[1]) 
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color10 = config.colors[random_color_id]
        
    #on left button press
    if not button.left.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.left[1] == 'random':
            functions.pixels_set(config.left[0], color11)
        else:
            functions.pixels_set(config.left[0], config.left[1]) 
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color11 = config.colors[random_color_id]
        
    
    #on select button press
    if not button.select.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.select[1] == 'random':
            functions.pixels_set(config.select[0], color12)
        else:
            functions.pixels_set(config.select[0], config.select[1]) 
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color12 = config.colors[random_color_id]
    
    #on ps button press
    if not button.ps.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.ps[1] == 'random':
            functions.pixels_set(config.ps[0], color13)
        else:
            functions.pixels_set(config.ps[0], config.ps[1]) 
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color13 = config.colors[random_color_id]
        
    #on start button press
    if not button.start.value():
        functions.timer_counter = functions.timer_counter_setback
        if config.start[1] == 'random':
            functions.pixels_set(config.start[0], color14)
        else:
            functions.pixels_set(config.start[0], config.start[1]) 
        brightness = 1 * config.brightness_mod
        functions.pixels_show(brightness * config.brightness_mod)
    else:
        color14 = config.colors[random_color_id]
        

     
    #background color and brightness when no button is pressed
    if  config.sleep_after != 0 and button.select.value() and button.up.value() and button.down.value() and button.left.value() and button.right.value() and button.ps.value() and button.start.value() and button.square.value() and button.triangle.value() and button.r1.value() and button.l1.value() and button.circle.value() and button.x.value() and button.l2.value() and button.r2.value():
        functions.pixels_fill(config.background_color)
        brightness = 0.2 * config.brightness_mod
        #print("nothing pressed")
    
    if config.sleep_after != 0:
        functions.pixels_show(brightness * config.brightness_mod)

    
    



