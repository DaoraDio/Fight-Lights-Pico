function initNumberInputRestriction() {
  const ledCountInput = document.getElementById('led_count');
  
  if (ledCountInput) {
    ledCountInput.addEventListener('keydown', function(e) {
      // Allow: backspace, delete, tab, escape, enter, arrows
      if ([46, 8, 9, 27, 13, 38, 40].includes(e.keyCode) ||
         // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
         (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) ||
         // Allow: home, end, left, right
         (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
      }
      // Prevent all other input
      e.preventDefault();
    });
  } else {
    // Retry after short delay if element not found
    setTimeout(initNumberInputRestriction, 100);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNumberInputRestriction);
} else {
  // DOM already loaded
  initNumberInputRestriction();
}