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
        private val TABLE_COLUMNS: Map<String, Set<String>> = mapOf(
            "PROJECTS" to setOf(
                "ID", "CTIME", "MTIME", "ALTMD5", "POS", "NAME", "JSON", "THUMBNAIL",
                "OWNER", "GALLERY", "DELETED", "VERSION", "ISGIFT"
            ),
            "USERSHAPES" to setOf(
                "ID", "CTIME", "MD5", "ALTMD5", "WIDTH", "HEIGHT", "EXT", "NAME",
                "OWNER", "SCALE", "VERSION"
            ),
            "USERBKGS" to setOf(
                "ID", "CTIME", "MD5", "ALTMD5", "WIDTH", "HEIGHT", "EXT", "OWNER", "VERSION"
            )
        )
        private val ALLOWED_TABLES = TABLE_COLUMNS.keys
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

            val op = json.optString("op", "").lowercase()
            val table = json.optString("table", "").uppercase()
            val allowedCols = TABLE_COLUMNS[table]
            if (allowedCols == null) {
                Log.w(TAG, "executeStmt: rejected unknown table: $table")
                return "-2"
            }

            when (op) {
                "insert" -> {
                    val row = json.optJSONObject("row")
                    if (row == null || row.length() == 0) {
                        Log.w(TAG, "executeStmt: insert requires non-empty row")
                        return "-2"
                    }
                    val values = contentValuesFrom(row, allowedCols) ?: return "-2"
                    val id = db.insertWithOnConflict(table, null, values, SQLiteDatabase.CONFLICT_REPLACE)
                    id.toString()
                }
                "update" -> {
                    val row = json.optJSONObject("row")
                    if (row == null || row.length() == 0) {
                        Log.w(TAG, "executeStmt: update requires non-empty row")
                        return "-2"
                    }
                    val id = json.opt("id")
                    val values = contentValuesFrom(row, allowedCols) ?: return "-2"
                    // The renderer always sends ids (verified: IO.ts + PlatformBridge
                    // setfield); log-and-noop on an id-less update rather than
                    // silently rewriting every row.
                    if (id == null || id == JSONObject.NULL) {
                        Log.w(TAG, "executeStmt: update without id rejected")
                        "-2"
                    } else {
                        db.update(table, values, "ID = ?", arrayOf(id.toString())).toString()
                    }
                }
                "delete" -> {
                    val id = json.opt("id")
                    if (id == null || id == JSONObject.NULL) {
                        Log.w(TAG, "executeStmt: delete without id rejected")
                        "-2"
                    } else {
                        db.delete(table, "ID = ?", arrayOf(id.toString())).toString()
                    }
                }
                else -> "-2"
            }
        } catch (e: Exception) {
            Log.e(TAG, "executeStmt error with JSON: $jsonStr", e)
            "-3"
        }
    }

    private fun contentValuesFrom(row: JSONObject, allowedCols: Set<String>): ContentValues? {
        val values = ContentValues()
        val keys = row.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val colUpper = key.uppercase()
            if (!allowedCols.contains(colUpper)) {
                Log.w(TAG, "contentValuesFrom: rejected unknown column: $key")
                return null
            }
            val value = row.opt(key)
            if (value == null || value == JSONObject.NULL) {
                values.putNull(colUpper)
            } else when (value) {
                is JSONArray, is JSONObject -> {
                    Log.w(TAG, "contentValuesFrom: rejected non-primitive value for $key")
                    return null
                }
                is Int -> values.put(colUpper, value.toLong())
                is Long -> values.put(colUpper, value.toLong())
                is Number -> values.put(colUpper, value.toDouble())
                is Boolean -> values.put(colUpper, if (value) 1 else 0)
                else -> values.put(colUpper, value.toString())
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
            val op = json.optString("op", "select").lowercase()
            if (op != "select") {
                Log.w(TAG, "executeQuery: rejected non-select op: $op")
                return "[]"
            }

            val table = json.optString("table", "").uppercase()
            val allowedCols = TABLE_COLUMNS[table]
            if (allowedCols == null) {
                Log.w(TAG, "executeQuery: rejected unknown table: $table")
                return "[]"
            }

            val items = json.optJSONArray("items")
            val columns = if (items != null && items.length() > 0) {
                val arr = Array(items.length()) { i -> items.getString(i).uppercase() }
                for (col in arr) {
                    if (!allowedCols.contains(col)) {
                        Log.w(TAG, "executeQuery: rejected unknown select column: $col")
                        return "[]"
                    }
                }
                arr
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
                    if (!allowedCols.contains(col)) {
                        Log.w(TAG, "executeQuery: rejected unknown where column: $col")
                        return "[]"
                    }
                    val whereOp = clause.getString("op").uppercase()
                    if (whereOp == "IS NULL") {
                        clauses.add("$col IS NULL")
                    } else if (whereOp == "=" || whereOp == "!=") {
                        clauses.add("$col $whereOp ?")
                        val v = clause.opt("value")
                        if (v is JSONArray || v is JSONObject) {
                            return "[]"
                        }
                        selectionArgsList.add(v?.toString() ?: "")
                    } else {
                        Log.w(TAG, "executeQuery: rejected invalid where op: $whereOp")
                        return "[]"
                    }
                }
                selection = clauses.joinToString(" AND ")
            }

            var orderBy: String? = null
            val order = json.optJSONObject("order")
            if (order != null) {
                val col = order.getString("col").uppercase()
                if (!allowedCols.contains(col)) {
                    Log.w(TAG, "executeQuery: rejected unknown order column: $col")
                    return "[]"
                }
                val dir = order.optString("dir", "asc").uppercase()
                if (dir != "ASC" && dir != "DESC") {
                    Log.w(TAG, "executeQuery: rejected invalid order dir: $dir")
                    return "[]"
                }
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

            val cleanBase64 = if (base64Content.contains(",")) {
                base64Content.substringAfter(",")
            } else {
                base64Content
            }
            val bytes = Base64.decode(cleanBase64, Base64.DEFAULT)
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
            File(mediaDirectory, "${file.name}.bak").delete()
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
                    File(mediaDirectory, "${file.name}.bak").delete()
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
