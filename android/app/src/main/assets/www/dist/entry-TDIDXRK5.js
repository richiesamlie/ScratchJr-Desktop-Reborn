import {
  AppUsage,
  Localization,
  PlatformBridge,
  ScratchAudio
} from "./chunk-YZ7HEPBJ.js";
import "./chunk-B4GXNDOX.js";
import {
  getUrlVars,
  gn
} from "./chunk-L3ZHQKGF.js";

// src/app/src/entry/index.ts
function bindTap(id, handler) {
  const el = gn(id);
  if (!el) return;
  el.onmousedown = handler;
  el.ontouchend = function(e) {
    e.preventDefault();
    e.stopPropagation();
    handler(e);
  };
}
function indexMain() {
  bindTap("gettings", indexGettingstarted);
  bindTap("startcode", indexGohome);
  ScratchAudio.init();
  var urlvars = getUrlVars();
  if (urlvars.back) {
    indexLoadOptions();
  } else {
    indexFirstTime();
  }
  if (window.Settings.edition == "PBS") {
    gn("topbar-moreapps").textContent = Localization.localize("PBS_MORE_APPS");
    gn("startButton").textContent = Localization.localize("PBS_START");
    gn("gettings").textContent = Localization.localize("PBS_HOW_TO");
    bindTap("startButton", indexGohome);
    bindTap("pbschars", indexGohome);
    bindTap("topbar-moreapps", indexMoreApps);
    bindTap("topbar-settings", indexGoSettings);
    bindTap("topbar-info", indexInfo);
  } else {
    bindTap("gear", indexGoSettings);
  }
  setTimeout(function() {
    gn("rays").className = "rays spinme";
  }, 250);
}
function indexFirstTime() {
  gn("authors").className = "credits show";
  gn("authorsText").className = "creditsText show";
  if (window.Settings.edition == "PBS") {
    gn("pbschars").className = "characters hide";
    gn("startcode").className = "catlogo show";
    gn("topbar").className = "topbar hide";
    gn("startButton").className = "startButton hide";
  } else {
    gn("purpleguy").className = "purple show";
    gn("blueguy").className = "blue show";
    gn("redguy").className = "red show";
  }
  PlatformBridge.askpermission();
  setTimeout(
    function() {
      indexLoadOptions();
    },
    /*SPLASH SCREEN LOAD DELAY*/
    3e3
  );
}
function indexLoadOptions() {
  if (window.Settings.edition != "PBS" && AppUsage.askForUsage()) {
    indexLoadUsage();
  } else {
    indexLoadStart();
  }
}
function indexLoadStart(afterUsage) {
  gn("authors").className = "credits hide";
  gn("authorsText").className = "creditsText hide";
  if (window.Settings.edition == "PBS") {
    gn("pbschars").className = "characters show";
    gn("topbar").className = "topbar show";
    gn("startButton").className = "startButton show";
  } else {
    gn("purpleguy").className = "purple hide";
    gn("blueguy").className = "blue hide";
    gn("redguy").className = "red hide";
    gn("gear").className = "gear show";
    bindTap("gear", indexGoSettings);
    if (afterUsage) {
      gn("catface").className = "catface show";
      gn("jrlogo").className = "jrlogo show";
      gn("usageQuestion").className = "usageQuestion hide";
      gn("usageSchool").className = "usageSchool hide";
      gn("usageHome").className = "usageHome hide";
      gn("usageOther").className = "usageOther hide";
      gn("usageNoanswer").className = "usageNoanswer hide";
    }
  }
  gn("gettings").className = "gettings show";
  gn("startcode").className = "startcode show";
  bindTap("gettings", indexGettingstarted);
  bindTap("startcode", indexGohome);
  document.onmousemove = function(e) {
    e.preventDefault();
  };
}
function indexLoadUsage() {
  gn("authors").className = "credits show";
  gn("authorsText").className = "creditsText hide";
  gn("purpleguy").className = "purple hide";
  gn("blueguy").className = "blue hide";
  gn("redguy").className = "red hide";
  gn("catface").className = "catface hide";
  gn("jrlogo").className = "jrlogo hide";
  gn("usageQuestion").textContent = Localization.localize("USAGE_QUESTION");
  gn("useSchoolText").textContent = Localization.localize("USAGE_SCHOOL");
  gn("useHomeText").textContent = Localization.localize("USAGE_HOME");
  gn("useOtherText").textContent = Localization.localize("USAGE_OTHER");
  gn("usageNoanswerText").textContent = Localization.localize("USAGE_NONE");
  gn("usageQuestion").className = "usageQuestion show";
  gn("usageSchool").className = "usageSchool show";
  gn("usageHome").className = "usageHome show";
  gn("usageOther").className = "usageOther show";
  gn("usageNoanswer").className = "usageNoanswer show";
  bindTap("usageSchool", indexSetUsage);
  bindTap("usageHome", indexSetUsage);
  bindTap("usageOther", indexSetUsage);
  bindTap("usageNoanswer", indexSetUsage);
}
function indexGohome() {
  PlatformBridge.setfile("homescroll.sjr", 0, function() {
    doNext();
  });
  function doNext() {
    window.location.href = "home.html";
  }
}
function indexGoSettings() {
  ScratchAudio.sndFX("tap.wav");
  window.location.href = "home.html?place=gear";
}
function indexGettingstarted() {
  ScratchAudio.sndFX("tap.wav");
  window.location.href = "gettingstarted.html?place=home";
}
function indexSetUsage(e) {
  var usageText = "";
  var usageTarget = e.target;
  switch (usageTarget.parentElement.id) {
    case "usageSchool":
      usageText = "school";
      break;
    case "usageHome":
      usageText = "home";
      break;
    case "usageOther":
      usageText = "other";
      break;
    case "usageNoanswer":
      usageText = "noanswer";
      break;
  }
  PlatformBridge.analyticsEvent("lobby", "scratchjr_usage", usageText);
  AppUsage.setUsage(usageText);
  ScratchAudio.sndFX("tap.wav");
  indexLoadStart(true);
}
function indexInfo() {
  ScratchAudio.sndFX("tap.wav");
  window.location.href = "home.html?place=book";
}
function indexMoreApps() {
  ScratchAudio.sndFX("tap.wav");
  import("./UI-QAG6X56J.js").then((m) => {
    m.default.parentalGate(null, function() {
      window.location.href = "https://pbskids.org/apps";
    });
  });
}
export {
  indexMain
};
//# sourceMappingURL=entry-TDIDXRK5.js.map
