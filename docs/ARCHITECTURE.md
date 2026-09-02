# Architecture — ScratchJr Desktop Reborn

Verified from source (v1.9.0-android). Companion documents:
`ANDROID-PORT-PLAN.md` (Android specs & audit), `THREAT-MODEL.md`
(boundaries), `engine.md` (editor internals), `development.md` (build).

## Process topology

### 1. Desktop Host (Electron 43 / Node 24)

```text
┌───────────────────────────── Main (Node 24, Electron 43) ─────────────────────┐
│ main.ts (orchestrator, 151 ln)                                                  │
│  ├─ window-lifecycle.ts   security config, nav policy, close handshake          │
│  ├─ ipc-handlers.ts       19 channels, all renderer entry points                │
│  │    ├─ db-intents.ts    allowlist + parameterized SQL composer                │
│  │    └─ data-store.ts    DB lifecycle, LRU media cache (50/64MB), path checks  │
│  │         └─ database.ts  sql.js, atomic saves, .bak rotation, recovery,        │
│  │                       media→disk migration, PROJECTFILES CRUD                 │
│  ├─ updater.ts            GitHub check (ETag, 10s timeout) → dialog → browser    │
│  └─ logging.ts            debug.log w/ 5MB rotation                             │
└─────────────────────────────────────────────────────────────────────────────────┘
        │ contextBridge (preload.ts) — window.scratchjr, 19 typed methods
        │ sandbox:true, contextIsolation:true, nodeIntegration:false
┌──────────────────────────── Renderer (Chromium 150) ────────────────────────────┐
│ 4 pages (index/home/editor/gettingstarted), CSP default-src 'self'               │
│  ├─ hostClient.js         detects host: delegates to electronClient or webhost  │
│  ├─ electronClient.js     legacy window.tablet adapter (loads outside bundle)   │
│  ├─ webhost.js / webav.js shared bridge shim & camera/mic recording subsystem    │
│  ├─ app.bundle.js         esbuild ESM bundle, code-split per page                │
│  │   ├─ platform/         PlatformBridge, IO (zip .sjr, thumbnails), MediaLib   │
│  │   ├─ editor/engine/    Runtime, Thread, Prims, Stage, Sprite, Page           │
│  │   │     └─ ports.ts    typed EnginePorts seam (UI decoupling; see F-14)       │
│  │   ├─ editor/ui/        Project, Library, Palette, Scripts, Undo, ...         │
│  │   ├─ lobby/ painteditor/ geom/ utils/                                        │
│  │   └─ modelRegistry.ts  WeakMap element→model (no DOM expandos)               │
└─────────────────────────────────────────────────────────────────────────────────┘
        │
┌────────────────────── ~/Documents/ScratchJR (per-user data) ───────────────────┐
│ scratchjr.sqllite (+.bak rolling backup, .restore manual) — sql.js file DB      │
│ media/ — file-backed assets, basename-confined writes                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Android Host (Kotlin / Android 16 API 36)

```text
┌────────────────────── Native Shell (Android API 36, AGP 9.3) ───────────────────┐
│ MainActivity.kt (activity lifecycle, intent dispatch, immersive UI)            │
│  ├─ AndroidBridge.kt       @JavascriptInterface bridge (28 native methods)      │
│  │    ├─ MediaCache.kt    bounded 50-entry synchronized LRU chunking cache      │
│  │    ├─ WebChromeClient  camera/mic permission grants                          │
│  │    └─ FileProvider     content:// URI sharing for .sjr exports               │
│  └─ AndroidDatabaseManager SQLiteOpenHelper with WAL mode, atomic .bak rotation │
└─────────────────────────────────────────────────────────────────────────────────┘
        │ @JavascriptInterface injected as `AndroidInterface`
        │ assets served securely via androidx.webkit.WebViewAssetLoader
┌──────────────────────────── WebView (Chrome 107+) ──────────────────────────────┐
│ 4 pages (assets/www/*.html), hostClient.js binds webhost.js                     │
│  ├─ webhost.js            implements ScratchJrBridge forwarding to native bridge│
│  ├─ webav.js              MediaRecorder Opus mic recording & canvas camera capture│
│  └─ app.bundle.js         identical renderer bundle with responsive frame scale │
└─────────────────────────────────────────────────────────────────────────────────┘
        │
┌──────────────── Context.filesDir / Context.cacheDir (app sandbox) ──────────────┐
│ databases/scratchjr.db (+WAL journal) — native SQLite per-transaction durable   │
│ files/media/ — file-backed assets (.bak rotation on writes)                     │
│ cache/exports/ — temporary .sjr files for Intent.createChooser system share     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key data flows

**Save (debounced 100ms):** renderer `database_stmt` intent → allowlist
composition → sql.js exec → `savePending()` → temp-write → `.bak` rotate →
rename. Crash path: `uncaughtException`/`unhandledRejection` handlers
flush + save before exit (`main.ts:20-42`); close handshake with 10s
force-quit fallback (`window-lifecycle.ts:117-134`).

**Corruption recovery (on open):** read DB → `PRAGMA integrity_check` →
on failure: verify `.bak` with its own integrity check → copy over →
reopen + notify renderer (`databaseRestored`) → if `.bak` also bad: fresh
empty DB.

**Media migration (one-time):** legacy in-DB base64 rows → files, per-row
write→verify→drain, abort-on-failure, retried on next launch, yields every
20 rows (`database.ts:234-270`).

**`.sjr` export:** DB row + referenced media → jszip (renderer) → base64 →
native save dialog → main writes file (`IO.ts:276-413`,
`ipc-handlers.ts:247-264`). User-mediated path; name scrubbed.

**`.sjr` import:** drop → jszip parse → version gate → project row insert →
asset writes (last-segment names, main-side basename guard) → thumbnails
(`IO.ts:464-633`). Known gaps: non-transactional, silent corrupt-zip
failure (audit F-07/F-08).

**Update check:** launch +3s → GitHub API (If-None-Match ETag) → compare →
dialog → user's browser. Never downloads/executes.

## Rules the codebase enforces (keep these)

1. No renderer SQL — only structured intents through `src/lib/db-intents.ts`.
2. No renderer filesystem paths — media names are basename-confined; reads
   outside data paths are containment-checked (`src/lib/path-utils.ts`).
3. Renderer writes only to its data dir or through user save dialogs.
4. Every DB save is atomic (temp→rename) with prior backup rotation.
5. All window security flags stay on (`sandbox`, `contextIsolation`,
   `nodeIntegration:false`); one window; no new-window spawning.
6. CSP `default-src 'self'` on every HTML page — no exceptions.
7. Updater stays notification-only (school deployments depend on it).
8. Outbound network limited to the GitHub update check.

## Module map (main process)

| Module | Owns | Lines |
|---|---|---:|
| `main.ts` | wiring, crash flush, app menu, update dialog | 151 |
| `ipc-handlers.ts` | all channels, save dialogs | 298 |
| `database.ts` | sql.js lifecycle, persistence, recovery, migration | 528 |
| `data-store.ts` | init coordination, cache, path safety | 171 |
| `window-lifecycle.ts` | BrowserWindow, security, close handshake | 163 |
| `updater.ts` | release check, version compare | 224 |
| `logging.ts` | debug.log with rotation | 39 |
| `lib/db-intents.ts` | intent validation + SQL composition | 166 |
| `lib/path-utils.ts` | path containment | 26 |

No module imports renderer code; dependency direction is strictly
main → lib. `ipc-handlers.ts` at 298 lines is the largest boundary module
and is domain-organized by channel group — the "god module" risk from the
2026-08 handoff brief did not materialize.
