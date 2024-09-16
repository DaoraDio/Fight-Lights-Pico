document.addEventListener('DOMContentLoaded', function() 
{
    // Get references to the menu and menu items
    const customMenu = document.getElementById('rightclick-menu');
    const menuItems = customMenu.querySelectorAll('li');

    // Define action functions
    function action1() {
        paste();
        hideCustomMenu();
    }

    function action2() {
        copy_to_clipboard()
        hideCustomMenu();
    }

    function action3() {
        save_code('config.py');
        hideCustomMenu();
    }
    function action4() 
    {
        if (confirm("All your changes will be lost and the default code will be loaded, do you want to continue?")) 
        {
            fill_with_default_config();
            hideCustomMenu();
        } 
        else 
        {
            hideCustomMenu();
            return;
        }
        
        
    }
    
    // Assign event handlers to menu items
    menuItems[0].addEventListener('click', action1);
    menuItems[1].addEventListener('click', action2);
    menuItems[2].addEventListener('click', action3);
    menuItems[3].addEventListener('click', action4);

    // Function to show the custom menu
    function showCustomMenu(event) {
        event.preventDefault();
        customMenu.style.top = `${event.pageY}px`;
        customMenu.style.left = `${event.pageX}px`;
        customMenu.classList.remove('hidden');
    }

    // Function to hide the custom menu
    function hideCustomMenu() {
        customMenu.classList.add('hidden');
    }

    // Add event listeners
    document.addEventListener('contextmenu', showCustomMenu);
    document.addEventListener('click', hideCustomMenu);
});
