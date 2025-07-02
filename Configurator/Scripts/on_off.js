var on_off_row_id = -1;
function update_onoff_select() {
    var table_select_replace = '<select id="on_off_select">';

    var table = document.getElementById("button_table");
    if (table) {
        for (var i = 1, row; row = table.rows[i]; i++) {
            var buttonName = row.cells[0].textContent.trim();
            table_select_replace += '<option>' + buttonName + '</option>';
        }
    }
    table_select_replace += '</select>';

    var onOffSelect = document.getElementById("on_off_select");
    if (onOffSelect) {
        onOffSelect.innerHTML = table_select_replace;
    }
}

function onoff_add() {
    var table = document.getElementById("on_off_table");

    var select_length = document.getElementById("on_off_select").options.length;
    if (select_length != 0) {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = document.getElementById("on_off_select").value;
    }
}

function select_onoff_table() {
    var table = document.getElementById("on_off_table"), rIndex;
    var startindex = 1;


    for (var i = startindex; i < table.rows.length; i++) {
        table.rows[i].onclick = function () {
            document.getElementById("on_off_delete").disabled = false;
            for (var i = startindex; i < table.rows.length; i++) {
                var css = '#on_off_table tr:not(:first-child):hover';
                table.rows[i].style = css;
            }
            this.style.setProperty('background-color', 'var(--row-selected)');


            rIndex = this.rowIndex;
            on_off_row_id = rIndex;
        }
    }
}

function reset_onoff_table() {
    document.getElementById("on_off_delete").disabled = true;

    var table = document.getElementById("on_off_table");
    for (var i = 1; i < table.rows.length; i++) {
        var css = '#on_off_table tr:not(:first-child):hover';
        table.rows[i].style = css;
    }
}

function delete_onoff_table() {
    var row_id = on_off_row_id;
    document.getElementById("on_off_table").deleteRow(row_id);

    reset_onoff_table()
}