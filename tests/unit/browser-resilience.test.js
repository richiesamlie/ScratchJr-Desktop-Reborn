// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createBrowserClient } = require('../../src/browserClient.js');

describe('Browser Storage Resilience & Multi-Tab Concurrency Guard (real browserClient)', () => {
    let idbStore;
    let idbGetMock;
    let idbPutMock;
    let idbDeleteMock;
    let activeLockName;

    beforeEach(() => {
        document.body.innerHTML = '';
        idbStore = {};
        activeLockName = null;

        idbGetMock = vi.fn(async (store, key) => idbStore[`${store}:${key}`]);
        idbPutMock = vi.fn(async (store, key, val) => {
            idbStore[`${store}:${key}`] = val;
        });
        idbDeleteMock = vi.fn(async (store, key) => {
            delete idbStore[`${store}:${key}`];
        });

        Object.defineProperty(navigator, 'storage', {
            value: {
                persist: vi.fn(async () => true),
            },
            configurable: true,
        });

        Object.defineProperty(navigator, 'locks', {
            value: {
                request: vi.fn((name, options, callback) => {
                    if (options && options.ifAvailable && activeLockName === name) {
                        return Promise.resolve(callback(null));
                    }
                    activeLockName = name;
                    return Promise.resolve(callback({ name })).finally(() => {
                        if (activeLockName === name) {
                            activeLockName = null;
                        }
                    });
                }),
            },
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.body.innerHTML = '';
    });

    function makeSqlFactory({ throwOnExistingBytes = false } = {}) {
        class MockDatabase {
            constructor(bytes) {
                if (throwOnExistingBytes && bytes && bytes.length > 0) {
                    throw new Error('corrupt sqlite header');
                }
            }
            run() {}
            exec() { return []; }
            getRowsModified() { return 0; }
            export() { return new Uint8Array([9, 8, 7]); }
        }
        return vi.fn(async () => ({ Database: MockDatabase }));
    }

    it('requests navigator.storage.persist during initDatabase', async () => {
        const client = createBrowserClient({
            idbGet: idbGetMock,
            idbPut: idbPutMock,
            idbDelete: idbDeleteMock,
            initSqlJs: makeSqlFactory(),
            registerWindowListeners: false,
        });

        await client.initDatabase();
        expect(navigator.storage.persist).toHaveBeenCalledTimes(1);
        expect(client.getState().hasExclusiveLock).toBe(true);
        await client.triggerLeave();
    });

    it('puts secondary tab into read-only mode when lock is held and skips IndexedDB writes', async () => {
        const tab1 = createBrowserClient({
            idbGet: idbGetMock,
            idbPut: idbPutMock,
            idbDelete: idbDeleteMock,
            initSqlJs: makeSqlFactory(),
            registerWindowListeners: false,
        });
        await tab1.initDatabase();
        expect(tab1.getState().hasExclusiveLock).toBe(true);
        expect(tab1.getState().hasReleaseLock).toBe(true);

        const putCountAfterTab1 = idbPutMock.mock.calls.length;

        const tab2 = createBrowserClient({
            idbGet: idbGetMock,
            idbPut: idbPutMock,
            idbDelete: idbDeleteMock,
            initSqlJs: makeSqlFactory(),
            registerWindowListeners: false,
        });
        await tab2.initDatabase();

        expect(tab2.getState().hasExclusiveLock).toBe(false);
        expect(document.getElementById('scratchjr_multitab_notice')).not.toBeNull();

        await tab2.doActualDbSave();
        expect(idbPutMock.mock.calls.length).toBe(putCountAfterTab1);

        await tab1.triggerLeave();
    });

    it('quarantines corrupt db_bytes under db_bytes_corrupt_<ts> when exclusive lock is held', async () => {
        const corruptBytes = new Uint8Array([0x00, 0x01, 0x02, 0xff]);
        idbStore['sqlite_db:db_bytes'] = corruptBytes;

        const client = createBrowserClient({
            idbGet: idbGetMock,
            idbPut: idbPutMock,
            idbDelete: idbDeleteMock,
            initSqlJs: makeSqlFactory({ throwOnExistingBytes: true }),
            registerWindowListeners: false,
        });

        await client.initDatabase();

        const corruptKeys = Object.keys(idbStore).filter((k) => k.startsWith('sqlite_db:db_bytes_corrupt_'));
        expect(corruptKeys).toHaveLength(1);
        expect(idbStore[corruptKeys[0]]).toBe(corruptBytes);
        expect(idbStore['sqlite_db:db_bytes']).toEqual(new Uint8Array([9, 8, 7]));

        await client.triggerLeave();
    });

    it('prevents secondary tab without exclusive lock from writing quarantine payload', async () => {
        activeLockName = 'scratchjr_db_lock';
        idbStore['sqlite_db:db_bytes'] = new Uint8Array([0x00, 0x01, 0x02]);

        const client = createBrowserClient({
            idbGet: idbGetMock,
            idbPut: idbPutMock,
            idbDelete: idbDeleteMock,
            initSqlJs: makeSqlFactory({ throwOnExistingBytes: true }),
            registerWindowListeners: false,
        });

        await client.initDatabase();

        expect(client.getState().hasExclusiveLock).toBe(false);
        expect(idbPutMock).not.toHaveBeenCalled();
    });

    it('releases exclusive web lock only after flushDbSave completes on triggerLeave', async () => {
        let flushFinished = false;
        let lockReleasedBeforeFlush = false;

        let resolvePut;
        idbPutMock.mockImplementation(() => new Promise((resolve) => {
            resolvePut = () => {
                flushFinished = true;
                resolve(undefined);
            };
        }));

        const client = createBrowserClient({
            idbGet: idbGetMock,
            idbPut: idbPutMock,
            idbDelete: idbDeleteMock,
            initSqlJs: makeSqlFactory(),
            registerWindowListeners: false,
        });

        // Resolve initial initDatabase flush immediately
        const initPromise = client.initDatabase();
        await vi.waitFor(() => expect(resolvePut).toBeTypeOf('function'));
        resolvePut();
        await initPromise;

        // Next flush (on leave) stays pending until we resolvePut
        flushFinished = false;
        resolvePut = undefined;
        const leavePromise = client.triggerLeave();

        await vi.waitFor(() => expect(resolvePut).toBeTypeOf('function'));
        if (!client.getState().hasReleaseLock) {
            lockReleasedBeforeFlush = true;
        }
        expect(flushFinished).toBe(false);
        expect(lockReleasedBeforeFlush).toBe(false);

        resolvePut();
        await leavePromise;

        expect(flushFinished).toBe(true);
        expect(client.getState().hasReleaseLock).toBe(false);
    });
});
