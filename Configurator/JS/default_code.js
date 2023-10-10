const codeString = `
#when launching this module by accident it will launch the main.py instead
if __name__ == '__main__':
    import init
    with open('main.py', 'r') as f:
        init.code = f.read()
    exec(init.code)

console.log("config");
#Fight Lights Pico V2.4.0

from machine import Pin
from init import random, rainbow, smooth
import button
import functions
import init

blank = (0,0,0)
red = (255,0,0)
orange = (255,127,0)
light_orange = (255,200,0)
yellow = (255,255,0)
lime = (160,255,0)
green = (0,255,0)
turqoise = (64,224,208)
blue = (0,0,255)
light_blue = (0,193,255)
violet = (170,0,255)
pink = (255,0,170)
cyan = (0,255,255)
white = (255,255,255)

colors = [red,orange,light_orange,yellow,lime,green,turqoise,blue,light_blue,violet,pink,cyan,white]

idle_mode1_colors = [red,green,violet,turqoise,orange]
idle_mode1_speed = 5
profile_name = "white background"
led_count = 24
PIN_NUM = 0
leniency = 1
brightness_mod = 1
brightness_steps = 0.2
idle_mode = 2
idle_after = 30
save_stats = True
input_reset_time = 50
profile_color = (255,255,255)
clear_background_on_press = False
background = ((0.05,white,1),(0.05,white,2),(0.05,white,3),(0.05,white,4),(0.05,white,5),(0.05,white,6),(0.05,white,7),(0.05,white,8),(0.05,white,9),(0.05,white,10),(0.05,white,11),(0.05,white,12),(0.05,white,13),(0.05,white,14),(0.05,white,15),(0.05,white,16),(0.05,white,17),(0.05,white,18),(0.05,white,19),(0.05,white,20),(0.05,white,21),(0.05,white,22),(0.05,white,23),(0.05,white,24))
up_MyButton = button.MyButton(1, 'up', functions.clear_led)
down_MyButton = button.MyButton(2, 'down', functions.clear_led)
right_MyButton = button.MyButton(3, 'right', functions.clear_led)
left_MyButton = button.MyButton(4, 'left', functions.clear_led)
select_MyButton = button.MyButton(5, 'select', functions.clear_led)
ps_MyButton = button.MyButton(6, 'ps', functions.clear_led)
start_MyButton = button.MyButton(7, 'start', functions.clear_led)
square_MyButton = button.MyButton(8, 'square', functions.clear_led)
triangle_MyButton = button.MyButton(9, 'triangle', functions.clear_led)
r1_MyButton = button.MyButton(10, 'r1', functions.clear_led)
l1_MyButton = button.MyButton(11, 'l1', functions.clear_led)
circle_MyButton = button.MyButton(12, 'circle', functions.clear_led)
x_MyButton = button.MyButton(13, 'x', functions.clear_led)
l2_MyButton = button.MyButton(14, 'l2', functions.clear_led)
r2_MyButton = button.MyButton(15, 'r2', functions.clear_led)
on_off_MyButton = button.MyButton(17, 'on_off', functions.clear_led)

button_list = [up_MyButton,down_MyButton,right_MyButton,left_MyButton,select_MyButton,ps_MyButton,start_MyButton,square_MyButton,triangle_MyButton,r1_MyButton,l1_MyButton,circle_MyButton,x_MyButton,l2_MyButton,r2_MyButton,on_off_MyButton]
init.button_list_length = len(button_list)

up_MyButton.set_config((17,18,19,20,21,22,23,24,), random, False, 1, 30, 7)
down_MyButton.set_config((17,18,19,20,21,22,23,24,), random, False, 1, 30, 7)
right_MyButton.set_config((17,18,19,20,21,22,23,24,), random, False, 1, 30, 7)
left_MyButton.set_config((17,18,19,20,21,22,23,24,), random, False, 1, 30, 7)
select_MyButton.set_config((1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,), red, False, 1, 30, 7)
ps_MyButton.set_config((1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,), light_blue, False, 1, 30, 7)
start_MyButton.set_config((1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,), blue, False, 1, 30, 7)
square_MyButton.set_config((9,10,), random, True, 1, 30, 7)
triangle_MyButton.set_config((11,12,), random, True, 1, 30, 7)
r1_MyButton.set_config((15,16,), random, True, 1, 30, 7)
l1_MyButton.set_config((13,14,), random, True, 1, 30, 7)
circle_MyButton.set_config((5,6,), random, True, 1, 30, 7)
x_MyButton.set_config((7,8,), random, True, 1, 30, 7)
l2_MyButton.set_config((3,4,), random, True, 1, 30, 7)
r2_MyButton.set_config((1,2,), random, True, 1, 30, 7)
on_off_MyButton.set_config((0,), random, False, 1, 20, 7)

ledOptions_color = (255,255,255)
ledOptions_profile_color_use_all_LEDs = True
ledOptions_led_buttons = [start_MyButton,select_MyButton]
ledOptions_start_time = 1
ledOptions_increase_brightness = [up_MyButton]
ledOptions_decrease_brightness = [down_MyButton]
ledOptions_left_button = [left_MyButton]
ledOptions_right_button = [right_MyButton]
ledOptions_confirm = [x_MyButton]
OnOff_button = [on_off_MyButton,triangle_MyButton]
rainbow_speed = 1000
activate_player_led = False
playerLED_brightness = 1
playerLED_PIN_NUM = 16
P1_color = yellow
P2_color = yellow
P3_color = yellow
P4_color = yellow
next_config = [on_off_MyButton,square_MyButton]
prev_config = [on_off_MyButton,circle_MyButton]
onboard_led_on = True
smooth_brightness_speed = 0.01
############do not delete this line#######################
`;


function fill_with_default_config()
{
    document.getElementById("new_codebox").value = codeString;
    get_code();
}