# Agent Guidelines & Update Protocol

Whenever making an update to this repository (feature, bugfix, or release), every agent MUST follow this protocol:

## 1. Cross-Platform Scoping
ScratchJr Reborn is a universal multi-target project supporting **Desktop** (Electron & Tauri), **Android** (Kotlin shell), and **Web / PWA** (in-browser SQLite WASM).
- **Assess cross-platform applicability**: When fixing a bug or adding a feature, evaluate if it affects or should be implemented across Desktop (Electron & Tauri), Android, and Web.
- **Maintain host isolation**: Keep platform-specific code in its respective adapter:
  - Desktop (Electron): `src/electronClient.js`
  - Desktop (Tauri): `src/tauriClient.js` & `src-tauri/`
  - Android: `src/webhost.js` & `android/`
  - Web/PWA: `src/browserClient.js`
  - Never break host abstraction seams (`src/hostClient.js`).

## 2. Version Lockstep & Release Protocol (When Bumping Version)
All version references must be updated in lockstep:
- `package.json` & `package-lock.json`
- `src/app/settings.json` (`scratchJrVersion: "desktop-vX.Y.Z"`)
- `android/app/build.gradle.kts` (`versionCode`, `versionName`)
- `src-tauri/Cargo.toml` (`version = "X.Y.Z"`) & `src-tauri/tauri.conf.json` (`"version": "X.Y.Z"`)
- `version.json` & `docs/version.json`
- `CHANGELOG.md`

**Always Include Tauri in Releases**: Whenever creating a new release or bumping versions, Tauri release packages (`npm run tauri:build && npm run package:tauri`) MUST be built, checksummed, and uploaded to the GitHub release alongside Electron and Android packages.

## 3. Mandatory Verification Gate
Before declaring any task complete or pushing:
- **Unit Suite**: `npm test` (all tests must pass 100%).
- **Static Analysis**: `npm run typecheck && npx eslint src` (must have 0 errors).
- **Target Builds**:
  - `npm run build:renderer` (recompiles renderer bundle)
  - `npm run build:main` (if main process touched)
  - `npm run build:web` (if web/docs touched; updates `dist-web/`)
  - `node scripts/build-android-assets.js` (if android touched)
- **E2E Smoke Tests**:
  - Web: `node scripts/smoke-web.js`
  - Desktop: `node scripts/smoke-test.js`

## 4. Documentation & Wiki Synchronization
- Log every notable change in `CHANGELOG.md` with clear categories.
- When architecture, APIs, build runbooks, or platform capabilities change, update both local `docs/` and the companion GitHub Wiki repository at `c:\weeklyprogram\ScratchJr-wiki`.
- Keep wiki files (`Home.md`, `Changelog.md`, `Development-Guide.md`, `IPC-Inventory.md`) in sync and committed.

## 5. Deployment & Git Hygiene
- Do not commit generated build outputs (e.g. `src/app/dist/`, `android/app/src/main/assets/www`, `dist-web/`).
- After web changes, run `npm run build:web` to ensure `dist-web/` builds cleanly for GitHub Actions Pages deployment.
- Make clean, logical, bisectable git commits.
