print("main")
import time
from machine import Pin
import statemachine
import button
import config
import functions
import init
import random


#--------------------------main program-------------------------------------------------------
#lights up the onborad led to have an indication of wether the board is running or not
onboard_led = Pin(25, Pin.OUT)
onboard_led.value(True)

#main loop
while True:
    #checks if no buttons are pressed
    no_buttons_pressed = functions.no_buttons_pressed()
    
    init.leniency_counter += 1
    init.string_counter += 1
    
    
    if init.leniency_counter == config.leniency:    
        init.i = init.i + 1
        init.leniency_counter = 0
        
    #chooses a "random" color from the color array 'colors' in config.py depending on the value of i
    random_color_id = init.i % len(config.colors)
      
    
    #goes into sleep mode after seconds defined in the variable 'sleep_after' has been exceeded
    if init.sleep_counter > functions.sleep_after():
        if config.mode == 0:
                pass
        if config.mode == 1:
            functions.sleep_mode1()
        if config.mode == 2:
            functions.sleep_mode2()
    
    
    #sets the background colors
    if config.clear_background_on_press == False:
        functions.set_background()
    else:
        if no_buttons_pressed == True:
            functions.set_background()
        else:
            functions.pixels_fill((0,0,0))
            

    
    #get button pos with the highest priority and save the pos in start_pos
    for i in range(len(button.button_list)):
        if button.button_list[i].highest_prio == True:
            init.start_pos = i+1
            if init.start_pos == len(button.button_list):
                init.start_post = 0
            break
    
    
    #calls run function for every button
    if config.leniency >= 1:
        for i in range(init.start_pos, len(button.button_list)+init.start_pos):
            i = i % len(button.button_list)
            button.button_list[i].run(random_color_id)
    else:
        for i in range(init.start_pos, len(button.button_list)+init.start_pos):
            i = i % len(button.button_list)
            button.button_list[i].run((time.ticks_cpu()) % len(config.colors))


    #displays the led colors
    functions.pixels_show(config.brightness_mod)


