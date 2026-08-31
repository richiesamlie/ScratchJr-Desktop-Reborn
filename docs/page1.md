# ScratchJr Desktop Reborn — Architecture & Infrastructure Audit Brief

Repository:
https://github.com/richiesamlie/ScratchJr-Desktop-Reborn

Date: 2026-08-30

## Purpose

This document is a handoff brief for an engineering agent to continue a deeper architecture, infrastructure, security, deployment, and maintainability audit of ScratchJr Desktop Reborn.

The goal is **not to blindly refactor**. First verify the current implementation, identify concrete risks, then propose and implement changes in priority order with tests.

---

# 1. Current Architecture — High-Level

The current application broadly follows:

```text
Electron Main Process
    |
    +-- Window lifecycle
    +-- IPC handlers
    +-- Database / persistence
    +-- Media filesystem
    +-- Updater
    |
    v
Preload / contextBridge
    |
    v
Renderer
    |
    +-- ScratchJr UI
    +-- Block engine
    +-- Paint editor
    +-- Project UI
```

The architecture is already substantially hardened compared with a basic Electron application.

Important existing design decisions include:

- `nodeIntegration: false`
- `contextIsolation: true`
- renderer sandboxing
- controlled `contextBridge` APIs
- structured database intents instead of renderer-supplied SQL
- allowlisted database tables/columns
- parameterized SQL
- atomic persistence
- backup/recovery
- integrity checks
- file-backed media
- path containment checks
- renderer code splitting
- strict TypeScript
- automated tests
- cross-platform CI builds

Do not remove these protections during refactoring.

---

# 2. Priority Findings From Initial Audit

## P0 — Verify / Fix Immediately

### P0.1 Renderer build target mismatch

File:

```text
scripts/build-renderer.js
```

Current configuration reportedly contains:

```js
target: ['chrome134']
```

The comment states that Electron 43 ships Chromium 134.

This should be verified against the exact Electron version actually installed in `package.json` and the Electron release metadata.

Initial audit indicates Electron 43 uses a newer Chromium version than the comment claims.

### Required action

1. Verify exact Electron version.
2. Verify bundled Chromium version.
3. Verify esbuild target.
4. Correct stale comments.
5. Decide whether explicit Chromium targeting is appropriate or whether the target should be generated/centralized from the Electron version.
6. Run the full test + package + smoke-test matrix.

Do not change the target blindly.

---

## P0.2 Electron / Node / build-tool compatibility

Verify the complete compatibility chain:

```text
Electron
Node
npm
esbuild
Electron Forge
native dependencies
sql.js
packaging tools
WiX
```

The CI currently installs Node 22 LTS.

The repository uses Electron 43.x.

Check whether all declared and transitive dependencies are officially compatible with this combination.

Also check whether the runtime Node version embedded in Electron differs from the Node version used by the build process. Do not assume they are interchangeable.

---

## P0.3 Security audit of every IPC endpoint

The preload exposes a relatively broad API surface, including database, filesystem, media, audio, settings and export operations.

Audit every IPC handler for:

- input validation
- authorization boundaries
- path traversal
- arbitrary file read
- arbitrary file write
- arbitrary file delete
- unintended filesystem access
- malformed IPC payloads
- type confusion
- resource exhaustion
- denial-of-service vectors
- renderer-controlled filenames
- renderer-controlled extensions
- renderer-controlled URLs
- unexpected object/prototype inputs

The existing structured DB intent design should be preserved.

---

## P0.4 Dependency vulnerability audit

Add or verify CI checks for:

```text
npm audit
OSV / dependency vulnerability scanning
Electron security advisories
transitive dependency review
```

Do not automatically upgrade everything.

Classify vulnerabilities as:

- exploitable in this application
- theoretically relevant
- development-only
- false positive / not applicable
- requires upgrade

---

## P0.5 Code signing and artifact trust

The release workflow contains support for signing secrets, but verify whether signing is actually occurring in production releases.

Audit:

### Windows

- Authenticode signing
- SmartScreen reputation
- MSI signing
- ZIP/portable executable signing
- timestamping
- certificate rotation process

