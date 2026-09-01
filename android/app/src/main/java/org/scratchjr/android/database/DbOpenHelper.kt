package org.scratchjr.android.database

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class DbOpenHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "scratchjr.db"
        const val DATABASE_VERSION = 1
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS PROJECTS (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                CTIME DATETIME DEFAULT CURRENT_TIMESTAMP,
                MTIME DATETIME,
                ALTMD5 TEXT,
                POS INTEGER,
                NAME TEXT,
                JSON TEXT,
                THUMBNAIL TEXT,
                OWNER TEXT,
                GALLERY TEXT,
                DELETED TEXT DEFAULT 'NO',
                VERSION TEXT,
                ISGIFT INTEGER DEFAULT 0
            );
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS USERSHAPES (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                CTIME DATETIME DEFAULT CURRENT_TIMESTAMP,
                MD5 TEXT,
                ALTMD5 TEXT,
                WIDTH TEXT,
                HEIGHT TEXT,
                EXT TEXT,
                NAME TEXT,
                OWNER TEXT,
                SCALE TEXT,
                VERSION TEXT
            );
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS USERBKGS (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                CTIME DATETIME DEFAULT CURRENT_TIMESTAMP,
                MD5 TEXT,
                ALTMD5 TEXT,
                WIDTH TEXT,
                HEIGHT TEXT,
                EXT TEXT,
                OWNER TEXT,
                VERSION TEXT
            );
            """.trimIndent()
        )

        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS PROJECTFILES (
                MD5 TEXT PRIMARY KEY,
                CONTENTS TEXT
            );
            """.trimIndent()
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Future migrations if database version increments
    }

    override fun onConfigure(db: SQLiteDatabase) {
        super.onConfigure(db)
        db.enableWriteAheadLogging()
    }
}
