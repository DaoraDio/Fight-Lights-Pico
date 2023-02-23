print("playerLED")
import rp2
import sys
import config
import array
import time
import init
import machine
from machine import Pin

################Variables##########################################
led_count = 4
PIN_NUM = config.playerLED_PIN_NUM
P1_color = config.P1_color
P2_color = config.P2_color
P3_color = config.P3_color
P4_color = config.P4_color

P1 = Pin(21,Pin.IN,Pin.PULL_DOWN)
P2 = Pin(20,Pin.IN,Pin.PULL_DOWN)
P3 = Pin(19,Pin.IN,Pin.PULL_DOWN)
P4 = Pin(18,Pin.IN,Pin.PULL_DOWN)

P1_LED_pos = 0
P2_LED_pos = 1
P3_LED_pos = 2
P4_LED_pos = 3

###########Player LED Statemachine##########################################
@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW, out_shiftdir=rp2.PIO.SHIFT_LEFT, autopull=True, pull_thresh=24) # PIO configuration
def ws2812():
    T1 = 2
    T2 = 5
    T3 = 3
    wrap_target()
    label("bitloop")
    out(x, 1)               .side(0)    [T3 - 1]
    jmp(not_x, "do_zero")   .side(1)    [T1 - 1]
    jmp("bitloop")          .side(1)    [T2 - 1]
    label("do_zero")
    nop()                   .side(0)    [T2 - 1]
    wrap()

sm = rp2.StateMachine(1, ws2812, freq=5_000_000, sideset_base=Pin(PIN_NUM))
sm.active(1)
ar = array.array("I", [0 for _ in range(led_count)])

#################Player LED functions###############################
def pixels_show(brightness_input):
    dimmer_ar = array.array("I", [0 for _ in range(config.led_count)])
    for ii,cc in enumerate(ar):
        r = int(((cc >> 8) & 0xFF) * brightness_input) # 8-bit red dimmed to brightness
        g = int(((cc >> 16) & 0xFF) * brightness_input) # 8-bit green dimmed to brightness
        b = int((cc & 0xFF) * brightness_input) # 8-bit blue dimmed to brightness
        dimmer_ar[ii] = (g<<16) + (r<<8) + b # 24-bit color dimmed to brightness
    sm.put(dimmer_ar, 8) # update the state machine with new colors
    #time.sleep_ms(10)

def pixels_set(i, color):
    ar[i] = (color[1]<<16) + (color[0]<<8) + color[2] # set 24-bit color
    
def pixels_fill(color):
    for i in range(len(ar)):
        pixels_set(i, color)

#checks if list contains only same elements
def check_same(list):
    i0 = list[0]
    for i in range(len(list)):
        if list[i] != i0:
            return False
    return True

def set_player_LED(pin):
    #time.sleep_ms(500)
    init.p1_active = False
    init.p2_active = False
    init.p3_active = False
    init.p4_active = False
    
    p1_arr = []
    p2_arr = []
    p3_arr = []
    p4_arr = []
    for i in range(100):
        p1_arr.append(P1.value())
        p2_arr.append(P2.value())
        p3_arr.append(P3.value())
        p4_arr.append(P4.value())
        
        
    init.p1_active = not check_same(p1_arr)
    init.p2_active = not check_same(p2_arr)
    init.p3_active = not check_same(p3_arr)
    init.p4_active = not check_same(p4_arr)
    
    #print(p1_arr)
    #print(p2_arr)
    #print(p3_arr)
    #print(p4_arr)
    #print()
    
    #print("P1 connected", init.p1_active)
    #print("P2 connected", init.p2_active)
    #print("P3 connected", init.p3_active)
    #print("P4 connected", init.p4_active)
    #print()
    
    #print("P1: ",P1.value())
    #print("P2: ",P2.value())
    #print("P3: ",P3.value())
    #print("P4: ",P4.value())
    
    if init.p1_active:
        pixels_set(P1_LED_pos,P1_color)
    else:
        pixels_set(P1_LED_pos,(0,0,0))
        
    if init.p2_active:
        pixels_set(P2_LED_pos,P2_color)
    else:
        pixels_set(P2_LED_pos,(0,0,0))
        
    if init.p3_active:
        pixels_set(P3_LED_pos,P3_color)
    else:
        pixels_set(P3_LED_pos,(0,0,0))
        
    if init.p4_active:
        pixels_set(P4_LED_pos,P4_color)
    else:
        pixels_set(P4_LED_pos,(0,0,0))
    
    pixels_show(config.playerLED_brightness)


#Player LED timer interrupt 
init.timer4.init(freq=1, mode=machine.Timer.PERIODIC, callback=set_player_LED)
