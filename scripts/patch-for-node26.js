/**
 * Patches for Node.js 26 compatibility with cross-zip (used by @electron-forge/maker-zip)
 *
 * Run automatically via postinstall. Fixes:
 * - cross-zip: fs.rmdir({recursive}) / fs.rmdirSync({recursive}) removed in Node 26
 */

const fs = require('fs');
const path = require('path');

let totalDrift = 0;

function patchFile(filePath, patches) {
    if (!fs.existsSync(filePath)) {
        console.log(`  SKIP: ${filePath} not found`);
        return false;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let drifted = 0;
    for (const [search, replace] of patches) {
        if (content.includes(search)) {
            content = content.replace(search, replace);
            changed = true;
        } else if (!content.includes(replace)) {
            drifted++;
        }
    }
    totalDrift += drifted;
    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`  PATCHED: ${filePath}${drifted > 0 ? ` (${drifted} patch hunk(s) did not match upstream format)` : ''}`);
    } else if (drifted > 0) {
        console.warn(`  WARN: ${filePath} (${drifted} patch hunk(s) did not match search or replacement — upstream format may have drifted)`);
    } else {
        console.log(`  OK: ${filePath} (already patched)`);
    }
    return changed;
}

console.log('Applying Node 26 compatibility patches...');

// Patch cross-zip - fs.rmdir({recursive}) -> fs.rm
const crossZipPath = path.join(__dirname, '..', 'node_modules', 'cross-zip', 'index.js');
patchFile(crossZipPath, [
    [`fs.rmdir(outPath, { recursive: true, maxRetries: 3 }, doZip2)`, `fs.rm(outPath, { recursive: true, maxRetries: 3 }, doZip2)`],
    [`fs.rmdirSync(outPath, { recursive: true, maxRetries: 3 })`, `fs.rmSync(outPath, { recursive: true, maxRetries: 3 })`],
]);

console.log('Done.');

if (totalDrift > 0 && process.env.CI) {
    console.error(`ERROR: ${totalDrift} patch hunk(s) drifted in CI environment.`);
    process.exit(1);
}
