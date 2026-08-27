import { enginePorts } from './ports';
import { getModelRefAs, setModelRef, hasModelRef } from '../modelRegistry';
import Rectangle from '../../geom/Rectangle';
import Events from '../../utils/Events';
import ScratchAudio from '../../utils/ScratchAudio';
import Vector from '../../geom/Vector';
import Page from './Page';
import type Sprite from './Sprite';
import type Scripts from '../ui/Scripts';
import type Block from '../blocks/Block';

// Named-form access: document.forms.activetextbox etc.
const namedForms = document.forms as unknown as {
    activetextbox: HTMLFormElement & { typing: HTMLInputElement };
};
import {newHTML, newDiv, gn,
    getIdFor, setProps,
    scaleMultiplier, setCanvasSize,
    globaly, globalx} from '../../utils/lib';

export default class Stage {
    currentPage: Page;
    div: HTMLElement;
    pages: Page[];
    pagesdiv: HTMLElement;
    width: number;
    height: number;
    stageScale!: number;
    currentZoom: number;
    initialPoint: { x: number; y: number };
    deltaPoint: { x: number; y: number };

    constructor (div: HTMLElement) {
        this.currentPage = null as unknown as Page;
        this.div = newHTML('div', 'stage', div);
        this.div.setAttribute('id', 'stage');
        this.div.style.webkitTextSizeAdjust = '100%';
        this.width = 480;
        this.height = 360;
        this.setStageScaleAndPosition(scaleMultiplier, 46, 74);
        this.pages = [];
        this.pagesdiv = newDiv(this.div, 0, 0, 480, 360, {
            position: 'absolute'
        });
        var me = this;
        this.div.onmousedown = function (evt) {
            me.mouseDown(evt);
        };
        
        
        setModelRef(this.div, 'stage', this);
        this.currentZoom = 1;
        this.initialPoint = {
            x: 0,
            y: 0
        };
        this.deltaPoint = {
            x: 0,
            y: 0
        };
    }

    setStageScaleAndPosition (scale: number, x: number, y: number) {
        this.stageScale = scale;
        setProps(gn('stage')!.style, {
            webkitTransform: 'translate(' + (-this.width / 2) + 'px, ' + (-this.height / 2) + 'px) '
                + 'scale(' + scale + ') '
                + 'translate(' + (this.width / 2 + x) + 'px, ' + (this.height / 2 + y) + 'px)'
        });
    }

    getPagesID () {
        var res: string[] = [];
        for (var i = 0; i < this.pages.length; i++) {
            res.push(this.pages[i].id);
        }
        return res;
    }

