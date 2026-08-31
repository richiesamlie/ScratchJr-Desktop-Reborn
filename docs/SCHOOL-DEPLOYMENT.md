# School / Fleet Deployment Guide — ScratchJr Desktop Reborn

Audited: 2026-08-31, against v1.7.5 source (`e20a97a`). This guide states
what is **verified from the packaging code**, not what the README promises.
Statuses reflect the current release; the audit's P0 fixes (stable MSI
UpgradeCode, signing) change several of them — noted inline.

---

## 1. What you distribute

| Artifact | Nature | Silent install | Needs admin | Status |
|---|---|---|---|---|
| `ScratchJr-win32-x64.msi` | Per-machine MSI installer | `msiexec /i /qn` | Yes | Works, but **upgrades are broken today** (§3) |
| `ScratchJr-win32-x64.zip` | Portable (unzip → run) | n/a (no install) | No | Works; good offline fallback |
| macOS zips (x64/arm64) | Portable .app in zip | n/a | No | Works; unsigned (Gatekeeper friction) |
| Linux zips (x64/arm64) | Portable | n/a | No | Works |

Every release ships `.sha256` sidecar files for hash pinning in MDM tools.

## 2. Where user data lives (predictable, per-user)

```
%USERPROFILE%\Documents\ScratchJR\        (Windows)
~/Documents/ScratchJR/                     (macOS/Linux)
├── scratchjr.sqllite        project DB
├── scratchjr.sqllite.bak    rolling backup (verified-before-use)
└── media/                   character/background/sound assets
```

Plus per-user Electron state under `%APPDATA%\ScratchJr` (window state, log,
update ETag cache). **No Program Files writes at runtime; standard (non-admin)
users are fully supported after install.** Verified: all main-process paths
come from `app.getPath('documents')`/`userData` (`src/main/data-store.ts:92-99`).

MSI uninstall preserves `Documents/ScratchJR` by default (data is outside the
install dir). Note: the README's `REMOVE_DATABASE=1` uninstall cleanup option
is **wired in `forge.config.js` but absent from the actually-shipped MSI**
(audit F-02) — treat that option as not available until the fix lands.

## 3. Upgrade behavior — read before any fleet rollout

**Current state (verified from `scripts/build-msi.js` + `electron-wix-msi`
defaults): the shipped MSI is generated with a *random UpgradeCode per
build* and declares x86.** Consequence: installing a newer version over an
older one does **not** upgrade — it installs *alongside*. For a fleet this
means:

- v1.7.5 → v1.7.6 via MDM leaves **two** entries in Programs and Features
  and two install dirs.
- There is no reliable rollback either, since versions don't chain.

**Do not scale MSI distribution past a handful of machines until audit
P0-002 (stable UpgradeCode + x64 arch + cleanup action) is released.** After
that fix: major upgrades replace cleanly, same-version reinstalls repair,
downgrades are blocked by MSI rules (a deliberate safe default for
classrooms), and the rollback procedure is "reinstall the previous MSI."

The portable zip is unaffected: it has no installer state, so "upgrade"
means deploying the new zip and removing the old one — but each user's data
stays in `Documents/ScratchJR` untouched.

## 4. Silent install / uninstall (Windows)

```text
Install (per-machine, elevated):
  msiexec /i ScratchJr-win32-x64.msi /qn ALLUSERS=1

Install with a target dir:
  msiexec /i ScratchJr-win32-x64.msi /qn INSTALLDIR="C:\Program Files\ScratchJr"

Uninstall (data preserved):
  msiexec /x ScratchJr-win32-x64.msi /qn

Detect installed version (for inventory scripts):
  reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall /s /f ScratchJr
```

The MSI declares `defaultInstallMode: perMachine` (electron-wix-msi default
with `chooseDirectory` UI; `/qn` skips the dialog). App run itself never
needs elevation.

## 5. Deployment channels

