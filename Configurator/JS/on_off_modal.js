function show_onoff_modal()
{
    var modal = document.getElementById("on_off_button_modal");

    var table_select_replace = '<select id="on_off_select" onmouseenter="">';

    var table = document.getElementById("button_table");
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        var col = row.innerText;
        col = col.split("\t");
        table_select_replace += '<option>' + col[0] +'</option>';
    }
    table_select_replace += '</select>';
    document.getElementById("on_off_select").innerHTML = table_select_replace;

    modal.showModal();
}

function close_onoff_modal()
{
    var modal = document.getElementById("on_off_button_modal");
    modal.close();
}

function onoff_add()
{
    var table = document.getElementById("on_off_table");
    
    var select_length = document.getElementById("on_off_select").options.length;
    if(select_length != 0)
    {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = document.getElementById("on_off_select").value;
    }
}

function select_onoff_table()
{
    var table = document.getElementById("on_off_table"),rIndex;
    var startindex = 1;
  
  
    for(var i = startindex; i < table.rows.length; i++)
    {
      table.rows[i].onclick = function()
      {
          document.getElementById("on_off_delete").style.color = "red";
          document.getElementById("on_off_delete").disabled = false;
          for(var i = startindex; i < table.rows.length; i++)
            {
              var css = '#on_off_table tr:not(:first-child):hover';
              table.rows[i].style = css;
            }
          this.style.backgroundColor = "#ddd";
  
      
          rIndex = this.rowIndex;
          document.getElementById("on_off_row_id").innerHTML = rIndex;
        }
    }
}

function reset_onoff_table()
{
    document.getElementById("on_off_delete").disabled = true;
    document.getElementById("on_off_delete").style.color = "rgb(182, 182, 182)";

    var table = document.getElementById("on_off_table");
    for(var i = 1; i < table.rows.length; i++)
    {
        var css = '#on_off_table tr:not(:first-child):hover';
        table.rows[i].style = css;
    }
}

function delete_onoff_table()
{
    var row_id = parseInt(document.getElementById("on_off_row_id").innerHTML);
    document.getElementById("on_off_table").deleteRow(row_id);

    reset_onoff_table()
}