var slider = document.getElementById("myRange");
var output = document.getElementById("brightness");
output.innerHTML = slider.value;

slider.oninput = function() 
{
  output.innerHTML = this.value;
}

function update_smooth_value()
{
  var val = document.getElementById("smooth_speed").value;
  document.getElementById("smooth_label").innerText = "Speed: " + val;
}

function show_smooth_slider()
{
  var brightness_steps = document.getElementById("brightness_steps");
  if(brightness_steps.value == "smooth")
  {
    document.getElementById("smooth_speed").hidden = false;
    document.getElementById("smooth_label").hidden = false;
  }
  else
  {
    document.getElementById("smooth_speed").hidden = true;
    document.getElementById("smooth_label").hidden = true;
  }
}