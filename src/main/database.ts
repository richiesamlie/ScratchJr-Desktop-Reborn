/**
 * Database module for ScratchJr Desktop.
 *
 * Manages the SQL.js database lifecycle: initialize, open, close, save,
 * migrations, project file CRUD, and asset cleanup.
 */

import fs from 'fs';
import path from 'path';
import { debugLog } from './logging';

interface SqlJsDatabase {
    prepare(stmt: string, values?: unknown[]): SqlJsStatement;
    exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
    export(): Uint8Array;
    close(): void;
    handleError?: (e: Error) => void;
}

interface SqlJsStatement {
    step(): boolean;
    get(): unknown[];
    getAsObject(): Record<string, unknown>;
    free(): void;
}

interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => SqlJsDatabase;
}

interface QueryJson {
    stmt?: string;
    values?: Array<string | number | boolean | null>;
}

export class DatabaseManager {
    databaseFilename: string;
    databaseRestoreFilename: string | undefined;
    databaseBackupFilename: string;
    db: SqlJsDatabase | null = null;
    /** When set, project media is stored as files here; PROJECTFILES rows are legacy fallback only */
    mediaDirectory: string | null = null;
    private _SQL: SqlJsStatic;
    /** Set by the caller after construction if it needs to know about auto-recovery */
    onAutoRecovery: (() => void) | null = null;
    /** Set by the caller after construction if it needs to know about unrecoverable corruption */
    onCorruptionReset: (() => void) | null = null;
    /** Debounced save timer — coalesces rapid successive writes */
    private _saveTimer: ReturnType<typeof setTimeout> | null = null;
    private _saveDelay = 100; // ms

    constructor(databaseFilename: string, databaseRestoreFilename: string | undefined, SQL: SqlJsStatic) {
        this.databaseFilename = databaseFilename;
        this.databaseRestoreFilename = databaseRestoreFilename;
        this.databaseBackupFilename = databaseFilename + '.bak';
        this._SQL = SQL;

        // Clean up any orphaned .tmp file from an ungraceful shutdown
        const tmpPath = this.databaseFilename + '.tmp';
        if (fs.existsSync(tmpPath)) {
            try {
                fs.unlinkSync(tmpPath);
                debugLog('Cleaned up orphaned database .tmp file at startup');
            } catch (e) {
                debugLog('Failed to remove orphaned .tmp file:', e);
            }
        }

        if (fs.existsSync(this.databaseFilename)) {
            this.open(SQL);
        }
        this.initTables(SQL);
        this.runMigrations();
        this.save();
    }

    static async initialize(databaseFilename: string, databaseRestoreFilename?: string): Promise<DatabaseManager> {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const initSqlJs = require('sql.js');
        const SQL: SqlJsStatic = await initSqlJs({});
        return new DatabaseManager(databaseFilename, databaseRestoreFilename, SQL);
    }

    /**
     * Recover from the backup file: re-open from the restored copy and notify,
     * or fall back to a brand-new empty database.
     */
    private recoverFromBackup(SQL: SqlJsStatic): void {
        if (this.autoRecover()) {
            debugLog('Auto-recovery succeeded');
            // Re-open from the now-recovered file
            const recoveredBuffer = fs.readFileSync(this.databaseFilename);
            this.db = new SQL.Database(recoveredBuffer);
            this.db.handleError = this.handleError;
            if (this.onAutoRecovery) {
                this.onAutoRecovery();
            }
        } else {
            debugLog('Auto-recovery failed — creating fresh database');
            this.freshDatabase(SQL);
            if (this.onCorruptionReset) {
                this.onCorruptionReset();
            }
        }
    }

    open(SQL: SqlJsStatic): void {
        const fileToOpen = (this.databaseRestoreFilename) ? this.databaseRestoreFilename : this.databaseFilename;
        let filebuffer: Buffer;
        try {
            filebuffer = fs.readFileSync(fileToOpen);
        } catch (e) {
            debugLog('Failed to read database file — attempting auto-recovery:', e);
            this.db = null;
            // Skip straight to recovery
            this.recoverFromBackup(SQL);
            return;
        }

        try {
            this.db = new SQL.Database(filebuffer);
            this.db.handleError = this.handleError;
        } catch (e) {
            debugLog('Failed to open database file — attempting auto-recovery:', e);
            this.db = null;
        }

        // Check integrity after opening (or recover if open failed)
        if (!this.db || !this.checkIntegrity()) {
            debugLog('Database corruption detected on open — attempting auto-recovery');
            this.close();
            this.recoverFromBackup(SQL);
        }

        if (this.databaseRestoreFilename) {
            this.save();
        }
    }

