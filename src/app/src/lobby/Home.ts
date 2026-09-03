//////////////////////////////////////////////////
// Home Screen
//////////////////////////////////////////////////

import Lobby from './Lobby.js';
import PlatformBridge from '../platform/PlatformBridge';
import IO from '../platform/IO';
import Localization from '../utils/Localization';
import ScratchAudio from '../utils/ScratchAudio';
import Alert from '../editor/ui/Alert';
import Vector from '../geom/Vector';
import {gn, newHTML, isTouch} from '../utils/lib';

let frame: HTMLElement;
let scrollvalue: number;
let version: string;
let timeoutEvent: NodeJS.Timeout | null = null;
let isDuplicating = false;

export default class Home {
    // Dynamic statics used by the touch handlers below
    static dragging = false;
    static holding = false;
    static actionTarget: HTMLElement | null = null;
    static initialPt: { x: number; y: number };
    static scrolltop: number;

    static init () {
        version = Lobby.version;
        frame = gn('htmlcontents')!;
        var inner = newHTML('div', 'inner', frame);
        var div = newHTML('div', 'scrollarea', inner);
        div.setAttribute('id', 'scrollarea');
        frame.onmousedown = Home.handleTouchStart;
        frame.onmouseup = Home.handleTouchEnd;
        frame.ontouchstart = Home.handleTouchStart as unknown as (this: GlobalEventHandlers, ev: TouchEvent) => any;
        frame.ontouchend = Home.handleTouchEnd as unknown as (this: GlobalEventHandlers, ev: TouchEvent) => any;
        Home.installSjrDrop();
        Home.displayYourProjects();
    }

    ////////////////////////////
    // Home Screen
    ////////////////////////////

    static emptyProjectThumbnail (parent: HTMLElement) {
        var tb = newHTML('div', 'projectthumb', parent) as ThumbElement;
        newHTML('div', 'aproject empty', tb);
        tb.id = 'newproject';
    }

    static openProjectThumbnail (parent: HTMLElement) {
        var tb = newHTML('div', 'projectthumb', parent) as ThumbElement;
        newHTML('div', 'aproject open', tb);
        tb.id = 'openproject';
        var label = newHTML('div', 'projecttitle', tb);
        var txt = newHTML('h4', undefined, label);
        txt.textContent = Localization.localize('OPEN_PROJECT_TITLE') || 'Open';
    }

