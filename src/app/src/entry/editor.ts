import ScratchJr from '../editor/ScratchJr';
import { setEnginePorts } from '../editor/engine/ports';
import Project from '../editor/ui/Project';
import Thumbs from '../editor/ui/Thumbs';
import UI from '../editor/ui/UI';
import Palette from '../editor/ui/Palette';
import Undo from '../editor/ui/Undo';
import Scripts from '../editor/ui/Scripts';
import ScriptsPane from '../editor/ui/ScriptsPane';
import iOS from '../iPad/iOS';
import Camera from '../painteditor/Camera';
import Record from '../editor/ui/Record';

/**
 * The one place where the engine meets the UI: engine modules stay free of
 * ../ui imports and call these adapters through the typed port seam.
 */
setEnginePorts({
    // god-object state
    getStage: () => ScratchJr.stage,
    getRuntime: () => ScratchJr.runtime,
    isOnHold: () => ScratchJr.onHold,
    setOnHold: (v) => { ScratchJr.onHold = v; },
    isSampleOrStarter: () => ScratchJr.isSampleOrStarter(),
    isInFullscreen: () => ScratchJr.inFullscreen,
    isEditable: () => ScratchJr.isEditable(),
    getStageColor: () => ScratchJr.stagecolor,
    getLayerTop: () => ScratchJr.layerTop,
    getWorkingCanvas: () => ScratchJr.workingCanvas,
    getWorkingCanvas2: () => ScratchJr.workingCanvas2,
    getSprite: () => ScratchJr.getSprite(),
    getShaking: () => ScratchJr.shaking,
    setShaking: (b) => { ScratchJr.shaking = b; },
    getStopShaking: () => ScratchJr.stopShaking,
    setStopShaking: (f) => { ScratchJr.stopShaking = f; },
    // god-object behavior
    stopStrips: () => ScratchJr.stopStrips(),
    unfocus: (e) => ScratchJr.unfocus(e),
    storyStart: (where) => ScratchJr.storyStart(where),
    getActiveScript: () => ScratchJr.getActiveScript(),
    updateRunStopButtons: () => ScratchJr.updateRunStopButtons(),
    blur: () => ScratchJr.blur(),
    markChanged: () => { ScratchJr.changed = true; },
    clearSelection: () => ScratchJr.clearSelection(),
    startCurrentPageStrips: (types) => ScratchJr.startCurrentPageStrips(types),
    startScriptsFor: (spr, types) => ScratchJr.startScriptsFor(spr, types),
    pushBackButtonCallback: (fcn) => ScratchJr.onBackButtonCallback.push(fcn),
    popBackButtonCallback: () => ScratchJr.onBackButtonCallback.pop(),
    // UI singletons
    thumbsUpdatePages: () => Thumbs.updatePages(),
    thumbsUpdateSprites: () => Thumbs.updateSprites(),
    thumbsUpdateSprite: (spr) => Thumbs.updateSprite(spr),
    thumbsPageMouseDown: (e) => Thumbs.pageMouseDown(e),
    thumbsOverpage: (thumb) => Thumbs.overpage(thumb),
    undoRecord: (obj) => Undo.record(obj),
    paletteShow: () => Palette.show(),
    paletteHide: () => Palette.hide(),
    uiMascotData: (page) => UI.mascotData(page),
    uiSpriteInView: (spr) => UI.spriteInView(spr),
    uiSetMenuTextColor: (t) => UI.setMenuTextColor(t),
    scriptsPaneWatermark: () => ScriptsPane.watermark,
    scriptsPaneUpdateScriptsPageBlocks: (list) => ScriptsPane.updateScriptsPageBlocks(list),
    scriptsCreate: (spr) => new Scripts(spr),
    projectSetProgress: (perc) => Project.setProgress(perc),
    projectGetMediaLoadRatio: (f) => Project.getMediaLoadRatio(f),
    projectClearSaving: () => { (Project as unknown as { saving: boolean }).saving = false; },
    projectSubstractCount: () => Project.substractCount(),
    projectRecreateObject: (page, name, data, callBack, active) =>
        Project.recreateObject(page, name, data, callBack, active),
    projectEncodeSprite: (name) => Project.encodeSprite(name),
    projectEncodeStrip: (b) => Project.encodeStrip(b),
});

export function editorMain () { // eslint-disable-line import/prefer-default-export
    iOS.getsettings(doNext);
    function doNext (str: string) {
        var list = str.split(',');
        iOS.path = list[1] == '0' ? list[0] + '/' : undefined;
        if (list.length > 2) {
            Record.available = (list[2] == 'YES');
        }
        if (list.length > 3) {
            Camera.available = (list[3] == 'YES');
        }
        ScratchJr.appinit(window.Settings!.scratchJrVersion);
    }
}
