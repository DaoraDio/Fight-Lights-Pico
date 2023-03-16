function replace_led_option_selects(id)
{
    var table_select_replace = '<select id="' + id + '">';

    var table = document.getElementById("button_table");
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        var col = row.innerText;
        col = col.split("\t");
        table_select_replace += '<option>' + col[0] +'</option>';
    }
    table_select_replace += '</select>';

    return table_select_replace;
}

function show_led_options(open)
{
    var modal = document.getElementById("led_options_configuration");

    var table_select_replace = '<select id="led_options_select" onmouseenter="">';

    var table = document.getElementById("button_table");
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        var col = row.innerText;
        col = col.split("\t");
        table_select_replace += '<option>' + col[0] +'</option>';
    }
    table_select_replace += '</select>';
    document.getElementById("led_options_select").innerHTML = table_select_replace;

    var current_val = document.getElementById("led_options_inc_brightness").value;
    document.getElementById("led_options_inc_brightness").innerHTML = replace_led_option_selects("led_options_inc_brightness");
    document.getElementById("led_options_inc_brightness").value = current_val;

    current_val = document.getElementById("led_options_dec_brightness").value;
    document.getElementById("led_options_dec_brightness").innerHTML = replace_led_option_selects("led_options_dec_brightness");
    document.getElementById("led_options_dec_brightness").value = current_val;

    current_val = document.getElementById("led_options_left").value;
    document.getElementById("led_options_left").innerHTML = replace_led_option_selects("led_options_left");
    document.getElementById("led_options_left").value = current_val;

    current_val = document.getElementById("led_options_right").value;
    document.getElementById("led_options_right").innerHTML = replace_led_option_selects("led_options_right");
    document.getElementById("led_options_right").value = current_val;
    
    current_val = document.getElementById("led_options_confirm").value;
    document.getElementById("led_options_confirm").innerHTML = replace_led_option_selects("led_options_confirm");
    document.getElementById("led_options_confirm").value = current_val;

    if(open == true)
        modal.showModal();
}

function close_led_options()
{
    var modal = document.getElementById("led_options_configuration");

    modal.close();
}

function add_led_option_button()
{
    var table = document.getElementById("led_options_table");
    
    var select_length = document.getElementById("led_options_select").options.length;
    if(select_length != 0)
    {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = document.getElementById("led_options_select").value;
    }

        
}

function select_led_option_table()
{
    var table = document.getElementById("led_options_table"),rIndex;
    var startindex = 1;
  
  
    for(var i = startindex; i < table.rows.length; i++)
    {
      table.rows[i].onclick = function()
      {
          document.getElementById("delete_led_options_table").style.color = "red";
          document.getElementById("delete_led_options_table").disabled = false;
          for(var i = startindex; i < table.rows.length; i++)
            {
              var css = '#led_options_table tr:not(:first-child):hover';
              table.rows[i].style = css;
            }
          this.style.backgroundColor = "#ddd";
  
      
          rIndex = this.rowIndex;
          document.getElementById("led_options_table_row_id").innerHTML = rIndex;
        }
    }
}

function reset_led_options_table()
{
    document.getElementById("delete_led_options_table").disabled = true;
    document.getElementById("delete_led_options_table").style.color = "rgb(182, 182, 182)";

    var table = document.getElementById("led_options_table");
    for(var i = 1; i < table.rows.length; i++)
    {
        var css = '#led_options_table tr:not(:first-child):hover';
        table.rows[i].style = css;
    }
}

function delete_led_options_table()
{
    var row_id = parseInt(document.getElementById("led_options_table_row_id").innerHTML);
    document.getElementById("led_options_table").deleteRow(row_id);

    reset_led_options_table();
}