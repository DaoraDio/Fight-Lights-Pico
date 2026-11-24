if __name__ == "__main__":
    import main
    main.run()

print("\033[32mstatemachine\033[0m")

from array import array
from machine import Pin
import time

import rp2

import config


@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW, out_shiftdir=rp2.PIO.SHIFT_LEFT,
             autopull=True, pull_thresh=24)
def ws2812():
    T1 = 2
    T2 = 5
    T3 = 3
    wrap_target()
    label("bitloop")
    out(x, 1).side(0)[T3 - 1]
    jmp(not_x, "do_zero").side(1)[T1 - 1]
    jmp("bitloop").side(1)[T2 - 1]
    label("do_zero")
    nop().side(0)[T2 - 1]
    wrap()


def create_state_machine(index, pin):
    machine = rp2.StateMachine(index, ws2812, freq=8_000_000, sideset_base=Pin(pin))
    machine.active(1)
    return machine


def pack_rgb(color):
    red, green, blue = color
    return (green << 16) | (red << 8) | blue


def scale_pixel(pixel, scale):
    red = (((pixel >> 8) & 255) * scale) >> 8
    green = (((pixel >> 16) & 255) * scale) >> 8
    blue = ((pixel & 255) * scale) >> 8
    return (green << 16) | (red << 8) | blue


def write_pixels(machine, pixels):
    if not pixels:
        return
    machine.put(pixels, 8)
    # put() can leave four FIFO words and the current word in flight.
    # Allow 150 us for those pixels and 300 us of low time to latch the frame.
    time.sleep_us(450)


sm = create_state_machine(0, config.PIN_NUM)
ar = array("I", [0] * config.led_count)
visible_ar = array("I", [0] * config.led_count)

