import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('electron', async () => {
    const { electronMainMock } = await import('./helpers/main-process-env.js');
    return electronMainMock();
});

vi.mock('../../src/main/logging.ts', async () => {
    const { loggingMock } = await import('./helpers/logging-mock.js');
    return loggingMock();
});

import { ScratchJRDataStore } from '../../src/main/data-store.ts';

describe('media cache (LRU + byte budget)', () => {
    let ds;

    beforeEach(() => {
        ds = new ScratchJRDataStore(null);
        ds.mediaCacheMaxEntries = 3;
        ds.mediaCacheMaxBytes = 100;
    });

    it('stores and retrieves entries', () => {
        ds.cacheMedia('a', 'AAAA');
        expect(ds.getCachedMedia('a')).toBe('AAAA');
    });

    it('evicts least-recently-used beyond the entry cap', () => {
        ds.cacheMedia('a', '1');
        ds.cacheMedia('b', '2');
        ds.cacheMedia('c', '3');
        // Touch 'a' so 'b' becomes the LRU entry.
        expect(ds.getCachedMedia('a')).toBe('1');
        ds.cacheMedia('d', '4');
        expect(ds.getCachedMedia('b')).toBeUndefined();
        expect(ds.getCachedMedia('a')).toBe('1');
        expect(ds.getCachedMedia('d')).toBe('4');
    });

    it('re-caching an existing key refreshes recency without double counting', () => {
        ds.cacheMedia('a', '1');
        ds.cacheMedia('b', '2');
        ds.cacheMedia('c', '3');
        ds.cacheMedia('a', '9'); // refresh a
        ds.cacheMedia('d', '4'); // evicts b
        expect(ds.getCachedMedia('b')).toBeUndefined();
        expect(ds.getCachedMedia('a')).toBe('9');
    });

    it('enforces the byte budget across entries', () => {
        ds.mediaCacheMaxEntries = 50; // bytes are the binding constraint here
        ds.mediaCacheMaxBytes = 10;
        ds.cacheMedia('big', '0123456789'); // exactly at budget
        expect(ds.getCachedMedia('big')).toHaveLength(10);
        ds.cacheMedia('small', 'x'); // pushes over budget -> evicts 'big'
        expect(ds.getCachedMedia('big')).toBeUndefined();
        expect(ds.getCachedMedia('small')).toBe('x');
    });

    it('removeFromMediaCache frees bytes and the entry', () => {
        ds.cacheMedia('a', '1234567890');
        ds.removeFromMediaCache('a');
        expect(ds.getCachedMedia('a')).toBeUndefined();
        // freed budget allows new inserts without eviction surprises
        ds.cacheMedia('b', '1234567890');
        expect(ds.getCachedMedia('b')).toHaveLength(10);
    });
});
