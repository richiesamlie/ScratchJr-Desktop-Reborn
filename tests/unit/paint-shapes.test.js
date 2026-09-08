// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SVGTools from '../../src/app/src/painteditor/SVGTools';
import Paint from '../../src/app/src/painteditor/Paint';
import PaintAction from '../../src/app/src/painteditor/PaintAction';

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

    it('extracts raw viewport event coordinates via PaintAction.getScreenPt', () => {
        const mc = document.createElement('div');
        mc.id = 'maincanvas';
        document.body.appendChild(mc);

        const mockEvt = {
            clientX: 250,
            clientY: 180,
            preventDefault: () => {},
            stopPropagation: () => {}
        };

        const pt = PaintAction.getScreenPt(mockEvt);
        expect(pt.x).toBe(250);
        expect(pt.y).toBe(180);
    });

    it('transforms coordinates via SVG matrix in PaintAction.zoomPt when SVG root is available', () => {
        const mc = document.createElement('div');
        mc.id = 'maincanvas';
        document.body.appendChild(mc);

        // Mock SVG root with getScreenCTM and createSVGPoint
        const svgMock = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgMock.createSVGPoint = () => ({
            x: 0,
            y: 0,
            matrixTransform (matrix) {
                // Apply matrix inverse simulation: scale factor 2
                return { x: this.x * matrix.a + matrix.e, y: this.y * matrix.d + matrix.f };
            }
        });
        svgMock.getScreenCTM = () => ({
            a: 0.5, b: 0, c: 0, d: 0.5, e: 0, f: 0,
            inverse () {
                return { a: 2, b: 0, c: 0, d: 2, e: -20, f: -10 };
            }
        });

        // Set Paint root getter mock or attach to Paint
        const origRoot = Paint.root;
        Object.defineProperty(Paint, 'root', { value: svgMock, configurable: true });

        const transformed = PaintAction.zoomPt({ x: 100, y: 150 });
        expect(transformed.x).toBe(180); // 100 * 2 - 20
        expect(transformed.y).toBe(290); // 150 * 2 - 10

        Object.defineProperty(Paint, 'root', { value: origRoot, configurable: true });
    });
});
