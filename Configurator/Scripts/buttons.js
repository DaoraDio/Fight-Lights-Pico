function add_button() {
  var name = document.getElementById("button_name").value;
  var table = document.getElementById("button_table");

  name = name.trim();
  name = name.replace(/\s/g, '');

  if (check_name(name) != true) {
    reset_all();
    showMessage(check_name(name), 'error');
    return;
  }

  for (var i = 1, row; row = table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if (name == col_name[0]) {
      reset_all();
      showMessage('Name already exists', 'error');
      return;
    }
  }

  var row = table.insertRow();

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  var cell6 = row.insertCell(5);
  var cell7 = row.insertCell(6);


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
                            <option value="29">GP29</option>\
                            <option value="30">GP30</option>\
                            <option value="31">GP31</option>\
                            <option value="32">GP32</option>\
                            <option value="33">GP33</option>\
                            <option value="34">GP34</option>\
                            <option value="35">GP35</option>\
                            <option value="36">GP36</option>\
                            <option value="37">GP37</option>\
                            <option value="38">GP38</option>\
                            <option value="39">GP39</option>\
                            <option value="40">GP40</option>\
                            <option value="41">GP41</option>\
                            <option value="42">GP42</option>\
                            <option value="43">GP43</option>\
                            <option value="44">GP44</option>\
                            <option value="45">GP45</option>\
                            <option value="46">GP46</option>\
                            <option value="47">GP47</option>\
                            <option value="48">GP48</option>\
                        </select></td> ';

  cell1.innerHTML = name;
  cell2.innerHTML = "Not Set";
  cell3.innerHTML = "random";
  cell4.innerHTML = fade;
  cell5.innerHTML = gpio_pins;
  cell6.innerHTML = 20;
  cell7.innerHTML = 7;


  //update_color_button_table();
  showMessage("Button: " + name + " has been added", 'success');
  reset_all();
  update_onoff_select();

  combo_sprites_available_buttons.push(name); //Add new button to combo sprite available buttons
  updateAllComboDropdowns();  //Update all combo sprite dropdowns
}

var button_row_id = -1;

function select_button_table() {
  var table = document.getElementById("button_table"), rIndex;
  var startindex = 1;

  for (var i = startindex; i < table.rows.length; i++) {
    table.rows[i].onclick = function () {
      document.getElementById("delete_button").disabled = false;
      document.getElementById("update_button").disabled = false;
      document.getElementById("color_select").disabled = false;
      document.getElementById("color_select").value = this.cells[2].innerHTML;
      document.getElementById("set_leds_button").disabled = false;
      document.getElementById("fade-controls").removeAttribute('disabled');
      document.getElementById("color_label").removeAttribute('disabled');
      for (var i = startindex; i < table.rows.length; i++) {
        var css = '#button_table tr:not(:first-child):hover';
        table.rows[i].style = css;
      }
      this.style.setProperty('background-color', 'var(--row-selected)');

      rIndex = this.rowIndex;
      button_row_id = rIndex;
      document.getElementById("button_name").value = this.cells[0].innerHTML;
      document.getElementById("fade_in").value = parseFloat(this.cells[5].innerHTML);
      document.getElementById("fade_out").value = parseFloat(this.cells[6].innerHTML);
    }
  }
}

function reset_all() {
  document.getElementById("button_name").value = "";
  document.getElementById("update_button").disabled = true;
  document.getElementById("delete_button").disabled = true;
  document.getElementById("color_select").value = "random";
  document.getElementById("color_select").disabled = true;
  document.getElementById("set_leds_button").disabled = true;
  document.getElementById("fade-controls").setAttribute('disabled', '');
  document.getElementById("color_label").setAttribute('disabled', '');

  var table = document.getElementById("button_table");
  for (var i = 1; i < table.rows.length; i++) {
    var css = '#button_table tr:not(:first-child):hover';
    table.rows[i].style = css;
  }
  button_row_id = -1;
}


