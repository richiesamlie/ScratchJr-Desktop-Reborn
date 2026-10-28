# Development Guide

Practical knowledge for working on **ScratchJr Reborn** (`v2.15.0`). Covers the build pipeline, CLI flags, CSS preprocessing, the editor layout/limits map, Reborn blocks, the project file format, testing, and releasing across Desktop (Electron & Tauri v2), Android, and Web/PWA.

## Build pipeline — read this first

The renderer is bundled by esbuild with **per-page code splitting**:
`src/app/dist/app.bundle.js` is the entry script loaded by each HTML page (`src/app/renderer-entry.js` → `src/app/appEntry.js`), which dynamically imports page-specific chunks (`editor-*.js`, `home-*.js`, `index-*.js`, `inapp-*.js`) and shared chunks.

- **The bundle is gitignored** — it is generated, never committed. `npm install` automatically runs `build:renderer` via `postinstall` so fresh clones work out of the box.
- **`npm run make:zip` builds the bundle automatically** before packaging (`scripts/package-and-zip.js` runs `build-renderer.js` first). Do not remove that step — a release built without it ships an app that cannot load its UI.
- After editing any renderer `.ts` or `.css` file, rebuild with `npm run build:renderer` (or `npm run build:web` / `npm run build:android` for those targets) before packaging or boot-verifying.

### Verification harnesses

```bash
npm test                     # Vitest 5 unit suite (42 files / 372 tests)
npm run typecheck            # TypeScript 7 strict check (renderer + main)
npm run lint                 # ESLint 10 flat-config check (eslint.config.mjs)
npm run smoke                # Electron CDP boot: start -> lobby -> editor -> help -> media round-trip
node scripts/smoke-web.js    # Headless Chrome CDP E2E test for Web/PWA (create, save, export, import)
npm run interact             # Real pointer drags: sprite move, palette->script docking, undo, .sjr & PNG
```

**Verifying a packaged desktop build:**

```bash
node scripts/smoke-packaged.js out/ScratchJr-win32-x64   # boots the packaged app, expects [SCRATCHJR_READY]
# or check the bundle made it into the asar:
node -e "const a=require('@electron/asar');const p='out/ScratchJr-win32-x64/resources/app.asar';console.log(a.extractFile(p,'src\\\\app\\\\dist\\\\app.bundle.js').length)"
```

## CLI flags & environment variables

| Flag / Env Var | Example | Effect |
|---|---|---|
| `--lang=xx` / `--lang xx` | `./ScratchJr --lang=fr` | Override locale at launch. Parsed in `src/main/ipc-handlers.ts` (Electron) and `src-tauri/src/commands.rs` (Tauri), exposed via `io_getLang` / `io_get_lang`, consumed in `Localization.includeLocales()`. |
| `--no-update-check` / `--disable-update-check` | `./ScratchJr --no-update-check` | Suppress automatic startup update check, remove "Check for Updates..." from the File menu, and block outbound update network calls (`src/main/updater.ts`). |
| `SCRATCHJR_NO_UPDATE_CHECK=1` | `SCRATCHJR_NO_UPDATE_CHECK=1` | Environment variable equivalent of `--no-update-check` for fleet-wide session profiles (`/etc/environment`, GPO). |

