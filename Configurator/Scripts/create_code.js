function pythonArrayStringSubtractOne(inputString) //subtracts 1 from a python tuble as a string
{
    var numbersArray = inputString.replace(/[()]/g, "").split(",");
    var modifiedNumbers = numbersArray
        .filter(function (number) {
            return number !== "";
        })
        .map(function (number) {
            return parseInt(number) - 1;
        });

    var resultString = "(" + modifiedNumbers.join(",") + (modifiedNumbers.length > 0 ? ',' : '') + ")";
    return resultString
}

function generate_code() {
    var version = "V2.7.5"
    var failsave = "if __name__ == '__main__':\n    import init\n    with open('main.py', 'r') as f:\n        init.code = f.read()\n    exec(init.code)\n\n";
    var header = "print(\"\\033[32mconfig\\033[0m\")\n\#Fight Lights Pico " + version + "\n\nfrom machine import Pin\nfrom init import random, rainbow, smooth, notSet\nimport button\nimport functions\nimport init\n\n";

    //profile name
    var profile_name = document.getElementById("profile_name").value;
    var profile_name2 = 'profile_name = "' + profile_name + '"';

    //pin_num
    var pin_num = document.getElementById("pin_num").value;
    var pin_num2 = "PIN_NUM = " + pin_num;

    //ledcount
    var led_count = document.getElementById("led_count").value;
    var led_count2 = "led_count = " + led_count;

    //leniency
    var leniency = document.getElementById("leniency_tb").value;
    if (document.getElementById("leniency_cb").checked == true) {
        leniency = 0;
    }
    var leniency2 = "leniency = " + leniency;

    //brightness
    var brightness = get_brightness_value();
    brightness = parseInt(brightness);
    brightness /= 100;
    var brightness2 = "brightness_mod = " + brightness;

    //profile color
    let color_string = document.getElementById("profile_color").value;

    if (color_string.startsWith("#")) {
        color_string = hexToRgb(color_string);
        color_string = "rgb(" + color_string.r + ", " + color_string.g + ", " + color_string.b + ")";
    }
    var profile_color = color_string.replace(/\s+/g, '')
    profile_color = profile_color.replace('rgb', 'profile_color = ');

    //onboard LED
    if (document.getElementById("onboard_LED").checked)
        var onboard_led_on = "onboard_led_on = True"
    else
        var onboard_led_on = "onboard_led_on = False"

    //save_stats
    var stats;
    if (document.getElementById("stats_cb").checked)
        stats = "True";
    else
        stats = "False";
    var stats2 = "save_stats = " + stats;

    //colors
    var colors = "";
    var colors_arr = "colors = [";
    var table = document.getElementById("color_table");
    for (var i = 1, row; row = table.rows[i]; i++) {
        var col = row.innerText;
        col = col.split("\t");

        let bgcol = getComputedStyle(row.cells[1]).backgroundColor;
        bgcol = bgcol.replace(/\s+/g, '');
        bgcol = bgcol.replace('rgb', '');
        colors += col[0] + ' = ' + bgcol + '\n';
        if (col[0] != 'blank')
            colors_arr += col[0] + ",";


    }
    colors_arr = colors_arr.slice(0, -1);
    colors_arr += "]\n";
    if (colors_arr == "colors = ]\n")
        colors_arr = "colors = [blank]\n";

    //idle mode
    var idle_mode = document.getElementById("idle_select").value;
    if (document.getElementById("idle_cb").checked == true) {
        idle_mode = 0;
    }
    var idle_mode2 = "idle_mode = " + idle_mode;

    //idle timer
    var idle_after = document.getElementById("idle_tb").value;
    var idle_after2 = "idle_after = " + idle_after;

    //idle mode1 speed
    var idle_mode1_speed = document.getElementById("idle1_speed").value;
    var idle_mode1_speed2 = "idle_mode1_speed = " + idle_mode1_speed;

    //idle_mode1_colors = colors
    var idle_mode1_colors;
    if (document.getElementById("circle_checkbox").checked)
        idle_mode1_colors = "idle_mode1_colors = colors";
    else {
        var idle1_table = document.getElementById("circle_table");
        idle_mode1_colors = "idle_mode1_colors = [";
        for (var i = 1, row; row = idle1_table.rows[i]; i++) {
            var col = row.innerText;
            col = col.trim();
            idle_mode1_colors += col + ',';
        }
        idle_mode1_colors = idle_mode1_colors.slice(0, -1);
        idle_mode1_colors += "]";

        if (idle_mode1_colors == "idle_mode1_colors = ]")
            idle_mode1_colors = "idle_mode1_colors = []"
    }

    //LED Exclude
    var modal_body = document.getElementById("idle_exlude_modal_body");
    var checkedCheckboxIds = [];

    if (modal_body) {
        var checkboxes = modal_body.querySelectorAll('.idle_modal_led_cb');

        checkboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
                var checkboxId = checkbox.closest('span').id;
                checkedCheckboxIds.push(checkboxId);
            }
        });

        var modifiedArray = checkedCheckboxIds.map(function (element) {
            var stringWithoutPrefix = element.replace('led_num', '');

            return (parseInt(stringWithoutPrefix, 10) - 1);
        });
    }

    skip_leds_in_idle = "skip_leds_in_idle = [";
    for (i = 0; i < modifiedArray.length; i++)
        skip_leds_in_idle += modifiedArray[i] + ",";
    skip_leds_in_idle += "]"

    idlemode_leds = "idlemode_leds = functions.remove_idle_skips()";

    //dim_brightness
    var dim = document.getElementById("dim_brightness_slider").value;
    dim = parseInt(dim);
    dim /= 100;
    var dim = "idle_mode3_brightness = " + dim;


    //buttons
    var buttons = "";
    var button_list = 'button_list = [';
    var table = document.getElementById("button_table");

    if (table) {
        for (var i = 1, row; row = table.rows[i]; i++) {
            var gpio_pin = row.cells[4].childNodes[1].value;

            // PROPERLY EXTRACT BUTTON NAME
            var buttonName = row.cells[0].textContent.trim();

            button_list += buttonName + '_MyButton,';
            buttons += buttonName + "_MyButton" + ' = button.MyButton(' + gpio_pin + ", '" + buttonName + "', functions.clear_led)\n";
        }
    }

    button_list = button_list.slice(0, -1);
    if (button_list == "button_list = ") {
        button_list = "button_list = [";
    }
    button_list += "]\ninit.button_list_length = len(button_list)\n\n";

    //button values
    var button_colors = "";
    if (table) {
        for (var i = 1, row; row = table.rows[i]; i++) {
            var fade = row.cells[3].childNodes[0].checked;
            var fade2 = fade ? "True" : "False";

            // Get button name from cell 0
            var buttonName = row.cells[0].textContent.trim();

            // Get LED positions from cell 1
            var leds = row.cells[1].textContent.trim();
            leds = leds.replace(/[ ,]+/g, ",");

            // Add trailing comma for proper tuple formatting
            leds += ",";
            if (leds === "Not,Set,") leds = "0,";

            // Get color from cell 2
            var color = row.cells[2].textContent.trim();

            // Get fade values from cells 5 and 6
            var fadein = parseFloat(row.cells[5].textContent.trim());
            var fadeout = parseFloat(row.cells[6].textContent.trim());

            button_colors += buttonName + "_MyButton" +
                ".set_config((" + leds + "), " +
                color + ", " +
                fade2 + ", " +
                fadein + ", " +
                fadeout + ")\n";
        }
    }

    //ledOptions_color
    color_string = "";
    color_string = document.getElementById("led_options_color").value;

    if (color_string.startsWith("#")) {
        color_string = hexToRgb(color_string);
        color_string = "rgb(" + color_string.r + ", " + color_string.g + ", " + color_string.b + ")";
    }
    var ledOptions_color = color_string.replace(/\s+/g, '')
    ledOptions_color = ledOptions_color.replace('rgb', 'ledOptions_color = ');

    //ledOptions_profile_color_use_all_LEDs 
    if (document.getElementById("led_options_color_cb").checked)
        var led_options_color_cb = "ledOptions_profile_color_use_all_LEDs = True"
    else
        var led_options_color_cb = "ledOptions_profile_color_use_all_LEDs = False"

    //smooth slider
    var smooth_speed = document.getElementById("smooth_speed").value;
    smooth_speed = "smooth_brightness_speed = " + smooth_speed;

    //led_options
    var led_options = "ledOptions_led_buttons = [";
    var led_options_table = document.getElementById("led_options_table");
    for (var i = 1, row; row = led_options_table.rows[i]; i++) {
        var col = row.innerText;
        col = col.trim();
        led_options += col + '_MyButton' + ',';
    }
    led_options = led_options.slice(0, -1);
    led_options += "]";
    if (led_options == "ledOptions_led_buttons = ]")
        led_options = "ledOptions_led_buttons = []";


    var led_options_start = "ledOptions_start_time = " + document.getElementById("led_options_start_time").value;

    var led_options_inc_brightness = "ledOptions_increase_brightness = [" + document.getElementById("led_options_inc_brightness").value + '_MyButton]';
    if (led_options_inc_brightness == "ledOptions_increase_brightness = [_MyButton]")
        led_options_inc_brightness = "ledOptions_increase_brightness = []"

    var led_options_dec_brightness = "ledOptions_decrease_brightness = [" + document.getElementById("led_options_dec_brightness").value + '_MyButton]';
    if (led_options_dec_brightness == "ledOptions_decrease_brightness = [_MyButton]")
        led_options_dec_brightness = "ledOptions_decrease_brightness = []"

    var led_options_left = "ledOptions_left_button = [" + document.getElementById("led_options_left").value + '_MyButton]';
    if (led_options_left == "ledOptions_left_button = [_MyButton]")
        led_options_left = "ledOptions_left_button = []"

    var led_options_right = "ledOptions_right_button = [" + document.getElementById("led_options_right").value + '_MyButton]';
    if (led_options_right == "ledOptions_right_button = [_MyButton]")
        led_options_right = "ledOptions_right_button = []"

    var led_options_confirm = "ledOptions_confirm = [" + document.getElementById("led_options_confirm").value + '_MyButton]';
    if (led_options_confirm == "ledOptions_confirm = [_MyButton]")
        led_options_confirm = "ledOptions_confirm = []"

    //brightness steps
    var brightness_steps = document.getElementById("brightness_steps").value;
    if (brightness_steps != "smooth") {
        brightness_steps = 1 / brightness_steps;
        var brightness_steps2 = "brightness_steps = " + brightness_steps;
    }
    else
        var brightness_steps2 = "brightness_steps = smooth"

    //clear bg
    if (document.getElementById("clear_bg_on_press").checked)
        var clear_bg = "clear_background_on_press = True"
    else
        var clear_bg = "clear_background_on_press = False"

    //background colors
    var background_color = "background = ("
    var background_table = document.getElementById("background_table");
    var bg_value = "";

    for (var i = 1, row; row = background_table.rows[i]; i++) {
        var brightness_val = row.cells[2].innerHTML;
        brightness_val = brightness_val.slice(0, -1);

        var int_val = parseInt(brightness_val) / 100;

        bg_value += '(' + int_val + ',' + background_table.rows[i].cells[1].innerHTML + ',' + background_table.rows[i].cells[0].innerHTML + '),';
        //var bg_value = ""; //table.rows[i].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';
    }
    bg_value = bg_value.slice(0, -1);
    background_color += bg_value + ')';

    //rainbow speed
    var rainbow_speed = "rainbow_speed = " + document.getElementById("rainbow_speed").value;

    //playerLED
    var activate_playerled = document.getElementById("player_led_cb");
    if (activate_playerled.checked)
        activate_playerled = "activate_player_led = False";
    else
        activate_playerled = "activate_player_led = True";

    var playerled_brightness = document.getElementById("playerLED_brightness").value / 100;
    playerled_brightness = "playerLED_brightness = " + playerled_brightness;

    var playerled_pin_num = document.getElementById("playerLED_pin_num").value;
    playerled_pin_num = "playerLED_PIN_NUM = " + playerled_pin_num;

    var player1_led = document.getElementById("player_led1").getAttribute('colorname');
    var player2_led = document.getElementById("player_led2").getAttribute('colorname');
    var player3_led = document.getElementById("player_led3").getAttribute('colorname');
    var player4_led = document.getElementById("player_led4").getAttribute('colorname');

    player1_led = "P1_color = " + player1_led;
    player2_led = "P2_color = " + player2_led;
    player3_led = "P3_color = " + player3_led;
    player4_led = "P4_color = " + player4_led;

    //onOff button
    var OnOff_button = "OnOff_button = [";
    var OnOff_table = document.getElementById("on_off_table");
    for (var i = 1, row; row = OnOff_table.rows[i]; i++) {
        var col = row.innerText;
        col = col.trim();
        OnOff_button += col + '_MyButton' + ',';
    }
    OnOff_button = OnOff_button.slice(0, -1);
    OnOff_button += "]";
    if (OnOff_button == "OnOff_button = ]")
        OnOff_button = "OnOff_button = []";

    //eightway 
    var arrow_up = document.getElementsByClassName("arrow arrow-up")[0];
    var arrow_down = document.getElementsByClassName("arrow arrow-down")[0];
    var arrow_left = document.getElementsByClassName("arrow arrow-left")[0];
    var arrow_right = document.getElementsByClassName("arrow arrow-right")[0];
    var arrow_up_left = document.getElementsByClassName("arrow arrow-up-left")[0];
    var arrow_up_right = document.getElementsByClassName("arrow arrow-up-right")[0];
    var arrow_down_left = document.getElementsByClassName("arrow arrow-down-left")[0];
    var arrow_down_right = document.getElementsByClassName("arrow arrow-down-right")[0];

    var up_positions = "(" + arrow_up.getAttribute("led_pos") + ")";
    up_positions = up_positions.replaceAll(' ', ',');
    if (up_positions == "(not,Set)")
        up_positions = "(-1,)";
    else
        up_positions = pythonArrayStringSubtractOne(up_positions);
    var up_color = arrow_up.getAttribute("directioncolor");
    var eightway_select_up_button = document.getElementById("eightway_select-up").options[document.getElementById("eightway_select-up").selectedIndex].text + "_MyButton";
    if (eightway_select_up_button == "Set UP Button_MyButton")
        eightway_select_up_button = "notSet";
    var eight_way_up = "eight_way_up = [" + up_positions + "," + up_color + "," + eightway_select_up_button + "]";

    var down_positions = "(" + arrow_down.getAttribute("led_pos") + ")";
    down_positions = down_positions.replaceAll(' ', ',');
    if (down_positions == "(not,Set)")
        down_positions = "(-1,)";
    else
        down_positions = pythonArrayStringSubtractOne(down_positions);
    var down_color = arrow_down.getAttribute("directioncolor");
    var eightway_select_down_button = document.getElementById("eightway_select-down").options[document.getElementById("eightway_select-down").selectedIndex].text + "_MyButton";
    if (eightway_select_down_button == "Set DOWN Button_MyButton")
        eightway_select_down_button = "notSet";
    var eight_way_down = "eight_way_down = [" + down_positions + "," + down_color + "," + eightway_select_down_button + "]";

    var left_positions = "(" + arrow_left.getAttribute("led_pos") + ")";
    left_positions = left_positions.replaceAll(' ', ',');
    if (left_positions == "(not,Set)")
        left_positions = "(-1,)";
    else
        left_positions = pythonArrayStringSubtractOne(left_positions);
    var left_color = arrow_left.getAttribute("directioncolor");
    var eightway_select_left_button = document.getElementById("eightway_select-left").options[document.getElementById("eightway_select-left").selectedIndex].text + "_MyButton";
    if (eightway_select_left_button == "Set LEFT Button_MyButton")
        eightway_select_left_button = "notSet";
    var eight_way_left = "eight_way_left = [" + left_positions + "," + left_color + "," + eightway_select_left_button + "]";

    var right_positions = "(" + arrow_right.getAttribute("led_pos") + ")";
    right_positions = right_positions.replaceAll(' ', ',');
    if (right_positions == "(not,Set)")
        right_positions = "(-1,)";
    else
        right_positions = pythonArrayStringSubtractOne(right_positions);
    var right_color = arrow_right.getAttribute("directioncolor");
    var eightway_select_right_button = document.getElementById("eightway_select-right").options[document.getElementById("eightway_select-right").selectedIndex].text + "_MyButton";
    if (eightway_select_right_button == "Set RIGHT Button_MyButton")
        eightway_select_right_button = "notSet";
    var eight_way_right = "eight_way_right = [" + right_positions + "," + right_color + "," + eightway_select_right_button + "]";


    var up_left_positions = "(" + arrow_up_left.getAttribute("led_pos") + ")";
    up_left_positions = up_left_positions.replaceAll(' ', ',');
    if (up_left_positions == "(not,Set)")
        up_left_positions = "(-1,)";
    else
        up_left_positions = pythonArrayStringSubtractOne(up_left_positions);
    var up_left_color = arrow_up_left.getAttribute("directioncolor");
    var eight_way_up_left = "eight_way_upleft = [" + up_left_positions + "," + up_left_color + "]";

    var up_right_positions = "(" + arrow_up_right.getAttribute("led_pos") + ")";
    up_right_positions = up_right_positions.replaceAll(' ', ',');
    if (up_right_positions == "(not,Set)")
        up_right_positions = "(-1,)";
    else
        up_right_positions = pythonArrayStringSubtractOne(up_right_positions);
    var up_right_color = arrow_up_right.getAttribute("directioncolor");
    var eight_way_up_right = "eight_way_upright = [" + up_right_positions + "," + up_right_color + "]";

    var down_left_positions = "(" + arrow_down_left.getAttribute("led_pos") + ")";
    down_left_positions = down_left_positions.replaceAll(' ', ',');
    if (down_left_positions == "(not,Set)")
        down_left_positions = "(-1,)";
    else
        down_left_positions = pythonArrayStringSubtractOne(down_left_positions);
    var down_left_color = arrow_down_left.getAttribute("directioncolor");
    var eight_way_down_left = "eight_way_leftdown = [" + down_left_positions + "," + down_left_color + "]";

    var down_right_positions = "(" + arrow_down_right.getAttribute("led_pos") + ")";
    down_right_positions = down_right_positions.replaceAll(' ', ',');
    if (down_right_positions == "(not,Set)")
        down_right_positions = "(-1,)";
    else
        down_right_positions = pythonArrayStringSubtractOne(down_right_positions);
    var down_right_color = arrow_down_right.getAttribute("directioncolor");
    var eight_way_down_right = "eight_way_rightdown = [" + down_right_positions + "," + down_right_color + "]";


    //OLED disable
    var activate_oled = document.getElementById("oled_cb");
    if (activate_oled.checked)
        activate_oled = "activate_oled = False";
    else
        activate_oled = "activate_oled = True";


    //Oled buttons
    var oled_button = ""
    var oled_array = "oled_buttons = ["
    for (var i = 0; i < circles.length; i++) {
        oled_array += "oled_button" + i + ",";

        oled_button += "oled_button";
        var x = circles[i].x;
        var y = circles[i].y;
        oled_button += i + " = (" + x + "," + y + ",";
        if (circles[i].is_lever)
            oled_button += "'is_lever',";
        else if (circles[i].is_key)
            oled_button += "'is_key',";
        else
            oled_button += "'is_button',";

        if (circles[i].button_activation != "notSet")
            oled_button += circles[i].button_activation + "_MyButton,";
        else
            oled_button += "None,";

        oled_button += circles[i].radius + ",";

        if (circles[i].is_key)
            oled_button += circles[i].angle + ")\n";
        else
            oled_button += "None)\n";
    }
    oled_array += "]";

    //oled idle behaviour
    var oled_idle = parseInt(document.getElementById("oled_idle").value);

    if (oled_idle == 0)
        oled_idle = "oled_idle = 0"
    else if (oled_idle == 1)
        oled_idle = "oled_idle = 1"
    else if (oled_idle == 2)
        oled_idle = "oled_idle = 2"
    else if (oled_idle == 3)
        oled_idle = "oled_idle = 3"

    //oled normal operation
    var oled_layout = parseInt(document.getElementById("oled_layout").value);
    if (oled_layout == 0)
        oled_layout = "oled_layout = 0"
    else if (oled_layout == 1)
        oled_layout = "oled_layout = 1"
    else if (oled_layout == 2)
        oled_layout = "oled_layout = 2"
    else if (oled_layout == 3)
        oled_layout = "oled_layout = 3"

    //oled type
    var oled_type = parseInt(document.getElementById("oled_type_select").value);
    if (oled_type == 0)
        oled_type = "oled_type = 0"
    else if (oled_type == 1)
        oled_type = "oled_type = 1"


    //oled invert
    var oled_invert = document.getElementById("oled_invert_oled");
    if (oled_invert.checked)
        oled_invert = "invert_oled = True"
    else
        oled_invert = "invert_oled = False"

    //oled rotate
    var oled_rotate = document.getElementById("oled_rotate_oled");
    if (oled_rotate.checked)
        oled_rotate = "rotate_oled = True"
    else
        oled_rotate = "rotate_oled = False"

    //oled i2c pins
    var oled_i2c_rad1 = document.getElementById("oled_i2c_rad1");
    var oled_i2c_rad2 = document.getElementById("oled_i2c_rad2");
    var i2c_interface;
    var sda;
    var scl;

    if (oled_i2c_rad1.checked) {
        i2c_interface = 0;
        sda = document.getElementById("oled_sda0_select").value;
        scl = document.getElementById("oled_scl0_select").value;
    }
    else if (oled_i2c_rad2.checked) {
        i2c_interface = 1;
        sda = document.getElementById("oled_sda1_select").value;
        scl = document.getElementById("oled_scl1_select").value;
    }

    var i2cinterface = "i2c_interface = " + i2c_interface;
    var sdapin = "oled_sda = " + sda;
    var sclpin = "oled_scl = " + scl;


    //oled animation delay
    var animation_delay = document.getElementById("oled_animation_delay").value;
    animation_delay = "oled_animation_delay = " + animation_delay;

    //oled combo default frame
    var oled_combo_idle_frame_value = document.getElementById("oled_default_sprite").value;
    if(document.getElementById("oled_enable_default_sprite").checked)
        oled_combo_idle_frame_value = -1;
    var oled_combo_idle_frame = "oled_combo_idle_frame = " + oled_combo_idle_frame_value;

    document.getElementById("code_box").value =
        failsave + activate_oled + '\n' + header
        + colors + "\n"
        + colors_arr + "\n"
        + profile_name2 + "\n"
        + pin_num2 + "\n"
        + led_count2 + "\n"
        + leniency2 + "\n"
        + brightness2 + "\n"
        + profile_color + "\n"
        + onboard_led_on + "\n"
        + stats2 + "\n"
        + "input_reset_time = 50\n"
        + idle_mode2 + "\n"
        + idle_after2 + "\n"
        + idle_mode1_speed2 + "\n"
        + idle_mode1_colors + "\n"
        + skip_leds_in_idle + "\n"
        + idlemode_leds + "\n"
        + dim + "\n"
        + buttons + "\n"
        + button_list + "\n"
        + button_colors + "\n"
        + ledOptions_color + "\n"
        + led_options_color_cb + "\n"
        + smooth_speed + '\n'
        + led_options + '\n'
        + led_options_start + '\n'
        + led_options_inc_brightness + '\n'
        + led_options_dec_brightness + '\n'
        + led_options_left + '\n'
        + led_options_right + '\n'
        + led_options_confirm + '\n'
        + brightness_steps2 + "\n"
        + clear_bg + "\n"
        + background_color + "\n"
        + rainbow_speed + "\n"
        + activate_playerled + '\n'
        + playerled_brightness + '\n'
        + playerled_pin_num + '\n'
        + player1_led + '\n'
        + player2_led + '\n'
        + player3_led + '\n'
        + player4_led + '\n'
        + OnOff_button + '\n'
        + eight_way_up + '\n'
        + eight_way_down + '\n'
        + eight_way_left + '\n'
        + eight_way_right + '\n'
        + eight_way_up_left + '\n'
        + eight_way_up_right + '\n'
        + eight_way_down_left + '\n'
        + eight_way_down_right + '\n'
        + oled_button + oled_array + '\n'
        + oled_idle + '\n'
        + oled_layout + '\n'
        + oled_type + '\n'
        + oled_invert + '\n'
        + oled_rotate + '\n'
        + i2cinterface + '\n'
        + sdapin + '\n'
        + sclpin + '\n'
        + animation_delay + '\n'
        + oled_combo_idle_frame + '\n'
        + exportCombosToString() + '\n'
        + createPythonByteArray(getBinaryPixelValuesArray('my_splash_canvas'), 'splash') + '\n'
        + createPythonByteArray(getBinaryPixelValuesArray('my_overlay_canvas'), 'overlay') + '\n'
        + "############do not delete this line#######################";


}