### macOS

- Developer ID Application
- Developer ID Installer if applicable
- notarization
- stapling
- Gatekeeper behavior on clean machines

### Linux

- package integrity
- checksum publication
- whether future AppImage/deb/rpm distribution is required

Checksums already exist; retain them.

---

# 3. Architecture Review

## 3.1 IPC layer

Current IPC API is fairly broad.

Investigate whether it should be grouped by domain:

```text
window.scratchjr.projects
window.scratchjr.media
window.scratchjr.database
window.scratchjr.export
window.scratchjr.system
```

rather than exposing many low-level functions such as:

```text
io_getfile
io_setfile
io_remove
io_getmedia
io_setmedia
...
```

This is primarily a maintainability concern, not necessarily a security flaw.

Do not refactor unless the current dependency graph supports it safely.

---

## 3.2 Main process responsibility

Review whether `ipc-handlers.ts` is becoming a central "god module".

Potential target structure:

```text
src/main/
├── application/
├── ipc/
│   ├── database-ipc.ts
│   ├── media-ipc.ts
│   ├── project-ipc.ts
│   ├── export-ipc.ts
│   └── system-ipc.ts
├── persistence/
│   ├── database.ts
│   ├── project-store.ts
│   └── media-store.ts
├── security/
│   └── navigation-policy.ts
└── platform/
    ├── updater.ts
    └── window.ts
```

Again: validate the current code before changing it.

---

# 4. Persistence / Database Audit

The current persistence architecture is a strong area.

Verify:

- atomic writes
- temporary-file handling
- rename semantics on Windows/macOS/Linux
- backup lifecycle
- corruption recovery
- `PRAGMA integrity_check`
- shutdown flush
- debounce behavior
- concurrent save protection
- crash during write
- crash during backup creation
- disk-full behavior
- permission errors
- read-only filesystem behavior
- database migration rollback
- migration idempotency

Test scenarios:

```text
Create project
    ↓
Save
    ↓
Kill process during save
    ↓
Restart
    ↓
Recover
```

Also test:

```text
Corrupt main DB
Healthy .bak
    ↓
automatic recovery
```

and:

```text
Corrupt main DB
Corrupt backup
    ↓
safe failure + useful user message
```

---

# 5. Media Storage Audit

Current architecture stores media as files instead of large base64 blobs in SQLite.

Verify:

```text
Documents/ScratchJR/
├── database
├── database.bak
└── media/
```

Audit:

- orphan media
- duplicate media
- filename collisions
- malicious extensions
- MIME/type mismatch
- SVG security
- oversized image files
- decompression bombs
- cache eviction
- cache consistency
- database/media transaction consistency
- migration from legacy DBs
- interrupted migration
- rollback after migration failure
- disk-full conditions

Pay particular attention to SVG because imported SVG content can have a larger attack surface than PNG/JPEG.

---

# 6. File Path Security

The repository contains a path containment utility.

Verify it against:

```text
../
../../
absolute Unix paths
absolute Windows paths
Windows UNC paths
drive-relative paths
mixed separators
URL-like paths
symlinks
junctions
case-insensitive filesystem behavior
NTFS reparse points
```

Important question:

> Does lexical path containment remain sufficient when symlinks/junctions can redirect a supposedly safe path outside the application/data root?

If not, determine where canonicalization / realpath checks are appropriate.

Do not introduce `realpath()` everywhere without considering files that do not yet exist.

---

# 7. Update System

Current updater checks GitHub Releases and uses ETag caching.

Verify:

- version comparison
- prerelease behavior
- release-channel strategy
- GitHub API failures
- rate limiting
- malformed release JSON
- malicious release metadata
- asset selection
- architecture selection
- platform selection
- HTTPS enforcement
- redirect behavior
- update authenticity
- checksum/signature verification
- whether downloaded files are ever executed automatically

Current architecture appears closer to:

```text
Check
  ↓
Notify
  ↓
Open/download release
```

than to a fully automated updater.

That may be desirable for school deployments.

Do not introduce silent auto-update without considering school IT requirements.

---

# 8. School / Fleet Deployment

