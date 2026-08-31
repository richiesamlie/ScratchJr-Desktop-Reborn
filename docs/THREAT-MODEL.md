# Threat Model — ScratchJr Desktop Reborn

Scope: desktop app used by young children, deployed in schools, local-first,
no accounts, no telemetry. Assets to protect, in order: (1) student project
data in `~/Documents/ScratchJR/`, (2) the machine itself (no code execution,
no data exfiltration), (3) the integrity of released artifacts that schools
install.

Trust boundaries:

```
UNTRUSTED          Renderer content (projects, SVGs, .sjr files from anywhere)
   │ contextBridge window.scratchjr (19 methods, src/preload.ts:21-76)
   ▼
SEMI-TRUSTED       Main process IPC (src/main/ipc-handlers.ts)
   │ allowlists (db-intents), basename confinement, user-mediated dialogs
   ▼
TRUSTED            sql.js DB, media dir, app dir, GitHub update check
```

---

## Threat A — Malicious `.sjr` project file

**Path:** attacker → `.sjr` (a zip) → `IO.loadProjectFromSjr` → asset
extraction → media dir + DB rows → renderer display.

**Likelihood: MEDIUM** — `.sjr` files are the app's share format; a child
can receive one from anywhere (USB, email, web download).

**Current mitigations (verified):**

| Attack | Mitigation | Evidence |
|---|---|---|
| Zip-slip path traversal (`../` entry names) | Renderer keeps only the last path segment; main process re-validates `basename` equality and rejects separators | `src/app/src/platform/IO.ts:528`; `src/main/database.ts:358-363`; tested in `media-migration.test.js:96-103` |
| Oversized entries | Entry content is base64-decoded and written via the same basename path; no exec | `IO.ts:530-544` |
| Malicious version string | Version gate rejects `iOSv>1` before any write | `IO.ts:493-497` |
| Malicious project JSON | Goes into an allowlisted `insert` intent (parameterized) | `db-intents.ts:127-142` |
| Embedded SVG payloads | Render path is DOMParser-as-XML → canvas raster / `<img>` data: URL; scripts never execute | see Threat B |

**Remaining risks:**

1. **Unclamped SVG dimensions → renderer freeze/OOM** (`IO.ts:550-558`,
   `IO.ts:55-56`). Denial of service only, but trivially triggerable on
   low-end school hardware. → Audit F-09.
2. **Non-transactional import** — crash mid-import leaves a broken project
   visible in the lobby (`IO.ts:499-504`). Not a compromise, an integrity
   bug. → Audit F-07.
3. **Corrupt archive fails silently** (sync catch around async call,
   `PlatformBridge.ts:339-347`) — the user, including a teacher, gets no
   feedback. → Audit F-08.

**Recommended:** dimension clamps, counter-based import rollback, `.catch()`
wiring to the existing Alert. No architectural change needed.

## Threat B — Malicious media (SVG / PNG / audio)

**Path:** attacker → character/backdrop import or `.sjr` asset → media dir →
renderer display.

**Likelihood: MEDIUM** (import is a core feature for kids; files come from
anywhere).

**Current mitigations (verified):**

- **No script execution is reachable from SVG content.** Raw SVG text is
  stored verbatim (unsanitized — true), but every render path is inert:
  `DOMParser().parseFromString(str, 'text/xml')` (XML — no script execution,
  no event handlers fire), then either a hand-written canvas rasterizer
  whose `default:` branch skips any unknown tag (`SVG2Canvas.ts:321-379` —
  `<script>`, `foreignObject`, `<animate>` all land there) or an
  `<img src="data:image/svg+xml;base64,...">` where the browser's image
  document restrictions disable scripts, handlers, foreignObject and
  external subresources (`Sprite.ts:166-177`). The imported node is never
  appended to the live DOM anywhere in the flow.
- CSP `script-src 'self'` on all four pages blocks any residual inline
  execution vector.
- Audio import records are renderer-side `MediaRecorder` blobs; playback
  reads go through `io_getAudioData` with path containment
  (`ipc-handlers.ts:176-199`).

**Remaining risks:**

1. **External-reference probes**: three code paths assign attacker-controlled
   `xlink:href` to `img.src` (`IO.ts:126-128`, `SVG2Canvas.ts:282-284`,
   `SVGImage.ts:187-189`). CSP `img-src 'self' data:` blocks http(s) on all
   pages; canvas tainting blocks exfiltration. Residual: `file://` existence
   probing (LOW). Fix: only accept `data:` hrefs at these three sites.
2. **Decompression-bomb class**: PNG/SVG with huge declared dimensions →
   giant canvas allocation / decode → hang or OOM (DoS only, same class as
   Threat A.1). No size/magic-byte/dimension checks exist on import
   (`Library.ts` `handleImportFile`). → Audit F-09.

**Verdict:** worst realistic outcome from malicious media is **renderer
denial-of-service**, not code execution and not data theft. The lack of SVG
*sanitization* is compensated by render-path construction; this is a
legitimate defense-in-depth trade-off for an offline kids' app, documented
here instead of "fixed" with a sanitizer that would corrupt artwork.

## Threat C — Compromised renderer

**Model:** any script execution in the renderer (future XSS, a malicious
localization file, an exploited dependency) gets `window.scratchjr` and
tries to escalate.

**What a compromised renderer can do (verified against every channel):**

