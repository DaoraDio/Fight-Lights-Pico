function toggle_oled_checkbox() {
    const container = document.getElementById('oled_modal_body');
    var checkbox = document.getElementById("oled_cb");
    const link = document.getElementById("oled_link");

    if (checkbox.checked) {
        container.classList.add('disabled-container');
        container.querySelectorAll('input, select, button, textarea')
            .forEach(el => el.disabled = true);
        link.classList.add('nav-disabled');
    } else {
        container.classList.remove('disabled-container');
        container.querySelectorAll('input, select, button, textarea')
            .forEach(el => el.disabled = false);
        link.classList.remove('nav-disabled');
    }
}

function disable_enable_elements(bool1, bool2, bool3) {
    document.getElementById("oled_open_directions").hidden = bool1;
    document.getElementById("act_button_label").hidden = bool2;
    document.getElementById("oled_select_activation_button").hidden = bool3;
}

function set_activation_button() {
    const oled_select = document.getElementById("oled_select_activation_button");
    var text = oled_select.options[oled_select.selectedIndex].text;
    selectedCircle.button_activation = text;
}

function updateCanvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_canvas();
    for (let i = 0; i < circles.length; i++) {
        if (circles[i].is_lever)
            circles[i].draw_filled_circle();
        else if (circles[i].is_key)
            circles[i].draw_rectangle();
        else
            circles[i].draw_circle();
    }
}

var canvas_drawn = false;
var splash_canvas_drawn = false;
var overlay_canvas_drawn = false;

