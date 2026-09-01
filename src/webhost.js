// Android WebView host client: provides the renderer-facing host surface
// that desktop gets from electronClient.js. This shim implements the full
// ScratchJrBridge surface: storage/DB/settings forwards to the native
// AndroidInterface (Kotlin), while camera/recording/misc methods run in JS
// via the shared webav.js classes (getUserMedia/MediaRecorder).
//
// IMPORTANT: the renderer must bind THIS object, not the raw native
// interface — Android's Java bridge rejects calls made through a JS Proxy
// ("Java bridge method can't be invoked on a non-injected object"), and
// PlatformBridge binds whatever waitForInterface sees first. So this file
// registers itself on window.__androidHost and waitForInterface prefers it.

/* global AudioCapture, CameraPickerDialog */
/* eslint-disable no-console */

(function () {
    if (window.scratchjr) return; // Electron: electronClient.js handles everything
    if (typeof AndroidInterface === 'undefined') return; // not an Android host

    /** @type {AudioCapture | null} */
    var audioCapture = null;

    function getAudioCapture () {
        if (!audioCapture) {
            audioCapture = new AudioCapture();
            // permission is granted natively before the record dialog opens
            // (AndroidBridge.recordsound_recordstart -> runtime permission).
            audioCapture.isRecordingPermitted = true;
        }
        return audioCapture;
    }

    /** Wrap a native interface method with typed forwarding. */
    function fwd (/** @type {string} */ name) {
        var method = /** @type {(...args: unknown[]) => unknown} */ (AndroidInterface[name]);
        return method.bind(AndroidInterface);
    }

    /** @type {any} */
    var androidHost = {

        // ---- Storage / DB / settings: forward to Kotlin ----
        database_stmt: fwd('database_stmt'),
        database_query: fwd('database_query'),
        io_getsettings: fwd('io_getsettings'),
        io_gettextresource: fwd('io_gettextresource'),
        io_getIsDebug: fwd('io_getIsDebug'),
        io_getLang: fwd('io_getLang'),
        io_setfile: fwd('io_setfile'),
        io_getfile: fwd('io_getfile'),
        io_remove: fwd('io_remove'),
        io_cleanassets: fwd('io_cleanassets'),
        io_getmd5: fwd('io_getmd5'),
        io_getmedia: fwd('io_getmedia'),
        io_getmediadata: fwd('io_getmediadata'),
        io_getmediadone: fwd('io_getmediadone'),
        io_getmedialen: fwd('io_getmedialen'),
        io_setmedia: fwd('io_setmedia'),
        io_setmedianame: fwd('io_setmedianame'),
        io_getAudioData: fwd('io_getAudioData'),

        // ---- Debug / lifecycle / analytics ----
        debugWriteLog: fwd('debugWriteLog'),
        sendAppClosedAcked: fwd('sendAppClosedAcked'),
        analyticsEvent: fwd('analyticsEvent'),
        sendExportedSjr: fwd('sendExportedSjr'),
        sendExportedPng: fwd('sendExportedPng'),

        // ---- Sound playback: native MediaPlayer (reliable timing) ----
        io_registersound: fwd('io_registersound'),
        io_playsound: fwd('io_playsound'),
        io_stopsound: fwd('io_stopsound'),

        // ---- Recording (JS MediaRecorder; native gates permission) ----

        recordsound_recordstart: function () {
            // Native side triggers the Android runtime permission dialog
            // (bridge method), then the web AudioCapture does the recording.
            try { /** @type {() => void} */ (AndroidInterface.recordsound_recordstart)(); } catch (e) { /* ignore */ }
            return getAudioCapture().startRecord();
        },

        recordsound_recordstop: function () {
            getAudioCapture().stopRecord();
        },

        recordsound_volume: function () {
            return getAudioCapture().getVolume();
        },

        recordsound_startplay: function () {
            getAudioCapture().startPlay();
        },

        recordsound_stopplay: function () {
            getAudioCapture().stopPlay();
        },

        recordsound_recordclose: function (/** @type {string} */ keep) {
            try {
                if (keep === 'YES') {
                    var capture = getAudioCapture();
                    var blob = capture.captureRecordingAsBlob();
                    if (blob) {
                        var filename = capture.getId();
                        var fileReader = new FileReader();
                        fileReader.onload = function () {
                            // Save the recording through the native media store
                            // (same channel desktop uses: io_setmedianame).
                            var result = /** @type {string} */ (fileReader.result);
                            var b64 = String(result).split(',')[1];
                            /** @type {(s: string, n: string, e: string) => void} */ (AndroidInterface.io_setmedianame)(b64, filename, 'webm');
                        };
                        fileReader.readAsDataURL(blob);
                    }
                } else {
                    getAudioCapture().stopRecord();
                }
            } catch (e) {
                console.error('webhost: save recording failed', e);
            }
        },

        // ---- Camera (JS getUserMedia feed + snapshot) ----

        scratchjr_startfeed: function (/** @type {string} */ str) {
            var data = JSON.parse(str);
            if (!androidHost.cameraPickerDialog) {
                androidHost.cameraPickerDialog = new CameraPickerDialog(data);
                androidHost.cameraPickerDialog.show();
            }
        },

        scratchjr_stopfeed: function () {
            if (androidHost.cameraPickerDialog) {
                androidHost.cameraPickerDialog.hide();
                androidHost.cameraPickerDialog = null;
            }
        },

        scratchjr_choosecamera: function (/** @type {string} */ _mode) {
            // Renderer-side feed has one camera; switching front/back is a
            // future getUserMedia facingMode toggle. No-op for now.
        },

        scratchjr_cameracheck: function () {
            return /** @type {() => string} */ (AndroidInterface.scratchjr_cameracheck)();
        },

        scratchjr_captureimage: function (/** @type {() => void} */ whenDone) {
            if (androidHost.cameraPickerDialog) {
                var imgData = androidHost.cameraPickerDialog.snapshot();
                if (imgData) {
                    var base64NoPrefix = imgData.split(',')[1];
                    var cam = /** @type {{ processimage: (b64: string) => void } | null} */ (window.Camera);
                    if (cam && cam.processimage) {
                        cam.processimage(base64NoPrefix);
                    }
                }
            }
            if (whenDone) { whenDone(); }
        },

        // ---- Misc host surface ----

        askForPermission: function () {
            return /** @type {() => boolean} */ (AndroidInterface.askForPermission)();
        },

        hideSplash: function () {
            return /** @type {() => boolean} */ (AndroidInterface.hideSplash)();
        },

        deviceName: function () {
            return /** @type {() => string} */ (AndroidInterface.deviceName)();
        },

        sendSjrUsingShareDialog: fwd('sendSjrUsingShareDialog')
    };

    window.__androidHost = androidHost;
}());
