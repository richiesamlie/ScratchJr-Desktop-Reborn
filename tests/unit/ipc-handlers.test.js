import { describe, it, expect, vi, beforeEach } from 'vitest';

const handlers = new Map();
const listeners = new Map();

vi.mock('electron', async () => {
    const { electronMainMock } = await import('./helpers/main-process-env.js');
    const base = electronMainMock({ browserWindowStub: true });
    return {
        ...base,
        ipcMain: {
            handle: vi.fn((channel, fn) => {
                handlers.set(channel, fn);
            }),
            on: vi.fn((channel, fn) => {
                listeners.set(channel, fn);
            }),
        },
        dialog: {
            showSaveDialog: vi.fn(),
        },
    };
});

import { register, DB_ERRORS } from '../../src/main/ipc-handlers.ts';
import { dialog } from 'electron';

describe('Electron IPC Handlers (Task 6.2)', () => {
    let mockDb;
    let mockDataStore;
    let mockWindow;

    beforeEach(() => {
        handlers.clear();
        listeners.clear();
        vi.clearAllMocks();

        mockDb = {
            isOpen: vi.fn(() => true),
            stmt: vi.fn(() => 1),
            query: vi.fn(() => [{ ID: 1, NAME: 'Test' }]),
            savePending: vi.fn(),
            cleanProjectFiles: vi.fn(),
            saveToProjectFiles: vi.fn(() => true),
            readProjectFile: vi.fn(async () => 'base64media'),
            removeProjectFile: vi.fn(),
        };

        mockDataStore = {
            databaseManager: mockDb,
            getMD5: vi.fn((data) => `mock_md5_${data.slice(0, 4)}`),
            safeGetFilenameInAppDirectory: vi.fn((name) => null),
        };

        mockWindow = {
            isDestroyed: () => false,
        };

        register(() => mockDataStore, () => mockWindow);
    });

    it('registers all expected IPC handlers and listeners', () => {
        expect(handlers.has('database_stmt')).toBe(true);
        expect(handlers.has('database_query')).toBe(true);
        expect(handlers.has('io_setfile')).toBe(true);
        expect(handlers.has('io_getfile')).toBe(true);
        expect(handlers.has('io_setmedia')).toBe(true);
        expect(handlers.has('io_setmedianame')).toBe(true);
        expect(handlers.has('io_remove')).toBe(true);
        expect(handlers.has('save-sjr-file')).toBe(true);
        expect(handlers.has('save-stage-png')).toBe(true);
        expect(listeners.has('app-closed-acked')).toBe(true);
    });

    describe('database_stmt handler', () => {
        it('accepts valid write intent and delegates to db.stmt and savePending', async () => {
            const handler = handlers.get('database_stmt');
            const res = await handler({}, {
                op: 'insert',
                table: 'projects',
                row: { name: 'My Project' },
            });
            expect(res).toBe(1);
            expect(mockDb.stmt).toHaveBeenCalled();
            expect(mockDb.savePending).toHaveBeenCalled();
        });

        it('rejects select intents with INTENT_REJECTED code', async () => {
            const handler = handlers.get('database_stmt');
            const res = await handler({}, { op: 'select', table: 'projects' });
            expect(res).toBe(DB_ERRORS.INTENT_REJECTED);
        });

        it('rejects unknown tables and malformed payloads with INTENT_REJECTED code', async () => {
            const handler = handlers.get('database_stmt');
            const res1 = await handler({}, { op: 'insert', table: 'sqlite_master', row: { name: 'hacked' } });
            expect(res1).toBe(DB_ERRORS.INTENT_REJECTED);

            const res2 = await handler({}, 'invalid json {');
            expect(res2).toBe(DB_ERRORS.INTENT_REJECTED);
        });

        it('returns DB_CLOSED code when database is not open', async () => {
            mockDb.isOpen.mockReturnValue(false);
            const handler = handlers.get('database_stmt');
            const res = await handler({}, {
                op: 'insert',
                table: 'projects',
                row: { name: 'P' },
            });
            expect(res).toBe(DB_ERRORS.DB_CLOSED);
        });
    });

    describe('database_query handler', () => {
        it('accepts valid select intent and returns lowercased json rows', async () => {
            const handler = handlers.get('database_query');
            const res = await handler({}, { op: 'select', table: 'projects' });
            expect(JSON.parse(res)).toEqual([{ id: 1, name: 'Test' }]);
        });

        it('rejects write intents and malformed queries by returning empty array', async () => {
            const handler = handlers.get('database_query');
            const res1 = await handler({}, { op: 'insert', table: 'projects', row: { name: 'P' } });
            expect(res1).toBe('[]');

            const res2 = await handler({}, { op: 'select', table: 'unknown_table' });
            expect(res2).toBe('[]');
        });

        it('returns empty array when database is closed', async () => {
            mockDb.isOpen.mockReturnValue(false);
            const handler = handlers.get('database_query');
            const res = await handler({}, { op: 'select', table: 'projects' });
            expect(res).toBe('[]');
        });
    });

    describe('media and file handlers', () => {
        it('io_setfile saves file to databaseManager and returns filename', async () => {
            const handler = handlers.get('io_setfile');
            const res = await handler({}, { name: 'test.svg', contents: 'data' });
            expect(res).toBe('test.svg');
            expect(mockDb.saveToProjectFiles).toHaveBeenCalledWith('test.svg', 'data');
        });

        it('io_getfile and io_getmedia read project file from databaseManager', async () => {
            const getFile = handlers.get('io_getfile');
            const getMedia = handlers.get('io_getmedia');
            expect(await getFile({}, 'cat.svg')).toBe('base64media');
            expect(await getMedia({}, 'cat.svg')).toBe('base64media');
        });

        it('io_setmedia computes md5 filename and saves to databaseManager', async () => {
            const handler = handlers.get('io_setmedia');
            const res = await handler({}, 'svgcontent', 'svg');
            expect(res).toBe('mock_md5_svgc.svg');
            expect(mockDb.saveToProjectFiles).toHaveBeenCalledWith('mock_md5_svgc.svg', 'svgcontent');
        });

        it('io_remove removes project file from databaseManager', async () => {
            const handler = handlers.get('io_remove');
            const res = await handler({}, 'old.svg');
            expect(res).toBe(true);
            expect(mockDb.removeProjectFile).toHaveBeenCalledWith('old.svg');
        });
    });

    describe('export dialog handlers', () => {
        it('save-sjr-file returns null if dataB64 is missing or dialog is canceled', async () => {
            const handler = handlers.get('save-sjr-file');
            expect(await handler({}, null)).toBeNull();

            dialog.showSaveDialog.mockResolvedValueOnce({ canceled: true });
            expect(await handler({}, { dataB64: 'abc', suggestedName: 'myproject' })).toBeNull();
        });

        it('save-stage-png returns null if dataUrl is invalid or dialog is canceled', async () => {
            const handler = handlers.get('save-stage-png');
            expect(await handler({}, { dataUrl: 'invalid', suggestedName: 'stage' })).toBeNull();

            dialog.showSaveDialog.mockResolvedValueOnce({ canceled: true });
            expect(await handler({}, { dataUrl: 'data:image/png;base64,iVBOR', suggestedName: 'stage' })).toBeNull();
        });
    });
});
