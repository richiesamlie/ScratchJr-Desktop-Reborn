// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Record from '../../src/app/src/editor/ui/Record';
import ScratchJr from '../../src/app/src/editor/ScratchJr';
import PlatformBridge from '../../src/app/src/platform/PlatformBridge';
import { gn, libInit } from '../../src/app/src/utils/lib';

describe('Record Dialog & Audio Import', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="frame" class="frame"></div><div id="backdrop" class="modal-backdrop fade" style="display: none;"></div>';
        libInit();
        PlatformBridge.waitForInterface(() => {});
        ScratchJr.stopStrips = () => {};
        ScratchJr.getSprite = () => ({ sounds: [] });
    });

    it('mounts recorddialog to document root outside #frame to prevent stacking context trap', () => {
        Record.init();
        const dialog = gn('recorddialog');
        const frame = gn('frame');
        expect(dialog).not.toBeNull();
        expect(dialog.parentElement).toBe(document.body);
        expect(frame.contains(dialog)).toBe(false);
    });

    it('contains both recorddone and recordimport buttons with title and touch handlers', () => {
        Record.init();
        const dialog = gn('recorddialog');
        const okbut = dialog.querySelector('.recorddone');
        const importbut = dialog.querySelector('.recordimport');
        expect(okbut).not.toBeNull();
        expect(importbut).not.toBeNull();
        expect(importbut.getAttribute('title')).toBe('Import audio file');
        expect(typeof okbut.onmousedown).toBe('function');
        expect(typeof okbut.ontouchend).toBe('function');
        expect(typeof importbut.onmousedown).toBe('function');
        expect(typeof importbut.ontouchend).toBe('function');
    });

    it('appear() shows dialog and backdrop and wires backdrop dismiss', () => {
        Record.init();
        const bd = gn('backdrop');
        const dlg = gn('recorddialog');
        const killSpy = vi.spyOn(Record, 'saveSoundAndClose');
        Record.appear();
        expect(bd.className).toContain('in');
        expect(bd.style.display).toBe('block');
        expect(dlg.className).toContain('in');
        expect(typeof bd.onmousedown).toBe('function');
        expect(typeof bd.ontouchend).toBe('function');

        bd.onmousedown(new MouseEvent('mousedown'));
        expect(killSpy).toHaveBeenCalled();
        killSpy.mockRestore();
    });

    it('disappear() starts fade out and unbinds backdrop handlers', () => {
        Record.init();
        Record.appear();
        const bd = gn('backdrop');
        const dlg = gn('recorddialog');
        Record.disappear();
        expect(dlg.className).toContain('out');
        expect(bd.onmousedown).toBeNull();
        expect(bd.ontouchend).toBeNull();
    });

    it('importAudio creates a file picker accepting audio files', () => {
        const appendSpy = vi.spyOn(document.body, 'appendChild');
        Record.importAudio();
        const inputEl = appendSpy.mock.calls
            .map(call => call[0])
            .find(el => el && el.tagName === 'INPUT' && el.type === 'file');
        expect(inputEl).toBeDefined();
        expect(inputEl.accept).toContain('audio/*');
        expect(inputEl.accept).toContain('audio/mp3');
        expect(inputEl.accept).toContain('audio/wav');
        expect(inputEl.accept).toContain('audio/ogg');
        expect(inputEl.accept).toContain('audio/webm');
        appendSpy.mockRestore();
    });

    it('Palette recordslot attaches click and touch handlers to open Record dialog', async () => {
        const { default: Palette } = await import('../../src/app/src/editor/ui/Palette');
        const pal = document.createElement('div');
        pal.id = 'palette';
        document.body.appendChild(pal);

        Palette.drawRecordSound(80, 80, 100);
        const slot = document.getElementById('recordslot');
        expect(slot).not.toBeNull();
        expect(slot.style.cursor).toBe('pointer');
        expect(typeof slot.onmousedown).toBe('function');
        expect(typeof slot.ontouchend).toBe('function');

        const appearSpy = vi.spyOn(Record, 'appear');
        slot.onmousedown(new MouseEvent('mousedown'));
        expect(appearSpy).toHaveBeenCalled();
        appearSpy.mockRestore();
    });
});
