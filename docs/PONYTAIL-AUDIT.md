# Ponytail Over-Engineering Audit — ScratchJr Reborn

**Status:** REVIEW DRAFT — do not apply any cuts yet. This document is for review by
another agent/human first.

- **Date:** 2026-09-28
- **Scope:** whole repository (`C:\weeklyprogram\scratchjr-audit`), working tree @ `e0c6bba` (release v2.10.0)
- **Method:** 3 parallel explore tracks (host layer + main process, scripts/tooling, renderer app), every finding verified by reads/grep (export→importer ref counting, `git ls-files` for tracked output, SHA256 comparison for duplicate files)
- **Out of scope (by design):** correctness bugs, security holes, performance. Those are listed separately under "Notes routed to normal review".

---

## Net estimate

| Bucket | Lines | Deps |
|---|---|---|
| Tier 1 — pure deletion, no behavioral risk | ≈ -1,350 | -1 |
| Tier 2 — needs verification before adoption | ≈ -1,150 | -5 |
| **Total** | **≈ -2,500** | **-6** |

Per-track estimates: host/main ≈ -877 (safe floor -250) · scripts/tooling ≈ -1,270 · renderer ≈ -350.

Line counts are source-only estimates (brace-matched from definitions). **No tests, lint, or typecheck were run** — this is a read-only audit.

---

## Findings — Tier 1 (pure deletion, zero behavioral risk)

Ranked biggest cut first. Format: `<tag> <what to cut>. <replacement/proof>. [path:line]`

