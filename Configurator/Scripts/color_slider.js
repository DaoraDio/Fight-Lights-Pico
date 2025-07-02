document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const slideMenu = document.getElementById('slideMenu');
    const closeMenu = document.getElementById('closeMenu');
    const overlay = document.getElementById('overlay');
    
    // Calculate the correct menu width (responsive)
    function getMenuWidth() {
        if (window.innerWidth <= 480) {
            return window.innerWidth * 0.9;
        } else if (window.innerWidth <= 768) {
            return 300;
        } else {
            return 400;
        }
    }
    
    function openMenu() {
        const menuWidth = getMenuWidth();
        slideMenu.style.width = `${menuWidth}px`;
        slideMenu.classList.add('open');
        overlay.classList.add('active');
        document.body.classList.add('menu-open');
        menuToggle.classList.add('menu-open');
        menuToggle.style.right = `${menuWidth}px`;
    }
    
    function closeMenuFunc() {
        slideMenu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        menuToggle.classList.remove('menu-open');
        menuToggle.style.right = '0';
    }
    
    // Click handlers
    menuToggle.addEventListener('click', openMenu);
    closeMenu.addEventListener('click', closeMenuFunc);
    overlay.addEventListener('click', closeMenuFunc);
    
    // Add data-labels for mobile view
    function addDataLabels() {
        if (window.innerWidth <= 768) {
            const headers = document.querySelectorAll('.data-table th');
            const cells = document.querySelectorAll('.data-table td');
            
            headers.forEach((header, index) => {
                cells.forEach(cell => {
                    if (cell.cellIndex === index) {
                        cell.setAttribute('data-label', header.textContent);
                    }
                });
            });
        }
    }
    
    // Initialize data labels
    addDataLabels();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (slideMenu.classList.contains('open')) {
            const menuWidth = getMenuWidth();
            slideMenu.style.width = `${menuWidth}px`;
            menuToggle.style.right = `${menuWidth}px`;
        }
        addDataLabels();
    });
});