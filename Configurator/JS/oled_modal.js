function close_oled_modal() {
    var modal = document.getElementById("oled_modal");
    selectedCircle = null;

    const delete_button = document.getElementById("delete_oled_button");
    delete_button.disabled = true;
    delete_button.style.color = "lightgray";
    disable_enable_elements(true,true,true);

    modal.close();
}

function disable_enable_elements(bool1, bool2, bool3)
{
    document.getElementById("oled_open_directions").hidden = bool1;
    document.getElementById("act_button_label").hidden = bool2;
    document.getElementById("oled_select_activation_button").hidden = bool3;
}
function set_activation_button()
{
    const oled_select = document.getElementById("oled_select_activation_button");
    var text = oled_select.options[oled_select.selectedIndex].text;
    selectedCircle.button_activation = text;
    //console.log(text);
}

function updateCanvas() 
{
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw_canvas();
    for (let i = 0; i < circles.length; i++) 
    {
        if(circles[i].is_lever)
            circles[i].draw_filled_circle();
        else if(circles[i].is_key)
            circles[i].draw_rectangle();
        else
            circles[i].draw_circle();
    }
}

var canvas_drawn = false;
var splash_canvas_drawn = false;
var overlay_canvas_drawn = false;


function draw_splash_canvas()
{
    const canvas = document.getElementById('my_splash_canvas');
    const ctx2 = canvas.getContext('2d');

    const x = 30;
    const y = 40;
    const width = 128;
    const height = 64;

    ctx2.fillStyle = 'black';
    ctx2.fillRect(x, y, width, height);
    splash_canvas_drawn = true;
}

function draw_overlay_canvas()
{
    const canvas = document.getElementById('my_overlay_canvas');
    const ctx2 = canvas.getContext('2d');

    const x = 30;
    const y = 40;
    const width = 128;
    const height = 64;

    ctx2.fillStyle = 'black';
    ctx2.fillRect(x, y, width, height);
    overlay_canvas_drawn = true;
}

function draw_canvas()
{
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    const x = 30;
    const y = 10;
    const width = 128;
    const height = 64;

    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, width, height);
    canvas_drawn = true;
}

function show_oled_modal() 
{
    //check_animation_codebox();
    show_hide_i2c_selects();
    const modal = document.getElementById("oled_modal");
    loadImageToCanvas();
    if(canvas_drawn == false)
        draw_canvas();
    if(splash_canvas_drawn == false)
        draw_splash_canvas();
    if(overlay_canvas_drawn == false)
        draw_overlay_canvas();



    var button_select_replace = '<select name="" id="oled_select_activation_button" onchange=""><option value="0">notSet</option></select>';


    var table = document.getElementById("button_table");
    for (var i = 1, row; row = table.rows[i]; i++) 
    {
        var col = row.innerText;
        col = col.split("\t");
            button_select_replace +=  '<option value="' + col[0] + '">' + col[0] +'</option>';
        
    }
    button_select_replace += '</select>';

    const act_button = document.getElementById("oled_select_activation_button");
    act_button.innerHTML = button_select_replace;

    document.getElementById("oled_set_predef_layout").value = 0;
    modal.showModal();
}

