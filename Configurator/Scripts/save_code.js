function copy_to_clipboard() {
    if (check_gpio_conflicts() == false)
        return;
    generate_code();
    var copyText = document.getElementById("code_box");

    copyText.select();
    copyText.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(copyText.value);

    // Alert the copied text
    showMessage('Code successfully saved to clipboard', 'success');
}

function save_code(filename, type) {
    if (check_gpio_conflicts() == false)
        return;
    generate_code();
    var data = document.getElementById("code_box").value;
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}