import {
  Lobby,
  Localization,
  iOS
} from "./chunk-BVFPWZQO.js";
import "./chunk-CQR6IGDX.js";
import {
  gn
} from "./chunk-SD4UFC5K.js";

// src/app/src/entry/home.ts
function homeMain() {
  gn("logotab").onmousedown = homeGoBack;
  homeStrings();
  iOS.getsettings(doNext);
  function doNext(str) {
    var list = str.split(",");
    iOS.path = list[1] == "0" ? list[0] + "/" : void 0;
    Lobby.appinit(window.Settings.scratchJrVersion);
  }
}
function homeGoBack() {
  window.location.href = "index.html?back=yes";
}
function homeStrings() {
  gn("abouttab-text").textContent = Localization.localize("ABOUT_SCRATCHJR");
  gn("interfacetab-text").textContent = Localization.localize("INTERFACE_GUIDE");
  gn("painttab-text").textContent = Localization.localize("PAINT_EDITOR_GUIDE");
  gn("blockstab-text").textContent = Localization.localize("BLOCKS_GUIDE");
}
export {
  homeMain
};
//# sourceMappingURL=home-CYWLJOVM.js.map
