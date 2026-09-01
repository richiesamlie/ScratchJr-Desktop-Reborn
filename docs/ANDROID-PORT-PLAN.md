# ScratchJr Android Port — Implementation Plan (Option A)

**Status:** Approved plan, experimental track
**Host strategy:** Option A — recover the native Kotlin WebView shell from git history (`7eb82c8`), no Capacitor
**Scope:** Android only. iOS, phone-first UI, and repo restructuring are explicit non-goals (Appendix D)
**Branch:** new long-lived experimental branch `mobile/android`, cut from `master`
**Baseline:** v1.8.0 desktop release state (current `master` @ `8b2ff46`)

---

## Part 0 — Ground Truth

Everything in this part is verified against the current tree or git history. This is what exists; the plan builds only on this.

### 0.1 The platform seam already exists and already handles Android

| Fact | Evidence |
|---|---|
| Renderer talks to the host exclusively through `PlatformBridge` | `src/app/src/platform/PlatformBridge.ts:20-363` |
| `waitForInterface` binds, in order: existing interface → `AndroidInterface` → `window.tablet` (100 ms retry) | `src/app/src/platform/PlatformBridge.ts:39-68` |
| The host contract is fully typed: `ScratchJrBridge` (IPC channels + sound/recording/camera/sharing) | `src/types/globals.d.ts:101-125` |
| Desktop implements the same contract renderer-side: `ElectronDesktopInterface` assigned to `window.tablet` | `src/electronClient.js:58-999` |
| Database access is a typed, SQL-free, allowlisted intent protocol — renderer never sends SQL | `src/types/globals.d.ts:192-211`, composed main-side in `src/lib/db-intents.ts` |
| `.sjr` import is already transactional: all assets persist before the project row is created | `src/app/src/platform/IO.ts:672-681` (v1.8.0 CHANGELOG: "fully transactional") |
| Main-process DB persistence is atomic: tmp write → integrity check → `.bak` rotation → rename; orphaned `.tmp` cleanup | `src/main/database.ts:48-75` |
| Renderer is bundled by esbuild with per-page code splitting; pages dispatch via `data-scratchjr-page` | `scripts/build-renderer.js`, `src/app/appEntry.js:20-42` |
| Editor drag paths already normalize `MouseEvent`/`TouchEvent`/`PointerEvent` coordinates (v1.8.0 smartboard hardening) | `src/app/src/utils/Events.ts`, CHANGELOG v1.8.0 |
| Autosave already exists: `autoSaveInterval: 30000` in settings | `src/app/settings.json:19` |

**Consequence:** the Android host does not need a new abstraction. It needs to provide an object satisfying `ScratchJrBridge` on `window.AndroidInterface` (injected via `WebView.addJavascriptInterface`). Renderer changes are near zero.

### 0.2 History — the port existed, worked, and was reverted for release hygiene

Chronology (all on this repo):

```
840e7b3  feat(android): native Kotlin shell, AndroidBridge, SQLite storage, build pipeline
3154664  ci: setup-java@v4, setup-gradle@v3
6ed4c5d  docs: Android release packages in README
b565065  fix(android): initial navigation hang + touch tap support in WebView
70ea661  fix(ui): responsive scaling/viewport for mobile & tablet
7eb82c8  feat(android): back navigation dispatcher, lifecycle pause/resume, cutout handling
087fc33  revert: rollback Android port changes, restore desktop release state  ← last state before revert = salvage base
6712072  feat(updater): GitHub Pages CDN version.json       (master, main-side only)
8b2ff46  fix(updater): Fastly/jsDelivr CDN endpoints          (master, main-side only)
```

**Why reverted:** commit `087fc33` message says "restore desktop release state". The revert deleted **1,026 files / 917,318 lines** — because `840e7b3` had committed the entire built output (~1,000 copied files) into `android/app/src/main/assets/www/` alongside legitimate source. The port itself reached working state (navigation, touch, responsive CSS, back-button, lifecycle all fixed in follow-ups). Architecture was never the failure; **committing build artifacts was.**

**Salvage base:** `7eb82c8` (equivalently `087fc33^`). Everything below marked "recovered" comes from `git show 7eb82c8:<path>`.

**Post-revert master drift:** the two updater commits touch only `src/main/` and docs — **zero renderer conflicts expected** with the recovered renderer diffs.

### 0.3 Verified blockers (what actually must change in core code)

1. **`bootApp()` hard-throws without Electron.**
   `src/app/appEntry.js:37-39`: `if (!window.scratchjr) throw new Error('ScratchJr: preload bridge missing')`. In Android WebView there is no preload; the app dies on boot. The old port patched this to `if (window.scratchjr) { ... }` around the close handshake (seen in the `087fc33` diff).

