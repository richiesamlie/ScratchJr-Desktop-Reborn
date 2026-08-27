// @vitest-environment jsdom
// Editor engine contracts under jsdom: script-strip encode/decode round-trip
// (the project file format), the scroll-aware page-strip caret math, and a
// runtime primitive execution.
import './renderer-harness.js';
import './engine-port-adapter.js';
import { describe, it, expect, beforeEach } from 'vitest';
import Project from '../../src/app/src/editor/ui/Project.js';
import Scripts from '../../src/app/src/editor/ui/Scripts.js';
import Sprite from '../../src/app/src/editor/engine/Sprite.js';
import ScratchJr from '../../src/app/src/editor/ScratchJr.js';
import Thumbs from '../../src/app/src/editor/ui/Thumbs.js';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs.js';
import Thread from '../../src/app/src/editor/engine/Thread.js';
import Prims from '../../src/app/src/editor/engine/Prims.js';
import Undo from '../../src/app/src/editor/ui/Undo.js';
import { gn } from '../../src/app/src/utils/lib.js';
import { resetRendererDom, stubMedia, stripShape, makePage, makeCatSprite } from './helpers/editor-fixtures.js';

describe('script strip round-trip (project file format)', () => {
    beforeEach(() => {
        resetRendererDom();
        stubMedia();
        BlockSpecs.initBlocks();
    });

    it('recreates blocks and re-encodes the same blocktype/arg/nesting', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        const sc = new Scripts(spr);

        const strip = [
            ['hop', 2, 0, 0],
            ['repeat', 3, 0, 10, [
                ['hop', 2, 0, 0],
                ['say', 'Hello', 0, 0],
            ]],
            ['hide', 'null', 0, 0],
        ];

        const blocks = sc.recreateStrip(strip);

        // Decode built the expected block graph.
        expect(blocks.map(b => b.blocktype)).toEqual(['hop', 'repeat', 'hide']);
        expect(blocks[1].inside.blocktype).toBe('hop');
        expect(blocks[1].inside.next.blocktype).toBe('say');

        // Re-encoding yields the same structure (positions are relaid out, so
        // only blocktype/arg/nesting are compared).
        // encodeStrip walks the .next chain, so the first block encodes the
        // whole strip.
        const reencoded = Project.encodeStrip(blocks[0]);
        expect(stripShape(reencoded)).toEqual(stripShape(strip));
    });

    it('round-trips a strip with an arg block and page navigation target', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        const sc = new Scripts(spr);

        // gotopage is arg-encoded via hasargs even though its arg is a number.
        const strip = [
            ['wait', 1, 0, 0],
            ['gotopage', 2, 0, 10],
        ];

        const blocks = sc.recreateStrip(strip);
        expect(blocks.map(b => b.blocktype)).toEqual(['wait', 'gotopage']);

        const reencoded = Project.encodeStrip(blocks[0]);
        expect(reencoded[0][0]).toBe('wait');
        expect(reencoded[0][1]).toBe(1);
        expect(reencoded[1][0]).toBe('gotopage');
    });

    it('re-creating a sprite with the same id registers it once in page.sprites', () => {
        const page = makePage();
        // Shared attrs object on purpose: the second construction must see
        // whatever the first left behind.
        const attr = { type: 'sprite', page, md5: 'm1', id: 'cat', name: 'Cat', sounds: [] };
        new Sprite(attr);
        // A second creation with the same id (reload / undo replay) must not
        // duplicate the registration — that was the flood data path.
        new Sprite(attr);
        expect(JSON.parse(page.sprites)).toEqual(['cat']);
    });
});

