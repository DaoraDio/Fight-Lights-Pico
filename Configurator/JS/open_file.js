var files;
var i = 0;
const file_name_textbox = document.getElementById("file_names");

function set_eighway_directions(variable_line, arrow_classname, select_idname)
{
    var eightway_direction = get_value(variable_line);
    eightway_direction = eightway_direction.replaceAll('(','');
    eightway_direction = eightway_direction.replaceAll(')','');
    eightway_direction = eightway_direction.replaceAll('[','');
    eightway_direction = eightway_direction.replaceAll(']','');
    eightway_direction = eightway_direction.split(',');
    var eighway_direction_button = eightway_direction.pop();
    eighway_direction_button = eighway_direction_button.replaceAll('_MyButton', '');
    var eighway_direction_color = eightway_direction.pop();
    if(eightway_direction[eightway_direction.length-1] == "")
        eightway_direction.pop();

    var led_pos_string = "";
    for(i = 0; i < eightway_direction.length; i++)
    {
        if(eightway_direction[0] == "-1" )
            led_pos_string = "not Set"
        else
            led_pos_string += (Number(eightway_direction[i])+1) + " ";
    }
    
    document.getElementsByClassName(arrow_classname)[0].setAttribute("directioncolor", eighway_direction_color);
    document.getElementsByClassName(arrow_classname)[0].setAttribute("led_pos", led_pos_string);
    //console.log(eighway_direction_button);
    if(eighway_direction_button == "notSet")
        document.getElementById(select_idname).value = -1;
    else
        document.getElementById(select_idname).value = eighway_direction_button;
}

function set_eighway_arrows(variable_line, arrow_classname)
{
    var eightway_direction = get_value(variable_line);
    eightway_direction = eightway_direction.replaceAll('(','');
    eightway_direction = eightway_direction.replaceAll(')','');
    eightway_direction = eightway_direction.replaceAll('[','');
    eightway_direction = eightway_direction.replaceAll(']','');
    eightway_direction = eightway_direction.split(',');

    var eighway_direction_color = eightway_direction.pop();
    if(eightway_direction[eightway_direction.length-1] == "")
        eightway_direction.pop();

    var led_pos_string = "";
    for(i = 0; i < eightway_direction.length; i++)
    {
        if(eightway_direction[0] == "-1" )
            led_pos_string = "not Set"
        else
            led_pos_string += (Number(eightway_direction[i])+1) + " ";
    }
    
    document.getElementsByClassName(arrow_classname)[0].setAttribute("directioncolor", eighway_direction_color);
    document.getElementsByClassName(arrow_classname)[0].setAttribute("led_pos", led_pos_string);
}
//returns the line of code of str from the loaded file
function set_brightness_slider(that)
{
    
    var brightness_label = document.getElementById("brightness_label");
    brightness_label.innerText = "Brightness: " + that.value + "%";
    
    
    var row_id = document.getElementById("button_row_id").innerHTML;
    row_id = parseInt(row_id);

    var button_table = document.getElementById("button_table");
    if(row_id > 0)
    {
        row = button_table.rows[row_id];
        row.cells[5].innerHTML = that.value + "%";
    }



}
function get_variable_line(str) {
    var code = document.getElementById("new_codebox").value;
    var lines = code.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.indexOf(str) === 0) {
            return line;
        }
    }
    return false;
}

function get_value(str)
{
    if(get_variable_line(str))
    {
        var string = get_variable_line(str);
        string = string.split(' ');
        //console.log(string[string.length-1]);
        return string[string.length-1]
    }
    else
        return false;

}

function py_tuple_to_rgb_array(tuple)
{
    tuple = tuple.substring(1);
    tuple = tuple.slice(0,-1);
    tuple = tuple.split(',');
    return [parseInt(tuple[0]),parseInt(tuple[1]),parseInt(tuple[2])]
}


