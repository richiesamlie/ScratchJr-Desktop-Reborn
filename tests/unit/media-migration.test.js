import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { setupSqliteEnv, cleanupSqliteEnv } from './helpers/main-process-env.js';

// Mirror database-save.test.js mocks
vi.mock('electron', async () => {
    const { electronMainMock } = await import('./helpers/main-process-env.js');
    return electronMainMock();
});

vi.mock('../../src/main/logging.ts', async () => {
    const { loggingMock } = await import('./helpers/logging-mock.js');
    return loggingMock();
});

import { DatabaseManager } from '../../src/main/database.ts';

let tmpDir;
let dbPath;
let mediaDir;
let sqlJs;

beforeEach(async () => {
    ({ tmpDir, dbPath, sqlJs } = await setupSqliteEnv('media-test-'));
    mediaDir = path.join(tmpDir, 'media');
});

afterEach(() => {
    cleanupSqliteEnv(tmpDir);
});

const B64 = Buffer.from('hello scratchjr media').toString('base64');

function seedLegacyRow(mgr, name, b64) {
    mgr.stmt({ stmt: 'insert or replace into PROJECTFILES (MD5, CONTENTS) values (?, ?)', values: [name, b64] });
}

describe('file-backed media storage', () => {
    it('writes new media to files, not PROJECTFILES rows', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        expect(mgr.saveToProjectFiles('abc.png', B64)).toBe(true);
        expect(fs.existsSync(path.join(mediaDir, 'abc.png'))).toBe(true);
        expect(fs.existsSync(path.join(mediaDir, 'abc.png.tmp'))).toBe(false);
        expect(await mgr.readProjectFile('abc.png')).toBe(B64);
        expect(mgr.query({ stmt: 'select count(*) as n from PROJECTFILES', values: [] })[0].n).toBe(0);
        mgr.close();
    });

    it('reads legacy DB rows when no file exists (fallback)', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        seedLegacyRow(mgr, 'legacy.svg', B64);
        expect(await mgr.readProjectFile('legacy.svg')).toBe(B64);
        mgr.close();
    });

    it('prefers the file over a stale legacy row', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        seedLegacyRow(mgr, 'both.png', Buffer.from('old-row').toString('base64'));
        mgr.saveToProjectFiles('both.png', B64); // goes to file
        expect(await mgr.readProjectFile('both.png')).toBe(B64);
        mgr.close();
    });

    it('falls back to DB row when file write fails (unwritable dir replaced by file)', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        fs.mkdirSync(mediaDir);
        // A directory where the media FILE would go makes renameSync fail
        fs.mkdirSync(path.join(mediaDir, 'blocked.wav'));
        mgr.setMediaDirectory(mediaDir);
        // setMediaDirectory mkdir recursive is fine; write of blocked.wav.tmp fails
        // because target parent contains a directory named blocked.wav? No — tmp is
        // separate. Force failure via a directory named exactly like the tmp path.
        fs.mkdirSync(path.join(mediaDir, 'blocked.wav.tmp'));
        expect(mgr.saveToProjectFiles('blocked.wav', B64)).toBe(true); // fell back to row
        expect(await mgr.readProjectFile('blocked.wav')).toBe(B64); // served from row
        mgr.close();
    });

    it('remove deletes both the file and any legacy row', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        seedLegacyRow(mgr, 'gone.png', B64);
        mgr.saveToProjectFiles('gone2.png', B64);
        mgr.removeProjectFile('gone.png');
        mgr.removeProjectFile('gone2.png');
        expect(fs.existsSync(path.join(mediaDir, 'gone2.png'))).toBe(false);
        expect(await mgr.readProjectFile('gone.png')).toBe(null);
        expect(await mgr.readProjectFile('gone2.png')).toBe(null);
        mgr.close();
    });

    it('rejects traversal names', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        expect(mgr.saveToProjectFiles('../escape.png', B64)).toBe(true); // falls back to DB
        expect(fs.existsSync(path.join(tmpDir, 'escape.png'))).toBe(false);
        expect(await mgr.readProjectFile('../../secret')).toBe(null);
        mgr.close();
    });
});

describe('migrateMediaToDisk()', () => {
    it('copies rows to files with byte verification and drains the table', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        const b64s = [B64, Buffer.from('second asset').toString('base64')];
        seedLegacyRow(mgr, 'a.png', b64s[0]);
        seedLegacyRow(mgr, 'b.svg', b64s[1]);

        await mgr.migrateMediaToDisk();

        expect(fs.readFileSync(path.join(mediaDir, 'a.png')).toString('base64')).toBe(b64s[0]);
        expect(fs.readFileSync(path.join(mediaDir, 'b.svg')).toString('base64')).toBe(b64s[1]);
        expect(mgr.query({ stmt: 'select count(*) as n from PROJECTFILES', values: [] })[0].n).toBe(0);
        // reads now served from files
        expect(await mgr.readProjectFile('a.png')).toBe(b64s[0]);
        mgr.close();
    });

    it('is idempotent when nothing is left to migrate', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        await mgr.migrateMediaToDisk(); // empty table — no-op
        seedLegacyRow(mgr, 'x.png', B64);
        await mgr.migrateMediaToDisk();
        await mgr.migrateMediaToDisk(); // already drained
        expect(await mgr.readProjectFile('x.png')).toBe(B64);
        expect(mgr.query({ stmt: 'select count(*) as n from PROJECTFILES', values: [] })[0].n).toBe(0);
        mgr.close();
    });
});

describe('cleanProjectFiles with file-backed media', () => {
    it('cleans unused files on disk but keeps referenced ones', async () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.setMediaDirectory(mediaDir);
        mgr.saveToProjectFiles('used.png', B64);
        mgr.saveToProjectFiles('orphan.png', B64);
        // reference used.png from a project json
        mgr.stmt({
            stmt: "insert into PROJECTS (NAME, JSON) values ('p', ?)",
            values: ['{"assets":["used.png"]}'],
        });
        mgr.cleanProjectFiles('png');
        expect(fs.existsSync(path.join(mediaDir, 'used.png'))).toBe(true);
        expect(fs.existsSync(path.join(mediaDir, 'orphan.png'))).toBe(false);
        mgr.close();
    });
});
