// Host client loader: runs on every root page before the app bundle.
//
// Order matters: webav.js (host-agnostic AudioCapture/CameraPickerDialog)
// loads first, then the host-specific client:
//   - Electron (window.scratchjr from preload): electronClient.js
//   - Android WebView (AndroidInterface): webhost.js (JS host shim; the
//     native interface covers storage/DB, the shim adds camera/record)
//   - Anything else: no host client; PlatformBridge keeps polling.

(function () {
    var av = document.createElement('script');
    av.src = '../webav.js';
    document.head.appendChild(av);

    if (window.scratchjr) {
        var s = document.createElement('script');
        s.src = '../electronClient.js';
        document.head.appendChild(s);
    } else if (typeof AndroidInterface !== 'undefined') {
        var h = document.createElement('script');
        h.src = '../webhost.js';
        document.head.appendChild(h);
    }
}());