function get_code()
{
    //get profile name
    var profile_name = get_variable_line("profile_name");
    profile_name = profile_name.substring(profile_name.indexOf('"')+1, profile_name.lastIndexOf('"'));
    document.getElementById("profile_name").value = profile_name;
    

    //get color_list
    var color_list = get_value("colors = ");
    
    color_list = color_list.substring(1);
    color_list = color_list.slice(0,-1);
    color_list = color_list.split(',');
            console.log(color_list);
    

    //get colors
    //set color table
    var color_table = document.getElementById("color_table");
    color_table.innerHTML = '<table class="tg" id="color_table" onmouseover="select_color_table()">\
                                <thead>\
                                    <tr>\
                                        <th id="table_name">Name</th>\
                                        <th>R</th>\
                                        <th>G</th>\
                                        <th>B</th>\
                                        <th></th>\
                                    </tr>\
                                    <tr>\
                                        <td class="def_col">blank</td>\
                                        <td class="def_col">0</td>\
                                        <td class="def_col">0</td>\
                                        <td class="def_col">0</td>\
                                        <td style="background-color:black" draggable="true"></td>\
                                    </tr>\
                                </thead>\
                            </table>';

    for(var i = 0; i < color_list.length; i++)
    {
        if (color_list.length === 1 && color_list[0] === "blank") 
            break;
        var color = get_value(color_list[i]);
        col_arr = py_tuple_to_rgb_array(color);

        var row = color_table.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        
        var cell_color = 'rgb(' + col_arr[0] + ',' + col_arr[1] + ',' + col_arr[2] + ')';
        cell1.innerHTML = color_list[i];
        cell2.innerHTML = col_arr[0];
        cell3.innerHTML = col_arr[1];
        cell4.innerHTML = col_arr[2];
        cell5.style.backgroundColor = cell_color;
    }

    //get led_count
    var led_count = get_value("led_count = ");
    document.getElementById("led_count").value = led_count;

    //get pin num
    var PIN_NUM  = get_value("PIN_NUM = ");
    document.getElementById("pin_num").value = PIN_NUM;

    //get leniency 
    var leniency = get_value("leniency = ");
    if(leniency == 0)
    {
        document.getElementById("leniency_cb").checked = true;
        document.getElementById("leniency_tb").disabled = true;
        document.getElementById("leniency_tb").value = 1;
        document.getElementById("leniency_tx").style.color = "grey";
    }
    else
    {
        document.getElementById("leniency_cb").checked = false;
        document.getElementById("leniency_tb").disabled = false;
        document.getElementById("leniency_tx").style.color = "black";

        document.getElementById("leniency_tb").value = leniency;

    }

    //get brightness_mod 
    var brightness_mod = get_value("brightness_mod = ");
    brightness_mod = parseFloat(brightness_mod) * 100;
    document.getElementById("myRange").value = brightness_mod;
    document.getElementById("brightness").innerText = brightness_mod;

    //get brightness_steps  
    var brightness_steps = get_value("brightness_steps = ");
    if(brightness_steps != "smooth")
    {
        brightness_steps = 1/parseFloat(brightness_steps);
        document.getElementById("brightness_steps").value = brightness_steps;
    }
    else
    {
        document.getElementById("brightness_steps").value = "smooth";
    }

    

    //get idle_mode  
    var idle_mode = get_value("idle_mode = ");
    var idle_after = get_value("idle_after = ");
    if(idle_mode == "0")
    {
        document.getElementById("idle_select").disabled = true;
        document.getElementById("idlemode_tx").style.color = "grey";
        document.getElementById("idle_cb").checked = true;
        document.getElementById("idleseconds_tx").style.color = "grey";
        document.getElementById("idle_tb").disabled = true;
        document.getElementById("idle_tb").value = idle_after;
    }
    else
    {
        document.getElementById("idle_select").disabled = false;
        document.getElementById("idlemode_tx").style.color = "black";
        document.getElementById("idle_cb").checked = false;
        document.getElementById("idleseconds_tx").style.color = "black";
        document.getElementById("idle_tb").disabled = false;
        document.getElementById("idle_tb").value = idle_after;
        document.getElementById("idle_select").value = idle_mode;
        document.getElementById("idle1_config").disabled = false;
    }
    //get save_stats   
    var save_stats = get_value("save_stats = ");
    var stats_cb = document.getElementById("stats_cb");
    if(save_stats == "True")
        stats_cb.checked = true;
    else
        stats_cb.checked = false;
    

    //get input_reset_time   
    var input_reset_time = get_value("input_reset_time = ");
    

    //get profile_color   
    var profile_color = get_value("profile_color = ");
    profile_color = profile_color.substring(1);
    profile_color = profile_color.slice(0,-1);
    profile_color = profile_color.split(',');
    var hex_value = rgbToHex(parseInt(profile_color[0]),parseInt(profile_color[1]),parseInt(profile_color[2]))
    document.getElementById("profile_color").value = hex_value;
    

    //get clear_background_on_press   
    var clear_background_on_press = get_value("clear_background_on_press = ");
    if(clear_background_on_press == "True")
        document.getElementById("clear_bg_on_press").checked = true;
    else
    document.getElementById("clear_bg_on_press").checked = false;
    

    //set background table
    set_bg_table();

    //get button_list   
    var button_list = get_value("button_list = ");
    button_list = button_list.substring(1);
    button_list = button_list.slice(0,-1);
    button_list = button_list.split(',');
    
    

    //set button table
    //var button = get_value(button_list[0] + " = ");
    var button_table = document.getElementById("button_table");
    button_table.innerHTML = '<table class="tg" id="button_table" onmouseover="select_button_table()">\
                                    <tr>\
                                        <th id="button_name">Button Name</th>\
                                        <th>LED Positions</th>\
                                        <th>Color</th>\
                                        <th>Fade</th>\
                                        <th>GPIO Pin</th>\
                                        <th>Brightness</th>\
                                        <th>Fade-in</th>\
                                        <th>Fade-out</th>\
                                    </tr>\
                                </table>';

    var fade = '<input type="checkbox" id="fade_cb" name="fade_cb" onchange="">';
    var gpio_pins = '<td>\
                        <select name="gpio_select" id="gpio_select">\
                            <option value="0">GP0</option>\
                            <option value="1">GP1</option>\
                            <option value="2">GP2</option>\
                            <option value="3">GP3</option>\
                            <option value="4">GP4</option>\
                            <option value="5">GP5</option>\
                            <option value="6">GP6</option>\
                            <option value="7">GP7</option>\
                            <option value="8">GP8</option>\
                            <option value="9">GP9</option>\
                            <option value="10">GP10</option>\
                            <option value="11">GP11</option>\
                            <option value="12">GP12</option>\
                            <option value="13">GP13</option>\
                            <option value="14">GP14</option>\
                            <option value="15">GP15</option>\
                            <option value="16">GP16</option>\
                            <option value="17">GP17</option>\
                            <option value="18">GP18</option>\
                            <option value="19">GP19</option>\
                            <option value="20">GP20</option>\
                            <option value="21">GP21</option>\
                            <option value="22">GP22</option>\
                            <option value="23">GP23</option>\
                            <option value="24">GP24</option>\
                            <option value="25">GP25</option>\
                            <option value="26">GP26</option>\
                            <option value="27">GP27</option>\
                            <option value="28">GP28</option>\
                        </select></td> ';
    update_color_select();
    
    for(var i = 0; i < button_list.length; i++)
    {
        var button = get_variable_line(button_list[i]);

        button = button.replace(button_list[i] + ' = button.MyButton(', '');
        button = button.split(',');
    
        var button_name = button[1];
        button_name = button_name.replaceAll("'",'');
        button_name = button_name.trim();
    
        var button_gpio = parseInt(button[0]);
    
        var button_conf = get_variable_line(button_list[i]+'.set_config(');
        button_conf = button_conf.replace(button_list[i]+'.set_config(', '');
        button_conf = button_conf.split(' ');
        
    
        var button_color = button_conf[1].slice(0,-1);
        var button_fade = button_conf[2].slice(0,-1);
        var button_leds = button_conf[0].replaceAll(',', ' ');
        var button_brightness = parseFloat(button_conf[3]) * 100;
        var button_fadein = button_conf[4].replaceAll(',', ' ');
        var button_fadeout = button_conf[5].replaceAll(')', ' ');;
      
        button_leds = button_leds.replaceAll('(', ' ');
        button_leds = button_leds.replaceAll(')', ' ');
        button_leds = button_leds.split(' ');
        button_leds = button_leds.filter(Boolean);
        var button_leds2 = "";
        for(var j = 0; j < button_leds.length; j++)
            button_leds2 += button_leds[j] + " ";
        button_leds2 = button_leds2.slice(0,-1);

        

        var row = button_table.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);
        var cell8 = row.insertCell(7);

        if(button_leds2 == 0)
            button_leds2 = "Not Set";

        cell1.innerHTML = button_name;
        cell2.innerHTML = button_leds2;
        cell3.innerHTML = button_color;
        cell4.innerHTML = fade;
        cell5.innerHTML = gpio_pins;
        cell6.innerHTML = button_brightness  + '%';
        cell7.innerHTML = button_fadein;
        cell8.innerHTML = button_fadeout;
        
        var n_row = button_table.rows[i+1];
        if(button_fade == "True")
            n_row.cells[3].childNodes[0].checked = true;
        else
            n_row.cells[3].childNodes[0].checked = false;

        n_row.cells[4].childNodes[1].value = button_gpio;

    }
    show_idle1_config();
    //get idle 1 config
    //get idle speed
    var idle_mode1_speed = get_value("idle_mode1_speed = ");
    document.getElementById("idle1_speed").value = idle_mode1_speed;
    

    //get idle_mode1_colors
    var idle_mode1_colors = get_value("idle_mode1_colors");
    if(idle_mode1_colors == "colors")
        document.getElementById("circle_checkbox").checked = true;
    else
    {
        document.getElementById("circle_checkbox2").checked = true;
        idle_mode1_colors = idle_mode1_colors.substring(1);
        idle_mode1_colors = idle_mode1_colors.slice(0,-1);
        idle_mode1_colors = idle_mode1_colors.split(',');

        var circle_table_replace = '<table class="tg" id="circle_table" onmouseover="select_circle_table()">\
                                <thead>\
                                <tr>\
                                    <th style="font-weight: bold;">Colors</th>\
                                </tr>\
                                </thead>\
                            </table>';

        document.getElementById("circle_table").innerHTML = circle_table_replace;
        for(var i = 0; i < idle_mode1_colors.length; i++)
        {
            var row = document.getElementById("circle_table").insertRow();

            var cell1 = row.insertCell(0);
            cell1.innerHTML = idle_mode1_colors[i];
        }

    }
        
    //get led_options
    show_led_options(false);
    var start_time = get_value("ledOptions_start_time = ")
    document.getElementById("led_options_start_time").value = start_time;
    //get buttons
    var led_options_button = get_variable_line("ledOptions_led_buttons = [");

        
    led_options_button = led_options_button.replace("ledOptions_led_buttons = [", '');
    led_options_button = led_options_button.slice(0,-1);
    led_options_button = led_options_button.replaceAll("_MyButton", '');
    led_options_button = led_options_button.split(',');
    
    var table_replace = '<table class="tg" id="led_options_table" onmouseover="">\
                            <thead>\
                            <tr>\
                                <th style="font-weight: bold;">Buttons</th>\
                            </tr>\
                            </thead>\
                        </table>';
    var led_options_table = document.getElementById("led_options_table");
    led_options_table.innerHTML = table_replace;
    if(led_options_button.length !== 1)
    {
        for(var i = 0; i < led_options_button.length; i++)
        {
            var row = led_options_table.insertRow();
            var cell1 = row.insertCell(0);
            cell1.innerHTML = led_options_button[i];
        }
    }

      
    //led option increse brightness
    var led_option_increase_brightness = get_value("ledOptions_increase_brightness = ");
    led_option_increase_brightness = led_option_increase_brightness.substring(1);
    led_option_increase_brightness = led_option_increase_brightness.slice(0,-1);
    led_option_increase_brightness = led_option_increase_brightness.replace('_MyButton', '');
    document.getElementById("led_options_inc_brightness").value = led_option_increase_brightness;

    //led option dec brightness
    var led_option_dec_brightness = get_value("ledOptions_decrease_brightness = ");
    led_option_dec_brightness = led_option_dec_brightness.substring(1);
    led_option_dec_brightness = led_option_dec_brightness.slice(0,-1);
    led_option_dec_brightness = led_option_dec_brightness.replace('_MyButton', '');
    document.getElementById("led_options_dec_brightness").value = led_option_dec_brightness;

    //led option left
    var led_options_left = get_value("ledOptions_left_button = ");
    led_options_left = led_options_left.substring(1);
    led_options_left = led_options_left.slice(0,-1);
    led_options_left = led_options_left.replace('_MyButton', '');
    document.getElementById("led_options_left").value = led_options_left;

    //led option right
    var led_options_right = get_value("ledOptions_right_button = ");
    led_options_right = led_options_right.substring(1);
    led_options_right = led_options_right.slice(0,-1);
    led_options_right = led_options_right.replace('_MyButton', '');
    document.getElementById("led_options_right").value = led_options_right;

    //led option confirm
    var led_options_confirm = get_value("ledOptions_confirm = ");
    led_options_confirm = led_options_confirm.substring(1);
    led_options_confirm = led_options_confirm.slice(0,-1);
    led_options_confirm = led_options_confirm.replace('_MyButton', '');
    document.getElementById("led_options_confirm").value = led_options_confirm;
    

    //led options color
    var ledOptions_color = get_value("ledOptions_color = ");
    ledOptions_color = py_tuple_to_rgb_array(ledOptions_color);
    document.getElementById("led_options_color").value = rgbToHex(parseInt(ledOptions_color[0]),parseInt(ledOptions_color[1]),parseInt(ledOptions_color[2]));

    //LED Options checkbox
    var ledOptions_profile_color_use_all_LEDs = get_value("ledOptions_profile_color_use_all_LEDs = ");
    if(ledOptions_profile_color_use_all_LEDs == "False")
        document.getElementById("led_options_color_cb").checked = false;
    else
        document.getElementById("led_options_color_cb").checked = true;
    


    //ON OFF Button
    var OnOff_button = get_variable_line("OnOff_button = [");

        
    OnOff_button = OnOff_button.replace("OnOff_button = [", '');
    OnOff_button = OnOff_button.slice(0,-1);
    OnOff_button = OnOff_button.replaceAll("_MyButton", '');
    OnOff_button = OnOff_button.split(',');
    
    var table_replace = '<table class="tg" id="on_off_table" onmouseover="">\
                            <thead>\
                            <tr>\
                                <th style="font-weight: bold;">Buttons</th>\
                            </tr>\
                            </thead>\
                        </table>';
    var on_off_table = document.getElementById("on_off_table");
    on_off_table.innerHTML = table_replace;
    if(OnOff_button.length !== 1)
    {
        for(var i = 0; i < OnOff_button.length; i++)
        {
            var row = on_off_table.insertRow();
            var cell1 = row.insertCell(0);
            cell1.innerHTML = OnOff_button[i];
        }
    }



    //rainbow speed
    var rainbow_speed =  get_value("rainbow_speed = ");
    document.getElementById("rainbow_speed").value = rainbow_speed;


    
    //var idle1_config_button = document.getElementById("idle1_config");
    var activate_player_led = get_value("activate_player_led = ");
    if(activate_player_led == "True")
    {
        document.getElementById("playerled_cb").checked = false;
        document.getElementById("playerled_button").disabled = false;
    }
    else if(activate_player_led == "False")
    {
        document.getElementById("playerled_cb").checked = true;
        document.getElementById("playerled_button").disabled = true;
    }


    var playerLED_brightness = get_value("playerLED_brightness = ");
    playerLED_brightness = playerLED_brightness * 100;

    document.getElementById("playerLED_brightness_text").innerText = playerLED_brightness;
    document.getElementById("playerLED_brightness").value = playerLED_brightness;

    var player1_color = get_value("P1_color = ");
    var player2_color = get_value("P2_color = ");
    var player3_color = get_value("P3_color = ");
    var player4_color = get_value("P4_color = ");

    var p1 = document.getElementById("player_led1");
    p1.setAttribute('colorname', player1_color);

    var p2 = document.getElementById("player_led2");
    p2.setAttribute('colorname', player2_color);

    var p3 = document.getElementById("player_led3");
    p3.setAttribute('colorname', player3_color);

    
    var p4 = document.getElementById("player_led4");
    p4.setAttribute('colorname', player4_color);

    var p1_color = "rgb"+get_value(player1_color + " = ");
    var p2_color = "rgb"+get_value(player2_color + " = ");
    var p3_color = "rgb"+get_value(player3_color + " = ");
    var p4_color = "rgb"+get_value(player4_color + " = ");


    p1.style.backgroundColor = p1_color;
    p2.style.backgroundColor = p2_color;
    p3.style.backgroundColor = p3_color;
    p4.style.backgroundColor = p4_color;

    var playerled_pinnum = get_value("playerLED_PIN_NUM = ");
    document.getElementById("playerLED_pin_num").value = playerled_pinnum;

    var onboardled = get_value("onboard_led_on = ");
    if(onboardled == "True")
        document.getElementById("onboard_LED").checked = true;
    else
        document.getElementById("onboard_LED").checked = false;

    //dynamic profile next
    var next_config = get_variable_line("next_config = [");

        
    next_config = next_config.replace("next_config = [", '');
    next_config = next_config.slice(0,-1);
    next_config = next_config.replaceAll("_MyButton", '');
    next_config = next_config.split(',');
    
    var table_replace = '<table class="tg" id="dynamic_profile_table_next" onmouseover="">\
                            <thead>\
                            <tr>\
                                <th style="font-weight: bold;">Buttons</th>\
                            </tr>\
                            </thead>\
                        </table>';
    var next_config_table = document.getElementById("dynamic_profile_table_next");
    next_config_table.innerHTML = table_replace;
    if(next_config.length !== 1)
    {
        for(var i = 0; i < next_config.length; i++)
        {
            var row = next_config_table.insertRow();
            var cell1 = row.insertCell(0);
            cell1.innerHTML = next_config[i];
        }
    }

    //dynamic profile prev
    var prev_config = get_variable_line("prev_config = [");

        
    prev_config = prev_config.replace("prev_config = [", '');
    prev_config = prev_config.slice(0,-1);
    prev_config = prev_config.replaceAll("_MyButton", '');
    prev_config = prev_config.split(',');
    
    var table_replace = '<table class="tg" id="dynamic_profile_table_prev" onmouseover="">\
                            <thead>\
                            <tr>\
                                <th style="font-weight: bold;">Buttons</th>\
                            </tr>\
                            </thead>\
                        </table>';
    var prev_config_table = document.getElementById("dynamic_profile_table_prev");
    prev_config_table.innerHTML = table_replace;
    if(prev_config.length !== 1)
    {
        for(var i = 0; i < prev_config.length; i++)
        {
            var row = prev_config_table.insertRow();
            var cell1 = row.insertCell(0);
            cell1.innerHTML = prev_config[i];
        }
    }

    //smooth speed
    var smooth_brightness_speed = get_value("smooth_brightness_speed = ");
    document.getElementById("smooth_speed").value = smooth_brightness_speed;
    document.getElementById("smooth_label").innerText = "Speed: " + smooth_brightness_speed;
    show_smooth_slider();

    //exclude idle leds
    var skip_leds_in_idle = get_value("skip_leds_in_idle = ");
    var parsedArray = skip_leds_in_idle.slice(1, -2).split(',').map(function(item) {
        return parseInt(item, 10)+1;
    });
    checkedCheckboxIds = []
    for(var i = 0; i < parsedArray.length; i++)
    {
        checkedCheckboxIds.push("led_num"+parsedArray[i])
    }

    //eightway 
    show_eightway_modal(false);
    set_eighway_directions("eight_way_up = [", "arrow arrow-up", "eightway_select-up");
    set_eighway_directions("eight_way_down = [", "arrow arrow-down", "eightway_select-down");
    set_eighway_directions("eight_way_left = [", "arrow arrow-left", "eightway_select-left");
    set_eighway_directions("eight_way_right = [", "arrow arrow-right", "eightway_select-right");

    set_eighway_arrows("eight_way_upleft = [", "arrow arrow-up-left");
    set_eighway_arrows("eight_way_upright = [", "arrow arrow-up-right");
    set_eighway_arrows("eight_way_leftdown = [", "arrow arrow-down-left");
    set_eighway_arrows("eight_way_rightdown = [", "arrow arrow-down-right");

    //oled splah
    var splash = get_variable_line("splash = ");
    var codeboxtext = document.getElementById("new_codebox").value;
    var indexOfStr = codeboxtext.indexOf(splash);

    if (indexOfStr !== -1) 
    {
        var substring = codeboxtext.substring(indexOfStr, codeboxtext.length);
        substring = substring.substring(0, substring.indexOf('])'));
    }
    splash = substring.replaceAll("splash = bytearray([", '');
    drawHexImage(splash, "my_splash_canvas");
    splash_canvas_drawn = true;

    //oled overlay
    var overlay = get_variable_line("overlay = ");
    var codeboxtext2 = document.getElementById("new_codebox").value;
    var indexOfStr2 = codeboxtext2.indexOf(overlay);

    if (indexOfStr2 !== -1) 
    {
        var substring = codeboxtext2.substring(indexOfStr2, codeboxtext2.length);
        substring = substring.substring(0, substring.indexOf('])'));
    }

    overlay = substring.replaceAll("overlay = bytearray([", '');
    drawHexImage(overlay, 'my_overlay_canvas');
    overlay_canvas_drawn = true;

    //oled buttons
    remove_all_event_listeners();
    circles = [];
    var oled_buttons = get_variable_line("oled_buttons = [");
    oled_buttons = oled_buttons.replaceAll("oled_buttons = [", '');
    oled_buttons = oled_buttons.replaceAll("]", '');
    oled_buttons = oled_buttons.split(',');
    oled_buttons = oled_buttons.filter(item => item !== "");

    for(var i = 0; i < oled_buttons.length; i++)
    {
      var new_button = get_variable_line(oled_buttons[i]);
      new_button = new_button.replaceAll(oled_buttons[i], '');
      new_button = new_button.replaceAll(" = (", '');
      new_button = new_button.replaceAll(")", '');
      new_button = new_button.split(',');
      var x_pos = parseInt(new_button[0]);
      var y_pos = parseInt(new_button[1]);
      var btn_type = new_button[2];

      if(btn_type == "'is_lever'")
        var is_lever = true;
      else
        var is_lever = false;
    
      if(btn_type == "'is_key'")
        var is_key = true;
      else
        var is_key = false;

      var associated_btn = new_button[3];
      associated_btn = associated_btn.replaceAll("_MyButton", '');
      if(associated_btn == "None")
        associated_btn = "notSet";
      var size = parseInt(new_button[4]);
      var angle = new_button[5];
      if(angle != 'None')
        angle = parseInt(angle);
      else
        angle = 0;
      //console.log(new_button);
      oled_add_button(x_pos,y_pos,size,is_lever,is_key,associated_btn,angle);
      updateCanvas();
      //console.log(x_pos,y_pos,size,is_lever,is_key,associated_btn,angle);
    }

    //oled idle
    var oled_idle = parseInt(get_value("oled_idle = "));
    const oled_idle_select = document.getElementById("oled_idle");
    oled_idle_select.value = oled_idle;

    //oled layout
    var oled_layout = parseInt(get_value("oled_layout = "));
    const oled_layout_select = document.getElementById("oled_layout");
    oled_layout_select.value = oled_layout;

    //oled type
    var oled_type = parseInt(get_value("oled_type = "));
    const oled_type_select = document.getElementById("oled_type_select");
    oled_type_select.value = oled_type;

    //invert oled
    var invert_oled = get_value("invert_oled = ");
    const oled_invert_oled_checkbox = document.getElementById("oled_invert_oled");
    if(invert_oled == 'False')
        oled_invert_oled_checkbox.checked = false;
    else if(invert_oled == 'True')
        oled_invert_oled_checkbox.checked = true;

    //rotate oled
    var rotate_oled = get_value("rotate_oled = ");
    const oled_rotate_oled_checkbox = document.getElementById("oled_rotate_oled");
    if(rotate_oled == 'False')
        oled_rotate_oled_checkbox.checked = false;
    else if(rotate_oled == 'True')
        oled_rotate_oled_checkbox.checked = true;


    var sda = parseInt(get_value("oled_sda = "));
    var scl = parseInt(get_value("oled_scl = "));

    //i2c interface
    var i2c_interface = parseInt(get_value("i2c_interface = "));
    if(i2c_interface == 0)
    {
        document.getElementById("oled_i2c_rad1").checked = true;
        document.getElementById("oled_sda0_select").value = sda;
        document.getElementById("oled_scl0_select").value = scl;
    }
    else if(i2c_interface == 1)
    {
        document.getElementById("oled_i2c_rad2").checked = true;
        document.getElementById("oled_sda1_select").value = sda;
        document.getElementById("oled_scl1_select").value = scl;
    }

    //animation delay
    var animation_delay = parseInt(get_value("oled_animation_delay = "));
    document.getElementById("oled_animation_delay").value = animation_delay;
}

