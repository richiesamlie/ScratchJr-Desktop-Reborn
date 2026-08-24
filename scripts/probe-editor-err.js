/** One-off: boot to editor, dump renderer exceptions/console errors. */
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const PORT = 9396;
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
                const m = JSON.parse(ev.data);
                if (m.id && this.pending.has(m.id)) {
                    const e = this.pending.get(m.id); this.pending.delete(m.id);
                    m.error ? e.reject(new Error(m.error.message)) : e.resolve(m.result);
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
    let mainLog = '';
    child.stdout.on('data', (d) => { mainLog += d.toString(); });

    await sleep(6000);
    const t1s = await fetchJson('/json/list');
    const t1 = t1s.find((x) => x.type === 'page' && x.url.includes('index.html') && x.webSocketDebuggerUrl);
    const s1 = new Session(t1.webSocketDebuggerUrl);
    await s1.connect();
    await s1.eval("window.location.href='home.html'");
    s1.close();
    await sleep(2500);

    const t2s = await fetchJson('/json/list');
    const t2 = t2s.find((x) => x.type === 'page' && x.url.includes('home.html') && x.webSocketDebuggerUrl);
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
    const errs = [];
    s3.ws.addEventListener('message', (ev) => {
        const m = JSON.parse(ev.data);
        if (m.method === 'Runtime.exceptionThrown') {
            const d = m.params.exceptionDetails;
            errs.push((d.exception?.description || d.text).split('\n')[0]);
        }
        if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
            errs.push('[console] ' + m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 160));
        }
    });
    await sleep(4000);
    console.log('exceptions/errors:');
    errs.slice(0, 8).forEach((e) => console.log('  -', e));
    if (!errs.length) console.log('  (none captured)');
    console.log('editor state:', await s3.eval("document.readyState + '|' + typeof window.ScratchJr + '|' + !!document.getElementById('blockspalette')"));
    console.log('---- main stdout tail ----');
    mainLog.trim().split('\n').slice(-10).forEach((l) => console.log('  |', l));

    s3.close();
    try { require('child_process').execSync('taskkill /pid ' + child.pid + ' /T /F', { stdio: 'ignore' }); } catch (_) {}
    process.exit(0);
}

main();
