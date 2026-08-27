import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockMediaLib } from './helpers/browser-globals.js';

// Browser-global stubs mirror io-persistence.test.js via the shared helper.
vi.mock('../../src/app/src/lobby/Lobby.js', () => ({ default: {} }));
vi.mock('../../src/app/src/utils/SVG2Canvas.js', () => ({ default: {} }));
vi.mock('../../src/app/src/iPad/MediaLib.ts', () => ({ default: mockMediaLib }));

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
