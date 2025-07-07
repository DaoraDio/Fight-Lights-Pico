
function eightway_set_border_color()
{
    var select_up = document.getElementById("eightway_select-up");
    var select_left = document.getElementById("eightway_select-left");
    var select_right = document.getElementById("eightway_select-right");
    var select_down = document.getElementById("eightway_select-down");

    var selected_up = select_up.options[select_up.selectedIndex];
    var selected_down = select_down.options[select_down.selectedIndex];
    var selected_left = select_left.options[select_left.selectedIndex];
    var selected_right = select_right.options[select_right.selectedIndex];
    
    var border_red = "3px solid red";
    var border_green = "3px solid limegreen";

    if(selected_up.value == -1)
        select_up.style.border = border_red;
    else
        select_up.style.border = border_green;

    if(selected_down.value == -1)
        select_down.style.border = border_red;
    else
        select_down.style.border = border_green;

    if(selected_left.value == -1)
        select_left.style.border = border_red;
    else
        select_left.style.border = border_green;

    if(selected_right.value == -1)
        select_right.style.border = border_red;
    else
        select_right.style.border = border_green;
}


function show_eightway_modal() {
    // Update color select dropdown
    var color_select = document.getElementById("eightway_color_select");
    var color_table = document.getElementById("color_table");
    
    if (color_select && color_table) {
        var select = '<select id="eightway_color_select"><option>random</option>';
        for (var i = 1, row; row = color_table.rows[i]; i++) {
            var colorName = row.cells[0].textContent.trim();
            select += '<option>' + colorName + '</option>';
        }
        select += '</select>';
        color_select.innerHTML = select;
    }

    // Initialize select replacements
    var select_up_replace = '<select id="eightway_select-up" onchange="eightway_set_border_color()"><option value="-1" selected>Set UP Button</option>';
    var select_left_replace = '<select id="eightway_select-left" onchange="eightway_set_border_color()"><option value="-1" selected>Set LEFT Button</option>';
    var select_right_replace = '<select id="eightway_select-right" onchange="eightway_set_border_color()"><option value="-1" selected>Set RIGHT Button</option>';
    var select_down_replace = '<select id="eightway_select-down" onchange="eightway_set_border_color()"><option value="-1" selected>Set DOWN Button</option>';

    // Get current selections
    var select_up = document.getElementById("eightway_select-up");
    var select_left = document.getElementById("eightway_select-left");
    var select_right = document.getElementById("eightway_select-right");
    var select_down = document.getElementById("eightway_select-down");

    var selected_up = select_up ? select_up.options[select_up.selectedIndex] : null;
    var selected_down = select_down ? select_down.options[select_down.selectedIndex] : null;
    var selected_left = select_left ? select_left.options[select_left.selectedIndex] : null;
    var selected_right = select_right ? select_right.options[select_right.selectedIndex] : null;

    eightway_set_border_color();

    // Update button select dropdowns
    var button_table = document.getElementById("button_table");
    if (button_table) {
        for (var i = 1, row; row = button_table.rows[i]; i++) {
            var buttonName = row.cells[0].textContent.trim();
            
            // UP select
            if (selected_up && buttonName === selected_up.text) {
                select_up_replace += '<option value="' + buttonName + '" selected>' + buttonName + '</option>';
            } else {
                select_up_replace += '<option value="' + buttonName + '">' + buttonName + '</option>';
            }

            // LEFT select
            if (selected_left && buttonName === selected_left.text) {
                select_left_replace += '<option value="' + buttonName + '" selected>' + buttonName + '</option>';
            } else {
                select_left_replace += '<option value="' + buttonName + '">' + buttonName + '</option>';
            }

            // RIGHT select
            if (selected_right && buttonName === selected_right.text) {
                select_right_replace += '<option value="' + buttonName + '" selected>' + buttonName + '</option>';
            } else {
                select_right_replace += '<option value="' + buttonName + '">' + buttonName + '</option>';
            }

            // DOWN select
            if (selected_down && buttonName === selected_down.text) {
                select_down_replace += '<option value="' + buttonName + '" selected>' + buttonName + '</option>';
            } else {
                select_down_replace += '<option value="' + buttonName + '">' + buttonName + '</option>';
            }
        }
    }

    // Close select tags
    select_up_replace += '</select>';
    select_left_replace += '</select>';
    select_right_replace += '</select>';
    select_down_replace += '</select>';

    // Update DOM elements if they exist
    if (select_up) select_up.innerHTML = select_up_replace;
    if (select_left) select_left.innerHTML = select_left_replace;
    if (select_right) select_right.innerHTML = select_right_replace;
    if (select_down) select_down.innerHTML = select_down_replace;

    eightway_reset();
}

