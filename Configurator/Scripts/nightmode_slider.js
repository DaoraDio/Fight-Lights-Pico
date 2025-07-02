function toggle_nightmode() {
    //console.log("Toggling night mode");
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.getAttribute('data-theme');
    
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    
    //Save preference to cookie (expires in 1 year)
    document.cookie = `theme=${newTheme}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    
    const toggle = document.getElementById('theme-toggle-checkbox');
    if (toggle) {
        toggle.checked = newTheme === 'light'; 
    }
    
    //console.log(`Theme changed to ${newTheme} mode`);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function initialize_theme() {
    const savedTheme = getCookie('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let initialTheme = 'light';
    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (prefersDark) {
        initialTheme = 'dark';
    }
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    const toggle = document.getElementById('theme-toggle-checkbox');
    if (toggle) {
        toggle.checked = initialTheme === 'light'; // Notice 'light' instead of 'dark'
    }
    
    //set initial cookie if none exists
    if (!savedTheme) {
        document.cookie = `theme=${initialTheme}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
    }
}


initialize_theme();

//System preference listener
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!getCookie('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        document.cookie = `theme=${newTheme}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
        const toggle = document.getElementById('theme-toggle-checkbox');
        if (toggle) {
            toggle.checked = newTheme === 'light';
        }
    }
});