/**
 * Generate refreshed ScratchJr Reborn app icons across all resolutions.
 *
 * Adds a distinctive, polished "REBORN" emblem to the ScratchJr cat icon
 * so users can easily distinguish ScratchJr Reborn from legacy ScratchJr Desktop.
 *
 * Usage: node scripts/generate-reborn-icon.js
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');
const { waitForPage, Session, sleep } = require('./cdp-session');

const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.join(rootDir, 'src', 'icons');
const pngDir = path.join(iconsDir, 'png');
const winIcoPath = path.join(iconsDir, 'win', 'icon.ico');

function getFreePort() {
    return new Promise((resolve, reject) => {
        const s = net.createServer();
        s.listen(0, '127.0.0.1', () => {
            const p = s.address().port;
            s.close(() => resolve(p));
        });
        s.on('error', reject);
    });
}

function findChromePath() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    throw new Error('Chrome/Edge executable not found');
}

/** Pack multiple PNG buffers into a standard Windows ICO buffer. */
function createIco(images) {
    // images: array of { width, height, buffer }
    const numImages = images.length;
    const headerSize = 6;
    const entrySize = 16;
    let offset = headerSize + (numImages * entrySize);

    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type 1 = icon
    header.writeUInt16LE(numImages, 4);

    const entries = [];
    for (const img of images) {
        const entry = Buffer.alloc(entrySize);
        entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
        entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
        entry.writeUInt8(0, 2); // color count
        entry.writeUInt8(0, 3); // reserved
        entry.writeUInt16LE(1, 4); // color planes
        entry.writeUInt16LE(32, 6); // bits per pixel
        entry.writeUInt32LE(img.buffer.length, 8); // size of image data
        entry.writeUInt32LE(offset, 12); // offset
        entries.push(entry);
        offset += img.buffer.length;
    }

    return Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
}

async function main() {
    console.log('Generating distinct ScratchJr Reborn icons...');

    // Read base 1024x1024 or 512x512 PNG as base64
    const baseIconFile = path.join(pngDir, '1024x1024.png');
    const baseIconB64 = fs.readFileSync(baseIconFile).toString('base64');

    const port = await getFreePort();
    const chromePath = findChromePath();
    const tempUserData = path.join(process.env.TEMP || '/tmp', 'sjr-icon-gen-' + Date.now());

    const proc = spawn(chromePath, [
        `--remote-debugging-port=${port}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempUserData}`,
        'about:blank'
    ], { stdio: 'ignore' });

    try {
        const pageInfo = await waitForPage(`http://127.0.0.1:${port}`, 'about:blank', Date.now() + 10000, 'icon-gen');
        const session = new Session(pageInfo.webSocketDebuggerUrl);
        await session.connect();
        await session.send('Page.enable');

        // Render in browser canvas
        const script = `
        (function() {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const sizes = [1024, 512, 256, 128, 64, 32, 16];
                    const results = {};

                    for (const size of sizes) {
                        const canvas = document.createElement('canvas');
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';

                        // 1. Draw base ScratchJr icon
                        ctx.drawImage(img, 0, 0, size, size);

                        // 2. Draw Reborn distinction badge
                        const scale = size / 512;
                        ctx.save();

                        // Modern Pill Badge Dimensions
                        const badgeW = 280 * scale;
                        const badgeH = 72 * scale;
                        const badgeX = (size - badgeW) / 2;
                        const badgeY = size - badgeH - (28 * scale);
                        const radius = badgeH / 2;

                        // Outer Glow / Drop Shadow
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
                        ctx.shadowBlur = 12 * scale;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 4 * scale;

                        // Gradient background (Cosmic Deep Indigo / Purple)
                        const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
                        grad.addColorStop(0, '#591BC7');
                        grad.addColorStop(0.5, '#7928CA');
                        grad.addColorStop(1, '#9B30FF');

                        ctx.beginPath();
                        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius);
                        ctx.fillStyle = grad;
                        ctx.fill();

                        // Gold border stroke
                        ctx.shadowColor = 'transparent';
                        ctx.lineWidth = Math.max(1.5, 3.5 * scale);
                        ctx.strokeStyle = '#FFD23F';
                        ctx.stroke();

                        // Inner border highlight
                        ctx.beginPath();
                        ctx.roundRect(badgeX + (2 * scale), badgeY + (2 * scale), badgeW - (4 * scale), badgeH - (4 * scale), radius - (2 * scale));
                        ctx.lineWidth = Math.max(1, 1.5 * scale);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.stroke();

                        // "REBORN" Text & Star
                        if (size >= 32) {
                            ctx.fillStyle = '#FFFFFF';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            const fontSize = Math.round(33 * scale);
                            ctx.font = '900 ' + fontSize + 'px "Segoe UI", Arial, sans-serif';

                            // Text shadow
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                            ctx.shadowBlur = 4 * scale;
                            ctx.shadowOffsetY = 2 * scale;

                            const textY = badgeY + (badgeH / 2) + (1 * scale);
                            ctx.fillText('★ REBORN', size / 2, textY);
                        } else {
                            // Tiny 16px icon: draw vibrant center spark
                            ctx.fillStyle = '#FFD23F';
                            ctx.beginPath();
                            ctx.arc(size / 2, badgeY + (badgeH / 2), 3, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        ctx.restore();

                        // Export PNG base64
                        results[size] = canvas.toDataURL('image/png').split(',')[1];
                    }

                    resolve(results);
                };
                img.onerror = reject;
                img.src = 'data:image/png;base64,' + '${baseIconB64}';
            });
        })();
        `;

        const evalRes = await session.send('Runtime.evaluate', {
            expression: script,
            awaitPromise: true,
            returnByValue: true
        });

        if (evalRes.exceptionDetails) {
            throw new Error('Canvas evaluation failed: ' + JSON.stringify(evalRes.exceptionDetails));
        }

        const pngResults = evalRes.result.value;

        // Save PNGs
        const icoImages = [];
        for (const sizeStr of Object.keys(pngResults)) {
            const size = parseInt(sizeStr, 10);
            const b64 = pngResults[sizeStr];
            const buffer = Buffer.from(b64, 'base64');
            const targetPath = path.join(pngDir, `${size}x${size}.png`);
            fs.writeFileSync(targetPath, buffer);
            console.log(`Saved ${size}x${size}.png`);

            if ([16, 32, 64, 128, 256].includes(size)) {
                icoImages.push({ width: size, height: size, buffer });
            }
        }

        // Pack ICO file (sorted ascending)
        icoImages.sort((a, b) => a.width - b.width);
        const icoBuffer = createIco(icoImages);
        fs.writeFileSync(winIcoPath, icoBuffer);
        console.log(`Saved Windows icon: ${winIcoPath}`);

        session.close();
        console.log('✅ ScratchJr Reborn icons generated successfully!');
    } finally {
        proc.kill('SIGKILL');
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (_) {}
    }
}

main().catch((err) => {
    console.error('generate-reborn-icon failed:', err);
    process.exit(1);
});
