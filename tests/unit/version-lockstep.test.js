import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { checkVersionLockstep } = require('../../scripts/check-version-lockstep.js');
const pkg = require('../../package.json');

describe('Version Lockstep Check (scripts/check-version-lockstep.js)', () => {
    const tempDirs = [];

    afterEach(() => {
        while (tempDirs.length > 0) {
            const dir = tempDirs.pop();
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    function createValidFixture(version = '2.15.1') {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sjr-lockstep-'));
        tempDirs.push(root);

        const [maj, min, pat] = version.split('.').map(Number);
        const versionCode = maj * 10000 + min * 100 + pat;

        fs.mkdirSync(path.join(root, 'src', 'app'), { recursive: true });
        fs.mkdirSync(path.join(root, 'src-tauri'), { recursive: true });
        fs.mkdirSync(path.join(root, 'android', 'app'), { recursive: true });
        fs.mkdirSync(path.join(root, 'docs'), { recursive: true });

        fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'ScratchJr', version }, null, 2));
        fs.writeFileSync(
            path.join(root, 'package-lock.json'),
            JSON.stringify({ name: 'ScratchJr', version, packages: { '': { version } } }, null, 2)
        );
        fs.writeFileSync(
            path.join(root, 'version.json'),
            JSON.stringify({
                version,
                name: `ScratchJr Reborn v${version}`,
                release_url: `https://github.com/example/repo/releases/tag/v${version}`,
                downloads: {
                    win: `https://github.com/example/repo/releases/download/v${version}/app.zip`,
                },
            }, null, 2)
        );
        fs.writeFileSync(
            path.join(root, 'src', 'app', 'settings.json'),
            JSON.stringify({ scratchJrVersion: `desktop-v${version}` }, null, 2)
        );
        fs.writeFileSync(
            path.join(root, 'src', 'app', 'sw.js'),
            `var CACHE_NAME = 'scratchjr-pwa-v${version}';\n`
        );
        fs.writeFileSync(
            path.join(root, 'src-tauri', 'Cargo.toml'),
            `[package]\nname = "scratchjr"\nversion = "${version}"\n`
        );
        fs.writeFileSync(
            path.join(root, 'src-tauri', 'tauri.conf.json'),
            JSON.stringify({ productName: 'ScratchJr', version }, null, 2)
        );
        fs.writeFileSync(
            path.join(root, 'android', 'app', 'build.gradle.kts'),
            `android {\n    defaultConfig {\n        versionCode = ${versionCode}\n        versionName = "${version}"\n    }\n}\n`
        );
        fs.writeFileSync(
            path.join(root, 'docs', 'index.html'),
            `<a href="https://github.com/example/repo/releases/download/v${version}/app.zip">Download</a>\n`
        );

        return root;
    }

    it('passes on the real repository root', () => {
        const res = checkVersionLockstep();
        expect(res.ok, res.errors.join('\n')).toBe(true);
        expect(res.version).toBe(pkg.version);
        expect(res.checks).toHaveLength(9);
    });

    it('accepts matching expectedTag and rejects mismatched expectedTag', () => {
        const okRes = checkVersionLockstep({ expectedTag: `v${pkg.version}` });
        expect(okRes.ok).toBe(true);

        const failRes = checkVersionLockstep({ expectedTag: 'v9.9.9' });
        expect(failRes.ok).toBe(false);
        expect(failRes.errors.some((e) => e.includes('v9.9.9'))).toBe(true);
    });

    it('detects drift in sw.js, android versionCode, docs/index.html, and package-lock.json', () => {
        const fixture = createValidFixture('2.15.1');
        expect(checkVersionLockstep({ rootDir: fixture }).ok).toBe(true);

        // Drift sw.js
        fs.writeFileSync(path.join(fixture, 'src', 'app', 'sw.js'), "var CACHE_NAME = 'scratchjr-pwa-v2.14.0';\n");
        let res = checkVersionLockstep({ rootDir: fixture });
        expect(res.ok).toBe(false);
        expect(res.errors.some((e) => e.includes('src/app/sw.js'))).toBe(true);

        // Restore sw.js, drift Android versionCode
        fs.writeFileSync(path.join(fixture, 'src', 'app', 'sw.js'), "var CACHE_NAME = 'scratchjr-pwa-v2.15.1';\n");
        fs.writeFileSync(
            path.join(fixture, 'android', 'app', 'build.gradle.kts'),
            'android {\n    defaultConfig {\n        versionCode = 21500\n        versionName = "2.15.1"\n    }\n}\n'
        );
        res = checkVersionLockstep({ rootDir: fixture });
        expect(res.ok).toBe(false);
        expect(res.errors.some((e) => e.includes('android/app/build.gradle.kts'))).toBe(true);

        // Restore Android, drift docs/index.html
        fs.writeFileSync(
            path.join(fixture, 'android', 'app', 'build.gradle.kts'),
            'android {\n    defaultConfig {\n        versionCode = 21501\n        versionName = "2.15.1"\n    }\n}\n'
        );
        fs.writeFileSync(
            path.join(fixture, 'docs', 'index.html'),
            '<a href="https://github.com/example/repo/releases/download/v2.15.0/app.zip">Download</a>\n'
        );
        res = checkVersionLockstep({ rootDir: fixture });
        expect(res.ok).toBe(false);
        expect(res.errors.some((e) => e.includes('docs/index.html'))).toBe(true);

        // Restore docs/index.html, drift package-lock.json packages[""].version
        fs.writeFileSync(
            path.join(fixture, 'docs', 'index.html'),
            '<a href="https://github.com/example/repo/releases/download/v2.15.1/app.zip">Download</a>\n'
        );
        fs.writeFileSync(
            path.join(fixture, 'package-lock.json'),
            JSON.stringify({ name: 'ScratchJr', version: '2.15.1', packages: { '': { version: '2.15.0' } } }, null, 2)
        );
        res = checkVersionLockstep({ rootDir: fixture });
        expect(res.ok).toBe(false);
        expect(res.errors.some((e) => e.includes('package-lock.json'))).toBe(true);
    });
});
