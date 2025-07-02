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

function show_led_options() {
    // Create select element with button names
    var table_select_replace = '<select id="led_options_select" onmouseenter="">';
    
    var table = document.getElementById("button_table");
    if (table) {
        for (var i = 1, row; row = table.rows[i]; i++) {
            // Get button name from first cell's textContent
            var buttonName = row.cells[0].textContent.trim();
            table_select_replace += '<option>' + buttonName + '</option>';
        }
    }
    table_select_replace += '</select>';
    
    // Update the select element if it exists
    var ledOptionsSelect = document.getElementById("led_options_select");
    if (ledOptionsSelect) {
        ledOptionsSelect.innerHTML = table_select_replace;
    }

    // Helper function to update individual select elements
    function updateSelectElement(selectId) {
        var select = document.getElementById(selectId);
        if (!select) return;
        
        var currentVal = select.value;
        var newOptions = table_select_replace;
        
        select.innerHTML = newOptions;
        select.value = currentVal;
    }

    // Update all LED option selects
    updateSelectElement("led_options_inc_brightness");
    updateSelectElement("led_options_dec_brightness");
    updateSelectElement("led_options_left");
    updateSelectElement("led_options_right");
    updateSelectElement("led_options_confirm");
}

function select_led_option_table()
{
    var table = document.getElementById("led_options_table"),rIndex;
    var startindex = 1;
  
  
    for(var i = startindex; i < table.rows.length; i++)
    {
      table.rows[i].onclick = function()
      {
          document.getElementById("delete_led_options_table").disabled = false;
          for(var i = startindex; i < table.rows.length; i++)
            {
              var css = '#led_options_table tr:not(:first-child):hover';
              table.rows[i].style = css;
            }
          this.style.setProperty('background-color', 'var(--row-selected)');
  
      
          rIndex = this.rowIndex;
          document.getElementById("led_options_table_row_id").innerHTML = rIndex;
        }
    }
}

function reset_led_options_table()
{
    document.getElementById("delete_led_options_table").disabled = true;

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

function update_smooth_value() {
  var val = parseFloat(document.getElementById("smooth_speed").value).toFixed(3);
  document.getElementById("smooth_label").innerText = "Speed: " + val;
}


function show_smooth_slider()
{
  var brightness_steps = document.getElementById("brightness_steps");
  if(brightness_steps.value == "smooth")
  {
    document.getElementById("smooth_speed").hidden = false;
    document.getElementById("smooth_label").hidden = false;
  }
  else
  {
    document.getElementById("smooth_speed").hidden = true;
    document.getElementById("smooth_label").hidden = true;
  }
}