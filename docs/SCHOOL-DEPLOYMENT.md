# School / Fleet Deployment Guide — ScratchJr Desktop Reborn

Verified against `v2.15.0` packaging (`scripts/build-msi.js`, `src-tauri/tauri.conf.json`, `.github/workflows/build-release.yml`, and `tests/unit/audit-remediation.test.js`).

---

## 1. What you distribute

ScratchJr Reborn ships two desktop editions alongside Web/PWA and Android, all sharing 100% `.sjr` project compatibility and the same `Documents\ScratchJR` database layout on desktop:

| Artifact | Edition | Nature | Silent install | Needs admin | Status |
|---|---|---|---|---|---|
| `ScratchJr-electron-win32-x64.msi` | Electron 45 | Per-machine Windows MSI (`x64`) | `msiexec /i /qn ALLUSERS=1` | Yes | **Production-ready** (stable `UpgradeCode` & cleanup action) |
| `ScratchJr-tauri-win32-x64.msi` | Tauri v2 (Rust) | Lightweight Windows MSI (`x64`, ~30 MB RAM, uses WebView2) | `msiexec /i /qn` | Yes | **Production-ready** |
| `ScratchJr-tauri-win32-x64-setup.exe` | Tauri v2 (Rust) | NSIS Windows Installer (`x64`) | `/S` | Optional | **Production-ready** |
| `ScratchJr-electron-win32-x64.zip` / `ScratchJr-tauri-win32-x64.zip` | Electron / Tauri | Portable Windows ZIP (unzip → run) | n/a (no install) | No | Works; zero-install offline option |
| `ScratchJr-electron-darwin-x64.zip` / `arm64.zip` | Electron 45 | macOS `.app` in ZIP (Intel & Apple Silicon) | n/a | No | Works |
| `ScratchJr-electron-linux-x64.zip` / `arm64.zip` | Electron 45 | Linux portable (`x64` & `arm64`) | n/a | No | Works |
| `ScratchJr-android.apk` | Android (Kotlin) | Universal APK (Android 7.0+ / API 24–36) | `adb install` / MDM | No | Works on tablets, phones & Chromebooks |

Every release ships `.sha256` sidecar files for hash pinning in MDM tools (Intune, SCCM, Jamf, Ansible).

## 2. Where user data lives (predictable, per-user)

```text
%USERPROFILE%\Documents\ScratchJR\        (Windows — shared by both Electron & Tauri editions)
~/Documents/ScratchJR/                     (macOS / Linux)
├── scratchjr.sqllite        project DB (PROJECTS, USERSHAPES, USERBKGS)
├── scratchjr.sqllite.bak    rolling backup (integrity-verified before restore)
└── media/                   character, background, thumbnail, and sound assets
```

Plus small per-user application state under `%APPDATA%\ScratchJr` (window bounds, `debug.log` with 5 MB rotation, update ETag cache).

- **No `Program Files` writes at runtime:** Standard (non-admin) student accounts are fully supported after installation. All data paths resolve from the user's `Documents` and `AppData` directories (`src/main/data-store.ts`, `src-tauri/src/db.rs`).
- **Uninstall data preservation:** Standard MSI uninstall (`msiexec /x ... /qn`) preserves `Documents\ScratchJR` by default so student work is never accidentally wiped during maintenance.
- **Optional full data cleanup on uninstall:** Pass `REMOVE_DATABASE=1` during MSI uninstall (wired via `src/installer/cleanup-action.wxs` in `scripts/build-msi.js`) to remove the user's `Documents\ScratchJR` directory.

## 3. Upgrade behavior (Windows MSI)

The Electron Windows MSI (`ScratchJr-electron-win32-x64.msi`) is built by `scripts/build-msi.js` with:
- **Stable `UpgradeCode`:** `{E4346E7F-98B4-4602-9FAA-5AF8C9844BA7}`
- **Architecture:** `x64`
- **Install mode:** `perMachine` (`C:\Program Files\ScratchJr`)

Consequences for fleet management:
- **In-place upgrades:** Installing a newer MSI version over an older one automatically replaces the previous version cleanly in `Program Files` and updates the single entry in *Programs and Features*.
- **Same-version repair:** Re-running the same MSI repairs the installation.
- **Student data untouched:** Upgrades never modify or delete `%USERPROFILE%\Documents\ScratchJR`.

## 4. Silent install / uninstall (Windows)

```powershell
# Install Electron MSI (per-machine, elevated, silent):
msiexec /i ScratchJr-electron-win32-x64.msi /qn ALLUSERS=1

# Install Tauri MSI (lightweight WebView2 edition, elevated, silent):
msiexec /i ScratchJr-tauri-win32-x64.msi /qn

# Install with a custom target directory:
msiexec /i ScratchJr-electron-win32-x64.msi /qn INSTALLDIR="C:\Program Files\ScratchJr"

# Uninstall (student projects in Documents\ScratchJR preserved):
msiexec /x ScratchJr-electron-win32-x64.msi /qn

# Uninstall and delete Documents\ScratchJR database folder:
msiexec /x ScratchJr-electron-win32-x64.msi /qn REMOVE_DATABASE=1

# Detect installed version (for inventory scripts):
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall /s /f ScratchJr
```

## 5. Deployment channels

