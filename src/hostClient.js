// Host client loader: runs on every root page before the app bundle.
//
// Order matters: webav.js (host-agnostic AudioCapture/CameraPickerDialog)
// loads first, then the host-specific client:
//   - Electron (window.scratchjr from preload): electronClient.js
//   - Android WebView (AndroidInterface): webhost.js (JS host shim; the
//     native interface covers storage/DB, the shim adds camera/record)
//   - Browser / PWA: browserClient.js (in-browser sql.js WASM + IndexedDB)

(function () {
    /** @param {string} src */
    function load(src) {
        var el = document.createElement('script');
        el.src = src;
        el.async = false;
        document.head.appendChild(el);
    }

    load('../webav.js');

    var isTauri = Boolean(
        (typeof window !== 'undefined' && (window.__TAURI_INTERNALS__ || window.__TAURI__))
        || (typeof window !== 'undefined' && window.location
            && (window.location.hostname === 'tauri.localhost'
                || window.location.protocol === 'tauri:'
                || (window.location.origin && window.location.origin.indexOf('tauri.localhost') !== -1)))
    );

    if (window.scratchjr) {
        load('../electronClient.js');
    } else if (isTauri) {
        load('../tauriClient.js');
    } else if (typeof AndroidInterface !== 'undefined') {
        load('../webhost.js');
    } else {
        load('../sql-wasm.js');
        load('../browserClient.js');
    }
}());

