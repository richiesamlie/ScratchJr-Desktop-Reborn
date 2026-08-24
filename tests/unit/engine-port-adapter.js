// Engine port adapter for tests. Import AFTER renderer-harness.js (it relies
// on the jsdom stubs being installed first). The editor entry installs the
// UI-backed adapter in production; tests get real Scripts containers plus
// recording stubs everywhere else.
import './renderer-harness.js';
import { setEnginePorts } from '../../src/app/src/editor/engine/ports.ts';
import ScratchJr from '../../src/app/src/editor/ScratchJr.ts';
import Scripts from '../../src/app/src/editor/ui/Scripts.ts';
import Project from '../../src/app/src/editor/ui/Project.ts';

    if (!globalThis.__enginePortsInstalled) {
    globalThis.__enginePortCalls = [];
    const state = {
        shaking: undefined,
        stopShaking: undefined,
        workingCanvas: document.createElement('canvas'),
        workingCanvas2: document.createElement('canvas'),
    };
    const fakeRuntime = {
        stopThreads () {}, stopThreadSprite () {}, yield: false,
        threadsRunning: [], addRunScript () {}, removeRunScript () { return []; },
        restartThread () { return null; },
    };
    setEnginePorts({
        getStage: () => ScratchJr.stage,
        getRuntime: () => ScratchJr.runtime || fakeRuntime,
        isOnHold: () => false,
        setOnHold () {},
        isSampleOrStarter: () => false,
        isInFullscreen: () => false,
        isEditable: () => true,
        getStageColor: () => '#FFFFFF',
        getLayerTop: () => 10,
        getWorkingCanvas: () => state.workingCanvas,
        getWorkingCanvas2: () => state.workingCanvas2,
        getSprite: () => ScratchJr.getSprite(),
        getShaking: () => state.shaking,
        setShaking (b) { state.shaking = b; },
        getStopShaking: () => state.stopShaking,
        setStopShaking (f) { state.stopShaking = f; },
        stopStrips () {},
        unfocus () {},
        storyStart () {},
        getActiveScript () {
            return null;
        },
        updateRunStopButtons () {},
        blur () {},
        markChanged () {},
        clearSelection () {},
        startCurrentPageStrips () {},
        startScriptsFor () {},
        pushBackButtonCallback () {},
        popBackButtonCallback () {},
        thumbsUpdatePages () {},
        thumbsUpdateSprites () {},
        thumbsUpdateSprite () {},
        thumbsPageMouseDown () {},
        thumbsOverpage () {},
        undoRecord (obj) {
            globalThis.__enginePortCalls.push({ port: 'undoRecord', obj });
        },
        paletteShow () {},
        paletteHide () {},
        uiMascotData () {
            return {};
        },
        uiSpriteInView () {},
        uiSetMenuTextColor () {},
        scriptsPaneWatermark () {
            return document.createElement('div');
        },
        scriptsPaneUpdateScriptsPageBlocks () {},
        scriptsCreate (spr) {
            return new Scripts(spr);
        },
        projectSetProgress () {},
        projectGetMediaLoadRatio (f) {
            return f;
        },
        projectClearSaving () {},
        projectSubstractCount () {},
        projectRecreateObject: (page, name, data, callBack, active) =>
            Project.recreateObject(page, name, data, callBack, active),
        projectEncodeSprite: (name) => Project.encodeSprite(name),
        projectEncodeStrip: (b) => Project.encodeStrip(b),
    });
    globalThis.__enginePortsInstalled = true;
}
