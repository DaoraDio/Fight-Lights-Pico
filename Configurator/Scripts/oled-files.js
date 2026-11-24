/* Local image conversion and Fight Lights OLED frame files. */
const OledFiles = (() => {
    const width = 128, height = 64, bytesPerFrame = width * height / 8;
    const $ = id => document.getElementById(id);
    const blank = new Uint8Array(bytesPerFrame);
    let sprites = [], spriteIndex = 0;
    let animationRequest = 0, spriteRequest = 0;
    const imageRequests = new Map();

    function paint(canvas, bytes) {
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        const context = canvas.getContext("2d");
        const image = context.createImageData(width, height);
        for (let pixel = 0; pixel < width * height; pixel++) {
            const color = bytes[pixel >> 3] & (128 >> (pixel & 7)) ? 255 : 0;
            const offset = pixel * 4;
            image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = color;
            image.data[offset + 3] = 255;
        }
        context.putImageData(image, 0, 0);
    }

    function readCanvas(canvas) {
        const bytes = new Uint8Array(bytesPerFrame);
        const {data} = canvas.getContext("2d").getImageData(0, 0, width, height);
        for (let pixel = 0; pixel < width * height; pixel++) {
            const offset = pixel * 4;
            const gray = (data[offset] + data[offset + 1] + data[offset + 2]) * data[offset + 3] / (3 * 255);
            if (gray >= 128) bytes[pixel >> 3] |= 128 >> (pixel & 7);
        }
        return bytes;
    }
    async function imageBytes(file) {
        if (file.size > 20_000_000) throw new Error("Image is larger than 20 MB: " + file.name);
        let image;
        try { image = await createImageBitmap(file); }
        catch { throw new Error("Could not read image " + file.name + "."); }
        try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
            context.drawImage(image, 0, 0, width, height);
            return readCanvas(canvas);
        } finally { image.close(); }
    }
    function showSprite(index) {
        spriteIndex = index;
        paint($("my_combo_canvas"), sprites[index] ?? blank);
        $("oled_sprite_index").textContent = sprites.length ? index + "/" + (sprites.length - 1) : "0/0";
    }
    function setSprites(frames) {
        sprites = frames;
        showSprite(0);
    }
    function cycle(direction) {
        if (sprites.length) showSprite((spriteIndex + direction + sprites.length) % sprites.length);
    }
    function preview(value) {
        const index = Number(value);
        if (Number.isInteger(index) && index >= 0 && index < sprites.length) showSprite(index);
    }
    async function openSprites(file) {
        const request = ++spriteRequest;
        if (file.size > 20_000_000) throw new Error("The sprite file is larger than 20 MB.");
        const frames = ProfileCodec.parseFrames(await file.text());
        if (request === spriteRequest) {
            setSprites(frames);
            Configurator.notify("Loaded " + frames.length + " sprite frames.", "success");
        }
    }

    async function convertAnimation(files) {
        const request = ++animationRequest;
        const comboMode = $("radio2").checked;
        const progress = $("conversionProgress");
        const ordered = [...files].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: "base"}));
        if (!ordered.length) return;
        progress.max = ordered.length;
        progress.value = 0;
        const frames = [];
        for (const file of ordered) {
            if (!/\.png$/i.test(file.name)) throw new Error("Choose PNG frames.");
            const frame = await imageBytes(file);
            if (request !== animationRequest) return;
            frames.push(frame);
            progress.value = frames.length;
        }
        if (comboMode) {
            ++spriteRequest;
            setSprites(frames);
        }
        Configurator.download(frames.map(ProfileCodec.frameHex).join(""),
            comboMode ? "oled_combo_sprites.flan" : "oled_animation.flan");
        Configurator.notify("Converted " + frames.length + " OLED frames.", "success");
    }

    function bindFile(inputId, buttonId, onFiles) {
        const input = $(inputId);
        $(buttonId)?.addEventListener("click", () => input.click());
        input.addEventListener("change", async () => {
            const files = [...input.files];
            input.value = "";
            if (!files.length) return;
            try { await onFiles(files); }
            catch (error) { Configurator.notify(error); }
        });
    }
    function bindImage(inputId, buttonId, canvasId) {
        bindFile(inputId, buttonId, async ([file]) => {
            const token = {};
            imageRequests.set(canvasId, token);
            const bytes = await imageBytes(file);
            if (imageRequests.get(canvasId) === token) paint($(canvasId), bytes);
        });
    }
    function setProfileImages(splash, overlay) {
        imageRequests.clear();
        paint($("my_splash_canvas"), splash);
        paint($("my_overlay_canvas"), overlay);
    }
    function bind() {
        bindImage("imageLoader", "customButton", "my_splash_canvas");
        bindImage("imageLoader2", "upload_overlay_button", "my_overlay_canvas");
        bindFile("uploadPngs", "oled_upload_animation_button", convertAnimation);
        bindFile("comboImageLoader", "upload_sprite_button", ([file]) => openSprites(file));
        const canvas = $("myCanvas");
        // The original layout export remains a PNG at OLED resolution.
        $("exportBtn").addEventListener("click", () => canvas.toBlob(blob => {
            if (blob) Configurator.download(blob, "layout.png", "image/png");
        }, "image/png"));
        showSprite(0);
    }

    return {bind, paint, readCanvas, setProfileImages, cycle, preview};
})();
let hold;
function cycleSprite(direction) { OledFiles.cycle(direction); }
function previewFromInput(value) { OledFiles.preview(value); }
