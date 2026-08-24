/**
 * Interaction tests: drive real pointer drags through Chromium's input
 * pipeline (CDP Input domain) and assert on engine-model outcomes.
 *
 * Regression net for the DOM-expando replacement: these flows depend on the
 * div.owner object graph, global-id lookups and drag geometry — exactly what
 * jsdom cannot fake meaningfully.
 *
 * Usage: node scripts/interaction-test.js [--port 9377]
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
const PORT = Number(argOf('--port', '9377'));
const TIMEOUT_MS = Number(argOf('--timeout', '90000'));
const BASE = 'http://127.0.0.1:' + PORT;

let electronPath;
try {
    electronPath = require('electron');
} catch (e) {
    console.error('interact: cannot resolve electron binary:', e.message);
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

async function waitForPage(urlPart, deadline) {
    while (Date.now() < deadline) {
        try {
            const targets = await fetchJson('/json/list');
            const page = targets.find((t) =>
                t.type === 'page' &&
                typeof t.url === 'string' &&
                t.url.includes(urlPart) &&
                typeof t.webSocketDebuggerUrl === 'string' &&
                t.webSocketDebuggerUrl.length > 0
            );
            if (page) return page;
        } catch (_) { /* endpoint not up yet */ }
        await sleep(250);
    }
    throw new Error('interact: timed out waiting for page matching "' + urlPart + '"');
}

class Session {
    constructor(wsUrl) {
        if (!wsUrl || wsUrl === 'undefined') {
            throw new Error('Session constructed without ws url');
        }
        this.wsUrl = wsUrl;
        this.ws = null;
        this.nextId = 1;
        this.pending = new Map();
        this.exceptions = [];
    }

    connect() {
        const wsUrl = this.wsUrl;
        return new Promise((resolve, reject) => {
            let ws;
            try {
                ws = new WebSocket(wsUrl);
            } catch (e) {
                reject(new Error("WebSocket('" + wsUrl + "') -> " + e.message));
                return;
            }
            this.ws = ws;
            ws.onopen = () => resolve();
            ws.onerror = () => reject(new Error('ws error'));
            ws.onmessage = (ev) => {
                const msg = JSON.parse(ev.data);
                if (msg.id && this.pending.has(msg.id)) {
                    const entry = this.pending.get(msg.id);
                    this.pending.delete(msg.id);
                    if (msg.error) entry.reject(new Error(msg.error.message));
                    else entry.resolve(msg.result);
                    return;
                }
                if (msg.method === 'Runtime.exceptionThrown') {
                    const d = msg.params.exceptionDetails;
                    this.exceptions.push(d.text + (d.exception && d.exception.description ? ': ' + d.exception.description : ''));
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

    async enableRuntime() {
        await this.send('Runtime.enable');
    }

    async eval(expr) {
        const res = await this.send('Runtime.evaluate', {
            expression: expr,
            returnByValue: true,
            awaitPromise: true,
        });
        if (res.exceptionDetails) {
            throw new Error('eval failed: ' + (res.result?.result?.description || res.exceptionDetails.exception?.description || res.exceptionDetails.text));
        }
        return res.result.value;
    }

    close() {
        try { this.ws.close(); } catch (_) { /* already gone */ }
    }
}

async function waitReady(session, extraExpr, label, deadline) {
    while (Date.now() < deadline) {
        const ok = await session.eval(
            "(document.readyState === 'complete' && !!window.scratchjr && !!(" + extraExpr + '))'
        ).catch(() => false);
        if (ok) return;
        await sleep(300);
    }
    throw new Error('interact: ' + label + ' never became ready');
}

async function centerOf(session, jsExpr) {
    const r = await session.eval('(function(){' +
        'var el = (' + jsExpr + ');' +
        'if (!el) return null;' +
        'var b = el.getBoundingClientRect();' +
        'return { x: b.x + b.width/2, y: b.y + b.height/2 };' +
    '})()');
    if (!r) throw new Error('interact: could not locate element for ' + jsExpr.slice(0, 60));
    return r;
}

async function dragMouse(session, from, to, steps = 10) {
    await session.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1,
    });
    for (let i = 1; i <= steps; i++) {
        await sleep(25);
        await session.send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: Math.round(from.x + (to.x - from.x) * i / steps),
            y: Math.round(from.y + (to.y - from.y) * i / steps),
            buttons: 1,
        });
    }
    await session.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: to.x, y: to.y, button: 'left', clickCount: 1,
    });
    await sleep(200); // let drop handlers settle
}

