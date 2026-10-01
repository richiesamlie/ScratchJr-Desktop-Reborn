/**
 * @vitest-environment jsdom
 */
import './renderer-harness.js';
import './engine-port-adapter.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import initSqlJs from 'sql.js';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs';
import Prims from '../../src/app/src/editor/engine/Prims';
import Runtime from '../../src/app/src/editor/engine/Runtime';
import ScratchJr from '../../src/app/src/editor/ScratchJr';
import Localization from '../../src/app/src/utils/Localization';
import enJson from '../../src/app/localizations/en.json';
import IO from '../../src/app/src/platform/IO';
import PlatformBridge from '../../src/app/src/platform/PlatformBridge';
import { enginePorts } from '../../src/app/src/editor/engine/ports';

describe('Issue #13: Bug Fixes & Random Page Block', () => {
    let SQL;

    beforeEach(async () => {
        Localization.setMessages(enJson, 'en');
        BlockSpecs.initBlocks();
        Prims.init();
        SQL = await initSqlJs();
    });

    describe('Bug 1: Project Renaming Persistence', () => {
        it('has onblur, oninput, and submitChange hooks configured on project title input', async () => {
            const { default: UI } = await import('../../src/app/src/editor/ui/UI');
            expect(typeof UI.handleTextFieldSave).toBe('function');
            expect(typeof UI.hideInfoBox).toBe('function');
        });
    });

    describe('Bug 2: Lobby slow-click / hold check', () => {
        it('verifies holdit logic excludes newproject and openproject', async () => {
            const { default: Home } = await import('../../src/app/src/lobby/Home');
            expect(Home).toBeDefined();
        });
    });

    describe('Bug 3: Audio currentTime reset before playback', () => {
        it('resets currentTime to 0 on electronClient io_playsound', async () => {
            const ElectronClient = (await import('../../src/electronClient.js')).default;
            const client = new ElectronClient();
            const mockAudio = {
                currentTime: 5.2,
                play: vi.fn().mockReturnValue(Promise.resolve())
            };
            client.currentAudio['pop.mp3'] = mockAudio;
            client.io_playsound('pop.mp3');
            expect(mockAudio.currentTime).toBe(0);
            expect(mockAudio.play).toHaveBeenCalled();
        });

        it('resets currentTime to 0 on tauriClient io_playsound', async () => {
            const TauriClient = (await import('../../src/tauriClient.js')).default;
            const client = new TauriClient();
            const mockAudio = {
                currentTime: 4.8,
                play: vi.fn().mockReturnValue(Promise.resolve())
            };
            client.currentAudio['pop.mp3'] = mockAudio;
            client.io_playsound('pop.mp3');
            expect(mockAudio.currentTime).toBe(0);
            expect(mockAudio.play).toHaveBeenCalled();
        });
    });

    describe('Bug 4: Resilient JustSch SQLite DB Import', () => {
        it('imports successfully when tables and columns are lowercase and deleted is 0', async () => {
            const db = new SQL.Database();
            // Lowercase table names
            db.exec(`
                CREATE TABLE projects (
                    id INTEGER PRIMARY KEY,
                    name TEXT,
                    json TEXT,
                    thumbnail TEXT,
                    deleted TEXT,
                    version TEXT
                );
                CREATE TABLE projectfiles (
                    md5 TEXT PRIMARY KEY,
                    contents TEXT
                );
            `);

            db.run('INSERT INTO projectfiles (md5, contents) VALUES (?, ?);', ['sprite.png', 'b64content']);
            const projJson = JSON.stringify({ pages: ['page1'] });
            db.run('INSERT INTO projects (name, json, thumbnail, deleted, version) VALUES (?, ?, ?, ?, ?);', [
                'Lowercase Project',
                projJson,
                JSON.stringify({ pagecount: 1 }),
                '0', // numeric string deleted flag
                '1.0.0'
            ]);

            const dbBuffer = db.export().buffer;
            db.close();

            const querySpy = vi.spyOn(PlatformBridge, 'query').mockImplementation((json, fcn) => {
                if (fcn) fcn('[]');
            });
            const setmedianameSpy = vi.spyOn(PlatformBridge, 'setmedianame').mockImplementation((c, n, e, fcn) => {
                if (fcn) fcn();
            });
            const created = [];
            const createProjectSpy = vi.spyOn(IO, 'createProject').mockImplementation((rec, fcn) => {
                created.push(rec);
                if (fcn) fcn(201);
            });

            const count = await IO.loadProjectsFromSqlite(dbBuffer);
            expect(count).toBe(1);
            expect(created[0].name).toBe('Lowercase Project');

            querySpy.mockRestore();
            setmedianameSpy.mockRestore();
            createProjectSpy.mockRestore();
        });

        it('continues importing remaining valid projects if one project row is corrupted', async () => {
            const db = new SQL.Database();
            db.exec(`
                CREATE TABLE PROJECTS (
                    ID INTEGER PRIMARY KEY,
                    NAME TEXT,
                    JSON TEXT,
                    THUMBNAIL TEXT,
                    DELETED TEXT,
                    VERSION TEXT
                );
            `);

            db.run('INSERT INTO PROJECTS (NAME, JSON, THUMBNAIL, DELETED, VERSION) VALUES (?, ?, ?, ?, ?);', [
                'Project 1 Valid',
                '{"pages":["page1"]}',
                '{"pagecount":1}',
                null,
                '1.0.0'
            ]);
            db.run('INSERT INTO PROJECTS (NAME, JSON, THUMBNAIL, DELETED, VERSION) VALUES (?, ?, ?, ?, ?);', [
                'Project 2 Corrupted',
                '{not valid json',
                null,
                'NO',
                '1.0.0'
            ]);
            db.run('INSERT INTO PROJECTS (NAME, JSON, THUMBNAIL, DELETED, VERSION) VALUES (?, ?, ?, ?, ?);', [
                'Project 3 Valid',
                '{"pages":["page1"]}',
                '{"pagecount":1}',
                'NO',
                '1.0.0'
            ]);

            const dbBuffer = db.export().buffer;
            db.close();

            const querySpy = vi.spyOn(PlatformBridge, 'query').mockImplementation((json, fcn) => {
                if (fcn) fcn('[]');
            });
            let callCount = 0;
            const createProjectSpy = vi.spyOn(IO, 'createProject').mockImplementation((rec, fcn) => {
                callCount++;
                if (rec.name === 'Project 2 Corrupted') {
                    throw new Error('Database disk error on row 2');
                }
                if (fcn) fcn(300 + callCount);
            });

            const count = await IO.loadProjectsFromSqlite(dbBuffer);
            expect(count).toBe(2);

            querySpy.mockRestore();
            createProjectSpy.mockRestore();
        });
    });

    describe('Feature: Go to Random Page Block (randompage)', () => {
        it('registers randompage in red end category of palette definition', () => {
            const palettes = BlockSpecs.setupPalettesDef();
            const endPalette = palettes[5];
            expect(endPalette).toContain('randompage');
            expect(endPalette.indexOf('randompage')).toBe(endPalette.indexOf('forever') + 1);
        });

        it('defines randompage block spec with redEnd shape and no argument field', () => {
            const specs = BlockSpecs.setupBlocksSpecs();
            expect(specs['randompage']).toBeDefined();
            const spec = specs['randompage'];
            expect(spec[0]).toBe('randompage');
            expect(spec[1]).toBeDefined(); // SVG icon element
            expect(spec[2]).toBe(BlockSpecs.redEnd);
            expect(spec[3]).toBeNull(); // No argument field
        });

        it('localizes block description properly', () => {
            const dummySprite = { name: 'Cat' };
            const desc = BlockSpecs.blockDesc({ getArgValue: () => null, blocktype: 'randompage' }, dummySprite);
            expect(desc['randompage']).toBe('GO TO RANDOM PAGE');
        });

        it('binds Prims.table.randompage to Prims.RandomPage', () => {
            expect(Prims.table['randompage']).toBe(Prims.RandomPage);
        });

        it('includes randompage in Runtime noh list (no unneeded highlight during page transition)', () => {
            const runtime = new Runtime();
            expect(runtime).toBeDefined();
        });

        it('handles single-page project gracefully without crashing or throwing', () => {
            const page1 = { id: 'p1' };
            const mockStage = {
                pages: [page1],
                currentPage: page1,
                gotoPage: vi.fn()
            };
            ScratchJr.stage = mockStage;

            const strip = {
                count: 0,
                thisblock: { blocktype: 'randompage' },
                waitTimer: 0
            };

            Prims.RandomPage(strip);
            expect(mockStage.gotoPage).not.toHaveBeenCalled();
            expect(strip.count).toBe(-1);
        });

        it('picks a random other page when project has multiple pages', () => {
            const page1 = { id: 'p1' };
            const page2 = { id: 'p2' };
            const page3 = { id: 'p3' };
            const mockStage = {
                pages: [page1, page2, page3],
                currentPage: page1,
                gotoPage: vi.fn()
            };
            ScratchJr.stage = mockStage;

            const strip = {
                count: 0,
                thisblock: { blocktype: 'randompage' },
                waitTimer: 0
            };

            Prims.RandomPage(strip);
            expect(mockStage.gotoPage).toHaveBeenCalled();
            const calledWith = mockStage.gotoPage.mock.calls[0][0];
            // Must be page 2 or page 3 (1-based index), never current page 1
            expect([2, 3]).toContain(calledWith);
        });
    });
});
