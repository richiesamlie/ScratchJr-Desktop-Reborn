# Issue #15 — Resilient Project Import Audit & Verification Handoff

## Purpose

This doc is a read-only audit and verification spec for the current
Resilient Project Import work targeting
[issue #15](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/issues/15).

It is written so another agent can verify the existing changes, find the
remaining gaps, and decide what still needs to change — without having to
reconstruct the import flow from scratch.

## What issue #15 reports

- Importing a project into ScratchJr Reborn **fails on the web/PWA**.
- The reporter is unsure whether desktop/mobile are affected too and asks
  for those to be checked as well.
- Status: open, assigned to the maintainer. The maintainer has asked for a
  sample project file that fails to import.

So the concrete acceptance target is not “add resilience code.” It is:
**a user can import a valid `.sjr` / `.zip` / `.sqlite` project and the
imported project reliably appears in the app, with a visible outcome when
import fails.**

## Current changes under review

Local edit summary:

- **IndexedDB flush / persistence gate**
  - `browserClient.js` now exposes `database_flush`
  - `PlatformBridge.flushDatabase()` delegates to that host method
  - `PlatformBridge.loadProjectFromSjr` and `loadProjectsFromSqlite` await
    flush before reload/refresh
- **In-place lobby refresh on web**
  - After successful import, `PlatformBridge` calls
    `Home.displayYourProjects()` with `snap.wav` when available, instead of
    always reloading the page
- **Project format version compatibility**
  - `IO.loadProjectFromSjr` no longer rejects modern version strings; it
    only rejects when the parsed numeric major exceeds 99
- **Archive path normalization + flat archive inference**
  - Backslashes normalized to `/`
  - Asset subfolder inferred from extension when folder prefixes are absent
- **Asset error isolation + stringified JSON resilience**
  - Individual asset/record failures are isolated so one bad file does not
    abort the whole import
  - Stringified `json`/`thumbnail` parsed safely; missing names default to
    `'Project'`
- **Desktop menu + shortcut parity**
  - Electron and Tauri both have `File > Import Project (.sjr)...` and
    `CmdOrCtrl+O`
  - Drag/drop deduplication guard in `Home.ts`
- **Resilience unit suite**
  - `tests/unit/sjr-import-resilience.test.js` covers modern versions,
    Windows paths, flat archives, stringified metadata, corrupted asset
    isolation, invalid zip handling, and `flushDatabase` delegation

## What the current code does well

1. The web persistence race condition has a real seam now:
   `browserClient.js` -> `database_flush` -> `flushDbSave(true)`, with
   `PlatformBridge.flushDatabase()` delegating to `window.tablet.database_flush`.

2. Post-import behavior on the web lobby is no longer “always reload.” When
   `window.Home.displayYourProjects` exists, the import path refreshes the
   lobby in place and plays `snap.wav`.

3. The old version-rejection logic is gone from `IO.loadProjectFromSjr`.
   The current code parses the version string and rejects only an unlikely
   future-major case.

4. Windows archive paths and flat archives are handled in
   `IO.loadProjectFromSjr`.

5. The resilience unit tests validate the core IO/PlatformBridge behavior
   that you changed.

## Reconciliation points against issue #15

These are the places a reviewer should explicitly reconcile before calling
the issue done.

### 1. Web vs desktop have different post-import outcomes

- **Web lobby import path** prefers in-place `Home.displayYourProjects()` and
  only falls back to reload.
- **Desktop editor import path** in `src/app/src/entry/editor.ts`
  explicitly does `window.location.href = 'home.html'` after
  `loadProjectFromSjr` or `loadProjectsFromSqlite`.

That means desktop and web do not share the same post-import contract.

This may be intentional if desktop import is always expected to land the
user back on the lobby page. But if issue #15 includes “imported project
does not appear” or “import reloads badly,” then this difference matters
and should be documented or normalized.

### 2. There are multiple import ingress points

Import does not happen in one place:

- Web lobby drag/drop and file input
- Web browser Ctrl+O path via `openImportSjrDialog()`
- Desktop Electron `import-project-request` flow
- Desktop Tauri `import_project` menu event flow
- Lobby-side `Home.importProjectFile()`
- Editor-side import handler in `editor.ts`

All of them eventually reach `PlatformBridge.loadProjectFromSjr` or
`loadProjectsFromSqlite`, which is good, but they do **not** all share the
same post-import behavior or the same failure-to-user path.

For issue #15, that means “import fails” could mean different things
depending on where the user started the import.

### 3. Failure visibility is uneven

- `PlatformBridge.loadProjectFromSjr` and `loadProjectsFromSqlite` log
  errors and open an `Alert` when they catch a failure.
- But the **callers** do not always preserve that outcome uniformly.
  - `editor.ts` import chain navigates to `home.html` after the call.
  - `Home.importSjrFile` / `importSqliteFile` rely on PlatformBridge's
    internal alert without a separate caller-level fallback.

If a user saw “nothing happened,” a plausible remaining cause is not just
“import threw,” but “import failed and the visible message was not reached
in that host/ingress context.”

### 4. Tauri import wiring has two possible entry points

`src-tauri/src/lib.rs` imports via:

```
if (window.scratchjr && window.scratchjr.importProjectRequestCallback) { ... }
else if (window.Home && typeof window.Home.openFileDialog === 'function') { ... }
```

Meanwhile `tauriClient.js` wires `onImportProjectRequest` into
`importProjectRequestCallback`.

So the Tauri menu import can land in more than one renderer entry point
depending on load order and callback registration. This is probably fine,
but it is another host-specific variable for issue #15 and should be
checked rather than assumed.

### 5. Drop import is extension-only

`Home.installSjrDrop()` accepts files by extension and then tries to import
them. Combined with the new resilience improvements, invalid files are less
likely to crash the app, but the drop path still does not give the user a
distinct “this looked like a project but could not be imported” message
beyond whatever PlatformBridge reports.

## What the existing tests prove

`tests/unit/sjr-import-resilience.test.js` currently proves:

- modern `v2.x` / `desktop-v2.x` style project data imports without throwing
- Windows backslash archive paths still locate `data.json` and assets
- flat archives with root-level assets import using extension-based inference
- stringified `json`/`thumbnail` parses and missing names default to
  `'Project'`
- one broken asset does not abort the remaining import
- missing `data.json` and malformed `data.json` reject cleanly
- `PlatformBridge.flushDatabase()` delegates to
  `window.tablet.database_flush`

## What the existing tests do NOT prove

- The full web file-picker import flow from `openImportSjrDialog` / file
  input through PlatformBridge to the lobby refresh
- The desktop editor import path and whether its `home.html` navigation is
  the intended behavior
- The user-visible error outcome for each host and ingress when import
  fails
- Whether Tauri/Electron menu shortcut import actually reaches a working
  import in the assembled app, not just in unit mocks

So the resilience core is tested; the integration behavior around issue #15
is not fully covered yet.

## Recommended verification checklist

Before touching more code, an agent should verify the following.

### 1. Unit suite + static checks

Run:

- `npm test`
- `npm run typecheck`
- `npx eslint src`

If any of these fail, fix that first. Do not treat import changes as
complete while the suite is red.

### 2. Web import smoke

The web smoke already exercises import:

- `scripts/smoke-web.js` exports a project, imports the payload via
  `PlatformBridge.loadProjectFromSjr`, and verifies the lobby shows the new
  project card after the post-import reload.

Run:

- `node scripts/smoke-web.js`

This is the closest automated check to the reported web import failure.

If this passes, the most likely remaining issue #15 risk is no longer “the
core import path is broken in the browser.” It becomes more likely that the
original reporter hit a different ingress, a different failure path, or a
host-specific wiring issue.

If this fails, the smoke output is more useful than any summary: preserve
the actual failure and the logs around it.

### 3. Desktop smoke

Run:

- `node scripts/smoke-test.js`

This verifies start -> lobby -> editor on the Electron side. It is not
mainly an import test, but it is a good sanity check that the desktop
renderer still boots and the bridge is live.

If you want desktop import specifically checked, the review should focus on:

- whether the Electron/Tauri menu import command reaches the renderer
- whether the editor-side import navigates to `home.html` as expected
- whether the lobby-side import refreshes as expected

### 4. Explicit failure-mode check

Right now the resilience suite proves “good inputs import” and “obviously bad
archives reject.” It does not strongly prove “a bad project file surfaces a
clear outcome to the user in each host.”

A useful follow-up is one or both of:

- an integration case for a failed web import that verifies the app does not
  silently swallow the failure
- a review note explaining which failure paths show an `Alert`, which show
  console-only errors, and which are intentionally silent

## Likely open questions for the next agent

1. Is the desktop editor `window.location.href = 'home.html'` after import
   intentional, or should it match the web in-place lobby refresh behavior?

2. For issue #15, is the reported failure “import never starts,” “import
   starts but project does not appear,” or “import fails with no visible
   message”?

3. Do we have or can we get a reproducible failing `.sjr` / `.zip` /
   `.sqlite` file, or a minimal repro step?

4. Should the verification cover all hosts, or only web for now?

## Suggested next actions

- Run the web import smoke and report whether the browser import flow now
  behaves as intended end to end.
- Decide whether the desktop editor post-import navigation is intentional
  and, if not, reconcile it with the web lobby refresh path.
- Add or propose one explicit failed-import integration check so silent
  failure is covered, not just successful import.
- If a repro file or repro step exists, use it as the real acceptance test
  instead of only the resilience unit suite.