    getPage (id: string) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].id == id) {
                return this.pages[i];
            }
        }
        return this.pages[0];
    }

    resetPage (obj: Page) {
        var page = obj.div;
        for (var i = 0; i < page.childElementCount; i++) {
            var spr = getModelRefAs<Sprite>(page.childNodes[i] as HTMLElement, 'sprite')!;
            if (!spr) {
                continue;
            }
            if (spr.type == 'sprite') {
                spr.goHome();
            }
        }
    }

    resetPages () {
        for (var i = 0; i < enginePorts().getStage().pages.length; i++) {
            Stage.prototype.resetPage(enginePorts().getStage().pages[i]);
        }
    }


    //goto page


    gotoPage (n: number) {
        if (n < 1) {
            return;
        }
        if (n > this.pages.length) {
            return;
        }
        if (Events.dragthumbnail && hasModelRef(Events.dragthumbnail)) {
            return;
        }
        this.setPage(this.pages[n - 1], true);
    }

    setPage (page: Page, isOn: boolean) {
        enginePorts().stopStrips();
        var sc = enginePorts().getSprite() ? gn(enginePorts().getStage().currentPage.currentSpriteName + '_scripts')! : undefined;
        if (sc) {
            const scriptsOwner = getModelRefAs<Scripts>(sc, 'scripts')!;
            scriptsOwner.deactivate();
        }
        this.currentPage.div.style.visibility = 'hidden';
        this.currentPage.setPageSprites('hidden');
        this.currentPage = page;
        this.currentPage.div.style.visibility = 'visible';
        this.currentPage.setPageSprites('visible');
        //  if (page == obj['currentPage'])	 this.currentPage.currentSpriteName = obj[page]["lastSprite"];
        enginePorts().thumbsUpdateSprites();
        enginePorts().thumbsUpdatePages();
        var spr = enginePorts().getSprite() as Sprite;
        if (spr) {
            spr.activate();
        }
        if (isOn) {
            this.loadPageThreads();
        }
    }

    loadPageThreads () {
        enginePorts().blur();
        var page = this.currentPage;
        for (var i = 0; i < page.div.childElementCount; i++) {
            var spr = getModelRefAs<Sprite>(page.div.childNodes[i] as HTMLElement, 'sprite')!;
            if (!spr) {
                continue;
            }
            spr.goHome();
            var sc = gn(spr.id + '_scripts')!;
            if (!sc) {
                continue;
            }
            const scriptsOwner = getModelRefAs<Scripts>(sc, 'scripts')!;
            var topblocks = scriptsOwner.getBlocksType(['onflag', 'ontouch']);
            for (var j = 0; j < topblocks.length; j++) {
                var b = topblocks[j];
                enginePorts().getRuntime().addRunScript(spr, b);
            }
        }
    }


    //Copy Sprite
    /////////////////////////////////'

    copySprite (el: HTMLElement, thumb: HTMLElement) {
        ScratchAudio.sndFX('copy.wav');
        enginePorts().thumbsOverpage(thumb);
        var data = enginePorts().projectEncodeSprite(getModelRefAs<string>(el as HTMLElement, 'pagethumb')!);
        if (getModelRefAs<Page>(gn(getModelRefAs<string>(thumb, 'pagethumb')!)!, 'page') == this.currentPage) {
            data.xcoor = Number(data.xcoor) + 10;
            data.ycoor = Number(data.ycoor) + 10;
            data.homex = data.xcoor;
            data.homey = data.ycoor;
        }
        var a = (data.id as string).split(' ');
        if (Number(a[a.length - 1]).toString() != 'NaN') {
            a.pop();
        }
        var page = getModelRefAs<Page>(gn(getModelRefAs<string>(thumb as HTMLElement, 'pagethumb')!)!, 'page')!;
        var name = getIdFor(a.join(' '));
        data.id = name;
        var stg = this;
        var whenDone = function (spr: Sprite) {
            if (spr.page.id == enginePorts().getStage().currentPage.id) {
                spr.div.style.visibility = 'visible';
            }
            if (!page.currentSpriteName) {
                page.currentSpriteName = spr.id;
            }
            enginePorts().thumbsUpdateSprites();
            enginePorts().thumbsUpdatePages();
            const ownerPage = getModelRefAs<Page>(gn(getModelRefAs<string>(thumb as HTMLElement, 'pagethumb')!)!, 'page')!;
            enginePorts().undoRecord({
                action: 'copy',
                who: name,
                where: ownerPage.id
            });
            enginePorts().storyStart('Stage.prototype.copySprite');
        };
        enginePorts().projectRecreateObject(page, name, data, whenDone, page.id == stg.currentPage.id);
    }


    //Delete page


    deletePage (str: string, data?: unknown) {
        //  reserve a next id to be able to Undo deleting the first page
        enginePorts().storyStart('Stage.prototype.deletePage'); // Record a change for sample projects in story-starter mode
        var pageid = getIdFor('page');
        var sprAttr: Record<string, unknown> = enginePorts().uiMascotData();
        var newp: Record<string, unknown> = {};
        var catid = sprAttr.id as string;
        newp.sprites = [catid];
        newp.num = 1;
        newp.lastSprite = catid;
        newp[catid] = sprAttr;
        newp.layers = [catid];
        var page = getModelRefAs<Page>(gn(str) as HTMLElement, 'page')!;
        var indx = this.getPagesID().indexOf(str);
        if (indx < 0) {
            return;
        }
        var form = namedForms.activetextbox;
        var cnv = form.textsprite;
        if (cnv && gn(cnv.id!)!) {
            enginePorts().blur();
        }
        this.removePageBlocks(str);
        this.pages.splice(indx, 1);
        if (!data) {
            ScratchAudio.sndFX('cut.wav');
        }
        this.removePage(page);
        if (this.pages.length == 0) {
            var p = new Page(pageid, newp, refreshPage);
            sprAttr.page = p;
        } else {
            if (str == this.currentPage.id) {
                this.setViewPage(this.pages[0]);
            }
            enginePorts().thumbsUpdateSprites();
            enginePorts().thumbsUpdatePages();
            if (!data) {
                enginePorts().undoRecord({
                    action: 'deletepage',
                    where: str,
                    who: str
                });
            }
        }
        function refreshPage () {
            enginePorts().getStage().setViewPage(enginePorts().getStage().currentPage);
            enginePorts().thumbsUpdateSprites();
            enginePorts().thumbsUpdatePages();
            if (!data) {
                enginePorts().undoRecord({
                    action: 'deletepage',
                    where: str,
                    who: str
                });
            }
        }
    }

    setViewPage (page: Page) {
        this.currentPage = page;
        this.currentPage.div.style.visibility = 'visible';
        this.currentPage.setPageSprites('visible');
    }

    removePageBlocks (str: string) {
        var indx = this.getPagesID().indexOf(str);
        for (var n = 0; n < this.pages.length; n++) {
            var page = this.pages[n];
            for (var i = 0; i < page.div.childElementCount; i++) {
                var spr = getModelRefAs<Sprite>(page.div.childNodes[i] as HTMLElement, 'sprite')!;
                if (!spr) {
                    continue;
                }
                var sc = gn(spr.id + '_scripts')!;
                if (!sc) {
                    continue;
                }
                const scriptsOwner = getModelRefAs<Scripts>(sc, 'scripts')!;
                var gotoblocks: Block[] = scriptsOwner.getBlocksType(['gotopage']);
                for (var j = 0; j < gotoblocks.length; j++) {
                    var b = gotoblocks[j];
                    var pageindex = (b.getArgValue() as number) - 1;
                    if (this.pages[pageindex].id == str) {
                        var prev = b.prev;
                        b.detachBlock();
                        b.div.parentNode!.removeChild(b.div);
                        if (prev && prev.aStart) {
                            prev.div.parentNode!.removeChild(prev.div);
                        }
                    } else if (((b.getArgValue() as number) - 1) > indx) {
                        (b.arg.argValue as number) -= 1;
                        this.pages[pageindex].num = b.arg.argValue as number;
                        b.arg.updateIcon();
                    }
                }
            }
        }
    }


    //Events MouseDown


    mouseDown (e: MouseEvent) {
       /* if (e.touches && (e.touches.length > 1)) {
            return;
        }*/
        
        if (enginePorts().isOnHold()) {
            return;
        }
        e.preventDefault();
        enginePorts().blur();
        if (!this.currentPage) {
            return;
        }
        if (namedForms.activetextbox.textsprite) {
            return;
        }
        var pt = this.getStagePt(e);
        setCanvasSize(enginePorts().getWorkingCanvas(), 480, 360);
        var ctx = enginePorts().getWorkingCanvas().getContext('2d')!;
        // mousedown originates on stage DOM elements
        const targetEl = e.target as HTMLElement;
        var target = (targetEl.nodeName == 'CANVAS') ? this.checkShaking(pt, targetEl) : targetEl;
        const shaking = enginePorts().getShaking();
        if (shaking && (target.id == 'deletesprite')) {
            this.removeSprite(getModelRefAs<Sprite>(shaking as HTMLElement, 'sprite')!);
            return;
        }
        ctx.clearRect(0, 0, 480, 360);
        var hitobj = this.whoIsIt(ctx, pt);
        if (shaking && hitobj && (hitobj.id == shaking.id)) { // check grid case
            var sprname = shaking.id;
            const sprnameOwner = getModelRefAs<Sprite>(gn(sprname) as HTMLElement, 'sprite')!;
        if (((pt.x - sprnameOwner.screenLeft()) < 45) && ((pt.y - sprnameOwner.screenTop()) < 45)) {
                this.removeSprite(getModelRefAs<Sprite>(shaking as HTMLElement, 'sprite')!);
                return;
            }
        }
        if (!hitobj) {
            enginePorts().clearSelection();
            return;
        }
        if (enginePorts().getShaking()) {
            enginePorts().clearSelection();
        } else {
            this.mouseDownOnSprite(hitobj, pt);
        }
    }

    checkShaking (pt: {x: number; y: number}, target: HTMLElement): HTMLElement {
        if (!enginePorts().getShaking()) {
            return target;
        }
        var dx = globalx(gn('deletesprite')!) - globalx(enginePorts().getStage().pagesdiv);
        var dy = globaly(gn('deletesprite')!) - globaly(enginePorts().getStage().pagesdiv);
        var w = gn('deletesprite')!.offsetWidth;
        var h = gn('deletesprite')!.offsetHeight;
        var rect = new Rectangle(dx, dy, w, h);
        return rect.hitRect(pt) ? gn('deletesprite')! : target;
    }

    mouseDownOnSprite (spr: Sprite, pt: {x: number; y: number}) {
        this.initialPoint = {
            x: pt.x,
            y: pt.y
        };
        Events.dragthumbnail = spr.div;
        Events.clearEvents();
        if (!enginePorts().isInFullscreen() && enginePorts().isEditable()) {
            Events.holdit(spr.div, this.startShaking);
        }
        this.setEvents();
    }

    whoIsIt (ctx: CanvasRenderingContext2D, pt: {x: number; y: number}): Sprite | undefined {
        var page = this.currentPage.div;
        var spr: Sprite | undefined;
        var pixel: Uint8ClampedArray;
        for (var i = page.childElementCount - 1; i > -1; i--) {
            spr = getModelRefAs<Sprite>(page.childNodes[i] as HTMLElement, 'sprite')!;
            if (!spr) {
                continue;
            }
            if (!spr.shown) {
                continue;
            }
            spr.stamp(ctx);
            pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
            if (pixel[3] != 0) {
                return spr;
            }
        }
        var fuzzy = 5;
        ctx.clearRect(0, 0, 480, 360);
        for (var j = page.childElementCount - 1; j > -1; j--) {
            spr = getModelRefAs<Sprite>(page.childNodes[j] as HTMLElement, 'sprite')!;
            if (!spr) {
                continue;
            }
            if (!spr.shown) {
                continue;
            }
            spr.stamp(ctx);
            spr.stamp(ctx, fuzzy, 0);
            spr.stamp(ctx, 0, fuzzy);
            spr.stamp(ctx, -fuzzy, 0);
            spr.stamp(ctx, 0, -fuzzy);
            pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
            if (pixel[3] != 0) {
                return spr;
            }
        }
        return undefined;
    }

    getStagePt (evt: MouseEvent): {x: number; y: number} {
        var pt = Events.getTargetPoint(evt);
        var mc = this.div;
        var dx = globalx(mc);
        var dy = globaly(mc);
        pt.x -= dx;
        pt.y -= dy;
        pt.x /= this.stageScale;
        pt.y /= this.stageScale;
        return pt;
    }

    setEvents () {
        var me = this;
        window.onmousemove = function (evt) {
            me.mouseMove(evt);
        };
        window.onmouseup = function (evt) {
            me.mouseUp(evt);
        };
    }

    startShaking (b: HTMLElement) {
        if (!hasModelRef(b)) {
            return;
        }
        Events.clearEvents();
        enginePorts().setShaking(b);
        enginePorts().setStopShaking(() => enginePorts().getStage().stopShaking(enginePorts().getShaking()!));
        (getModelRefAs<Sprite>(b as HTMLElement, 'sprite')!).startShaking();
    }

    stopShaking (b: HTMLElement) {
        if (!hasModelRef(b)) {
            return;
        }
        (getModelRefAs<Sprite>(b as HTMLElement, 'sprite')!).stopShaking();
        enginePorts().setShaking(undefined);
        enginePorts().setStopShaking(undefined);
    }

    startSpriteDrag (e?: MouseEvent) {
        var spr = getModelRefAs<Sprite>(Events.dragthumbnail as HTMLElement, 'sprite')!;
        spr.threads = enginePorts().getRuntime().removeRunScript(spr);
        this.currentPage.div.appendChild(Events.dragthumbnail);
        this.deltaPoint = {
            x: this.initialPoint.x,
            y: this.initialPoint.y
        };
        Events.dragged = true;
        enginePorts().markChanged();
    }

    mouseMove (e: MouseEvent) {
        if (!Events.dragthumbnail) {
            return;
        }
        var pt = this.getStagePt(e);
        var delta = Vector.diff(pt, this.initialPoint);
        var dist = enginePorts().isInFullscreen() ? 15 : 5;
        if (!Events.dragged && (Vector.len(delta) > dist)) {
            this.startSpriteDrag(e);
        }
        if (!Events.dragged) {
            return;
        }
        if (Events.timeoutEvent) {
            clearTimeout(Events.timeoutEvent);
        }
        Events.timeoutEvent = undefined;
        var spr = getModelRefAs<Sprite>(Events.dragthumbnail as HTMLElement, 'sprite')!;
        delta = this.wrapDelta(spr, Vector.diff(pt, this.deltaPoint));
        spr.xcoor += delta.x;
        spr.ycoor += delta.y;
        spr.render();
        this.deltaPoint = {
            x: pt.x,
            y: pt.y
        };
    }

    wrapDelta (spr: Sprite, delta: {x: number; y: number}): {x: number; y: number} {
        if (spr.type == 'text') {
            return this.wrapText(spr, delta);
        } else {
            return this.wrapChar(spr, delta);
        }
    }

    wrapChar (spr: Sprite, delta: {x: number; y: number}): {x: number; y: number} {
        if ((delta.x + spr.xcoor) < 0) {
            delta.x -= (spr.xcoor + delta.x);
        }
        if ((delta.y + spr.ycoor) < 0) {
            delta.y -= (spr.ycoor + delta.y);
        }
        if ((delta.x + spr.xcoor) >= 480) {
            delta.x += (479 - (spr.xcoor + delta.x));
        }
        if ((delta.y + spr.ycoor) >= 360) {
            delta.y += (359 - (spr.ycoor + delta.y));
        }
        return delta;
    }

    wrapText (spr: Sprite, delta: {x: number; y: number}): {x: number; y: number} {
        var max = spr.cx > 480 ? spr.cx : 480;
        var min = spr.cx > 480 ? 480 - spr.cx : 0;
        if ((delta.x + spr.xcoor) <= min) {
            delta.x -= (spr.xcoor + delta.x - min);
        }
        if ((delta.y + spr.ycoor) < 0) {
            delta.y -= (spr.ycoor + delta.y);
        }
        if ((delta.x + spr.xcoor) > max) {
            delta.x += (max - 1 - (spr.xcoor + delta.x));
        }
        if ((delta.y + spr.ycoor) >= 360) {
            delta.y += (359 - (spr.ycoor + delta.y));
        }
        return delta;
    }

    mouseUp (e: MouseEvent) {
        var spr = getModelRefAs<Sprite>(Events.dragthumbnail as HTMLElement, 'sprite')!;
        if (Events.timeoutEvent) {
            clearTimeout(Events.timeoutEvent);
        }
        Events.timeoutEvent = undefined;
        if (!Events.dragged) {
            this.clickOnElement(e, Events.dragthumbnail);
        } else {
            this.moveElementBy(spr);
            if (spr.type == 'sprite') {
                var rt = enginePorts().getRuntime();
rt.threadsRunning = rt.threadsRunning.concat(spr.threads);
                enginePorts().startCurrentPageStrips(['ontouch']);
            }
        }
        Events.clearEvents();
        Events.dragged = false;
        Events.dragthumbnail = null;
    }

    moveElementBy (spr: Sprite) {
        if (!enginePorts().isInFullscreen()) {
            spr.homex = spr.xcoor;
            spr.homey = spr.ycoor;
            spr.homeflip = spr.flip;
        }
        enginePorts().thumbsUpdatePages();
    }

    clickOnSprite (e: Event, spr: Sprite) {
        e.preventDefault();
        enginePorts().clearSelection();
        enginePorts().startScriptsFor(spr, ['onclick']);
        enginePorts().startCurrentPageStrips(['ontouch']);
    }


    //Delete Sprite
    /////////////////////////////////'

    removeSprite (sprite: Sprite) {
        enginePorts().setShaking(undefined);
        enginePorts().setStopShaking(undefined);
        ScratchAudio.sndFX('cut.wav');
        if (sprite.type == 'text') {
            sprite.deleteText(true);
        } else {
            this.removeCharacter(sprite);
        }
        this.currentPage.updateThumb();
        this.updatePageBlocks();
    }

    removeCharacter (spr: Sprite) {
        enginePorts().getRuntime().stopThreadSprite(spr);
        this.removeFromPage(spr);
        enginePorts().undoRecord({
            action: 'deletesprite',
            who: spr.id,
            where: enginePorts().getStage().currentPage.id
        });
        enginePorts().storyStart('Stage.prototype.removeCharacter');
        enginePorts().thumbsUpdateSprites();
    }

    updatePageBlocks () {
        for (var i = 0; i < enginePorts().getStage().pages.length; i++) {
            var page = enginePorts().getStage().pages[i];
            enginePorts().scriptsPaneUpdateScriptsPageBlocks(JSON.parse(page.sprites));
        }
    }

    removeFromPage (spr: Sprite) {
        var id = spr.id;
        var sc = gn(id + '_scripts')!;
        var page = this.currentPage;
        var list = JSON.parse(page.sprites);
        var n = list.indexOf(id);
        if (n < 0) {
            return;
        }
        var th = spr.thumbnail;
        var sprite = enginePorts().getSprite() as Sprite;
        list.splice(n, 1);
        spr.div.parentNode!.removeChild(spr.div);
        if (sc) {
            sc.parentNode!.removeChild(sc);
        }
        page.sprites = JSON.stringify(list);
        th.parentNode!.removeChild(th);
        if (sprite && (sprite.id == spr.id)) {
            var sprites = page.getSprites();
            page.setCurrentSprite((sprites.length > 0) ? getModelRefAs<Sprite>(gn(sprites[0]) as HTMLElement, 'sprite')! : undefined);
        }
    }

    renumberPageBlocks (list: string[]) {
        var pages = this.getPagesID();
        for (var n = 0; n < this.pages.length; n++) {
            var page = this.pages[n];
            for (var i = 0; i < page.div.childElementCount; i++) {
                var spr = getModelRefAs<Sprite>(page.div.childNodes[i] as HTMLElement, 'sprite')!;
                if (!spr) {
                    continue;
                }
                var sc = gn(spr.id + '_scripts')!;
                if (!sc) {
                    continue;
                }
                const scriptsOwner = getModelRefAs<Scripts>(sc, 'scripts')!;
                var gotoblocks: Block[] = scriptsOwner.getBlocksType(['gotopage']);
                for (var j = 0; j < gotoblocks.length; j++) {
                    var b = gotoblocks[j];
                    var indx = (b.getArgValue() as number) - 1;
                    if (indx < 0 || indx >= list.length) continue;
                    b.arg.argValue = pages.indexOf(list[indx]) + 1;
                    b.updateBlock();
                }
            }
        }
    }

    clickOnElement (e: Event, spr: HTMLElement) {
        const owner = getModelRefAs<Sprite>(spr as HTMLElement, 'sprite')!;
        if (owner.type == 'text') {
            if (!enginePorts().isInFullscreen()) {
                owner.clickOnText(e);
            }
        } else if (owner.type == 'sprite') {
            this.clickOnSprite(e, owner);
        }
    }


    //Stage clear
    ///////////////////////////////////////

    clear () {
        for (var i = 0; i < this.pages.length; i++) {
            this.removePage(this.pages[i]);
        }
        this.pages = [];
        while (this.pagesdiv.childElementCount > 0) {
            this.pagesdiv.removeChild(this.pagesdiv.childNodes[0]);
        }
    }

    removePage (p: Page) {
        var list = JSON.parse(p.sprites);
        for (var j = 0; j < list.length; j++) {
            var name = list[j];
            var sprite = gn(name)!;
            var sc = gn(name + '_scripts')!;
            if (sc) {
                sc.parentNode!.removeChild(sc);
            }
            sprite.parentNode!.removeChild(sprite);
        }
        p.div.parentNode!.removeChild(p.div);
    }
}
