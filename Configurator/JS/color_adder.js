var rgb = [255, 0 ,0];
var button_color_selection = false;

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}



function select_color_table()
{
  var table = document.getElementById("color_table"),rIndex;
  var startindex = 2;
  //f_row.style.backgroundColor = "red";
  for(var i = startindex; i < table.rows.length; i++)
  {
    table.rows[i].onclick = function()
    {
        document.getElementById("delete_color").style.color = "red";
        document.getElementById("delete_color").disabled = false;
        document.getElementById("update_color").disabled = false;
        for(var i = startindex; i < table.rows.length; i++)
          {
            var css = '#color_table tr:not(:nth-child(-n+2)):hover';
            table.rows[i].style = css;
          }
        this.style.backgroundColor = "#ddd";

    
        rIndex = this.rowIndex;
        console.log(rIndex);
        document.getElementById("row_id").innerHTML = rIndex;
        document.getElementById("color_name").value = this.cells[0].innerHTML;
        var R = parseInt(this.cells[1].innerHTML);
        var G = parseInt(this.cells[2].innerHTML);
        var B = parseInt(this.cells[3].innerHTML);
    
        var hex = rgbToHex(R,G,B);
        document.getElementById("color_adder").value = hex;
      }
  }
}


function hexTorgb(hex) 
{
  return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}


function getRGBColor()
{
    var hex = document.getElementById("color_adder").value;
    rgb = hexTorgb(hex);
}

function check_colortable_duplicate(name)
{
  var table = document.getElementById("color_table");
  
  for (var i = 1, row; row = table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");
    if(name == col_name[0])
    {
      return "Name already exists";
    }
 }
 return false;
}
function addColor()
{
  getRGBColor();

  var name = document.getElementById("color_name").value;
  name = name.trim();
  name = name.replace(/\s/g, '');

  if(check_name(name) != true)
  {
    document.getElementById("color_info").innerHTML = check_name(name);
    return;
  }

  if(check_colortable_duplicate(name) != false)
  {
    document.getElementById("color_info").innerHTML = check_colortable_duplicate(name);
    return;
  }

  var table = document.getElementById("color_table");

  var row = table.insertRow();

  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  
  var cell_color = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  cell1.innerHTML = name;
  cell2.innerHTML = rgb[0];
  cell3.innerHTML = rgb[1];
  cell4.innerHTML = rgb[2];
  cell5.style.backgroundColor = cell_color;

  reset();
}

function reset()
{
  document.getElementById("color_adder").value = "#ff0000";
  document.getElementById("color_name").value = "";
  document.getElementById("update_color").disabled = true;
  
  document.getElementById("delete_color").style.color = "rgb(182, 182, 182)";
  document.getElementById("delete_color").disabled = true;

  var table = document.getElementById("color_table"),rIndex;
  for(var i = 2; i < table.rows.length; i++)
  {
      var css = '#color_table tr:not(:nth-child(-n+2)):hover';
      table.rows[i].style = css;
  }
  document.getElementById("color_info").innerHTML = "";

  //update_color_button_table();
  //document.getElementById("add_color_button").style.display="none";

}

function update_color()
{
    var table = document.getElementById("color_table");
    var row_id = parseInt(document.getElementById("row_id").innerHTML);
    var name = document.getElementById("color_name").value;

    name = name.trim();
    name = name.replace(/\s/g, '');
  
    if(check_name(name) != true)
    {
      document.getElementById("color_info").innerHTML = check_name(name);
      return;
    }
  

    table.rows[row_id].cells[0].innerHTML = name;
    getRGBColor();
    table.rows[row_id].cells[1].innerHTML = rgb[0];
    table.rows[row_id].cells[2].innerHTML = rgb[1];
    table.rows[row_id].cells[3].innerHTML = rgb[2];

    var cell_color = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    table.rows[row_id].cells[4].style.backgroundColor = cell_color;
    reset();
}

function delete_color()
{
  var button_uses_color = false;
  var background_uses_color = false;
  var playerled_uses_color = false;
  var button_table = document.getElementById("button_table");
  var bg_table = document.getElementById("background_table");
  var name = document.getElementById("color_name");

  for (var i = 1, row; row = button_table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if(row.cells[2].innerHTML == name.value)
    {
      button_uses_color = true;
      break;
    }
  }  

  for (var i = 1, row; row = bg_table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if(row.cells[1].innerHTML == name.value)
    {
      background_uses_color = true;
      break;
    }
  }  
  //console.log("button Color: ", button_uses_color);
  //console.log("background Color: ", background_uses_color);
  var p1_col = document.getElementById("player_led1").getAttribute("colorname");
  var p2_col = document.getElementById("player_led2").getAttribute("colorname");
  var p3_col = document.getElementById("player_led3").getAttribute("colorname");
  var p4_col = document.getElementById("player_led4").getAttribute("colorname");

  if(name.value == p1_col || name.value == p2_col || name.value == p3_col || name.value == p4_col)
  {
    playerled_uses_color = true;
  }

  if(background_uses_color || button_uses_color || playerled_uses_color)
  {
    if (confirm("This color is used as button, background or playerLED color, do you still want to delete it? Colors will be set to blank")) 
    {
      ;
    } 
    else 
    {
      return;
    }
  }

  if(name.value == p1_col)
  {
    document.getElementById("player_led1").style.backgroundColor  = "black";
    document.getElementById("player_led1").setAttribute("colorname", "blank");
  }
  if(name.value == p2_col)
  {
    document.getElementById("player_led2").style.backgroundColor  = "black";
    document.getElementById("player_led2").setAttribute("colorname", "blank");
  }
  if(name.value == p3_col)
  {
    document.getElementById("player_led3").style.backgroundColor  = "black";
    document.getElementById("player_led3").setAttribute("colorname", "blank");
  }
  if(name.value == p4_col)
  {
    document.getElementById("player_led4").style.backgroundColor  = "black";
    document.getElementById("player_led4").setAttribute("colorname", "blank");
  }
    



  
  var col_select = document.getElementById("color_select");
  if(col_select.value === name.value)
    col_select.value = "blank";


  
  for (var i = 1, row; row = button_table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if(row.cells[2].innerHTML == name.value)
    {
      row.cells[2].innerHTML = "blank";
    }
  }  

  for (var i = 1, row; row = bg_table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if(row.cells[1].innerHTML == name.value)
    {
      row.cells[1].innerHTML = "blank";
    }
  }  

  var circle_table = document.getElementById("circle_table");
  for (var i = 1, row; row = circle_table.rows[i]; i++) 
  {
    var col_name = row.innerText;
    col_name = col_name.split("\t");

    if(row.cells[0].innerHTML == name.value)
    {
      document.getElementById("circle_table").deleteRow(i);
    }
  }    

  var row_id = parseInt(document.getElementById("row_id").innerHTML);
  document.getElementById("color_table").deleteRow(row_id);
  reset();
}