function initProfileValidation() {
    const nameInput = document.getElementById('profile_name');
    const saveButton = document.getElementById('save_btn');

    if (!nameInput) return;

    const brightGreen = "#2ecc71"; 
    const brightRed = "#e74c3c";

    nameInput.addEventListener('input', function() {
        if (check_name(nameInput.value) === true) {
            nameInput.style.borderColor = brightGreen;
            nameInput.style.boxShadow = `0 0 5px ${brightGreen}`; // Adds a subtle glow
            if (saveButton) saveButton.disabled = false;
        } else {
            nameInput.style.borderColor = brightRed;
            nameInput.style.boxShadow = `0 0 5px ${brightRed}`;
            if (saveButton) saveButton.disabled = true;
        }
    });

    nameInput.addEventListener('blur', function() {
        const validationResult = check_name(nameInput.value);

        if (validationResult !== true && nameInput.value !== "") {
            showMessage(validationResult, 'error');
            nameInput.value = "";
            
            //Reset UI after clearing
            nameInput.style.borderColor = brightRed;
            nameInput.style.boxShadow = "none";
            if (saveButton) saveButton.disabled = true;
        }
    });
}

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

function get_brightness_value() {
  return document.getElementById('startup_brightness').value;
}

function hexTorgb(hex) {
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

//remmove the led number from buttons when number of leds is lowered
function remove_bigger_led_numbers() {
  var numleds = document.getElementById("led_count").value;
  numleds = parseInt(numleds);
  var table = document.getElementById("button_table");
  for (var i = 1, row; row = table.rows[i]; i++) {
    var led_pos = table.rows[i].cells[1].innerHTML;
    var btn_name = table.rows[i].cells[0].innerHTML;
    var arr = led_pos.split(" ");
    for (var j = 0; j < arr.length; j++) {
      if (parseInt(arr[j]) > numleds) {
        showMessage("LED  #" + arr[j] + " removed from " + btn_name + " Button", 'warning');
        delete arr[j];
      }
    }
    var collapsedString = arr.join(" ");
    if (collapsedString.trim().length === 0)
      collapsedString = "Not Set";
    table.rows[i].cells[1].innerHTML = collapsedString;
  }
}

function remove_eightway_led_numbers() {
  const numleds = parseInt(document.getElementById("led_count").value);
  const arrows = document.querySelectorAll('.arrow');
  let removedNumbers = {}; // Store removed numbers per direction
  
  arrows.forEach(arrow => {
    const direction = arrow.classList[1].replace('arrow-', ''); // Get direction (up, down, etc)
    let currentLedPos = arrow.getAttribute('led_pos');
    
    if (currentLedPos === 'not Set') return;
    
    if (!currentLedPos || currentLedPos === '0' || !currentLedPos.trim()) {
      arrow.setAttribute('led_pos', 'not Set');
      return;
    }
    
    const originalNumbers = currentLedPos.split(' ').map(Number);
    const validNumbers = originalNumbers.filter(n => !isNaN(n) && n > 0 && n <= numleds);
    const removed = originalNumbers.filter(n => n > numleds);
    
    if (removed.length > 0) {
      if (!removedNumbers[direction]) {
        removedNumbers[direction] = [];
      }
      removedNumbers[direction].push(...removed);
    }
    
    if (validNumbers.length === 0) {
      arrow.setAttribute('led_pos', 'not Set');
    } else {
      arrow.setAttribute('led_pos', validNumbers.join(' '));
    }
  });
  
  // Show message for each direction with removed numbers
  for (const [direction, numbers] of Object.entries(removedNumbers)) {
    if (numbers.length > 0) {
      const uniqueNumbers = [...new Set(numbers)]; // Remove duplicates
      showMessage(
        `Removed LED # ${uniqueNumbers.join(', ')} from ${direction} direction`,
        'warning'
      );
    }
  }
  eightway_reset();
}