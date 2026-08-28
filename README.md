# ScratchJr Reborn — Desktop Edition

> A modernized desktop port of [ScratchJr](https://scratchjr.org/) for Windows, macOS, and Linux.

## Downloads

**[Download ScratchJr Reborn (latest release)](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/releases/latest)**

| File | Platform |
|------|----------|
| `ScratchJr-win32-x64.msi` | Windows x64 (installer) |
| `ScratchJr-win32-x64.zip` | Windows x64 (portable) |
| `ScratchJr-darwin-x64.zip` | macOS x64 |
| `ScratchJr-darwin-arm64.zip` | macOS ARM64 |
| `ScratchJr-linux-x64.zip` | Linux x64 |
| `ScratchJr-linux-arm64.zip` | Linux ARM64 |

---

## Features & Improvements

### 🎨 Paint Editor & Creative Tools
- **New Straight Line & Star Shape Tools**: Dedicated vector line tool and 5-pointed star generator with full paintbucket fill compatibility.
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
- **Responsive Layout**: Stage, scripts workspace, and block palette scale smoothly across varying desktop display heights.

### 💾 Robust Storage & Data Integrity
- **Atomic Database Writes**: Saves to a temporary file before renaming, preventing corruption if the app is abruptly closed.
- **Automatic Backup & Recovery**: Creates rolling `.bak` snapshots on every save and runs `PRAGMA integrity_check` on launch, auto-recovering from backup if needed.
- **Debounced Persistence**: Rapid changes are coalesced safely and flushed immediately during app shutdown to prevent data loss.
- **File-Backed Media**: Sprites, backgrounds, sounds, and thumbnails live as files under `Documents\ScratchJR\media` instead of base64 rows inside the database. Existing databases are migrated automatically on first launch (with a backup and byte-for-byte verification), and older databases remain readable.

### 🛡️ Security & Modern Architecture
- **Sandboxed Renderer**: Built on **Electron 43** with strict `contextIsolation`, preventing direct Node.js execution in the browser process.
- **Eval-Free Renderer + Hardened CSP**: CSS preprocessing no longer compiles expressions with `Function()`; every page's Content Security Policy dropped `'unsafe-eval'`.
- **No SQL Over IPC**: The renderer sends typed database intents; the main process composes parameterized SQL from an allowlist of tables and columns. There is no renderer-supplied SQL text to sanitize, and strict file-path containment guards all resource reads.

### 🏗️ Clean Engine/UI Separation
- **Modern Platform Bridge**: Legacy tablet/iOS wrappers are replaced by a modular `src/app/src/platform/` layer (`PlatformBridge`, `IO`, `MediaLib`) with backward-compatible aliases, eliminating dead mobile hooks.
- **Typed Port Seam**: The block engine (`editor/engine`, `editor/blocks`) has zero runtime imports of UI singletons or global state — everything flows through the typed `EnginePorts` interface, installed once at boot.
- **Model Registry**: The invisible `div.owner` expando object graph was replaced by `modelRegistry.ts`, a kind-tagged WeakMap element→model registry (blocks, scripts, sprites, pages, stage, thumbnails).
- **Per-Page Bundles**: esbuild code splitting gives each screen only its own code — the lobby and start screen no longer parse the block engine or paint editor.

### ⚡ Strict TypeScript & Testing
- **100% Strict TypeScript**: Entire codebase migrated to TypeScript with strict type checking (`strict: true`, zero `any`).
- **Comprehensive Test Suite**: 141 automated tests covering database intents and persistence, media migration, undo/save-reload golden flows, paint editor shapes and swatches, project duplication, update-check ETag caching, the CSS preprocessor grammar, and the .sjr import/export + media-cache paths.

### 🌍 Classroom & Fleet Deployment
- **`--lang` CLI Flag**: Launch with explicit language overrides (e.g., `ScratchJr.exe --lang=fr`), ideal for school environments.
- **Native Update Checker**: Check for new releases directly from `File` → `Check for Updates...`. Launch-time checks are silent, and conditional (ETag) requests keep the app rate-limit-friendly with the GitHub API.
- **Working Keyboard Shortcuts**: `Ctrl+S` save, `Ctrl+Z` / `Ctrl+Shift+Z` undo/redo, `Ctrl+N` new project.
- **`.sjr` Import**: Drag a `.sjr` project file anywhere onto the lobby to import it — assets are merged, duplicates deduplicated, and the project shows up with a gift bow.
- **`.sjr` Export**: `File` → `Export Project (.sjr)...` saves the current project as a shareable `.sjr` file that can be re-imported on any device.
- **Stage Image Export**: `File` → `Export Stage as PNG...` renders the current page at 2× resolution (960×720) to a PNG you choose.
- **Configurable MSI Installer**: Supports silent deployment and uninstallation options (`REMOVE_DATABASE=1`).

For architecture diagrams, IPC documentation, and developer guides, visit the **[Wiki](https://github.com/richiesamlie/ScratchJr-Desktop-Reborn/wiki)**.

---

## Building from Source

**Prerequisites:** Node.js 22+ and Git.

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Run tests and typecheck
npm test
npm run typecheck

# End-to-end harnesses (boot the real app via Chrome DevTools Protocol)
npm run smoke      # boot -> lobby -> editor -> help -> media round-trip
npm run interact   # real pointer drags: sprite move, block docking, undo replay

# Package portable ZIP or MSI
npm run make:zip
npm run make
```

---

## Changes in this fork

See [CHANGELOG.md](CHANGELOG.md) for the full version history. Highlights of
the fork versus the original tablet codebase are listed under
[Features & Improvements](#features--improvements) above.

---

## Official Disclaimer

Scratch and ScratchJr are trademarks of Massachusetts Institute of Technology, which does not sponsor, endorse, or authorize this content. See [scratchjr.org](https://scratchjr.org) for more information.

## License

[BSD 3-Clause](LICENSE) — Copyright (c) 2016, Massachusetts Institute of Technology.