function delete_button() {
  var button_name = document.getElementById("button_name").value;

  if (confirm("Do you really want to delete Button: " + button_name + "?")) {
    ;
  }
  else {
    return;
  }

  var led_options_table = document.getElementById("led_options_table");
  var OnOff_table = document.getElementById("on_off_table");
  var button_table = document.getElementById("button_table");
  var row_id = button_row_id;





  for (var i = 1, row; row = led_options_table.rows[i]; i++) {
    if (row.cells[0].innerHTML == button_name) {
      led_options_table.deleteRow(i);
      i--;
    }
  }


  for (var i = 1, row; row = OnOff_table.rows[i]; i++) {
    if (row.cells[0].innerHTML == button_name) {
      OnOff_table.deleteRow(i);
      i--;
    }
  }


  for (let i = 0; i < circles.length; i++) {
    if (circles[i].button_activation == button_name)
      circles[i].button_activation = "notSet";
  }

  button_table.deleteRow(row_id);
  reset_all();

  show_eightway_modal();
  //show_led_options(false); //open led_options function to update the selects
  show_led_options();
  removeComboButtonByName(button_name); //Remove button from combo sprite available buttons
  updateAllChips(); //Update all combo chips
  showMessage(button_name + ' Button deleted', 'success');
}

///////////////////////////////LED MODAL////////////////
function led_open_modal() {
  var modal = document.querySelector('#led_conf_modal');
  var modal_body = document.getElementById("modal_body");
  var button_table = document.getElementById("button_table");
  var headline = document.getElementById("modal_headline");

  var row_id = button_row_id;
  var button_name = button_table.rows[row_id].cells[0].innerHTML;
  headline.innerHTML = "Set " + button_name + " button LED positions";


  var table_led_positions = button_table.rows[row_id].cells[1].innerHTML;
  var led_num = document.getElementById("led_count").value;
  var body_string = "";


  table_led_positions = table_led_positions.trim().split(/\s+/) //led positions to in selected row to array

  var found = false;
  for (var i = 0; i < led_num; i++) {
    found = false;
    for (var j = 0; j < table_led_positions.length; j++) {
      if ((i + 1) == table_led_positions[j]) {
        body_string += '<label><input class="modal_led_cb" type="checkbox" checked>' + 'LED ' + (i + 1) + '</label>';
        found = true;
        break;
      }
    }
    if (!found)
      body_string += '<label><input class="modal_led_cb" type="checkbox">' + 'LED ' + (i + 1) + '</label>';

  }


  modal_body.innerHTML = body_string;
  modal.showModal();
}

function led_close_modal() {
  var modal = document.querySelector('#led_conf_modal');
  modal.close();
}

function led_save_modal() {
  var checked_leds = document.getElementsByClassName('modal_led_cb');
  var row_id = button_row_id;
  var button_table = document.getElementById("button_table");

  var led_pos = "";
  for (var i = 0; i < checked_leds.length; i++) {
    if (checked_leds[i].checked == true)
      led_pos += (i + 1) + ' ';
  }

  if (led_pos == "")
    led_pos = "Not Set";

  button_table.rows[row_id].cells[1].innerHTML = led_pos;


  led_close_modal();
}

function set_all() {
  var checked_leds = document.getElementsByClassName('modal_led_cb');
  for (var i = 0; i < checked_leds.length; i++) {
    checked_leds[i].checked = true;
  }
}

function unset_all() {
  var checked_leds = document.getElementsByClassName('modal_led_cb');
  for (var i = 0; i < checked_leds.length; i++) {
    checked_leds[i].checked = false;
  }
}

