import './helpers/browser-globals.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import initSqlJs from 'sql.js';
import IO from '../../src/app/src/platform/IO';
import PlatformBridge from '../../src/app/src/platform/PlatformBridge';

describe('Legacy JustSch SQLite Project Import', () => {
    let SQL;

    beforeEach(async () => {
        SQL = await initSqlJs();
    });

    it('successfully imports projects and media from a legacy SQLite database', async () => {
        // Build mock legacy SQLite database matching JustSch schema
        const db = new SQL.Database();
        db.exec(`
            CREATE TABLE PROJECTS (
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
                DELETED TEXT,
                VERSION TEXT
            );
            CREATE TABLE PROJECTFILES (
                MD5 TEXT PRIMARY KEY,
                CONTENTS TEXT
            );
        `);

        // Insert legacy asset into PROJECTFILES
        const testAssetMD5 = 'test_cat.png';
        const testAssetB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        db.run('INSERT INTO PROJECTFILES (MD5, CONTENTS) VALUES (?, ?);', [testAssetMD5, testAssetB64]);

        // Insert legacy project
        const projectJson = JSON.stringify({
            pages: ['page1'],
            page1: {
                sprites: ['sprite1'],
                sprite1: { type: 'sprite', md5: testAssetMD5, name: 'Cat' }
            }
        });
        const projectThumb = JSON.stringify({ pagecount: 1, md5: testAssetMD5 });
        db.run('INSERT INTO PROJECTS (NAME, JSON, THUMBNAIL, DELETED, VERSION) VALUES (?, ?, ?, ?, ?);', [
            'JustSch Legacy Project',
            projectJson,
            projectThumb,
            'NO',
            '1.0.0'
        ]);

        const dbBuffer = db.export().buffer;
        db.close();

        const querySpy = vi.spyOn(PlatformBridge, 'query').mockImplementation((json, fcn) => {
            if (fcn) fcn('[]');
        });
        const mediaSaved = [];
        const setmedianameSpy = vi.spyOn(PlatformBridge, 'setmedianame').mockImplementation((contents, name, ext, fcn) => {
            mediaSaved.push({ name, ext, contents });
            if (fcn) fcn();
        });

        const createdProjects = [];
        const createProjectSpy = vi.spyOn(IO, 'createProject').mockImplementation((record, fcn) => {
            createdProjects.push(record);
            if (fcn) fcn(101);
        });

        const count = await IO.loadProjectsFromSqlite(dbBuffer);

        expect(count).toBe(1);
        expect(mediaSaved.length).toBe(1);
        expect(mediaSaved[0].name).toBe('test_cat');
        expect(mediaSaved[0].ext).toBe('png');
        expect(mediaSaved[0].contents).toBe(testAssetB64);

        expect(createdProjects.length).toBe(1);
        expect(createdProjects[0].name).toBe('JustSch Legacy Project');
        expect(createdProjects[0].json).toBe(projectJson);
        expect(createdProjects[0].thumbnail).toBe(projectThumb);

        querySpy.mockRestore();
        setmedianameSpy.mockRestore();
        createProjectSpy.mockRestore();
    });

    it('rejects an invalid database without PROJECTS table', async () => {
        const db = new SQL.Database();
        db.exec('CREATE TABLE OTHER (ID INT);');
        const dbBuffer = db.export().buffer;
        db.close();

        await expect(IO.loadProjectsFromSqlite(dbBuffer)).rejects.toThrow(
            'Not a valid ScratchJr database (missing PROJECTS table).'
        );
    });
});
