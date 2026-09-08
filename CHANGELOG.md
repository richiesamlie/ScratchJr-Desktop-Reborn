# Changelog

All notable changes to **ScratchJr Reborn**. The repo is developed on
`master`; releases are tagged `vX.Y.Z` and built by CI.

## [v2.4.0] - 2026-09-08

**Minor Release: Advanced Paint Editor (Zoom Controls, Freehand Masking Eraser, Full Color Picker, Brush Styles), Sensing 'If Touching Color' Block, 10 Pages Support, and Sprite Library Thumbnail Self-Healing.**

### Bug Fixes
- **Sprite Library Empty Thumbnail & Save Lifecycle Fix**:
  - Resolved race condition in `Paint.ts` where `Paint.changePageSprite()` cleared `#layer1` prior to asynchronous database insertion, causing bounding boxes to collapse to `21x21` and saving blank 533-byte dummy PNGs.
  - Captured exact sprite dimensions, name, and SVG `viewBox` geometry before closing the Paint Editor workspace.
  - Improved `IO.getThumbnail()` in `IO.ts` to iterate over `extxml.children`, parse true dimensions from `viewBox` fallbacks, and composite `#paintEraserMask` with `destination-out`.
  - Added SVG data fallback, dimension correction, and automatic self-healing in `Library.ts` (`addAssetThumbChoose`), regenerating high-fidelity thumbnail PNGs and repairing corrupted `USERSHAPES` rows on the fly.
