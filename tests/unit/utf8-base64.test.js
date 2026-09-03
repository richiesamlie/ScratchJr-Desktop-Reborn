// @vitest-environment jsdom
import "./renderer-harness.js";
import { describe, it, expect } from "vitest";
import { utf8ToBase64, base64ToUtf8 } from "../../src/app/src/utils/lib";

describe("UTF-8 Safe Base64 Serialization", () => {
    it("safely encodes and decodes standard ASCII", () => {
        const ascii = "<svg><circle cx=\"50\" cy=\"50\" r=\"40\"/></svg>";
        const encoded = utf8ToBase64(ascii);
        expect(encoded).toBe(btoa(ascii));
        expect(base64ToUtf8(encoded)).toBe(ascii);
    });

    it("prevents btoa crash on non-Latin1 characters (Chinese, Arabic, emojis)", () => {
        const unicodeStr = "<svg><text>你好世界 🐱🚀 مرحبا بالعالم café</text></svg>";
        
        // Standard btoa fails on characters with code points > 255
        expect(() => btoa(unicodeStr)).toThrow();

        // utf8ToBase64 succeeds without throwing
        let encoded = "";
        expect(() => {
            encoded = utf8ToBase64(unicodeStr);
        }).not.toThrow();
        expect(encoded.length).toBeGreaterThan(0);

        // Roundtrip fidelity
        const decoded = base64ToUtf8(encoded);
        expect(decoded).toBe(unicodeStr);
    });

    it("handles complex SVG text sprites with international scripts", () => {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="20" font-family="Arial">Bonjour le monde</text>
            <text x="10" y="40" font-family="Arial">Привет, мир!</text>
            <text x="10" y="60" font-family="Arial">こんにちは世界</text>
            <text x="10" y="80" font-family="Arial">ภาษาไทย</text>
        </svg>`;

        const b64 = utf8ToBase64(svgContent);
        expect(b64).toBeDefined();
        const restored = base64ToUtf8(b64);
        expect(restored).toBe(svgContent);
    });
});
