/**
 * Smoke test: launch the app, drive Start screen -> Lobby -> Editor via CDP,
 * and fail if any renderer exception fires or the editor never comes up.
 *
 * Usage: node scripts/smoke-test.js [--port 9334] [--timeout 90000]
 * Requires: npm run build:main first (build/main.js) and a built renderer bundle.
 * Side effect: creates one real project in Documents\ScratchJR.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
function argOf(name, dflt) {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : dflt;
}
const PORT = Number(argOf('--port', '9334'));
const TIMEOUT_MS = Number(argOf('--timeout', '90000'));
const BASE = `http://127.0.0.1:${PORT}`;

let electronPath;
try {
    electronPath = require('electron');
} catch (e) {
    console.error('smoke: cannot resolve electron binary:', e.message);
    process.exit(2);
}
if (typeof electronPath !== 'string') {
    console.error('smoke: resolved electron is not a path string — run from project root with plain node.');
    process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fetchJson(urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.get(BASE + urlPath, (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.setTimeout(2000, () => { req.destroy(new Error('http timeout')); });
    });
}

/** Poll /json/list until a page target matching urlPart shows up. */
async function waitForPage(urlPart, deadline) {
    while (Date.now() < deadline) {
        try {
            const targets = await fetchJson('/json/list');
            const page = targets.find((t) => t.type === 'page' && t.url.includes(urlPart));
            if (page) return page;
        } catch (_) { /* debugger endpoint not up yet */ }
        await sleep(250);
    }
    throw new Error(`smoke: timed out waiting for page matching "${urlPart}"`);
}

/** Minimal CDP-over-WebSocket session for one page target. */
class Session {
    constructor(wsUrl) {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.nextId = 1;
        this.pending = new Map();
        this.exceptions = [];
        this.consoleErrors = [];
    }

    connect() {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.wsUrl);
            this.ws = ws;
            ws.onopen = () => resolve();
            ws.onerror = (e) => reject(new Error('ws error'));
            ws.onmessage = (ev) => {
                const msg = JSON.parse(ev.data);
                if (msg.id && this.pending.has(msg.id)) {
                    const { resolve: res, reject: rej } = this.pending.get(msg.id);
                    this.pending.delete(msg.id);
                    if (msg.error) rej(new Error(msg.error.message));
                    else res(msg.result);
                    return;
                }
                if (msg.method === 'Runtime.exceptionThrown') {
                    const d = msg.params.exceptionDetails;
                    this.exceptions.push(d.text + (d.exception && d.exception.description ? ': ' + d.exception.description : ''));
                }
                if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
                    const text = msg.params.args.map((a) => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ');
                    this.consoleErrors.push(text);
                }
            };
        });
    }

    send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = this.nextId++;
            this.pending.set(id, { resolve, reject });
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }

    async enable() {
        await this.send('Runtime.enable');
    }

    /** Evaluate an expression; returns the JSON value. */
    async eval(expr) {
        const res = await this.send('Runtime.evaluate', {
            expression: expr,
            returnByValue: true,
            awaitPromise: true,
        });
        if (res.exceptionDetails) {
            throw new Error('eval failed: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
        }
        return res.result.value;
    }

    close() {
        try { this.ws.close(); } catch (_) { /* already gone */ }
    }
}

async function waitReady(session, extraExpr, label, deadline) {
    // extraExpr must become true once the page finished initializing.
    while (Date.now() < deadline) {
        const ok = await session.eval(
            `(document.readyState === 'complete' && !!window.scratchjr && !!(${extraExpr}))`
        ).catch(() => false);
        if (ok) return;
        await sleep(300);
    }
    throw new Error(`smoke: ${label} never became ready`);
}

