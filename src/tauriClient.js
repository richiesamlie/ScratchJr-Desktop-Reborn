/**
 * ScratchJr Tauri Host Adapter (src/tauriClient.js)
 *
 * Implements ScratchJrBridge and window.tablet for the Tauri v2 desktop runtime.
 * Communicates with the native Rust backend via Tauri IPC invoke.
 */

/* global AudioCapture, CameraPickerDialog */
/* eslint-disable no-console, no-alert */

function getTauriInvoke() {
    if (typeof window !== 'undefined') {
        if (window.__TAURI_INTERNALS__ && typeof window.__TAURI_INTERNALS__.invoke === 'function') {
            return window.__TAURI_INTERNALS__.invoke;
        }
        if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
            return window.__TAURI__.core.invoke;
        }
    }
    return null;
}

/**
 * @param {string} cmd
 * @param {any} [args]
 * @param {number} [attempt]
 * @returns {Promise<any>}
 */
function tauriInvoke(cmd, args, attempt) {
    const currentAttempt = attempt || 0;
    const invoker = getTauriInvoke();
    if (invoker) {
        return invoker(cmd, args);
    }
    if (currentAttempt >= 40) {
        return Promise.reject(new Error(`Tauri invoke unavailable: ${cmd} ${JSON.stringify(args)}`));
    }
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            tauriInvoke(cmd, args, currentAttempt + 1).then(resolve, reject);
        }, 25);
    });
}

window.addEventListener('error', function (e) {
    console.error('[Tauri Client Error]', e.message, e.filename, e.lineno, e.error);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('[Tauri Client Unhandled Rejection]', e.reason);
});

/** @param {Blob} blob */
function readBlobAsDataURL(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(/** @type {string} */ (reader.result));
        reader.readAsDataURL(blob);
    });
}

class TauriDesktopInterface {
    constructor() {
        /** @type {Record<string, HTMLAudioElement>} */
        this.currentAudio = {};
        /** @type {AudioCapture | null} */
        this.audioCaptureElement = null;
        /** @type {CameraPickerDialog | null} */
        this.cameraPickerDialog = null;
    }

    // Database operations
    /** @param {any} json */
    async database_stmt(json) {
        return await tauriInvoke('database_stmt', { raw: json });
    }

    /** @param {any} json */
    async database_query(json) {
        return await tauriInvoke('database_query', { raw: json });
    }

    // Settings and resources
    async io_getsettings() {
        return await tauriInvoke('io_getsettings');
    }

    /** @param {string} filename */
    async io_gettextresource(filename) {
        try {
            const res = await tauriInvoke('io_gettextresource', { filename });
            if (res) return res;
        } catch (_) {
            // Fall back to fetch below
        }

        try {
            const res = await fetch(filename);
            if (res.ok) {
                return await res.text();
            }
            const res2 = await fetch('./' + filename);
            if (res2.ok) {
                return await res2.text();
            }
        } catch (_) {
            // Ignore fetch failure
        }

        return '';
    }

    async io_getIsDebug() {
        return await tauriInvoke('io_get_is_debug');
    }

    async io_getLang() {
        return await tauriInvoke('io_get_lang');
    }

    // Storage and media files
    /** @param {string} file */
    async io_getmedia(file) {
        return await tauriInvoke('io_getmedia', { name: file });
    }

    /** @param {string} str @param {string} ext */
    async io_setmedia(str, ext) {
        return await tauriInvoke('io_setmedia', { base64ContentStr: str, ext });
    }

    /** @param {string} str @param {string} name @param {string} ext */
    async io_setmedianame(str, name, ext) {
        return await tauriInvoke('io_setmedianame', { encodedData: str, key: name, ext });
    }

    /** @param {string} str */
    async io_getmd5(str) {
        return (str) ? await tauriInvoke('io_getmd5', { data: str }) : null;
    }

    /** @param {string} str */
    async io_remove(str) {
        return await tauriInvoke('io_remove', { filename: str });
    }

    /** @param {string} str */
    async io_cleanassets(str) {
        return await tauriInvoke('io_cleanassets', { fileType: str });
    }

    /** @param {string} str */
    async io_getfile(str) {
        return await tauriInvoke('io_getfile', { name: str });
    }

    /** @param {string} name @param {string} btoa_str */
    async io_setfile(name, btoa_str) {
        return await tauriInvoke('io_setfile', { name, contents: btoa_str });
    }

