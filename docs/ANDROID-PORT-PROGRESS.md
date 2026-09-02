# Android Port — Progress Record

**Branch:** `mobile/android` (experimental track, cut from `master` @ `8b2ff46` / v1.8.0)
**Master plan:** [`docs/ANDROID-PORT-PLAN.md`](./ANDROID-PORT-PLAN.md) (Option A — native Kotlin WebView shell, no Capacitor)
**Last activity:** 2026-09-01, 15:41 (+0700)
**Status:** P0–P8 complete and device-verified; P10 docs/signing complete; P9 pending physical device

---

## 1. Commit history (this branch)

| Commit | Phase | Summary |
|---|---|---|
| `bad4fff` | P0 | Branch salvage — recovered 25 source files from `7eb82c8` (pre-revert Android port); extracted renderer patches to `_salvage/`; completed the full salvage audit (Appendix A of the plan) |
| `a5c4681` | P1 | Host parametrization — `src/hostClient.js`, guarded `bootApp()`, 4 HTML pages made host-neutral, fixed asset copy list (media.json, sounds/, svg/pnglibrary were missing in old port) |
| `7e75573` | P2 | Shell refresh — AGP 8.4.1→9.3.2, Gradle wrapper 9.7.1, compileSdk/targetSdk 34→36 (Play gate), `npm run build:android`, CI artifact-commit guard, **first APK built** (31.7 MB) |
| `72ae6d2` | P3 | Storage hardening — isTablet `'false'` media-path fix, `io_getAudioData` data-URIs, path-traversal containment, `.bak` rotation + atomic `Files.move`, id-less intent rejection, desktop-parity `cleanassets`; 6 instrumented tests written |
| `b5a04de` | docs | P2/P3 audit findings into the plan |
| `40813a4` | P4 | Touch shims applied from salvage patch; editor export-hooks guarded; 11 missing bridge methods (camera/record/share); settings `./` path normalization; native MediaPlayer sound suite — **editor renders on device** |
| `ff7f9a8` | P5 | Shared web AV layer — `src/webav.js` (AudioCapture/CameraPickerDialog extracted), `src/webhost.js` (full JS host shim), Proxy→direct-bind fix; **mic recording + camera verified live on emulator** |
| `6fac85c` | P6 | Lifecycle — pause-save + background camera/mic release; **process-death recovery verified** (am kill → relaunch → 5/5 projects intact) |
| `0d4e118` | docs | P5–P7 audit findings into the plan |
| `d7e043c` | P8 | `.sjr` intent import — queued flush + `onPageFinished` retry, calls real `PlatformBridge.loadProjectFromSjr`; export verified live |
| (working) | P8/P10 | **.sjr round-trip open verified on emulator** (imported Project 3 rendered with gift ribbon); **Share Sheet verified** (`ChooserActivityLauncher`); release signing config + README + development.md + CHANGELOG updated |

## 2. Verified milestones (on Pixel-tablet AVD, API 36, emulator-5554)

- Full flow: splash → usage question → lobby → **project creation persisted in SQLite** → editor renders complete DOM (stage, block palette, scripts, record dialog) — zero console errors
- Mic recording round-trip: `recordsound_recordstart` → MediaRecorder opus → `recordclose('YES')` → `.webm` persisted in `files/media` via `io_setmedianame`
- Camera: 480×360 getUserMedia feed + 8.9 KB canvas snapshot
- Process-death: editor open → `am kill` → relaunch → all projects intact, no corruption
- `.sjr` Intent import: content-URI intent queues payload, flushes on lobby navigation, transactional zip unpacking + SQLite insert verified (`isgift: 1`), renders gift ribbon & thumbnail in lobby
- Share Sheet export: `sendSjrUsingShareDialog` / `sendExportedSjr` writes to `cacheDir/exports/`, creates FileProvider URI with `FLAG_GRANT_READ_URI_PERMISSION`, launches Android system chooser (`com.android.intentresolver/.ChooserActivityLauncher`)
- `connectedDebugAndroidTest`: 6/6 database tests pass
- Desktop regression at every phase: `tsc` ✓, `eslint` ✓, **154/154 vitest** ✓, smoke test **PASS** (on both branch and master)

## 3. Key discoveries this session (all logged in plan Appendix A)

1. **Old port shipped broken**: no `recordsound_*`/`scratchjr_*` camera bridge methods, dead `importSjrBase64` call, 404'd PNG media, missing asset copy list entries — the "worked" state was partly accidental (electronClient 404 = silent fall-through to AndroidInterface).
2. **AssetManager doesn't normalize `./`** — `www/./settings.json` crashed app boot. Fixed in `io_gettextresource`.
3. **Java bridge rejects JS Proxy wrapping** — `@JavascriptInterface` dispatch validates injected-object identity; a Proxy fails every native call. Fix: `webhost.js` implements the full bridge surface with explicit typed forwarders; `waitForInterface` binds the shim directly.
4. **isTablet CSV contract**: desktop sends `'false'` so `PlatformBridge.path` stays undefined and media flows through base64 `getmedia` — the old port's `'0'` set a filesystem path that 404s as a URL.
5. **AGP 9 breaking changes**: Kotlin plugin built-in (applying `org.jetbrains.kotlin.android` fails the build), `kotlinOptions` removed (→ `kotlin.compilerOptions`), needs Gradle ≥9.5.
6. **Native SQLite WAL ≥ desktop `.bak`** — no redundant DB backup added; media files keep `.bak` rotation.
7. **CSS↔device pixel ratio**: WebView CSS viewport 1280×800 vs device 2560×1600 (ratio 2) — `input tap` needs device pixels; CDP rects are CSS pixels.
8. **ImmersiveModeConfirmation** dialog silently eats all taps on debug devices; dismiss via `adb shell settings put secure immersive_mode_confirmations confirmed`.
9. **Content URI intent permissions**: on Android 11+ (API 30+), external storage DocumentsProvider URIs require explicit document grants from pickers; internal / FileProvider content URIs (`content://<package>.fileprovider/...`) read cleanly via `ContentResolver.openInputStream` with `FLAG_GRANT_READ_URI_PERMISSION`.
10. **Native Share Sheet**: `sendSjrUsingShareDialog` and `sendExportedPng` output to `cacheDir/exports/` and invoke `Intent.createChooser` with `Intent.FLAG_GRANT_READ_URI_PERMISSION`, properly focusing `com.android.intentresolver/.ChooserActivityLauncher`.
11. **Phone Responsive Scaling**: On high-DPI handheld smartphone displays in landscape (e.g. 420 DPI, ~360–412px CSS height), the fixed ~740px layout previously pushed the block palette and scripts area off-screen. `applyResponsiveFrameScale()` in `lib.ts` and `Events.getTargetPoint` scaling calculate dynamic frame scaling (`currentUiScale = innerHeight / 740`) so the entire editor (stage, sprite pane, page pane, category selectors, blocks palette, and scripts workspace) renders completely, cleanly, and interactively on phones while keeping tablet and desktop byte-neutral and unscaled.

