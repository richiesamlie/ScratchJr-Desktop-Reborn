import {
  loadPage
} from "./chunk-4OUIPH6E.js";
import {
  Cookie,
  IO,
  Localization,
  MediaLib,
  PlatformBridge,
  ScratchAudio,
  Vector
} from "./chunk-2QK5U7RC.js";
import "./chunk-WESISSZK.js";
import {
  getUrlVars,
  gn,
  isTouch,
  libInit,
  newHTML,
  preprocessAndLoad
} from "./chunk-H7L2GILL.js";

// src/app/src/lobby/Home.ts
var frame;
var scrollvalue;
var version;
var timeoutEvent = null;
var Home = class _Home {
  // Dynamic statics used by the touch handlers below
  static dragging = false;
  static holding = false;
  static actionTarget = null;
  static initialPt;
  static scrolltop;
  static init() {
    version = Lobby.version;
    frame = gn("htmlcontents");
    var inner = newHTML("div", "inner", frame);
    var div = newHTML("div", "scrollarea", inner);
    div.setAttribute("id", "scrollarea");
    frame.onmousedown = _Home.handleTouchStart;
    frame.onmouseup = _Home.handleTouchEnd;
    _Home.installSjrDrop();
    _Home.displayYourProjects();
  }
  ////////////////////////////
  // Home Screen
  ////////////////////////////
  static emptyProjectThumbnail(parent) {
    var tb = newHTML("div", "projectthumb", parent);
    newHTML("div", "aproject empty", tb);
    tb.id = "newproject";
  }
  //////////////////////////
  // Events
  //////////////////////////
  static handleTouchStart(e) {
    _Home.dragging = false;
    _Home.holding = false;
    var mytarget = _Home.getMouseTarget(e);
    if (mytarget != _Home.actionTarget && _Home.actionTarget) {
      _Home.hideProjectControls(_Home.actionTarget);
    }
    _Home.actionTarget = mytarget;
    _Home.initialPt = Events.getTargetPoint(e);
    if (_Home.actionTarget) {
      holdit();
    }
    function holdit() {
      frame.onmousemove = _Home.handleMove;
      var repeat = function() {
        if (_Home.actionTarget) {
          _Home.showProjectControls(_Home.actionTarget);
          _Home.holding = true;
        }
      };
      timeoutEvent = setTimeout(repeat, 500);
    }
    _Home.scrolltop = document.body.scrollTop;
  }
  static handleMove(e) {
    var pt = Events.getTargetPoint(e);
    var delta = Vector.diff(pt, _Home.initialPt);
    if (!_Home.dragging && Vector.len(delta) > 20) {
      _Home.dragging = true;
    }
    if (!_Home.dragging) {
      return;
    }
    if (timeoutEvent) {
      clearTimeout(timeoutEvent);
    }
    timeoutEvent = null;
  }
  static getMouseTarget(e) {
    var t = e.target;
    if (t == frame) {
      return null;
    }
    if (t.parentNode && !t.parentNode.tagName) {
      return null;
    }
    while (t.parentNode && t.parentNode != frame && t.parentNode.getAttribute("class") != "scrollarea") {
      t = t.parentNode;
    }
    return !t.parentNode || t.parentNode == frame ? null : t;
  }
  static handleTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches && e.touches.length > 1) {
      return;
    }
    frame.onmousemove = null;
    if (timeoutEvent) {
      clearTimeout(timeoutEvent);
    }
    timeoutEvent = null;
    if (_Home.dragging) {
      return;
    }
    _Home.performAction(e);
  }
  static performAction(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!_Home.actionTarget) {
      return;
    }
    if (_Home.holding) {
      return;
    }
    var md5 = _Home.actionTarget.id;
    switch (_Home.getAction(e)) {
      case "project":
        ScratchAudio.sndFX("keydown.wav");
        if (md5 && md5 == "newproject") {
          _Home.createNewProject();
        } else if (md5) {
          PlatformBridge.setfile("homescroll.sjr", gn("wrapc").scrollTop, function() {
            doNext();
          });
        }
        break;
      case "duplicate":
        if (md5 && md5 !== "newproject") {
          _Home.duplicateProject(md5);
        }
        break;
      case "delete":
        ScratchAudio.sndFX("cut.wav");
        import("./Project-MEPOXKT6.js").then((m) => {
          m.default.thumbnailUnique(_Home.actionTarget.thumb, _Home.actionTarget.id, function(isUnique) {
            if (isUnique) {
              PlatformBridge.remove(_Home.actionTarget.thumb, PlatformBridge.trace);
            }
          });
          PlatformBridge.setfield(PlatformBridge.database, _Home.actionTarget.id, "deleted", "YES", _Home.removeProjThumb);
        });
        break;
      default:
        _Home.hideProjectControls(_Home.actionTarget);
        break;
    }
    function doNext() {
      PlatformBridge.analyticsEvent("lobby", "existing_project_edited");
      window.location.href = "editor.html?pmd5=" + md5 + "&mode=edit";
    }
  }
  static duplicateProject(projectId) {
    if (!projectId || projectId === "newproject") {
      return;
    }
    ScratchAudio.sndFX("snap.wav");
    var json = {
      op: "select",
      table: PlatformBridge.database,
      items: ["id", "name", "version", "json", "thumbnail", "isgift"],
      where: [
        { col: "id", op: "=", value: projectId },
        { col: "deleted", op: "=", value: "NO" }
      ]
    };
    IO.query(PlatformBridge.database, json, function(res) {
      try {
        var rows = JSON.parse(res);
        if (!rows || rows.length === 0) {
          return;
        }
        var source = rows[0];
        var baseName = (source.name || "Project").replace(/\s*\(Copy(\s*\d+)?\)$/i, "");
        var copyPrefix = baseName + " (Copy)";
        var copyName = _Home.getNextName(copyPrefix);
        var newProjectRecord = {
          name: copyName,
          version: source.version || version || window.Settings?.scratchJrVersion || "1.0.0",
          mtime: (/* @__PURE__ */ new Date()).getTime().toString(),
          isgift: "0"
        };
        if (source.json) {
          newProjectRecord.json = typeof source.json === "string" ? JSON.parse(source.json) : source.json;
        }
        if (source.thumbnail) {
          newProjectRecord.thumbnail = typeof source.thumbnail === "string" ? JSON.parse(source.thumbnail) : source.thumbnail;
        }
        IO.createProject(newProjectRecord, function(newId) {
          if (newId && Number(newId) > 0) {
            PlatformBridge.analyticsEvent("lobby", "project_duplicated");
            _Home.displayYourProjects();
          }
        });
      } catch (err) {
        console.error("duplicateProject failed:", err);
      }
    });
  }
  static showProjectControls(targetEl) {
    if (!targetEl) {
      return;
    }
    var closex = targetEl.querySelector(".closex");
    var dup = targetEl.querySelector(".duplicatebtn");
    if (closex) {
      closex.style.visibility = "visible";
    }
    if (dup) {
      dup.style.visibility = "visible";
    }
  }
  static hideProjectControls(targetEl) {
    if (!targetEl) {
      return;
    }
    var closex = targetEl.querySelector(".closex");
    var dup = targetEl.querySelector(".duplicatebtn");
    if (closex) {
      closex.style.visibility = "hidden";
    }
    if (dup) {
      dup.style.visibility = "hidden";
    }
  }
  static createNewProject() {
    PlatformBridge.analyticsEvent("lobby", "project_created");
    var obj = {};
    var prefix = Localization.localize("NEW_PROJECT_PREFIX");
    obj.name = _Home.getNextName(prefix || "Project");
    obj.version = version || window.Settings?.scratchJrVersion || "1.0.0";
    obj.mtime = (/* @__PURE__ */ new Date()).getTime().toString();
    IO.createProject(obj, _Home.gotoEditor);
  }
  static gotoEditor(md5) {
    if (!md5 || Number(md5) <= 0) {
      console.error("gotoEditor: Failed to create project in database, invalid id:", md5);
      import("./Alert-JSYFUU53.js").then((m) => {
        m.default.open(frame, gn("flip"), "Error creating project", "#D62222");
      });
      return;
    }
    PlatformBridge.setfile("homescroll.sjr", gn("wrapc").scrollTop, function() {
      doNext(md5);
    });
    function doNext(md52) {
      window.location.href = "editor.html?pmd5=" + md52 + "&mode=edit";
    }
  }
  // Project names are given by reading the DOM elements of existing projects...
  static getNextName(name) {
    var pn = [];
    var div = gn("scrollarea");
    if (div) {
      for (var i = 0; i < div.childElementCount; i++) {
        const child = div.childNodes[i];
        if (child.id === "newproject") {
          continue;
        }
        const titleNode = child.querySelector ? child.querySelector(".projecttitle h4") : null;
        if (titleNode && titleNode.textContent) {
          pn.push(titleNode.textContent.trim());
        } else if (child.childNodes && child.childNodes[1] && child.childNodes[1].childNodes[0]) {
          pn.push((child.childNodes[1].childNodes[0].textContent || "").trim());
        }
      }
    }
    if (pn.indexOf(name) === -1 && pn.indexOf(name + " 1") === -1) {
      return name.toLowerCase().includes("copy") ? name : name + " 1";
    }
    var n = 1;
    while (pn.indexOf(name + " " + n) > -1 || pn.indexOf(name) > -1 && n === 1) {
      n++;
    }
    return name + " " + n;
  }
  static removeProjThumb() {
    if (_Home.actionTarget && _Home.actionTarget.parentNode) {
      _Home.actionTarget.parentNode.removeChild(_Home.actionTarget);
    }
    _Home.actionTarget = null;
  }
  static getAction(e) {
    if (!_Home.actionTarget) {
      return "none";
    }
    var shown = false;
    var closex = _Home.actionTarget.querySelector ? _Home.actionTarget.querySelector(".closex") : null;
    var dup = _Home.actionTarget.querySelector ? _Home.actionTarget.querySelector(".duplicatebtn") : null;
    if (closex && closex.style.visibility === "visible" || dup && dup.style.visibility === "visible") {
      shown = true;
    }
    if (e && shown && e.target) {
      var t = e.target;
      var cls = t.getAttribute ? t.getAttribute("class") || "" : "";
      if (cls.indexOf("closex") > -1) {
        return "delete";
      }
      if (cls.indexOf("duplicatebtn") > -1) {
        return "duplicate";
      }
    }
    return "project";
  }
  //////////////////////////
  // Gather projects
  //////////////////////////
  /** Import .sjr projects by dropping them anywhere on the lobby. */
  static installSjrDrop() {
    window.addEventListener("dragover", function(e) {
      e.preventDefault();
    });
    window.addEventListener("drop", function(e) {
      e.preventDefault();
      if (!e.dataTransfer || !e.dataTransfer.files) {
        return;
      }
      var files = [];
      for (var i = 0; i < e.dataTransfer.files.length; i++) {
        var f = e.dataTransfer.files[i];
        if (/\.sjr$/i.test(f.name)) {
          files.push(f);
        }
      }
      for (var j = 0; j < files.length; j++) {
        _Home.importSjrFile(files[j]);
      }
    });
  }
  static importSjrFile(file) {
    ScratchAudio.sndFX("tap.wav");
    file.arrayBuffer().then(function(buf) {
      var bytes = new Uint8Array(buf);
      var binary = "";
      var CHUNK = 32768;
      for (var i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode.apply(null, [
          bytes.subarray(i, i + CHUNK)
        ]);
      }
      IO.loadProjectFromSjr(btoa(binary));
    }).catch(function(err) {
      console.error("importSjrFile failed:", err);
    });
  }
  static displayYourProjects() {
    PlatformBridge.getfile("homescroll.sjr", gotScrollsState);
    function gotScrollsState(str) {
      var num = Number(atob(str));
      scrollvalue = num.toString() == "NaN" ? 0 : num;
      var json = {
        op: "select",
        table: PlatformBridge.database,
        items: ["name", "thumbnail", "id", "isgift"],
        where: [
          { col: "deleted", op: "=", value: "NO" },
          { col: "version", op: "=", value: version || window.Settings.scratchJrVersion },
          { col: "gallery", op: "IS NULL" }
        ],
        order: { col: "ctime", dir: "desc" }
      };
      IO.query(PlatformBridge.database, json, _Home.displayProjects);
    }
  }
  static displayProjects(str) {
    var data = JSON.parse(str);
    var div = gn("scrollarea");
    while (div.childElementCount > 0) {
      div.removeChild(div.childNodes[0]);
    }
    _Home.emptyProjectThumbnail(div);
    for (var i = 0; i < data.length; i++) {
      _Home.addProjectLink(div, data[i]);
    }
    setTimeout(function() {
      Lobby.busy = false;
    }, 1e3);
    if (gn("wrapc")) {
      gn("wrapc").scrollTop = scrollvalue;
    }
  }
  static addProjectLink(parent, aa) {
    var data = IO.parseProjectData(aa);
    var id = data.id;
    var th = data.thumbnail;
    if (!th) {
      return;
    }
    var thumb = typeof th === "string" ? JSON.parse(th) : th;
    var pc = Math.min(thumb.pagecount ? thumb.pagecount : 1, 4);
    var tb = newHTML("div", "projectthumb", parent);
    tb.setAttribute("id", String(id));
    tb.type = "projectthumb";
    tb.thumb = thumb.md5;
    var mt = newHTML("div", "aproject p" + pc, tb);
    _Home.insertThumbnail(mt, 192, 144, thumb);
    var label = newHTML("div", "projecttitle", tb);
    var txt = newHTML("h4", void 0, label);
    txt.textContent = data.name && data.name !== "undefined" ? data.name : "Project";
    var bow = newHTML("div", "share", tb);
    var ribbonHorizontal = newHTML("div", "ribbonHorizontal", tb);
    var ribbonVertical = newHTML("div", "ribbonVertical", tb);
    if (data.isgift != "0") {
      bow.style.visibility = "visible";
      ribbonHorizontal.style.visibility = "visible";
      ribbonVertical.style.visibility = "visible";
    }
    var closex = newHTML("div", "closex", tb);
    var dup = newHTML("div", "duplicatebtn", tb);
    closex.onclick = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (closex.style.visibility === "visible") {
        ScratchAudio.sndFX("cut.wav");
        import("./Project-MEPOXKT6.js").then((m) => {
          m.default.thumbnailUnique(tb.thumb, String(id), function(isUnique) {
            if (isUnique) {
              PlatformBridge.remove(tb.thumb, PlatformBridge.trace);
            }
          });
          PlatformBridge.setfield(PlatformBridge.database, String(id), "deleted", "YES", function() {
            if (tb.parentNode) {
              tb.parentNode.removeChild(tb);
            }
          });
        });
      }
    };
    dup.onclick = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (dup.style.visibility === "visible") {
        _Home.duplicateProject(String(id));
      }
    };
    tb.oncontextmenu = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (tb.id !== "newproject") {
        _Home.actionTarget = tb;
        _Home.showProjectControls(tb);
      }
    };
  }
  static insertThumbnail(p, w, h, data) {
    var md5 = data.md5;
    var img = newHTML("img", void 0, p);
    if (md5) {
      IO.getAsset(md5, drawMe);
    }
    function drawMe(url) {
      img.src = url;
    }
  }
};
var Events = class {
  static getTargetPoint(e) {
    if (isTouch) {
      if (e.touches && e.touches.length > 0) {
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
};
window.Home = Home;

// src/app/src/lobby/Samples.ts
var frame2;
var Samples = class _Samples {
  static init() {
    frame2 = gn("htmlcontents");
    gn("tabicon").onmousedown = _Samples.playHowTo;
    var div = newHTML("div", "samples off", frame2);
    div.setAttribute("id", "samples");
    _Samples.display("samples");
  }
  ////////////////////////////
  // Show Me How
  ////////////////////////////
  static playHowTo(e) {
    e.preventDefault();
    e.stopPropagation();
    ScratchAudio.sndFX("tap.wav");
    window.location.href = "gettingstarted.html?place=help";
  }
  ////////////////////////////
  // Learn Samples
  ////////////////////////////
  static display(key) {
    var files = MediaLib[key];
    var div = gn(key);
    for (var i = 0; i < files.length; i++) {
      _Samples.addLink(div, i, files[i]);
      _Samples.requestFromServer(i, files[i], displayThumb);
    }
    function displayThumb(pos, str) {
      var mt = gn("sample-" + pos);
      var data = IO.parseProjectData(JSON.parse(str)[0]);
      var name = mt.childNodes[1];
      var sampleName = typeof data.name === "string" ? data.name : "";
      sampleName = Localization.localize("SAMPLE_" + sampleName);
      name.textContent = sampleName;
      var cnv = mt.childNodes[0].childNodes[1];
      _Samples.insertThumbnail(cnv, data.thumbnail);
      mt.onclick = function(evt) {
        _Samples.loadMe(evt, mt);
      };
    }
    setTimeout(_Samples.show, 10);
  }
  static show() {
    Lobby.busy = false;
    frame2.parentNode.scrollTop = 0;
    gn("samples").className = "samples on";
  }
  static loadMe(e, mt) {
    e.preventDefault();
    e.stopPropagation();
    ScratchAudio.sndFX("tap.wav");
    PlatformBridge.analyticsEvent("samples", "sample_opened", mt.textContent);
    var md5 = mt.md5;
    window.location.href = "editor.html?pmd5=" + md5 + "&mode=" + (window.Settings.useStoryStarters ? "storyStarter" : "look");
  }
  static insertThumbnail(img, data) {
    var md5 = data.md5;
    if (md5) {
      img.style.backgroundImage = "url('" + md5 + "')";
    }
  }
  static addLink(parent, pos, md5) {
    var tb = newHTML("div", "samplethumb", parent);
    tb.setAttribute("id", "sample-" + pos);
    tb.md5 = md5;
    tb.type = "samplethumb";
    var mt = newHTML("div", "thumb pos" + pos, tb);
    newHTML("div", "woodframe", mt);
    newHTML("div", "sampleicon", mt);
    var name = newHTML("p", void 0, tb);
    name.textContent = "Sample " + pos;
  }
  static requestFromServer(pos, url, whenDone) {
    var xmlrequest = new XMLHttpRequest();
    xmlrequest.addEventListener("error", transferFailed, false);
    xmlrequest.onreadystatechange = function() {
      if (xmlrequest.readyState == 4) {
        whenDone(pos, xmlrequest.responseText);
      }
    };
    xmlrequest.open("GET", url, true);
    xmlrequest.send(null);
    function transferFailed(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
};

// src/app/src/lobby/Lobby.ts
var version2;
var busy = false;
var errorTimer = null;
var host = "inapp/";
var currentPage = null;
var Lobby = class _Lobby {
  // Getters/setters for properties used in other classes
  static get version() {
    return version2;
  }
  static set busy(newBusy) {
    busy = newBusy;
  }
  static get errorTimer() {
    return errorTimer;
  }
  static appinit(v) {
    libInit();
    version2 = v;
    var urlvars = getUrlVars();
    var place = urlvars.place;
    ScratchAudio.addSound("sounds/", "tap.wav", ScratchAudio.uiSounds);
    ScratchAudio.addSound("sounds/", "cut.wav", ScratchAudio.uiSounds);
    ScratchAudio.init();
    _Lobby.setPage(place ? place : "home");
    if (window.Settings.settingsPageDisabled) {
      gn("settings").style.visibility = "hidden";
    }
    gn("hometab").onmousedown = function() {
      if (gn("hometab").className != "home on") {
        _Lobby.setPage("home");
      }
    };
    gn("helptab").onmousedown = function() {
      if (gn("helptab").className != "help on") {
        _Lobby.setPage("help");
      }
    };
    gn("booktab").onmousedown = function() {
      if (gn("booktab").className != "book on") {
        _Lobby.setPage("book");
      }
    };
    gn("geartab").onmousedown = function() {
      if (gn("geartab").className != "gear on") {
        _Lobby.setPage("gear");
      }
    };
    gn("abouttab").onmousedown = function() {
      if (gn("abouttab").className != "tab on") {
        _Lobby.setSubMenu("about");
      }
    };
    gn("interfacetab").onmousedown = function() {
      if (gn("interfacetab").className != "tab on") {
        _Lobby.setSubMenu("interface");
      }
    };
    gn("painttab").onmousedown = function() {
      if (gn("painttab").className != "tab on") {
        _Lobby.setSubMenu("paint");
      }
    };
    gn("blockstab").onmousedown = function() {
      if (gn("blockstab").className != "tab2 on") {
        _Lobby.setSubMenu("blocks");
      }
    };
  }
  static setPage(page) {
    if (busy) {
      return;
    }
    if (gn("hometab").className == "home on") {
      var doNext = function(page2) {
        _Lobby.changePage(page2);
      };
      PlatformBridge.setfile("homescroll.sjr", gn("wrapc").scrollTop, function() {
        doNext(page);
      });
    } else {
      _Lobby.changePage(page);
    }
  }
  static changePage(page) {
    _Lobby.selectButton(page);
    document.documentElement.scrollTop = 0;
    var div = gn("wrapc");
    while (div.childElementCount > 0) {
      div.removeChild(div.childNodes[0]);
    }
    switch (page) {
      case "home":
        busy = true;
        ScratchAudio.sndFX("tap.wav");
        _Lobby.loadProjects(div);
        break;
      case "help":
        busy = true;
        ScratchAudio.sndFX("tap.wav");
        _Lobby.loadSamples(div);
        break;
      case "book":
        _Lobby.loadGuide(div);
        break;
      case "gear":
        ScratchAudio.sndFX("tap.wav");
        _Lobby.loadSettings(div);
        break;
      default:
        break;
    }
    currentPage = page;
  }
  static loadProjects(p) {
    document.onmousemove = null;
    gn("topsection").className = "topsection home";
    gn("tabheader").textContent = Localization.localize("MY_PROJECTS");
    gn("subtitle").textContent = "";
    gn("footer").className = "footer off";
    gn("wrapc").scrollTop = 0;
    gn("wrapc").className = "contentwrap scroll";
    var div = newHTML("div", "htmlcontents home", p);
    div.setAttribute("id", "htmlcontents");
    Home.init();
  }
  static loadSamples(p) {
    gn("topsection").className = "topsection help";
    gn("tabheader").textContent = Localization.localize("QUICK_INTRO");
    gn("subtitle").textContent = Localization.localize("SAMPLE_PROJECTS");
    gn("footer").className = "footer off";
    gn("wrapc").scrollTop = 0;
    gn("wrapc").className = "contentwrap noscroll";
    var div = newHTML("div", "htmlcontents help", p);
    div.setAttribute("id", "htmlcontents");
    document.onmousemove = function(e) {
      e.preventDefault();
    };
    Samples.init();
  }
  static loadGuide(p) {
    gn("topsection").className = "topsection book";
    gn("footer").className = "footer on";
    var div = newHTML("div", "htmlcontents home", p);
    div.setAttribute("id", "htmlcontents");
    setTimeout(function() {
      _Lobby.setSubMenu("about");
    }, 250);
  }
  static loadSettings(p) {
    gn("topsection").className = "topsection book";
    gn("footer").className = "footer off";
    gn("wrapc").scrollTop = 0;
    gn("wrapc").className = "contentwrap scroll";
    var div = newHTML("div", "htmlcontents settings", p);
    div.setAttribute("id", "htmlcontents");
    var title = newHTML("h1", "localizationtitle", div);
    title.textContent = Localization.localize("SELECT_LANGUAGE");
    var languageButtons = newHTML("div", "languagebuttons", div);
    var languageButton;
    for (var l in window.Settings.supportedLocales) {
      var selected = "";
      if (window.Settings.supportedLocales[l] == Localization.currentLocale) {
        selected = " selected";
      }
      languageButton = newHTML("div", "localizationselect" + selected, languageButtons);
      languageButton.textContent = l;
      languageButton.onmousedown = function(e) {
        ScratchAudio.sndFX("tap.wav");
        let newLocale = window.Settings.supportedLocales[e.target.textContent];
        Cookie.set("localization", newLocale);
        PlatformBridge.analyticsEvent("lobby", "language_changed", newLocale);
        window.location.href = "?place=gear";
      };
    }
  }
  static async setSubMenu(page) {
    if (busy) {
      return;
    }
    document.onmousemove = null;
    busy = true;
    ScratchAudio.sndFX("tap.wav");
    _Lobby.selectSubButton(page);
    document.documentElement.scrollTop = 0;
    gn("wrapc").scrollTop = 0;
    var div = gn("wrapc");
    while (div.childElementCount > 0) {
      div.removeChild(div.childNodes[0]);
    }
    var url;
    switch (page) {
      case "about":
        url = host + "about.html";
        await _Lobby.loadLink(div, url, "contentwrap scroll", "htmlsubpagecontents scrolled");
        break;
      case "interface":
        document.onmousemove = function(e) {
          e.preventDefault();
        };
        url = host + "interface.html";
        await _Lobby.loadLink(div, url, "contentwrap noscroll", "htmlsubpagecontents fixed");
        break;
      case "paint":
        document.onmousemove = function(e) {
          e.preventDefault();
        };
        url = host + "paint.html";
        await _Lobby.loadLink(div, url, "contentwrap noscroll", "htmlsubpagecontents fixed");
        break;
      case "blocks":
        url = host + "blocks.html";
        await _Lobby.loadLink(div, url, "contentwrap scroll", "htmlsubpagecontents scrolled");
        break;
      default:
        _Lobby.missing(page, div);
        break;
    }
  }
  static selectSubButton(str) {
    var list = ["about", "interface", "paint", "blocks"];
    for (var i = 0; i < list.length; i++) {
      var kid = gn(list[i] + "tab");
      var cls = kid.className.split(" ")[0];
      kid.className = cls + (list[i] == str ? " on" : " off");
    }
  }
  static selectButton(str) {
    var list = ["home", "help", "book", "gear"];
    for (var i = 0; i < list.length; i++) {
      if (str == list[i]) {
        gn(list[i] + "tab").className = list[i] + " on";
      } else {
        gn(list[i] + "tab").className = list[i] + " off";
      }
    }
  }
  // when we use iframes in electron it doesn't 
  // preprocess the ES6 syntax correctly.  Manually
  // loading the help pages into a div instead.
  static async loadLink(p, url, css, css2) {
    document.documentElement.scrollTop = 0;
    gn("wrapc").scrollTop = 0;
    gn("wrapc").className = css;
    var div = newHTML("div", "htmlsubpagecontents", p);
    div.setAttribute("id", "htmlsubpagecontents");
    gn("htmlsubpagecontents").className = css2;
    var innerHTML = await preprocessAndLoad(url);
    div.innerHTML = innerHTML;
    var loadedSubpage = div.querySelector(".inappSubpage");
    if (loadedSubpage && loadedSubpage.id) {
      loadPage(loadedSubpage.id);
    }
    busy = false;
  }
  static errorLoading(str) {
    if (errorTimer) {
      clearTimeout(errorTimer);
    }
    errorTimer = null;
    var wc = gn("wrapc");
    while (wc.childElementCount > 0) {
      wc.removeChild(wc.childNodes[0]);
    }
    var div = newHTML("div", "htmlcontents", wc);
    div.setAttribute("id", "htmlcontents");
    var ht = newHTML("div", "errormsg", div);
    var h = newHTML("h1", void 0, ht);
    h.textContent = str;
    busy = false;
  }
  static missing(page, p) {
    gn("wrapc").className = "contentwrap scroll";
    var div = newHTML("div", "htmlcontents", p);
    div.setAttribute("id", "htmlcontents");
    div = newHTML("div", "errormsg", div);
    var h = newHTML("h1", void 0, div);
    h.textContent = page.toUpperCase() + ": UNDER CONSTRUCTION";
    busy = false;
  }
  static goHome() {
    if (currentPage === "home") {
      window.location.href = "index.html?back=true";
    } else {
      _Lobby.setPage("home");
    }
  }
};

// src/app/src/entry/home.ts
function homeMain() {
  gn("logotab").onmousedown = homeGoBack;
  homeStrings();
  PlatformBridge.getsettings(doNext);
  function doNext(str) {
    var list = str.split(",");
    PlatformBridge.path = list[1] == "0" ? list[0] + "/" : void 0;
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
//# sourceMappingURL=home-HSN7DHEJ.js.map