function eightway_reset()
{
    document.getElementById("eighway_set_leds").disabled = true;
    document.getElementById("eightway_color_select").disabled = true;
    document.getElementById("eightway_color_select").value = "blank";
    document.getElementById("eightway_direction_text").innerText = "-";
    document.getElementById("eightway_leds_nums").innerText = "-";
    document.getElementById("eightway_leds_color").innerText = "-";

    var black = "#000000";
    set_up_color(black);
    set_down_color(black);
    set_left_color(black);
    set_right_color(black);
    set_up_left_color(black);
    set_up_right_color(black);
    set_down_left_color(black);
    set_down_right_color(black);


}

function close_eightway_modal()
{
    var modal = document.getElementById("eightway_modal");

    modal.close();
}

function click_direction(that)
{
    var name = that.className.substring(12);
    var red = "#ff0000";
    var black = "#000000";

    var element = document.querySelector(".arrow.arrow-" + name);
    var directionColor = element.getAttribute("directioncolor");

    document.getElementById('eightway_direction_text').innerText = name;
    document.getElementById("eightway_leds_color").innerText = directionColor;
    document.getElementById("eightway_color_select").value = directionColor;
    document.getElementById("eighway_set_leds").disabled = false;
    document.getElementById("eightway_color_select").disabled = false;

    document.getElementById("eightway_leds_nums").innerHTML = that.getAttribute("led_pos");

    if(name == "up")
    {
        set_up_color(red);
        set_down_color(black);
        set_left_color(black);
        set_right_color(black);
        set_up_left_color(black);
        set_up_right_color(black);
        set_down_left_color(black);
        set_down_right_color(black);
    }

    if(name == "down")
    {
        set_up_color(black);
        set_down_color(red);
        set_left_color(black);
        set_right_color(black);
        set_up_left_color(black);
        set_up_right_color(black);
        set_down_left_color(black);
        set_down_right_color(black);
    }

    if(name == "left")
    {
        set_up_color(black);
        set_down_color(black);
        set_left_color(red);
        set_right_color(black);
        set_up_left_color(black);
        set_up_right_color(black);
        set_down_left_color(black);
        set_down_right_color(black);
    }
    if(name == "right")
    {
        set_up_color(black);
        set_down_color(black);
        set_left_color(black);
        set_right_color(red);
        set_up_left_color(black);
        set_up_right_color(black);
        set_down_left_color(black);
        set_down_right_color(black);
    }

    if(name == "up-left")
    {
        set_up_color(black);
        set_down_color(black);
        set_left_color(black);
        set_right_color(black);
        set_up_left_color(red);
        set_up_right_color(black);
        set_down_left_color(black);
        set_down_right_color(black);
    }
    if(name == "up-right")
    {
        set_up_color(black);
        set_down_color(black);
        set_left_color(black);
        set_right_color(black);
        set_up_left_color(black);
        set_up_right_color(red);
        set_down_left_color(black);
        set_down_right_color(black);
    }
    if(name == "down-right")
    {
        set_up_color(black);
        set_down_color(black);
        set_left_color(black);
        set_right_color(black);
        set_up_left_color(black);
        set_up_right_color(black);
        set_down_left_color(black);
        set_down_right_color(red);
    }
    if(name == "down-left")
    {
        set_up_color(black);
        set_down_color(black);
        set_left_color(black);
        set_right_color(black);
        set_up_left_color(black);
        set_up_right_color(black);
        set_down_left_color(red);
        set_down_right_color(black);
    }


}

function eightway_set_select_color(that) {
    var current_direction = document.getElementById("eightway_direction_text").innerText;
    var classname = "arrow arrow-" + current_direction;

    var elements = document.getElementsByClassName(classname);

    // Loop through each element with the specified class and set the custom attribute
    for (var i = 0; i < elements.length; i++) {
        elements[i].setAttribute("directioncolor", that.value);
    }

    document.getElementById("eightway_leds_color").innerText = that.value;
}

