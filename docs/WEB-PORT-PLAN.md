# ScratchJr Web & PWA Port Plan

**Status:** APPROVED FOR PLANNING — Experimental Branch `web/pwa`  
**Goal:** Deliver a zero-install, 100% browser-based Progressive Web App (PWA) of ScratchJr Reborn running on standard modern browsers (Chrome OS / Chromebooks, iPad Safari, Android Chrome, Windows/macOS/Linux browsers) with full offline functionality and project format interchangeability (`.sjr`).

---

## Executive Summary

ScratchJr Reborn's desktop version uses Electron, and the Android version uses a native Kotlin `WebView` shell. Both hosts share an identical decoupled web frontend (`src/app/src/**/*.ts`), esbuild bundle pipeline (`src/app/dist/app.bundle.js`), and WebRTC multimedia layer (`src/webav.js`).

The Web / PWA port completes the cross-platform vision by adding a **pure browser host adapter (`src/browserClient.js`)**. It replaces native filesystem and SQLite access with in-browser **`sql.js` WebAssembly backed by `IndexedDB`**, enabling ScratchJr to run in any browser with zero installation, zero administrative permissions, and zero server-side state.

---

## Part 1 — Architecture & Host Decoupling

```text
┌────────────────────────────── Browser / PWA Sandbox ──────────────────────────────┐
│ HTML Entrypoints: index.html (Start), home.html (Lobby), editor.html (Editor)       │
│                                                                                    │
│ ┌────────────────────────── UI & Engine Bundle (Strict TS) ──────────────────────┐ │
│ │ - App bundle: src/app/dist/app.bundle.js (esbuild code-split per page)         │ │
│ │ - Engine / Block runtime: ports.ts + modelRegistry.ts (zero DOM expandos)      │ │
│ │ - Responsive mobile & desktop engine: dynamic sub-740px scaling & touch mapping│ │
│ └──────────────────────────────────────┬─────────────────────────────────────────┘ │
│                                        │ window.tablet (ScratchJrBridge contract)  │
│ ┌─────────────────────────── Browser Host Adapter ──────────────────────────────┐ │
│ │ src/browserClient.js (implements ScratchJrBridge):                             │ │
│ │  ├─ Database: in-memory sql.js WASM + IndexedDB persistence (scratchjr_db)     │ │
│ │  ├─ Media Store: IndexedDB object store (media) for user sprites, sounds, bkgs │ │
│ │  ├─ File I/O: Virtualized IndexedDB store for settings, logs, and temp assets  │ │
│ │  ├─ Multimedia: WebAudio playback + MediaRecorder Opus voice + Canvas camera   │ │
│ │  └─ Interoperability: Browser download prompt (.sjr) + Drag-and-drop import    │ │
│ └──────────────────────────────────────┬─────────────────────────────────────────┘ │
│                                        │                                           │
│ ┌────────────────────────── Service Worker & Manifest ─────────────────────────┐ │
│ │  ├─ manifest.webmanifest (Standalone PWA, landscape orientation, icons)        │ │
│ │  └─ sw.js (Cache-first offline engine for static app shell, SVGs, and audio)   │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2 — Implementation Phases

### Phase W0 — Branch, Scaffolding & Host Detection
- **Branch**: `web/pwa`.
- **Host Detection**: Update `src/hostClient.js`:
  ```javascript
  if (window.scratchjr) {
      load('../electronClient.js');
  } else if (typeof AndroidInterface !== 'undefined') {
      load('../webhost.js');
  } else {
      load('../browserClient.js'); // Web browser / PWA host
  }
  ```
- **Asset Hygiene**: Ensure build output for the web distribution is cleanly isolated (e.g. `dist-web/`), gitignored, and does not pollute repo root.

### Phase W1 — In-Browser SQLite Engine (`sql.js` + `IndexedDB`)
- **WebAssembly SQLite**: Integrate `sql.js` (`sql-wasm.js` and `sql-wasm.wasm`).
- **Database Lifecycle**:
  1. On boot: Open IndexedDB (`ScratchJrStorage`), load stored SQLite bytes (`db_bytes`).
  2. If exists: `db = new SQL.Database(bytes)`.
  3. If fresh: `db = new SQL.Database()`, execute table creation DDL (`PROJECTS`, `USERSHAPES`, `USERBKGS`, `PROJECTFILES`) matching desktop `src/main/database.ts` schema.
  4. Save coordination: Debounced (100ms) save flushes `db.export()` back to IndexedDB.
- **Intent Execution**: Support structured intents (`database_stmt`, `database_query`) using the existing `src/lib/db-intents.ts` allowlist and query composer.

### Phase W2 — Virtual Media & Asset Storage (`IndexedDB`)
- **Media Store**: Store user-created drawings, photo snapshots, and recorded sounds as blobs in an IndexedDB `media` object store keyed by `<md5>.<ext>`.
- **Bridge Methods**:
  - `io_setmedia(b64, ext)`: Computes MD5, stores blob/b64 in IndexedDB, returns `<md5>.<ext>`.
  - `io_getmedia(filename)`: Looks up user media in IndexedDB; if missing, falls back to static app assets (`assets/characters/`, `assets/backgrounds/`).
  - `io_gettextresource(path)`: Standard `fetch()` for static SVG and localization files.
  - `io_getsettings()`: Returns default or user-modified `settings.json`.

### Phase W3 — Multimedia & Hardware Integration
- **Voice Recording**: Reuses `src/webav.js` (`AudioCapture` via `MediaRecorder` Opus encoding inside `.webm` container).
- **Camera Snapping**: Reuses `src/webav.js` (`CameraPickerDialog` streaming `navigator.mediaDevices.getUserMedia` onto HTML5 canvas).
- **Sound Playback**: Standard HTML5 Audio / Web Audio API (`ScratchAudio`).

### Phase W4 — Sharing & File Interoperability (.sjr)
- **Project Export**:
  - `sendExportedSjr(b64, suggestedName)`: Triggers native browser download dialog via `<a download="${suggestedName}.sjr" href="...">`.
  - `sendExportedPng(dataUrl, suggestedName)`: Triggers browser download for 960×720 stage PNG.
- **Project Import**:
  - Drag-and-drop `.sjr` file onto lobby window (already handled in `Lobby.ts`).
  - File picker button (`<input type="file" accept=".sjr">`) in Lobby for touch devices (iPad/tablets).

### Phase W5 — Progressive Web App (PWA) & Offline Mode
- **Web App Manifest (`manifest.webmanifest`)**:
  - Name: "ScratchJr Reborn"
  - Display: `standalone`
  - Orientation: `landscape`
  - Theme colors & full icon set (192×192, 512×512).
- **Service Worker (`sw.js`)**:
  - Pre-caches core app shell, bundles, static media library, and sounds.
  - Intercepts network requests with Cache-First strategy to ensure 100% offline usability.

### Phase W6 — Automated Build Script & Verification
- **Build Script**: `npm run build:web`:
  - Bundles renderer with esbuild.
  - Copies WASM binary (`sql-wasm.wasm`), HTML pages, CSS, assets, sounds, and PWA manifest into `dist-web/`.
- **Local Dev Server**: `npm run start:web` (starts a lightweight HTTP server for testing).
- **Automated Verification**:
  - Verification validating `start -> lobby -> create project -> record audio -> export .sjr -> import .sjr`.

---

## Part 3 — Verification & Acceptance Criteria

| # | Check | Target | Verification Method |
|---|---|---|---|
| 1 | Desktop Non-Regression | Windows, macOS, Linux | `npm test` (154/154), `npm run smoke`, `npx tsc --noEmit` |
| 2 | Android Non-Regression | Android APK | `./gradlew assembleDebug` compiles without error |
| 3 | In-Browser SQLite | Chrome, Safari, Firefox | Create project, refresh page, verify data persists via IndexedDB |
| 4 | Offline Capability | Airplane Mode / Offline | Disconnect network in DevTools; app boots and runs without errors |
| 5 | Camera & Mic Capture | Chrome / Safari | Record sound & take photo; verify audio plays and photo renders on sprite |
| 6 | `.sjr` Roundtrip | Desktop ↔ Web | Export `.sjr` from web, import into desktop; verify identical project state |

---

## Part 4 — Decision Log & Technical Boundaries

1. **Why `sql.js` instead of rewriting storage in pure IndexedDB?**
   - ScratchJr's internal queries (`PROJECTS`, `USERSHAPES`, `USERBKGS`) rely on relational SQLite semantics (rowids, ordering, filters).
   - Reusing `sql.js` allows sharing the exact same SQL schema and queries between Desktop, Android, and Web, eliminating divergence risk.
2. **Where will the Web version be hosted?**
   - Can be served anywhere: GitHub Pages (`/docs/app`), Vercel, Netlify, or self-hosted in school intranets.
