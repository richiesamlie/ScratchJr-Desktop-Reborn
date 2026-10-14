import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock electron and logging before importing updater.ts
vi.mock('electron', async () => {
    const { electronUpdaterMock } = await import('./helpers/main-process-env.js');
    return electronUpdaterMock();
});

vi.mock('../../src/main/logging.ts', async () => {
    const { loggingMock } = await import('./helpers/logging-mock.js');
    return loggingMock();
});

import { isUpdateCheckDisabled, checkForUpdate } from '../../src/main/updater.ts';

describe('isUpdateCheckDisabled', () => {
    describe('CLI flag detection', () => {
        it('returns true when --no-update-check is present', () => {
            expect(isUpdateCheckDisabled(['node', 'scratchjr', '--no-update-check'], {})).toBe(true);
        });

        it('returns true when --disable-update-check is present', () => {
            expect(isUpdateCheckDisabled(['node', 'scratchjr', '--disable-update-check'], {})).toBe(true);
        });

        it('returns true when --no-update-check=true or --disable-update-check=1', () => {
            expect(isUpdateCheckDisabled(['scratchjr', '--no-update-check=true'], {})).toBe(true);
            expect(isUpdateCheckDisabled(['scratchjr', '--disable-update-check=1'], {})).toBe(true);
        });

        it('returns true when --update-check=false, 0, or off is present', () => {
            expect(isUpdateCheckDisabled(['scratchjr', '--update-check=false'], {})).toBe(true);
            expect(isUpdateCheckDisabled(['scratchjr', '--update-check=0'], {})).toBe(true);
            expect(isUpdateCheckDisabled(['scratchjr', '--update-check=off'], {})).toBe(true);
        });

        it('returns false when explicitly set to false or 0', () => {
            expect(isUpdateCheckDisabled(['scratchjr', '--no-update-check=false'], {})).toBe(false);
            expect(isUpdateCheckDisabled(['scratchjr', '--disable-update-check=0'], {})).toBe(false);
            expect(isUpdateCheckDisabled(['scratchjr', '--update-check=true'], {})).toBe(false);
            expect(isUpdateCheckDisabled(['scratchjr', '--update-check=1'], {})).toBe(false);
        });

        it('returns false for unrelated flags or standard launch', () => {
            expect(isUpdateCheckDisabled(['node', 'scratchjr', '--lang=fr'], {})).toBe(false);
            expect(isUpdateCheckDisabled(['electron', '.'], {})).toBe(false);
            expect(isUpdateCheckDisabled([], {})).toBe(false);
        });
    });

    describe('Environment variable detection', () => {
        it('returns true when SCRATCHJR_NO_UPDATE_CHECK is 1, true, or yes', () => {
            expect(isUpdateCheckDisabled([], { SCRATCHJR_NO_UPDATE_CHECK: '1' })).toBe(true);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_NO_UPDATE_CHECK: 'true' })).toBe(true);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_NO_UPDATE_CHECK: 'TRUE' })).toBe(true);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_NO_UPDATE_CHECK: 'yes' })).toBe(true);
        });

        it('returns true when SCRATCHJR_DISABLE_UPDATE_CHECK is 1, true, or yes', () => {
            expect(isUpdateCheckDisabled([], { SCRATCHJR_DISABLE_UPDATE_CHECK: '1' })).toBe(true);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_DISABLE_UPDATE_CHECK: 'true' })).toBe(true);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_DISABLE_UPDATE_CHECK: 'Yes' })).toBe(true);
        });

        it('returns true when SCRATCHJR_UPDATE_CHECK is 0, false, or off', () => {
            expect(isUpdateCheckDisabled([], { SCRATCHJR_UPDATE_CHECK: '0' })).toBe(true);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_UPDATE_CHECK: 'false' })).toBe(true);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_UPDATE_CHECK: 'off' })).toBe(true);
        });

        it('returns false when environment variable is 0 or false', () => {
            expect(isUpdateCheckDisabled([], { SCRATCHJR_NO_UPDATE_CHECK: '0' })).toBe(false);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_NO_UPDATE_CHECK: 'false' })).toBe(false);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_DISABLE_UPDATE_CHECK: '0' })).toBe(false);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_UPDATE_CHECK: '1' })).toBe(false);
            expect(isUpdateCheckDisabled([], { SCRATCHJR_UPDATE_CHECK: 'true' })).toBe(false);
        });
    });
});

describe('checkForUpdate with update check disabled', () => {
    let originalArgv;
    let originalEnv;

    beforeEach(() => {
        originalArgv = [...process.argv];
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.argv = originalArgv;
        process.env = originalEnv;
        vi.restoreAllMocks();
    });

    it('early-exits without making network fetch requests when --no-update-check flag is active', async () => {
        process.argv.push('--no-update-check');

        let fetchCalled = false;
        globalThis.fetch = async () => {
            fetchCalled = true;
            throw new Error('fetch should not be called when update check is disabled');
        };

        const result = await checkForUpdate();

        expect(fetchCalled).toBe(false);
        expect(result.available).toBe(false);
        expect(result.error).toBe('Update checks are disabled on this system.');
    });

    it('early-exits without making network fetch requests when SCRATCHJR_NO_UPDATE_CHECK=1 is set', async () => {
        process.env.SCRATCHJR_NO_UPDATE_CHECK = '1';

        let fetchCalled = false;
        globalThis.fetch = async () => {
            fetchCalled = true;
            throw new Error('fetch should not be called when update check is disabled');
        };

        const result = await checkForUpdate();

        expect(fetchCalled).toBe(false);
        expect(result.available).toBe(false);
        expect(result.error).toBe('Update checks are disabled on this system.');
    });
});
