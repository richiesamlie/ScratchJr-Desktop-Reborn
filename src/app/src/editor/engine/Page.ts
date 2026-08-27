import ScratchJr from '../ScratchJr';
import { enginePorts } from './ports';
import { bumpMediaCount, getMediaCount } from './mediaCounter';
import { getModelRefAs, setModelRef } from '../modelRegistry';
import Sprite from './Sprite';
import BlockSpecs from '../blocks/BlockSpecs';
import PlatformBridge from '../../platform/PlatformBridge';
import IO from '../../platform/IO';
import MediaLib from '../../platform/MediaLib';
import Matrix from '../../geom/Matrix';
import Vector from '../../geom/Vector';
import {newHTML, newDiv, gn,
    setCanvasSizeScaledToWindowDocumentHeight,
    DEGTOR, getIdFor, setProps} from '../../utils/lib';

export default class Page {
    div: HTMLElement;
    bkg: HTMLElement;
    currentSpriteName!: string | undefined;
    id: string;
    md5!: string | undefined;
    num: number;
    sprites: string;
    svg!: Element | null;
    textstartat: number;
    thumbnail!: HTMLElement;

    constructor (id: string, data?: Record<string, unknown>, fcn?: () => void) {
        var container = enginePorts().getStage().pagesdiv;
        this.div = newHTML('div', 'stagepage', container); // newDiv(container,0,0, 480, 360, {position: 'absolute'});
        setModelRef(this.div, 'page', this);
        this.id = id;
        this.textstartat = 36;
        this.div.setAttribute('id', this.id);
        enginePorts().getStage().currentPage = this;
        this.num = data ? data.num as number : enginePorts().getStage().pages.length + 1;
        this.sprites = JSON.stringify([]);
        this.bkg = newDiv(this.div, 0, 0, 480, 360, {
            position: 'absolute',
            background: enginePorts().getStageColor()
        });
        this.bkg.type = 'background';
        enginePorts().getStage().pages.push(this);
        if (!data) {
            this.emptyPage();
        } else {
            this.loadPageData(data, fcn);
        }
    }

    loadPageData (data: Record<string, unknown>, fcn?: () => void) {
        this.currentSpriteName = data.lastSprite as string;
        if (data.textstartat) {
            this.textstartat = Number(data.textstartat);
        }
        if (data.md5 && (data.md5 != 'undefined')) {
            bumpMediaCount(1);
            this.setBackground(data.md5 as string, checkBkgDone);
        } else {
            this.clearBackground();
        }
        var list = data.sprites as string[];
        for (var j = 0; j < list.length; j++) {
            enginePorts().projectRecreateObject(this, list[j], data[list[j]] as Record<string, unknown>, checkCount);
        }
        var layers = data.layers as string[];
        for (var i = 0; i < layers.length; i++) {
            var obj = gn(layers[i])!;
            if (obj) {
                this.div.appendChild(obj);
            }
        }
        function checkCount () {
            if (!fcn) {
                return;
            }
            if (getMediaCount() < 1) {
                fcn();
            }
        }

        function checkBkgDone () {
            enginePorts().projectSubstractCount();
            if (!fcn) {
                return;
            }
            if (getMediaCount() < 1) {
                fcn();
            }
        }
    }

    emptyPage () {
        this.clearBackground();
        this.createCat();
    }

    setCurrentSprite (spr?: Sprite) { // set the sprite and toggles UI if no sprite is available
        if (enginePorts().getSprite()) {
            (enginePorts().getSprite() as Sprite).unselect();
        }
        if (spr) {
            this.currentSpriteName = spr.id;
            spr.div.style.visibility = 'visible';
            enginePorts().paletteShow();
            gn('scripts')!.style.display = enginePorts().isInFullscreen() ? 'none' : 'block';
            spr.activate();
        } else {
            this.currentSpriteName = undefined;
            enginePorts().paletteHide();
            gn('scripts')!.style.display = 'none';
        }
    }

