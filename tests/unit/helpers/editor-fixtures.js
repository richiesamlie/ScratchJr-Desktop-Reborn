// Editor DOM fixtures shared by golden-editor-flows.test.js and
// renderer-editor.test.js (both jsdom, renderer-harness.js imported first).
// Plain static imports — no vi.mock involved.
import Page from '../../../src/app/src/editor/engine/Page.js';
import Sprite from '../../../src/app/src/editor/engine/Sprite.js';
import ScratchJr from '../../../src/app/src/editor/ScratchJr.js';
import PlatformBridge from '../../../src/app/src/platform/PlatformBridge.js';

function appendDiv (id) {
    const div = document.createElement('div');
    div.id = id;
    document.body.appendChild(div);
    return div;
}

function baseResetDom () {
    document.body.innerHTML = '';
    appendDiv('scriptscontainer');
    return appendDiv('pagesdiv');
}

// DOM for the golden editor flows: page-thumb strip (undo replay refreshes
// thumbnails), block palette (Palette.hide() rewrites its first two child
// rows) and the script workspace pane toggled during sprite restore.
export function resetGoldenDom () {
    const pagesdiv = baseResetDom();
    appendDiv('pagecc');
    const blockspalette = appendDiv('blockspalette');
    blockspalette.appendChild(document.createElement('div'));
    blockspalette.appendChild(document.createElement('div'));
    appendDiv('scripts');
    // Minimal Stage stand-in: the undo snapshot walks the registered pages.
    ScratchJr.stage = {
        pagesdiv,
        pages: [],
        currentPage: null,
        getPagesID () { return this.pages.map((p) => p.id); },
    };
    // No live runtime under jsdom; replay paths ask it to stop threads.
    Object.defineProperty(ScratchJr, 'runtime', {
        value: { stopThreads () {}, stopThreadSprite () {}, yield: false },
        configurable: true,
    });
}

// DOM for the renderer editor contracts: a stage stand-in (the speech balloon
// sizes itself against the stage's zoom).
export function resetRendererDom () {
    const pagesdiv = baseResetDom();
    const stage = appendDiv('stage');
    window.__modelRefs.setModelRef(stage, 'stage', { currentZoom: 1 });
    ScratchJr.stage = { pagesdiv, pages: [], currentPage: null };
    // The Repeat primitive sets ScratchJr.runtime.yield; the static is
    // getter-only, so stub it via defineProperty.
    Object.defineProperty(ScratchJr, 'runtime', { value: { yield: false }, configurable: true });
}

// Sprite construction kicks off async media loading through the native
// bridge; the format tests don't need images.
export function stubMedia () {
    PlatformBridge.getmedia = async () => {};
    PlatformBridge.path = '';
}

/** [blocktype, arg, nested-strip-shape] tuples; positions are dropped */
export function stripShape (s) {
    return s.map(t => [t[0], t[1], Array.isArray(t[4]) ? stripShape(t[4]) : null]);
}

export function makePage () {
    return new Page('page1', { lastSprite: '', sprites: [], layers: [], num: 1 });
}

export function makeCatSprite (page) {
    return new Sprite({ type: 'sprite', page, md5: 'm1', id: 'cat', name: 'Cat', sounds: [] });
}
