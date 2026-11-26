// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

describe('Tauri Client Host Interface and Error Contract', () => {
    let invokeMock;

    beforeEach(async () => {
        vi.useFakeTimers();
        invokeMock = vi.fn();
        globalThis.window.__TAURI__ = {
            core: {
                invoke: invokeMock,
            },
        };

        // Dynamically import tauriClient after mocking window.__TAURI__
        await import('../../src/tauriClient.js');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('re-throws when io_setmedia fails', async () => {
        invokeMock.mockRejectedValueOnce(new Error('Disk full'));
        const client = globalThis.window.tablet;

        await expect(client.io_setmedia('b64data', 'png')).rejects.toThrow('Disk full');
    });

    it('re-throws when io_setmedianame fails', async () => {
        invokeMock.mockRejectedValueOnce(new Error('Write permission denied'));
        const client = globalThis.window.tablet;

        await expect(client.io_setmedianame('b64data', 'character1', 'svg')).rejects.toThrow('Write permission denied');
    });

    it('re-throws when io_setfile fails', async () => {
        invokeMock.mockRejectedValueOnce(new Error('IO failure'));
        const client = globalThis.window.tablet;

        await expect(client.io_setfile('project.json', 'b64content')).rejects.toThrow('IO failure');
    });

    it('times out when database_query hangs beyond timeout', async () => {
        // Return a promise that never resolves
        invokeMock.mockReturnValue(new Promise(() => {}));
        const client = globalThis.window.tablet;

        const queryPromise = client.database_query({ op: 'select', table: 'projects' }, 100);

        // Fast-forward past the 100ms timeout
        vi.advanceTimersByTime(150);

        await expect(queryPromise).rejects.toThrow('Tauri invoke timed out: database_query');
    });

    it('times out when database_stmt hangs beyond timeout', async () => {
        invokeMock.mockReturnValue(new Promise(() => {}));
        const client = globalThis.window.tablet;

        const stmtPromise = client.database_stmt({ op: 'update', table: 'projects', id: '1' }, 100);

        vi.advanceTimersByTime(150);

        await expect(stmtPromise).rejects.toThrow('Tauri invoke timed out: database_stmt');
    });

    it('resolves database_query normally when invoke finishes before timeout', async () => {
        invokeMock.mockResolvedValueOnce([{ id: 1, name: 'Project 1' }]);
        const client = globalThis.window.tablet;

        const result = await client.database_query({ op: 'select', table: 'projects' }, 5000);
        expect(result).toEqual([{ id: 1, name: 'Project 1' }]);
    });

    it('recordsound_recordclose("YES") awaits waitForStop before persisting recording via io_setmedianame', async () => {
        const client = globalThis.window.tablet;
        let stopped = false;
        let resolveStop;
        const stopPromise = new Promise((r) => { resolveStop = r; });

        const captureStub = {
            waitForStop: vi.fn(() => stopPromise),
            captureRecordingAsBlob: vi.fn(() => (stopped ? new Blob(['audio-bytes'], { type: 'audio/webm' }) : null)),
            getId: vi.fn(() => 'rec-tauri-1'),
            stopRecord: vi.fn(() => Promise.resolve()),
        };
        client.audioCaptureElement = captureStub;
        invokeMock.mockResolvedValueOnce('rec-tauri-1.webm');

        const OrigFileReader = globalThis.FileReader;
        globalThis.FileReader = class {
            readAsDataURL() {
                this.result = 'data:audio/webm;base64,YXVkaW8=';
                if (this.onload) this.onload();
            }
        };

        try {
            const closePromise = client.recordsound_recordclose('YES');
            expect(captureStub.waitForStop).toHaveBeenCalledTimes(1);
            expect(captureStub.captureRecordingAsBlob).not.toHaveBeenCalled();

            stopped = true;
            resolveStop();
            await closePromise;

            expect(captureStub.captureRecordingAsBlob).toHaveBeenCalledTimes(1);
            expect(invokeMock).toHaveBeenCalledWith('io_setmedianame', {
                encodedData: 'data:audio/webm;base64,YXVkaW8=',
                key: 'rec-tauri-1',
                ext: 'webm',
            });
        } finally {
            globalThis.FileReader = OrigFileReader;
            client.audioCaptureElement = null;
        }
    });

    it('recordsound_recordclose("NO") calls stopRecord', async () => {
        const client = globalThis.window.tablet;
        const captureStub = {
            stopRecord: vi.fn(() => Promise.resolve('stopped')),
        };
        client.audioCaptureElement = captureStub;

        try {
            const res = await client.recordsound_recordclose('NO');
            expect(captureStub.stopRecord).toHaveBeenCalledTimes(1);
            expect(res).toBe('stopped');
        } finally {
            client.audioCaptureElement = null;
        }
    });

    it('wires Tauri window/menu events and falls back to sendAppClosedAcked when unregistered', () => {
        const listeners = {};
        const client = globalThis.window.tablet;
        client.appCloseCallback = undefined;
        client.importProjectRequestCallback = undefined;
        client.exportProjectRequestCallback = undefined;
        client.exportStageRequestCallback = undefined;
        client.databaseRestoredCallback = undefined;

        globalThis.window.__TAURI__.event = {
            listen: vi.fn((eventName, handler) => {
                listeners[eventName] = handler;
                return Promise.resolve(() => {});
            }),
        };

        client.attachTauriEvents();
        expect(Object.keys(listeners)).toEqual([
            'scratchjr:app-close',
            'scratchjr:import-project',
            'scratchjr:export-project',
            'scratchjr:export-stage',
            'scratchjr:database-restored',
            'scratchjr:restore-failed',
        ]);

        // Unregistered app-close falls back to sendAppClosedAcked -> invoke('app_closed_acked')
        invokeMock.mockResolvedValueOnce(undefined);
        listeners['scratchjr:app-close']({ payload: null });
        expect(invokeMock).toHaveBeenCalledWith('app_closed_acked', undefined);

        // Registered callbacks receive events
        const onClose = vi.fn();
        const onImport = vi.fn();
        const onExport = vi.fn();
        const onStage = vi.fn();
        const onRestored = vi.fn();
        client.onAppClose(onClose);
        client.onImportProjectRequest(onImport);
        client.onExportProjectRequest(onExport);
        client.onExportStageRequest(onStage);
        client.onDatabaseRestored(onRestored);

        listeners['scratchjr:app-close']({ payload: null });
        listeners['scratchjr:import-project']({ payload: null });
        listeners['scratchjr:export-project']({ payload: null });
        listeners['scratchjr:export-stage']({ payload: null });
        listeners['scratchjr:database-restored']({ payload: null });

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onImport).toHaveBeenCalledTimes(1);
        expect(onExport).toHaveBeenCalledTimes(1);
        expect(onStage).toHaveBeenCalledTimes(1);
        expect(onRestored).toHaveBeenCalledTimes(1);
    });
});

describe('Electron tablet parity with scratchjr bridge', () => {
    let mockBridge;

    beforeAll(async () => {
        mockBridge = {
            io_getLang: vi.fn().mockResolvedValue('fr'),
            io_getAudioData: vi.fn().mockResolvedValue('data:audio/wav;base64,123'),
            sendExportedSjr: vi.fn().mockResolvedValue(true),
            sendExportedPng: vi.fn().mockResolvedValue(true),
            onAppClose: vi.fn(),
            sendAppClosedAcked: vi.fn(),
            onDatabaseRestored: vi.fn(),
            onKeyboardShortcut: vi.fn(),
            onImportProjectRequest: vi.fn(),
            onExportProjectRequest: vi.fn(),
            onExportStageRequest: vi.fn(),
            database_stmt: vi.fn().mockResolvedValue('1'),
            database_query: vi.fn().mockResolvedValue([]),
            io_getsettings: vi.fn().mockResolvedValue({}),
            io_getmedia: vi.fn().mockResolvedValue(''),
            io_setmedia: vi.fn().mockResolvedValue('md5'),
            io_setmedianame: vi.fn().mockResolvedValue(true),
            io_getmd5: vi.fn().mockResolvedValue('hash'),
            io_remove: vi.fn().mockResolvedValue(true),
            io_cleanassets: vi.fn().mockResolvedValue(true),
            io_getfile: vi.fn().mockResolvedValue(''),
            io_gettextresource: vi.fn().mockResolvedValue(''),
            io_setfile: vi.fn().mockResolvedValue(true),
        };
        globalThis.window.scratchjr = mockBridge;
        await import('../../src/electronClient.js');
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('exposes io_getLang and io_getAudioData on window.tablet delegating to bridge', async () => {
        const client = globalThis.window.tablet;
        expect(typeof client.io_getLang).toBe('function');
        expect(typeof client.io_getAudioData).toBe('function');

        const lang = await client.io_getLang();
        expect(lang).toBe('fr');
        expect(mockBridge.io_getLang).toHaveBeenCalled();

        const audio = await client.io_getAudioData('test.wav');
        expect(audio).toBe('data:audio/wav;base64,123');
        expect(mockBridge.io_getAudioData).toHaveBeenCalledWith('test.wav');
    });

    it('exposes export and lifecycle methods on window.tablet delegating to bridge', async () => {
        const client = globalThis.window.tablet;
        await client.sendExportedSjr('data', 'name');
        expect(mockBridge.sendExportedSjr).toHaveBeenCalledWith('data', 'name');

        await client.sendExportedPng('dataUrl', 'name');
        expect(mockBridge.sendExportedPng).toHaveBeenCalledWith('dataUrl', 'name');

        const cb = vi.fn();
        client.onAppClose(cb);
        expect(mockBridge.onAppClose).toHaveBeenCalledWith(cb);

        client.sendAppClosedAcked();
        expect(mockBridge.sendAppClosedAcked).toHaveBeenCalled();
    });

    it('recordsound_recordclose("YES") awaits waitForStop before persisting on Electron', async () => {
        const client = globalThis.window.tablet;
        let stopped = false;
        let resolveStop;
        const stopPromise = new Promise((r) => { resolveStop = r; });

        const captureStub = {
            waitForStop: vi.fn(() => stopPromise),
            captureRecordingAsBlob: vi.fn(() => (stopped ? new Blob(['audio-bytes'], { type: 'audio/webm' }) : null)),
            getId: vi.fn(() => 'rec-electron-1'),
            stopRecord: vi.fn(() => Promise.resolve()),
        };
        client.audioCaptureElement = captureStub;

        const OrigFileReader = globalThis.FileReader;
        globalThis.FileReader = class {
            readAsDataURL() {
                this.result = 'data:audio/webm;base64,ZWxlY3Ryb24=';
                if (this.onload) this.onload();
            }
        };

        try {
            const closePromise = client.recordsound_recordclose('YES');
            expect(captureStub.waitForStop).toHaveBeenCalledTimes(1);
            expect(captureStub.captureRecordingAsBlob).not.toHaveBeenCalled();

            stopped = true;
            resolveStop();
            await closePromise;

            expect(mockBridge.io_setmedianame).toHaveBeenCalledWith(
                'data:audio/webm;base64,ZWxlY3Ryb24=',
                'rec-electron-1',
                'webm'
            );
        } finally {
            globalThis.FileReader = OrigFileReader;
            client.audioCaptureElement = null;
        }
    });

    it('recordsound_recordclose("NO") calls stopRecord on Electron', async () => {
        const client = globalThis.window.tablet;
        const captureStub = {
            stopRecord: vi.fn(() => Promise.resolve('stopped-electron')),
        };
        client.audioCaptureElement = captureStub;

        try {
            const res = await client.recordsound_recordclose('NO');
            expect(captureStub.stopRecord).toHaveBeenCalledTimes(1);
            expect(res).toBe('stopped-electron');
        } finally {
            client.audioCaptureElement = null;
        }
    });
});
