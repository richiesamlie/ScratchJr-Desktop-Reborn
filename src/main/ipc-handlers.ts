/**
 * IPC handlers module for ScratchJr Desktop.
 *
 * Registers all ipcMain.handle/ipcMain.on handlers for the renderer bridge.
 * Each handler receives its dependencies via the register() function.
 */

import fs from 'fs';
import path from 'path';
import { app, dialog, ipcMain, BrowserWindow, IpcMainInvokeEvent, IpcMainEvent } from 'electron';
import {
    DEBUG, debugLog
} from './logging';
import { parseDbIntent } from '../lib/db-intents';
import type { ScratchJRDataStore } from './data-store';

/**
 * Distinct failure codes for the legacy numeric statement protocol.
 * Success stays >= 0 (rowid / changes); every failure mode gets its own
 * negative code so the renderer can tell them apart and log the reason.
 */
export const DB_ERRORS = {
    DB_CLOSED: -1,
    INTENT_REJECTED: -2,
    SQL_ERROR: -3,
} as const;
// Parse --lang=xx from command line (e.g. ScratchJr --lang=fr)
const cliLangArg = process.argv.find((a) => a.startsWith('--lang='));
const cliLang = cliLangArg ? cliLangArg.split('=')[1] : null;

export function register(getDataStore: () => ScratchJRDataStore, getWindow: () => BrowserWindow | null): void {
    ipcMain.handle('io_getIsDebug', () => DEBUG);
    ipcMain.handle('io_getLang', () => cliLang);

    ipcMain.on('debugWriteLog', (_event: IpcMainEvent, args: unknown) => {
        debugLog(args);
    });

    ipcMain.handle('io_cleanassets', (_event: IpcMainInvokeEvent, fileType: string) => {
        try {
            const dataStore = getDataStore();
            const db = dataStore.databaseManager;
            if (db) {
                db.cleanProjectFiles(fileType);
            }
        } catch (err) {
            debugLog('cleanAssets error:', err);
        }
        return true;
    });

    ipcMain.handle('io_setfile', (_event: IpcMainInvokeEvent, arg: { name: string; contents: string }) => {
        try {
            const db = getDataStore().databaseManager;
            if (!db) return false;
            if (db.saveToProjectFiles(arg.name, arg.contents)) {
                return arg.name;
            }
            return -1;
        } catch (e) {
            debugLog('io_setfile error:', e);
            return false;
        }
    });

    // io_getfile and io_getmedia read the same project media payload.
    const readProjectMedia = async (_event: IpcMainInvokeEvent, name: string): Promise<string | null> => {
        try {
            const db = getDataStore().databaseManager;
            if (!db) return null;
            return await db.readProjectFile(name);
        } catch (e) {
            debugLog('io_getfile/io_getmedia error:', e);
            return null;
        }
    };
    ipcMain.handle('io_getfile', readProjectMedia);
    ipcMain.handle('io_getmedia', readProjectMedia);

    ipcMain.handle('io_getmediadata', (_event: IpcMainInvokeEvent, key: string, offset: number, length: number) => {
        const mediaString = getDataStore().getCachedMedia(key);
        if (mediaString) {
            try {
                return mediaString.substring(offset, offset + length);
            } catch (e) {
                debugLog('error parsing media');
                return null;
            }
        }
        return null;
    });

    ipcMain.handle('io_getmediadone', (_event: IpcMainInvokeEvent, key: string) => {
        getDataStore().removeFromMediaCache(key);
        return true;
    });

    ipcMain.handle('io_getmedialen', async (_event: IpcMainInvokeEvent, file: string, key: string) => {
        const dataStore = getDataStore();
        const db = dataStore.databaseManager;
        if (!db) return 0;
        const encodedStr = await db.readProjectFile(file);
        if (encodedStr) {
            dataStore.cacheMedia(key, encodedStr);
        }
        return (encodedStr) ? encodedStr.length : 0;
    });

    ipcMain.handle('io_setmedia', (_event: IpcMainInvokeEvent, base64ContentStr: string, ext: string) => {
        try {
            const dataStore = getDataStore();
            const filename = `${dataStore.getMD5(base64ContentStr)}.${ext}`;
            const db = dataStore.databaseManager;
            if (!db) return null;
            db.saveToProjectFiles(filename, base64ContentStr);
            return filename;
        } catch (e) {
            debugLog('io_setmedia error:', e);
            return null;
        }
    });

    ipcMain.handle('io_setmedianame', (_event: IpcMainInvokeEvent, encodedData: string, key: string, ext: string) => {
        try {
            const filename = `${key}.${ext}`;
            const db = getDataStore().databaseManager;
            if (!db) return null;
            db.saveToProjectFiles(filename, encodedData);
            return filename;
        } catch (e) {
            debugLog('io_setmedianame error:', e);
            return null;
        }
    });

    ipcMain.handle('io_getsettings', () => {
        try {
            const documents = app.getPath('documents');
            return `${path.join(documents, 'ScratchJR')},false,YES,YES`;
        } catch (e) {
            debugLog('io_getsettings', e);
            return null;
        }
    });

    ipcMain.handle('io_getmd5', (_event: IpcMainInvokeEvent, data: string) => {
        try {
            return getDataStore().getMD5(data);
        } catch (e) {
            debugLog('io_getmd5', e);
            return null;
        }
    });

    ipcMain.handle('io_remove', (_event: IpcMainInvokeEvent, filename: string) => {
        try {
            const db = getDataStore().databaseManager;
            if (!db) return false;
            db.removeProjectFile(filename);
            return true;
        } catch (e) {
            debugLog('io_remove error:', e);
            return false;
        }
    });

    ipcMain.handle('io_gettextresource', (_event: IpcMainInvokeEvent, filename: string) => {
        const filePath = getDataStore().safeGetFilenameInAppDirectory(filename, true);
        if (filePath) {
            return fs.readFileSync(filePath, 'utf8');
        }
        debugLog('io_gettextresource: File could not be resolved.', filename);
        return null;
    });

    ipcMain.handle('io_getAudioData', async (_event: IpcMainInvokeEvent, audioName: string) => {
        const dataStore = getDataStore();
        let filePath = dataStore.safeGetFilenameInAppDirectory(audioName, false);
        if (!filePath) {
            filePath = dataStore.safeGetFilenameInAppDirectory('sounds/' + audioName, false);
        }
        if (!filePath) {
            const db = dataStore.databaseManager;
            const projectDBFile = db ? await db.readProjectFile(audioName) : null;
            return projectDBFile;
        }
        const data = fs.readFileSync(filePath);
        if (!data) {
            return null;
        }
        const dataStr = Buffer.from(data).toString('base64');
        const extension = path.extname(filePath);
        if (extension === '.mp3') {
            return 'data:audio/mp3;base64,' + dataStr;
        } else if (extension === '.wav') {
            return 'data:audio/wav;base64,' + dataStr;
        }
        return null;
    });

    ipcMain.handle('database_stmt', (_event: IpcMainInvokeEvent, json: string) => {
        try {
            // Renderer sends a structured intent; SQL is composed here from
            // allowlisted tables/columns only. No renderer SQL text exists.
            const intent = parseDbIntent(JSON.parse(json));
            if (intent.kind !== 'write') throw new Error('database_stmt only accepts write ops');
            const dataStore = getDataStore();
            const db = dataStore?.databaseManager;
            if (!db || !db.isOpen()) {
                debugLog('database_stmt called but database is not open');
                return DB_ERRORS.DB_CLOSED;
            }
            const result = db.stmt({ stmt: intent.sql, values: intent.values as Array<string | number | boolean | null> });
            // Only persist to disk if the statement succeeded
            if (result >= 0) {
                db.savePending();
            }
            return result;
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            const code = message.startsWith('unknown ') || message.includes('db intent') || message.includes('intent')
                ? DB_ERRORS.INTENT_REJECTED : DB_ERRORS.SQL_ERROR;
            debugLog('database_stmt blocked (' + code + '):', message);
            return code;
        }
    });

    ipcMain.handle('database_query', (_event: IpcMainInvokeEvent, json: string) => {
        try {
            const intent = parseDbIntent(JSON.parse(json));
            if (intent.kind !== 'select') throw new Error('database_query only accepts select ops');
            const dataStore = getDataStore();
            const db = dataStore?.databaseManager;
            if (!db || !db.isOpen()) {
                debugLog('database_query called but database is not open');
                return '[]';
            }
            return JSON.stringify(db.query({ stmt: intent.sql, values: intent.values as Array<string | number | boolean | null> }));
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            debugLog('database_query blocked:', message);
            return '[]';
        }
    });

    // ---- Project (.sjr) export ----
    ipcMain.handle('save-sjr-file', async (_event: IpcMainInvokeEvent, arg: { dataB64: string; suggestedName: string }) => {
        try {
            if (!arg?.dataB64) return null;
            const safeName = (arg.suggestedName || 'project').replace(/[\\/:*?"<>|]/g, '_');
            const win = getWindow();
            const res = await dialog.showSaveDialog(win!, {
                defaultPath: safeName.toLowerCase().endsWith('.sjr') ? safeName : safeName + '.sjr',
                filters: [{ name: 'ScratchJr project', extensions: ['sjr'] }],
            });
            if (res.canceled || !res.filePath) return null;
            await fs.promises.writeFile(res.filePath, Buffer.from(arg.dataB64, 'base64'));
            debugLog('project exported:', res.filePath);
            return res.filePath;
        } catch (e) {
            debugLog('save-sjr-file failed:', e);
            return null;
        }
    });
    // ---- Stage image export ----
    ipcMain.handle('save-stage-png', async (_event: IpcMainInvokeEvent, arg: { dataUrl: string; suggestedName: string }) => {
        try {
            const m = /^data:image\/png;base64,(.+)$/.exec(arg?.dataUrl ?? '');
            if (!m) return null;
            const safeName = (arg.suggestedName || 'stage').replace(/[\\/:*?"<>|]/g, '_');
            const win = getWindow();
            const res = await dialog.showSaveDialog(win!, {
                defaultPath: safeName.endsWith('.png') ? safeName : safeName + '.png',
                filters: [{ name: 'PNG image', extensions: ['png'] }],
            });
            if (res.canceled || !res.filePath) return null;
            await fs.promises.writeFile(res.filePath, Buffer.from(m[1], 'base64'));
            debugLog('stage exported:', res.filePath);
            return res.filePath;
        } catch (e) {
            debugLog('save-stage-png failed:', e);
            return null;
        }
    });
    ipcMain.on('app-closed-acked', (_event: IpcMainEvent) => {
        const dataStore = getDataStore();
        if (dataStore.databaseManager) {
            dataStore.databaseManager.flushPendingSave();
            dataStore.databaseManager.save();
            dataStore.databaseManager.close();
        }

        const { saveWindowState, destroyWindow } = require('./window-lifecycle');
        saveWindowState();
        destroyWindow();
        app.exit();
    });
}