    clearBackground () {
        while (this.bkg.childElementCount > 0) {
            this.bkg.removeChild(this.bkg.childNodes[0]);
        }
    }

    setBackground (name: string, fcn?: () => void) {
        if (name == 'undefined') {
            return;
        }
        this.clearBackground();
        this.md5 = undefined;
        if (name == 'none') {
            if (fcn) {
                fcn();
            }
            return;
        }
        this.md5 = name;
        if (!name) {
            return;
        }
        var me = this;
        var keys = MediaLib.keys as Record<string, unknown>;
        var url = (keys[name]) ? MediaLib.path + name : (name.indexOf('/') < 0) ? PlatformBridge.path + name : name;
        var md5 = (keys[name]) ? MediaLib.path + name : name;

        if (md5.substr(md5.length - 3) == 'png') {
            this.setBackgroundImage(url, fcn);
            this.svg = null;
            return;
        }

        if (md5.indexOf('/') > -1) {
            IO.requestFromServer(md5, doNext);
        } else {
            PlatformBridge.getmedia(md5, nextStep);
        }
        function nextStep (base64: string) {
            doNext(atob(base64));
        }
        function doNext (str: string) {
            str = str.replace(/>\s*</g, '><');
            me.setSVG(str);
            if ((str.indexOf('xlink:href') < 0) && PlatformBridge.path) {
                me.setBackgroundImage(url, fcn); // does not have embedded images
            } else {
                var base64 = IO.getImageDataURL(me.md5!, btoa(str));
                IO.getImagesInSVG(str, function () {
                    me.setBackgroundImage(base64, fcn);
                });
            }
        }
    }

    setSVG (str: string) {
        var xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
        var extxml = document.importNode(xmlDoc.documentElement, true);
        if (extxml.childNodes[0].nodeName == '#comment') {
            extxml.removeChild(extxml.childNodes[0]);
        }
        this.svg = extxml as Element;
    }

    setBackgroundImage (url: string, fcn?: () => void) {
        var img = document.createElement('img');
        img.src = url;
        this.bkg.originalImg = img.cloneNode(false) as HTMLImageElement;
        this.bkg.appendChild(img);
        setProps(img.style, {
            position: 'absolute',
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%'
        });
        this.bkg.img = img;
        if (!img.complete) {
            img.onload = function () {
                if (gn('backdrop')!.className == 'modal-backdrop fade in') {
                    enginePorts().projectSetProgress(enginePorts().projectGetMediaLoadRatio(70));
                }
                if (fcn) {
                    fcn();
                }
            };
        } else {
            if (gn('backdrop')!.className == 'modal-backdrop fade in') {
                enginePorts().projectSetProgress(enginePorts().projectGetMediaLoadRatio(70));
            }
            if (fcn) {
                fcn();
            }
        }
    }

    setPageSprites (showstate: string) {
        var list = JSON.parse(this.sprites);
        for (var i = 0; i < list.length; i++) {
            gn(list[i])!.style.visibility = showstate;
        }
    }

    redoChangeBkg (data: Record<string, unknown>) {
        var me = this;
        var pagebag = data[this.id] as Record<string, unknown>;
        var md5 = pagebag.md5 as string || 'none';
        this.setBackground(md5, me.updateThumb);
    }

    //////////////////////////////////////
    // page thumbnail
    /////////////////////////////////////

    updateThumb (page?: Page) {
        var me = page ? page : enginePorts().getStage().currentPage;
        if (!me.thumbnail) {
            return;
        }
        var c = me.thumbnail.childNodes[0].childNodes[0] as HTMLCanvasElement;
        me.setPageThumb(c);
    }

