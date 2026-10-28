# Architecture — ScratchJr Desktop Reborn

Verified from source (v2.15.0). Companion documents:
`THREAT-MODEL.md` (security boundaries), `engine.md` (editor internals),
`development.md` (build & testing), `SCHOOL-DEPLOYMENT.md` (fleet rollout), `RELEASE.md` (runbook).

## Process topology

### 1. Desktop Host (Electron 45 / Node 26 runtime & build tooling)

```text
┌───────────────────────────── Main (Node 26, Electron 45) ─────────────────────┐
│ main.ts (orchestrator, 168 ln)                                                  │
│  ├─ window-lifecycle.ts   security config, nav policy, close handshake          │
│  ├─ ipc-handlers.ts       14 invoke + 1 send + 6 push channels                  │
│  │    ├─ db-intents.ts    allowlist + parameterized SQL composer                │
│  │    └─ data-store.ts    DB lifecycle, path safety checks                      │
│  │         └─ database.ts  sql.js 1.15, atomic saves, .bak rotation, recovery,  │
│  │                       media→disk migration, PROJECTFILES CRUD                 │
│  ├─ updater.ts            GitHub check (ETag, 10s timeout, safeExternalUrl)     │
│  └─ logging.ts            debug.log w/ 5MB rotation                             │
└─────────────────────────────────────────────────────────────────────────────────┘
        │ contextBridge (preload.ts) — window.scratchjr, 21 typed methods
        │ sandbox:true, contextIsolation:true, nodeIntegration:false
┌──────────────────────────── Renderer (Chromium 150+) ───────────────────────────┐
│ 4 root pages (index/home/editor/gettingstarted), strict CSP (zero inline JS)    │
│  ├─ hostClient.js         detects host: delegates to electronClient             │
│  ├─ electronClient.js     window.tablet & window.scratchjr adapter              │
│  ├─ webav.js              shared WebRTC mic (Opus) & canvas camera subsystem    │
│  ├─ app.bundle.js         esbuild ESM bundle, code-split per page                │
│  │   ├─ platform/         PlatformBridge, IO (zip .sjr, sqlite import), MediaLib│
│  │   ├─ editor/engine/    Runtime, Thread, Prims, Stage, Sprite, Page           │
│  │   │     └─ ports.ts    typed EnginePorts seam (UI decoupling)                 │
│  │   ├─ editor/ui/        Project, Library, Palette, Scripts, SoundPicker, Undo │
│  │   ├─ lobby/ painteditor/ geom/ (GeometryMath) utils/ (svgSanitizer, SoundLib)│
│  │   └─ modelRegistry.ts  WeakMap element→model (no DOM expandos)               │
└─────────────────────────────────────────────────────────────────────────────────┘
        │
┌────────────────────── ~/Documents/ScratchJR (per-user data) ───────────────────┐
│ scratchjr.sqllite (+.bak rolling backup, .restore manual) — sql.js file DB      │
│ media/ — file-backed assets, basename-confined writes                            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Desktop Host (Tauri v2.12 / Rust 1.99)

```text
┌─────────────────────────── Native Rust Backend ─────────────────────────────────┐
│ lib.rs / commands.rs / db.rs / io.rs                                             │
│  ├─ db.rs                 rusqlite 0.41 ACID transactions, strict allowlists,   │
│  │                        PRAGMA integrity_check, .bak rotation & recovery       │
│  └─ io.rs                 safe filesystem I/O, media storage, md5 computation   │
└─────────────────────────────────────────────────────────────────────────────────┘
        │ Tauri IPC invoke (tauriClient.js, 15s command timeout) — window.tablet
┌──────────────────────────── Renderer (System WebView / WebView2) ───────────────┐
│ Identical renderer bundle (app.bundle.js), HTML pages, and Documents/ScratchJR  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3. Android Host (Kotlin / Android API 36 target, compileSdk 37)

```text
┌────────────────────── Native Shell (compileSdk 37, targetSdk 36, AGP 9.4.1) ────┐
│ MainActivity.kt (activity lifecycle, intent dispatch, immersive UI)            │
│  ├─ AndroidBridge.kt       @JavascriptInterface bridge (native storage & audio) │
│  │    ├─ MediaCache.kt    bounded 50-entry synchronized LRU chunking cache      │
│  │    ├─ WebSecurityUtils strict appassets.androidplatform.net origin lock      │
│  │    ├─ IoUtils.kt       bounded 50MB stream reader for .sjr intent imports    │
│  │    └─ FileProvider     content:// URI sharing for .sjr & PNG exports         │
│  └─ AndroidDatabaseManager SQLiteOpenHelper with WAL mode, allowlist intents    │
└─────────────────────────────────────────────────────────────────────────────────┘
        │ @JavascriptInterface injected as `AndroidInterface`
        │ assets served securely via androidx.webkit.WebViewAssetLoader
┌──────────────────────────── WebView (Chrome 107+) ──────────────────────────────┐
│ 4 pages (assets/www/*.html), hostClient.js binds webhost.js                     │
│  ├─ webhost.js            implements ScratchJrBridge forwarding to native bridge│
│  ├─ webav.js              MediaRecorder Opus mic recording & canvas camera      │
│  └─ app.bundle.js         identical renderer bundle with responsive frame scale │
└─────────────────────────────────────────────────────────────────────────────────┘
        │
┌──────────────── Context.filesDir / Context.cacheDir (app sandbox) ──────────────┐
│ databases/scratchjr.db (+WAL journal) — native SQLite per-transaction durable   │
│ files/media/ — file-backed assets (.bak rotation on writes)                     │
│ cache/exports/ — temporary .sjr files for Intent.createChooser system share     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4. Web / PWA Host (Browser SQLite WASM + IndexedDB)

```text
┌──────────────────────────── Browser / PWA Runtime ──────────────────────────────┐
│ Service Worker (sw.js) cache-first offline caching (scratchjr-pwa-v2.15.0)      │
│  ├─ browserClient.js       in-browser sql.js 1.15 WASM + IndexedDB persistence, │
│  │                        Web Locks API multi-tab safety, database_flush gate   │
│  ├─ webav.js              standard getUserMedia & MediaRecorder                 │
│  └─ app.bundle.js         identical renderer bundle                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key data flows

