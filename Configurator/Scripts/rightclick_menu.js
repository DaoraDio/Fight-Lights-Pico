document.addEventListener('DOMContentLoaded', function() {
    const customMenu = document.getElementById('rightclick-menu');
    const menuItems = customMenu.querySelectorAll('li');
    let lastSelection = ""; // Store the selection here

    // Define action functions
    function action1() {
        paste();
        hideCustomMenu();
    }

    function action2() {
        copy_to_clipboard();
        hideCustomMenu();
    }

    function action3() {
        if (lastSelection) {
            navigator.clipboard.writeText(lastSelection)
                .then(() => {
                    showMessage('Selected text copied to clipboard!', 'success');
                })
                .catch(err => {
                    console.error('Failed to copy text:', err);
                    showMessage('Failed to copy selected text', 'error');
                });
        } else {
            showMessage('No text selected', 'warning');
        }
        hideCustomMenu();
    }

    function action4() {
        save_code('config.py');
        hideCustomMenu();
    }

    function action5() {
        if (confirm("All your changes will be lost and the default code will be loaded, do you want to continue?")) {
            fill_with_default_config();
            hideCustomMenu();
            showMessage(`Preset code loaded successfully!`, 'success');
        } else {
            hideCustomMenu();
            return;
        }
    }
    
    // Assign event handlers
    menuItems[0].addEventListener('click', action3);
    menuItems[1].addEventListener('click', action2);
    menuItems[2].addEventListener('click', action1);
    menuItems[3].addEventListener('click', action4);
    menuItems[4].addEventListener('click', action5);

    // Store selection when right-click occurs
    function showCustomMenu(event) {
        // Save selection before showing menu
        lastSelection = window.getSelection().toString();
        
        event.preventDefault();
        customMenu.style.top = `${event.pageY}px`;
        customMenu.style.left = `${event.pageX}px`;
        customMenu.classList.remove('hidden');
    }

    function hideCustomMenu() {
        customMenu.classList.add('hidden');
    }

    document.addEventListener('contextmenu', showCustomMenu);
    document.addEventListener('click', hideCustomMenu);
});