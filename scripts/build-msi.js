/**
 * Build Windows MSI installer from packaged app.
 *
 * Requires WiX 3.x binaries in out/wix3/ (downloaded by CI or manually).
 * Uses electron-wix-msi to generate the MSI from the packaged directory.
 *
 * Usage: node scripts/build-msi.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const WIX_DIR = path.join(__dirname, '..', 'out', 'wix3');
const APP_DIR = path.join(__dirname, '..', 'out', 'ScratchJr-win32-x64');
const OUT_DIR = path.join(__dirname, '..', 'out', 'installer');
const pkg = require('../package.json');

// Check prerequisites
if (!fs.existsSync(path.join(WIX_DIR, 'candle.exe'))) {
    console.error('WiX 3.x binaries not found in out/wix3/.');
    console.error('Download from https://github.com/wixtoolset/wix3/releases/tag/wix3141rtm');
    console.error('Extract wix314-binaries.zip into out/wix3/');
    process.exit(1);
}

if (!fs.existsSync(path.join(APP_DIR, 'ScratchJr.exe'))) {
    console.error('Packaged app not found in out/ScratchJr-win32-x64/.');
    console.error('Run "npm run make:zip" first.');
    process.exit(1);
}

// Create output directory
if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Generate WXS template using electron-wix-msi
const { MSICreator } = require('electron-wix-msi');

const creatorConfig = {
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    description: 'ScratchJr Desktop Edition',
    exe: 'ScratchJr',
    name: 'ScratchJr',
    manufacturer: 'ScratchJr Community',
    version: pkg.version,
    icon: path.join(__dirname, '..', 'src', 'icons', 'win', 'icon.ico'),
    ui: { chooseDirectory: true },
    upgradeCode: '{E4346E7F-98B4-4602-9FAA-5AF8C9844BA7}',
    arch: 'x64',
    defaultInstallMode: 'perMachine',
    extensions: ['WixUIExtension', 'WixUtilExtension']
};

if (process.env.CSC_LINK) {
    creatorConfig.certificateFile = process.env.CSC_LINK;
    if (process.env.CSC_KEY_PASSWORD) {
        creatorConfig.certificatePassword = process.env.CSC_KEY_PASSWORD;
    }
}

const creator = new MSICreator(creatorConfig);

console.log(`Building MSI installer for ScratchJr v${pkg.version}...`);

creator.create().then(({ wxsFile }) => {
    console.log('WXS template created:', wxsFile);

    // Inject database cleanup custom action + property into the WXS template
    const cleanupActionPath = path.join(__dirname, '..', 'src', 'installer', 'cleanup-action.wxs');
    if (fs.existsSync(cleanupActionPath)) {
        const cleanupFragment = fs.readFileSync(cleanupActionPath, 'utf8');
        let wxsContent = fs.readFileSync(wxsFile, 'utf8');
        if (wxsContent.includes('</Product>')) {
            wxsContent = wxsContent.replace('</Product>', `${cleanupFragment}\n  </Product>`);
            fs.writeFileSync(wxsFile, wxsContent, 'utf8');
            console.log('Injected database cleanup action into WXS template.');
        }
    }

    const cwd = path.dirname(wxsFile);
    const candle = path.join(WIX_DIR, 'candle.exe');
    const light = path.join(WIX_DIR, 'light.exe');

    // Compile
    console.log('Compiling with candle...');
    execSync(`"${candle}" -arch x64 -ext WixUIExtension -ext WixUtilExtension ScratchJr.wxs`, {
        cwd,
        stdio: 'inherit'
    });

    // Link
    console.log('Linking with light...');
    execSync(`"${light}" -ext WixUIExtension -ext WixUtilExtension -cultures:en-us ScratchJr.wixobj -out ScratchJr.msi`, {
        cwd,
        stdio: 'inherit'
    });

    // Report
    const msiPath = path.join(cwd, 'ScratchJr.msi');
    if (fs.existsSync(msiPath)) {
        const stats = fs.statSync(msiPath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        console.log(`\nMSI installer created: ${msiPath} (${sizeMB} MB)`);
    } else {
        console.error('MSI file not found after build.');
        process.exit(1);
    }
}).catch(err => {
    console.error('MSI build failed:', err.message);
    process.exit(1);
});
