import { enginePorts } from '../engine/ports';
import { setModelRef, getModelRefAs } from '../modelRegistry';
import BlockSpecs from './BlockSpecs';
import Menu from './Menu';

import {setCanvasSize, setProps, writeText, scaleMultiplier,
    newHTML, newDiv, newCanvas, getStringSize,
    newP, globalx, globaly, dprCenterTransform} from '../../utils/lib';
import Localization from '../../utils/Localization';
import ScratchAudio from '../../utils/ScratchAudio';
import type Block from './Block';
import type Sprite from '../engine/Sprite';
import type Scripts from '../ui/Scripts';
import type Page from '../engine/Page';

/*
Argument types

n!: numbers
t: text
m: regular menu with icons
s: text for soundblock
r: number for recorded sound block
p: page icons

*/
export default class BlockArg {
    div!: HTMLElement;
    arg!: HTMLElement & { updateIcon?: () => void };
    argType: string;
    argValue: unknown;
    button!: HTMLCanvasElement;
    daddy: Block;
    icon!: HTMLImageElement | string;
    input!: HTMLInputElement;
    list!: string;
    numperrow!: number;
    type: string;

    constructor (block: Block) {
        this.daddy = block;
        this.type = 'blockarg';
        this.argType = block.spec[3] as string;
        switch (this.argType) {
        case 'n':
            this.argValue = block.spec[4];
            this.div = this.addNumArg();
            break;
        case 't':
            this.argValue = block.spec[4];
            if (Localization.isSampleLocalizedKey(String(this.argValue)) && enginePorts().isSampleOrStarter()) {
                this.argValue = Localization.localize('SAMPLE_TEXT_' + this.argValue);
            }
            this.div = this.addTextArg();
            break;
        case 'm':
            this.argValue = block.spec[4];
            this.list = JSON.stringify(block.spec[1]);
            this.numperrow = 3;
            this.icon = this.getIconFrom(block.spec[4] as string, block.spec[1] as string[]);
            this.div = this.addImageMenu(this.closePictureMenu);
            break;
        case 'd':
            this.argValue = block.spec[4];
            this.list = JSON.stringify(block.spec[1]);
            this.numperrow = 3;
            this.icon = BlockSpecs.speeds[this.argValue as number];
            this.div = this.addImageMenu(this.menuCloseSpeeds);
            break;
        case 'p':
            this.argValue = block.spec[4];
            this.div = this.pageIcon(this.argValue as number);
            var ctx = block.blockshape.getContext('2d')!;
            const pageCanvas = this.div as HTMLCanvasElement;
            ctx.drawImage(pageCanvas, 0, 0, pageCanvas.width, pageCanvas.height, 0, 0, pageCanvas.width * block.scale, pageCanvas.height * block.scale);
            break;
        case 's':
            this.argValue = block.spec[4];
            this.div = newDiv(block.div, 2, 46, 60, 20, {
                position: 'absolute',
                zoom: (block.scale * 100) + '%'
            });
            var p = newP(this.div, String(this.argValue).split('.')[0], {
                width: '60px'
            });
            p.setAttribute('class', 'soundname');
            break;
        case 'r':
            this.argValue = block.spec[4];
            this.div = newHTML('div', 'recordedCircle', block.div);
            setProps(this.div.style, {
                zoom: (block.scale * 100) + '%'
            });
            var num = newHTML('p', 'recordedNumber', this.div);
            num.textContent = this.daddy.inpalette ? String(this.argValue) : '?';
            break;
        default:
            break;
        }
    }

    update (spr?: Sprite) {
        if (this.argType == 'r') {
            this.div.childNodes[0].textContent = String(this.argValue);
        }
        if (this.arg && (this.argType == 'p')) {
            this.arg.updateIcon!();
        }
    }

    getScreenPt () {
        return {
            x: globalx(this.daddy.div),
            y: globaly(this.daddy.div)
        };
    }

    addNumArg () {
        var str = String(this.argValue);
        if (this.daddy.inpalette) {
            return this.addLabel(str, false);
        } 
        return this.addNumArgument(str);
        
    }

