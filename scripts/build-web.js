/**
 * ScratchJr Web & PWA Distribution Builder (scripts/build-web.js)
 *
 * Compiles the TypeScript bundle and packages a self-contained static
 * distribution into dist-web/ ready for deployment to GitHub Pages, Vercel,
 * Netlify, or any static web server.
 *
 * Usage: node scripts/build-web.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const srcAppDir = path.join(srcDir, 'app');
const distWebDir = path.join(rootDir, 'dist-web');
const targetAppDir = path.join(distWebDir, 'app');

function copyDirRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function main() {
    console.log('--- Building ScratchJr Web / PWA ---');

    // 1. Build renderer esbuild bundles
    console.log('1. Building renderer bundles...');
    execSync('node scripts/build-renderer.js', {
        stdio: 'inherit',
        cwd: rootDir,
        env: { ...process.env, ESBUILD_TARGET: process.env.ESBUILD_TARGET || 'chrome107' },
    });

    // 2. Prepare dist-web directories
    console.log('2. Preparing dist-web/ structure...');
    if (fs.existsSync(distWebDir)) {
        fs.rmSync(distWebDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distWebDir, { recursive: true });
    fs.mkdirSync(targetAppDir, { recursive: true });

    // 3. Copy top-level runtime host files
    const topLevelFiles = [
        'hostClient.js',
        'webav.js',
        'browserClient.js',
    ];

    for (const file of topLevelFiles) {
        const srcFile = path.join(srcDir, file);
        if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, path.join(distWebDir, file));
        } else {
            console.warn(`build-web: missing ${file}`);
        }
    }

    // Copy vendor WebAssembly SQLite directly from node_modules
    const sqlDist = path.join(rootDir, 'node_modules', 'sql.js', 'dist');
    fs.copyFileSync(path.join(sqlDist, 'sql-wasm.js'), path.join(distWebDir, 'sql-wasm.js'));
    fs.copyFileSync(path.join(sqlDist, 'sql-wasm.wasm'), path.join(distWebDir, 'sql-wasm.wasm'));

    // 4. Copy app HTML, manifest, SW, settings, media.json, appEntry.js
    const appFiles = [
        'index.html',
        'home.html',
        'editor.html',
        'gettingstarted.html',
        'settings.json',
        'media.json',
        'appEntry.js',
        'manifest.webmanifest',
        'sw.js',
    ];

    for (const file of appFiles) {
        const srcFile = path.join(srcAppDir, file);
        if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, path.join(targetAppDir, file));
        } else {
            console.warn(`build-web: missing ${file}`);
        }
    }

    // 5. Copy app asset folders: dist, assets, localizations, samples, css, inapp, sounds, svglibrary, pnglibrary
    console.log('3. Copying web bundles, styles, localizations, and media libraries...');
    const folders = [
        'dist',
        'assets',
        'localizations',
        'samples',
        'css',
        'inapp',
        'sounds',
        'svglibrary',
        'pnglibrary',
    ];

    for (const folder of folders) {
        const srcFolder = path.join(srcAppDir, folder);
        const destFolder = path.join(targetAppDir, folder);
        if (fs.existsSync(srcFolder)) {
            copyDirRecursive(srcFolder, destFolder);
        }
    }

    // 6. Copy root landing page, screenshots, and version.json from docs/
    const docsDir = path.join(rootDir, 'docs');
    const docsFiles = [
        'index.html',
        'screenshot-lobby.webp',
        'screenshot-editor.webp',
        'screenshot-start.webp',
        'version.json',
        'README.md',
        'development.md',
        'engine.md',
        'ARCHITECTURE.md',
        'ANDROID-PORT-PLAN.md'
    ];

    for (const docFile of docsFiles) {
        const srcPath = path.join(docsDir, docFile);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, path.join(distWebDir, docFile));
        }
    }

    // 7. Create /play/ launcher redirecting to /app/index.html
    const targetPlayDir = path.join(distWebDir, 'play');
    fs.mkdirSync(targetPlayDir, { recursive: true });
    const playRedirect = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=../app/index.html">
  <title>ScratchJr Web Launcher</title>
</head>
<body>
  <p>Launching ScratchJr Web... <a href="../app/index.html">Click here if not redirected</a>.</p>
</body>
</html>
`;
    fs.writeFileSync(path.join(targetPlayDir, 'index.html'), playRedirect, 'utf8');

    // 8. Bypass Jekyll on GitHub Pages
    fs.writeFileSync(path.join(distWebDir, '.nojekyll'), '', 'utf8');

    console.log('✅ Web / PWA build complete at dist-web/ (landing at /, app at /play/ and /app/)');
}

main();