1. `delete:` 6 one-off asset scripts with zero callers in package.json, workflows, docs, or tests: `generate-sound-assets.js` (316 L), `generate-sound-icons.js` (287 L), `generate-reborn-icon.js` (248 L), `test-custom-import-cdp.js` (127 L — hardcodes `c:/weeklyprogram/scratchjr-audit`, superseded by `tests/unit/custom-image-import.test.js`), `process-natural-animals.js` (42 L), `download-natural-animals.js` (24 L). Outputs are already committed assets. → **-1,044 lines** [scripts/]
2. `delete:` `GEMINI.md` is a byte-identical clone of `AGENTS.md` (both SHA256 `B887419D…`, both 47 lines) — two files that must be edited in lockstep on every protocol change. Keep one. → **-47 lines** [GEMINI.md]
3. `delete:` dead IPC channel `io_getIsDebug` — zero renderer callers; only definitions across 6 JS/TS sites + 1 Rust + 1 Kotlin + one test asserting the key exists. Drop end-to-end. → **~-16 lines** [src/preload.ts:31, src/main/ipc-handlers.ts:32, src-tauri/src/commands.rs:66]
4. `delete:` dead IPC channel `debugWriteLog` — only reachable from a dead DEBUG flag block (finding 10). Drop handler + preload entry + Tauri wrapper + webhost fwd + browser stub + type + test key. → **~-14 lines** [src/preload.ts:48, src/main/ipc-handlers.ts:35]
5. `delete:` IPC handler `database_close` registered but no invoker (absent from preload contextBridge). → **-11 lines** [src/main/ipc-handlers.ts:118]
6. `delete:` `askForPermission()` unreachable — sole caller sits behind `isiOS = false` constant. Drop 4 host impls + type + harness entry. → **-16 lines** [src/app/src/utils/lib.ts:15, src/app/src/platform/PlatformBridge.ts:328]
7. `delete:` `hideSplash()` — zero callers repo-wide. Drop 4 host impls + type + harness entry. → **-16 lines** [src/webhost.js:181, src/electronClient.js:334, src/tauriClient.js:345, src/browserClient.js:1177]
8. `delete:` `Path.adaptPath` — 80 lines, 0 references. → **-80 lines** [src/app/src/painteditor/Path.ts:393]
9. `delete:` dead pinch-gesture chain in paint editor: `ignore` 4 + `pinchStart` 10 + `gestureStart` 17 + `gestureChange` 16 + `gestureEnd` 16. Only live entry is `window.onmousedown = Paint.detectGesture` [Paint.ts:219] → `Paint.mouseDown` [Paint.ts:254]; the gesture dispatch was commented out [Paint.ts:252-253]. See risk note R1. → **-63 lines** [src/app/src/painteditor/Paint.ts:267-336]
10. `delete:` `Events` pinch cascade — every external ref lives inside finding 9: `updatePinchCenter` [Events.ts:317], `zoomScale` [Events.ts:336], `pinchcenter` accessor + module vars, `scaleStartsAt` accessor + var. → **-48 lines** [src/app/src/utils/Events.ts:317,336,99,91]
11. `delete:` dead `electronClient.js` DEBUG flag matrix: `DEBUG=false`, 7 derived flags, `_DEBUG_AUDIOMETER` unused despite comment claiming webav.js usage, `hasCapturedErrors`, `DEBUG_WRITE_ERRLOG` gate, ~15 `if (DEBUG_X)` sites. Keep plain `debugLog`. → **-18 lines** [src/electronClient.js:13-51]
12. `delete:` dead renderer exports, all 0 refs repo-wide: `Path.getPointIndex` (12 L) [Path.ts:877], `Path.placePoint` (11 L) [Path.ts:1725], `lib.hitTest` (27 L, sole ref is a comment at Scripts.ts:106) [lib.ts:295], `ScratchJr.gestureStart` (6 L) [ScratchJr.ts:314], `lib.ts` dead exports `isTouch` (self-marked `@deprecated`), `getUiScale`, `rl`, `isElectron` (14 L) [lib.ts:4-20,177], `PlatformBridge.parse` + `ignore()` (5 L) [PlatformBridge.ts:383,387], `iOS` alias (2 L, 0 importers) [PlatformBridge.ts:455], `MatrixLike` single-impl interface (used only by own class, same file) [geom/Matrix.ts:3]. → **~-110 lines**
13. `delete:` commented-out code: 19 code-like lines across 13 files — incl. gesture dispatch [Paint.ts:252-253], dead `hitTest` call [Scripts.ts:106], `Path.placePoint` test call [Path.ts:1733]. → **-19 lines**
14. `delete:` misc dead: empty `will-quit` handler [src/main.ts:149], unused type alias `TabletBridge` [src/types/globals.d.ts:59], Rust `has_restore_database` never called (Tauri menu doesn't gate on it) [src-tauri/src/db.rs:196], redundant third `BASE64.decode(&sanitized)` in `clean_base64_decode` (identical input to first attempt; can only return Err) [src-tauri/src/commands.rs:146], `ScratchJRDataStore` ctor takes a `BrowserWindow` always `null` at construction [src/main/data-store.ts:18]. → **~-40 lines**
15. `delete:` dead npm scripts `make64` (no-op — `--arch=x64` is default) and `package` (`electron-forge package` has no callers); only refs are package.json itself. → **-2 lines** [package.json:10,12]
16. `delete:` both `_config.yml` files are dead — Jekyll never runs: Pages workflow uploads `dist-web/` as artifact and `build-web.js:164` writes `.nojekyll`. → **-2 lines** [\_config.yml, docs/_config.yml]
17. `delete:` workflow triggers for branches that don't exist — `web/pwa` [deploy-pages.yml:7], `mobile/android` [build-android.yml:9]; `git ls-remote --heads origin` returns only `master` and `experimental/tauri-port`. → **-2 lines**
18. `delete:` devDependency `@electron-forge/maker-squirrel` — zero refs outside package.json + lockfile; not in forge makers array. → **-1 dep** [package.json:199]

**Tier 1 subtotal: ≈ -1,350 lines, -1 dep.**

---

## Findings — Tier 2 (needs verification before adoption)

19. `yagni:` package.json `eslintConfig` is 155 lines of which **67 entries are `: 0`** — airbnb-base installed, then 2/3 of it disabled, plus unreachable payloads (`no-restricted-properties: [0, {…}]`, empty `ecmaFeatures`). Swap to `eslint:recommended`. **Verify `npm run lint` stays at 0 errors first** (airbnb still supplies real rules today). → **-130 lines, -2 deps** [package.json:37-191]
20. `yagni:` forge makers that never execute: `maker-deb`, `maker-rpm`, `maker-appimage`. CI Linux job runs only `npm run make:zip` [build-release.yml:82]; `version.json` publishes no .deb/.rpm/.AppImage. **Confirm Linux packages aren't planned.** → **-33 lines, -3 deps** [forge.config.js:57-89]
21. `shrink:` two parallel MSI pipelines doing the identical job with the identical fragment/upgradeCode (`E4346E7F…`): forge `maker-wix` + `beforeCreate` injecting `src/installer/cleanup-action.wxs` vs `scripts/build-msi.js`. CI only ever runs the latter [build-release.yml:152]; `npm run make` appears nowhere except README.md:81. Keep `build-msi.js` (asserted by `tests/unit/audit-remediation.test.js:152`), cut the forge maker-wix block. → **-20 lines** [forge.config.js:29-47]
22. `shrink:` media blocks copy-pasted across all 4 hosts — camera block (`scratchjr_captureimage/startfeed/stopfeed/choosecamera/cameracheck`) ~192 L → one shared impl in `webav.js` (~45) with one host-specific override each; recordsound block (`getAudioCaptureElement` + 6 `recordsound_*`) ~254 L → shared helper (~55); Electron+Tauri duplicate sound playback (`loadSoundFromDataURI`/`io_playsound`/`io_stopsound`/`io_registersound`) ~173 L → one mixin (~75). **Touches all host seams — cross-platform review required (AGENTS.md §1).** → **≈-400 lines** [electronClient.js:145-422, tauriClient.js:189-338, webhost.js:79-179, browserClient.js:985-1070]
23. `shrink:` `browserClient.js` reimplements the whole `executeIntent` SQL composer that already exists in `src/lib/db-intents.ts` (comment at :526 admits it) → import the real composer. **Must keep `db-intents.ts`'s column allowlist — browser version drops it.** → **-100 lines** [src/browserClient.js:523-632]
24. `shrink:` 12 delegate-only wrappers on `electronClient.js` that only forward an arg to `window.scratchjr` → `Object.assign(Object.create(bridge), …)` prototype delegation. → **-64 lines** [src/electronClient.js:76-191]
25. `shrink:` `version.json` vs `docs/version.json` byte-identical (SHA256 both `3EC65600…`), manually synced per AGENTS.md §2. Only reader of docs copy is `build-web.js:131` — point it at root copy, drop `docs/version.json`. **Confirm updater fetch of root copy [src/main/updater.ts:85] still covers the Pages endpoint.** → **-23 lines + 1 release-protocol bullet**
26. `shrink:` `scripts/smoke-web.js` re-implements byte-identical helpers: MIME table == `serve-web.js:8-20`, `getFreePort` == `generate-reborn-icon.js:21-30`, `findChromePath` == `generate-reborn-icon.js:32-46`, `waitForReady` ≈ `cdp-session.js:132` (`waitReady`, already the shared module). → **-60 lines** [scripts/smoke-web.js:20-100]
27. `shrink:` `patch-for-node26.js` patches its own patches — first rewrite in each chain immediately overwritten by the second in the same loop [39-58 → 61-83; 119-153 → 154-187]. Collapse each chain to `original → final`. → **-40 lines** (197 → ~157)
28. `shrink:` `updater.ts` platform/arch → asset-candidate selection written twice (manifest keys vs release assets) → one `pickAssetName(platform, arch)`. → **-30 lines** [src/main/updater.ts:142,240]
29. `shrink:` Rust: `save_sjr_file` and `save_stage_png` same dialog+write flow, differ only in extension/filter → one generic save helper (**-30**); `database_stmt`/`database_query` duplicate the raw-parse block → one helper (**-8**); `io_getfile` and `io_getmedia` are two commands over identical `state.io.read_file` while Electron already merged them → merge (**-4**). → **-42 lines** [src-tauri/src/commands.rs:17-84,185,227]
30. `shrink:` `hostClient.js` has 4 byte-identical `createElement('script')` blocks → one `load(src)` helper. → **-14 lines** [src/hostClient.js:10-49]
31. `shrink:` duplicate `LibraryMediaItem` type — `Library.ts:38` (7 fields) vs superset `LibraryEx.ts:9` (9 fields); import instead of redefining. → **-9 lines** [src/app/src/editor/ui/Library.ts:38]
32. `stdlib:` 133-line hand-rolled MD5 → `crypto.subtle.digest('SHA-256')` (~8 L). Sole consumer is `io_getmd5` → `Project.ts:553` thumbnail naming; hash value is opaque. See risk note R2. → **-125 lines** [src/browserClient.js:16-148]
33. `stdlib:` two duplicate hand-rolled UUID v4 generators → `crypto.randomUUID()`. → **-15 lines** [src/webav.js — `AudioCapture.getId`, `VideoCapture.getId`]
34. `stdlib:` `copyDirRecursive` duplicated verbatim in two build scripts → `fs.cpSync(src, dest, { recursive: true })`. → **-30 lines** [scripts/build-web.js:21, scripts/build-android-assets.js:15]
35. `stdlib:` `Events.startDrag` wires 6 mouse+touch window handlers while the app already uses Pointer Events everywhere (7 pointer refs in `BlockArg.ts`, `onpointerdown` in `Paint.ts:907`) → one pointer path; `Events.distance` → `Math.hypot`. See risk note R3. → **~-25 lines** [src/app/src/utils/Events.ts:144-161,209]
36. `yagni:` frozen platform flags `isDesktop=true, isElectron=true, isiOS=false, isAndroid=false` with no build-time `define:` anywhere in `scripts/`; Android's shipped bundle contains `var isAndroid = false` — yet 10 `if (isAndroid)` blocks survive into dist, plus always-true `if (isDesktop && …)` [Sprite.ts:1287] and always-false `if (isiOS)` [PlatformBridge.ts:329]. ~65 dead-side lines. See risk note R4. → **-65 lines** [src/app/src/utils/lib.ts:13-16, Sprite.ts:225-1313]
37. `yagni:` `io_get_lang` is an IPC round-trip whose entire body is `None` → return `null` in JS, drop the Tauri command. → **-8 lines** [src-tauri/src/commands.rs:71]
38. `yagni:` `ScratchJRDataStore` constructor param cleanup (folded into finding 14 above if reviewer prefers one entry).

**Tier 2 subtotal: ≈ -1,150 lines, -5 deps.**

---

## Risk notes (must resolve before applying)

- **R1 (finding 9/10):** the pinch-gesture chain is unreachable *today*, but it looks like a disabled feature (dispatch commented out at `Paint.ts:253`), not abandoned code. Confirm the intent is "paint-editor pinch-zoom stays dead" before deleting.
- **R2 (finding 32):** MD5→SHA-256 is only safe if thumbnail names are compared strictly within one host's DB (they are today). Cross-host name parity for identical bytes would be lost.
- **R3 (finding 35):** pointer-event migration touches drag behavior in blocks + paint editor — needs a manual drag smoke test (`npm run interact`).
- **R4 (finding 36):** `isAndroid`/`isiOS` branches may become live if a build-time define is ever added for the Kotlin shell (AGENTS.md §1). Confirm those platforms are never enabled in this renderer bundle before deleting the branches.
- **R5 (finding 22/23):** host-layer refactor must not break host abstraction seams (`src/hostClient.js`) per AGENTS.md §1.

---

## Notes routed to normal review (out of audit scope)

- `webhost.js` never sets `window.scratchjr`, but renderer calls `window.scratchjr!.sendExportedSjr/sendExportedPng` (only `Home.ts:196` guarded) and `appEntry`'s close handshake polls it — Android-side correctness issue.
- Browser `executeIntent` drops the column allowlist `db-intents.ts` enforces — security-relevant if browser build accepts untrusted SQL intents.
- `webav.js:472-474` probes `window.ScratchJr.getUiScale` / `window.getUiScale`, neither ever assigned — always falls back to 1.0.
- Stale doc/comment refs: `smoke-packaged.js:5` references non-existent `scripts/smoke.js`; `docs/WEB-PORT-PLAN.md:106` documents `npm run start:web` (actual: `serve:web`).
- `src/app/dist/` holds ~50 built chunks on disk (untracked; AGENTS.md §5 concerns commits — `git ls-files` shows 0 tracked build output, so §5 is currently satisfied).

---

## Verified non-findings (checked, clean — do not re-litigate)

- `out/`, `build/`, `dist-web/`, `graphify-out/`, `scratch/`, `src/app/dist/` → 0 tracked files via `git ls-files`, all gitignored. No committed build output.
- `version.json` is not dead: `src/main/updater.ts:85` fetches the root copy; Pages endpoint uses `docs/version.json` via `build-web.js` — hence finding 25 is a merge, not a deletion.
- Deps with real require/import sites: `intl-messageformat`, `jsdom`, `jszip`, `esbuild`, `electron-wix-msi`, `@electron/packager`, `@tauri-apps/cli`, `@types/node`, `sql.js`.
- `package.json` `overrides."@electron/packager": "$@electron/packager"` looks self-referential but is load-bearing (dedupes forge's `^18.3.5` req onto installed v20). Not cut.
- Test scaffolding is used, not speculative: `renderer-harness.js` 113 L / 17 importers, `engine-port-adapter.js` 90 L / 3.
- `ports.ts setEnginePorts` has 2 real implementations (renderer entry + test adapter) — not single-impl.
- `Events.itIsAClick`/`performMouseUpAction` reachable from live `Events.mouseUp` — not dead.

---

## Review checklist (for the reviewing agent)

Please respond point-by-point:

- [ ] Findings 1–18 (Tier 1): confirm or deny each — especially ref-count claims (1, 3–13)
- [ ] R1–R5 risk notes: resolve intent questions above
- [ ] 19 (eslint swap): is `npm run lint` at 0 errors with `eslint:recommended`?
- [ ] 20 (Linux makers): are .deb/.rpm/.AppImage planned releases?
- [ ] 22/23 (host refactor + SQL composer): approve as one cross-platform workstream?
- [ ] Any finding you judge *wrong* or *risky*: mark `reject` with reason
- [ ] Any finding you judge *too conservative*: mark `expand`
