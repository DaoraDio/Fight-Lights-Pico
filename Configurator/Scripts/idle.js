function idle_open_page()
{
    update_checkbox_hide();
    update_checkbox_show();
    update_exclude_leds();
}

function toggle_idle_mode() {
    var checkbox = document.getElementById("idle_cb");
    const container = document.getElementById('idlemode_container');
    const idleLink = document.getElementById("idle_link");

    if (checkbox.checked) {
        container.classList.add('disabled-container');

        // Disable all interactive elements inside the container
        const elements = container.querySelectorAll('input, select, button, textarea');
        elements.forEach(el => el.disabled = true);

        // Add the shared nav-disabled class
        idleLink.classList.add('nav-disabled');
    } else {
        container.classList.remove('disabled-container');

        // Re-enable all interactive elements
        const elements = container.querySelectorAll('input, select, button, textarea');
        elements.forEach(el => el.disabled = false);

        // Remove the shared nav-disabled class
        idleLink.classList.remove('nav-disabled');
    }
}



function update_idle_circle_select()
{
    var table = document.getElementById("color_table");
    var circle_select = document.getElementById("idle_circle_select");
    var selected_item = circle_select.value;
    var select = '<select id="idle_circle_select" onmouseenter="update_idle_circle_select()">';
  
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
      var col_name = row.innerText;
      col_name = col_name.split("\t");
      select += '<option>' + col_name[0] + '</option>';
    }
    select += '</select>';
    circle_select.innerHTML = select;
    circle_select.value = selected_item;
}

function update_checkbox_hide()
{
    var checkbox = document.getElementById("circle_checkbox").checked;
    if(checkbox)
    {
        document.getElementById("delete_idle_table").hidden = true;
        document.getElementById("add_idle_table").hidden = true;
        document.getElementById("idle_circle_select").hidden = true;
        document.getElementById("circle_table").hidden = true;
        document.getElementById("reset_idle_table").hidden = true;
    }
}

function update_checkbox_show()
{
    var checkbox = document.getElementById("circle_checkbox2").checked;
    if(checkbox)
    {
        document.getElementById("delete_idle_table").hidden = false;
        document.getElementById("add_idle_table").hidden = false;
        document.getElementById("idle_circle_select").hidden = false;
        document.getElementById("circle_table").hidden = false;
        document.getElementById("reset_idle_table").hidden = false;
    }
}

var checkedCheckboxIds = [];
function update_exclude_leds()
{
    var led_count = document.getElementById("led_count").value;
    var modal_body = document.getElementById("idle_exlude_modal_body");
    var checkboxes = modal_body.querySelectorAll('.idle_modal_led_cb');
    
    checkedCheckboxIds = []
    checkboxes.forEach(function(checkbox) 
    {
        if (checkbox.checked) {
             var checkboxId = checkbox.closest('span').id;
            checkedCheckboxIds.push(checkboxId);
        }
    });

    var body_string = "";
    for (var i = 0; i < led_count; i++) 
    {
        if ((i % 3) == 0 && i != 0) 
            body_string += '<br>';
            
        var checkboxId = 'led_num' + (i + 1);
        if (checkedCheckboxIds.includes(checkboxId)) 
        {
            body_string += '<span id="' + checkboxId + '"><label><input class="idle_modal_led_cb" type="checkbox" checked>' + 'LED ' + (i + 1) + '</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
        }
        else
        {
            body_string += '<span id="' + checkboxId + '"><label><input class="idle_modal_led_cb" type="checkbox">' + 'LED ' + (i + 1) + '</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
        }
            
    }
    modal_body.innerHTML = body_string;
}

function reset_idle_selection()
{
    document.getElementById("delete_idle_table").disabled = true;

    var table = document.getElementById("circle_table"),rIndex;
    for(var i = 1; i < table.rows.length; i++)
    {
        var css = '#circle_table tr:not(:first-child):hover';
        table.rows[i].style = css;
    }
}

function delete_idle_color()
{
    var row_id = parseInt(document.getElementById("circle_row_id").innerHTML);
    document.getElementById("circle_table").deleteRow(row_id);
    reset_idle_selection();
}

function select_circle_table()
{
  var table = document.getElementById("circle_table"),rIndex;
  var startindex = 1;


  for(var i = startindex; i < table.rows.length; i++)
  {
    table.rows[i].onclick = function()
    {
        document.getElementById("delete_idle_table").disabled = false;
        for(var i = startindex; i < table.rows.length; i++)
          {
            var css = '#circle_table tr:not(:first-child):hover';
            table.rows[i].style = css;
          }
        this.style.setProperty('background-color', 'var(--row-selected)');

    
        rIndex = this.rowIndex;
        document.getElementById("circle_row_id").innerHTML = rIndex;
      }
  }
}

function add_idle_color()
{
    var table = document.getElementById("circle_table");
    var row = table.insertRow();

    var cell1 = row.insertCell(0);
    
    cell1.innerHTML = document.getElementById("idle_circle_select").value;
    reset_idle_selection();
}

function show_idle_extra_config()
{
    let idle_val = document.getElementById("idle_select").value;
    let idle_container = document.getElementById("idle1_config_container");
    let dim_container = document.getElementById("idle1_config_container_dim");

    if (idle_val === "1") 
    {
        dim_container.hidden = true;
        idle_container.hidden = false;
    }
    else if (idle_val === "3")
    {
        idle_container.hidden = true;
        dim_container.hidden = false;
    }
    else
    {
        dim_container.hidden = true;
        idle_container.hidden = true;
    }
} 

function update_dim_brightness_input() {
    let percentage = document.getElementById('dim_brightness_slider').value;
    document.getElementById('brightness-value_dim').textContent = percentage + '%';
}