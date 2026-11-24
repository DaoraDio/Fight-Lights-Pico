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
    const select = document.getElementById("on_off_select");
    if (select.options.length) Configurator.appendRow("on_off_table", [select.value]);
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