# Threat Model — ScratchJr Desktop Reborn

Verified against `v2.15.0` source across **Desktop** (Electron 45 & Tauri v2), **Android** (Kotlin WebView shell), and **Web / PWA** (`sql.js` WASM + IndexedDB).

Scope: creative coding app used by young children, deployed in schools and homes, local-first, no accounts, no telemetry. Assets to protect, in order: (1) student project data (`~/Documents/ScratchJR/`, Android app sandbox, or browser IndexedDB), (2) the host machine/device itself (no arbitrary code execution, no arbitrary filesystem access, no data exfiltration), (3) the integrity of released artifacts that schools and parents install.

Trust boundaries:

```text
UNTRUSTED          Renderer content (projects, SVGs, .sjr / .sqlite files from anywhere)
   │ Host Bridge:
   │  • Electron: contextBridge window.scratchjr (21 methods, src/preload.ts)
   │  • Tauri v2: tauriInvoke (15s timeout, src/tauriClient.js -> src-tauri/src/commands.rs)
   │  • Android:  @JavascriptInterface AndroidInterface (AndroidBridge.kt)
   │  • Web/PWA:  browserClient.js (in-browser WASM + IndexedDB)
   ▼
SEMI-TRUSTED       Host IPC / Command / Bridge Handlers
   │ Strict table/column/operator allowlists, basename confinement, user-mediated dialogs
   ▼
TRUSTED            SQLite DB (sql.js / rusqlite / Android WAL), media store, GitHub update check
```

---

## Threat A — Malicious `.sjr` or `.sqlite` project file

**Path:** attacker → `.sjr` (ZIP) or `.sqlite` → `IO.loadProjectFromSjr` / `IO.loadProjectsFromSqlite` → asset extraction → media store + DB rows → renderer display.

**Likelihood: MEDIUM** — `.sjr` files are the app's share format; a child or teacher can receive one from USB, email, or web download.

**Current mitigations (verified in `v2.15.0`):**

| Attack | Mitigation | Evidence |
|---|---|---|
| Zip-bomb / oversized archive DoS | Compressed size capped at `50 MB`, max archive entries capped at `2000`, total uncompressed bytes capped at `200 MB`. Android intent stream bounded to `50 MB` via `IoUtils.readBounded`. | `src/app/src/platform/IO.ts:554-590`; `IoUtils.kt`; tested in `sjr-import-resilience.test.js` |
| Zip-slip path traversal (`../` or invalid entry names) | Rejects leading `/` and `..` segments; keeps only last path segment validated against `/^[A-Za-z0-9._-]+$/`; host backends re-validate `basename` equality and reject separators. | `IO.ts:592-602`; `src/main/database.ts`; `src-tauri/src/io.rs`; `AndroidDatabaseManager.kt` |
| Unsolicited Android intent import | Dropped `file://` scheme from `AndroidManifest.xml` intent filter (accepts `content://` only) and prompts a kid-friendly confirmation dialog before importing external `.sjr` files. | `MainActivity.kt`, `AndroidManifest.xml` |
| Malicious version string | Numeric major version parser rejects unsupported future versions (`> 99`) before writing. | `IO.ts:640-646` |
| Malicious project JSON / SQL injection | All DB writes go through allowlisted `insert`/`update` intents with parameterized values and primitive type checks. | `src/lib/db-intents.ts`, `src-tauri/src/db.rs`, `AndroidDatabaseManager.kt`, `src/browserClient.js` |
| Corrupted individual asset inside archive | Per-asset `try/catch` error isolation logs and skips broken media entries without aborting the project import or leaving half-written state. | `IO.ts`; tested in `sjr-import-resilience.test.js` |
| Embedded SVG payloads | Scrubbed on import and render via `svgSanitizer.ts` AND rendered through script-inert XML/Canvas/`<img>` paths. | see Threat B |

---

## Threat B — Malicious media (SVG / PNG / audio)

