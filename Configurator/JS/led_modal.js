function led_open_modal()
{
    var modal = document.querySelector('#led_conf_modal');
    var row_id = document.getElementById("button_row_id").innerHTML;
    var modal_body = document.getElementById("modal_body");
    var button_table = document.getElementById("button_table");
    var headline = document.getElementById("modal_headline");

    row_id = parseInt(row_id);
    var button_name = button_table.rows[row_id].cells[0].innerHTML;
    headline.innerHTML = "Set " + button_name + " button LED positions";


    var table_led_positions = button_table.rows[row_id].cells[1].innerHTML; 
    var led_num = document.getElementById("led_count").value;
    var body_string = "";


    table_led_positions = table_led_positions.trim().split(/\s+/) //led positions to in selected row to array
    
    var found = false;
    for(var i = 0; i < led_num; i++)
    {
        if ((i % 3) == 0 && i != 0) 
            body_string += '<br>';

        found = false;
        for(var j = 0; j < table_led_positions.length; j++)
        {
            if((i+1) == table_led_positions[j])
            {
                body_string += '<label><input class="modal_led_cb" type="checkbox" checked>' + 'LED ' + (i+1) + '</label>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';
                found = true;
                break;
            } 
        }
        if(!found)
            body_string += '<label><input class="modal_led_cb" type="checkbox">' + 'LED ' + (i+1) + '</label>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp';

    }
    

    modal_body.innerHTML = body_string;
    modal.showModal();
}

function led_close_modal()
{
    var modal = document.querySelector('#led_conf_modal');
    modal.close();
}

function led_save_modal()
{   
    var checked_leds = document.getElementsByClassName('modal_led_cb');
    var row_id = document.getElementById("button_row_id").innerHTML;
    var button_table = document.getElementById("button_table");

    //button_table.rows[row_id].cells[1].innerHTML; 

    var led_pos = "";
    for(var i = 0; i < checked_leds.length; i++)
    {
        if(checked_leds[i].checked == true)
        led_pos += (i+1) + ' ';
    }

    if(led_pos == "")
        led_pos = "Not Set";

    button_table.rows[row_id].cells[1].innerHTML = led_pos; 
    
        
    led_close_modal();
}

function set_all()
{
    var checked_leds = document.getElementsByClassName('modal_led_cb');
    for(var i = 0; i < checked_leds.length; i++)
    {
        checked_leds[i].checked = true;
    }
}

function unset_all()
{
    var checked_leds = document.getElementsByClassName('modal_led_cb');
    for(var i = 0; i < checked_leds.length; i++)
    {
        checked_leds[i].checked = false;
    }
}