    addTextArg () {
        var str = String(this.argValue);
        if (this.daddy.inpalette) {
            return this.addLabel(str, true);
        } 
        return this.addTextArgument(str, true);
        
    }

    addLabel (str: string, isText: boolean) {
        var scale = this.daddy.scale;
        var dx = isText ? 8 : 16;
        var dy = 57;
        if (this.daddy.blocktype == 'repeat') {
            dx = Math.round(this.daddy.blockshape.width / window.devicePixelRatio / scale) - 60;
            dy = Math.round(this.daddy.blockshape.height / window.devicePixelRatio / scale) - 10;
        }
        var img = isText ? BlockSpecs.textfieldimg : BlockSpecs.numfieldimg;
        var w = isText ? 53 : 36;
        var h = 17;
        var field = newCanvas(this.daddy.div, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio, {
            position: 'absolute',
            webkitTransform: 'translate(' + (-w * window.devicePixelRatio / 2) + 'px, '
                + (-h * window.devicePixelRatio / 2) + 'px) '
                + 'scale(' + (scale / window.devicePixelRatio) + ') '
                + 'translate(' + (dx * window.devicePixelRatio + (w * window.devicePixelRatio / 2)) + 'px, '
                + (dy * window.devicePixelRatio + (h * window.devicePixelRatio / 2)) + 'px)',
            pointerEvents: 'all'

        });
        var ctx = field.getContext('2d')!;
        if (!img.complete) {
            img.onload = function () {
                ctx.drawImage(img, 0, 0, w, h, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio);
            };
        } else {
            ctx.drawImage(img, 0, 0, w, h, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio);
        }
        var div = newDiv(this.daddy.div, dx, dy, w, h, {
            position: 'absolute',
            zoom: (scale * 100) + '%',
            margin: '0px',
            padding: '0px'
        });
        var cnv = newCanvas(div, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio, {
            position: 'absolute',
            webkitTransform: dprCenterTransform(w * window.devicePixelRatio, h * window.devicePixelRatio)
        });
        ctx = cnv.getContext('2d')!;
        var font = (12 * window.devicePixelRatio) + 'px ' + window.Settings!.blockArgFont;
        var lsize = getStringSize(ctx, font, str).width;
        writeText(ctx, font, '#77787b', str, h * window.devicePixelRatio - 3, Math.round((w * window.devicePixelRatio - lsize) / 2));
        return div;
    }

    addNumArgument (str: string) {
        var div = newHTML('div', 'numfield', this.daddy.div);
        if (this.daddy.blocktype == 'repeat') {
            setProps(div.style, {
                left: (this.daddy.blockshape.width / window.devicePixelRatio - 62 * this.daddy.scale) + 'px',
                top: (this.daddy.blockshape.height / window.devicePixelRatio - 11 * this.daddy.scale) + 'px'
            });
        }
        var ti = newHTML('h3', undefined, div);
        this.input = ti as HTMLInputElement;
        setModelRef(ti, 'blockarg', this);
        ti.textContent = str;
        this.arg = div;
        // Expand the parent div to incorporate the size of the button,
        // else on Android 4.2 the bottom part of the button
        // will not be clickable.
        const divParent = div.parentNode as HTMLCanvasElement;
        divParent.height += 10 * window.devicePixelRatio;
        setCanvasSize(divParent, divParent.width, divParent.height);
        return div;
    }

    addTextArgument (str: string, isText?: boolean) {
        var div = newHTML('div', 'textfield', this.daddy.div);
        var ti = newHTML('h3', undefined, div);
        this.input = ti as HTMLInputElement;
        setModelRef(ti, 'blockarg', this);
        ti.textContent = str;
        this.arg = div;
        // Expand the parent div to incorporate the size of the button,
        // else on Android 4.2 the bottom part of the button
        // will not be clickable.
        const divParent = div.parentNode as HTMLCanvasElement;
        divParent.height += 10 * window.devicePixelRatio;
        setCanvasSize(divParent, divParent.width, divParent.height);
        return div;
    }

