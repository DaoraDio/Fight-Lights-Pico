/* Bind the existing view to the profile and file codecs. */
const Configurator = (() => {
    "use strict";
    const $ = id => document.getElementById(id);
    const rows = (id, start = 1) => Array.from($(id).rows).slice(start);
    const cell = (row, index) => row.cells[index].textContent.trim();
    const cardinals = new Set(["up", "down", "left", "right"]);
    const chordSelects = {
        ledOptions_increase_brightness: "led_options_inc_brightness",
        ledOptions_decrease_brightness: "led_options_dec_brightness",
        ledOptions_left_button: "led_options_left",
        ledOptions_right_button: "led_options_right",
        ledOptions_confirm: "led_options_confirm"
    };
    const numbers = {
        PIN_NUM: "pin_num", led_count: "led_count", idle_after: "idle_tb",
        idle_mode1_speed: "idle1_speed", ledOptions_start_time: "led_options_start_time",
        smooth_brightness_speed: "smooth_speed", rainbow_speed: "rainbow_speed",
        playerLED_PIN_NUM: "playerLED_pin_num", oled_idle: "oled_idle", oled_layout: "oled_layout",
        oled_type: "oled_type_select", oled_animation_delay: "oled_animation_delay"
    };
    const percentages = {
        brightness_mod: "startup_brightness", idle_mode3_brightness: "dim_brightness_slider",
        playerLED_brightness: "playerLED_brightness"
    };
    const switches = {
        onboard_led_on: "onboard_LED", save_stats: "stats_cb", clear_background_on_press: "clear_bg_on_press",
        ledOptions_profile_color_use_all_LEDs: "led_options_color_cb",
        invert_oled: "oled_invert_oled", rotate_oled: "oled_rotate_oled"
    };
    const colorInputs = {profile_color: "profile_color", ledOptions_color: "led_options_color"};
    let profile;
    let emptyEditorCode;
    let importRequest = 0;

    function setControl(id, value, optionLabel = String(value)) {
        const control = $(id);
        const text = String(value);
        if (control.tagName === "SELECT" && !Array.from(control.options).some(option => option.value === text))
            control.add(new Option(optionLabel, text));
        control.value = text;
    }

    function readNumber(value, label) {
        const result = Number(value);
        if (String(value).trim() === "" || !Number.isFinite(result)) throw new Error("Enter a number for " + label + ".");
        return result;
    }

    function readColor(text) {
        const value = text.trim();
        const hex = value.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);
        if (hex) {
            const expanded = hex[1].length === 3 ? [...hex[1]].map(c => c + c).join("") : hex[1];
            return expanded.match(/../g).map(channel => parseInt(channel, 16));
        }
        const match = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (match && match.slice(1).every(channel => Number(channel) <= 255)) return match.slice(1).map(Number);
        throw new Error("Invalid RGB color: " + value + ".");
    }

    const cssColor = value => "rgb(" + value.join(", ") + ")";
    const colorHex = value => "#" + value.map(channel => channel.toString(16).padStart(2, "0")).join("");
    const positions = (text, fallback, adjustment = 0) =>
        /^\s*not\s+set\s*$/i.test(text) || !text.trim() ? [fallback] :
            text.trim().split(/[\s,]+/).map(entry => readNumber(entry, "LED position") + adjustment);
    const fieldNumber = id => readNumber($(id).value, $(id).labels?.[0]?.textContent.trim() || id);

    function readView() {
        const settings = {...profile.settings};
        settings.profile_name = $("profile_name").value;
        for (const [key, id] of Object.entries(numbers)) settings[key] = fieldNumber(id);
        for (const [key, id] of Object.entries(percentages)) settings[key] = fieldNumber(id) / 100;
        // Sliders have display granularity. Preserve an imported value until its slider is edited.
        for (const [key, id] of [...Object.entries(percentages), ["smooth_brightness_speed", "smooth_speed"]]) {
            if ($(id).dataset.renderedValue === $(id).value) settings[key] = profile.settings[key];
        }
        for (const [key, id] of Object.entries(switches)) settings[key] = $(id).checked;
        for (const [key, id] of Object.entries(colorInputs)) settings[key] = readColor($(id).value);
        settings.leniency = $("leniency_cb").checked ? 0 : fieldNumber("leniency_tb");
        settings.idle_mode = $("idle_cb").checked ? 0 : fieldNumber("idle_select");
        settings.activate_player_led = !$("player_led_cb").checked;
        settings.activate_oled = !$("oled_cb").checked;
        settings.brightness_steps = $("brightness_steps").value === "smooth" ? "smooth" : 1 / fieldNumber("brightness_steps");
        if ($("brightness_steps").dataset.renderedValue === $("brightness_steps").value)
            settings.brightness_steps = profile.settings.brightness_steps;
        settings.i2c_interface = $("oled_i2c_rad1").checked ? 0 : 1;
        settings.oled_sda = fieldNumber("oled_sda" + settings.i2c_interface + "_select");
        settings.oled_scl = fieldNumber("oled_scl" + settings.i2c_interface + "_select");
        settings.oled_combo_idle_frame = $("oled_enable_default_sprite").checked ? -1 : fieldNumber("oled_default_sprite");

        const palette = rows("color_table").map(row => ({
            name: cell(row, 0), value: readColor(getComputedStyle(row.cells[1]).backgroundColor)
        }));
        const paletteNames = new Set(palette.map(entry => entry.name));
        const oldPalette = new Set(profile.palette.map(entry => entry.name));
        const randomColors = profile.randomColors.filter(name => paletteNames.has(name));
        for (const {name} of palette)
            if (!oldPalette.has(name) && name !== "blank") randomColors.push(name);
        if (randomColors.length > 1 && profile.randomColors.length === 1 && profile.randomColors[0] === "blank")
            randomColors.splice(randomColors.indexOf("blank"), 1);
        const buttons = rows("button_table").map(row => ({
            name: cell(row, 0), positions: positions(cell(row, 1), 0), color: cell(row, 2),
            fade: row.cells[3].querySelector("input").checked,
            pin: readNumber(row.cells[4].querySelector("select").value, "button GPIO"),
            fadeIn: readNumber(cell(row, 5), "fade in"), fadeOut: readNumber(cell(row, 6), "fade out")
        }));
        const chords = {
            OnOff_button: rows("on_off_table").map(row => cell(row, 0)),
            ledOptions_led_buttons: rows("led_options_table").map(row => cell(row, 0))
        };
        for (const [key, id] of Object.entries(chordSelects)) {
            const name = $(id).value;
            chords[key] = name ? (profile.chords[key][0] === name ? [...profile.chords[key]] : [name]) : [];
        }
        const directions = Object.fromEntries(Object.keys(ProfileCodec.directionKeys).map(id => {
            const arrow = document.querySelector(".arrow-" + id);
            const name = cardinals.has(id) ? $("eightway_select-" + id).value : "-1";
            return [id, {positions: positions(arrow.getAttribute("led_pos") ?? "", -1, -1),
                color: arrow.getAttribute("directioncolor") || "blank",
                button: name && name !== "-1" ? name : null}];
        }));
        const bgRows = rows("background_table").map(row => ({
            positions: [Number(cell(row, 0))], color: cell(row, 1),
            brightness: readNumber(cell(row, 2).replace(/%$/, ""), "background brightness") / 100
        }));
        // Keep an imported sparse or grouped background as-is if the table is unedited.
        const background = JSON.stringify(bgRows) === $("background_table").dataset.renderedProfile &&
            settings.led_count === profile.settings.led_count ? profile.background : bgRows;
        const layout = circles.map(shape => ({
            x: Math.round(shape.x), y: Math.round(shape.y), radius: Math.round(shape.radius),
            kind: shape.is_lever ? "is_lever" : shape.is_key ? "is_key" : "is_button",
            button: shape.button_activation === "notSet" ? null : shape.button_activation,
            angle: shape.is_key ? Math.round(shape.angle) : null
        }));
        const combos = Array.from($("combo_rows_container").querySelectorAll(".combo-row"))
            .filter(row => row.selectedButtons.length)
            .map(row => ({ buttons: [...row.selectedButtons], sprite: readNumber(row.querySelector(".sprite-idx-input").value, "sprite index") }));
        return {
            settings, idleSetup: profile.idleSetup, palette, randomColors, buttons, chords, directions,
            background, layout, combos,
            players: [1, 2, 3, 4].map(index => $("player_led" + index).getAttribute("colorname") || "blank"),
            idleColors: $("circle_checkbox").checked ? null : rows("circle_table").map(row => cell(row, 0)),
            skipIdle: [...document.querySelectorAll(".idle_modal_led_cb:checked")].map(item =>
                Number(item.closest("span").id.slice(7)) - 1),
            splash: Array.from(OledFiles.readCanvas($("my_splash_canvas"))),
            overlay: Array.from(OledFiles.readCanvas($("my_overlay_canvas")))
        };
    }

    function appendRow(id, values) {
        const row = $(id).insertRow();
        for (const value of values) row.insertCell().textContent = String(value);
        return row;
    }
    function appendButton(button) {
        const row = appendRow("button_table", [button.name,
            button.positions[0] === 0 ? "Not Set" : button.positions.join(" "), button.color, "", "", button.fadeIn, button.fadeOut]);
        const fade = document.createElement("input");
        fade.type = "checkbox";
        fade.checked = button.fade;
        fade.setAttribute("aria-label", "Fade for " + button.name);
        const pin = document.createElement("select");
        pin.setAttribute("aria-label", "GPIO for " + button.name);
        for (let i = 0; i <= 48; i++) pin.add(new Option("GP" + i, i));
        pin.value = button.pin;
        const grip = document.createElement("span");
        grip.className = "row-grip";
        grip.tabIndex = 0;
        grip.title = "Drag to reorder, or use the up and down arrow keys";
        grip.setAttribute("aria-label", "Reorder button row");
        row.insertCell().append(grip);
        row.cells[3].append(fade);
        row.cells[4].append(pin);
    }
    function clearRows(id, keep = 1) {
        const table = $(id);
        while (table.rows.length > keep) table.deleteRow(-1);
    }

    function renderView(model) {
        const s = model.settings;
        setControl("profile_name", s.profile_name);
        $("led_count").dataset.lastValidValue = s.led_count;
        for (const [key, id] of Object.entries(numbers)) setControl(id, s[key]);
        for (const [key, id] of Object.entries(percentages)) setControl(id, s[key] * 100);
        for (const id of [...Object.values(percentages), "smooth_speed"]) $(id).dataset.renderedValue = $(id).value;
        for (const [key, id] of Object.entries(switches)) $(id).checked = s[key];
        for (const [key, id] of Object.entries(colorInputs)) {
            $(id).value = colorHex(s[key]);
            $(id).dispatchEvent(new Event("input", {bubbles: true}));
        }
        $("leniency_cb").checked = s.leniency === 0;
        setControl("leniency_tb", s.leniency || 1);
        $("idle_cb").checked = s.idle_mode === 0;
        setControl("idle_select", s.idle_mode || 1);
        $("circle_checkbox").checked = model.idleColors === null;
        $("circle_checkbox2").checked = model.idleColors !== null;
        $("player_led_cb").checked = !s.activate_player_led;
        $("oled_cb").checked = !s.activate_oled;
        $("oled_i2c_rad1").checked = s.i2c_interface === 0;
        $("oled_i2c_rad2").checked = s.i2c_interface === 1;
        setControl("oled_sda" + s.i2c_interface + "_select", s.oled_sda, "GP" + s.oled_sda);
        setControl("oled_scl" + s.i2c_interface + "_select", s.oled_scl, "GP" + s.oled_scl);
        $("oled_enable_default_sprite").checked = s.oled_combo_idle_frame < 0;
        setControl("oled_default_sprite", Math.max(0, s.oled_combo_idle_frame));
        setControl("brightness_steps", s.brightness_steps === "smooth" ? "smooth" : 1 / s.brightness_steps,
            s.brightness_steps * 100 + "% per step");
        $("brightness_steps").dataset.renderedValue = $("brightness_steps").value;

        const palette = new Map(model.palette.map(item => [item.name, item.value]));
        clearRows("color_table", 2);
        $("color_table").rows[1].cells[1].style.backgroundColor = cssColor(palette.get("blank") ?? [0, 0, 0]);
        for (const [name, color] of palette) {
            if (name === "blank") continue;
            const row = appendRow("color_table", [name, ""]);
            row.cells[1].style.backgroundColor = cssColor(color);
        }
        row_id = 0;
        for (const id of ["update_color", "delete_color"]) $(id).disabled = true;
        clearRows("button_table");
        model.buttons.forEach(appendButton);
        button_row_id = -1;
        reset_all();
        update_color_select();
        select_button_table();
        for (const [table, key] of [["on_off_table", "OnOff_button"], ["led_options_table", "ledOptions_led_buttons"]]) {
            clearRows(table);
            model.chords[key].forEach(name => appendRow(table, [name]));
        }
        update_onoff_select();
        show_led_options();
        for (const [key, id] of Object.entries(chordSelects)) setControl(id, model.chords[key][0] || "", "Not Set");
        clearRows("circle_table");
        (model.idleColors ?? []).forEach(name => appendRow("circle_table", [name]));
        reset_idle_selection();
        update_idle_circle_select();
        update_exclude_leds();
        const skipped = new Set(model.skipIdle);
        for (const item of document.querySelectorAll(".idle_modal_led_cb"))
            item.checked = skipped.has(Number(item.closest("span").id.slice(7)) - 1);
        update_bg_color_select();
        const bg = new Map();
        for (const item of model.background)
            for (const position of item.positions) bg.set(position, item);
        $("background_table").dataset.renderedProfile = JSON.stringify(rows("background_table").map(row => {
            const position = Number(cell(row, 0));
            const {color, brightness} = bg.get(position) ?? {color: "blank", brightness: 1};
            row.cells[1].textContent = color;
            const percentage = Number((brightness * 100).toPrecision(14));
            row.cells[2].textContent = percentage + "%";
            return {positions: [position], color, brightness: percentage / 100};
        }));
        update_bg_table_colors();
        show_eightway_modal();
        for (const [id, direction] of Object.entries(model.directions)) {
            const arrow = document.querySelector(".arrow-" + id);
            arrow.setAttribute("led_pos", direction.positions[0] < 0 ? "not Set" : direction.positions.map(i => i + 1).join(" "));
            arrow.setAttribute("directioncolor", direction.color);
            if (cardinals.has(id)) setControl("eightway_select-" + id, direction.button || "-1");
        }
        eightway_set_border_color();
        model.players.forEach((name, index) => {
            const player = $("player_led" + (index + 1));
            player.setAttribute("colorname", name);
            player.style.backgroundColor = cssColor(palette.get(name));
        });
        update_player_LED_select();
        set_playerLED_brightness();
        enable_disable_cb();
        remove_all_event_listeners();
        circles = [];
        selectedCircle = null;
        model.layout.forEach(shape => oled_add_button(shape.x, shape.y, shape.radius, shape.kind === "is_lever",
            shape.kind === "is_key", shape.button ?? "notSet", shape.angle ?? 0));
        OledFiles.setProfileImages(model.splash, model.overlay);
        combo_sprites_available_buttons = model.buttons.map(button => button.name);
        $("combo_rows_container").replaceChildren();
        model.combos.forEach(combo => addComboRow({buttons: [...combo.buttons], sprite: combo.sprite}));
        updateCanvas();
        show_oled_modal();
        toggle_oled_checkbox();
        toggle_combo_sprite_checkbox();
        update_leniency_input();
        update_brightness_input();
        update_dim_brightness_input();
        update_checkbox_hide();
        update_checkbox_show();
        show_idle_extra_config();
        toggle_idle_mode();
        show_smooth_slider();
        update_smooth_value();
    }

    function importProfile(source, {compactBitmaps = false, filename = ""} = {}) {
        // A successful preset, clipboard, or file import replaces the previous snapshot.
        ++importRequest;
        // Parsing and validation finish before the current editor is touched.
        const next = ProfileCodec.parsePython(source);
        const generated = ProfileCodec.serializePython(next, false);
        renderView(next);
        profile = next;
        emptyEditorCode = undefined;
        const input = $("new_codebox");
        input.value = compactBitmaps ? ProfileCodec.compactInputBitmaps(source) : source;
        $("code_box").value = generated;
        const loadedStatus = $("loaded-profile-status");
        loadedStatus.textContent = filename ? filename + " loaded" : "";
        loadedStatus.hidden = !filename;
    }
    const notify = (error, type = "error") => showMessage(error.message ?? String(error), type);
    function generate(strict = false) {
        const next = readView();
        const code = ProfileCodec.serializePython(next, strict);
        $("code_box").value = code === emptyEditorCode ? "" : code;
        return code;
    }
    async function importFile(file) {
        if (!/\.py$/i.test(file.name)) throw new Error("Choose a Fight Lights .py configuration.");
        if (file.size > 2_000_000) throw new Error("This config.py is too large.");
        const request = ++importRequest;
        const text = await file.text();
        if (request !== importRequest) return;
        importProfile(text, {filename: file.name});
        notify("Loaded " + file.name, "success");
    }
    async function acceptFile(input) {
        const file = input.files[0];
        if (!file) return;
        try { await importFile(file); }
        catch (error) { notify(error); }
        finally { input.value = ""; }
    }

    function download(content, filename, type = "text/plain;charset=utf-8") {
        const url = URL.createObjectURL(new Blob([content], {type}));
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    function showPage(page) {
        document.querySelectorAll(".page-content").forEach(el => {
            el.style.display = el.id === page + "-page" ? "block" : "none";
        });
    }

    function resizeLedViews(control) {
        if (!control.checkValidity() || !control.value) {
            control.value = control.dataset.lastValidValue;
            notify("Enter an LED count between 1 and 2048.", "warning");
            return;
        }
        control.dataset.lastValidValue = control.value;
        update_exclude_leds();
        set_bg_table();
        update_bg_table_colors();
        remove_bigger_led_numbers();
        remove_eightway_led_numbers();
    }

    function setup() {
        bindButtonOrder();
        initColorPicker();
        initOledComponents();
        OledFiles.bind();
        profile = {
            settings: {...ProfileCodec.fields, profile_name: "", led_count: Number($("led_count").defaultValue)},
            palette: [{name: "blank", value: [0, 0, 0]}], randomColors: ["blank"],
            buttons: [], combos: [], layout: [], background: [], skipIdle: [], idleColors: null,
            chords: Object.fromEntries(ProfileCodec.chordKeys.map(key => [key, []])),
            directions: Object.fromEntries(Object.keys(ProfileCodec.directionKeys).map(key =>
                [key, {positions: [-1], color: "blank", button: null}])),
            players: Array(4).fill("blank"),
            splash: Array(1024).fill(0), overlay: Array(1024).fill(0)
        };
        renderView(profile);
        emptyEditorCode = ProfileCodec.serializePython(readView(), false);
        $("new_codebox").value = "";
        $("code_box").value = "";
        showPage("home");
        $("led_count").addEventListener("change", event => resizeLedViews(event.currentTarget));
        $("load-config-file").addEventListener("click", () => $("fileElem").click());
        $("fileElem").addEventListener("change", event => acceptFile(event.currentTarget));
        $("new_codebox").addEventListener("paste", event => {
            const source = event.clipboardData.getData("text/plain");
            event.preventDefault();
            try {
                importProfile(source);
                notify("Code loaded from clipboard.", "success");
            } catch (error) { notify(error); }
        });
        $("droppable").addEventListener("dragover", event => {
            if (event.dataTransfer.types.includes("Files")) {
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
            }
        });
        $("droppable").addEventListener("drop", async event => {
            const files = event.dataTransfer.files;
            if (!files.length) return;
            event.preventDefault();
            try { await importFile(files[0]); }
            catch (error) { notify(error); }
        });
    }

    return {appendRow, appendButton, generate, importProfile, download, notify, setup, showPage};
})();

