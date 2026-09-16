/**
 * Tauri Launcher Wrapper (scripts/run-tauri.js)
 *
 * Ensures MSVC build tools and Windows SDK are prioritized in PATH ahead of
 * GNU coreutils (which contains a shadowing link.exe), then launches @tauri-apps/cli.
 *
 * Usage:
 *   node scripts/run-tauri.js dev
 *   node scripts/run-tauri.js build
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const args = process.argv.slice(2);

// Prepare environment
const env = { ...process.env };

if (isWin && env.PATH) {
    // 1. Unshadow: move coreutils to the end of PATH so its link.exe does not hijack MSVC link.exe
    const parts = env.PATH.split(';').filter(Boolean);
    const coreutils = [];
    const nonCoreutils = [];

    for (const p of parts) {
        if (p.toLowerCase().includes('coreutils')) {
            coreutils.push(p);
        } else {
            nonCoreutils.push(p);
        }
    }

    // 2. Locate MSVC tools via standard locations or vswhere
    const msvcBins = [];
    const vswherePath = path.join(
        process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
        'Microsoft Visual Studio',
        'Installer',
        'vswhere.exe'
    );

    if (fs.existsSync(vswherePath)) {
        try {
            const vsOut = spawnSync(vswherePath, [
                '-latest',
                '-products', '*',
                '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64',
                '-property', 'installationPath'
            ], { encoding: 'utf8' });

            const vsDir = (vsOut.stdout || '').trim();
            if (vsDir) {
                const vcToolsVersionFile = path.join(vsDir, 'VC', 'Auxiliary', 'Build', 'Microsoft.VCToolsVersion.default.txt');
                let vcVersion = '';
                if (fs.existsSync(vcToolsVersionFile)) {
                    vcVersion = fs.readFileSync(vcToolsVersionFile, 'utf8').trim();
                }
                if (vcVersion) {
                    const hostX64Bin = path.join(vsDir, 'VC', 'Tools', 'MSVC', vcVersion, 'bin', 'Hostx64', 'x64');
                    if (fs.existsSync(hostX64Bin)) {
                        msvcBins.push(hostX64Bin);
                    }
                }
            }
        } catch (_) {}
    }

    env.PATH = [...msvcBins, ...nonCoreutils, ...coreutils].join(';');
}

const tauriBin = path.resolve(__dirname, '..', 'node_modules', '.bin', isWin ? 'tauri.cmd' : 'tauri');
const cmd = fs.existsSync(tauriBin) ? tauriBin : (isWin ? 'npx.cmd' : 'npx');
const cmdArgs = fs.existsSync(tauriBin) ? args : ['@tauri-apps/cli', ...args];

const result = spawnSync(cmd, cmdArgs, {
    stdio: 'inherit',
    env,
    shell: true,
    cwd: path.resolve(__dirname, '..')
});

process.exit(result.status || 0);
