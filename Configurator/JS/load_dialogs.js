// dialogs.js

// Function to load dialogs from multiple HTML files
export function loadDialogs(dialogFiles) {
    const promises = dialogFiles.map(file => fetch(file).then(response => response.text()));

    Promise.all(promises)
        .then(htmls => {
            htmls.forEach(html => {
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(html, 'text/html');
                const dialogs = htmlDoc.querySelectorAll('dialog');
                dialogs.forEach(dialog => {
                    document.body.appendChild(dialog);
                });
            });
        })
        .catch(error => {
            console.error('Error loading dialogs:', error);
        });
}

// Function to close a dialog
export function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.close();
    }
}
