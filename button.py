print("button")
from machine import Pin
import config
import functions
import time
import init
import machine

#button class
class MyButton:
    name = ""
    colorRGB = (0,0,0) #the rgb color the button take when pressed
    colorHSV = (0,0,0) #the color on press in HSV
    VAL = 0 #the value of the HSV color
    led_list = [] #holds the same list as config[0]
    counter = 0
    was_pressed = False #tracks if the button was pressed
    highest_prio = False 
    is_pressed = False #flag to track if the button is currently pressed
    was_released = False #flag to track if the button has been pressed
    pin_num = 0 #the pin number of the button
    fade = False #flag for fade
    released = False #flag to track if the button has been released
    config = ((-1,), (0,0,0), False) #(list of leds, color, Fade on or off): gets its values from config.py
        
    def __init__(self,pin_num,name, handler): #constructor, takes a pin_number and a function for a handler that gets called for the interrupt
        self.name = name
        self.pin_num = pin_num #sets the variable for pin_num
        self.pin = Pin(pin_num, Pin.IN, Pin.PULL_UP) #Defines the pin: (Pin_number, wether Input or Output, Pull up or pull Down)
        self.pin.irq(trigger= Pin.IRQ_FALLING, handler = handler)#enables interrupt for the button with handler
        
        
    #gets called from the config.py to set the config variable and the led_list variable
    def set_config(self, led_locations, color, fade):
        self.fade = fade
        self.config = ((led_locations),color, self.fade)
        self.led_list = led_locations
        
        
    #run function, controls all behaviour of a button, on press, when released and when currently not pressed
    #gets permanently called from the main loop
    def run(self, random_color_id):
        self.released = False
        if self.config[0][0] > -1: #do nothing if the button is set to -1 in config.py
            self.was_pressed = False
            if not self.pin.value():
                self.counter = self.counter +1
                ######################when the button was just pressed###########################
                if self.counter == 1:
                    for i in range(len(button_list)):
                        button_list[i].highest_prio = False
                    self.highest_prio = True
                    self.was_pressed = True
                    
                    
                ######################when the button is pressed###########################
                if self.config[0][0] > 0:
                    for i in range(len(self.led_list)): #loops through all numbers defined in led_list
                        functions.pixels_set(self.led_list[i]-1, self.colorRGB)#sets all pixel at the pos i to the color of colorRGB
                self.colorHSV = functions.RGBtoHSV(self.colorRGB)#converts the color from RGB to HSV and stores it in variable colorHSV
                self.VAL = self.colorHSV[2]#gives self.VAL the value(V) of the HSV color
                self.is_pressed = True
                self.was_released = True
                init.idle_counter = init.setback_value #sets back the idle counter, so idle mode doesn't trigger during a press
                
                
            else:
                #############when the button was just released#########################
                if self.was_released == True:
                    self.counter = 0
                    self.released = True
                    self.was_released = False
                   
                
                ################when the button is currently not pressed###############
                if self.fade == True: #when fade for that button is enabled
                    if self.VAL > 0:
                        self.VAL = functions.fade_val(self.VAL) #decrases VAL through the function fade_val
                        if self.config[0][0] > 0: #when led position is not defined but button active
                            for i in range(len(self.led_list)): #loops through led_list
                                functions.pixels_setHSV(self.led_list[i]-1, (self.colorHSV[0],self.colorHSV[1], self.VAL))#sets all the colors with decreases VAL for fade effect
                self.is_pressed = False
                if self.config[1] == 'random': #gives the button a random color if second variable of config of a button is 'random'
                    self.colorRGB = config.colors[random_color_id]
                else:
                    self.colorRGB = self.config[1] #gives the button a defined color if second variable of config is a color
                    
                
#######instances of class MyButton for all buttons##########
up = MyButton(1,'u', functions.clear_led)
down = MyButton(2,'d', functions.clear_led)
right = MyButton(3,'f', functions.clear_led)
left = MyButton(4,'b', functions.clear_led)
select = MyButton(5,'select', functions.clear_led)
ps = MyButton(6,'ps', functions.clear_led)
start = MyButton(7,'start', functions.clear_led)                   
                    
r2 = MyButton(15,'r2', functions.clear_led)
l2 = MyButton(14,'l2', functions.clear_led)
square = MyButton(8,'1', functions.clear_led)
triangle = MyButton(9,'2', functions.clear_led)
r1 = MyButton(10,'r1', functions.clear_led)
l1 = MyButton(11,'l1', functions.clear_led)
circle = MyButton(12,'4', functions.clear_led)
x = MyButton(13,'3', functions.clear_led)

led_option = MyButton(16,'brightness', functions.clear_led)


#array for all the buttons, if you add a new button make sure to add it to the array aswell
button_list = [r2,l2,square,triangle,r1,l1,circle,x,up,down,right,left,select,ps,start,led_option]

#sets the button list length in init.py
init.button_list_length = len(button_list)
        




