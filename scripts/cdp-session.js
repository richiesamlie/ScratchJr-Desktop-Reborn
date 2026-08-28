/**
 * Shared Chrome DevTools Protocol plumbing for the test driver scripts
 * (smoke-test.js, interaction-test.js): argv lookup, polling helpers and a
 * minimal CDP-over-WebSocket session bound to one page target.
 *
 * CommonJS, plain Node — same runtime contract as the scripts that use it.
 */

const http = require('http');

const args = process.argv.slice(2);

/** Look up `--name value` in argv, falling back to dflt. */
function argOf(name, dflt) {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : dflt;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fetchJson(base, urlPath) {
    return new Promise((resolve, reject) => {
        const req = http.get(base + urlPath, (res) => {
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
async function waitForPage(base, urlPart, deadline, prefix) {
    while (Date.now() < deadline) {
        try {
            const targets = await fetchJson(base, '/json/list');
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
    throw new Error(prefix + ': timed out waiting for page matching "' + urlPart + '"');
}

/** Minimal CDP-over-WebSocket session for one page target. */
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
        this.consoleErrors = [];
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

async function waitReady(session, extraExpr, label, deadline, prefix) {
    // extraExpr must become true once the page finished initializing.
    while (Date.now() < deadline) {
        const ok = await session.eval(
            "(document.readyState === 'complete' && !!window.scratchjr && !!(" + extraExpr + '))'
        ).catch(() => false);
        if (ok) return;
        await sleep(300);
    }
    throw new Error(prefix + ': ' + label + ' never became ready');
}

async function centerOf(session, expr) {
    const r = await session.eval('(' + expr + ').getBoundingClientRect().toJSON()');
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
}

async function dragMouse(session, from, to, steps = 15, stepMs = 20) {
    await session.send('Input.dispatchMouseEvent', {
        type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1,
    });
    await sleep(60);
    for (let i = 1; i <= steps; i++) {
        const x = Math.round(from.x + (to.x - from.x) * (i / steps));
        const y = Math.round(from.y + (to.y - from.y) * (i / steps));
        await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 1 });
        await sleep(stepMs);
    }
    await sleep(60);
    await session.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x: to.x, y: to.y, button: 'left', clickCount: 1,
    });
    await sleep(100);
}

module.exports = { argOf, sleep, waitForPage, Session, waitReady, centerOf, dragMouse };
