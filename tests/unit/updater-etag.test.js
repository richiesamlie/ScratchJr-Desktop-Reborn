import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// updater.ts imports electron (and logging.ts uses app.getPath at module scope)
// vi.hoisted runs before all imports, so the factory and the assertions below
// share one initialized tmpdir binding.
const { tmpDir } = vi.hoisted(() => ({
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    tmpDir: require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), 'updater-test-')),
}));

vi.mock('electron', async () => {
    const { electronUpdaterMock } = await import('./helpers/main-process-env.js');
    return electronUpdaterMock(tmpDir);
});

vi.mock('../../src/main/logging.ts', async () => {
    const { loggingMock } = await import('./helpers/logging-mock.js');
    return loggingMock();
});

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
    globalThis.fetch = async function (url, init) {
        if (typeof url === 'string' && url.includes('version.json')) {
            // Bypass CDN so fallback to GitHub API is tested
            return {
                status: 404,
                ok: false,
                headers: new Map(),
                get () { return null; },
                json: async () => ({}),
            };
        }
        calls.push({ url, init });
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

describe('checkForUpdate conditional requests and CDN', () => {
    it('uses static GitHub Pages CDN version.json when available without calling GitHub API', async () => {
        const cdnManifest = {
            version: '2.0.0',
            release_url: 'https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/tag/v2.0.0',
            notes: 'Major release',
            downloads: {
                'win32-x64-msi': 'https://example.com/ScratchJr.msi',
                'win32-x64': 'https://example.com/ScratchJr-win.zip',
                'darwin-x64': 'https://example.com/ScratchJr-mac.zip',
                'darwin-arm64': 'https://example.com/ScratchJr-mac-arm64.zip',
                'linux-x64': 'https://example.com/ScratchJr-linux.zip',
                'linux-arm64': 'https://example.com/ScratchJr-linux-arm64.zip',
            },
        };

        const calls = [];
        globalThis.fetch = async function (url) {
            calls.push(url);
            if (typeof url === 'string' && url.includes('version.json')) {
                return {
                    status: 200,
                    ok: true,
                    headers: new Map(),
                    get () { return null; },
                    json: async () => cdnManifest,
                };
            }
            throw new Error('Should not reach GitHub API when CDN succeeds');
        };

        const info = await checkForUpdate();
        expect(info.available).toBe(true);
        expect(info.latestVersion).toBe('2.0.0');
        expect(info.releaseNotes).toBe('Major release');
        expect(calls.length).toBe(1);
        expect(calls[0]).toContain('version.json');
    });

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
        globalThis.fetch = async function (url, init) {
            if (typeof url === 'string' && url.includes('version.json')) {
                return {
                    status: 404,
                    ok: false,
                    headers: new Map(),
                    get () { return null; },
                    json: async () => ({}),
                };
            }
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
        globalThis.fetch = async function (url) {
            if (typeof url === 'string' && url.includes('version.json')) {
                return {
                    status: 404,
                    ok: false,
                    headers: new Map(),
                    get () { return null; },
                    json: async () => ({}),
                };
            }
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