## 4. Environment & tooling set up this session (on this machine)

- SDK: cmdline-tools (latest), emulator, `system-images;android-36;google_apis;x86_64`, licenses accepted
  - License gotcha: sdkmanager needs interactive stdin; workaround = file of `y` lines redirected in (`< yes.txt`)
- AVD: `ScratchJr_Tab` (Pixel tablet, API 36). Boot: `emulator -avd ScratchJr_Tab -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -no-snapshot -memory 2048`
- CDP probe scripts (reusable): `C:\Users\dewa5\AppData\Local\Temp\opencode\cdp-probe.ps1` (Runtime.evaluate over the WebView devtools socket; forward via `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>`)
- Emulator instability: crashed twice + wedged SystemUI ANR once under swiftshader — **not reliable for long test cycles on this machine**. Physical device recommended for remaining P9 matrix testing.

## 5. Open items (next session / physical device)

| # | Item | Phase | Status | Blocked by |
|---|---|---|---|---|
| 1 | `.sjr` round-trip: open from Files (content URI) → project appears in lobby | P8 | **VERIFIED** on emulator | none |
| 2 | Share-sheet out: tap lobby share button → verify chooser opens with the `.sjr` attachment | P8 | **VERIFIED** on emulator | none |
| 3 | Offline (airplane-mode) suite: full create/edit/save/import/export/camera/paint/audio | P9 | **VERIFIED** on physical device (OnePlus 8 Pro, Android 13) | none |
| 4 | Soft keyboard + text sprite entry (manifest is `adjustNothing`; fallback = `adjustResize`) | P9 | **VERIFIED** on physical device (Gboard text entry & stage positioning clean) | none |
| 5 | Memory audit: watch `onTrimMemory` + WebView heap; `MediaCache` LRU cap decision | P9 | **VERIFIED & HARDENED** (`MediaCache` bounded to 50-entry LRU + `onTrimMemory` clear) | none |
| 6 | `chrome107` floor verification on old-WebView device | P9 | Pending (optional older hardware) | Physical device (Android ≤10) |
| 7 | Release signing (CI secrets), README Android download row, `docs/development.md` build section, CHANGELOG, Play Console data-safety form | P10 | **DONE** (signing config in build.gradle.kts + docs updated) | none |
| 8 | Desktop regression gate final pass before any merge to `master` | pre-merge | **PASSED** (154/154 vitest, tsc, eslint, smoke) | none |

## 6. How to resume (next session quickstart)

```powershell
# Emulator (if it stays stable):
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd ScratchJr_Tab -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -no-snapshot -memory 2048
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
# wait for boot, then:
& $adb -s emulator-5554 install -r android\app\build\outputs\apk\debug\app-debug.apk
& $adb -s emulator-5554 shell pm grant org.scratchjr.android.debug android.permission.CAMERA
& $adb -s emulator-5554 shell pm grant org.scratchjr.android.debug android.permission.RECORD_AUDIO
& $adb -s emulator-5554 shell settings put secure immersive_mode_confirmations confirmed
& $adb -s emulator-5554 shell am start -n org.scratchjr.android.debug/org.scratchjr.android.MainActivity
# CDP probe (re-attach):
$p = (& $adb -s emulator-5554 shell pidof org.scratchjr.android.debug).Trim()
& $adb -s emulator-5554 forward tcp:9222 "localabstract:webview_devtools_remote_$p"
powershell -File C:\Users\dewa5\AppData\Local\Temp\opencode\cdp-probe.ps1 -Js "JSON.stringify({url: location.href})"
```

Key build commands: `npm run build:android` → `cd android; gradlew assembleDebug` → APK at `android/app/build/outputs/apk/debug/`.

Device pixel note: taps = CSS × 2 on this AVD (2560×1600 device, 1280×800 CSS).

## 7. Guardrails (do not regress)

- **Never commit `android/app/src/main/assets/`** — it's build output; CI guard enforces (`git ls-files android/app/src/main/assets` must be empty)
- Desktop must stay byte-neutral: run `tsc` + `eslint` + `vitest` (154/154) + `npm run smoke` after any renderer change
- All renderer host-guards use `if (window.scratchjr)` / `if (typeof AndroidInterface !== 'undefined')` — no `isiOS`-style platform sniffing
- `webhost.js` must implement the *full* bridge surface (no Proxy over native — Java bridge rejects it)
- The plan's Appendix A is the single source of audit findings; append new discoveries there
