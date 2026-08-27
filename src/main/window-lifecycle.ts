/**
 * Window lifecycle module for ScratchJr Desktop.
 *
 * Manages BrowserWindow creation, security policies, navigation restrictions,
 * permission handlers, close handshake, keyboard shortcuts, and window state persistence.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { app, BrowserWindow, globalShortcut } from 'electron';
import { debugLog } from './logging';
import type { ScratchJRDataStore } from './data-store';
import { isParentFolder } from '../lib/path-utils';

let win: BrowserWindow | null = null;
let dataStoreRef: ScratchJRDataStore | null = null;

const ALLOWED_PERMISSIONS = ['media', 'mediaKeySystem'];

const KEYBOARD_SHORTCUTS: Array<{ key: string; action: string }> = [
    { key: 'CommandOrControl+S', action: 'save' },
    { key: 'CommandOrControl+Z', action: 'undo' },
    { key: 'CommandOrControl+N', action: 'new' },
    { key: 'CommandOrControl+Shift+Z', action: 'redo' },
];

const windowStateFile = path.join(app.getPath('userData'), 'window-state.json');

interface WindowState {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
}

function getWindowState(): WindowState {
    try {
        return JSON.parse(fs.readFileSync(windowStateFile, 'utf8'));
    } catch (e) {
        return { width: 1020, height: 800 };
    }
}

export function saveWindowState(): void {
    if (!win || win.isDestroyed()) return;
    const bounds = win.getBounds();
    try { fs.writeFileSync(windowStateFile, JSON.stringify(bounds)); } catch (e) {
        debugLog('saveWindowState error:', e);
    }
}

export function getWindow(): BrowserWindow | null {
    return win;
}

export function createWindow(dataStore: ScratchJRDataStore): BrowserWindow {
    const state = getWindowState();

    win = new BrowserWindow({
        width: state.width,
        height: state.height,
        x: state.x,
        y: state.y,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, '..', 'preload.js'),
        },
    });

    dataStore.electronBrowserWindow = win;
    dataStoreRef = dataStore;

    win.loadURL('file://' + path.join(__dirname, '..', '..', 'src', 'app', 'index.html'));

    // Security: never allow this renderer to open new windows.
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' as const }));

    // Security: only allow camera and microphone permissions.
    win.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
        if (ALLOWED_PERMISSIONS.includes(permission)) {
            callback(true);
        } else {
            debugLog('Blocked permission request:', permission);
            callback(false);
        }
    });

    // Security: also gate programmatic permission checks.
    win.webContents.session.setPermissionCheckHandler((_webContents, permission, _requestingOrigin) => {
        return ALLOWED_PERMISSIONS.includes(permission);
    });

    // Security: only allow in-app file:// navigations under src/app.
    win.webContents.on('will-navigate', (event, navigationUrl) => {
        const appRoot = path.resolve(path.join(__dirname, '..', '..', 'src', 'app'));
        let targetPath: string | null = null;

        try {
            targetPath = fileURLToPath(navigationUrl);
        } catch (e) {
            targetPath = null;
        }

        if (!targetPath) {
            event.preventDefault();
            debugLog('Blocked navigation (non-file URL):', navigationUrl);
            return;
        }

        const relative = path.relative(appRoot, targetPath);
        const allowed = (relative === '' || isParentFolder(appRoot, targetPath));
        if (!allowed) {
            event.preventDefault();
            debugLog('Blocked navigation (outside app root):', navigationUrl);
        }
    });

    win.on('resize', saveWindowState);
    win.on('move', saveWindowState);

    win.on('close', (e) => {
        e.preventDefault();
        saveWindowState();
        win!.webContents.send('app-close');
        // Fallback: force-quit after 10 seconds if renderer doesn't ack.
        // Save the database synchronously before destroying to prevent data loss.
        setTimeout(() => {
            if (win && !win.isDestroyed()) {
                try {
                    if (dataStoreRef?.databaseManager) {
                        dataStoreRef.databaseManager.flushPendingSave();
                        dataStoreRef.databaseManager.save();
                    }
                } catch (_) { /* best-effort */ }
                win.destroy();
            }
        }, 10000);
    });

    win.webContents.on('did-finish-load', () => {
        console.log('[SCRATCHJR_READY] Renderer loaded successfully');
        globalShortcut.unregisterAll();
        for (const { key, action } of KEYBOARD_SHORTCUTS) {
            globalShortcut.register(key, () => {
                if (win && !win.isDestroyed()) {
                    win.webContents.send('keyboard-shortcut', action);
                }
            });
        }
    });

    return win;
}

export function destroyWindow(): void {
    win = null;
}
