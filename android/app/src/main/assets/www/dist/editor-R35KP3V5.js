import {
  Camera,
  Record,
  ScratchJr
} from "./chunk-R4AJKLEU.js";
import {
  iOS
} from "./chunk-CLE3ZY24.js";
import "./chunk-3HUIGRZJ.js";
import "./chunk-ZIX7G24N.js";

// src/app/src/entry/editor.ts
function editorMain() {
  iOS.getsettings(doNext);
  function doNext(str) {
    var list = str.split(",");
    iOS.path = list[1] == "0" ? list[0] + "/" : void 0;
    if (list.length > 2) {
      Record.available = list[2] == "YES";
    }
    if (list.length > 3) {
      Camera.available = list[3] == "YES";
    }
    ScratchJr.appinit(window.Settings.scratchJrVersion);
  }
}
export {
  editorMain
};
//# sourceMappingURL=editor-R35KP3V5.js.map
