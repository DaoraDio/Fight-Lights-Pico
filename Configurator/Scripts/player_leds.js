var player_led = 0;

function player_leds_open_page() {
    update_player_LED_select();
    toggle_player_leds_mode(); // Initialize disable state
}

function update_player_LED_select() {
    var table = document.getElementById("color_table");
    var color_select = document.getElementById("playerled_color_select");

    var select = '<select value="playerled_color_select" id="playerled_color_select" onchange=""><optgroup label="Colors">';
    for (var i = 1, row; row = table.rows[i]; i++) {
        var col_name = row.innerText;
        col_name = col_name.split("\t");
        select += '<option>' + col_name[0] + '</option>';
    }
    select += '</optgroup></select>';
    color_select.innerHTML = select;
    player_led = 0;
}

function set_playerLED_brightness() {
    var text = document.getElementById("playerLED_brightness_text");
    var slider = document.getElementById("playerLED_brightness");
    text.innerHTML = slider.value;
}

function on_playerled_click(player_num) {
    player_led = player_num;
    var player;

    if (player_led == 1)
        player = document.getElementById("player_led1");
    else if (player_led == 2)
        player = document.getElementById("player_led2");
    else if (player_led == 3)
        player = document.getElementById("player_led3");
    else if (player_led == 4)
        player = document.getElementById("player_led4");

    document.getElementById("player_led1").classList.remove("active");
    document.getElementById("player_led2").classList.remove("active");
    document.getElementById("player_led3").classList.remove("active");
    document.getElementById("player_led4").classList.remove("active");
    player.classList.add("active");

    const computedStyle = getComputedStyle(player);
    const backgroundColor = computedStyle.backgroundColor;
    const rgbValues = backgroundColor.match(/\d+/g);

    document.getElementById("playerled_color_select").value = player.getAttribute('colorname');
}

function select_playerled_color(that) {
    var color_table = document.getElementById("color_table");
    var index = 0;

    for (let i = 1; i < color_table.rows.length; i++) {
        const row = color_table.rows[i];
        if (that.value == row.cells[0].innerHTML) {
            index = i;
            break;
        }
    }

    var colorCell = color_table.rows[index].cells[1];
    const computedStyle = getComputedStyle(colorCell);
    const bgColor = computedStyle.backgroundColor;
    const rgbValues = bgColor.match(/\d+/g);

    var name = color_table.rows[index].cells[0].innerHTML;
    var r = rgbValues[0];
    var g = rgbValues[1];
    var b = rgbValues[2];

    var player;
    if (player_led == 1)
        player = document.getElementById("player_led1");
    else if (player_led == 2)
        player = document.getElementById("player_led2");
    else if (player_led == 3)
        player = document.getElementById("player_led3");
    else if (player_led == 4)
        player = document.getElementById("player_led4");

    player.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    player.setAttribute('colorname', name);
}

function enable_disable_cb() {
    var checkbox = document.getElementById("player_led_cb");
    const container = document.getElementById('player_led_main_content');
    const link = document.getElementById("player_led_link");

    if (checkbox.checked) {
        container.classList.add('disabled-container');
        container.querySelectorAll('input, select, button, textarea')
                 .forEach(el => el.disabled = true);
        link.classList.add('nav-disabled');
    } else {
        container.classList.remove('disabled-container');
        container.querySelectorAll('input, select, button, textarea')
                 .forEach(el => el.disabled = false);
        link.classList.remove('nav-disabled');
    }
}