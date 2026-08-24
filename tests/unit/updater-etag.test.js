import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// updater.ts imports electron (and logging.ts uses app.getPath at module scope)
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'updater-test-'));
vi.mock('electron', () => ({
    app: {
        getVersion: vi.fn(() => '1.6.2'),
        getPath: vi.fn(() => tmpDir),
        isPackaged: false,
    },
    shell: { openExternal: vi.fn() },
    BrowserWindow: vi.fn(),
}));

vi.mock('../../src/main/logging.ts', () => ({
    DEBUG_DATABASE: false,
    DEBUG_CLEANASSETS: false,
    DEBUG: false,
    DEBUG_FILEIO: false,
    DEBUG_NYI: false,
    DEBUG_LOAD_DEVTOOLS: false,
    DEBUG_RESOURCEIO: false,
    debugLog: vi.fn(),
    logFile: { write: vi.fn(), end: vi.fn() },
}));

import { checkForUpdate } from '../../src/main/updater.ts';

const URL = 'https://example.com/dl';
const RELEASE = {
    tag_name: 'v1.6.2',
    body: 'notes',
    // All platforms, matching real release payloads: the updater picks its
    // asset by process.platform/arch, so CI runners on any OS must find one.
    assets: [
        { name: 'ScratchJr-win32-x64.zip', browser_download_url: URL },
        { name: 'ScratchJr-darwin-x64.zip', browser_download_url: URL },
        { name: 'ScratchJr-darwin-arm64.zip', browser_download_url: URL },
        { name: 'ScratchJr-linux-x64.zip', browser_download_url: URL },
        { name: 'ScratchJr-linux-arm64.zip', browser_download_url: URL },
    ],
};

function mockFetchOnce (status, body, headers = {}) {
    const calls = [];
    globalThis.fetch = async function (_url, init) {
        calls.push({ init });
        return {
            status,
            ok: status >= 200 && status < 300,
            headers: new Map(Object.entries(headers)),
            get (k) { return headers[k.toLowerCase()] ?? null; },
            json: async () => body,
        };
    };
    return calls;
}

beforeEach(() => {
    try { fs.rmSync(path.join(tmpDir, 'update-cache.json'), { force: true }); } catch (_) {}
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('checkForUpdate conditional requests', () => {
    it('stores the etag after a 200 and reports up-to-date for same version', async () => {
        const fetchMock = mockFetchOnce(200, RELEASE, { etag: '"abc123"' });

        const info = await checkForUpdate();

        expect(info.available).toBe(false);
        expect(info.latestVersion).toBe('1.6.2');
        expect(info.downloadUrl).toBe('https://example.com/dl');

        // ETag persisted for the next round-trip
        const cachePath = path.join(tmpDir, 'update-cache.json');
        const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        expect(cache.etag).toBe('"abc123"');
        expect(cache.release.tag_name).toBe('v1.6.2');
        expect(fetchMock.length).toBe(1);
    });

    it('sends If-None-Match on the next check and reuses cached release on 304', async () => {
        // Seed the cache with a newer release so "available" flips true.
        const cachePath = path.join(tmpDir, 'update-cache.json');
        fs.writeFileSync(cachePath, JSON.stringify({
            etag: '"seeded"',
            release: { ...RELEASE, tag_name: 'v9.9.9' },
        }));

        let capturedHeaders = {};
        const calls = [];
        globalThis.fetch = async function (_url, init) {
            calls.push(1);
            capturedHeaders = (init && init.headers) || {};
            return {
                status: 304,
                ok: false,
                headers: new Map(),
                get () { return null; },
                json: async () => ({}),
            };
        };

        const info = await checkForUpdate();

        expect(capturedHeaders['If-None-Match']).toBe('"seeded"');
        // 304 used the cached release without a body
        expect(info.latestVersion).toBe('9.9.9');
        expect(info.available).toBe(true);
        expect(calls.length).toBe(1);
    });

    it('treats a rate-limited 403 as no-update without crashing', async () => {
        globalThis.fetch = async function () {
            return {
                status: 403,
                ok: false,
                headers: new Map([['x-ratelimit-remaining', '0']]),
                get (k) { return k === 'x-ratelimit-remaining' ? '0' : null; },
                json: async () => ({ message: 'API rate limit exceeded' }),
            };
        };

        const info = await checkForUpdate();
        expect(info.available).toBe(false);
        expect(info.downloadUrl).toBe('');
    });

    it('recovers when the cache file is corrupt', async () => {
        fs.writeFileSync(path.join(tmpDir, 'update-cache.json'), '{not json');
        const fetchMock = mockFetchOnce(200, RELEASE, { etag: '"fresh"' });
        const info = await checkForUpdate();
        expect(info.available).toBe(false);
        expect(fetchMock.length).toBe(1);
    });
});
