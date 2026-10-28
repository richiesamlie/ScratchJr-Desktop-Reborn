# Release Runbook — ScratchJr Desktop Reborn

Step-by-step procedures for cutting, validating, and publishing new releases of ScratchJr Desktop Reborn.

---

## 1. Prerequisites & Environment

- **Node.js**: Node 26+ (CI standard is Node 26, `.nvmrc` = `26`).
- **Rust**: Rust stable toolchain (for Tauri v2 desktop builds).
- **JDK & Android SDK**: JDK 17 + Android SDK API 37 (`compileSdk = 37`, `targetSdk = 36`, for Android APK/AAB builds).
- **Tooling**: Ensure `npm ci` is cleanly executed before running release steps.
- **Git**: Ensure working directory is clean on `master` branch.

---

## 2. Release Preparation Checklist (Version Lockstep)

1. **Update Changelog**:
   Update `CHANGELOG.md` and `README.md` with user-facing features, bug fixes, and security patches.

2. **Bump Version in Lockstep**:
   All version references across the multi-target workspace must be updated in lockstep:
   - `package.json` & `package-lock.json` (`npm version 2.15.0 --no-git-tag-version`)
   - `src/app/settings.json` (`"scratchJrVersion": "desktop-v2.15.0"`, synced automatically by `npm run build:renderer`)
   - `src/app/sw.js` (`CACHE_NAME = 'scratchjr-pwa-v2.15.0'`)
   - `android/app/build.gradle.kts` (`versionCode`, `versionName = "2.15.0"`)
   - `src-tauri/Cargo.toml` (`version = "2.15.0"`) & `src-tauri/tauri.conf.json` (`"version": "2.15.0"`)
   - `version.json` (`version`, `name`, `release_url`, and `downloads` URLs)
   - `docs/index.html` (direct release download URLs)

3. **Verify Local Quality Gates**:
   ```bash
   npm run build:renderer       # Bundles renderer and synchronizes settings.json
   npm run build:main           # Compiles Electron main process
   npm run build:web            # Builds dist-web/ PWA distribution
   node scripts/build-android-assets.js  # Syncs Android WebView assets
   npm test                     # Run vitest suite (42 files / 372 unit tests)
   cargo test --manifest-path src-tauri/Cargo.toml # Run Tauri Rust unit tests
   npm run typecheck            # TypeScript 7 strict check (renderer + main)
   npm run lint                 # ESLint 10 flat-config check
   node scripts/smoke-web.js    # Headless CDP web smoke test
   node scripts/smoke-test.js   # Electron desktop smoke test
   ```

4. **Commit Version Bump**:
   ```bash
   git add package.json package-lock.json src/app/settings.json src/app/sw.js android/app/build.gradle.kts src-tauri/Cargo.toml src-tauri/tauri.conf.json version.json CHANGELOG.md README.md docs/index.html
   git commit -m "Release v2.15.0"
   ```

---

## 3. Triggering the CI Release Pipeline

The GitHub Actions workflows (`.github/workflows/build-release.yml` and `.github/workflows/build-android.yml`) build and publish releases when a version tag (`v*.*.*`) is pushed:

```bash
git tag v2.15.0
git push origin master --tags
```

### What CI Executes
1. **Version Gate**: Validates that `GITHUB_REF_NAME` matches `package.json`, `src/app/settings.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and `version.json`.
2. **Quality Matrix**: Runs lint, unit tests (`npm test` and `cargo test`), typecheck, and renderer build across Ubuntu, macOS, and Windows.
3. **Artifact Creation**:
   - **Tauri Desktop (Windows x64)**: `ScratchJr-tauri-win32-x64-setup.exe`, `ScratchJr-tauri-win32-x64.msi`, and `ScratchJr-tauri-win32-x64.zip` (`npm run tauri:build && npm run package:tauri`).
   - **Electron Desktop**:
     - `ScratchJr-electron-win32-x64.zip` + `ScratchJr-electron-win32-x64.msi` (with stable UpgradeCode `{E4346E7F-98B4-4602-9FAA-5AF8C9844BA7}` and verified WiX toolset).
     - `ScratchJr-electron-darwin-x64.zip` & `ScratchJr-electron-darwin-arm64.zip`.
     - `ScratchJr-electron-linux-x64.zip` & `ScratchJr-electron-linux-arm64.zip`.
   - **Android**: `ScratchJr-android.apk` & `ScratchJr-android.aab`.
4. **Integrity Sidecars**: Calculates `.sha256` checksums for all published artifacts.
5. **Packaged Smoke Test**: Boots the packaged bundle in headless/xvfb environment to verify startup.
6. **GitHub Release**: Publishes all Tauri, Electron, and Android packages along with `.sha256` files to GitHub Releases.

---

## 4. Code Signing Configuration (Optional)

When code signing certificates are configured in repository secrets:
- **`CSC_LINK`**: Path or Base64 data of `.pfx`/`.p12` code signing certificate.
- **`CSC_KEY_PASSWORD`**: Certificate password.
- **`CSC_NAME`**: Certificate subject name (if applicable).
- **`APPLE_ID`**, **`APPLE_ID_PASSWORD`**, **`APPLE_TEAM_ID`**: For macOS notarization.
- **`ANDROID_KEYSTORE_BASE64`**, **`ANDROID_KEYSTORE_PASSWORD`**, **`ANDROID_KEY_ALIAS`**, **`ANDROID_KEY_PASSWORD`**: For Android release signing.

---

## 5. Post-Release Verification

- Check the GitHub Releases page to confirm all Tauri installers/ZIP (`ScratchJr-tauri-win32-x64-*`), all 5 Electron portable ZIPs + Windows MSI (`ScratchJr-electron-*`), Android APK/AAB (`ScratchJr-android.*`), and all `.sha256` sidecars are present.
- Download `ScratchJr-electron-win32-x64.msi` or `ScratchJr-tauri-win32-x64.msi` and perform test silent install on a clean VM:
  ```powershell
  msiexec /i ScratchJr-electron-win32-x64.msi /qn ALLUSERS=1
  ```
- Verify existing user projects in `%USERPROFILE%\Documents\ScratchJR` are intact.
