/**
 * Synchronize bundled web assets to Android project assets directory.
 *
 * Usage: node scripts/build-android-assets.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const srcAppDir = path.join(rootDir, 'src', 'app');
const targetAssetsDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'www');

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
    console.log('Building renderer bundle for Android...');
    execSync('node scripts/build-renderer.js', { stdio: 'inherit', cwd: rootDir });

    console.log(`Syncing assets to ${targetAssetsDir}...`);
    fs.mkdirSync(targetAssetsDir, { recursive: true });

    // HTML entry pages. hostClient.js loads the Electron client only when the
    // preload bridge exists, so pages are host-neutral.
    const htmlFiles = [
        'index.html',
        'home.html',
        'editor.html',
        'gettingstarted.html',
    ];

    for (const file of htmlFiles) {
        const srcFile = path.join(srcAppDir, file);
        if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, path.join(targetAssetsDir, file));
        } else {
            console.warn(`build-android-assets: missing ${file} (skipped)`);
        }
    }

    // Host loader. Pages reference ../hostClient.js; the WebView serves pages
    // from /assets/www/, so ../ resolves to /assets/ — the APK assets root,
    // one level above www/. (Same ../ layout as desktop's src/.)
    fs.copyFileSync(
        path.join(rootDir, 'src', 'hostClient.js'),
        path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'hostClient.js')
    );

    // Root-level runtime resources (media.json is fetched via io_gettextresource;
    // appEntry/dispatch reads settings.json). pop.mp3 and the wav FX live in sounds/.
    const rootFiles = ['media.json', 'settings.json'];
    for (const file of rootFiles) {
        const srcFile = path.join(srcAppDir, file);
        if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, path.join(targetAssetsDir, file));
        } else {
            console.warn(`build-android-assets: missing ${file} (skipped)`);
        }
    }

    // Asset folders. sounds/ is required by io_getAudioData's 'sounds/<name>'
    // fallback; svglibrary/pnglibrary are the MediaLib asset roots.
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
        const destFolder = path.join(targetAssetsDir, folder);
        if (fs.existsSync(srcFolder)) {
            copyDirRecursive(srcFolder, destFolder);
        }
    }

    console.log('Android assets synced successfully.');
}

main();
