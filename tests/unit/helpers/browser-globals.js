// Browser-global window stub shared by renderer-side unit tests running in
// the node environment. Assigned at module-eval time: import this file BEFORE
// the modules under test — static import order then guarantees window exists
// when they read it at module scope (same guarantee vi.hoisted gave).
globalThis.window = {
    orientation: undefined,
    location: { href: 'test.html' },
    innerHeight: 768,
    innerWidth: 1024,
    devicePixelRatio: 1,
    CSSRule: {},
};

// MediaLib default export for vi.mock factories. The mock-prefixed name lets
// hoisted factories reference this import.
export const mockMediaLib = { path: 'media/', keys: {}, sounds: [], sprites: [], backgrounds: [] };