function draw_splash_canvas() {
    const canvas = document.getElementById('my_splash_canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    splash_canvas_drawn = true;
}

function draw_overlay_canvas() {
    const canvas = document.getElementById('my_overlay_canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    overlay_canvas_drawn = true;
}

function draw_canvas() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas_drawn = true;
}

function show_oled_modal() {
    show_hide_i2c_selects();

    /*if (canvas_drawn == false)
        draw_canvas();
    if (splash_canvas_drawn == false)
        draw_splash_canvas();
    if (overlay_canvas_drawn == false)
        draw_overlay_canvas();*/

    var button_select_replace = '<select name="" id="oled_select_activation_button" onchange=""><option value="0">notSet</option>';

    // Get button table and safely process rows
    var table = document.getElementById("button_table");
    if (table) {
        for (var i = 1, row; row = table.rows[i]; i++) {
            // Safely get button name from first cell
            var buttonName = row.cells[0].textContent.trim();
            button_select_replace += '<option value="' + buttonName + '">' + buttonName + '</option>';
        }
    }
    button_select_replace += '</select>';

    const act_button = document.getElementById("oled_select_activation_button");
    act_button.innerHTML = button_select_replace;

    document.getElementById("oled_set_predef_layout").value = 0;
}

class Button {
    constructor(ctx, x, y, radius, is_lever, is_key, button_activation, angle = 0) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.is_lever = is_lever;
        this.is_key = is_key;
        this.angle = angle;
        this.button_activation = button_activation;
    }

    draw_line(x1, y1, x2, y2) {
        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let sx = (x1 < x2) ? 1 : -1;
        let sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.set_pixel(x1, y1);

            if (x1 === x2 && y1 === y2) break;
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

    set_pixel(x, y) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }

    draw_circle() {
        const x_centre = Math.round(this.x);
        const y_centre = Math.round(this.y);
        const r = Math.round(this.radius);

        let x = r;
        let y = 0;

        this.set_pixel(x + x_centre, y + y_centre);
        if (r > 0) {
            this.set_pixel(x + x_centre, -y + y_centre);
            this.set_pixel(y + x_centre, x + y_centre);
            this.set_pixel(-y + x_centre, x + y_centre);
        }

        let P = 1 - r;
        while (x > y) {
            y++;
            if (P <= 0) {
                P = P + 2 * y + 1;
            } else {
                x--;
                P = P + 2 * y - 2 * x + 1;
            }

            if (x < y) {
                break;
            }

            this.set_pixel(x + x_centre, y + y_centre);
            this.set_pixel(-x + x_centre, y + y_centre);
            this.set_pixel(x + x_centre, -y + y_centre);
            this.set_pixel(-x + x_centre, -y + y_centre);

            if (x !== y) {
                this.set_pixel(y + x_centre, x + y_centre);
                this.set_pixel(-y + x_centre, x + y_centre);
                this.set_pixel(y + x_centre, -x + y_centre);
                this.set_pixel(-y + x_centre, -x + y_centre);
            }
        }
    }

    draw_filled_circle() {
        const x_centre = Math.round(this.x);
        const y_centre = Math.round(this.y);
        const r = Math.round(this.radius - 3);

        let x = r;
        let y = 0;

        this.set_pixel(x + x_centre, y + y_centre, 1);
        if (r > 0) {
            this.set_pixel(x + x_centre, -y + y_centre, 1);
            this.set_pixel(y + x_centre, x + y_centre, 1);
            this.set_pixel(-y + x_centre, x + y_centre, 1);
        }
        let P = 1 - r;

        while (x > y) {
            y++;
            if (P <= 0)
                P = P + 2 * y + 1;
            else {
                x--;
                P = P + 2 * y - 2 * x + 1;
            }
            if (x < y)
                break;
            this.draw_line(-x + x_centre, y + y_centre, x + x_centre, y + y_centre, 1);
            this.draw_line(-x + x_centre, -y + y_centre, x + x_centre, -y + y_centre, 1);

            if (x != y) {
                this.draw_line(-y + x_centre, x + y_centre, y + x_centre, x + y_centre, 1);
                this.draw_line(-y + x_centre, -x + y_centre, y + x_centre, -x + y_centre, 1);
            }
            this.draw_line(x_centre - r, y_centre, x_centre + r, y_centre, 1);
        }
        this.draw_circle();
    }

    handleMouseDown(e) {
        const canvas = document.getElementById('myCanvas');
        const rect = canvas.getBoundingClientRect();

        // No scaling needed since canvas display size matches actual size
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;

        if (dx * dx + dy * dy <= this.radius * this.radius) {
            this.isDragging = true;
            this.offsetX = dx;
            this.offsetY = dy;
            selectedCircle = this;
            const radius_select = document.getElementById('oled_button_radius');
            const key_select = document.getElementById('oled_key_angle');
            key_select.value = this.angle;
            radius_select.value = this.radius;

            const act_button = document.getElementById("oled_select_activation_button");
            for (let i = 0; i < act_button.options.length; i++) {
                if (act_button.options[i].text === this.button_activation) {
                    act_button.selectedIndex = i;
                    break;
                }
            }

            const delete_button = document.getElementById("delete_oled_button");
            delete_button.disabled = false;


            if (this.is_lever)
                disable_enable_elements(false, true, true);
            else
                disable_enable_elements(true, false, false);
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const canvas = document.getElementById('myCanvas');
            const rect = canvas.getBoundingClientRect();

            // No scaling needed since canvas display size matches actual size
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let newX = mouseX - this.offsetX;
            let newY = mouseY - this.offsetY;

            const minX = this.radius;
            const minY = this.radius;
            const maxX = 128 - this.radius;
            const maxY = 64 - this.radius;

            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));

            this.x = Math.round(newX);
            this.y = Math.round(newY);

            updateCanvas();
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
    }

    changeRadius(r) {
        r = parseInt(r, 10);
        if (r > 0) {
            this.radius = r;
            updateCanvas();
        }
    }

    changeangle(a) {
        a = parseInt(a, 10);
        if (a > 0) {
            this.angle = a;
            updateCanvas();
        }
    }

    moveBy(dx, dy) {
        const minX = this.radius;
        const minY = this.radius;
        const maxX = 128 - this.radius;
        const maxY = 64 - this.radius;

        this.x = Math.max(minX, Math.min(maxX, this.x + dx));
        this.y = Math.max(minY, Math.min(maxY, this.y + dy));

        updateCanvas();
    }

    draw_rectangle() {
        const rad = this.angle * Math.PI / 180;
        const cosAngle = Math.cos(rad);
        const sinAngle = Math.sin(rad);

        const halfSide = this.radius / 2;

        const corners = [
            [-halfSide, -halfSide],
            [halfSide, -halfSide],
            [halfSide, halfSide],
            [-halfSide, halfSide]
        ];

        const rotatedCorners = corners.map(([x, y]) => {
            const xRot = x * cosAngle - y * sinAngle;
            const yRot = x * sinAngle + y * cosAngle;
            return [Math.round(xRot + this.x), Math.round(yRot + this.y)];
        });

        for (let i = 0; i < rotatedCorners.length; i++) {
            const [x1, y1] = rotatedCorners[i];
            const [x2, y2] = rotatedCorners[(i + 1) % rotatedCorners.length];
            this.draw_line(x1, y1, x2, y2);
        }
    }
}