    /** Run PRAGMA integrity_check and return true if the database is OK */
    checkIntegrity(): boolean {
        if (!this.db) return false;
        try {
            const result = this.db.exec('PRAGMA integrity_check;');
            if (!result || result.length === 0) return false;
            const rows = result[0].values;
            if (rows.length === 0) return false;
            const status = String(rows[0][0]);
            const ok = status === 'ok';
            if (!ok) {
                debugLog('integrity_check returned:', status);
            }
            return ok;
        } catch (e) {
            debugLog('integrity_check failed:', e);
            return false;
        }
    }

    /**
     * Attempt to recover from a backup file.
     * Returns true if recovery succeeded (the .bak file was valid and was
     * copied over the corrupted main file).
     */
    autoRecover(): boolean {
        if (fs.existsSync(this.databaseBackupFilename)) {
            try {
                // Verify the backup is itself valid before using it
                const backupBuffer = fs.readFileSync(this.databaseBackupFilename);
                const tempDb = new this._SQL.Database(backupBuffer);
                const result = tempDb.exec('PRAGMA integrity_check;');
                tempDb.close();
                const ok = result && result.length > 0 && String(result[0].values[0][0]) === 'ok';
                if (ok) {
                    // Backup is good — copy it over the corrupted main file
                    fs.copyFileSync(this.databaseBackupFilename, this.databaseFilename);
                    return true;
                }
                debugLog('Backup file is also corrupted');
            } catch (e) {
                debugLog('Failed to read/verify backup:', e);
            }
        }
        return false;
    }

    /** Create a brand-new empty database, discarding the corrupted one */
    freshDatabase(SQL: SqlJsStatic): void {
        this.close();
        this.initTables(SQL);
        this.runMigrations();
        this.save();
    }

    handleError(e: Error): void {
        debugLog('sql.js error:', e.message || e);
    }

    close(): void {
        if (this.db) this.db.close();
        this.db = null;
    }

    isOpen(): boolean {
        return (this.db != null);
    }

    save(): void {
        if (!this.db) {
            debugLog('save() called but database is not open');
            return;
        }
        try {
            const data = this.db.export();
            const buffer = Buffer.from(data);
            // Create a rolling backup before overwriting the main file
            if (fs.existsSync(this.databaseFilename)) {
                try {
                    fs.copyFileSync(this.databaseFilename, this.databaseBackupFilename);
                } catch (e) {
                    debugLog('Failed to create backup:', e);
                }
            }
            const tmpPath = this.databaseFilename + '.tmp';
            fs.writeFileSync(tmpPath, buffer);
            fs.renameSync(tmpPath, this.databaseFilename);
        } catch (e) {
            debugLog('save() failed:', e);
            // Attempt to clean up the temp file if rename failed
            try { fs.unlinkSync(this.databaseFilename + '.tmp'); } catch (_) { /* ignore */ }
        }
    }

