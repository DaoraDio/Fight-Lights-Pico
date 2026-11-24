// 1. Configuration & Global State button_combos.js
let combo_sprites_available_buttons = [];
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