if __name__ == "__main__":
    import main
    main.run()

print("\033[32minit\033[0m")

import _thread

from machine import Timer


# Kept for older Configurator files that launch main.py with exec().
code = ""

random = "random"
rainbow = "rainbow"
smooth = "smooth"
notSet = "notSet"

frequency = 60
setback_value = -10
timer1 = Timer()
timer2 = Timer()
timer3 = Timer()
timer4 = Timer()
timer_counter = 0
idle_counter = 0
idle_ticks = 0
string_leniency = 0

leniency_counter = 0
i = 0
random_color_id = 0
start_pos = 0
button_list_length = 0  # Populated by existing config.py files.
direction_bits = 0
saved_RGB = (0, 0, 0)
last_color_id = 0

timer_lock = False
timer_start = 0
timer_target = 0
options_requested = False
options_require_release = False
mode_selector = 0
profiles = []
profile_names = []

temp_brightness = 0
tmp_brightness = 1
on_off_cnt = False
cached_background = None
background_entries = []

current_input = ""
previous_input = ""
fgc_strings = []
copy_strings = []
animation_num = []
fgc_strings_length = 0

file_name = "stats.txt"
header_text = (
    "##################This file stores the number of presses for each button#########\n"
    "##################and the uptime in seconds######################################\n"
)
stats_updated_ms = 0
run_savestats = False

p1_active = False
p2_active = False
p3_active = False
p4_active = False

oled_active = False
oled_splash_drawn = False
oled_stick_drawn = False
oled_stop_animation = True
combo_triggered = False
lock = _thread.allocate_lock()
pixel_coordinates = []

