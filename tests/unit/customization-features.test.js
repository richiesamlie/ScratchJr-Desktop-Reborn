// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach } from 'vitest';
import { CURATED_FONTS, getFontById, getFontFamilyById, getDefaultFont } from '../../src/app/src/utils/FontList';
import SVGTools from '../../src/app/src/painteditor/SVGTools';
import SVG2Canvas from '../../src/app/src/utils/SVG2Canvas';
import Transform from '../../src/app/src/painteditor/Transform';
import Lobby from '../../src/app/src/lobby/Lobby';
import Localization from '../../src/app/src/utils/Localization';

describe('Issue #10 Customization Features: Curated Fonts, Paint Text Tool, Settings Themes', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        const store = {};
        globalThis.localStorage = {
            getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            removeItem: (k) => { delete store[k]; },
            clear: () => { Object.keys(store).forEach(k => delete store[k]); }
        };
        window.localStorage = globalThis.localStorage;
        window.Settings = {
            defaultTheme: 'light',
            textSpriteFont: 'Roboto',
            defaultLocale: 'en',
            supportedLocales: { 'English': 'en', 'Español': 'es' }
        };
    });

    describe('1. Curated Built-in Fonts System', () => {
        it('provides a curated list of child-friendly fonts', () => {
            expect(Array.isArray(CURATED_FONTS)).toBe(true);
            expect(CURATED_FONTS.length).toBeGreaterThanOrEqual(5);

            const ids = CURATED_FONTS.map(f => f.id);
            expect(ids).toContain('roboto');
            expect(ids).toContain('verdana');
            expect(ids).toContain('playful');
            expect(ids).toContain('storybook');
            expect(ids).toContain('easyread');
        });

        it('resolves fonts and fallback font correctly', () => {
            const playful = getFontById('playful');
            expect(playful.name).toBe('Playful');
            expect(playful.fontFamily).toContain('Comic');

            const fallback = getFontById('non-existent-font');
            expect(fallback).toBe(getDefaultFont());
            expect(fallback.id).toBe('roboto');

            const family = getFontFamilyById('storybook');
            expect(family).toContain('Georgia');
        });
    });

    describe('2. Paint Editor Text Tool & Vector Support', () => {
        let mockLayer;

        beforeEach(() => {
            mockLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            mockLayer.id = 'layer1';
            document.body.appendChild(mockLayer);
        });

        it('creates a compliant SVG text node via SVGTools.addText', () => {
            const textNode = SVGTools.addText(mockLayer, 100, 150, 'Hello ScratchJr', 34, 'Georgia, serif', '#FF0000');
            expect(textNode).toBeDefined();
            expect(textNode.tagName.toLowerCase()).toBe('text');
            expect(textNode.getAttribute('x')).toBe('100');
            expect(textNode.getAttribute('y')).toBe('150');
            expect(textNode.getAttribute('font-size')).toBe('34');
            expect(textNode.getAttribute('font-family')).toBe('Georgia, serif');
            expect(textNode.getAttribute('fill')).toBe('#FF0000');
            expect(textNode.textContent).toBe('Hello ScratchJr');
            expect(mockLayer.contains(textNode)).toBe(true);
        });

        it('calculates bounding box and area for SVG text nodes', () => {
            const textNode = SVGTools.addText(mockLayer, 20, 30, 'Scratch Cat', 30, 'Roboto', '#0000FF');
            const box = SVGTools.getBox(textNode);
            expect(box).toBeDefined();
            expect(box.width).toBeGreaterThan(0);
            expect(box.height).toBeGreaterThan(0);

            const area = SVGTools.getArea(textNode);
            expect(area).toBeGreaterThan(0);
        });

        it('translates text elements correctly via Transform.translateTo', () => {
            const textNode = SVGTools.addText(mockLayer, 50, 60, 'Movable Text', 28, 'Roboto', '#000');
            const mockMatrix = { a: 1, b: 0, c: 0, d: 1, e: 25, f: 35 };
            const xform = { matrix: mockMatrix };

            Transform.translateTo(textNode, xform);
            expect(Number(textNode.getAttribute('x'))).toBe(75);
            expect(Number(textNode.getAttribute('y'))).toBe(95);
        });

        it('rasterizes text nodes via SVG2Canvas.drawText with correct font and coordinates', () => {
            const textNode = SVGTools.addText(mockLayer, 40, 50, 'Render Me', 32, 'Verdana', '#008800');
            const fillTextCalls = [];
            const mockCtx = {
                font: '',
                fillStyle: '',
                textAlign: '',
                textBaseline: '',
                save: () => {},
                restore: () => {},
                fillText: (str, x, y) => {
                    fillTextCalls.push({ str, x, y, font: mockCtx.font, fillStyle: mockCtx.fillStyle });
                }
            };

            SVG2Canvas.drawText(textNode, mockCtx);
            expect(fillTextCalls.length).toBe(1);
            expect(fillTextCalls[0].str).toBe('Render Me');
            expect(fillTextCalls[0].x).toBe(40);
            expect(fillTextCalls[0].y).toBe(50);
            expect(fillTextCalls[0].font).toContain('32px');
            expect(fillTextCalls[0].font).toContain('Verdana');
            expect(fillTextCalls[0].fillStyle).toBe('#008800');
        });
    });

    describe('3. Themes in Settings (Lobby)', () => {
        beforeEach(() => {
            const topsection = document.createElement('div');
            topsection.id = 'topsection';
            const footer = document.createElement('div');
            footer.id = 'footer';
            const wrapc = document.createElement('div');
            wrapc.id = 'wrapc';
            document.body.appendChild(topsection);
            document.body.appendChild(footer);
            document.body.appendChild(wrapc);
        });

        it('renders theme selector buttons in Lobby.loadSettings', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            Lobby.loadSettings(container);

            const themeRadiogroup = container.querySelector('.theme-settings-buttons');
            expect(themeRadiogroup).not.toBeNull();

            const themeButtons = themeRadiogroup.querySelectorAll('.localizationselect');
            expect(themeButtons.length).toBe(3);

            const buttonLabels = Array.from(themeButtons).map(b => b.textContent);
            expect(buttonLabels.some(l => l.includes('Light'))).toBe(true);
            expect(buttonLabels.some(l => l.includes('Dark'))).toBe(true);
            expect(buttonLabels.some(l => l.includes('Classic'))).toBe(true);
        });

        it('updates localStorage and dataset.theme on selecting a theme', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            Lobby.loadSettings(container);

            const themeRadiogroup = container.querySelector('.theme-settings-buttons');
            const themeButtons = themeRadiogroup.querySelectorAll('.localizationselect');
            const darkButton = Array.from(themeButtons).find(b => b.textContent.includes('Dark'));

            expect(darkButton).toBeDefined();
            darkButton.onmousedown(new MouseEvent('mousedown'));

            expect(localStorage.getItem('scratchjr-theme')).toBe('dark');
            expect(document.documentElement.dataset.theme).toBe('dark');
            expect(darkButton.classList.contains('selected')).toBe(true);
        });
    });

    describe('4. Text Sprite Font Customization & Serialization', () => {
        it('serializes fontFamily in getTextBoxData', async () => {
            const SpriteModule = await import('../../src/app/src/editor/engine/Sprite');
            const Sprite = SpriteModule.default;
            const spr = Object.create(Sprite.prototype);
            spr.shown = true;
            spr.type = 'text';
            spr.id = 'test-text-1';
            spr.speed = 0;
            spr.cx = 0;
            spr.cy = 0;
            spr.w = 100;
            spr.h = 40;
            spr.xcoor = 120;
            spr.ycoor = 140;
            spr.homex = 120;
            spr.homey = 140;
            spr.str = 'Playful Text';
            spr.color = '#FF0000';
            spr.fontsize = 36;
            spr.fontFamily = 'Comic Neue, sans-serif';

            const data = spr.getTextBoxData();
            expect(data.fontFamily).toBe('Comic Neue, sans-serif');
            expect(data.str).toBe('Playful Text');
            expect(data.fontsize).toBe(36);
        });
    });
});
