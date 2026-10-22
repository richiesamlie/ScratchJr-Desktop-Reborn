// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import JSZip from 'jszip';
import IO from '../../src/app/src/platform/IO.ts';
import PlatformBridge from '../../src/app/src/platform/PlatformBridge.ts';

describe('SJR Project Import Resilience (Issue #15)', () => {
    let savedMedia = [];
    let createdProjects = [];

    beforeEach(() => {
        savedMedia = [];
        createdProjects = [];

        // Mock PlatformBridge media and database queries
        vi.spyOn(PlatformBridge, 'setmedianame').mockImplementation((b64data, name, ext, fcn) => {
            savedMedia.push({ name, ext, b64data });
            if (fcn) fcn();
        });

        vi.spyOn(PlatformBridge, 'setmedia').mockImplementation((b64data, ext, fcn) => {
            const md5 = `mock_${name}_thumb.${ext}`;
            if (fcn) fcn(md5);
        });

        vi.spyOn(PlatformBridge, 'stmt').mockImplementation((intent, fcn) => {
            if (fcn) fcn(1);
        });

        vi.spyOn(PlatformBridge, 'query').mockImplementation((intent, fcn) => {
            if (fcn) fcn(JSON.stringify([]));
        });

        vi.spyOn(IO, 'createProject').mockImplementation((record, fcn) => {
            createdProjects.push(record);
            if (fcn) fcn(1);
        });
    });

    it('imports ScratchJr v2.x and desktop-v2.x projects without version error', async () => {
        const zip = new JSZip();
        const projectData = {
            name: 'Modern Project',
            version: '2.13.1',
            json: {
                pages: ['page1'],
                page1: {
                    sprites: ['cat'],
                    cat: { type: 'sprite', md5: 'cat.svg', name: 'Cat' }
                }
            },
            thumbnail: { pagecount: 1, md5: 'thumb.png' }
        };

        const sampleSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100"/></svg>';
        zip.file('data.json', JSON.stringify(projectData));
        zip.file('cat.svg', sampleSvg);

        const b64 = await zip.generateAsync({ type: 'base64' });

        await expect(IO.loadProjectFromSjr(b64)).resolves.not.toThrow();
        expect(createdProjects.length).toBe(1);
        expect(createdProjects[0].name).toBe('Modern Project');
        expect(savedMedia.some(m => m.name === 'cat' && m.ext === 'svg')).toBe(true);
    });

    it('normalizes Windows backslashes in archive paths and locates data.json', async () => {
        const zip = new JSZip();
        const projectData = {
            name: 'Windows Path Project',
            version: '2.0.0',
            json: { pages: ['page1'], page1: { sprites: [] } },
            thumbnail: { pagecount: 1, md5: '' }
        };

        zip.file('myproject\\data.json', JSON.stringify(projectData));
        zip.file('myproject\\characters\\sprite.png', 'fake_png_data');
        zip.file('myproject\\sounds\\pop.wav', 'fake_wav_data');

        const b64 = await zip.generateAsync({ type: 'base64' });

        await expect(IO.loadProjectFromSjr(b64)).resolves.not.toThrow();
        expect(createdProjects.length).toBe(1);
        expect(createdProjects[0].name).toBe('Windows Path Project');
        expect(savedMedia.some(m => m.name === 'sprite' && m.ext === 'png')).toBe(true);
        expect(savedMedia.some(m => m.name === 'pop' && m.ext === 'wav')).toBe(true);
    });

    it('handles flat archive with root-level assets and infers subfolders from extension', async () => {
        const zip = new JSZip();
        const projectData = {
            name: 'Flat Archive Project',
            version: '1.2.0',
            json: { pages: ['page1'], page1: { sprites: [] } },
            thumbnail: { pagecount: 1, md5: '' }
        };

        zip.file('data.json', JSON.stringify(projectData));
        zip.file('sound.wav', 'audio_bytes');
        zip.file('cat.png', 'image_bytes');

        const b64 = await zip.generateAsync({ type: 'base64' });

        await expect(IO.loadProjectFromSjr(b64)).resolves.not.toThrow();
        expect(createdProjects.length).toBe(1);
        expect(createdProjects[0].name).toBe('Flat Archive Project');
        expect(savedMedia.some(m => m.name === 'sound' && m.ext === 'wav')).toBe(true);
        expect(savedMedia.some(m => m.name === 'cat' && m.ext === 'png')).toBe(true);
    });

    it('gracefully parses stringified json/thumbnail and defaults missing project name', async () => {
        const zip = new JSZip();
        const projectData = {
            version: '1.0.0',
            // Missing name property
            json: JSON.stringify({
                pages: ['page1'],
                page1: { sprites: [] }
            }),
            thumbnail: JSON.stringify({ pagecount: 1, md5: '' })
        };

        zip.file('data.json', JSON.stringify(projectData));

        const b64 = await zip.generateAsync({ type: 'base64' });

        await expect(IO.loadProjectFromSjr(b64)).resolves.not.toThrow();
        expect(createdProjects.length).toBe(1);
        expect(createdProjects[0].name).toBe('Project');
    });

    it('isolates corrupted assets and completes the remaining import', async () => {
        const zip = new JSZip();
        const projectData = {
            name: 'Resilient Project',
            version: '2.0.0',
            json: { pages: ['page1'], page1: { sprites: [] } },
            thumbnail: { pagecount: 1, md5: '' }
        };

        zip.file('data.json', JSON.stringify(projectData));
        zip.file('good.png', 'good_bytes');
        zip.file('broken.wav', 'broken_bytes');

        // Make PlatformBridge.setmedianame throw on broken.wav
        vi.spyOn(PlatformBridge, 'setmedianame').mockImplementation((b64data, name, ext, fcn) => {
            if (name === 'broken') {
                throw new Error('Disk write error on broken.wav');
            }
            savedMedia.push({ name, ext, b64data });
            if (fcn) fcn();
        });

        const b64 = await zip.generateAsync({ type: 'base64' });

        // Must still succeed without throwing
        await expect(IO.loadProjectFromSjr(b64)).resolves.not.toThrow();
        expect(createdProjects.length).toBe(1);
        expect(createdProjects[0].name).toBe('Resilient Project');
        expect(savedMedia.some(m => m.name === 'good' && m.ext === 'png')).toBe(true);
    });

    it('rejects archive when data.json is missing', async () => {
        const zip = new JSZip();
        zip.file('unrelated.txt', 'hello');

        const b64 = await zip.generateAsync({ type: 'base64' });

        await expect(IO.loadProjectFromSjr(b64)).rejects.toThrow('No data.json found in project archive.');
    });

    it('rejects archive when data.json is malformed JSON', async () => {
        const zip = new JSZip();
        zip.file('data.json', 'this is not json');

        const b64 = await zip.generateAsync({ type: 'base64' });

        await expect(IO.loadProjectFromSjr(b64)).rejects.toThrow('Project archive data.json is not valid JSON.');
    });

    it('rejects archive when compressed payload exceeds 50MB limit', async () => {
        const hugeFakeB64 = { length: 70 * 1024 * 1024 };
        await expect(IO.loadProjectFromSjr(hugeFakeB64)).rejects.toThrow('This project file is too big to open.');
    });

    it('rejects archive with more than 2000 entries', async () => {
        const zip = new JSZip();
        zip.file('data.json', '{}');
        for (let i = 0; i <= 2000; i++) {
            zip.file(`asset_${i}.png`, '');
        }
        const b64 = await zip.generateAsync({ type: 'base64' });
        await expect(IO.loadProjectFromSjr(b64)).rejects.toThrow('This project file is too big to open (too many files).');
    });

    it('rejects archive when total uncompressed size exceeds 200MB limit', async () => {
        const zip = new JSZip();
        zip.file('data.json', '{}');
        const b64 = await zip.generateAsync({ type: 'base64' });
        const loaded = await JSZip.loadAsync(b64, { base64: true });
        loaded.file('huge.bin', '');
        loaded.files['huge.bin']._data = {
            uncompressedSize: 201 * 1024 * 1024,
            compressedSize: 10,
            crc32: 0,
            compression: null,
            compressedContent: null,
        };
        vi.spyOn(JSZip, 'loadAsync').mockResolvedValueOnce(loaded);

        await expect(IO.loadProjectFromSjr(b64)).rejects.toThrow('This project file is too big to open.');
    });

    it('rejects archive containing directory traversal or unsafe filenames', async () => {
        const zip1 = new JSZip();
        zip1.file('data.json', '{}');
        zip1.file('../traversal.png', 'fake');
        const b64_1 = await zip1.generateAsync({ type: 'base64' });
        await expect(IO.loadProjectFromSjr(b64_1)).rejects.toThrow('Project archive contains invalid file names.');

        const zip2 = new JSZip();
        zip2.file('data.json', '{}');
        zip2.file('bad*name.png', 'fake');
        const b64_2 = await zip2.generateAsync({ type: 'base64' });
        await expect(IO.loadProjectFromSjr(b64_2)).rejects.toThrow('Project archive contains invalid file names.');
    });

    it('PlatformBridge.flushDatabase delegates to window.tablet.database_flush and resolves', async () => {
        const flushSpy = vi.fn().mockReturnValue(Promise.resolve());
        window.tablet.database_flush = flushSpy;

        await expect(PlatformBridge.flushDatabase()).resolves.toBeUndefined();
        expect(flushSpy).toHaveBeenCalled();
    });
});