### Microsoft Intune (Windows)
- **Line-of-business / Win32 app**: Wrap `ScratchJr-electron-win32-x64.msi` (or `ScratchJr-tauri-win32-x64.msi`) with `IntuneWinAppUtil`.
- **Install command**: `msiexec /i ScratchJr-electron-win32-x64.msi /qn ALLUSERS=1`
- **Uninstall command**: `msiexec /x {ProductCode} /qn`
- **Detection rule**: MSI `UpgradeCode` `{E4346E7F-98B4-4602-9FAA-5AF8C9844BA7}` or file existence of `C:\Program Files\ScratchJr\ScratchJr.exe`.

### Group Policy (GPO) / SCCM
- Deploy `ScratchJr-electron-win32-x64.msi` as a Computer-assigned software package. Subsequent releases with the same `UpgradeCode` can be configured to supersede previous packages automatically.

### Offline / restricted classroom networks
- The app is **100% functional offline**. All built-in characters, backgrounds, sample projects, 16 curated sounds, and 12 localizations are bundled locally.
- The Electron edition bundles Chromium and Node.js completely self-contained. The Tauri edition uses the built-in Windows 10/11 Evergreen WebView2 runtime.

## 6. Version pinning & update suppression

- The app's updater is **notification-only**: it never downloads or executes installers automatically (`src/main.ts`, `src/main/updater.ts`).
- **Command-line flag**: Launch ScratchJr with `--no-update-check` (or `--disable-update-check`) to completely suppress the automatic 3-second startup update check, eliminate all outbound update network calls, and remove the "Check for Updates..." item from the File menu.
  - Example in a Linux desktop launcher (`.desktop` via Ansible):
    ```ini
    Exec=/usr/bin/scratchjr --no-update-check %U
    ```
  - Example in a Windows shortcut target:
    ```text
    "C:\Program Files\ScratchJr\ScratchJr.exe" --no-update-check
    ```
- **Environment variable**: Set `SCRATCHJR_NO_UPDATE_CHECK=1` (or `SCRATCHJR_DISABLE_UPDATE_CHECK=1`) via Group Policy Preferences, system environment variables, or `/etc/environment` to enforce update suppression fleet-wide without modifying shortcuts.
- On offline or firewall-restricted student VLANs, update checks also fail silently without disrupting the application.

## 7. Multi-user / shared-lab machines

- Data is **per-OS-user** under each student profile's `Documents\ScratchJR` — students logging into the same lab machine with their own accounts never overwrite each other's projects.
- **Roaming profiles / Folder Redirection**: `Documents\ScratchJR` works seamlessly with Active Directory Folder Redirection and OneDrive Known Folder Move.
- **Project sharing & legacy migration**: Students and teachers share projects via `.sjr` files (drag-and-drop onto the lobby, `File > Import Project (.sjr)...`, or `Ctrl+O`). Legacy JustSch SQLite databases (`.sqllite`, `.sqlite`, `.db`) can also be imported directly in 1 click.

## 8. Backup & recovery (what IT can rely on)

- Every database save writes to a temporary file, verifies integrity, rotates `.bak`, and atomically renames (`src/main/database.ts`, `src-tauri/src/db.rs`).
- On launch, a corrupted database is automatically detected via `PRAGMA integrity_check` and restored from the verified `scratchjr.sqllite.bak` backup.
- A manual backup file named `scratchjr.sqllite.restore` placed in `Documents\ScratchJR` can be restored by the teacher or student via `File > Restore projects`.
- Migrating to new PCs: copy `Documents\ScratchJR` — that folder contains all user projects, custom drawings, and recorded sounds.

## 9. Security posture IT should know

- **Sandboxed renderer**: `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, strict zero-inline CSP (`script-src 'self' 'wasm-unsafe-eval'`), and origin-locked camera/mic permissions (`src/main/window-lifecycle.ts`).
- **No arbitrary SQL or file access**: Renderer communicates exclusively through allowlisted database intents (`src/lib/db-intents.ts`, `src-tauri/src/db.rs`) and basename-confined media filenames.
- **Sanitized imports**: `.sjr` archives enforce size/entry caps (`50 MB` compressed / `2000` entries / `200 MB` uncompressed) and basename regex checks; SVG artwork is scrubbed by `src/app/src/utils/svgSanitizer.ts`.
- **No telemetry, no accounts, no cloud lock-in**: Zero analytics or student tracking. See [`docs/THREAT-MODEL.md`](./THREAT-MODEL.md) for the full threat matrix.

## 10. Recommended rollout checklist

1. Choose your edition: `ScratchJr-electron-win32-x64.msi` (self-contained Chromium) or `ScratchJr-tauri-win32-x64.msi` (lightweight ~30 MB RAM via Windows WebView2).
2. Verify the `.sha256` checksum sidecar and pin the hash in your MDM package definition.
3. Set `SCRATCHJR_NO_UPDATE_CHECK=1` in your fleet environment variables (or pass `--no-update-check` in managed shortcuts) if you manage updates centrally.
4. Pilot on 5–30 lab machines: silent install → standard student login → create a project → record sound → save → close → reopen.
5. Verify in-place MSI upgrade on a pilot machine before rolling out a new version fleet-wide.
6. Include `Documents\ScratchJR` in your existing student `Documents` backup or folder-redirection policy.