- **Paint Editor Coordinate & Dragging Fix (Issue #7)**:
  - Fixed double-scaling bug where `PaintAction.getScreenPt` divided client coordinates by `currentUiScale` before calling `Paint.root.getScreenCTM().inverse()`, causing mouse events to diverge from cursor positions on displays with `innerHeight < 740px`.
  - Replaced `Events.getTargetPoint` with raw viewport point `Events.getEventPoint`, enabling exact SVG matrix projection.
  - Restored shape selection and dragging via `Ghost.findTarget` hit testing.

### New Features
- **Paint Editor Zoom Controls (Issue #7)**:
  - Added Zoom In (`+`), Zoom Out (`−`), and Reset (`1:1`) buttons in the Paint Editor top bar.
  - Re-enabled dynamic `currentZoom` infrastructure with discrete step levels (`0.5x`, `0.75x`, `1.0x`, `1.5x`, `2.0x`, `3.0x`).
- **Color Picker (Issue #7)**:
  - Added HTML5 `<input type="color">` swatch bucket with rainbow gradient to the paint editor swatch bar for picking arbitrary colors.
- **Freehand Masking Eraser Tool (Issue #7)**:
  - Upgraded Eraser tool to behave like a true physical eraser (transparency masking) rather than whole-object deletion.
  - Dragging the eraser dynamically renders black stroke paths into an SVG `<defs><mask id="paintEraserMask">` bound to `#layer1`.
  - Added live dashed circular preview cursor indicating eraser radius and position.
  - Connected eraser stroke width to the left pen size selector.
  - Preserved mask serialization in `SVGTools.saveShape` / `saveBackground` and restoration in `Paint.createBkgFromXML` / `createCharFromXML`.
  - Added mask translation support in `Transform.translateTo` so erase paths correctly shift with viewBox bounds on save.
  - Updated `SVG2Canvas.drawBorder` and `drawInCanvas` to skip `<defs>`/`<mask>` nodes and apply `destination-out` compositing for `#paintEraserMask`, preventing the sprite selection sticker border from filling erased regions with solid white.
  - Synchronized Undo/Redo history via `PaintUndo` snapshotting layer and mask definitions in tandem.
- **Multiple Brush Styles (Issue #7)**:
  - Added brush style selector on the left palette supporting 3 styles: Normal (round stroke), Flat (calligraphic square/miter stroke), and Dotted (`stroke-dasharray`).
- **"If Touching Color" Block (`ontouchcolor`) (Issue #7)**:
  - Added new Start/sensing block with color menu dropdown (Red, Orange, Yellow, Green, Blue, Purple) and stage canvas pixel-level collision detection.
- **10 Pages Support (Issue #7)**:
  - Raised project maximum page limit from 8 to 10 in `settings.json`.

## [v2.3.0] - 2026-09-07

**Minor Release: Direct Media Pipeline, Database IPC Structured Cloning, Unified Pointer Events, SVG Asset Optimizations, and Camera Interactivity Fix.**

### Performance & Architecture
- **Eliminated Legacy Chunked Media Protocol**:
  - Replaced the 2014-era `io_getmedialen` → `io_getmediadata` → `io_getmediadone` 3-phase chunking loop in `PlatformBridge.getmedia` with a direct single-call `io_getmedia` across Desktop (Electron), Android (Kotlin shell), and Web / PWA.
  - Eliminated IPC roundtrip amplification (reduced from 20+ sequential roundtrips per asset to 1), $O(N^2)$ string concatenation churn, and 3x memory buffering during asset loading.
  - Removed deprecated temporary holding cache infrastructure (`MediaCache.kt` on Android, `dataStore.cacheMedia` in Electron, and `mediaTransferCache` in Web).
  - Preserved cross-platform asset loading parity and host abstraction boundaries.
- **Modernized Legacy Tablet & Browser Relics**:
  - Removed obsolete 2014-era `PlatformBridge.path` filesystem seam across `PlatformBridge.ts`, `IO.ts`, `Sprite.ts`, `Page.ts`, `home.ts`, `editor.ts`, and test fixtures, unifying media resolution through the secure host bridge.
  - Replaced deprecated synchronous `XMLHttpRequest` fallback in `lib.ts` (`preprocessAndLoad`) with modern async `fetch()`.
  - Cleaned up vestigial sound registration relics in `ScratchAudio.ts`: replaced brittle `.wav`-only check in `loadProjectSound` with universal `Documents` fallback (fixing non-wav custom imported audio loading on Web), and removed obsolete comma-split duration parsing in `addSound`.
- **Camera Tool Geometry Cleanup & Database IPC Optimization**:
  - Cleaned up obsolete 2014 iOS hole-punch coordinate relics (`scale`, `devicePixelRatio`) in `Camera.ts` and modernized CSS video mirror transform in `webav.js`.
  - Optimized database IPC pipeline across `PlatformBridge.ts`, `preload.ts`, `ipc-handlers.ts`, and `browserClient.js` to pass typed intent objects directly without redundant JSON stringification/parsing roundtrips on Electron and Web, with safe defensive serialization at the Android adapter boundary (`webhost.js`).
- **SVG Image Pipeline Optimization**:
  - Eliminated redundant decode-then-re-encode cycles (`atob` $\rightarrow$ `utf8ToBase64`) during sprite and background loading in `Sprite.ts`, `Page.ts`, and `IO.ts`.
  - Replaced unsafe `atob` binary decoding with `base64ToUtf8` across asset pipelines, ensuring UTF-8 integrity for non-ASCII SVG text.
  - Short-circuited raster image detection in `IO.getImagesInSVG` prior to running full XML DOM parsing and regex formatting, accelerating sprite load times.
- **Unified Pointer Events & Multi-Touch Input Normalization**:
  - Eliminated coarse global `isTouch` boolean branching across UI components (`Home.ts`, `UI.ts`, `Thumbs.ts`, `Undo.ts`, `Scripts.ts`, `ScriptsPane.ts`, `Palette.ts`, `Scroll.ts`, `BlockArg.ts`, `Menu.ts`, `Sprite.ts`, `PaintAction.ts`, `Path.ts`, `Events.ts`).
  - Removed duplicate shadow `Events` class in `Home.ts` in favor of the centralized `Events` module.
  - Upgraded multi-touch guards to dynamically inspect pointer status (`('isPrimary' in e && !e.isPrimary) || (e.touches && e.touches.length > 1)`), providing seamless concurrent mouse, touch, and pen interaction without modality lock.
  - Replaced legacy iOS/tablet hit target heuristics and simplification thresholds in `Path.ts` with standard CSS pointer media queries (`pointer: coarse`).
  - Added global `touch-action: none` rules to `base.css` and `editor.css` to prevent unintended browser panning, pull-to-refresh, or zooming during drawing and block drag-and-drop.
  - Deprecated legacy `isTouch` export in `lib.ts`.
- **Fixed Camera Feed Interactivity, Snap Lock, and Modal Dismissal**:
  - **Eliminated Click Interception**: Fixed an issue where the camera feed overlay (`#cameraPickerDiv`) was styled with `z-index: 90000` and a 1000x1000px box covering the entire screen, trapping mouse and touch events above the `#cameraclose` exit button and `#capture` shutter button.
  - Added `pointer-events: none` on `cameraPickerDiv`, video feed, and overlay mask, while raising control bar z-indexes to `100005`.
  - Added multi-pointer support (`onpointerdown`), backdrop click-to-dismiss, and keyboard shortcuts (`Escape` to cancel, `Space`/`Enter` to snap).
  - Aligned camera feed overlay position and scale with `frameRect` and responsive UI scale.
  - Added resolution constraint fallback to `{ video: true }` in `getUserMedia` if specific shape dimensions are rejected by the hardware camera.
  - Added defensive capture error handling in host clients (`electronClient.js`, `browserClient.js`, `webhost.js`) to guarantee the modal and feed cleanly close if a snapshot is missing or fails.
  - **Web/PWA Camera Palette Availability**: Normalized `scratchjr_cameracheck` in `browserClient.js` and modernized type handling in `Paint.ts` and `PlatformBridge.ts`, resolving a type-coercion trap that previously hid the camera tool in the in-browser paint editor.

## [v2.2.0] - 2026-09-07

**Minor Release: Custom Audio Import, Recording Modal Unfreezing, and Cross-Platform Audio Playback (Issue #5).**

### New Features
- **Custom Audio File Import (`importaudio.svg`)**:
  - Added native-styled Audio Import button (`.recordimport`) to the recording modal.
  - Allows users to import external audio files (`.wav`, `.mp3`, `.ogg`, `.webm`, `.m4a`) directly into sprites.
  - Automatically reads, encodes, persists into project storage (`PROJECTFILES`), caches in runtime audio store, and registers new sound blocks dynamically into the green Sound palette.
  - Full cross-platform support across Desktop (Electron), Web / PWA (in-browser SQLite WASM + IndexedDB), and Android (Kotlin shell / WebView).

### Bug Fixes
- **Audio Recording Dialog Stacking Context & Touch Interactivity (Issue #5)**:
  - Mounted `#recorddialog` to document root (`document.body`) instead of inside `#frame`.
  - Fixes Issue #5 where CSS transforms on `#frame` created a separate stacking context, trapping `#recorddialog` behind the full-screen `#backdrop` (`z-index: 10000`) and causing the app to freeze with unclickable buttons.
  - Added native touch event handlers (`ontouchend`) across recording dialog buttons (`recorddone`, `recordimport`, and toggle buttons) for mobile/tablet touch responsiveness on Android and touch screens.
  - Added click/tap-to-dismiss behavior on `#backdrop` and dialog event propagation protection so users can tap outside the modal to safely close the recording dialog.
  - Added modern Chromium AudioContext autoplay resumption check in `webav.js` to ensure the audio meter and recording streams activate immediately without freezing.
- **Palette Microphone Slot Mouse & Touch Trigger**:
  - Removed legacy `if (isTouch)` check on `div.onmousedown` in `Palette.drawRecordSound` so mouse clicks on PC non-touch displays immediately open the recorder modal.
  - Styled microphone slot with `cursor: pointer` and added fallback in `paletteMouseDown` to prevent dragging the slot as a programming block.

## [v2.1.1] - 2026-09-04

**Patch Release: Fix Canvas Character Mouse Dragging and Prevent Block Disappearance in Upper Workspace.**

### Bug Fixes
- **Stage Pointer Coordinate Projection & Mouse Dragging**:
  - Replaced legacy matrix offset calculations in `Stage.getStagePt` with direct viewport projection via `this.div.getBoundingClientRect()`.
  - Fixes Issue #4 where characters on the stage could not be clicked, dragged, or repositioned with the mouse due to coordinate misalignment under responsive CSS scaling (`currentUiScale`).
  - Added native touch event listeners (`ontouchstart`, `ontouchmove`, `ontouchend`) to `Stage` and `Grid` overlays for unified touch and mouse parity across Desktop, Web, and Android.
- **Palette & Workspace Drop Detection**:
  - Reimplemented `globalx` and `globaly` in `lib.ts` using `getBoundingClientRect()` relative to `#frame` and `currentUiScale`, eliminating spurious center-origin scaling offsets.
  - Updated `Palette.getLandingPlace` to prioritize scripts area placement when the drop pointer or block center is within the scripts workspace (`gn('scripts')`), preventing blocks dropped into the upper white workspace from mistakenly deleting.
  - Added `Events.getEventPoint(e)` and standardized frame-relative mouse/touch coordinates in `Events.getTargetPoint(e)`.

## [v2.1.0] - 2026-09-03

**Minor Release: Horizontal Flip Block, Smart Asset Library Categorization & Search, 1-Click SJR Open Card, Web/PWA Storage Resilience, and UTF-8 Safe Serialization.**

### New Features
- **Horizontal Flip Motion Block (`flipX`)**:
  - Inspired by [`wangzongjun/ScratchJr`](https://github.com/wangzongjun/ScratchJr). Integrated `flipX` motion block into the Blue Motion palette (`BlockSpecs.ts`, `Prims.ts`, `Sprite.ts`).
  - Added vector block icon `FlipX.svg` with native sprite orientation flipping and reset on `goHome`.
- **Media Library Categorization & Real-Time Search**:
  - Inspired by [`wangzongjun/ScratchJr`](https://github.com/wangzongjun/ScratchJr). Added `LibraryEx.ts` classification engine for costumes and backgrounds.
  - Interactive category tab pills (`#libclassification`) and instant multi-token search box (`#libsearch`) in `Library.ts`.
- **Lobby 1-Click `.sjr` Import Card**:
  - Inspired by [`wangzongjun/ScratchJr`](https://github.com/wangzongjun/ScratchJr). Dedicated "Open" card next to "+" in the lobby (`Home.ts`) with cross-platform native file dialog support.
- **Unicode UTF-8 Safe SVG & Text Base64 Serialization**:
  - Added `utf8ToBase64` / `base64ToUtf8` utilities in `lib.ts` and integrated across `Sprite.ts`, `Page.ts`, `Paint.ts`, `IO.ts`, and `Library.ts`.
  - Fixes `DOMException: InvalidCharacterError` crashes on non-Latin1 / international text and emojis.
- **12-Language Native Localization**:
  - Full native translations for all new UI strings across all 12 supported locales (`en`, `zh-cn`, `es`, `fr`, `de`, `it`, `ja`, `nl`, `pt`, `sv`, `ca`, `th`).
- **Browser Storage Resilience & Concurrency Protection (Web/PWA)**:
  - Inspired by [`patdx/scratchjr`](https://github.com/patdx/scratchjr). Added multi-tab concurrency lock via Web Locks API (`navigator.locks.request`) to prevent multi-tab IndexedDB write races.
  - Added storage eviction protection via `navigator.storage.persist()`.
  - Added database corruption quarantine to archive damaged IndexedDB SQLite blobs under `db_bytes_corrupt_<timestamp>` before initializing fresh database.

## [v2.0.0] - 2026-09-03

**Major Milestone Release: Universal Multi-Target Architecture (Web/PWA on GitHub Pages, Desktop for Windows/macOS/Linux, and Native Android).**

### Web & PWA Port
- **In-Browser SQLite & IndexedDB Storage**:
  - Full client-side execution via `sql.js` (WebAssembly SQLite) paired with IndexedDB persistence (`STORE_SQLITE` and `STORE_MEDIA`), providing 100% relational query compatibility with Desktop and Android without server-side dependencies.
  - Complete PWA offline caching via Service Worker (`sw.js`) and web app manifest (`manifest.webmanifest`).
- **GitHub Pages Dual-Page Architecture**:
  - Live marketing and download showcase remains at the root URL (`/`).
  - Interactive Web App hosted at `/play/` with automatic launcher redirect and `.nojekyll` bypass.
  - Automated CI/CD deployment via GitHub Actions (`.github/workflows/deploy-pages.yml`).

### Cross-Platform Sharing & Core Bugfixes
- **1-Click Project Export (`exportit.svg`)**:
  - Added dedicated green export action button on project cards in the Lobby (visible on long-press or right-click).
  - Automatically routes to native Save File dialog on Electron, native Android Share Sheet on mobile, or file download on Web.
- **Electron Sharing Gap Resolved**:
  - Implemented `sendSjrUsingShareDialog` on `ElectronDesktopInterface` to enable project sharing from the project Info modal.
- **Save Before Export**:
  - Guarded editor export requests to trigger `ScratchJr.saveProject` before zipping, preventing empty or stale `.sjr` exports.
- **Import Resilience & SQLite Fixes**:
  - Added `ctime` generation in `IO.createProject`, fixing project chronological sorting in Lobby.
  - Added fallback thumbnail object in `IO.loadProjectFromSjr` to prevent cards with missing thumbnails from being dropped.
  - Replaced corrupted 1-byte binary chunking with native `FileReader.readAsDataURL(file)`.
- **UI & Ergonomic Polish**:
  - Repositioned Funky Red sprite on start screen (`top: -10%; left: 76%; height: 54%; z-index: 12`) to frame the logo and match visual weight across all platforms.

## [v1.9.0-android] - 2026-09-02 (Branch `mobile/android`)

**Native Kotlin Android port, hardware camera & microphone capture, transactional storage, touch navigation, and cross-platform `.sjr` import/export.**

### Android Port Architecture & Features
- **Native Android Shell (Option A)**:
  - High-performance Kotlin shell utilizing `WebViewAssetLoader` with domain `https://appassets.androidplatform.net`, `@JavascriptInterface` bridge (`AndroidBridge`), and native SQLite with Write-Ahead Logging (WAL).
  - Target Android 16 (API 36, mandatory Play target SDK) with `minSdk 24` (Android 7.0+).
  - Strict CI hygiene guard preventing generated build artifacts from being committed under `android/app/src/main/assets/`.
- **Shared AV & Hardware Capture**:
  - Unified web AV layer (`src/webav.js` and `src/webhost.js`) supporting microphone voice recording via MediaRecorder (Opus `.webm` / `.wav` data URIs) and paint-editor photo capture via `getUserMedia` and HTML5 canvas.
  - Native runtime permissions handling for `CAMERA` and `RECORD_AUDIO` with graceful degradation when denied.
- **Data Integrity & Storage Parity**:
  - Full desktop SQLite intent protocol compatibility without sending raw SQL across bridge.
  - Transactional project storage and `.bak` media rotation via atomic `Files.move(REPLACE_EXISTING)`.
  - Process-death resilience (`onPause` immediate project flush) and lifecycle cleanup.
- **Touch & Responsive Navigation**:
  - Full touch input compatibility with `bindTap` shims preventing touch-delay and event blocking.
  - Fullscreen immersive mode (`shortEdges` cutout handling, hidden system bars).
  - Native back-button dispatch handling in `MainActivity`.
- **Interoperability (.sjr Import & Export)**:
  - System file intent handler (`android.intent.action.VIEW`) supporting `application/x-scratchjr-project` content URIs with transactional import into SQLite database.
  - Native Android Share Sheet (`Intent.createChooser`) integration for project `.sjr` sharing and stage PNG export via `FileProvider`.

## [v1.8.0] - 2026-08-31

**Deep engineering audit remediations, WebRTC hardware permissions, hybrid Smartboard/pointer input resilience, and production MSI release pipeline.**

### Features & Security Hardening
- **WebRTC Hardware Permissions (Camera & Microphone)**:
  - Whitelisted `'media'`, `'mediaKeySystem'`, `'microphone'`, `'camera'`, `'audioCapture'`, and `'videoCapture'` in main-process permission handlers (`window-lifecycle.ts`), eliminating silent hardware blocking during sound recording and character photo snapshots on Electron 43+ (Chromium 150).
- **Hybrid Input & Smartboard Touch/Pointer Resilience**:
  - Enhanced `Events.getTargetPoint` to defensively extract coordinates across `MouseEvent`, `TouchEvent` (active and changed touches), and `PointerEvent`, preventing `NaN` drag calculations and dropped blocks on classroom Smartboards, touchscreen laptops, and stylus pens.
  - Concurrently bound mouse and touch move/end listeners during active drag sessions.
- **Data Integrity & Thumbnail Protection**:
  - Updated `DatabaseManager.mediaInUse` to verify both `json` and `thumbnail` columns in `PROJECTS`, preserving project preview PNGs and raster thumbnails (`ALTMD5`) from premature deletion during asset cleanup.
  - Added startup detection and cleanup of orphaned SQLite `.tmp` transaction files.
  - Surfaced user-facing alert dialogs when unrecoverable database corruption occurs.
  - Made `.sjr` project import fully transactional (asset extraction and thumbnail validation must complete before project row insertion) with error dialogs for corrupted archives.
  - Hardened SVG imports by confining `xlink:href` strictly to `data:` URIs and clamping canvas dimensions to $[1, 4096]\text{px}$.
- **Supply Chain & MSI Fleet Deployment**:
  - Pinned all 5 GitHub Actions in the release workflow to immutable 40-character commit SHAs with scoped `contents: read` permissions.
  - Added SHA-256 integrity verification (`6ac824e...`) for WiX 3.14 binaries in CI.
  - Pinned stable MSI `UpgradeCode` (`{E4346E7F-98B4-4602-9FAA-5AF8C9844BA7}`), default `perMachine` install mode, and injected uninstallation cleanup action for `REMOVE_DATABASE=1`.
  - Wired code signing parameters (`windowsSign` and `osxSign`/`osxNotarize`) in packaging scripts.
  - Updated esbuild compiler target to `chrome150`.

### Documentation
- Published comprehensive architecture guide ([`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)), security threat model ([`docs/THREAT-MODEL.md`](./docs/THREAT-MODEL.md)), school deployment runbook ([`docs/SCHOOL-DEPLOYMENT.md`](./docs/SCHOOL-DEPLOYMENT.md)), and release maintainer procedures ([`docs/RELEASE.md`](./docs/RELEASE.md)).

### Testing & Verification
- Added `tests/unit/audit-remediation.test.js` covering all remediations, reaching **153 automated unit tests** across 18 test files (100% green).

## [v1.7.5] - 2026-08-28

**Custom Image Import for Characters & Backdrops, drag-and-drop file loading, and robust raster-to-SVG wrapping.**

### Features & Enhancements
- **Custom Image Import (Characters & Backdrops)**:
  - Added dedicated **Import Media Button** (`importmedia.svg`) to both Character and Backdrop library modals.
  - Added native **Drag-and-Drop** file loading onto the open library modal for quick desktop asset additions.
  - Supports `.png`, `.jpg`, `.jpeg`, and `.svg` image formats with automatic filename sanitization.
  - Seamless raster-to-SVG wrapping with embedded image data to guarantee full compatibility with physics, scaling, animations, paint editor overlays, and `.sjr` cross-device sharing.
  - Generates crisp 120x90 canvas thumbnails and registers imported assets directly into the SQLite database.
- **Library Query Normalization**:
  - Relaxed query filters so user-imported assets with various image formats display immediately.
  - Added debounce guard and unified event flow to prevent double duplication in lobby.

### Testing & Verification
- Added `tests/unit/custom-image-import.test.js` verifying image filename sanitization and library header initialization.
- 143 automated unit tests across 17 test files; full end-to-end CDP simulation verifying PNG and JPG image imports in Electron.

## [v1.7.4] - 2026-08-28

**Kid-friendly Paint Editor shape tools, project remix duplication, and scoped desktop shortcuts.**

### Features & Enhancements
- **Paint Editor Shape Tools**:
  - Added dedicated **Straight Line Tool** (`line`) with 45° angle snapping via `Shift`.
  - Added **5-Pointed Star Tool** (`star`) generating smooth vector paths with full paintbucket fill support.
  - Added geometric constraint snapping: hold `Shift` while dragging to draw perfect squares, circles, and equilateral triangles.
  - Refactored paint palette left toolbar layout with proportional icon scaling (`background-size: contain`) and centered stroke width selectors to prevent icon and preview overlaps.
  - Enriched color swatch palette with radiant gold (`#FFD700`) and cleaned up whitespace issues in color definitions.
- **Project Duplication ("Remix")**:
  - Added 1-click **Duplicate/Remix** button to project tiles in the Lobby to create instant safe copies of projects with all pages, sprites, and scripts preserved.
  - Added kid-safe **500ms press-and-hold** (or right-click) edit mode to protect children from accidental deletions or duplications.
  - Symmetrical button placement on lobby project cards (Delete on top-left, Duplicate on top-right).
- **Window-Scoped Keyboard Shortcuts**:
  - Replaced Electron's OS-wide `globalShortcut` with window-scoped `before-input-event` listeners. Hotkeys (`Ctrl+S`, `Ctrl+Z`, `Ctrl+Shift+Z`/`Ctrl+Y`, `Ctrl+N`) now only execute when ScratchJr is active and focused.

### Testing & Verification
- Added `tests/unit/paint-shapes.test.js` verifying vector path generation, star vertices, and swatch palette contracts.
- Added `tests/unit/project-duplicate.test.js` verifying unique name generation and lobby control safety states.
- 141 automated unit tests across 16 test files; end-to-end smoke test and pointer interaction test harnesses clean.

## [v1.7.3] - 2026-08-27

**Platform naming normalization & cleanup.**

### Refactoring & Architecture
- **Modern Platform Module**: Replaced legacy `src/app/src/iPad/` (`iOS.ts`, `IO.ts`, `MediaLib.ts`) with modern `src/app/src/platform/` (`PlatformBridge.ts`, `IO.ts`, `MediaLib.ts`).
- **PlatformBridge & Aliases**: Introduced `PlatformBridge` class as the primary desktop host interface with backward-compatible `iOS` export aliases and `window.PlatformBridge` / `window.iOS` bindings.
- **Project Format Version Encapsulation**: Encapsulated project archive format version string as `PROJECT_FORMAT_VERSION = 'iOSv01'` in `platform/IO.ts` to preserve SQLite database and `.sjr` file interchange compatibility.
- **Desktop Platform Flags**: Set `isDesktop = true`, `isElectron = true`, `isiOS = false`, `isAndroid = false` in `src/app/src/utils/lib.ts`, eliminating obsolete Android/mobile branches and soft-keyboard hooks.
- **In-App Help Views**: Renamed `#ipad-project-view-wrapper` to `#project-view-wrapper` and `.ipad-project-view` to `.project-view` in HTML templates and stylesheets.

### Testing & Verification
- Migrated tests from `tests/unit/ios-setfield.test.js` to `tests/unit/platform-bridge-setfield.test.js` with backward-compatibility alias assertions.
- Updated all test fixtures and mocks to use `src/app/src/platform/`.
- All 132 automated unit tests passing; clean strict typecheck and linter.

## [v1.7.2] - 2026-08-27

**Code cleanup release.** No user-facing behavior changes.

### Cleanup
- **Dead code removed** (~970 lines): 46 renderer methods/functions that were
  never called (Path, Layer, SVGTools, Camera, Sprite, UI, Undo, Events, Block,
  BlockSpecs, Matrix, SVG2Canvas), plus the whole Stage debug-mask block and
  unimported `STAGE_WIDTH`/`STAGE_HEIGHT` constants.
- **Deduplication**: shared CDP plumbing extracted to `scripts/cdp-session.js`
  (used by `npm run smoke` and `npm run interact`); four test helper modules
  single-sourced under `tests/unit/helpers/` — zero test assertions changed.
- **Main-process shrink**: removed six never-true `DEBUG_*` flags and their
  ~34 guards; eliminated data-store pass-through wrappers; merged the duplicated
  auto-recovery block in `open()`; dropped the unused `string` variant of
  `stmt()`/`query()`; `ensureDir` → `fs.mkdirSync({ recursive: true })`;
  `globalShortcut` registrations table-driven; `io_getfile`/`io_getmedia`
  share one handler; unused `_currentTag` parameter and duplicate
  `UpdateInfo` interface removed.
- **Config/CI**: dead `eslintIgnore` key, stale `.eslintignore` line, unused
  `forge.config.js` variables, and the unused workflow_dispatch `tag` input
  plus echo-only verify lines removed; `docs/development.md` now points at the
  real packaged smoke command.

### Fixes
- **Release-version drift guard**: `scripts/build-renderer.js` now rewrites
  `src/app/settings.json`'s `scratchJrVersion` to match `package.json` at
  every build, so the in-app About / project metadata screens always show
  the current version instead of a stale baked-in value.
- **CI version consistency**: the release workflow now refuses to publish if
  the pushed tag's `vX.Y.Z` doesn't equal `package.json` `version` (no more
  MSI artifacts shipping a different label than the tag), and verifies the
  packaged `settings.json` `scratchJrVersion` matches the tag at the end
  of the build.

### Verification
- `npm run lint` 0 · `npm run typecheck` 0 · `tsc -p tsconfig.main.json` 0
- `npm test` 131/131 passing · `npm run smoke` PASS

## [v1.7.1] � 2026-08-26

**Share & polish release.** Projects can now leave the machine as easily as
they arrive.

### Features
- **`.sjr` Import**: drag a `.sjr` project file anywhere onto the lobby;
  assets merge, names dedupe, and the lobby refreshes automatically.
- **`.sjr` Export**: `File` ? `Export Project (.sjr)...` saves the open
  project as a shareable `.sjr` (native save dialog, `.sjr` filter).
- **Stage PNG Export**: `File` ? `Export Stage as PNG...` renders the
  current page at 960�720 into a chosen PNG.

### Fixes
- **jszip 3 migration for the dormant share paths**: `zipProject` /
  `loadProjectFromSjr` used jszip 2 sync APIs (`generate`/`load`/
  `asBinary`) that are throw-stubs on the bundled jszip 3.10 � both would
  have crashed on first use. Rewritten onto `generateAsync`/`loadAsync`.
- **Distinct DB error codes** (`-1` closed, `-2` intent rejected,
  `-3` SQL error) with renderer-side reason logging, replacing the single
  ambiguous `-1` sentinel; project-open guard simplified.
- **Media cache is LRU with a 64 MB byte budget**, replacing FIFO-by-
  insertion at an entry count.

### Housekeeping
- Removed stale handoff docs, one-off fix scripts, and the outdated IPC
  inventory; refreshed `docs/README.md` and main README.
## [v1.7.0] � 2026-08-24

**Modernization release.** The legacy tablet architecture was refactored to a
typed, tested, sandboxed desktop architecture while preserving full project
compatibility.

### Security & storage
- **Eval-free renderer:** CSS preprocessing no longer uses `Function()`; all
  page CSPs dropped `'unsafe-eval'`.
- **Structured database intents:** the renderer no longer sends SQL text over
  IPC. Statements are composed main-side from allowlisted tables/columns with
  bound parameters (the old keyword-denylist validator is gone).
- **File-backed media:** project assets now live as files under
  `Documents\ScratchJR\media` instead of base64 rows inside the database,
  with a verified one-time startup migration, read-fallback for legacy
  databases, and atomic writes. Database saves shrink accordingly.
- Async (non-blocking) media reads in the main process.

### Architecture
- **Engine/UI separation:** all `editor/engine` + `editor/blocks` modules now
  talk to UI singletons through a typed `EnginePorts` seam and to editor state
  through a kind-tagged model registry (`modelRegistry.ts`) � the invisible
  `div.owner` expando object graph is gone.
- **Per-page bundles:** esbuild code splitting gives each screen only its own
  code (lobby/start no longer parse the block engine or paint editor).
- Keyboard shortcuts (Ctrl+S/Z/Shift+Z/N) are functional; close handshake
  works from every page; appEntry is import-side-effect-free.

### Reliability
- Updater: ETag-based conditional GitHub checks (rate-limit friendly),
  prerelease-safe version comparison, quota diagnostics, silent launch check.
- Debug log rotation at boot (5 MB cap per generation).
- Deduplicated crash handlers; hardened path containment unified in
  `lib/path-utils`.

### Quality
- 127 unit tests including golden undo/save-reload flows, DB intent
  validation, media migration, ETag caching, and setfield parameterization.
- New CDP harnesses: 
pm run smoke` (boot ? lobby ? editor ? help ? media
  round-trip) and 
pm run interact` (real pointer drags: sprite move,
  palette?script block docking, undo replay).

## [v1.5.5] — 2026-08-14

**Stage visibility fix.** The responsive layout now reserves enough vertical
space for the fixed-size stage canvas, preventing its lower edge from being
covered by the block palette on shorter windows.

## [v1.5.4] — 2026-08-14

**Startup hotfix.** Prevented the responsive scripts resize from updating the
scroll canvas before the project page exists, which could leave the editor
stuck behind its loading backdrop.

## [v1.5.3] — 2026-08-14

**Responsive editor workspace.** The stage and scripts area now adapt to the
available window height, giving the coding workspace usable space on smaller
desktop displays. Script canvases, scroll containers, and navigation arrows
resize together when the layout changes.

## [v1.5.2] — 2026-08-12

**Fixes the character-flood bug.** Clicking the character picker could keep
adding characters after the picker closed (a closed picker retained its
selection and mouse handlers, and adds could re-enter while a sprite was
still loading). Fixes:

- Picker close now resets selection state and detaches mouse handlers; adds are
  guarded against re-entry while a sprite is loading
- Sprite registration in `page.sprites` is now idempotent — a sprite re-created
  with the same id (reload, undo replay) can no longer accumulate duplicate
  entries
- Regression tests for both (102 → 103 tests)

**Developer experience:**

- 
pm install` now builds the renderer bundle (fresh clones boot immediately)
- Removed dead `UI.scrollContents`
- New engine tests: Hop / Repeat / Say primitives, Undo page-order chain
- CI boot-smokes the packaged Windows build before release (catches packaging
  regressions like the missing-bundle one from v1.5.0/v1.5.1)

## [v1.5.1] — 2026-08-12

**Fully strict, zero-`any` renderer.** `tsc --noEmit` is clean under
`strict: true` (noImplicitAny, strictNullChecks, strictFunctionTypes,
strictPropertyInitialization, …). All remaining `any` annotations and
`Record<string, any>` bags were replaced with real types: the project file
format is typed (`ProjectData`/`PageData`/`SpriteData`/`EncodedStrip`), the
drag system uses a typed `DragElement`, and the `HTMLElement.next` vs
`ChildNode.next` declaration clash (which broke element assignability under
TS 7) was resolved.

**Renderer test coverage** (new jsdom harness, 98 tests total):

- Script-strip decode/re-encode round-trip (the project file format, incl. loop nesting and arg encoding)
- Page-bag encode/decode round-trip
- Runtime primitive execution (Home / SetSpeed / Show / Hide)
- Scroll-aware page-strip caret math

**Editor polish:**

- The "+ add character" button can no longer be hidden — the character sidebar is sized to fit it at any window size
- The "+ page" button stays pinned at the bottom of the page strip while pages scroll beneath it
- The character strip scrolls natively — mouse wheel works without clicking the list first, and the custom scrollbar tracks the real position (previously drag-only, with a stale indicator)

**Release pipeline fixes:**

- The renderer bundle is now built before packaging (locally and in CI). The bundle is gitignored, so earlier CI releases shipped apps **without** it — they could not load their UI. Every release is now boot-verified.
- CI matrix now produces all five build jobs (an `include` collision had silently dropped the x64 Linux/macOS targets).

## [v1.5.0] — 2026-08-12

**Editor freedom:**

- Pages per project: hardcoded 4 → **8 by default**, configurable via `maxPages` in `settings.json`
- Scrollable page strip (auto-scrolls to the current page)
- Larger character sidebar (~5–6 visible; characters per page were never capped)
- Lobby thumbnails clamp the page-count badge cleanly for multi-page projects

**Full TypeScript migration** — all 56 renderer files `.js` → `.ts`, every
class declares its fields, `tsc --noEmit` clean (noImplicitThis +
useUnknownInCatchVariables; full strict shipped in v1.5.1). Migration-surfaced
bug fixes: sql-validator boot failure, `Record.saveSoundandClose` typo,
`currentProject` getter-only static, paint close-button render, guarded
`findKeyframesRule`.

## [v1.4.0] — 2026-08-11

Full modernization (8 phases):

- **Electron 22 → 42.8.1** (Chromium 134), Node 22/26 compatible
- **IPC**: synchronous `sendSync` (renderer-freezing) → async `invoke`/`handle` (19 channels)
- **Security**: 
odeIntegration: true` → `sandbox: true`, CSP on all pages, SQL validation, navigation/permission restrictions, window-open denied
- **Main process**: 1,122-line monolith → 94-line orchestrator + 5 focused modules
- **Renderer**: global vendor scripts → esbuild bundler, explicit ESM imports
- **Tests**: 0 → 80 (vitest: IPC, SQL, paths, layout)
- **CI**: lint + test + SHA256 checksums + version verification; 26 known vulnerabilities → 0

## [v1.3.x] — original port fixes

19 bug fixes across the main process, renderer engine, and UI (see git history
for details): desktop mouse interaction, async IPC `event.returnValue`, save-on-close
data loss, memory leaks, 5 SQL injection parameters, deprecated APIs, and more.

[Unreleased]: https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/compare/v1.5.2...master
[v1.5.2]: https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/tag/v1.5.2
[v1.5.1]: https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/tag/v1.5.1
[v1.5.0]: https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/tag/v1.5.0
[v1.4.0]: https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/tag/v1.4.0