class Button 
{
    constructor(ctx, x, y, radius, is_lever, is_key, button_activation, angle=0) {
        this.ctx = ctx;
        this.x = x + 30;
        this.y = y + 10;
        this.radius = radius;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.is_lever = is_lever;
        this.is_key = is_key;
        this.angle = angle; // Rotation angle in degrees
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

    set_pixel(x, y) 
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, 1, 1);
    }

    draw_circle() 
    {
        const x_centre = this.x;
        const y_centre = this.y;
        const r = this.radius;

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

            // Drawing all eight octants
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

    draw_filled_circle() 
    {
        const x_centre = this.x;
        const y_centre = this.y;
        const r = this.radius - 3;
    
        let x = r;
        let y = 0;
    
        this.set_pixel(x + x_centre, y + y_centre, 1);
        if (r > 0) {
            this.set_pixel(x + x_centre, -y + y_centre, 1);
            this.set_pixel(y + x_centre, x + y_centre, 1);
            this.set_pixel(-y + x_centre, x + y_centre, 1);
        }
        let P = 1 - r;
    
        while (x > y) 
        {
            y++;
            if (P <= 0) 
                P = P + 2 * y + 1;
            else 
            {
                x--;
                P = P + 2 * y - 2 * x + 1;
            }
            if (x < y) 
                break;
            this.draw_line(-x + x_centre, y + y_centre, x + x_centre, y + y_centre, 1);
            this.draw_line(-x + x_centre, -y + y_centre, x + x_centre, -y + y_centre, 1);
    
            if (x != y)
            {
                this.draw_line(-y + x_centre, x + y_centre, y + x_centre, x + y_centre, 1);
                this.draw_line(-y + x_centre, -x + y_centre, y + x_centre, -x + y_centre, 1);
            }
            this.draw_line(x_centre - r, y_centre, x_centre + r, y_centre, 1);
        }
        this.draw_circle();
    }

    handleMouseDown(e) {
        const canvas = document.getElementById('myCanvas');
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        const dx = mouseX - this.x;
        const dy = mouseY - this.y;

        if (dx * dx + dy * dy <= this.radius * this.radius) {
            this.isDragging = true;
            this.offsetX = dx;
            this.offsetY = dy;
            selectedCircle = this; // Set this circle as the selected circle
            const radius_select = document.getElementById('oled_button_radius');
            const key_select = document.getElementById('oled_key_angle');
            key_select.value = this.angle;
            radius_select.value = this.radius;
            //console.log(this.x, this.y, this.radius);
            //Update select statement
            const act_button = document.getElementById("oled_select_activation_button");
            for (let i = 0; i < act_button.options.length; i++) 
            {
                if (act_button.options[i].text === this.button_activation) {
                    act_button.selectedIndex = i;
                  break; 
                }
            }
            const delete_button = document.getElementById("delete_oled_button");
            delete_button.disabled = false;
            delete_button.style.color = "red";

            if(this.is_lever)
                disable_enable_elements(false,true,true);
            
            else
                disable_enable_elements(true,false,false);
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const canvas = document.getElementById('myCanvas');
            const mouseX = e.clientX - canvas.getBoundingClientRect().left;
            const mouseY = e.clientY - canvas.getBoundingClientRect().top;

            // Calculate new position and constrain within boundaries
            let newX = mouseX - this.offsetX;
            let newY = mouseY - this.offsetY;

            const minX = 30 + this.radius;
            const minY = 10 + this.radius;
            const maxX = 158 - this.radius;
            const maxY = 74 - this.radius;

            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));

            this.x = newX;
            this.y = newY;

            updateCanvas();
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
    }

    changeRadius(r) {
        r = parseInt(r, 10); // Ensure the radius is an integer
        if (r > 0) { // Prevent radius from becoming non-positive
            this.radius = r;
            updateCanvas();
        }
    }

    changeangle(a)
    {
        a = parseInt(a, 10); // Ensure the angle is an integer
        if (a > 0)
        {
            this.angle = a;
            updateCanvas();
        }
    }

    moveBy(dx, dy) {
        const minX = 30 + this.radius;
        const minY = 10 + this.radius;
        const maxX = 158 - this.radius;
        const maxY = 74 - this.radius;

        this.x = Math.max(minX, Math.min(maxX, this.x + dx));
        this.y = Math.max(minY, Math.min(maxY, this.y + dy));

        updateCanvas();
    }

    
    draw_rectangle() {
        // Convert angle to radians
        const rad = this.angle * Math.PI / 180;
        const cosAngle = Math.cos(rad);
        const sinAngle = Math.sin(rad);
        
        //console.log(rad, cosAngle, sinAngle);
        // Calculate half-side length
        const halfSide = this.radius / 2; // Assuming this.radius is the side length of the square
    
        // Calculate the square corners relative to the center
        const corners = [
            [-halfSide, -halfSide],
            [halfSide, -halfSide],
            [halfSide, halfSide],
            [-halfSide, halfSide]
        ];
    
        // Apply rotation and translation to each corner
        const rotatedCorners = corners.map(([x, y]) => {
            // Apply rotation
            const xRot = x * cosAngle - y * sinAngle;
            const yRot = x * sinAngle + y * cosAngle;
    
            // Translate to the center
            return [xRot + this.x, yRot + this.y];
        });
    
        // Draw lines between the rotated corners
        for (let i = 0; i < rotatedCorners.length; i++) {
            const [x1, y1] = rotatedCorners[i];
            const [x2, y2] = rotatedCorners[(i + 1) % rotatedCorners.length];
            //console.log(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2));
            this.draw_line(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2));
        }
    }
}