    pageThumbnail (p: HTMLElement) {
        var tb = newHTML('div', 'pagethumb', p);
        tb.setAttribute('id', getIdFor('pagethumb'));
        setModelRef(tb, 'pagethumb', this.id);
        tb.type = 'pagethumb';
        var container = newHTML('div', 'pc-container', tb);
        var c = newHTML('canvas', 'pc', container) as HTMLCanvasElement;
        this.setPageThumb(c);
        var num = newHTML('div', 'pagenum', tb);
        var pq = newHTML('p', undefined, num);
        pq.textContent = String(this.num);
        newHTML('div', 'deletethumb', tb);
        tb.onmousedown = function (evt: MouseEvent) {
                enginePorts().thumbsPageMouseDown(evt);
            };
        this.thumbnail = tb;
        return tb;
    }

    setPageThumb (c: HTMLCanvasElement) {
        var w0, h0;
        if (window.Settings!.edition == 'PBS') {
            w0 = 136;
            h0 = 101;
        } else {
            w0 = 132;
            h0 = 99;
        }
        setCanvasSizeScaledToWindowDocumentHeight(c, w0, h0);
        var w = c.width;
        var h = c.height;
        var ctx = c.getContext('2d')!;

        if (window.Settings!.edition == 'PBS') {

            ctx.rect(0, 0, w, h);
            ctx.fillStyle = '#fff';
            ctx.fill();
        } else {
            ctx.drawImage(BlockSpecs.canvasMask, 0, 0, w, h);
        }
        if (this.bkg.childElementCount > 0) {
            var img = this.bkg.originalImg!;
            var imgw = img.naturalWidth ? img.naturalWidth : img.width;
            var imgh = img.naturalHeight ? img.naturalHeight : img.height;
            ctx.drawImage(img, 0, 0, imgw, imgh, 0, 0, w, h);
        }
        var scale = w / 480;
        for (var i = 0; i < this.div.childElementCount; i++) {
            var spr = getModelRefAs<Sprite>(this.div.childNodes[i] as HTMLElement, 'sprite')!;
            if (!spr) {
                continue;
            }
            this.stampSpriteAt(ctx, spr, scale);
        }
        if (window.Settings!.edition != 'PBS') {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(BlockSpecs.canvasMask, 0, 0, w, h);
            ctx.restore();
        }
    }

    /**
     * Full-resolution stage render for image export. Same painter as the
     * thumbnails (bkg image + stamped sprites) but at native stage size,
     * opaque background, and no thumbnail mask.
     */
    renderStageToCanvas (scale = 2): HTMLCanvasElement {
        var c = document.createElement('canvas');
        c.width = 480 * scale;
        c.height = 360 * scale;
        var ctx = c.getContext('2d')!;
        ctx.fillStyle = ScratchJr.stagecolor || '#FFFFFF';
        ctx.fillRect(0, 0, c.width, c.height);
        if (this.bkg.childElementCount > 0 && this.bkg.originalImg) {
            var img = this.bkg.originalImg;
            var imgw = img.naturalWidth ? img.naturalWidth : img.width;
            var imgh = img.naturalHeight ? img.naturalHeight : img.height;
            ctx.drawImage(img, 0, 0, imgw, imgh, 0, 0, c.width, c.height);
        }
        var scaleF = c.width / 480;
        for (var i = 0; i < this.div.childElementCount; i++) {
            var spr = getModelRefAs<Sprite>(this.div.childNodes[i] as HTMLElement, 'sprite');
            if (!spr) {
                continue;
            }
            this.stampSpriteAt(ctx, spr, scaleF);
        }
        return c;
    }

    stampSpriteAt (ctx: CanvasRenderingContext2D, spr: Sprite, scale: number) {
        if (!spr.shown) {
            return;
        }
        var img = (spr.type == 'sprite') ? spr.originalImg : spr.outline;
        this.drawSpriteImage(ctx, img, spr, scale);
    }

