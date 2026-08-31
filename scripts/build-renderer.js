/**
 * Bundle the ScratchJr renderer entry point with esbuild.
 *
 * Bundles src/app/appEntry.js and all its imports (including npm deps)
 * into a single file that can be loaded by the HTML pages.
 *
 * Usage: node scripts/build-renderer.js [--watch]
 */

const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
    entryPoints: [path.resolve(__dirname, '..', 'src', 'app', 'renderer-entry.js')],
    outdir: path.resolve(__dirname, '..', 'src', 'app', 'dist'),
    // HTML pages load dist/app.bundle.js; page chunks + shared chunks land
    // alongside it via code splitting (appEntry.js uses dynamic imports).
    entryNames: 'app.bundle',
    splitting: true,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['chrome150'],  // Electron 43.4.1 ships Chromium 150
    sourcemap: true,
    minify: false,  // keep readable for debugging
    logLevel: 'info',
};

async function main() {
    // Keep the in-app Settings.scratchJrVersion in lockstep with package.json
    // so the About / project metadata screens always report the built version.
    // Done as a string replacement on the JSON (single source of truth = package.json).
    const pkg = require(path.resolve(__dirname, '..', 'package.json'));
    const settingsPath = path.resolve(__dirname, '..', 'src', 'app', 'settings.json');
    const fs = require('fs');
    const before = fs.readFileSync(settingsPath, 'utf8');
    const after = before.replace(
        /"scratchJrVersion"\s*:\s*"desktop-v[^"]*"/,
        `"scratchJrVersion": "desktop-v${pkg.version}"`
    );
    if (after === before) {
        console.warn(`build-renderer: settings.json had no scratchJrVersion to update (expected key "desktop-v...").`);
    } else {
        fs.writeFileSync(settingsPath, after);
        console.log(`build-renderer: settings.json scratchJrVersion = desktop-v${pkg.version}`);
    }

    if (isWatch) {
        const ctx = await esbuild.context(options);
        await ctx.watch();
        console.log('Watching for renderer changes...');
    } else {
        await esbuild.build(options);
        console.log('Renderer bundle built successfully.');
    }
}

main().catch((err) => {
    console.error('Renderer bundle failed:', err);
    process.exit(1);
});