describe('Thumbs.getPagePos (scroll-aware page strip caret math)', () => {
    beforeEach(() => {
        resetRendererDom();
        const pagecc = document.createElement('div');
        pagecc.id = 'pagecc';
        document.body.appendChild(pagecc);

        // Three page thumbs chained via the next/prev expandos, plus their
        // page divs carrying the Page-object owner.
        let prevThumb = null;
        for (let i = 0; i < 3; i++) {
            const thumb = document.createElement('div');
            thumb.id = 'pt' + i;
            Object.defineProperty(thumb, 'offsetTop', { value: i * 50, configurable: true });
            window.__modelRefs.setModelRef(thumb, 'pagethumb', 'page' + i);
            thumb.prev = prevThumb;
            if (prevThumb) {
                prevThumb.next = thumb;
            }
            pagecc.appendChild(thumb);
            prevThumb = thumb;

            const pageDiv = document.createElement('div');
            pageDiv.id = 'page' + i;
            document.body.appendChild(pageDiv);
            window.__modelRefs.setModelRef(pageDiv, 'page', { id: 'page' + i });
        }
    });

    it('maps a y-coordinate to the correct page slot at scrollTop 0', () => {
        expect(Thumbs.getPagePos(0)).toBe(0);
        expect(Thumbs.getPagePos(50)).toBe(1);
        expect(Thumbs.getPagePos(100)).toBe(2);
    });

    it('shifts the caret slot down when the strip is scrolled', () => {
        const pagecc = gn('pagecc');
        pagecc.scrollTop = 25;
        // Same cursor y as the first test, but the strip scrolled 25px:
        // the caret now lands on the next page.
        expect(Thumbs.getPagePos(0)).toBe(1);
        expect(Thumbs.getPagePos(50)).toBe(2);
    });

    it('clamps the position to the page count', () => {
        expect(Thumbs.getPagePos(1000)).toBe(3);
        expect(Thumbs.getPagePos(-100)).toBe(0);
    });
});

describe('page encode/decode round-trip (page bag format)', () => {
    beforeEach(() => {
        resetRendererDom();
        stubMedia();
        BlockSpecs.initBlocks();
    });

    it('encodePage produces the page bag and recreatePage decodes it', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        spr.code.recreateStrip([
            ['hop', 2, 0, 0],
            ['repeat', 3, 0, 10, [['say', 'Hi', 0, 0]]],
        ]);
        page.sprites = JSON.stringify(['cat']);

        const encoded = page.encodePage();

        // Page bag shape: sprite list, last sprite, num, layers, sprite bags.
        expect(encoded.sprites).toEqual(['cat']);
        expect(encoded.lastSprite).toBeUndefined();
        expect(encoded.num).toBe(1);
        expect(encoded.layers).toContain('cat');
        const spriteBag = encoded.cat;
        expect(spriteBag.id).toBe('cat');
        expect(spriteBag.type).toBe('sprite');
        expect(spriteBag.scripts[0][0][0]).toBe('hop');
        expect(spriteBag.scripts[0][1][0]).toBe('repeat');
        expect(spriteBag.scripts[0][1][4][0][0]).toBe('say');

        // Decode: recreatePage builds a new page and re-creates the sprite.
        Project.recreatePage('page2', encoded);
        const page2 = ScratchJr.stage.pages[1];
        expect(page2.id).toBe('page2');
        expect(JSON.parse(page2.sprites)).toEqual(['cat']);
        const catDiv = Array.from(page2.div.children).find(c => c.id === 'cat');
        expect(catDiv).toBeTruthy();
        expect(window.__modelRefs.getModelRefAs(catDiv, 'sprite').type).toBe('sprite');
    });
});

