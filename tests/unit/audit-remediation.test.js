import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { setupSqliteEnv, cleanupSqliteEnv } from './helpers/main-process-env.js';

// Mock electron
vi.mock('electron', async () => {
    const { electronMainMock } = await import('./helpers/main-process-env.js');
    return electronMainMock({ browserWindowStub: true });
});

// Mock logging
vi.mock('../../src/main/logging.ts', async () => {
    const { loggingMock } = await import('./helpers/logging-mock.js');
    return loggingMock();
});

import { DatabaseManager } from '../../src/main/database.ts';

describe('Audit Remediation: Database hardening and hygiene', () => {
    let tmpDir;
    let dbPath;
    let sqlJs;

    beforeEach(async () => {
        ({ tmpDir, dbPath, sqlJs } = await setupSqliteEnv('audit-remediation-'));
    });

    afterEach(() => {
        cleanupSqliteEnv(tmpDir);
    });

    it('F-15 / P2-001: Cleans up orphaned .tmp files at startup', () => {
        const tmpPath = dbPath + '.tmp';
        fs.writeFileSync(tmpPath, 'dangling tmp content');
        expect(fs.existsSync(tmpPath)).toBe(true);

        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        expect(fs.existsSync(tmpPath)).toBe(false);
        mgr.close();
    });

    it('F-16 / P1-003: Fires onCorruptionReset when DB and backup are unrecoverable', () => {
        let resetCalled = false;
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        mgr.onCorruptionReset = () => { resetCalled = true; };
        
        // Close and write corrupted bytes to disk
        mgr.close();
        fs.writeFileSync(dbPath, 'corrupted database bytes');
        
        // Open corrupt database without valid backup
        mgr.open(sqlJs);
        expect(resetCalled).toBe(true);
        expect(mgr.isOpen()).toBe(true);
        mgr.close();
    });

    it('F-13 / P2-002: mediaInUse protects ALTMD5 thumbnail assets in USERSHAPES and USERBKGS', () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        const mediaDir = path.join(tmpDir, 'media');
        mgr.setMediaDirectory(mediaDir);

        // Insert a usershape with md5='hero.svg' and altmd5='thumb_hero.png'
        mgr.stmt({
            stmt: 'INSERT INTO USERSHAPES (MD5, ALTMD5, EXT, NAME) VALUES (?, ?, ?, ?)',
            values: ['hero.svg', 'thumb_hero.png', 'svg', 'Hero']
        });

        // Insert a userbkg with md5='space.svg' and altmd5='thumb_space.png'
        mgr.stmt({
            stmt: 'INSERT INTO USERBKGS (MD5, ALTMD5, EXT) VALUES (?, ?, ?)',
            values: ['space.svg', 'thumb_space.png', 'svg']
        });

        // Create files in media directory
        fs.writeFileSync(path.join(mediaDir, 'hero.svg'), 'svg content');
        fs.writeFileSync(path.join(mediaDir, 'thumb_hero.png'), 'png thumb content');
        fs.writeFileSync(path.join(mediaDir, 'space.svg'), 'bkg svg');
        fs.writeFileSync(path.join(mediaDir, 'thumb_space.png'), 'bkg thumb png');
        fs.writeFileSync(path.join(mediaDir, 'orphan.png'), 'unused orphan png');

        // Clean png files
        mgr.cleanProjectFiles('png');

        // Verify in-use thumbnails were preserved
        expect(fs.existsSync(path.join(mediaDir, 'thumb_hero.png'))).toBe(true);
        expect(fs.existsSync(path.join(mediaDir, 'thumb_space.png'))).toBe(true);
        // Verify orphan png was deleted
        expect(fs.existsSync(path.join(mediaDir, 'orphan.png'))).toBe(false);

        mgr.close();
    });

    it('mediaInUse protects project thumbnails referenced in PROJECTS.THUMBNAIL column', () => {
        const mgr = new DatabaseManager(dbPath, undefined, sqlJs);
        const mediaDir = path.join(tmpDir, 'media');
        mgr.setMediaDirectory(mediaDir);

        // Insert a project with THUMBNAIL='{"pagecount":1,"md5":"1_thumb.png"}' and JSON='{"pages":["page1"]}'
        mgr.stmt({
            stmt: 'INSERT INTO PROJECTS (NAME, THUMBNAIL, JSON, DELETED) VALUES (?, ?, ?, ?)',
            values: ['Project 1', JSON.stringify({ pagecount: 1, md5: '1_thumb.png' }), '{"pages":["page1"]}', 'NO']
        });

        // Create project thumbnail file on disk
        fs.writeFileSync(path.join(mediaDir, '1_thumb.png'), 'project 1 thumbnail png bytes');
        fs.writeFileSync(path.join(mediaDir, 'unused_random.png'), 'unused random bytes');

        // Clean png files
        mgr.cleanProjectFiles('png');

        // Verify project thumbnail was protected and not deleted
        expect(fs.existsSync(path.join(mediaDir, '1_thumb.png'))).toBe(true);
        // Verify truly unused png was cleaned
        expect(fs.existsSync(path.join(mediaDir, 'unused_random.png'))).toBe(false);

        mgr.close();
    });
});

describe('Audit Remediation: Supply Chain and CI Action Pins', () => {
    it('F-03 / P0-001: All GitHub Actions in build-release.yml are SHA-pinned (40-hex SHA)', () => {
        const workflowPath = path.resolve(__dirname, '../../.github/workflows/build-release.yml');
        const content = fs.readFileSync(workflowPath, 'utf8');

        // Match lines like: uses: actions/checkout@...
        const usesLines = content.split('\n').filter(line => /uses:\s+[^.\s]+@[^\s]+/.test(line));
        expect(usesLines.length).toBeGreaterThan(0);

        for (const line of usesLines) {
            const match = line.match(/uses:\s+([^@]+)@([a-f0-9]{40})/i);
            expect(match, `Action line must use a 40-character SHA commit hash: "${line.trim()}"`).not.toBeNull();
        }
    });

    it('F-04 / P0-004: WiX download contains sha256sum integrity check', () => {
        const workflowPath = path.resolve(__dirname, '../../.github/workflows/build-release.yml');
        const content = fs.readFileSync(workflowPath, 'utf8');

        expect(content).toContain('6ac824e1642d6f7277d0ed7ea09411a508f6116ba6fae0aa5f2c7daa2ff43d31');
        expect(content).toContain('sha256sum');
    });

    it('F-05 / P1-004: build-renderer targets chrome150 matching Chromium 150', () => {
        const scriptPath = path.resolve(__dirname, '../../scripts/build-renderer.js');
        const content = fs.readFileSync(scriptPath, 'utf8');

        expect(content).toContain("target: ['chrome150']");
    });

    it('F-02 / P0-002: build-msi sets stable upgradeCode and arch x64', () => {
        const scriptPath = path.resolve(__dirname, '../../scripts/build-msi.js');
        const content = fs.readFileSync(scriptPath, 'utf8');

        expect(content).toContain("upgradeCode: '{E4346E7F-98B4-4602-9FAA-5AF8C9844BA7}'");
        expect(content).toContain("arch: 'x64'");
        expect(content).toContain("defaultInstallMode: 'perMachine'");
        expect(content).toContain('cleanup-action.wxs');
    });
});