2. **All 8 HTML pages hard-load the Electron client.**
   e.g. `src/app/index.html:12`: `<script src='../electronClient.js'></script>`. In the WebView, `electronClient.js` line 5 (`const bridge = window.scratchjr`) yields `undefined`, and line 50 (`bridge.onDatabaseRestored(...)`) throws a TypeError. Harmless-but-noisy in the old port (Android path never uses `window.tablet`), but it must become host-conditional — and the old `build-android-assets.js` even copied `electronClient.js` into the APK, which is dead weight.

3. **Build artifacts must never be committed.**
   `android/app/src/main/assets/www/` is *output* of `scripts/build-android-assets.js`. It belongs in `.gitignore`, enforced by CI (Appendix C).

4. **`esbuild` target is `chrome150`** (`scripts/build-renderer.js:26`) for Electron 43/Chromium 150. Android System WebView on real (especially classroom) tablets can be years behind. Needs a per-target build (decision in P2).

5. **Google Play targetSdk gate is already in force.** As of 2026-08-31, new apps and updates must target **API 36**. The recovered Gradle config is `compileSdk/targetSdk 34, AGP 8.4.1` — must be bumped, with an AGP upgrade (P2).

### 0.4 Salvage manifest (recovered from `7eb82c8`)

```
android/app/build.gradle.kts                       compileSdk 34 → bump to 36 (P2)
android/app/proguard-rules.pro                     keeps @JavascriptInterface + bridge classes
android/app/src/main/AndroidManifest.xml           CAMERA/RECORD_AUDIO perms, landscape,
                                                   .sjr VIEW intent-filter, FileProvider,
                                                   windowSoftInputMode=adjustNothing
android/app/src/main/res/                          activity_main.xml (WebView), mipmaps (1 icon, all densities), colors/strings/styles, file_paths.xml
android/app/src/main/java/org/scratchjr/android/
    MainActivity.kt          (288 lines)  WebView setup, WebViewAssetLoader (/assets/),
                                          WebChromeClient console+permission grant,
                                          runtime permission launchers,
                                          back-button dispatcher, onPause/onResume,
                                          cutout (shortEdges) handling, hideSystemUI
    bridge/AndroidBridge.kt  (253 lines)  @JavascriptInterface implementations:
                                          database_stmt/query, io_getsettings,
                                          io_gettextresource (assets/www/<f>),
                                          io_setfile/getfile/remove/cleanassets/getmd5,
                                          io_getmedia/getmedialen/getmediadata/getmediadone,
                                          io_setmedia/setmedianame, io_getIsDebug, io_getLang
                                          + MediaCache (23 lines), CryptoUtils/md5 (19 lines)
    database/AndroidDatabaseManager.kt (384 lines)  native SQLite, media directory,
                                                    project-file CRUD
    database/DbOpenHelper.kt            (87 lines)  schema DDL — must match main-side initTables
scripts/build-android-assets.js       runs build-renderer, copies pages+dist+assets+
                                     localizations+samples+css+inapp into assets/www
.github/workflows/build-android.yml   SHA-pinned actions, JDK17+Node22+Gradle,
                                     assembleDebug/Release + bundleRelease, artifact upload
src/app renderer diffs (70ea661, b565065, 7eb82c8):
    css/{start,base,editor,lobby,librarymodal}.css   responsive/viewport fixes
    src/entry/{index,home}.ts, src/lobby/{Lobby,Home}.ts  bindTap touch shims
    src/app/appEntry.js                               tolerant bootApp
```

**Audit item (completed — see Appendix A):** Full review found: no `recordsound_*`/`scratchjr_*` camera methods on the bridge (P5 implements them); `.sjr` import intent calls nonexistent `importSjrBase64` (P8 wires it); PNG asset serving via `PlatformBridge.path` was broken in WebView (P3 fixes); media atomicity lacks `.bak` rotation and uses delete-before-rename (P3 fixes); back-nav has dead `paint.html`/`help.html` branches (P4 removes).

---

## Part 1 — Host Decision: Option A (locked)

**Decision:** Native Android shell — `WebView` + `WebViewAssetLoader` + `@JavascriptInterface` bridge. No Capacitor, no Cordova, no new npm dependencies.

**Why:**
- The code already exists and already ran on hardware (`7eb82c8`). Salvage is the cheapest path to a running APK.
- Zero new dependency tree; the repo's only runtime dep is `sql.js` (desktop main-side).
- Full control over back-button dispatch, lifecycle, cutout, permissions — all already implemented in the recovered `MainActivity.kt`.
- The `ScratchJrBridge` contract keeps a future iOS/Capacitor host possible without renderer changes — the door stays open, we just don't walk through it now.

**Trade-off accepted:** no shared native shell with iOS. If/when iOS becomes a goal, the renderer work done here transfers; the native shell would be rebuilt (WKWebView) or Capacitor would be adopted *then*, with Android already proving the contract.

