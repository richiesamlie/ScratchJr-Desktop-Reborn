// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SoundLib from '../../src/app/src/utils/SoundLib';
import SoundPicker from '../../src/app/src/editor/ui/SoundPicker';
import ScratchAudio from '../../src/app/src/utils/ScratchAudio';
import ScratchJr from '../../src/app/src/editor/ScratchJr';
import Palette from '../../src/app/src/editor/ui/Palette';
import { gn, libInit } from '../../src/app/src/utils/lib';

describe('SoundLib & Curated Sound Library', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="frame" class="frame"></div><div id="backdrop" class="modal-backdrop fade" style="display: none;"></div>';
        libInit();
        SoundLib.init();
    });

    it('contains all 16 curated sounds across 3 categories', () => {
        const all = SoundLib.getAllSounds();
        expect(all.length).toBe(16);

        const animals = SoundLib.getSoundsByCategory('animals');
        expect(animals.length).toBe(6);
        expect(animals.map((s) => s.name)).toEqual(['cat.wav', 'dog.wav', 'bird.wav', 'frog.wav', 'cow.wav', 'duck.wav']);

        const instruments = SoundLib.getSoundsByCategory('instruments');
        expect(instruments.length).toBe(5);
        expect(instruments.map((s) => s.name)).toEqual(['drum.wav', 'piano.wav', 'trumpet.wav', 'bell.wav', 'xylophone.wav']);

        const fx = SoundLib.getSoundsByCategory('fx');
        expect(fx.length).toBe(5);
        expect(fx.map((s) => s.name)).toEqual(['boing.wav', 'splash.wav', 'magic.wav', 'carhorn.wav', 'cheer.wav']);
    });

    it('correctly identifies library sounds and provides labels and icons', () => {
        expect(SoundLib.isLibrarySound('cat.wav')).toBe(true);
        expect(SoundLib.isLibrarySound('drum.wav')).toBe(true);
        expect(SoundLib.isLibrarySound('cheer.wav')).toBe(true);
        expect(SoundLib.isLibrarySound('unknown.wav')).toBe(false);

        expect(SoundLib.getLabel('cat.wav')).toBe('Cat');
        expect(SoundLib.getLabel('piano.wav')).toBe('Piano');

        const catIcon = SoundLib.getIcon('cat.wav');
        expect(catIcon).not.toBeNull();
        expect(catIcon.src).toContain('assets/blockicons/cat_icon.svg');
    });

    it('ScratchAudio.loadProjectSound resolves library sounds from HTML5/sounds/ directory', () => {
        const loadLocalSpy = vi.spyOn(ScratchAudio, 'loadFromLocal').mockImplementation(() => {});
        ScratchAudio.loadProjectSound('drum.wav');
        expect(loadLocalSpy).toHaveBeenCalledWith('HTML5/sounds/', 'drum.wav', undefined);
        loadLocalSpy.mockRestore();
    });
});

describe('SoundPicker UI Modal', () => {
    let mockSprite;
    let mockPage;

    beforeEach(() => {
        document.body.innerHTML = '<div id="frame" class="frame"></div><div id="backdrop" class="modal-backdrop fade" style="display: none;"></div>';
        libInit();
        SoundPicker.init();

        mockPage = { id: 'page1' };
        const pageDiv = document.createElement('div');
        pageDiv.page = mockPage;

        const sprDiv = document.createElement('div');
        pageDiv.appendChild(sprDiv);

        mockSprite = {
            id: 'sprite1',
            sounds: ['pop.mp3'],
            div: sprDiv
        };
        sprDiv.sprite = mockSprite;

        ScratchJr.getSprite = () => mockSprite;
        ScratchJr.stopStrips = () => {};
        ScratchJr.storyStart = () => {};
        ScratchJr.onBackButtonCallback.length = 0;
        vi.spyOn(Undo, 'record').mockImplementation(() => {});
        vi.spyOn(Palette, 'selectCategory').mockImplementation(() => {});
        vi.spyOn(ScratchAudio, 'loadProjectSound').mockImplementation(() => {});
        vi.spyOn(ScratchAudio, 'sndFX').mockImplementation(() => {});
    });

    it('mounts soundpicker dialog outside frame', () => {
        const dlg = gn('soundpicker');
        expect(dlg).not.toBeNull();
        expect(dlg.parentElement).toBe(document.body);
    });

    it('open() displays backdrop and soundpicker with sound cards', () => {
        SoundPicker.open();
        expect(SoundPicker.dialogOpen).toBe(true);

        const dlg = gn('soundpicker');
        const bd = gn('backdrop');
        expect(dlg.className).toContain('in');
        expect(bd.className).toContain('in');

        const cards = dlg.querySelectorAll('.soundpicker-card');
        expect(cards.length).toBeGreaterThan(0);
    });

    it('switchCategory() swaps rendered cards between categories', () => {
        SoundPicker.open();
        SoundPicker.switchCategory('instruments');

        const dlg = gn('soundpicker');
        const cards = dlg.querySelectorAll('.soundpicker-card');
        expect(cards.length).toBe(5); // 5 instruments
        expect(cards[0].getAttribute('data-sound')).toBe('drum.wav');
    });

    it('confirmAndAdd() adds selected sound to sprite and notifies palette', () => {
        SoundPicker.open();
        SoundPicker.switchCategory('animals'); // first sound is cat.wav
        SoundPicker.confirmAndAdd();

        expect(mockSprite.sounds).toContain('cat.wav');
        expect(SoundPicker.dialogOpen).toBe(false);
        expect(Palette.selectCategory).toHaveBeenCalledWith(3);
    });

    it('confirmAndAdd() enforces 6 sound slot maximum', () => {
        mockSprite.sounds = ['pop.mp3', 's1', 's2', 's3', 's4', 's5']; // 6 sounds
        SoundPicker.open();
        SoundPicker.switchCategory('instruments');
        SoundPicker.confirmAndAdd();

        expect(mockSprite.sounds.length).toBe(6);
        expect(mockSprite.sounds).not.toContain('drum.wav');
    });
});

describe('Cross-Platform Audio Parity & Seams', () => {
    it('all 16 curated sound wavs exist in canonical source directory and downstream targets when built', async () => {
        const fs = await import('fs');
        const path = await import('path');
        const root = path.resolve(__dirname, '../..');
        const sounds = SoundLib.getAllSounds();

        const srcSounds = path.join(root, 'src', 'app', 'sounds');
        expect(fs.existsSync(srcSounds)).toBe(true);
        for (const s of sounds) {
            const p = path.join(srcSounds, s.name);
            expect(fs.existsSync(p)).toBe(true);
            const stat = fs.statSync(p);
            expect(stat.size).toBeGreaterThan(1000); // non-empty, valid WAV file
        }

        const buildTargets = [
            path.join(root, 'android', 'app', 'src', 'main', 'assets', 'www', 'sounds'),
            path.join(root, 'dist-web', 'app', 'sounds')
        ];
        for (const targetDir of buildTargets) {
            if (fs.existsSync(targetDir)) {
                for (const s of sounds) {
                    const p = path.join(targetDir, s.name);
                    expect(fs.existsSync(p)).toBe(true);
                }
            }
        }
    });

    it('ScratchAudio.soundDone clears playing state on target sound', () => {
        const mockSnd = { name: 'cat.wav', playing: true };
        ScratchAudio.projectSounds['cat.wav'] = mockSnd;
        ScratchAudio.soundDone('cat.wav');
        expect(mockSnd.playing).toBe(false);
    });
});