**Save (debounced 100ms):** renderer `database_stmt` intent → allowlist
composition (`db-intents.ts` / `db.rs` / `AndroidDatabaseManager.kt` / `browserClient.js`) →
SQLite execution → `savePending()` → temp-write → `.bak` rotate →
atomic rename (or IndexedDB flush on Web). Crash path: `uncaughtException`/`unhandledRejection` handlers
flush + save before exit (`main.ts`); close handshake with 10s
force-quit fallback (`window-lifecycle.ts` & `src-tauri/src/lib.rs`).

**Corruption recovery (on open):** read DB → `PRAGMA integrity_check` →
on failure: verify `.bak` with its own integrity check → copy over →
reopen + notify renderer (`databaseRestored`) → if `.bak` also bad: fresh
empty DB and fire `onCorruptionReset`.

**Media migration (one-time):** legacy in-DB base64 rows → files, per-row
write→verify→drain, abort-on-failure, retried on next launch, yields every
20 rows (`database.ts`).

**`.sjr` export:** DB row + referenced media → jszip (renderer) → base64 →
native save dialog (Desktop), browser download (Web), or `Intent.createChooser` Share Sheet (Android)
(`IO.ts`, `ipc-handlers.ts`, `commands.rs`, `AndroidBridge.kt`).

**`.sjr` & `.sqlite` import:** drop / file-picker / menu (`CmdOrCtrl+O`) →
size & entry bounds enforcement (50MB compressed, 2000 entries, 200MB uncompressed,
`/^[A-Za-z0-9._-]+$/` basename guard) → version compatibility check →
asset writes with per-asset error isolation → project row insert →
`PlatformBridge.flushDatabase()` (awaits IndexedDB commit on Web) →
in-place Lobby refresh (`Home.displayYourProjects()` with `snap.wav`).

**Update check (Desktop):** launch +3s → CDN `version.json` / GitHub API (If-None-Match ETag) →
semver compare → dialog → user's browser after `safeExternalUrl` validation.
Completely suppressed when `--no-update-check` / `--disable-update-check` or
`SCRATCHJR_NO_UPDATE_CHECK=1` is set. Never downloads or executes code automatically.

## Rules the codebase enforces (keep these)

1. No renderer SQL — only structured intents validated against table, column, and operator allowlists (`src/lib/db-intents.ts`, `src-tauri/src/db.rs`, `AndroidDatabaseManager.kt`, `src/browserClient.js`).
2. No renderer filesystem paths — media names are basename-confined; reads outside data paths are containment-checked (`src/lib/path-utils.ts`).
3. Renderer writes only to its data dir or through user-mediated save dialogs.
4. Every DB save is atomic (temp→rename or WAL transaction) with prior backup rotation.
5. All window security flags stay on (`sandbox`, `contextIsolation`, `nodeIntegration:false`); media permissions (`camera`, `microphone`) are locked strictly to the local app origin (`isAppFileUrl`).
6. Strict CSP (`default-src 'self'`, `script-src 'self' 'wasm-unsafe-eval'`, zero `'unsafe-inline'` scripts) on every HTML page; imported SVGs are scrubbed by `svgSanitizer.ts`.
7. Updater stays notification-only and enforces `safeExternalUrl` HTTPS GitHub allowlisting (school deployments depend on it).
8. Outbound network on desktop is limited strictly to the optional update check.

## Module map (Desktop backends & shared libraries)

| Module | Owns | Lines |
|---|---|---:|
| `src/main.ts` | Electron wiring, crash flush, app menu, update dialog | 168 |
| `src/preload.ts` | `contextBridge` (`window.scratchjr`, 21 methods) | 74 |
| `src/main/ipc-handlers.ts` | Electron IPC channels, save dialogs | 295 |
| `src/main/database.ts` | `sql.js` lifecycle, persistence, recovery, migration | 550 |
| `src/main/data-store.ts` | init coordination, MD5, path safety | 137 |
| `src/main/window-lifecycle.ts` | `BrowserWindow`, origin-locked permissions, close handshake, shortcuts | 192 |
| `src/main/updater.ts` | release check, semver compare, `safeExternalUrl`, update suppression | 392 |
| `src/main/logging.ts` | `debug.log` with 5MB rotation | 55 |
| `src/lib/db-intents.ts` | intent validation + parameterized SQL composition | 166 |
| `src/lib/path-utils.ts` | path containment | 26 |
| `src-tauri/src/lib.rs` | Tauri v2 app builder, native menu, close handshake | 201 |
| `src-tauri/src/commands.rs` | Tauri IPC commands, native save dialogs, `--lang` CLI parser | 273 |
| `src-tauri/src/db.rs` | `rusqlite` manager, intent allowlists, `.bak` recovery | 788 |
| `src-tauri/src/io.rs` | Tauri safe filesystem I/O, asset cleanup, MD5 | 272 |

No backend module imports renderer code; dependency direction is strictly `main` → `lib`.