**Revisit triggers (documented, not planned):** needing iOS within 2 quarters; or WebView edge cases (getUserMedia, keyboard) consuming > 2 weeks of native patching that a Capacitor plugin would eliminate.

---

## Part 2 — Phases

Each phase = one or more commits on `mobile/android`. Every phase lists goal / tasks / files / acceptance / risk / rollback. Nothing proceeds to the next phase until acceptance passes.

### P0 — Branch & Salvage

**Goal:** experimental branch exists; all recoverable material extracted; nothing built is committed.

**Tasks:**
1. `git checkout -b mobile/android` from `master`.
2. Recover native sources into the working tree (do **not** recover `assets/www/` content):
   ```bash
   git checkout 7eb82c8 -- android/app/src/main/java android/app/src/main/res
   git checkout 7eb82c8 -- android/app/build.gradle.kts android/app/proguard-rules.pro
   git checkout 7eb82c8 -- android/build.gradle.kts android/settings.gradle.kts android/gradle.properties android/gradle/libs.versions.toml
   git checkout 7eb82c8 -- scripts/build-android-assets.js .github/workflows/build-android.yml
   ```
   (If empty `android/` dirs from the failed revert interfere, delete them first — only `.DS_Store` files remain.)
3. Extract renderer diffs to patch files for review (apply later in P1/P4/P7):
   ```bash
   git diff 087fc33^ 087fc33 -- src/app > _salvage/renderer.patch
   git diff 087fc33^ 087fc33 -- package.json > _salvage/package.patch
   ```
