// 1. Configuration & Global State button_combos.js
let combo_sprites_available_buttons = [];
let spriteFrames = [];
let currentSpriteIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('comboImageLoader');
    if (fileInput) {
        fileInput.addEventListener('change', handleSpriteUpload);
    }
    // Initialize empty canvas
    drawSpriteFrame(0);
});

function removeComboButtonByName(name) {
    const idx = combo_sprites_available_buttons.indexOf(name);
    if (idx !== -1) {
        combo_sprites_available_buttons.splice(idx, 1);
        updateAllComboDropdowns();
    }
}

let comboRowCounter = 0;
function addComboRow(initialData = { buttons: [], sprite: 0 }) {
    const container = document.getElementById('combo_rows_container');
    if (!container) return;

    const rowId = `row_${comboRowCounter++}`;
    const row = document.createElement('div');
    row.className = 'combo-row';
    row.dataset.id = rowId;
    row.selectedButtons = initialData.buttons;

    let options = `<option value="" disabled selected>+ Add Button</option>`;
    combo_sprites_available_buttons.forEach(btn => {
        options += `<option value="${btn}">${btn}</option>`;
    });

    row.innerHTML = `
        <div class="button-selection-area">
            <div class="btn-chips" id="chips_${rowId}"></div>
            <select class="form-select" onchange="handleSelectButton(this, '${rowId}')">
                ${options}
            </select>
        </div>
        <div class="control-row">
            <label>Sprite:</label>
            <input type="number" class="form-input sprite-idx-input" value="${initialData.sprite}" min="0">
        </div>
        <button class="action-btn danger" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(row);
    renderChips(rowId);
}

function updateAllComboDropdowns() {
    const selects = document.querySelectorAll(
        '#combo_rows_container select.form-select'
    );

    let options = `<option value="" disabled selected>+ Add Button</option>`;
    combo_sprites_available_buttons.forEach(btn => {
        options += `<option value="${btn}">${btn}</option>`;
    });

    selects.forEach(select => {
        const currentValue = select.value; // preserve selection
        select.innerHTML = options;

        if (combo_sprites_available_buttons.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

function handleSelectButton(selectEl, rowId) {
    const row = document.querySelector(`.combo-row[data-id="${rowId}"]`);
    const val = selectEl.value;
    if (val && !row.selectedButtons.includes(val)) {
        row.selectedButtons.push(val);
        renderChips(rowId);
    }
    selectEl.selectedIndex = 0;
}

function renderChips(rowId) {
    const row = document.querySelector(`.combo-row[data-id="${rowId}"]`);
    const container = document.getElementById(`chips_${rowId}`);
    if (!container) return;

    container.innerHTML = '';
    row.selectedButtons.forEach((btn, idx) => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `${btn} <span class="remove" onclick="removeChip('${rowId}', ${idx})" style="cursor: pointer;">×</span>`;
        container.appendChild(chip);
    });
}

function updateAllChips() {
    document.querySelectorAll('.combo-row').forEach(row => {
        const rowId = row.dataset.id;

        // Remove buttons that no longer exist
        row.selectedButtons = row.selectedButtons.filter(btn =>
            combo_sprites_available_buttons.includes(btn)
        );

        renderChips(rowId);
    });
}

function removeChip(rowId, index) {
    const row = document.querySelector(`.combo-row[data-id="${rowId}"]`);
    row.selectedButtons.splice(index, 1);
    renderChips(rowId);
}

/**
 * 1. File Upload Handler
 * Triggered when a file is selected via the #comboImageLoader input.
 */
function handleSpriteUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;

        // remove everything except hex
        const cleanHex = text.replace(/[^0-9A-Fa-f]/g, '');

        const HEX_PER_FRAME = 2048; // adjust if needed
        spriteFrames = [];

        for (let i = 0; i + HEX_PER_FRAME <= cleanHex.length; i += HEX_PER_FRAME) {
            const frameHex = cleanHex.slice(i, i + HEX_PER_FRAME);
            spriteFrames.push(hexToBytes(frameHex));
        }

        if (spriteFrames.length > 0) {
            currentSpriteIndex = 0;
            drawSpriteFrame(0);
        }

        console.log("Loaded frames:", spriteFrames.length);

    };

    reader.readAsText(file);
}

/**
 * 2. Hex to Byte Converter
 */
function hexToBytes(hex) {
    let bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

/**
 * 3. Canvas Drawing Logic
 * Maps 1024 bytes (8192 bits) to a 128x64 grid.
 */
function drawSpriteFrame(index) {
    const canvas = document.getElementById('my_combo_canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set internal resolution to match OLED
    canvas.width = 128;
    canvas.height = 64;

    // Fill background black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 128, 64);

    if (!spriteFrames[index]) return;

    const data = spriteFrames[index];
    const imageData = ctx.createImageData(128, 64);

    for (let i = 0; i < data.length; i++) {
        let byte = data[i];
        for (let bit = 0; bit < 8; bit++) {
            let pixelIndex = (i * 8) + bit;
            let x = pixelIndex % 128;
            let y = Math.floor(pixelIndex / 128);

            if (y >= 64) break;

            // Check if bit is set (Standard OLED: 1 is White/On)
            let isOn = (byte & (0x80 >> bit));
            let canvasIdx = (y * 128 + x) * 4;

            let color = isOn ? 255 : 0;
            imageData.data[canvasIdx] = color;     // R
            imageData.data[canvasIdx + 1] = color; // G
            imageData.data[canvasIdx + 2] = color; // B
            imageData.data[canvasIdx + 3] = 255;   // Alpha (Opaque)
        }
    }
    ctx.putImageData(imageData, 0, 0);
    updateSpriteIndexDisplay();
    const input = document.getElementById('oled_default_sprite');
    input.max = spriteFrames.length - 1;
}


function updateSpriteIndexDisplay() {
    const current_index = document.getElementById('oled_sprite_index');
    current_index.textContent = currentSpriteIndex + '/' + (spriteFrames.length - 1);
}
function cycleSprite(direction) {
    if (spriteFrames.length === 0) return;
    currentSpriteIndex = (currentSpriteIndex + direction + spriteFrames.length) % spriteFrames.length;
    drawSpriteFrame(currentSpriteIndex);

}

function previewFromInput(value) {
    const idx = parseInt(value);
    if (!isNaN(idx) && idx >= 0 && idx < spriteFrames.length) {
        currentSpriteIndex = idx;
        drawSpriteFrame(idx);
    }
}

function toggle_combo_sprite_checkbox()
{
    const checkbox = document.getElementById('oled_enable_default_sprite');
    if (checkbox.checked) {
        document.getElementById('oled_default_sprite').disabled = true;
        document.getElementById('combo-default_label').setAttribute('disabled', '');
    } else {
        document.getElementById('oled_default_sprite').disabled = false;
        document.getElementById('combo-default_label').removeAttribute('disabled');
    }
}