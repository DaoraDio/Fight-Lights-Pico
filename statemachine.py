if __name__ == '__main__':
    import init
    with open('main.py', 'r') as f:
        init.code = f.read()
    exec(init.code)

print("\033[32mstatemachine\033[0m")
import rp2
import sys
try:
    import config
except ImportError:
    print('\033[91m' + 'No config file found.\nMake sure your config file is named config.py and is in the same directory as the main.py' + '\033[0m')
    import sys
    sys.exit()
import array
from machine import Pin



PIN_NUM = config.PIN_NUM
led_count = config.led_count

@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW, out_shiftdir=rp2.PIO.SHIFT_LEFT,
             autopull=True, pull_thresh=24) # PIO configuration

# define WS2812 parameters
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


# Create the StateMachine with the ws2812 program, outputting on pre-defined pin
# at the 8MHz frequency (changed to 5)
sm = rp2.StateMachine(0, ws2812, freq=5_000_000, sideset_base=Pin(PIN_NUM))


# Activate the state machine
sm.active(1)

# Range of LEDs stored in an array
ar = array.array("I", [0 for _ in range(led_count)])
