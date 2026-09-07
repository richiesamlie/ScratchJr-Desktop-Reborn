// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Paint from '../../src/app/src/painteditor/Paint';
import Camera from '../../src/app/src/painteditor/Camera';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Camera Tool Interactivity & Controls', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        const backdrop = document.createElement('div');
        backdrop.id = 'backdrop';
        backdrop.className = 'modal-backdrop fade';
        backdrop.style.display = 'none';
        document.body.appendChild(backdrop);
        Camera.active = false;
    });

    it('cameraToolsOn creates interactive controls and binds mouse, pointer, and keyboard listeners', () => {
        Paint.cameraToolsOn();

        const backdrop = document.getElementById('backdrop');
        expect(backdrop.style.display).toBe('block');

        const photocontrols = document.getElementById('photocontrols');
        const captureContainer = document.getElementById('capture-container');
        const captureBtn = document.getElementById('capture');
        const closeBtn = document.getElementById('cameraclose');
        const flipBtn = document.getElementById('cameraflip');

        expect(photocontrols).not.toBeNull();
        expect(captureContainer).not.toBeNull();
        expect(captureBtn).not.toBeNull();
        expect(closeBtn).not.toBeNull();
        expect(flipBtn).not.toBeNull();

        expect(typeof closeBtn.onmousedown).toBe('function');
        expect(typeof closeBtn.onpointerdown).toBe('function');
        expect(typeof captureBtn.onmousedown).toBe('function');
        expect(typeof captureBtn.onpointerdown).toBe('function');
    });

    it('clicking close button exits camera mode cleanly', () => {
        const closeSpy = vi.spyOn(Camera, 'close');
        Paint.cameraToolsOn();
        Camera.active = true;

        const closeBtn = document.getElementById('cameraclose');
        closeBtn.onmousedown(new MouseEvent('mousedown'));

        expect(closeSpy).toHaveBeenCalled();
        expect(document.getElementById('backdrop').style.display).toBe('none');
        expect(document.getElementById('photocontrols')).toBeNull();
        expect(document.getElementById('capture')).toBeNull();
        closeSpy.mockRestore();
    });

    it('pressing Escape key exits camera mode cleanly', () => {
        const closeSpy = vi.spyOn(Camera, 'close');
        Paint.cameraToolsOn();
        Camera.active = true;

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(closeSpy).toHaveBeenCalled();
        expect(document.getElementById('backdrop').style.display).toBe('none');
        closeSpy.mockRestore();
    });

    it('pressing Space key triggers camera snapshot', () => {
        const snapSpy = vi.spyOn(Camera, 'snapShot').mockImplementation(() => {});
        Paint.cameraToolsOn();
        Camera.active = true;

        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' }));

        expect(snapSpy).toHaveBeenCalled();
        snapSpy.mockRestore();
    });

    it('verifies camera control CSS has higher z-index than camera feed overlay', () => {
        const cssContent = fs.readFileSync(
            path.resolve(__dirname, '../../src/app/css/paintlook.css'),
            'utf8'
        );
        expect(cssContent).toContain('.phototopbar');
        expect(cssContent).toContain('z-index: 100005');
        expect(cssContent).toContain('.snapshot-container');
        expect(cssContent).toContain('pointer-events: none');
        expect(cssContent).toContain('.snapshot');
        expect(cssContent).toContain('pointer-events: auto');
    });

    it('Camera.processimage defensively handles error string or null without throwing', () => {
        const closeSpy = vi.spyOn(Camera, 'close');
        Camera.processimage('error getting a still');
        expect(closeSpy).toHaveBeenCalled();
        closeSpy.mockRestore();
    });

    it('Paint.rightPalette renders camera tool when camera is "1", true, or "true"', async () => {
        const { default: PlatformBridge } = await import('../../src/app/src/platform/PlatformBridge');
        Camera.available = true;

        const testValues = ['1', true, 'true'];
        for (const val of testValues) {
            vi.spyOn(PlatformBridge, 'camera', 'get').mockReturnValue(val);

            const container = document.createElement('div');
            Paint.rightPalette(container);
            const fillTools = container.querySelector('#filltools');
            expect(fillTools).not.toBeNull();
            const cameraTool = fillTools?.querySelector('.camera');
            expect(cameraTool).not.toBeNull();
        }
    });

    it('Paint.rightPalette omits camera tool when camera is "0", false, or unavailable', async () => {
        const { default: PlatformBridge } = await import('../../src/app/src/platform/PlatformBridge');
        Camera.available = true;

        const testValues = ['0', false, 'false'];
        for (const val of testValues) {
            vi.spyOn(PlatformBridge, 'camera', 'get').mockReturnValue(val);

            const container = document.createElement('div');
            Paint.rightPalette(container);
            const fillTools = container.querySelector('#filltools');
            expect(fillTools).not.toBeNull();
            const cameraTool = fillTools?.querySelector('.camera');
            expect(cameraTool).toBeNull();
        }
    });
});