function check_gpio_conflicts() {
    var table = document.getElementById("button_table");
    var gpio_pins = [];
    for (var i = 1, row; row = table.rows[i]; i++) {
        var button_name = row.cells[0].textContent.trim();
        var gpio_pin = row.cells[4].childNodes[1].value;
        gpio_pins.push({ pin: gpio_pin, label: button_name });
    }

    var led_out = document.getElementById("pin_num").value;
    gpio_pins.push({ pin: led_out, label: "LED Chain GPIO" });

    if (document.getElementById("player_led_cb").checked == false) {
        var player_led = document.getElementById("playerLED_pin_num").value;
        gpio_pins.push({ pin: player_led, label: "Player LED" });
    }
    if (document.getElementById("oled_cb").checked == false) {
        if (document.getElementById("oled_i2c_rad1").checked) {
            var oled_sda = document.getElementById("oled_sda0_select").value;
            var oled_scl = document.getElementById("oled_scl0_select").value;
            gpio_pins.push({ pin: oled_sda, label: "OLED SDA0" });
            gpio_pins.push({ pin: oled_scl, label: "OLED SCL0" });
        }
        else if (document.getElementById("oled_i2c_rad2").checked) {
            var oled_sda = document.getElementById("oled_sda1_select").value;
            var oled_scl = document.getElementById("oled_scl1_select").value;
            gpio_pins.push({ pin: oled_sda, label: "OLED SDA1" });
            gpio_pins.push({ pin: oled_scl, label: "OLED SCL1" });
        }
    }

    var pinMap = {};
    var mandatoryConflicts = [];

    // Group pins by value and collect their labels
    for (let entry of gpio_pins) {
        if (entry.pin in pinMap) {
            pinMap[entry.pin].push(entry.label);
        } else {
            pinMap[entry.pin] = [entry.label];
        }
    }

    // Check for any duplicate pins
    for (let pin in pinMap) {
        const labels = pinMap[pin];
        if (labels.length > 1) {
            mandatoryConflicts.push(`GPIO pin ${pin} is used by: ${labels.join(", ")}`);
        }
    }

    // Show alert if conflicts found
    if (mandatoryConflicts.length > 0) {
        const conflictMessage = "⚠️ GPIO Conflicts Found:\n\n" +
            mandatoryConflicts.join("\n") +
            "\n\nThese pins are assigned to multiple functions. " +
            "This may cause unexpected behavior.\n\n" +
            "Do you want to proceed anyway?";

        const proceed = confirm(conflictMessage);
        return proceed; // Return true if user confirms, false if they cancel
    }

    // No conflicts
    return true;
}

function exportCombosToString() {
    const rows = document.querySelectorAll('.combo-row');
    const combos = [];

    rows.forEach(row => {
        const buttons = row.selectedButtons || [];

        if (buttons.length === 0) return; // 🔥 skip empty rows

        const spriteInput = row.querySelector('.sprite-idx-input');
        const sprite = spriteInput ? Number(spriteInput.value) || 0 : 0;

        const buttonsWithSuffix = buttons.map(btn => btn + '_MyButton');

        combos.push([...buttonsWithSuffix, sprite]);
    });

    return 'user_combos = [' + combos.map(arr => '[' + arr.join(', ') + ']').join(',') + ']';
}

