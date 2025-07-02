let messageCounter = 0;

function showMessage(text, type = 'info', duration = 3000) {
  const container = document.getElementById('messageContainer') || createMessageContainer();
  const id = `msg-${messageCounter++}`;
  
  const messageBox = document.createElement('div');
  messageBox.id = id;
  messageBox.className = `message-box ${type}`;
  messageBox.innerHTML = `<span>${text}</span>`;
  
  container.appendChild(messageBox);
  
  // Trigger animation
  setTimeout(() => messageBox.classList.add('visible'), 10);
  
  // Auto-remove after duration
  setTimeout(() => {
    messageBox.classList.remove('visible');
    setTimeout(() => messageBox.remove(), 300); // Wait for fade-out
  }, duration);
}

function createMessageContainer() {
  const container = document.createElement('div');
  container.id = 'messageContainer';
  container.className = 'message-container';
  document.body.appendChild(container);
  return container;
}

//example usage
/* Show different types of messages
showMessage('Action completed successfully!', 'success');
showMessage('An error occurred!', 'error', 5000); // Longer duration
showMessage('Please check your input', 'warning');
showMessage('New update available', 'info');

// Simple message (defaults to info type)
showMessage('Your settings have been saved');*/