This is a major future priority.

The application already has MSI packaging and CLI language support.

Investigate deployment requirements for:

```text
30 PCs
100 PCs
500+ PCs
```

Potential requirements:

- silent MSI install
- silent uninstall
- machine-wide installation
- user-specific data isolation
- Group Policy deployment
- Microsoft Intune compatibility
- version pinning
- approved release channel
- offline installer
- internal software repository
- rollback
- predictable user-data location
- no admin privileges for normal use
- standard Windows user support
- first-run behavior
- proxy/firewall environments

Produce a dedicated:

```text
docs/SCHOOL-DEPLOYMENT.md
```

if appropriate.

---

# 9. CI/CD Review

Current workflow already performs:

```text
checkout
Node setup
npm ci
version verification
lint
test
typecheck
build
package
artifact verification
smoke testing
checksums
GitHub Release
```

This is good.

Consider adding:

```text
dependency security scan
SBOM generation
artifact metadata validation
code-signing verification
macOS notarization verification
clean-machine install tests
upgrade-from-previous-version tests
rollback tests
```

Consider reproducibility:

```text
same source + same lockfile
        ↓
deterministic / explainable artifacts
```

Do not claim builds are reproducible until verified.

---

# 10. Testing Strategy

The repository reports a substantial automated test suite.

Maintain the current unit/integration coverage and add E2E coverage where valuable.

Recommended test pyramid:

```text
              E2E
             /               /            Integration
          /              /              Unit tests
```

Critical E2E workflows:

1. Fresh install
2. First launch
3. Create project
4. Create multiple pages
5. Add sprite
6. Add blocks
7. Save
8. Close
9. Reopen
10. Verify project
11. Export `.sjr`
12. Import `.sjr`
13. Media import
14. Media migration
15. Undo/redo
16. Database corruption recovery
17. Upgrade from previous release
18. Uninstall
19. Reinstall
20. Portable build

Test at least:

```text
Windows x64
macOS ARM64
Linux x64
```

where practical.

---

# 11. Performance Audit

Measure rather than speculate.

Investigate:

- startup time
- renderer parse/compile time
- bundle sizes
- code-splitting effectiveness
- memory after long sessions
- memory after many projects
- image-heavy projects
- large `.sjr` files
- paint editor memory
- database save latency
- media import latency
- project load latency
- CPU usage while idle
- CPU usage during animation
- cache hit/miss ratio

Define practical budgets, for example:

```text
Cold startup
Project open
Project save
Media import
Memory after 30 minutes
```

Choose thresholds based on actual school hardware.

---

# 12. Electron Version Strategy

The repository currently uses Electron 43.x.

As of the audit date, Electron 44 is already available.

Do not upgrade simply because a newer major exists.

Instead:

1. Confirm Electron 43 security/support status.
2. Review Electron 44 breaking changes.
3. Test ScratchJr rendering.
4. Test input events.
5. Test audio.
6. Test filesystem APIs.
7. Test packaging.
8. Test Windows MSI.
9. Test macOS.
10. Test Linux.
11. Compare startup/memory behavior.

Then decide whether to upgrade.

---

# 13. Recommended Refactoring Priority

## P0 — Security / correctness

```text
[ ] Verify Electron ↔ Chromium ↔ esbuild target
[ ] Audit every IPC handler
[ ] Audit filesystem operations
[ ] Audit SVG/media import
[ ] Dependency vulnerability scanning
[ ] Verify release signing
[ ] Verify artifact integrity
```

## P1 — Production / school deployment

```text
[ ] Silent MSI installation test
[ ] Uninstall test
[ ] Upgrade test
[ ] Rollback strategy
[ ] Offline installer
[ ] School IT deployment documentation
[ ] Version pinning strategy
[ ] Proxy/firewall compatibility
```

## P2 — Maintainability

```text
[ ] Domain-based IPC organization
[ ] Separate persistence stores
[ ] Formal IPC contracts
[ ] Structured error model
[ ] Better logging
[ ] Performance instrumentation
```

## P3 — Long-term