    static openFileDialog () {
        var input = document.getElementById('open-project-file-input') as HTMLInputElement | null;
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'open-project-file-input';
            input.accept = '.sjr';
            input.style.display = 'none';
            document.body.appendChild(input);
            input.onchange = function () {
                if (input && input.files && input.files.length > 0) {
                    Home.importSjrFile(input.files[0]);
                    input.value = '';
                }
            };
        }
        input.click();
    }

    //////////////////////////
    // Events
    //////////////////////////

    static handleTouchStart (e: MouseEvent & { touches?: TouchList }) {
        Home.dragging = false;
        Home.holding = false;
        // if ((t.nodeName == "INPUT") || (t.nodeName == "FORM")) return;
        var mytarget = Home.getMouseTarget(e);
        if ((mytarget != Home.actionTarget) && Home.actionTarget) {
            Home.hideProjectControls(Home.actionTarget);
        }
        Home.actionTarget = mytarget;
        Home.initialPt = Events.getTargetPoint(e);
        if (Home.actionTarget) {
            holdit();
        }
        function holdit () {
            frame.onmousemove = Home.handleMove;
            frame.ontouchmove = Home.handleMove as unknown as (this: GlobalEventHandlers, ev: TouchEvent) => any;
            var repeat = function () {
                if (Home.actionTarget) {
                    Home.showProjectControls(Home.actionTarget);
                    Home.holding = true;
                }
            };
            timeoutEvent = setTimeout(repeat, 500);
        }
        Home.scrolltop = document.body.scrollTop;
    }

    static handleMove (e: MouseEvent) {
        var pt = Events.getTargetPoint(e);
        var delta = Vector.diff(pt, Home.initialPt);
        if (!Home.dragging && (Vector.len(delta) > 20)) {
            Home.dragging = true;
        }
        if (!Home.dragging) {
            return;
        }
        if (timeoutEvent) {
            clearTimeout(timeoutEvent);
        }
        timeoutEvent = null;
    }

    static getMouseTarget (e: MouseEvent) {
        var t = e.target as HTMLElement;
        if (t == frame) {
            return null;
        }
        if (t.parentNode && !(t.parentNode as HTMLElement).tagName) {
            return null;
        }
        while (t.parentNode && (t.parentNode != frame) && ((t.parentNode as HTMLElement).getAttribute('class') != 'scrollarea')) {
            t = t.parentNode as HTMLElement;
        }
        return (!t.parentNode || (t.parentNode == frame)) ? null : t;
    }

    static handleTouchEnd (e: MouseEvent & { touches?: TouchList }) {
        e.preventDefault();
        e.stopPropagation();
        if (e.touches && (e.touches.length > 1)) {
            return;
        }
        frame.onmousemove = null;
        frame.ontouchmove = null;
        if (timeoutEvent) {
            clearTimeout(timeoutEvent);
        }
        timeoutEvent = null;
        if (Home.dragging) {
            return;
        }
        Home.performAction(e);
    }

    static performAction (e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!Home.actionTarget) {
            return;
        }
        if (Home.holding) {
            return;
        }
        var md5 = Home.actionTarget.id;
        switch (Home.getAction(e)) {
        case 'project':
            ScratchAudio.sndFX('keydown.wav');
            if (md5 && (md5 == 'newproject')) {
                Home.createNewProject();
            } else if (md5 && (md5 == 'openproject')) {
                Home.openFileDialog();
            } else if (md5) {
                PlatformBridge.setfile('homescroll.sjr', gn('wrapc')!.scrollTop, function () {
                    doNext();
                });
            }
            break;
        case 'duplicate':
            if (md5 && (md5 !== 'newproject') && (md5 !== 'openproject')) {
                Home.duplicateProject(md5);
            }
            break;
        case 'export':
            if (md5 && (md5 !== 'newproject') && (md5 !== 'openproject')) {
                ScratchAudio.sndFX('tap.wav');
                import('../platform/IO').then(({ default: IO }) => {
                    IO.zipProject(md5, (contents: string) => {
                        var name = Home.actionTarget?.querySelector('.projecttitle h4')?.textContent || 'Project';
                        if (window.scratchjr && window.scratchjr.sendExportedSjr) {
                            window.scratchjr.sendExportedSjr(contents, name + '.sjr');
                        } else if (PlatformBridge.sendSjrToShareDialog) {
                            PlatformBridge.sendSjrToShareDialog(name + '.sjr', name, '', '0', contents);
                        }
                    });
                });
            }
            break;
        case 'delete':
            ScratchAudio.sndFX('cut.wav');
            // Lazy: the editor chunk (Project/Alert) loads only when deleting.
            import('../editor/ui/Project').then((m) => {
                m.default.thumbnailUnique(Home.actionTarget!.thumb!, Home.actionTarget!.id, function (isUnique) {
                    if (isUnique) {
                        PlatformBridge.remove(Home.actionTarget!.thumb!, PlatformBridge.trace);
                    }
                });
                PlatformBridge.setfield(PlatformBridge.database, Home.actionTarget!.id, 'deleted', 'YES', Home.removeProjThumb);
            });
            break;
        default:
            Home.hideProjectControls(Home.actionTarget);
            break;
        }
        function doNext () {
            PlatformBridge.analyticsEvent('lobby', 'existing_project_edited');
            window.location.href = 'editor.html?pmd5=' + md5 + '&mode=edit';
        }
    }

    static duplicateProject (projectId: string) {
        if (isDuplicating || !projectId || projectId === 'newproject') {
            return;
        }
        isDuplicating = true;
        ScratchAudio.sndFX('snap.wav');
        var json: DbSelectIntent = {
            op: 'select', table: PlatformBridge.database,
            items: ['id', 'name', 'version', 'json', 'thumbnail', 'isgift'],
            where: [
                { col: 'id', op: '=', value: projectId },
                { col: 'deleted', op: '=', value: 'NO' },
            ],
        };
        IO.query(PlatformBridge.database, json, function (res: string) {
            try {
                var rawRows = typeof res === 'string' ? JSON.parse(res) : res;
                if (!rawRows || rawRows.length === 0) {
                    isDuplicating = false;
                    return;
                }
                var source = IO.parseProjectData(rawRows[0]) as {
                    id?: string;
                    name?: string;
                    version?: string;
                    json?: string | object;
                    thumbnail?: string | object;
                    isgift?: string;
                };
                var baseName = (source.name || 'Project').replace(/\s*\(Copy(\s*\d+)?\)$/i, '');
                var copyPrefix = baseName + ' (Copy)';
                var copyName = Home.getNextName(copyPrefix);
                var newProjectRecord: Record<string, unknown> = {
                    name: copyName,
                    version: source.version || version || window.Settings?.scratchJrVersion || '1.0.0',
                    mtime: (new Date()).getTime().toString(),
                    isgift: '0',
                };
                if (source.json) {
                    newProjectRecord.json = source.json;
                }
                if (source.thumbnail) {
                    newProjectRecord.thumbnail = source.thumbnail;
                }
                IO.createProject(newProjectRecord as unknown as Parameters<typeof IO.createProject>[0], function (newId: unknown) {
                    isDuplicating = false;
                    if (newId && Number(newId) > 0) {
                        PlatformBridge.analyticsEvent('lobby', 'project_duplicated');
                        Home.displayYourProjects();
                    }
                });
            } catch (err) {
                isDuplicating = false;
                console.error('duplicateProject failed:', err);
            }
        });
    }

    static showProjectControls (targetEl: HTMLElement | null) {
        if (!targetEl) {
            return;
        }
        var closex = targetEl.querySelector('.closex') as HTMLElement | null;
        var exportbtn = targetEl.querySelector('.exportbtn') as HTMLElement | null;
        var dup = targetEl.querySelector('.duplicatebtn') as HTMLElement | null;
        if (closex) {
            closex.style.visibility = 'visible';
        }
        if (exportbtn) {
            exportbtn.style.visibility = 'visible';
        }
        if (dup) {
            dup.style.visibility = 'visible';
        }
    }

    static hideProjectControls (targetEl: HTMLElement | null) {
        if (!targetEl) {
            return;
        }
        var closex = targetEl.querySelector('.closex') as HTMLElement | null;
        var exportbtn = targetEl.querySelector('.exportbtn') as HTMLElement | null;
        var dup = targetEl.querySelector('.duplicatebtn') as HTMLElement | null;
        if (closex) {
            closex.style.visibility = 'hidden';
        }
        if (exportbtn) {
            exportbtn.style.visibility = 'hidden';
        }
        if (dup) {
            dup.style.visibility = 'hidden';
        }
    }

    static createNewProject () {
        PlatformBridge.analyticsEvent('lobby', 'project_created');
        var obj: Record<string, string> = {};
        var prefix = Localization.localize('NEW_PROJECT_PREFIX');
        obj.name = Home.getNextName(prefix || 'Project');
        obj.version = version || window.Settings?.scratchJrVersion || '1.0.0';
        obj.mtime = (new Date()).getTime().toString();
        IO.createProject(obj, Home.gotoEditor);
    }

    static gotoEditor (md5: unknown) {
        if (!md5 || Number(md5) <= 0) { // rowids are positive; anything else is a failure code
            console.error('gotoEditor: Failed to create project in database, invalid id:', md5);
            import('../editor/ui/Alert').then((m) => {
                m.default.open(frame, gn('flip')!, 'Error creating project', '#D62222');
            });
            return;
        }
        PlatformBridge.setfile('homescroll.sjr', gn('wrapc')!.scrollTop, function () {
            doNext(md5);
        });
        function doNext (md5: unknown) {
            window.location.href = 'editor.html?pmd5=' + md5 + '&mode=edit';
        }
    }

    // Project names are given by reading the DOM elements of existing projects...
    static getNextName (name: string) {
        var pn: string[] = [];
        var div = gn('scrollarea');
        if (div) {
            for (var i = 0; i < div.childElementCount; i++) {
                const child = div.childNodes[i] as HTMLElement;
                if (child.id === 'newproject' || child.id === 'openproject') {
                    continue;
                }
                const titleNode = child.querySelector ? child.querySelector('.projecttitle h4') : null;
                if (titleNode && titleNode.textContent) {
                    pn.push(titleNode.textContent.trim());
                } else if (child.childNodes && child.childNodes[1] && child.childNodes[1].childNodes[0]) {
                    pn.push((child.childNodes[1].childNodes[0].textContent || '').trim());
                }
            }
        }
        if (pn.indexOf(name) === -1 && pn.indexOf(name + ' 1') === -1) {
            return name.toLowerCase().includes('copy') ? name : name + ' 1';
        }
        var n = 1;
        while (pn.indexOf(name + ' ' + n) > -1 || (pn.indexOf(name) > -1 && n === 1)) {
            n++;
        }
        return name + ' ' + n;
    }

    static removeProjThumb () {
        if (Home.actionTarget && Home.actionTarget.parentNode) {
            Home.actionTarget.parentNode.removeChild(Home.actionTarget);
        }
        Home.actionTarget = null;
    }

    static getAction (e: MouseEvent) {
        if (!Home.actionTarget) {
            return 'none';
        }
        var shown = false;
        var closex = Home.actionTarget.querySelector ? (Home.actionTarget.querySelector('.closex') as HTMLElement | null) : null;
        var exportbtn = Home.actionTarget.querySelector ? (Home.actionTarget.querySelector('.exportbtn') as HTMLElement | null) : null;
        var dup = Home.actionTarget.querySelector ? (Home.actionTarget.querySelector('.duplicatebtn') as HTMLElement | null) : null;
        if ((closex && closex.style.visibility === 'visible') || (exportbtn && exportbtn.style.visibility === 'visible') || (dup && dup.style.visibility === 'visible')) {
            shown = true;
        }
        if (e && shown && e.target) {
            var t = e.target as HTMLElement;
            var cls = t.getAttribute ? (t.getAttribute('class') || '') : '';
            if (cls.indexOf('closex') > -1) {
                return 'delete';
            }
            if (cls.indexOf('exportbtn') > -1) {
                return 'export';
            }
            if (cls.indexOf('duplicatebtn') > -1) {
                return 'duplicate';
            }
        }
        return 'project';
    }

    //////////////////////////
    // Gather projects
    //////////////////////////

    /** Import .sjr projects by dropping them anywhere on the lobby. */
    static installSjrDrop () {
        window.addEventListener('dragover', function (e) {
            e.preventDefault();
        });
        window.addEventListener('drop', function (e) {
            e.preventDefault();
            if (!e.dataTransfer || !e.dataTransfer.files) {
                return;
            }
            var files: File[] = [];
            for (var i = 0; i < e.dataTransfer.files.length; i++) {
                var f = e.dataTransfer.files[i];
                if (/\.sjr$/i.test(f.name)) {
                    files.push(f);
                }
            }
            for (var j = 0; j < files.length; j++) {
                Home.importSjrFile(files[j]);
            }
        });
    }

    static importSjrFile (file: File) {
        ScratchAudio.sndFX('tap.wav');
        var reader = new FileReader();
        reader.onload = function () {
            var res = (reader.result as string) || '';
            var b64 = res.indexOf(',') > -1 ? res.split(',')[1] : res;
            IO.loadProjectFromSjr(b64).then(function () {
                window.location.reload();
            }).catch(function (err: Error) {
                console.error('importSjrFile failed:', err);
                var frame = gn('frame');
                var errorMessage = 'Couldn\'t load share -- project data corrupted. ' + (err ? err.message : '');
                if (frame) {
                    Alert.open(frame, frame, errorMessage, '#ff0000');
                }
            });
        };
        reader.onerror = function (err) {
            console.error('FileReader error:', err);
        };
        reader.readAsDataURL(file);
    }

    static displayYourProjects () {
        PlatformBridge.getfile('homescroll.sjr', gotScrollsState);
        function gotScrollsState (str: string) {
            var num = Number(atob(str));
            scrollvalue = (num.toString() == 'NaN') ? 0 : num;
            var json: DbSelectIntent = {
                op: 'select', table: PlatformBridge.database,
                items: ['name', 'thumbnail', 'id', 'isgift'],
                where: [
                    { col: 'deleted', op: '=', value: 'NO' },
                    { col: 'gallery', op: 'IS NULL' },
                ],
                order: { col: 'ctime', dir: 'desc' },
            };
            IO.query(PlatformBridge.database, json, Home.displayProjects);
        }
    }

    static displayProjects (str: string) {
        var data = JSON.parse(str);
        var div = gn('scrollarea')!;
        while (div.childElementCount > 0) {
            div.removeChild(div.childNodes[0]);
        }
        Home.emptyProjectThumbnail(div);
        Home.openProjectThumbnail(div);
        for (var i = 0; i < data.length; i++) {
            Home.addProjectLink(div, data[i]);
        }
        setTimeout(function () {
            Lobby.busy = false;
        }, 1000);
        if (gn('wrapc')!) {
            gn('wrapc')!.scrollTop = scrollvalue;
        }
    }

    static addProjectLink (parent: HTMLElement, aa: { id?: string; name?: string; isgift?: string; thumbnail?: unknown }) {
        var data = IO.parseProjectData(aa);
        var id = data.id;
        var th = data.thumbnail;
        if (!th) {
            return;
        }
        var thumb = (typeof th === 'string') ? JSON.parse(th) : th;
        // Page-count badge assets only exist for p1..p4 — clamp larger projects
        var pc = Math.min(thumb.pagecount ? thumb.pagecount : 1, 4);
        var tb = newHTML('div', 'projectthumb', parent);
        tb.setAttribute('id', String(id));
        tb.type = 'projectthumb';
        tb.thumb = thumb.md5;
        var mt = newHTML('div', 'aproject p' + pc, tb);
        Home.insertThumbnail(mt, 192, 144, thumb);
        var label = newHTML('div', 'projecttitle', tb);
        var txt = newHTML('h4', undefined, label);
        txt.textContent = (data.name && data.name !== 'undefined') ? data.name as string : 'Project';

        var bow = newHTML('div', 'share', tb);
        var ribbonHorizontal = newHTML('div', 'ribbonHorizontal', tb);
        var ribbonVertical = newHTML('div', 'ribbonVertical', tb);

        if (data.isgift != '0') {
            // If it's a gift, show the bow and ribbon
            bow.style.visibility = 'visible';
            ribbonHorizontal.style.visibility = 'visible';
            ribbonVertical.style.visibility = 'visible';
        }

        newHTML('div', 'closex', tb);
        newHTML('div', 'exportbtn', tb);
        newHTML('div', 'duplicatebtn', tb);

        tb.oncontextmenu = function (evt: MouseEvent) {
            evt.preventDefault();
            evt.stopPropagation();
            if (tb.id !== 'newproject') {
                Home.actionTarget = tb;
                Home.showProjectControls(tb);
            }
        };
    }

    static insertThumbnail (p: HTMLElement, w: number, h: number, data: { md5?: string; pagecount?: number }) {
        var md5 = data.md5;
        var img = newHTML('img', undefined, p) as HTMLImageElement;
        if (md5) {
            IO.getAsset(md5, drawMe);
        }
        function drawMe (url: string) {
            img.src = url;
        }
    }
}

class Events {
    static getTargetPoint (e: MouseEvent & { touches?: TouchList; changedTouches?: TouchList }) {
        if (isTouch) {
            if (e.touches && (e.touches.length > 0)) {
                return {
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY
                };
            } else if (e.changedTouches) {
                return {
                    x: e.changedTouches[0].pageX,
                    y: e.changedTouches[0].pageY
                };
            }
        }
        return {
            x: e.clientX,
            y: e.clientY
        };
    }
}

// Expose for electronClient.js keyboard shortcuts (ESM does not leak globals).
window.Home = Home;
