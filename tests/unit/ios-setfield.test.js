import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mirror io-persistence.test.js browser-global stubs.
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

// Real iOS module (not mocked): setfield's intent shape is the contract under test.
import iOS from '../../src/app/src/iPad/iOS.ts';

describe('iOS.setfield builds a parameterized update intent', () => {
    beforeEach(() => {
        delete globalThis.window.tablet;
        delete globalThis.lastPayload;
        globalThis.window.tablet = {
            database_stmt: async (json) => {
                globalThis.lastPayload = JSON.parse(json);
                return '1';
            },
        };
    });

    it('sends a structured update with id bound as a value, never interpolated', async () => {
        await new Promise((resolve) => iOS.waitForInterface(resolve));
        await new Promise((resolve) => iOS.setfield('projects', "42 OR 1=1; DROP TABLE PROJECTS--", 'deleted', 'YES', resolve));
        const payload = globalThis.lastPayload;
        expect(payload).toEqual({
            op: 'update',
            table: 'projects',
            row: { deleted: 'YES', mtime: expect.any(String) },
            // the hostile string travels as a bound value; main composes the SQL
            id: "42 OR 1=1; DROP TABLE PROJECTS--",
        });
    });
});