let circles = []; // Array to hold multiple circles
let selectedCircle = null; // Variable to hold the currently selected circle

function oled_add_button(x=10,y=10,radius=6,is_lever=false,is_key=false,act_button="notSet",angle=0) 
{
    //console.log("button Added:", x, y, radius, is_lever, is_key, act_button,angle);
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const circle = new Button(ctx, x, y, radius, is_lever, is_key, act_button,angle);
    circles.push(circle);
    circle.draw_circle();

    circle.mouseDownHandler = (e) => circle.handleMouseDown(e);
    circle.mouseMoveHandler = (e) => circle.handleMouseMove(e);
    circle.mouseUpHandler = (e) => circle.handleMouseUp(e);

    // Add event listeners for this circle
    canvas.addEventListener('mousedown', circle.mouseDownHandler);
    canvas.addEventListener('mousemove', circle.mouseMoveHandler);
    canvas.addEventListener('mouseup', circle.mouseUpHandler);
}

function oled_add_lever()
{
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const circle = new Button(ctx, 10, 10, 6, true, false,"notSet");
    circles.push(circle);
    circle.draw_filled_circle();

    circle.mouseDownHandler = (e) => circle.handleMouseDown(e);
    circle.mouseMoveHandler = (e) => circle.handleMouseMove(e);
    circle.mouseUpHandler = (e) => circle.handleMouseUp(e);

    // Add event listeners for this circle
    canvas.addEventListener('mousedown', circle.mouseDownHandler);
    canvas.addEventListener('mousemove', circle.mouseMoveHandler);
    canvas.addEventListener('mouseup', circle.mouseUpHandler);
}


function oled_add_key()
{
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const circle = new Button(ctx, 10, 10, 10, false, true, "notSet");
    circles.push(circle);

    // Store references to event handlers in the circle object
    circle.mouseDownHandler = (e) => circle.handleMouseDown(e);
    circle.mouseMoveHandler = (e) => circle.handleMouseMove(e);
    circle.mouseUpHandler = (e) => circle.handleMouseUp(e);
    
    // Add event listeners using these references
    canvas.addEventListener('mousedown', circle.mouseDownHandler);
    canvas.addEventListener('mousemove', circle.mouseMoveHandler);
    canvas.addEventListener('mouseup', circle.mouseUpHandler);
    circle.draw_rectangle();

}

