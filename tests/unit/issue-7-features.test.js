// @vitest-environment jsdom
import './renderer-harness.js';
import './engine-port-adapter.js';
import { describe, it, expect, beforeEach } from 'vitest';
import Paint from '../../src/app/src/painteditor/Paint';
import PaintAction from '../../src/app/src/painteditor/PaintAction';
import Ghost from '../../src/app/src/painteditor/Ghost';
import SVGTools from '../../src/app/src/painteditor/SVGTools';
import Transform from '../../src/app/src/painteditor/Transform';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs';
import BlockArg from '../../src/app/src/editor/blocks/BlockArg';
import Prims from '../../src/app/src/editor/engine/Prims';
import Sprite from '../../src/app/src/editor/engine/Sprite';
import ScratchJr from '../../src/app/src/editor/ScratchJr';

describe('Issue #7 Feature Requests Suite', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        const pf = document.createElement('div');
        pf.id = 'paintframe';
        document.body.appendChild(pf);
    });

    describe('Zoom Controls', () => {
        it('has zoom methods and modifies currentZoom', () => {
            expect(typeof Paint.zoomIn).toBe('function');
            expect(typeof Paint.zoomOut).toBe('function');
            expect(typeof Paint.zoomReset).toBe('function');

            // Set up mock maincanvas and workspacebkg for zoom transforms
            const wb = document.createElement('div');
            wb.id = 'workspacebkg';
            const mc = document.createElement('div');
            mc.id = 'maincanvas';
            wb.appendChild(mc);
            document.body.appendChild(wb);

            Paint.zoomReset();
            expect(Paint.currentZoom).toBe(1.0);

            Paint.zoomIn();
            expect(Paint.currentZoom).toBe(1.5);

            Paint.zoomIn();
            expect(Paint.currentZoom).toBe(2.0);

            Paint.zoomOut();
            expect(Paint.currentZoom).toBe(1.5);

            Paint.zoomReset();
            expect(Paint.currentZoom).toBe(1.0);
        });

        it('creates zoom buttons in paint editor topbar', () => {
            const pt = document.createElement('div');
            Paint.createZoomControls(pt);

            const container = pt.querySelector('.zoomcontrols');
            expect(container).not.toBeNull();
            expect(container.querySelector('.zoomin')).not.toBeNull();
            expect(container.querySelector('.zoomout')).not.toBeNull();
            expect(container.querySelector('.zoomreset')).not.toBeNull();
        });
    });

    describe('Color Picker', () => {
        it('includes color picker input in swatch palette', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            Paint.colorPalette(container);

            const input = container.querySelector('.hidden-color-input');
            expect(input).not.toBeNull();
            expect(input.type).toBe('color');

            const visual = container.querySelector('.colorpicker-visual');
            expect(visual).not.toBeNull();
        });
    });

    describe('Eraser Tool', () => {
        it('registers eraser in PaintAction dispatch tables', () => {
            // Check that eraser tool mode exists in right palette list
            const mockPal = document.createElement('div');
            Paint.rightPalette(mockPal);
            const edittools = mockPal.querySelector('#edittools');
            expect(edittools).not.toBeNull();
            const eraserIcon = edittools.querySelector('.tool.eraser');
            expect(eraserIcon).not.toBeNull();
        });

        it('executes freehand eraser dragging to draw erase strokes into transparency mask', () => {
            const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            document.body.appendChild(root);
            Paint.root = root;

            const layer1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            layer1.id = 'layer1';
            root.appendChild(layer1);

            const draglayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            draglayer.id = 'draglayer';
            root.appendChild(draglayer);

            const shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.id = 'test-shape-1';
            layer1.appendChild(shape);

            // Start freehand erasing
            const mockEvtDown = {
                preventDefault: () => {},
                stopPropagation: () => {},
                clientX: 100,
                clientY: 100
            };
            PaintAction.eraserMouseDown(mockEvtDown);

            const mask = document.getElementById('paintEraserMask');
            expect(mask).not.toBeNull();
            expect(layer1.getAttribute('mask')).toBe('url(#paintEraserMask)');

            // Drag eraser
            const mockEvtMove = {
                preventDefault: () => {},
                stopPropagation: () => {},
                clientX: 120,
                clientY: 120
            };
            PaintAction.eraserMouseMove(mockEvtMove);

            const erasePaths = mask.querySelectorAll('path');
            expect(erasePaths.length).toBe(1);
            expect(erasePaths[0].getAttribute('stroke')).toBe('black');
            expect(erasePaths[0].getAttribute('stroke-linecap')).toBe('round');
            expect(erasePaths[0].getAttribute('d')).toContain('L');

            // Finish erasing
            const mockEvtUp = {
                preventDefault: () => {},
                stopPropagation: () => {}
            };
            PaintAction.eraserMouseUp(mockEvtUp);
        });

        it('serializes eraser mask into SVG when saving shape with erase strokes', () => {
            const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            document.body.appendChild(root);
            Paint.root = root;

            const layer1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            layer1.id = 'layer1';
            root.appendChild(layer1);

            const draglayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            draglayer.id = 'draglayer';
            root.appendChild(draglayer);

            const shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            shape.id = 'test-shape-1';
            layer1.appendChild(shape);

            // Draw eraser stroke
            PaintAction.eraserMouseDown({ preventDefault() {}, stopPropagation() {}, clientX: 50, clientY: 50 });
            PaintAction.eraserMouseMove({ preventDefault() {}, stopPropagation() {}, clientX: 70, clientY: 70 });
            PaintAction.eraserMouseUp({ preventDefault() {}, stopPropagation() {} });

            const svgData = SVGTools.saveShape(layer1, 480, 360);
            expect(svgData).toContain('mask id="paintEraserMask"');
            expect(svgData).toContain('stroke="black"');
        });

        it('translates mask elements in Transform.translateTo', () => {
            const mask = document.createElementNS('http://www.w3.org/2000/svg', 'mask');
            mask.id = 'testMask';
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '10');
            rect.setAttribute('y', '20');
            mask.appendChild(rect);

            const xform = {
                setTranslate: () => {},
                matrix: { a: 1, b: 0, c: 0, d: 1, e: 15, f: 25 }
            };
            Transform.translateTo(mask, xform);
            expect(rect.getAttribute('x')).toBe('25');
            expect(rect.getAttribute('y')).toBe('45');
        });
    });

    describe('Multiple Brushes (Brush Styles)', () => {
        it('toggles brush styles between normal, flat, and dotted', () => {
            expect(Paint.currentBrushStyle).toBe('normal');

            Paint.currentBrushStyle = 'flat';
            expect(Paint.currentBrushStyle).toBe('flat');

            Paint.currentBrushStyle = 'dotted';
            expect(Paint.currentBrushStyle).toBe('dotted');

            Paint.currentBrushStyle = 'normal';
            expect(Paint.currentBrushStyle).toBe('normal');
        });

        it('applies brush-specific SVG stroke attributes in SVGTools.getPolyAttr', () => {
            Paint.currentBrushStyle = 'normal';
            let attr = SVGTools.getPolyAttr();
            expect(attr['stroke-linecap']).toBe('round');
            expect(attr['stroke-dasharray']).toBeUndefined();

            Paint.currentBrushStyle = 'flat';
            attr = SVGTools.getPolyAttr();
            expect(attr['stroke-linecap']).toBe('square');
            expect(attr['stroke-linejoin']).toBe('miter');

            Paint.currentBrushStyle = 'dotted';
            attr = SVGTools.getPolyAttr();
            expect(attr['stroke-linecap']).toBe('round');
            expect(attr['stroke-dasharray']).toBeDefined();
            expect(attr['stroke-dasharray']).toContain('0 ');

            // Reset to normal
            Paint.currentBrushStyle = 'normal';
        });

        it('creates brush selector with 3 options in UI', () => {
            const mockLeft = document.createElement('div');
            Paint.createBrushSelector(mockLeft);

            const selector = mockLeft.querySelector('#brushSelector');
            expect(selector).not.toBeNull();
            expect(selector.childElementCount).toBe(3);
        });
    });

    describe('If Touching Color Block', () => {
        it('defines ontouchcolor block in BlockSpecs and categories palette', () => {
            const palettes = BlockSpecs.setupPalettesDef();
            expect(palettes[0]).toContain('ontouchcolor');

            const specs = BlockSpecs.setupBlocksSpecs();
            expect(specs['ontouchcolor']).toBeDefined();
            expect(specs['ontouchcolor'][0]).toBe('ontouchcolor');
            expect(specs['ontouchcolor'][3]).toBe('m'); // menu arg
            expect(specs['ontouchcolor'][4]).toBe('Red'); // default color
        });

        it('registers ontouchcolor in Prims.table', () => {
            Prims.init();
            expect(Prims.table['ontouchcolor']).toBeDefined();
            expect(typeof Prims.table['ontouchcolor']).toBe('function');
        });

        it('converts color names and hex to RGB', () => {
            const redRgb = Sprite.colorToRgb('red');
            expect(redRgb).not.toBeNull();
            expect(redRgb.r).toBe(255);
            expect(redRgb.name).toBe('red');

            const hexRgb = Sprite.colorToRgb('#00FF00');
            expect(hexRgb).not.toBeNull();
            expect(hexRgb.g).toBe(255);
            expect(hexRgb.r).toBe(0);
        });

        it('matches colors by hue for named colors and RGB distance for hex', () => {
            const redTarget = Sprite.colorToRgb('Red');
            // Vivid red should match
            expect(Sprite.colorMatches(250, 10, 10, redTarget)).toBe(true);
            // Blue should not match
            expect(Sprite.colorMatches(10, 10, 250, redTarget)).toBe(false);
            // Black/white should not match
            expect(Sprite.colorMatches(0, 0, 0, redTarget)).toBe(false);
            expect(Sprite.colorMatches(255, 255, 255, redTarget)).toBe(false);

            // Hex match
            const greenTarget = Sprite.colorToRgb('#00FF00');
            expect(Sprite.colorMatches(10, 245, 10, greenTarget)).toBe(true);
            expect(Sprite.colorMatches(200, 10, 10, greenTarget)).toBe(false);
        });

        it('configures 5 preset colors and TouchColor_Pipette as 6th option in touchcolors', () => {
            const specs = BlockSpecs.setupBlocksSpecs();
            const colorsList = specs['ontouchcolor'][1];
            expect(colorsList.length).toBe(6);
            expect(colorsList[0]).toBe('TouchColor_Red');
            expect(colorsList[1]).toBe('TouchColor_Orange');
            expect(colorsList[2]).toBe('TouchColor_Yellow');
            expect(colorsList[3]).toBe('TouchColor_Green');
            expect(colorsList[4]).toBe('TouchColor_Blue');
            expect(colorsList[5]).toBe('TouchColor_Pipette');
        });

        it('converts RGB components and CSS colors to hex accurately', () => {
            expect(BlockArg.rgbToHex(255, 0, 0)).toBe('#FF0000');
            expect(BlockArg.rgbToHex(0, 255, 0)).toBe('#00FF00');
            expect(BlockArg.rgbToHex(0, 0, 255)).toBe('#0000FF');
            expect(BlockArg.rgbToHex(230, 74, 25)).toBe('#E64A19');
            expect(BlockArg.parseCssColor('rgb(255, 128, 0)')).toBe('#FF8000');
            expect(BlockArg.parseCssColor('#123456')).toBe('#123456');
            expect(BlockArg.parseCssColor('transparent')).toBeNull();
        });

        it('launches in-app stage loupe magnifier on pickStageColor and cancels on Escape', () => {
            const mockBlock = {
                scale: 1,
                arg: { argValue: 'Red' },
                blockicon: document.createElement('canvas'),
                div: document.createElement('div')
            };
            mockBlock.blockicon.width = 100;
            mockBlock.blockicon.height = 100;

            // Launch loupe
            BlockArg.pickStageColor(mockBlock, 'Red');

            const overlay = document.getElementById('scratchjr-eyedropper-overlay');
            const loupe = document.getElementById('scratchjr-eyedropper-loupe');
            expect(overlay).not.toBeNull();
            expect(loupe).not.toBeNull();

            // Cancel with Escape
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            window.dispatchEvent(escEvent);

            expect(document.getElementById('scratchjr-eyedropper-overlay')).toBeNull();
            expect(document.getElementById('scratchjr-eyedropper-loupe')).toBeNull();
            expect(mockBlock.arg.argValue).toBe('Red'); // Unchanged
        });

        it('samples color and updates block on pointerdown', () => {
            const mockBlock = {
                scale: 1,
                arg: { argValue: 'Red' },
                blockicon: document.createElement('canvas'),
                div: document.createElement('div')
            };
            mockBlock.blockicon.width = 100;
            mockBlock.blockicon.height = 100;

            BlockArg.pickStageColor(mockBlock, 'Red');

            const overlay = document.getElementById('scratchjr-eyedropper-overlay');
            expect(overlay).not.toBeNull();

            // Simulate pointerdown
            const pointerDownEvent = new MouseEvent('pointerdown', {
                bubbles: true,
                clientX: 200,
                clientY: 200
            });
            overlay.dispatchEvent(pointerDownEvent);

            expect(document.getElementById('scratchjr-eyedropper-overlay')).toBeNull();
            expect(document.getElementById('scratchjr-eyedropper-loupe')).toBeNull();
            expect(mockBlock.arg.argValue).toBeDefined();
            expect(typeof mockBlock.arg.argValue).toBe('string');
            expect(mockBlock.arg.argValue.startsWith('#')).toBe(true);
        });

        it('triggers OnTouchColor and advances block when sprite touches color', () => {
            Prims.init();
            ScratchJr.userStart = true;
            const mockSprite = {
                shown: true,
                touchingColor: (color) => color === '#333333'
            };
            const firstBlock = {
                blocktype: 'ontouchcolor',
                getArgValue: () => '#333333',
                next: { blocktype: 'up', getArgValue: () => 1, next: null }
            };
            const thread = {
                spr: mockSprite,
                firstBlock: firstBlock,
                thisblock: firstBlock,
                stack: [],
                waitTimer: 0
            };

            // Call OnTouchColor
            Prims.OnTouchColor(thread);

            // Should advance to next block ('up')
            expect(thread.thisblock.blocktype).toBe('up');
            expect(thread.stack.length).toBe(1);
            expect(thread.stack[0]).toBe(firstBlock);
        });

        it('does not trigger OnTouchColor when isUserStart is false (before green flag is clicked)', () => {
            Prims.init();
            ScratchJr.userStart = false;
            const mockSprite = {
                shown: true,
                touchingColor: (color) => color === '#333333'
            };
            const firstBlock = {
                blocktype: 'ontouchcolor',
                getArgValue: () => '#333333',
                next: { blocktype: 'up', getArgValue: () => 1, next: null }
            };
            const thread = {
                spr: mockSprite,
                firstBlock: firstBlock,
                thisblock: firstBlock,
                stack: [],
                waitTimer: 0
            };

            // Call OnTouchColor while project is NOT running
            Prims.OnTouchColor(thread);

            // Must NOT advance to next block; waitTimer should be set
            expect(thread.thisblock).toBe(firstBlock);
            expect(thread.stack.length).toBe(0);
            expect(thread.waitTimer).toBeGreaterThan(0);
        });
    });
});
