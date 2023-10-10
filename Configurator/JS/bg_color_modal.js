function fill_bg_table_from_loaded_box()
{
    var background = get_value("background = ");
    background = background.substring(1);
    background = background.slice(0,-1);
    background = background.split('),(');
    background[0] = background[0].substring(1);
    background[background.length-1] = background[background.length-1].slice(0,-1);
    //console.log("BACKGROUND:", background);

    var codebox2 = document.getElementById("new_codebox");
    if(codebox2.value != "")
    {
        for(var i = 0; i < document.getElementById("led_count").value; i++)
        {
            var row = background_table.rows[i+1];
    
            var split_arr = background[i].split(',');
    
            row.cells[0].innerHTML = parseInt(split_arr[2])
            row.cells[1].innerHTML = split_arr[1];
            row.cells[2].innerHTML = parseFloat(split_arr[0])*100 + "%";
        }
    }
}

function set_bg_table()
{   
    var background_table = document.getElementById("background_table");
    background_table.innerHTML = '<table class="tg" id="background_table" onmouseover="select_bg_table()"><tr><th>LED Number</th><th>Color</th><th>Brightness</th></tr>';
    for(var i = 0; i < document.getElementById("led_count").value; i++)
    {
        var row = background_table.insertRow();

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
    
        cell1.innerHTML = i + 1;
        cell2.innerHTML = "blank";
        cell3.innerHTML = "100%";
    }

    fill_bg_table_from_loaded_box();

}

function show_bg_modal()
{
    var modal = document.getElementById("set_background_modal");
    var table = document.getElementById("color_table");
    var color_select = document.getElementById("bg_color_select");

    var select = '<select value="bg_color_select" id="bg_color_select" onchange="select_set_color()"><optgroup label="Special option"><option>rainbow</option></optgroup><optgroup label="Colors">';
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
      var col_name = row.innerText;
      col_name = col_name.split("\t");
      select += '<option>' + col_name[0] + '</option>';
    }
    select += '</optgroup></select>';
    color_select.innerHTML = select;


    modal.showModal();
}


function close_bg_modal()
{
    var modal = document.getElementById("set_background_modal");

    modal.close();
}

function set_brightness()
{
    var slider = document.getElementById("bg_brightness");
    var text = document.getElementById("brightness_text");
    var table = document.getElementById("background_table");
    var row_id = document.getElementById("bg_row_id").value;

    text.innerHTML = slider.value;

    if(row_id == undefined)
        return;
    table.rows[row_id].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';

}

function select_bg_table()
{
    var table = document.getElementById("background_table"),rIndex;
    var row_id = document.getElementById("bg_row_id");
    var select = document.getElementById("bg_color_select");
    var startindex = 1;

    for(var i = startindex; i < table.rows.length; i++)
    {
      table.rows[i].onclick = function()
      {
          for(var i = startindex; i < table.rows.length; i++)
            {
              var css = '#background_table tr:not(:first-child):hover';
              table.rows[i].style = css;
            }
          this.style.backgroundColor = "#ddd";
  
          rIndex = this.rowIndex;
         
         row_id.innerHTML = "LED: " + rIndex;
         row_id.value = rIndex;
         select.value = table.rows[rIndex].cells[1].innerHTML;

         var brightness_val = table.rows[rIndex].cells[2].innerHTML;
         brightness_val = brightness_val.slice(0,-1);
         document.getElementById("bg_brightness").value = brightness_val;

         var text = document.getElementById("brightness_text");
         text.innerHTML = brightness_val;
          
      }
    }
}

function select_set_color()
{
    var table = document.getElementById("background_table");
    var row_id = document.getElementById("bg_row_id").value;
    var select = document.getElementById("bg_color_select");

    table.rows[row_id].cells[1].innerHTML = select.value;
}

function bg_set_all()
{
    var table = document.getElementById("background_table");

    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        table.rows[i].cells[1].innerHTML = document.getElementById("bg_color_select").value;
        table.rows[i].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';
    }
}




function bg_set_color_all()
{
    var table = document.getElementById("background_table");

    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        table.rows[i].cells[1].innerHTML = document.getElementById("bg_color_select").value;
    }
}

function bg_set_brightness_all()
{
    var table = document.getElementById("background_table");

    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        table.rows[i].cells[2].innerHTML = document.getElementById("bg_brightness").value + '%';
    }
}
