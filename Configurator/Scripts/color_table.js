var row_id = 0;
function select_color_table() {
  let table = document.getElementById("color_table");
  let startindex = 2;

  for (let i = startindex; i < table.rows.length; i++) {
    table.rows[i].onclick = function () {
      document.getElementById("delete_color").disabled = false;
      document.getElementById("update_color").disabled = false;
      for (let i = startindex; i < table.rows.length; i++) {
        let css = '#color_table tr:not(:nth-child(-n+2)):hover';
        table.rows[i].style = css;
      }
      this.style.setProperty('background-color', 'var(--row-selected)');

      row_id = this.rowIndex;
      document.getElementById("color_name").value = this.cells[0].innerHTML;
      const bgColor = getComputedStyle(this.cells[1]).backgroundColor;

      document.getElementById("color_adder").value = bgColor;
      document.getElementById("color_adder").dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}


//checks if the parameter name is duplicate in the color table
//the optional argument skip_row determines which row of the color table skipts the check
function check_colortable_duplicate(name, skip_row = 0) {
  var table = document.getElementById("color_table");

  for (var i = 1, row; row = table.rows[i]; i++) {
    if (skip_row > 0 && i === skip_row)
      continue;
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if (name == col_name[0]) {
      return "Name already exists";
    }
  }
  return false;
}

function getRGB(rgbString) {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

function addColor() {
  let col = document.getElementById("color_adder").value;
  //const [r, g, b] = getRGB(col);


  var name = document.getElementById("color_name").value;
  name = name.trim();
  name = name.replace(/\s/g, '');


  if (check_name(name) != true) {
    reset();
    showMessage(check_name(name), 'warning');
    return;
  }

  if (check_colortable_duplicate(name) != false) {
    reset();
    showMessage(check_colortable_duplicate(name), 'warning');
    return;
  }

  var table = document.getElementById("color_table");

  var row = table.insertRow();

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);


  cell1.innerHTML = name;
  cell2.style.backgroundColor = col;
  showMessage('Color ' + name + ' has been added', 'success');

  reset();
  update_color_select();
  generate_code();
  update_player_LED_select();
  update_bg_color_select();
  update_bg_table_colors();
}

function reset() {
  document.getElementById("color_adder").value = "rgb(255, 0, 0)";
  document.getElementById("color_adder").dispatchEvent(new Event('input', { bubbles: true }));

  document.getElementById("color_name").value = "";
  document.getElementById("update_color").disabled = true;

  document.getElementById("delete_color").disabled = true;

  var table = document.getElementById("color_table");
  for (var i = 2; i < table.rows.length; i++) {
    var css = '#color_table tr:not(:nth-child(-n+2)):hover';
    table.rows[i].style = css;
  }
}

function update_color() {
  var table = document.getElementById("color_table");
  //var row_id = parseInt(document.getElementById("row_id").innerHTML);
  var name = document.getElementById("color_name").value;
  var old_name = table.rows[row_id].cells[0].innerHTML;

  name = name.trim();
  name = name.replace(/\s/g, '');

  if (check_name(name) != true) {
    //document.getElementById("color_info").innerHTML = check_name(name);
    reset();
    showMessage(check_name(name), 'warning');
    return;
  }
  if (check_colortable_duplicate(name, row_id) != false) {
    reset();
    showMessage(check_colortable_duplicate(name), 'warning');
    return;
  }


  table.rows[row_id].cells[0].innerHTML = name;
  table.rows[row_id].cells[1].style.backgroundColor = document.getElementById("color_adder").value;


  //////////////////////update colors of other tables//////////////////


  var color_select = document.getElementById("color_select");
  if (color_select.value == old_name) {
    update_color_select();
    color_select.value = name;
  }

  var button_table = document.getElementById("button_table");
  for (var i = 1, row; row = button_table.rows[i]; i++) {
    if (row.cells[2].innerHTML == old_name)
      row.cells[2].innerHTML = name;
  }

  var background_table = document.getElementById("background_table");
  for (var i = 1, row; row = background_table.rows[i]; i++) {
    if (row.cells[1].innerHTML == old_name)
      row.cells[1].innerHTML = name;
  }


  var player1 = document.getElementById("player_led1");
  var player2 = document.getElementById("player_led2");
  var player3 = document.getElementById("player_led3");
  var player4 = document.getElementById("player_led4");

  var colorCell = table.rows[row_id].cells[1];
  const computedStyle = getComputedStyle(colorCell);
  const bgColor = computedStyle.backgroundColor;
  const rgbValues = bgColor.match(/\d+/g);


  var r = rgbValues[0];
  var g = rgbValues[1];
  var b = rgbValues[2];



  if (player1.getAttribute('colorname') == old_name) {
    player1.setAttribute('colorname', name);
    player1.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
  }

  if (player2.getAttribute('colorname') == old_name) {
    player2.setAttribute('colorname', name);
    player2.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
  }

  if (player3.getAttribute('colorname') == old_name) {
    player3.setAttribute('colorname', name);
    player3.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
  }

  if (player4.getAttribute('colorname') == old_name) {
    player4.setAttribute('colorname', name);
    player4.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
  }

  var circle_table = document.getElementById("circle_table");
  for (var i = 1, row; row = circle_table.rows[i]; i++) {
    if (row.cells[0].innerHTML == old_name)
      row.cells[0].innerHTML = name;
  }


  var arrowElements = document.querySelectorAll('.arrow');
  arrowElements.forEach(function (element) {
    if (element.getAttribute('directioncolor') == old_name)
      element.setAttribute('directioncolor', name);
  });

  reset();
  generate_code();
  update_player_LED_select();
  update_bg_color_select();
  show_eightway_modal();
  update_bg_table_colors();
}

function delete_color() {

  var button_uses_color = false;
  var background_uses_color = false;
  var playerled_uses_color = false;
  var eightway_uses_color = false;
  var button_table = document.getElementById("button_table");

  var name = document.getElementById("color_name");
  var bg_table = document.getElementById("background_table");


  for (var i = 1, row; row = button_table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if (row.cells[2].innerHTML == name.value) {
      button_uses_color = true;
      break;
    }
  }

  for (var i = 1, row; row = bg_table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if (row.cells[1].innerHTML == name.value) {
      background_uses_color = true;
      break;
    }
  }

  var p1_col = document.getElementById("player_led1").getAttribute("colorname");
  var p2_col = document.getElementById("player_led2").getAttribute("colorname");
  var p3_col = document.getElementById("player_led3").getAttribute("colorname");
  var p4_col = document.getElementById("player_led4").getAttribute("colorname");


  var arrow_up = document.getElementsByClassName("arrow arrow-up")[0];
  var arrow_down = document.getElementsByClassName("arrow arrow-down")[0];
  var arrow_left = document.getElementsByClassName("arrow arrow-left")[0];
  var arrow_right = document.getElementsByClassName("arrow arrow-right")[0];
  var arrow_up_left = document.getElementsByClassName("arrow arrow-up-left")[0];
  var arrow_up_right = document.getElementsByClassName("arrow arrow-up-right")[0];
  var arrow_down_left = document.getElementsByClassName("arrow arrow-down-left")[0];
  var arrow_down_right = document.getElementsByClassName("arrow arrow-down-right")[0];

  if (arrow_up.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_up.setAttribute("directioncolor", "blank");
  }
  if (arrow_down.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_down.setAttribute("directioncolor", "blank");
  }
  if (arrow_left.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_left.setAttribute("directioncolor", "blank");
  }
  if (arrow_right.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_right.setAttribute("directioncolor", "blank");
  }
  if (arrow_up_left.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_up_left.setAttribute("directioncolor", "blank");
  }
  if (arrow_up_right.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_up_right.setAttribute("directioncolor", "blank");
  }
  if (arrow_down_left.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_down_left.setAttribute("directioncolor", "blank");
  }
  if (arrow_down_right.getAttribute("directioncolor") === name.value) {
    eightway_uses_color = true;
    arrow_down_right.setAttribute("directioncolor", "blank");
  }


  if (name.value == p1_col || name.value == p2_col || name.value == p3_col || name.value == p4_col) {
    playerled_uses_color = true;
  }


  if (background_uses_color || button_uses_color || playerled_uses_color || eightway_uses_color) {
    if (confirm("This color is used as button, default or playerLED color, do you still want to delete it? Colors will be set to blank")) {
      ;
    }
    else {
      return;
    }
  }


  if (name.value == p1_col) {
    document.getElementById("player_led1").style.backgroundColor = "black";
    document.getElementById("player_led1").setAttribute("colorname", "blank");
  }
  if (name.value == p2_col) {
    document.getElementById("player_led2").style.backgroundColor = "black";
    document.getElementById("player_led2").setAttribute("colorname", "blank");
  }
  if (name.value == p3_col) {
    document.getElementById("player_led3").style.backgroundColor = "black";
    document.getElementById("player_led3").setAttribute("colorname", "blank");
  }
  if (name.value == p4_col) {
    document.getElementById("player_led4").style.backgroundColor = "black";
    document.getElementById("player_led4").setAttribute("colorname", "blank");
  }





  var col_select = document.getElementById("color_select");
  if (col_select.value === name.value)
    col_select.value = "blank";



  for (var i = 1, row; row = button_table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if (row.cells[2].innerHTML == name.value) {
      row.cells[2].innerHTML = "blank";
    }
  }


  for (var i = 1, row; row = bg_table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if (row.cells[1].innerHTML == name.value) {
      row.cells[1].innerHTML = "blank";
    }
  }

  var circle_table = document.getElementById("circle_table");
  for (var i = 1, row; row = circle_table.rows[i]; i++) {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if (row.cells[0].innerHTML == name.value) {
      document.getElementById("circle_table").deleteRow(i);
    }
  }


  document.getElementById("color_table").deleteRow(row_id);
  reset();
  update_color_select();
  generate_code();
  update_player_LED_select();
  update_bg_color_select();
  show_eightway_modal();
  update_bg_table_colors();
}