    drawSpriteImage (ctx: CanvasRenderingContext2D, img: HTMLImageElement | HTMLCanvasElement, spr: Sprite, scale: number) {
        if (!spr.shown) {
            return;
        }
        if (!img) {
            return;
        }
        var htmlImg = img as HTMLImageElement;
        var imgw = htmlImg.naturalWidth ? htmlImg.naturalWidth : img.width;
        var imgh = htmlImg.naturalHeight ? htmlImg.naturalHeight : img.height;
        var sw = imgw * spr.scale;
        var sh = imgh * spr.scale;
        ctx.save();
        var pt = {
            x: spr.cx * spr.scale * scale,
            y: spr.cy * spr.scale * scale
        };
        ctx.translate(pt.x, pt.y);
        ctx.rotate(spr.angle * DEGTOR);
        ctx.translate(-pt.x, -pt.y);
        if (spr.flip) {
            ctx.scale(-1, 1);
            ctx.translate(-img.width * scale * spr.scale, 0);
        }
        var mtx = this.getMatrixFor(spr, scale);
        var pos = Vector.floor(mtx.transformPoint({
            x: Math.floor(spr.screenLeft() * scale),
            y: Math.floor(spr.screenTop() * scale)
        }));
        ctx.drawImage(img, 0, 0, imgw, imgh, pos.x, pos.y, Math.floor(sw * scale), Math.floor(sh * scale));
        ctx.restore();
    }

    getMatrixFor (spr: Sprite, scale?: number) {
        var sx = new Matrix();
        var angle = spr.angle ? -spr.angle : 0;
        if (spr.flip) {
            sx.a = -1;
            sx.d = 1;
        }
        var rx = new Matrix();
        rx.rotate(angle);
        return sx.multiply(rx);
    }

    /////////////////////
    // Saving
    /////////////////////

    encodePage () {
        var p = this.div;
        var spritelist = JSON.parse(this.sprites);
        var data: Record<string, unknown> = {};
        data.textstartat = this.textstartat;
        data.sprites = spritelist;
        var md5 = this.md5;
        if (md5) {
            data.md5 = md5;
        }
        data.num = this.num;
        const owner = this.currentSpriteName ? getModelRefAs<unknown>(gn(this.currentSpriteName)!, 'sprite') : null;
        const isSpriteOwner = owner != null && typeof owner === 'object' && 'type' in owner && owner.type == 'sprite';
        this.currentSpriteName = !this.currentSpriteName ? undefined : isSpriteOwner ? this.currentSpriteName : this.getSprites()[0];
        data.lastSprite = this.currentSpriteName;
        for (var j = 0; j < spritelist.length; j++) {
            data[spritelist[j]] = enginePorts().projectEncodeSprite(spritelist[j]);
        }
        var layers: string[] = [];
        for (var i = 1; i < p.childElementCount; i++) {
            const layerNode = p.childNodes[i] as HTMLElement;
            var layerid = layerNode.id;
            if (layerid && (layerid != '')) {
                layers.push(layerid);
            }
        }
        data.layers = layers;
        return data;
    }

    getSprites () {
        var spritelist = JSON.parse(this.sprites);
        var res: string[] = [];
        for (var i = 0; i < spritelist.length; i++) {
            const owner = getModelRefAs<unknown>(gn(spritelist[i])!, 'sprite');
            if (owner && typeof owner === 'object' && 'type' in owner && owner.type == 'sprite') {
                res.push(spritelist[i]);
            }
        }
        return res;
    }


    /////////////////////////////
    // Object creation
    /////////////////////////////

    createText () {
        var textAttr: Record<string, unknown> = {
            shown: true,
            type: 'text',
            scale: 1,
            defaultScale: 1,
            speed: 2,
            dirx: 1,
            diry: 1,
            angle: 0,
            homex: 240,
            homey: this.textstartat,
            xcoor: 240,
            ycoor: this.textstartat,
            str: '',
            color: BlockSpecs.fontcolors[BlockSpecs.fontcolors.length - 1],
            fontsize: 36,
            cx: 0,
            cy: (32 * 1.35 / 2),
            w: 0,
            h: 36 * 1.35
        };
        textAttr.page = this;
        textAttr.id = getIdFor('Text');
        return new Sprite(textAttr);
    }

