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
    if (nsisFiles.length > 0) {
        const targetName = 'ScratchJr-tauri-win32-x64-setup.exe';
        fs.copyFileSync(path.join(nsisDir, nsisFiles[0]), path.join(outDir, targetName));
        console.log(`[package-tauri] Copied NSIS installer -> ${path.join(outDir, targetName)}`);
    }
}

// 3. Copy MSI Installer
const msiDir = path.join(tauriReleaseDir, 'bundle', 'msi');
if (fs.existsSync(msiDir)) {
    const msiFiles = fs.readdirSync(msiDir).filter((f) => f.endsWith('.msi'));
    if (msiFiles.length > 0) {
        const targetName = 'ScratchJr-tauri-win32-x64.msi';
        fs.copyFileSync(path.join(msiDir, msiFiles[0]), path.join(outDir, targetName));
        console.log(`[package-tauri] Copied MSI installer -> ${path.join(outDir, targetName)}`);
    }
}

// 4. Create Standalone Portable Release Zip via PowerShell (contains ScratchJr.exe)
if (fs.existsSync(zipOutPath)) {
    fs.unlinkSync(zipOutPath);
}
console.log(`[package-tauri] Creating portable zip ${zipOutPath}...`);
const psCmd = `Compress-Archive -Path "${destExe}" -DestinationPath "${zipOutPath}" -Force`;
const zipRes = spawnSync('powershell', ['-NoProfile', '-Command', psCmd], { stdio: 'inherit' });

if (zipRes.status === 0 && fs.existsSync(zipOutPath)) {
    const zipSizeMB = (fs.statSync(zipOutPath).size / (1024 * 1024)).toFixed(2);
    console.log(`[package-tauri] Release zip created successfully (${zipSizeMB} MB)`);
    // Also copy zip into outDir for unified distribution
    fs.copyFileSync(zipOutPath, path.join(outDir, 'ScratchJr-tauri-win32-x64.zip'));
} else {
    console.warn(`[package-tauri] Warning: Could not create zip archive`);
}

// 5. Generate Checksums (SHA256SUMS.txt + individual .sha256 files)
const checksums = [];
const releaseFiles = [
    'ScratchJr-tauri-win32-x64-setup.exe',
    'ScratchJr-tauri-win32-x64.msi',
    'ScratchJr-tauri-win32-x64.zip',
    'ScratchJr.exe',
];

for (const f of releaseFiles) {
    const filePath = path.join(outDir, f);
    if (fs.existsSync(filePath)) {
        const hash = computeSha256(filePath);
        checksums.push(`${hash}  ${f}`);
        if (f.endsWith('.exe') && f !== 'ScratchJr.exe' || f.endsWith('.msi') || f.endsWith('.zip')) {
            fs.writeFileSync(`${filePath}.sha256`, `${hash}  ${f}\n`, 'utf8');
            console.log(`[package-tauri] Generated ${f}.sha256`);
        }
    }
}
fs.writeFileSync(path.join(outDir, 'SHA256SUMS.txt'), checksums.join('\n') + '\n', 'utf8');
console.log(`[package-tauri] Generated SHA256SUMS.txt`);

console.log('\n=========================================');
console.log(`Local Tauri Output Ready in: ${outDir}`);
console.log(`Release Archive: ${zipOutPath}`);
console.log('=========================================');

