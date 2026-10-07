/**
 * @vitest-environment jsdom
 */
import './renderer-harness.js';
import './engine-port-adapter.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ScratchAudio from '../../src/app/src/utils/ScratchAudio';
import PlatformBridge from '../../src/app/src/platform/PlatformBridge';
import SVG2Canvas from '../../src/app/src/utils/SVG2Canvas';
import Sprite from '../../src/app/src/editor/engine/Sprite';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs';
import Prims from '../../src/app/src/editor/engine/Prims';
import Project from '../../src/app/src/editor/ui/Project';
import Scripts from '../../src/app/src/editor/ui/Scripts';
import { resetRendererDom, stubMedia, stripShape, makePage, makeCatSprite } from './helpers/editor-fixtures';

describe('Issue #14: Bug Fixes & Sound / Raster Hit-Test Verification', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        PlatformBridge.resetHostInterfaceForTesting();
    });

    describe('Bug 1: Asynchronous Audio Registration Race & Home Click Sound', () => {
        it('queues sndFX while sound registration is pending and plays when registration resolves', async () => {
            let resolveRegistration;
            const asyncRegisterPromise = new Promise((resolve) => {
                resolveRegistration = resolve;
            });

            const mockHost = {
                io_registersound: vi.fn().mockReturnValue(asyncRegisterPromise),
                io_playsound: vi.fn(),
                io_stopsound: vi.fn(),
            };
            window.tablet = mockHost;
            PlatformBridge.waitForInterface(() => {});

            ScratchAudio.init();

            // At this point, sounds are registering asynchronously.
            // Trigger a sound immediately:
            ScratchAudio.sndFX('tap.wav');
            expect(mockHost.io_playsound).not.toHaveBeenCalled();

            // When the registration finishes:
            resolveRegistration('tap.wav');
            await asyncRegisterPromise;

            // Give promise microtask a tick
            await new Promise((r) => setTimeout(r, 10));

            expect(mockHost.io_playsound).toHaveBeenCalledWith('tap.wav');
        });

        it('supports synchronous hostInterface registration immediately', () => {
            const mockHost = {
                io_registersound: vi.fn().mockReturnValue('ok'),
                io_playsound: vi.fn(),
                io_stopsound: vi.fn(),
            };
            window.tablet = mockHost;
            PlatformBridge.waitForInterface(() => {});

            ScratchAudio.init();

            ScratchAudio.sndFX('tap.wav');
            expect(mockHost.io_playsound).toHaveBeenCalledWith('tap.wav');
        });

        it('discards queued pending sound if registration fails with error', async () => {
            let rejectRegistration;
            const asyncRegisterPromise = new Promise((_, reject) => {
                rejectRegistration = reject;
            });

            const mockHost = {
                io_registersound: vi.fn().mockReturnValue(asyncRegisterPromise),
                io_playsound: vi.fn(),
                io_stopsound: vi.fn(),
            };
            window.tablet = mockHost;
            PlatformBridge.waitForInterface(() => {});

            ScratchAudio.init();
            ScratchAudio.sndFX('tap.wav');

            rejectRegistration(new Error('Network error'));
            try {
                await asyncRegisterPromise;
            } catch (_) {}

            await new Promise((r) => setTimeout(r, 10));
            expect(mockHost.io_playsound).not.toHaveBeenCalled();
        });
    });

    describe('Bug 2: Custom PNG/JPG Raster-Only Sprite Hit-Testing & Outline', () => {
        it('identifies raster-only SVG and avoids empty outline canvas', () => {
            const rasterSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><image width="100" height="100" href="data:image/png;base64,abc"/></svg>';
            const parser = new DOMParser();
            const doc = parser.parseFromString(rasterSvgStr, 'image/svg+xml');
            const svgElem = doc.documentElement;

            expect(SVG2Canvas.isRasterOnly(svgElem)).toBe(true);

            // Vector SVG with paths should NOT be raster-only
            const vectorSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M0 0 L10 10"/></svg>';
            const doc2 = parser.parseFromString(vectorSvgStr, 'image/svg+xml');
            expect(SVG2Canvas.isRasterOnly(doc2.documentElement)).toBe(false);

            // Camera SVG with pathborder_image should NOT be raster-only
            const cameraSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><image width="100" height="100" id="pathborder_image_1"/></svg>';
            const doc3 = parser.parseFromString(cameraSvgStr, 'image/svg+xml');
            expect(SVG2Canvas.isRasterOnly(doc3.documentElement)).toBe(false);
        });

        it('draws sprite image into outline canvas for raster-only sprites in drawInCanvas', () => {
            const mockOutline = document.createElement('canvas');
            const mockCtx = {
                drawImage: vi.fn(),
                clearRect: vi.fn(),
                save: vi.fn(),
                restore: vi.fn(),
                canvas: mockOutline,
            };
            vi.spyOn(mockOutline, 'getContext').mockReturnValue(mockCtx);

            const mockImg = document.createElement('img');
            mockImg.width = 120;
            mockImg.height = 90;

            const rasterSvg = new DOMParser().parseFromString(
                '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><image width="120" height="90" href="data:image/png;base64,xyz"/></svg>',
                'image/svg+xml'
            ).documentElement;

            const mockSprite = {
                outline: mockOutline,
                originalImg: mockImg,
                img: mockImg,
                svg: rasterSvg,
            };

            SVG2Canvas.drawInCanvas(mockSprite);

            expect(mockCtx.drawImage).toHaveBeenCalledWith(mockImg, 0, 0, mockOutline.width, mockOutline.height);
        });
    });

    describe('Phase 2: Looks Effects (Color and Fade Blocks)', () => {
        it('includes color and fade in Looks palette definitions and block specs', () => {
            const palettes = BlockSpecs.setupPalettesDef();
            const looksPalette = palettes[2];
            expect(looksPalette).toContain('color');
            expect(looksPalette).toContain('fade');

            const specs = BlockSpecs.setupBlocksSpecs();
            expect(specs.color).toBeDefined();
            expect(specs.color[0]).toBe('color');
            expect(specs.color[3]).toBe('n'); // number arg
            expect(specs.color[4]).toBe(1); // default 1

            expect(specs.fade).toBeDefined();
            expect(specs.fade[0]).toBe('fade');
            expect(specs.fade[3]).toBe('n'); // number arg
            expect(specs.fade[4]).toBe(1); // default 1
        });

        it('Sprite updates colorEffect and fadeEffect and applies CSS filters', () => {
            const spr = Object.create(Sprite.prototype);
            spr.colorEffect = 0;
            spr.fadeEffect = 0;
            spr.div = document.createElement('div');
            spr.img = document.createElement('img');
            spr.div.appendChild(spr.img);

            // Initial state: no filter
            spr.applyEffects();
            expect(spr.img.style.filter).toBe('');

            // Change color by 1 (+36 deg)
            spr.changeColorBy(1);
            expect(spr.colorEffect).toBe(1);
            expect(spr.img.style.filter).toBe('hue-rotate(36deg)');

            // Change fade by 3 (30% ghost -> 70% opacity)
            spr.changeFadeBy(3);
            expect(spr.fadeEffect).toBe(3);
            expect(spr.img.style.filter).toBe('hue-rotate(36deg) opacity(70%)');

            // Capped fade at max 8 (80% ghost -> 20% opacity)
            spr.changeFadeBy(10);
            expect(spr.fadeEffect).toBe(8);
            expect(spr.img.style.filter).toBe('hue-rotate(36deg) opacity(20%)');

            // Clear effects
            spr.clearEffects();
            expect(spr.colorEffect).toBe(0);
            expect(spr.fadeEffect).toBe(0);
            expect(spr.img.style.filter).toBe('');
        });

        it('Sprite.goHome resets effects and clears CSS filter', () => {
            const spr = Object.create(Sprite.prototype);
            spr.colorEffect = 0;
            spr.fadeEffect = 0;
            spr.div = document.createElement('div');
            spr.img = document.createElement('img');
            spr.div.appendChild(spr.img);
            spr.homex = 10;
            spr.homey = 20;
            spr.homescale = 1;
            spr.homeshown = true;
            spr.homeflip = false;
            spr.cx = 0;
            spr.cy = 0;
            spr.xcoor = 10;
            spr.ycoor = 20;
            spr.scale = 1;
            spr.shown = true;
            spr.flip = false;
            spr.setPos = vi.fn();
            spr.setHeading = vi.fn();
            spr.render = vi.fn();

            spr.changeColorBy(3);
            spr.changeFadeBy(4);
            expect(spr.img.style.filter).toContain('hue-rotate');

            spr.goHome();
            expect(spr.colorEffect).toBe(0);
            expect(spr.fadeEffect).toBe(0);
            expect(spr.img.style.filter).toBe('');
        });

        it('Prims.Color and Prims.Fade advance thread and modify sprite effects', () => {
            const spr = Object.create(Sprite.prototype);
            spr.colorEffect = 0;
            spr.fadeEffect = 0;
            spr.div = document.createElement('div');
            spr.img = document.createElement('img');
            spr.div.appendChild(spr.img);

            const nextBlock = { blocktype: 'endstack', next: null };
            const colorBlock = {
                blocktype: 'color',
                getArgValue: () => 2,
                next: nextBlock,
            };
            const fadeBlock = {
                blocktype: 'fade',
                getArgValue: () => 1,
                next: nextBlock,
            };

            const thread1 = {
                spr: spr,
                thisblock: colorBlock,
                waitTimer: 0,
            };

            Prims.Color(thread1);
            expect(spr.colorEffect).toBe(2);
            expect(thread1.thisblock).toBe(nextBlock);

            const thread2 = {
                spr: spr,
                thisblock: fadeBlock,
                waitTimer: 0,
            };

            Prims.Fade(thread2);
            expect(spr.fadeEffect).toBe(1);
            expect(thread2.thisblock).toBe(nextBlock);

            // Prims.Same resets both
            const thread3 = {
                spr: spr,
                thisblock: { blocktype: 'same', next: nextBlock },
                firstBlock: { aStart: false },
                count: 0,
                distance: 0,
                waitTimer: 0,
            };
            spr.defaultScale = 1;
            spr.scale = 1;
            Prims.Same(thread3);
            expect(spr.colorEffect).toBe(0);
            expect(spr.fadeEffect).toBe(0);
        });

        it('round-trips color and fade blocks through script serialization and deserialization', () => {
            resetRendererDom();
            stubMedia();
            BlockSpecs.initBlocks();
            const page = makePage();
            const spr = makeCatSprite(page);
            const sc = new Scripts(spr);

            const strip = [
                ['color', 3, 0, 0],
                ['fade', 2, 0, 0],
                ['same', 'null', 0, 0],
            ];

            const blocks = sc.recreateStrip(strip);
            expect(blocks.map(b => b.blocktype)).toEqual(['color', 'fade', 'same']);
            expect(blocks[0].getArgValue()).toBe(3);
            expect(blocks[1].getArgValue()).toBe(2);

            const reencoded = Project.encodeStrip(blocks[0]);
            expect(stripShape(reencoded)).toEqual(stripShape(strip));
        });
    });
});

