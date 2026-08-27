import { vi } from 'vitest';

// Shared src/main/logging.ts mock: logging opens a real fs.createWriteStream
// at module scope, which breaks under vitest. vi.mock factories are hoisted
// and cannot close over outer variables, so each test's vi.mock factory
// dynamically imports this helper; the mock target path string stays in the
// test file so it resolves relative to tests/unit/ as before.
export function loggingMock () {
    return {
        DEBUG_DATABASE: false,
        DEBUG_CLEANASSETS: false,
        DEBUG: false,
        DEBUG_FILEIO: false,
        DEBUG_NYI: false,
        DEBUG_LOAD_DEVTOOLS: false,
        DEBUG_RESOURCEIO: false,
        debugLog: vi.fn(),
        logFile: { write: vi.fn(), end: vi.fn() },
    };
}
