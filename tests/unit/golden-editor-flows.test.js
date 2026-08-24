// @vitest-environment jsdom
// Golden-path editor flows: the sequences Phase-3 structural refactors must
// not break. Undo record->replay runs the real smartRecreate machinery.
// Note: Scripts.recreateStrip ADDS a strip container (real UI edits replace
// strips through drag/drop flows), so later states contain earlier strips.
import './renderer-harness.js';
import './engine-port-adapter.js';
import { describe, it, expect, beforeEach } from 'vitest';
import Page from '../../src/app/src/editor/engine/Page.js';
import Sprite from '../../src/app/src/editor/engine/Sprite.js';
import ScratchJr from '../../src/app/src/editor/ScratchJr.js';
import Undo from '../../src/app/src/editor/ui/Undo.js';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs.js';
import iOS from '../../src/app/src/iPad/iOS.js';

function resetDom () {
    document.body.innerHTML = '';
    const scriptscontainer = document.createElement('div');
    scriptscontainer.id = 'scriptscontainer';
    document.body.appendChild(scriptscontainer);
    const pagesdiv = document.createElement('div');
    pagesdiv.id = 'pagesdiv';
    document.body.appendChild(pagesdiv);
    // Page-thumb strip: undo replay refreshes thumbnails.
    const pagecc = document.createElement('div');
    pagecc.id = 'pagecc';
    document.body.appendChild(pagecc);
    // Block palette: Palette.hide() rewrites its first two child rows.
    const blockspalette = document.createElement('div');
    blockspalette.id = 'blockspalette';
    blockspalette.appendChild(document.createElement('div'));
    blockspalette.appendChild(document.createElement('div'));
    document.body.appendChild(blockspalette);
    // Script workspace pane toggled during sprite restore.
    const scriptsdiv = document.createElement('div');
    scriptsdiv.id = 'scripts';
    document.body.appendChild(scriptsdiv);
    // Minimal Stage stand-in: the undo snapshot walks the registered pages.
    ScratchJr.stage = {
        pagesdiv,
        pages: [],
        currentPage: null,
        getPagesID () { return this.pages.map((p) => p.id); },
    };
}

const STRIP_A = [['hop', 2, 0, 0], ['say', 'Hello', 0, 0]];
const STRIP_B = [['hide', 'null', 0, 0], ['hop', 4, 0, 0], ['pop', 1, 0, 0]];
const STRIP_C = [['wait', 3, 0, 0]];

function stripShape (s) {
    return s.map(t => [t[0], t[1], Array.isArray(t[4]) ? stripShape(t[4]) : null]);
}

/** Sorted multiset of strip shapes across all of the sprite's script containers */
function allStrips (page, sprId) {
    return page.encodePage()[sprId].scripts.map(stripShape)
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

describe('undo record -> replay (sprite script edit)', () => {
    beforeEach(() => {
        resetDom();
        iOS.getmedia = async () => {};
        iOS.path = '';
        BlockSpecs.initBlocks();
        // prevStep touches focus state we don't simulate; the mechanics under
        // test are record/snapshot/replay, not text-field focus.
        ScratchJr.unfocus = () => {};
        // No live runtime under jsdom; replay paths ask it to stop threads.
        // stopStrips reads ScratchJr's module-level runtime var directly, so
        // replace the method rather than stubbing the static.
        Object.defineProperty(ScratchJr, 'runtime', {
            value: { stopThreads () {}, stopThreadSprite () {}, yield: false },
            configurable: true,
        });
        ScratchJr.stopStrips = () => {};
    });

    function makeSpriteWithStrip (strip, id) {
        const page = new Page('page1', { lastSprite: '', sprites: [], layers: [], num: 1 });
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
