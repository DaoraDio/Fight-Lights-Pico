if __name__ == '__main__':
    with open('main.py', 'r') as f:
        code = f.read()
    exec(code)

print("\033[32minit\033[0m")
import machine
code = "" #hold the code for main.py when launching from config

leniency_counter = 0 #increases every iteration of the main loop, resets when value reaches config.leniency
string_leniency = 0 #unused currently
main_cnt = 0 # increases every iteration of the main loop
i = 0 #increases every time the leniency_counter hits the value defined in config.py leniency
temp_brightness = 0

timer_lock = False
timer_target = 0
timer_start = 1

#variable that keeps track of the position in the array button_list in button.py of the latest button which has been pressed
start_pos = 0

#global counter that increases at the rate of frequency
timer_counter = 0

#value to which the timer counter gets reset after a button press,
#ideally it should be 0, but if the frequency is too high and the setback value is too high as well (aka 0 or >-5)...
#...the timer interrupt overrides the value too fast for other functions to register properly
setback_value = -10

#counter for idle mode, gets set to setback_value on button press
idle_counter = 0

#is set at program start by the function idle_after()
idle_ticks = 0

tmp_brightness = 1

random_color_id = 0

#frequency in hz at which the timer interrups happen
frequency = 60

no_buttons_pressed = False
press_cnt = 0

random_color = 0

random = 'random'
rainbow = 'rainbow'
smooth = 'smooth'
notSet = 'notSet'

#initializations for fgc inputs
current_input = ""
fgc_strings = []
copy_strings = []
animation_num = []
fgc_strings_length = 0


#length of list button.button_list
button_list_length = 0

#do not change (except you know what you are doing)
timer1 = machine.Timer() #timer for timer the interrupts
timer2 = machine.Timer() #debounce timer for brightness
timer3 = machine.Timer()
timer4 = machine.Timer() #timer for player LED update
timer5 = machine.Timer() 

mode_selector = 0 #should not be reset on mode select

##initializations for background color and brightness
bg_initialized = False
single_tuple = False
ranges = []
colors = []
brightness_values = []
background_color = (0,0,0)
background = 0


file_name = "stats.txt"
seconds_counter = 0 #this counts up every seconds to save to the file file_name
header_text = "##################This file stores the number of presses for each button#########\n##################and the uptime in seconds######################################\n" #header text for the file file_name
file_content = "" #stores the files content in memory 


#profile_names = ["All RED no button actions", "white BG No Fade", "proafsdada"]
profile_names = []
####player LED status
p1_active = False
p2_active = False
p3_active = False
p4_active = False

#quick load variables
config_names = []
current_config_index = 0

#onoff button and dynamic profile counter
on_off_cnt = 0
prof_next_cnt = 0
prof_prev_cnt = 0

#8 Way-Joystick random color
saved_RGB = (0,0,0)
last_color_id = 0

run_savestats = False

oled_active = False
oled_splash_drawn = False