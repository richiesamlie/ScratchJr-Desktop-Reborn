# Editor Engine Architecture

How the ScratchJr Reborn editor (`v2.15.0`) works under the hood — the modular decoupling seams, the module graph, the runtime execution model, and the UI coordination. Read this before touching editor logic.

## Decoupling seams (read this first)

Three architectural seams keep the engine decoupled, host-agnostic, and testable:

- **`EnginePorts` (`src/app/src/editor/engine/ports.ts`)** — a typed interface installed once at boot (`entry/editor.ts`). Engine modules call `enginePorts().thumbsUpdatePages()`-style methods instead of importing UI singletons; there are zero runtime imports of `../ui/*` or the `ScratchJr` god object from `editor/engine/` or `editor/blocks/`.
- **`modelRegistry` (`src/app/src/editor/modelRegistry.ts`)** — a kind-tagged `WeakMap` replacing the legacy `div.owner` expando graph. Lookups use `getModelRefAs<Sprite>(el, 'sprite')` and DOM walkers use `findUpModelRefEl(el)`. A read-only debug hook lives at `window.__modelRefs` for tests/diagnostics.
- **Pure Geometry & Isolated Paint Canvas (`src/app/src/geom/GeometryMath.ts` & `src/app/src/painteditor/PaintCanvas.ts`)** — Bézier evaluation, point smoothing, curve downsampling, and polygon winding live in DOM-free `GeometryMath.ts`, while the paint editor uses its own dedicated offscreen canvas rather than `ScratchJr.workingCanvas`.

## Module graph (high level)

```text
ScratchJr (static orchestrator: story state, autosave, focus, statics;
           engine reaches it only via EnginePorts state accessors)
  ├── Stage          — pages[], current page, sprite/page operations, SD/HD resolution
  │     └── Page     — sprites list, backgrounds, current sprite, encode/decode
  │           └── Sprite — DOM div + image/svg asset, sounds, scripts, color/fade filters
  │                 └── Scripts — block containers, strip decode (recreateStrip)
  │                       └── Block / BlockArg — visual blocks, .next/.prev/.inside chains
  ├── Runtime        — thread scheduler (setInterval-driven state machine)
  │     └── Thread   — per-running-script execution state (thisblock, waitTimer, stack…)
  │           └── Prims — the primitives (Home, Say, Move, FlipX, RandomPos, Color, Fade…)
  ├── Thumbs         — sprite strip + storyboard page strip UI, thumbnails, drag math
  ├── Palette / ScriptsPane / UI — block palette (comfortRatio spacing), script editing, chrome
  ├── SoundPicker / SoundLib — curated 16-sound modal picker & custom audio import
  ├── Undo           — snapshot-based undo (Project.getUndo + action)
  ├── Library        — character/background picker (media.json-backed)
  └── Events         — global pointer/touch/mouse drag & gesture normalization
```

## The runtime execution model

Scripts are block chains. When the green flag (or a touch/bump/color/message trigger) starts a script:

1. `ScratchJr.startCurrentPageStrips(['onflag', 'ontouch', ...])` finds matching
   top blocks and calls `Runtime.addRunScript(spr, block)`.
2. `Runtime` owns a `setInterval` tick loop (`Runtime.ts`) that calls
   `stepAll()` → `step(n)` per running thread.
3. `step(n)` is the state machine:
   - `waitTimer > 0` → decrement and return (primitives may span multiple ticks)
   - `yield` set by a primitive → return (e.g. a running animation)
   - `thisblock == null` → `endCase()` (thread finished)
   - otherwise → `runPrim()` — dispatch to `Prims[blocktype]`
4. Primitives advance the thread by setting `strip.thisblock = strip.thisblock.next!`
   (or pushing onto `stack` for `repeat`, or setting `waitTimer`/`yield` for
   multi-tick behavior like motion easing, `randompos`, `wait`, and `waitrandom`).

`Thread` state that matters: `firstBlock`, `thisblock`, `oldblock`, `stack`
(repeat nesting), `waitTimer`, `count`, `vector`, `distance`, `isRunning`,
`called` (spawned sub-threads).

### Reborn block primitives (`Prims.ts` & `BlockSpecs.ts`)

| Opcode | Category | Behavior |
|---|---|---|
| `ontouchsprite` | Start | Triggers when bounding/pixel hit-test overlaps the selected same-page target sprite ID |
| `ontouchcolor` | Start | Triggers when sprite overlaps the target RGB color swatch or eyedropper-sampled stage color |
| `flipX` | Motion | Toggles sprite horizontal mirror state (`flip` boolean / `scaleX(-1)`) |
| `randompos` | Motion | Picks a random grid target `(0..19, 0..14)` and glides smoothly at the sprite's speed |
| `color` | Looks | Shifts sprite hue by `arg * 36deg` via CSS `hue-rotate(...)` filter |
| `fade` | Looks | Adjusts sprite ghosting (`-10..10`), clamped to a minimum 20% opacity so sprites stay interactive |
| `waitrandom` | Flow | Waits a random tick count in `[0, arg]` tenths of a second |
| `randompage` | End | Switches to a random page $p \neq \text{currentPage}$ when project has $>1$ page |

