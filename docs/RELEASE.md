# Release Runbook — ScratchJr Desktop Reborn

Step-by-step procedures for cutting, validating, and publishing new releases of ScratchJr Desktop Reborn.

---

## 1. Prerequisites & Environment

- **Node.js**: Node 22+ (CI standard is Node 22 LTS).
- **Tooling**: Ensure `npm ci` is cleanly executed before running release steps.
- **Git**: Ensure working directory is clean on `master` branch.

---

## 2. Release Preparation Checklist

1. **Update Changelog**:
   Update `README.md` (`#changes-in-this-fork`) or `CHANGELOG.md` with user-facing features, bug fixes, and security patches.

2. **Bump Version**:
   Run `npm version` without creating an automatic git tag yet:
   ```bash
   npm version 1.7.6 --no-git-tag-version
   ```
   *(This updates `package.json` and `package-lock.json`.)*

3. **Verify Local Quality Gates**:
   ```bash
   npm run build:renderer   # Bundles renderer and synchronizes settings.json
   npm test                 # Run vitest suite (143+ unit tests)
   npm run typecheck        # TypeScript check
   npm run lint             # ESLint check
   npm run smoke            # In-tree smoke test
   ```

4. **Commit Version Bump**:
   ```bash
   git add package.json package-lock.json src/app/settings.json README.md
   git commit -m "Release v1.7.6"
   ```

---

## 3. Triggering the CI Release Pipeline

The GitHub Actions workflow (`.github/workflows/build-release.yml`) builds and publishes releases when a version tag (`v*.*.*`) is pushed:

```bash
git tag v1.7.6
git push origin master --tags
```

### What CI Executes
1. **Version Gate**: Validates that `GITHUB_REF_NAME` matches `package.json` version and `src/app/settings.json`.
2. **Quality Matrix**: Runs lint, test, typecheck, and renderer build across Ubuntu, macOS, and Windows.
3. **Artifact Creation**:
   - `ScratchJr-win32-x64.zip` + `ScratchJr-win32-x64.msi` (with stable UpgradeCode `{E4346E7F-98B4-4602-9FAA-5AF8C9844BA7}` and verified WiX toolset).
   - `ScratchJr-darwin-x64.zip` & `ScratchJr-darwin-arm64.zip`.
   - `ScratchJr-linux-x64.zip` & `ScratchJr-linux-arm64.zip`.
4. **Integrity Sidecars**: Calculates `.sha256` checksums for all published artifacts.
5. **Packaged Smoke Test**: Boots the packaged bundle in headless/xvfb environment to verify startup.
6. **GitHub Release**: Publishes all zips, MSIs, and `.sha256` files to GitHub Releases.

---

## 4. Code Signing Configuration (Optional)

When code signing certificates are configured in repository secrets:
- **`CSC_LINK`**: Path or Base64 data of `.pfx`/`.p12` code signing certificate.
- **`CSC_KEY_PASSWORD`**: Certificate password.
- **`APPLE_ID`**, **`APPLE_ID_PASSWORD`**, **`APPLE_TEAM_ID`**: For macOS notarization.

---

## 5. Post-Release Verification

- Check the GitHub Releases page to confirm all 5 portable zip archives, the Windows MSI, and all `.sha256` sidecars are present.
- Download `ScratchJr-win32-x64.msi` and perform test silent install on a clean VM:
  ```powershell
  msiexec /i ScratchJr-win32-x64.msi /qn ALLUSERS=1
  ```
- Verify existing user projects in `%USERPROFILE%\Documents\ScratchJR` are intact.
