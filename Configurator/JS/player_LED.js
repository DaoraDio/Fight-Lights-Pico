var player_led = 0;

function show_playerLED_modal()
{
    var modal = document.querySelector('#player_led_modal');
    var table = document.getElementById("color_table");
    var color_select = document.getElementById("playerled_color_select");

    var select = '<select value="playerled_color_select" id="playerled_color_select" onchange=""><optgroup label="Colors">';
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
      var col_name = row.innerText;
      col_name = col_name.split("\t");
      select += '<option>' + col_name[0] + '</option>';
    }
    select += '</optgroup></select>';
    color_select.innerHTML = select;

    document.getElementById("playerled_ label").innerText = "Player LED Color:";
    player_led = 0;


    modal.showModal();
}

function close_playerLED_modal()
{
    var modal = document.querySelector('#player_led_modal');
    modal.close();
}

function set_playerLED_brightness()
{
    var text = document.getElementById("playerLED_brightness_text");
    var slider = document.getElementById("playerLED_brightness");
    text.innerHTML = slider.value;
}

function on_playerled_click(player_num)
{
    player_led = player_num;
    var player;

    if(player_led == 1)
        player = document.getElementById("player_led1");
    else if(player_led == 2)
        player = document.getElementById("player_led2");
    else if(player_led == 3)
        player = document.getElementById("player_led3");
    else if(player_led == 4)
        player = document.getElementById("player_led4");

    const computedStyle = getComputedStyle(player);
    const backgroundColor = computedStyle.backgroundColor;
    const rgbValues = backgroundColor.match(/\d+/g);


    var led_label = document.getElementById("playerled_ label");
    led_label.innerText = "Player LED " + player_led + " Color:";

    document.getElementById("playerled_color_select").value = player.getAttribute('colorname');
    //console.log(rgbValues);
    console.log(player.getAttribute('colorname'));
}

function select_playerled_color(that)
{
    var color_table = document.getElementById("color_table");
    var index = 0;

    for (let i = 1; i < color_table.rows.length; i++) 
    {
        const row = color_table.rows[i];
        if(that.value == row.cells[0].innerHTML)
        {
            index = i;
            //console.log(row.cells[0].innerHTML);
            //console.log(index);
        }
        
    }
    var name = color_table.rows[index].cells[0].innerHTML;
    var r = color_table.rows[index].cells[1].innerHTML;
    var g = color_table.rows[index].cells[2].innerHTML;
    var b = color_table.rows[index].cells[3].innerHTML;

    var player;
    if(player_led == 1)
        player = document.getElementById("player_led1");
    else if(player_led == 2)
        player = document.getElementById("player_led2");
    else if(player_led == 3)
        player = document.getElementById("player_led3");
    else if(player_led == 4)
        player = document.getElementById("player_led4");

    //console.log(color_table.rows[index].cells[1].innerHTML);
    //var rgb = "rgb(" + r + ',' + g + ',' + b + ');';
    player.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    player.setAttribute('colorname', name);
    //console.log(name, r,g,b);
    //console.log(rgb);
    //console.log(that.value);
}

function enable_disbale_cb(that)
{
    var button = document.getElementById("playerled_button");
    if(that.checked)
    {
        button.disabled = true;
    }
    else 
        button.disabled = false;
    
        
}