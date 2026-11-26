// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { sanitizeSvgElement, sanitizeSvgString } from '../../src/app/src/utils/svgSanitizer.ts';

describe('SVG Sanitizer (src/app/src/utils/svgSanitizer.ts)', () => {
    it('strips dangerous elements and keeps benign graphics intact', () => {
        const dirty = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">',
            '<script>alert(1)</script>',
            '<foreignObject><div>bad</div></foreignObject>',
            '<iframe src="https://evil.example"></iframe>',
            '<object data="x"></object>',
            '<embed src="x"/>',
            '<style>rect { fill: url(https://evil.example/x); }</style>',
            '<use href="#other"/>',
            '<animate attributeName="x" from="0" to="10"/>',
            '<set attributeName="x" to="10"/>',
            '<audio src="x.mp3"/>',
            '<video src="x.mp4"/>',
            '<rect id="safe-rect" width="40" height="40" fill="#ff0000"/>',
            '</svg>',
        ].join('');

        const cleaned = sanitizeSvgString(dirty);
        const doc = new DOMParser().parseFromString(cleaned, 'text/xml');
        const root = doc.documentElement;

        for (const tag of ['script', 'foreignObject', 'iframe', 'object', 'embed', 'style', 'use', 'animate', 'set', 'audio', 'video']) {
            expect(root.getElementsByTagName(tag).length, `tag ${tag} should be stripped`).toBe(0);
        }
        expect(root.getElementById('safe-rect')).not.toBeNull();
    });

    it('strips all inline on* event handler attributes regardless of casing', () => {
        const dirty = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><g ONERROR="x()" onclick="y()"><circle r="10"/></g></svg>';
        const cleaned = sanitizeSvgString(dirty);
        expect(cleaned.toLowerCase()).not.toContain('onload');
        expect(cleaned.toLowerCase()).not.toContain('onerror');
        expect(cleaned.toLowerCase()).not.toContain('onclick');
        expect(cleaned).toContain('<circle');
    });

    it('rejects unsafe href/xlink:href schemes including data:image/svg+xml and control-char obfuscation', () => {
        const unsafeRefs = [
            'javascript:alert(1)',
            'java\t\n script:alert(1)',
            'vbscript:msgbox(1)',
            'http://evil.example/a.png',
            'https://evil.example/a.png',
            'file:///etc/passwd',
            '//evil.example/a.png',
            'data:image/svg+xml;base64,PHN2Zz48c2NyaXB0Lz48L3N2Zz4=',
        ];

        for (const ref of unsafeRefs) {
            const doc = new DOMParser().parseFromString(
                `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image width="10" height="10"/></svg>`,
                'text/xml'
            );
            const img = doc.documentElement.getElementsByTagName('image')[0];
            img.setAttribute('href', ref);
            img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', ref);
            sanitizeSvgElement(doc.documentElement);
            expect(img.getAttribute('href'), `href=${ref} must be stripped`).toBeNull();
            expect(img.getAttributeNS('http://www.w3.org/1999/xlink', 'href'), `xlink:href=${ref} must be stripped`).toBeNull();
        }

        // Verify control-char obfuscation directly via DOM setAttribute
        const docCtrl = new DOMParser().parseFromString(
            '<svg xmlns="http://www.w3.org/2000/svg"><image width="10" height="10"/></svg>',
            'text/xml'
        );
        const imgCtrl = docCtrl.documentElement.getElementsByTagName('image')[0];
        imgCtrl.setAttribute('href', 'java\x00script:alert(1)');
        sanitizeSvgElement(docCtrl.documentElement);
        expect(imgCtrl.getAttribute('href')).toBeNull();
    });

    it('preserves safe fragment and raster data URI hrefs', () => {
        const safeSvg = [
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
            '<image id="pngImg" href="data:image/png;base64,iVBORw0KGgo=" width="10" height="10"/>',
            '<image id="jpgImg" xlink:href="data:image/jpeg;base64,/9j/4AAQ" width="10" height="10"/>',
            '<linearGradient id="grad1"/>',
            '<linearGradient id="grad2" href="#grad1"/>',
            '</svg>',
        ].join('');

        const cleaned = sanitizeSvgString(safeSvg);
        const doc = new DOMParser().parseFromString(cleaned, 'text/xml');
        expect(doc.getElementById('pngImg')?.getAttribute('href')).toBe('data:image/png;base64,iVBORw0KGgo=');
        expect(doc.getElementById('jpgImg')?.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('data:image/jpeg;base64,/9j/4AAQ');
        expect(doc.getElementById('grad2')?.getAttribute('href')).toBe('#grad1');
    });

    it('strips unsafe inline style attributes while keeping benign paint styles', () => {
        const dirty = [
            '<svg xmlns="http://www.w3.org/2000/svg">',
            '<rect id="bad1" style="background:url(https://evil.example/leak.png)"/>',
            '<rect id="bad2" style="fill:url(data:image/svg+xml;base64,PHN2Zz4=)"/>',
            '<rect id="bad3" style="width:expression(alert(1))"/>',
            '<rect id="bad4" style="background:javascript:alert(1)"/>',
            '<path id="good1" d="M0 0 L10 10" style="pointer-events:visiblePainted;"/>',
            '<rect id="good2" style="clip-path:url(#mask1);fill:#123456;"/>',
            '</svg>',
        ].join('');

        const cleaned = sanitizeSvgString(dirty);
        const doc = new DOMParser().parseFromString(cleaned, 'text/xml');
        expect(doc.getElementById('bad1')?.getAttribute('style')).toBeNull();
        expect(doc.getElementById('bad2')?.getAttribute('style')).toBeNull();
        expect(doc.getElementById('bad3')?.getAttribute('style')).toBeNull();
        expect(doc.getElementById('bad4')?.getAttribute('style')).toBeNull();
        expect(doc.getElementById('good1')?.getAttribute('style')).toBe('pointer-events:visiblePainted;');
        expect(doc.getElementById('good2')?.getAttribute('style')).toBe('clip-path:url(#mask1);fill:#123456;');
    });

    it('falls back to regex sanitization on malformed XML input', () => {
        const malformed = '<svg><rect id="r1" onclick="alert(1)" style="fill:url(https://evil.com/x)" href="data:image/svg+xml;base64,AAA"/><script>evil()</script><unclosed>';
        const cleaned = sanitizeSvgString(malformed);
        expect(cleaned).not.toContain('<script');
        expect(cleaned).not.toContain('onclick');
        expect(cleaned).not.toContain('https://evil.com');
        expect(cleaned).not.toContain('data:image/svg+xml');
        expect(cleaned).toContain('<rect id="r1"');
    });

    it('preserves real bundled SVGs in src/app/svglibrary without breaking geometry', () => {
        const svgDir = path.resolve(__dirname, '../../src/app/svglibrary');
        const allSvgs = fs.readdirSync(svgDir).filter((f) => f.endsWith('.svg')).sort();
        const sample = Array.from(new Set([
            ...allSvgs.filter((f) => f === 'Cat.svg' || f === 'Blue.svg'),
            ...allSvgs.slice(0, 20),
        ]));
        expect(sample.length).toBeGreaterThan(10);

        for (const file of sample) {
            const raw = fs.readFileSync(path.join(svgDir, file), 'utf8');
            const cleaned = sanitizeSvgString(raw);
            expect(cleaned, `${file} should sanitize to non-empty SVG`).toContain('<svg');
            const doc = new DOMParser().parseFromString(cleaned, 'text/xml');
            expect(doc.getElementsByTagName('parsererror').length, `${file} should parse cleanly after sanitization`).toBe(0);
            expect(doc.documentElement.children.length, `${file} should retain child graphics`).toBeGreaterThan(0);
        }
    });
});
