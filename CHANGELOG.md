# Changelog

All notable changes to **ScratchJr Reborn**. The repo is developed on
`master`; releases are tagged `vX.Y.Z` and built by CI.

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