**Locale resolution order:**
1. `--lang=xx` CLI flag (highest priority)
2. `localStorage['localization']` (user's saved selection)
3. System/browser locale via `navigator.language`
4. Fallback to `defaultLocale` in `settings.json` (`en`)

## CSS preprocessing & multi-resolution scaling

CSS files in `src/app/css/` use template tokens (e.g. `${css_vh(10)}`), evaluated at **load time** by `preprocessAndLoadCss()` (`src/app/src/utils/lib.ts`) using an eval-free regex preprocessor and loaded in parallel via `loadCssList()` while preserving deterministic `<style>` tag cascade order.

- `css_vh(N)` → `N% of innerHeight` **in pixels, baked when the page loads**.
- `calc(100% - …)` percentages resolve **live** against the containing block.
- **Multi-resolution scaling (`v2.15.0`)**: `scaleMultiplier` is dynamically evaluated across standard (`1024×768`), Full HD (`1920×1080`), and QHD (`2560×1440`) viewports with `requestAnimationFrame`-debounced window resize recalculation.
- **Sub-740px smartphone scaling**: `applyResponsiveFrameScale()` in `lib.ts` dynamically scales `#frame`, `#libframe`, and `#paintframe` (`currentUiScale = innerHeight / 740`) on compact landscape viewports and normalizes touch coordinates in `Events.getTargetPoint()`.

## Editor layout & limits map

| Limit / area | Where | Current value |
|---|---|---|
| Pages per project | `window.Settings.maxPages` read in `Thumbs.updatePages` | `10` (`src/app/settings.json`) |
| Stage resolution | `Stage.ts` / `stageMetrics.ts` | Configurable `480×360` (SD) or `960×720` (HD) |
| Stage tools dock | `#stageframe::before` (`editor.css`) | Top-of-canvas tactile dock behind `#full`, `#grid`, `#setbkg`, `#addtext`, `#resetall`, `#go` |
| Middle block palette | `#blockspalette` / `#palette` | `86px` / `71px` height with category-tinted pill tray and adaptive `comfortRatio` horizontal block spacing |
| Storyboard scene strip | `.pagescc` / `.pagethumb` | `140px` flex-sized cards with slim `6px` scrollbar; `#emptypage` pinned via `position: sticky; bottom: 0` |
| Character sidebar | `#library .spritethumbs` | `max-height: calc(100% - 10.29vh-px)` so `.addsprite` (+ button) is always visible |
| Lobby toolbar | `#lobby-toolbar` in `.inner` before `#scrollarea` | Real-time search input + Recent / A–Z sort toggle (preserves `#scrollarea` child index invariant for `Home.getNextName()`) |

**Engine & layout invariants:**
1. **`#scrollarea` child invariant**: `Home.getNextName()` inspects `#scrollarea.childElementCount`. Never insert toolbars or non-card elements inside `#scrollarea`; mount them in `.inner` before `#scrollarea`.
2. **`#stageframe` direct children**: Presentation mode reparents `#stageframe` children — keep stage tool buttons as direct children of `#stageframe` and use pseudo-elements (`#stageframe::before`) for visual dock backgrounds.
3. **Character strip scrolling**: Native `scrollTop` on `.spritethumbs` is the single source of truth; the custom scrollbar (`#sbthumb`) syncs from a `scroll` listener (`UI.updateSpriteScroll`).

## Reborn blocks & extensions

ScratchJr Reborn extends the original block set while keeping the pre-reader single-argument paradigm across all 12 supported locales (`en`, `ca`, `de`, `es`, `fr`, `it`, `ja`, `nl`, `pt`, `sv`, `th`, `zh-cn`):

- **Start (Yellow)**:
  - `ontouchsprite` — starts when touching a specific same-page character selected via a picture picker (clearing references if the target sprite is deleted).
  - `ontouchcolor` — starts when touching a target color (preset swatches or interactive stage loupe eyedropper).
- **Motion (Blue)**:
  - `flipX` — horizontal mirror flip (`scaleX` toggle).
  - `randompos` — glides smoothly to a discrete random grid coordinate (`0..19` × `0..14`) at the active character speed.
- **Looks (Purple)**:
  - `color` — shifts character hue via CSS `filter: hue-rotate(n * 36deg)` (`-10..10`).
  - `fade` — adjusts character ghosting/transparency (`-10..10`, capped at 80% ghosting / minimum 20% opacity so sprites never become invisible; reset by `same` and `goHome()`).
- **Sound (Green)**:
  - Curated 16-sound library (`SoundLib.ts` & `SoundPicker.ts`) across Animals, Instruments, and Fun FX via the `+` sound palette button, plus custom audio file import (`.wav`, `.mp3`, `.ogg`, `.webm`, `.m4a`).
- **Flow (Orange)**:
  - `waitrandom` — waits a random duration between `0` and the specified maximum (`0..50` tenths of a second).
- **End (Red)**:
  - `randompage` — transitions execution to a random page other than the current page when the project has >1 page (safe no-op on single-page projects).

## Project file format (typed contract)

Defined in `src/app/src/editor/ui/Project.ts` and shared across the engine:

- `ProjectData` — the project bag: `pages: string[]`, `currentPage`, one `PageData` per page id, plus merged undo-action fields
- `PageData` — `lastSprite`, `sprites: string[]`, one `SpriteData` per sprite id
- `SpriteData` — `id`, `type`, `scripts: EncodedStrip[]`, `sounds`, `fontFamily?`, plus attribute passthrough
- `EncodedStrip` — recursive `[blocktype, arg, dx, dy, (nested strips)?]` encoding

Facts that matter:
- A strip's blocks are linked via `.next`; `encodeStrip` walks the chain from the head — **one strip per script**, not per block.
- `'null'` as an arg means "use the spec default" (e.g. `hop` re-encodes its default `2`). Encode with the *current* value for round-trip identity.
- Undo snapshots are `Project.getUndo()` + the action descriptor — the bags are the file format; keep `Undo.ts` consumers on the shared types.

## Renderer testing (jsdom)

`tests/unit/renderer-*.test.js` (and UI/block tests) run in jsdom (`// @vitest-environment jsdom`) and **import `./renderer-harness.js` first**. The harness stubs `SVGMatrix`/`WebKitCSSMatrix`, canvas 2d context, `img.complete`, `window.Settings`, and the preload/tablet bridges.

Per-test setup:
- `resetDom()` — fresh `#scriptscontainer`, `#pagesdiv`, stub `ScratchJr.stage`
- `stubMedia()` — stub `PlatformBridge.getmedia` (sprite construction kicks off async media loads)
- `BlockSpecs.initBlocks()` — populates block defs
- Construct `Page` with data (`{ lastSprite: '', sprites: [], layers: [], num: 1 }`) — an empty constructor triggers `emptyPage()` → `createCat()` → `MediaLib`

## Desktop: Lightweight Tauri v2 Workflow

Prerequisites: Node.js 26+ and Rust stable toolchain (`1.99+`).

```bash
# 1. Dev mode (runs build:renderer + launches Tauri window)
npm run tauri:dev

# 2. Run Rust backend unit tests
cargo test --manifest-path src-tauri/Cargo.toml

# 3. Build release binaries (MSI, NSIS setup.exe, and portable exe)
npm run tauri:build

# 4. Package to out/tauri-win32-x64/ and generate release zip + .sha256 sidecars
npm run package:tauri
```

## Building for Android

ScratchJr Android uses a native Kotlin shell (`WebView` + `WebViewAssetLoader` + `@JavascriptInterface`).

### Prerequisites
- Node.js 26+
- JDK 17 (or 21)
- Android SDK (`compileSdk = 37`, `targetSdk = 36`, `minSdk = 24`, Gradle `9.8.2`, AGP `9.4.1`)
- `ANDROID_HOME` pointing to your Android SDK directory

### Build steps

```bash
# 1. Bundle web assets (esbuild target chrome107) and sync to Android asset staging
npm run build:android

# 2. Build Debug APK
cd android
./gradlew assembleDebug

# Or build Release APK / Google Play App Bundle
./gradlew assembleRelease bundleRelease
```

Generated packages:
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk` (or `-unsigned.apk` when keystore env vars are omitted)
- App Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

### Installing & Running on Device / Emulator

```bash
# Install debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Grant hardware permissions
adb shell pm grant org.scratchjr.android.debug android.permission.CAMERA
adb shell pm grant org.scratchjr.android.debug android.permission.RECORD_AUDIO

# Launch application
adb shell am start -n org.scratchjr.android.debug/org.scratchjr.android.MainActivity
```

### Logging & Remote Debugging

Filter logcat output by key component tags:
```bash
adb logcat -s ScratchJr-JS AndroidBridge AndroidDatabaseManager MainActivity
```

To inspect the live WebView DOM and JS console:
```powershell
$pid = (adb shell pidof org.scratchjr.android.debug).Trim()
adb forward tcp:9222 "localabstract:webview_devtools_remote_$pid"
# Open chrome://inspect in Chromium / Google Chrome
```

## Web & PWA development

ScratchJr Reborn includes a standalone browser-based distribution powered by `sql.js` (`1.15.1` WebAssembly SQLite) with IndexedDB persistence, Web Locks multi-tab concurrency protection, Service Worker offline caching, and PWA manifest.

### Build & run locally

```bash
# 1. Compile web bundle and package dist-web/
npm run build:web

# 2. Start local static dev server
npm run serve:web

# 3. Open browser at http://localhost:3000
# - Landing page: http://localhost:3000/
# - Web App: http://localhost:3000/play/ or http://localhost:3000/app/
```

### Automated Web Verification

```bash
# Run headless Chrome CDP end-to-end smoke test
node scripts/smoke-web.js
```

## Releasing

See [RELEASE.md](./RELEASE.md) for the complete release runbook and version lockstep checklist across `package.json`, `src/app/settings.json`, `src/app/sw.js`, `android/app/build.gradle.kts`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `version.json`, `docs/index.html`, and `CHANGELOG.md`.

```bash
npm version X.Y.Z --no-git-tag-version   # bumps package.json + lockfile
# Update all lockstep files and run verification gates (see RELEASE.md)
git commit -m "Release vX.Y.Z"
git push origin master
git tag vX.Y.Z && git push origin vX.Y.Z  # CI builds Electron, Tauri, Android, and publishes release
```

## Known quirks & guardrails

- **Never commit generated build outputs** (`src/app/dist/`, `android/app/src/main/assets/www/`, `dist-web/`, `out/`). CI enforces `git ls-files android/app/src/main/assets` is empty.
- `src/types/globals.d.ts` expando declarations must stay mutually consistent (`HTMLElement.next` vs `ChildNode.next`).
- `Library.close` resets `selectedOne`/`clickThumb` and detaches mouse handlers, and `closeSpriteSelection` guards on `ScratchJr.onHold` to prevent re-entrant character additions.
- `Project.loadTask()` and `Project.delayLoad` include fail-safe watchdog timeouts (`3500ms` and `2500ms`) so missing or corrupted external assets never cause an infinite loading spinner.
- `MediaLib.keys` is populated asynchronously at runtime — unit tests must not depend on it (construct `Page` with explicit data instead).
