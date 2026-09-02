import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockMediaLib } from './helpers/browser-globals.js';

// lib.ts evaluates `typeof window.orientation` / `'ontouchstart' in window` at
// module scope, so stub the browser globals before the IO module graph loads
// (the shared helper import above does that).

// IO's import graph touches DOM-only modules (PlatformBridge, Lobby/appEntry,
// SVG rendering). Stub them; the persistence logic under test only needs
// PlatformBridge.query + the MediaLib shape.
vi.mock('../../src/app/src/platform/PlatformBridge.ts', () => ({
    default: {
        query: vi.fn(),
        stmt: vi.fn(),
        database: 'projects',
        path: undefined,
    },
}));

vi.mock('../../src/app/src/lobby/Lobby.js', () => ({ default: {} }));
vi.mock('../../src/app/src/utils/SVG2Canvas.js', () => ({ default: {} }));
vi.mock('../../src/app/src/platform/MediaLib.ts', () => ({ default: mockMediaLib }));

import IO from '../../src/app/src/platform/IO.ts';
import PlatformBridge from '../../src/app/src/platform/PlatformBridge.ts';

describe('IO persistence helpers', () => {
    it('parseProjectData lowercases keys', () => {
        expect(IO.parseProjectData({ Name: 'Alpha', Mtime: '1' })).toEqual({ name: 'Alpha', mtime: '1' });
    });

    it('getExtension splits at the first dot', () => {
        expect(IO.getExtension('Cat.svg')).toBe('svg');
        expect(IO.getExtension('a.b.Cat.png')).toBe('b.Cat.png');
    });

    it('getFilename returns the stem before the first dot', () => {
        expect(IO.getFilename('Cat.svg')).toBe('Cat');
        expect(IO.getFilename('My.Page.svg')).toBe('My');
    });
});

describe('IO.uniqueProjectName (save round-trip naming)', () => {
    let project;

    beforeEach(() => {
        PlatformBridge.query.mockReset();
        project = { name: 'My project', version: 'v1' };
    });

    it('keeps a unique project name unchanged', async () => {
        PlatformBridge.query.mockImplementation((json, fcn) => fcn(JSON.stringify([])));
        await new Promise((resolve) => IO.uniqueProjectName(project, resolve));
        expect(project.name).toBe('My project');
    });

    it('renames an unnumbered duplicate to "name 2"', async () => {
        PlatformBridge.query.mockImplementation((json, fcn) => fcn(JSON.stringify([{ name: 'My project' }])));
        await new Promise((resolve) => IO.uniqueProjectName(project, resolve));
        expect(project.name).toBe('My project 2');
    });

    it('bumps a numbered duplicate above the highest existing number', async () => {
        PlatformBridge.query.mockImplementation((json, fcn) => fcn(JSON.stringify([{ name: 'My project 5' }])));
        await new Promise((resolve) => IO.uniqueProjectName(project, resolve));
        expect(project.name).toBe('My project 6');
    });

    it('appends " 1" when useOne is set and the name is unique', async () => {
        PlatformBridge.query.mockImplementation((json, fcn) => fcn(JSON.stringify([])));
        await new Promise((resolve) => IO.uniqueProjectName(project, resolve, true));
        expect(project.name).toBe('My project 1');
    });

    it('does not lower an existing numbered name (keeps gift numbering)', async () => {
        PlatformBridge.query.mockImplementation((json, fcn) => fcn(JSON.stringify([{ name: 'My project 2' }])));
        project.name = 'My project 3';
        await new Promise((resolve) => IO.uniqueProjectName(project, resolve));
        expect(project.name).toBe('My project 3');
    });
});

describe('IO.createProject (lobby visibility defaults)', () => {
    beforeEach(() => {
        PlatformBridge.stmt.mockReset();
        PlatformBridge.stmt.mockImplementation((json, fcn) => fcn && fcn(1));
    });

    it('writes ctime so the lobby ctime DESC ordering works', async () => {
        await new Promise((resolve) => IO.createProject({ name: 'Imported' }, resolve));
        const intent = PlatformBridge.stmt.mock.calls[0][0];
        expect(intent.op).toBe('insert');
        expect(intent.row.ctime).toMatch(/^\d{13}$/); // ms epoch
        expect(intent.row.mtime).toMatch(/^\d{13}$/);
    });

    it('defaults isgift to 0 and respects an explicit isgift', async () => {
        await new Promise((resolve) => IO.createProject({ name: 'A' }, resolve));
        await new Promise((resolve) => IO.createProject({ name: 'B', isgift: '1' }, resolve));
        expect(PlatformBridge.stmt.mock.calls[0][0].row.isgift).toBe('0');
        expect(PlatformBridge.stmt.mock.calls[1][0].row.isgift).toBe('1');
    });

    it('keeps a thumbnail when provided', async () => {
        const thumb = JSON.stringify({ pagecount: 1, md5: 'abc' });
        await new Promise((resolve) => IO.createProject({ name: 'C', thumbnail: thumb }, resolve));
        expect(PlatformBridge.stmt.mock.calls[0][0].row.thumbnail).toBe(thumb);
    });
});
