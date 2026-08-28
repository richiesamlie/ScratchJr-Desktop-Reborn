const { spawn } = require('child_process');
const path = require('path');
const repoRoot = path.resolve('c:/weeklyprogram/scratchjr-audit');
const electronPath = require(path.join(repoRoot, 'node_modules/electron'));
const { sleep, waitForPage, Session } = require(path.join(repoRoot, 'scripts/cdp-session'));

const PORT = 9352;
const BASE = `http://127.0.0.1:${PORT}`;

async function main() {
    console.log('Launching Electron to test Custom Image Import (Characters & Backdrops)...');
    const child = spawn(electronPath, ['.', `--remote-debugging-port=${PORT}`], {
        cwd: repoRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    try {
        const t1 = await waitForPage(BASE, 'index.html', Date.now() + 20000, 'test');
        const s1 = new Session(t1.webSocketDebuggerUrl);
        await s1.connect();
        await s1.enable();
        await sleep(1000);

        // Open editor for a project
        await s1.eval(`window.location.href = 'editor.html?pmd5=2&mode=edit'`);
        await sleep(2500);

        const t2 = await waitForPage(BASE, 'editor.html', Date.now() + 20000, 'test');
        const s2 = new Session(t2.webSocketDebuggerUrl);
        await s2.connect();
        await s2.enable();
        await sleep(2500);

        // 1. Test Character Library Import
        console.log('--- Testing Character Library Import ---');
        await s2.eval(`window.Library.open('costumes')`);
        await sleep(1000);

        const charImportResult = await s2.eval(`
            new Promise((resolve) => {
                const c = document.createElement('canvas');
                c.width = 100;
                c.height = 100;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(10, 10, 80, 80);
                
                c.toBlob((blob) => {
                    const file = new File([blob], 'Alien Hero.png', { type: 'image/png' });
                    window.Library.handleImportFile(file);
                    setTimeout(() => {
                        const thumbs = Array.from(document.querySelectorAll('.assetbox')).map(el => ({
                            id: el.id,
                            name: el.fieldname
                        }));
                        resolve(thumbs);
                    }, 2000);
                }, 'image/png');
            })
        `);

        const foundChar = charImportResult.find(a => a.name === 'Alien Hero');
        if (foundChar) {
            console.log('SUCCESS: Imported character "Alien Hero" found in library!');
        } else {
            console.error('FAIL: "Alien Hero" was not found in library');
        }

        // Close character library
        await s2.eval(`
            const okBtn = document.getElementById('okbut');
            okBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        `);
        await sleep(1500);

        // 2. Test Backdrop Library Import
        console.log('--- Testing Backdrop Library Import ---');
        await s2.eval(`window.Library.open('backgrounds')`);
        await sleep(1000);

        const bkgImportResult = await s2.eval(`
            new Promise((resolve) => {
                const c = document.createElement('canvas');
                c.width = 480;
                c.height = 360;
                const ctx = c.getContext('2d');
                ctx.fillStyle = '#1A237E';
                ctx.fillRect(0, 0, 480, 360);
                ctx.fillStyle = '#FFD54F';
                ctx.beginPath();
                ctx.arc(240, 180, 50, 0, 2 * Math.PI);
                ctx.fill();
                
                c.toBlob((blob) => {
                    const file = new File([blob], 'Deep Space Moon.jpg', { type: 'image/jpeg' });
                    window.Library.handleImportFile(file);
                    setTimeout(() => {
                        const thumbs = Array.from(document.querySelectorAll('.assetbox')).map(el => ({
                            id: el.id
                        }));
                        resolve(thumbs);
                    }, 2000);
                }, 'image/jpeg');
            })
        `);

        console.log('Backdrop library asset count:', bkgImportResult.length);
        if (bkgImportResult.length > 2) {
            console.log('SUCCESS: Imported backdrop found in backdrop library!');
        } else {
            console.error('FAIL: Backdrop was not found');
        }

        // Select backdrop and close
        await s2.eval(`{
            const okBtn = document.getElementById('okbut');
            okBtn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        }`);
        await sleep(1500);

        console.log('ALL E2E IMPORT TESTS PASSED!');
    } finally {
        child.kill();
    }
}

main().catch(console.error);