function delete_oled_button()
{
    const canvas = document.getElementById('myCanvas');
    let index = circles.findIndex(circle => circle === selectedCircle);
    if (index >= 0 && index < circles.length) {
        const circleToDelete = circles[index];

        // Remove the event listeners for this circle
        if (circleToDelete.mouseDownHandler) {
            canvas.removeEventListener('mousedown', circleToDelete.mouseDownHandler);
        }
        if (circleToDelete.mouseMoveHandler) {
            canvas.removeEventListener('mousemove', circleToDelete.mouseMoveHandler);
        }
        if (circleToDelete.mouseUpHandler) {
            canvas.removeEventListener('mouseup', circleToDelete.mouseUpHandler);
        }

        // Remove the circle from the array
        circles.splice(index, 1);
    }
    //console.log(index, " - ", circles);
    
    const delete_button = document.getElementById("delete_oled_button");
    delete_button.disabled = true;
    delete_button.style.color = "lightgray";
    selectedCircle = null;
    disable_enable_elements(true,true,true);
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

function loadImageToCanvas() {
    const imageLoader = document.getElementById('imageLoader');
    const canvas = document.getElementById('my_splash_canvas');
    const ctx = canvas.getContext('2d');
    const x = 30;
    const y = 40;


    document.getElementById('customButton').addEventListener('click', function() {
        imageLoader.click();
    });

    imageLoader.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Clear the canvas before drawing the new image
                ctx.clearRect(x, y, 128, 64);
                
                // Draw the image at the specified (x, y) coordinates, scaled to the canvas dimensions
                ctx.drawImage(img, x, y, 128, 64);

                // Get the image data from the canvas
                const imageData = ctx.getImageData(x, y, canvas.width, canvas.height);
                const data = imageData.data;

                // Convert the image to binary (black and white)
                for (let i = 0; i < data.length; i += 4) {
                    // Calculate the grayscale value
                    const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
                    
                    // Apply a threshold to convert to black or white
                    const binaryColor = gray > 128 ? 255 : 0;
                    
                    // Set the RGB channels to the binary color
                    data[i] = binaryColor;     // Red
                    data[i + 1] = binaryColor; // Green
                    data[i + 2] = binaryColor; // Blue
                }

                // Put the modified image data back onto the canvas
                ctx.putImageData(imageData, x, y);
            }
            img.src = event.target.result;
        }

        reader.readAsDataURL(file);
    });
}

function handleUploadOverlay() 
{
    const imageLoader = document.getElementById('imageLoader2');
    const canvas = document.getElementById('my_overlay_canvas');
    
    // Trigger the file input click
    imageLoader.click();

    // Handle the file input change event
    imageLoader.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const ctx = canvas.getContext('2d');
                const x = 30;
                const y = 40;

                // Clear the canvas before drawing the new image
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw the image at the specified (x, y) coordinates
                ctx.drawImage(img, x, y, 128, 64);

                // Get the image data from the canvas
                const imageData = ctx.getImageData(x, y, 128, 64);
                const data = imageData.data;

                // Convert the image to binary (black and white)
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
                    const binaryColor = gray > 128 ? 255 : 0;

                    data[i] = binaryColor;     // Red
                    data[i + 1] = binaryColor; // Green
                    data[i + 2] = binaryColor; // Blue
                }

                // Put the modified image data back onto the canvas
                ctx.putImageData(imageData, x, y);
            };
            img.onerror = function() {
                console.error('Failed to load image');
            };
            img.src = event.target.result;
        };

        reader.onerror = function() {
            console.error('Failed to read file');
        };

        reader.readAsDataURL(file);
    };
}
// Add event listener for keydown events
document.addEventListener('keydown', function(event) 
{
    const step = 1; // Move step size
    if (selectedCircle) 
        {
        switch (event.key) 
        {
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
            case 'p':  // Adding the case for the "P" key
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
        // Invert the color: 0 becomes 255, 255 becomes 0
        data[i] = 255 - data[i];       // Red channel
        data[i + 1] = 255 - data[i + 1]; // Green channel
        data[i + 2] = 255 - data[i + 2]; // Blue channel
    }

    ctx.putImageData(imageData, 0, 0);
}

function createPythonByteArray(pixelArray, string) 
{
    const width = 128;
    const height = 64;
    const bytesPerRow = width / 8;
    let hexString = string + ' = bytearray([\n';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < bytesPerRow; x++) {
            let byte = 0;

            for (let bit = 0; bit < 8; bit++) {
                if (pixelArray[y * width + x * 8 + bit] === 255) {
                    byte |= (1 << (7 - bit)); // Set bit from MSB to LSB
                }
            }

            // Convert byte to two-character hexadecimal string and prepend 0x
            hexString += '0x' + byte.toString(16).padStart(2, '0').toUpperCase() + ',';
        }
        hexString += '\n'; // Add new line after each row of bytes
    }

    // Remove the trailing comma and space, and close the list
    hexString = hexString.slice(0, -2) + '\n])';

    return hexString;
}
function createPythonByteArray2(pixelArray, string) {
    const width = 128;
    const height = 64;
    const bytesPerRow = width / 8;
    let hexString = string;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < bytesPerRow; x++) {
            let byte = 0;

            for (let bit = 0; bit < 8; bit++) {
                if (pixelArray[y * width + x * 8 + bit] === 255) {
                    byte |= (1 << (7 - bit)); // Set bit from MSB to LSB
                }
            }

            // Convert byte to two-character hexadecimal string without 0x
            hexString += byte.toString(16).padStart(2, '0').toUpperCase();
        }
    }

    // Remove the trailing comma if added, but ensure no extra characters
    return hexString;
}



