(() => {
    "use strict";

    const encoder = new TextEncoder();
    const eof = "\x04";
    const rawBanner = "raw REPL; CTRL-B to exit";
    const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

    class ReplTimeout extends Error {
        constructor() {
            super("Timed out waiting for MicroPython.");
        }
    }

    class RawRepl {
        constructor(port) {
            this.reader = port.readable.getReader();
            this.writer = port.writable.getWriter();
            this.decoder = new TextDecoder();
            this.buffer = "";
            this.pendingRead = null;
            this.atPrompt = false;
        }

        async receiveUntil(marker, timeout = 5000) {
            const deadline = Date.now() + timeout;
            while (!this.buffer.includes(marker)) {
                const remaining = deadline - Date.now();
                if (remaining <= 0) throw new ReplTimeout();
                this.pendingRead ??= this.reader.read();
                let timer;
                const expired = new Promise((_, reject) => {
                    timer = setTimeout(() => reject(new ReplTimeout()), remaining);
                });
                const result = await Promise.race([this.pendingRead, expired]).finally(() => clearTimeout(timer));
                this.pendingRead = null;
                if (result.done) throw new Error("The Pico disconnected.");
                this.buffer += this.decoder.decode(result.value, {stream: true});
                if (this.buffer.length > 32768) throw new Error("Unexpected output from the serial port.");
            }
            const offset = this.buffer.indexOf(marker);
            const received = this.buffer.slice(0, offset);
            this.buffer = this.buffer.slice(offset + marker.length);
            return received;
        }

        async enter() {
            for (const timeout of [1800, 4000]) {
                // Give the running program time to handle the interrupt before sending Ctrl-A.
                await this.writer.write(encoder.encode("\r\x03"));
                await pause(150);
                await this.writer.write(encoder.encode("\x03"));
                await pause(300);
                await this.writer.write(encoder.encode("\r\x01"));
                try {
                    await this.receiveUntil(rawBanner, timeout);
                    await this.receiveUntil(">", 1000);
                    return;
                } catch (error) {
                    if (!(error instanceof ReplTimeout)) throw error;
                }
            }
            throw new Error("The Pico did not enter the MicroPython prompt. Check the port, or stop Fight Lights in Thonny, disconnect Thonny, and retry without restarting the Pico.");
        }

        async resetTransferSession() {
            // Ctrl-D at the raw prompt resets the VM without launching main.py.
            this.atPrompt = false;
            await this.writer.write(encoder.encode(eof));
            await this.receiveUntil("soft reboot", 6000);
            await this.receiveUntil(rawBanner, 6000);
            await this.receiveUntil(">", 1000);
            this.atPrompt = true;
        }

        async send(code) {
            this.atPrompt = false;
            const bytes = encoder.encode(code);
            // Pace short packets for MicroPython's raw REPL without raw-paste flow control.
            for (let offset = 0; offset < bytes.length; offset += 64) {
                await this.writer.write(bytes.subarray(offset, offset + 64));
                await pause(10);
            }
            await this.writer.write(encoder.encode(eof));
        }

        async execute(code, timeout) {
            await this.send(code);
            await this.receiveUntil("OK", timeout);
            const output = await this.receiveUntil(eof, timeout);
            const error = await this.receiveUntil(eof, timeout);
            await this.receiveUntil(">", timeout);
            this.atPrompt = true;
            if (error.trim()) throw new Error(error.trim().split("\n").at(-1).trim());
            return output.trim();
        }

        async restart() {
            const acknowledgement = "PICO_RESTARTING";
            // Give USB serial time to deliver the acknowledgement before the hard reset.
            await this.send("import machine, time\nprint('" + acknowledgement + "')\ntime.sleep_ms(250)\nmachine.reset()");
            await this.receiveUntil("OK", 3000);
            await this.receiveUntil(acknowledgement, 3000);
        }

        async close({exitRaw = true} = {}) {
            try {
                if (exitRaw) await this.writer.write(encoder.encode("\x02"));
            } catch {
                // A disconnected port cannot be returned to the friendly prompt.
            } finally {
                this.writer.releaseLock();
                try { await this.reader.cancel(); }
                finally { this.reader.releaseLock(); }
            }
        }
    }

    async function verifyPico(repl) {
        const identity = await repl.execute("import sys\nprint(sys.implementation.name + ':' + sys.platform)");
        if (identity !== "micropython:rp2") throw new Error("Select a Pico running MicroPython.");
    }

    const profilePattern = /^config(?:([1-9]\d*))?\.py$/;
    const activeProfile = "config.py";

    async function listProfiles(repl) {
        const listed = await repl.execute([
            "import os",
            "os.chdir('/')",
            "for entry in os.ilistdir():",
            "    if entry[1] == 0x8000:",
            "        print(entry[0])"
        ].join("\n"));
        return listed.split(/\r?\n/).filter(name => profilePattern.test(name))
            .sort((a, b) => a.length - b.length || a.localeCompare(b));
    }

    async function chooseProfile(repl, saving) {
        const names = await listProfiles(repl);
        if (!saving && !names.length) throw new Error("No Fight Lights profiles were found on the Pico.");

        const dialog = document.getElementById("pico-profile-dialog");
        dialog.dataset.mode = saving ? "save" : "load";
        const select = document.getElementById("pico-profile-select");
        const note = document.getElementById("pico-profile-note");
        const confirm = document.getElementById("pico-profile-confirm");
        const remove = document.getElementById("pico-profile-delete");
        const activate = document.getElementById("pico-profile-activate");
        const cancel = dialog.querySelector('button[value="cancel"]');
        document.getElementById("pico-profile-heading").textContent = saving ? "Save profile to Pico" : "Load profile from Pico";
        confirm.textContent = saving ? "Save profile" : "Load profile";
        select.replaceChildren();
        const existing = new Set(names);
        if (saving && !existing.has(activeProfile)) names.unshift(activeProfile);
        for (const name of names) {
            const label = name === activeProfile ? name + " (active profile)" : name;
            select.add(new Option(label, name));
        }
        if (saving) {
            let slot = 1;
            while (existing.has("config" + slot + ".py")) slot++;
            const filename = "config" + slot + ".py";
            select.add(new Option("New profile (" + filename + ")", filename));
        }
        let deleting = false;
        const removable = filename => !saving && filename !== activeProfile &&
            profilePattern.test(filename) && existing.has(filename);
        const canActivate = filename => removable(filename) && existing.has(activeProfile);
        function updateControls() {
            activate.hidden = saving;
            activate.disabled = deleting || !canActivate(select.value);
            remove.hidden = saving;
            remove.disabled = deleting || !removable(select.value);
            select.disabled = deleting || !select.options.length;
            confirm.disabled = select.disabled;
            cancel.disabled = deleting;
            note.textContent = saving
                ? (existing.has(select.value) ? "This will replace " + select.value + "." : "This will create " + select.value + ".")
                : "";
            note.hidden = !saving;
        }
        select.onchange = updateControls;
        updateControls();
        dialog.returnValue = "";
        return new Promise((resolve, reject) => {
            dialog.oncancel = event => {
                if (deleting) event.preventDefault();
            };
            dialog.onclose = () => {
                remove.onclick = null;
                activate.onclick = null;
                dialog.oncancel = null;
                dialog.onclose = null;
                const filename = select.value;
                if (dialog.returnValue === "activate" && canActivate(filename)) {
                    resolve({filename, activate: true});
                } else {
                    resolve(dialog.returnValue === "confirm" && profilePattern.test(filename ?? "")
                        ? {filename, activate: false}
                        : null);
                }
            };
            activate.onclick = () => {
                const filename = select.value;
                if (!deleting && canActivate(filename) &&
                    window.confirm("Activate " + filename + " and restart the Pico? The current profile will move to " + filename + ".")) {
                    dialog.close("activate");
                }
            };
            remove.onclick = async () => {
                const filename = select.value;
                if (deleting || !removable(filename) ||
                    !window.confirm("Delete " + filename + " from the Pico?")) return;
                deleting = true;
                updateControls();
                let message;
                try {
                    await repl.execute("os.remove(" + quote("/" + filename) + ")");
                    existing.delete(filename);
                    select.remove(select.selectedIndex);
                    if (select.options.length) select.selectedIndex = 0;
                    message = "Deleted " + filename + ".";
                    if (!select.options.length) message += " No profiles remain.";
                } catch (error) {
                    message = "Could not delete " + filename + ". " + error.message;
                    if (!repl.atPrompt) {
                        reject(new Error(message));
                        dialog.close();
                        return;
                    }
                }
                deleting = false;
                updateControls();
                note.textContent = message;
                note.hidden = false;
            };
            dialog.showModal();
        });
    }

    async function activateProfile(repl, filename) {
        if (filename === activeProfile || !profilePattern.test(filename)) throw new Error("Choose a numbered profile.");
        const staged = filename.slice(0, -3) + ".swap";
        const result = await repl.execute([
            "import os",
            "active = " + quote(activeProfile),
            "selected = " + quote(filename),
            "pending = " + quote(staged),
            "files = os.listdir()",
            "if active not in files or selected not in files:",
            "    raise OSError('Missing active or selected profile')",
            "if pending in files:",
            "    raise OSError('A previous profile switch is pending')",
            "os.rename(selected, pending)",
            "moved_active = False",
            "try:",
            "    os.rename(active, selected)",
            "    moved_active = True",
            "    os.rename(pending, active)",
            "except OSError:",
            "    if moved_active:",
            "        os.rename(selected, active)",
            "    os.rename(pending, selected)",
            "    raise",
            "print('activated')"
        ].join("\n"));
        if (result !== "activated") throw new Error("Could not confirm the profile switch.");
    }

    async function readConfigBytes(repl, filename, setProgress) {
        const path = quote("/" + filename);
        const sizeResponse = await repl.execute("import os, binascii\nprint(os.stat(" + path + ")[6])");
        const size = Number(sizeResponse);
        if (!/^\d+$/.test(sizeResponse) || !Number.isSafeInteger(size) || size > 2_000_000) {
            throw new Error("Invalid or unsupported config.py size.");
        }

        const bytes = new Uint8Array(size);
        for (let offset = 0; offset < size; offset += 1024) {
            const length = Math.min(1024, size - offset);
            const hex = await repl.execute([
                "with open(" + path + ", 'rb') as config:",
                "    config.seek(" + offset + ")",
                "    chunk = config.read(" + length + ")",
                "    print(binascii.hexlify(chunk).decode('ascii'))"
            ].join("\n"));
            if (hex.length !== length * 2 || !/^[a-f0-9]+$/i.test(hex)) {
                throw new Error("Incomplete or invalid data from the Pico.");
            }
            for (let index = 0; index < length; index++) {
                bytes[offset + index] = parseInt(hex.slice(2 * index, 2 * index + 2), 16);
            }
            setProgress(Math.min(99, Math.floor(100 * (offset + length) / size)));
        }
        return bytes;
    }

    const decodeConfig = bytes => new TextDecoder("utf-8", {fatal: true, ignoreBOM: true}).decode(bytes);

    async function readConfig(repl, filename, setProgress) {
        const bytes = await readConfigBytes(repl, filename, setProgress);
        if (!bytes.length) throw new Error(filename + " is empty.");
        return decodeConfig(bytes);
    }

    const quote = value => JSON.stringify(value);

    async function confirmProfileBackup(profiles, tag, migrationError) {
        const Zip = await loadProjectZipWriter();
        const zip = new Zip();
        for (const profile of profiles) zip.file(profile.name, profile.bytes);
        const backup = await zip.generateAsync({type: "blob"});
        const dialog = document.getElementById("pico-update-dialog");
        const note = document.getElementById("pico-update-note");
        const button = document.getElementById("pico-update-backup");
        note.textContent = migrationError
            ? migrationError.message
            : "Download a ZIP backup of your " + profiles.length + " Pico profile(s) before installing Fight Lights " + tag + ".";
        button.textContent = migrationError ? "Download backup" : "Download backup and install";
        dialog.returnValue = "";
        return new Promise(resolve => {
            button.onclick = () => {
                Configurator.download(backup, "fight-lights-profile-backup.zip", "application/zip");
                dialog.close("backup");
            };
            dialog.addEventListener("close", () => {
                button.onclick = null;
                resolve(dialog.returnValue === "backup");
            }, {once: true});
            dialog.showModal();
        });
    }

    async function prepareProjectUpdate(repl, project, setStatus) {
        const profiles = [];
        for (const name of await listProfiles(repl)) {
            setStatus("Backing up " + name + ".");
            profiles.push({name, bytes: await readConfigBytes(repl, name, () => {})});
        }
        if (!profiles.length) return project.files;
        const target = project.files.find(file => file.name === activeProfile);
        const changedProfiles = [];
        let migrationError;
        try {
            if (project.migrationBlocked) throw new Error("This release requires an updated configurator to migrate profiles.");
            const template = decodeConfig(target.bytes);
            for (const profile of profiles) {
                try {
                    const source = decodeConfig(profile.bytes);
                    const migrated = ProfileCodec.migratePython(source, template, project.renames);
                    if (source !== migrated) changedProfiles.push({name: profile.name, bytes: encoder.encode(migrated)});
                } catch (error) {
                    throw new Error(profile.name + ": " + error.message);
                }
            }
        } catch (error) {
            migrationError = error;
        }
        const confirmed = await confirmProfileBackup(profiles, project.tag, migrationError);
        if (migrationError) throw migrationError;
        if (!confirmed) return null;
        const withProfiles = profiles.some(profile => profile.name === activeProfile)
            ? project.files.filter(file => file.name !== activeProfile)
            : project.files;
        const main = withProfiles.find(file => file.name === "main.py");
        return [...withProfiles.filter(file => file !== main), ...changedProfiles, main];
    }

    async function stageFile(repl, {name, bytes, stagePath}, setStatus, progress, addWrittenBytes) {
        const staged = quote(stagePath);
        setStatus("Writing " + name + progress + ".");
        await repl.execute("open(" + staged + ", 'wb').close()");
        for (let offset = 0; offset < bytes.length; offset += 256) {
            const chunk = bytes.subarray(offset, offset + 256);
            const hex = Array.from(chunk, byte => byte.toString(16).padStart(2, "0")).join("");
            await repl.execute([
                "data = binascii.unhexlify('" + hex + "')",
                "with open(" + staged + ", 'r+b') as f:",
                "    f.seek(" + offset + ")",
                "    assert f.write(data) == len(data)",
                "    f.seek(" + offset + ")",
                "    assert f.read(len(data)) == data"
            ].join("\n"));
            addWrittenBytes(chunk.length);
        }

        const check = ["assert os.stat(" + staged + ")[6] == " + bytes.length];
        if (name.endsWith(".py")) {
            check.push("gc.collect()", "with open(" + staged + ", 'r') as f:",
                "    compile(f.read(), " + quote(name) + ", 'exec')", "gc.collect()");
        }
        await repl.execute(check.join("\n"), 15000);
    }

    async function installFiles(repl, files, setStatus, setProgress) {
        const totalBytes = files.reduce((sum, file) => sum + file.bytes.length, 0);
        let writtenBytes = 0;
        setProgress(0);
        const addWrittenBytes = count => {
            writtenBytes += count;
            setProgress(Math.min(99, Math.floor(100 * writtenBytes / totalBytes)));
        };
        files = files.map(file => ({...file, stagePath: files.length === 1 && profilePattern.test(file.name)
            ? ".fight-lights-upload.tmp" : ".fight-lights-upload-" + file.name + ".tmp"}));
        const stagingPaths = files.map(file => file.stagePath);
        let committing = false;
        try {
            await repl.execute("import os, binascii, gc");
            for (const [index, file] of files.entries()) {
                const progress = files.length > 1 ? " (" + (index + 1) + " of " + files.length + ")" : "";
                await stageFile(repl, file, setStatus, progress, addWrittenBytes);
            }
            setStatus("Installing verified files.");
            committing = true;
            const commands = files.map(({name, stagePath}) => "os.rename(" + quote(stagePath) + ", " + quote(name) + ")");
            const result = await repl.execute([...commands, "print('installed')"].join("\n"), 15000);
            if (result !== "installed") throw new Error("Missing install confirmation.");
            setProgress(100);
        } catch (error) {
            let details = committing
                ? " Some files may have been replaced. Retry before restarting the Pico."
                : " The existing project files are still in place.";
            if (repl.atPrompt) {
                try {
                    await repl.execute("for name in " + JSON.stringify(stagingPaths) + ":\n" +
                        "    if name in os.listdir():\n        os.remove(name)");
                } catch (cleanupError) {
                    details += " Could not clean up the temporary files: " + cleanupError.message;
                }
            }
            throw new Error(error.message + details);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const transferButtons = document.querySelectorAll("[data-pico-action]");
        const status = document.getElementById("pico-upload-status");
        const setStatus = message => { status.textContent = message; };
        const reportResult = (message, type) => {
            setStatus("");
            showMessage(message, type, type === "success" ? 4000 : 7500);
        };
        const progressBar = document.getElementById("pico-upload-progress");
        const progressFill = document.getElementById("pico-upload-progress-fill");
        const setProgress = percent => {
            progressBar.hidden = percent === 100;
            progressBar.setAttribute("aria-valuenow", percent);
            progressFill.style.width = percent + "%";
        };

        const showAllPorts = document.getElementById("pico-show-all-ports");
        function disableTransfers(disabled) {
            for (const button of transferButtons) button.disabled = disabled;
            showAllPorts.disabled = disabled;
        }
        const picoFilters = [{usbVendorId: 0x2e8a}];

        if (!window.isSecureContext || !navigator.serial?.requestPort) {
            disableTransfers(true);
            setStatus(window.isSecureContext
                ? "USB requires Web Serial. Use a current desktop Firefox, Chrome, or Edge. Config files can still be imported and downloaded."
                : "USB requires HTTPS. Open the secure version of this page.");
            return;
        }

        async function connectAndTransfer(action) {
            progressBar.hidden = true;
            const read = action === "read";
            const install = action === "install";
            disableTransfers(true);
            let port, opened = false, repl;
            let stage = "", restarting = false, switching = false;
            try {
                let config;
                if (action === "upload") {
                    config = Configurator.generate(true);
                    if (!document.getElementById("code_box").value) {
                        throw new Error("Create or load a config first.");
                    }
                }
                setStatus("Choose the Pico's serial port. It may be listed by device name.");
                port = await navigator.serial.requestPort(showAllPorts.checked ? {} : {filters: picoFilters});
                let project;
                if (install) {
                    stage = "Downloading Fight Lights from GitHub";
                    project = await downloadProjectFiles(setStatus);
                }
                stage = "Opening the Pico port";
                setStatus("Connecting to the Pico.");
                await port.open({baudRate: 115200});
                opened = true;
                repl = new RawRepl(port);
                stage = "Opening the MicroPython prompt";
                setStatus(stage + (port.name ? " (" + port.name + ")" : "") + "…");
                await repl.enter();
                stage = "Checking the board";
                setStatus(stage + "…");
                await verifyPico(repl);
                stage = "Preparing the MicroPython transfer session";
                setStatus(stage + ".");
                await repl.resetTransferSession();
                let filename;
                if (!install) {
                    stage = "Selecting a profile";
                    setStatus(stage + ".");
                    const selection = await chooseProfile(repl, !read);
                    if (!selection) {
                        setStatus("");
                        return;
                    }
                    ({filename, activate: switching} = selection);
                }
                if (read && !switching) {
                    stage = "Reading " + filename;
                    setStatus(stage + "…");
                    setProgress(0);
                    const source = await readConfig(repl, filename, setProgress);
                    stage = "Importing " + filename;
                    Configurator.importProfile(source, {compactBitmaps: true, filename});
                    setProgress(100);
                    reportResult("Loaded " + filename, "success");
                } else {
                    let uploaded;
                    if (switching) {
                        stage = "Activating " + filename;
                        setStatus(stage + ".");
                        await activateProfile(repl, filename);
                        uploaded = "Activated " + filename + ".";
                    } else if (install) {
                        stage = "Installing Fight Lights " + project.tag;
                        const files = await prepareProjectUpdate(repl, project, setStatus);
                        if (!files) {
                            setStatus("");
                            return;
                        }
                        await installFiles(repl, files, setStatus, setProgress);
                        uploaded = "Installed Fight Lights " + project.tag + ".";
                    } else {
                        stage = "Writing " + filename;
                        await installFiles(repl, [{name: filename, bytes: encoder.encode(config)}], setStatus, setProgress);
                        uploaded = "Uploaded " + filename + ".";
                    }
                    setStatus(uploaded + " Requesting Pico restart.");
                    try {
                        await repl.restart();
                        restarting = true;
                        reportResult(uploaded + " The Pico acknowledged the restart. It may briefly disconnect.", "success");
                        await pause(400);
                    } catch {
                        reportResult(uploaded + " Automatic restart could not be confirmed. If Fight Lights does not resume, reconnect power.", "warning");
                    }
                }
            } catch (error) {
                progressBar.hidden = true;
                if (error.name === "NotFoundError" && !port) {
                    reportResult("No port selected. If the Pico was missing, reconnect it, close Thonny, and try Show all serial ports. In Firefox, look for Board CDC or another USB serial device name.", "warning");
                }
                else reportResult((switching ? "Profile switch failed. " : read ? "Read failed. " : install ? "Installation failed. " : "Upload failed. ") + (stage ? stage + ". " : "") + error.message +
                    (stage === "Opening the Pico port" && !opened ? " Close Thonny or any other app using the port and try again." : ""), "error");
            } finally {
                try {
                    if (repl) await repl.close({exitRaw: !restarting});
                } catch {
                    // Serial streams may already be closed after unplugging.
                }
                try {
                    if (opened) await port.close();
                } catch {
                    // Leave the page ready to retry after a hardware disconnect.
                }
                disableTransfers(false);
            }
        }

        for (const button of transferButtons) {
            button.addEventListener("click", () => connectAndTransfer(button.dataset.picoAction));
        }
    });
})();
