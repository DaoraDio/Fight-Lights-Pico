function show_dynamic_profile_modal()
{
    var modal = document.getElementById("dynamic_profile_modal");

    //////first select
    var table_select_replace = '<select id="dynamic_profile_next_select" onmouseenter="">';

    var table = document.getElementById("button_table");
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        var col = row.innerText;
        col = col.split("\t");
        table_select_replace += '<option>' + col[0] +'</option>';
    }
    table_select_replace += '</select>';
    document.getElementById("dynamic_profile_next_select").innerHTML = table_select_replace;

    ////////second select
    var table_select_replace = '<select id="dynamic_profile_prev_select" onmouseenter="">';

    var table = document.getElementById("button_table");
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        var col = row.innerText;
        col = col.split("\t");
        table_select_replace += '<option>' + col[0] +'</option>';
    }
    table_select_replace += '</select>';
    document.getElementById("dynamic_profile_prev_select").innerHTML = table_select_replace;

    modal.showModal();
}

function close_dynamic_profile_modal()
{
    var modal = document.getElementById("dynamic_profile_modal");
    modal.close()
}

function dynamic_profile_next_add()
{
    var table = document.getElementById("dynamic_profile_table_next");
    
    var select_length = document.getElementById("dynamic_profile_next_select").options.length;
    if(select_length != 0)
    {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = document.getElementById("dynamic_profile_next_select").value;
    }
}

function dynamic_profile_prev_add()
{
    var table = document.getElementById("dynamic_profile_table_prev");
    
    var select_length = document.getElementById("dynamic_profile_prev_select").options.length;
    if(select_length != 0)
    {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        cell1.innerHTML = document.getElementById("dynamic_profile_prev_select").value;
    }
}


function select_dynamic_profile_next_table()
{
    var table = document.getElementById("dynamic_profile_table_next"),rIndex;
    var startindex = 1;
  
  
    for(var i = startindex; i < table.rows.length; i++)
    {
      table.rows[i].onclick = function()
      {
          document.getElementById("dynamic_profile_next_delete").style.color = "red";
          document.getElementById("dynamic_profile_next_delete").disabled = false;
          for(var i = startindex; i < table.rows.length; i++)
            {
              var css = '#dynamic_profile_table_next tr:not(:first-child):hover';
              table.rows[i].style = css;
            }
          this.style.backgroundColor = "#ddd";
  
      
          rIndex = this.rowIndex;
          document.getElementById("dynamic_profile_next_row_id").innerHTML = rIndex;
        }
    }
}

function select_dynamic_profile_prev_table()
{
    var table = document.getElementById("dynamic_profile_table_prev"),rIndex;
    var startindex = 1;
  
  
    for(var i = startindex; i < table.rows.length; i++)
    {
      table.rows[i].onclick = function()
      {
          document.getElementById("dynamic_profile_prev_delete").style.color = "red";
          document.getElementById("dynamic_profile_prev_delete").disabled = false;
          for(var i = startindex; i < table.rows.length; i++)
            {
              var css = '#dynamic_profile_table_prev tr:not(:first-child):hover';
              table.rows[i].style = css;
            }
          this.style.backgroundColor = "#ddd";
  
      
          rIndex = this.rowIndex;
          document.getElementById("dynamic_profile_prev_row_id").innerHTML = rIndex;
        }
    }
}
function delete_dynamic_profile_next()
{
    var row_id = parseInt(document.getElementById("dynamic_profile_next_row_id").innerHTML);
    document.getElementById("dynamic_profile_table_next").deleteRow(row_id);

    reset_next_table()
}



function delete_dynamic_profile_prev()
{
    var row_id = parseInt(document.getElementById("dynamic_profile_prev_row_id").innerHTML);
    document.getElementById("dynamic_profile_table_prev").deleteRow(row_id);

    reset_prev_table()
}

function reset_next_table()
{
    document.getElementById("dynamic_profile_next_delete").disabled = true;
    document.getElementById("dynamic_profile_next_delete").style.color = "rgb(182, 182, 182)";

    var table = document.getElementById("dynamic_profile_table_next");
    for(var i = 1; i < table.rows.length; i++)
    {
        var css = '#dynamic_profile_table_next tr:not(:first-child):hover';
        table.rows[i].style = css;
    }
}

function reset_prev_table()
{
    document.getElementById("dynamic_profile_prev_delete").disabled = true;
    document.getElementById("dynamic_profile_prev_delete").style.color = "rgb(182, 182, 182)";

    var table = document.getElementById("dynamic_profile_table_prev");
    for(var i = 1; i < table.rows.length; i++)
    {
        var css = '#dynamic_profile_table_prev tr:not(:first-child):hover';
        table.rows[i].style = css;
    }
}