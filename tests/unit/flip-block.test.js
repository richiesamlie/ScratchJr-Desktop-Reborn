// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs';
import Prims from '../../src/app/src/editor/engine/Prims';
import Sprite from '../../src/app/src/editor/engine/Sprite';
import Localization from '../../src/app/src/utils/Localization';
import enJson from '../../src/app/localizations/en.json';

describe('Horizontal Flip Motion Block (flipX)', () => {
    beforeEach(() => {
        Localization.setMessages(enJson, 'en');
        BlockSpecs.initBlocks();
        Prims.init();
    });

    it('registers flipX in motion palette definition', () => {
        const palettes = BlockSpecs.setupPalettesDef();
        const motionPalette = palettes[1];
        expect(motionPalette).toContain('flipX');
        expect(motionPalette.indexOf('flipX')).toBeGreaterThan(motionPalette.indexOf('left'));
    });

    it('defines flipX block specs properly', () => {
        const specs = BlockSpecs.setupBlocksSpecs();
        expect(specs['flipX']).toBeDefined();
        const flipSpec = specs['flipX'];
        expect(flipSpec[0]).toBe('flipX');
        expect(flipSpec[2]).toBe(BlockSpecs.blueCmd);
    });

    it('has localization for flipX', () => {
        const dummySprite = { name: 'Cat' };
        const desc = BlockSpecs.blockDesc({ getArgValue: () => null, blocktype: 'flipX' }, dummySprite);
        expect(desc['flipX']).toBe('FLIP');
    });

    it('binds Prims.table.flipX to FlipX execution', () => {
        expect(Prims.table['flipX']).toBe(Prims.FlipX);

        const mockSprite = {
            flipX: vi.fn()
        };
        const nextBlock = { id: 'next' };
        const strip = {
            spr: mockSprite,
            thisblock: { next: nextBlock },
            waitTimer: 0
        };

        Prims.FlipX(strip);
        expect(mockSprite.flipX).toHaveBeenCalledTimes(1);
        expect(strip.thisblock).toBe(nextBlock);
        expect(strip.waitTimer).toBeGreaterThan(0);
    });

    it('toggles sprite.flip and re-renders on sprite.flipX()', () => {
        const sprite = Object.create(Sprite.prototype);
        sprite.flip = false;
        sprite.render = vi.fn();

        sprite.flipX();
        expect(sprite.flip).toBe(true);
        expect(sprite.render).toHaveBeenCalledTimes(1);

        sprite.flipX();
        expect(sprite.flip).toBe(false);
        expect(sprite.render).toHaveBeenCalledTimes(2);
    });

    it('resets flip to homeflip on goHome()', () => {
        const sprite = Object.create(Sprite.prototype);
        sprite.homex = 240;
        sprite.homey = 180;
        sprite.homescale = 0.5;
        sprite.homeshown = true;
        sprite.homeflip = false;
        sprite.flip = true;
        sprite.setPos = vi.fn();
        sprite.setHeading = vi.fn();
        sprite.render = vi.fn();
        sprite.div = { style: {} };


        sprite.goHome();
        expect(sprite.flip).toBe(false);
        expect(sprite.setHeading).toHaveBeenCalledWith(0);
        expect(sprite.render).toHaveBeenCalled();
    });
});
