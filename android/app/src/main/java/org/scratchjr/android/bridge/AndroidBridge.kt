package org.scratchjr.android.bridge

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import org.scratchjr.android.MainActivity
import org.scratchjr.android.database.AndroidDatabaseManager
import org.scratchjr.android.utils.CryptoUtils
import java.io.File
import java.io.FileOutputStream
import java.nio.charset.StandardCharsets

class AndroidBridge(
    private val activity: MainActivity,
    private val db: AndroidDatabaseManager
) {
    companion object {
        private const val TAG = "AndroidBridge"
    }

    // ----------------------------------------------------
    // Database Operations
    // ----------------------------------------------------

    @JavascriptInterface
    fun database_stmt(jsonStr: String): String {
        return db.executeStmt(jsonStr)
    }

    @JavascriptInterface
    fun database_query(jsonStr: String): String {
        return db.executeQuery(jsonStr)
    }

    // ----------------------------------------------------
    // Settings & Resources
    // ----------------------------------------------------

    @JavascriptInterface
    fun io_getsettings(): String {
        // CSV contract consumed by entry/home.ts + entry/editor.ts doNext:
        //   mediaPath,isTablet,isDebug,isAnalytics
        // isTablet '0' makes PlatformBridge.path = mediaPath + '/' — but that is a
        // device filesystem path, useless as a URL inside the WebView origin, so
        // every PlatformBridge.path consumer would 404 (audit finding: user PNGs
        // broke in the first port). Desktop sends 'false' (path stays undefined and
        // media flows through the base64 getmedia path); Android matches that.
        // Fields 2/3 gate Record/Camera UI availability; PackageManager knows
        // whether the hardware exists.
        val mediaPath = db.mediaDirectory.absolutePath
        val hasCamera = activity.packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
        val hasMic = activity.packageManager.hasSystemFeature(PackageManager.FEATURE_MICROPHONE)
        return "$mediaPath,false,${if (hasMic) "YES" else "NO"},${if (hasCamera) "YES" else "NO"}"
    }

    @JavascriptInterface
    fun io_gettextresource(filename: String): String {
        return try {
            // Renderer callers pass app-root-relative paths like "./settings.json"
            // or "svglibrary/Cat.svg"; AssetManager does not normalize "./" or
            // duplicate separators the way Node fs does, so normalize here.
            val normalized = filename.replace("./", "").replace("\\", "/")
            activity.assets.open("www/$normalized").bufferedReader(StandardCharsets.UTF_8).use { it.readText() }
        } catch (e: Exception) {
            Log.e(TAG, "io_gettextresource error for $filename", e)
            ""
        }
    }

    @JavascriptInterface
    fun io_getIsDebug(): Boolean {
        return false
    }

    @JavascriptInterface
    fun io_getLang(): String? {
        val locale = activity.resources.configuration.locales[0]
        return locale?.language
    }

    // ----------------------------------------------------
    // File I/O
    // ----------------------------------------------------

    @JavascriptInterface
    fun io_setfile(name: String, contents: String): String {
        val success = db.saveProjectFile(name, contents)
        return if (success) name else "-1"
    }

    @JavascriptInterface
    fun io_getfile(name: String): String {
        return db.readProjectFile(name) ?: ""
    }

    @JavascriptInterface
    fun io_remove(name: String): Boolean {
        return db.removeProjectFile(name)
    }

    @JavascriptInterface
    fun io_cleanassets(fileType: String): Boolean {
        return db.cleanProjectFiles(fileType)
    }

    @JavascriptInterface
    fun io_getmd5(content: String): String {
        return CryptoUtils.md5(content)
    }

    // ----------------------------------------------------
    // Media Streaming I/O
    // ----------------------------------------------------

    @JavascriptInterface
    fun io_getmedia(file: String): String {
        return db.readProjectFile(file) ?: ""
    }

    @JavascriptInterface
    fun io_getmedialen(file: String, key: String): Int {
        val data = db.readProjectFile(file) ?: return 0
        MediaCache.put(key, data)
        return data.length
    }

    @JavascriptInterface
    fun io_getmediadata(key: String, offset: Int, length: Int): String {
        val data = MediaCache.get(key) ?: return ""
        val end = (offset + length).coerceAtMost(data.length)
        return if (offset < data.length) data.substring(offset, end) else ""
    }

    @JavascriptInterface
    fun io_getmediadone(key: String) {
        MediaCache.remove(key)
    }

    @JavascriptInterface
    fun io_setmedia(base64Str: String, ext: String): String {
        val md5 = CryptoUtils.md5(base64Str)
        val filename = "$md5.$ext"
        db.saveProjectFile(filename, base64Str)
        return filename
    }

    @JavascriptInterface
    fun io_setmedianame(base64Str: String, name: String, ext: String): String {
        val filename = "$name.$ext"
        db.saveProjectFile(filename, base64Str)
        return filename
    }

    @JavascriptInterface
    fun io_getAudioData(name: String): String? {
        // Desktop contract (ipc-handlers.ts io_getAudioData): resolve from the
        // app's bundled sounds/ first, fall back to user media; return a
        // data: URI that loadSoundFromDataURI can feed to an Audio element.
        // Bundled sounds live in assets/www/sounds/.
        val mime = when {
            name.endsWith(".mp3", ignoreCase = true) -> "audio/mp3"
            name.endsWith(".wav", ignoreCase = true) -> "audio/wav"
            name.endsWith(".webm", ignoreCase = true) -> "audio/webm"
            name.endsWith(".ogg", ignoreCase = true) -> "audio/ogg"
            else -> return null
        }
        val bundled = try {
            activity.assets.open("www/sounds/$name").use { it.readBytes() }
        } catch (e: Exception) {
            null
        }
        val bytes = bundled ?: try {
            val b64 = db.readProjectFile(name) ?: return null
            Base64.decode(b64, Base64.DEFAULT)
        } catch (e: Exception) {
            Log.e(TAG, "io_getAudioData error for $name", e)
            null
        } ?: return null
        return "data:$mime;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
    }

    // ----------------------------------------------------
    // Sound playback (contract: ScratchJrBridge in globals.d.ts;
    // desktop implements these in electronClient.js with HTML Audio)
    // ----------------------------------------------------

    private val currentAudio = mutableMapOf<String, String>()
    private val playingAudio = mutableMapOf<String, android.media.MediaPlayer>()

    /** Called by ScratchAudio.addSound: preload a sound and cache its data URI. */
    @JavascriptInterface
    fun io_registersound(dir: String, name: String) {
        if (!currentAudio.containsKey(name)) {
            val dataUri = io_getAudioData(name)
            if (dataUri != null) {
                currentAudio[name] = dataUri
            } else {
                // Desktop tolerates missing sounds: soundDone fires so script
                // blocks keep progressing (electronClient.js io_playsound).
                Log.w(TAG, "io_registersound: no data for $name (will no-op on play)")
                currentAudio[name] = ""
            }
        }
    }

    /** Play a registered sound; on completion notify the web layer via
     *  PlatformBridge.soundDone so green sound blocks advance. */
    @JavascriptInterface
    fun io_playsound(name: String) {
        val dataUri = currentAudio[name]
        if (dataUri == null || dataUri.isEmpty()) {
            Log.w(TAG, "io_playsound: unregistered sound $name - skipping")
            notifySoundDone(name)
            return
        }
        try {
            playingAudio[name]?.release()
            val player = android.media.MediaPlayer()
            val bytes = Base64.decode(dataUri.substringAfter(","), Base64.DEFAULT)
            val safe = name.replace(Regex("[^A-Za-z0-9._-]"), "_")
            val tmp = java.io.File(activity.cacheDir, "snd_$safe")
            tmp.writeBytes(bytes)
            player.setDataSource(tmp.absolutePath)
            tmp.deleteOnExit()
            player.setOnCompletionListener {
                it.release()
                playingAudio.remove(name)
                notifySoundDone(name)
            }
            player.setVolume(0.8f, 0.8f)
            player.prepare()
            player.start()
            playingAudio[name] = player
        } catch (e: Exception) {
            Log.e(TAG, "io_playsound failed for $name", e)
            notifySoundDone(name)
        }
    }

    @JavascriptInterface
    fun io_stopsound(name: String) {
        playingAudio.remove(name)?.let {
            try { it.stop() } catch (_: Exception) {}
            it.release()
        }
        notifySoundDone(name)
    }

    private fun notifySoundDone(name: String) {
        activity.webView.post {
            activity.webView.evaluateJavascript(
                "if (window.PlatformBridge && window.PlatformBridge.soundDone) { window.PlatformBridge.soundDone('$name'); }",
                null
            )
        }
    }

    // ----------------------------------------------------
    // Device & Lifecycle
    // ----------------------------------------------------

    @JavascriptInterface
    fun deviceName(): String {
        return "Android ${Build.MODEL}"
    }

    @JavascriptInterface
    fun hideSplash(): Boolean {
        activity.hideSplashScreen()
        return true
    }

    @JavascriptInterface
    fun askForPermission(): Boolean {
        return activity.checkAndRequestHardwarePermissions()
    }

    @JavascriptInterface
    fun debugWriteLog(args: String) {
        Log.d("ScratchJr-JS", args)
    }

    @JavascriptInterface
    fun sendAppClosedAcked() {
        Log.d(TAG, "Renderer acknowledged app close")
    }

    @JavascriptInterface
    fun analyticsEvent(category: String, action: String, usageLabel: String, value: Int) {
        Log.d(TAG, "Analytics: $category / $action / $usageLabel ($value)")
    }

    // ----------------------------------------------------
    // Camera (renderer-side getUserMedia does the real work via
    // CameraPickerDialog; these feed PlatformBridge state + permission)
    // ----------------------------------------------------

    /** Returns "1"/"0": Paint.ts gates the paint-editor camera tool on this. */
    @JavascriptInterface
    fun scratchjr_cameracheck(): String {
        val hasCamera = activity.packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
        return if (hasCamera &&
            ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) ==
            PackageManager.PERMISSION_GRANTED
        ) "1" else "0"
    }

    @JavascriptInterface
    fun scratchjr_startfeed(str: String) {
        // Feed rendering/preview is renderer-side (CameraPickerDialog).
    }

    @JavascriptInterface
    fun scratchjr_stopfeed() {
        // no-op: renderer-side feed
    }

    @JavascriptInterface
    fun scratchjr_choosecamera(mode: String) {
        // Renderer-side feed switches via getUserMedia constraints; no native
        // camera is held, so nothing to switch.
    }

    /** The renderer captures the frame itself; the callback contract is
     *  honored by CameraPickerDialog calling window.Camera.processimage. */
    @JavascriptInterface
    fun scratchjr_captureimage(whenDone: String) {
        Log.w(TAG, "scratchjr_captureimage: renderer-side capture expected")
    }

    @JavascriptInterface
    fun scratchjr_has_multiple_cameras(): Boolean {
        return try {
            val cameraManager = activity.getSystemService(android.content.Context.CAMERA_SERVICE)
                    as android.hardware.camera2.CameraManager
            cameraManager.cameraIdList.size > 1
        } catch (e: Exception) {
            false
        }
    }

    // ----------------------------------------------------
    // Sound recording (renderer-side MediaRecorder does the work;
    // these answer permission + state for the Record dialog)
    // ----------------------------------------------------

    @JavascriptInterface
    fun recordsound_recordstart(): String {
        activity.checkAndRequestHardwarePermissions()
        return ""
    }

    @JavascriptInterface
    fun recordsound_recordstop() {
        // renderer-side
    }

    @JavascriptInterface
    fun recordsound_volume(): Int {
        // Volume metering is renderer-side (AudioCapture volume meter).
        return 0
    }

    @JavascriptInterface
    fun recordsound_startplay(): Int {
        // renderer-side; duration unknown
        return 0
    }

    @JavascriptInterface
    fun recordsound_stopplay() {
        // renderer-side
    }

    /** keep=YES/NO after the record dialog closes; renderer-side capture
     *  saves via io_setmedianame, so nothing to do natively. */
    @JavascriptInterface
    fun recordsound_recordclose(keep: String) {
        Log.d(TAG, "recordsound_recordclose keep=$keep (renderer-side)")
    }

    // ----------------------------------------------------
    // Lobby share button (shares .sjr via the Android share sheet)
    // ----------------------------------------------------

    @JavascriptInterface
    fun sendSjrUsingShareDialog(
        fileName: String,
        emailSubject: String,
        emailBody: String,
        shareType: String,
        b64data: String
    ) {
        try {
            val exportDir = File(activity.cacheDir, "exports").apply { mkdirs() }
            val target = File(exportDir, if (fileName.endsWith(".sjr")) fileName else "$fileName.sjr")
            FileOutputStream(target).use { it.write(Base64.decode(b64data, Base64.DEFAULT)) }
            val uri = FileProvider.getUriForFile(activity, "${activity.packageName}.fileprovider", target)
            val share = Intent(Intent.ACTION_SEND).apply {
                type = "application/x-scratchjr-project"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, emailSubject)
                putExtra(Intent.EXTRA_TEXT, emailBody)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            activity.runOnUiThread {
                activity.startActivity(Intent.createChooser(share, "Share ScratchJr Project"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "sendSjrUsingShareDialog error", e)
        }
    }

    // ----------------------------------------------------
    // Project & Image Export via Android Share Sheet
    // ----------------------------------------------------

    @JavascriptInterface
    fun sendExportedSjr(dataB64: String, suggestedName: String): String? {
        return try {
            val exportDir = File(activity.cacheDir, "exports").apply { mkdirs() }
            val fileName = if (suggestedName.endsWith(".sjr")) suggestedName else "$suggestedName.sjr"
            val targetFile = File(exportDir, fileName)

            val bytes = Base64.decode(dataB64, Base64.DEFAULT)
            FileOutputStream(targetFile).use { it.write(bytes) }

            val uri = FileProvider.getUriForFile(
                activity,
                "${activity.packageName}.fileprovider",
                targetFile
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/x-scratchjr-project"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            activity.runOnUiThread {
                activity.startActivity(Intent.createChooser(shareIntent, "Share ScratchJr Project"))
            }

            targetFile.absolutePath
        } catch (e: Exception) {
            Log.e(TAG, "sendExportedSjr error", e)
            null
        }
    }

    @JavascriptInterface
    fun sendExportedPng(dataUrl: String, suggestedName: String): String? {
        return try {
            val exportDir = File(activity.cacheDir, "exports").apply { mkdirs() }
            val fileName = if (suggestedName.endsWith(".png")) suggestedName else "$suggestedName.png"
            val targetFile = File(exportDir, fileName)

            val base64Data = if (dataUrl.contains(",")) dataUrl.substringAfter(",") else dataUrl
            val bytes = Base64.decode(base64Data, Base64.DEFAULT)
            FileOutputStream(targetFile).use { it.write(bytes) }

            val uri = FileProvider.getUriForFile(
                activity,
                "${activity.packageName}.fileprovider",
                targetFile
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            activity.runOnUiThread {
                activity.startActivity(Intent.createChooser(shareIntent, "Share Stage Image"))
            }

            targetFile.absolutePath
        } catch (e: Exception) {
            Log.e(TAG, "sendExportedPng error", e)
            null
        }
    }
}