let circles = [];
let selectedCircle = null;

function oled_add_button(x = 10, y = 10, radius = 6, is_lever = false, is_key = false, act_button = "notSet", angle = 0) {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const circle = new Button(ctx, x, y, radius, is_lever, is_key, act_button, angle);
    circles.push(circle);
    circle.draw_circle();

    circle.mouseDownHandler = (e) => circle.handleMouseDown(e);
    circle.mouseMoveHandler = (e) => circle.handleMouseMove(e);
    circle.mouseUpHandler = (e) => circle.handleMouseUp(e);

    canvas.addEventListener('mousedown', circle.mouseDownHandler);
    canvas.addEventListener('mousemove', circle.mouseMoveHandler);
    canvas.addEventListener('mouseup', circle.mouseUpHandler);
}

function oled_add_lever() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const circle = new Button(ctx, 30, 10, 6, true, false, "notSet");
    circles.push(circle);
    circle.draw_filled_circle();

    circle.mouseDownHandler = (e) => circle.handleMouseDown(e);
    circle.mouseMoveHandler = (e) => circle.handleMouseMove(e);
    circle.mouseUpHandler = (e) => circle.handleMouseUp(e);

    canvas.addEventListener('mousedown', circle.mouseDownHandler);
    canvas.addEventListener('mousemove', circle.mouseMoveHandler);
    canvas.addEventListener('mouseup', circle.mouseUpHandler);
}

function oled_add_key() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const circle = new Button(ctx, 50, 10, 10, false, true, "notSet");
    circles.push(circle);

    circle.mouseDownHandler = (e) => circle.handleMouseDown(e);
    circle.mouseMoveHandler = (e) => circle.handleMouseMove(e);
    circle.mouseUpHandler = (e) => circle.handleMouseUp(e);

    canvas.addEventListener('mousedown', circle.mouseDownHandler);
    canvas.addEventListener('mousemove', circle.mouseMoveHandler);
    canvas.addEventListener('mouseup', circle.mouseUpHandler);
    circle.draw_rectangle();
}

function delete_oled_button() {
    const canvas = document.getElementById('myCanvas');
    let index = circles.findIndex(circle => circle === selectedCircle);
    if (index >= 0 && index < circles.length) {
        const circleToDelete = circles[index];

        if (circleToDelete.mouseDownHandler) {
            canvas.removeEventListener('mousedown', circleToDelete.mouseDownHandler);
        }
        if (circleToDelete.mouseMoveHandler) {
            canvas.removeEventListener('mousemove', circleToDelete.mouseMoveHandler);
        }
        if (circleToDelete.mouseUpHandler) {
            canvas.removeEventListener('mouseup', circleToDelete.mouseUpHandler);
        }

        circles.splice(index, 1);
    }

    const delete_button = document.getElementById("delete_oled_button");
    delete_button.disabled = true;
    selectedCircle = null;
    disable_enable_elements(true, true, true);
    updateCanvas();
}

function changerad(r) {
    if (selectedCircle) {
        selectedCircle.changeRadius(r);
    }
}

