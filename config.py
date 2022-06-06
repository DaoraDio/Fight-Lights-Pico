print("config")
#Fight Lights Pico
#Version 1.2.4

from machine import Pin
import button
import functions

# color specifications in (R,G,B)
blank = (0,0,0) #blank = not turned on
red = (255,0,0)
orange = (255,127,0)
light_orange = (255,200,0)
yellow = (255,255,0)
lime = (160, 255, 0)
green = (0,255,0)
turqoise = (64, 224, 208)
blue = (0,0,255)
light_blue = (0,193,255)
violet = (170,0,255)
pink = (255,0,170)
cyan = (0,255,255)
white = (255,255,255)
random = 'random' #do not remove
rainbow = 'rainbow' #do not remove

#color array
#if you add a new color make sure you add it to the array as well
colors = [blue,yellow,cyan,red,green,orange,light_blue,lime,turqoise,light_orange,violet,pink,white]


led_count = 8 #number of LEDs in the Chain
PIN_NUM = 0 #pin connected to LED-Chain

leniency = 1 #controls the leniency at which simultanious button presses get the same color, higher = more lenient
             #set to 0 to disable

profile_color = blue #the profile color

brightness_mod = 1 #brightness, 0 = darkest, 1.0 = brightest
brightness_steps = 0.1 #steps at which the brightness changes per press

idle_after = 30#time when LEDs go from default to idle mode (in seconds)
idle_mode = 2 #controls which idlemode is displayed (currently 1 and 2 available), 0 to disable idlemode

##set the background color and brightness##
#--set to blank or (0,0,0) if you want it turned off, example: background = blank
#--set to any color if you want all LEDs to have the same background color with 100% brightness, example: background = red
#--give it a list if you want to specify the brightness and the LEDs, example: background = (0.3, green, 1,2,3,4,5)
#---first parameter is the brighness, values between 0.0 and 1.0 (0.0 = 0%, 1.0 = 100%), has to be a floating point number
#---second parameter is the color, the rest are the LED numbers which are set to that color and brightness
#--give it a list of lists if you want different LEDs to have different background colors and different brightnesses
#---example: background = ((0.02,red,1),(0.02,green,2), (0.02,light_blue,3), (0.02,yellow,4), (0.0,white,5,6,7,8))
#write rainbow instead of a color for a rainbow effect. Can look choppy if brightness is set too low
background = ((0.02,red,3),(0.02,green,4), (0.02,light_blue,5), (0.02,yellow,6), (0.02,white,1,2,7,8))

clear_background_on_press = False #controls if the background gets temporarely turned off while a button is being pressed

fade_speed = 6 #fade speed, higher = faster

input_reset_time = 50 #input leniency for fgc input, the higher the number the bigger the leniency to input the command

save_stats = False #toggle stat logging on or off. Stats are saved every 30seconds

#((list of leds), color, fade)
#positions of the buttons and the corresponding LEDs in the LED-chain and colors the leds take on press,
#choose random if you want that button to display random colors on press
#set to -1 to deactivate the button
#set to 0 if led position is not defined
#control if the button has fade or not
up = button.up.set_config((0,), cyan, False)
down = button.down.set_config((0,), cyan, False)
right = button.right.set_config((0,), cyan, False)
left = button.left.set_config((0,), cyan, False)
select = button.select.set_config((1,2,3,4,5,6,7,8), violet, False)#
ps = button.ps.set_config((-1,), red, False)
start = button.start.set_config((1,2,3,4,5,6,7,8), red, False)

square = button.square.set_config((5,), random, True)
triangle = button.triangle.set_config((6,), random, True)
r1 = button.r1.set_config((8,), random, True)
l1 = button.l1.set_config((7,), random, True)
circle = button.circle.set_config((3,), random, True)
x = button.x.set_config((4,), random, True)
l2 = button.l2.set_config((2,), random, True)
r2 = button.r2.set_config((1,), random, True)

led_option = button.led_option.set_config((0,), random, False)

#motion input examples
#functions.add_fgc_input(["d", "d+f","2+f"], 3)
#functions.add_fgc_input(["d+f"], 2)