function showPage(page) { Configurator.showPage(page); }
function generate_code() {
    try { return Configurator.generate(); }
    catch (error) { Configurator.notify(error); }
}
function save_code(filename = "config.py") {
    try { Configurator.download(Configurator.generate(true), filename); }
    catch (error) { Configurator.notify(error); }
}
async function copy_to_clipboard() {
    let code;
    try { code = Configurator.generate(true); }
    catch (error) { Configurator.notify(error); return; }

    try {
        await navigator.clipboard.writeText(code);
        Configurator.notify("Code copied to clipboard.", "success");
    } catch {
        showPage("codeboxes");
        document.getElementById("code_box").select();
        Configurator.notify("Press Ctrl+C to copy the selected code.", "info");
    }
}
async function paste() {
    let text;
    try { text = await navigator.clipboard.readText(); }
    catch {
        showPage("codeboxes");
        document.getElementById("new_codebox").focus();
        Configurator.notify("Press Ctrl+V in the import box to load your code.", "info");
        return;
    }
    try {
        Configurator.importProfile(text);
        Configurator.notify("Code loaded from clipboard.", "success");
    } catch (error) { Configurator.notify(error); }
}
function fill_with_default_config() { Configurator.importProfile(PRESET_CONFIG); }
function loadProjectZipWriter() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.onload = () => resolve(window.JSZip);
        script.onerror = () => { script.remove(); reject(new Error("Could not load the ZIP writer. Check your connection and retry.")); };
        document.head.append(script);
    });
}

