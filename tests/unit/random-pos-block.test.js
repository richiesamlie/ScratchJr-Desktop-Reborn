/**
 * @vitest-environment jsdom
 */
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs';
import Prims from '../../src/app/src/editor/engine/Prims';
import Localization from '../../src/app/src/utils/Localization';
import enJson from '../../src/app/localizations/en.json';
import { CURATED_FONTS, getFontById, getFontFamilyById } from '../../src/app/src/utils/FontList';

describe('Issue #12 Phase 2: Random Position Motion Block & Pixel Font', () => {
    beforeEach(() => {
        Localization.setMessages(enJson, 'en');
        BlockSpecs.initBlocks();
        Prims.init();
    });

    describe('Motion Palette & Block Specs', () => {
        it('registers randompos in motion palette definition after home', () => {
            const palettes = BlockSpecs.setupPalettesDef();
            const motionPalette = palettes[1];
            expect(motionPalette).toContain('randompos');
            expect(motionPalette.indexOf('randompos')).toBe(motionPalette.indexOf('home') + 1);
        });

        it('defines randompos block specs properly', () => {
            const specs = BlockSpecs.setupBlocksSpecs();
            expect(specs['randompos']).toBeDefined();
            const spec = specs['randompos'];
            expect(spec[0]).toBe('randompos');
            expect(spec[1]).toBeDefined(); // icon element
            expect(spec[2]).toBe(BlockSpecs.blueCmd);
            expect(spec[3]).toBeNull(); // no numeric / text argument field
        });

        it('has localization for randompos', () => {
            const dummySprite = { name: 'Cat' };
            const desc = BlockSpecs.blockDesc({ getArgValue: () => null, blocktype: 'randompos' }, dummySprite);
            expect(desc['randompos']).toBe('GO TO RANDOM POSITION');
        });
    });

    describe('Prims.RandomPos Execution', () => {
        it('binds Prims.table.randompos to Prims.RandomPos', () => {
            expect(Prims.table['randompos']).toBe(Prims.RandomPos);
        });

        it('smoothly glides sprite towards discrete random grid coordinate', () => {
            const mockSprite = {
                xcoor: 0,
                ycoor: 0,
                speed: 2,
                setPos: vi.fn(function (x, y) {
                    this.xcoor = x;
                    this.ycoor = y;
                })
            };

            const nextBlock = { id: 'next-block' };
            const strip = {
                spr: mockSprite,
                thisblock: { next: nextBlock },
                waitTimer: 0
            };

            // First tick: target is chosen on discrete grid [0..19]*24 and [0..14]*24
            Prims.RandomPos(strip);

            expect(strip.randomTarget).toBeDefined();
            const { x: targetX, y: targetY } = strip.randomTarget;
            expect(targetX).toBeGreaterThanOrEqual(0);
            expect(targetX).toBeLessThanOrEqual(456);
            expect(targetX % 24).toBe(0);

            expect(targetY).toBeGreaterThanOrEqual(0);
            expect(targetY).toBeLessThanOrEqual(336);
            expect(targetY % 24).toBe(0);

            // Run until reaching target
            let iterations = 0;
            while (strip.thisblock !== nextBlock && iterations < 500) {
                Prims.RandomPos(strip);
                iterations++;
            }

            expect(strip.thisblock).toBe(nextBlock);
            expect(strip.randomTarget).toBeNull();
            expect(mockSprite.xcoor).toBe(targetX);
            expect(mockSprite.ycoor).toBe(targetY);
        });
    });

    describe('Retro Pixel Font', () => {
        it('includes pixel font in curated font list', () => {
            const ids = CURATED_FONTS.map(f => f.id);
            expect(ids).toContain('pixel');
        });

        it('resolves pixel font metadata and family', () => {
            const pixelFont = getFontById('pixel');
            expect(pixelFont.id).toBe('pixel');
            expect(pixelFont.name).toBe('Pixel');
            expect(pixelFont.category).toBe('pixel');

            const family = getFontFamilyById('pixel');
            expect(family).toContain('Press Start 2P');
        });
    });
});
