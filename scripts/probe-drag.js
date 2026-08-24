/** One-off diagnostic: start a palette drag, dump clone/rects mid-flight. */
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 9395;
const BASE = 'http://127.0.0.1:' + PORT;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let electronPath;
try { electronPath = require('electron'); } catch (e) { console.error(e.message); process.exit(2); }

function fetchJson(p) {
    return new Promise((resolve, reject) => {
        const req = http.get(BASE + p, (res) => {
            let d = '';
            res.on('data', (c) => { d += c; });
            res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
        });
        req.on('error', reject);
        req.setTimeout(2000, () => req.destroy(new Error('timeout')));
    });
}

class Session {
    constructor(wsUrl) { this.wsUrl = wsUrl; this.nextId = 1; this.pending = new Map(); }
    connect() {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.wsUrl);
            this.ws = ws;
            ws.onopen = () => resolve();
            ws.onerror = () => reject(new Error('ws error'));
            ws.onmessage = (ev) => {
                const msg = JSON.parse(ev.data);
                if (msg.id && this.pending.has(msg.id)) {
                    const e = this.pending.get(msg.id); this.pending.delete(msg.id);
                    msg.error ? e.reject(new Error(msg.error.message)) : e.resolve(msg.result);
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
    set onConsole(_f) { this._consoleCb = _f; this._ensureConsole(); }
    _ensureConsole() {
        if (this._consoleWired) return;
        this._consoleWired = true;
        this.ws.addEventListener('message', (ev) => {
            const msg = JSON.parse(ev.data);
            if (msg.method === 'Runtime.consoleAPICalled' && this._consoleCb) {
                const text = msg.params.args.map((a) => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ');
                this._consoleCb(msg.params.type, text);
            }
            if (msg.method === 'Runtime.exceptionThrown') {
                const d = msg.params.exceptionDetails;
                if (this._consoleCb) this._consoleCb('exception', d.text + ' ' + (d.exception?.description || ''));
            }
        });
    }
    async eval(expr) {
        const res = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
        return res.result.value;
    }
    close() { try { this.ws.close(); } catch (_) {} }
}

async function main() {
    const child = spawn(electronPath, ['.', '--remote-debugging-port=' + PORT], {
        cwd: path.join(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'],
    });
    await sleep(6000);
    const targets = await fetchJson('/json/list');
    const t = targets.find((x) => x.type === 'page' && x.url.includes('index.html') && x.webSocketDebuggerUrl);
    const s1 = new Session(t.webSocketDebuggerUrl);
    await s1.connect();
    await s1.eval("window.location.href='home.html'");
    s1.close();
    await sleep(2500);
    const t2targets = await fetchJson('/json/list');
    const t2 = t2targets.find((x) => x.type === 'page' && x.url.includes('home.html') && x.webSocketDebuggerUrl);
    const s2 = new Session(t2.webSocketDebuggerUrl);
    await s2.connect();
    await s2.eval("(function(){var el=document.getElementById('newproject');var r=el.getBoundingClientRect();var o={bubbles:true,cancelable:true,view:window,clientX:r.left+r.width/2,clientY:r.top+r.height/2,button:0};el.dispatchEvent(new MouseEvent('mousedown',o));el.dispatchEvent(new MouseEvent('mouseup',o));})()");
    s2.close();
    await sleep(3500);
    const t3s = await fetchJson('/json/list');
    const t3 = t3s.find((x) => x.type === 'page' && x.url.includes('editor.html') && x.webSocketDebuggerUrl);
    const s3 = new Session(t3.webSocketDebuggerUrl);
    await s3.connect();
    await s3.send('Runtime.enable');
    let sawConsole = false;
    s3.onConsole = (type, text) => { if (type === 'error' || type === 'warning') { sawConsole = true; console.log('  [renderer', type + ']', text.slice(0, 220)); } };
    await sleep(2500);
    await s3.eval(`console.error('PROBE_LISTENER_OK');`);
    await sleep(300);
    console.log('listener works:', sawConsole);

    const palDump = await s3.eval(`(function(){
        var R = window.__modelRefs;
        var out = { hasR: !!R, pal: null, kids: [] };
        if (!R) return out;
        var pal = document.getElementById('palette');
        out.pal = pal ? { kids: pal.childElementCount } : null;
        if (pal) {
            for (var i = 0; i < Math.min(pal.childElementCount, 6); i++) {
                var k = pal.childNodes[i];
                var b = k.getBoundingClientRect();
                out.kids.push({ tag: k.tagName, id: k.id,
                    kind: R.getModelRef(k) ? R.getModelRef(k).kind : null,
                    bt: (R.getModelRefAs(k, 'block') || {}).blocktype || null,
                    rect: { x: b.x|0, y: b.y|0, w: b.width|0, h: b.height|0 } });
            }
        }
        return out;
    })()`);
    console.log('PAL DUMP:', JSON.stringify(palDump));
    const sprId = await s3.eval("JSON.parse(window.ScratchJr.stage.currentPage.sprites)[0]");
    const from = await s3.eval(`(function(){
        var vw = window.innerWidth, vh = window.innerHeight;
        var divs = document.querySelectorAll('div');
        for (var i = 0; i < divs.length; i++) {
            var o = divs[i].owner;
            if (o && o.blocktype === 'hop' && o.inpalette) {
                var b = divs[i].getBoundingClientRect();
                if (b.width < 10 || b.left < 0 || b.top < 0 || b.right > vw || b.bottom > vh) continue;
                return { x: b.x + b.width/2, y: b.y + b.height/2 };
            }
        }
        return null;
    })()`);
    console.log('from:', JSON.stringify(from));

    // press + move into workspace
    await s3.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1 });
    for (let i = 1; i <= 6; i++) {
        await sleep(30);
        await s3.send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: Math.round(from.x + (500 - from.x) * i / 6),
            y: Math.round(from.y + (700 - from.y) * i / 6),
            buttons: 1,
        });
    }

