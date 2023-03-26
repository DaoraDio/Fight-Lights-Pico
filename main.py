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

if config.activate_player_led:
    import playerLED


#clear the init.code variable to free up the memory if the main has been started from another config
init.code = ""

#lights up the onborad led to have an indication of wether the board is running or not
onboard_led = Pin(25, Pin.OUT)
onboard_led.value(True)

init.background = config.background
init.idle_ticks = functions.idle_after()



if config.save_stats == True:
    try: #check if file exists
        f = open(init.file_name, "r")
        print(init.file_name, 'found')
        init.file_content = f.readlines()
        functions.print_stats()
    except OSError: 
        #if not create file and write data to it
        print(init.file_name,  'not found, has been created')
        f = open(init.file_name, 'w')
        f.write(init.header_text)
        f.write("uptime: 0\n")
        for but in config.button_list:
            f.write(but.name + ": 0\n")
        f.close()


#--------------------------main program-------------------------------------------------------
def main():
    #print(init.current_input)
    #print(init.p1_active)
    #print(init.p2_active)
    #print(init.p3_active)
    #print(init.p4_active)
    #print()
    

    
    init.main_cnt += 1    
    init.leniency_counter += 1
    
    if init.leniency_counter == config.leniency:    
        init.i = init.i + 1
        init.leniency_counter = 0
    
    #access led options when led_option button is pressed
    try:
        if config.led_option.was_pressed:
            functions.mode_select()
    except:
        pass
    
    
    #access led options when buttons in config.led_options are pressed for config.led_options_start_time seconds
    if(config.ledOptions_led_buttons):
        led_options = []
        for button in config.ledOptions_led_buttons:
            led_options.append(button.is_pressed)
        
        if all(led_options):
            V = int(functions.lerp(init.timer_start,init.timer_target,init.timer_counter))
            col = (V,0,0)
            functions.pixels_fill(col)
            functions.pixels_show(config.brightness_mod)

            if not init.timer_lock:
                init.timer_target = init.timer_counter + functions.get_seconds(config.ledOptions_start_time)
                init.timer_start = init.timer_counter
                init.timer_lock = True
           
            if init.timer_counter >= init.timer_target:
                functions.mode_select()
        else:
            init.timer_lock = False
    
    
    #goes into idle mode after seconds defined in the variable 'idle_after' has been exceeded
    if init.idle_counter > init.idle_ticks and config.idle_mode != 0:
        if config.idle_mode == 1:
            animation.idle_mode1()
        if config.idle_mode == 2:
            animation.idle_mode2()
        if config.idle_mode == 3:
            animation.idle_mode3()
        if config.idle_mode == 4:
            animation.idle_mode4()
    
    
    #checks if no buttons are pressed
    init.no_buttons_pressed = functions.no_buttons_pressed()
    #print(init.no_buttons_pressed)
    
    #chooses a "random" color from the color array 'colors'
    random_color_id = init.i % len(config.colors)
     
    #sets the background colors
    if not init.timer_lock:
        if config.clear_background_on_press == False:
            functions.set_background(init.background)
        else:
            if init.no_buttons_pressed == True:
                functions.set_background(init.background)
            else:
                functions.pixels_fill((0,0,0))
            

    
    #get button pos with the highest priority and save the pos in start_pos
    index = 0
    for but in config.button_list:
        index += 1
        if but.highest_prio == True:
            init.start_pos = index+1
            if init.start_pos == init.button_list_length:
                init.start_pos = 0
            break
    
    #calls run function for every button starting from start_pos
    if config.leniency >= 1:
        for i in range(init.start_pos, len(config.button_list)+init.start_pos):
            i = i % len(config.button_list)
            config.button_list[i].run(random_color_id)
    else:
        for i in range(init.start_pos, len(config.button_list)+init.start_pos):
            i = i % len(config.button_list)
            button.button_list[i].run((time.ticks_cpu()) % len(config.colors))

    #create a list of all buttons currently pressed
    currently_pressed = []
    for butt in config.button_list:
        if butt.is_pressed:
            currently_pressed.append(butt.name)
            
    #make a string of buttons currently pressed by calling function 'list_to_string'
    if not currently_pressed:
        init.current_input = 'n'
    else:
        init.current_input = functions.list_to_string(currently_pressed)
        
    functions.check_fgc_string()
    

    #give a nice ramp up at the beginning of the program
    if init.temp_brightness < config.brightness_mod:
        functions.pixels_show(init.temp_brightness)
        init.temp_brightness += 0.04
    else:
        #displays the led colors
        functions.pixels_show(config.brightness_mod)
        


#main loop
while True:
    main()  

        
