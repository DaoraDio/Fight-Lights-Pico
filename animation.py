if __name__ == '__main__':
    import init
    with open('main.py', 'r') as f:
        init.code = f.read()
    exec(init.code)

print("\033[32manimation\033[0m")
import init
import functions
import config
import time
import statemachine
import math
import init
import button
import random

#breathing light idle mode
def idle_mode1():
    functions.shuffle_array(config.idle_mode1_colors)
    speed = config.idle_mode1_speed
    led_list = config.idlemode_leds
    
    while init.idle_counter > init.idle_ticks:
        for color in config.idle_mode1_colors:
            color_hsv = functions.RGBtoHSV(color)
            color_hsv = (color_hsv[0],color_hsv[1],0)
            
            while color_hsv[2] < 100:
                for led in led_list:
                    if init.idle_counter < init.idle_ticks:
                        return
                    functions.pixels_setHSV(led,color_hsv)
                    color_hsv = (color_hsv[0],color_hsv[1], functions.fade_val_inc(color_hsv[2], speed))
                    functions.pixels_show(config.brightness_mod)
            
            while color_hsv[2] > 0:
                for led in led_list:
                    if init.idle_counter < init.idle_ticks:
                        return
                    functions.pixels_setHSV(led,color_hsv)
                    color_hsv = (color_hsv[0],color_hsv[1], functions.fade_val_dec(color_hsv[2], speed))
                    functions.pixels_show(config.brightness_mod)
            
        
        
    
    