function changeangle(a) {
    if (selectedCircle) {
        selectedCircle.changeangle(a);
    }
}

document.addEventListener('keydown', function (event) {
    const step = 1;
    if (selectedCircle && document.getElementById("oled-page").style.display !== "none" &&
        !event.target.matches("input, select, textarea, [contenteditable]")) {
        switch (event.key) {
            case 'ArrowUp':
                selectedCircle.moveBy(0, -step);
                event.preventDefault();
                break;
            case 'ArrowDown':
                selectedCircle.moveBy(0, step);
                event.preventDefault();
                break;
            case 'ArrowLeft':
                selectedCircle.moveBy(-step, 0);
                event.preventDefault();
                break;
            case 'ArrowRight':
                selectedCircle.moveBy(step, 0);
                event.preventDefault();
                break;
            case 'p':
                console.log(circles);
                event.preventDefault();
                break;
        }
    }
});

function invertColors() {
    const canvas = document.getElementById('my_splash_canvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }

    ctx.putImageData(imageData, 0, 0);
}

function set_viewlix_layout() {
    oled_add_button(25, 31, 7, true, false, "notSet", 0);
    oled_add_button(56, 24, 8, false, false, "notSet", 0);
    oled_add_button(76, 19, 8, false, false, "notSet", 0);
    oled_add_button(95, 19, 8, false, false, "notSet", 0);
    oled_add_button(114, 19, 8, false, false, "notSet", 0);
    oled_add_button(51, 44, 8, false, false, "notSet", 0);
    oled_add_button(71, 40, 8, false, false, "notSet", 0);
    oled_add_button(91, 40, 8, false, false, "notSet", 0);
    oled_add_button(110, 40, 8, false, false, "notSet", 0);

}

function set_noir_layout() {
    oled_add_button(46 - 30, 41 - 10, 7, true, false, "notSet", 0);
    oled_add_button(85 - 30, 34 - 10, 8, false, false, "notSet", 0);
    oled_add_button(105 - 30, 29 - 10, 8, false, false, "notSet", 0);
    oled_add_button(124 - 30, 32 - 10, 8, false, false, "notSet", 0);
    oled_add_button(143 - 30, 36 - 10, 8, false, false, "notSet", 0);
    oled_add_button(80 - 30, 54 - 10, 8, false, false, "notSet", 0);
    oled_add_button(100 - 30, 50 - 10, 8, false, false, "notSet", 0);
    oled_add_button(120 - 30, 53 - 10, 8, false, false, "notSet", 0);
    oled_add_button(139 - 30, 56 - 10, 8, false, false, "notSet", 0);
}


function set_leverless_layout() {
    oled_add_button(93 - 30, 28 - 10, 7, false, false, "notSet", 0);
    oled_add_button(110 - 30, 24 - 10, 7, false, false, "notSet", 0);
    oled_add_button(127 - 30, 26 - 10, 7, false, false, "notSet", 0);
    oled_add_button(144 - 30, 29 - 10, 7, false, false, "notSet", 0);
    oled_add_button(91 - 30, 45 - 10, 7, false, false, "notSet", 0);
    oled_add_button(108 - 30, 41 - 10, 7, false, false, "notSet", 0);
    oled_add_button(125 - 30, 44 - 10, 7, false, false, "notSet", 0);
    oled_add_button(143 - 30, 47 - 10, 7, false, false, "notSet", 0);
    oled_add_button(85 - 30, 63 - 10, 8, false, false, "notSet", 0);
    oled_add_button(76 - 30, 35 - 10, 7, false, false, "notSet", 0);
    oled_add_button(60 - 30, 28 - 10, 7, false, false, "notSet", 0);
    oled_add_button(42 - 30, 28 - 10, 7, false, false, "notSet", 0);
}

function set_wasd_layout() {
    oled_add_button(87 - 30, 34 - 10, 8, false, false, "notSet", 0);
    oled_add_button(107 - 30, 29 - 10, 8, false, false, "notSet", 0);
    oled_add_button(126 - 30, 32 - 10, 8, false, false, "notSet", 0);
    oled_add_button(145 - 30, 36 - 10, 8, false, false, "notSet", 0);
    oled_add_button(82 - 30, 54 - 10, 8, false, false, "notSet", 0);
    oled_add_button(102 - 30, 50 - 10, 8, false, false, "notSet", 0);
    oled_add_button(122 - 30, 53 - 10, 8, false, false, "notSet", 0);
    oled_add_button(141 - 30, 56 - 10, 8, false, false, "notSet", 0);

    oled_add_button(41 - 30, 38 - 10, 11, false, true, "notSet", 20);
    oled_add_button(65 - 30, 48 - 10, 11, false, true, "notSet", 20);
    oled_add_button(53 - 30, 43 - 10, 11, false, true, "notSet", 20);
    oled_add_button(58 - 30, 31 - 10, 11, false, true, "notSet", 20);
}

function remove_all_event_listeners() {
    const canvas = document.getElementById('myCanvas');

    for (let i = 0; i < circles.length; i++) {
        let circleToDelete = circles[i];

        if (circleToDelete.mouseDownHandler) {
            canvas.removeEventListener('mousedown', circleToDelete.mouseDownHandler);
        }
        if (circleToDelete.mouseMoveHandler) {
            canvas.removeEventListener('mousemove', circleToDelete.mouseMoveHandler);
        }
        if (circleToDelete.mouseUpHandler) {
            canvas.removeEventListener('mouseup', circleToDelete.mouseUpHandler);
        }
    }
}

function set_layout() {
    if (confirm("Do you really want to load a preset layout? This will clear your current layout entirely")) {
        ;
    }
    else {
        document.getElementById("oled_set_predef_layout").value = 0;
        return;
    }


    var selectElement = document.getElementById("oled_set_predef_layout");
    var selectedValue = selectElement.value;

    remove_all_event_listeners();
    if (selectedValue === "1") {
        circles = [];
        set_viewlix_layout();
    }
    else if (selectedValue === "2") {
        circles = [];
        set_noir_layout();
    }
    else if (selectedValue === "3") {
        circles = [];
        set_leverless_layout();
    }
    else if (selectedValue === "4") {
        circles = [];
        set_wasd_layout();
    }
    else if (selectedValue === "5") {
        circles = [];
    }

    const delete_button = document.getElementById("delete_oled_button");
    delete_button.disabled = true;
    selectedCircle = null;
    disable_enable_elements(true, true, true);
    updateCanvas();
}

function show_hide_i2c_selects() {
    var sda0 = document.getElementById("oled_sda0_select");
    var scl0 = document.getElementById("oled_scl0_select");

    var sda1 = document.getElementById("oled_sda1_select");
    var scl1 = document.getElementById("oled_scl1_select");

    var rad0 = document.getElementById("oled_i2c_rad1");
    var rad1 = document.getElementById("oled_i2c_rad2");

    if (rad0.checked) {
        sda0.hidden = false;
        scl0.hidden = false;

        sda1.hidden = true;
        scl1.hidden = true;
    }
    else if (rad1.checked) {
        sda0.hidden = true;
        scl0.hidden = true;

        sda1.hidden = false;
        scl1.hidden = false;
    }
}

function initOledComponents() {
    if (canvas_drawn == false)
        draw_canvas();
    if (splash_canvas_drawn == false)
        draw_splash_canvas();
    if (overlay_canvas_drawn == false)
        draw_overlay_canvas();

    const radiusInput = document.getElementById('oled_button_radius');
    const angleInput = document.getElementById('oled_key_angle');

    if (radiusInput) {
        radiusInput.addEventListener('input', function () {
            changerad(this.value);
        });
    }

    if (angleInput) {
        angleInput.addEventListener('input', function () {
            changeangle(this.value);
        });
    }
}

// Export it for external use
window.initOledComponents = initOledComponents;

