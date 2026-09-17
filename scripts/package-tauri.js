/**
 * Package Tauri Local Output (scripts/package-tauri.js)
 *
 * Copies compiled standalone executable, NSIS installer, and MSI package from
 * src-tauri/target/release into out/tauri-win32-x64/ and generates a release zip + checksums.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const tauriReleaseDir = path.join(rootDir, 'src-tauri', 'target', 'release');
const outDir = path.join(rootDir, 'out', 'tauri-win32-x64');
const zipOutPath = path.join(rootDir, 'out', 'ScratchJr-tauri-win32-x64.zip');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function computeSha256(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

ensureDir(outDir);
for (const file of fs.readdirSync(outDir)) {
    fs.rmSync(path.join(outDir, file), { recursive: true, force: true });
}

// 1. Copy Standalone Executable
const srcExe = path.join(tauriReleaseDir, 'scratchjr.exe');
const destExe = path.join(outDir, 'ScratchJr.exe');
if (fs.existsSync(srcExe)) {
    fs.copyFileSync(srcExe, destExe);
    console.log(`[package-tauri] Copied executable -> ${destExe}`);
} else {
    console.error(`[package-tauri] Missing ${srcExe}. Run 'npm run tauri:build' first.`);
    process.exit(1);
}

// 2. Copy NSIS Setup Executable
const nsisDir = path.join(tauriReleaseDir, 'bundle', 'nsis');
if (fs.existsSync(nsisDir)) {
    const nsisFiles = fs.readdirSync(nsisDir).filter((f) => f.endsWith('.exe'));
    for (const f of nsisFiles) {
        fs.copyFileSync(path.join(nsisDir, f), path.join(outDir, f));
        console.log(`[package-tauri] Copied NSIS installer -> ${path.join(outDir, f)}`);
    }
}

// 3. Copy MSI Installer
const msiDir = path.join(tauriReleaseDir, 'bundle', 'msi');
if (fs.existsSync(msiDir)) {
    const msiFiles = fs.readdirSync(msiDir).filter((f) => f.endsWith('.msi'));
    for (const f of msiFiles) {
        fs.copyFileSync(path.join(msiDir, f), path.join(outDir, f));
        console.log(`[package-tauri] Copied MSI installer -> ${path.join(outDir, f)}`);
    }
}

// 4. Generate SHA-256 Checksums
const checksums = [];
const packagedFiles = fs.readdirSync(outDir).filter((f) => f !== 'SHA256SUMS.txt');
for (const f of packagedFiles) {
    const hash = computeSha256(path.join(outDir, f));
    checksums.push(`${hash}  ${f}`);
}
fs.writeFileSync(path.join(outDir, 'SHA256SUMS.txt'), checksums.join('\n') + '\n', 'utf8');
console.log(`[package-tauri] Generated SHA256SUMS.txt`);

// 5. Create Standalone Release Zip via PowerShell
if (fs.existsSync(zipOutPath)) {
    fs.unlinkSync(zipOutPath);
}
console.log(`[package-tauri] Creating ${zipOutPath}...`);
const psCmd = `Compress-Archive -Path "${outDir}\\*" -DestinationPath "${zipOutPath}" -Force`;
const zipRes = spawnSync('powershell', ['-NoProfile', '-Command', psCmd], { stdio: 'inherit' });

if (zipRes.status === 0 && fs.existsSync(zipOutPath)) {
    const zipSizeMB = (fs.statSync(zipOutPath).size / (1024 * 1024)).toFixed(2);
    console.log(`[package-tauri] Release zip created successfully (${zipSizeMB} MB)`);
} else {
    console.warn(`[package-tauri] Warning: Could not create zip archive`);
}

console.log('\n=========================================');
console.log(`Local Tauri Output Ready in: ${outDir}`);
console.log(`Release Archive: ${zipOutPath}`);
console.log('=========================================');
