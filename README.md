# ScratchJr Reborn — Web/PWA, Desktop & Android

> A modernized, universal multi-platform edition of [ScratchJr](https://scratchjr.org/) for Web/PWA, Windows, macOS, Linux, and Android.

[![Version](https://img.shields.io/badge/version-v2.1.0-blue.svg)](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest)
[![Tests](https://img.shields.io/badge/tests-181%20passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-BSD--3--Clause-green.svg)](LICENSE)
[![Platforms](https://img.shields.io/badge/platforms-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Android-orange.svg)]()

---

## 🚀 Launch Online & Downloads

| Platform | Target | Distribution |
| :--- | :--- | :--- |
| **🌐 Web / PWA** | In-Browser (Chrome, Safari, Edge, Firefox) | **[🎮 Launch Web App](https://richiesamlie.github.io/ScratchJr-Desktop-Reborn/play/)** · Installable PWA |
| **🪟 Windows** | Windows 10/11 (x64) | [Download MSI Installer](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest) · [Portable ZIP](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest) |
| **🍎 macOS** | Apple Silicon & Intel | [Download DMG / ZIP](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest) |
| **🐧 Linux** | Ubuntu, Debian, Fedora (x64, ARM64) | [Download Tarball / ZIP](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest) |
| **📱 Android** | Phones, Tablets, Chromebooks (Android 7.0+) | [Download APK](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest) · Google Play Bundle |

---

## ✨ Key Capabilities

### 🌐 Universal Multi-Target Architecture
- **In-Browser SQLite (Web/PWA)**: Full client-side execution via `sql.js` (WebAssembly SQLite) paired with IndexedDB persistence. Zero server requirements, zero cross-origin header restrictions.
- **Multi-Tab Concurrency Guard**: Web Locks API (`navigator.locks`) prevents write races across browser tabs, keeping secondary windows in safe read-only mode.
- **High-Performance Android Shell**: Modern Kotlin shell using `WebViewAssetLoader`, native SQLite WAL, camera/mic permissions, and system intent handling.
- **Sandboxed Desktop**: Built on Electron with strict `contextIsolation`, typed database intents, and no raw SQL evaluation over IPC.

### 🎨 Creative Coding & Expanded Canvas
- **`flipX` Motion Block**: Added horizontal mirroring block to the Blue Motion palette with native reset on "Go Home".
- **Smart Asset Library**: Live multi-token search box with 12 curated categories for costumes and backgrounds.
- **8 Pages per Project**: Expanded from the original 4-page ceiling with scrollable page strips and pinned navigation.
- **Paint Editor Tools**: Dedicated straight line and star shape tools with Shift-key geometric snapping.
- **Custom Media Import**: Import PNG, JPG, JPEG, and SVG images with automatic aspect ratio fitting and Unicode UTF-8 safe serialization.
- **12 Supported Languages**: Full native translations across English, Spanish, French, German, Italian, Japanese, Simplified Chinese, Dutch, Portuguese, Swedish, Catalan, and Thai.

### 💾 Safe Storage & 1-Click Sharing
- **Lobby 1-Click `.sjr` Open Card**: Dedicated import card next to "+" with native system file pickers across all platforms.
- **Instant Project Export**: One-click card export to native Save File dialog (Desktop), system Share Sheet (Android), or browser download (Web).
- **Automatic Crash Protection**: Atomic database writes, rolling `.bak` snapshots on Desktop, and automated corrupt database quarantine in IndexedDB.

### 🏫 Classroom & Fleet Deployment
- **Touchscreen & Smartboard Ready**: Defensive coordinate resolution across mouse, stylus, and touch inputs prevents block dropouts during classroom activities.
- **CLI Flags**: Launch with `--lang=XX` language overrides for multi-lingual school computer labs.
- **Configurable MSI Installer**: Supports silent mass deployment (`msiexec /i ScratchJr.msi /qn`), Intune/GPO policies, and per-machine install scopes.
- **181 Automated Tests**: 100% test coverage across database intents, shapes, blocks, UTF-8 serialization, and CDP browser smoke harnesses.

---

## 🛠️ Building from Source

**Prerequisites:** Node.js 22+ and Git.

```bash
# Install dependencies
npm install

# Run unit tests and static analysis (181 tests, 0 errors)
npm test
npm run typecheck && npx eslint src

# Target Builds
npm run build:renderer     # Compile renderer TypeScript bundles
npm run build:web          # Build static Web / PWA to dist-web/
npm run build:android      # Sync web bundles to Android assets

# End-to-End Smoke Tests (CDP)
node scripts/smoke-web.js  # Headless browser test (PWA / Web)
node scripts/smoke-test.js # Electron desktop smoke test

# Desktop Packaging
npm run make:zip           # Build portable ZIP
npm run make               # Build platform installer (e.g. Windows MSI)
```

---

## 📚 Documentation

| Guide | Description |
| :--- | :--- |
| **[Architecture & Security](docs/ARCHITECTURE.md)** | Process separation, IPC boundaries, and data flows |
| **[Threat Model & Mitigations](docs/THREAT-MODEL.md)** | Security posture and network isolation |
| **[School & Fleet Deployment](docs/SCHOOL-DEPLOYMENT.md)** | MSI silent install flags, Intune, and GPO guides |
| **[Release Runbook](docs/RELEASE.md)** | Packaging procedures and maintainer release checklist |
| **[GitHub Wiki](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/wiki)** | Comprehensive guides, API docs, and platform runbooks |

---

## 🤝 Acknowledgements & Credits

ScratchJr Reborn builds upon the dedicated work of the open-source community:

- **Original ScratchJr**: Created by the [Tufts DevTech Research Group](https://sites.tufts.edu/devtech/), the [Lifelong Kindergarten group at MIT Media Lab](https://www.media.mit.edu/groups/lifelong-kindergarten/overview/), and the [Playful Invention Company](http://www.playfulinvention.com/). Official source: [`scratchfoundation/scratchjr`](https://github.com/scratchfoundation/scratchjr).
- **Desktop Electron Pioneers**: Initial desktop adaptations and WebRTC pointer/camera integration by [`jfo8000/ScratchJr-Desktop`](https://github.com/jfo8000/ScratchJr-Desktop) and [`JustSch/ScratchJr-Desktop`](https://github.com/JustSch/ScratchJr-Desktop).
- **Feature Inspirations**:
  - [`wangzongjun/ScratchJr`](https://github.com/wangzongjun/ScratchJr): Inspiration for the horizontal flip motion block (`flipX`), asset library categorization and search, 1-click `.sjr` import card, and UTF-8 Base64 serialization.
  - [`patdx/scratchjr`](https://github.com/patdx/scratchjr): Inspiration for web storage resilience architectures: multi-tab concurrency protection via the Web Locks API (`navigator.locks`), browser storage eviction defense (`navigator.storage.persist()`), and database corruption quarantine.
- **WebAssembly SQLite**: Powered by [SQL.js](https://github.com/sql-js/sql.js) and [SQLite.org](https://sqlite.org/).

---

## 📄 License & Disclaimer

Scratch and ScratchJr are trademarks of Massachusetts Institute of Technology, which does not sponsor, endorse, or authorize this content. See [scratchjr.org](https://scratchjr.org) for more information.

Licensed under the [BSD 3-Clause License](LICENSE) — Copyright (c) 2016, Massachusetts Institute of Technology.