    /** @param {string} name */
    async io_getAudioData(name) {
        try {
            const res = await tauriInvoke('io_get_audio_data', { audioName: name });
            if (res) return res;
        } catch (_) {
            // Fall back to fetch below
        }

        const cleanName = name.replace(/^\.\//, '').replace(/^\//, '');
        const directRes = await fetch(cleanName).catch(function () { return null; });
        if (directRes && directRes.ok) {
            const blob = await directRes.blob();
            return await readBlobAsDataURL(blob);
        }

        const soundRes = await fetch(`sounds/${cleanName}`).catch(function () { return null; });
        if (soundRes && soundRes.ok) {
            const blob = await soundRes.blob();
            return await readBlobAsDataURL(blob);
        }

        return null;
    }

    // Audio recording and playback
    /** @param {string} _dir @param {string} name */
    async io_registersound(_dir, name) {
        if (!this.currentAudio[name]) {
            const dataUri = await tauriInvoke('io_get_audio_data', { audioName: name });
            this.loadSoundFromDataURI(name, dataUri || '');
        }
    }

    /** @param {string} name @param {string} dataUri */
    loadSoundFromDataURI(name, dataUri) {
        if (dataUri && name) {
            const audio = new window.Audio(dataUri);
            audio.volume = 0.8;
            audio.onended = function () {
                const hostBridge = /** @type {any} */ (window).PlatformBridge || /** @type {any} */ (window).iOS;
                if (hostBridge && hostBridge.soundDone) {
                    hostBridge.soundDone(name);
                }
            };
            this.currentAudio[name] = audio;
        }
    }

    /** @param {string} name */
    io_playsound(name) {
        const audioElement = this.currentAudio[name];
        if (!audioElement) {
            setTimeout(function () {
                const hostBridge = /** @type {any} */ (window).PlatformBridge || /** @type {any} */ (window).iOS;
                if (hostBridge && hostBridge.soundDone) {
                    hostBridge.soundDone(name);
                }
            }, 1);
            return;
        }

        try {
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(function (error) {
                    console.error('[tauriClient] audio playback failed:', error);
                });
            }
        } catch (e) {
            console.error('[tauriClient] could not play sound:', e);
        }
    }

    /** @param {string} name */
    io_stopsound(name) {
        const audioElement = this.currentAudio[name];
        if (audioElement) {
            audioElement.pause();
        }
    }

    getAudioCaptureElement() {
        if (!this.audioCaptureElement) {
            this.audioCaptureElement = new AudioCapture();
            /** @type {any} */ (this.audioCaptureElement).isRecordingPermitted = true;
        }
        return this.audioCaptureElement;
    }

    recordsound_recordstart() {
        return this.getAudioCaptureElement().startRecord();
    }

    recordsound_recordstop() {
        this.getAudioCaptureElement().stopRecord();
    }

    recordsound_volume() {
        return this.getAudioCaptureElement().getVolume();
    }

    /** @param {string} keep */
    recordsound_recordclose(keep) {
        try {
            const tauriDesktopInterface = this;
            const audioCaptureElement = this.getAudioCaptureElement();

            if (keep === 'YES') {
                const blob = audioCaptureElement.captureRecordingAsBlob();
                if (blob) {
                    const filename = audioCaptureElement.getId();
                    const fileReader = new FileReader();
                    fileReader.onload = function () {
                        tauriDesktopInterface.io_setmedianame(/** @type {string} */ (fileReader.result), filename, 'webm');
                        tauriDesktopInterface.loadSoundFromDataURI(`${filename}.webm`, /** @type {string} */ (fileReader.result));
                    };
                    fileReader.readAsDataURL(blob);
                }
            }
        } catch (e) {
            console.error('[tauriClient] Error saving sound:', e);
        }
    }

    recordsound_startplay() {
        return this.getAudioCaptureElement().startPlay();
    }

    recordsound_stopplay() {
        this.getAudioCaptureElement().stopPlay();
    }

    // Camera capture support
    scratchjr_stopfeed() {
        if (this.cameraPickerDialog) {
            this.cameraPickerDialog.hide();
            this.cameraPickerDialog = null;
        }
    }

    /** @param {string} _mode */
    scratchjr_choosecamera(_mode) {}

    /** @param {() => void} whenDone */
    scratchjr_captureimage(whenDone) {
        const cam = /** @type {any} */ (window).Camera;
        if (this.cameraPickerDialog) {
            const imgData = this.cameraPickerDialog.snapshot();
            if (imgData) {
                const base64resultNoDataPrefix = imgData.split(',')[1];
                if (cam && cam.processimage) {
                    cam.processimage(base64resultNoDataPrefix);
                }
            } else if (cam && cam.processimage) {
                cam.processimage('error getting a still');
            }
        } else if (cam && cam.processimage) {
            cam.processimage('error getting a still');
        }
        if (whenDone) {
            whenDone();
        }
    }

