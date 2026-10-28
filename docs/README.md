# Documentation

Documentation for **ScratchJr Reborn** (`v2.15.0`) — a modernized, universal multi-target edition of ScratchJr supporting **Desktop** (Tauri v2 & Electron 45), **Android** (Kotlin WebView shell), and **Web / PWA** (in-browser SQLite WASM + IndexedDB).

## Core Reference Guides

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — verified process topology across all 4 hosts (Electron, Tauri v2, Android, and Web/PWA), data flows, security boundaries, and module map
- **[development.md](./development.md)** — how the project is built, tested, and released across Desktop, Android, and Web/PWA, plus CLI flags, CSS preprocessing, editor layout/limits, and known quirks
- **[engine.md](./engine.md)** — editor engine architecture: `EnginePorts` & `modelRegistry` seams, module graph, runtime execution model (`Runtime`/`Thread`/`Prims`), Reborn blocks, file format flow, and how to extend the editor
- **[THREAT-MODEL.md](./THREAT-MODEL.md)** — security threat model, trust boundaries, SVG & archive hardening, and CI supply-chain controls
- **[SCHOOL-DEPLOYMENT.md](./SCHOOL-DEPLOYMENT.md)** — fleet deployment guide: Windows MSI & Tauri/Electron silent install, Intune/GPO, update suppression (`--no-update-check`), multi-user lab data layout, and backup/recovery
- **[RELEASE.md](./RELEASE.md)** — maintainer release runbook, version lockstep protocol, verification gates, and CI artifact publishing
- **[WEB-PORT-PLAN.md](./WEB-PORT-PLAN.md)** — Web/PWA architecture (`browserClient.js`), `sql.js` WebAssembly + IndexedDB backing, Web Locks concurrency, and offline Service Worker caching
- **[ANDROID-PORT-PLAN.md](./ANDROID-PORT-PLAN.md)** — native Android port architecture, Kotlin bridge specification, WebView hardening, and audit findings log
- **[ANDROID-PORT-PROGRESS.md](./ANDROID-PORT-PROGRESS.md)** — Android port milestone record, device verification results, and ADB debugging quickstart

### Historical Audits & Issue Specs

- **[PONYTAIL-AUDIT.md](./PONYTAIL-AUDIT.md)** — historical codebase & tooling over-engineering audit (`v2.10.0`, remediated in `v2.10.1`)
- **[issue-15-import-audit.md](./issue-15-import-audit.md)** — historical resilient project import audit & verification spec (resolved in `v2.13.2`)

> Note: `ipc-inventory.md` and the 2026-08 handoff documents were removed as
> outdated after the v1.7.0 architecture refactor. The authoritative IPC
> surface is `src/preload.ts` + the `IpcBridge` / `ScratchJrBridge` types in
> `src/types/globals.d.ts` (and documented in the companion GitHub Wiki `IPC-Inventory.md`);
> database access goes exclusively through structured intents (`src/lib/db-intents.ts`,
> `src-tauri/src/db.rs`, `AndroidDatabaseManager.kt`, and `src/browserClient.js`).

## Quick orientation

- **Renderer sources**: `src/app/src/**/*.ts` (TypeScript, strict mode, bundled by esbuild with per-page code splitting)
- **Editor/UI seam**: `src/app/src/editor/engine/ports.ts` (typed `EnginePorts`, zero runtime imports of UI singletons from engine/blocks)
- **Element→model lookups**: `src/app/src/editor/modelRegistry.ts` (`WeakMap` element→model, no DOM expandos)
- **Host abstraction seam**: `src/hostClient.js` routes to:
  - Desktop (Electron 45): `src/electronClient.js` + `src/preload.ts`
  - Desktop (Tauri v2): `src/tauriClient.js` + `src-tauri/src/` (Rust)
  - Android (Kotlin): `src/webhost.js` + `android/app/src/main/java/org/scratchjr/android/`
  - Web / PWA: `src/browserClient.js` (WebAssembly `sql.js` + IndexedDB)
  - Shared WebRTC multimedia: `src/webav.js` (Opus `MediaRecorder` + HTML5 Canvas camera feed)
- **Main process (Electron)**: `src/main.ts` + `src/main/*.ts`; compiled to `build/`
- **Native backend (Tauri v2)**: `src-tauri/src/{lib,commands,db,io}.rs` (`rusqlite` 0.41)
- **Native shell (Android)**: `android/app/src/main/java/org/scratchjr/android/` (Kotlin, `compileSdk` 37 / `targetSdk` 36, SQLite WAL)
- **Database intents & validation**: `src/lib/db-intents.ts` (Electron), `src-tauri/src/db.rs` (Tauri), `AndroidDatabaseManager.kt` (Android), and `src/browserClient.js` (Web)
- **Unit & component tests**: `npm test` (Vitest 5; 42 test files / 372 tests in `tests/unit/`, plus `cargo test` in `src-tauri/`)
- **Static analysis**: `npm run typecheck` (TypeScript 7) and `npm run lint` (ESLint 10 flat config in `eslint.config.mjs`)
- **End-to-end harnesses**: `npm run smoke` (`scripts/smoke-test.js`), `node scripts/smoke-web.js`, `npm run interact` (`scripts/interaction-test.js`)
- **Package Desktop (Electron)**: `npm run make:zip` (builds renderer bundle first) and `node scripts/build-msi.js`
- **Package Desktop (Tauri v2)**: `npm run tauri:build && npm run package:tauri` (outputs NSIS `.exe`, `.msi`, and `.zip` to `out/tauri-win32-x64/`)
- **Package Android**: `npm run build:android` → `cd android && ./gradlew assembleDebug` (APK at `android/app/build/outputs/apk/debug/`)
- **Build Web / PWA**: `npm run build:web` (outputs standalone site to `dist-web/`); `npm run serve:web`
- **Release**: bump version in lockstep across all targets → verify gates → commit → tag `v*.*.*` → CI builds and publishes all artifacts