function drawHexImage(hexString, canvasname) 
{
    const width = 128;
    const height = 64;
    const canvas = document.getElementById(canvasname);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const hexArray = hexString.split(',').map(hex => parseInt(hex.trim(), 16));
    let dataIndex = 0;

    for (let i = 0; i < hexArray.length; i++) 
    {
        let byte = hexArray[i];
        for (let bit = 7; bit >= 0; bit--) 
            {
            const isPixelOn = (byte & (1 << bit)) !== 0;
            const color = isPixelOn ? 255 : 0; // Black or white

            // Set pixel data (RGBA)
            data[dataIndex] = color;      // Red
            data[dataIndex + 1] = color;  // Green
            data[dataIndex + 2] = color;  // Blue
            data[dataIndex + 3] = 255;    // Alpha
            dataIndex += 4;
        }
    }

    ctx.putImageData(imageData, 30, 40);
}

function get_names()
{
    files = document.getElementById("open_button").files;
    var arrow_buttons = document.getElementsByClassName("arrow");
    arrow_buttons[0].disabled = false;
    arrow_buttons[1].disabled = false;

    file_name_textbox.value = files[i].name;

    var codebox = document.getElementById("new_codebox");

    var p = files[0].text();
    p.then(value => {
        codebox.innerHTML = "";
        codebox.value = value;
      });

    //var filename = files[i].name;
    //var directory = files[i].webkitRelativePath;

    setTimeout(function(){
        get_code();
    }, 50);
    
}

function right_arrow()
{
    var codebox = document.getElementById("new_codebox");
    i += 1;
    if(i > files.length-1)
    {
        i = files.length-1;
        return;
    }
        

    file_name_textbox.value = files[i].name;

    var p = files[i].text();
    p.then(value => {
        codebox.value = value;
      });

      setTimeout(function(){
        get_code();
    }, 50);
}

function left_arrow()
{
    var codebox = document.getElementById("new_codebox");
    i -= 1;
    if(i < 0)
    {
        i = 0;
        return;
    }
        

    file_name_textbox.value = files[i].name;

    var p = files[i].text();
    p.then(value => {
        codebox.value = value;
      });

      setTimeout(function(){
        get_code();
    }, 50);
}