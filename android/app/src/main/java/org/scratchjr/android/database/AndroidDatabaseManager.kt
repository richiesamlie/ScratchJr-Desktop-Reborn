package org.scratchjr.android.database

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.util.Base64
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.StandardCopyOption

class AndroidDatabaseManager(private val context: Context) {

    companion object {
        private const val TAG = "AndroidDatabaseManager"
    }

    private val dbHelper = DbOpenHelper(context)
    private val db: SQLiteDatabase get() = dbHelper.writableDatabase
    val mediaDirectory: File = File(context.filesDir, "media").apply {
        if (!exists()) {
            mkdirs()
        }
    }

    init {
        // Startup integrity check
        checkIntegrity()
        cleanOrphanedTmpFiles()
    }

    private fun checkIntegrity() {
        try {
            db.rawQuery("PRAGMA integrity_check;", null).use { cursor ->
                if (cursor.moveToFirst()) {
                    val result = cursor.getString(0)
                    if (!"ok".equals(result, ignoreCase = true)) {
                        Log.w(TAG, "PRAGMA integrity_check failed: $result")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking database integrity", e)
        }
    }

    private fun cleanOrphanedTmpFiles() {
        try {
            mediaDirectory.listFiles { file -> file.name.endsWith(".tmp") }?.forEach { tmpFile ->
                tmpFile.delete()
                Log.d(TAG, "Cleaned orphaned media tmp file: ${tmpFile.name}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error cleaning orphaned tmp files", e)
        }
    }

    /**
     * Resolves a media name to a File inside mediaDirectory, rejecting names
     * that attempt path traversal (parity with desktop mediaFilePath,
     * src/main/database.ts: basename must equal the requested name).
     */
    private fun mediaFilePath(name: String): File? {
        if (name.isEmpty()) return null
        val base = File(name).name
        if (base != name || base == "." || base == ".." || base.isEmpty()) return null
        return File(mediaDirectory, base)
    }

    /**
     * Executes structured database statement intent (insert, update, delete)
     * Returns JSON string with result (e.g. affected rows or new row id)
     */
    fun executeStmt(jsonStr: String): String {
        return try {
            val json = JSONObject(jsonStr)

            // Handle legacy { stmt: "...", values: [...] } wrapper
            if (json.has("stmt")) {
                val stmt = json.getString("stmt")
                val values = json.optJSONArray("values")
                val bindArgs = mutableListOf<String>()
                if (values != null) {
                    for (i in 0 until values.length()) {
                        bindArgs.add(values.optString(i))
                    }
                }
                db.execSQL(stmt, bindArgs.toTypedArray())
                return "1"
            }

            val op = json.getString("op").lowercase()
            val table = json.getString("table").uppercase()

            when (op) {
                "insert" -> {
                    val row = json.getJSONObject("row")
                    val values = contentValuesFrom(row)
                    val id = db.insertWithOnConflict(table, null, values, SQLiteDatabase.CONFLICT_REPLACE)
                    id.toString()
                }
                "update" -> {
                    val row = json.getJSONObject("row")
                    val id = json.opt("id")
                    val values = contentValuesFrom(row)
                    // The renderer always sends ids (verified: IO.ts + PlatformBridge
                    // setfield); log-and-noop on an id-less update rather than
                    // silently rewriting every row.
                    if (id == null || id == JSONObject.NULL) {
                        Log.w(TAG, "executeStmt: update without id rejected")
                        "-1"
                    } else {
                        db.update(table, values, "ID = ?", arrayOf(id.toString())).toString()
                    }
                }
                "delete" -> {
                    val id = json.opt("id")
                    if (id == null || id == JSONObject.NULL) {
                        Log.w(TAG, "executeStmt: delete without id rejected")
                        "-1"
                    } else {
                        db.delete(table, "ID = ?", arrayOf(id.toString())).toString()
                    }
                }
                else -> "-1"
            }
        } catch (e: Exception) {
            Log.e(TAG, "executeStmt error with JSON: $jsonStr", e)
            "-1"
        }
    }

    private fun contentValuesFrom(row: JSONObject): ContentValues {
        val values = ContentValues()
        val keys = row.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val value = row.opt(key)
            if (value == null || value == JSONObject.NULL) {
                values.putNull(key.uppercase())
            } else when (value) {
                is Number -> values.put(key.uppercase(), value.toDouble())
                is Boolean -> values.put(key.uppercase(), if (value) 1 else 0)
                else -> values.put(key.uppercase(), value.toString())
            }
        }
        return values
    }

    /**
     * Executes structured select intent and returns JSON string array of row objects
     */
    fun executeQuery(jsonStr: String): String {
        return try {
            val json = JSONObject(jsonStr)

            // Handle legacy { stmt: "...", values: [...] } wrapper
            if (json.has("stmt")) {
                val stmt = json.getString("stmt")
                val values = json.optJSONArray("values")
                val bindArgs = mutableListOf<String>()
                if (values != null) {
                    for (i in 0 until values.length()) {
                        bindArgs.add(values.optString(i))
                    }
                }
                val cursor = db.rawQuery(stmt, bindArgs.toTypedArray())
                return cursorToJsonArray(cursor).toString()
            }

            val table = json.getString("table").uppercase()
            val items = json.optJSONArray("items")
            val columns = if (items != null && items.length() > 0) {
                Array(items.length()) { i -> items.getString(i).uppercase() }
            } else {
                null
            }

            var selection: String? = null
            val selectionArgsList = mutableListOf<String>()

            val where = json.optJSONArray("where")
            if (where != null && where.length() > 0) {
                val clauses = mutableListOf<String>()
                for (i in 0 until where.length()) {
                    val clause = where.getJSONObject(i)
                    val col = clause.getString("col").uppercase()
                    val op = clause.getString("op")
                    if (op.equals("IS NULL", ignoreCase = true)) {
                        clauses.add("$col IS NULL")
                    } else {
                        clauses.add("$col $op ?")
                        val v = clause.opt("value")
                        selectionArgsList.add(v?.toString() ?: "")
                    }
                }
                selection = clauses.joinToString(" AND ")
            }

            var orderBy: String? = null
            val order = json.optJSONObject("order")
            if (order != null) {
                val col = order.getString("col").uppercase()
                val dir = order.optString("dir", "asc").uppercase()
                orderBy = "$col $dir"
            }

            val cursor = db.query(
                table,
                columns,
                selection,
                if (selectionArgsList.isEmpty()) null else selectionArgsList.toTypedArray(),
                null,
                null,
                orderBy
            )

            cursorToJsonArray(cursor).toString()
        } catch (e: Exception) {
            Log.e(TAG, "executeQuery error with JSON: $jsonStr", e)
            "[]"
        }
    }

    private fun cursorToJsonArray(cursor: Cursor): JSONArray {
        val result = JSONArray()
        cursor.use { c ->
            val columnNames = c.columnNames
            while (c.moveToNext()) {
                val row = JSONObject()
                for (i in columnNames.indices) {
                    val colName = columnNames[i].lowercase()
                    when (c.getType(i)) {
                        Cursor.FIELD_TYPE_NULL -> row.put(colName, JSONObject.NULL)
                        Cursor.FIELD_TYPE_INTEGER -> row.put(colName, c.getLong(i))
                        Cursor.FIELD_TYPE_FLOAT -> row.put(colName, c.getDouble(i))
                        Cursor.FIELD_TYPE_STRING -> row.put(colName, c.getString(i))
                        Cursor.FIELD_TYPE_BLOB -> {
                            val blob = c.getBlob(i)
                            row.put(colName, Base64.encodeToString(blob, Base64.NO_WRAP))
                        }
                    }
                }
                result.put(row)
            }
        }
        return result
    }

    /**
     * Save base64 encoded project file to media folder.
     * Atomic, crash-safe write: tmp file -> fsync -> rotate previous good copy
     * to .bak -> Files.move(REPLACE_EXISTING) into place (no delete-first
     * window; parity with desktop database.ts persistence model).
     */
    fun saveProjectFile(name: String, base64Content: String): Boolean {
        return try {
            val targetFile = mediaFilePath(name) ?: return false
            val tmpFile = File(mediaDirectory, "${targetFile.name}.tmp")

            val bytes = Base64.decode(base64Content, Base64.DEFAULT)
            FileOutputStream(tmpFile).use { fos ->
                fos.write(bytes)
                fos.flush()
                fos.fd.sync()
            }

            val bakFile = File(mediaDirectory, "${targetFile.name}.bak")
            if (targetFile.exists()) {
                // Retain the last known good copy
                try {
                    Files.move(
                        targetFile.toPath(),
                        bakFile.toPath(),
                        StandardCopyOption.REPLACE_EXISTING
                    )
                } catch (e: Exception) {
                    Log.w(TAG, "saveProjectFile: bak rotation failed for ${targetFile.name}", e)
                }
            }

            Files.move(
                tmpFile.toPath(),
                targetFile.toPath(),
                StandardCopyOption.REPLACE_EXISTING
            )
            true
        } catch (e: Exception) {
            Log.e(TAG, "saveProjectFile failed for $name", e)
            false
        }
    }

    /**
     * Read project file as base64 string
     */
    fun readProjectFile(name: String): String? {
        val file = mediaFilePath(name) ?: return null
        if (file.exists()) {
            return try {
                val bytes = file.readBytes()
                Base64.encodeToString(bytes, Base64.NO_WRAP)
            } catch (e: Exception) {
                Log.e(TAG, "readProjectFile error for $name", e)
                null
            }
        }

        // Fallback to PROJECTFILES table for legacy database migration
        try {
            db.query(
                "PROJECTFILES",
                arrayOf("CONTENTS"),
                "MD5 = ?",
                arrayOf(name),
                null,
                null,
                null
            ).use { cursor ->
                if (cursor.moveToFirst()) {
                    return cursor.getString(0)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "PROJECTFILES fallback read error for $name", e)
        }
        return null
    }

    /**
     * Remove project file from media directory and database
     */
    fun removeProjectFile(name: String): Boolean {
        var removed = false
        val file = mediaFilePath(name)
        if (file != null && file.exists()) {
            removed = file.delete()
        }
        try {
            db.delete("PROJECTFILES", "MD5 = ?", arrayOf(name))
            removed = true
        } catch (e: Exception) {
            Log.e(TAG, "removeProjectFile error for $name", e)
        }
        return removed
    }

    /**
     * Clean unused project files of given extension (e.g. 'png', 'svg', 'webm').
     * Media-in-use rules mirror desktop mediaInUse (database.ts:298-327):
     * PROJECTS json/thumbnail LIKE, USERSHAPES/USERBKGS md5/altmd5 equality.
     */
    fun cleanProjectFiles(fileType: String): Boolean {
        return try {
            var type = fileType
            if (type == "wav") {
                type = "webm"
            }
            val extension = if (type.startsWith(".")) type else ".$type"
            val files = mediaDirectory.listFiles { f -> f.name.endsWith(extension) } ?: return true

            for (file in files) {
                val filename = file.name
                if (!isMediaInUse(filename)) {
                    file.delete()
                    Log.d(TAG, "cleanProjectFiles: deleted unused file $filename")
                }
            }
            true
        } catch (e: Exception) {
            Log.e(TAG, "cleanProjectFiles error", e)
            false
        }
    }

    /**
     * Check if a media file is in use (desktop parity: LIKE on PROJECTS
     * json/thumbnail; exact match on USERSHAPES/USERBKGS md5/altmd5)
     */
    private fun isMediaInUse(filename: String): Boolean {
        val pattern = "%$filename%"

        db.rawQuery(
            "SELECT 1 FROM PROJECTS WHERE (JSON LIKE ? OR THUMBNAIL LIKE ?) LIMIT 1",
            arrayOf(pattern, pattern)
        ).use { cursor ->
            if (cursor.moveToFirst()) return true
        }

        db.rawQuery(
            "SELECT 1 FROM USERSHAPES WHERE (MD5 = ? OR ALTMD5 = ?) LIMIT 1",
            arrayOf(filename, filename)
        ).use { cursor ->
            if (cursor.moveToFirst()) return true
        }

        db.rawQuery(
            "SELECT 1 FROM USERBKGS WHERE (MD5 = ? OR ALTMD5 = ?) LIMIT 1",
            arrayOf(filename, filename)
        ).use { cursor ->
            if (cursor.moveToFirst()) return true
        }

        return false
    }

    fun close() {
        dbHelper.close()
    }
}