async function main() {
    const buildMain = path.join(__dirname, '..', 'build', 'main.js');
    const bundle = path.join(__dirname, '..', 'src', 'app', 'dist', 'app.bundle.js');
    if (!fs.existsSync(buildMain)) { console.error('smoke: build/main.js missing — run npm run build:main'); process.exit(2); }
    if (!fs.existsSync(bundle)) { console.error('smoke: src/app/dist/app.bundle.js missing — run npm run build:renderer'); process.exit(2); }

    console.log(`smoke: launching electron on CDP port ${PORT} ...`);
    const child = spawn(electronPath, ['.', `--remote-debugging-port=${PORT}`], {
        cwd: path.join(__dirname, '..'),
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let mainLog = '';
    child.stdout.on('data', (d) => { mainLog += d.toString(); });
    child.stderr.on('data', (d) => { mainLog += d.toString(); });

    let exitCode = 0;
    const failures = [];

    const deadline0 = Date.now() + TIMEOUT_MS;
    try {
        // ---- Phase 1: start screen ----
        const t1 = await waitForPage('index.html', deadline0);
        const s1 = new Session(t1.webSocketDebuggerUrl);
        await s1.connect();
        await s1.enable();
        await waitReady(s1, 'true', 'start screen', deadline0);
        await sleep(1500); // let async init (audio, settings) settle
        console.log(`smoke: [start] loaded ${t1.url}`);
        const startExc = s1.exceptions.length;

        // ---- Phase 2: lobby (home.html) via the app's own navigation ----
        await s1.eval(`window.location.href = 'home.html';`);
        s1.close();
        const t2 = await waitForPage('home.html', deadline0);
        const s2 = new Session(t2.webSocketDebuggerUrl);
        await s2.connect();
        await s2.enable();
        await waitReady(s2, "!!document.getElementById('newproject')", 'lobby', deadline0);
        console.log('smoke: [lobby] loaded, new-project thumb present');
        const lobbyExc = s2.exceptions.length;

        // ---- Phase 3: create project -> editor, using the app's own handler ----
        const clicked = await s2.eval(`(function(){
            var el = document.getElementById('newproject');
            var r = el.getBoundingClientRect();
            var o = { bubbles: true, cancelable: true, view: window,
                      clientX: r.left + r.width/2, clientY: r.top + r.height/2, button: 0 };
            el.dispatchEvent(new MouseEvent('mousedown', o));
            el.dispatchEvent(new MouseEvent('mouseup', o));
            return true;
        })()`);
        if (!clicked) throw new Error('smoke: could not dispatch click on new-project thumb');
        s2.close();

        const t3 = await waitForPage('editor.html', deadline0);
        const s3 = new Session(t3.webSocketDebuggerUrl);
        await s3.connect();
        await s3.enable();
        await waitReady(s3, "!!document.getElementById('blockspalette')", 'editor', deadline0);
        await sleep(2500); // let editor finish async asset/db loads
        const editorOk = await s3.eval(
            `(!!window.ScratchJr) + '|' + (!!document.getElementById('stage'))`
        );
        console.log(`smoke: [editor] loaded ${t3.url}`);
        console.log(`smoke: [editor] ScratchJr exposed=${editorOk.split('|')[0]}, stage present=${editorOk.split('|')[1]}`);

        const totalExceptions = startExc + lobbyExc + s3.exceptions.length;
        const allConsoleErrors = [...s3.consoleErrors];
        console.log(`smoke: renderer exceptions: ${totalExceptions}`);
        if (allConsoleErrors.length) {
            console.log('smoke: console.error output (informational):');
            allConsoleErrors.forEach((l) => console.log('   ', l.slice(0, 300)));
        }

        if (totalExceptions > 0) {
            failures.push(`${totalExceptions} uncaught renderer exception(s)`);
        }
        // CSP hardening: any violation message is a regression, not noise.
        const cspViolations = allConsoleErrors.filter((l) => /Refused to|Content-Security-Policy/i.test(l));
        if (cspViolations.length) {
            failures.push(`${cspViolations.length} CSP violation(s): ${cspViolations[0].slice(0, 160)}`);
        }
        if (editorOk.split('|')[0] !== 'true') {
            failures.push('ScratchJr global not present in editor (shortcuts would be dead)');
        }

        // ---- Phase 5: media round-trip through the bridge lands as a file ----
        const probe = await s3.eval(`(async function(){
            const t = window.tablet;
            const name = await t.io_setmedia(btoa('smoke-media-probe'), 'png');
            const readBack = await t.io_getmedia(name);
            // io_getsettings returns "<documents>/ScratchJR,false,...", which also
            // tells this script where the media folder really lives.
            const settings = await t.io_getsettings();
            return [name, readBack === btoa('smoke-media-probe'), settings.split(',')[0]].join('|');
        })()`);
        const [probeName, probeOk, scratchRoot] = probe.split('|');
        console.log(`smoke: [media] round-trip ${probeName}: ${probeOk} (root: ${scratchRoot})`);
        if (probeOk !== 'true') failures.push('media round-trip through bridge failed');

        // ---- Phase 6: in-app help fragment ('book' tab -> Lobby.loadLink -> loadPage('inapp*')) ----
        await s3.eval(`window.location.href = 'home.html?place=book';`);
        s3.close();
        const t4 = await waitForPage('home.html?place=book', deadline0);
        const s4 = new Session(t4.webSocketDebuggerUrl);
        await s4.connect();
        await s4.enable();
        await waitReady(s4, "!!document.querySelector('.inappSubpage')", 'help page', deadline0);
        await sleep(1200);
        console.log(`smoke: [help] loaded ${t4.url}, exceptions=${s4.exceptions.length}`);
        if (s4.exceptions.length > 0) {
            failures.push(`${s4.exceptions.length} exception(s) on help page`);
        }
        s4.close();

        // ---- Phase 7: media is file-backed on disk (path reported by the app) ----
        if (!scratchRoot) {
            failures.push('could not determine ScratchJR data root');
        } else {
            const mediaDir = path.join(scratchRoot, 'media');
            let mediaCount = 0;
            try {
                mediaCount = fs.readdirSync(mediaDir).filter((f) => !f.endsWith('.tmp')).length;
            } catch (_) { /* dir missing */ }
            console.log(`smoke: [media] ${mediaCount} file(s) in ${mediaDir}`);
            if (mediaCount === 0) {
                failures.push('media dir empty — file-backed media not exercised');
            }
        }
        s3.close();
    } catch (err) {
        failures.push(err.message);
    }

    // ---- teardown ----
    try {
        const { execSync } = require('child_process');
        if (process.platform === 'win32') {
            execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
        } else {
            child.kill('SIGTERM');
        }
    } catch (_) { /* may have exited */ }
    await sleep(500);

    if (mainLog.includes('[SCRATCHJR_READY]')) {
        console.log('smoke: main process reported SCRATCHJR_READY');
    }
    if (child.exitCode === null && !failures.length) {
        // still running when we killed it == app stayed healthy
    }

    console.log('---- smoke log tail (main+renderer stdout/stderr) ----');
    const tail = mainLog.trim().split('\n').slice(-15).join('\n');
    if (tail) console.log(tail);

    if (failures.length) {
        console.error('\nsmoke: FAIL');
        failures.forEach((f) => console.error('  -', f));
        exitCode = 1;
    } else {
        console.log('\nsmoke: PASS (start -> lobby -> editor)');
    }
    process.exit(exitCode);
}

main();
