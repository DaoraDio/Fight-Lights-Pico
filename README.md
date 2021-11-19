# Fight Lights Pico
Fight Lights Pico is a LED-Driver for the Raspberry Pi Pico that gives Arcade Stick modders the neccessary software to implement beautiful RGB LEDs for their projects

# What does it do?

This project is aimed for Arcade stick modders to add custom RGB LEDs to Arcade sticks. The LEDs react to button presses and display custom colors and animations.
The code is easily customizable to help you build the Arcade stick of your dreams.
This code is not limited to Arcade stick projects though, it can be used for any project that needs to light up LEDs when pressing something.


# Requirement

If you want to use this you will need a Raspberry Pi Pico and a LED-Strip with individually adressable LEDs known as Neopixel or WS2812/WS2812b/WS2812e

# Guide

I have written a complete guide for assembly and installation here: https://docs.google.com/document/d/1qY4HESYdRyFT8OaB5leyHsWm4kfqoA74zqSLAdihuvo/edit?usp=sharing

The guide may make the impression that you can only build this with a Brook fighting board, but this is not the case. This code runs standalone on the pico and only
uses the brook fighting board as a means to get the signals from the buttons to the pico and to power the Pico together with the LEDs. I have chosen to write the guide
with a brook fighting board in mind, since it is a very common fighting board, with great compatability and all the neccessary pins for this project, and thus makes it
very easy for begginers to follow and realize.
So as long as you can send the signals of your buttons to the pico, by whatever means you like, directly or through a different pcb,
and have a way to power the Pico and the LEDs, a brook board is not required.

# How does it look?

I have made a short video showcasing some of the features to give you an idea on how it may look in the end:
https://www.youtube.com/watch?v=nG0_0xVvnjk

Reddit user u/mad_max206 has also build this project for his Qanba Obsidian, you can see his result here: https://www.reddit.com/r/fightsticks/comments/qhtwi9/qanba_obsidian_led_mod/