const projectPythonFiles = ["animation.py", "button.py", "config.py", "functions.py", "init.py", "main.py", "oled.py", "playerLED.py", "sh1106.py", "ssd1306.py", "statemachine.py"];

const projectRepo = "DaoraDio/Fight-Lights-Pico";
const projectReleaseTag = "v2.8.0";
const oledFiles = ["oled_animation.flan", "oled_combo_sprites.flan"];

async function downloadProjectFiles(setStatus) {
    const tag = projectReleaseTag;
    const base = "https://raw.githubusercontent.com/" + projectRepo + "/refs/tags/" + encodeURIComponent(tag) + "/";
    const metadata = await fetch(base + "fight-lights-release.json", {signal: AbortSignal.timeout(20000)});
    let manifest = {};
    if (metadata.ok) {
        manifest = await metadata.json();
        if (!manifest || typeof manifest !== "object" || Array.isArray(manifest))
            throw new Error("Invalid Fight Lights release manifest.");
    } else if (metadata.status !== 404) {
        throw new Error("Could not read the release manifest (HTTP " + metadata.status + ").");
    }
    const releaseFiles = manifest.files ?? [...projectPythonFiles, ...oledFiles];
    if (!Array.isArray(releaseFiles) || new Set(releaseFiles).size !== releaseFiles.length ||
        !releaseFiles.includes("main.py") || !releaseFiles.includes("config.py") ||
        releaseFiles.some(name => typeof name !== "string" ||
            !/^[A-Za-z_][A-Za-z_0-9]*\.(?:py|mpy|flan)$/.test(name) ||
            /^config\d+\.py$/.test(name))) {
        throw new Error("Invalid file list in the Fight Lights release manifest.");
    }
    const renames = manifest.renameSettings ?? {};
    if (!renames || typeof renames !== "object" || Array.isArray(renames) ||
        Object.entries(renames).some(([oldKey, newKey]) => !/^[A-Za-z_]\w*$/.test(oldKey) ||
            typeof newKey !== "string" || !/^[A-Za-z_]\w*$/.test(newKey))) {
        throw new Error("Invalid profile rules in the Fight Lights release manifest.");
    }
    // Commit main.py last, after its dependencies and any default configuration.
    const names = [...releaseFiles.filter(name => name !== "main.py"), "main.py"];
    const files = [];
    for (const name of names) {
        setStatus("Downloading " + tag + " / " + name + " (" + (files.length + 1) + " of " + names.length + ").");
        const response = await fetch(base + name, {signal: AbortSignal.timeout(20000)});
        if (!response.ok) throw new Error("Could not download " + name + " (HTTP " + response.status + ").");
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (!bytes.length) throw new Error("GitHub returned an empty " + name + ".");
        files.push({name, bytes});
    }
    return {tag, files, renames, migrationBlocked: manifest.profileMigration === false};
}

