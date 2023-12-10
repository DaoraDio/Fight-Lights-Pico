
function remove_bigger_led_numbers()
{
  var numleds = document.getElementById("led_count").value;
  numleds = parseInt(numleds);
  var table = document.getElementById("button_table");
  for (var i = 1, row; row = table.rows[i]; i++) 
  {
      var led_pos = table.rows[i].cells[1].innerHTML;
      var arr = led_pos.split(" ");
      for(var j = 0; j < arr.length; j++)
      {
        if(parseInt(arr[j]) > numleds)
          delete arr[j];
      }
      var collapsedString = arr.join(" ");
      if (collapsedString.trim().length === 0)
          collapsedString = "Not Set";
      table.rows[i].cells[1].innerHTML = collapsedString;
  }
}

function update_eightway_modal()
{
    var numleds = parseInt(document.getElementById("led_count").value);
}

function call_on_input()
{
    remove_bigger_led_numbers();
    show_idle_exlude_modal(false);
    eightway_show_led_modal(false);
    close_eightway_led_modal();
}