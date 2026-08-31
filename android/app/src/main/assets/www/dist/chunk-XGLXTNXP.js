import {
  AppUsage,
  IO,
  Localization,
  MediaLib,
  PlatformBridge
} from "./chunk-2QK5U7RC.js";
import {
  preprocessAndLoadCss
} from "./chunk-H7L2GILL.js";

// src/app/appEntry.js
function loadSettings(settingsRoot, whenDone) {
  IO.requestFromServer(settingsRoot + "settings.json", (result) => {
    window.Settings = JSON.parse(result);
    whenDone();
  });
}
var pageEntries = {
  index: () => import("./entry-CXXSFYQ4.js").then((m) => PlatformBridge.waitForInterface(m.indexMain)),
  home: () => import("./home-ZQHP4DDI.js").then((m) => PlatformBridge.waitForInterface(m.homeMain)),
  editor: () => import("./editor-LMHDBDTT.js").then((m) => PlatformBridge.waitForInterface(m.editorMain)),
  gettingStarted: () => import("./gettingstarted-WDLKRFYF.js").then((m) => PlatformBridge.waitForInterface(m.gettingStartedMain)),
  inappAbout: () => import("./inapp-7YYL2KG7.js").then((m) => m.inappAbout()),
  inappInterfaceGuide: () => import("./inapp-7YYL2KG7.js").then((m) => m.inappInterfaceGuide()),
  inappPaintEditorGuide: () => import("./inapp-7YYL2KG7.js").then((m) => m.inappPaintEditorGuide()),
  inappBlocksGuide: () => import("./inapp-7YYL2KG7.js").then((m) => m.inappBlocksGuide())
};
function bootApp() {
  if (!window.scratchjr) {
    throw new Error("ScratchJr: preload bridge missing");
  }
  const ipc = window.scratchjr;
  window.onload = () => loadPage(document.body.dataset.scratchjrPage || window.scratchJrPage || "").catch((err) => console.error("loadPage failed:", err));
  ipc.onAppClose(function() {
    if (window.ScratchJr && window.ScratchJr.saveProject) {
      window.ScratchJr.saveProject(null, function() {
        ipc.sendAppClosedAcked();
      });
    } else {
      ipc.sendAppClosedAcked();
    }
  });
}
async function loadPage(page) {
  let root = "./";
  switch (page) {
    default:
    case "index":
      await preprocessAndLoadCss("css", "css/font.css");
      await preprocessAndLoadCss("css", "css/base.css");
      await preprocessAndLoadCss("css", "css/start.css");
      await preprocessAndLoadCss("css", "css/thumbs.css");
      await preprocessAndLoadCss("css", "css/editor.css");
      break;
    case "home":
      await preprocessAndLoadCss("css", "css/font.css");
      await preprocessAndLoadCss("css", "css/base.css");
      await preprocessAndLoadCss("css", "css/lobby.css");
      await preprocessAndLoadCss("css", "css/thumbs.css");
      break;
    case "editor":
      await preprocessAndLoadCss("css", "css/font.css");
      await preprocessAndLoadCss("css", "css/base.css");
      await preprocessAndLoadCss("css", "css/editor.css");
      await preprocessAndLoadCss("css", "css/editorleftpanel.css");
      await preprocessAndLoadCss("css", "css/editorstage.css");
      await preprocessAndLoadCss("css", "css/editormodal.css");
      await preprocessAndLoadCss("css", "css/librarymodal.css");
      await preprocessAndLoadCss("css", "css/paintlook.css");
      break;
    case "gettingStarted":
      await preprocessAndLoadCss("css", "css/font.css");
      await preprocessAndLoadCss("css", "css/base.css");
      await preprocessAndLoadCss("css", "css/gs.css");
      break;
    case "inappAbout":
      await preprocessAndLoadCss("style", "inapp/style/about.css");
      break;
    case "inappInterfaceGuide":
      await preprocessAndLoadCss("style", "inapp/style/interface.css");
      break;
    case "inappPaintEditorGuide":
      await preprocessAndLoadCss("style", "inapp/style/paint.css");
      break;
    case "inappBlocksGuide":
      await preprocessAndLoadCss("style", "inapp/style/blocks.css");
      break;
  }
  loadSettings(root, () => {
    Localization.includeLocales(root, () => {
      MediaLib.loadMediaLib(root, () => {
        const entries = (
          /** @type {Record<string, () => Promise<void>>} */
          pageEntries
        );
        const entry = entries[page] || entries.index;
        entry();
      });
    });
    AppUsage.initUsage();
  });
}

export {
  bootApp,
  loadPage
};
//# sourceMappingURL=chunk-XGLXTNXP.js.map
