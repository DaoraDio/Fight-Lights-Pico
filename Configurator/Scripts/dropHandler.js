// Global flag to prevent multiple initializations
let dropHandlerInitialized = false;

/**
 * Initialize the drop handler for file uploads
 * Will retry up to 10 times if elements aren't found
 */
function initDropHandler() {
  // Prevent duplicate initialization
  if (dropHandlerInitialized) return;
  
  const MAX_RETRIES = 10;
  let retryCount = 0;

  // Main initialization attempt
  function attemptInit() {
    const textbox = document.getElementById("new_codebox");
    const droppable = document.getElementById("droppable");

    // Debug logging
    /*console.log(`Init attempt ${retryCount + 1}:`, { 
      textboxExists: !!textbox, 
      droppableExists: !!droppable 
    });*/

    // If elements exist, setup handlers
    if (textbox && droppable) {
      if (!droppable._dropHandlerConfigured) {
        droppable.addEventListener("dragover", handleDragOver);
        droppable.addEventListener("drop", handleDrop);
        droppable._dropHandlerConfigured = true;
        dropHandlerInitialized = true;
        //console.log("Drop handler successfully initialized");
      }
    } 
    // Otherwise retry (up to MAX_RETRIES)
    else if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(attemptInit, 100);
    } else {
      console.error("Failed to initialize drop handler after", MAX_RETRIES, "attempts");
    }
  }

  // Handle dragover event
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    event.currentTarget.classList.add("drag-active");
  }

  // Handle drop event
  async function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("drag-active");
    
    const textbox = document.getElementById("new_codebox");
    if (!textbox) {
      console.error("Textbox not found during drop");
      return;
    }

    // Validate dropped files
    if (!event.dataTransfer.files?.length) {
      showMessage('No files were dropped', 'error');
      return;
    }

    const file = event.dataTransfer.files[0];
    if (!file.type.startsWith("text/") && !file.name.includes(".")) {
      showMessage('Please drop a text file', 'warning');
      return;
    }

    // Read and load file
    try {
      textbox.value = await file.text();
      textbox.dispatchEvent(new Event("input", { bubbles: true }));
      if (window.fill_configurator) fill_configurator();
      showMessage(`File "${file.name}" loaded successfully!`, 'success');
      generate_code();
    } catch (error) {
      console.error("Failed to read file:", error);
      showMessage('Failed to load file', 'error');
    }
  }

  // Start initialization
  attemptInit();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDropHandler);
} else {
  // DOM already loaded
  initDropHandler();
}

