print("\033[32mmain\033[0m")
import time
from machine import Pin
import statemachine
import button
import config
import functions
import init
import random
import animation
import os
import sys
import gc
import _thread
if config.activate_player_led:
    import playerLED
if config.activate_oled:
    try:
        import oled
        oled.setup_oled()
        init.oled_active = True
    except IndexError:
        print("\033[31mOled Not Found\033[0m")
        init.oled_active = False
        del oled.i2c

import os
fs_stat = os.statvfs('/')
free_bytes = fs_stat[0] * fs_stat[3]
free_kb = free_bytes // 1024
print("Free space:", free_kb, "KB")

#clear the init.code variable to free up the memory, if main was executed from another file 
del init.code
#machine.freq(125000000) #<--Pico1 Standard clockspeed
#machine.freq(150000000) #<--Pico2 Standard clockspeed
#machine.freq(180000000) #<--medium Overclock
machine.freq(200000000) #<--medium/high Overclock
#machine.freq(240000000) #<--high Overclock
#machine.freq(270000000) #<--very high Overclock

#lights up the onborad led
onboard_led = Pin(25, Pin.OUT)
onboard_led.value(config.onboard_led_on)

init.background = config.background
init.idle_ticks = functions.idle_after()

functions.set_profile_list()

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


file_list = os.listdir()
init.config_names = [s for s in file_list if "config" in s]
init.current_config_index = 0
  
counter = 0
for button in config.button_list:
    button.run(0)
    if button.is_pressed:
        counter += 1
        
if init.oled_active:
    oled.oled_draw_splash()
    if config.overlay:
        oled.oled_set_overlay_coordinates()
    if counter < 3 and functions.oled_animation_exists():
        second_thread = _thread.start_new_thread(oled.play_animation, ())
        print("Second Thread Started")
        #oled.play_animation()
    
#--------------------------main program-------------------------------------------------------
#@functions.measure_execution_time
def main():
    #gc.collect()
   # free_memory = gc.mem_free()
    #print("Available memory:", free_memory, "bytes")
    if init.oled_active:
        if config.oled_layout == 0:
            init.oled_stop_animation = True
            oled.oled_draw_stick()
        if config.oled_layout == 1:
            if init.oled_splash_drawn == False:
                init.oled_stop_animation = True
                oled.oled_draw_splash()
                init.oled_splash_drawn = True
        if config.oled_layout == 2:
            init.oled_stop_animation = True
            oled.oled_clear_screen()
        if config.oled_layout == 3 and init.timer_lock == False:
            init.oled_stop_animation = False

    
    init.main_cnt += 1    
    init.leniency_counter += 1
    
    if init.leniency_counter == config.leniency:    
        init.i = init.i + 1
        init.leniency_counter = 0

    
    #access led options when buttons in config.led_options are pressed for config.led_options_start_time seconds
    if(config.ledOptions_led_buttons):
        led_options = []
        for button in config.ledOptions_led_buttons:
            led_options.append(button.is_pressed)
        
        if all(led_options):
            R = int(functions.lerp(init.timer_start,init.timer_target,init.timer_counter, 0, config.ledOptions_color[0]))
            G = int(functions.lerp(init.timer_start,init.timer_target,init.timer_counter, 0, config.ledOptions_color[1]))
            B = int(functions.lerp(init.timer_start,init.timer_target,init.timer_counter, 0, config.ledOptions_color[2]))
            col = (R,G,B)
            
            functions.pixels_fill(col)
            functions.pixels_show(config.brightness_mod)
            
            
            if not init.timer_lock:
                init.timer_target = init.timer_counter + functions.get_seconds(config.ledOptions_start_time)
                init.timer_start = init.timer_counter
                init.timer_lock = True
            
            if init.oled_active:
                init.oled_stop_animation = True

                oled.oled.fill(0)
                value = round(functions.lerp(init.timer_start,init.timer_target,init.timer_counter, 0, 100))
                oled.oled.text("Entering", 30, 0)
                oled.oled.text("LED Options Mode", 0, 13)
                oled.oled.rect(10, 30, 100, 20, True)
                oled.oled.rect(10, 30, value, 20, True, True)
                oled.oled.text(str(value) + '%', 54, 53)
                with init.lock:
                    oled.oled.show()

            if init.timer_counter >= init.timer_target:
                functions.mode_select(config.brightness_steps)
        else:
            init.timer_lock = False
    
    
    #goes into idle mode after seconds defined in the variable 'idle_after' has been exceeded
    if init.idle_counter > init.idle_ticks and config.idle_mode != 0:
        if init.oled_active:
            if config.oled_idle == 0:
                init.oled_stop_animation = True
                oled.oled_draw_splash()
            elif config.oled_idle == 1:
                init.oled_stop_animation = True
                init.oled_splash_drawn = False
                oled.oled_clear_screen()
            elif config.oled_idle == 2:
                init.oled_stop_animation = True
                oled.oled_draw_stick(True)
                init.oled_splash_drawn = False
            elif config.oled_idle == 3:
                init.oled_stop_animation = False
                init.oled_splash_drawn = False
            
        if config.idle_mode == 1:
            animation.idle_mode1()
        if config.idle_mode == 2:
            animation.idle_mode2()
        if config.idle_mode == 3:
            animation.idle_mode3()
        if config.idle_mode == 4:
            animation.idle_mode4()
        if config.idle_mode == 5:
            animation.idle_mode5()
        if config.idle_mode == 6:
            animation.idle_mode6()

    
    
    #checks if no buttons are pressed
    init.no_buttons_pressed = functions.no_buttons_pressed()
    
    #chooses a "random" color from the color array 'colors'
    init.random_color_id = init.i % len(config.colors)
     
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
            config.button_list[i].run(init.random_color_id)
    else:
        for i in range(init.start_pos, len(config.button_list)+init.start_pos):
            i = i % len(config.button_list)
            config.button_list[i].run((time.ticks_cpu()) % len(config.colors))
        
          

    functions.run_eight_way_joystick()
        

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
    
    if init.fgc_strings_length != 0:
        functions.check_fgc_string()
        
    
    #set a button or a combination of buttons as a complete on/off switch for the LEDs
    if config.OnOff_button:
        onoff_button = []
        for button in config.OnOff_button:
            onoff_button.append(button.is_pressed)
        if all(onoff_button):
            init.on_off_cnt += 1
            if config.brightness_mod > 0 and init.on_off_cnt == 1:
              init.tmp_brightness = config.brightness_mod
              config.brightness_mod = 0
            elif config.brightness_mod == 0 and init.on_off_cnt == 1:
              config.brightness_mod = init.tmp_brightness
        else:
            init.on_off_cnt = 0
            

    #give a nice ramp up at the beginning of the program
    if init.temp_brightness < config.brightness_mod:
        functions.pixels_show(init.temp_brightness)
        init.temp_brightness += 0.04
    else:
        #displays the led colors
        functions.pixels_show(config.brightness_mod)
        
    if init.run_savestats:
        functions.save_stats()
        init.run_savestats = False
    
    #print(config.X_1K_MyButton.pin_num)
    
        
#main loop
while True:
    main()

     

        
