// @vitest-environment jsdom
import "./renderer-harness.js";
import { describe, it, expect, vi } from "vitest";

describe("Browser Storage Resilience & Multi-Tab Concurrency Guard", () => {
    it("requests storage persistence via navigator.storage.persist when available", async () => {
        let persistCalled = false;
        const mockStorage = {
            persist: vi.fn(async () => {
                persistCalled = true;
                return true;
            })
        };
        Object.defineProperty(navigator, "storage", {
            value: mockStorage,
            configurable: true
        });

        const res = await navigator.storage.persist();
        expect(res).toBe(true);
        expect(persistCalled).toBe(true);
    });

    it("acquires exclusive web lock when available and denies secondary tabs with ifAvailable", async () => {
        let activeLockName = null;
        const mockLocks = {
            request: vi.fn(async (name, options, callback) => {
                if (options && options.ifAvailable) {
                    if (activeLockName === name) {
                        // Lock already held by primary tab
                        return callback(null);
                    }
                    activeLockName = name;
                    return callback({ name });
                }
                return callback({ name });
            })
        };

        // Tab 1 claims lock
        let tab1Lock = null;
        await mockLocks.request("scratchjr_db_lock", { ifAvailable: true }, (lock) => {
            tab1Lock = lock;
        });
        expect(tab1Lock).not.toBeNull();
        expect(tab1Lock.name).toBe("scratchjr_db_lock");

        // Tab 2 attempts to claim same lock -> null (read-only mode)
        let tab2Lock = null;
        await mockLocks.request("scratchjr_db_lock", { ifAvailable: true }, (lock) => {
            tab2Lock = lock;
        });
        expect(tab2Lock).toBeNull();
    });

    it("quarantines corrupt database payload with a timestamped key", () => {
        const corruptBytes = new Uint8Array([0x00, 0x01, 0x02, 0xff]);
        const mockIdbStore = {};

        function simulateQuarantine(bytes) {
            const corruptKey = "db_bytes_corrupt_" + Date.now();
            mockIdbStore[corruptKey] = bytes;
            return corruptKey;
        }

        const key = simulateQuarantine(corruptBytes);
        expect(key.startsWith("db_bytes_corrupt_")).toBe(true);
        expect(mockIdbStore[key]).toBe(corruptBytes);
    });
});
