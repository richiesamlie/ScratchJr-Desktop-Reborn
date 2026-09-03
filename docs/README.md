# Documentation

- **[development.md](./development.md)** — how the project is built, tested, and released (desktop, Android, and Web/PWA), plus the editor layout/limits map and known quirks
- **[WEB-PORT-PLAN.md](./WEB-PORT-PLAN.md)** — Web/PWA port architecture, sql.js WebAssembly IndexedDB backing, offline caching, and verification log
- **[ANDROID-PORT-PLAN.md](./ANDROID-PORT-PLAN.md)** — native Android port architecture, Kotlin bridge specification, and audit findings log
- **[ANDROID-PORT-PROGRESS.md](./ANDROID-PORT-PROGRESS.md)** — session milestones, physical device verification results, and resume guide
- **[engine.md](./engine.md)** — the editor engine architecture: module graph, runtime execution model (Runtime/Thread/Prims), file format flow, and how to extend the editor
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — verified process topology, tri-host model (Desktop vs Android vs Web/PWA), data flows, and security boundaries
- **[THREAT-MODEL.md](./THREAT-MODEL.md)** — security threat model and mitigations
- **[SCHOOL-DEPLOYMENT.md](./SCHOOL-DEPLOYMENT.md)** — fleet deployment guide: MSI/silent install, Intune/GPO, data layout, upgrade & rollback caveats
- **[RELEASE.md](./RELEASE.md)** — release runbook and procedures for maintainers

> Note: `ipc-inventory.md` and the 2026-08 handoff documents were removed as
> outdated after the v1.7.0 architecture refactor. The authoritative IPC
> surface is `src/preload.ts` + the `ScratchJrBridge` type in
> `src/types/globals.d.ts`; database access goes through
> `src/lib/db-intents.ts` (structured intents, no renderer SQL).

## Quick orientation

- Renderer sources: `src/app/src/**/*.ts` (TypeScript, full strict mode)
- Editor/UI seam: `src/app/src/editor/engine/ports.ts` (typed EnginePorts)
- Element→model lookups: `src/app/src/editor/modelRegistry.ts` (no DOM expandos)
- Host abstraction: `src/hostClient.js`, `src/electronClient.js`, `src/webhost.js`, `src/browserClient.js`, `src/webav.js`
- Main process (Desktop): `src/main.ts` + `src/main/*.ts`; compiled to `build/`
- Native shell (Android): `android/app/src/main/java/org/scratchjr/android/` (Kotlin)
- Browser/PWA Host: `src/browserClient.js` (WebAssembly SQLite + IndexedDB)
- Database intents & validation: `src/lib/db-intents.ts` (Desktop/Web sql.js) & `AndroidDatabaseManager.kt` (Android native SQLite WAL)
- Tests: `npm test` (vitest; `tests/unit/` — main-process + jsdom renderer harness)
- End-to-end harnesses: `npm run smoke`, `node scripts/smoke-web.js`, `npm run interact`
- Package Desktop: `npm run make:zip` (builds the renderer bundle first — never skip that)
- Package Android: `npm run build:android` → `cd android; gradlew assembleDebug` (APK at `android/app/build/outputs/apk/debug/`)
- Build Web / PWA: `npm run build:web` (outputs standalone site to `dist-web/`); `npm run serve:web`
- Release: bump version → commit → tag `v*.*.*` → CI builds all targets and publishes