describe('runtime primitive execution', () => {
    beforeEach(() => {
        resetRendererDom();
        stubMedia();
        BlockSpecs.initBlocks();
    });

    function makeThread (strip, spr) {
        const sc = new Scripts(spr);
        const [block] = sc.recreateStrip(strip);
        return new Thread(spr, block);
    }

    it('Home moves the sprite back to its home position', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        const thread = makeThread([['home', 'null', 0, 0]], spr);

        spr.homex = 0;
        spr.homey = 0;
        spr.xcoor = 120;
        spr.ycoor = 80;
        Prims.Home(thread);

        expect(spr.xcoor).toBe(0);
        expect(spr.ycoor).toBe(0);
        // The primitive advanced the thread to the next block (end of strip).
        expect(thread.thisblock).toBeNull();
    });

    it('SetSpeed applies 2^arg to the sprite speed', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        const thread = makeThread([['setspeed', 2, 0, 0]], spr);

        Prims.SetSpeed(thread);

        expect(spr.speed).toBe(4);
        expect(thread.thisblock).toBeNull();
    });

    it('Show and Hide flip visibility synchronously at full speed', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        spr.speed = 4;
        const showThread = makeThread([['show', 'null', 0, 0]], spr);
        const hideThread = makeThread([['hide', 'null', 0, 0]], spr);

        Prims.Show(showThread);
        expect(spr.shown).toBe(true);
        expect(spr.div.style.opacity).toBe('1');
        expect(showThread.thisblock).toBeNull();

        Prims.Hide(hideThread);
        expect(spr.shown).toBe(false);
        expect(spr.div.style.opacity).toBe('0');
        expect(hideThread.thisblock).toBeNull();
    });

    it('Hop starts a multi-tick jump from the hop table', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        const thread = makeThread([['hop', 2, 0, 0]], spr);
        const startY = 80;
        spr.ycoor = startY;
        spr.xcoor = 100;

        Prims.Hop(thread);

        // First hop tick: count 11 -> 10, the last hop-table entry applied.
        expect(thread.count).toBe(10);
        expect(thread.vector).toEqual({ x: 0, y: 48 });
        expect(spr.ycoor).toBeLessThan(startY);
        expect(spr.xcoor).toBe(100);
    });

    it('Repeat enters the nested strip and counts down on the block', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        const thread = makeThread([['repeat', 3, 0, 10, [['hop', 2, 0, 0]]]], spr);
        const repeatBlock = thread.firstBlock;

        Prims.Repeat(thread);

        expect(repeatBlock.repeatCounter).toBe(2);
        expect(thread.stack).toHaveLength(1);
        expect(thread.stack[0]).toBe(repeatBlock);
        // The thread jumped into the nested strip.
        expect(thread.thisblock.blocktype).toBe('hop');
    });

    it('Say opens the speech balloon and holds the block', () => {
        const page = makePage();
        const spr = makeCatSprite(page);
        const thread = makeThread([['say', 'Hello', 0, 0]], spr);
        // The balloon SVG template loads async via IO.requestFromServer in
        // initBlocks; provide the markers drawBalloon rewrites.
        BlockSpecs.balloon = '<svg width="30px" height="44px" viewBox="0 0 30 44"><path d="M0 0h17v24L5 5h-2l1 1h-1z"/></svg>';

        Prims.Say(thread);

        expect(spr.balloon).toBeTruthy();
        expect(thread.count).toBe(30);
        // The block is not advanced until the balloon times out.
        expect(thread.thisblock.blocktype).toBe('say');
    });
});

describe('Undo page-order snapshot', () => {
    beforeEach(() => {
        resetRendererDom();
        stubMedia();
        BlockSpecs.initBlocks();
    });

    it('getPageOrder walks the page-thumb chain in order', () => {
        const pagecc = document.createElement('div');
        pagecc.id = 'pagecc';
        document.body.appendChild(pagecc);
        let prevThumb = null;
        for (let i = 0; i < 3; i++) {
            const thumb = document.createElement('div');
            thumb.id = 'pt' + i;
            window.__modelRefs.setModelRef(thumb, 'pagethumb', 'page' + i);
            thumb.prev = prevThumb;
            if (prevThumb) {
                prevThumb.next = thumb;
            }
            pagecc.appendChild(thumb);
            prevThumb = thumb;

            const pageObj = { id: 'page' + i };
            const pageDiv = document.createElement('div');
            pageDiv.id = 'page' + i;
            document.body.appendChild(pageDiv);
            window.__modelRefs.setModelRef(pageDiv, 'page', pageObj);
        }

        const order = Undo.getPageOrder({ pages: ['page0', 'page1', 'page2'], currentPage: 'page1' });
        expect(order.map(p => p.id)).toEqual(['page0', 'page1', 'page2']);
    });
});