**Path:** attacker → character/backdrop import or `.sjr` asset → media store → renderer display.

**Likelihood: MEDIUM** (custom image/sound import is a core feature).

**Current mitigations (verified in `v2.15.0`):**

- **Dedicated SVG Sanitizer (`src/app/src/utils/svgSanitizer.ts`):**
  - Strips dangerous elements (`<script>`, `<foreignObject>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<meta>`, `<link>`, `<style>`, `<animate*>`, `<set>`, `<use>`, `<audio>`, `<video>`).
  - Removes all inline `on*` event handler attributes.
  - Restricts `href` and `xlink:href` attributes strictly to local fragment references (`#...`) or `data:image/*` URIs (blocking `javascript:`, `vbscript:`, `http:`, `https:`, `file:`, and `//`).
- **Script-inert render paths:** `DOMParser().parseFromString(str, 'text/xml')` followed by canvas rasterization (`SVG2Canvas.ts`) or `<img src="data:image/svg+xml;base64,...">`.
- **Canvas dimension clamping:** Maximum canvas dimensions are clamped to `4096px` (`SVG2Canvas.ts`, `Paint.ts`) to prevent decompression-bomb OOM crashes on low-end school hardware.
- **Zero-inline strict CSP:** `default-src 'self'`, `script-src 'self' 'wasm-unsafe-eval'` (zero `'unsafe-inline'` in `script-src`) across all HTML pages and `tauri.conf.json`.
- **Audio containment:** Audio playback reads go through `io_getAudioData` with strict path containment (`src/lib/path-utils.ts`).

---

## Threat C — Compromised renderer

**Model:** any script execution in the renderer tries to escalate privileges via `window.scratchjr`, `window.__TAURI_INTERNALS__`, or `window.AndroidInterface`.

**What a compromised renderer can do (verified across all hosts):**

| Capability | Reachable? | Boundary |
|---|---|---|
| Arbitrary SQL | **No** | Intents restricted to 3 tables (`projects`, `usershapes`, `userbkgs`), 4 ops, allowlisted columns, allowlisted `WHERE` operators (`=`, `!=`, `IS NULL`), strict `ASC`/`DESC`, and primitive values (`db-intents.ts`, `src-tauri/src/db.rs`, `AndroidDatabaseManager.kt`, `browserClient.js`). |
| Arbitrary file read | **No** | `io_gettextresource`/`io_getAudioData` confined to app asset directory by `validateFilePath` (`path-utils.ts`, `io.rs`, `AndroidBridge.kt`); media reads restricted to basename keys. |
| Arbitrary file write | **No** | Media writes are basename-confined to the app's `media/` directory; `.sjr` and PNG exports write to arbitrary paths only after a native OS save dialog controlled by the user (`ipc-handlers.ts`, `commands.rs`). |
| Arbitrary delete | **No** | `io_remove` deletes a single basename-confined media file; `io_cleanassets` is extension-scoped and deletes only unreferenced files (protecting `MD5`, `ALTMD5`, and `THUMBNAIL` references). |
| OS execution / URL scheme abuse | **No** | No `shell` API exposed in the renderer bridge; `openExternalUrl` is main-side only and enforces `safeExternalUrl` (`updater.ts`), restricting navigation strictly to `https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/*` and `*.githubusercontent.com`. |
| Unauthorized camera/mic access | **No** | Electron `setPermissionRequestHandler` / `setPermissionCheckHandler` (`window-lifecycle.ts`) locks media permissions strictly to the app's local `file://` origin (`isAppFileUrl`). Android WebView disables `allowFileAccess`/`allowContentAccess` and locks requests to `https://appassets.androidplatform.net` (`WebSecurityUtils.kt`). |
| Hanging IPC promises | **No** | Tauri IPC commands enforce a 15-second timeout (`tauriClient.js`); project media loader enforces a 3.5-second watchdog timeout (`Project.ts`). |
| Wipe student projects | **Yes, within DB** | `delete`/`update` intents on `projects` — by design (renderer owns project lifecycle); mitigated by `.bak` rotation on Desktop/Android. |

