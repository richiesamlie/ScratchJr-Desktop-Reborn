import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock electron and logging before importing updater.ts
vi.mock('electron', async () => {
    const { electronUpdaterMock } = await import('./helpers/main-process-env.js');
    return electronUpdaterMock();
});

vi.mock('../../src/main/logging.ts', async () => {
    const { loggingMock } = await import('./helpers/logging-mock.js');
    return loggingMock();
});

import { shell } from 'electron';
import { safeExternalUrl, openExternalUrl, checkForUpdate } from '../../src/main/updater.ts';

describe('updater URL validation (safeExternalUrl)', () => {
    const fallback = 'https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest';

    it('rejects non-https, credentialed, mismatched repo, or malicious host URLs and returns fallback', () => {
        expect(safeExternalUrl('file:///c:/x', fallback)).toBe(fallback);
        expect(safeExternalUrl('smb://h/s', fallback)).toBe(fallback);
        expect(safeExternalUrl('http://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases', fallback)).toBe(fallback);
        expect(safeExternalUrl('https://evil.example/x', fallback)).toBe(fallback);
        expect(safeExternalUrl('https://github.com.evil.example/richiesamlie/ScratchJr-Desktop-Reborn/x', fallback)).toBe(fallback);
        expect(safeExternalUrl('https://user:pw@github.com/richiesamlie/ScratchJr-Desktop-Reborn/x', fallback)).toBe(fallback);
        expect(safeExternalUrl('https://github.com/other/repo/x', fallback)).toBe(fallback);
        expect(safeExternalUrl(null, fallback)).toBe(fallback);
        expect(safeExternalUrl(undefined, fallback)).toBe(fallback);
        expect(safeExternalUrl(12345, fallback)).toBe(fallback);
        expect(safeExternalUrl({}, fallback)).toBe(fallback);
        expect(safeExternalUrl('://bad-url', fallback)).toBe(fallback);
        expect(safeExternalUrl('not a url', fallback)).toBe(fallback);
    });

    it('returns the URL unchanged for valid HTTPS GitHub release or asset URLs', () => {
        const validReleaseAsset = 'https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/download/v2.14.0/ScratchJr-electron-win32-x64.zip';
        expect(safeExternalUrl(validReleaseAsset, fallback)).toBe(validReleaseAsset);

        const validCdnAsset = 'https://objects.githubusercontent.com/github-production-release-asset-2e65be/123/file.zip';
        expect(safeExternalUrl(validCdnAsset, fallback)).toBe(validCdnAsset);

        const validRepoUrl = 'https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest';
        expect(safeExternalUrl(validRepoUrl, fallback)).toBe(validRepoUrl);
    });
});

describe('openExternalUrl security choke point', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not call shell.openExternal for unsafe URLs', () => {
        openExternalUrl('file:///c:/malicious/script.bat');
        openExternalUrl('https://malicious.example.com/exploit');
        openExternalUrl('smb://server/share');
        expect(shell.openExternal).not.toHaveBeenCalled();
    });

    it('calls shell.openExternal for verified safe GitHub URLs', () => {
        const safeUrl = 'https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest';
        openExternalUrl(safeUrl);
        expect(shell.openExternal).toHaveBeenCalledWith(safeUrl);
    });
});

describe('checkForUpdate CDN manifest download URL sanitization', () => {
    let originalFetch;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    it('falls back to releasePageUrl when CDN manifest contains an unsafe downloadUrl', async () => {
        const maliciousManifest = {
            version: '9.9.9',
            release_url: 'https://evil.example.com/fake-release',
            downloads: {
                'win32-x64-electron-msi': 'file:///c:/windows/system32/calc.exe',
                'win32-x64-msi': 'file:///c:/windows/system32/calc.exe',
                'win32-x64-electron-zip': 'file:///c:/windows/system32/calc.exe',
                'win32-x64': 'file:///c:/windows/system32/calc.exe',
                'darwin-arm64-electron': 'file:///etc/passwd',
                'darwin-arm64': 'file:///etc/passwd',
                'darwin-x64-electron': 'file:///etc/passwd',
                'darwin-x64': 'file:///etc/passwd',
                'linux-arm64-electron': 'file:///bin/sh',
                'linux-arm64': 'file:///bin/sh',
                'linux-x64-electron': 'file:///bin/sh',
                'linux-x64': 'file:///bin/sh',
            },
        };

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => maliciousManifest,
        });

        const info = await checkForUpdate();
        expect(info.available).toBe(true);
        expect(info.downloadUrl).toBe('https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest');
        expect(info.releasePageUrl).toBe('https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest');
    });
});