    const diag = await s3.eval(`(function(){
        var out = { clones: [], rects: {} };
        var dd = document.getElementById('dragDiv');
        if (dd) {
            for (var i = 0; i < dd.childElementCount; i++) {
                var k = dd.childNodes[i];
                var b = k.getBoundingClientRect();
                out.clones.push({ id: k.id, cls: String(k.className||'').slice(0,40),
                    left: k.left, top: k.top,
                    bt: (k.owner && k.owner.blocktype) || null,
                    rect: { x: b.x|0, y: b.y|0, w: b.width|0, h: b.height|0 } });
            }
        } else { out.clones.push({ missing: 'no #dragDiv' }); }
        ['palette','blockspalette','scripts','scriptscontainer'].forEach(function(id){
            var el = document.getElementById(id);
            if (!el) { out.rects[id] = null; return; }
            var b = el.getBoundingClientRect();
            out.rects[id] = { x: b.x|0, y: b.y|0, w: b.width|0, h: b.height|0 };
        });
        out.mm = typeof window.onmousemove;
        return out;
    })()`);
    console.log(JSON.stringify(diag, null, 1));

    // release
    await s3.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 500, y: 700, button: 'left', clickCount: 1 });
    await sleep(400);
    const stripAfter = await s3.eval(`(function(){
        var sc = document.getElementById('${'Tic 1'}_scripts');
        return sc ? (sc.owner.blocklist || []).length : 'no-container';
    })()`);
    console.log('strip containers after release:', stripAfter);
    const allContainers = await s3.eval(`(function(){
        var out = [];
        var els = document.querySelectorAll('[id*="_scripts"]');
        for (var i = 0; i < els.length; i++) {
            var o = els[i].owner;
            out.push({ id: els[i].id,
                blocks: o && o.blocklist ? o.blocklist.length : null,
                kids: els[i].childElementCount });
        }
        var cur = window.ScratchJr.stage.currentPage;
        out.push({ currentSpriteName: cur.currentSpriteName, sprites: cur.sprites });
        return out;
    })()`);
    console.log(JSON.stringify(allContainers, null, 1));
    const ddAfter = await s3.eval(`(function(){ var dd=document.getElementById('dragDiv'); return dd ? dd.childElementCount : 'gone'; })()`);
    console.log('dragDiv children after release:', ddAfter);
    await sleep(300);
    console.log('---- main stdout tail ----');
    mainLog.trim().split('\n').slice(-12).forEach(l => console.log('  |', l));

    s3.close();
    try { require('child_process').execSync('taskkill /pid ' + child.pid + ' /T /F', { stdio: 'ignore' }); } catch (_) {}
    process.exit(0);
}

main();
