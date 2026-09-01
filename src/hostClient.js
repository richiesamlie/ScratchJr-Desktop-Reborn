// Host client loader: injects the Electron host implementation only when the
// Electron preload bridge is present (window.scratchjr, set by preload.ts via
// contextBridge before any page script runs).
//
// Android WebView: AndroidInterface is injected by WebView.addJavascriptInterface
// before page load; PlatformBridge.waitForInterface binds it directly and no
// client script is needed.
//
// Loaded from every root page as ../hostClient.js (sibling of electronClient.js).

if (window.scratchjr) {
    var s = document.createElement('script');
    s.src = '../electronClient.js';
    document.head.appendChild(s);
}