| Capability | Reachable? | Boundary |
|---|---|---|
| Arbitrary SQL | **No** | Intents: 3 tables, 4 ops, allowlisted columns, parameterized values, unknown keys rejected (`db-intents.ts:94-165`) |
| Arbitrary file read | **No** | `io_gettextresource`/`io_getAudioData` confined to app dir by `validateFilePath` (`path-utils.ts:14-26`); media reads by basename key |
| Arbitrary file write | **No** | Media writes basename-confined to `Documents/ScratchJR/media` (`database.ts:358-363`); export writes only after a native save dialog the user controls (`ipc-handlers.ts:247-284`) |
| Arbitrary delete | **No** | `io_remove` deletes one basename-confined media file; `io_cleanassets` extension-scoped, only unreferenced files |
| OS execution / URL scheme abuse | **No** | No `shell` exposure in the bridge; `openExternalUrl` is main-side only, called only from the update dialog with GitHub URLs (`updater.ts:220-224`, `main.ts:63-67`) |
| DoS main process | **Bounded** | `io_getmedialen` reads a whole file into the 64MB-capped cache; renderer can churn cache but not grow it (`data-store.ts:111-133`) |
| Wipe student projects | **Yes, within DB** | delete intents on `projects` — by design (renderer owns project lifecycle); mitigated by `.bak` rotation, which a compromised renderer could also defeat via a second save. Accepted: equal to the threat of the app itself. |

**Boundary quality:** the answer to "can a compromised renderer access
arbitrary files?" is **no**, and this held for all 19 channels. The design
correctly treats the renderer as an untrusted client.

**Residual hardening (P2):** the `xlink:href` data-only restriction (Threat
B.1) also shrinks this boundary; `window.__ioDebug`/`__modelRefs` debug
seams are inert under CSP but should ideally be dev-only.

## Threat D — Malicious update metadata

**Path:** GitHub API/release → `updater.ts` → dialog → `openExternal`.

**Current mitigations (verified):**

- HTTPS to `api.github.com` only, fixed owner/repo constants
  (`updater.ts:13-14,115-121`); 10s abort timeout; ETag 304 caching to
  respect rate limits.
- Malformed payloads rejected (`tag_name` type check, `:145-148`).
- Semver comparison strips prerelease suffixes; NaN-class comparison bugs
  were already fixed historically (`:70-82`, unit-tested).
- **No auto-download, no auto-execute.** The dialog offers
  Download/View/Cancel; download opens the user's browser at the asset URL
  (`main.ts:52-67`). A school can firewall `api.github.com` and lose only
  the check, which fails silently (`main.ts:134-136` handles the offline
  case).

**Remaining risks:** asset authenticity is not cryptographically verified by
the app — but since nothing is ever downloaded or executed by the app, this
reduces to phishing-grade risk (a fake release page in the browser), not
code execution. **Unsigned artifacts (Audit F-01) are the real weakness
here**: the downloaded installer a teacher runs carries no publisher
identity, so SmartScreen warnings train users to click through. Fix signing
(F-01), not the checker.

## Threat E — CI supply-chain compromise

**Path:** dependency/action/tool → GitHub Actions → release artifact →
school PCs.

**Verified exposure surface, ranked:**

1. **Five mutable tag-pinned actions**, including third-party
   `softprops/action-gh-release@v2` running with `contents: write`
   (`build-release.yml:37,40,160,180,185,176-177`). A repointed tag or
   compromised account = arbitrary code in the release pipeline. → Fix:
   SHA-pin all five (P0-001).
2. **Unverified WiX 3.14 binary download** executed at build time
   (`build-release.yml:124-127`); its output is the MSI schools install. →
   Fix: SHA-256 verification (P0-004).
3. **Postinstall mutates `node_modules`** (`patch-for-node26.js`) — audited
   in-repo, idempotent, string-replacement only, self-repairing; acceptable
   residual risk.
4. **No top-level `permissions:` block** on the build job — token scope is
   inherited default. Add `permissions: contents: read` top-level (the
   release job already scopes itself correctly).
5. npm dependency tree: 1 runtime dep, `npm audit` clean today, lockfile
   v3 + `npm ci`. Good posture.

**Not exposed:** no `github.event.*` interpolation into `run:` blocks
(shell injection audited clean); secrets never echoed; tag↔version check
fails closed (`:48-58`). `draft: false` means a tag push publishes
immediately with no human gate — consider `draft: true` while signing is
absent.

---

## Summary matrix

| Threat | Likelihood | Impact | Current mitigation | Remaining risk | Action |
|---|---|---|---|---|---|
| A. Malicious `.sjr` | MEDIUM | DoS + broken project | Zip-slip blocked, version gate, parameterized writes | No clamps, no rollback, silent failure | F-07/F-08/F-09 |
| B. Malicious media | MEDIUM | Renderer DoS | Script-inert render paths, CSP, taint | xlink probes, dimension bombs | F-09, data-only hrefs |
| C. Compromised renderer | LOW-MEDIUM | Contained | Allowlist intents, containment, user-mediated writes | DB deletes by design | debug seams dev-only |
| D. Malicious update metadata | LOW | Phishing-grade | HTTPS, validation, no auto-exec | Unsigned artifacts weaken the human path | F-01 |
| E. CI compromise | LOW | Full artifact compromise | lockfile, audit clean, closed fail gates | Mutable pins, unverified WiX | P0-001/P0-004, top-level permissions, draft releases |
