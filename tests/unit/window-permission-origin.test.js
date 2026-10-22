import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import { pathToFileURL } from 'url';

vi.mock('electron', async () => {
    const { electronMainMock } = await import('./helpers/main-process-env.js');
    return electronMainMock({ browserWindowStub: true });
});

import { isAppFileUrl, ALLOWED_PERMISSIONS } from '../../src/main/window-lifecycle.ts';

describe('Window Permission Origin Guard (Kid-Safety)', () => {
    const appDir = path.resolve(__dirname, '../../src/app');
    const appIndexUrl = pathToFileURL(path.join(appDir, 'index.html')).href;
    const appSubfileUrl = pathToFileURL(path.join(appDir, 'editor.html')).href;

    it('grants permission for the app file URL and generic file origin', () => {
        expect(isAppFileUrl(appIndexUrl)).toBe(true);
        expect(isAppFileUrl(appSubfileUrl)).toBe(true);
        expect(isAppFileUrl('file://')).toBe(true);
        expect(isAppFileUrl('file:///')).toBe(true);
    });

    it('denies permission for external web URLs', () => {
        expect(isAppFileUrl('https://example.com/')).toBe(false);
        expect(isAppFileUrl('http://malicious.site/phish')).toBe(false);
        expect(isAppFileUrl('http://localhost:3000/')).toBe(false);
        expect(isAppFileUrl('blob:https://example.com/uuid')).toBe(false);
    });

    it('denies permission for arbitrary file paths outside src/app', () => {
        const outsideUrl = pathToFileURL(path.resolve(__dirname, '../../package.json')).href;
        expect(isAppFileUrl(outsideUrl)).toBe(false);
        expect(isAppFileUrl('file:///etc/shadow')).toBe(false);
        expect(isAppFileUrl('file:///C:/Windows/System32/calc.exe')).toBe(false);
    });

    it('denies permission for empty, null or undefined origins', () => {
        expect(isAppFileUrl('')).toBe(false);
        expect(isAppFileUrl(undefined)).toBe(false);
    });

    it('restricts allowed permissions strictly to camera and mic media types', () => {
        expect(ALLOWED_PERMISSIONS).toContain('media');
        expect(ALLOWED_PERMISSIONS).toContain('microphone');
        expect(ALLOWED_PERMISSIONS).toContain('camera');
        expect(ALLOWED_PERMISSIONS).not.toContain('geolocation');
        expect(ALLOWED_PERMISSIONS).not.toContain('notifications');
    });
});
