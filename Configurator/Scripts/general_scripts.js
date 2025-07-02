function update_leniency_input() {
    var checkbox = document.getElementById("leniency_cb").checked;
    if (checkbox == true) {
        document.getElementById("leniency_tb").disabled = true;
        document.getElementById("leniency_tx").style.opacity = 0.5;
    }

    else {
        document.getElementById("leniency_tb").disabled = false;
        document.getElementById("leniency_tx").style.opacity = 1;
    }

}

function update_brightness_input() {
    let percentage = document.getElementById('startup_brightness').value;
    document.getElementById('brightness-value').textContent = percentage + '%';
}

function set_brightness_value(value) {
    document.getElementById('startup_brightness').value = value;
}

function get_brightness_value()
{
    return document.getElementById('startup_brightness').value;
}

function hexTorgb(hex) 
{
  return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
}

function setActiveLink(event) {
  // Remove active class from all nav links
  document.querySelectorAll('.nav-left a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelectorAll('.nav-right a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to clicked link
  event.target.classList.add('active');
}