function getBinaryPixelValuesArray(canvas_id) 
{
    const canvas = document.getElementById(canvas_id);
    const ctx = canvas.getContext('2d');
    const width = 128;
    const height = 64;
    const x = 30;
    const y = 40;

    // Get the image data from the canvas
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    const binaryArray = [];

    // Loop through every pixel and populate the binaryArray
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const value = data[index]; // Red channel value (same for binary)

            // Push the binary value (0 or 255) into the array
            binaryArray.push(value === 0 ? 0 : 255);
        }
    }

    return binaryArray;
}

function set_viewlix_layout()
{
    oled_add_button(55-30,41-10,7,true,false,"notSet",0);
    oled_add_button(86-30,34-10,8,false,false,"notSet",0);
    oled_add_button(106-30,29-10,8,false,false,"notSet",0);
    oled_add_button(125-30,29-10,8,false,false,"notSet",0);
    oled_add_button(144-30,29-10,8,false,false,"notSet",0);
    oled_add_button(81-30,54-10,8,false,false,"notSet",0);
    oled_add_button(101-30,50-10,8,false,false,"notSet",0);
    oled_add_button(121-30,50-10,8,false,false,"notSet",0);
    oled_add_button(140-30,50-10,8,false,false,"notSet",0);
}

function set_noir_layout()
{
    oled_add_button(46-30,41-10,7,true,false,"notSet",0);
    oled_add_button(85-30,34-10,8,false,false,"notSet",0);
    oled_add_button(105-30,29-10,8,false,false,"notSet",0);
    oled_add_button(124-30,32-10,8,false,false,"notSet",0);
    oled_add_button(143-30,36-10,8,false,false,"notSet",0);
    oled_add_button(80-30,54-10,8,false,false,"notSet",0);
    oled_add_button(100-30,50-10,8,false,false,"notSet",0);
    oled_add_button(120-30,53-10,8,false,false,"notSet",0);
    oled_add_button(139-30,56-10,8,false,false,"notSet",0);

    
}

function set_leverless_layout()
{
    oled_add_button(93-30,28-10,7,false,false,"notSet",0);
    oled_add_button(110-30,24-10,7,false,false,"notSet",0);
    oled_add_button(127-30,26-10,7,false,false,"notSet",0);
    oled_add_button(144-30,29-10,7,false,false,"notSet",0);
    oled_add_button(91-30,45-10,7,false,false,"notSet",0);
    oled_add_button(108-30,41-10,7,false,false,"notSet",0);
    oled_add_button(125-30,44-10,7,false,false,"notSet",0);
    oled_add_button(143-30,47-10,7,false,false,"notSet",0);
    oled_add_button(85-30,63-10,8,false,false,"notSet",0);
    oled_add_button(76-30,35-10,7,false,false,"notSet",0);
    oled_add_button(60-30,28-10,7,false,false,"notSet",0);
    oled_add_button(42-30,28-10,7,false,false,"notSet",0);
}

