// @vitest-environment jsdom
// Golden-path editor flows: the sequences Phase-3 structural refactors must
// not break. Undo record->replay runs the real smartRecreate machinery.
// Note: Scripts.recreateStrip ADDS a strip container (real UI edits replace
// strips through drag/drop flows), so later states contain earlier strips.
import './renderer-harness.js';
import './engine-port-adapter.js';
import { describe, it, expect, beforeEach } from 'vitest';
import Sprite from '../../src/app/src/editor/engine/Sprite.js';
import ScratchJr from '../../src/app/src/editor/ScratchJr.js';
import Undo from '../../src/app/src/editor/ui/Undo.js';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs.js';
import PlatformBridge from '../../src/app/src/platform/PlatformBridge.js';
import { resetGoldenDom, stubMedia, stripShape, makePage } from './helpers/editor-fixtures.js';

const STRIP_A = [['hop', 2, 0, 0], ['say', 'Hello', 0, 0]];
const STRIP_B = [['hide', 'null', 0, 0], ['hop', 4, 0, 0], ['pop', 1, 0, 0]];
const STRIP_C = [['wait', 3, 0, 0]];

/** Sorted multiset of strip shapes across all of the sprite's script containers */
function allStrips (page, sprId) {
    return page.encodePage()[sprId].scripts.map(stripShape)
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

describe('undo record -> replay (sprite script edit)', () => {
    beforeEach(() => {
        resetGoldenDom();
        stubMedia();
        BlockSpecs.initBlocks();
        // prevStep touches focus state we don't simulate; the mechanics under
        // test are record/snapshot/replay, not text-field focus.
        ScratchJr.unfocus = () => {};
        // stopStrips reads ScratchJr's module-level runtime var directly, so
        // replace the method rather than stubbing the static.
        ScratchJr.stopStrips = () => {};
    });

    function makeSpriteWithStrip (strip, id) {
        const page = makePage();
        // Unique ids mirror production (getIdFor): global id lookups must not
        // cross wires between concurrently-alive pages.
        const spr = new Sprite({ type: 'sprite', page, md5: 'm1', id: id || 'cat', name: 'Cat', sounds: [] });
        spr.code.recreateStrip(strip);
        page.sprites = JSON.stringify([id || 'cat']);
        ScratchJr.stage.pages.push(page);
        ScratchJr.stage.currentPage = page;
        return { page, spr };
    }

    const evt = (ts) => ({ preventDefault () {}, stopPropagation () {}, timeStamp: ts });

    it('prevStep restores the previous script snapshot', () => {
        const { page, spr } = makeSpriteWithStrip(STRIP_A);

        Undo.record({ action: 'modify', where: page.id, who: spr.id });
        spr.code.recreateStrip(STRIP_B);
        Undo.record({ action: 'modify', where: page.id, who: spr.id });

        Undo.prevStep(evt(1));

        expect(allStrips(page, spr.id)).toEqual([stripShape(STRIP_A)]);
    });
});
