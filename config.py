from machine import Pin
# color specifications
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
brightness_mod = 1 #brightness 0.2 = darkest, 1.0 = brightest
sleep_after = 30 #time when leds go from default to sleep mode (in seconds)
brightness_steps = 0.2 #steps at which the brightness changes per press
background_color = white #set the background color, set to blank if you want it turned off
mode = 2 #controls which sleepmode is displayed (currently 1 and 2 available)

#positions of the buttons and the corresponding LED in the LED-chain
#and color of the buttons, choose 'random' if you want that button to display random colors on press
up = (14, red)
down = (13, blue)
right = (12, orange)
left = (11, lime)
select = (10, violet)
ps = (9, white)
start = (8, green)

square = (4, 'random')
triangle = (5, 'random')
r1 = (7, 'random')
l1 = (6, 'random')
circle = (2, 'random')
x = (3, 'random')
l2 = (1, 'random')
r2 = (0, yellow)


