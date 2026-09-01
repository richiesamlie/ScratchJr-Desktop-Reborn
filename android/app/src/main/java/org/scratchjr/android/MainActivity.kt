package org.scratchjr.android

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Base64
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.WebViewAssetLoader
import org.scratchjr.android.bridge.AndroidBridge
import org.scratchjr.android.database.AndroidDatabaseManager
import java.io.InputStream

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "MainActivity"
    }

    lateinit var webView: WebView
        private set
    private lateinit var dbManager: AndroidDatabaseManager
    private lateinit var bridge: AndroidBridge
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        fileChooserCallback?.onReceiveValue(uris.toTypedArray())
        fileChooserCallback = null
    }

    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        val audioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        Log.d(TAG, "Hardware permissions result: Camera=$cameraGranted, Audio=$audioGranted")
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        hideSystemUI()

        dbManager = AndroidDatabaseManager(this)
        bridge = AndroidBridge(this, dbManager)

        webView = findViewById(R.id.webview)
        setupWebView()
        setupBackNavigation()

        handleIntent(intent)
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val currentUrl = webView.url ?: ""
                when {
                    currentUrl.contains("editor.html") -> {
                        // Save project and return to lobby
                        webView.evaluateJavascript(
                            "if (window.ScratchJr && window.ScratchJr.saveProject) { window.ScratchJr.saveProject(null, function() { window.location.href = 'home.html'; }); } else { window.location.href = 'home.html'; }",
                            null
                        )
                    }
                    currentUrl.contains("home.html") -> {
                        webView.evaluateJavascript(
                            "window.location.href = 'index.html?back=yes';",
                            null
                        )
                    }
                    currentUrl.contains("gettingstarted.html") -> {
                        webView.evaluateJavascript(
                            "window.location.href = 'home.html';",
                            null
                        )
                    }
                    else -> {
                        // On splash screen / index.html, finish activity
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.useWideViewPort = false
        settings.loadWithOverviewMode = false
        settings.defaultTextEncodingName = "utf-8"

        // Cache settings
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Retry a pending .sjr import once the new page (possibly the
                // lobby after splash) is up and its bridge is bound.
                if (pendingSjrBase64 != null) {
                    tryFlushSjrImport()
                }
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: android.webkit.WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                Log.e(TAG, "WebView error: ${error?.description} for url: ${request?.url}")
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                Log.d("ScratchJr-JS", "[${consoleMessage?.messageLevel()}] ${consoleMessage?.message()} (${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()})")
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                val requestedResources = request.resources
                val grantedResources = mutableListOf<String>()

                for (res in requestedResources) {
                    if (res == PermissionRequest.RESOURCE_AUDIO_CAPTURE ||
                        res == PermissionRequest.RESOURCE_VIDEO_CAPTURE) {
                        grantedResources.add(res)
                    }
                }

                if (grantedResources.isNotEmpty()) {
                    request.grant(grantedResources.toTypedArray())
                } else {
                    request.deny()
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback
                filePickerLauncher.launch("image/*")
                return true
            }
        }

        // Expose JavaScript interface matching PlatformBridge.ts
        webView.addJavascriptInterface(bridge, "AndroidInterface")

        // Load local asset index
        webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
    }

    fun checkAndRequestHardwarePermissions(): Boolean {
        val cameraPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        val audioPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)

        val neededPermissions = mutableListOf<String>()
        if (cameraPerm != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.CAMERA)
        }
        if (audioPerm != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.RECORD_AUDIO)
        }

        return if (neededPermissions.isNotEmpty()) {
            requestPermissionsLauncher.launch(neededPermissions.toTypedArray())
            false
        } else {
            true
        }
    }

    fun hideSplashScreen() {
        runOnUiThread {
            // Splash hide callback
        }
    }

    /**
     * Pending .sjr payload from a VIEW intent, flushed to the renderer once
     * the lobby page and its bridge are ready. Survives page navigation
     * (retried from onPageFinished) because the WebView JS context dies on
     * every navigation; cleared after successful handoff.
     */
    private var pendingSjrBase64: String? = null

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data = intent?.data ?: return
        if (intent.action == Intent.ACTION_VIEW) {
            try {
                val inputStream: InputStream? = contentResolver.openInputStream(data)
                val bytes = inputStream?.readBytes() ?: return
                pendingSjrBase64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
                tryFlushSjrImport()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to import .sjr from intent", e)
            }
        }
    }

    /**
     * Push the queued .sjr into the renderer. The import only runs once the
     * user reaches the lobby (PlatformBridge bound, IO.loadProjectFromSjr
     * reachable); until then the snippet returns false and Kotlin keeps the
     * payload for the next onPageFinished retry.
     */
    private fun tryFlushSjrImport() {
        val payload = pendingSjrBase64 ?: return
        // Base64 alphabet [A-Za-z0-9+/=] is JS-string safe; no escaping needed.
        val js = """
            (function() {
                try {
                    var page = document.body ? document.body.getAttribute('data-scratchjr-page') : null;
                    if (page !== 'home') { return false; }
                    if (!window.PlatformBridge || !window.PlatformBridge.loadProjectFromSjr) { return false; }
                    window.PlatformBridge.loadProjectFromSjr('$payload');
                    // loadProjectFromSjr is async; reload the lobby shortly so
                    // the new project thumbnail shows (onPageFinished retries
                    // are no-ops once Kotlin clears the payload).
                    setTimeout(function() { window.location.reload(); }, 3000);
                    return true;
                } catch (e) {
                    console.error('sjr import failed:', e);
                    return false;
                }
            })()
        """.trimIndent()
        webView.post {
            webView.evaluateJavascript(js) { result ->
                if ("true" == result.trim()) {
                    pendingSjrBase64 = null
                }
            }
        }
    }

    private fun hideSystemUI() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    override fun onPause() {
        super.onPause()
        // Mobile lifecycle: never rely on app termination to save. The
        // renderer's 30s autosave is the primary mechanism; this immediate
        // save on backgrounding is the belt-and-braces path (desktop parity:
        // the close handshake in appEntry.js bootApp).
        if (webView.url?.contains("editor.html") == true) {
            webView.evaluateJavascript(
                "if (window.ScratchJr && window.ScratchJr.saveProject) { try { window.ScratchJr.saveProject(null, function() {}); } catch (e) {} }",
                null
            )
        }
        // Stop any live camera feed / recording so we don't hold the
        // microphone or camera in the background (P6 audio/camera lifecycle).
        webView.evaluateJavascript(
            "try { if (window.__androidHost) { window.__androidHost.scratchjr_stopfeed(); } } catch (e) {}",
            null
        )
        webView.onPause()
        webView.pauseTimers()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        webView.resumeTimers()
        hideSystemUI()
    }

    override fun onDestroy() {
        super.onDestroy()
        dbManager.close()
    }
}