function eightway_show_led_modal(showmodal = true)
{
    var modal = document.getElementById("eightway_led_modal");
    document.getElementById("eightway_led_modal_headline").innerText = "Set LEDs for " + document.getElementById("eightway_direction_text").innerText;

    var led_count = document.getElementById("led_count").value;
    var modal_body = document.getElementById("eightway_modal_body");
    
    var current_direction = document.getElementById("eightway_direction_text").innerText;
    var elements = document.getElementsByClassName("arrow arrow-" + current_direction);
    

    if (elements.length > 0) {
        var firstElement = elements[0];
        var ledPos = firstElement.getAttribute("led_pos");
    
        

    var led_array = ledPos.split(" ").map(Number);

 

    if(ledPos == "not Set")
        led_array = [];
    

    

    var body_string = "";
    for (var i = 0; i < led_count; i++) 
    {
        var checkboxId = 'eightway_led_num' + (i+1);

        if (led_array.includes(i+1)) 
            body_string += '<span id="' + checkboxId + '"><label><input class="eightway_modal_led_cb" type="checkbox" checked>' + 'LED ' + (i+1) + '</label></span>';
        else
            body_string += '<span id="' + checkboxId + '"><label><input class="eightway_modal_led_cb" type="checkbox">' + 'LED ' + (i+1) + '</label></span>';            
    }
    modal_body.innerHTML = body_string;
}
    if(showmodal)
        modal.showModal();
}

function close_eightway_led_modal()
{
    var modal = document.getElementById("eightway_led_modal");
    var modal_body = document.getElementById("eightway_modal_body");
    var checkboxes = modal_body.querySelectorAll('.eightway_modal_led_cb');

    var checkedCheckboxIds = []
    checkboxes.forEach(function(checkbox) 
    {
        if (checkbox.checked) {
             var checkboxId = checkbox.closest('span').id;
            checkedCheckboxIds.push(checkboxId);
        }
    });

    
    var substringToRemove = "eightway_led_num";

    
    var modifiedArray = checkedCheckboxIds.map(function(element) {
    var modifiedElement = element.replace(substringToRemove, '');
    return Number(modifiedElement);
    });

    if(modifiedArray.length == 0)
        modifiedArray = [-1];
    

    var led_pos_string = "";
    for(let i=0; i < modifiedArray.length; i++)
        led_pos_string += modifiedArray[i].toString() + " ";

    
    var current_direction = document.getElementById("eightway_direction_text").innerText;
    current_direction = document.querySelector(".arrow.arrow-" + current_direction);
    if(led_pos_string == -1)
        led_pos_string = "not Set";
    
    current_direction.setAttribute("led_pos", led_pos_string);
    //console.log(led_pos_string);
    document.getElementById("eightway_leds_nums").innerHTML = led_pos_string;
    modal.close();
}


/********************************SET COLORS*****************************************************/
function set_up_color(color)
{
    var element = document.querySelector(".arrow.arrow-up");
    element.style.borderColor = "transparent transparent" +  color +" transparent";
}

function set_down_color(color)
{
    var element = document.querySelector(".arrow.arrow-down");
    element.style.borderColor = color + " transparent transparent transparent";
}

function set_left_color(color)
{
    var element = document.querySelector(".arrow.arrow-left");
    element.style.borderColor = "transparent " + color + " transparent transparent";
}

function set_right_color(color)
{
    var element = document.querySelector(".arrow.arrow-right");
    element.style.borderColor = "transparent transparent transparent "+ color;
}

function set_up_left_color(color)
{
    var element = document.querySelector(".arrow-up-left");
    element.style.borderColor = color + " transparent transparent transparent";
}

function set_up_right_color(color)
{
    var element = document.querySelector(".arrow-up-right");
    element.style.borderColor = color + " transparent transparent transparent";
}

function set_down_left_color(color)
{
    var element = document.querySelector(".arrow-down-left");
    element.style.borderColor = "transparent transparent" +  color +" transparent";
}

function set_down_right_color(color)
{
    var element = document.querySelector(".arrow-down-right");
    element.style.borderColor = "transparent transparent" +  color +" transparent";
}

function show_directions_modal() 
{
    const modal = document.getElementById("set_directions_modal");
    show_eightway_modal();
    modal.showModal();
}

function close_directions_modal() 
{
    const modal = document.getElementById("set_directions_modal");
    modal.close();
}