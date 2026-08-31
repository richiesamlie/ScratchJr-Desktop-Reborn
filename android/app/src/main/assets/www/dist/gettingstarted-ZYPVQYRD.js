import {
  getUrlVars,
  gn,
  isiOS
} from "./chunk-SD4UFC5K.js";

// src/app/src/entry/gettingstarted.ts
var place;
function gettingStartedMain() {
  gn("closeHelp").onclick = gettingStartedCloseMe;
  gn("closeHelp").onmousedown = gettingStartedCloseMe;
  var videoObj = gn("myVideo");
  if (isiOS) {
    videoObj.src = "assets/lobby/intro.mp4";
  } else {
    setTimeout(function() {
      videoObj.type = "video/mp4";
      videoObj.src = AndroidInterface.scratchjr_getgettingstartedvideopath();
    }, 1e3);
  }
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
//# sourceMappingURL=gettingstarted-ZYPVQYRD.js.map
