print("main")
import time
from machine import Pin
import statemachine
import button
import config
import functions
import init
import random
import animation

#--------------------------main program-------------------------------------------------------
#lights up the onborad led to have an indication of wether the board is running or not
onboard_led = Pin(25, Pin.OUT)
onboard_led.value(True)

init.background = config.background
init.idle_ticks = functions.idle_after()

temp_brightness = 0

if config.save_stats == True:
    try: #check if file exists
        f = open(init.file_name, "r")
        print(init.file_name, 'found')
        functions.print_stats()
    except OSError: 
        #if not create file and write data to it
        print(init.file_name,  'not found, has been created')
        f = open(init.file_name, 'w')
        f.write(init.header_text)
        f.write("uptime: 0\n")
        for but in button.button_list:
            f.write(but.name + ": 0\n")
        f.close()


#main loop
while True:
    
    #print(init.current_input)
    init.main_cnt += 1    
    init.leniency_counter += 1
    
    if init.leniency_counter == config.leniency:    
        init.i = init.i + 1
        init.leniency_counter = 0
    
    #access led options when led_option button is pressed
    if button.led_option.was_pressed:
        functions.mode_select()
    
    #access led options when start+select is pressed for 3 seconds
    if button.start.is_pressed and button.select.is_pressed:
        if not init.timer_lock:
            init.timer_target = init.timer_counter + functions.get_seconds(3)
            init.timer_lock = True

        if init.timer_counter >= init.timer_target:
            functions.mode_select()
    else:
        init.timer_lock = False
    
    
    #goes into idle mode after seconds defined in the variable 'idle_after' has been exceeded
    if init.idle_counter > init.idle_ticks:
        if config.idle_mode == 0:
                pass
        if config.idle_mode == 1:
            animation.idle_mode1()
        if config.idle_mode == 2:
            animation.idle_mode2()
    
    
    #checks if no buttons are pressed
    init.no_buttons_pressed = functions.no_buttons_pressed()
    
    #chooses a "random" color from the color array 'colors'
    random_color_id = init.i % len(config.colors)
     
    #sets the background colors
    if config.clear_background_on_press == False:
        functions.set_background(init.background)
    else:
        if init.no_buttons_pressed == True:
            functions.set_background(init.background)
        else:
            functions.pixels_fill((0,0,0))
            

    
    #get button pos with the highest priority and save the pos in start_pos
    index = 0
    for but in button.button_list:
        index += 1
        if but.highest_prio == True:
            init.start_pos = index+1
            if init.start_pos == init.button_list_length:
                init.start_pos = 0
            break
    
    #calls run function for every button starting from start_pos
    if config.leniency >= 1:
        for i in range(init.start_pos, len(button.button_list)+init.start_pos):
            i = i % len(button.button_list)
            button.button_list[i].run(random_color_id)
    else:
        for i in range(init.start_pos, len(button.button_list)+init.start_pos):
            i = i % len(button.button_list)
            button.button_list[i].run((time.ticks_cpu()) % len(config.colors))

    #create a list of all buttons currently pressed
    currently_pressed = []
    for butt in button.button_list:
        if butt.is_pressed:
            currently_pressed.append(butt.name)
            
    #make a string of buttons currently pressed by calling function 'list_to_string'
    if not currently_pressed:
        init.current_input = 'n'
    else:
        init.current_input = functions.list_to_string(currently_pressed)
        
    functions.check_fgc_string()
    

    #give a nice ramp up at the beginning of the program
    if temp_brightness < config.brightness_mod:
        functions.pixels_show(temp_brightness)
        temp_brightness += 0.04
    else:
        #displays the led colors
        functions.pixels_show(config.brightness_mod)
        