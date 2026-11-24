/* Fight Lights Pico profile and OLED frame formats. No browser dependencies. */
const ProfileCodec = (() => {
    "use strict";

    const fields = Object.freeze({
        profile_name: "Profile 1", PIN_NUM: 0, led_count: 18, leniency: 1,
        brightness_mod: 1, profile_color: [0, 0, 255], onboard_led_on: true,
        save_stats: false, input_reset_time: 50, idle_mode: 2, idle_after: 30,
        idle_mode1_speed: 0.05, idle_mode3_brightness: 0.5,
        ledOptions_color: [255, 0, 0], ledOptions_profile_color_use_all_LEDs: true,
        smooth_brightness_speed: 0.03, ledOptions_start_time: 1, brightness_steps: "smooth",
        clear_background_on_press: false, rainbow_speed: 1000,
        activate_player_led: false, playerLED_brightness: 1, playerLED_PIN_NUM: 16,
        activate_oled: true, oled_idle: 0, oled_layout: 0, oled_type: 0,
        invert_oled: false, rotate_oled: false, i2c_interface: 1, oled_sda: 26,
        oled_scl: 27, oled_animation_delay: 0, oled_combo_idle_frame: -1
    });
    const directionKeys = Object.freeze({
        up: "eight_way_up", down: "eight_way_down", left: "eight_way_left",
        right: "eight_way_right", "up-left": "eight_way_upleft", "up-right": "eight_way_upright",
        "down-left": "eight_way_leftdown", "down-right": "eight_way_rightdown"
    });
    const chordKeys = Object.freeze([
        "OnOff_button", "ledOptions_led_buttons", "ledOptions_increase_brightness",
        "ledOptions_decrease_brightness", "ledOptions_left_button",
        "ledOptions_right_button", "ledOptions_confirm"
    ]);
    const reserved = new Set(("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield bytearray button functions init main Pin random rainbow smooth notSet " +
        Object.keys(fields).join(" ") + " " + Object.values(directionKeys).join(" ") + " " +
        chordKeys.join(" ") + " P1_color P2_color P3_color P4_color colors background button_list splash overlay oled_buttons user_combos idle_mode1_colors skip_leds_in_idle idlemode_leds").split(" "));
    const validName = name => typeof name === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && !reserved.has(name) && !/^oled_button\d+$|_MyButton$/.test(name);
    const ref = name => ({ ref: name });
    const rgb = value => Array.isArray(value) && value.length === 3 && value.every(channel => Number.isInteger(channel) && channel >= 0 && channel <= 255);
    const isRef = value => value && typeof value.ref === "string";
    const literal = value => {
        if (isRef(value)) return value.ref;
        if (Array.isArray(value)) return "[" + value.map(literal).join(", ") + "]";
        if (value === null) return "None";
        if (typeof value === "boolean") return value ? "True" : "False";
        if (typeof value === "string") return JSON.stringify(value);
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
        throw new Error("Cannot write an invalid profile value.");
    };
    const tuple = values => "(" + values.map(literal).join(", ") + (values.length === 1 ? "," : "") + ")";
    const list = (values, format = literal) => "[" + values.map(format).join(", ") + "]";

    // Parse the literal subset emitted by the configurator. Python is never executed.
    function readExpression(source, offset, label) {
        const tokens = /(?:\s+|#[^\n]*)*("(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'|[+-]?(?:0x[\da-fA-F]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)|[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*|[\[\](),])/gy;
        let lookahead;
        tokens.lastIndex = offset;
        const peek = () => lookahead ??= tokens.exec(source)?.[1] ?? "";
        const take = () => { const value = peek(); lookahead = undefined; return value; };
        const fail = () => { throw new Error("Unsupported or incomplete Python value for " + label + "."); };

        function sequence(end, depth) {
            const items = [];
            while (peek() !== end) {
                items.push(value(depth + 1));
                if (peek() === end) break;
                if (take() !== ",") fail();
            }
            take();
            return items;
        }

        function value(depth = 0) {
            if (depth > 32) fail();
            const token = take();
            if (token === "(" || token === "[") return sequence(token === "(" ? ")" : "]", depth);
            if (token === "True" || token === "False") return token === "True";
            if (token === "None") return null;
            if (/^["']/.test(token)) {
                return token.slice(1, -1).replace(/\\(u[0-9a-f]{4}|x[0-9a-f]{2}|.)/gi, (_, escape) => {
                    if (/^[ux][0-9a-f]+$/i.test(escape)) return String.fromCharCode(parseInt(escape.slice(1), 16));
                    return ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "\\": "\\", "'": "'", '"': '"' })[escape] ?? escape;
                });
            }
            if (/^[+\-.\d]/.test(token)) {
                const number = Number(token);
                if (!Number.isFinite(number)) fail();
                return number;
            }
            if (token === "bytearray" || token === "button.MyButton") {
                if (take() !== "(") fail();
                return { call: token, items: sequence(")", depth) };
            }
            if (/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/.test(token)) return ref(token);
            return fail();
        }

        const result = value();
        const end = tokens.lastIndex;
        if (!/^[ \t]*(?:#.*)?(?:\r?\n|$)/.test(source.slice(end))) fail();
        return result;
    }

    const scalarSetting = value => value === null || ["string", "boolean", "number"].includes(typeof value);

    function parsePython(source, assignments = new Map()) {
        if (source.length > 2_000_000) throw new Error("This config.py is too large.");
        const vars = new Map(), buttonSetups = new Map();
        const statements = /^([A-Za-z_]\w*)[ \t]*(?:=(?!=)[ \t]*|(\.set_config)[ \t]*(?=\())/gm;
        const code = source.replace(/^\uFEFF/, "");
        const known = new Set([...Object.keys(fields), ...Object.values(directionKeys), ...chordKeys,
            "colors", "idle_mode1_colors", "skip_leds_in_idle", "button_list", "background",
            "oled_buttons", "user_combos", "splash", "overlay", "blank", "P1_color", "P2_color", "P3_color", "P4_color"]);
        for (const match of code.matchAll(statements)) {
            const [, name, setup] = match;
            if (name === "idlemode_leds" && !setup) {
                assignments.set(name, code.slice(match.index).split(/\r?\n/, 1)[0].split("#", 1)[0].trim());
                continue;
            }
            const parsed = readExpression(code, match.index + match[0].length, name);
            if (setup) buttonSetups.set(name, parsed);
            else if (known.has(name) || /_MyButton$|^oled_button\d+$/.test(name) || rgb(parsed) ||
                (validName(name) && scalarSetting(parsed))) {
                vars.set(name, parsed);
                assignments.set(name, parsed);
            }
            else throw new Error("This custom Python setting cannot be edited by the configurator: " + name + ".");
        }

        for (const key of ["profile_name", "PIN_NUM", "led_count", "colors", "button_list"]) {
            if (!vars.has(key)) throw new Error("Expected a Fight Lights config.py with " + key + ".");
        }

        const settings = {};
        for (const [key, fallback] of Object.entries(fields)) {
            const parsed = vars.has(key) ? vars.get(key) : fallback;
            settings[key] = key === "brightness_steps" && parsed?.ref === "smooth" ? "smooth" :
                Array.isArray(fallback) && isRef(parsed) ? vars.get(parsed.ref) : parsed;
        }
        for (const [key, value] of vars)
            if (!known.has(key) && validName(key) && scalarSetting(value)) settings[key] = value;
        const palette = new Map([["blank", vars.get("blank") ?? [0, 0, 0]]]);
        const colorName = value => {
            if (isRef(value) && ["random", "rainbow"].includes(value.ref)) return value.ref;
            if (isRef(value) && validName(value.ref) && rgb(vars.get(value.ref))) {
                palette.set(value.ref, vars.get(value.ref));
                return value.ref;
            }
            if (rgb(value)) {
                const existing = [...palette].find(([, color]) => color.every((channel, i) => channel === value[i]));
                if (existing) return existing[0];
                let name = "RGB_" + value.join("_");
                while (palette.has(name) || vars.has(name)) name += "_";
                palette.set(name, value);
                return name;
            }
            throw new Error("Unknown color: " + (value?.ref ?? String(value)) + ".");
        };
        const randomColors = sequence(vars.get("colors"), "colors").map(colorName);
        const namesByVariable = new Map();
        const buttons = sequence(vars.get("button_list"), "button_list").map(value => {
            const variable = value?.ref;
            const args = vars.get(variable);
            if (args?.call !== "button.MyButton") throw new Error("Missing button: " + variable + ".");
            const [pin, name, handler] = args.items;
            if (handler?.ref !== "functions.clear_led") throw new Error("Unsupported GPIO handler for " + name + ".");
            namesByVariable.set(variable, name);
            const [positions, color, fade, fadeIn, fadeOut] = sequence(buttonSetups.get(variable), variable);
            return { name, pin, positions: Array.isArray(positions) ? positions : [positions], color: colorName(color), fade, fadeIn, fadeOut };
        });
        const buttonName = value => {
            if (value === null || value?.ref === "notSet") return null;
            if (!namesByVariable.has(value?.ref)) throw new Error("Unknown button: " + value?.ref + ".");
            return namesByVariable.get(value.ref);
        };
        const chords = Object.fromEntries(chordKeys.map(key =>
            [key, sequence(get(key, []), key).map(buttonName)]));
        const directions = Object.fromEntries(Object.entries(directionKeys).map(([id, key]) => {
            const [positions, color, button = null] = sequence(get(key, [[-1], ref("blank")]), key);
            return [id, { positions: Array.isArray(positions) ? positions : [positions], color: colorName(color), button: buttonName(button) }];
        }));
        const layout = sequence(get("oled_buttons", []), "oled_buttons").map(value => {
            const [x, y, kind, button, radius, angle] = sequence(isRef(value) ? vars.get(value.ref) : value, "OLED shape");
            return { x, y, kind, button: buttonName(button), radius, angle };
        });
        const combos = sequence(get("user_combos", []), "user_combos").map(combo => ({
            buttons: sequence(combo, "combo").slice(0, -1).map(buttonName),
            sprite: combo[combo.length - 1]
        }));
        const bg = sequence(get("background", []), "background");
        // A legacy export with one background row omitted the tuple's trailing comma.
        const background = (typeof bg[0] === "number" ? [bg] : bg).map(item => {
            const [brightness, color, ...positions] = sequence(item, "background row");
            return { brightness, color: colorName(color), positions };
        });
        const idle = get("idle_mode1_colors", ref("colors"));
        const idleColors = idle?.ref === "colors" ? null : sequence(idle, "idle colors").map(colorName);
        const players = [1, 2, 3, 4].map(index => colorName(get("P" + index + "_color", ref("blank"))));
        const image = name => {
            const item = get(name, { call: "bytearray", items: [Array(1024).fill(0)] });
            if (item?.call !== "bytearray") throw new Error("Unsupported OLED " + name + ".");
            return item.items[0];
        };
        const model = {
            settings, idleSetup: assignments.get("idlemode_leds") ?? "idlemode_leds = functions.remove_idle_skips()", palette: [...palette].map(([name, value]) => ({ name, value })), randomColors,
            buttons, chords, directions, layout, combos, background, idleColors, players,
            skipIdle: get("skip_leds_in_idle", []), splash: image("splash"), overlay: image("overlay")
        };
        validate(model);
        return model;

        function get(key, fallback) { return vars.has(key) ? vars.get(key) : fallback; }
    }

    function sequence(value, label) {
        if (!Array.isArray(value)) throw new Error("Expected a list or tuple for " + label + ".");
        return value;
    }

    function validate(model, checkPins = false) {
        const assert = (condition, message) => { if (!condition) throw new Error(message); };
        const int = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
        const bounded = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;
        const s = model.settings, n = s.led_count;
        const unit = value => bounded(value, 0, 1);
        assert(typeof s.profile_name === "string" && !/[\x00-\x1f]/.test(s.profile_name), "Enter a valid profile name.");
        assert(int(n, 1, 2048), "LED count must be between 1 and 2048.");
        for (const [key, initial] of Object.entries(fields)) {
            if (typeof initial === "boolean") assert(typeof s[key] === "boolean", "Expected true or false for " + key + ".");
            if (Array.isArray(initial)) assert(rgb(s[key]), "Invalid RGB color for " + key + ".");
            if (typeof initial === "number") assert(Number.isFinite(s[key]), "Invalid number for " + key + ".");
        }
        for (const key of ["brightness_mod", "idle_mode3_brightness", "playerLED_brightness"])
            assert(unit(s[key]), key + " must be between 0% and 100%.");
        for (const key of ["PIN_NUM", "playerLED_PIN_NUM", "oled_sda", "oled_scl"])
            assert(int(s[key], 0, 48), "Invalid GPIO for " + key + ".");
        for (const key of ["idle_after", "idle_mode1_speed", "smooth_brightness_speed", "ledOptions_start_time", "rainbow_speed"])
            assert(s[key] >= 0, key + " must not be negative.");
        for (const [key, min, max] of [["leniency",0,1e9], ["input_reset_time",0,1e9], ["idle_mode",0,6], ["oled_idle",0,3], ["oled_layout",0,3], ["oled_type",0,1], ["i2c_interface",0,1], ["oled_animation_delay",0,1e9], ["oled_combo_idle_frame",-1,1e9]])
            assert(int(s[key], min, max), "Invalid setting " + key + ".");
        assert(s.brightness_steps === "smooth" || (unit(s.brightness_steps) && s.brightness_steps > 0), "Invalid brightness steps.");
        const colors = new Set(), buttons = new Set();
        for (const entry of model.palette) {
            assert(validName(entry.name) && !colors.has(entry.name) && rgb(entry.value), "Invalid or duplicate color " + entry.name + ".");
            colors.add(entry.name);
        }
        const named = name => assert(colors.has(name), "Unknown color " + name + ".");
        const effect = (name, special) => { if (name !== special) named(name); };
        for (const color of model.randomColors) named(color);
        for (const color of model.idleColors ?? []) named(color);
        for (const color of model.players) named(color);
        for (const button of model.buttons) {
            assert(validName(button.name) && !buttons.has(button.name), "Invalid or duplicate button " + button.name + ".");
            assert(int(button.pin, 0, 48), "Invalid GPIO for " + button.name + ".");
            assert(button.positions.length > 0 && (button.positions.every(pos => int(pos, 1, n)) ||
                (button.positions.length === 1 && [-1, 0].includes(button.positions[0]))), "Invalid LED positions for " + button.name + ".");
            assert(typeof button.fade === "boolean" && bounded(button.fadeIn, 0, 1e9) &&
                bounded(button.fadeOut, 0, 1e9), "Invalid fade settings for " + button.name + ".");
            effect(button.color, "random");
            buttons.add(button.name);
        }
        const buttonRef = name => assert(buttons.has(name), "Unknown button " + name + ".");
        for (const chord of Object.values(model.chords)) chord.forEach(buttonRef);
        for (const direction of Object.values(model.directions)) {
            effect(direction.color, "random");
            if (direction.button !== null) buttonRef(direction.button);
            assert(direction.positions.length && (direction.positions.every(pos => int(pos, 0, n - 1)) ||
                (direction.positions.length === 1 && direction.positions[0] === -1)), "Invalid 8-way LED positions.");
        }
        for (const entry of model.background) {
            effect(entry.color, "rainbow");
            assert(unit(entry.brightness) && entry.positions.length && entry.positions.every(pos => int(pos, 1, n)), "Invalid background LED settings.");
        }
        assert(model.skipIdle.every(pos => int(pos, 0, n - 1)), "Invalid idle LED exclusions.");
        for (const shape of model.layout) {
            assert(["is_lever", "is_key", "is_button"].includes(shape.kind) &&
                [shape.x, shape.y, shape.radius].every(value => int(value, -256, 256)) && shape.radius > 0 &&
                (shape.angle === null || int(shape.angle, -360, 360)), "Invalid OLED shape.");
            if (shape.button !== null) buttonRef(shape.button);
        }
        for (const combo of model.combos) {
            assert(combo.buttons.length > 0 && int(combo.sprite, 0, 1e9), "A combo requires buttons and a sprite number.");
            combo.buttons.forEach(buttonRef);
        }
        for (const image of [model.splash, model.overlay])
            assert(Array.isArray(image) && image.length === 1024 && image.every(byte => int(byte, 0, 255)), "An OLED image must contain 1024 bytes.");
        if (checkPins) {
            const used = new Map();
            const add = (pin, label) => {
                assert(!used.has(pin), "GP" + pin + " is assigned to both " + used.get(pin) + " and " + label + ".");
                used.set(pin, label);
            };
            add(s.PIN_NUM, "the LED strip");
            model.buttons.forEach(button => add(button.pin, button.name));
            if (s.activate_oled) { add(s.oled_sda, "OLED SDA"); add(s.oled_scl, "OLED SCL"); }
            if (s.activate_player_led) {
                add(s.playerLED_PIN_NUM, "the player LED strip");
                [21, 20, 19, 18].forEach((pin, i) => add(pin, "player " + (i + 1) + " input"));
            }
        }
        return model;
    }

    const buttonRef = name => ref(name + "_MyButton");
    // The v2.7.5 firmware reads these while config.py is still being imported.
    const bootSettings = ["activate_oled", "PIN_NUM", "led_count"];
    function serializePython(model, checkPins = true) {
        validate(model, checkPins);
        const s = model.settings;
        const lines = [
            ...bootSettings.map(key => key + " = " + literal(s[key])), "",
            "if __name__ == '__main__':", "    import main", "    main.run()", "",
            'print("\\033[32mconfig\\033[0m")', "#Fight Lights Pico V2.8.0", "",
            "from init import random, rainbow, smooth, notSet", "import button", "import functions", "import init", ""
        ];
        const put = (key, value) => lines.push(key + " = " + value);
        const setting = (key, value) => put(key, Array.isArray(value) ? tuple(value) :
            key === "brightness_steps" && value === "smooth" ? "smooth" : literal(value));
        model.palette.forEach(({name, value}) => put(name, tuple(value)));
        put("colors", list((model.randomColors.length ? model.randomColors : ["blank"]).map(ref)));
        lines.push("");
        for (const [key, value] of Object.entries(s)) {
            if (!bootSettings.includes(key)) setting(key, value);
        }
        put("idle_mode1_colors", model.idleColors === null ? "colors" : list(model.idleColors.map(ref)));
        put("skip_leds_in_idle", list(model.skipIdle));
        const idleSetup = model.idleSetup ?? "idlemode_leds = functions.remove_idle_skips()";
        if (!/^idlemode_leds[ \t]*=[ \t]*functions\.remove_idle_skips\([ \t]*(?:led_count[ \t]*,[ \t]*skip_leds_in_idle[ \t]*)?\)$/.test(idleSetup))
            throw new Error("Unsupported idle LED setup.");
        lines.push(idleSetup);
        lines.push("");
        for (const b of model.buttons) put(buttonRef(b.name).ref,
            "button.MyButton" + tuple([b.pin, b.name, ref("functions.clear_led")]));
        put("button_list", list(model.buttons.map(b => buttonRef(b.name))));
        put("init.button_list_length", "len(button_list)");
        for (const b of model.buttons) lines.push(buttonRef(b.name).ref + ".set_config(" +
            [tuple(b.positions), b.color, literal(b.fade), literal(b.fadeIn), literal(b.fadeOut)].join(", ") + ")");
        lines.push("");
        for (const key of chordKeys) put(key, list(model.chords[key].map(buttonRef)));
        const background = model.background.map(row => tuple([row.brightness, ref(row.color), ...row.positions]));
        put("background", "(" + background.join(", ") + (background.length === 1 ? "," : "") + ")");
        model.players.forEach((color, index) => put("P" + (index + 1) + "_color", color));
        Object.entries(directionKeys).forEach(([id, key], index) => {
            const {positions, color, button} = model.directions[id];
            put(key, "[" + [tuple(positions), color, ...(index < 4 ? [button ? buttonRef(button).ref : "notSet"] : [])].join(", ") + "]");
        });
        model.layout.forEach(({x, y, kind, button, radius, angle}, index) =>
            put("oled_button" + index, tuple([x, y, kind, button ? buttonRef(button) : null, radius, angle])));
        put("oled_buttons", list(model.layout.map((_, index) => ref("oled_button" + index))));
        put("user_combos", list(model.combos.map(combo => [...combo.buttons.map(buttonRef), combo.sprite])));
        put("splash", bitmapLiteral(model.splash));
        put("overlay", bitmapLiteral(model.overlay));
        lines.push("############do not delete this line#######################", "");
        return lines.join("\n");
    }

    const hexByte = byte => byte.toString(16).padStart(2, "0").toUpperCase();
    function bitmapLiteral(bytes) {
        const rows = [];
        for (let offset = 0; offset < bytes.length; offset += 16)
            rows.push(bytes.slice(offset, offset + 16).map(byte => "0x" + hexByte(byte)).join(",") + ",");
        return "bytearray([\n" + rows.join("\n") + "\n])";
    }

    function compactInputBitmaps(source) {
        // Only rewrite plain bitmap literals, keeping surrounding code and comments intact.
        const bitmaps = /^(\uFEFF?(?:splash|overlay)[ \t]*=[ \t]*)bytearray[ \t]*\(\s*\[([\s,0-9a-fx]+)\]\s*\)/gim;
        return source.replace(bitmaps, (literal, assignment, contents) => {
            const values = contents.trim().replace(/,$/, "").split(",").map(value => value.trim());
            if (!values.every(value => /^(?:0x[\da-f]+|\d+)$/i.test(value))) return literal;
            const bytes = values.map(Number);
            if (bytes.length !== 1024 || bytes.some(byte => byte < 0 || byte > 255)) return literal;
            const compact = bitmapLiteral(bytes);
            return assignment + (literal.includes("\r\n") ? compact.replace(/\n/g, "\r\n") : compact);
        });
    }

    function moveBootSettingsFirst(source, eol) {
        const bom = source.startsWith("\uFEFF") ? "\uFEFF" : "";
        const text = source.slice(bom.length);
        const lines = text.split(/\r?\n/);
        const leadingComments = [];
        while (lines.length && /^[ \t]*#/.test(lines[0])) leadingComments.push(lines.shift());
        const assignments = [], body = [];
        for (const line of lines) {
            const match = /^(activate_oled|PIN_NUM|led_count)[ \t]*=(?!=)/.exec(line);
            (match ? assignments : body).push(line);
        }
        if (assignments.length !== bootSettings.length ||
            !assignments.every(line => /^(?:activate_oled[ \t]*=[ \t]*(?:True|False)|(?:PIN_NUM|led_count)[ \t]*=[ \t]*(?:0x[0-9a-fA-F]+|[0-9]+))[ \t]*(?:#.*)?$/.test(line))) {
            throw new Error("Unsupported startup settings layout.");
        }
        // Keep already-correct profiles byte-for-byte intact.
        if (assignments.every((line, index) => lines[index] === line)) return source;
        while (body.length && !body[0].trim()) body.shift();
        return bom + [...leadingComments, ...assignments, "", ...body].join(eol);
    }

    function migratePython(source, target, renames = {}) {
        const previous = new Map(), defaults = new Map();
        const profile = parsePython(source, previous);
        const release = parsePython(target, defaults);
        const changes = new Map();
        for (const [oldKey, newKey] of Object.entries(renames)) {
            if (!validName(newKey) && !Object.hasOwn(fields, newKey))
                throw new Error("Invalid renamed setting " + newKey + ".");
            if (!Object.hasOwn(release.settings, newKey) || !defaults.has(newKey))
                throw new Error("No release default for renamed setting " + newKey + ".");
            if (!previous.has(oldKey)) continue;
            if (Object.hasOwn(fields, oldKey)) throw new Error("Renaming " + oldKey + " requires an updated configurator.");
            if (!Object.hasOwn(profile.settings, oldKey) || defaults.has(oldKey) ||
                previous.has(newKey) || changes.has(newKey))
                throw new Error("Cannot safely rename " + oldKey + " to " + newKey + ".");
            changes.set(newKey, profile.settings[oldKey]);
        }
        for (const key of Object.keys(profile.settings)) {
            if (previous.has(key) && !defaults.has(key) && !Object.hasOwn(renames, key))
                throw new Error("Release removed " + key + " without a migration rule.");
        }
        const kind = value => value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
        const newSettings = [];
        for (const [key, defaultValue] of Object.entries(release.settings)) {
            if (!defaults.has(key)) continue;
            const renamed = changes.has(key);
            const value = renamed ? changes.get(key) : previous.has(key) ? profile.settings[key] : defaultValue;
            if ((previous.has(key) && !Object.hasOwn(profile.settings, key)) || kind(value) !== kind(defaultValue))
                throw new Error("Incompatible release setting " + key + ".");
            if (!previous.has(key)) newSettings.push(key + " = " + (Array.isArray(value) ? tuple(value) :
                key === "brightness_steps" && value === "smooth" ? "smooth" : literal(value)));
        }
        // Keep the profile source and its custom definitions. Move the added settings ahead
        // of the existing computed values so firmware helpers can see the new defaults.
        const eol = source.includes("\r\n") ? "\r\n" : "\n";
        let result = source;
        for (const oldKey of Object.keys(renames)) {
            if (!previous.has(oldKey)) continue;
            const line = new RegExp("^" + oldKey + "[ \t]*=[^\r\n]*(?:\r?\n|$)", "m");
            if (!/^[A-Za-z_]\w*$/.test(oldKey) || !line.test(result) || !scalarSetting(previous.get(oldKey)))
                throw new Error("Unsupported rename for " + oldKey + ".");
            result = result.replace(line, "");
        }
        const idle = /^idlemode_leds[ \t]*=[^\r\n]*/m;
        if (!idle.test(result) || !defaults.has("idlemode_leds"))
            throw new Error("Unsupported release configuration layout.");
        result = result.replace(idle, () => [...newSettings, release.idleSetup].join(eol));
        const versionLine = /^#Fight Lights Pico V\d+\.\d+\.\d+[ \t]*(?=\r?$)/m;
        const releaseVersion = target.match(versionLine)?.[0].trimEnd();
        if (releaseVersion) result = result.replace(versionLine, releaseVersion);
        result = moveBootSettingsFirst(result, eol);
        const model = parsePython(result);
        // The current editor understands the existing Python profile structure.
        // Reject a release that changes its required imports or profile setup.
        const imports = code => new Set(code.split(/\r?\n/).map(line => line.split("#", 1)[0].trim())
            .filter(line => /^(?:import |from )/.test(line)).map(line => line.replace(/\s+/g, "")));
        const sourceImports = imports(source);
        for (const line of imports(target))
            if (!sourceImports.has(line) && line !== "frommachineimportPin")
                throw new Error("Release changes the configuration imports.");
        serializePython(model, true);
        return result;
    }

    const frameHex = bytes => Array.from(bytes, hexByte).join("");
    function parseFrames(source) {
        const hex = source.replace(/\s/g, "");
        if (!hex.length || hex.length % 2048 !== 0 || /[^a-f0-9]/i.test(hex))
            throw new Error("A .flan file must contain complete 128 × 64 hexadecimal frames.");
        return hex.match(/.{2048}/g).map(frame => Uint8Array.from(frame.match(/../g), pair => parseInt(pair, 16)));
    }

    return { fields, directionKeys, chordKeys, parsePython, serializePython, migratePython, compactInputBitmaps, parseFrames, frameHex, validName };
})();
if (typeof module === "object") module.exports = ProfileCodec;