## The project file format

See [development.md](./development.md) — typed as `ProjectData` / `PageData` /
`SpriteData` / `EncodedStrip` in `src/app/src/editor/ui/Project.ts`. Key flow:

- **Save**: `Project.getProject(pageId)` → per page `Page.encodePage()` → per
  sprite `Sprite.getData()` → per script `Project.encodeStrip(headBlock)`
  (walks the `.next` chain — one strip per script). Concurrent `Project.save` calls are queued so callbacks never drop.
- **Load**: `Project.recreatePage(id, data)` → `Page.loadPageData` →
  `Project.recreateObject` per sprite → `Scripts.recreateStrip(strip)` per strip. Guarded by a `3500ms` safety watchdog in `Project.loadTask()`.
- **Undo**: `Undo.record(action)` snapshots `Project.getUndo()` and merges the
  action descriptor; `Undo.smartRecreate` replays. The snapshots are the file
  format — keep `Undo.ts` on the shared types.

## UI coordination & Sketchboard layout (`v2.15.0`)

- **Sprite strip** (`Thumbs.updateSprites`) rebuilds from
  `page.sprites` (JSON list of sprite ids). The strip scrolls natively —
  `scrollTop` on `.spritethumbs` is the single source of truth (drag scroll,
  `spriteInView`, and the reset in `updateSprites` all write it; the custom
  scrollbar is synced by a `scroll` listener). Supports drag-and-drop sprite reordering.
- **Storyboard page strip** (`Thumbs.updatePages`) rebuilds `.pagethumb` cards (`140px` flex-sized) inside `.pagescc`; `#emptypage`
  (the + page button) is `position: sticky; bottom: 0` inside the scroller.
- **Stage mini-tools dock**: `#stageframe::before` renders the elevated tactile dock bar behind `#full`, `#grid`, `#setbkg`, `#addtext`, `#resetall`, and `#go`, keeping those buttons as direct children of `#stageframe` so presentation mode reparenting works cleanly.
- **Adaptive block palette**: `#blockspalette` (`86px`) and `#palette` (`71px`) compute horizontal block positions using an adaptive `comfortRatio` multiplier so numeric badges never clip or overlap.
- **Selection**: `Page.setCurrentSprite` drives the scripts panel
  (`gn('<spriteId>_scripts')`), the palette, and highlights.
- **Undo hooks**: `Page.update(spr)` records a `modify` undo entry; mutations
  go through `Stage`/`Page` methods that record before the change.

## Limits & layout constraints

| Limit / area | Where | Current value |
|---|---|---|
| Pages per project | `window.Settings.maxPages` in `Thumbs.updatePages` | `10` (`src/app/settings.json`) |
| Character sidebar height | `#library .spritethumbs` `max-height` | `calc(100% - 10.29vh-px)` |
| + button visibility | `.addsprite` / `#emptypage` | always visible (sized/pinned to fit) |
| Maximum canvas dimension | `SVG2Canvas.ts` / `Paint.ts` | `4096px` clamp (prevents OOM crashes) |

**Hard boundary:** `#blockspalette` (z-index 10) starts at the left
panel's bottom and covers everything below it in the left column. Left-column
UI must end above that line.

## Extending the editor

- **New primitive**: add the method to `Prims` (dispatch is by `blocktype`),
  register the block in `BlockSpecs.setupBlocksSpecs()` and `setupPalettesDef()`, add localized strings across all 12 locale files (`src/app/localizations/*.json`), and cover it with a
  jsdom test in `tests/unit/` (see [development.md](./development.md) for the
  harness conventions).
- **New project data field**: add it to the typed bags in `Project.ts`
  (`ProjectData`/`PageData`/`SpriteData`), write it in
  `Sprite.getSpriteData()`/`Page.encodePage()`, read it in
  `Page.loadPageData()`/`Project.recreateObject()`, and extend the round-trip
  tests.
- **New host/IPC channel**: define the channel in `src/preload.ts` (Electron), `src/tauriClient.js` + `src-tauri/src/commands.rs` (Tauri), `src/webhost.js` + `AndroidBridge.kt` (Android), and `src/browserClient.js` (Web/PWA), and type it on `IpcBridge` / `ScratchJrBridge` in `src/types/globals.d.ts`.
