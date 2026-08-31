package org.scratchjr.android.bridge

import android.content.Intent
import android.os.Build
import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
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
        val mediaPath = db.mediaDirectory.absolutePath
        // Returns "mediaPath,isTablet,isDebug,isAnalytics"
        return "$mediaPath,true,false,false"
    }

    @JavascriptInterface
    fun io_gettextresource(filename: String): String {
        return try {
            activity.assets.open("www/$filename").bufferedReader(StandardCharsets.UTF_8).use { it.readText() }
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
        return db.readProjectFile(name)
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