4. **Audit (read, don't trust):** full `AndroidBridge.kt`, full `AndroidDatabaseManager.kt`, `DbOpenHelper.kt` DDL vs `src/main/database.ts` `initTables()` (table/column parity — a mismatch breaks the shared intent protocol silently), and `MediaCache.kt` eviction behavior.
5. Verify `git show 7eb82c8:android/app/src/main/assets/www/index.html` script tags — confirm the recovered HTML situation (assets copies are NOT recovered; the source `src/app/*.html` get the P1 treatment instead).

**Files:** new `android/**`, `scripts/build-android-assets.js`, `.github/workflows/build-android.yml`, `_salvage/*.patch` (temp, gitignored or removed after use).

**Acceptance:** branch exists; `git status` shows recovered sources only, **zero files under `android/app/src/main/assets/`**; audit notes written into this plan's "Salvage audit" appendix (A).

**Risk:** Gradle/AGP drift since Aug 2026 (AGP 8.4.1 vs current Studio). Mitigated in P2 by upgrading immediately, not by fighting old versions.

**Rollback:** delete branch.

### P1 — Host Parametrization (the only renderer change before UI work)

**Goal:** the web app boots under any host; desktop behavior bit-identical.

**Tasks:**
1. **`src/app/appEntry.js`** — `bootApp()`: replace the hard throw with a guarded close handshake (matches old port):
   ```js
   export function bootApp () {
       window.onload = () => loadPage(document.body.dataset.scratchjrPage || window.scratchJrPage || '').catch(...);
       if (window.scratchjr) {                       // present on Electron (preload); absent on Android
           const ipc = window.scratchjr;
           ipc.onAppClose(function () { ... });       // unchanged body
       }
   }
   ```
   Desktop: preload always injects `window.scratchjr` before scripts run → behavior identical.
2. **Host client loader** — replace the hardcoded tag in all 8 pages (`src/app/index.html`, `home.html`, `editor.html`, `gettingstarted.html`, `inapp/{about,interface,paint,blocks}.html`):
   ```html
   <script src='../hostClient.js'></script>
   ```
   New `src/hostClient.js` (CSP-safe, same-origin, no inline JS):
   ```js
   // Loads the Electron host implementation only when the Electron preload bridge is present.
   if (window.scratchjr) {
       var s = document.createElement('script');
       s.src = '../electronClient.js';
       document.head.appendChild(s);
   }
   // Android: AndroidInterface is injected by WebView.addJavascriptInterface before page load;
   // no client script is needed — PlatformBridge.waitForInterface binds it directly.
   ```
   Ordering note: `electronClient.js` loaded dynamically still lands before first `waitForInterface` resolution in most cases, and `waitForInterface` retries every 100 ms regardless, so late injection is tolerated by design (`PlatformBridge.ts:56-60`).
3. **`scripts/build-android-assets.js`:** drop `electronClient.js` from the copy list (old script copied it — dead weight in the APK); add `hostClient.js`; add the copy of `../hostClient.js` path handling for `inapp/` pages (pages live one level deeper; the loader uses `../` so same file works).

**Files:** `src/app/appEntry.js`, new `src/hostClient.js`, 8 HTML pages, `scripts/build-android-assets.js` (P0-recovered copy).

**Acceptance:**
- `npm run typecheck`, `npm run lint`, `npm test` (vitest) all pass.
- `npm start` (Electron): identical behavior — splash → lobby → editor → save → close-handshake still fires (verify `sendAppClosedAcked` in main log).
- `grep -r "electronClient.js" src/app/*.html src/app/inapp/*.html` → only via `hostClient.js`.

**Risk:** none meaningful; guarded handshake can't change Electron flow. Rollback: revert single commit.

### P2 — Shell, Gradle refresh, build pipeline

**Goal:** `npm run build:android` → launchable debug APK on an emulator; CI green; zero build artifacts in git.

**Tasks:**
1. **Gradle/AGP refresh (do this first, not later):**
   - `compileSdk = 36`, `targetSdk = 36` (Play gate mandatory since 2026-08-31), keep `minSdk = 24` (Android 7.0+; WebView is Play-updated above that).
   - Bump AGP to the current stable that supports compileSdk 36; Kotlin 2.x; keep `versionCode = 190`, `versionName = "1.9.0"` (experimental line; desktop stays 1.8.0 until merge).
   - Keep Java 17 toolchain, `viewBinding`, `FAIL_ON_PROJECT_REPOS`, and the SHA-pinned CI actions policy from the repo (`3154664` + v1.8.0 CHANGELOG pinning rule).
2. **`.gitignore` additions:**
   ```
   android/app/src/main/assets/www/
   android/.gradle/
   android/build/
   android/app/build/
   android/local.properties
   ```
3. **Renderer build target for Android:** parameterize `scripts/build-renderer.js` — read `process.env.ESBUILD_TARGET` (default `chrome150`, unchanged for desktop). `build-android-assets.js` invokes it with `ESBUILD_TARGET=chrome107` (WebView 107 ≈ mid-2022; covers Play-updated WebView on Android 8+ classroom tablets). Re-verify against the actual device fleet in P9; the knob stays env-based, no second config file.
4. **`package.json`:** add `"build:android": "node scripts/build-android-assets.js"` (the single line the old port added).
5. **CI:** recovered `build-android.yml` — node 22 → keep, add a **repo hygiene guard** step:
   ```bash
   test -z "$(git ls-files android/app/src/main/assets)"
   ```
   Fails the build if anyone ever commits `assets/www` again (the exact mistake that killed `840e7b3`).
6. First run: `npm run build:android` then `gradlew assembleDebug` locally; smoke on an API 36 emulator.

**Acceptance:** CI builds debug+release APK + AAB; `git ls-files android/app/src/main/assets` returns empty; app icon shows, splash renders, `index.html` loads with no console errors except known-tolerated ones.

**Risk:** AGP 8.4.1 → 8.x-current may break `WebViewAssetLoader` API usage or `webkit` lib version; fix forward in the same commit. `chrome107` target may surface esbuild minify/syntax diffs — watch for `??=` / class-fields output (chrome107 supports both; chrome <91 would not — that's why 107 is the floor).

**Rollback:** branch state; master untouched.

### P3 — Storage

**Goal:** full project CRUD + media on device, using the **existing** intent protocol. Renderer: zero changes.

**Tasks:**
1. Recover `AndroidDatabaseManager.kt`, `DbOpenHelper.kt`, `MediaCache.kt`, `CryptoUtils.kt` (done at P0) — review for:
   - **DDL parity** with `src/main/database.ts` `initTables()` (tables: `projects`, `usershapes`, `userbkgs`, `userbackgrounds`*… — enumerate both sides at P0, fix DDL to match main-side truth).
   - **Atomicity parity:** does the native side do tmp→bak→rename like `database.ts:48-75`? If not, add it (native SQLite WAL + backup API or the same tmp/rename dance). This is the one place where copying desktop guarantees into Kotlin is mandatory — school devices get killed mid-write constantly.
   - **Media layout:** desktop keeps media as files outside the DB (`mediaDirectory`, `database.ts:41-42`); keep the same `<private-dir>/ScratchJR/` layout the recovered code used.
   - `io_getsettings` returns `"mediaPath,isTablet,isDebug,isAnalytics"` — confirm `PlatformBridge.path` consumers (`IO.getAsset` png path branch, `IO.ts:83-87,106`) work with a `file://` media path in WebView, or switch that branch to `getmedia` (audit outcome decides; smallest correct fix wins).
2. Golden round-trip test: push 3 desktop-exported `.sjr` files via adb, import each, re-export, byte-compare archives (same entries; zip timestamps may differ — compare entry sets + contents).

**Acceptance:** on device/emulator: create → edit → save → force-stop → relaunch → project intact; `.sjr` import from desktop and export back to desktop opens cleanly in the desktop app.

**Risk:** `sql.js` vs native SQLite type coercion differences (booleans/NULL). Mitigation: reuse the desktop vitest intent fixtures as an on-device integration script (Appendix B).

### P4 — Input & Navigation

**Goal:** every navigation and editor gesture works by touch.

**Tasks:**
1. Apply `_salvage/renderer.patch` **selectively** (it was made against the same v1.8.0 renderer, so conflicts should be trivial):
   - `bindTap()` shims in `src/app/src/entry/index.ts`, `entry/home.ts`, `lobby/Lobby.ts`, `lobby/Home.ts` (adds `ontouchend` beside `onmousedown` on navigation surfaces — this was the fix for the initial-navigation-hang bug `b565065`).
   - Editor drag surfaces (23 files with `onmousedown`) — **do not shim**; `Events.getTargetPoint` already handles Touch/Pointer (`v1.8.0` smartboard work). Only the nav surfaces needed shims historically.
2. Back-button dispatcher: recovered `MainActivity.kt` maps back as: `editor.html` → save + go home; ~~`paint.html` → `PaintUndo.goBack`~~ (dead branch — no such page, P4 removes); `home.html` → `index.html?back=yes`; help/about → home; `index.html` → finish activity. Re-verify each mapping against current page names.
3. Gesture checklist run (finger + mouse-emulation on emulator): tap, double-tap, long-press (block delete), drag block, dock block, drag sprite, resize sprite, palette scroll, script-area pan, page swipe, character-grid scroll.

**Acceptance:** all checklist gestures pass on emulator; no NaN-coordinate drops (the v1.8.0 `Events` hardening should already cover; log watch for `getTargetPoint` fallback warnings).

**Risk:** `ontouchend` + `onmousedown` double-fire on some OEM WebViews → old shim used `e.preventDefault(); e.stopPropagation()` in the touch handler — keep that pattern exactly.

### P5 — Hardware: camera & microphone

**Goal:** paint-editor camera capture and sound-recording blocks work on device.

**Tasks:**
1. Confirmed by P0 audit (Appendix A): the bridge implements **none** of `recordsound_*` or `scratchjr_*` camera — the old port shipped with both broken. Two implementation choices, decide at P5 start:
   - **Renderer-side (recommended):** the `AudioCapture`/`CameraPickerDialog` code in `electronClient.js` (MediaRecorder + getUserMedia, `electronClient.js:433-960`) is host-agnostic web API — extract into a shared `src/webAudioCamera.js` loaded by `hostClient.js` when no native implementation exists, keeping desktop byte-identical via re-import. `MainActivity`'s `onPermissionRequest` grant (`MainActivity.kt:160-176`) + runtime launchers are already recovered and make WebView `getUserMedia` work.
   - **Native:** implement the 11 missing `@JavascriptInterface` methods in Kotlin (contract in `globals.d.ts:108-124`). Only if renderer-side fails on hardware.
2. Camera: renderer-side `CameraPickerDialog` (`getUserMedia` + `VideoCapture.snapshot`) runs in WebView with the recovered permission grant (`MainActivity.kt:160-176`). Verify portrait mirror, landscape feed, and `scratchjr_captureimage` → `Camera.processimage` callback flow on device. P0 audit note: `scratchjr_cameracheck` must also be added (bridge lacks it; `PlatformBridge.hascamera` calls it at `PlatformBridge.ts:284-286`).
3. Permission-denied UX: denied camera/mic must degrade gracefully (paint editor shows no camera button; record dialog closes) — no crash, no hang. `PlatformBridge.hascamera` / `scratchjr_cameracheck` must return a truthful value from the bridge.

**Acceptance:** on a physical device with camera+mic: record sound block (record → stop → play → save → reload → replay) passes; paint-editor camera snapshot lands on canvas and in the saved project.

**Risk:** OEM WebView `getUserMedia` quirks (feed orientation, front/back). Devices in the P9 matrix must include one Samsung and one Pixel-class device. Emulator camera is a virtual scene — useful, not sufficient.

### P6 — Lifecycle & Autosave

**Goal:** no data loss across backgrounding, process death, or OS kill.

**Tasks:**
1. Recovered `onPause`/`onResume` (from `7eb82c8`) — extend pause hook to trigger an immediate save, mirroring the desktop close-handshake:
   ```kotlin
   override fun onPause() {
       webView.evaluateJavascript(
           "if (window.ScratchJr && window.ScratchJr.saveProject) { window.ScratchJr.saveProject(null, null); }", null)
       ...
   }
   ```
   Renderer autosave (30 s interval) remains the primary mechanism; pause-save is the belt-and-braces.
2. Audio/camera lifecycle: on background — stop active recording, stop camera feed (recovered `MainActivity` should already do this; verify).
3. Process-death test: edit → Home → `adb shell am kill` → relaunch → last state present (this exercises P3 atomicity, not just the renderer).

**Acceptance:** the three scenarios from Part 3 §3.2 rows 1-3 pass on physical device.

### P7 — Responsive UI (tablet-landscape first)

**Goal:** correct layout on 7-11" tablets, landscape primary.

**Tasks:**
1. Apply recovered CSS from `70ea661` (`css/start.css` viewport/scaling changes + small `base/editor/lobby/librarymodal` deltas) — same files exist on master unchanged since.
2. Cutout/safe-area: recovered `shortEdges` + `hideSystemUI` handling; verify on a notched phone and a camera-notched tablet.
3. Phone-portrait: **document known-broken, out of scope** (Appendix D). The app may set portrait phones to landscape-only initially (`screenOrientation="sensorLandscape"` recovered from manifest keeps this) — revisit post-experimental.

**Acceptance:** 8" and 10-11" tablets render lobby, editor, paint editor, library modals without clipped controls; all touch targets ≥ 48dp effective.

### P8 — Interop: `.sjr`, share, PNG

**Goal:** projects move between Android and desktop freely.

**Tasks:**
1. `.sjr` open-from-Files: recovered VIEW intent-filter → `handleIntent` (`MainActivity.kt:229-248`). **P0 audit found two bugs to fix here:** (a) it calls `window.ScratchJr.importSjrBase64(...)` which the renderer never defines — wire it to `PlatformBridge.loadProjectFromSjr(b64)` and expose that as the hook; (b) `handleIntent(intent)` at `onCreate` races page load — queue the payload and flush it once the lobby's `waitForInterface` completes (reuse the `b565065` navigation-hang lesson). Verify content-URI reading for both `content://` and legacy `file://`.
2. Share: recovered `FileProvider` + `AndroidBridge.sendExportedSjr`/`sendExportedPng` (share sheet, `AndroidBridge.kt:187-252` — audit confirmed both present). The lobby's `sendSjrUsingShareDialog` is NOT on the bridge (`PlatformBridge.ts:331-336` casts and calls it) — add the method in P8 Kotlin. Desktop's `sendExportedSjr` save-dialog path stays untouched.
3. PNG stage export: desktop path is `sendExportedPng` IPC (`preload.ts:64-65`) — Android has no save dialog; wire it to the share sheet or MediaStore `Pictures` insert. Choose MediaStore (no permission needed on API 29+) — small Kotlin addition.
4. Sample projects & localization assets: `build-android-assets.js` already copies `samples/`, `localizations/`, `assets/`, `inapp/` — verify sample projects (Bump, Dance, etc.) open on device.

**Acceptance:** full matrix — export on desktop → open on Android; export on Android → open on desktop; share-sheet round trip; PNG lands in Gallery.

### P9 — Hardening

**Goal:** survives the cheap-device reality of classrooms.

**Tasks & checks:**
1. **Memory:** load the biggest golden project (many pages, SVG characters, recorded sounds) — watch `onTrimMemory` + WebView JS heap; confirm `MediaCache` eviction (23-line class — likely just a HashMap; add LRU cap if not).
2. **WebView floor:** run the suite on the oldest WebView you intend to support (chrome107 build target from P2); record actual minimum working version in README.
3. **Offline:** airplane mode — full create/edit/save/import/export/camera/paint/audio pass (renderer has no network deps; the desktop updater is main-side only, so nothing should regress — verify no stray `fetch`).
4. **Keyboard:** text sprite entry — soft keyboard with `adjustNothing` (recovered manifest) — text input, cursor, IME enter, keyboard-over-stage. If broken, switch to `adjustResize` + re-test (one manifest line).
5. **Storage exhaustion:** fill device storage to <50MB free → save → expect graceful alert, not crash (desktop pattern: propagate error codes from bridge, `PlatformBridge.stmt` already logs negatives).

### P10 — Release readiness (experimental track end)

**Goal:** the branch is mergeable and Play-ready.

**Tasks:**
1. Signing: CI secrets only (base64 keystore → decode in workflow), never in repo; `versionCode 190 / versionName 1.9.0`.
2. Play Console (only when promoting beyond experimental): API 36 target (already done P2), Data Safety form = "no data collected" (analytics stub returns nothing — keep it that way), content rating questionnaire (children/education), localized store listing (old port shipped `storelisting_*.json` — locate source in `src/app/localizations/`, reuse).
3. Docs: README download table gains Android row (`6ed4c5d` had exactly this — re-apply), CHANGELOG entry, `docs/development.md` gains "Building for Android" section (build + adb install + logcat tags: `ScratchJr-JS`, `AndroidBridge`).
4. Final desktop regression gate (Part 3 §3.3) before any merge to `master`.

---

## Part 3 — Verification

### 3.1 Golden project matrix

Reuse the desktop `.sjr` fixtures (repo `tests/` + `samples/`): each golden project must `open → render → edit → save → reload → export → import` on Android with semantic state equal to desktop. Minimum set: empty; one-sprite; multi-page; recorded-sound; custom-image; text; max-pages (8).

### 3.2 Device matrix (minimum viable)

| # | Device / Env | Covers |
|---|---|---|
| 1 | API 36 emulator | CI parity, first smoke |
| 2 | Physical phone, current Pixel-class, modern WebView | notches, gesture nav, camera/mic |
| 3 | Physical tablet 8" (Samsung-class, One UI) | OEM WebView, responsive layout |
| 4 | Physical tablet 10-11", 2-3-year-old WebView | chrome107 floor, memory |
| 5 | Desktop (Windows build from same branch) | regression gate |

### 3.3 Desktop regression gate (hard requirement)

The port must not change desktop behavior. CI proof on every PR to the branch:
1. `npm run lint` + `npm run typecheck` + `npm test` — pass.
2. `npm run build:renderer` diff-identical output vs `master` (except `settings.json` version stamp) — proves renderer neutrality of P1.
3. `npm run smoke` + `npm run interact` — desktop flows intact.
4. `git ls-files android/app/src/main/assets` empty — artifact-hygiene guard.

### 3.4 Per-phase test rule

Every phase's acceptance list is executed and recorded (device + build + commit SHA) in `docs/ANDROID-PORT-PLAN.md` §Audit Log (Appendix A) before moving on. A phase with a failed acceptance stays open; no silent scope reduction.

---

## Part 4 — Appendices

### Appendix A — Salvage Audit Log (completed at P0, 2026-09-01)

| Item | Status | Findings |
|---|---|---|
| `AndroidBridge.kt` full review (253 lines) | ✅ | **`recordsound_*` (6 methods) and `scratchjr_*` camera (5 methods) are NOT implemented** — sound recording and bridge-camera were broken in the old port. `sendSjrUsingShareDialog` also missing (lobby share button); `sendExportedSjr`/`sendExportedPng` ARE implemented via share sheet. `deviceName`, `hideSplash`, `askForPermission`, `analyticsEvent` (log-only — privacy-safe), `debugWriteLog` all present. |
| `AndroidDatabaseManager.kt` atomicity | ✅ (partial) | Media files: tmp→write→`fd.sync()`→delete-target→rename — **no `.bak` rotation, and delete-before-rename leaves a no-file window** (use `java.nio.file.Files.move(REPLACE_EXISTING)` in P3). SQLite DB: WAL enabled, integrity check + orphaned-tmp cleanup at init — but **no `scratchjr.db.bak` rotation** unlike desktop `database.ts`. P3 adds backup rotation. |
| `DbOpenHelper.kt` DDL vs `initTables()` | ✅ PARITY OK | `PROJECTS`/`USERSHAPES`/`USERBKGS`/`PROJECTFILES` columns match desktop exactly (desktop adds `ISGIFT` via `runMigrations`, `database.ts:472`; Android has it in `CREATE TABLE` — same shape). Android `PROJECTFILES` kept as read-fallback like desktop legacy mode. WAL is Android-only (stronger, not weaker). |
| `MediaCache.kt` eviction | ✅ confirmed risk | Unbounded `ConcurrentHashMap` — no cap, no LRU. P9 adds bounded eviction. |
| `io_getsettings` path consumers | ✅ confirmed broken | `home.ts:11-12` parses CSV; `isTablet=0` → `PlatformBridge.path = mediaPath + '/'`. `IO.getAsset` png branch (`IO.ts:83-87`) then builds a **relative URL** inside the `https://appassets.androidplatform.net` origin → 404. User-media PNG thumbnails were broken in the old port. P3 fix options: (a) serve `/media/` via `WebViewAssetLoader.FilesPathHandler` + return that virtual path, or (b) force pngs through the always-working `getmedia` base64 path. Decide by smallest diff at P3. |
| storelisting_*.json location | ✅ found | `src/app/localizations/storelisting_*.json` (12 locales) — already copied by `build-android-assets.js` via `localizations` folder. |
| **Extra finding: `importSjrBase64` is dead code** | ✅ | `MainActivity.kt:240` calls `window.ScratchJr.importSjrBase64(...)` but the renderer never defines it (not in master, not in salvage patch) — `.sjr` open-from-Files silently no-oped in the old port. P8 must wire it to `PlatformBridge.loadProjectFromSjr` + queue the intent until the lobby page is loaded (`handleIntent` also races page load at `onCreate`). |
| **Extra finding: old port "worked" by accident** | ✅ | Old HTML loaded `electronClient.js` unconditionally; in WebView it throws at line 5 (`window.scratchjr` undefined) → `window.tablet` (line 999) never assigned → `PlatformBridge` correctly falls through to `AndroidInterface`. Harmless-by-crash. P1's `hostClient.js` replaces this accident with intent. |
| **Extra finding: dead back-nav branch** | ✅ | Back dispatcher handles `paint.html`/`help.html`, which don't exist as pages in this repo (paint editor is in-editor; help lives under `inapp/`). `build-android-assets.js` copies them only "if exists" → silently skipped. P4 removes the dead branches. |
| **P1 finding: old asset copy list incomplete** | ✅ | Old `build-android-assets.js` never copied `media.json`, `sounds/`, `svglibrary/`, `pnglibrary/`, or `gettingstarted.html` — MediaLib, UI sound FX (`io_getAudioData` → `sounds/<name>` fallback), and the character/background libraries would all 404 on device. Fixed in P1 copy list. |
| **P1 finding: `io_getAudioData` must return a data URI** | ✅ | Desktop main-side returns `data:audio/mp3|wav;base64,...` (`ipc-handlers.ts:176-197`); recovered `AndroidBridge.io_getAudioData` returns raw file bytes — `loadSoundFromDataURI`/`Sound` would set `Audio.src` to garbage. P5 fixes the Kotlin to return data URIs (mime by extension). |
| **P1 finding: `../` resolves differently on device** | ✅ | Desktop: `src/app/*.html` → `../` = `src/` (electronClient.js's real location). Android WebView: `/assets/www/index.html` → `../` = `/assets/` root. So `hostClient.js` is copied to `assets/hostClient.js` (not `assets/www/`), and the old port's `../electronClient.js` actually **404'd silently** — confirming the "worked by accident" mechanism (console error only, `window.tablet` never set, PlatformBridge fell through to `AndroidInterface`). |
| **P2 finding: AGP 9 breaking changes** | ✅ | AGP 9.3.2 requires Gradle ≥ 9.5 (wrapper = 9.7.1); `org.jetbrains.kotlin.android` plugin removed (built into AGP 9 — applying it fails the build); `kotlinOptions {}` removed (→ `kotlin { compilerOptions {} }`). All fixed in P2. |
| **P3 finding: isTablet contract subtlety** | ✅ | `home.ts:12`/`editor.ts:117`: `path = list[1] == '0' ? mediaPath+'/' : undefined`. Desktop sends `'false'` → path stays **undefined** → all media flows through the base64 `getmedia` path. Old Android `'0'` set path to a filesystem path → 404. Fix: Android sends `'false'` (desktop parity). No URL handler needed — the base64 path was always the working path. |

### Appendix B — Risks & unknowns

| Risk | Sev | Mitigation |
|---|---|---|
| AGP/compileSdk 36 upgrade breaks recovered code | Med | P2 does it first; fix-forward same commit |
| WebView `getUserMedia` OEM quirks | Med | device 3+5 matrix; camera fallback = image picker (later) |
| Recorded-audio format mismatch (webm/opus vs native AAC) | Med | P5 verifies round-trip; `recordsound_recordclose` ext must match player |
| DDL drift between desktop `initTables` and `DbOpenHelper` | High | P0/P3 parity check — silent corruption otherwise |
| esbuild `chrome107` output in old WebViews | Low | env knob; floor verified P9 |
| Soft keyboard + `adjustNothing` | Med | P9; fallback = `adjustResize` |
| Re-committing build artifacts | High | CI `git ls-files` guard (P2) |
| Play policy shifts past API 36 | Low | experimental track = sideload until P10 |

### Appendix C — Branch & commit strategy

- One branch: `mobile/android`. Commit per phase (or sub-phase), message prefix `feat(android)`/`fix(android)`/`chore(android)`.
- Rebase onto `master` when master moves (updater commits are main-side only — expected trivial).
- Merge to master only after P10 + §3.3 green. Experimental APKs ship from branch tags (`android-v0.1.0-…`) — never block desktop releases.

### Appendix D — Explicit non-goals (this track)

- iOS / WKWebView / Capacitor (contract keeps the door open; nothing built for it)
- Phone-portrait UI (tablets first; phones landscape-forced initially)
- Repository restructure (`core/` / `hosts/` split), `ProjectRepository`/service-layer rewrite — the existing `ScratchJrBridge` + intent protocol **is** the contract
- Pointer-Events migration of the 23 `onmousedown` files
- Cloud sync, analytics activation, new npm dependencies
- Removing `window.tablet`/legacy bridge (desktop still uses it)

### Appendix E — Quick reference

- Salvage base: `7eb82c8` (= `087fc33^`)
- Recovery command: `git checkout 7eb82c8 -- <path>`
- Bridge contract: `src/types/globals.d.ts:101-125` (`ScratchJrBridge`), injection point `PlatformBridge.waitForInterface` (`PlatformBridge.ts:39-68`)
- Fatal lesson of `840e7b3`: `assets/www` is build output — CI guard `test -z "$(git ls-files android/app/src/main/assets)"`
- Play gate: targetSdk 36 mandatory since 2026-08-31
