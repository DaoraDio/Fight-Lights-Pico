function pythonArrayStringSubtractOne(inputString) //subtracts 1 from a python tuble as a string
{
  var numbersArray = inputString.replace(/[()]/g, "").split(",");
  var modifiedNumbers = numbersArray
    .filter(function(number) {
      return number !== ""; 
    })
    .map(function(number) {
      return parseInt(number) - 1;
    });

  var resultString = "(" + modifiedNumbers.join(",") + (modifiedNumbers.length > 0 ? ',' : '') + ")";
  return resultString
}

function set_code()
{
  var version = "V2.5.2"
  var failsave = "if __name__ == '__main__':\n    import init\n    with open('main.py', 'r') as f:\n        init.code = f.read()\n    exec(init.code)\n\n";
  var header = "print(\"\\033[32mconfig\\033[0m\")\n\#Fight Lights Pico " + version +"\n\nfrom machine import Pin\nfrom init import random, rainbow, smooth, notSet\nimport button\nimport functions\nimport init\n\n";

  //profile name
  var profile_name = document.getElementById("profile_name").value;
  var profile_name2 = 'profile_name = "'+profile_name+'"';

  //colors
  var colors = "";
  var colors_arr = "colors = [";
  var table = document.getElementById("color_table");
  for (var i = 1, row; row = table.rows[i]; i++) 
  {
      var col = row.innerText;
      col = col.split("\t");
      colors += col[0] + ' = (' + col[1] + ',' + col[2] + ',' + col[3] + ')\n';

      if(col[0] != 'blank')
          colors_arr += col[0] + ",";
      
      
  }
  colors_arr = colors_arr.slice(0,-1);
  colors_arr += "]\n";
  if(colors_arr == "colors = ]\n")
      colors_arr = "colors = [blank]\n";

  //ledcount
  var led_count = document.getElementById("led_count").value;
  var led_count2 = "led_count = " + led_count;

  //pin_num
  var pin_num = document.getElementById("pin_num").value;
  var pin_num2 = "PIN_NUM = " + pin_num;

  //leniency
  var leniency = document.getElementById("leniency_tb").value;
  if(document.getElementById("leniency_cb").checked == true)
  {
      leniency = 0;
  }
  var leniency2 = "leniency = " + leniency;

  //brightness
  var brightness = document.getElementById("brightness").textContent;
  brightness /= 100;
  var brightness2 = "brightness_mod = " + brightness;

  //brightness steps
  var brightness_steps = document.getElementById("brightness_steps").value;
  if(brightness_steps != "smooth")
  {
    brightness_steps = 1 / brightness_steps;
    var brightness_steps2 = "brightness_steps = " + brightness_steps;
  }
  else
    var brightness_steps2 = "brightness_steps = smooth"


  //idle mode
  var idle_mode = document.getElementById("idle_select").value;
  if(document.getElementById("idle_cb").checked == true)
  {
      idle_mode = 0;
  }
  var idle_mode2 = "idle_mode = " + idle_mode;

  //idle timer
  var idle_after = document.getElementById("idle_tb").value;
  var idle_after2 = "idle_after = " + idle_after;

  //save_stats
  var stats;
  if(document.getElementById("stats_cb").checked)
      stats = "True";
  else
      stats = "False";
  var stats2 = "save_stats = " + stats;

  //profile color
  var profile_color = "profile_color = (" + hexTorgb(document.getElementById("profile_color").value) + ")";

  //fade
  var fade_in = document.getElementById("fade_in").value;
  var fade_in2 = "fadein_speed = " + fade_in;

  var fade_out = document.getElementById("fade_out").value;
  var fade_out2 = "fadeout_speed = " + fade_out;

  //buttons
  var table = document.getElementById("button_table");
  var buttons = ""
  var button_list = 'button_list = [';

  for (var i = 1, row; row = table.rows[i]; i++) 
  {
    var gpio_pin = row.cells[4].childNodes[1].value;
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    button_list += col_name[0] + '_MyButton,';
    buttons += col_name[0] + "_MyButton" + ' = button.MyButton(' + gpio_pin + ", '" + col_name[0] + "', functions.clear_led)\n";
  }

  button_list = button_list.slice(0,-1);
  if(button_list == "button_list = ")
    button_list = "button_list = ["
  button_list += "]\ninit.button_list_length = len(button_list)\n\n";

  //button colors
  var button_colors = "";
  for (var i = 1, row; row = table.rows[i]; i++) 
  {
    var fade = row.cells[3].childNodes[0].checked;
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    var leds = col_name[1].replace(/[ ,]+/g, ",");
    var brightness = parseInt(col_name[5]) / 100;
    var fadein = parseFloat(col_name[6]);
    var fadeout = parseFloat(col_name[7]);
    
    leds += ",";
    if(leds == "Not,Set,")
      leds = "0,";
    if(fade)
      var fade2 = "True";
    else
      var fade2 = "False";
    button_colors += col_name[0] + "_MyButton" + ".set_config((" + leds + "), "+col_name[2] + ", " + fade2 + ", " + brightness + ", " + fadein + ", " + fadeout + ")\n";
  }

  //clear bg
  if(document.getElementById("clear_bg_on_press").checked)
    var clear_bg = "clear_background_on_press = True"
  else
    var clear_bg = "clear_background_on_press = False"

  //background colors
  var background_color = "background = ("
  var background_table = document.getElementById("background_table");
  var bg_value = "";

  for (var i = 1, row; row = background_table.rows[i]; i++) 
  {
    var brightness_val = row.cells[2].innerHTML;
    brightness_val = brightness_val.slice(0,-1);

    var int_val = parseInt(brightness_val) / 100;

    bg_value += '(' + int_val + ',' +  background_table.rows[i].cells[1].innerHTML + ',' + background_table.rows[i].cells[0].innerHTML + '),';
     //var bg_value = ""; //table.rows[i].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';
  }
  bg_value = bg_value.slice(0,-1);
  background_color += bg_value + ')';

  //idle mode1 speed
  var idle_mode1_speed = document.getElementById("idle1_speed").value;
  var idle_mode1_speed2 = "idle_mode1_speed = " + idle_mode1_speed;

  //idle mode1 color
  //idle_mode1_colors = colors
  var idle_mode1_colors; 
  if(document.getElementById("circle_checkbox").checked)
    idle_mode1_colors = "idle_mode1_colors = colors";
  else
  {
    var idle1_table = document.getElementById("circle_table");
    idle_mode1_colors = "idle_mode1_colors = [";
    for (var i = 1, row; row = idle1_table.rows[i]; i++) 
    {
        var col = row.innerText;
        col = col.trim();
        idle_mode1_colors += col + ',';
    }
    idle_mode1_colors = idle_mode1_colors.slice(0,-1);
    idle_mode1_colors += "]";

    if(idle_mode1_colors == "idle_mode1_colors = ]")
      idle_mode1_colors = "idle_mode1_colors = []"
  }

  //led_options
  var led_options = "ledOptions_led_buttons = [";
  var led_options_table = document.getElementById("led_options_table");
  for (var i = 1, row; row = led_options_table.rows[i]; i++) 
  {
      var col = row.innerText;
      col = col.trim();
      led_options += col + '_MyButton' + ',';
  }
  led_options = led_options.slice(0,-1);
  led_options += "]";
  if(led_options == "ledOptions_led_buttons = ]")
    led_options = "ledOptions_led_buttons = []";

  
  var led_options_start = "ledOptions_start_time = " + document.getElementById("led_options_start_time").value;

  var led_options_inc_brightness = "ledOptions_increase_brightness = [" + document.getElementById("led_options_inc_brightness").value + '_MyButton]'; 
  if(led_options_inc_brightness == "ledOptions_increase_brightness = [_MyButton]")
    led_options_inc_brightness = "ledOptions_increase_brightness = []"

  var led_options_dec_brightness = "ledOptions_decrease_brightness = [" + document.getElementById("led_options_dec_brightness").value + '_MyButton]'; 
  if(led_options_dec_brightness == "ledOptions_decrease_brightness = [_MyButton]")
    led_options_dec_brightness = "ledOptions_decrease_brightness = []"

  var led_options_left = "ledOptions_left_button = [" + document.getElementById("led_options_left").value + '_MyButton]'; 
  if(led_options_left == "ledOptions_left_button = [_MyButton]")
    led_options_left = "ledOptions_left_button = []"

  var led_options_right = "ledOptions_right_button = [" + document.getElementById("led_options_right").value + '_MyButton]'; 
  if(led_options_right == "ledOptions_right_button = [_MyButton]")
    led_options_right = "ledOptions_right_button = []"

  var led_options_confirm = "ledOptions_confirm = [" + document.getElementById("led_options_confirm").value + '_MyButton]'; 
  if(led_options_confirm == "ledOptions_confirm = [_MyButton]")
    led_options_confirm = "ledOptions_confirm = []"
 

  var rainbow_speed = "rainbow_speed = " + document.getElementById("rainbow_speed").value;

  var activate_playerled = document.getElementById("playerled_cb");
  if(activate_playerled.checked)
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
  for (var i = 1, row; row = OnOff_table.rows[i]; i++) 
  {
      var col = row.innerText;
      col = col.trim();
      OnOff_button += col + '_MyButton' + ',';
  }
  OnOff_button = OnOff_button.slice(0,-1);
  OnOff_button += "]";
  if(OnOff_button == "OnOff_button = ]")
    OnOff_button = "OnOff_button = []";

  //ledOptions_color
  var ledOptions_color = "ledOptions_color = (" + hexTorgb(document.getElementById("led_options_color").value) + ")";


  //ledOptions_profile_color_use_all_LEDs 
  if(document.getElementById("led_options_color_cb").checked)
    var led_options_color_cb = "ledOptions_profile_color_use_all_LEDs = True"
  else
    var led_options_color_cb = "ledOptions_profile_color_use_all_LEDs = False"

  //onboard LED
  if(document.getElementById("onboard_LED").checked)
    var onboard_led_on  = "onboard_led_on = True"
  else
    var onboard_led_on  = "onboard_led_on = False"

  //dynamic profile next
  var dynamic_profile_next = "next_config = [";
  var dynamic_profile_next_table = document.getElementById("dynamic_profile_table_next");
  for (var i = 1, row; row = dynamic_profile_next_table.rows[i]; i++) 
  {
      var col = row.innerText;
      col = col.trim();
      dynamic_profile_next += col + '_MyButton' + ',';
  }
  dynamic_profile_next = dynamic_profile_next.slice(0,-1);
  dynamic_profile_next += "]";
  if(dynamic_profile_next == "next_config = ]")
    dynamic_profile_next = "next_config = []";

  //dynamic profile prev
  var dynamic_profile_prev = "prev_config = [";
  var dynamic_profile_prev_table = document.getElementById("dynamic_profile_table_prev");
  for (var i = 1, row; row = dynamic_profile_prev_table.rows[i]; i++) 
  {
      var col = row.innerText;
      col = col.trim();
      dynamic_profile_prev += col + '_MyButton' + ',';
  }
  dynamic_profile_prev = dynamic_profile_prev.slice(0,-1);
  dynamic_profile_prev += "]";
  if(dynamic_profile_prev == "prev_config = ]")
    dynamic_profile_prev = "prev_config = []";


  //smooth slider
  var smooth_speed = document.getElementById("smooth_speed").value;
  smooth_speed = "smooth_brightness_speed = " + smooth_speed;

  //LED Exclude
  var modal_body = document.getElementById("idle_exlude_modal_body");
  var checkedCheckboxIds = [];
  
  if (modal_body) 
  {
    var checkboxes = modal_body.querySelectorAll('.idle_modal_led_cb');
  
    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        var checkboxId = checkbox.closest('span').id;
        checkedCheckboxIds.push(checkboxId);
      }
    });

    var modifiedArray = checkedCheckboxIds.map(function (element) {
      var stringWithoutPrefix = element.replace('led_num', '');

      return (parseInt(stringWithoutPrefix, 10)-1);
    });
  }

  skip_leds_in_idle = "skip_leds_in_idle = [";
  for(i = 0; i < modifiedArray.length;i++)
    skip_leds_in_idle += modifiedArray[i] + ",";
  skip_leds_in_idle += "]"

  idlemode_leds = "idlemode_leds = functions.remove_idle_skips()";

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
  if(up_positions == "(not,Set)")
    up_positions= "(-1,)";
  else
    up_positions = pythonArrayStringSubtractOne(up_positions);
  var up_color = arrow_up.getAttribute("directioncolor");
  var eightway_select_up_button = document.getElementById("eightway_select-up").options[document.getElementById("eightway_select-up").selectedIndex].text + "_MyButton";
  if(eightway_select_up_button == "Set UP Button_MyButton")
    eightway_select_up_button = "notSet";
  var eight_way_up = "eight_way_up = [" + up_positions + ","+ up_color + ","+ eightway_select_up_button + "]";

  var down_positions = "(" + arrow_down.getAttribute("led_pos")+")";
  down_positions = down_positions.replaceAll(' ',',');
  if(down_positions == "(not,Set)")
    down_positions= "(-1,)";
  else
    down_positions = pythonArrayStringSubtractOne(down_positions);
  var down_color = arrow_down.getAttribute("directioncolor");
  var eightway_select_down_button = document.getElementById("eightway_select-down").options[document.getElementById("eightway_select-down").selectedIndex].text + "_MyButton";
  if(eightway_select_down_button == "Set DOWN Button_MyButton")
      eightway_select_down_button = "notSet";
  var eight_way_down = "eight_way_down = [" + down_positions + ","+ down_color + ","+ eightway_select_down_button + "]";
  
  var left_positions = "(" + arrow_left.getAttribute("led_pos")+")";
  left_positions = left_positions.replaceAll(' ',',');
  if(left_positions == "(not,Set)")
    left_positions= "(-1,)";
  else
    left_positions = pythonArrayStringSubtractOne(left_positions);
  var left_color = arrow_left.getAttribute("directioncolor");
  var eightway_select_left_button = document.getElementById("eightway_select-left").options[document.getElementById("eightway_select-left").selectedIndex].text + "_MyButton";
  if(eightway_select_left_button == "Set LEFT Button_MyButton")
      eightway_select_left_button = "notSet";
  var eight_way_left = "eight_way_left = [" + left_positions + ","+ left_color + ","+ eightway_select_left_button + "]";

  var right_positions = "(" + arrow_right.getAttribute("led_pos")+")";
  right_positions = right_positions.replaceAll(' ',',');
  if(right_positions == "(not,Set)")
    right_positions= "(-1,)";
  else
    right_positions = pythonArrayStringSubtractOne(right_positions);
  var right_color = arrow_right.getAttribute("directioncolor");
  var eightway_select_right_button = document.getElementById("eightway_select-right").options[document.getElementById("eightway_select-right").selectedIndex].text + "_MyButton";
  if(eightway_select_right_button == "Set RIGHT Button_MyButton")
      eightway_select_right_button = "notSet";
  var eight_way_right = "eight_way_right = [" + right_positions + ","+ right_color + ","+ eightway_select_right_button + "]";
  

  var up_left_positions = "(" + arrow_up_left.getAttribute("led_pos")+")";
  up_left_positions = up_left_positions.replaceAll(' ',',');
  if(up_left_positions == "(not,Set)")
    up_left_positions= "(-1,)";
  else
    up_left_positions = pythonArrayStringSubtractOne(up_left_positions);
  var up_left_color = arrow_up_left.getAttribute("directioncolor");
  var eight_way_up_left = "eight_way_upleft = [" + up_left_positions + ","+ up_left_color + "]";

  var up_right_positions = "(" + arrow_up_right.getAttribute("led_pos")+")";
  up_right_positions = up_right_positions.replaceAll(' ',',');
  if(up_right_positions == "(not,Set)")
    up_right_positions= "(-1,)";
  else
    up_right_positions = pythonArrayStringSubtractOne(up_right_positions);
  var up_right_color = arrow_up_right.getAttribute("directioncolor");
  var eight_way_up_right = "eight_way_upright = [" + up_right_positions + ","+ up_right_color + "]";

  var down_left_positions = "(" + arrow_down_left.getAttribute("led_pos")+")";
  down_left_positions = down_left_positions.replaceAll(' ',',');
  if(down_left_positions == "(not,Set)")
    down_left_positions= "(-1,)";
  else
    down_left_positions = pythonArrayStringSubtractOne(down_left_positions);
  var down_left_color = arrow_down_left.getAttribute("directioncolor");
  var eight_way_down_left = "eight_way_leftdown = [" + down_left_positions + ","+ down_left_color + "]";

  var down_right_positions = "(" + arrow_down_right.getAttribute("led_pos")+")";
  down_right_positions = down_right_positions.replaceAll(' ',',');
  if(down_right_positions == "(not,Set)")
    down_right_positions= "(-1,)";
  else
    down_right_positions = pythonArrayStringSubtractOne(down_right_positions);
  var down_right_color = arrow_down_right.getAttribute("directioncolor");
  var eight_way_down_right = "eight_way_rightdown = [" + down_right_positions + ","+ down_right_color + "]";

  

  //output
  document.getElementById("code_box").value = failsave + header 
                                              + colors + "\n"
                                              + colors_arr + "\n"
                                              + idle_mode1_colors + "\n"
                                              + idle_mode1_speed2 + "\n"
                                              + profile_name2 + "\n"
                                              + led_count2 + "\n" 
                                              + pin_num2 + "\n"
                                              + leniency2 + "\n"
                                              + brightness2 + "\n"
                                              + brightness_steps2 + "\n"
                                              + idle_mode2 + "\n"
                                              + idle_after2 + "\n"
                                              + stats2 + "\n"
                                              + "input_reset_time = 50\n"
                                              + profile_color + "\n"
                                              + clear_bg + "\n"
                                              + background_color + '\n'
                                              //+ fade_out2 + "\n"
                                              //+ fade_in2 + "\n"
                                              + buttons + '\n'
                                              + button_list + '\n'
                                              + button_colors + '\n'
                                              + ledOptions_color + '\n'
                                              + led_options_color_cb + '\n'
                                              + led_options + '\n'
                                              + led_options_start + '\n'
                                              + led_options_inc_brightness + '\n'
                                              + led_options_dec_brightness + '\n'
                                              + led_options_left + '\n'
                                              + led_options_right + '\n'
                                              + led_options_confirm + '\n'
                                              + OnOff_button + '\n'
                                              + rainbow_speed + '\n'
                                              + activate_playerled + '\n'
                                              + playerled_brightness + '\n'
                                              + playerled_pin_num + '\n'
                                              + player1_led + '\n'
                                              + player2_led + '\n'
                                              + player3_led + '\n'
                                              + player4_led + '\n'
                                              + dynamic_profile_next + '\n'
                                              + dynamic_profile_prev + '\n'
                                              + onboard_led_on + '\n'
                                              + smooth_speed + '\n'
                                              + eight_way_up + '\n'
                                              + eight_way_down + '\n'
                                              + eight_way_left + '\n'
                                              + eight_way_right + '\n'
                                              + eight_way_up_left + '\n'
                                              + eight_way_up_right + '\n'
                                              + eight_way_down_left + '\n'
                                              + eight_way_down_right + '\n'
                                              + skip_leds_in_idle + '\n'
                                              + idlemode_leds + '\n'
                                              + "############do not delete this line#######################";
}

setInterval(function()
{ 
  set_code();                                        
}, 100);

function copy_to_clipboard()
{
  var copyText = document.getElementById("code_box");

  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  navigator.clipboard.writeText(copyText.value);

  // Alert the copied text
  alert("Code saved to clipboard");
}

async function paste() {
  const text = await navigator.clipboard.readText();
  var input = document.getElementById("new_codebox");
  input.value = text;

  get_code();
}