### Microsoft Intune (Windows)
- **Line-of-business app**: add the MSI as `appType: win32` (wrap with
  `IntuneWinAppUtil`), install command `msiexec /i ScratchJr-win32-x64.msi /qn`,
  uninstall via product codes, detection rule = MSI product code or the
  `ScratchJr.exe` path under `Program Files\ScratchJr`.
- Wait for P0-002 before using Intune's *replace* uninstall behavior; with
  the current random UpgradeCode, set the previous version's uninstall
  command explicitly.

### Group Policy / SCCM
- Standard MSI deployment works (per-machine assignment). Same caveat as
  above for superseding versions.

### Offline / restricted networks
- The app is **fully functional offline**. The only network call is a
  GitHub releases check 3 seconds after launch (`src/main/main.ts:134-136`)
  that fails silently on blocked networks. Safe to firewall
  `api.github.com` on student VLANs.
- The MSI/zips are self-contained (Electron runtime bundled); no runtime
  downloads, no codec packs, no dependencies.

## 6. Version pinning & update suppression

- The app's updater is **notification-only**: a dialog with
  Download/View/Cancel; it never downloads or installs anything by itself
  (`src/main/main.ts:49-88`). Users can simply not click.
- There is currently **no policy/registry key to disable the check**. If you
  must suppress it: block `api.github.com` (and `github.com` for the
  dialog's links) at the firewall, or vendor a build with `REPO_OWNER`
  pointed at an internal mirror. A `--no-update-check` flag or
  `DisableUpdateCheck` policy would be a small upstream contribution to
  request.

## 7. Multi-user / shared-lab machines

- Data is **per-Windows-user** under each profile's Documents — two students
  on one machine never see each other's projects.
- Roaming profiles: `Documents\ScratchJR` typically roams with the profile
  (redirected folders work); `%APPDATA%\ScratchJr` state is small and
  regenerable.
- No per-machine shared-project feature exists (by design, child-safety
  oriented). Sharing between students is via `.sjr` files.

## 8. Backup & recovery (what IT can rely on)

- Every database save rotates a `.bak` first. On open, a corrupt DB is
  detected via `PRAGMA integrity_check` and auto-recovered from the
  *verified* backup (`src/main/database.ts:113-169`). Teachers don't need to
  do anything.
- A `.restore` file placed in the ScratchJR folder is offered as
  "Restore projects" under the File menu.
- If both DB and backup are corrupt, the app silently starts a fresh DB
  (audit F-16) — for fleet use, include `Documents\ScratchJR` in your
  standard folder-redirection/backup scope.
- Migrating to new PCs: copy `Documents\ScratchJR` — that's the whole user
  footprint.

## 9. Security posture IT should know

- Renderer is sandboxed; the app writes only inside its own data paths
  (verified against all IPC channels — see `docs/THREAT-MODEL.md`).
- No telemetry, no accounts, no cloud dependency. One optional HTTPS check
  to `api.github.com`.
- **Artifacts are currently unsigned** (audit F-01): expect SmartScreen
  warnings on manual installs. For MDM/GPO deployment this is friction
  rather than a blocker (hash-pin the `.sha256` values), but report the
  gap to the maintainer — it is their top distribution priority.
- Projects and imported media are untrusted-by-design inputs that the app
  confines (no code execution path exists from SVG/project files; verified
  in the threat model).

## 10. Recommended rollout checklist

1. Wait for a release containing audit P0-002 (MSI identity fix) — or use
   the portable zip meanwhile.
2. Hash-pin the version's `.sha256` in your MDM package definition.
3. Pilot on 5-30 machines: silent install → standard-user login → create a
   project → save → close → reopen.
4. Verify upgrade on the pilot before broad push (post-P0-002: v1 → v2
   should replace in place; verify with one machine first).
5. Firewall `api.github.com` on student networks if update dialogs are
   unwanted.
6. Include `Documents\ScratchJR` in existing Documents
   backup/redirection policy.
7. Keep the previous installer archived for rollback; the MSI blocks
   downgrades by design (roll forward or reinstall).
