package org.scratchjr.android.database

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Instrumented DB intent-protocol tests (run on device/emulator):
 *   ./gradlew connectedDebugAndroidTest
 * Storage parity suite for the Android port: intent CRUD round-trip,
 * media file atomicity/containment, and cleanassets media-in-use rules
 * mirroring desktop (src/main/database.ts mediaInUse).
 */
@RunWith(AndroidJUnit4::class)
class AndroidDatabaseManagerTest {

    private fun newManager(): AndroidDatabaseManager =
        AndroidDatabaseManager(ApplicationProvider.getApplicationContext() as Context)

    private fun insertProject(db: AndroidDatabaseManager, name: String): String {
        return db.executeStmt(
            JSONObject()
                .put("op", "insert")
                .put("table", "projects")
                .put("row", JSONObject().put("name", name).put("deleted", "NO").put("json", "{}"))
                .toString()
        )
    }

    private fun selectProject(db: AndroidDatabaseManager, id: String): JSONArray {
        return JSONArray(
            db.executeQuery(
                JSONObject()
                    .put("op", "select")
                    .put("table", "projects")
                    .put("where", JSONArray().put(JSONObject().put("col", "id").put("op", "=").put("value", id)))
                    .toString()
            )
        )
    }

    @Test
    fun insertSelectUpdateDeleteRoundTrip() {
        val db = newManager()
        // insert
        val id = insertProject(db, "Test Project")
        assertTrue(id.toLong() > 0)

        // select
        val rows = selectProject(db, id)
        assertEquals(1, rows.length())
        assertEquals("Test Project", rows.getJSONObject(0).getString("name"))

        // update
        val updated = db.executeStmt(
            JSONObject()
                .put("op", "update")
                .put("table", "projects")
                .put("row", JSONObject().put("name", "Renamed"))
                .put("id", id)
                .toString()
        )
        assertEquals("1", updated)
        assertEquals("Renamed", selectProject(db, id).getJSONObject(0).getString("name"))

        // delete
        assertEquals("1", db.executeStmt(
            JSONObject().put("op", "delete").put("table", "projects").put("id", id).toString()
        ))
        assertEquals(0, selectProject(db, id).length())
        db.close()
    }

    @Test
    fun idLessUpdateAndDeleteAreRejected() {
        val db = newManager()
        val id = insertProject(db, "Guard Project")
        // id-less update must not rewrite every row
        assertEquals("-1", db.executeStmt(
            JSONObject().put("op", "update").put("table", "projects")
                .put("row", JSONObject().put("name", "Hacked")).toString()
        ))
        // id-less delete must not wipe the table
        assertEquals("-1", db.executeStmt(
            JSONObject().put("op", "delete").put("table", "projects").toString()
        ))
        val rows = selectProject(db, id)
        assertEquals(1, rows.length())
        assertEquals("Guard Project", rows.getJSONObject(0).getString("name"))
        db.executeStmt(JSONObject().put("op", "delete").put("table", "projects").put("id", id).toString())
        db.close()
    }

    @Test
    fun selectWithWhereOrderAndItems() {
        val db = newManager()
        val idA = insertProject(db, "Alpha Select Test")
        val idB = insertProject(db, "Beta Select Test")
        val rows = JSONArray(
            db.executeQuery(
                JSONObject()
                    .put("op", "select")
                    .put("table", "projects")
                    .put("items", JSONArray().put("name"))
                    .put("where", JSONArray().put(JSONObject().put("col", "deleted").put("op", "=").put("value", "NO")))
                    .put("order", JSONObject().put("col", "ctime").put("dir", "desc"))
                    .toString()
            )
        )
        assertTrue(rows.length() >= 2)
        assertTrue(rows.getJSONObject(0).has("name"))
        assertFalse(rows.getJSONObject(0).has("json"))
        db.executeStmt(JSONObject().put("op", "delete").put("table", "projects").put("id", idA).toString())
        db.executeStmt(JSONObject().put("op", "delete").put("table", "projects").put("id", idB).toString())
        db.close()
    }

    @Test
    fun mediaSaveReadRoundTripAndBakRotation() {
        val db = newManager()
        val name = "deadbeef.png"
        val b64 = android.util.Base64.encodeToString("first".toByteArray(), android.util.Base64.NO_WRAP)
        assertTrue(db.saveProjectFile(name, b64))
        // second save rotates the first copy to .bak
        val b64v2 = android.util.Base64.encodeToString("second".toByteArray(), android.util.Base64.NO_WRAP)
        assertTrue(db.saveProjectFile(name, b64v2))
        val readBack = db.readProjectFile(name)
        assertNotNull(readBack)
        val decoded = String(android.util.Base64.decode(readBack!!, android.util.Base64.DEFAULT))
        assertEquals("second", decoded)
        assertTrue(db.removeProjectFile(name))
        db.close()
    }

    @Test
    fun mediaPathTraversalRejected() {
        val db = newManager()
        assertFalse(db.saveProjectFile("../../traversal.txt", "eHg="))
        assertFalse(db.saveProjectFile("/etc/passwd", "eHg="))
        db.close()
    }

    @Test
    fun cleanProjectFilesKeepsReferencedAssets() {
        val db = newManager()
        // A png referenced by a project thumbnail must survive cleanassets('png')
        val id = insertProject(db, "Thumb Project")
        val thumbMd5 = "cafebabe.png"
        db.executeStmt(
            JSONObject()
                .put("op", "update")
                .put("table", "projects")
                .put("row", JSONObject().put("thumbnail", JSONObject().put("md5", thumbMd5).toString()))
                .put("id", id)
                .toString()
        )
        val b64 = android.util.Base64.encodeToString("img".toByteArray(), android.util.Base64.NO_WRAP)
        assertTrue(db.saveProjectFile(thumbMd5, b64))
        // an unreferenced png must be cleaned
        val orphan = "orphan0000.png"
        assertTrue(db.saveProjectFile(orphan, b64))

        assertTrue(db.cleanProjectFiles("png"))
        assertNotNull(db.readProjectFile(thumbMd5))
        assertTrue(db.readProjectFile(orphan) == null || db.readProjectFile(orphan)!!.isEmpty())
        db.executeStmt(JSONObject().put("op", "delete").put("table", "projects").put("id", id).toString())
        db.close()
    }
}
