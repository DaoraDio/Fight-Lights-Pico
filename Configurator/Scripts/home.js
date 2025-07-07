function toggleDropdown() {
  // Stop the click from propagating to document
  event.stopPropagation();
  
  // Find the closest dropdown parent
  const dropdown = event.target.closest('.dropdown');
  
  // Toggle the active class
  dropdown.classList.toggle('active');
}

// Close dropdown when clicking anywhere else
document.onclick = function() {
  const activeDropdown = document.querySelector('.dropdown.active');
  if (activeDropdown) {
    activeDropdown.classList.remove('active');
  }
};