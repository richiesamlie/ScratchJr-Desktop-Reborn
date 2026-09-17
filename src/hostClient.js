// Host client loader: runs on every root page before the app bundle.
//
// Order matters: webav.js (host-agnostic AudioCapture/CameraPickerDialog)
// loads first, then the host-specific client:
//   - Electron (window.scratchjr from preload): electronClient.js
//   - Android WebView (AndroidInterface): webhost.js (JS host shim; the
//     native interface covers storage/DB, the shim adds camera/record)
//   - Browser / PWA: browserClient.js (in-browser sql.js WASM + IndexedDB)

(function () {
    var av = document.createElement('script');
    av.src = '../webav.js';
    av.async = false;
    document.head.appendChild(av);

    var isTauri = Boolean(
        (typeof window !== 'undefined' && (window.__TAURI_INTERNALS__ || window.__TAURI__))
        || (typeof window !== 'undefined' && window.location
            && (window.location.hostname === 'tauri.localhost'
                || window.location.protocol === 'tauri:'
                || (window.location.origin && window.location.origin.indexOf('tauri.localhost') !== -1)))
    );

    if (window.scratchjr) {
        var s = document.createElement('script');
        s.src = '../electronClient.js';
        s.async = false;
        document.head.appendChild(s);
    } else if (isTauri) {
        var t = document.createElement('script');
        t.src = '../tauriClient.js';
        t.async = false;
        document.head.appendChild(t);
    } else if (typeof AndroidInterface !== 'undefined') {
        var h = document.createElement('script');
        h.src = '../webhost.js';
        h.async = false;
        document.head.appendChild(h);
    } else {
        var sql = document.createElement('script');
        sql.src = '../sql-wasm.js';
        sql.async = false;
        document.head.appendChild(sql);

        var b = document.createElement('script');
        b.src = '../browserClient.js';
        b.async = false;
        document.head.appendChild(b);
    }
}());

