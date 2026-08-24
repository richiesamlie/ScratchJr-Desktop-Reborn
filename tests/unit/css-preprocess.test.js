import { describe, it, expect, vi } from 'vitest';

// Browser-global stubs mirroring the other renderer tests. css_vh/css_vw do
// math against window.innerHeight/innerWidth.
vi.hoisted(() => {
    globalThis.window = {
        orientation: undefined,
        location: { href: 'test.html' },
        innerHeight: 768,
        innerWidth: 1024,
        devicePixelRatio: 1,
        CSSRule: {},
    };
});

vi.mock('../../src/app/src/lobby/Lobby.js', () => ({ default: {} }));
vi.mock('../../src/app/src/utils/SVG2Canvas.js', () => ({ default: {} }));
vi.mock('../../src/app/src/iPad/MediaLib.ts', () => ({
    default: { path: 'media/', keys: {}, sounds: [], sprites: [], backgrounds: [] },
}));

import { preprocess } from '../../src/app/src/utils/lib.ts';

describe('CSS preprocessor expression grammar (eval-free)', () => {
    it('scales numbers by scaleMultiplier', () => {
        expect(preprocess('${5 * scaleMultiplier}')).toBe('5');
        expect(preprocess('${120 * scaleMultiplier}px')).toBe('120px');
    });

    it('exposes scaleMultiplier itself', () => {
        expect(preprocess('${scaleMultiplier}')).toBe('1');
        expect(preprocess('${-scaleMultiplier}')).toBe('-1');
    });

    it('converts viewport units to px', () => {
        expect(preprocess('${css_vh(100)}')).toBe('768px');
        expect(preprocess('${css_vw(50)}')).toBe('512px');
        expect(preprocess('${css_vh(-0.13)}')).toMatch(/px$/);
    });

    it('supports the Math.max/ceil grid form', () => {
        expect(preprocess('${Math.max(1, Math.ceil(5 * scaleMultiplier))}')).toBe('5');
    });

    it('keeps unknown expressions as literals and never throws', () => {
        expect(preprocess('${alert(1)}')).toBe('${alert(1)}');
        expect(preprocess('${window.location.href}')).toBe('${window.location.href}');
        expect(preprocess('a ${bogus; drop} b')).toBe('a ${bogus; drop} b');
    });

    it('passes plain CSS through untouched', () => {
        const css = '.thumb { width: 118px; height: 90px; }';
        expect(preprocess(css)).toBe(css);
    });
});
