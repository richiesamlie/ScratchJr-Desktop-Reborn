// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Events from '../../src/app/src/utils/Events';
import Palette from '../../src/app/src/editor/ui/Palette';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs';
import ScriptsPane from '../../src/app/src/editor/ui/ScriptsPane';
import SoundPicker from '../../src/app/src/editor/ui/SoundPicker';
import Record from '../../src/app/src/editor/ui/Record';
import Paint from '../../src/app/src/painteditor/Paint';
import PaintAction from '../../src/app/src/painteditor/PaintAction';
import { libInit } from '../../src/app/src/utils/lib';

function makePointerEvent(type, props = {}) {
    const evt = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: props.clientX ?? 0,
        clientY: props.clientY ?? 0,
    });
    Object.defineProperty(evt, 'pointerType', { value: props.pointerType ?? 'touch' });
    Object.defineProperty(evt, 'isPrimary', { value: props.isPrimary ?? true });
    if (props.target) {
        Object.defineProperty(evt, 'target', { value: props.target });
    }
    return evt;
}

describe('Windows Tablet Touch & Pointer Support', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="frame" class="frame"></div><div id="paintframe" class="paintframe"></div>';
        libInit();
        Events.clearEvents();
        Events.clearDragAndDrop();
    });

    describe('Events.startDrag pointer handling', () => {
        it('processes primary touch pointermove and pointerup, and ignores non-primary multitouch', () => {
            const target = document.createElement('div');
            const atstart = vi.fn(() => {
                Events.dragcanvas = target;
            });
            const atend = vi.fn();
            const atdrag = vi.fn();
            const atclick = vi.fn();

            const downEvt = makePointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true });
            Events.startDrag(downEvt, target, atstart, atend, atdrag, atclick);

            // Non-primary finger move and lift must be ignored
            window.onpointermove(makePointerEvent('pointermove', { clientX: 100, clientY: 100, pointerType: 'touch', isPrimary: false }));
            expect(atstart).not.toHaveBeenCalled();

            window.onpointerup(makePointerEvent('pointerup', { clientX: 100, clientY: 100, pointerType: 'touch', isPrimary: false }));
            expect(atclick).not.toHaveBeenCalled();
            expect(atend).not.toHaveBeenCalled();
            expect(typeof window.onpointermove).toBe('function');

            // Primary finger moves beyond threshold and lifts
            window.onpointermove(makePointerEvent('pointermove', { clientX: 50, clientY: 50, pointerType: 'touch', isPrimary: true }));
            expect(atstart).toHaveBeenCalledTimes(1);
            expect(atdrag).toHaveBeenCalledTimes(1);

            window.onpointerup(makePointerEvent('pointerup', { clientX: 60, clientY: 60, pointerType: 'touch', isPrimary: true }));
            expect(atend).toHaveBeenCalledTimes(1);
            expect(atclick).not.toHaveBeenCalled();
            expect(window.onpointermove).toBeNull();
        });

        it('completes drop via atend on pointercancel when drag is already active, and cancels without click when not dragged', () => {
            const target = document.createElement('div');
            const atstart = vi.fn(() => {
                Events.dragcanvas = target;
            });
            const atend = vi.fn();
            const atdrag = vi.fn();
            const atclick = vi.fn();

            // Case 1: pointercancel before drag threshold -> neither click nor end should fire
            const down1 = makePointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true });
            Events.startDrag(down1, target, atstart, atend, atdrag, atclick);
            window.onpointercancel(makePointerEvent('pointercancel', { clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true }));
            expect(atclick).not.toHaveBeenCalled();
            expect(atend).not.toHaveBeenCalled();
            expect(Events.dragthumbnail).toBeNull();

            // Case 2: pointercancel after drag started -> atend must run to clean up dragged element
            const down2 = makePointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerType: 'touch', isPrimary: true });
            Events.startDrag(down2, target, atstart, atend, atdrag, atclick);
            window.onpointermove(makePointerEvent('pointermove', { clientX: 60, clientY: 60, pointerType: 'touch', isPrimary: true }));
            expect(Events.dragged).toBe(true);

            window.onpointercancel(makePointerEvent('pointercancel', { clientX: 60, clientY: 60, pointerType: 'touch', isPrimary: true }));
            expect(atend).toHaveBeenCalledTimes(1);
            expect(Events.dragcanvas).toBeNull();
        });
    });

    describe('Palette touch & sound slot guards', () => {
        it('ignores recordslot and addsoundslot in palette.onpointerdown so addsoundslot does not trigger microphone recording', () => {
            BlockSpecs.categories = [];
            const parent = document.getElementById('frame');
            Palette.setup(parent);
            const pal = document.getElementById('palette');
            Palette.drawRecordSound(60, 60, 10);
            Palette.drawAddSound(60, 60, 80);

            const addSoundSlot = document.getElementById('addsoundslot');
            const recordSpy = vi.spyOn(Record, 'appear').mockImplementation(() => {});
            const soundPickerSpy = vi.spyOn(SoundPicker, 'open').mockImplementation(() => {});
            const paletteDownSpy = vi.spyOn(Palette, 'paletteMouseDown');

            const ptrEvt = makePointerEvent('pointerdown', {
                clientX: 90,
                clientY: 20,
                pointerType: 'touch',
                isPrimary: true,
                target: addSoundSlot,
            });
            pal.onpointerdown(ptrEvt);

            expect(paletteDownSpy).not.toHaveBeenCalled();
            expect(recordSpy).not.toHaveBeenCalled();

            paletteDownSpy.mockRestore();
            recordSpy.mockRestore();
            soundPickerSpy.mockRestore();
        });
    });

    describe('ScriptsPane background touch panning', () => {
        it('binds pointermove, pointerup, and pointercancel in setDragBackgroundEvents', () => {
            const onMove = vi.fn();
            const onUp = vi.fn();
            ScriptsPane.setDragBackgroundEvents(onMove, onUp);

            // Non-primary ignored
            window.onpointermove(makePointerEvent('pointermove', { pointerType: 'touch', isPrimary: false }));
            expect(onMove).not.toHaveBeenCalled();

            // Primary handled
            window.onpointermove(makePointerEvent('pointermove', { pointerType: 'touch', isPrimary: true }));
            expect(onMove).toHaveBeenCalledTimes(1);

            window.onpointerup(makePointerEvent('pointerup', { pointerType: 'touch', isPrimary: true }));
            expect(onUp).toHaveBeenCalledTimes(1);
        });
    });

    describe('Paint Editor pointer & input focus handling', () => {
        it('allows native focus on INPUT elements and #painttextbackdrop buttons without calling preventDefault', () => {
            const paintFrame = document.getElementById('paintframe');
            const nameInput = document.createElement('input');
            nameInput.name = 'name';
            nameInput.onmousedown = () => {};
            paintFrame.appendChild(nameInput);

            const textBackdrop = document.createElement('div');
            textBackdrop.id = 'painttextbackdrop';
            textBackdrop.onmousedown = (e) => e.stopPropagation();
            const doneBtn = document.createElement('button');
            textBackdrop.appendChild(doneBtn);
            paintFrame.appendChild(textBackdrop);

            Paint.init(800, 600);
            const detectSpy = vi.spyOn(Paint, 'detectGesture').mockImplementation(() => {});
            vi.spyOn(Paint, 'clearWorkspace').mockImplementation(() => {});
            vi.spyOn(Paint, 'initSprite').mockImplementation(() => {});

            Paint.open(false, undefined, 'spr1', 'Cat', 0.5, 100, 100);

            const inputEvt = makePointerEvent('pointerdown', {
                pointerType: 'touch',
                isPrimary: true,
                target: nameInput,
            });
            window.onpointerdown(inputEvt);
            expect(inputEvt.defaultPrevented).toBe(false);
            expect(detectSpy).not.toHaveBeenCalled();

            const modalBtnEvt = makePointerEvent('pointerdown', {
                pointerType: 'touch',
                isPrimary: true,
                target: doneBtn,
            });
            window.onpointerdown(modalBtnEvt);
            expect(modalBtnEvt.defaultPrevented).toBe(false);
            expect(detectSpy).not.toHaveBeenCalled();

            detectSpy.mockRestore();
        });

        it('PaintAction.setEvents processes primary touch pointermove and pointerup and ignores non-primary', () => {
            const moveSpy = vi.spyOn(PaintAction, 'mouseMove').mockImplementation(() => {});
            const upSpy = vi.spyOn(PaintAction, 'mouseUp').mockImplementation(() => {});

            PaintAction.setEvents();

            window.onpointermove(makePointerEvent('pointermove', { pointerType: 'touch', isPrimary: false }));
            expect(moveSpy).not.toHaveBeenCalled();

            window.onpointermove(makePointerEvent('pointermove', { pointerType: 'touch', isPrimary: true }));
            expect(moveSpy).toHaveBeenCalledTimes(1);

            window.onpointerup(makePointerEvent('pointerup', { pointerType: 'touch', isPrimary: false }));
            expect(upSpy).not.toHaveBeenCalled();

            window.onpointerup(makePointerEvent('pointerup', { pointerType: 'touch', isPrimary: true }));
            expect(upSpy).toHaveBeenCalledTimes(1);

            PaintAction.clearEvents();
            expect(window.onpointermove).toBeNull();
            expect(window.onpointerup).toBeNull();
            expect(window.onpointercancel).toBeNull();

            moveSpy.mockRestore();
            upSpy.mockRestore();
        });
    });
});
