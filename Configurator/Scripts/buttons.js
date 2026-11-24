function add_button() {
  var name = document.getElementById("button_name").value;
  var table = document.getElementById("button_table");

  name = name.trim();
  name = name.replace(/\s/g, '');

  if (check_name(name) != true) {
    reset_all();
    showMessage(check_name(name), 'warning');
    return;
  }

  for (var i = 1, row; row = table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if (name == col_name[0]) {
      reset_all();
      showMessage('Name already exists', 'warning');
      return;
    }
  }

  Configurator.appendButton({
    name, positions: [0], color: "random", fade: false,
    pin: 0, fadeIn: 20, fadeOut: 7
  });
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
    showMessage(check_name(name), 'warning');
    return;
  }
  for (var i = 1, row; row = table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if (name == col_name[0]) {
      reset_all();
      showMessage('Name already exists', 'warning');
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

  combo_sprites_available_buttons = combo_sprites_available_buttons.map(value => value === old_name ? name : value);
  document.querySelectorAll(".combo-row").forEach(row => {
    row.selectedButtons = row.selectedButtons.map(value => value === old_name ? name : value);
  });
  updateAllComboDropdowns();
  updateAllChips();

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

function bindButtonOrder() {
  const table = document.getElementById("button_table");
  let drag = null;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const slides = new WeakMap();

  function move(row, target) {
    if (!target || target === row || target.rowIndex < 1) return false;
    const selected = table.rows[button_row_id];
    const after = row.rowIndex < target.rowIndex;
    const affected = Array.from(table.rows).slice(
      Math.min(row.rowIndex, target.rowIndex), Math.max(row.rowIndex, target.rowIndex) + 1);
    // Animate the cells so the rows keep stable hit targets during quick direction changes.
    const starts = affected.map(item => item.cells[0].getBoundingClientRect().top);
    target.parentNode.insertBefore(row, after ? target.nextSibling : target);
    affected.forEach((item, index) => {
      for (const cell of item.cells) slides.get(cell)?.cancel();
      const distance = starts[index] - item.getBoundingClientRect().top;
      if (reducedMotion.matches || !distance || !item.animate) return;
      for (const cell of item.cells) {
        slides.set(cell, cell.animate([
          {transform: "translateY(" + distance + "px)"}, {transform: "translateY(0)"}
        ], {duration: 160, easing: "cubic-bezier(.2,.75,.25,1)"}));
      }
    });
    button_row_id = selected ? selected.rowIndex : -1;
    return true;
  }

  table.addEventListener("pointerdown", event => {
    const grip = event.target.closest(".row-grip");
    if (!grip || drag || event.button !== 0) return;
    drag = {id: event.pointerId, row: grip.closest("tr"), moved: false};
    drag.row.classList.add("reordering");
    event.preventDefault();
  });
  document.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.id) return;
    const bounds = table.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right) return;
    const target = Array.from(table.rows).find(row => {
      const rect = row.getBoundingClientRect();
      return event.clientY >= rect.top && event.clientY < rect.bottom;
    });
    if (move(drag.row, target)) drag.moved = true;
  });
  function finishDrag(event) {
    if (!drag || (event.pointerId != null && event.pointerId !== drag.id)) return;
    drag.row.classList.remove("reordering");
    if (drag.moved) generate_code();
    drag = null;
  }
  document.addEventListener("pointerup", finishDrag);
  document.addEventListener("pointercancel", finishDrag);
  window.addEventListener("blur", finishDrag);
  table.addEventListener("keydown", event => {
    if (!event.target.matches(".row-grip") || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const row = event.target.closest("tr");
    if (move(row, table.rows[row.rowIndex + (event.key === "ArrowUp" ? -1 : 1)])) {
      row.querySelector(".row-grip").focus();
      generate_code();
    }
  });
}