---

## Threat D — Malicious update metadata

**Path:** GitHub Pages CDN / GitHub Releases API → `updater.ts` → dialog → `openExternal`.

**Current mitigations (verified in `v2.15.0`):**

- HTTPS requests to fixed owner/repo endpoints with 10-second abort timeout and ETag `304` caching.
- **Strict URL choke point (`safeExternalUrl` in `src/main/updater.ts`):** Enforces `https:` protocol, rejects embedded credentials (`username`/`password`), and permits only `github.com/richiesamlie/ScratchJr-Desktop-Reborn/*` and `*.githubusercontent.com`. All non-matching origins fall back to the verified repository release URL or are rejected.
- **No auto-download, no auto-execute:** The update prompt only opens the user's default browser after explicit confirmation.
- **Fleet suppression (`--no-update-check` / `SCRATCHJR_NO_UPDATE_CHECK=1`):** Completely disables startup checks, menu items, and outbound network requests on managed school machines.

---

## Threat E — CI supply-chain compromise

**Path:** dependency / GitHub Action / build tool → GitHub Actions → release artifact → school PCs & devices.

**Current mitigations (verified in `v2.15.0`, tested in `tests/unit/audit-remediation.test.js`):**

1. **100% SHA-pinned GitHub Actions:** Every `uses:` directive across `build-release.yml`, `build-android.yml`, and `deploy-pages.yml` is pinned to a 40-character commit SHA (enforced by automated unit test `F-03 / P0-001`).
2. **Verified WiX 3.14 binary download:** `build-release.yml` verifies the SHA-256 hash (`6ac824e1642d6f7277d0ed7ea09411a508f6116ba6fae0aa5f2c7daa2ff43d31`) of `wix314-binaries.zip` via `sha256sum -c -` before extracting (`F-04 / P0-004`).
3. **Least-privilege workflow permissions:** Build jobs run with `permissions: contents: read`; `contents: write` is isolated exclusively to the final release-publishing jobs (`release` and `release-android`).
4. **Zero npm audit vulnerabilities:** Only 1 runtime dependency (`sql.js@^1.15.1`), `npm ci` lockfile enforcement, and `0` vulnerability advisories across all build/dev dependencies.
5. **CI patch drift guard:** `scripts/patch-for-node26.js` exits non-zero if patch hunks drift under `process.env.CI`.
6. **Release checksum sidecars:** Every published installer, ZIP, APK, and AAB is accompanied by a `.sha256` checksum file.

---

## Summary matrix

| Threat | Likelihood | Impact | Current mitigation (`v2.15.0`) | Status |
|---|---|---|---|---|
| A. Malicious `.sjr` / `.sqlite` | MEDIUM | Contained | 50MB/2000-entry/200MB caps, basename regex guard, allowlist SQL intents, per-asset error isolation, Android intent confirmation | **Mitigated** |
| B. Malicious media (SVG/PNG/audio) | MEDIUM | Contained | `svgSanitizer.ts` tag/attr/href scrubbing, script-inert XML/Canvas render, 4096px canvas clamp, zero-inline CSP | **Mitigated** |
| C. Compromised renderer | LOW | Contained | Table/column/operator SQL allowlists across all 4 hosts, path containment, origin-locked media permissions, user-mediated export dialogs | **Mitigated** |
| D. Malicious update metadata | LOW | Contained | `safeExternalUrl` HTTPS GitHub allowlist, notification-only browser handoff, `--no-update-check` fleet flag | **Mitigated** |
| E. CI supply-chain compromise | LOW | Contained | 40-char SHA-pinned Actions, WiX SHA-256 verification, least-privilege job tokens, 0 npm vulnerabilities, `.sha256` release sidecars | **Mitigated** |