function update_button() {
  //update_color_select();
  var table = document.getElementById("button_table");
  var row_id = button_row_id;
  var name = document.getElementById("button_name").value;
  var old_name = table.rows[row_id].cells[0].innerHTML;

  name = name.trim();
  name = name.replace(/\s/g, '');

  old_name = old_name.trim();
  old_name = old_name.replace(/\s/g, '');


  if (check_name(name) != true) {
    reset_all();
    showMessage(check_name(name), 'error');
    return;
  }
  for (var i = 1, row; row = table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if (name == col_name[0]) {
      reset_all();
      showMessage('Name already exists', 'error');
      return;
    }
  }

  table.rows[row_id].cells[0].innerHTML = name;


  //update other tables/selects
  var led_options_table = document.getElementById("led_options_table");
  for (var i = 1, row; row = led_options_table.rows[i]; i++) {
    if (row.cells[0].innerHTML == old_name)
      row.cells[0].innerHTML = name;
  }


  var on_off_table = document.getElementById("on_off_table");
  for (var i = 1, row; row = on_off_table.rows[i]; i++) {
    if (row.cells[0].innerHTML == old_name)
      row.cells[0].innerHTML = name;
  }

  update_onoff_select();

  var led_options_inc_brightness = document.getElementById("led_options_inc_brightness");
  var led_options_dec_brightness = document.getElementById("led_options_dec_brightness");
  var led_options_left = document.getElementById("led_options_left");
  var led_options_right = document.getElementById("led_options_right");
  var led_options_confirm = document.getElementById("led_options_confirm");

  //safe the old values
  var led_options_inc_brightness_old = led_options_inc_brightness.value;
  var led_options_dec_brightness_old = led_options_dec_brightness.value;
  var led_options_left_old = led_options_left.value;
  var led_options_right_old = led_options_right.value;
  var led_options_confirm_old = led_options_confirm.value;
  show_led_options();

  if (led_options_inc_brightness_old == old_name)
    led_options_inc_brightness.value = name;
  if (led_options_dec_brightness_old == old_name)
    led_options_dec_brightness.value = name;
  if (led_options_left_old == old_name)
    led_options_left.value = name;
  if (led_options_right_old == old_name)
    led_options_right.value = name;
  if (led_options_confirm_old == old_name)
    led_options_confirm.value = name;


  var eightway_select_up_old = document.getElementById("eightway_select-up").value;
  var eightway_select_down_old = document.getElementById("eightway_select-down").value;
  var eightway_select_left_old = document.getElementById("eightway_select-left").value;
  var eightway_select_right_old = document.getElementById("eightway_select-right").value;

  show_eightway_modal();

  if (eightway_select_up_old == old_name)
    document.getElementById("eightway_select-up").value = name;
  if (eightway_select_down_old == old_name)
    document.getElementById("eightway_select-down").value = name;
  if (eightway_select_left_old == old_name)
    document.getElementById("eightway_select-left").value = name;
  if (eightway_select_right_old == old_name)
    document.getElementById("eightway_select-right").value = name;

  // update OLED Button Names
  for (let btn of circles) {
    if (btn.button_activation == old_name) {
      btn.button_activation = name;
    }
  }
  reset_all();
  showMessage('Name changed from: ' + old_name + ' to ' + name, 'success', 5000);
}


function update_color_select() {
  var table = document.getElementById("color_table");
  var color_select = document.getElementById("color_select");
  var selected_item = color_select.value;
  var select = '<select><option>random</option>';

  for (var i = 1, row; row = table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    select += '<option>' + col_name[0] + '</option>';
  }
  select += '</select>';

  color_select.innerHTML = select;
  color_select.value = selected_item;
}

function set_color_from_select() {
  var select_value = document.getElementById("color_select").value;
  var color_table = document.getElementById("color_table");
  var selected_row = button_row_id;
  var button_table = document.getElementById("button_table");


  button_table.rows[selected_row].cells[2].innerHTML = select_value;
}


function update_fadein() {
  var table = document.getElementById("button_table");
  var row_id = button_row_id;

  if (row_id == undefined)
    return;

  table.rows[row_id].cells[5].innerHTML = document.getElementById("fade_in").value;
}

function update_fadeout() {
  var table = document.getElementById("button_table");
  var row_id = button_row_id;

  if (row_id == undefined)
    return;

  table.rows[row_id].cells[6].innerHTML = document.getElementById("fade_out").value;
}

function set_fadein_for_all() {
  var table = document.getElementById("button_table");
  var fade_in_val = document.getElementById("fade_in").value;

  if (confirm("Do you want to set the Fadein speed to " + fade_in_val + " for all buttons?")) {
    ;
  }
  else {
    return;
  }

  for (var i = 1, row; row = table.rows[i]; i++) {
    table.rows[i].cells[5].innerHTML = fade_in_val;
  }
}

function set_fadeout_for_all() {
  var table = document.getElementById("button_table");
  var fade_out_val = document.getElementById("fade_out").value;
  if (confirm("Do you want to set the Fadeout speed to " + fade_out_val + " for all buttons?")) {
    ;
  }
  else {
    return;
  }

  for (var i = 1, row; row = table.rows[i]; i++) {
    table.rows[i].cells[6].innerHTML = fade_out_val;
  }
}