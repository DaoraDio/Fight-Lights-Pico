function downloadFilesAsZip() {
    // Get status element when function is called
    const zipStatusEl = document.getElementById('zipStatus');

    if (!zipStatusEl) {
        alert('Status element not found - make sure element with id="zipStatus" exists');
        return;
    }

    // Show loading status immediately
    zipStatusEl.textContent = "Preparing download...";
    zipStatusEl.style.color = "";


    // List of files to download
    const filesToDownload = [
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/animation.py',
            name: 'animation.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/button.py',
            name: 'button.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/config.py',
            name: 'config.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/functions.py',
            name: 'functions.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/init.py',
            name: 'init.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/main.py',
            name: 'main.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/oled.py',
            name: 'oled.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/playerLED.py',
            name: 'playerLED.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/sh1106.py',
            name: 'sh1106.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/ssd1306.py',
            name: 'ssd1306.py'
        },
        {
            url: 'https://raw.githubusercontent.com/DaoraDio/Fight-Lights-Pico/refs/tags/v2.7.0/statemachine.py',
            name: 'statemachine.py'
        }
    ];

    // Create the zip file
    createZip(filesToDownload, zipStatusEl)
        .catch(error => {
            console.error('Download failed:', error);
            //zipStatusEl.textContent = `Error: ${error.message}`;
            //zipStatusEl.style.color = "red";
            //alert('Download failed. See console for details.');
            showMessage('Download Failed.', 'error');
        });
}

async function createZip(filesToDownload, statusEl) {
    if (typeof JSZip === 'undefined') {
        statusEl.textContent = "Error: Required library not loaded (you might be offline)";
        statusEl.style.color = "red";
        //throw new Error('JSZip library not available - check your internet connection');
        showMessage('Download Failed. Check your Internet connection', 'error');
        return;
    }
    const zip = new JSZip();

    //README file
    const readmeContent = `# Fight Lights Pico Files

This ZIP contains all the necessary files for the Fight Lights Pico project.

##How to Use
1. Download the latest Micropython Firmware for your board[Raspberry Pi Pico firmware](https://micropython.org/download/)
2. Flash the firmware to your Raspberry Pi Pico
3. Upload the files in this ZIP (except this README) to your Raspberry Pi Pico using a tool like [Thonny](https://thonny.org/) 
4. Open the main.py file in Thonny and run it to start the application

## config.py
The 'config.py' file contains all the custom configuration settings for the project.
You can modify it using the configurator to easily customize your LED setup.
The 'config.py' file in this ZIP is the default configuration file and will never have your custom settings.

## Version
Files are from version 2.7.0 of the project

## Included Files:
- animation.py
- button.py
- config.py
- functions.py
- init.py
- main.py
- oled.py
- playerLED.py
- sh1106.py
- ssd1306.py
- statemachine.py
`;

    zip.file("README.txt", readmeContent);

    // Download each file
    for (const file of filesToDownload) {
        try {
            statusEl.textContent = `Downloading ${file.name}...`;
            const response = await fetch(file.url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const content = await response.text();
            zip.file(file.name, content);
        } catch (error) {
            console.error(`Error with ${file.name}:`, error);
            throw new Error(`Failed to download ${file.name}: ${error.message}`);
        }
    }

    statusEl.textContent = "Creating ZIP file...";
    const content = await zip.generateAsync({ type: 'blob' });

    // Trigger download
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fight-lights-files.zip';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
        statusEl.textContent = "";
        //statusEl.style.color = "green";
        showMessage('Download Complete!', 'success');
    }, 100);
}