/**
 * Window lifecycle module for ScratchJr Desktop.
 *
 * Manages BrowserWindow creation, security policies, navigation restrictions,
 * permission handlers, close handshake, keyboard shortcuts, and window state persistence.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { app, BrowserWindow } from 'electron';
import { debugLog } from './logging';
import type { ScratchJRDataStore } from './data-store';
import { isParentFolder } from '../lib/path-utils';

export function isAppFileUrl(urlOrOrigin?: string): boolean {
    if (!urlOrOrigin) return false;
    if (urlOrOrigin === 'file://' || urlOrOrigin === 'file:///') return true;
    try {
        const targetPath = fileURLToPath(urlOrOrigin);
        const appRoot = path.resolve(path.join(__dirname, '..', '..', 'src', 'app'));
        const relative = path.relative(appRoot, targetPath);
        return relative === '' || isParentFolder(appRoot, targetPath);
    } catch {
        return false;
    }
}

let win: BrowserWindow | null = null;
let dataStoreRef: ScratchJRDataStore | null = null;

export const ALLOWED_PERMISSIONS = [
    'media',
    'mediaKeySystem',
    'microphone',
    'camera',
    'audioCapture',
    'videoCapture',
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

    // Security: only allow camera and microphone permissions from the app's own file origin.
    win.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
        const requestingUrl = (details && details.requestingUrl) || (webContents && webContents.getURL ? webContents.getURL() : '');
        if (ALLOWED_PERMISSIONS.includes(permission) && isAppFileUrl(requestingUrl)) {
            callback(true);
        } else {
            debugLog('Blocked permission request:', permission, requestingUrl);
            callback(false);
        }
    });

    // Security: also gate programmatic permission checks to the app's own file origin.
    win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        const requestingUrl = (details && details.requestingUrl) || requestingOrigin || (webContents && webContents.getURL ? webContents.getURL() : '');
        return ALLOWED_PERMISSIONS.includes(permission) && isAppFileUrl(requestingUrl);
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

    // Window-scoped keyboard shortcuts (never intercept background apps)
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type !== 'keyDown') return;
        const isCmdOrCtrl = process.platform === 'darwin' ? input.meta : input.control;
        if (!isCmdOrCtrl) return;

        const key = input.key.toLowerCase();
        if (key === 's' && !input.shift && !input.alt) {
            event.preventDefault();
            win?.webContents.send('keyboard-shortcut', 'save');
        } else if (key === 'o' && !input.shift && !input.alt) {
            event.preventDefault();
            win?.webContents.send('import-project-request');
        } else if (key === 'z' && !input.shift && !input.alt) {
            event.preventDefault();
            win?.webContents.send('keyboard-shortcut', 'undo');
        } else if ((key === 'z' && input.shift) || (key === 'y' && !input.shift)) {
            event.preventDefault();
            win?.webContents.send('keyboard-shortcut', 'redo');
        } else if (key === 'n' && !input.shift && !input.alt) {
            event.preventDefault();
            win?.webContents.send('keyboard-shortcut', 'new');
        }
    });

    win.webContents.on('did-finish-load', () => {
        console.log('[SCRATCHJR_READY] Renderer loaded successfully');
    });

    return win;
}

export function destroyWindow(): void {
    win = null;
}