    setValue (val: string | number) {
        if (!this.input) {
            return;
        }
        this.argValue = val;
        this.input.textContent = val as string;
    }

    isText () {
        return (this.argType != 'n');
    }

    /////////////////////////////////
    // Menu drop downs
    //////////////////////////////

    getIconFrom (key: string, list: string[]) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].indexOf(key) > -1) {
                return list[i];
            }
        }
        return list[0];
    }

    addImageMenu (fcn: (e: MouseEvent, mu: HTMLElement, b: HTMLElement, c: string) => void) {
        this.drawChoice(this.daddy.blockicon);
        this.button = this.addPressButton();
        if (!this.daddy.inpalette) {
            var ba = this;
            ba.button.onmousedown = function (evt) {
                    ba.pressDropDown(evt, fcn);
                };
            // Expand the parent div to incorporate the size of the button,
            // else on Android 4.2 the bottom part of the button
            // will not be clickable.
            const buttonParent = this.button.parentNode as HTMLCanvasElement;
            buttonParent.height += this.button.height / 2;
            setCanvasSize(buttonParent, buttonParent.width, buttonParent.height);
        }
        return this.daddy.blockicon;
    }

    drawChoice (cnv: HTMLCanvasElement) {
        var scale = this.daddy.scale;
        if (typeof this.argValue === 'string' && this.argValue.startsWith('#')) {
            BlockArg.drawCustomColorIcon(cnv, this.argValue, scale);
            return cnv;
        }
        var ctx = cnv.getContext('2d')!;
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        var icon = BlockSpecs.getImageFrom('assets/blockicons/' + this.icon, 'svg');
        if (!icon.complete) {
            icon.onload = function () {
                ctx.drawImage(icon, 0, 0, icon.width, icon.height, 0, 0, icon.width * scale * window.devicePixelRatio, icon.height * scale * window.devicePixelRatio);
            };
        } else {
            ctx.drawImage(icon, 0, 0, icon.width, icon.height, 0, 0, icon.width * scale * window.devicePixelRatio, icon.height * scale * window.devicePixelRatio);
        }
        return cnv;
    }

    addPressButton () {
        var scale = this.daddy.scale;
        var dx;
        if (this.daddy.inpalette) {
            dx = this.daddy.aStart ? 26 : 16;
        } else {
            dx = this.daddy.aStart ? 20 : 10;
        }
        var dy = 56;
        var w = (this.daddy.inpalette) ? 36 : 48;
        var h = (this.daddy.inpalette) ? 20 : 27;
        var img = (this.daddy.inpalette) ? BlockSpecs.pressbuttonSmall : BlockSpecs.pressbutton;
        var field = newCanvas(this.daddy.div, dx, dy, w, h, {
            position: 'absolute',
            zoom: (scale * 100) + '%',
            pointerEvents: 'all',
            webkitTransform: 'translateZ(0)'
        });
        var ctx = field.getContext('2d')!;
        if (!img.complete) {
            img.onload = function () {
                ctx.drawImage(img, 0, 0);
            };
        } else {
            ctx.drawImage(img, 0, 0);
        }
        return field;
    }

    pressDropDown (e: MouseEvent & { touches?: TouchList }, fcn: (e: MouseEvent, mu: HTMLElement, b: HTMLElement, c: string) => void) {
        if (('isPrimary' in e && !(e as PointerEvent).isPrimary) || (e.touches && e.touches.length > 1)) {
            return;
        }
        if (enginePorts().isOnHold()) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        enginePorts().unfocus(e);
        if (!this.daddy) {
            return;
        }
        Menu.openDropDown(this.daddy.div, fcn);
    }

    closePictureMenu (e: MouseEvent, mu: HTMLElement, b: HTMLElement, c: string) {
        e.preventDefault();
        const block = getModelRefAs<Block>(b, 'block')!;
        var value = block.arg.argValue;
        if (c === 'TouchColor_Pipette') {
            if (Menu.openMenu) {
                Menu.openMenu!.parentNode!.removeChild(Menu.openMenu!);
            }
            Menu.openMenu = null;
            BlockArg.pickStageColor(block, value);
            return;
        }
        block.arg.argValue = c.substring(c.indexOf('_') + 1, c.length);
        var ctx = block.blockicon.getContext('2d')!;
        const bel = b as HTMLElement & { icon?: HTMLImageElement };
        bel.icon = BlockSpecs.getImageFrom('assets/blockicons/' + c, 'svg');
        const icon = bel.icon as HTMLImageElement;
        ctx.clearRect(0, 0, 85 * scaleMultiplier * window.devicePixelRatio, 66 * scaleMultiplier * window.devicePixelRatio);
        if (!icon.complete) {
            icon.onload = function () {
                var w = icon.width;
                var h = icon.height;
                ctx.drawImage(icon, 0, 0, w, h, 0, 0, w * scaleMultiplier * window.devicePixelRatio, h * scaleMultiplier * window.devicePixelRatio);
            };
        } else {
            var w = icon.width;
            var h = icon.height;
            ctx.drawImage(icon, 0, 0, w, h, 0, 0, w * scaleMultiplier * window.devicePixelRatio, h * scaleMultiplier * window.devicePixelRatio);
        }
        if (Menu.openMenu) {
            Menu.openMenu!.parentNode!.removeChild(Menu.openMenu!);
        }
        if (block.arg.argValue != value) {
            var spr = getModelRefAs<Scripts>(b.parentNode as HTMLElement, 'scripts')!.spr;
            var action = {
                action: 'scripts',
                where: (getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page')!).id,
                who: spr.id
            };
            enginePorts().undoRecord(action);
            enginePorts().storyStart('BlockArg.prototype.closePictureMenu');
        }
        Menu.openMenu = null;
    }

    static drawCustomColorIcon (cnv: HTMLCanvasElement, hexColor: string, scaleFactor: number) {
        var ctx = cnv.getContext('2d')!;
        var scale = scaleFactor * window.devicePixelRatio;
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(42.5 * scale, 30 * scale, 18 * scale, 0, Math.PI * 2);
        ctx.fillStyle = hexColor;
        ctx.fill();
        ctx.lineWidth = 3 * scale;
        ctx.strokeStyle = '#333333';
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(26 * scale, 40 * scale, 8 * scale, 6 * scale, -20 * Math.PI / 180, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = '#333333';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(22 * scale, 43 * scale);
        ctx.lineTo(16 * scale, 48 * scale);
        ctx.stroke();
        ctx.restore();
    }

    static pickStageColor (block: Block, oldValue: unknown) {
        if (typeof document === 'undefined') {
            return;
        }

        // Clean up any existing loupe or overlay
        const existingOverlay = document.getElementById('scratchjr-eyedropper-overlay');
        if (existingOverlay && existingOverlay.parentNode) {
            existingOverlay.parentNode.removeChild(existingOverlay);
        }
        const existingLoupe = document.getElementById('scratchjr-eyedropper-loupe');
        if (existingLoupe && existingLoupe.parentNode) {
            existingLoupe.parentNode.removeChild(existingLoupe);
        }

        // Render high-res stage snapshot for sampling
        let stageCanvas: HTMLCanvasElement | null = null;
        let stageCtx: CanvasRenderingContext2D | null = null;
        try {
            const stage = enginePorts().getStage();
            if (stage && stage.currentPage && typeof stage.currentPage.renderStageToCanvas === 'function') {
                stageCanvas = stage.currentPage.renderStageToCanvas(2);
                stageCtx = stageCanvas.getContext('2d', { willReadFrequently: true });
            }
        } catch (_) {
            // Engine ports not initialized in test/harness environment
        }

        // Overlay element: captures pointer events & hides system cursor
        const overlay = document.createElement('div');
        overlay.id = 'scratchjr-eyedropper-overlay';
        setProps(overlay.style, {
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            cursor: 'none',
            userSelect: 'none',
            webkitUserSelect: 'none'
        });
        document.body.appendChild(overlay);

        // Loupe container element (follows cursor)
        const loupe = document.createElement('div');
        loupe.id = 'scratchjr-eyedropper-loupe';
        setProps(loupe.style, {
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 1000000,
            width: '104px',
            height: '104px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            left: '-9999px',
            top: '-9999px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.45), 0 0 0 4px #FFFFFF, 0 0 0 6px rgba(0,0,0,0.2)',
            overflow: 'visible'
        });

        // Loupe canvas (208x208 canvas displayed at 104x104)
        const loupeCanvas = document.createElement('canvas');
        loupeCanvas.width = 208;
        loupeCanvas.height = 208;
        setProps(loupeCanvas.style, {
            width: '104px',
            height: '104px',
            borderRadius: '50%',
            display: 'block'
        });
        loupe.appendChild(loupeCanvas);

        // Color Hex badge
        const badge = document.createElement('div');
        setProps(badge.style, {
            position: 'absolute',
            left: '50%',
            bottom: '-30px',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(15, 20, 25, 0.9)',
            color: '#FFFFFF',
            fontFamily: 'monospace, sans-serif',
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            padding: '3px 8px',
            borderRadius: '12px',
            border: '2px solid #FFFFFF',
            boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
        });
        badge.textContent = '#FFFFFF';
        loupe.appendChild(badge);

        document.body.appendChild(loupe);

        let currentHex = typeof block.arg.argValue === 'string' && block.arg.argValue.startsWith('#')
            ? block.arg.argValue
            : '#FF0000';

        const updateLoupe = (clientX: number, clientY: number) => {
            const lctx = loupeCanvas.getContext('2d')!;
            lctx.imageSmoothingEnabled = false;

            const stageDiv = document.getElementById('stage');
            const stageRect = stageDiv ? stageDiv.getBoundingClientRect() : null;
            const isOverStage = stageRect
                && clientX >= stageRect.left && clientX <= stageRect.right
                && clientY >= stageRect.top && clientY <= stageRect.bottom;

            const W = 208;
            const H = 208;
            const CX = 104;
            const CY = 104;
            const R = 98;

            lctx.save();
            lctx.clearRect(0, 0, W, H);

            // Circular clip path for magnifier lens
            lctx.beginPath();
            lctx.arc(CX, CY, R, 0, Math.PI * 2);
            lctx.clip();

            lctx.fillStyle = '#FFFFFF';
            lctx.fillRect(0, 0, W, H);

            const GRID_CELLS = 11;
            const cellSize = W / GRID_CELLS;

            if (isOverStage && stageCanvas && stageCtx) {
                const normX = (clientX - stageRect.left) / stageRect.width;
                const normY = (clientY - stageRect.top) / stageRect.height;
                const stagePixelX = Math.floor(normX * stageCanvas.width);
                const stagePixelY = Math.floor(normY * stageCanvas.height);

                const srcX = stagePixelX - 5;
                const srcY = stagePixelY - 5;
                lctx.drawImage(stageCanvas, srcX, srcY, GRID_CELLS, GRID_CELLS, 0, 0, W, H);

                try {
                    const sampleX = Math.max(0, Math.min(stageCanvas.width - 1, stagePixelX));
                    const sampleY = Math.max(0, Math.min(stageCanvas.height - 1, stagePixelY));
                    const pixel = stageCtx.getImageData(sampleX, sampleY, 1, 1).data;
                    currentHex = BlockArg.rgbToHex(pixel[0], pixel[1], pixel[2]);
                } catch (_) {
                    // Stage read fallback
                }
            } else {
                currentHex = BlockArg.sampleElementColor(clientX, clientY);
                lctx.fillStyle = currentHex;
                lctx.fillRect(0, 0, W, H);
            }

            // Draw pixel grid lines
            lctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
            lctx.lineWidth = 1;
            for (let i = 0; i <= GRID_CELLS; i++) {
                const pos = Math.round(i * cellSize);
                lctx.beginPath();
                lctx.moveTo(pos, 0);
                lctx.lineTo(pos, H);
                lctx.stroke();

                lctx.beginPath();
                lctx.moveTo(0, pos);
                lctx.lineTo(W, pos);
                lctx.stroke();
            }

            // Center target cell (index 5 in 0..10)
            const targetIdx = 5;
            const tX = Math.round(targetIdx * cellSize);
            const tY = Math.round(targetIdx * cellSize);
            const tS = Math.round(cellSize);

            // Target box around the sampled pixel
            lctx.strokeStyle = '#FFFFFF';
            lctx.lineWidth = 3;
            lctx.strokeRect(tX - 1, tY - 1, tS + 2, tS + 2);
            lctx.strokeStyle = '#000000';
            lctx.lineWidth = 1.5;
            lctx.strokeRect(tX - 1, tY - 1, tS + 2, tS + 2);

            // Crosshair tick marks
            lctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            lctx.lineWidth = 1.5;
            lctx.beginPath();
            lctx.moveTo(tX + tS / 2, tY - 1);
            lctx.lineTo(tX + tS / 2, Math.max(0, tY - 12));
            lctx.moveTo(tX + tS / 2, tY + tS + 1);
            lctx.lineTo(tX + tS / 2, Math.min(H, tY + tS + 13));
            lctx.moveTo(tX - 1, tY + tS / 2);
            lctx.lineTo(Math.max(0, tX - 12), tY + tS / 2);
            lctx.moveTo(tX + tS + 1, tY + tS / 2);
            lctx.lineTo(Math.min(W, tX + tS + 13), tY + tS / 2);
            lctx.stroke();

            lctx.restore();

            // Outer ring colored with sampled color
            lctx.beginPath();
            lctx.arc(CX, CY, 97, 0, Math.PI * 2);
            lctx.strokeStyle = currentHex;
            lctx.lineWidth = 14;
            lctx.stroke();

            // White inner accent ring
            lctx.beginPath();
            lctx.arc(CX, CY, 90, 0, Math.PI * 2);
            lctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            lctx.lineWidth = 2;
            lctx.stroke();

            // Dark inner border
            lctx.beginPath();
            lctx.arc(CX, CY, 103, 0, Math.PI * 2);
            lctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            lctx.lineWidth = 2;
            lctx.stroke();

            // Update loupe position
            loupe.style.left = clientX + 'px';
            loupe.style.top = clientY + 'px';

            if (clientY > window.innerHeight - 50) {
                badge.style.bottom = '112px';
            } else {
                badge.style.bottom = '-30px';
            }
            badge.textContent = currentHex;
            badge.style.borderColor = currentHex;
        };

        const cleanup = () => {
            window.removeEventListener('keydown', onKeyDown);
            overlay.removeEventListener('pointermove', onPointerMove);
            overlay.removeEventListener('pointerdown', onPointerDown);
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (loupe.parentNode) {
                loupe.parentNode.removeChild(loupe);
            }
        };

        const onKeyDown = (evt: KeyboardEvent) => {
            if (evt.key === 'Escape') {
                evt.preventDefault();
                evt.stopPropagation();
                cleanup();
            }
        };

        const onPointerMove = (evt: MouseEvent | PointerEvent) => {
            updateLoupe(evt.clientX, evt.clientY);
        };

        const onPointerDown = (evt: MouseEvent | PointerEvent) => {
            evt.preventDefault();
            evt.stopPropagation();
            const picked = currentHex;
            cleanup();
            BlockArg.applyCustomColor(block, picked, oldValue);
            ScratchAudio.sndFX('snap.wav');
        };

        overlay.addEventListener('pointermove', onPointerMove);
        overlay.addEventListener('pointerdown', onPointerDown);
        overlay.addEventListener('contextmenu', (evt) => {
            evt.preventDefault();
            cleanup();
        });
        window.addEventListener('keydown', onKeyDown);
    }

    static componentToHex (c: number): string {
        const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    static rgbToHex (r: number, g: number, b: number): string {
        return ('#' + BlockArg.componentToHex(r) + BlockArg.componentToHex(g) + BlockArg.componentToHex(b)).toUpperCase();
    }

    static parseCssColor (colorStr: string): string | null {
        if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') {
            return null;
        }
        if (colorStr.startsWith('#')) {
            return colorStr.toUpperCase();
        }
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (match) {
            return BlockArg.rgbToHex(Number(match[1]), Number(match[2]), Number(match[3]));
        }
        return null;
    }

    static sampleElementColor (clientX: number, clientY: number): string {
        if (typeof document.elementsFromPoint !== 'function') {
            return '#FFFFFF';
        }
        const elements = document.elementsFromPoint(clientX, clientY);
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            if (!el || el.id === 'scratchjr-eyedropper-overlay' || (el as HTMLElement).closest && (el as HTMLElement).closest('#scratchjr-eyedropper-loupe')) {
                continue;
            }
            if (el instanceof HTMLCanvasElement) {
                try {
                    const ctx = el.getContext('2d');
                    if (ctx) {
                        const rect = el.getBoundingClientRect();
                        const px = Math.floor((clientX - rect.left) * (el.width / rect.width));
                        const py = Math.floor((clientY - rect.top) * (el.height / rect.height));
                        if (px >= 0 && px < el.width && py >= 0 && py < el.height) {
                            const p = ctx.getImageData(px, py, 1, 1).data;
                            if (p[3] > 10) {
                                return BlockArg.rgbToHex(p[0], p[1], p[2]);
                            }
                        }
                    }
                } catch (_) {
                    // Ignore tainted canvas
                }
            }
            const style = window.getComputedStyle(el);
            const bg = BlockArg.parseCssColor(style.backgroundColor);
            if (bg) {
                return bg;
            }
            const fill = BlockArg.parseCssColor(style.fill);
            if (fill) {
                return fill;
            }
            const col = BlockArg.parseCssColor(style.color);
            if (col) {
                return col;
            }
        }
        return '#FFFFFF';
    }

    static applyCustomColor (block: Block, hexColor: string, oldValue: unknown) {
        block.arg.argValue = hexColor;
        BlockArg.drawCustomColorIcon(block.blockicon, hexColor, block.scale);

        if (block.arg.argValue !== oldValue) {
            try {
                var b = block.div;
                var spr = b && b.parentNode ? getModelRefAs<Scripts>(b.parentNode as HTMLElement, 'scripts')?.spr : null;
                if (spr && spr.div && spr.div.parentNode) {
                    var page = getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page');
                    if (page) {
                        var action = {
                            action: 'scripts',
                            where: page.id,
                            who: spr.id
                        };
                        enginePorts().undoRecord(action);
                        enginePorts().storyStart('BlockArg.prototype.closePictureMenu');
                    }
                }
            } catch (_) {
                // Ignore if not running within live script page or in tests
            }
        }
    }

    menuCloseSpeeds (e: MouseEvent, mu: HTMLElement, b: HTMLElement, c: string) {
        e.preventDefault();
        const block = getModelRefAs<Block>(b, 'block')!;
        var value = block.arg.argValue;
        block.arg.argValue = BlockSpecs.speeds.indexOf(c);
        var ctx = block.blockicon.getContext('2d')!;
        const bel = b as HTMLElement & { icon?: HTMLImageElement };
        bel.icon = BlockSpecs.getImageFrom('assets/blockicons/' + c, 'svg');
        const icon = bel.icon as HTMLImageElement;
        ctx.clearRect(0, 0, 64 * scaleMultiplier * window.devicePixelRatio, 64 * scaleMultiplier * window.devicePixelRatio);
        // On Android 4.2, clearRect does not work right away. Need to tickle the DOM
        block.blockicon.style.display = 'none';
        //block.blockicon.offsetHeight;
        block.blockicon.style.display = 'inherit';
        if (!icon.complete) {
            icon.onload = function () {
                var w = icon.width;
                var h = icon.height;
                ctx.drawImage(icon, 0, 0, w, h, 0, 0, w * scaleMultiplier * window.devicePixelRatio, h * scaleMultiplier * window.devicePixelRatio);
            };
        } else {
            var w = icon.width;
            var h = icon.height;
            ctx.drawImage(icon, 0, 0, w, h, 0, 0, w * scaleMultiplier * window.devicePixelRatio, h * scaleMultiplier * window.devicePixelRatio);
        }
        if (Menu.openMenu) {
            Menu.openMenu!.parentNode!.removeChild(Menu.openMenu!);
        }
        if (block.arg.argValue != value) {
            var spr = getModelRefAs<Scripts>(b.parentNode as HTMLElement, 'scripts')!.spr;
            var action = {
                action: 'scripts',
                where: (getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page')!).id,
                who: spr.id
            };
            enginePorts().undoRecord(action);
            enginePorts().storyStart('BlockArg.prototype.menuCloseSpeeds');
        }
        Menu.openMenu = null;
    }

    //////////////////////////
    // Page Icon
    //////////////////////////

    pageIcon (num: number) {
        var dpr = window.devicePixelRatio;
        var page = enginePorts().getStage().pages[num - 1];
        var icon = document.createElement('canvas');
        setCanvasSize(icon, 86 * dpr, 66 * dpr);
        if (!page) {
            return icon;
        }
        var canvas = document.createElement('canvas');
        setCanvasSize(canvas, 52 * dpr, 42 * dpr);
        var mainctx = canvas.getContext('2d')!;
        mainctx.fillStyle = '#AE1F24';
        mainctx.fillRect(0, 0, canvas.width, canvas.height);
        mainctx.fillStyle = '#28A5DA';
        mainctx.fillRect(1 * dpr, 1 * dpr, 50 * dpr, 40 * dpr);
        var c = document.createElement('canvas');
        var w = (52 - 6) * dpr;
        var h = (42 - 6) * dpr;
        setCanvasSize(c, w, h);
        var ctx = c.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, c.width, c.height);
        if (page.bkg.childElementCount > 0) {
            var img = page.bkg.childNodes[0] as HTMLImageElement;
            var imgw = img.naturalWidth ? img.naturalWidth : img.width;
            var imgh = img.naturalHeight ? img.naturalHeight : img.height;
            ctx.drawImage(img, 0, 0, imgw, imgh, 0, 0, w, h);
        }
        var scale = w / 480;
        for (var i = 0; i < page.div.childElementCount; i++) {
            var spr = getModelRefAs<Sprite>(page.div.childNodes[i] as HTMLElement, 'sprite')!;
            if (!spr) {
                continue;
            }
            page.stampSpriteAt(ctx, spr as Sprite, scale);
        }
        mainctx.drawImage(c, 3 * dpr, 3 * dpr);
        var ictx = icon.getContext('2d')!;
        ictx.fillStyle = '#AE1F24';
        ictx.beginPath();
        ictx.arc(63 * dpr, 19 * dpr, 10 * dpr, 0 * dpr, Math.PI * 2, true);
        ictx.closePath();
        ictx.fill();
        ictx.drawImage(canvas, 14 * dpr, 16 * dpr);
        ictx.beginPath();
        ictx.fillStyle = '#28A5DA';
        ictx.strokeStyle = '#355E7C';
        ictx.arc(63 * dpr, 19 * dpr, 8 * dpr, 0 * dpr, Math.PI * 2, true);
        ictx.closePath();
        ictx.stroke();
        ictx.fill();
        writeText(ictx, 'bold ' + (12 * dpr) + 'px '
            + window.Settings!.blockArgFont, 'white', String(page.num), 26 * dpr, 58 * dpr);
        return icon;
    }

    updateIcon () {
        var num = this.argValue as number;
        var page = enginePorts().getStage().pages[Number(num) - 1];
        page.num = num;
        this.div = this.pageIcon(num);
        var block = this.daddy;
        var ctx = block.blockshape.getContext('2d')!;
        const pageCanvas = this.div as HTMLCanvasElement;
        ctx.drawImage(pageCanvas, 0, 0, pageCanvas.width, pageCanvas.height, 0, 0, pageCanvas.width * block.scale, pageCanvas.height * block.scale);
    }
}