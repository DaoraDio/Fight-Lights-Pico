from machine import Pin
import functions
#declaration of the buttons. Defines (Pin_number, wether Input or Output, Pull up or pull Down)
brightness = Pin(16, Pin.IN, Pin.PULL_UP) #button that controls brightness
up = Pin(1, Pin.IN, Pin.PULL_UP)
down = Pin(2, Pin.IN, Pin.PULL_UP)
right = Pin(3, Pin.IN, Pin.PULL_UP)
left = Pin(4, Pin.IN, Pin.PULL_UP)
select = Pin(5, Pin.IN, Pin.PULL_UP)
ps = Pin(6, Pin.IN, Pin.PULL_UP)
start = Pin(7, Pin.IN, Pin.PULL_UP)

square = Pin(8, Pin.IN, Pin.PULL_UP)
triangle = Pin(9, Pin.IN, Pin.PULL_UP)
r1 = Pin(10, Pin.IN, Pin.PULL_UP)
l1 = Pin(11, Pin.IN, Pin.PULL_UP)
circle = Pin(12, Pin.IN, Pin.PULL_UP)
x = Pin(13, Pin.IN, Pin.PULL_UP)
l2 = Pin(14, Pin.IN, Pin.PULL_UP)
r2 = Pin(15, Pin.IN, Pin.PULL_UP)


#declaration for the Interrupt of the button to change brightness
#uses 'debounce' as handler since the button first has to be debounced to eliminate noise on a button press
brightness.irq(trigger= Pin.IRQ_RISING, handler = functions.debounce_brightness)

#declaration for the Interrupt of the buttons uses 'debounce_clear_led' function as handler
up.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
down.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
right.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
left.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
select.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
ps.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
start.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)

square.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
triangle.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
r1.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
l1.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
circle.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
x.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
l2.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
r2.irq(trigger= Pin.IRQ_RISING | Pin.IRQ_FALLING, handler = functions.debounce_clear_led)
