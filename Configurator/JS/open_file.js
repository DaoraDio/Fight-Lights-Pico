var files;
var i = 0;
const file_name_textbox = document.getElementById("file_names");

//returns the line of code of str from the loaded file
function get_variable_line(str)
{
    var code = document.getElementById("new_codebox").value;

    var substring = code.substring(code.indexOf(str), code.length);
    substring = substring.substring(0,substring.indexOf('\n'));

    return substring;
}

function get_value(str)
{
    var string = get_variable_line(str);
    string = string.split(' ');
    return string[string.length-1]
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
    //console.log(color_list);

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
    console.log("brightness_mod:", brightness_mod);

    //get brightness_steps  
    var brightness_steps = get_value("brightness_steps = ");
    brightness_steps = 1/parseFloat(brightness_steps);
    document.getElementById("brightness_steps").value = brightness_steps;
    console.log(brightness_steps);

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
    console.log(save_stats);

    //get input_reset_time   
    var input_reset_time = get_value("input_reset_time = ");
    console.log(input_reset_time);

    //get profile_color   
    var profile_color = get_value("profile_color = ");
    profile_color = profile_color.substring(1);
    profile_color = profile_color.slice(0,-1);
    profile_color = profile_color.split(',');
    var hex_value = rgbToHex(parseInt(profile_color[0]),parseInt(profile_color[1]),parseInt(profile_color[2]))
    document.getElementById("profile_color").value = hex_value;
    console.log(hex_value);

    //get clear_background_on_press   
    var clear_background_on_press = get_value("clear_background_on_press = ");
    if(clear_background_on_press == "True")
        document.getElementById("clear_bg_on_press").checked = true;
    else
    document.getElementById("clear_bg_on_press").checked = false;
    console.log(clear_background_on_press);

    //set background table
    set_bg_table();
    //console.log("bg:", background);

    //get fadeout_speed   
    var fadeout_speed = get_value("fadeout_speed = ");
    document.getElementById("fade_out").value = fadeout_speed;
    console.log("fadeout:", fadeout_speed);

    //get fadein_speed   
    var fadein_speed = get_value("fadein_speed = ");
    document.getElementById("fade_in").value = fadein_speed;
    console.log("fadein:", fadein_speed);

    //get button_list   
    var button_list = get_value("button_list = ");
    button_list = button_list.substring(1);
    button_list = button_list.slice(0,-1);
    button_list = button_list.split(',');
    console.log("button_list:", button_list);

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
    
        var button_gpio = parseInt(button[0]);
    
        var button_conf = get_variable_line(button_list[i]+'.set_config(');
        button_conf = button_conf.replace(button_list[i]+'.set_config(', '');
        button_conf = button_conf.split(' ');
    
        var button_color = button_conf[1].slice(0,-1);
        var button_fade = button_conf[2].slice(0,-1);
        var button_leds = button_conf[0].replaceAll(',', ' ');
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

        cell1.innerHTML = button_name;
        cell2.innerHTML = button_leds2;
        cell3.innerHTML = button_color;
        cell4.innerHTML = fade;
        cell5.innerHTML = gpio_pins;
        
        var n_row = button_table.rows[i+1];
        if(button_fade == "True")
            n_row.cells[3].childNodes[0].checked = true;
        else
            n_row.cells[3].childNodes[0].checked = false;

        n_row.cells[4].childNodes[1].value = button_gpio;

        //console.log(gpio_pins);
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

        console.log(idle_mode1_colors);
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
    for(var i = 0; i < led_options_button.length; i++)
    {
        var row = led_options_table.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = led_options_button[i];
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
    //console.log(led_option_increase_brightness);

    
    //var idle1_config_button = document.getElementById("idle1_config");

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



