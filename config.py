from machine import Pin
import button
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

#color array
#if you add a new color make sure you add it to the array as well
colors = [blue,yellow,cyan,red,green,orange,light_blue,lime,turqoise,light_orange,violet,pink,white]

#general config
led_count = 8 #number of LEDs in the Chain
PIN_NUM = 0 #pin connected to LED-Chain

brightness_mod = 1 #brightness, 0.2 = darkest, 1.0 = brightest
brightness_steps = 0.20 #steps at which the brightness changes per press

sleep_after = 30 #time when leds go from default to sleep mode (in seconds)
mode = 1 #controls which sleepmode is displayed (currently 1 and 2 available)

background_color = blue #set the background color, set to blank or (0,0,0) if you want it turned off
background_brightness = 0.02 #sets the brightness of the background color
clear_background_on_press = False #controls if the background gets temporarely turned off while a button is being pressed

fade_speed = 7 #fade speed, higher = faster





#((list of leds), color, fade)
#positions of the buttons and the corresponding LEDs in the LED-chain and colors the leds take on press,
#choose 'random' if you want that button to display random colors on press
#set to -1 if the button is unused and the led position is not defined
#control if the button has fade or not
up = button.up.set_config((5,6), red, False)#5
down = button.down.set_config((1,2), red, False)#3
right = button.right.set_config((0,7), red, False)#2
left = button.left.set_config((3,4), red, False)#4
select = button.select.set_config((0,1,2,3,4,5,6,7), turqoise, False)
ps = button.ps.set_config((-1,), white, False)
start = button.start.set_config((0,1,2,3,4,5,6,7), white, False)

square = button.square.set_config((4,), 'random', True)
triangle = button.triangle.set_config((5,), 'random', True)
r1 = button.r1.set_config((7,), 'random', True)
l1 = button.l1.set_config((6,), 'random', True)
circle = button.circle.set_config((2,), 'random', True)
x = button.x.set_config((3,), 'random', True)
l2 = button.l2.set_config((1,), 'random', True)
r2 = button.r2.set_config((0,), 'random', True)

brightness = button.brightness.set_config((-1,), 'random', False)