    createCat () {
        var sprAttr = enginePorts().uiMascotData(enginePorts().getStage().currentPage);
        bumpMediaCount(1);
        var me = this;
        return new Sprite(sprAttr, me.pageAdded);
    }

    update (spr?: Sprite) {
        if (spr) {
            enginePorts().undoRecord({
                action: 'modify',
                where: this.id,
                who: spr.id
            });
        } else {
            enginePorts().undoRecord({
                action: 'recreatepage',
                where: this.id,
                who: this.id
            });
        }
        if (spr) {
            enginePorts().thumbsUpdateSprite(spr);
        } else {
            enginePorts().thumbsUpdateSprites();
        }
        enginePorts().thumbsUpdatePages();
    }

    updateBkg () {
        var me = enginePorts().getStage().currentPage;
        enginePorts().storyStart('Page.prototype.updateBkg');
        enginePorts().undoRecord({
            action: 'changebkg',
            where: me.id,
            who: me.id
        });
        enginePorts().thumbsUpdatePages();
    }

    spriteAdded (spr: Sprite) {
        var me = getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page')!;
        me.setCurrentSprite(spr);
        me.update(spr);
        enginePorts().uiSpriteInView(spr);
        enginePorts().setOnHold(false);
    }

    pageAdded (spr: Sprite) {
        var me = getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page')!;
        bumpMediaCount(-1);
        me.setCurrentSprite(spr);
        enginePorts().storyStart('Page.prototype.pageAdded');
        if (enginePorts().getStage().pages.length > 1) {
            enginePorts().undoRecord({
                action: 'addpage',
                where: me.id,
                who: me.id
            });
        }
        enginePorts().thumbsUpdateSprites();
        enginePorts().thumbsUpdatePages();
    }

    addSprite (scale: number, md5: string, cname: string) {
        enginePorts().setOnHold(true);
        var sprAttr: Record<string, unknown> = {
            flip: false,
            angle: 0,
            shown: true,
            type: 'sprite',
            scale: scale,
            defaultScale: scale,
            speed: 2,
            dirx: 1,
            diry: 1,
            sounds: ['pop.mp3'],
            homex: 240,
            homescale: scale,
            homey: 180,
            xcoor: 240,
            ycoor: 180,
            homeshown: true
        };
        sprAttr.page = enginePorts().getStage().currentPage;
        sprAttr.id = getIdFor(cname);
        sprAttr.name = cname;
        sprAttr.md5 = md5;
        return new Sprite(sprAttr, this.spriteAdded);
    }

    createSprite (data: Record<string, unknown>) {
        return new Sprite(data, this.spriteAdded);
    }

    modifySprite (md5: string, cid: string, sid: string) {
        var sprite = getModelRefAs<Sprite>(gn(unescape(sid)) as HTMLElement, 'sprite')!;
        if (!sprite) {
            sprite = enginePorts().getSprite() as Sprite;
        }
        sprite.md5 = md5;
        sprite.name = cid;
        var me = this;
        sprite.getAsset(gotImage);
        function gotImage (dataurl: string) {
            sprite.setCostume(dataurl, me.spriteAdded);
        }
    }

    modifySpriteName (cid: string, sid: string) {
        var sprite = getModelRefAs<Sprite>(gn(unescape(sid)) as HTMLElement, 'sprite')!;
        if (!sprite) {
            sprite = enginePorts().getSprite() as Sprite;
        }
        sprite.name = cid;
        sprite.thumbnail.childNodes[1].textContent = cid;
        enginePorts().undoRecord({
            action: 'modify',
            where: this.id,
            who: sprite.id
        });
        enginePorts().storyStart('Page.prototype.modifySpriteName');
    }
}