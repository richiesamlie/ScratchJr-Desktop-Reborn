const fs = require('fs');
const path = require('path');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function checkVersionLockstep({ rootDir = path.resolve(__dirname, '..'), expectedTag = null } = {}) {
    const checks = [];
    const errors = [];

    function record(file, ok, detail) {
        checks.push({ file, ok, detail });
        if (!ok) {
            errors.push(`${file}: ${detail}`);
        }
    }

    const pkgPath = path.join(rootDir, 'package.json');
    let pkg;
    try {
        pkg = readJson(pkgPath);
    } catch (err) {
        record('package.json', false, `cannot read/parse: ${err.message}`);
        return { ok: false, version: '', checks, errors };
    }

    const version = String(pkg.version || '');
    const semverMatch = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!semverMatch) {
        record('package.json', false, `invalid X.Y.Z version "${version}"`);
        return { ok: false, version, checks, errors };
    }

    if (expectedTag !== null && expectedTag !== undefined && expectedTag !== '') {
        const normalizedTag = String(expectedTag).replace(/^v/, '');
        if (normalizedTag !== version) {
            record('package.json', false, `version "${version}" does not match expected tag "${expectedTag}"`);
        } else {
            record('package.json', true, `${version} (matches tag ${expectedTag})`);
        }
    } else {
        record('package.json', true, version);
    }

    const expectedVersionCode = Number(semverMatch[1]) * 10000 + Number(semverMatch[2]) * 100 + Number(semverMatch[3]);

    // 2. package-lock.json
    try {
        const lock = readJson(path.join(rootDir, 'package-lock.json'));
        const rootVer = lock.version;
        const pkgVer = lock.packages && lock.packages[''] ? lock.packages[''].version : undefined;
        const ok = rootVer === version && pkgVer === version;
        record(
            'package-lock.json',
            ok,
            ok ? `${rootVer} (packages[""]=${pkgVer})` : `expected ${version}, got version=${rootVer}, packages[""].version=${pkgVer}`
        );
    } catch (err) {
        record('package-lock.json', false, `cannot read/parse: ${err.message}`);
    }

    // 3. version.json
    try {
        const vj = readJson(path.join(rootDir, 'version.json'));
        const errs = [];
        if (vj.version !== version) errs.push(`version=${vj.version}`);
        if (!String(vj.name || '').includes(`v${version}`)) errs.push(`name="${vj.name}" missing v${version}`);
        if (!String(vj.release_url || '').endsWith(`/v${version}`)) errs.push(`release_url="${vj.release_url}" does not end with /v${version}`);
        const downloads = vj.downloads && typeof vj.downloads === 'object' ? Object.entries(vj.downloads) : [];
        for (const [key, url] of downloads) {
            if (typeof url === 'string' && url.includes('/releases/download/') && !url.includes(`/releases/download/v${version}/`)) {
                errs.push(`downloads.${key}="${url}" missing /releases/download/v${version}/`);
            }
        }
        record('version.json', errs.length === 0, errs.length === 0 ? `${vj.version} (${downloads.length} download URLs)` : errs.join('; '));
    } catch (err) {
        record('version.json', false, `cannot read/parse: ${err.message}`);
    }

    // 4. src/app/settings.json
    try {
        const settings = readJson(path.join(rootDir, 'src', 'app', 'settings.json'));
        const expected = `desktop-v${version}`;
        const ok = settings.scratchJrVersion === expected;
        record('src/app/settings.json', ok, ok ? expected : `expected ${expected}, got ${settings.scratchJrVersion}`);
    } catch (err) {
        record('src/app/settings.json', false, `cannot read/parse: ${err.message}`);
    }

    // 5. src/app/sw.js
    try {
        const swText = fs.readFileSync(path.join(rootDir, 'src', 'app', 'sw.js'), 'utf8');
        const m = swText.match(/CACHE_NAME\s*=\s*['"]scratchjr-pwa-v([^'"]+)['"]/);
        const found = m ? m[1] : null;
        const ok = found === version;
        record('src/app/sw.js', ok, ok ? `scratchjr-pwa-v${found}` : `expected scratchjr-pwa-v${version}, got ${found}`);
    } catch (err) {
        record('src/app/sw.js', false, `cannot read: ${err.message}`);
    }

    // 6. src-tauri/Cargo.toml
    try {
        const cargoText = fs.readFileSync(path.join(rootDir, 'src-tauri', 'Cargo.toml'), 'utf8');
        const m = cargoText.match(/^\[package\][\s\S]*?^version\s*=\s*"([^"]+)"/m);
        const found = m ? m[1] : null;
        const ok = found === version;
        record('src-tauri/Cargo.toml', ok, ok ? found : `expected ${version}, got ${found}`);
    } catch (err) {
        record('src-tauri/Cargo.toml', false, `cannot read: ${err.message}`);
    }

    // 7. src-tauri/tauri.conf.json
    try {
        const tauriConf = readJson(path.join(rootDir, 'src-tauri', 'tauri.conf.json'));
        const ok = tauriConf.version === version;
        record('src-tauri/tauri.conf.json', ok, ok ? tauriConf.version : `expected ${version}, got ${tauriConf.version}`);
    } catch (err) {
        record('src-tauri/tauri.conf.json', false, `cannot read/parse: ${err.message}`);
    }

    // 8. android/app/build.gradle.kts
    try {
        const gradleText = fs.readFileSync(path.join(rootDir, 'android', 'app', 'build.gradle.kts'), 'utf8');
        const nameMatch = gradleText.match(/versionName\s*=\s*"([^"]+)"/);
        const codeMatch = gradleText.match(/versionCode\s*=\s*(\d+)/);
        const foundName = nameMatch ? nameMatch[1] : null;
        const foundCode = codeMatch ? Number(codeMatch[1]) : null;
        const ok = foundName === version && foundCode === expectedVersionCode;
        record(
            'android/app/build.gradle.kts',
            ok,
            ok
                ? `versionName=${foundName}, versionCode=${foundCode}`
                : `expected versionName=${version}, versionCode=${expectedVersionCode}; got versionName=${foundName}, versionCode=${foundCode}`
        );
    } catch (err) {
        record('android/app/build.gradle.kts', false, `cannot read: ${err.message}`);
    }

    // 9. docs/index.html
    try {
        const htmlText = fs.readFileSync(path.join(rootDir, 'docs', 'index.html'), 'utf8');
        const matches = [...htmlText.matchAll(/\/releases\/download\/v([^/]+)\//g)].map((m) => m[1]);
        const mismatched = matches.filter((v) => v !== version);
        const ok = matches.length > 0 && mismatched.length === 0;
        record(
            'docs/index.html',
            ok,
            ok
                ? `${matches.length} download link(s) at v${version}`
                : (matches.length === 0 ? 'no /releases/download/vX.Y.Z/ links found' : `mismatched versions: ${[...new Set(mismatched)].join(', ')}`)
        );
    } catch (err) {
        record('docs/index.html', false, `cannot read: ${err.message}`);
    }

    return {
        ok: errors.length === 0,
        version,
        checks,
        errors,
    };
}

function parseCliArgs(argv) {
    let expectedTag = null;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--tag=')) {
            expectedTag = arg.slice('--tag='.length);
        } else if (arg === '--tag' && i + 1 < argv.length) {
            expectedTag = argv[i + 1];
            i++;
        }
    }
    return { expectedTag };
}

if (require.main === module) {
    const { expectedTag } = parseCliArgs(process.argv.slice(2));
    const result = checkVersionLockstep({ expectedTag });
    for (const c of result.checks) {
        console.log(`${c.ok ? 'OK  ' : 'FAIL'} ${c.file}: ${c.detail}`);
    }
    if (!result.ok) {
        console.error(`\nVersion lockstep check failed (${result.errors.length} issue(s)).`);
        process.exit(1);
    }
    console.log(`\nVersion lockstep check passed (v${result.version}).`);
}

module.exports = { checkVersionLockstep };
