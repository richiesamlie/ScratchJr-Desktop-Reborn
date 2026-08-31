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

    private lateinit var webView: WebView
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

        handleIntent(intent)
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
                val base64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
                
                // Inject incoming .sjr project into webview lobby
                webView.post {
                    webView.evaluateJavascript(
                        "if (window.ScratchJr && window.ScratchJr.importSjrBase64) { window.ScratchJr.importSjrBase64('$base64'); }",
                        null
                    )
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to import .sjr from intent", e)
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
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        dbManager.close()
    }
}
