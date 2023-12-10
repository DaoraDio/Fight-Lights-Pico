function save_code(filename, type) 
{
    var data = document.getElementById("code_box").value;
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

var color;
function update_color_button_table()
{
    //save selected
    var selected_arr = [];
    var but_table = document.getElementById("button_table");
    for (var i = 1, row; row = but_table.rows[i]; i++) {
        for (var j = 0, col; col = row.cells[j]; j++) {
          if(j == 2)
          {
            var select = col.children[0];
            selected_arr.push(select.options[select.selectedIndex].text);

          }
        }  
     }
    

    //fill color array with colors of color_table
    var color_arr = ['random']
    var color_table = document.getElementById("color_table");
  
    for (var i = 1, row; row = color_table.rows[i]; i++) 
    {
      var col_name = row.innerText;
      col_name = col_name.split("\t");
      color_arr.push(col_name[0]);
      
   }

   color = '<select name="color_select" id="color_select">';
   for(var i = 0; i < color_arr.length; i++)
   {
     color += "<option>" + color_arr[i] + "</option>";
   }
   color+= '</select>';

   //update column
   for (var i = 1, row; row = table.rows[i]; i++) {
    for (var j = 0, col; col = row.cells[j]; j++) {
      if(j == 2)
      {
        continue;
      }
    }  
 }
}

function select_button_table()
{   
  var table = document.getElementById("button_table"),rIndex;
  var startindex = 1;

  for(var i = startindex; i < table.rows.length; i++)
  {
    table.rows[i].onclick = function()
    {
      document.getElementById("delete_button").style.color = "red";
      document.getElementById("delete_button").disabled = false;
      document.getElementById("update_button").disabled = false;
      document.getElementById("color_select").disabled = false;
      document.getElementById("color_select").value = this.cells[2].innerHTML;
      document.getElementById("set_leds_button").disabled = false;
        for(var i = startindex; i < table.rows.length; i++)
          {
            var css = '#button_table tr:not(:first-child):hover';
            table.rows[i].style = css;
          }
        this.style.backgroundColor = "#ddd";

        rIndex = this.rowIndex;
        document.getElementById("button_row_id").innerHTML = rIndex;
        document.getElementById("button_name").value = this.cells[0].innerHTML;
        document.getElementById("button_brightness").value = parseInt(this.cells[5].innerHTML);
        document.getElementById("brightness_label").innerText = "Brightness: " + this.cells[5].innerHTML;
        document.getElementById("fade_in").value = parseFloat(this.cells[6].innerHTML);
        document.getElementById("fade_out").value = parseFloat(this.cells[7].innerHTML);
    }
  }
}

function reset_all()
{
  document.getElementById("button_name").value = "";
  document.getElementById("update_button").disabled = true;
  
  document.getElementById("delete_button").style.color = "rgb(182, 182, 182)";
  document.getElementById("delete_button").disabled = true;

  document.getElementById("color_select").value = "random";
  document.getElementById("button_error_message").innerHTML = "";

  document.getElementById("color_select").disabled = true;

  document.getElementById("set_leds_button").disabled = true;

  var table = document.getElementById("button_table"),rIndex;
  for(var i = 1; i < table.rows.length; i++)
  {
      var css = '#button_table tr:not(:first-child):hover';
      table.rows[i].style = css;
  }
  document.getElementById("button_row_id").innerHTML = "-1";

  //update_color_button_table();
  //document.getElementById("add_color_button").style.display="none";
}

function delete_button()
{
  var button_name = document.getElementById("button_name").value;

  if (confirm("Do you really want to delete Button: " + button_name + "?")) 
  {
    ;
  } 
  else 
  {
    return;
  }

  var led_options_table = document.getElementById("led_options_table");
  var OnOff_table = document.getElementById("on_off_table");
  var button_table = document.getElementById("button_table");
  var dynamic_table_next = document.getElementById("dynamic_profile_table_next");
  var dynamic_table_prev = document.getElementById("dynamic_profile_table_prev");
  var row_id = parseInt(document.getElementById("button_row_id").innerHTML);
  
  

  

  for (var i = 1, row; row = led_options_table.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == button_name)
    {
      led_options_table.deleteRow(i);
      i--;
    }
  }  


  for (var i = 1, row; row = OnOff_table.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == button_name)
    {
      OnOff_table.deleteRow(i);
      i--;
    }
  }  

  for (var i = 1, row; row = dynamic_table_next.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == button_name)
    {
      dynamic_table_next.deleteRow(i);
      i--;
    }
  }  

  for (var i = 1, row; row = dynamic_table_prev.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == button_name)
    {
      dynamic_table_prev.deleteRow(i);
      i--;
    }
  } 



  button_table.deleteRow(row_id);
  reset_all();
  show_eightway_modal(false);
  show_led_options(false); //open led_options function to update the selects 

}

