if __name__ == "__main__":
    import main
    main.run()

print("\033[32mplayerLED\033[0m")

from array import array
from machine import Pin, Timer

import config
import init
from statemachine import create_state_machine, pack_rgb, scale_pixel, write_pixels


player_inputs = (Pin(21, Pin.IN, Pin.PULL_DOWN), Pin(20, Pin.IN, Pin.PULL_DOWN),
                 Pin(19, Pin.IN, Pin.PULL_DOWN), Pin(18, Pin.IN, Pin.PULL_DOWN))
player_colors = tuple(pack_rgb(color) for color in
                      (config.P1_color, config.P2_color, config.P3_color, config.P4_color))
brightness = int(256 * max(0, min(1, config.playerLED_brightness)))
pixels = array("I", [0] * len(player_inputs))
sm = create_state_machine(1, config.playerLED_PIN_NUM)


def set_player_LED(timer):
    first_states = 0
    transitions = 0
    for index, pin in enumerate(player_inputs):
        first_states |= pin.value() << index
    for _ in range(99):
        for index, pin in enumerate(player_inputs):
            transitions |= (pin.value() ^ ((first_states >> index) & 1)) << index

    init.p1_active = bool(transitions & 1)
    init.p2_active = bool(transitions & 2)
    init.p3_active = bool(transitions & 4)
    init.p4_active = bool(transitions & 8)
    for index, color in enumerate(player_colors):
        pixels[index] = scale_pixel(color, brightness) if transitions & (1 << index) else 0
    write_pixels(sm, pixels)


def start():
    set_player_LED(None)
    init.timer4.init(freq=1, mode=Timer.PERIODIC, callback=set_player_LED)

