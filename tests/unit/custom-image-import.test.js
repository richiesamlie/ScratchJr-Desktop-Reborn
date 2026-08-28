// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach } from 'vitest';
import Library from '../../src/app/src/editor/ui/Library';
import { gn } from '../../src/app/src/utils/lib';
import { stubMedia } from './helpers/editor-fixtures.js';

describe('Custom Image Import (Characters & Backdrops)', () => {
    beforeEach(() => {
        stubMedia();
        document.body.innerHTML = `
            <div id="libframe" class="libframe">
                <div id="topbar" class="topbar">
                    <div id="libactions" class="actions"></div>
                    <div class="assetname-container"><div class="assetname"><p id="assetname"></p></div></div>
                </div>
            </div>
            <div id="htmlcontents"></div>
        `;
    });

    it('sanitizes imported image filenames into clean character/backdrop names', () => {
        expect(Library.sanitizeImportName('Cute Cat.png')).toBe('Cute Cat');
        expect(Library.sanitizeImportName('Dragon_Fly_2026.svg')).toBe('Dragon_Fly_');
        expect(Library.sanitizeImportName('12345.jpg')).toBe('Character');
        expect(Library.sanitizeImportName('My Space Hero!.jpeg')).toBe('My Space Hero');
    });

    it('initializes library header with import button and hidden file input', () => {
        Library.layoutHeader();
        const importBtn = gn('library_importme');
        const fileInput = gn('library_file_input');

        expect(importBtn).not.toBeNull();
        expect(importBtn.className).toContain('importicon');
        expect(fileInput).not.toBeNull();
        expect(fileInput.getAttribute('accept')).toContain('.png');
        expect(fileInput.getAttribute('accept')).toContain('.svg');
    });
});
