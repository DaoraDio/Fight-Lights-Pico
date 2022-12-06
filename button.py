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
    num_presses = 0 #increases for every press
    colorRGB = (0,0,0) #the rgb color the button, this changes for every iteration
    savedRGB = (0,0,0) #this changes only when pressed
    led_list = [] #holds the same list as config[0]
    counter = 0
    was_pressed = False #tracks if the button was pressed
    highest_prio = False 
    is_pressed = False #flag to track if the button is currently pressed
    was_released = False #flag to track if the button has been pressed
    pin_num = 0 #the pin number of the button
    fade = False #flag for fade
    released = False #flag to track if the button has been released
    time = 0 #time to track the interpolation
    bg_colors = ()#current background color before fade
    config = ((-1,), (0,0,0), False, 1) #(list of leds, color, Fade on or off, brightness): gets its values from config.py
    brightness = 1 #brightness when the button is pressed, values between 0 - 1
        
    def __init__(self,pin_num,name, handler): #constructor, takes a pin_number and a function for a handler that gets called for the interrupt
        self.name = name
        self.pin_num = pin_num #sets the variable for pin_num
        self.pin = Pin(pin_num, Pin.IN, Pin.PULL_UP) #Defines the pin: (Pin_number, wether Input or Output, Pull up or pull Down)
        self.pin.irq(trigger= Pin.IRQ_FALLING, handler = handler)#enables interrupt for the button with handler
        
        
    #gets called from the config.py to set the config variable and the led_list variable
    def set_config(self, led_locations, color, fade, brightness):
        self.fade = fade
        self.config = ((led_locations),color, self.fade)
        self.led_list = led_locations
        self.brightness = brightness
        
        
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
                    for i in range(len(config.button_list)):
                        config.button_list[i].highest_prio = False
                    self.highest_prio = True
                    self.was_pressed = True
                    self.num_presses += 1
                    
                    self.bg_colors = ()
                    for i in range(len(self.led_list)):
                        #self.bg_colors.append(functions.get_pixelcolor(self.led_list[i]-1))
                        #self.bg_colors = self.bg_colors + (functions.HSVtoRGB(init.colors[self.led_list[i]-1]),)
                        self.bg_colors = self.bg_colors + (functions.get_pixelcolor(self.led_list[i]-1),)
                    
                    
                ######################when the button is pressed###########################
                if self.config[0][0] > 0:
                    if self.fade == True:
                        if self.time <= 100:
                            self.time = functions.fade_val_inc(self.time) #increases the time value through the function fade_val
                            if self.config[0][0] > 0: #when led position is not defined but button active
                                for i in range(len(self.led_list)): #loops through led_list
                                #sets all the colors with interpolated value between the background color and the color of press at the time of self.time
                                    if not init.timer_lock:
                                        lerp_color = functions.lerp_rgb(self.bg_colors[i-1], self.savedRGB,self.time)
                                        functions.pixels_set(self.led_list[i]-1, lerp_color)
                    else:
                        for i in range(len(self.led_list)): #loops through all numbers defined in led_list
                            if not init.timer_lock:
                                functions.pixels_set(self.led_list[i]-1, self.colorRGB)#sets all pixel at the pos i to the color of colorRGB
                self.savedRGB = self.colorRGB
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
                    if self.time > 0:
                        self.time = functions.fade_val_dec(self.time) #decreases the time value through the function fade_val
                        if self.config[0][0] > 0: #when led position is not defined but button active
                            for i in range(len(self.led_list)): #loops through led_list
                                #sets all the colors with interpolated value between the background color and the color of press at the time of self.time
                                if not init.timer_lock:
                                    lerp_color = functions.lerp_rgb(self.bg_colors[i-1], self.savedRGB,self.time)
                                    functions.pixels_set(self.led_list[i]-1, lerp_color)
                                    
                                
                                
                    
                self.is_pressed = False
                if self.config[1] == 'random': #gives the button a random color if second variable of config of a button is 'random'
                    tmp = functions.RGBtoHSV(config.colors[random_color_id])
                    tmp = (tmp[0],tmp[1],tmp[2]*self.brightness)
                    tmp = functions.HSVtoRGB(tmp)
                    self.colorRGB = tmp
                else:#gives the button a defined color if second variable of config is a color
                    tmp = functions.RGBtoHSV(self.config[1])
                    tmp = (tmp[0],tmp[1],tmp[2]*self.brightness)
                    tmp = functions.HSVtoRGB(tmp)
                    self.colorRGB = tmp
                

        






