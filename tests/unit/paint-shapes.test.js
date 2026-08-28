// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SVGTools from '../../src/app/src/painteditor/SVGTools';
import Paint from '../../src/app/src/painteditor/Paint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Paint Editor Shapes & Palette Enhancements', () => {
    let mockParent;

    beforeEach(() => {
        mockParent = document.createElement('div');
        mockParent.id = 'layer1';
        document.body.appendChild(mockParent);
    });

    it('creates a straight line path via SVGTools.addLine', () => {
        const shape = SVGTools.addLine(mockParent, 50, 100);
        expect(shape).toBeDefined();
        expect(shape.tagName.toLowerCase()).toBe('path');
        expect(shape.getAttribute('d')).toBe('M50,100L50,100');
        expect(shape.getAttribute('opacity')).toBe('1');
        expect(shape.getAttribute('stroke-linecap')).toBe('round');
    });

    it('computes valid 5-pointed star SVG path via SVGTools.getStarPath', () => {
        const starD = SVGTools.getStarPath(100, 100, 30, 15);
        expect(starD).toBeDefined();
        expect(starD.startsWith('M')).toBe(true);
        expect(starD.endsWith('z')).toBe(true);
        // 5 outer points + 5 inner points = 10 segments + closing segment
        const commands = starD.match(/[ML]/g);
        expect(commands?.length).toBe(11);
    });

    it('creates a star path via SVGTools.addStar', () => {
        const shape = SVGTools.addStar(mockParent, 80, 80);
        expect(shape).toBeDefined();
        expect(shape.tagName.toLowerCase()).toBe('path');
        expect(shape.getAttribute('d')).toContain('M');
        expect(shape.getAttribute('d')).toContain('z');
    });

    it('validates color swatch list in Paint.initSwatchList', () => {
        const swatches = Paint.initSwatchList();
        expect(Array.isArray(swatches)).toBe(true);
        expect(swatches.length).toBeGreaterThanOrEqual(25);

        for (const color of swatches) {
            // Must be valid #RRGGBB format without leading/trailing whitespace
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(color.trim()).toBe(color);
        }
    });

    it('verifies paint CSS includes line and star tool classes', () => {
        const cssContent = fs.readFileSync(
            path.resolve(__dirname, '../../src/app/css/paintlook.css'),
            'utf8'
        );
        expect(cssContent).toContain('*.tool.line.on');
        expect(cssContent).toContain('*.tool.line.off');
        expect(cssContent).toContain('*.tool.star.on');
        expect(cssContent).toContain('*.tool.star.off');
        expect(cssContent).toContain('lineOn.svg');
        expect(cssContent).toContain('lineOff.svg');
        expect(cssContent).toContain('starOn.svg');
        expect(cssContent).toContain('starOff.svg');
    });
});
