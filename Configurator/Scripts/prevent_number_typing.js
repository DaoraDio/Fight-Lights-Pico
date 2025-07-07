/**
 * Restricts input on specified elements with configurable number allowance
 * @param {Object} config - Configuration object with element selectors and options
 */
function initInputRestriction(config) {
  // Default configuration
  const defaultConfig = {
    elements: {
      // Default to original behavior (no numbers) for backward compatibility
      'led_count': { allowNumbers: false }
    }
  };

  // Merge user config with defaults
  config = { ...defaultConfig, ...config };

  // Process each element in the config
  Object.entries(config.elements).forEach(([selector, options]) => {
    const element = selector.startsWith('#') 
      ? document.querySelector(selector)
      : document.querySelector(`#${selector}`);

    if (element) {
      element.addEventListener('keydown', function(e) {
        // Always allow: backspace, delete, tab, escape, enter, arrows
        if ([46, 8, 9, 27, 13, 38, 40].includes(e.keyCode) ||
           // Always allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
           (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) ||
           // Always allow: home, end, left, right
           (e.keyCode >= 35 && e.keyCode <= 39)) {
          return;
        }

        // Conditionally allow numbers based on configuration
        if (options.allowNumbers && 
            ((e.keyCode >= 48 && e.keyCode <= 57) ||  // Main keyboard numbers
             (e.keyCode >= 96 && e.keyCode <= 105))) {  // Numpad numbers
          return;
        }

        // Prevent all other input
        e.preventDefault();
      });
    } else {
      // Retry after short delay if element not found
      setTimeout(() => initInputRestriction(config), 100);
    }
  });
}

// Initialize when DOM is ready
// Initialize when DOM is ready with example elements pre-configured
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initInputRestriction({
      elements: {
        'led_count': { allowNumbers: false },
        'fade_in': { allowNumbers: true },
        'fade_out': { allowNumbers: true },
        'leniency_tb': { allowNumbers: true },
        'rainbow_speed': { allowNumbers: true },
        'idle_tb': { allowNumbers: true },
        'idle1_speed': { allowNumbers: true },
        'led_options_start_time': { allowNumbers: true },
        'oled_button_radius': { allowNumbers: true },
        'oled_key_angle': { allowNumbers: true },
        'oled_animation_delay': { allowNumbers: true },
      }
    });
  });
} else {
  // DOM already loaded
  initInputRestriction({
    elements: {
      'led_count': { allowNumbers: false },
      'fade_in': { allowNumbers: true },
      'fade_out': { allowNumbers: true },
      'leniency_tb': { allowNumbers: true },
      'rainbow_speed': { allowNumbers: true },
      'idle_tb': { allowNumbers: true },
      'idle1_speed': { allowNumbers: true },
      'led_options_start_time': { allowNumbers: true },
      'oled_button_radius': { allowNumbers: true },
      'oled_key_angle': { allowNumbers: true },
      'oled_animation_delay': { allowNumbers: true },
    }
  });
}