function approx(actual, expected, tolerance) {
    return Math.abs(actual - expected) <= tolerance;
}

async function main() {
    const buildMain = path.join(__dirname, '..', 'build', 'main.js');
    const bundle = path.join(__dirname, '..', 'src', 'app', 'dist', 'app.bundle.js');
    if (!fs.existsSync(buildMain)) { console.error('interact: build/main.js missing'); process.exit(2); }
    if (!fs.existsSync(bundle)) { console.error('interact: src/app/dist/app.bundle.js missing'); process.exit(2); }

    console.log('interact: launching electron on CDP port ' + PORT + ' ...');
    const child = spawn(electronPath, ['.', '--remote-debugging-port=' + PORT], {
        cwd: path.join(__dirname, '..'),
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let mainLog = '';
    child.stdout.on('data', (d) => { mainLog += d.toString(); });
    child.stderr.on('data', (d) => { mainLog += d.toString(); });

    const failures = [];
    const deadline = Date.now() + TIMEOUT_MS;

    try {
        // ---- boot to editor ----
        const t1 = await waitForPage('index.html', deadline);
        const s1 = new Session(t1.webSocketDebuggerUrl);
        await s1.connect();
        await s1.enableRuntime();
        await waitReady(s1, 'true', 'start screen', deadline);
        const isTouch = await s1.eval("('ontouchstart' in window)");
        console.log('interact: [env] isTouch=' + isTouch);

        await s1.eval("window.location.href = 'home.html';");
        s1.close();

        const t2 = await waitForPage('home.html', deadline);
        console.log('interact: [debug] home target ws present=' + !!t2.webSocketDebuggerUrl);
        const s2 = new Session(t2.webSocketDebuggerUrl);
        await s2.connect();
        await s2.enableRuntime();
        await waitReady(s2, "!!document.getElementById('newproject')", 'lobby', deadline);

        const clicked = await s2.eval("(function(){" +
            "var el = document.getElementById('newproject');" +
            "var r = el.getBoundingClientRect();" +
            "var o = { bubbles: true, cancelable: true, view: window," +
            " clientX: r.left + r.width/2, clientY: r.top + r.height/2, button: 0 };" +
            "el.dispatchEvent(new MouseEvent('mousedown', o));" +
            "el.dispatchEvent(new MouseEvent('mouseup', o));" +
            'return true; })()');
        if (!clicked) throw new Error('could not create project');
        s2.close();

        const t3 = await waitForPage('editor.html', deadline);
        const s3 = new Session(t3.webSocketDebuggerUrl);
        await s3.connect();
        await s3.enableRuntime();
        await waitReady(s3, "!!document.getElementById('blockspalette')", 'editor', deadline);
        await sleep(2000);

        const sprId = await s3.eval("JSON.parse(window.ScratchJr.stage.currentPage.sprites)[0]");
        console.log('interact: [editor] sprite id = ' + sprId);

        // ---- Scenario 1: stage sprite drag moves the model ----
        {
            const before = await s3.eval("(function(){var s=window.__modelRefs.getModelRefAs(document.getElementById('" + sprId + "'), 'sprite'); return {x:s.xcoor, y:s.ycoor};})()");
            let moved = false;
            let dirOk = false;
            let dx = 0;
            let dy = 0;
            for (let attempt = 0; attempt < 3 && !moved; attempt++) {
                if (attempt > 0) await sleep(1200);
                const from = await centerOf(s3, "document.getElementById('" + sprId + "')");
                await s3.send('Input.dispatchMouseEvent', {
                    type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1,
                });
                await sleep(60);
                await s3.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x + 8, y: from.y + 6, buttons: 1 });
                const grabbed = await s3.eval('!!window.onmousemove');
                if (!grabbed) {
                    await s3.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: from.x + 8, y: from.y + 6, button: 'left', clickCount: 1 });
                    continue;
                }
                for (let i = 1; i <= 10; i++) {
                    await sleep(25);
                    await s3.send('Input.dispatchMouseEvent', {
                        type: 'mouseMoved',
                        x: Math.round(from.x + 8 + 70 * i / 10),
                        y: Math.round(from.y + 6 + 45 * i / 10),
                        buttons: 1,
                    });
                }
                await s3.send('Input.dispatchMouseEvent', {
                    type: 'mouseReleased', x: from.x + 78, y: from.y + 51, button: 'left', clickCount: 1,
                });
                await sleep(200);
                const after = await s3.eval("(function(){var s=window.__modelRefs.getModelRefAs(document.getElementById('" + sprId + "'), 'sprite'); return {x:s.xcoor, y:s.ycoor};})()");
                dx = after.x - before.x;
                dy = after.y - before.y;
                moved = (Math.abs(dx) > 20 || Math.abs(dy) > 12);
                dirOk = (dx > 0) && (dy > 0);
            }
            console.log('interact: [drag-sprite] delta=(' + dx.toFixed(1) + ', ' + dy.toFixed(1) + ') moved=' + moved + ' dirOk=' + dirOk);
            if (!(moved && dirOk)) {
                failures.push('sprite drag did not move the model (dx=' + dx + ', dy=' + dy + ')');
            }
        }

        // ---- Scenario 2: palette -> scripts block drop ----
        {
            const targetRect = await s3.eval(`(function(){
                var el = document.getElementById('scriptscontainer');
                if (!el) return null;
                var b = el.getBoundingClientRect();
                return { x: b.x, y: b.y, w: b.width, h: b.height };
            })()`);
            if (!targetRect) throw new Error('scriptscontainer not found');

            // Sweep candidate drop points across the scripts workspace.
            const fractions = [[0.3, 0.3], [0.5, 0.3], [0.7, 0.3], [0.3, 0.6], [0.5, 0.6], [0.7, 0.6]];
            let docked = false;
            for (const frac of fractions) {
                const src = await s3.eval(`(function(){
                    var R = window.__modelRefs;
                    var vw = window.innerWidth, vh = window.innerHeight;
                    var pal = document.getElementById('palette');
                    if (!pal) return null;
                    for (var i = 0; i < pal.childElementCount; i++) {
                        var el = pal.childNodes[i];
                        var o = R.getModelRefAs(el, 'block');
                        if (!o || o.blocktype !== 'forward') continue;
                        var b = el.getBoundingClientRect();
                        if (b.width < 10 || b.height < 10) continue;
                        if (b.left < 0 || b.top < 0 || b.right > vw || b.bottom > vh) continue;
                        return { x: b.x + b.width/2, y: b.y + b.height/2 };
                    }
                    return null;
                })()`);
                if (!src) throw new Error('no visible palette hop block found');

                const to = {
                    x: Math.round(targetRect.x + targetRect.w * frac[0]),
                    y: Math.round(targetRect.y + targetRect.h * frac[1]),
                };
                const hit = await s3.eval(`(function(){
                    var el = document.elementFromPoint(${to.x}, ${to.y});
                    if (!el) return 'none';
                    var path = [];
                    while (el && path.length < 3) { path.push(el.id || el.className || el.tagName); el = el.parentElement; }
                    return path.join(' < ');
                })()`);

                await dragMouse(s3, src, to);

                const state = await s3.eval(`(function(){
                    var R = window.__modelRefs;
                    var sc = document.getElementById('${sprId}_scripts');
                    if (!sc) return null;
                    var strips = [];
                    for (var i = 0; i < sc.childElementCount; i++) {
                        var o = R.getModelRefAs(sc.childNodes[i], 'block');
                        var types = [];
                        while (o && o.blocktype) { types.push(o.blocktype); o = o.next; }
                        if (types.length) strips.push(types.join('>'));
                    }
                    return { kids: sc.childElementCount, strips: strips };
                })()`);
                console.log('interact: [drop-block] try (' + to.x + ',' + to.y + ') hit=' + hit +
                    ' kids=' + state.kids + ' strips=' + JSON.stringify(state.strips));
                if (state.strips.length > 0 && state.strips[0].indexOf('forward') === 0) { docked = true; break; }
            }

            if (!docked) {
                failures.push('palette->scripts block drop did not dock a forward block');
            }
        }

        // ---- Scenario 3: undo replays the sprite drag ----
        {
            const before = await s3.eval("(function(){var s=window.__modelRefs.getModelRefAs(document.getElementById('" + sprId + "'), 'sprite'); return {x:s.xcoor, y:s.ycoor};})()");
            await s3.eval("Undo.prevStep({ preventDefault(){}, stopPropagation(){}, timeStamp: performance.now() });");
            const after = await s3.eval("(function(){var s=window.__modelRefs.getModelRefAs(document.getElementById('" + sprId + "'), 'sprite'); return {x:s.xcoor, y:s.ycoor};})()");
            const reverted = approx(after.x, before.x, 6) && approx(after.y, before.y, 6);
            console.log('interact: [undo-drag] restored=(' + after.x.toFixed(1) + ', ' + after.y.toFixed(1) + ') preDrag=(' + before.x.toFixed(1) + ', ' + before.y.toFixed(1) + ') ok=' + reverted);
            if (!reverted) failures.push('undo did not restore dragged sprite position');
        }

        // ---- Scenario 4: .sjr export -> import round-trip ----
        {
            const qCount = `(async () => {
                const res = await window.scratchjr.database_query(JSON.stringify({
                    op: 'select', table: 'projects', items: ['id'],
                    where: [{ col: 'deleted', op: '=', value: 'NO' }]
                }));
                return JSON.parse(res).length;
            })()`;
            const countBefore = await s3.eval(qCount);

            // Kick off export without awaiting across the bridge; poll for the
            // result stored on window (long-lived awaited promises can be
            // collected if the context churns).
            await s3.eval(`(function(){
                window.__exportedB64 = null;
                window.__ioDebug.zipProject(window.ScratchJr.currentProject, function (c) {
                    window.__exportedB64 = c;
                });
            })()`);
            let b64 = null;
            for (let i = 0; i < 50 && !b64; i++) {
                await sleep(200);
                b64 = await s3.eval('window.__exportedB64');
            }
            if (!b64 || b64.length < 100) throw new Error('zipProject produced no data');
            console.log('interact: [sjr-roundtrip] exported ' + b64.length + ' chars');

            await s3.eval(`(function(){
                var data = window.__exportedB64;
                window.__exportedB64 = null;
                window.__ioDebug.loadProjectFromSjr(data);
            })()`);

            let countAfter = countBefore;
            for (let i = 0; i < 25; i++) {
                await sleep(400);
                countAfter = await s3.eval(qCount);
                if (countAfter > countBefore) break;
            }
            console.log('interact: [sjr-roundtrip] projects ' + countBefore + ' -> ' + countAfter);
            if (countAfter <= countBefore) {
                failures.push('.sjr import round-trip did not create a project row');
            }
        }

        // ---- Scenario 5: stage PNG export compositor + bridge wiring ----
        {
            const info = await s3.eval(`(function(){
                var page = ScratchJr.stage.currentPage;
                var canvas = page.renderStageToCanvas(2);
                var url = canvas.toDataURL('image/png');
                return {
                    ok: url.indexOf('data:image/png;base64,') === 0,
                    w: canvas.width, h: canvas.height,
                    bridge: typeof window.scratchjr.onExportStageRequest === 'function' &&
                            typeof window.scratchjr.sendExportedPng === 'function'
                };
            })()`);
            console.log('interact: [export-png] ' + JSON.stringify(info));
            if (!(info.ok && info.w === 960 && info.h === 720 && info.bridge)) {
                failures.push('stage PNG export compositor/bridge check failed: ' + JSON.stringify(info));
            }
        }

        s3.close();
    } catch (err) {
        failures.push(err.message + '\n' + (err.stack || '').split('\n').slice(0, 4).join('\n'));
    }

    try {
        const { execSync } = require('child_process');
        if (process.platform === 'win32') {
            execSync('taskkill /pid ' + child.pid + ' /T /F', { stdio: 'ignore' });
        } else {
            child.kill('SIGTERM');
        }
    } catch (_) { /* may have exited */ }
    await sleep(400);

    if (failures.length) {
        console.error('\ninteract: FAIL');
        failures.forEach((f) => console.error('  -', f));
        process.exit(1);
    }
    console.log('\ninteract: PASS (all interaction scenarios)');
    process.exit(0);
}

main();
