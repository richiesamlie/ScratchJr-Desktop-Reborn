import fs from 'fs';
import path from 'path';
import os from 'os';
import { vi } from 'vitest';

// Electron mock for main-process tests: modules under src/main pull pieces of
// this API graph at import time. browserWindowStub adds the isDestroyed/
// webContents shape database-save.test.js needs.
export function electronMainMock ({ browserWindowStub = false } = {}) {
    return {
        app: { isPackaged: false, getPath: () => '/tmp', quit: vi.fn() },
        ipcMain: { handle: vi.fn(), on: vi.fn() },
        BrowserWindow: browserWindowStub
            ? vi.fn(() => ({ isDestroyed: vi.fn(() => false), webContents: { send: vi.fn(), on: vi.fn() } }))
            : vi.fn(),
        contextBridge: { exposeInMainWorld: vi.fn() },
        ipcRenderer: { invoke: vi.fn(), send: vi.fn(), on: vi.fn() },
        globalShortcut: { registerAll: vi.fn(), unregisterAll: vi.fn() },
        dialog: { showMessageBox: vi.fn(), showErrorBox: vi.fn() },
        webFrame: { setVisualZoomLevelLimits: vi.fn() },
    };
}

// Slimmer electron surface for updater tests: app.getVersion drives the
// update check and shell.openExternal is the only other API touched.
export function electronUpdaterMock (getPathValue = '/tmp') {
    return {
        app: {
            getVersion: vi.fn(() => '1.6.2'),
            getPath: vi.fn(() => getPathValue),
            isPackaged: false,
        },
        shell: { openExternal: vi.fn() },
        BrowserWindow: vi.fn(),
    };
}

// tmpdir + sql.js bootstrap shared by the DatabaseManager suites.
export async function setupSqliteEnv (prefix) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqlJs = await require('sql.js')();
    return { tmpDir, dbPath: path.join(tmpDir, 'test.sqllite'), sqlJs };
}

export function cleanupSqliteEnv (tmpDir) {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) { /* ignore */ }
}
