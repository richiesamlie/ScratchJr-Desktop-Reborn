# ScratchJr Reborn — Web/PWA, Desktop & Android

> A modernized multi-platform port of [ScratchJr](https://scratchjr.org/) for Web/PWA, Windows, macOS, Linux, and Android.

## Online & Downloads

- **[🎮 Launch Online in Browser (Web / PWA)](https://richiesamlie.github.io/ScratchJr-Desktop-Reborn/play/)** — No install required, runs on Chromebooks, iPads, and PCs!
- **[Download ScratchJr Reborn (latest release)](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest)**

| Target / File | Platform | Notes |
|------|----------|-------|
| **Web / PWA** | Web (Chrome, Safari, Edge, Firefox) | [Launch in Browser](https://richiesamlie.github.io/ScratchJr-Desktop-Reborn/play/) / Installable PWA |
| `ScratchJr-win32-x64.msi` | Windows x64 | Windows Installer |
| `ScratchJr-win32-x64.zip` | Windows x64 | Portable zip |
| `ScratchJr-darwin-x64.zip` | macOS x64 | Intel Mac |
| `ScratchJr-darwin-arm64.zip` | macOS ARM64 | Apple Silicon (M1/M2/M3) |
| `ScratchJr-linux-x64.zip` | Linux x64 | Linux portable |
| `ScratchJr-linux-arm64.zip` | Linux ARM64 | Linux ARM64 |
| `ScratchJr-android-debug.apk` | Android (Universal) | Ready to install (.apk, Android 7.0+) |
| `ScratchJr-android-release-unsigned.apk` | Android (Universal) | Production release package |
| `ScratchJr-android-release.aab` | Android | Google Play App Bundle |

> **Project Status (v2.0.0)**: Major milestone celebrating the universal multi-platform release of ScratchJr Reborn across Web/PWA (GitHub Pages), Desktop (Windows, macOS, Linux), and Native Android with 100% project compatibility and automated end-to-end verification.

---

## Features & Improvements

### 🔄 Flip Block & Creative Motion
- **Horizontal Flip (`flipX`)**: New Blue Motion palette block to mirror sprites horizontally on the fly with native reset on "Go Home".
- **Vector Block Graphics**: Standardized block icon matching ScratchJr's friendly visual language.

### 🔍 Smart Library Categorization & Live Search
- **Instant Search**: Live, multi-token search box with instant results and clear button.
- **Categorized Tabs**: 12 curated categories for costumes (*Animals, People, Fantasy, Plants, Nature, Things, Vehicles, Buildings*) and backgrounds (*Nature, City & Outdoors, Indoors, Space & Undersea*).
- **100% Native Localization**: Fully translated across all 12 supported languages.

### 📂 1-Click `.sjr` Import Card & Sharing
- **Lobby "Open" Card**: Dedicated card next to the "+" button in the lobby with native OS file dialog support across Desktop, Android, and Web.
- **1-Click Project Export**: Dedicated export action on project cards in the lobby (long-press or right-click) routing to native Save File dialog (Desktop), Android Share Sheet, or Web download.
- **Save-Before-Export Protection**: Automatically flushes active canvas state before generating `.sjr` archives.

### 🌐 Universal Web & PWA Resilience
- **In-Browser SQLite & IndexedDB Storage**: Full client-side execution via `sql.js` (WebAssembly SQLite) paired with IndexedDB persistence, requiring zero server-side infrastructure and zero isolation headers (runs on standard GitHub Pages).
- **Multi-Tab Concurrency Guard**: Web Locks API (`navigator.locks`) prevents multi-tab IndexedDB write races, placing secondary tabs in safe read-only mode with a friendly banner.
- **Storage Eviction Defense**: Automatically requests `navigator.storage.persist()` to guard saved projects against browser cache pruning.
- **Database Corruption Quarantine**: Damaged SQLite blobs in IndexedDB are safely quarantined to `db_bytes_corrupt_<timestamp>` before resetting to a fresh database.
- **Full Offline PWA**: Installable PWA with Service Worker (`sw.js`) and asset caching.

### 📱 Native Android Shell
- **High-Performance Kotlin Shell**: Modern Android architecture utilizing `WebViewAssetLoader`, `@JavascriptInterface` bridge (`AndroidBridge`), and native SQLite with Write-Ahead Logging (WAL).
- **Hardware Multimedia**: Voice recording and camera photo capture with runtime permission management.
- **System Interoperability**: Handles system `.sjr` file intents (`android.intent.action.VIEW`) and system share sheet exports via `FileProvider`.

### 🖼️ Custom Image Import (Characters & Backdrops)
- **1-Click Import & Drag-and-Drop**: Import photos, drawings, and clipart directly into the Character Library and Backdrop Library modals via the Import Media button or by dragging files onto the screen.
- **Universal Image Support**: Works with `.png`, `.jpg`, `.jpeg`, and `.svg` files with automatic filename cleaning and thumbnail generation.
- **Unicode UTF-8 Safe Serialization**: Prevents `DOMException: InvalidCharacterError` crashes on international scripts (Chinese, Arabic, emojis, etc.).

### 🎨 Paint Editor & Creative Tools
- **Straight Line & Star Shape Tools**: Dedicated vector line tool and 5-pointed star generator with full paintbucket fill compatibility.
- **Geometric Constraint Snapping**: Hold `Shift` to draw perfect squares, circles, equilateral triangles, and 45° angle straight lines.
- **Enriched Color Swatches**: Vibrant color palette with bright golden yellow (`#FFD700`) and clean vector icon scaling.

### 👥 Project Duplication ("Remix") & Lobby Controls
- **1-Click Project Remix**: Duplicate any project with one click to safely experiment without losing original projects.
- **Kid-Safe Edit Mode**: Intentional 500ms press-and-hold (or right-click) prevents accidental deletions.
- **Scoped Desktop Shortcuts**: Keyboard shortcuts (`Ctrl+S`, `Ctrl+Z`, `Ctrl+Shift+Z`/`Ctrl+Y`, `Ctrl+N`) are strictly window-scoped and never intercept keys in background applications.

### 🎨 Expanded Workspace & Desktop Ergonomics
- **8 Pages per Project**: Increased from the original 4-page limit to 8 pages by default (configurable via `maxPages` in `settings.json`).
- **Scrollable Page & Character Strips**: Native mouse-wheel scrolling and responsive layout keep pages and characters easily accessible.
- **Always-Visible Action Buttons**: "+" add-page and add-character buttons stay pinned on screen at any window size.

### 💾 Robust Desktop Storage & Data Integrity
- **Atomic Database Writes**: Saves to a temporary file before renaming, preventing corruption if the app is abruptly closed.
- **Automatic Backup & Recovery**: Creates rolling `.bak` snapshots on every save and runs `PRAGMA integrity_check` on launch, auto-recovering from backup if needed.
- **File-Backed Media**: Sprites, backgrounds, sounds, and thumbnails live as files under `Documents\ScratchJR\media` instead of base64 rows inside the database.

### 🛡️ Security & Sandboxed Architecture
- **Sandboxed Renderer**: Built on **Electron 43** with strict `contextIsolation`, preventing direct Node.js execution in the browser process.
- **Eval-Free Renderer + Hardened CSP**: CSS preprocessing no longer compiles expressions with `Function()`; every page's Content Security Policy dropped `'unsafe-eval'`.
- **Typed Intent IPC**: The renderer sends typed database intents; the main process composes parameterized SQL from an allowlist of tables and columns without raw SQL execution.

### 🏗️ Clean Engine & Platform Separation
- **Modern Platform Bridge**: Platform-specific code is isolated in modular adapters (`electronClient.js`, `browserClient.js`, `webhost.js`) under a common seam (`src/hostClient.js`).
- **Typed Port Seam**: The block engine (`editor/engine`, `editor/blocks`) has zero runtime imports of UI singletons — everything flows through the typed `EnginePorts` interface.
- **Model Registry**: Replaced untyped DOM expando properties with a kind-tagged WeakMap registry (`modelRegistry.ts`).

### ⚡ Strict TypeScript & Verification Gate
- **100% Strict TypeScript**: Entire codebase migrated to TypeScript with strict type checking (`strict: true`, zero `any`).
- **Comprehensive Test Suite**: **179 automated unit tests** covering database intents, media migration, undo/redo flows, shape tools, flipX block, library search & categories, lobby import card, UTF-8 serialization, and browser concurrency.
- **End-to-End Smoke Tests**: Automated Chrome DevTools Protocol (CDP) test harnesses for Web/PWA, Electron Desktop, and Android APK builds.

### 🌍 Classroom & Fleet Deployment
- **Touchscreen & Smartboard Ready**: Defensive coordinate resolution across mouse, stylus, and touch inputs prevents block dropouts and paint glitches during classroom smartboard activities.
- **Hardware Multimedia Support**: WebRTC permission handlers for camera photo insertion in Paint Editor and voice recording.
- **`--lang` CLI Flag**: Launch with explicit language overrides (e.g., `ScratchJr.exe --lang=fr`), ideal for school environments.
- **Native Update Checker**: Check for new releases directly from `File` → `Check for Updates...`. Launch-time checks are silent, and conditional (ETag) requests keep the app rate-limit-friendly with the GitHub API.
- **Working Keyboard Shortcuts**: `Ctrl+S` save, `Ctrl+Z` / `Ctrl+Shift+Z` undo/redo, `Ctrl+N` new project.
- **Stage Image Export**: `File` → `Export Stage as PNG...` renders the current page at 2× resolution (960×720) to a PNG of your choice.
- **Configurable MSI Installer**: Supports silent deployment, pinned `UpgradeCode`, per-machine scopes, and uninstallation options (`REMOVE_DATABASE=1`).

### 📚 Documentation & Architecture Guides
- **[Architecture & Security Topology](docs/ARCHITECTURE.md)** — Process separation, IPC boundaries, and data flows.
- **[Threat Model & Mitigations](docs/THREAT-MODEL.md)** — Security boundaries, untrusted asset validation, and network isolation.
- **[School & Fleet Deployment Guide](docs/SCHOOL-DEPLOYMENT.md)** — MSI silent install parameters, Intune/GPO deployment, and multi-user configurations.
- **[Release Runbook](docs/RELEASE.md)** — Release procedures and code signing verification for maintainers.
- **[Engine Internals](docs/engine.md)** — Block engine architecture, runtime threads, and primitives.
- **[Developer Guide](docs/development.md)** — Development setup, layout rules, and testing guide.
- **[GitHub Wiki](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/wiki)** — Comprehensive wiki and community documentation.

---

## Building from Source

**Prerequisites:** Node.js 22+ and Git.

```bash
# Install dependencies
npm install

# Run unit tests and static analysis
npm test
npm run typecheck
npx eslint src

# Target Builds
npm run build:renderer     # Build renderer bundle
npm run build:web          # Build static Web / PWA to dist-web/
npm run build:android      # Sync assets to Android project

# End-to-End Smoke Tests
node scripts/smoke-web.js  # Headless browser test (PWA / Web)
node scripts/smoke-test.js # Electron desktop smoke test

# Desktop Packaging (Windows / macOS / Linux)
npm run make:zip           # Package portable ZIP
npm run make               # Package native installer (e.g. MSI on Windows)
```

---

## Changes in this fork

See [CHANGELOG.md](CHANGELOG.md) for the full version history. Highlights of
the fork versus the original tablet codebase are listed under
[Features & Improvements](#features--improvements) above.

---

## Acknowledgements & Credits

ScratchJr Reborn builds upon the dedicated work of the open-source community:

- **Original ScratchJr**: Created by the [Tufts DevTech Research Group](https://sites.tufts.edu/devtech/), the [Lifelong Kindergarten group at MIT Media Lab](https://www.media.mit.edu/groups/lifelong-kindergarten/overview/), and the [Playful Invention Company](http://www.playfulinvention.com/). Official source: [`scratchfoundation/scratchjr`](https://github.com/scratchfoundation/scratchjr).
- **Desktop Electron Pioneers**: Initial desktop adaptations and WebRTC pointer/camera integration by [`jfo8000/ScratchJr-Desktop`](https://github.com/jfo8000/ScratchJr-Desktop) and [`JustSch/ScratchJr-Desktop`](https://github.com/JustSch/ScratchJr-Desktop).
- **Feature Inspirations**:
  - [`wangzongjun/ScratchJr`](https://github.com/wangzongjun/ScratchJr): Inspiration for the horizontal flip motion block (`flipX`), asset library categorization and search, 1-click `.sjr` import card, and UTF-8 Base64 serialization.
  - [`patdx/scratchjr`](https://github.com/patdx/scratchjr): Inspiration for web storage resilience architectures: multi-tab concurrency protection via the Web Locks API (`navigator.locks`), browser storage eviction defense (`navigator.storage.persist()`), and database corruption quarantine.
- **WebAssembly SQLite**: Powered by [SQL.js](https://github.com/sql-js/sql.js) and [SQLite.org](https://sqlite.org/).

---

## Official Disclaimer

Scratch and ScratchJr are trademarks of Massachusetts Institute of Technology, which does not sponsor, endorse, or authorize this content. See [scratchjr.org](https://scratchjr.org) for more information.

## License

[BSD 3-Clause](LICENSE) — Copyright (c) 2016, Massachusetts Institute of Technology.