async function downloadFilesAsZip() {
    const button = document.getElementById("download-project-files");
    if (button.disabled) return;
    const status = document.getElementById("zipStatus");
    button.disabled = true;
    status.textContent = "Preparing download…";
    try {
        const Zip = await loadProjectZipWriter();
        const zip = new Zip();
        const project = await downloadProjectFiles(message => { status.textContent = message; });
        for (const {name, bytes} of project.files) zip.file(name, bytes);
        zip.file("README.txt", `# Fight Lights Pico Files

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
Files are from Fight Lights Pico ${project.tag}.

## Included files
${project.files.map(({name}) => "- " + name).join("\n")}
`);
        status.textContent = "Creating ZIP…";
        const blob = await zip.generateAsync({type: "blob"});
        Configurator.download(blob, "fight-lights-files.zip", "application/zip");
        showMessage("Project files downloaded.", "success");
    } catch (error) {
        showMessage("Download failed. " + error.message, "error", 7500);
    } finally {
        status.textContent = "";
        button.disabled = false;
    }
}
function initColorPicker() {
    Coloris({el: ".coloris", theme: "default", themeMode: "light", format: "hex",
             swatches: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#d62828", "#003049", "#fcbf49", "#f77f00"]});
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("configurator-release-tag").textContent = projectReleaseTag;
    document.getElementById("project-release-tag").textContent = projectReleaseTag;
    try { Configurator.setup(); }
    catch (error) {
        console.error(error);
        Configurator.notify(error);
    }
});
