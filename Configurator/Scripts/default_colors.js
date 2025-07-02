var bg_row_id = -1;
function fill_bg_table_from_loaded_box() {
    if (get_value("background = ")) {
        var background = get_value("background = ");
        background = background.substring(1);
        background = background.slice(0, -1);
        background = background.split('),(');
        background[0] = background[0].substring(1);
        background[background.length - 1] = background[background.length - 1].slice(0, -1);

        var codebox2 = document.getElementById("new_codebox");
        if (codebox2.value != "") {
            for (var i = 0; i < document.getElementById("led_count").value; i++) {
                var row = background_table.rows[i + 1];

                var split_arr = background[i].split(',');

                row.cells[0].innerHTML = parseInt(split_arr[2])
                row.cells[1].innerHTML = split_arr[1];
                row.cells[2].innerHTML = parseFloat(split_arr[0]) * 100 + "%";
            }
        }
    }
}

function set_bg_table() {
    var table = document.getElementById("background_table");
    var desiredCount = parseInt(document.getElementById("led_count").value);
    bg_row_id = -1;

    // Get existing values
    var existingData = [];
    for (var i = 1; i < table.rows.length; i++) { // skip header (i=0)
        var row = table.rows[i];
        var color = row.cells[1].innerHTML;
        var brightness = row.cells[2].innerHTML;
        existingData.push({ color: color, brightness: brightness });
    }

    // Clear all rows except header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Rebuild rows
    for (var i = 0; i < desiredCount; i++) {
        var row = table.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3); // Add the color preview cell

        cell1.innerHTML = i + 1;

        if (existingData[i]) {
            cell2.innerHTML = existingData[i].color;
            cell3.innerHTML = existingData[i].brightness;
        } else {
            cell2.innerHTML = "blank";
            cell3.innerHTML = "100%";
        }

        // Set the last cell's background color to black
        cell4.className = "default-colors_color_row";
        cell4.style.backgroundColor = "black";
    }
    //fill_bg_table_from_loaded_box();
}


function update_bg_color_select() {
    var table = document.getElementById("color_table");
    var color_select = document.getElementById("bg_color_select");

    var select = '<select value="bg_color_select" id="bg_color_select" onchange="select_set_color()"><optgroup label="Special option"><option>rainbow</option></optgroup><optgroup label="Colors">';
    for (var i = 1, row; row = table.rows[i]; i++) {
        var col_name = row.innerText;
        col_name = col_name.split("\t");
        select += '<option>' + col_name[0] + '</option>';
    }
    select += '</optgroup></select>';
    color_select.innerHTML = select;
    set_bg_table();
}


function set_brightness() {
    var slider = document.getElementById("bg_brightness");
    var text = document.getElementById("brightness_text");
    var table = document.getElementById("background_table");
    var row_id = bg_row_id;

    text.innerHTML = slider.value;

    if (row_id == -1)
        return;
    table.rows[row_id].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';

}

function select_bg_table() {
    var table = document.getElementById("background_table"), rIndex;
    var row_id = bg_row_id;
    var select = document.getElementById("bg_color_select");
    var startindex = 1;

    for (var i = startindex; i < table.rows.length; i++) {
        table.rows[i].onclick = function () {
            for (var i = startindex; i < table.rows.length; i++) {
                var css = '#background_table tr:not(:first-child):hover';
                table.rows[i].style = css;
            }
            this.style.setProperty('background-color', 'var(--row-selected)');

            rIndex = this.rowIndex;

            row_id = rIndex;
            bg_row_id = rIndex;
            select.value = table.rows[rIndex].cells[1].innerHTML;

            var brightness_val = table.rows[rIndex].cells[2].innerHTML;
            brightness_val = brightness_val.slice(0, -1);
            document.getElementById("bg_brightness").value = brightness_val;

            var text = document.getElementById("brightness_text");
            text.innerHTML = brightness_val;

        }
    }
}

function select_set_color() {
    var table = document.getElementById("background_table");
    var select = document.getElementById("bg_color_select");
    var row_id = bg_row_id;
    if (row_id > -1)
    {
        table.rows[row_id].cells[1].innerHTML = select.value;
        update_bg_table_colors();
    }

}

function bg_set_all() {
    if (confirm("Do you really want to set all colors and brightness? This will overwrite all existing values.")) {
        ;
    }
    else {
        return;
    }
    var table = document.getElementById("background_table");

    for (var i = 1, row; row = table.rows[i]; i++) {
        table.rows[i].cells[1].innerHTML = document.getElementById("bg_color_select").value;
        table.rows[i].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';
    }
    update_bg_table_colors();
}




function bg_set_color_all() {
    if (confirm("Do you really want to set all colors? This will overwrite all existing values.")) {
        ;
    }
    else {
        return;
    }
    var table = document.getElementById("background_table");

    for (var i = 1, row; row = table.rows[i]; i++) {
        table.rows[i].cells[1].innerHTML = document.getElementById("bg_color_select").value;
    }
    update_bg_table_colors();
}

function bg_set_brightness_all() {
    if (confirm("Do you really want to set all brightness values? This will overwrite all existing values.")) {
        ;
    }
    else {
        return;
    }
    var table = document.getElementById("background_table");

    for (var i = 1, row; row = table.rows[i]; i++) {
        table.rows[i].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';
    }
}

function update_bg_table_colors() {
    var bgTable = document.getElementById("background_table");
    var colorTable = document.getElementById("color_table");

    // Skip header row (i=0)
    for (var i = 1; i < bgTable.rows.length; i++) {
        var row = bgTable.rows[i];
        var colorName = row.cells[1].textContent;
        var colorCell = row.cells[3];

        // Reset any previous styling
        colorCell.style.background = '';
        colorCell.style.backgroundColor = '';

        // Handle special cases
        if (colorName === "blank") {
            colorCell.style.backgroundColor = "black";
            continue;
        }

        if (colorName === "rainbow") {
            colorCell.style.background = "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)";
            continue;
        }

        // Search for color in color table
        var found = false;
        for (var j = 2; j < colorTable.rows.length; j++) { // Skip header rows
            var colorRow = colorTable.rows[j];
            if (colorRow.cells[0].textContent === colorName) {
                var rgbValue = colorRow.cells[1].style.backgroundColor;
                if (rgbValue) {
                    colorCell.style.backgroundColor = rgbValue;
                    found = true;
                    break;
                }
            }
        }

        // Fallback to black if color not found
        if (!found) {
            colorCell.style.backgroundColor = "black";
        }
    }
}