    scratchjr_cameracheck() {
        return true;
    }

    /** @param {string} str */
    scratchjr_startfeed(str) {
        const data = JSON.parse(str);
        if (!this.cameraPickerDialog) {
            this.cameraPickerDialog = new CameraPickerDialog(data);
            this.cameraPickerDialog.show();
        }
    }

    // Host device details and project export
    askForPermission() {
        return true;
    }

    hideSplash() {
        return true;
    }

    deviceName() {
        return 'desktop-tauri';
    }

    /** @param {string} _category @param {string} _action @param {string} _usageLabel @param {number} _value */
    analyticsEvent(_category, _action, _usageLabel, _value) {}

    /**
     * @param {string} fileName
     * @param {string} _emailSubject
     * @param {string} _emailBody
     * @param {string} _shareType
     * @param {string} b64data
     */
    sendSjrUsingShareDialog(fileName, _emailSubject, _emailBody, _shareType, b64data) {
        return this.sendExportedSjr(b64data, fileName);
    }

    /**
     * @param {string} dataB64
     * @param {string} suggestedName
     */
    sendExportedSjr(dataB64, suggestedName) {
        return tauriInvoke('save_sjr_file', { dataB64, suggestedName }).catch(function (err) {
            console.error('[tauriClient] save_sjr_file failed:', err);
            throw err;
        });
    }

    /**
     * @param {string} dataUrl
     * @param {string} suggestedName
     */
    sendExportedPng(dataUrl, suggestedName) {
        return tauriInvoke('save_stage_png', { dataUrl, suggestedName });
    }

    /** @param {any} msg */
    debugWriteLog(msg) {
        console.log('[ScratchJr-Tauri]', msg);
    }

    // Lifecycle hooks and push events
    /** @param {() => void} callback */
    onAppClose(callback) {
        this.appCloseCallback = callback;
    }

    sendAppClosedAcked() {
        return tauriInvoke('app_closed_acked').catch(function () {});
    }

    /** @param {() => void} callback */
    onDatabaseRestored(callback) {
        this.databaseRestoredCallback = callback;
    }

    /** @param {(action: string) => void} callback */
    onKeyboardShortcut(callback) {
        this.keyboardShortcutCallback = callback;
    }

    /** @param {() => void} callback */
    onExportProjectRequest(callback) {
        this.exportProjectRequestCallback = callback;
    }

    /** @param {() => void} callback */
    onExportStageRequest(callback) {
        this.exportStageRequestCallback = callback;
    }
}

const tauriHost = new TauriDesktopInterface();

// Expose tablet and scratchjr host interface
/** @type {any} */ (window).tablet = tauriHost;
/** @type {any} */ (window).scratchjr = tauriHost;

// Global Keyboard Shortcuts
window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const key = e.key.toLowerCase();
        const syntheticEvt = {
            preventDefault() {},
            stopPropagation() {},
            timeStamp: performance.now(),
            touches: undefined
        };
        if (key === 's') {
            e.preventDefault();
            if (tauriHost.keyboardShortcutCallback) {
                tauriHost.keyboardShortcutCallback('save');
            }
            const scratchJrGlobal = /** @type {any} */ (window).ScratchJr;
            if (scratchJrGlobal && scratchJrGlobal.saveProject) {
                scratchJrGlobal.saveProject(null, function () {});
            }
        } else if (key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (tauriHost.keyboardShortcutCallback) {
                tauriHost.keyboardShortcutCallback('undo');
            }
            const undoGlobal = /** @type {any} */ (window).Undo;
            if (undoGlobal && undoGlobal.prevStep) {
                undoGlobal.prevStep(syntheticEvt);
            }
        } else if ((key === 'z' && e.shiftKey) || (key === 'y' && !e.shiftKey)) {
            e.preventDefault();
            if (tauriHost.keyboardShortcutCallback) {
                tauriHost.keyboardShortcutCallback('redo');
            }
            const undoGlobal = /** @type {any} */ (window).Undo;
            if (undoGlobal && undoGlobal.nextStep) {
                undoGlobal.nextStep(syntheticEvt);
            }
        } else if (key === 'n') {
            e.preventDefault();
            if (tauriHost.keyboardShortcutCallback) {
                tauriHost.keyboardShortcutCallback('new');
            }
            const homeGlobal = /** @type {any} */ (window).Home;
            if (homeGlobal && homeGlobal.createNewProject) {
                homeGlobal.createNewProject();
            }
        }
    }
});
