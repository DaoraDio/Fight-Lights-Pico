if __name__ == '__main__':
    import init
    with open('main.py', 'r') as f:
        init.code = f.read()
    exec(init.code)

print("\033[32mconfig\033[0m")
#Fight Lights Pico V2.5.2

from machine import Pin
from init import random, rainbow, smooth, notSet
import button
import functions
import init

blank = (0,0,0)
RED = (255,0,0)
ORANGE = (255,127,0)
LIGHT_ORANGE = (255,200,0)
YELLOW = (255,255,0)
LIME = (160,255,0)
GREEN = (0,255,0)
TURQOISE = (64,224,208)
BLUE = (0,0,255)
LIGHT_BLUE = (0,193,255)
VIOLET = (170,0,255)
PINK = (255,0,170)
CYAN = (0,255,255)
WHITE = (255,255,255)

colors = [RED,ORANGE,LIGHT_ORANGE,YELLOW,LIME,GREEN,TURQOISE,BLUE,LIGHT_BLUE,VIOLET,PINK,CYAN,WHITE]

idle_mode1_colors = colors
idle_mode1_speed = 0.05
profile_name = "Profile 1"
led_count = 8
PIN_NUM = 0
leniency = 1
brightness_mod = 1
brightness_steps = 0.1
idle_mode = 1
idle_after = 30
save_stats = False
input_reset_time = 50
profile_color = (0,0,255)
clear_background_on_press = False
background = ((0.05,BLUE,1),(0.05,BLUE,2),(0.05,BLUE,3),(0.05,BLUE,4),(0.05,BLUE,5),(0.05,BLUE,6),(0.05,BLUE,7),(0.05,BLUE,8))
UP_MyButton = button.MyButton(1, 'UP', functions.clear_led)
DOWN_MyButton = button.MyButton(2, 'DOWN', functions.clear_led)
RIGHT_MyButton = button.MyButton(3, 'RIGHT', functions.clear_led)
LEFT_MyButton = button.MyButton(4, 'LEFT', functions.clear_led)
SELECT_MyButton = button.MyButton(5, 'SELECT', functions.clear_led)
PS_MyButton = button.MyButton(6, 'PS', functions.clear_led)
START_MyButton = button.MyButton(7, 'START', functions.clear_led)
SQUARE_1P_MyButton = button.MyButton(8, 'SQUARE_1P', functions.clear_led)
TRIANGLE_2P_MyButton = button.MyButton(9, 'TRIANGLE_2P', functions.clear_led)
R1_3P_MyButton = button.MyButton(10, 'R1_3P', functions.clear_led)
L1_4P_MyButton = button.MyButton(11, 'L1_4P', functions.clear_led)
CIRCLE_2K_MyButton = button.MyButton(12, 'CIRCLE_2K', functions.clear_led)
X_1K_MyButton = button.MyButton(13, 'X_1K', functions.clear_led)
L2_4K_MyButton = button.MyButton(14, 'L2_4K', functions.clear_led)
R2_3K_MyButton = button.MyButton(15, 'R2_3K', functions.clear_led)

button_list = [UP_MyButton,DOWN_MyButton,RIGHT_MyButton,LEFT_MyButton,SELECT_MyButton,PS_MyButton,START_MyButton,SQUARE_1P_MyButton,TRIANGLE_2P_MyButton,R1_3P_MyButton,L1_4P_MyButton,CIRCLE_2K_MyButton,X_1K_MyButton,L2_4K_MyButton,R2_3K_MyButton]
init.button_list_length = len(button_list)


UP_MyButton.set_config((0,), random, False, 1, 30, 7)
DOWN_MyButton.set_config((0,), random, False, 1, 30, 7)
RIGHT_MyButton.set_config((0,), random, False, 1, 30, 7)
LEFT_MyButton.set_config((0,), random, False, 1, 30, 7)
SELECT_MyButton.set_config((1,2,3,4,5,6,7,8,), RED, False, 1, 30, 7)
PS_MyButton.set_config((1,2,3,4,5,6,7,8,), LIGHT_BLUE, False, 1, 30, 7)
START_MyButton.set_config((1,2,3,4,5,6,7,8,), BLUE, False, 1, 30, 7)
SQUARE_1P_MyButton.set_config((5,), random, True, 1, 30, 7)
TRIANGLE_2P_MyButton.set_config((6,), random, True, 1, 30, 7)
R1_3P_MyButton.set_config((7,), random, True, 1, 30, 7)
L1_4P_MyButton.set_config((8,), random, True, 1, 30, 7)
CIRCLE_2K_MyButton.set_config((3,), random, True, 1, 30, 7)
X_1K_MyButton.set_config((4,), random, True, 1, 30, 7)
L2_4K_MyButton.set_config((1,), random, True, 1, 30, 7)
R2_3K_MyButton.set_config((2,), random, True, 1, 30, 7)

ledOptions_color = (255,0,0)
ledOptions_profile_color_use_all_LEDs = True
ledOptions_led_buttons = [START_MyButton,SELECT_MyButton]
ledOptions_start_time = 3
ledOptions_increase_brightness = [UP_MyButton]
ledOptions_decrease_brightness = [DOWN_MyButton]
ledOptions_left_button = [LEFT_MyButton]
ledOptions_right_button = [RIGHT_MyButton]
ledOptions_confirm = [X_1K_MyButton]
OnOff_button = []
rainbow_speed = 100
activate_player_led = False
playerLED_brightness = 1
playerLED_PIN_NUM = 16
P1_color = YELLOW
P2_color = YELLOW
P3_color = YELLOW
P4_color = YELLOW
next_config = []
prev_config = []
onboard_led_on = True
smooth_brightness_speed = 0.03
eight_way_up = [(-1,),blank,notSet]
eight_way_down = [(-1,),blank,notSet]
eight_way_left = [(-1,),blank,notSet]
eight_way_right = [(-1,),blank,notSet]
eight_way_upleft = [(-1,),blank]
eight_way_upright = [(-1,),blank]
eight_way_leftdown = [(-1,),blank]
eight_way_rightdown = [(-1,),blank]
skip_leds_in_idle = []
idlemode_leds = functions.remove_idle_skips()
############do not delete this line#######################