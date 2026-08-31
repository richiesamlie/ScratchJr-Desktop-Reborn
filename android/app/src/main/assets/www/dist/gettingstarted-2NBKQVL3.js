import {
  getUrlVars,
  gn
} from "./chunk-L3ZHQKGF.js";

// src/app/src/entry/gettingstarted.ts
var place;
function gettingStartedMain() {
  gn("closeHelp").onclick = gettingStartedCloseMe;
  gn("closeHelp").onmousedown = gettingStartedCloseMe;
  var videoObj = gn("myVideo");
  videoObj.src = "assets/lobby/intro.mp4";
  videoObj.poster = "assets/lobby/poster.png";
  var urlvars = getUrlVars();
  place = urlvars.place;
  document.onmousemove = function(e) {
    e.preventDefault();
  };
}
function gettingStartedCloseMe() {
  window.location.href = "home.html?place=" + place;
}
export {
  gettingStartedMain
};
//# sourceMappingURL=gettingstarted-2NBKQVL3.js.map
