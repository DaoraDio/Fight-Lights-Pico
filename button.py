if __name__ == "__main__":
    import main
    main.run()

print("\033[32mbutton\033[0m")

from machine import Pin

import functions
import init


class MyButton:
    def __init__(self, pin_num, name, handler):
        self.name = name
        self.pin_num = pin_num
        self.pin = Pin(pin_num, Pin.IN, Pin.PULL_UP)
        self.pin.irq(trigger=Pin.IRQ_FALLING, handler=handler)

        self.num_presses = 0
        self.is_pressed = False
        self.was_pressed = False
        self.released = False
        self.highest_prio = False
        self.time = 0
        self.colorRGB = (0, 0, 0)
        self.savedRGB = (0, 0, 0)
        self.last_color = (0, 0, 0)
        self.bg_colors = ()
        self.set_config((-1,), (0, 0, 0), False, 0, 0)

    def set_config(self, led_locations, color, fade, fadein_speed, fadeout_speed):
        self.config = (led_locations, color, fade)
        self.led_list = led_locations
        self.fade = fade
        self.fadein_speed = fadein_speed
        self.fadeout_speed = fadeout_speed
        self.enabled = bool(led_locations) and led_locations[0] >= 0
        # Configurator positions are one-based. Zero enables input without LEDs.
        self.led_indices = tuple(pos - 1 for pos in led_locations if pos > 0) if self.enabled else ()

    def poll(self, random_color_id):
        pressed = self.enabled and not self.pin.value()
        self.was_pressed = pressed and not self.is_pressed
        self.released = self.is_pressed and not pressed
        self.is_pressed = pressed

        if self.was_pressed:
            config = functions.config
            for button in config.button_list:
                button.highest_prio = False
            self.highest_prio = True
            self.num_presses += 1
            color = self.config[1]
            if color == init.random:
                color = config.colors[random_color_id]
            self.colorRGB = color
            self.savedRGB = color

        if self.released:
            self.last_color = self.savedRGB
        if pressed:
            init.idle_counter = init.setback_value

    def render(self):
        if not self.led_indices or init.timer_lock:
            return

        if not self.fade:
            if self.is_pressed:
                functions.pixels_set_range(self.led_indices, self.savedRGB)
            return

        if self.was_pressed or (self.is_pressed and not self.bg_colors):
            self.bg_colors = tuple(functions.get_pixelcolor(pos) for pos in self.led_indices)
        if self.is_pressed:
            self.time = functions.fade_val_inc(self.time, self.fadein_speed)
        elif self.time > 0:
            self.time = functions.fade_val_dec(self.time, self.fadeout_speed)
        else:
            return

        for pos, background in zip(self.led_indices, self.bg_colors):
            color = functions.lerp_rgb(background, self.savedRGB, self.time)
            functions.pixels_set(pos, color)

    def run(self, random_color_id):
        self.poll(random_color_id)
        self.render()