function set_wasd_layout()
{
    oled_add_button(87-30,34-10,8,false,false,"notSet",0);
    oled_add_button(107-30,29-10,8,false,false,"notSet",0);
    oled_add_button(126-30,32-10,8,false,false,"notSet",0);
    oled_add_button(145-30,36-10,8,false,false,"notSet",0);
    oled_add_button(82-30,54-10,8,false,false,"notSet",0);
    oled_add_button(102-30,50-10,8,false,false,"notSet",0);
    oled_add_button(122-30,53-10,8,false,false,"notSet",0);
    oled_add_button(141-30,56-10,8,false,false,"notSet",0);

    oled_add_button(41-30,38-10,11,false,true,"notSet",20);
    oled_add_button(65-30,48-10,11,false,true,"notSet",20);
    oled_add_button(53-30,43-10,11,false,true,"notSet",20);
    oled_add_button(58-30,31-10,11,false,true,"notSet",20);
}

function remove_all_event_listeners() 
{
    const canvas = document.getElementById('myCanvas');

    for (let i = 0; i < circles.length; i++) {
        let circleToDelete = circles[i];

        // Remove event listeners only if handlers exist
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

function set_layout() 
{
    var selectElement = document.getElementById("oled_set_predef_layout");
    var selectedValue = selectElement.value; 
    
    
    remove_all_event_listeners();
    if (selectedValue === "1")
    {
        circles = [];
        set_viewlix_layout();
    }

    else if (selectedValue === "2") 
    {
        circles = [];
        set_noir_layout();
    } 
    else if (selectedValue === "3") 
    {
        circles = [];
        set_leverless_layout();
    } 
    else if (selectedValue === "4") 
    {
      circles = [];
      set_wasd_layout();
    }
    else if (selectedValue === "5") 
    {
        circles = [];
    }

    const delete_button = document.getElementById("delete_oled_button");
    delete_button.disabled = true;
    delete_button.style.color = "lightgray";
    selectedCircle = null;
    disable_enable_elements(true,true,true);
    updateCanvas();
    
}


/************************************************** */
var animation_string = "";
var animation_string2 = "";
var frame_arr = "frames = [";
var totalFiles = 0;
var processedFiles = 0;
document.addEventListener('DOMContentLoaded', function () 
{
    // Trigger file input when button is pressed
    document.getElementById('oled_upload_animation_button').addEventListener('click', function() 
    {
        document.getElementById('uploadPngs').click();
    });

    document.getElementById('uploadPngs').addEventListener('change', handlePngUpload);

function handlePngUpload(event) 
{
    const files = event.target.files;
    if (files.length === 0) 
    {
        console.error("No PNG files selected.");
        return;
    }

    // Reset state
    animation_string = "";
    animation_string2 = "";
    frame_arr = "frames = [";
    totalFiles = files.length;
    processedFiles = 0;

    // Reset progress bar
    const progressBar = document.getElementById('conversionProgress');
    progressBar.value = 0;
    progressBar.max = totalFiles;

    // Process each file
    for (let i = 0; i < files.length; i++) 
    {
        const file = files[i];
        if (file.type === "image/png") 
        {
            readAndProcessPng(file, i);
        } 
        else 
        {
            console.warn(`Skipping non-PNG file: ${file.name}`);
        }
    }
}

    function readAndProcessPng(file, i) 
    {
        const reader = new FileReader();
        reader.onload = function (e) 
        {
            const img = new Image();
            img.onload = function () 
            {
                processPngFrame(img, i);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

    }

    function processPngFrame(img, i) 
    {
        const canvas = document.getElementById('pngCanvas');
        const ctx = canvas.getContext('2d');

        // Resize canvas to the image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Get image data from the canvas
        const frameData = ctx.getImageData(0, 0, img.width, img.height);
        const binaryFrame = convertToBinaryImage(frameData);
        convertToBinaryArray(binaryFrame, img.width, img.height, i);
    }

    function convertToBinaryImage(frameData) 
    {
        const binaryImage = new Uint8Array(frameData.width * frameData.height);
        for (let y = 0; y < frameData.height; y++) 
        {
            for (let x = 0; x < frameData.width; x++) 
            {
                const index = (y * frameData.width + x) * 4;
                const r = frameData.data[index];
                const g = frameData.data[index + 1];
                const b = frameData.data[index + 2];
                const gray = (r + g + b) / 3;
                binaryImage[y * frameData.width + x] = gray > 127 ? 255 : 0;
            }
        }
        return binaryImage;
    }

function convertToBinaryArray(binaryFrame, width, height, i) 
{
    const binaryArray = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) 
    {
        for (let x = 0; x < width; x++) 
        {
            binaryArray[y * width + x] = binaryFrame[y * width + x] === 255 ? 255 : 0;
        }
    }

    let name = 'frame' + i;
    animation_string += createPythonByteArray(binaryArray, name) + '\n';
    animation_string2 += createPythonByteArray2(binaryArray, "");
    frame_arr += name + ",";

    document.getElementById("animation_code_box").value = animation_string + '\n' + frame_arr;
    document.getElementById("animation_code_box").value = document.getElementById("animation_code_box").value.slice(0, -1) + ']';
    document.getElementById("animation_code_box2").value = animation_string2;

    //Update the progress bar
    processedFiles++;
    document.getElementById('conversionProgress').value = processedFiles;
    if (processedFiles === totalFiles) 
    {
        //document.getElementById("oled_download_animation").disabled = false;
        //document.getElementById("oled_download_animation").style.opacity = "100%";
        //document.getElementById("oled_download_animation").style.cursor = "alias";
        save_animation_code2("oled_animation.txt", "text/plain");
    }
}

});
function processLines(text) {
    // Split the text into an array of lines
    const lines = text.split('\n');

    // Process each line
    const processedLines = lines
        //.filter(line => line.trim().startsWith('0x'))  
        .map(line => {
            const trimmedLine = line.trim().replace(/,\s*$/, '');  
            if (trimmedLine === '0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00')
                return '0';
            else if(trimmedLine === '0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF')
                return '1'
            return trimmedLine;
        });

    // Join the processed lines back into a single string
    return processedLines.join('\n');
}


function exportCanvasAsPNG() {

    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // Define the area to export (same as the black rectangle coordinates)
    const x = 30;
    const y = 10;
    const width = 128;
    const height = 64;

    // Create a temporary canvas with the size of the black rectangle
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempContext = tempCanvas.getContext('2d');

    // Draw the black area from the original canvas onto the temporary canvas
    tempContext.drawImage(canvas, x, y, width, height, 0, 0, width, height);

    // Export the temporary canvas as a PNG
    const dataURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'layout.png';
    link.click();
}

function save_animation_code(filename, type) 
{
    var data = document.getElementById("animation_code_box").value;
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
function save_animation_code2(filename, type) 
{
    var data = document.getElementById("animation_code_box2").value;
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function check_animation_codebox()
{
    var codebox = document.getElementById("animation_code_box").value;
    if(codebox == "")
    {
        document.getElementById("oled_download_animation").disabled = true;
        document.getElementById("oled_download_animation").style.opacity = "50%";
        document.getElementById("oled_download_animation").style.cursor = "default";
    }
    else
    {
        document.getElementById("oled_download_animation").disabled = false;
        document.getElementById("oled_download_animation").style.opacity = "100%";
        document.getElementById("oled_download_animation").style.cursor = "alias";
    }

}

function show_hide_i2c_selects()
{
    var sda0 = document.getElementById("oled_sda0_select");
    var scl0 = document.getElementById("oled_scl0_select");

    var sda1 = document.getElementById("oled_sda1_select");
    var scl1 = document.getElementById("oled_scl1_select");

    var rad0 = document.getElementById("oled_i2c_rad1");
    var rad1 = document.getElementById("oled_i2c_rad2");

    if(rad0.checked)
    {
        sda0.hidden = false;
        scl0.hidden = false;

        sda1.hidden = true;
        scl1.hidden = true;
    }
    else if(rad1.checked)
    {
        sda0.hidden = true;
        scl0.hidden = true;

        sda1.hidden = false;
        scl1.hidden = false;
    }
    
}