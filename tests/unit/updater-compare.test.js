import { describe, it, expect, vi } from 'vitest';

// updater.ts imports electron (and logging.ts uses app.getPath at module scope)
vi.mock('electron', async () => {
    const { electronUpdaterMock } = await import('./helpers/main-process-env.js');
    return electronUpdaterMock();
});

// Mock logging.ts too: it opens a real write stream at module scope
// (app.getPath-based), which breaks on Windows CI where /tmp has no drive dir.
vi.mock('../../src/main/logging.ts', async () => {
    const { loggingMock } = await import('./helpers/logging-mock.js');
    return loggingMock();
});
import { compareVersions } from '../../src/main/updater.ts';

describe('compareVersions', () => {
    it('returns 0 for equal versions', () => {
        expect(compareVersions('1.6.2', '1.6.2')).toBe(0);
    });

    it('compares numerically, not lexicographically', () => {
        expect(compareVersions('1.10.0', '1.9.0')).toBe(1);
        expect(compareVersions('1.9.0', '1.10.0')).toBe(-1);
    });

    it('orders by patch then minor then major', () => {
        expect(compareVersions('1.6.3', '1.6.2')).toBe(1);
        expect(compareVersions('1.7.0', '1.6.9')).toBe(1);
        expect(compareVersions('2.0.0', '1.99.99')).toBe(1);
    });

    it('counts a prerelease of a higher version as an update (regression: NaN)', () => {
        // Number('0-beta') was NaN; NaN comparisons made this return 0 before.
        expect(compareVersions('1.7.0-beta', '1.6.2')).toBe(1);
    });

    it('ignores prerelease suffix when core versions match', () => {
        expect(compareVersions('1.6.2-beta', '1.6.2')).toBe(0);
        expect(compareVersions('1.6.3-beta.2', '1.6.2')).toBe(1);
    });

    it('treats missing parts as zero', () => {
        expect(compareVersions('1.6', '1.6.0')).toBe(0);
        expect(compareVersions('1.7', '1.6.9')).toBe(1);
    });
});