    /** Schedule a save that coalesces rapid successive calls (debounced). */
    savePending(): void {
        if (!this.db) return;
        if (this._saveTimer !== null) return; // already scheduled
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            this.save();
        }, this._saveDelay);
    }

    /**
     * One-time upgrade: move legacy in-DB base64 media rows to file-backed
     * storage. Per row: write -> verify byte-equality -> drain the row.
     * Aborts on first failure leaving everything consistent; retried on next
     * launch. Yields between batches so large libraries don't block startup.
     */
    async migrateMediaToDisk(): Promise<void> {
        if (!this.mediaDirectory || !this.db) return;

        const rows = this.query({ stmt: 'select MD5, CONTENTS from PROJECTFILES', values: [] });
        if (rows.length === 0) return;

        debugLog(`media migration: moving ${rows.length} item(s) to ${this.mediaDirectory}`);
        // Rotate .bak before touching anything
        this.save();

        let migrated = 0;
        for (const row of rows) {
            const name = String(row.MD5 ?? '');
            const b64 = String(row.CONTENTS ?? '');
            try {
                const target = this.mediaFilePath(name);
                if (!target) throw new Error('unsafe media name');
                const buffer = Buffer.from(b64, 'base64');
                const tmpPath = target + '.tmp';
                fs.writeFileSync(tmpPath, buffer);
                fs.renameSync(tmpPath, target);
                const readBack = fs.readFileSync(target).toString('base64');
                if (readBack !== b64) throw new Error('verification mismatch after copy');
                this.deleteProjectFileRow(name);
                migrated++;
                if (migrated % 20 === 0) {
                    await new Promise((resolve) => setImmediate(resolve));
                }
            } catch (e) {
                debugLog(`media migration: stopped after ${migrated} item(s), will retry on next launch:`, e);
                this.save();
                return;
            }
        }
        this.save();
        debugLog(`media migration complete: ${migrated} item(s) now file-backed`);
    }

    /** Flush any pending debounced save immediately (used on close/crash). */
    flushPendingSave(): void {
        if (this._saveTimer !== null) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
            this.save();
        }
    }

    /** True when a media name is still referenced by any project/shape/background row */
    private mediaInUse(name: string): boolean {
        const queryFindFileInProjects: QueryJson = {
            stmt: 'select ID from PROJECTS where json like ? or thumbnail like ?',
            values: [`%${name}%`, `%${name}%`],
        };
        if (this.query(queryFindFileInProjects).length > 0) {
            return true;
        }

        const queryFindFileInUsershapes: QueryJson = {
            stmt: 'select MD5 from USERSHAPES where MD5 = ? or ALTMD5 = ?',
            values: [name, name],
        };
        if (this.query(queryFindFileInUsershapes).length > 0) {
            return true;
        }

        const queryFindFileInUserbkgs: QueryJson = {
            stmt: 'select MD5 from USERBKGS where MD5 = ? or ALTMD5 = ?',
            values: [name, name],
        };
        if (this.query(queryFindFileInUserbkgs).length > 0) {
            return true;
        }

        return false;
    }

    cleanProjectFiles(fileType: string): void {
        if (fileType === 'wav') {
            fileType = 'webm';
        }

        // Candidates come from legacy PROJECTFILES rows AND file-backed media
        const names = new Set<string>();

        const queryListAllFilesWithExtension: QueryJson = {
            stmt: `select MD5 FROM PROJECTFILES WHERE MD5 LIKE ?`,
            values: [`%.${fileType}`],
        };
        for (const row of this.query(queryListAllFilesWithExtension)) {
            if (row.MD5) names.add(row.MD5 as string);
        }

        if (this.mediaDirectory) {
            try {
                for (const f of fs.readdirSync(this.mediaDirectory)) {
                    if (f.endsWith(`.${fileType}`)) names.add(f);
                }
            } catch (e) {
                debugLog('cleanProjectFiles: could not list media dir:', e);
            }
        }

        for (const name of names) {
            if (!this.mediaInUse(name)) {
                this.removeProjectFile(name);
            }
        }
        this.savePending();
    }

    /**
     * Enable file-backed media storage. Must be called before the first
     * media write; reads transparently fall back to legacy PROJECTFILES rows.
     */
    setMediaDirectory(dir: string): void {
        fs.mkdirSync(dir, { recursive: true });
        this.mediaDirectory = dir;
    }

    /**
     * Resolve a media name to a path inside mediaDirectory, rejecting any
     * name that tries to traverse out of it. Returns null when file-backed
     * storage is off or the name is unsafe.
     */
    private mediaFilePath(name: string): string | null {
        if (!this.mediaDirectory || !name) return null;
        const base = path.basename(name);
        if (base !== name || base === '.' || base === '..') return null;
        return path.join(this.mediaDirectory, base);
    }

    removeProjectFile(fileMD5: string): void {
        // Remove the file copy (if file-backed) and any legacy DB row.
        const filePath = this.mediaFilePath(fileMD5);
        if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {
                debugLog('removeProjectFile: failed to unlink', fileMD5, e);
            }
        }
        this.deleteProjectFileRow(fileMD5);
    }

    /** Delete only the PROJECTFILES row (shared by removal and migration). */
    private deleteProjectFileRow(fileMD5: string): void {
        this.stmt({ stmt: 'delete from PROJECTFILES where MD5 = ?', values: [fileMD5] });
    }

    /**
     * Read a media asset as base64. File-backed copy first (async, does not
     * block the main process); legacy in-DB base64 row otherwise.
     */
    async readProjectFile(fileMD5: string): Promise<string | null> {
        const filePath = this.mediaFilePath(fileMD5);
        if (filePath) {
            try {
                return (await fs.promises.readFile(filePath)).toString('base64');
            } catch (e) {
                const code = (e as NodeJS.ErrnoException)?.code;
                if (code !== 'ENOENT') {
                    debugLog('readProjectFile: failed to read file, falling back to DB:', fileMD5, e);
                }
            }
        }
        const json: QueryJson = {};
        json.stmt = 'select CONTENTS from PROJECTFILES where MD5 = ?';
        json.values = [fileMD5];

        const rows = this.query(json);

        if (rows.length > 0) {
            return rows[0].CONTENTS as string;
        }
        return null;
    }

    saveToProjectFiles(fileMD5: string, content: string): boolean {
        // File-backed write first; falls back to a DB row on any failure so a
        // broken media directory can never lose data.
        const filePath = this.mediaFilePath(fileMD5);
        if (filePath) {
            try {
                const buffer = Buffer.from(content, 'base64');
                const tmpPath = filePath + '.tmp';
                fs.writeFileSync(tmpPath, buffer);
                fs.renameSync(tmpPath, filePath);
                return true;
            } catch (e) {
                debugLog('saveToProjectFiles: file write failed, storing in DB instead:', fileMD5, e);
            }
        }

        const json: QueryJson = {};
        json.values = [fileMD5, content];
        json.stmt = 'insert or replace into PROJECTFILES (MD5, CONTENTS) values (?, ?)';
        const insertSQLResult = this.stmt(json);

        if (insertSQLResult < 0) {
            debugLog('saveToProjectFiles: stmt failed for', fileMD5);
            return false;
        }

        this.savePending();

        return true;
    }

    initTables(SQL?: SqlJsStatic): void {
        if (!this.db) {
            if (!SQL) throw new Error('SQL instance required to create database');
            this.db = new SQL.Database();
            this.db.handleError = this.handleError;
        }

        this.db.exec('CREATE TABLE IF NOT EXISTS PROJECTS (ID INTEGER PRIMARY KEY AUTOINCREMENT, CTIME DATETIME DEFAULT CURRENT_TIMESTAMP, MTIME DATETIME, ALTMD5 TEXT, POS INTEGER, NAME TEXT, JSON TEXT, THUMBNAIL TEXT, OWNER TEXT, GALLERY TEXT, DELETED TEXT, VERSION TEXT)\n');
        this.db.exec('CREATE TABLE IF NOT EXISTS USERSHAPES (ID INTEGER PRIMARY KEY AUTOINCREMENT, CTIME DATETIME DEFAULT CURRENT_TIMESTAMP, MD5 TEXT, ALTMD5 TEXT, WIDTH TEXT, HEIGHT TEXT, EXT TEXT, NAME TEXT, OWNER TEXT, SCALE TEXT, VERSION TEXT)\n');
        this.db.exec('CREATE TABLE IF NOT EXISTS USERBKGS (ID INTEGER PRIMARY KEY AUTOINCREMENT, CTIME DATETIME DEFAULT CURRENT_TIMESTAMP, MD5 TEXT, ALTMD5 TEXT, WIDTH TEXT, HEIGHT TEXT, EXT TEXT, OWNER TEXT,  VERSION TEXT)\n');
        this.db.exec('CREATE TABLE IF NOT EXISTS PROJECTFILES (MD5 TEXT PRIMARY KEY, CONTENTS TEXT)\n');
    }

    runMigrations(): void {
        if (!this.db) return;
        try {
            this.db.exec('ALTER TABLE PROJECTS ADD COLUMN ISGIFT INTEGER DEFAULT 0');
        } catch (e) {
            debugLog('failed to migrate tables', e);
        }
    }

    stmt(json: QueryJson): number {
        if (!this.db) {
            debugLog('stmt() called but database is not open');
            return -1;
        }
        try {
            const stmtStr = json.stmt!;
            const values = json.values;

            const statement = this.db.prepare(stmtStr, values);

            try {
                while (statement.step()) statement.get();

                const isInsert = stmtStr.trim().toLowerCase().startsWith('insert');
                if (isInsert) {
                    const result = this.db.exec('select last_insert_rowid();');
                    const lastRowId = (result && result.length > 0 && result[0].values.length > 0)
                        ? (result[0].values[0][0] as number)
                        : 0;
                    if (lastRowId === 0) {
                        debugLog('WARNING: INSERT returned rowid 0 — the insert may have failed:', stmtStr, values);
                    }
                    return lastRowId;
                } else {
                    const result = this.db.exec('select changes();');
                    const changes = (result && result.length > 0 && result[0].values.length > 0)
                        ? (result[0].values[0][0] as number)
                        : 0;
                    return changes;
                }
            } finally {
                statement.free();
            }
        } catch (e) {
            debugLog('stmt failed:', e instanceof Error ? e.message : e, json);
            return -1;
        }
    }

    query(json: QueryJson): Record<string, unknown>[] {
        if (!this.db) {
            debugLog('query() called but database is not open');
            return [];
        }
        try {
            const stmtStr = json.stmt!;
            const values = json.values;

            const statement = this.db.prepare(stmtStr, values);

            try {
                const rows: Record<string, unknown>[] = [];
                while (statement.step()) {
                    rows.push(statement.getAsObject());
                }

                return rows;
            } finally {
                statement.free();
            }
        } catch (e) {
            debugLog('query failed', json, e);
            return [];
        }
    }
}