```text
[ ] Electron upgrade
[ ] SBOM
[ ] Reproducible builds
[ ] Enterprise update channel
[ ] Improved telemetry/crash diagnostics if privacy model permits
```

---

# 14. Important Constraints

The application is intended for children and school environments.

Therefore:

- Avoid unnecessary telemetry.
- Avoid collecting student-identifying information.
- Do not add cloud dependency unless explicitly required.
- Prefer local-first operation.
- Assume machines may have restricted internet access.
- Assume users may not have administrator privileges.
- Treat project files as potentially untrusted input.
- Treat imported media as potentially untrusted input.
- Prefer deterministic and recoverable behavior over cleverness.

---

# 15. Desired Agent Output

The engineering agent should produce:

## A. Audit report

```text
docs/ARCHITECTURE-AUDIT.md
```

Containing:

- current architecture
- dependency graph
- security findings
- infrastructure findings
- deployment findings
- performance findings
- testing gaps
- technical debt
- severity
- evidence
- recommended fix

Use severity:

```text
CRITICAL
HIGH
MEDIUM
LOW
INFO
```

Do not label something HIGH without concrete evidence.

---

## B. Architecture diagram

Create a Mermaid diagram if appropriate:

```text
flowchart TD
    Renderer --> Preload
    Preload --> IPC
    IPC --> Main
    Main --> Database
    Main --> Media
    Main --> Updater
```

Expand it based on the real repository.

---

## C. Prioritized implementation plan

Use:

```text
Issue
File(s)
Risk
Recommended change
Test required
Regression risk
Priority
```

Example:

| Priority | Area | Action |
|---|---|---|
| P0 | Build | Verify Chromium/esbuild target |
| P0 | Security | Audit IPC endpoints |
| P0 | Supply chain | Add dependency scanning |
| P0 | Distribution | Verify code signing |
| P1 | Deployment | Validate silent MSI |
| P1 | Recovery | Test upgrade/rollback |
| P2 | Architecture | Refactor IPC domains |
| P2 | Observability | Add structured diagnostics |
| P3 | Runtime | Evaluate Electron upgrade |

---

# 16. Working Principle

Do not refactor for aesthetics.

For every proposed change answer:

```text
What problem does this solve?
What evidence shows the problem exists?
What is the security/correctness/performance impact?
What files are affected?
What tests prove the change works?
What could regress?
Can the change be rolled back?
```

The preferred outcome is:

```text
secure
local-first
recoverable
school-deployable
maintainable
cross-platform
well-tested
```

rather than simply "more modern".

---

# 17. Initial Overall Assessment

Initial review suggests approximately:

| Area | Initial assessment |
|---|---:|
| Overall architecture | 8.5/10 |
| Electron security | 8.5/10 |
| IPC design | 8/10 |
| Database persistence | 9/10 |
| Media architecture | 8.5/10 |
| File security | 8.5/10 |
| CI/CD | 8.5/10 |
| Testing | 8/10 |
| Maintainability | 7.5/10 |
| Fleet deployment | 6/10 |
| Update architecture | 6.5/10 |
| Signing/distribution | 6/10 |

These are **initial review scores, not final audit findings**. The agent should validate them against the actual repository.

---

# 18. Repository Reference

Official repository:

https://github.com/richiesamlie/ScratchJr-Desktop-Reborn

Key areas already identified:

```text
.github/workflows/build-release.yml
scripts/build-renderer.js
src/lib/db-intents.ts
src/lib/path-utils.ts
src/main/updater.ts
src/main/ipc-handlers.ts
src/main/database.ts
src/main/data-store.ts
src/main/main.ts
src/app/preload.js
package.json
README.md
```

---

# Final Instruction to Agent

Perform a **real repository audit**, not a generic Electron checklist.

Inspect the implementation, trace data flow, inspect dependency versions, inspect IPC boundaries, inspect filesystem operations, inspect CI/CD, and run tests where the environment allows.

For every significant finding, provide concrete repository evidence.

**Do not make broad architectural changes until the current implementation and dependency graph have been verified.**

Start with P0 correctness/security findings, then move toward school fleet deployment and maintainability.