#https://core-electronics.com.au/tutorials/how-to-use-ws2812b-rgb-leds-with-raspberry-pi-pico.html
def idle_mode2(): #Color Palette
    steps = 1
    wait_time = 3
    epsilon = 0.0001
    brightness = config.brightness_mod
    config.brightness_mod = 0
    while True:
        if init.idle_counter <= init.idle_ticks:
            config.brightness_mod = brightness
            return
        for j in range(0,255,steps):
            if brightness-epsilon < config.brightness_mod:
                config.brightness_mod = brightness
            if config.brightness_mod < brightness:
                config.brightness_mod += 0.01
            time.sleep_ms(wait_time)
            if init.idle_counter <= init.idle_ticks:
                config.brightness_mod = brightness
                return
            for i in config.idlemode_leds:
                if init.idle_counter <= init.idle_ticks:
                    config.brightness_mod = brightness
                    return
                rc_index = (i * 256 // config.led_count) + j
                functions.pixels_set(i, functions.wheel(rc_index & 255))
            functions.pixels_show(config.brightness_mod)
            
def idle_mode3(): #lights out
    brightness = config.brightness_mod
    step_speed = brightness / 100
    while brightness > 0:
        brightness -= step_speed
        if brightness < 0:
            brightness = 0
        for led in config.idlemode_leds:
            if init.idle_counter <= init.idle_ticks:
                return
            pxl_color = list(functions.get_pixelcolor(led))
            pxl_color = (int(pxl_color[0] * brightness), int(pxl_color[1] * brightness), int(pxl_color[2] * brightness))
            
            functions.pixels_set(led,pxl_color)
            functions.pixels_show(config.brightness_mod)

    
    while init.idle_counter > init.idle_ticks:
        pass
    
#Rain (by FrawstyBawlz & ChatGPT) **EXPERIMENTAL** 
def idle_mode4():
    num_leds = config.led_count  # Replace this with the number of LEDs in your chain

    # Define the time delay between raindrop movements (in seconds)
    delay = 0.11

    # Define the colors for raindrops and flashes in RGB format
    raindrop_color = (0, 0, 200)  # Blue

    # Define the number of raindrops to add in each iteration
    raindrops_per_iteration = 5

    # Define the maximum and minimum speed of raindrops (adjust as needed)
    max_speed = 3.5
    min_speed = 0.6

    # Create a list to store the current position of each raindrop, a counter for the position fraction, and a direction for each raindrop
    raindrop_positions = []
    raindrop_fraction = []
    raindrop_direction = []

    # Create a table with LED positions
    #led_positions = list(range(config.led_count))
    led_positions = config.idlemode_leds

    # Counter to keep track of the number of iterations for raindrops
    raindrop_iteration_counter = 0

    # Counter to keep track of the number of iterations for red flashes
    red_flash_iteration_counter = 0

    # Number of iterations between red flashes
    next_red_flash = random.randint(5, 15)

    while True:
        if init.idle_counter <= init.idle_ticks:
            return

        for _ in range(init.idle_ticks):  # Run the animation for the duration of the idle mode
            if init.idle_counter <= init.idle_ticks:
                return

            # Add a fixed number of new raindrops in each iteration
            for _ in range(raindrops_per_iteration):
                # Determine the direction of the new raindrop
                direction = 1 if random.random() < 0.5 else -1
                # Add a new raindrop at a random position from the table
                rand_position = random.choice(led_positions)
                raindrop_positions.append(rand_position)
                raindrop_fraction.append(0)
                raindrop_direction.append(direction)

            # Clear all LEDs before showing the new raindrop positions
            for led in config.idlemode_leds:
                functions.pixels_set(led,(0,0,0))

            # Update the position of each raindrop and remove raindrops that reach the end
            for i in range(len(raindrop_positions) - 1, -1, -1):
                if init.idle_counter <= init.idle_ticks:
                    return
                raindrop_fraction[i] += raindrop_direction[i] * random.uniform(min_speed, max_speed)
                if raindrop_fraction[i] >= 1 or raindrop_fraction[i] <= 0:
                    raindrop_positions.pop(i)
                    raindrop_fraction.pop(i)
                    raindrop_direction.pop(i)
                else:
                    # Calculate the faded color based on the raindrop fraction
                    brightness = 255 - int(255 * raindrop_fraction[i])
                    r, g, b = [c for c in raindrop_color]
                    faded_color = (r, g, b, brightness)

                    # Set the LED to the faded raindrop color
                    functions.pixels_set(raindrop_positions[i], faded_color)

            # Show the colors on the LED chain
            functions.pixels_show(config.brightness_mod)

            # Periodic flashes with fading effect
            if red_flash_iteration_counter == next_red_flash:
                next_red_flash = random.randint(2, 10)  # Generate a new random number

                for brightness in range(255, -1, -40):
                    if random.random() < 0.25:
                        # Red flash
                        flash_color = (brightness, 0, 0)
                    elif random.random() < 0.5:
                        # Yellow flash
                        flash_color = (brightness, brightness, 0)
                    elif random.random() < 0.75:
                        # Purple flash
                        flash_color = (brightness, 0, brightness)
                    else:
                        # Blue flash
                        flash_color = (0, 0, brightness)
                
                    #functions.pixels_fill(flash_color)
                    for led in config.idlemode_leds:
                        functions.pixels_set(led, flash_color)
                        functions.pixels_show(config.brightness_mod)
                    time.sleep(0.08)  # Adjust the delay to control the fade-in/fade-out speed

            # Wait for a short time before updating raindrop positions
            time.sleep(delay)

            # Increment the iteration counters
            raindrop_iteration_counter += 1
            red_flash_iteration_counter += 1

            # Reset the iteration counters to avoid overflow
            if raindrop_iteration_counter >= 100:
                raindrop_iteration_counter = 0
            if red_flash_iteration_counter >= 100:
                red_flash_iteration_counter = 0

def idle_mode5():
    fade_speed = 10
    led_count = config.led_count
    backwards = False
    cnt = random.randint(0, 359)
    sleep_time = 0.05
    while init.idle_counter > init.idle_ticks:
        cnt += 60
        cnt = cnt % 359
        hsv_col = (cnt, 100,100)
        hsv_col2 = (360-cnt, 100, 100)
        color = functions.HSVtoRGB(hsv_col)
        for i, k in zip(config.idlemode_leds, range(led_count-1, -1, -1)):
            if init.idle_counter <= init.idle_ticks:
                return
            #time.sleep_ms(400)
            functions.pixels_set(i,color)
            #functions.pixels_set(k,color2)
            functions.pixels_show(config.brightness_mod)
            
            for j in config.idlemode_leds:
                if init.idle_counter <= init.idle_ticks:
                    return
                pxl_color = functions.get_pixelcolor(j)
                hsv_color = functions.RGBtoHSV(pxl_color)
                value = hsv_color[2]-fade_speed
                if value < 10:
                    value = 10
                hsv_color = (hsv_color[0],hsv_color[1], value)
                pxl_color = functions.HSVtoRGB(hsv_color)
                functions.pixels_set(j,pxl_color)
            
            time.sleep(sleep_time)
            if i == 0:
                if not backwards:
                    sleep_time -= 0.001
                else:
                    sleep_time += 0.001
                if sleep_time <= 0:
                    backwards = True
                if sleep_time >= 0.05:
                    backwards = False


def color_change():
    for i in range(360):
        #time.sleep_ms(2)
        functions.pixels_fillHSV((i,100,100))
        functions.pixels_show(config.brightness_mod)
        if i == 359:
            hsv_col = [359,100,100]
            for j in range(0,100):
                functions.pixels_fillHSV((359,100,100-j))
                functions.pixels_show(config.brightness_mod)
                
def pulsing_light(wait_ms=100):
    position = 0
    for i in range(config.led_count * 2):
        position = position+1
        for j in range(config.led_count):
            functions.pixels_set(j,(round(((math.sin(j+position) * 127 + 128)/255)*255),round(((math.sin(j+position) * 127 + 128) /255)*100), round(((math.sin(j+position) * 127 + 128) /255)*100)))
        functions.pixels_show(config.brightness_mod)
        time.sleep(wait_ms/1000.0)


def color_fade_out(led_pos, color_rgb, speed=1):
    color_hsv = functions.RGBtoHSV(color_rgb)
    val = color_hsv[2]
    
    while val > 0:
        new_hsv = [color_hsv[0],color_hsv[1],val]
        for i in range(len(led_pos)):
            functions.pixels_setHSV(led_pos[i], new_hsv)
        functions.pixels_show(config.brightness_mod)
        val -= speed
        if val < 0:
            val = 0
        
        

        
#fades in an led at led_pos, into color of color_rgb
def color_fade_in(led_pos, color_rgb, speed=1):
    color_hsv = functions.RGBtoHSV(color_rgb)
    
    val = 0
    while val < color_hsv[2]:
        val += speed
        if val > 100:
            val = 100
        new_hsv = [color_hsv[0],color_hsv[1],val]
        for i in range(len(led_pos)):
            functions.pixels_setHSV(led_pos[i], new_hsv)
        functions.pixels_show(config.brightness_mod)

def fireball(led_order, color_rgb, speed=16):
    #led_order = (7,8,6,9,5,10,4,11,3,12,2,13,1,14,0,15)

    for i in range(0,len(led_order),2):
        color_fade_in((led_order[i],led_order[i+1]), color_rgb, speed)

    #time.sleep_ms(50)
    for j in range(0,len(led_order),2):
        color_fade_out((led_order[j],led_order[j+1]), color_rgb, speed)
        
    for but in config.button_list:
        but.time = 0
        
def flash_all(color_rgb):
    functions.pixels_fill(color_rgb)
    functions.pixels_show(config.brightness_mod)
    time.sleep_ms(10)
    
    functions.pixels_fill((0,0,0))
    functions.pixels_show(config.brightness_mod)
    time.sleep_ms(10)
    
    functions.pixels_fill(color_rgb)
    functions.pixels_show(config.brightness_mod)
    time.sleep_ms(10)
    
    functions.pixels_fill((0,0,0))
    functions.pixels_show(config.brightness_mod)

#lights up the led at pos with color
def light_led(pos, color):
    for i in pos:
        functions.pixels_set(i,config.colors[init.random_color])
        #functions.pixels_show(config.brightness_mod)
    
        
