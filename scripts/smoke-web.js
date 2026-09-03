/**
 * Smoke test for ScratchJr Web & PWA distribution.
 *
 * Boots a local static server for dist-web/, launches headless Chrome via CDP,
 * verifies Start -> Lobby -> Editor, checks IndexedDB storage, and exits 0.
 *
 * Usage: node scripts/smoke-web.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { sleep, waitForPage, Session, waitReady } = require('./cdp-session');

const PORT = 8188;
const CDP_PORT = 9555;
const BASE = `http://127.0.0.1:${CDP_PORT}`;
const distWebDir = path.resolve(__dirname, '..', 'dist-web');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.wasm': 'application/wasm',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.webm': 'audio/webm'
};

function startStaticServer() {
    const server = http.createServer((req, res) => {
        let reqPath = req.url.split('?')[0];
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
        const filePath = path.join(distWebDir, reqPath.replace(/^\//, ''));

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found: ' + reqPath);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
    });

    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            console.log(`smoke-web: static server listening on http://127.0.0.1:${port}`);
            resolve({ server, port });
        });
    });
}

function findChromePath() {
    const candidates = [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

async function waitForReady(session, expr, label, deadline) {
    while (Date.now() < deadline) {
        const ok = await session.eval(
            "(document.readyState === 'complete' && !!(" + expr + "))"
        ).catch(() => false);
        if (ok) return;
        await sleep(300);
    }
    throw new Error('smoke-web: ' + label + ' never became ready');
}

async function main() {
    if (!fs.existsSync(path.join(distWebDir, 'app', 'index.html'))) {
        console.error('smoke-web: dist-web not built. Run npm run build:web first.');
        process.exit(1);
    }

    const chromePath = findChromePath();
    if (!chromePath) {
        console.error('smoke-web: could not find Chrome/Edge browser binary.');
        process.exit(1);
    }

    const { server, port } = await startStaticServer();
    const tempProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'scratchjr-web-smoke-'));

    console.log(`smoke-web: launching Chrome with CDP port ${CDP_PORT}...`);
    const browser = spawn(chromePath, [
        `--remote-debugging-port=${CDP_PORT}`,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        `http://127.0.0.1:${port}/app/index.html`
    ], {
        stdio: 'ignore'
    });

    const deadline = Date.now() + 45000;
    try {
        // 1. Wait for start screen
        console.log('smoke-web: waiting for Start Screen (index.html)...');
        const startTarget = await waitForPage(BASE, 'index.html', deadline, 'smoke-web');
        const s1 = new Session(startTarget.webSocketDebuggerUrl);
        await s1.connect();
        await s1.enable();
        await waitForReady(s1, 'typeof window.tablet === "object"', 'start screen tablet interface', deadline);
        await sleep(1000);
        console.log('smoke-web: [start] tablet interface loaded, exceptions:', s1.exceptions.length);
        if (s1.exceptions.length > 0) {
            console.warn('smoke-web: exceptions on start screen:', s1.exceptions);
        }

        // 2. Navigate to lobby
        console.log('smoke-web: navigating to Lobby (home.html)...');
        await s1.eval('window.location.href = "home.html";');
        await sleep(1500);

        const homeTarget = await waitForPage(BASE, 'home.html', deadline, 'smoke-web');
        const s2 = new Session(homeTarget.webSocketDebuggerUrl);
        await s2.connect();
        await s2.enable();
        await sleep(1500);
        console.log('smoke-web: [lobby] connected. Exceptions:', s2.exceptions);
        const bodyContent = await s2.eval('document.body ? document.body.innerHTML.substring(0, 400) : "no-body"').catch(e => e.message);
        console.log('smoke-web: [lobby] body snippet:', bodyContent);
        const readyState = await s2.eval('document.readyState').catch(e => e.message);
        const tabletPresent = await s2.eval('typeof window.tablet').catch(e => e.message);
        console.log('smoke-web: [lobby] readyState:', readyState, 'tablet:', tabletPresent);
        await waitForReady(s2, 'document.getElementById("newproject") != null', 'lobby newproject thumb', deadline);
        console.log('smoke-web: [lobby] loaded newproject thumb, exceptions:', s2.exceptions.length);

        // 3. Create project -> navigate to editor
        console.log('smoke-web: clicking new project to open editor...');
        const clicked = await s2.eval(`(function(){
            var el = document.getElementById('newproject');
            var r = el.getBoundingClientRect();
            var o = { bubbles: true, cancelable: true, view: window,
                      clientX: r.left + r.width/2, clientY: r.top + r.height/2, button: 0 };
            el.dispatchEvent(new MouseEvent('mousedown', o));
            el.dispatchEvent(new MouseEvent('mouseup', o));
            return true;
        })()`);
        if (!clicked) throw new Error('smoke-web: could not click new project');
        s2.close();

        const editorTarget = await waitForPage(BASE, 'editor.html', deadline, 'smoke-web');
        const s3 = new Session(editorTarget.webSocketDebuggerUrl);
        await s3.connect();
        await s3.enable();
        await waitForReady(s3, '!!document.getElementById("blockspalette") && !!window.ScratchJr', 'editor stage', deadline);
        await sleep(2500);
        console.log(`smoke-web: [editor] loaded ${editorTarget.url}`);
        console.log('smoke-web: [editor] ScratchJr ready, exceptions:', s3.exceptions.length);

        // 4. Verify in-browser SQLite database operation
        const dbVerification = await s3.eval(`
            new Promise(function(resolve) {
                window.tablet.database_query(JSON.stringify({ op: 'select', table: 'projects' })).then(function(res) {
                    resolve(res);
                });
            });
        `);
        console.log('smoke-web: [database] projects query returned:', dbVerification);
        const parsedProjects = JSON.parse(dbVerification || '[]');
        if (parsedProjects.length === 0) {
            throw new Error('smoke-web: expected at least 1 project in database, got 0');
        }
        console.log(`smoke-web: [database] verified project created: id=${parsedProjects[0].id}, name="${parsedProjects[0].name}"`);

        // 5. Save project and navigate back to lobby to verify thumbnail
        console.log('smoke-web: saving project and returning to Lobby to verify thumbnail...');
        await s3.eval(`new Promise(function(resolve) {
            window.ScratchJr.changed = true;
            window.ScratchJr.saveProject(new Event('mousedown'), function() {
                window.location.href = 'home.html?place=home&timestamp=' + Date.now();
                resolve(true);
            });
        })`);
        s3.close();

        const lobby2Target = await waitForPage(BASE, 'home.html', deadline, 'smoke-web');
        const s4 = new Session(lobby2Target.webSocketDebuggerUrl);
        await s4.connect();
        await s4.enable();
        await waitForReady(s4, 'document.querySelectorAll("#wrapc img").length > 0', 'lobby thumbnail images', deadline);
        await sleep(1500);

        const thumbSrc = await s4.eval(`(function(){
            var imgs = document.querySelectorAll('#wrapc img');
            for (var i = 0; i < imgs.length; i++) {
                if (imgs[i].src && imgs[i].src.indexOf('data:image/png') === 0) {
                    return imgs[i].src;
                }
            }
            return imgs.length > 0 ? imgs[0].src : '';
        })()`);

        console.log('smoke-web: [thumbnail] project thumb src prefix:', (thumbSrc || '').substring(0, 50), 'total length:', (thumbSrc || '').length);
        if (!thumbSrc || thumbSrc.indexOf('data:image/png;base64,') !== 0 || thumbSrc.length < 100) {
            throw new Error('smoke-web: invalid or broken project thumbnail src: ' + thumbSrc);
        }
        console.log('smoke-web: [thumbnail] project thumbnail successfully rendered!');

        // 6. Test Lobby Project Controls (Delete, Export, Duplicate)
        console.log('smoke-web: testing Lobby project controls...');
        const controlsVisible = await s4.eval(`(function(){
            var cards = document.querySelectorAll('.projectthumb');
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].id && cards[i].id !== 'newproject' && cards[i].id !== 'openproject') {
                    cards[i].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
                    var exp = cards[i].querySelector('.exportbtn');
                    return exp && exp.style.visibility === 'visible';
                }
            }
            return false;
        })()`);
        console.log('smoke-web: [controls] export button visible on card:', controlsVisible);
        if (!controlsVisible) {
            throw new Error('smoke-web: exportbtn not visible on project card contextmenu');
        }

        const screenshotRes = await s4.send('Page.captureScreenshot', { format: 'png' });
        if (screenshotRes && screenshotRes.data) {
            const outPath = 'C:\\Users\\dewa5\\.gemini\\antigravity\\brain\\2552c6aa-02db-47cd-922c-458c0bfaadad\\lobby_with_export.png';
            fs.writeFileSync(outPath, Buffer.from(screenshotRes.data, 'base64'));
            console.log('smoke-web: [screenshot] saved lobby card controls:', outPath);
        }

        // 7. Click export button and capture exported b64
        console.log('smoke-web: clicking export button to test export + import roundtrip...');
        const exportResult = await s4.eval(`
            new Promise(function(resolve, reject) {
                var originalSend = window.scratchjr.sendExportedSjr;
                window.scratchjr.sendExportedSjr = function(b64, name) {
                    console.log('Intercepted export: name=' + name + ', b64 length=' + (b64 ? b64.length : 0));
                    window.scratchjr.sendExportedSjr = originalSend;
                    resolve({ b64: b64, name: name });
                };
                var btn = document.querySelector('.projectthumb .exportbtn');
                if (!btn) return reject(new Error('no exportbtn found'));
                btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            })
        `);
        console.log('smoke-web: [export] successfully intercepted export payload:', exportResult ? { name: exportResult.name, b64length: exportResult.b64?.length } : null);
        if (!exportResult || !exportResult.b64 || exportResult.b64.length < 50) {
            throw new Error('smoke-web: export failed or returned empty payload');
        }

        // 8. Test importing this b64 payload using PlatformBridge.loadProjectFromSjr.
        // The reload override is a no-op in modern Chrome (location.reload is
        // non-writable), so the page actually reloads — which is the real user
        // flow we want to verify anyway.
        console.log('smoke-web: verifying import of exported payload...');
        const preImportIds = await s4.eval(`(function(){
            return Array.prototype.slice.call(document.querySelectorAll('.projectthumb')).map(function(c) { return c.id; });
        })()`);
        console.log('smoke-web: [import] card ids before import:', JSON.stringify(preImportIds));
        const importSuccess = await s4.eval(`
            new Promise(function(resolve, reject) {
                var bridge = window.PlatformBridge;
                if (!bridge || !bridge.loadProjectFromSjr) {
                    return reject(new Error('no loadProjectFromSjr found on PlatformBridge'));
                }
                bridge.loadProjectFromSjr(${JSON.stringify(exportResult.b64)}).then(function() {
                    resolve(true);
                }).catch(reject);
            })
        `);
        console.log('smoke-web: [import] loadProjectFromSjr succeeded:', importSuccess);

        // 9. After the post-import reload, the lobby must show a NEW project
        // card at the TOP (ctime DESC). Regression for: rows with NULL ctime
        // sorted last, and rows without a thumbnail silently dropped.
        const deadline9 = Date.now() + 20000;
        let cards = null;
        while (Date.now() < deadline9) {
            await sleep(500);
            cards = await s4.eval(`(function(){
                var cards = [];
                document.querySelectorAll('.projectthumb').forEach(function(c) {
                    cards.push({ id: c.id, name: (c.querySelector('h4') || {}).textContent });
                });
                return cards;
            })()`).catch(() => null);
            if (cards && cards.length === preImportIds.length + 1) break;
        }
        console.log('smoke-web: [lobby-after-import] cards:', JSON.stringify(cards));
        if (!cards || cards.length !== preImportIds.length + 1) {
            throw new Error('smoke-web: imported project card missing from lobby after reload');
        }
        const importedCard = cards.find((c) => c.id !== 'newproject' && c.id !== 'openproject');
        if (!importedCard || preImportIds.indexOf(importedCard.id) >= 0) {
            throw new Error('smoke-web: no new card appeared at top of lobby');
        }
        console.log('smoke-web: [lobby-after-import] imported card at top:', JSON.stringify(importedCard));

        // 10. The imported card must render its thumbnail image (src set to a
        // data URL). Diagnose where it breaks if not.
        await sleep(1500); // allow async getAsset -> img.src
        const thumbDiag = await s4.eval(`(function(){
            var card = document.getElementById('${importedCard.id}');
            var img = card ? card.querySelector('img') : null;
            var host = window.scratchjr || window.tablet;
            if (!host) return Promise.resolve({ error: 'no host' });
            var rowThumb = null;
            var mediaProbe = null;
            var p1 = host.database_query(JSON.stringify({
                op: 'select', table: 'projects', items: ['id', 'thumbnail', 'name'],
                where: [{ col: 'id', op: '=', value: '${importedCard.id}' }]
            })).then(function(res) {
                var rows = JSON.parse(res || '[]');
                rowThumb = rows.length ? rows[0].thumbnail : 'NO ROW';
                try { rowThumb = JSON.parse(rowThumb); } catch (_) {}
                return host.io_getmedia((rowThumb && rowThumb.md5) || 'x');
            }).then(function(media) { mediaProbe = String(media).substring(0, 40); });
            return Promise.all([p1]).then(function() {
                return {
                    imgFound: !!img,
                    srcPrefix: img && img.src ? img.src.substring(0, 40) : null,
                    srcLen: img && img.src ? img.src.length : 0,
                    rowThumb: rowThumb,
                    mediaProbe: mediaProbe
                };
            });
        })()`);
        console.log('smoke-web: [lobby-after-import] thumb diag:', JSON.stringify(thumbDiag));
        if (!thumbDiag.imgFound || !thumbDiag.srcPrefix || thumbDiag.srcPrefix.indexOf('data:image') !== 0) {
            throw new Error('smoke-web: imported project card has no thumbnail image: ' + JSON.stringify(thumbDiag));
        }

        // 11. Ctrl+S export of a NEVER-SAVED project must include a thumbnail.
        // Regression: zipProject reads the DB row, which had NULL json/thumbnail
        // until the first save. The export handler now saves before zipping.
        // Navigate: lobby -> new project -> editor, then triggerExportProject
        // immediately (no edits, never saved).
        s4.close();
        const lobbyTarget2 = await waitForPage(BASE, 'home.html', Date.now() + 15000, 'smoke-web');
        const s5 = new Session(lobbyTarget2.webSocketDebuggerUrl);
        await s5.connect();
        await s5.enable();
        await waitForReady(s5, 'document.getElementById("newproject") != null', 'lobby for fresh export', Date.now() + 15000);
        await s5.eval(`(function(){
            var el = document.getElementById('newproject');
            var r = el.getBoundingClientRect();
            var o = { bubbles: true, cancelable: true, view: window,
                      clientX: r.left + r.width/2, clientY: r.top + r.height/2, button: 0 };
            el.dispatchEvent(new MouseEvent('mousedown', o));
            el.dispatchEvent(new MouseEvent('mouseup', o));
            return true;
        })()`);
        s5.close();
        const editorTarget2 = await waitForPage(BASE, 'editor.html', Date.now() + 20000, 'smoke-web');
        // Old editor target may still be listed; find the NEW one (different ws url from the first editor session)
        const s6 = new Session(editorTarget2.webSocketDebuggerUrl);
        await s6.connect();
        await s6.enable();
        await waitForReady(s6, '!!document.getElementById("blockspalette") && !!window.ScratchJr', 'editor 2 ready', Date.now() + 20000);
        await sleep(2500); // let the editor finish loading the fresh project

        const freshExport = await s6.eval(`
            new Promise(function(resolve, reject) {
                var originalSend = window.scratchjr.sendExportedSjr;
                window.scratchjr.sendExportedSjr = function(b64, name) {
                    window.scratchjr.sendExportedSjr = originalSend;
                    resolve({ b64: b64, name: name });
                };
                window.scratchjr.triggerExportProject();
                setTimeout(function() { reject(new Error('export never fired')); }, 10000);
            })
        `);
        const freshDiag = await s6.eval(`(function(){
            var b64 = ${JSON.stringify(freshExport.b64)};
            var host = window.scratchjr;
            return host.database_query(JSON.stringify({
                op: 'select', table: 'projects', items: ['id', 'name', 'thumbnail', 'json'],
                where: [{ col: 'id', op: '=', value: String(window.ScratchJr.currentProject) }]
            })).then(function(res) {
                var rows = JSON.parse(res || '[]');
                var row = rows.length ? rows[0] : null;
                return {
                    b64len: b64.length,
                    name: row ? row.name : 'NO ROW',
                    hasThumbnail: row ? !!row.thumbnail : false,
                    hasJson: row ? !!row.json : false
                };
            });
        })()`).catch(e => ({ error: e.message }));
        console.log('smoke-web: [fresh-export] unsaved-project export diag:', JSON.stringify(freshDiag));
        if (!freshDiag || freshDiag.error || !freshDiag.hasThumbnail || !freshDiag.hasJson) {
            throw new Error('smoke-web: Ctrl+S export of unsaved project lacks thumbnail/json: ' + JSON.stringify(freshDiag));
        }
        if (freshDiag.b64len < 1000) {
            throw new Error('smoke-web: export payload suspiciously small: ' + JSON.stringify(freshDiag));
        }

        console.log('\n=========================================');
        console.log('✅ smoke-web: PASS (start -> lobby -> editor -> sql.js -> thumbnail -> export -> import -> lobby query -> fresh export)');
        console.log('=========================================\n');
    } catch (err) {
        console.error('smoke-web: FAILED:', err);
        process.exitCode = 1;
    } finally {
        browser.kill();
        server.close();
        try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (_) {}
    }
}

main();
