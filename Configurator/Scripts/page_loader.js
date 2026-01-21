// Store references to all page containers
const pages = {
  home: document.getElementById('home-page'),
  general: document.getElementById('general-page'),
  idle: document.getElementById('idle-page'),
  codeboxes: document.getElementById('codeboxes-page'),
  led_options: document.getElementById('led_options-page'),
  buttons: document.getElementById('buttons-page'),
  default_colors: document.getElementById('default_colors-page'),
  player_leds: document.getElementById('player_leds-page'),
  eightway: document.getElementById('eightway-page'),
  oled: document.getElementById('oled-page')
};


// Initialize Coloris color picker
function initColorPicker() {
  if (typeof Coloris !== 'undefined') {
    Coloris({
      el: '.coloris',
      theme: 'default',
      themeMode: 'light',
      format: 'hex',
      swatches: [
        '#264653', '#2a9d8f', '#e9c46a',
        '#f4a261', '#e76f51', '#d62828',
        '#003049', '#fcbf49', '#f77f00'
      ],
      onChange: (color) => {
        //console.log('Color changed:', color);
        ;
      }
    });
    //console.log('Coloris initialized on:', document.querySelectorAll('.coloris'));
  } else {
    //console.error('Coloris not loaded!');
    ;
  }
}

// Load individual page
function fetchPage(page) {
  return fetch(`pages/${page}.html`)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load ${page}.html`);
      return response.text();
    })
    .then(html => {
      pages[page].innerHTML = html;

      // Initialize page-specific components
      switch (page) {
        case 'home':
          initColorPicker();
          break;
        case 'general':
          initProfileValidation();
          break;
        case 'codeboxes':
          initDropHandler();
          break;
        case 'oled':
          if (typeof initOledComponents === 'function') {
            initOledComponents(); 
          }
          break;
      }

      return page; // Return page name for chaining
    })
    .catch(error => {
      console.error(error);
      pages[page].innerHTML = `
        <div class="error-message">
          <h2>Error loading ${page} page</h2>
          <p>${error.message}</p>
        </div>
      `;
      return Promise.reject(error);
    });
}

// Load all pages at startup
function loadAllPages() {
  return Promise.all([
    fetchPage('home'),
    fetchPage('general'),
    fetchPage('idle'),
    fetchPage('codeboxes'),
    fetchPage('led_options'),
    fetchPage('buttons'),
    fetchPage('default_colors'),
    fetchPage('player_leds'),
    fetchPage('eightway'),
    fetchPage('oled')
  ]);
}

// Initialize drop handler for codeboxes
function initDropHandler() {
  const textbox = document.getElementById('new_codebox');
  const droppable = document.getElementById('droppable');

  if (!textbox || !droppable) {
    console.warn('Drop handler elements not found - may not be on codeboxes page');
    return;
  }

  // Your existing drop handler implementation...
  console.log('Drop handler initialized');
}

// Initialize components for the current page
function initPageComponents() {
  Object.entries(pages).forEach(([name, element]) => {
    if (element && element.style.display !== 'none') {
      switch (name) {
        case 'home':
          initColorPicker();
          break;
        case 'codeboxes':
          initDropHandler();
          break;
      }
    }
  });
}

// Show the selected page and hide others
function showPage(page) {
  // Hide all pages first
  Object.values(pages).forEach(pageEl => {
    if (pageEl) pageEl.style.display = 'none';
  });

  // Show the selected page
  if (pages[page]) {
    pages[page].style.display = 'block';
    initPageComponents(); // Initialize components for the shown page

    // Additional page-specific initializations
    if (page === 'home') {
      console.log('Home page shown - color picker ready');
    }
  }
}

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', function () {
  // Load all pages at startup
  loadAllPages()
    .then(() => {
      showPage('home'); // Show home page by default
      console.log('All pages loaded successfully');
    })
    .catch(error => {
      console.error('Error loading pages:', error);
    });
});

// Make functions available globally
window.showPage = showPage;
window.initColorPicker = initColorPicker;