function update_button()
{
  update_color_select();
  var table = document.getElementById("button_table");
  var row_id = parseInt(document.getElementById("button_row_id").innerHTML);
  var name = document.getElementById("button_name").value;
  var error = document.getElementById("button_error_message");
  var old_name = table.rows[row_id].cells[0].innerHTML;

  name = name.trim();
  name = name.replace(/\s/g, '');

  old_name = old_name.trim();
  old_name = old_name.replace(/\s/g, '');


  if(check_name(name) != true)
  {
     reset_all();
     //error.innerHTML = check_name(name);
     alert(check_name(name));
     return;
  }
  for (var i = 1, row; row = table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if(name == col_name[0])
    {
      reset_all();
      alert("Name already exists");
      return;
    }
  }

  table.rows[row_id].cells[0].innerHTML = name;

  //update other tables/selects
  var led_options_table = document.getElementById("led_options_table");
  for (var i = 1, row; row = led_options_table.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == old_name)
      row.cells[0].innerHTML = name;
  } 

  var dynamic_profile_table_prev = document.getElementById("dynamic_profile_table_prev");
  for (var i = 1, row; row = dynamic_profile_table_prev.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == old_name)
      row.cells[0].innerHTML = name;
  } 

  var dynamic_profile_table_next = document.getElementById("dynamic_profile_table_next");
  for (var i = 1, row; row = dynamic_profile_table_next.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == old_name)
      row.cells[0].innerHTML = name;
  } 

  var on_off_table = document.getElementById("on_off_table");
  for (var i = 1, row; row = on_off_table.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == old_name)
      row.cells[0].innerHTML = name;
  } 


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
  show_led_options(false);

  if(led_options_inc_brightness_old == old_name)
    led_options_inc_brightness.value = name;
  if(led_options_dec_brightness_old == old_name)
    led_options_dec_brightness.value = name;
  if(led_options_left_old == old_name)
    led_options_left.value = name;
  if(led_options_right_old == old_name)
    led_options_right.value = name;
  if(led_options_confirm_old == old_name)
    led_options_confirm.value = name;


  var eightway_select_up_old = document.getElementById("eightway_select-up").value;
  var eightway_select_down_old = document.getElementById("eightway_select-down").value;
  var eightway_select_left_old = document.getElementById("eightway_select-left").value;
  var eightway_select_right_old = document.getElementById("eightway_select-right").value;

  show_eightway_modal(false);

  if(eightway_select_up_old == old_name)
    document.getElementById("eightway_select-up").value = name;
  if(eightway_select_down_old == old_name)
    document.getElementById("eightway_select-down").value = name;
  if(eightway_select_left_old == old_name)
    document.getElementById("eightway_select-left").value = name;
  if(eightway_select_right_old == old_name)
    document.getElementById("eightway_select-right").value = name;
}


function update_color_select()
{
  var table = document.getElementById("color_table");
  var color_select = document.getElementById("color_select");
  var selected_item = color_select.value;
  var select = '<select><option>random</option>';

  for (var i = 1, row; row = table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    select += '<option>' + col_name[0] + '</option>';
  }
  select += '</select>';

  color_select.innerHTML = select;
  color_select.value = selected_item;
}

function add_button()
{
   //fill button to button table
   var name = document.getElementById("button_name").value;
   var error = document.getElementById("button_error_message");
   var table = document.getElementById("button_table");

   name = name.trim();
   name = name.replace(/\s/g, '');

   if(check_name(name) != true)
   {
      reset_all();
      //error.innerHTML = check_name(name);
      alert(check_name(name));
      return;
   }

   for (var i = 1, row; row = table.rows[i]; i++) 
   {
     var col_name = row.innerText;
     col_name = col_name.split("\t");
     if(name == col_name[0])
     {
       reset_all();
       alert("Name already exists");
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
    var cell8 = row.insertCell(7);
    
    
    var fade = '<input type="checkbox" id="fade_cb" name="fade_cb" onchange="">';
    //var gpio_pins = '<td><button class="arcade_button_set_gpio" onclick="open_gpio_modal(this)" name="' + name + '">Set GPIO Pin</button></td>';
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
        
    cell1.innerHTML = name;
    cell2.innerHTML = "Not Set";
    cell3.innerHTML = "random";
    cell4.innerHTML = fade;
    cell5.innerHTML = gpio_pins;
    cell6.innerHTML = document.getElementById("button_brightness").value + "%";
    cell7.innerHTML = 20;
    cell8.innerHTML = 7;


    //update_color_button_table();
    alert("Button: " + name + " has been added");
}

function set_color_from_select()
{
  var select_value = document.getElementById("color_select").value;
  var color_table = document.getElementById("color_table");
  var selected_row = document.getElementById("button_row_id").innerHTML;
  var button_table = document.getElementById("button_table");


  button_table.rows[selected_row].cells[2].innerHTML = select_value;
}

function update_fadein()
{
  var table = document.getElementById("button_table");
  var row_id = document.getElementById("button_row_id").innerHTML;

  if(row_id == undefined)
      return;

  table.rows[row_id].cells[6].innerHTML = document.getElementById("fade_in").value;
}

function update_fadeout()
{
  var table = document.getElementById("button_table");
  var row_id = document.getElementById("button_row_id").innerHTML;

  if(row_id == undefined)
      return;

  table.rows[row_id].cells[7].innerHTML = document.getElementById("fade_out").value;
}

function set_fadein_for_all()
{
  var table = document.getElementById("button_table");

  for (var i = 1, row; row = table.rows[i]; i++) 
  {
      table.rows[i].cells[6].innerHTML = document.getElementById("fade_in").value;
  }
}

function set_fadeout_for_all()
{
  var table = document.getElementById("button_table");

  for (var i = 1, row; row = table.rows[i]; i++) 
  {
      table.rows[i].cells[7].innerHTML = document.getElementById("fade_out").value;
  }
}