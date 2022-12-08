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

            //console.log(select.options[select.selectedIndex].text);
            //select.value = "blank";
          }
        }  
     }
    
    console.log(selected_arr);

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
        //console.log(col.innerHTML);
        //col.innerHTML = color;
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
        //console.log(rIndex);
        document.getElementById("button_row_id").innerHTML = rIndex;
        document.getElementById("button_name").value = this.cells[0].innerHTML;
        document.getElementById("button_brightness").value = parseInt(this.cells[5].innerHTML);
        document.getElementById("brightness_label").innerText = "Brightness: " + this.cells[5].innerHTML;
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
  var button_table = document.getElementById("button_table");
  var row_id = parseInt(document.getElementById("button_row_id").innerHTML);
  

  

  for (var i = 1, row; row = led_options_table.rows[i]; i++) 
  {
    if(row.cells[0].innerHTML == button_name)
    {
      led_options_table.deleteRow(i);
      i--;
    }
  }  

  button_table.deleteRow(row_id);
  reset_all();
  show_led_options(false); //open led_options function to update the selects 

}

function update_button()
{
  update_color_select();
  var table = document.getElementById("button_table");
  var row_id = parseInt(document.getElementById("button_row_id").innerHTML);
  var name = document.getElementById("button_name").value;
  var error = document.getElementById("button_error_message");

  name = name.trim();
  name = name.replace(/\s/g, '');
  if(name == "")
  {
    reset_all();
    error.innerHTML = "Name cannot be empty";
    return;
  }
  else if(startsWithNumber(name))
  {
    reset_all();
    error.innerHTML ="Name cannot start with a number";
    return;
  }
  for (var i = 1, row; row = table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if(name == col_name[0])
    {
      reset_all();
      error.innerHTML = "Name already exists";
      return;
    }
  }


  table.rows[row_id].cells[0].innerHTML = name;
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
    //console.log(col_name[0]);
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
   if(name == "")
   {
     reset_all();
     error.innerHTML = "Name cannot be empty";
     return;
   }
   else if(name.includes("_MyButton"))
   {
    reset_all();
    error.innerHTML ="Name cannot contain _MyButton";
    return;
   }
   else if(startsWithNumber(name))
   {
     reset_all();
     error.innerHTML ="Name cannot start with a number";
     return;
   }
   for (var i = 1, row; row = table.rows[i]; i++) 
   {
     var col_name = row.innerText;
     col_name = col_name.split("\t");
     if(name == col_name[0])
     {
       reset_all();
       error.innerHTML = "Name already exists";
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
    cell1.innerHTML = name;
    cell2.innerHTML = "Not Set";
    cell3.innerHTML = "random";
    cell4.innerHTML = fade;
    cell5.innerHTML = gpio_pins;
    cell6.innerHTML = document.getElementById("button_brightness").value + "%";

    //update_color_button_table();
}

function set_color_from_select()
{
  var select_value = document.getElementById("color_select").value;
  var color_table = document.getElementById("color_table");
  var selected_row = document.getElementById("button_row_id").innerHTML;
  var button_table = document.getElementById("button_table");


  button_table.rows[selected_row].cells[2].innerHTML = select_value;
}