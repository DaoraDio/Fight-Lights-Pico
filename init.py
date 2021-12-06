print("init")
import machine
#import button
import config



leniency_counter = 0 #increases every iteration of the main loop
string_counter = 0 #unused currently
i = 0 #increases every time the leniency_counter hits the value defines in config.py leniency

#variable that keeps track of the position in the array button_list in button.py of the latest button which has been pressed
start_pos = 0

#global counter that increases at the rate of frequency
timer_counter = 0

#value to which the timer counter gets reset after a button press,
#ideally it should be 0, but if the frequency is too high and the setback value is too high as well (aka 0 or >-5)...
#...the timer interrupt overrides the value too fast for other functions to register properly
setback_value = -10

#counter for sleep mode, gets set to setback_value on button press
sleep_counter = 0

#frequency in hz at which the timer interrups happen
frequency = 60

#do not change (except you know what you are doing)
timer1 = machine.Timer() #timer for timer the interrupts
timer2 = machine.Timer() #debounce timer for brightness
timer3 = machine.Timer() #debounce timer for clear_led


##initializations for background color
bg_initialized = False
ranges = []
colors = []
background_color_HSV = (0,0,0)
