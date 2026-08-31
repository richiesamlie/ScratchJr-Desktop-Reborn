import {
  IO,
  Localization,
  MediaLib,
  SVG2Canvas,
  ScratchAudio,
  Vector,
  iOS
} from "./chunk-5Q7M6LXD.js";
import {
  Alert,
  DrawPath
} from "./chunk-CQR6IGDX.js";
import {
  CSSTransition3D,
  DEGTOR,
  dprCenterTransform,
  drawScaled,
  drawThumbnail,
  fitInRect,
  frame,
  getDocumentHeight,
  getDocumentWidth,
  getIdFor,
  getIdForCamera,
  getStringSize,
  getUrlVars,
  globalx,
  globaly,
  gn,
  hitRect,
  isAndroid,
  isTouch,
  isiOS,
  libInit,
  localx,
  localy,
  newCanvas,
  newDiv,
  newHTML,
  newImage,
  newP,
  newTextInput,
  rgb2hsb,
  rgbToHex,
  scaleMultiplier,
  setCanvasSize,
  setCanvasSizeScaledToWindowDocumentHeight,
  setProps,
  writeText
} from "./chunk-SD4UFC5K.js";

// src/app/src/editor/modelRegistry.ts
var refs = /* @__PURE__ */ new WeakMap();
function setModelRef(el, kind, model) {
  refs.set(el, { kind, model });
}
function hasModelRef(el) {
  return refs.has(el);
}
function getModelRef(el) {
  const r = refs.get(el);
  return r ? { kind: r.kind, model: r.model } : null;
}
function getModelRefAs(el, kind) {
  if (!el) return void 0;
  const r = refs.get(el);
  return r && r.kind === kind ? r.model : void 0;
}
function findUpModelRefEl(start) {
  let el = start;
  while (el != null) {
    if (refs.has(el)) return el;
    el = el.parentNode;
  }
  return null;
}
if (typeof window !== "undefined") {
  window.__modelRefs = {
    setModelRef,
    getModelRef,
    getModelRefAs,
    hasModelRef,
    findUpModelRefEl
  };
}

// src/app/src/editor/blocks/BlockSpecs.ts
var loadCount = 0;
var loadassets = {};
var fontwhite = "#f2f3f2";
var fontpink = "#ff8ae9";
var fontdarkgray = "#6d6e6c";
var fontblack = "#1b2a34";
var fontyellow = "#ffdd33";
var fontdarkgreen = "#287f46";
var fontpurple = "#8f56e3";
var fontblue = "#0d50ab";
var fontred = "#c4281b";
var fontorange = "#da8540";
var fontcolors = [
  fontred,
  fontorange,
  fontyellow,
  fontdarkgreen,
  fontblue,
  fontpink,
  fontpurple,
  fontwhite,
  fontdarkgray,
  fontblack
];
var fontsizes = [16, 24, 36, 48, 56, 72];
var getshapes = [
  "LetterGet_Orange",
  "LetterGet_Red",
  "LetterGet_Yellow",
  "LetterGet_Green",
  "LetterGet_Blue",
  "LetterGet_Purple"
];
var sendshapes = [
  "LetterSend_Orange",
  "LetterSend_Red",
  "LetterSend_Yellow",
  "LetterSend_Green",
  "LetterSend_Blue",
  "LetterSend_Purple"
];
var speeds = ["speed0", "speed1", "speed2"];
var BlockSpecs = class _BlockSpecs {
  // Dynamic statics populated by initBlocks()/loadGraphics()
  static defs;
  static palettes;
  static categories;
  static canvasMask;
  static balloon;
  static projectThumb;
  static mic;
  static yellowStart;
  static yellowStartH;
  static yellowCmd;
  static yellowCmdH;
  static redEnd;
  static redEndH;
  static orangeCmd;
  static orangeCmdH;
  static limeCmd;
  static limeCmdH;
  static pinkCmd;
  static pinkCmdH;
  static redEndLong;
  static redEndLongH;
  static cShape;
  static cShapeH;
  static blueCmd;
  static blueCmdH;
  static textfieldimg;
  static numfieldimg;
  static pressbutton;
  static pressbuttonSmall;
  static caretrepeat;
  static cmdS;
  static startS;
  static endS;
  static endLongS;
  static repeatS;
  static get loadCount() {
    return loadCount;
  }
  static set loadCount(newLoadCount) {
    loadCount = newLoadCount;
  }
  static get fontcolors() {
    return fontcolors;
  }
  static get fontsizes() {
    return fontsizes;
  }
  static get speeds() {
    return speeds;
  }
  static initBlocks() {
    loadassets = {};
    _BlockSpecs.loadGraphics();
    _BlockSpecs.defs = _BlockSpecs.setupBlocksSpecs();
    _BlockSpecs.palettes = _BlockSpecs.setupPalettesDef();
    _BlockSpecs.categories = _BlockSpecs.setupCategories();
    if (window.Settings.edition == "PBS") {
      _BlockSpecs.canvasMask = _BlockSpecs.getImageFrom("assets/ui/canvasmask", "svg");
    } else {
      _BlockSpecs.canvasMask = _BlockSpecs.getImageFrom("assets/ui/canvasmask");
    }
    if (window.Settings.edition != "PBS") {
      _BlockSpecs.projectThumb = _BlockSpecs.getImageFrom("assets/lobby/pmask");
    }
    IO.requestFromServer("assets/balloon.svg", _BlockSpecs.setBalloon);
    loadCount++;
  }
  static setBalloon(str) {
    loadCount--;
    _BlockSpecs.balloon = str;
  }
  static loadGraphics() {
    _BlockSpecs.mic = _BlockSpecs.getImageFrom("assets/ui/recordslot", "svg");
    _BlockSpecs.yellowStart = _BlockSpecs.getImageFrom("assets/blocks/start", "svg");
    _BlockSpecs.yellowStartH = _BlockSpecs.getImageFrom("assets/blocks/eh/startH");
    _BlockSpecs.yellowCmd = _BlockSpecs.getImageFrom("assets/blocks/yellowCmd", "svg");
    _BlockSpecs.yellowCmdH = _BlockSpecs.getImageFrom("assets/blocks/eh/yellowCmdH");
    _BlockSpecs.redEnd = _BlockSpecs.getImageFrom("assets/blocks/endshort", "svg");
    _BlockSpecs.redEndH = _BlockSpecs.getImageFrom("assets/blocks/eh/stopH");
    _BlockSpecs.orangeCmd = _BlockSpecs.getImageFrom("assets/blocks/flow", "svg");
    _BlockSpecs.orangeCmdH = _BlockSpecs.getImageFrom("assets/blocks/eh/flowH");
    _BlockSpecs.limeCmd = _BlockSpecs.getImageFrom("assets/blocks/sounds", "svg");
    _BlockSpecs.limeCmdH = _BlockSpecs.getImageFrom("assets/blocks/eh/soundsH");
    _BlockSpecs.pinkCmd = _BlockSpecs.getImageFrom("assets/blocks/looks", "svg");
    _BlockSpecs.pinkCmdH = _BlockSpecs.getImageFrom("assets/blocks/eh/looksH");
    _BlockSpecs.redEndLong = _BlockSpecs.getImageFrom("assets/blocks/endlong", "svg");
    _BlockSpecs.redEndLongH = _BlockSpecs.getImageFrom("assets/blocks/eh/stoplongH");
    _BlockSpecs.cShape = _BlockSpecs.getImageFrom("assets/blocks/repeat");
    _BlockSpecs.cShapeH = _BlockSpecs.getImageFrom("assets/blocks/eh/repeatH");
    _BlockSpecs.blueCmd = _BlockSpecs.getImageFrom("assets/blocks/blueCmd", "svg");
    _BlockSpecs.blueCmdH = _BlockSpecs.getImageFrom("assets/blocks/eh/blueCmdH");
    _BlockSpecs.textfieldimg = _BlockSpecs.getImageFrom("assets/misc/Text-01");
    _BlockSpecs.numfieldimg = _BlockSpecs.getImageFrom("assets/misc/Number-01");
    _BlockSpecs.pressbutton = _BlockSpecs.getImageFrom("assets/misc/pushbutton-01", "svg");
    _BlockSpecs.pressbuttonSmall = _BlockSpecs.getImageFrom("assets/misc/pushbutton", "svg");
    _BlockSpecs.caretrepeat = _BlockSpecs.getImageFrom("assets/blocks/caretrepeat");
    _BlockSpecs.cmdS = _BlockSpecs.getImageFrom("assets/blocks/shadowCmd", "svg");
    _BlockSpecs.startS = _BlockSpecs.getImageFrom("assets/blocks/shadowStart", "svg");
    _BlockSpecs.endS = _BlockSpecs.getImageFrom("assets/blocks/shadowEndShort", "svg");
    _BlockSpecs.endLongS = _BlockSpecs.getImageFrom("assets/blocks/shadowEndLong", "svg");
    _BlockSpecs.repeatS = _BlockSpecs.getImageFrom("assets/blocks/shadowRepeat");
  }
  static getImageFrom(url, ext) {
    var img = document.createElement("img");
    img.src = url + (ext ? "." + ext : ".png");
    if (!img.complete) {
      loadassets[img.src] = img;
      loadCount++;
      img.onload = function() {
        delete loadassets[img.src];
        loadCount--;
      };
    }
    return img;
  }
  static refreshLoading() {
    for (var key in loadassets) {
      if (loadassets[key].complete) {
        loadCount--;
      }
    }
  }
  static setupCategories() {
    return [
      [
        _BlockSpecs.getImageFrom("assets/categories/StartOn", "svg"),
        _BlockSpecs.getImageFrom("assets/categories/StartOff", "svg"),
        window.Settings.categoryStartColor
      ],
      [
        _BlockSpecs.getImageFrom("assets/categories/MotionOn", "svg"),
        _BlockSpecs.getImageFrom("assets/categories/MotionOff", "svg"),
        window.Settings.categoryMotionColor
      ],
      [
        _BlockSpecs.getImageFrom("assets/categories/LooksOn", "svg"),
        _BlockSpecs.getImageFrom("assets/categories/LooksOff", "svg"),
        window.Settings.categoryLooksColor
      ],
      [
        _BlockSpecs.getImageFrom("assets/categories/SoundOn", "svg"),
        _BlockSpecs.getImageFrom("assets/categories/SoundOff", "svg"),
        window.Settings.categorySoundColor
      ],
      [
        _BlockSpecs.getImageFrom("assets/categories/FlowOn", "svg"),
        _BlockSpecs.getImageFrom("assets/categories/FlowOff", "svg"),
        window.Settings.categoryFlowColor
      ],
      [
        _BlockSpecs.getImageFrom("assets/categories/StopOn", "svg"),
        _BlockSpecs.getImageFrom("assets/categories/StopOff", "svg"),
        window.Settings.categoryStopColor
      ]
    ];
  }
  static setupPalettesDef() {
    return [
      ["onflag", "onclick", "ontouch", "onmessage", "message"],
      ["forward", "back", "up", "down", "right", "left", "hop", "home"],
      ["say", "space", "grow", "shrink", "same", "space", "hide", "show"],
      [],
      ["wait", "stopmine", "setspeed", "repeat"],
      ["endstack", "forever"]
    ];
  }
  ///////////////////////////////
  // Data Structure
  //
  // name - blocktype, icon or datastructure, blockshape, argtype, initial value, highlight, min, max, shadow
  //
  // arg types:
  // null
  // n -> number field;
  // t -> text field
  // m  --> image menu with argvalue equal to name;
  // d --> image menu with argvalue equal to number;
  // c -- > color drop down
  // s --> sound name
  // p --> page icon
  //
  ////////////////////////////////
  static setupBlocksSpecs() {
    return {
      "onflag": [
        "onflag",
        _BlockSpecs.getImageFrom("assets/blockicons/greenFlag", "svg"),
        _BlockSpecs.yellowStart,
        null,
        null,
        _BlockSpecs.yellowStartH,
        null,
        null,
        _BlockSpecs.startS
      ],
      "onmessage": [
        "onmessage",
        getshapes,
        _BlockSpecs.yellowStart,
        "m",
        "Orange",
        _BlockSpecs.yellowStartH,
        null,
        null,
        _BlockSpecs.startS
      ],
      "onclick": [
        "onclick",
        _BlockSpecs.getImageFrom("assets/blockicons/OnTouch", "svg"),
        _BlockSpecs.yellowStart,
        null,
        null,
        _BlockSpecs.yellowStartH,
        null,
        null,
        _BlockSpecs.startS
      ],
      "ontouch": [
        "ontouch",
        _BlockSpecs.getImageFrom("assets/blockicons/Bump", "svg"),
        _BlockSpecs.yellowStart,
        null,
        null,
        _BlockSpecs.yellowStartH,
        null,
        null,
        _BlockSpecs.startS
      ],
      "message": [
        "message",
        sendshapes,
        _BlockSpecs.yellowCmd,
        "m",
        "Orange",
        _BlockSpecs.yellowCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "repeat": [
        "repeat",
        _BlockSpecs.getImageFrom("assets/blockicons/Repeat", "svg"),
        _BlockSpecs.cShape,
        "n",
        4,
        _BlockSpecs.cShapeH,
        0,
        24,
        _BlockSpecs.repeatS
      ],
      "forward": [
        "forward",
        _BlockSpecs.getImageFrom("assets/blockicons/Foward", "svg"),
        _BlockSpecs.blueCmd,
        "n",
        1,
        _BlockSpecs.blueCmdH,
        -20,
        20,
        _BlockSpecs.cmdS
      ],
      "back": [
        "back",
        _BlockSpecs.getImageFrom("assets/blockicons/Back", "svg"),
        _BlockSpecs.blueCmd,
        "n",
        1,
        _BlockSpecs.blueCmdH,
        -20,
        20,
        _BlockSpecs.cmdS
      ],
      "up": [
        "up",
        _BlockSpecs.getImageFrom("assets/blockicons/Up", "svg"),
        _BlockSpecs.blueCmd,
        "n",
        1,
        _BlockSpecs.blueCmdH,
        -15,
        15,
        _BlockSpecs.cmdS
      ],
      "down": [
        "down",
        _BlockSpecs.getImageFrom("assets/blockicons/Down", "svg"),
        _BlockSpecs.blueCmd,
        "n",
        1,
        _BlockSpecs.blueCmdH,
        -15,
        15,
        _BlockSpecs.cmdS
      ],
      "right": [
        "right",
        _BlockSpecs.getImageFrom("assets/blockicons/Right", "svg"),
        _BlockSpecs.blueCmd,
        "n",
        1,
        _BlockSpecs.blueCmdH,
        -12,
        12,
        _BlockSpecs.cmdS
      ],
      "left": [
        "left",
        _BlockSpecs.getImageFrom("assets/blockicons/Left", "svg"),
        _BlockSpecs.blueCmd,
        "n",
        1,
        _BlockSpecs.blueCmdH,
        -12,
        12,
        _BlockSpecs.cmdS
      ],
      "home": [
        "home",
        _BlockSpecs.getImageFrom("assets/blockicons/Home", "svg"),
        _BlockSpecs.blueCmd,
        null,
        null,
        _BlockSpecs.blueCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "hop": [
        "hop",
        _BlockSpecs.getImageFrom("assets/blockicons/Hop", "svg"),
        _BlockSpecs.blueCmd,
        "n",
        2,
        _BlockSpecs.blueCmdH,
        -15,
        15,
        _BlockSpecs.cmdS
      ],
      "wait": [
        "wait",
        _BlockSpecs.getImageFrom("assets/blockicons/Wait", "svg"),
        _BlockSpecs.orangeCmd,
        "n",
        10,
        _BlockSpecs.orangeCmdH,
        0,
        50,
        _BlockSpecs.cmdS
      ],
      "setspeed": [
        "setspeed",
        speeds,
        _BlockSpecs.orangeCmd,
        "d",
        1,
        _BlockSpecs.orangeCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "stopmine": [
        "stopmine",
        _BlockSpecs.getImageFrom("assets/blockicons/Stop", "svg"),
        _BlockSpecs.orangeCmd,
        null,
        null,
        _BlockSpecs.orangeCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "say": [
        "say",
        _BlockSpecs.getImageFrom("assets/blockicons/Say", "svg"),
        _BlockSpecs.pinkCmd,
        "t",
        Localization.localize("SAY_BLOCK_DEFAULT_ARGUMENT"),
        _BlockSpecs.pinkCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "show": [
        "show",
        _BlockSpecs.getImageFrom("assets/blockicons/Appear", "svg"),
        _BlockSpecs.pinkCmd,
        null,
        null,
        _BlockSpecs.pinkCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "hide": [
        "hide",
        _BlockSpecs.getImageFrom("assets/blockicons/Disappear", "svg"),
        _BlockSpecs.pinkCmd,
        null,
        null,
        _BlockSpecs.pinkCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "grow": [
        "grow",
        _BlockSpecs.getImageFrom("assets/blockicons/Grow", "svg"),
        _BlockSpecs.pinkCmd,
        "n",
        2,
        _BlockSpecs.pinkCmdH,
        -10,
        10,
        _BlockSpecs.cmdS
      ],
      "shrink": [
        "shrink",
        _BlockSpecs.getImageFrom("assets/blockicons/Shrink", "svg"),
        _BlockSpecs.pinkCmd,
        "n",
        2,
        _BlockSpecs.pinkCmdH,
        -10,
        10,
        _BlockSpecs.cmdS
      ],
      "same": [
        "same",
        _BlockSpecs.getImageFrom("assets/blockicons/Reset", "svg"),
        _BlockSpecs.pinkCmd,
        null,
        null,
        _BlockSpecs.pinkCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "playsnd": [
        "playsnd",
        _BlockSpecs.getImageFrom("assets/blockicons/Speaker", "svg"),
        _BlockSpecs.limeCmd,
        "s",
        "pop.mp3",
        _BlockSpecs.limeCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "playusersnd": [
        "playusersnd",
        _BlockSpecs.getImageFrom("assets/blockicons/Microphone", "svg"),
        _BlockSpecs.limeCmd,
        "r",
        "1",
        _BlockSpecs.limeCmdH,
        null,
        null,
        _BlockSpecs.cmdS
      ],
      "endstack": [
        "endstack",
        null,
        _BlockSpecs.redEnd,
        null,
        null,
        _BlockSpecs.redEndH,
        null,
        null,
        _BlockSpecs.endS
      ],
      "forever": [
        "forever",
        _BlockSpecs.getImageFrom("assets/blockicons/Forever", "svg"),
        _BlockSpecs.redEnd,
        null,
        null,
        _BlockSpecs.redEndH,
        null,
        null,
        _BlockSpecs.endS
      ],
      "gotopage": [
        "gotopage",
        null,
        _BlockSpecs.redEndLong,
        "p",
        "2",
        _BlockSpecs.redEndLongH,
        null,
        null,
        _BlockSpecs.endLongS
      ],
      "caretstart": [
        "caretstart",
        null,
        _BlockSpecs.getImageFrom("assets/blocks/caretstart", "svg"),
        null,
        null,
        null,
        null,
        null
      ],
      "caretend": [
        "caretend",
        null,
        _BlockSpecs.getImageFrom("assets/blocks/caretend", "svg"),
        null,
        null,
        null,
        null,
        null
      ],
      "caretrepeat": [
        "caretrepeat",
        null,
        _BlockSpecs.getImageFrom("assets/blocks/caretrepeat"),
        null,
        null,
        null,
        null,
        null
      ],
      "caretcmd": [
        "caretcmd",
        null,
        _BlockSpecs.getImageFrom("assets/blocks/caretcmd", "svg"),
        null,
        null,
        null,
        null,
        null
      ]
    };
  }
  static blockDesc(b, spr) {
    const s = spr;
    var str = b.getArgValue() ? String(b.getArgValue()) : b.blocktype == "playsnd" ? "SOUND" : "";
    return {
      "onflag": Localization.localize("BLOCK_DESC_GREEN_FLAG"),
      "onclick": Localization.localize("BLOCK_DESC_ON_TAP", {
        CHARACTER_NAME: s.name
      }),
      "ontouch": Localization.localize("BLOCK_DESC_ON_BUMP", {
        CHARACTER_NAME: s.name ? s.name : ""
      }),
      "onmessage": Localization.localize("BLOCK_DESC_ON_MESSAGE", {
        COLOR: Localization.localize("BLOCK_DESC_MESSAGE_COLOR_ORANGE")
      }),
      "repeat": Localization.localize("BLOCK_DESC_REPEAT"),
      "forward": Localization.localize("BLOCK_DESC_MOVE_RIGHT"),
      "back": Localization.localize("BLOCK_DESC_MOVE_LEFT"),
      "up": Localization.localize("BLOCK_DESC_MOVE_UP"),
      "down": Localization.localize("BLOCK_DESC_MOVE_DOWN"),
      "home": Localization.localize("BLOCK_DESC_GO_HOME"),
      "left": Localization.localize("BLOCK_DESC_TURN_LEFT"),
      "right": Localization.localize("BLOCK_DESC_TURN_RIGHT"),
      "hop": Localization.localize("BLOCK_DESC_HOP"),
      "wait": Localization.localize("BLOCK_DESC_WAIT"),
      "setspeed": Localization.localize("BLOCK_DESC_SET_SPEED"),
      "stopmine": Localization.localize("BLOCK_DESC_STOP", {
        CHARACTER_NAME: s.name ? s.name : s.str
      }),
      "say": Localization.localize("BLOCK_DESC_SAY"),
      "show": Localization.localize("BLOCK_DESC_SHOW"),
      "hide": Localization.localize("BLOCK_DESC_HIDE"),
      "grow": Localization.localize("BLOCK_DESC_GROW"),
      "shrink": Localization.localize("BLOCK_DESC_SHRINK"),
      "same": Localization.localize("BLOCK_DESC_RESET_SIZE"),
      "playsnd": Localization.localize("BLOCK_DESC_PLAY_SOUND", {
        SOUND_NAME: Localization.localize("BLOCK_DESC_PLAY_SOUND_POP")
      }),
      "playusersnd": Localization.localize("BLOCK_DESC_PLAY_RECORDED_SOUND"),
      "endstack": Localization.localize("BLOCK_DESC_END"),
      "stopall": Localization.localize("BLOCK_DESC_STOP", {
        CHARACTER_NAME: s.name ? s.name : ""
      }),
      "forever": Localization.localize("BLOCK_DESC_REPEAT_FOREVER"),
      "gotopage": Localization.localize("BLOCK_DESC_GO_TO_PAGE", {
        PAGE: str
      }),
      "message": Localization.localize("BLOCK_DESC_SEND_MESSAGE", {
        COLOR: Localization.localize("BLOCK_DESC_MESSAGE_COLOR_ORANGE")
      })
    };
  }
};

// src/app/src/editor/engine/ports.ts
var ports = null;
function setEnginePorts(p) {
  ports = p;
}
function enginePorts() {
  if (!ports) {
    throw new Error("engine ports not installed");
  }
  return ports;
}

// src/app/src/editor/blocks/Menu.ts
var openMenu = null;
var Menu = class _Menu {
  // Referenced by the dropdown hover path but never defined anywhere in the
  // codebase (pre-existing broken hover); declared so the calls typecheck.
  static highlightdot;
  static unhighlightdot;
  static get openMenu() {
    return openMenu;
  }
  static set openMenu(newOpenMenu) {
    openMenu = newOpenMenu;
  }
  static openDropDown(b, fcn) {
    var size2 = 50;
    const block = getModelRefAs(b, "block");
    var color = block.blocktype == "setspeed" ? "orange" : "yellow";
    var list = JSON.parse(block.arg.list);
    var num = block.arg.numperrow;
    var p = b.parentNode;
    var dh = size2 * Math.round(list.length / num);
    var rows = list.length / num;
    var w = size2 * list.length / rows;
    var scaledWidth = w * scaleMultiplier;
    var dx = b.left + (b.offsetWidth - scaledWidth) / 2;
    if (dx + scaledWidth > p.width) {
      dx -= dx + scaledWidth - p.width;
    }
    if (dx < 5) {
      dx = 5;
    }
    dx += globalx(p);
    var dy = b.top + b.offsetHeight - (10 + 18) * scaleMultiplier + globaly(p);
    if (dy + (10 + dh) * scaleMultiplier > getDocumentHeight()) {
      dy = getDocumentHeight() - (15 + dh) * scaleMultiplier;
    }
    var mu = newDiv(frame, dx, dy, w, dh, {
      position: "absolute",
      zIndex: 1e5,
      webkitTransform: "translate(" + -w / 2 + "px," + -dh / 2 + "px) scale(" + scaleMultiplier + ", " + scaleMultiplier + ") translate(" + w / 2 + "px, " + dh / 2 + "px)"
    });
    mu.setAttribute("class", "menustyle " + color);
    mu.active = b;
    for (var i = 0; i < list.length; i++) {
      _Menu.addImageToDropDown(mu, list[i], b, fcn);
    }
    openMenu = mu;
  }
  static addImageToDropDown(mu, c, block, fcn) {
    var img = BlockSpecs.getImageFrom("assets/blockicons/" + c, "svg");
    var cs = newHTML("div", "ddchoice", mu);
    var micon = newHTML("canvas", void 0, cs);
    var iconSize = 42;
    var scaledIconSize = iconSize * window.devicePixelRatio;
    setCanvasSize(micon, scaledIconSize, scaledIconSize);
    setProps(micon.style, {
      webkitTransform: dprCenterTransform(scaledIconSize, scaledIconSize)
    });
    if (!img.complete) {
      img.onload = function() {
        drawThumbnail(img, micon);
      };
    } else {
      drawThumbnail(img, micon);
    }
    if (isTouch) {
      cs.onmousedown = function(evt) {
        handleTouchStart(evt);
      };
    } else {
      cs.onmouseover = function(evt) {
        _Menu.highlightdot(evt);
      };
      cs.onmouseout = function(evt) {
        _Menu.unhighlightdot(evt);
      };
      cs.onmousedown = function(evt) {
        fcn(evt, mu, block, c);
      };
    }
    function handleTouchStart(e) {
      if (isTouch && e.touches && e.touches.length > 1) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      fcn(e, mu, block, c);
    }
  }
  static closeMyOpenMenu() {
    if (!openMenu) {
      return;
    }
    openMenu.parentNode.removeChild(openMenu);
    openMenu = null;
  }
};

// src/app/src/editor/blocks/BlockArg.ts
var BlockArg = class {
  div;
  arg;
  argType;
  argValue;
  button;
  daddy;
  icon;
  input;
  list;
  numperrow;
  type;
  constructor(block) {
    this.daddy = block;
    this.type = "blockarg";
    this.argType = block.spec[3];
    switch (this.argType) {
      case "n":
        this.argValue = block.spec[4];
        this.div = this.addNumArg();
        break;
      case "t":
        this.argValue = block.spec[4];
        if (Localization.isSampleLocalizedKey(String(this.argValue)) && enginePorts().isSampleOrStarter()) {
          this.argValue = Localization.localize("SAMPLE_TEXT_" + this.argValue);
        }
        this.div = this.addTextArg();
        break;
      case "m":
        this.argValue = block.spec[4];
        this.list = JSON.stringify(block.spec[1]);
        this.numperrow = 3;
        this.icon = this.getIconFrom(block.spec[4], block.spec[1]);
        this.div = this.addImageMenu(this.closePictureMenu);
        break;
      case "d":
        this.argValue = block.spec[4];
        this.list = JSON.stringify(block.spec[1]);
        this.numperrow = 3;
        this.icon = BlockSpecs.speeds[this.argValue];
        this.div = this.addImageMenu(this.menuCloseSpeeds);
        break;
      case "p":
        this.argValue = block.spec[4];
        this.div = this.pageIcon(this.argValue);
        var ctx = block.blockshape.getContext("2d");
        const pageCanvas = this.div;
        ctx.drawImage(pageCanvas, 0, 0, pageCanvas.width, pageCanvas.height, 0, 0, pageCanvas.width * block.scale, pageCanvas.height * block.scale);
        break;
      case "s":
        this.argValue = block.spec[4];
        this.div = newDiv(block.div, 2, 46, 60, 20, {
          position: "absolute",
          zoom: block.scale * 100 + "%"
        });
        var p = newP(this.div, String(this.argValue).split(".")[0], {
          width: "60px"
        });
        p.setAttribute("class", "soundname");
        break;
      case "r":
        this.argValue = block.spec[4];
        this.div = newHTML("div", "recordedCircle", block.div);
        setProps(this.div.style, {
          zoom: block.scale * 100 + "%"
        });
        var num = newHTML("p", "recordedNumber", this.div);
        num.textContent = this.daddy.inpalette ? String(this.argValue) : "?";
        break;
      default:
        break;
    }
  }
  update(spr) {
    if (this.argType == "r") {
      this.div.childNodes[0].textContent = String(this.argValue);
    }
    if (this.arg && this.argType == "p") {
      this.arg.updateIcon();
    }
  }
  getScreenPt() {
    return {
      x: globalx(this.daddy.div),
      y: globaly(this.daddy.div)
    };
  }
  addNumArg() {
    var str = String(this.argValue);
    if (this.daddy.inpalette) {
      return this.addLabel(str, false);
    }
    return this.addNumArgument(str);
  }
  addTextArg() {
    var str = String(this.argValue);
    if (this.daddy.inpalette) {
      return this.addLabel(str, true);
    }
    return this.addTextArgument(str, true);
  }
  addLabel(str, isText) {
    var scale = this.daddy.scale;
    var dx = isText ? 8 : 16;
    var dy = 57;
    if (this.daddy.blocktype == "repeat") {
      dx = Math.round(this.daddy.blockshape.width / window.devicePixelRatio / scale) - 60;
      dy = Math.round(this.daddy.blockshape.height / window.devicePixelRatio / scale) - 10;
    }
    var img = isText ? BlockSpecs.textfieldimg : BlockSpecs.numfieldimg;
    var w = isText ? 53 : 36;
    var h = 17;
    var field = newCanvas(this.daddy.div, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio, {
      position: "absolute",
      webkitTransform: "translate(" + -w * window.devicePixelRatio / 2 + "px, " + -h * window.devicePixelRatio / 2 + "px) scale(" + scale / window.devicePixelRatio + ") translate(" + (dx * window.devicePixelRatio + w * window.devicePixelRatio / 2) + "px, " + (dy * window.devicePixelRatio + h * window.devicePixelRatio / 2) + "px)",
      pointerEvents: "all"
    });
    var ctx = field.getContext("2d");
    if (!img.complete) {
      img.onload = function() {
        ctx.drawImage(img, 0, 0, w, h, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio);
      };
    } else {
      ctx.drawImage(img, 0, 0, w, h, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio);
    }
    var div = newDiv(this.daddy.div, dx, dy, w, h, {
      position: "absolute",
      zoom: scale * 100 + "%",
      margin: "0px",
      padding: "0px"
    });
    var cnv = newCanvas(div, 0, 0, w * window.devicePixelRatio, h * window.devicePixelRatio, {
      position: "absolute",
      webkitTransform: dprCenterTransform(w * window.devicePixelRatio, h * window.devicePixelRatio)
    });
    ctx = cnv.getContext("2d");
    var font = 12 * window.devicePixelRatio + "px " + window.Settings.blockArgFont;
    var lsize = getStringSize(ctx, font, str).width;
    writeText(ctx, font, "#77787b", str, h * window.devicePixelRatio - 3, Math.round((w * window.devicePixelRatio - lsize) / 2));
    return div;
  }
  addNumArgument(str) {
    var div = newHTML("div", "numfield", this.daddy.div);
    if (this.daddy.blocktype == "repeat") {
      setProps(div.style, {
        left: this.daddy.blockshape.width / window.devicePixelRatio - 62 * this.daddy.scale + "px",
        top: this.daddy.blockshape.height / window.devicePixelRatio - 11 * this.daddy.scale + "px"
      });
    }
    var ti = newHTML("h3", void 0, div);
    this.input = ti;
    setModelRef(ti, "blockarg", this);
    ti.textContent = str;
    this.arg = div;
    const divParent = div.parentNode;
    divParent.height += 10 * window.devicePixelRatio;
    setCanvasSize(divParent, divParent.width, divParent.height);
    return div;
  }
  addTextArgument(str, isText) {
    var div = newHTML("div", "textfield", this.daddy.div);
    var ti = newHTML("h3", void 0, div);
    this.input = ti;
    setModelRef(ti, "blockarg", this);
    ti.textContent = str;
    this.arg = div;
    const divParent = div.parentNode;
    divParent.height += 10 * window.devicePixelRatio;
    setCanvasSize(divParent, divParent.width, divParent.height);
    return div;
  }
  setValue(val) {
    if (!this.input) {
      return;
    }
    this.argValue = val;
    this.input.textContent = val;
  }
  isText() {
    return this.argType != "n";
  }
  /////////////////////////////////
  // Menu drop downs
  //////////////////////////////
  getIconFrom(key, list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].indexOf(key) > -1) {
        return list[i];
      }
    }
    return list[0];
  }
  addImageMenu(fcn) {
    this.drawChoice(this.daddy.blockicon);
    this.button = this.addPressButton();
    if (!this.daddy.inpalette) {
      var ba = this;
      ba.button.onmousedown = function(evt) {
        ba.pressDropDown(evt, fcn);
      };
      const buttonParent = this.button.parentNode;
      buttonParent.height += this.button.height / 2;
      setCanvasSize(buttonParent, buttonParent.width, buttonParent.height);
    }
    return this.daddy.blockicon;
  }
  drawChoice(cnv) {
    var ctx = cnv.getContext("2d");
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    var icon = BlockSpecs.getImageFrom("assets/blockicons/" + this.icon, "svg");
    var scale = this.daddy.scale;
    if (!icon.complete) {
      icon.onload = function() {
        ctx.drawImage(icon, 0, 0, icon.width, icon.height, 0, 0, icon.width * scale * window.devicePixelRatio, icon.height * scale * window.devicePixelRatio);
      };
    } else {
      ctx.drawImage(icon, 0, 0, icon.width, icon.height, 0, 0, icon.width * scale * window.devicePixelRatio, icon.height * scale * window.devicePixelRatio);
    }
    return cnv;
  }
  addPressButton() {
    var scale = this.daddy.scale;
    var dx;
    if (this.daddy.inpalette) {
      dx = this.daddy.aStart ? 26 : 16;
    } else {
      dx = this.daddy.aStart ? 20 : 10;
    }
    var dy = 56;
    var w = this.daddy.inpalette ? 36 : 48;
    var h = this.daddy.inpalette ? 20 : 27;
    var img = this.daddy.inpalette ? BlockSpecs.pressbuttonSmall : BlockSpecs.pressbutton;
    var field = newCanvas(this.daddy.div, dx, dy, w, h, {
      position: "absolute",
      zoom: scale * 100 + "%",
      pointerEvents: "all",
      webkitTransform: "translateZ(0)"
    });
    var ctx = field.getContext("2d");
    if (!img.complete) {
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
      };
    } else {
      ctx.drawImage(img, 0, 0);
    }
    return field;
  }
  pressDropDown(e, fcn) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    if (enginePorts().isOnHold()) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    enginePorts().unfocus(e);
    if (!this.daddy) {
      return;
    }
    Menu.openDropDown(this.daddy.div, fcn);
  }
  closePictureMenu(e, mu, b, c) {
    e.preventDefault();
    const block = getModelRefAs(b, "block");
    var value = block.arg.argValue;
    block.arg.argValue = c.substring(c.indexOf("_") + 1, c.length);
    var ctx = block.blockicon.getContext("2d");
    const bel = b;
    bel.icon = BlockSpecs.getImageFrom("assets/blockicons/" + c, "svg");
    const icon = bel.icon;
    ctx.clearRect(0, 0, 85 * scaleMultiplier * window.devicePixelRatio, 66 * scaleMultiplier * window.devicePixelRatio);
    if (!icon.complete) {
      icon.onload = function() {
        var w2 = icon.width;
        var h2 = icon.height;
        ctx.drawImage(icon, 0, 0, w2, h2, 0, 0, w2 * scaleMultiplier * window.devicePixelRatio, h2 * scaleMultiplier * window.devicePixelRatio);
      };
    } else {
      var w = icon.width;
      var h = icon.height;
      ctx.drawImage(icon, 0, 0, w, h, 0, 0, w * scaleMultiplier * window.devicePixelRatio, h * scaleMultiplier * window.devicePixelRatio);
    }
    if (Menu.openMenu) {
      Menu.openMenu.parentNode.removeChild(Menu.openMenu);
    }
    if (block.arg.argValue != value) {
      var spr = getModelRefAs(b.parentNode, "scripts").spr;
      var action = {
        action: "scripts",
        where: spr.div.parentNode.owner.id,
        who: spr.id
      };
      enginePorts().undoRecord(action);
      enginePorts().storyStart("BlockArg.prototype.closePictureMenu");
    }
    Menu.openMenu = null;
  }
  menuCloseSpeeds(e, mu, b, c) {
    e.preventDefault();
    const block = getModelRefAs(b, "block");
    var value = block.arg.argValue;
    block.arg.argValue = BlockSpecs.speeds.indexOf(c);
    var ctx = block.blockicon.getContext("2d");
    const bel = b;
    bel.icon = BlockSpecs.getImageFrom("assets/blockicons/" + c, "svg");
    const icon = bel.icon;
    ctx.clearRect(0, 0, 64 * scaleMultiplier * window.devicePixelRatio, 64 * scaleMultiplier * window.devicePixelRatio);
    block.blockicon.style.display = "none";
    block.blockicon.style.display = "inherit";
    if (!icon.complete) {
      icon.onload = function() {
        var w2 = icon.width;
        var h2 = icon.height;
        ctx.drawImage(icon, 0, 0, w2, h2, 0, 0, w2 * scaleMultiplier * window.devicePixelRatio, h2 * scaleMultiplier * window.devicePixelRatio);
      };
    } else {
      var w = icon.width;
      var h = icon.height;
      ctx.drawImage(icon, 0, 0, w, h, 0, 0, w * scaleMultiplier * window.devicePixelRatio, h * scaleMultiplier * window.devicePixelRatio);
    }
    if (Menu.openMenu) {
      Menu.openMenu.parentNode.removeChild(Menu.openMenu);
    }
    if (block.arg.argValue != value) {
      var spr = getModelRefAs(b.parentNode, "scripts").spr;
      var action = {
        action: "scripts",
        where: spr.div.parentNode.owner.id,
        who: spr.id
      };
      enginePorts().undoRecord(action);
      enginePorts().storyStart("BlockArg.prototype.menuCloseSpeeds");
    }
    Menu.openMenu = null;
  }
  //////////////////////////
  // Page Icon
  //////////////////////////
  pageIcon(num) {
    var dpr = window.devicePixelRatio;
    var page = enginePorts().getStage().pages[num - 1];
    var icon = document.createElement("canvas");
    setCanvasSize(icon, 86 * dpr, 66 * dpr);
    if (!page) {
      return icon;
    }
    var canvas = document.createElement("canvas");
    setCanvasSize(canvas, 52 * dpr, 42 * dpr);
    var mainctx = canvas.getContext("2d");
    mainctx.fillStyle = "#AE1F24";
    mainctx.fillRect(0, 0, canvas.width, canvas.height);
    mainctx.fillStyle = "#28A5DA";
    mainctx.fillRect(1 * dpr, 1 * dpr, 50 * dpr, 40 * dpr);
    var c = document.createElement("canvas");
    var w = (52 - 6) * dpr;
    var h = (42 - 6) * dpr;
    setCanvasSize(c, w, h);
    var ctx = c.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, c.width, c.height);
    if (page.bkg.childElementCount > 0) {
      var img = page.bkg.childNodes[0];
      var imgw = img.naturalWidth ? img.naturalWidth : img.width;
      var imgh = img.naturalHeight ? img.naturalHeight : img.height;
      ctx.drawImage(img, 0, 0, imgw, imgh, 0, 0, w, h);
    }
    var scale = w / 480;
    for (var i = 0; i < page.div.childElementCount; i++) {
      var spr = page.div.childNodes[i].owner;
      if (!spr) {
        continue;
      }
      page.stampSpriteAt(ctx, spr, scale);
    }
    mainctx.drawImage(c, 3 * dpr, 3 * dpr);
    var ictx = icon.getContext("2d");
    ictx.fillStyle = "#AE1F24";
    ictx.beginPath();
    ictx.arc(63 * dpr, 19 * dpr, 10 * dpr, 0 * dpr, Math.PI * 2, true);
    ictx.closePath();
    ictx.fill();
    ictx.drawImage(canvas, 14 * dpr, 16 * dpr);
    ictx.beginPath();
    ictx.fillStyle = "#28A5DA";
    ictx.strokeStyle = "#355E7C";
    ictx.arc(63 * dpr, 19 * dpr, 8 * dpr, 0 * dpr, Math.PI * 2, true);
    ictx.closePath();
    ictx.stroke();
    ictx.fill();
    writeText(ictx, "bold " + 12 * dpr + "px " + window.Settings.blockArgFont, "white", String(page.num), 26 * dpr, 58 * dpr);
    return icon;
  }
  updateIcon() {
    var num = this.argValue;
    var page = enginePorts().getStage().pages[Number(num) - 1];
    page.num = num;
    this.div = this.pageIcon(num);
    var block = this.daddy;
    var ctx = block.blockshape.getContext("2d");
    const pageCanvas = this.div;
    ctx.drawImage(pageCanvas, 0, 0, pageCanvas.width, pageCanvas.height, 0, 0, pageCanvas.width * block.scale, pageCanvas.height * block.scale);
  }
};

// src/app/src/editor/blocks/Block.ts
var BLOCK_WIDTH_REPEAT = 176;
var BLOCK_WIDTH_GOTOPAGE = 86;
var BLOCK_WIDTH_START_END = 84;
var BLOCK_WIDTH_DEFAULT = 76;
var BLOCK_HEIGHT_REPEAT = 82;
var BLOCK_HEIGHT_DEFAULT = 66;
var Block = class _Block {
  // Instance state built by the constructor and shape-drawing helpers
  div;
  blockshape;
  spec;
  isReporter;
  blocktype;
  icon;
  image;
  aStart;
  anEnd;
  cShape;
  prev;
  next;
  inside;
  isCaret;
  type;
  arg;
  daddy;
  scale;
  repeatCounter;
  originalCount;
  threads;
  min;
  max;
  hrubberband;
  vrubberband;
  shadow;
  shadowimg;
  shine;
  blockicon;
  inpalette;
  done;
  constructor(spec, isPalette, scale) {
    this.div = document.createElement("div");
    setProps(this.div.style, {
      pointerEvents: "none"
    });
    this.setBlockshapeFromSpecs(spec, isPalette, scale);
    this.blockshape = document.createElement("canvas");
    setCanvasSize(this.div, this.getWidth() * this.scale, this.getHeight() * this.scale);
    setCanvasSize(this.blockshape, this.getWidth() * this.scale * window.devicePixelRatio, this.getHeight() * this.scale * window.devicePixelRatio);
    this.addShadow();
    this.div.appendChild(this.blockshape);
    setProps(this.blockshape.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      webkitTransform: dprCenterTransform(this.blockshape.width, this.blockshape.height),
      pointerEvents: "all"
    });
    this.addHighlight();
    this.drawBlock();
    setCanvasSize(this.div, this.blockshape.width / window.devicePixelRatio, this.blockshape.height / window.devicePixelRatio);
    if (this.isCaret) {
      return;
    }
    this.createArgument();
    setModelRef(this.div, "block", this);
  }
  getWidth() {
    if (this.blocktype == "repeat") {
      return BLOCK_WIDTH_REPEAT;
    }
    if (this.blocktype == "gotopage") {
      return BLOCK_WIDTH_GOTOPAGE;
    }
    if (this.aStart || this.anEnd) {
      return BLOCK_WIDTH_START_END;
    }
    return BLOCK_WIDTH_DEFAULT;
  }
  getHeight() {
    if (this.blocktype == "repeat") {
      return BLOCK_HEIGHT_REPEAT;
    }
    return BLOCK_HEIGHT_DEFAULT;
  }
  setBlockshapeFromSpecs(spec, isPalette, scale) {
    this.spec = spec;
    this.isReporter = spec[1] == "reporter";
    this.blocktype = spec[0];
    this.icon = spec[1];
    this.image = spec[2];
    this.aStart = this.blocktype == "caretstart" || this.image == BlockSpecs.yellowStart;
    this.anEnd = this.blocktype == "caretend" || this.image == BlockSpecs.redEnd || this.image == BlockSpecs.redEndLong;
    this.cShape = this.blocktype == "repeat" || this.blocktype == "caretrepeat";
    this.prev = null;
    this.next = null;
    this.inside = null;
    this.isCaret = this.blocktype.indexOf("caret") > -1;
    this.type = "block";
    this.arg = null;
    this.daddy = null;
    this.scale = scale || 1;
    this.repeatCounter = -1;
    this.originalCount = -1;
    this.threads = [];
    this.inpalette = isPalette ?? false;
    this.min = spec[6];
    this.max = spec[7];
    this.shadowimg = this.spec.length < 9 ? null : spec[8];
    this.hrubberband = 0;
    this.vrubberband = 0;
    this.done = false;
  }
  addShadow() {
    this.shadow = document.createElement("canvas");
    this.div.appendChild(this.shadow);
    setProps(this.shadow.style, {
      position: "absolute",
      left: "1px",
      top: "4px",
      opacity: this.inpalette ? window.Settings.paletteBlockShadowOpacity : 1,
      visibility: "hidden",
      webkitTransform: dprCenterTransform(this.blockshape.width, this.blockshape.height),
      pointerEvents: "all"
    });
    setCanvasSize(this.shadow, this.blockshape.width, this.blockshape.height);
    if (!this.shadowimg) {
      return;
    }
    var ctx = this.shadow.getContext("2d");
    var img = this.shadowimg;
    if (!img.complete) {
      var me = this;
      img.onload = function() {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * me.scale * window.devicePixelRatio, img.height * me.scale * window.devicePixelRatio);
      };
    } else {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * this.scale * window.devicePixelRatio, img.height * this.scale * window.devicePixelRatio);
    }
  }
  lift() {
    this.shadow.style.visibility = "visible";
  }
  drop() {
    this.shadow.style.visibility = "hidden";
  }
  addHighlight() {
    var img = this.spec[5];
    if (!img) {
      return;
    }
    this.shine = document.createElement("canvas");
    this.div.appendChild(this.shine);
    setCanvasSize(this.shine, this.blockshape.width, this.blockshape.height);
    setProps(this.shine.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      visibility: "hidden",
      webkitTransform: dprCenterTransform(this.blockshape.width, this.blockshape.height),
      pointerEvents: "all"
    });
    var ctx = this.shine.getContext("2d");
    var me = this;
    if (!img.complete) {
      img.onload = function() {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * me.scale * window.devicePixelRatio, img.height * me.scale * window.devicePixelRatio);
      };
    } else {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width * this.scale * window.devicePixelRatio, img.height * this.scale * window.devicePixelRatio);
    }
  }
  drawBlock() {
    var cnv = this.blockshape;
    var ctx = this.blockshape.getContext("2d");
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    var me = this;
    if (!this.image.complete) {
      this.image.onload = function() {
        me.drawBlockType();
      };
    } else {
      this.drawBlockType();
    }
  }
  drawBlockType() {
    var ctx = this.blockshape.getContext("2d");
    ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.image.width * this.scale * window.devicePixelRatio, this.image.height * this.scale * window.devicePixelRatio);
    var icnv = document.createElement("canvas");
    this.blockicon = icnv;
    this.div.appendChild(icnv);
    setCanvasSize(icnv, this.blockshape.width, this.blockshape.height);
    setProps(icnv.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      webkitTransform: dprCenterTransform(this.blockshape.width, this.blockshape.height),
      pointerEvents: "all"
    });
    const iconNode = this.icon;
    if (iconNode && typeof iconNode === "object" && "tagName" in iconNode) {
      this.drawIcon();
    }
    this.done = true;
  }
  updateBlock() {
    if (this.arg && this.arg.argType == "p") {
      this.arg.updateIcon();
    }
  }
  highlight() {
    if (this.blocktype.indexOf("caret") > -1) {
      return;
    }
    if (!this.div.parentNode) {
      return;
    }
    const parentNode = this.div.parentNode;
    if (parentNode.id != "palette" && this.div.parentNode != enginePorts().getActiveScript()) {
      return;
    }
    this.shine.style.visibility = "visible";
  }
  unhighlight() {
    if (this.blocktype.indexOf("caret") > -1) {
      return;
    }
    this.shine.style.visibility = "hidden";
  }
  drawIcon() {
    var dx = 0;
    var dy = 0;
    var ctx = this.blockicon.getContext("2d");
    switch (this.blocktype) {
      case "repeat":
        var w = Math.round(74 * this.scale * window.devicePixelRatio);
        var h = Math.round(65 * this.scale * window.devicePixelRatio);
        setCanvasSize(this.blockicon, w, h);
        dx = 0;
        this.blockicon.style.left = this.shine.width / window.devicePixelRatio - Math.round(this.scale * 77) + "px";
        dy = Math.round(this.scale * 14 * window.devicePixelRatio);
        setProps(this.blockicon.style, {
          position: "absolute",
          webkitTransform: dprCenterTransform(w, h)
        });
        break;
      default:
        break;
    }
    this.drawMyIcon(ctx, dx, dy);
  }
  drawMyIcon(ctx, dx, dy) {
    var me = this;
    var icon = this.icon;
    if (!icon.complete) {
      icon.onload = function() {
        ctx.drawImage(icon, 0, 0, icon.width, icon.height, dx, dy, icon.width * me.scale * window.devicePixelRatio, icon.height * me.scale * window.devicePixelRatio);
      };
    } else {
      ctx.drawImage(icon, 0, 0, icon.width, icon.height, dx, dy, icon.width * me.scale * window.devicePixelRatio, icon.height * me.scale * window.devicePixelRatio);
    }
  }
  createArgument() {
    if (this.spec[4] == null) {
      return;
    }
    this.arg = new BlockArg(this);
  }
  getArgValue() {
    if (this.arg == null) {
      return null;
    }
    return this.arg.argValue;
  }
  getSoundName(list) {
    var val = this.arg.argValue;
    if (Number(val).toString() == "NaN") {
      return val;
    }
    if (list.length <= val) {
      return list[0];
    }
    return list[Number(val)];
  }
  update(spr) {
    if (this.arg) {
      this.arg.update(spr);
    }
  }
  setSound(bt) {
    var p = this.arg.div;
    p.parentNode.removeChild(p);
    var icon = this.blockicon;
    icon.parentNode.removeChild(icon);
    var op = bt;
    var specs = BlockSpecs.defs[op];
    this.setBlockshapeFromSpecs(specs);
    this.drawBlock();
    this.createArgument();
  }
  duplicateBlock(dx, dy, spr) {
    var op = this.blocktype;
    var specs = BlockSpecs.defs[op];
    specs[4] = this.getArgValue();
    var bbx = new _Block(specs, false, scaleMultiplier);
    setProps(bbx.div.style, {
      position: "absolute",
      left: "0px",
      top: "0px"
    });
    bbx.moveBlock(dx, dy);
    bbx.update(spr);
    return bbx;
  }
  resolveDocks() {
    var w = this.getWidth();
    var h = this.getHeight();
    if (this.aStart) {
      return [["start", true, 0, h / 2], ["flow", false, w - this.notchSize(), h / 2]];
    }
    if (this.anEnd) {
      return [["flow", true, 0, h / 2], ["changestate", false, w - 3, h / 2]];
    }
    if (this.isReporter) {
      return [["input", true, 0, 0], ["input", false, w - this.notchSize(), h / 2]];
    }
    if (this.cShape) {
      return [
        ["flow", true, 0, this.blockshape.height / this.scale / window.devicePixelRatio - 33],
        ["flow", false, 35, this.blockshape.height / this.scale / window.devicePixelRatio - 33],
        [
          "flow",
          false,
          this.blockshape.width / this.scale / window.devicePixelRatio - this.notchSize() - 1,
          this.blockshape.height / this.scale / window.devicePixelRatio - 33
        ]
      ];
    }
    return [["flow", true, 0, h / 2], ["flow", false, w - this.notchSize(), h / 2]];
  }
  notchSize() {
    return 11;
  }
  //////////////////////////////////////////
  // Connect / Disconnect
  /////////////////////////////////////////
  connectBlock(myn, you, yourn) {
    if (this.isConnectedAfterFirst(myn, you, yourn)) {
      return;
    }
    this.connectLast(myn, you, yourn);
    this.setMyDock(myn, you);
    you.setMyDock(yourn, this);
    if (this.cShape && myn == 1 && this.inside.findLast().anEnd) {
      var theend = this.inside.findLast();
      theend.prev.next = null;
      var last = this.findLast();
      last.next = theend;
      theend.prev = last;
    }
  }
  getMyDock(dockn) {
    var myprops = this.cShape ? ["prev", "inside", "next"] : ["prev", "next"];
    return this[myprops[dockn]];
  }
  setMyDock(dockn, you) {
    var myprops = this.cShape ? ["prev", "inside", "next"] : ["prev", "next"];
    this[myprops[dockn]] = you;
  }
  getMyDockNum(you) {
    var connections = this.cShape ? [this.prev, this.inside, this.next] : [this.prev, this.next];
    return connections.indexOf(you);
  }
  isConnectedAfterFirst(myn, you, yourn) {
    if (myn == 0) {
      return false;
    }
    var prev = you.prev;
    if (prev == null) {
      return false;
    }
    if (this == prev) {
      return false;
    }
    var n = prev.getMyDockNum(you);
    var thefirst = this.findFirst();
    thefirst.connectBlock(0, prev, n);
    return true;
  }
  findLast() {
    if (this.next == null) {
      return this;
    }
    return this.next.findLast();
  }
  findFirst() {
    if (this.prev == null) {
      return this;
    }
    return this.prev.findFirst();
  }
  connectLast(myn, you, yourn) {
    if (myn != 0) {
      return;
    }
    var yourtail = you.getMyDock(yourn);
    var mylast = this.findLast();
    if (yourtail == mylast) {
      return;
    }
    if (this.cShape && this.inside == null && yourtail != null && !yourtail.anEnd) {
      var lastone = yourtail.findLast();
      this.inside = yourtail;
      yourtail.prev = this;
      if (lastone.anEnd) {
        mylast.next = lastone;
        var striplast = lastone.prev;
        if (striplast) {
          striplast.next = null;
        }
        lastone.prev = mylast;
      }
    } else {
      mylast.next = yourtail;
      if (yourtail == null) {
        return;
      }
      yourtail.prev = mylast;
    }
  }
  detachBlock() {
    var you = this.prev;
    if (you == null) {
      return;
    }
    this.prev = null;
    if (you.cShape && you.inside == this) {
      you.inside = null;
    } else {
      you.next = null;
    }
  }
  //////////////////////////////////////////
  // Move
  /////////////////////////////////////////
  moveBlock(dx, dy) {
    this.div.top = dy;
    this.div.left = dx;
    this.div.style.webkitTransform = "translate3d(" + this.div.left + "px," + this.div.top + "px, 0)";
  }
  /////////////////////////////////
  // Forever and Repeat
  ////////////////////////////////
  // Repeat size 176 by 82
  redrawRepeat() {
    this.redrawShape(this.blockshape, this.image);
    if (this.blocktype.indexOf("caret") < 0) {
      this.redrawShape(this.shadow, this.shadowimg);
    }
    if (this.blocktype.indexOf("caret") > -1) {
      return;
    }
    var dx = this.blockshape.width / window.devicePixelRatio - 78 * this.scale;
    var dy = this.blockshape.height / window.devicePixelRatio - 82 * this.scale;
    this.blockicon.style.left = dx + "px";
    this.arg.div.style.left = this.blockshape.width / window.devicePixelRatio - 66 * this.scale + "px";
    this.blockicon.style.top = dy + "px";
    this.arg.div.style.top = this.blockshape.height / window.devicePixelRatio - 11 * this.scale + "px";
  }
  redrawShape(cnv, img) {
    setCanvasSize(
      this.div,
      (92 + this.hrubberband + 84) * this.scale,
      (100 + this.vrubberband) * this.scale
    );
    var scaleAndRatio = this.scale * window.devicePixelRatio;
    setCanvasSize(
      cnv,
      (92 + this.hrubberband + 84) * scaleAndRatio,
      (82 + this.vrubberband) * scaleAndRatio
    );
    setProps(cnv.style, {
      webkitTransform: dprCenterTransform(cnv.width, cnv.height)
    });
    var ctx = cnv.getContext("2d");
    ctx.drawImage(img, 0, 0, 92, 29, 0, 0, 92 * scaleAndRatio, 29 * scaleAndRatio);
    ctx.drawImage(img, 92, 0, 1, 29, 92 * scaleAndRatio, 0, this.hrubberband * scaleAndRatio, 29 * scaleAndRatio);
    ctx.drawImage(img, 93, 0, img.width - 93, 29, 92 * scaleAndRatio + this.hrubberband * scaleAndRatio, 0, 83 * scaleAndRatio, 29 * scaleAndRatio);
    ctx.drawImage(img, 0, 29, 92, 1, 0, 29 * scaleAndRatio, 92 * scaleAndRatio, this.vrubberband * scaleAndRatio);
    ctx.drawImage(img, 93, 29, img.width - 93, 1, 92 * scaleAndRatio + this.hrubberband * scaleAndRatio, 29 * scaleAndRatio, 83 * scaleAndRatio, this.vrubberband * scaleAndRatio);
    ctx.drawImage(img, 0, 29, 45, 53, 0, 29 * scaleAndRatio + this.vrubberband * scaleAndRatio, 45 * scaleAndRatio, 53 * scaleAndRatio);
    ctx.drawImage(img, 93, 29, img.width - 93, 53, 92 * scaleAndRatio + this.hrubberband * scaleAndRatio, 29 * scaleAndRatio + this.vrubberband * scaleAndRatio, 83 * scaleAndRatio, 53 * scaleAndRatio);
  }
};

// src/app/src/editor/engine/mediaCounter.ts
var count = -1;
function getMediaCount() {
  return count;
}
function setMediaCount(n) {
  count = n;
}
function bumpMediaCount(delta2) {
  count += delta2;
}

// src/app/src/painteditor/Transform.ts
var Transform = class _Transform {
  static getList(elem) {
    if (elem == void 0) {
      return null;
    }
    if (elem.transform) {
      return elem.transform.baseVal;
    } else if (elem.gradientTransform) {
      return elem.gradientTransform.baseVal;
    }
    return null;
  }
  static extract(elem, n) {
    var tl = _Transform.getList(elem);
    for (var i = 0; i < tl.numberOfItems; ++i) {
      if (tl.getItem(i).type == n) {
        return tl.getItem(i);
      }
    }
    return Paint.root.createSVGTransform();
  }
  static getIndex(elem, n) {
    var tl = _Transform.getList(elem);
    for (var i = 0; i < tl.numberOfItems; ++i) {
      if (tl.getItem(i).type == n) {
        return i;
      }
    }
    return null;
  }
  static point(x, y, m) {
    return _Transform.newPoint(x, y).matrixTransform(m);
  }
  static newPoint(x, y) {
    var pt = Paint.root.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt;
  }
  ////////////////////////////
  // Element translation
  ////////////////////////////
  static translateTo(elem, xform, fcn) {
    if (elem == void 0) {
      return;
    }
    var pname = elem.tagName;
    switch (pname) {
      case "g":
        for (var i = 0; i < elem.childElementCount; i++) {
          if (_Transform.getList(elem.childNodes[i]) != null) {
            _Transform.translateTo(
              elem.childNodes[i],
              xform,
              _Transform.getScaleMatrix(elem.childNodes[i])
            );
          }
        }
        break;
      case "ellipse":
      case "circle":
        var center = _Transform.point(elem.getAttribute("cx"), elem.getAttribute("cy"), xform.matrix);
        elem.setAttributeNS(null, "cx", String(center.x));
        elem.setAttributeNS(null, "cy", String(center.y));
        break;
      case "line":
        _Transform.line(elem, xform.matrix);
        break;
      case "path":
        _Transform.applyToCmds(elem, xform.matrix);
        break;
      case "clipPath":
        _Transform.translateTo(elem.childNodes[0], xform);
        break;
      case "image":
      case "rect":
        var corner = _Transform.point(Number(elem.getAttribute("x")), Number(elem.getAttribute("y")), xform.matrix);
        elem.setAttributeNS(null, "x", String(corner.x));
        elem.setAttributeNS(null, "y", String(corner.y));
        break;
      case "polygon":
      case "polyline":
        var points = elem.points;
        var delta2 = {
          x: xform.matrix.e,
          y: xform.matrix.f
        };
        for (var j = 0; j < points.numberOfItems; j++) {
          var p = Vector.sum(points.getItem(j), delta2);
          points.getItem(j).x = p.x;
          points.getItem(j).y = p.y;
        }
        break;
    }
    _Transform.updateAll(elem);
    _Transform.updateRotationCenter(elem);
  }
  static updateRotationCenter(elem) {
    if (_Transform.getRotationAngle(elem) == 0) {
      return;
    }
    var angle = _Transform.getRotationAngle(elem);
    var rot = _Transform.extract(elem, 4);
    var mtx = _Transform.getCombinedMatrices(elem);
    var center = SVGTools.getBoxCenter(elem);
    center = _Transform.point(center.x, center.y, mtx);
    rot.setRotate(angle, center.x, center.y);
  }
  static line(elem, mtx) {
    var pt = Paint.root.createSVGPoint();
    pt.x = Number(elem.getAttribute("x1"));
    pt.y = Number(elem.getAttribute("y1"));
    pt = pt.matrixTransform(mtx);
    elem.setAttribute("x1", String(pt.x));
    elem.setAttribute("y1", String(pt.y));
    pt.x = Number(elem.getAttribute("x2"));
    pt.y = Number(elem.getAttribute("y2"));
    pt = pt.matrixTransform(mtx);
    elem.setAttribute("x2", String(pt.x));
    elem.setAttribute("y2", String(pt.y));
  }
  static eleminateTranslates(elem) {
    var tl = _Transform.getList(elem);
    for (var i = 0; i < tl.numberOfItems; ++i) {
      if (tl.getItem(i).type == 2) {
        var trnsf = tl.getItem(i);
        tl.removeItem(i);
        if (elem.nodeName == "image") {
          var clip = gn("clip_" + elem.id);
          if (clip) {
            _Transform.translateTo(clip.childNodes[0], trnsf);
          }
        }
        _Transform.translateTo(elem, trnsf);
      }
    }
  }
  static eliminateAll(spr) {
    var tl = _Transform.getList(spr);
    if (tl && tl.numberOfItems > 0) {
      var k = tl.numberOfItems;
      while (k--) {
        tl.removeItem(k);
      }
    }
    return tl;
  }
  static combineAll(elem) {
    var tl = _Transform.getList(elem);
    if (tl == null) {
      return Paint.root.createSVGMatrix();
    }
    var n = tl.numberOfItems;
    var m = Paint.root.createSVGMatrix();
    for (var i = 0; i < n; i++) {
      var mtom = tl.getItem(i);
      m = m.multiply(mtom.matrix);
    }
    return m;
  }
  static appendForMove(elem, t) {
    var tl = _Transform.getList(elem);
    if (tl == null) {
      return;
    }
    if (tl.numberOfItems == 0) {
      tl.appendItem(t);
    } else {
      tl.insertItemBefore(t, 0);
    }
  }
  static getTranslateTransform() {
    var res = Paint.root.createSVGTransform();
    res.setTranslate(0, 0);
    return res;
  }
  static applyRotation(elem, angle) {
    var rot = Paint.root.createSVGTransform();
    var box = SVGTools.getBox(elem);
    var cx = box.x + box.width / 2;
    var cy = box.y + box.height / 2;
    rot.setRotate(angle, cx, cy);
    _Transform.getList(elem).appendItem(rot);
  }
  //////////////////////////////////
  // SVG Transforms
  //////////////////////////////////
  static getRotationAngle(elem, to_rad) {
    var tl = _Transform.getList(elem);
    if (!tl) {
      return 0;
    }
    var num = tl.numberOfItems;
    for (var i = 0; i < num; ++i) {
      var xform = tl.getItem(i);
      if (xform.type == 4) {
        return to_rad ? xform.angle * DEGTOR : xform.angle;
      }
    }
    return 0;
  }
  static getRotation(elem) {
    var tl = _Transform.getList(elem);
    var num = tl.numberOfItems;
    for (var i = 0; i < num; ++i) {
      var xform = tl.getItem(i);
      if (xform.type == 4) {
        return xform;
      }
    }
    var rot = Paint.root.createSVGTransform();
    var center = SVGTools.getBoxCenter(elem);
    rot.setRotate(0, center.x, center.y);
    if (tl.numberOfItems == 0) {
      _Transform.getList(elem).appendItem(rot);
    } else {
      _Transform.getList(elem).insertItemBefore(rot, 0);
    }
    return rot;
  }
  static getValid(elem) {
    if (!elem) {
      return null;
    }
    var tl = _Transform.getList(elem);
    if (!tl) {
      return null;
    }
    if (tl && tl.numberOfItems > 0) {
      var k = tl.numberOfItems;
      while (k--) {
        var xform = tl.getItem(k);
        if (xform.type == 0) {
          tl.removeItem(k);
        }
        if (xform.matrix.isIdentity()) {
          tl.removeItem(k);
        } else if (xform.type == 4) {
          if (xform.angle == 0) {
            tl.removeItem(k);
          }
          if (xform.angle == 360) {
            tl.removeItem(k);
          }
        }
      }
      if (tl.numberOfItems == 1 && _Transform.getRotationAngle(elem)) {
        return null;
      }
    }
    if (tl.numberOfItems == 0) {
      if (elem.getAttribute("transform")) {
        elem.removeAttribute("transform");
      }
      return null;
    }
    return tl;
  }
  static getCombinedMatrices(elem) {
    var tl = _Transform.getList(elem);
    if (tl == null) {
      return Paint.root.createSVGMatrix();
    }
    var n = tl.numberOfItems;
    var m = Paint.root.createSVGMatrix();
    for (var i = 0; i < n; i++) {
      var mtom = tl.getItem(i);
      if (mtom.type == 4) {
        continue;
      } else {
        m = m.multiply(mtom.matrix);
      }
    }
    return m;
  }
  static hasScaleMatrix(elem) {
    var tl = _Transform.getList(elem);
    if (tl == null) {
      return false;
    }
    for (var i = 0; i < tl.numberOfItems; ++i) {
      if (tl.getItem(i).type == 3) {
        return true;
      }
    }
    return false;
  }
  static getScaleMatrix(e) {
    var tl = _Transform.getList(e);
    var scaleIndex = _Transform.getIndex(e, 3);
    if (scaleIndex != null) {
      return tl.getItem(scaleIndex).matrix;
    }
    return Paint.root.createSVGMatrix();
  }
  static updateAll(elem) {
    var newtl = _Transform.getList(elem);
    if (newtl && newtl.numberOfItems == 0) {
      elem.removeAttribute("transform");
    }
  }
  static applyMatrix(elem, matrix) {
    var m = Paint.root.createSVGTransform();
    m.setMatrix(matrix);
    _Transform.getList(elem).appendItem(m);
  }
  ////////////////////////////////////////////////////////////
  // Paths data structure
  ////////////////////////////////////////////////////////////
  static applyToCmds(shape, mtx) {
    var d = shape.getAttribute("d");
    var list = SVG2Canvas.getCommandList(d);
    var plist = [];
    if (!list) {
      return;
    }
    for (var j = 0; j < list.length; j++) {
      var cmd = list[j];
      cmd = _Transform.getModifiedCmd(cmd, mtx);
      plist.push(cmd);
    }
    var path = SVG2Canvas.arrayToString(plist);
    shape.setAttribute("d", path);
  }
  static getModifiedCmd(cmd, mtx) {
    var pt = _Transform.newPoint(0, 0);
    if (cmd.length < 2) {
      return cmd;
    }
    if (cmd.length < 3) {
      if (cmd[0].toLowerCase() == "h") {
        pt.x = cmd[1];
        cmd[1] = pt.matrixTransform(mtx).x;
      } else {
        pt.y = cmd[1];
        cmd[1] = pt.matrixTransform(mtx).y;
      }
      return cmd;
    }
    for (var i = 1; i < cmd.length; i += 2) {
      pt.x = cmd[i];
      pt.y = cmd[i + 1];
      pt = pt.matrixTransform(mtx);
      cmd[i] = pt.x;
      cmd[i + 1] = pt.y;
    }
    return cmd;
  }
  ////////////////////////////////////////////////
  // Element Rotation
  ///////////////////////////////////////////////
  static rotateFromPoint(erot, node) {
    var pname = node.tagName;
    var rot = _Transform.getRotation(node);
    var c, p, delta2, mtx, cx, cy;
    switch (pname) {
      case "g":
        for (var i = 0; i < node.childElementCount; i++) {
          _Transform.rotateFromPoint(erot, node.childNodes[i]);
        }
        if (node.getAttribute("transform")) {
          node.removeAttribute("transform");
        }
        break;
      case "clipPath":
        break;
      case "image":
      case "rect":
        c = SVGTools.getBoxCenter(node);
        p = _Transform.point(c.x, c.y, erot.matrix);
        delta2 = Vector.diff(p, c);
        mtx = Paint.root.createSVGMatrix();
        mtx.e = delta2.x;
        mtx.f = delta2.y;
        var pt = Paint.root.createSVGPoint();
        pt.x = Number(node.getAttribute("x"));
        pt.y = Number(node.getAttribute("y"));
        pt = pt.matrixTransform(mtx);
        var imgdelta = Vector.diff({
          x: pt.x,
          y: pt.y
        }, {
          x: Number(node.getAttribute("x")),
          y: Number(node.getAttribute("y"))
        });
        node.setAttribute("x", String(pt.x));
        node.setAttribute("y", String(pt.y));
        if (pname == "image" && Vector.len(imgdelta) > 0) {
          var clip = gn("pathmask_" + node.id);
          if (clip) {
            if (clip.getAttribute("transform")) {
              clip.removeAttribute("transform");
            }
            var cmtx = Paint.root.createSVGMatrix();
            cmtx.e = imgdelta.x;
            cmtx.f = imgdelta.y;
            _Transform.applyToCmds(clip, cmtx);
          }
        }
        break;
      case "circle":
      case "ellipse":
        cx = Number(node.getAttribute("cx"));
        cy = Number(node.getAttribute("cy"));
        p = _Transform.point(cx, cy, erot.matrix);
        var attr = {
          "cx": p.x,
          "cy": p.y
        };
        for (var val in attr) {
          node.setAttributeNS(null, val, String(Math.round(attr[val] * 100) / 100));
        }
        break;
      case "line":
        c = SVGTools.getBoxCenter(node);
        p = _Transform.point(c.x, c.y, erot.matrix);
        delta2 = Vector.diff(p, c);
        mtx = Paint.root.createSVGMatrix();
        mtx.e = delta2.x;
        mtx.f = delta2.y;
        _Transform.line(node, mtx);
        break;
      case "path":
        c = SVGTools.getBoxCenter(node);
        p = _Transform.point(c.x, c.y, erot.matrix);
        delta2 = Vector.diff(p, c);
        mtx = Paint.root.createSVGMatrix();
        mtx.e = delta2.x;
        mtx.f = delta2.y;
        _Transform.applyToCmds(node, mtx);
        break;
      case "polygon":
      case "polyline":
        c = SVGTools.getBoxCenter(node);
        p = _Transform.point(c.x, c.y, erot.matrix);
        delta2 = Vector.diff(p, c);
        mtx = Paint.root.createSVGMatrix();
        mtx.e = delta2.x;
        mtx.f = delta2.y;
        var points = node.points;
        for (var j = 0; j < points.numberOfItems; j++) {
          p = _Transform.point(points.getItem(j).x, points.getItem(j).y, mtx);
          points.getItem(j).x = p.x;
          points.getItem(j).y = p.y;
        }
        break;
    }
    if (pname == "g") {
      return;
    }
    if (pname == "clipPath") {
      return;
    }
    rot = _Transform.getRotation(node);
    var box = SVGTools.getBox(node);
    cx = box.x + box.width / 2;
    cy = box.y + box.height / 2;
    rot.setRotate(erot.angle + rot.angle, cx, cy);
    _Transform.updateRotationCenter(node);
    if (pname == "path") {
      _Transform.applyToCmds(node, _Transform.combineAll(node));
      _Transform.eliminateAll(node);
    }
  }
};
var svgMatrixProto = SVGMatrix.prototype;
svgMatrixProto.isIdentity = function() {
  return this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1 && this.e == 0 && this.f == 0;
};

// src/app/src/painteditor/Layer.ts
var targetOffscreen = document.createElement("canvas");
var offscreen = document.createElement("canvas");
var Layer = class _Layer {
  static bringToFront(elem) {
    if (!elem) {
      return;
    }
    if (elem.getAttribute("fixed") == "yes") {
      return;
    }
    if (!elem.parentNode) {
      return;
    }
    while (elem.parentNode && elem.parentNode.id != "layer1") {
      elem = elem.parentNode;
    }
    var index3 = _Layer.groupStartsAt(gn("layer1"), elem);
    var group = _Layer.onTopOfBy(gn("layer1"), elem, 1, index3, _Layer.getRelated(elem));
    var p = elem.parentNode;
    for (var i = 0; i < group.length; i++) {
      p.appendChild(group[i]);
    }
    if (group.length > 1) {
      PaintUndo.record();
    }
  }
  static bringElementsToFront() {
    var res = [];
    for (let i = 0; i < gn("layer1").childElementCount; i++) {
      var mt = gn("layer1").childNodes[i];
      if (mt.getAttribute("fixed") == "yes") {
        continue;
      }
      if (mt.getAttribute("stencil") == "yes") {
        continue;
      }
      res.push(mt);
    }
    for (let i = 0; i < res.length; i++) {
      gn("layer1").appendChild(res[i]);
    }
  }
  static onTopOf(p, index3) {
    var res = [];
    for (var i = index3; i < p.childElementCount; i++) {
      res.push(p.childNodes[i]);
    }
    return res;
  }
  static ordering(p, nl) {
    var res = [];
    for (var i = 0; i < p.childElementCount; i++) {
      if (nl.indexOf(p.childNodes[i]) > -1) {
        res.push(p.childNodes[i]);
      }
    }
    return res;
  }
  static groupStartsAt(p, mt) {
    let i = 0;
    for (i = 0; i < p.childElementCount; i++) {
      if (p.childNodes[i] == mt) {
        return i;
      }
    }
    return i;
  }
  // use to be 0.5 overlap but it was too slow
  // there may be case which will miss
  // this comparision is quite slow.
  static onTopOfBy(p, mt, factor, n, list) {
    n = Math.max(0, n);
    _Layer.drawInOffscreen(mt, targetOffscreen);
    for (var i = n; i < p.childElementCount; i++) {
      var elem = p.childNodes[i];
      if (elem.getAttribute("stencil") == "yes") {
        continue;
      }
      if (elem.getAttribute("fixed") == "yes") {
        continue;
      }
      if (elem.nodeName == "clipPath") {
        continue;
      }
      if (elem.nodeName == "image") {
        continue;
      }
      if (elem.id.indexOf("group_image_") > -1) {
        continue;
      }
      if (list.indexOf(elem) > -1) {
        continue;
      }
      var overlap = _Layer.overlapBox(mt, elem);
      if (overlap == 1) {
        var touched = _Layer.verifyCollision(mt, elem);
        if (!touched) {
          continue;
        }
        list = list.concat(_Layer.getRelated(elem));
        continue;
      }
      var checkThis = overlap > factor || overlap > 0.34 && SVGTools.getArea(elem) / SVGTools.getArea(mt) < 0.1;
      if (checkThis) {
        let touched2 = _Layer.verifyCollision(mt, elem);
        if (!touched2) {
          continue;
        }
        if (list.indexOf(elem) < 0) {
          list = list.concat(_Layer.getRelated(elem));
        }
        _Layer.onTopOfBy(p, elem, factor, i, list);
        _Layer.drawInOffscreen(mt, targetOffscreen);
      }
    }
    return list;
  }
  static addFromBelow(p, mt, n, list) {
    n = Math.min(p.childElementCount, n);
    for (var i = 0; i < n; i++) {
      var elem = p.childNodes[i];
      if (elem.getAttribute("stencil") == "yes") {
        continue;
      }
      if (elem.getAttribute("fixed") == "yes") {
        continue;
      }
      if (elem.nodeName == "clipPath") {
        continue;
      }
      if (elem.nodeName == "image") {
        continue;
      }
      if (list.indexOf(elem) > -1) {
        continue;
      }
      if (elem.getAttribute("fill") != "none") {
        continue;
      }
      if (_Layer.overlapBox(mt, elem) > 0.5) {
        if (list.indexOf(elem) < 0) {
          list = list.concat(_Layer.getRelated(elem));
        }
      }
    }
    return list;
  }
  static getRelated(elem) {
    var res = [];
    if (elem.id.indexOf("pathborder_image") > -1) {
      var imageid = elem.id.substring(String("pathborder_").length, elem.id.length);
      var group = gn("group_" + imageid);
      if (group) {
        res.push(group);
      } else {
        var img = SVGImage.getImage(elem);
        if (img) {
          res.push(img);
        }
        var clip = SVGImage.getPathMask(elem);
        if (clip) {
          res.push(clip);
        }
      }
    }
    res.push(elem);
    return res;
  }
  static inContactWith(p, mt, factor, n) {
    var res = [];
    for (var i = n; i < p.childElementCount; i++) {
      var elem = p.childNodes[i];
      if (elem.id == mt.id) {
        continue;
      }
      if (elem.getAttribute("stencil") == "yes") {
        continue;
      }
      if (_Layer.overlapBox(mt, elem) > 0) {
        res.push(elem);
      }
    }
    return res;
  }
  static includesBox(e1, e2) {
    var box1 = SVGTools.getBox(e1);
    var box2 = SVGTools.getBox(e2);
    if (box2.width * box2.height > box1.width * box1.height) {
      return false;
    }
    var boxi = box1.intersection(box2);
    if (boxi.isEmpty()) {
      return 0;
    }
    if (boxi.isEqual(box2)) {
      return 1;
    }
    if (boxi.isEqual(box1)) {
      return 1;
    }
    return boxi.width * boxi.height / (box2.width * box2.height) == 1;
  }
  static getContainedMost(p, elem, max, factor) {
    p = elem.parentNode;
    for (var i = 0; i < max; i++) {
      var node = p.childNodes[i];
      if (node.id == elem.id) {
        continue;
      }
      if (_Layer.overlapBoxBy(elem, node, factor)) {
        return i;
      }
    }
    return null;
  }
  static overlapBox(e1, e2) {
    var box1 = SVGTools.getBox(e1);
    var box2 = SVGTools.getBox(e2);
    if (e1.nodeName != "g" && e2.nodeName != "g") {
      var contatctPoints = Path.getPathCrossing(e2, e1);
      if (contatctPoints.length == 0 && box2.width * box2.height > box1.width * box1.height) {
        return 0;
      }
    }
    var boxi = box1.intersection(box2);
    if (boxi.isEmpty()) {
      return 0;
    }
    if (boxi.isEqual(box2)) {
      return 1;
    }
    return boxi.width * boxi.height / (box2.width * box2.height);
  }
  static insideMe(e1, e2) {
    var box1 = SVGTools.getBox(e1);
    var box2 = SVGTools.getBox(e2);
    var boxi = box1.intersection(box2);
    if (boxi.isEmpty()) {
      return false;
    }
    var contatctPoints = Path.getPathCrossing(e2, e1);
    if (contatctPoints.length == 0 && box2.width * box2.height > box1.width * box1.height) {
      return true;
    }
    return false;
  }
  static overlapBoxBy(e1, e2, percent) {
    return _Layer.overlapBox(e1, e2) >= percent;
  }
  static findUnderMe(mt) {
    var p = gn("layer1");
    var n = _Layer.groupStartsAt(p, mt);
    var group = [];
    var box = SVGTools.getBox(mt);
    for (var i = n - 1; i > -1; i--) {
      var elem = p.childNodes[i];
      if (elem.id == "staticbkg") {
        continue;
      }
      if (elem.id.indexOf("erasertemp") > -1) {
        continue;
      }
      var box2 = SVGTools.getBox(elem);
      if (!box.intersects(box2)) {
        continue;
      }
      group.push(elem);
    }
    return group;
  }
  static findGroup(mt) {
    var dt = ScratchJr.getTime();
    ScratchJr.log("findGroup start", dt, "sec");
    setCanvasSize(ScratchJr.workingCanvas, Paint.workspaceWidth, Paint.workspaceHeight);
    var list = _Layer.getRelated(mt);
    var index3 = _Layer.groupStartsAt(mt.parentNode, mt);
    var test = mt.getAttribute("fill") == "none" && SVG2Canvas.isCloseDPath(mt) && mt.id.indexOf("pathborder_image") < 0;
    list = test ? _Layer.addFromBelow(mt.parentNode, mt, index3, list) : list;
    var newlist = _Layer.onTopOfBy(mt.parentNode, mt, 0.5, index3, list);
    var g = _Layer.ordering(mt.parentNode, newlist);
    ScratchJr.log("findGroup end", ScratchJr.getTime() - dt, "sec");
    return g;
  }
  // using canvas because SVG is not good enough
  // revise in the future
  //offscreen
  static verifyCollision(spr, other) {
    var box = SVGTools.getBox(spr);
    var box2 = SVGTools.getBox(other);
    if (!box.intersects(box2)) {
      return false;
    }
    var rect = box.intersection(box2);
    if (rect.width == 0) {
      return false;
    }
    if (rect.height == 0) {
      return false;
    }
    rect.x = Math.floor(rect.x);
    rect.y = Math.floor(rect.y);
    rect.width = Math.floor(rect.width) + 2;
    rect.height = Math.floor(rect.height) + 2;
    _Layer.drawInOffscreen(other, offscreen);
    setCanvasSize(ScratchJr.workingCanvas, Paint.workspaceWidth, Paint.workspaceHeight);
    var ctx = ScratchJr.workingCanvas.getContext("2d");
    ctx.clearRect(0, 0, Paint.workspaceWidth, Paint.workspaceHeight);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(offscreen, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(targetOffscreen, 0, 0);
    ctx.restore();
    var pixels = ctx.getImageData(rect.x, rect.y, rect.width, rect.height).data;
    var max = Math.floor(pixels.length / 4);
    for (var i = 0; i < max; i++) {
      var pt = {
        x: i % rect.width,
        y: Math.floor(i / rect.width)
      };
      if (!_Layer.isTransparent(pixels, pt, rect.width)) {
        return true;
      }
    }
    return false;
  }
  static drawInOffscreen(spr, cnv) {
    var ctx = cnv.getContext("2d");
    setCanvasSize(cnv, Paint.workspaceWidth, Paint.workspaceHeight);
    ctx.clearRect(0, 0, Paint.workspaceWidth, Paint.workspaceHeight);
    var lw = spr.getAttribute("stroke-width");
    ctx.save();
    _Layer.drawInContext(spr, ctx, 1, lw, false);
    ctx.restore();
  }
  static isTransparent(data, node, w) {
    var dx = node.x;
    var dy = node.y;
    return data[dx * 4 + dy * w * 4 + 3] == 0;
  }
  static drawInContext(elem, ctx, zoom, lw, isTip) {
    var rot = Transform.extract(elem, 4);
    if (rot.angle != 0) {
      _Layer.rotateFromCenter(ctx, elem, rot.angle);
    }
    ctx.scale(zoom, zoom);
    ctx.fillStyle = isTip && !SVG2Canvas.isCloseDPath(elem) || elem.tagName == "image" ? "#ff00FF" : Path.endDotColor;
    ctx.lineWidth = Number(lw);
    ctx.strokeStyle = "#ff00FF";
    if (!elem.getAttribute("fill") && !elem.getAttribute("stroke")) {
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = "#ff00FF";
    }
    switch (elem.tagName) {
      case "path":
        if (isTip && !SVG2Canvas.isCloseDPath(elem)) {
          if (Paint.mode != "path") {
            SVG2Canvas.renderPath(elem, ctx);
          }
          SVG2Canvas.renderPathTips(elem, ctx);
        } else {
          SVG2Canvas.renderPath(elem, ctx);
        }
        break;
      case "g":
        for (var i = 0; i < elem.childElementCount; i++) {
          ctx.restore();
          ctx.save();
          _Layer.drawInContext(elem.childNodes[i], ctx, zoom, lw, isTip);
          ctx.restore();
          ctx.save();
        }
        break;
      default:
        SVG2Canvas.processXMLnode(elem, ctx, true);
        break;
    }
  }
  static rotateFromCenter(ctx, group, angle) {
    var box = SVGTools.getBoxCenter(group);
    ctx.translate(box.x, box.y);
    ctx.rotate(angle * DEGTOR);
    ctx.translate(-box.x, -box.y);
  }
  /////////////////////////////
  //   Debugging hit masks
  /////////////////////////////
  static showmask() {
    var mask = newDiv(Paint.frame, 0, 0, ScratchJr.workingCanvas.width, ScratchJr.workingCanvas.height, {
      position: "absolute",
      zIndex: 2e5,
      visibility: "visible"
    });
    mask.setAttribute("id", "layermask");
    mask.appendChild(ScratchJr.workingCanvas);
  }
  static on() {
    gn("layermask").style.visibility = "visible";
  }
  static off() {
    gn("layermask").style.visibility = "hidden";
  }
};

// src/app/src/geom/Rectangle.ts
var Rectangle = class _Rectangle {
  x;
  y;
  width;
  height;
  // assigned transiently inside union() — kept optional so the class shape stays readable
  extentsw;
  extentsh;
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
  hitRect(pt) {
    const x = pt.x;
    const y = pt.y;
    if (x < this.x) return false;
    if (x > this.x + this.width) return false;
    if (y < this.y) return false;
    if (y > this.y + this.height) return false;
    return true;
  }
  intersects(r) {
    const x0 = Math.max(this.x, r.x);
    const x1 = Math.min(this.x + this.width, r.x + r.width);
    if (x0 <= x1) {
      const y0 = Math.max(this.y, r.y);
      const y1 = Math.min(this.y + this.height, r.y + r.height);
      if (y0 <= y1) return true;
    }
    return false;
  }
  overlapElemBy(box2, percent) {
    return this.overlapElem(box2) >= percent;
  }
  overlapElem(box2) {
    const boxi = this.intersection(box2);
    if (boxi.isEmpty()) return 0;
    if (boxi.isEqual(box2)) return 1;
    if (boxi.isEqual(this)) return 1;
    return boxi.width * boxi.height / (box2.width * box2.height);
  }
  intersection(box2) {
    const dx = Math.max(this.x, box2.x);
    const dw = Math.min(this.x + this.width, box2.x + box2.width);
    if (dx <= dw) {
      const dy = Math.max(this.y, box2.y);
      const dh = Math.min(this.y + this.height, box2.y + box2.height);
      if (dy > dh) return new _Rectangle(0, 0, 0, 0);
      return new _Rectangle(dx, dy, dw - dx, dh - dy);
    }
    return new _Rectangle(0, 0, 0, 0);
  }
  union(box2) {
    const box = new _Rectangle(0, 0, 0, 0);
    box.x = this.x < box2.x ? this.x : box2.x;
    box.y = this.y < box2.y ? this.y : box2.y;
    this.extentsw = this.x == 9999999 ? 0 : this.x + this.width;
    this.extentsh = this.y == 9999999 ? 0 : this.y + this.height;
    box2.extentsw = box2.x == 9999999 ? 0 : box2.x + box2.width;
    box2.extentsh = box2.y == 9999999 ? 0 : box2.y + box2.height;
    box.width = this.extentsw > box2.extentsw ? this.extentsw : box2.extentsw;
    box.height = this.extentsh > box2.extentsh ? this.extentsh : box2.extentsh;
    box.width -= box.x;
    box.height -= box.y;
    if (box.isEmpty()) {
      return new _Rectangle(9999999, 9999999, 0, 0);
    }
    return box;
  }
  expandBy(sw) {
    this.x -= sw / 2;
    this.y -= sw / 2;
    this.width += sw;
    this.height += sw;
    return this;
  }
  crop(box) {
    if (this.x < box.x) this.x = box.x;
    if (this.y < box.y) this.y = box.y;
    if (this.width + this.x > box.width + box.x) {
      this.width += box.width + box.x - (this.width + this.x);
    }
    if (this.height + this.y > box.height + box.y) {
      this.height += box.height + box.y - (this.height + this.y);
    }
  }
  getArea() {
    return this.width * this.height;
  }
  rounded() {
    return new _Rectangle(
      Math.floor(this.x),
      Math.floor(this.y),
      Math.round(this.width) + 1,
      Math.round(this.height) + 1
    );
  }
  isEqual(box2) {
    return this.x == box2.x && this.y == box2.y && this.width == box2.width && this.height == box2.height;
  }
  isEmpty() {
    return this.x == 0 && this.y == 0 && this.width == 0 && this.height == 0;
  }
  scale(sx, sy) {
    this.x *= sx;
    this.y *= sy;
    this.width *= sx;
    this.height *= sy;
  }
};

// src/app/src/painteditor/SVGImage.ts
var SVGImage = class _SVGImage {
  static currentshape;
  static addCameraFill(mt, str) {
    if (mt.getAttribute("relatedto")) {
      Path.breakRelationship(mt, mt.getAttribute("relatedto"));
    }
    var mtimage = _SVGImage.getImage(mt);
    if (mtimage) {
      _SVGImage.removeClip(mtimage, true);
      mt.setAttribute("id", getIdFor(mt.nodeName));
    }
    _SVGImage.createImageFromFeed(mt, str);
  }
  static replaceImage(img, str) {
    img.setAttributeNS(Paint.xmlnslink, "xlink:href", "data:image/png;base64," + str);
  }
  static createImageFromFeed(mt, str) {
    var p = mt.parentNode;
    var isbkg = mt.id == "staticbkg";
    var index3 = Layer.groupStartsAt(p, mt);
    var group = Layer.onTopOf(p, index3);
    var viewbox = SVGTools.getBox(mt).rounded();
    var box = new Rectangle(0, 0, Paint.workspaceWidth, Paint.workspaceHeight);
    viewbox = viewbox.expandBy(20);
    viewbox.crop(box);
    var imageid = getIdForCamera("image");
    if (isbkg) {
      imageid += "staticbkg";
    }
    var g = SVGTools.createGroup(p, "group_" + imageid);
    var pathmask = SVGTools.getCopy(mt);
    var maskattr = {
      "id": "pathmask_" + imageid
    };
    for (var val in maskattr) {
      pathmask.setAttribute(val, maskattr[val]);
    }
    var clippath = SVGTools.addChild(g, "clipPath", {
      id: "clip_" + imageid,
      clipPathUnits: "userSpaceOnUse"
    });
    clippath.appendChild(pathmask);
    var img = document.createElementNS(Paint.xmlns, "image");
    var attr = {
      "x": viewbox.x,
      "y": viewbox.y,
      "width": viewbox.width,
      "height": viewbox.height,
      "id": imageid
    };
    for (var vl1 in attr) {
      img.setAttribute(vl1, String(attr[vl1]));
    }
    img.setAttributeNS(Paint.xmlnslink, "xlink:href", "data:image/png;base64," + str);
    img.setAttribute("clip-path", "url(#clip_" + imageid + ")");
    g.appendChild(img);
    var borderattr = {
      "id": "pathborder_" + imageid,
      fill: "none"
    };
    for (var vl2 in borderattr) {
      mt.setAttribute(vl2, borderattr[vl2]);
    }
    for (var i = 0; i < group.length; i++) {
      p.appendChild(group[i]);
    }
  }
  //////////////////////
  // Actions on Images
  ///////////////////////
  static removeClip(img, keepmt) {
    var imageid = img.getAttribute("id");
    var isbkg = imageid.indexOf("staticbkg") > -1;
    var clip = gn("clip_" + imageid);
    var group = gn("group_" + imageid);
    var pathborder = gn("pathborder_" + imageid);
    if (isbkg && !keepmt) {
      var path = clip.childNodes[0];
      path.id = "staticbkg";
      gn("layer1").appendChild(path);
    } else {
      if (group) {
        group.parentNode.removeChild(group);
      } else {
        if (clip) {
          clip.parentNode.removeChild(clip);
        }
        img.parentNode.removeChild(img);
      }
    }
    if (pathborder && !keepmt) {
      pathborder.parentNode.removeChild(pathborder);
    }
  }
  static paint(img) {
    var imageid = img.getAttribute("id");
    var isbkg = img.id.indexOf("staticbkg") > -1;
    var pathborder = gn("pathborder_" + imageid);
    pathborder.setAttribute("id", isbkg ? "staticbkg" : getIdFor("path"));
    var clip = gn("clip_" + imageid);
    var group = gn("group_" + imageid);
    if (group) {
      group.parentNode.removeChild(group);
    } else {
      if (clip) {
        clip.parentNode.removeChild(clip);
      }
      img.parentNode.removeChild(img);
    }
    PaintAction.currentshape = pathborder;
  }
  static getImage(mt) {
    if (!mt) {
      return null;
    }
    if (mt.nodeName == "image") {
      return mt;
    }
    if (mt.nodeName == "g") {
      var str = mt.id;
      var elem = str.indexOf("group_image_") > -1 ? gn(str.substr(6, str.length)) : null;
      return !elem ? null : elem.tagName == "image" ? elem : null;
    }
    if (mt.id.indexOf("pathborder_image") < 0 && mt.id.indexOf("pathmask_image") < 0) {
      return null;
    }
    var imageid = mt.id.indexOf("pathborder_image") < 0 ? mt.id.substring(String("pathmask_").length, mt.id.length) : mt.id.substring(String("pathborder_").length, mt.id.length);
    return gn(imageid);
  }
  static getPathMask(mt) {
    if (mt.id.indexOf("pathborder_image") < 0) {
      return null;
    }
    var imageid = mt.id.substring(String("pathborder_").length, mt.id.length);
    return gn("pathmask_" + imageid);
  }
  static getPathBorder(mt) {
    if (mt.id.indexOf("image_") == 0) {
      return gn("pathborder_" + mt.id);
    }
    if (mt.id.indexOf("pathmask_") > -1) {
      var imageid = mt.id.substring(String("pathmask_").length, mt.id.length);
      return gn("pathborder_" + imageid);
    }
    return mt;
  }
  ///////////////////////
  // Cloning
  ///////////////////////
  static cloneImage(p, elem) {
    var img = _SVGImage.getClonedImage(elem);
    var imageid = img.id;
    var dataurl = elem.getAttribute("xlink:href");
    var html5img = document.createElement("img");
    html5img.src = dataurl;
    if (!html5img.complete) {
      html5img.onload = function() {
        renderImage(img);
      };
    } else {
      renderImage(img);
    }
    function renderImage(img2) {
      var cnv = document.createElement("canvas");
      setCanvasSize(cnv, Number(img2.getAttribute("width")), Number(img2.getAttribute("height")));
      var ctx = cnv.getContext("2d");
      ctx.drawImage(html5img, 0, 0);
      var imgdata = cnv.toDataURL("image/png");
      img2.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imgdata);
    }
    var pathmask = SVGTools.getCopy(gn("pathmask_" + elem.id));
    var maskattr = {
      "id": "pathmask_" + imageid
    };
    for (var val in maskattr) {
      pathmask.setAttribute(val, maskattr[val]);
    }
    var g = SVGTools.createGroup(p, "group_" + imageid);
    var clippath = SVGTools.addChild(g, "clipPath", {
      id: "clip_" + imageid,
      clipPathUnits: "userSpaceOnUse"
    });
    clippath.appendChild(pathmask);
    img.setAttribute("clip-path", "url(#clip_" + imageid + ")");
    g.appendChild(img);
    var pathborder = SVGTools.getCopy(gn("pathborder_" + elem.id));
    var borderattr = {
      "id": "pathborder_" + imageid
    };
    for (var vl in borderattr) {
      pathborder.setAttribute(vl, borderattr[vl]);
    }
    p.appendChild(pathborder);
    Transform.translateTo(img, window.xform);
    Transform.translateTo(pathmask, window.xform);
    Transform.translateTo(pathborder, window.xform);
    return img;
  }
  static getClonedImage(elem) {
    var attr = SVGTools.attributeTable[elem.tagName];
    var shape = document.createElementNS(Paint.xmlns, elem.tagName);
    for (var i = 0; i < attr.length; i++) {
      shape.setAttribute(attr[i], elem.getAttribute(attr[i]));
    }
    var imageid = getIdForCamera("image");
    shape.setAttribute("id", imageid);
    var ang = Transform.getRotationAngle(elem);
    if (ang != 0) {
      Transform.applyRotation(shape, ang);
    }
    return shape;
  }
  //////////////////////////////
  // Path edditing
  /////////////////////////////
  static rotatePointsOf(shape) {
    var elem = _SVGImage.getImage(shape);
    var mask = _SVGImage.getPathMask(shape);
    if (!mask) {
      return;
    }
    var angle = Transform.getRotationAngle(elem);
    mask.setAttributeNS(null, "d", shape.getAttribute("d"));
    if (angle == 0) {
      return;
    }
    var center = SVGTools.getBoxCenter(elem);
    var rot = Paint.root.createSVGTransform();
    rot.setRotate(-angle, center.x, center.y);
    Transform.rotateFromPoint(rot, mask);
  }
};

// src/app/src/utils/Events.ts
var dragged = false;
var dragthumbnail = null;
var dragmousex = 0;
var dragmousey = 0;
var timeoutEvent;
var dragcanvas = null;
var dragDiv;
var fcnstart;
var fcnend;
var updatefcn;
var fcnclick;
var scaleStartsAt = 1;
var delta = 10;
var pinchcenter = {
  x: 0,
  y: 0,
  distance: 0
};
var lastZoomScale = 1;
var Events = class _Events {
  // Getters/setters for globally used properties
  static get dragged() {
    return dragged;
  }
  static set dragged(newDragged) {
    dragged = newDragged;
  }
  static get dragthumbnail() {
    return dragthumbnail;
  }
  static set dragthumbnail(newDragthumbnail) {
    dragthumbnail = newDragthumbnail;
  }
  static get dragmousex() {
    return dragmousex;
  }
  static set dragmousex(newDragmousex) {
    dragmousex = newDragmousex;
  }
  static get dragmousey() {
    return dragmousey;
  }
  static set dragmousey(newDragmousey) {
    dragmousey = newDragmousey;
  }
  static get timeoutEvent() {
    return timeoutEvent;
  }
  static set timeoutEvent(newTimeoutEvent) {
    timeoutEvent = newTimeoutEvent;
  }
  static get dragcanvas() {
    return dragcanvas;
  }
  static set dragcanvas(newDragcanvas) {
    dragcanvas = newDragcanvas;
  }
  static get dragDiv() {
    return dragDiv;
  }
  static get scaleStartsAt() {
    return scaleStartsAt;
  }
  static set scaleStartsAt(newScaleStartsAt) {
    scaleStartsAt = newScaleStartsAt;
  }
  static get pinchcenter() {
    return pinchcenter;
  }
  // Instead of popping the dragging block, etc to the outer-most frame,
  // which causes delays while the content is reflowed, we create a
  // small drag div that is a parent of frame that the dragging block
  // can be a child of. This improves dragging performance.
  static init() {
    dragDiv = document.createElement("div");
    dragDiv.id = "dragDiv";
    dragDiv.style.position = "absolute";
    dragDiv.style.width = "0px";
    dragDiv.style.height = "0px";
    dragDiv.style.zIndex = "7001";
    var frameDiv = gn("frame");
    frameDiv.appendChild(dragDiv);
    window.addEventListener("blur", function() {
      if (dragged || dragthumbnail) {
        _Events.cancelAll();
      }
    });
  }
  static startDrag(e, c, atstart, atend, atdrag, atclick, athold) {
    dragged = false;
    var pt = _Events.getTargetPoint(e);
    dragmousex = pt.x;
    dragmousey = pt.y;
    dragthumbnail = c;
    fcnstart = atstart;
    fcnend = atend;
    fcnclick = atclick;
    if (athold) {
      _Events.holdit(c, athold);
    }
    updatefcn = atdrag;
    if (isTouch) {
      delta = 10 * scaleMultiplier;
      window.onmousemove = function(evt) {
        _Events.mouseMove(evt);
      };
      window.onmouseup = function(evt) {
        _Events.mouseUp(evt);
      };
      window.ontouchleave = function(evt) {
        _Events.mouseUp(evt);
      };
      window.ontouchcancel = function(evt) {
        _Events.mouseUp(evt);
      };
    } else {
      delta = 7;
      window.onmousemove = function(evt) {
        _Events.mouseMove(evt);
      };
      window.onmouseup = function(evt) {
        _Events.mouseUp(evt);
      };
    }
  }
  static holdit(c, fcn) {
    var repeat = function() {
      _Events.clearEvents();
      fcn(dragthumbnail);
      _Events.clearDragAndDrop();
    };
    timeoutEvent = setTimeout(repeat, 500);
  }
  static clearDragAndDrop() {
    timeoutEvent = void 0;
    dragcanvas = null;
    dragged = false;
    dragthumbnail = null;
    fcnstart = void 0;
    fcnend = void 0;
    updatefcn = void 0;
    fcnclick = void 0;
  }
  static mouseMove(e) {
    var pt = _Events.getTargetPoint(e);
    if (!dragged && _Events.distance(dragmousex - pt.x, dragmousey - pt.y) < delta) {
      return;
    }
    clearTimeout(timeoutEvent);
    timeoutEvent = void 0;
    if (!dragged) {
      try {
        fcnstart(e);
      } catch (err) {
        console.error("Events.mouseMove: fcnstart failed", err);
        _Events.clearDragAndDrop();
        return;
      }
    }
    dragged = true;
    if (updatefcn) {
      updatefcn(e, dragcanvas);
    }
    dragmousex = pt.x;
    dragmousey = pt.y;
  }
  static distance(dx, dy) {
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }
  static mouseUp(e) {
    clearTimeout(timeoutEvent);
    timeoutEvent = void 0;
    _Events.clearEvents();
    try {
      if (!dragged) {
        _Events.itIsAClick(e);
      } else {
        _Events.performMouseUpAction(e);
      }
    } catch (err) {
      console.error("Events.mouseUp: handler failed", err);
    }
    _Events.clearDragAndDrop();
  }
  static cancelAll() {
    clearTimeout(timeoutEvent);
    timeoutEvent = void 0;
    _Events.clearEvents();
  }
  static clearEvents() {
    if (isTouch) {
      window.onmousemove = null;
      window.onmouseup = null;
    } else {
      window.onmousemove = function(e) {
        e.preventDefault();
      };
      window.onmouseup = null;
    }
  }
  static performMouseUpAction(e) {
    if (fcnend) {
      fcnend(e, dragcanvas);
    }
  }
  static itIsAClick(e) {
    if (fcnclick) {
      fcnclick(e, dragthumbnail);
    }
  }
  static moveThumbnail(el, dx, dy) {
    if (!el) {
      return;
    }
    el.top = el.top + dy;
    el.left = el.left + dx;
    el.style.top = el.top + "px";
    el.style.left = el.left + "px";
  }
  static move3D(el, dx, dy) {
    if (!el) {
      return;
    }
    var mtx = new WebKitCSSMatrix(window.getComputedStyle(el).webkitTransform);
    el.top = dy + mtx.m42;
    el.left = dx + mtx.m41;
    el.style.webkitTransform = "translate3d(" + el.left + "px," + el.top + "px, 0)";
  }
  /*
  .m41 – corresponds to the ‘x’ value of a WebKitCSSMatrix
  .m42 – corresponds to the ‘y’ value of a WebKitCSSMatrix
  
  
  The clientX read-only property of the MouseEvent interface provides the horizontal 
  coordinate within the application's client area at which the event occurred 
  (as opposed to the coordinates within the page). 
  
  For example, clicking in the top-left corner of the client area will always 
  result in a mouse event with a clientX value of 0, regardless of whether the 
  page is scrolled horizontally.
  */
  static getTargetPoint(e) {
    const te = e;
    if (isTouch) {
      if (te.touches && te.touches.length > 0) {
        return {
          x: te.touches[0].pageX,
          y: te.touches[0].pageY
        };
      } else if (te.changedTouches) {
        return {
          x: te.changedTouches[0].pageX,
          y: te.changedTouches[0].pageY
        };
      }
    }
    const me = e;
    return {
      x: me.clientX,
      y: me.clientY
    };
  }
  static updatePinchCenter(e) {
    const te = e;
    if (te.touches.length != 2) {
      return;
    }
    var x1 = te.touches[0].clientX, y1 = te.touches[0].clientY;
    var x2 = te.touches[1].clientX, y2 = te.touches[1].clientY;
    var cx = x1 + (x2 - x1) / 2, cy = y1 + (y2 - y1) / 2;
    var d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    pinchcenter = {
      x: cx,
      y: cy,
      distance: d
    };
  }
  static zoomScale(e) {
    const te = e;
    if (te.touches.length !== 2) {
      return lastZoomScale;
    }
    var x1 = te.touches[0].clientX, y1 = te.touches[0].clientY;
    var x2 = te.touches[1].clientX, y2 = te.touches[1].clientY;
    var d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    lastZoomScale = d / pinchcenter.distance;
    return lastZoomScale;
  }
};

// src/app/src/painteditor/Path.ts
var lineDotColor = "white";
var curveDotColor = "#009eff";
var endDotColor = "#ffaa00";
var selectedDotColor = "lime";
var selector = null;
var dotsize = 6;
var idotsize = 10;
var Path = class _Path {
  // Getters/setters for globally used properties
  static get endDotColor() {
    return endDotColor;
  }
  static get selectedDotColor() {
    return selectedDotColor;
  }
  static get selector() {
    return selector;
  }
  static process(shape) {
    var plist = _Path.getPolyPoints(shape);
    var firstpoint = plist[0];
    plist = _Path.addPoints(plist);
    plist = _Path.smoothPoints(plist);
    plist.unshift(firstpoint);
    plist = _Path.addPoints(plist);
    plist = _Path.deletePoints(plist);
    var bezier = _Path.drawBezier(plist);
    shape.parentNode.removeChild(shape);
    return bezier;
  }
  static getPolyPoints(shape) {
    var points = shape.points;
    var pp = [];
    for (var i = 0; i < points.numberOfItems; i++) {
      pp.push(points.getItem(i));
    }
    return pp;
  }
  static smoothPoints(points) {
    var n = points.length;
    var plist = [];
    var interval3 = 3;
    var i;
    for (i = 0; i < n - 1; i++) {
      var ax = 0;
      var ay = 0;
      for (var j = -interval3; j <= interval3; j++) {
        var nj = Math.max(0, i + j);
        nj = Math.min(nj, n - 1);
        ax += points[nj].x;
        ay += points[nj].y;
      }
      ax /= interval3 * 2 + 1;
      ay /= interval3 * 2 + 1;
      plist.push({
        x: ax,
        y: ay
      });
    }
    plist.push(points[n - 1]);
    return plist;
  }
  static addPoints(points) {
    var it = 0;
    var b = true;
    var result;
    while (b) {
      result = _Path.fillWithPoints(points);
      b = result[0];
      it++;
      if (it > 10) {
        return result[1];
      }
    }
    return result[1];
  }
  static fillWithPoints(points) {
    var n = points.length;
    var i = 1;
    var res = false;
    var plist = [points[0]];
    while (i < n - 1) {
      var here = points[i];
      var after = points[i + 1];
      var l2 = Vector.len(Vector.diff(after, here));
      plist.push(points[i]);
      if (l2 > 5) {
        var mp = Vector.mid(here, after);
        plist.push({
          x: mp.x,
          y: mp.y
        });
        res = true;
      }
      i++;
    }
    plist.push(points[n - 1]);
    return [res, plist];
  }
  static deletePoints(points) {
    var n = points.length;
    var i = 1;
    var j = 0;
    var plist = [];
    plist.push(points[0]);
    var dist = isTouch ? 40 : 30;
    var before, here, after;
    while (i < n - 1) {
      before = points[j];
      here = points[i];
      after = points[i + 1];
      var l1 = Vector.diff(before, here);
      var l2 = Vector.diff(after, here);
      var div = Vector.len(l1) * Vector.len(l2);
      if (div == 0) {
        div = 0.01;
      }
      var factor = Vector.dot(l1, l2) / div;
      if (factor > -0.9 || Vector.len(l2) > dist || Vector.len(l1) > dist) {
        plist.push(points[i]);
        j = i;
      }
      i++;
    }
    before = points[n - 2];
    here = points[n - 1];
    if (plist.length > 2 && Vector.len(Vector.diff(before, here)) < 3) {
      plist.pop();
    }
    plist.push(points[n - 1]);
    return plist;
  }
  static drawBezier(pointslist) {
    var first = pointslist[0];
    var shape = SVGTools.addPath(gn("layer1"), first.x, first.y);
    if (pointslist.length < 2) {
      return shape;
    }
    var d = _Path.getBezier(pointslist);
    shape.setAttributeNS(null, "d", d);
    return shape;
  }
  /////////////////////////////////////////////
  // Make a Bezier
  ////////////////////////////////////////////
  static getBezier(plist) {
    SVG2Canvas.lastcxy = plist[0];
    var lastpoint = plist[plist.length - 1];
    var d = "M" + SVG2Canvas.lastcxy.x + "," + SVG2Canvas.lastcxy.y;
    var str = "";
    if (plist.length < 3) {
      str = _Path.lineSeg(plist[1]);
    } else {
      var dist = Vector.len(Vector.diff(plist[0], lastpoint));
      var startpt = _Path.curveSeg(plist[0], plist[1], plist[2]);
      for (var i = 2; i < plist.length - 1; i++) {
        str += _Path.curveSeg(plist[i - 1], plist[i], plist[i + 1]);
      }
      if (dist == 0) {
        str += _Path.curveSeg(plist[plist.length - 2], lastpoint, plist[1]);
        startpt = _Path.curveSeg(plist[0], plist[1], plist[2]);
      } else {
        str += _Path.curveSeg(plist[plist.length - 2], lastpoint, lastpoint);
      }
      d += startpt;
    }
    d += str;
    return d;
  }
  static getControlPoint(before, here, after) {
    var l1 = Vector.len(Vector.diff(before, here));
    var l2 = Vector.len(Vector.diff(here, after));
    var l3 = Vector.len(Vector.diff(before, after));
    var l;
    if (l1 + l2 == 0) {
      l = 0;
    } else {
      l = l3 / (l1 + l2);
    }
    var min = Math.min(l1, l2);
    var beforev = Vector.diff(before, here);
    var afterv = Vector.diff(after, here);
    var bisect = Vector.sum(Vector.norm(beforev), Vector.norm(afterv));
    var perp = Vector.perp(bisect);
    if (Vector.dot(perp, afterv) < 0) {
      perp = Vector.neg(perp);
    }
    if (bisect.x == 0 || bisect.y == 0) {
      var kappa = (Math.sqrt(2) - 1) / 3 * 4;
      perp = Vector.norm(perp);
      var lx = Vector.dot(Vector.diff(here, before), perp);
      return Vector.diff(here, Vector.scale(perp, lx * kappa));
    }
    return Vector.diff(here, Vector.scale(perp, l * l * min * 0.666));
  }
  static curveSeg(before, here, after) {
    var c2 = _Path.getControlPoint(before, here, after);
    var c1 = Vector.sum(before, Vector.diff(before, SVG2Canvas.lastcxy));
    SVG2Canvas.lastcxy = c2;
    var pt = "C" + c1.x + "," + c1.y + "," + c2.x + "," + c2.y + "," + here.x + "," + here.y;
    return pt;
  }
  ////////////////////////////////////////////
  // Making a Rect
  ////////////////////////////////////////////
  static makeRectangle(p, pointslist) {
    var first = pointslist[0];
    var shape = SVGTools.addPath(p, first.x, first.y);
    var d = _Path.getRectangularD(pointslist);
    shape.setAttributeNS(null, "d", d);
    shape.setAttribute("fill", "none");
    return shape;
  }
  static getRectangularD(plist) {
    var first = plist[0];
    var d = "M" + first.x + "," + first.y;
    for (var i = 1; i < plist.length; i++) {
      d += _Path.lineSeg(plist[i]);
    }
    d += _Path.lineSeg(plist[0]);
    d += "z";
    return d;
  }
  static lineSeg(pt) {
    SVG2Canvas.lastcxy = pt;
    return "L" + pt.x + "," + pt.y;
  }
  static moveToCmd(pt) {
    SVG2Canvas.lastcxy = pt;
    return "M" + pt.x + "," + pt.y;
  }
  /////////////////////////
  // Polygon / Polyline
  /////////////////////////
  static convertPoints(shape) {
    var plist = _Path.getPolyPoints(shape);
    var d = "M" + plist[0].x + "," + plist[0].y;
    for (var i = 1; i < plist.length; i++) {
      d += _Path.lineSeg(plist[i]);
    }
    d += "z";
    var attr = _Path.getStylingFrom(shape);
    attr.d = d;
    attr.id = getIdFor("path");
    attr["stroke-miterlimit"] = shape.getAttribute("stroke-miterlimit");
    var path = SVGTools.addChild(gn("layer1"), "path", attr);
    shape.parentNode.removeChild(shape);
    return path;
  }
  static getStylingFrom(elem) {
    var c = elem.getAttribute("fill");
    var s = elem.getAttribute("stroke");
    var sw = elem.getAttribute("stroke-width");
    var attr = {
      "opacity": 1,
      "fill": c,
      "stroke": s,
      "stroke-width": sw
    };
    return attr;
  }
  ////////////////////////////////////////////
  //  Ellipse convertion to Path
  ////////////////////////////////////////////
  static makeEllipse(shape) {
    var rx = Number(shape.getAttribute("rx"));
    var ry = Number(shape.getAttribute("ry"));
    var cx = Number(shape.getAttribute("cx"));
    var cy = Number(shape.getAttribute("cy"));
    var kappa = (Math.sqrt(2) - 1) / 3 * 4;
    var d = [
      ["M", cx - rx, cy],
      ["C", cx - rx, cy - ry * kappa, cx - rx * kappa, cy - ry, cx, cy - ry],
      ["C", cx + rx * kappa, cy - ry, cx + rx, cy - ry * kappa, cx + rx, cy],
      ["C", cx + rx, cy + ry * kappa, cx + rx * kappa, cy + ry, cx, cy + ry],
      ["C", cx - rx * kappa, cy + ry, cx - rx, cy + ry * kappa, cx - rx, cy]
    ];
    var attr = _Path.getStylingFrom(shape);
    attr.d = SVG2Canvas.arrayToString(d);
    attr.id = getIdFor("path");
    attr["stroke-miterlimit"] = shape.getAttribute("stroke-miterlimit");
    var elem = SVGTools.addChild(gn("layer1"), "path", attr);
    return elem;
  }
  //////////////////////////////////////////////////////
  //  From D to point list with CMD type
  /////////////////////////////////////////////////////
  static getAnchorpoints(d) {
    var list = SVG2Canvas.getCommandList(d);
    var res = [];
    for (var i = 0; i < list.length; i++) {
      var cmd = SVG2Canvas.getAbsoluteCommand(list[i]);
      if (cmd[0] != "z") {
        res.push(SVG2Canvas.endp);
      }
    }
    return res;
  }
  static getPointsAndCmds(shape) {
    return _Path.getCommands(shape.getAttribute("d"));
  }
  static getCommands(path) {
    var list = SVG2Canvas.getCommandList(path);
    var res = [];
    var first;
    for (var i = 0; i < list.length; i++) {
      var cmd = SVG2Canvas.getAbsoluteCommand(list[i]);
      if (cmd[0].toLowerCase() == "m") {
        first = SVG2Canvas.endp;
      }
      if (cmd[0].toLowerCase() != "z") {
        res.push({
          cmd: cmd[0],
          pt: SVG2Canvas.endp
        });
      } else {
        res.push({
          cmd: cmd[0],
          pt: first
        });
      }
    }
    return res;
  }
  static getPointsForFirst(elem) {
    var paths = elem.getAttribute("d").match(/[M][^M]*/g);
    var d;
    if (!paths) {
      d = elem.getAttribute("d");
    } else {
      d = paths[0];
    }
    return _Path.getCommands(d);
  }
  //////////////////////////////////////////////////////
  //  From CMD points to Path D attribute
  /////////////////////////////////////////////////////
  static getDattribute(ptlist) {
    SVG2Canvas.lastcxy = ptlist[0].pt;
    var d = "M" + SVG2Canvas.lastcxy.x + "," + SVG2Canvas.lastcxy.y;
    var str = "";
    if (ptlist.length < 3) {
      return ptlist[1].cmd.toLowerCase() == "z" ? null : d + _Path.lineSeg(ptlist[1].pt);
    }
    Paint.skipNext = false;
    var startpt = _Path.thisCommand(ptlist, 1);
    var first = ptlist[1];
    var last = ptlist[ptlist.length - 1];
    var dist = Vector.len(Vector.diff(ptlist[0].pt, last.pt));
    var shapetype = first.cmd == "C" && last.cmd == "C" && dist == 0 ? "ellipse" : first.cmd == "C" && ptlist[ptlist.length - 2].cmd == "C" && last.cmd.toLowerCase() == "z" ? "closecurve" : first.cmd == "L" && ptlist[ptlist.length - 2].cmd == "L" && dist == 0 ? "polygon" : first.cmd == "C" && last.cmd == "C" ? "curve" : "line";
    for (var i = 2; i < ptlist.length - 1; i++) {
      str += _Path.thisCommand(ptlist, i);
    }
    switch (shapetype) {
      case "ellipse":
        str += _Path.curveSeg(ptlist[ptlist.length - 2].pt, last.pt, first.pt);
        startpt = _Path.curveSeg(ptlist[0].pt, first.pt, ptlist[2].pt);
        break;
      case "closecurve":
        str += "z";
        break;
      case "polygon":
        str += "z";
        break;
      case "curve":
        str += _Path.curveSeg(ptlist[ptlist.length - 2].pt, last.pt, last.pt);
        break;
      case "line":
        str += last.cmd.toLowerCase() == "z" ? "z" : _Path.lineSeg(last.pt);
        break;
      default:
        str += _Path.lineSeg(last.pt);
        break;
    }
    return d + startpt + str;
  }
  static thisCommand(ptlist, i) {
    var str;
    var kind = ptlist[i].cmd;
    var pt = ptlist[i].pt;
    if (Paint.skipNext) {
      Paint.skipNext = false;
      return "";
    }
    if (_Path.skipCmd(ptlist, i)) {
      return "";
    }
    switch (kind.toUpperCase()) {
      case "C":
      case "S":
        var ptbefore = ptlist[i - 1].pt;
        var ptafter = ptlist[i + 1].pt;
        str = _Path.curveSeg(ptbefore, pt, ptafter);
        break;
      case "Z":
        str = "Z";
        break;
      case "M":
        str = _Path.moveToCmd(pt);
        break;
      default:
        str = _Path.lineSeg(pt);
        break;
    }
    return str;
  }
  static skipCmd(ptlist, i) {
    var cmd1 = ptlist[i].cmd.toLowerCase();
    var cmd2 = ptlist[i + 1].cmd.toLowerCase();
    if (cmd1 == "m" && cmd2 == "m") {
      return true;
    }
    if (cmd1 == "m" && cmd2 == "z") {
      Paint.skipNext = true;
      return true;
    }
    return false;
  }
  // Originally PathEdit.js
  static maxDistance() {
    return 20 / Paint.currentZoom;
  }
  static importPath(elem) {
    var d = elem.getAttribute("d");
    var list = SVG2Canvas.getCommandList(d);
    var imported = _Path.adaptPath(list);
    var path = SVG2Canvas.arrayToString(imported);
    elem.setAttribute("d", path);
  }
  static adaptPath(list) {
    var res = [];
    var lastpt = {
      x: list[0][1],
      y: list[0][2]
    };
    var l;
    res.push(list[0]);
    for (var i = 1; i < list.length; i++) {
      var pts = list[i].concat();
      var cmd = pts.shift();
      switch (cmd.toLowerCase()) {
        case "h":
          lastpt = {
            x: pts[0],
            y: lastpt.y
          };
          res.push(["L", lastpt.x, lastpt.y]);
          break;
        case "v":
          lastpt = {
            x: lastpt.x,
            y: pts[0]
          };
          res.push(["L", lastpt.x, lastpt.y]);
          break;
        case "l":
          lastpt = {
            x: pts[0],
            y: pts[1]
          };
          res.push(["L", lastpt.x, lastpt.y]);
          break;
        case "c":
          l = pts.length;
          var nextpt = {
            x: pts[l - 2],
            y: pts[l - 1]
          };
          var thisPt = {
            x: pts[0],
            y: pts[1]
          };
          var diff = Math.floor(Vector.len(Vector.diff(lastpt, thisPt)));
          if (diff == 0) {
            res.push(["L", lastpt.x, lastpt.y]);
          }
          res.push(list[i]);
          var startAt = {
            x: pts[l - 4],
            y: pts[l - 3]
          };
          var diffend = Math.floor(Vector.len(Vector.diff(startAt, nextpt)));
          if (diffend == 0) {
            res.push(["L", nextpt.x, nextpt.y]);
          }
          lastpt = nextpt;
          break;
        case "z":
          res.push(list[i]);
          break;
        default:
          l = pts.length;
          lastpt = {
            x: pts[l - 2],
            y: pts[l - 1]
          };
          res.push(list[i]);
          break;
      }
    }
    return res;
  }
  /////////////////////////////////////////////////////////////
  // UI Management
  ////////////////////////////////////////////////////////////
  static showDots(shape) {
    Transform.applyToCmds(shape, Transform.combineAll(shape));
    Transform.eliminateAll(shape);
    var list = _Path.getPointsForFirst(shape);
    var g = gn("pathdots");
    if (g != null) {
      g.parentNode.removeChild(g);
    }
    g = document.createElementNS(Paint.xmlns, "g");
    g.setAttribute("style", "pointer-events:none");
    g.setAttribute("id", "pathdots");
    var p = document.getElementById("layer1").parentNode;
    p.appendChild(g);
    var plist = _Path.getPathDotsElem(g, list);
    for (var k = 0; k < plist.length; k++) {
      plist[k].setAttribute("parentid", shape.id);
    }
    shape.setAttribute("style", "pointer-events:visibleStroke;");
    var lastdot = plist[plist.length - 1];
    var iscurve = SVG2Canvas.curveoptions.indexOf(lastdot.getAttribute("cmd")) > -1;
    lastdot.setAttribute("fill", iscurve ? curveDotColor : lineDotColor);
    lastdot.setAttribute("opacity", "0.6");
    var first = _Path.getDotPoint(plist[0]);
    var lastpoint = _Path.getDotPoint(lastdot);
    var farilyclose = Vector.len(Vector.diff(lastpoint, first)) < 10 && lastdot.getAttribute("cmd") != "Z";
    if (farilyclose) {
      lastdot.setAttribute("fill", endDotColor);
    }
  }
  static getPathDotsElem(g, list) {
    var res = [];
    var first = null;
    var cp = null;
    var pt;
    var cmd;
    for (var j = 0; j < list.length - 1; j++) {
      pt = list[j].pt;
      cmd = list[j].cmd;
      if (cmd == "M") {
        first = pt;
      }
      cp = _Path.getDot(g, cmd, pt);
      res.push(cp);
      cp.onmouseover = function(evt) {
        _Path.highlightDot(evt);
      };
      cp.onmouseout = function(evt) {
        _Path.unhighlightDot(evt);
      };
    }
    var last = list[list.length - 1];
    pt = last.pt;
    cmd = last.cmd;
    var prev = list[list.length - 2];
    if (cmd.toLowerCase() != "z" && Vector.len(Vector.diff(first, pt)) == 0) {
      cmd = "x";
      cp = _Path.getDot(g, cmd, pt);
      cp.style.visibility = "hidden";
    } else {
      if (Vector.len(Vector.diff(first, pt)) == 0 && cmd.toLowerCase() == "z" && Vector.len(Vector.diff(first, prev.pt)) == 0) {
        cp.setAttribute("cmd", "x");
        cp.style.visibility = "hidden";
      } else {
        if (cmd.toLowerCase() == "z") {
          cmd = prev.cmd == "C" ? "C" : "L";
        }
        cp = _Path.getDot(g, cmd, pt);
      }
    }
    res.push(cp);
    cp.onmouseover = function(evt) {
      _Path.highlightDot(evt);
    };
    cp.onmouseout = function(evt) {
      _Path.unhighlightDot(evt);
    };
    return res;
  }
  static reshape(shape) {
    var list = _Path.getDotsCoodinates(shape);
    var cmds = _Path.getPointsForFirst(shape);
    var dist = Vector.len(Vector.diff(list[0].pt, list[list.length - 1].pt));
    var valid = list[list.length - 1].cmd.toLowerCase() != "x";
    var res = [];
    for (var i = 0; i < cmds.length; i++) {
      if (list.length == 0) {
        res.push(cmds[i]);
      } else {
        if (list[0].cmd.toLowerCase() == "x") {
          list[0].cmd = cmds[i].cmd;
          list[0].pt = res[0].pt;
        }
        res.push(list[0]);
        list.shift();
      }
    }
    if (valid) {
      if (dist < 10 && res.length > 3) {
        res[res.length - 1].cmd = "z";
        res[0].pt = {
          x: res[res.length - 1].pt.x,
          y: res[res.length - 1].pt.y
        };
      } else {
        res[res.length - 1].cmd = res[1].cmd == "L" ? "L" : "C";
      }
    }
    var d = _Path.getDattribute(res);
    if (SVG2Canvas.isCompoundPath(shape)) {
      var paths = shape.getAttribute("d").match(/[M][^M]*/g);
      for (var j = 1; j < paths.length; j++) {
        d += paths[j];
      }
    }
    shape.setAttributeNS(null, "d", d);
    if (SVGImage.getImage(shape)) {
      SVGImage.rotatePointsOf(shape);
    }
  }
  static getDotColor(shape, dot) {
    var cmds = _Path.getPointsForFirst(shape);
    var indx = _Path.getDotPos(dot);
    if (indx < 0) {
      return curveDotColor;
    }
    if (indx >= cmds.length - 1) {
      return endDotColor;
    }
    var cmd = cmds[indx].cmd;
    var iscurve = SVG2Canvas.curveoptions.indexOf(cmd) > -1;
    return iscurve ? curveDotColor : lineDotColor;
  }
  static getDotPos(dot) {
    var arr = dot.id.split(" ");
    if (arr.length < 2) {
      return -1;
    }
    if (arr[0] != "grab") {
      return -1;
    }
    return Number(arr[1]) - 1;
  }
  static getDotPoint(dot) {
    var rot = Transform.extract(gn(dot.getAttribute("parentid")), 4);
    var mtx = Transform.getCombinedMatrices(gn(dot.getAttribute("parentid")));
    var pt = Transform.point(Number(dot.getAttribute("cx")), Number(dot.getAttribute("cy")), mtx.inverse());
    pt = Transform.point(pt.x, pt.y, rot.matrix.inverse());
    return pt;
  }
  static getDot(g, cmd, pt) {
    cmd = cmd.toUpperCase();
    var iscurve = SVG2Canvas.curveoptions.indexOf(cmd) > -1;
    var radius = Math.floor((isTouch ? idotsize : dotsize) / Paint.currentZoom) + 1;
    var skip = cmd == "Z";
    var cp = SVGTools.addChild(g, "circle", {
      "id": getIdFor("grab"),
      "fill": iscurve ? curveDotColor : lineDotColor,
      "r": radius,
      "stroke": skip ? "none" : "#064268",
      "stroke-width": 1,
      "pointer-events": skip ? "none" : "all",
      opacity: skip ? 0 : 0.8
    });
    cp.setAttributeNS(null, "cx", String(pt.x));
    cp.setAttributeNS(null, "cy", String(pt.y));
    cp.setAttribute("cmd", cmd);
    return cp;
  }
  static highlightDot(e) {
    var shape = e.target;
    shape.setAttribute("fill", "#00ffff");
    shape.setAttribute("opacity", String(1));
  }
  static unhighlightDot(e) {
    var shape = e.target;
    if (!shape) {
      return;
    }
    var isbez = SVG2Canvas.curveoptions.indexOf(shape.getAttribute("cmd")) > -1;
    shape.setAttribute("fill", isbez ? curveDotColor : lineDotColor);
    shape.setAttribute("opacity", String(0.6));
  }
  static hideDots(shape) {
    if (shape) {
      shape.setAttribute("style", "pointer-events:visiblePainted;");
    }
    var g = gn("pathdots");
    if (!g) {
      return;
    }
    g.parentNode.removeChild(g);
  }
  static getDotsCoodinates(shape) {
    var pointslist = [];
    for (var i = 0; i < gn("pathdots").childElementCount; i++) {
      var dot = gn("pathdots").childNodes[i];
      pointslist.push({
        cmd: dot.getAttribute("cmd"),
        pt: _Path.getDotPoint(dot)
      });
    }
    return pointslist;
  }
  static getDots() {
    var pointslist = [];
    for (var i = 0; i < gn("pathdots").childElementCount; i++) {
      pointslist.push(gn("pathdots").childNodes[i]);
    }
    return pointslist;
  }
  static addDot(shape) {
    var g = gn("pathdots");
    g.parentNode.removeChild(g);
    var rot = Transform.extract(shape, 4);
    var newpt = Transform.point(Paint.initialPoint.x, Paint.initialPoint.y, rot.matrix.inverse());
    setCanvasSize(
      ScratchJr.workingCanvas,
      Number(Paint.root.getAttribute("width")) * Paint.currentZoom,
      Number(Paint.root.getAttribute("height")) * Paint.currentZoom
    );
    var ctx = ScratchJr.workingCanvas.getContext("2d");
    ctx.clearRect(0, 0, ScratchJr.workingCanvas.width, ScratchJr.workingCanvas.height);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.lineWidth = Ghost.linemask;
    ctx.strokeStyle = "#ff00FF";
    shape.setAttribute("d", _Path.addPoint(shape, ctx, newpt));
    _Path.showDots(shape);
    PaintUndo.record();
  }
  static getHitIndex(ctx, commands, pt) {
    ctx.save();
    ctx.beginPath();
    for (var i = 0; i < commands.length; i++) {
      SVG2Canvas.drawCommand(ctx, commands[i]);
      ctx.stroke();
      pt = Vector.floor(pt);
      var pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      if (pixel[3] != 0) {
        return i;
      }
    }
    ctx.stroke();
    ctx.restore();
    return -1;
  }
  static getHitPointIndex(list, pt) {
    for (var i = 0; i < list.length; i++) {
      if (Vector.len(Vector.diff(list[i].pt, pt)) == 0) {
        return i;
      }
    }
    return -1;
  }
  static addPoint(shape, ctx, newpt) {
    var mycmds = SVG2Canvas.getSVGcommands(shape);
    var list = _Path.getPointsAndCmds(shape);
    var newCmd = null;
    var indx = _Path.getHitIndex(ctx, mycmds, Vector.floor(newpt));
    if (indx > -1) {
      var prevcmd = list[indx].cmd;
      if (SVG2Canvas.curveoptions.indexOf(prevcmd) > -1 || prevcmd.toLowerCase() == "z") {
        newCmd = {
          cmd: "C",
          pt: newpt
        };
      } else {
        newCmd = {
          cmd: "L",
          pt: _Path.inLine(newpt, indx, list)
        };
      }
      list.splice(indx, 0, newCmd);
    }
    return _Path.getDattribute(list);
  }
  static inLine(C, indx, list) {
    var A = list[indx - 1].pt;
    var B = list[indx].pt;
    var norm = Vector.norm(Vector.diff(B, A));
    var K = Vector.dot(norm, Vector.diff(C, A));
    var pt = Vector.sum(A, Vector.scale(norm, K));
    return pt;
  }
  static deleteDot(dot, shape) {
    var list1 = _Path.getPointsForFirst(shape);
    var list = _Path.getPointsAndCmds(shape);
    var mustdelteboth = gn("pathdots").childNodes[gn("pathdots").childElementCount - 1].getAttribute("cmd") == "x";
    if (list.length != list1.length && list1.length < 5) {
      return;
    } else if (list.length < (mustdelteboth ? 6 : 3)) {
      return;
    }
    var pt = _Path.getDotPoint(dot);
    var indx = _Path.getHitPointIndex(list, pt);
    if (indx > 0) {
      list.splice(indx, 1);
    }
    if (indx == 0) {
      var pt1 = list[0].pt;
      var pt2 = list[list.length - 1].pt;
      if (Vector.len(Vector.diff(pt1, pt2)) == 0) {
        list.splice(indx, 1);
        if (mustdelteboth) {
          list.splice(list.length - 1, 1);
          list[0].cmd = "M";
          var lastpt = {
            x: list[0].pt.x,
            y: list[0].pt.y
          };
          list[list.length - 1].pt = lastpt;
          var np = {
            cmd: "z",
            pt: lastpt
          };
          list.push(np);
        }
        list[list.length - 1].pt = list[0].pt;
      } else {
        list.splice(indx, 1);
        if (list.length == 2) {
          list[0].cmd = "M";
          list[list.length - 1].cmd = "L";
        }
      }
    }
    var d = _Path.getDattribute(list);
    var img = SVGImage.getImage(shape);
    if (d == null) {
      _Path.hideDots(shape);
      shape.parentNode.removeChild(shape);
      if (img) {
        SVGImage.removeClip(img);
      }
    } else {
      shape.setAttribute("d", d);
      _Path.showDots(shape);
      if (img) {
        SVGImage.rotatePointsOf(shape);
      }
    }
    PaintUndo.record();
  }
  ////////////////////////////////////////
  // Enter modes
  ///////////////////////////////////////
  static enterEditMode(mt) {
    selector = SVGImage.getPathBorder(mt);
    _Path.showDots(selector);
  }
  static quitEditMode() {
    _Path.hideDots(selector);
    selector = null;
  }
  static hitDot(evt) {
    if (!selector) {
      return false;
    }
    var pt = PaintAction.getScreenPt(evt);
    var closestdot = _Path.getClosestDotTo(
      pt,
      Math.floor((isTouch ? idotsize + 4 : dotsize) / Paint.currentZoom) * 2
    );
    if (closestdot) {
      PaintAction.target = closestdot;
    }
    return closestdot != null;
  }
  static getClosestDotTo(pt, range) {
    var list = _Path.getDotsCoodinates(selector);
    var min = 99999;
    var dot = null;
    for (var i = 0; i < list.length; i++) {
      var pt2 = list[i].pt;
      var dist = Vector.len(Vector.diff(pt2, pt));
      if (dist < min) {
        min = dist;
        dot = i + 1;
      }
    }
    if (min <= range) {
      return gn("grab " + dot);
    }
    return null;
  }
  static hitLine(shape, pt) {
    return _Path.getPointIndex(shape, pt) > -1;
  }
  static getPointIndex(shape, pt) {
    var rot = Transform.extract(shape, 4);
    var newpt = Transform.point(pt.x, pt.y, rot.matrix.inverse());
    setCanvasSize(ScratchJr.workingCanvas, Number(Paint.root.getAttribute("width")), Number(Paint.root.getAttribute("height")));
    var ctx = ScratchJr.workingCanvas.getContext("2d");
    ctx.clearRect(0, 0, ScratchJr.workingCanvas.width, ScratchJr.workingCanvas.height);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.lineWidth = Ghost.linemask;
    ctx.strokeStyle = "#ff00FF";
    return _Path.getHitIndex(ctx, SVG2Canvas.getSVGcommands(shape), Vector.floor(newpt));
  }
  static getClosestPath(pt, current, layer, mindist2) {
    var min = 999999;
    var kid = null;
    for (var i = 0; i < layer.childElementCount; i++) {
      var elem = layer.childNodes[i];
      if (elem.id == current.id) {
        continue;
      }
      if (SVG2Canvas.isCloseDPath(elem)) {
        continue;
      }
      var pt2 = _Path.getStartPoint(elem);
      var dist = Events.distance(pt2.x - pt.x, pt2.y - pt.y);
      if (dist < min) {
        min = dist;
        kid = elem;
      }
    }
    return min <= mindist2 ? kid : null;
  }
  ///////////////////////////////
  // Join Path algorithm
  ///////////////////////////////
  static getStartPoint(elem) {
    var d = elem.getAttribute("d");
    var list = _Path.getAnchorpoints(d);
    return list[0];
  }
  static getLastPoint(elem) {
    var d = elem.getAttribute("d");
    var list = _Path.getAnchorpoints(d);
    return list[list.length - 1];
  }
  static join(cs, mt, pt) {
    Transform.applyToCmds(mt, Transform.combineAll(mt));
    Transform.applyToCmds(cs, Transform.combineAll(cs));
    var cslist = _Path.getCommands(cs.getAttribute("d"));
    var diffstart = Vector.len(Vector.diff(pt, cslist[0].pt));
    var diffend = Vector.len(Vector.diff(pt, cslist[cslist.length - 1].pt));
    var isEnd = diffstart > diffend;
    var mtlist = _Path.getCommands(mt.getAttribute("d"));
    var res;
    if (isEnd) {
      if (diffend < diffstart) {
        cslist[0].cmd = "C";
        res = mtlist.concat(cslist.reverse());
      } else {
        mtlist.shift();
        res = cslist.concat(mtlist);
      }
    } else {
      if (diffstart < diffend) {
        mtlist[0].cmd = "L";
        cslist[0].cmd = "C";
        res = cslist.reverse().concat(mtlist);
      } else {
        cslist[0].cmd = "L";
        res = mtlist.concat(cslist);
      }
    }
    var d = _Path.getDattribute(res);
    if (Vector.len(Vector.diff(res[0].pt, res[res.length - 1].pt)) < 10) {
      var char = d.charAt(d.length - 1);
      if (char != "z") {
        d += "z";
      }
    }
    cs.setAttributeNS(null, "d", d);
    var attr = _Path.getStylingFrom(mt);
    for (var val in attr) {
      cs.setAttribute(val, String(attr[val]));
    }
    if (mt.parentNode) {
      mt.parentNode.removeChild(mt);
    }
    return cs;
  }
  // Originally PathBkg.js
  ///////////////////////////////////////////////////
  // Background Cropping with Path
  ///////////////////////////////////////////////////
  static checkBackgroundCrop(shape) {
    var ocmds = _Path.getPointsAndCmds(shape);
    var list = Layer.findUnderMe(shape);
    var iscropped = list.length == 0 ? _Path.createFromBkg(shape) : _Path.someOverlaps(shape, list);
    if (iscropped) {
      shape.parentNode.removeChild(shape);
      Layer.bringElementsToFront();
    } else {
      var d = _Path.getDattribute(ocmds);
      shape.setAttribute("d", d);
    }
  }
  static someOverlaps(shape, list) {
    var cropped = false;
    _Path.strechEdges(shape);
    var box = SVGTools.getBox(shape);
    var box2 = {
      x: 0,
      y: 0,
      width: 480,
      height: 360
    };
    if (_Path.withinBounds(box, box2)) {
      return cropped;
    }
    if (!_Path.isClockWise(shape.getAttribute("d"))) {
      shape.setAttribute("d", _Path.flip(shape));
    }
    for (var i = 0; i < list.length; i++) {
      var node = list[i];
      if (node.tagName.toLowerCase() == "image") {
        continue;
      }
      if (node.tagName == "clipPath") {
        continue;
      }
      var contatctPoints = _Path.getContactPoints(shape, node);
      if (contatctPoints.length < 2) {
        continue;
      }
      var cantcrop = node.id.indexOf("staticbkg") < 0 && node.getAttribute("stencil") != "yes";
      if (cantcrop) {
        continue;
      }
      if (!_Path.withinBounds(box, box2)) {
        continue;
      }
      if (_Path.endsSameSide(shape)) {
        continue;
      }
      if (_Path.isClockWise(node.getAttribute("d"))) {
        node.setAttribute("d", _Path.flip(node));
      }
      if (_Path.createStencil(shape, node)) {
        cropped = true;
      }
    }
    return cropped;
  }
  static createStencil(shape, mt) {
    var isimage = SVGImage.getImage(mt) != null;
    var list = _Path.getPointsAndCmds(shape);
    var other = _Path.getPointsAndCmds(mt);
    var index3 = Layer.groupStartsAt(gn("layer1"), mt);
    var group = Layer.onTopOf(gn("layer1"), index3);
    var p = mt.parentNode;
    for (var i = 0; i < group.length; i++) {
      p.appendChild(group[i]);
    }
    var contatctPoints = _Path.getContactPoints(shape, mt);
    if (contatctPoints.length < 2) {
      return false;
    }
    var attr = _Path.getStylingFrom(mt);
    if (isimage) {
      attr.fill = "none";
    }
    var path = _Path.makeAcut(shape, list, other, contatctPoints[0], contatctPoints[1], attr);
    path.setAttribute("stencil", "yes");
    gn("layer1").appendChild(path);
    var attr2 = _Path.getStylingFrom(shape);
    attr2.fill = isimage ? "none" : mt.getAttribute("fill");
    attr2["stroke-width"] = isimage ? 0 : Paint.strokewidth;
    for (var val in attr2) {
      mt.setAttribute(val, String(attr2[val]));
    }
    attr2.id = getIdFor("path");
    attr2.d = mt.getAttribute("d");
    if (isimage) {
      mt = SVGTools.addChild(gn("layer1"), "path", attr2);
    }
    mt.setAttribute("d", _Path.getComplement(shape, mt, contatctPoints[0], contatctPoints[1]));
    mt.setAttribute("d", _Path.flip(mt));
    mt.setAttribute("stencil", "yes");
    for (var j = 0; j < group.length; j++) {
      p.appendChild(group[j]);
    }
    if (contatctPoints.length > 2) {
      _Path.cutBoard(gn("layer1"), contatctPoints, shape, path, 2);
    }
    return !isimage;
  }
  static cutBoard(p, ptsincontact, shape, mt, n) {
    if (n > ptsincontact.length - 2) {
      return;
    }
    if (_Path.isClockWise(mt.getAttribute("d"))) {
      mt.setAttribute("d", _Path.flip(mt));
    }
    var list = _Path.getPointsAndCmds(shape);
    var other = _Path.getPointsAndCmds(mt);
    var seam1 = ptsincontact[n];
    var seam2 = ptsincontact[n + 1];
    var attr = _Path.getStylingFrom(mt);
    var hitpoints = _Path.updateContactPoints(seam1, seam2, list, other);
    if (_Path.isValidSegment(hitpoints)) {
      var path = _Path.makeAcut(shape, list, other, hitpoints[0], hitpoints[1], attr);
      p.appendChild(path);
      path.setAttribute("stencil", "yes");
      gn("layer1").appendChild(path);
      var attr2 = _Path.getStylingFrom(shape);
      attr2.fill = mt.getAttribute("fill");
      attr2["stroke-width"] = Paint.strokewidth;
      for (var val in attr2) {
        mt.setAttribute(val, String(attr2[val]));
      }
      mt.setAttribute("d", _Path.getComplement(shape, mt, hitpoints[0], hitpoints[1]));
      mt.setAttribute("d", _Path.flip(mt));
      mt.setAttribute("stencil", "yes");
      _Path.cutBoard(p, ptsincontact, shape, path, n + 2);
    }
  }
  static moveToEdge(last) {
    if (last.x <= -10) {
      return null;
    }
    if (last.x >= 490) {
      return null;
    }
    if (last.y >= 370) {
      return null;
    }
    if (last.y <= -10) {
      return null;
    }
    if (last.x <= 0) {
      return {
        x: -10,
        y: last.y
      };
    }
    if (last.y <= 0) {
      return {
        x: last.x,
        y: -10
      };
    }
    if (last.x >= 480) {
      return {
        x: 490,
        y: last.y
      };
    }
    if (last.y >= 360) {
      return {
        x: last.x,
        y: 370
      };
    }
    return null;
  }
  static atEdge(pt) {
    if (pt.x <= -10) {
      return true;
    }
    if (pt.x >= 490) {
      return true;
    }
    if (pt.y >= 370) {
      return true;
    }
    if (pt.y <= -10) {
      return true;
    }
    return false;
  }
  static endsSameSide(shape) {
    var cmds = _Path.getPointsAndCmds(shape);
    var last = cmds[cmds.length - 1].pt;
    var first = cmds[0].pt;
    return _Path.findEdge(first) == _Path.findEdge(last);
  }
  static findEdge(pt) {
    if (pt.x <= 0) {
      return "W";
    }
    if (pt.x >= 480) {
      return "E";
    }
    if (pt.y >= 360) {
      return "S";
    }
    return "N";
  }
  static createFromBkg(shape) {
    _Path.strechEdges(shape);
    var box = SVGTools.getBox(shape);
    var box2 = {
      x: 0,
      y: 0,
      width: 480,
      height: 360
    };
    if (_Path.withinBounds(box, box2)) {
      return false;
    }
    if (_Path.endsSameSide(shape)) {
      return false;
    }
    var attr2 = {
      "id": getIdFor("path"),
      "opacity": 1,
      fill: "white"
    };
    var cmds = [["M", -10, -10], ["L", 490, -10], ["L", 490, 370], ["L", -10, 370], ["L", -10, -10]];
    attr2.d = SVG2Canvas.arrayToString(cmds);
    var mt = SVGTools.addChild(gn("layer1"), "path", attr2);
    mt.setAttribute("stencil", "yes");
    if (!_Path.isClockWise(shape.getAttribute("d"))) {
      shape.setAttribute("d", _Path.flip(shape));
    }
    if (_Path.isClockWise(mt.getAttribute("d"))) {
      mt.setAttribute("d", _Path.flip(mt));
    }
    var attr = _Path.getStylingFrom(gn("staticbkg"));
    for (var val in attr) {
      mt.setAttribute(val, String(attr[val]));
    }
    return _Path.createStencil(shape, mt);
  }
  static withinBounds(box, box2) {
    if (box.x <= box2.x && box.width + box.x >= box2.width) {
      return false;
    }
    if (box.y > box2.y) {
      return true;
    }
    if (box.height + box.y < box2.height) {
      return true;
    }
    return false;
  }
  static strechEdges(shape) {
    var cmds = _Path.getPointsAndCmds(shape);
    var last = cmds[cmds.length - 1].pt;
    var newpt;
    if (!_Path.atEdge(last)) {
      var addtoend = _Path.moveToEdge(last);
      if (addtoend) {
        cmds.push({
          cmd: "C",
          pt: addtoend
        });
      } else {
        newpt = Vector.sum(last, Vector.diff(last, cmds[cmds.length - 2].pt));
        cmds.push({
          cmd: "C",
          pt: newpt
        });
      }
    }
    var first = cmds[0].pt;
    if (!_Path.atEdge(first)) {
      cmds[0].cmd = "L";
      var addtostart = _Path.moveToEdge(first);
      if (addtostart) {
        cmds.unshift({
          cmd: "M",
          pt: addtostart
        });
      } else {
        newpt = Vector.sum(first, Vector.diff(first, cmds[1].pt));
        cmds.unshift({
          cmd: "M",
          pt: newpt
        });
      }
    }
    var d = _Path.getDattribute(cmds);
    shape.setAttribute("d", d);
  }
  ///////////////////////
  // path management
  ///////////////////////
  static getContactPoints(eraser, hitobj) {
    var list = _Path.getPointsAndCmds(eraser);
    var other = _Path.getPointsAndCmds(hitobj);
    var res = [];
    for (var i = 1; i < list.length; i++) {
      var v1 = list[i - 1].pt;
      var v2 = list[i].pt;
      for (var j = 1; j < other.length; j++) {
        var v3 = other[j - 1].pt;
        var v4 = other[j].pt;
        var pt = Vector.lineIntersect(v1, v2, v3, v4);
        if (pt) {
          res.push([i, j, pt]);
        }
      }
    }
    return res;
  }
  static makeAcut(eraser, list, other, goin, goout, attr) {
    var epathdata = SVG2Canvas.getSVGcommands(eraser);
    attr.d = _Path.chopSection(list, epathdata, other, goin, goout);
    attr.id = getIdFor("path");
    var newpath = SVGTools.addChild(gn("layer1"), "path", attr);
    newpath.setAttribute("d", _Path.flip(newpath));
    return newpath;
  }
  static chopSection(list, edata, other, goin, goout) {
    var d = "M" + goin[2].x + "," + goin[2].y;
    d += SVG2Canvas.arrayToString(edata.slice(goin[0], goout[0]));
    d += _Path.lineSeg(goout[2]);
    var joinIn = goin[1];
    var joinOut = goout[1];
    var plist = _Path.getShapeFromPoints(joinIn, joinOut, goin[2], other);
    return _Path.fromPointsToPath(d, plist);
  }
  static getShapeFromPoints(joinIn, joinOut, pt, other) {
    var plist = [];
    if (joinOut > joinIn) {
      var indx = other.length;
      plist = other.slice(joinOut, indx);
      plist = plist.concat(other.slice(0, joinIn));
    } else if (joinOut != joinIn) {
      plist = other.slice(joinOut, joinIn);
    }
    plist.push({
      cmd: "L",
      pt
    });
    return plist;
  }
  static fromPointsToPath(d, plist) {
    var prev = plist[0];
    d += _Path.lineSeg(prev.pt);
    for (var i = 1; i < plist.length - 1; i++) {
      d += _Path.getNextCmd(i, prev, plist);
      prev = plist[i];
    }
    d += _Path.lineSeg(plist[plist.length - 1].pt);
    return d;
  }
  static getNextCmd(i, prev, plist, endpt) {
    var next = "";
    switch (plist[i].cmd.toUpperCase()) {
      case "M":
        if (prev.cmd == "C") {
          var ptafter = endpt ? endpt : plist[i + 1].pt;
          next = _Path.curveSeg(prev.pt, plist[i].pt, ptafter);
        } else {
          next = _Path.lineSeg(plist[i].pt);
        }
        break;
      case "C":
      case "S":
        next = _Path.curveSeg(prev.pt, plist[i].pt, endpt ? endpt : plist[i + 1].pt);
        break;
      default:
        next = _Path.lineSeg(plist[i].pt);
        break;
    }
    return next;
  }
  static getComplement(eraser, hitobj, goin, goout) {
    var edata = SVG2Canvas.getSVGcommands(eraser);
    var other = _Path.getPointsAndCmds(hitobj);
    var d = "M" + goin[2].x + "," + goin[2].y;
    d += SVG2Canvas.arrayToString(edata.slice(goin[0], goout[0]));
    d += _Path.lineSeg(goout[2]);
    var joinIn = goin[1];
    var joinOut = goout[1];
    var plist = _Path.getFromPoints(joinIn, joinOut, goin[2], other);
    return _Path.fromPointsToPath(d, plist);
  }
  static getFromPoints(joinIn, joinOut, pt, other) {
    var plist = [];
    if (joinIn >= joinOut) {
      var indx = other.length;
      plist = other.slice(joinIn, indx);
      plist = plist.concat(other.slice(0, joinOut));
    } else {
      plist = other.slice(joinIn, joinOut);
    }
    if (plist.length > 0) {
      plist.reverse();
    }
    plist.push({
      cmd: "L",
      pt
    });
    return plist;
  }
  static updateContactPoints(myseamin, myseamout, elist, newlist) {
    var hitin;
    var hitout;
    var seamin1 = _Path.updateContact(myseamin[0], elist, newlist);
    if (seamin1 == null) {
      var res1 = _Path.extendSearch(myseamin[0], myseamout[0] - 1, elist, newlist);
      if (res1 != null) {
        hitin = [res1[0], res1[1], res1[2]];
      } else {
        return null;
      }
    } else {
      hitin = [myseamin[0], seamin1, myseamin[2]];
    }
    var seamout1 = _Path.updateContact(myseamout[0], elist, newlist);
    if (seamout1 == null) {
      var res2 = _Path.extendSearch(myseamin[0] + 1, myseamout[0] + 1, elist, newlist);
      if (res2 != null) {
        hitout = [res2[0], res2[1], res2[2]];
      } else {
        return null;
      }
    } else {
      hitout = [myseamout[0], seamout1, myseamout[2]];
    }
    return [hitin, hitout];
  }
  static extendSearch(start, end, list, other) {
    for (var i = start; i < list.length; i++) {
      var v1 = list[i - 1].pt;
      var v2 = list[i].pt;
      for (var j = 1; j < other.length; j++) {
        var v3 = other[j - 1].pt;
        var v4 = other[j].pt;
        var pt = Vector.lineIntersect(v1, v2, v3, v4);
        if (pt) {
          return [i, j, pt];
        }
      }
    }
    return null;
  }
  static updateContact(n, elist, newlist) {
    var v1 = elist[n - 1].pt;
    var v2 = elist[n].pt;
    for (var j = 1; j < newlist.length; j++) {
      var v3 = newlist[j - 1].pt;
      var v4 = newlist[j].pt;
      var pt = Vector.lineIntersect(v1, v2, v3, v4);
      if (pt) {
        return j;
      }
    }
    return null;
  }
  static isValidSegment(hp) {
    if (hp == null) {
      return false;
    }
    if (hp[0][1] == hp[1][1] || hp[0][2] == hp[1][1]) {
      return false;
    }
    return true;
  }
  // Originally PathTools.js
  /////////////////////////////////////////////
  // Path direction
  ////////////////////////////////////////////
  static isClockWise(d) {
    return _Path.getTurnType(_Path.getAnchorpoints(d)) == "clockwise";
  }
  static getTurnType(list) {
    if (list.length < 3) {
      return "colinear";
    }
    var limitpoints = _Path.getMinMaxPoints(list);
    var a = _Path.findGreaterThanIndex(limitpoints, -1);
    if (!a) {
      return "colinear";
    }
    var b = _Path.findGreaterThanIndex(limitpoints, a.index);
    if (!b) {
      return "colinear";
    }
    var c = _Path.findGreaterThanIndex(limitpoints, b.index);
    if (!c) {
      return "colinear";
    }
    return _Path.triangleAreaDir(a, b, c);
  }
  static findGreaterThanIndex(list, min) {
    var lastmin = 99999999;
    var pos = null;
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.index > min && item.index < lastmin) {
        lastmin = item.index;
        pos = item;
      }
    }
    return pos;
  }
  static triangleAreaDir(a, b, c) {
    var area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    if (area > 0) {
      return "clockwise";
    }
    if (area < 0) {
      return "counterclockwise";
    }
    return "colinear";
  }
  static getMinMaxPoints(list) {
    var res = [0, 0, 0, 0];
    if (list.length < 1) {
      return res;
    }
    var minx = 9999999;
    var miny = 9999999;
    var maxx = -9999999;
    var maxy = -9999999;
    for (var i = 0; i < list.length; i++) {
      if (list[i].x < minx) {
        minx = list[i].x;
        res[0] = {
          type: "minx",
          x: list[i].x,
          y: list[i].y,
          index: i
        };
      }
      if (list[i].x > maxx) {
        maxx = list[i].x;
        res[2] = {
          type: "maxx",
          x: list[i].x,
          y: list[i].y,
          index: i
        };
      }
      if (list[i].y < miny) {
        miny = list[i].y;
        res[1] = {
          type: "miny",
          x: list[i].x,
          y: list[i].y,
          index: i
        };
      }
      if (list[i].y > maxy) {
        maxy = list[i].y;
        res[3] = {
          type: "maxy",
          x: list[i].x,
          y: list[i].y,
          index: i
        };
      }
    }
    return res;
  }
  ////////////////////////////////////////////
  //  Flip Element
  ////////////////////////////////////////////
  static flip(elem) {
    var paths = elem.getAttribute("d").match(/[M][^M]*/g);
    var d = "";
    for (var i = 0; i < paths.length; i++) {
      d += _Path.reverse(paths[i]);
    }
    return d;
  }
  static reverse(d) {
    var list = _Path.getCommands(d);
    if (list.length < 2) {
      return "";
    }
    var lastcmd = list[list.length - 1].cmd.toLowerCase();
    if (lastcmd == "z") {
      list[0].cmd = "z";
    } else {
      list[0].cmd = lastcmd.toUpperCase();
    }
    list[list.length - 1].cmd = "M";
    list = list.reverse();
    return _Path.getDattribute(list);
  }
  static setData(mt) {
    if (mt.getAttribute("relatedto")) {
      _Path.breakRelationship(mt, mt.getAttribute("relatedto"));
    } else {
      _Path.makeCompoundPath(mt);
    }
  }
  static breakRelationship(mt, family) {
    var elem = gn(family);
    if (!elem) {
      return;
    }
    var paths = elem.getAttribute("d").match(/[M][^M]*/g);
    var findPlace = _Path.getMatchPathIndex(mt, paths);
    if (findPlace < 0) {
      return;
    }
    paths.splice(findPlace, 1);
    var d = "";
    for (var i = 0; i < paths.length; i++) {
      d += paths[i];
    }
    elem.setAttribute("d", d);
    mt.setAttribute("d", _Path.flip(mt));
    mt.removeAttribute("relatedto");
  }
  static getMatchPathIndex(mt, paths) {
    var mypoints = _Path.getPointsAndCmds(mt);
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      var yourpoints = _Path.getCommands(path);
      var count2 = _Path.countMatchingPoints(mypoints, yourpoints);
      if (count2 >= mypoints.length) {
        return i;
      }
    }
    return -1;
  }
  static countMatchingPoints(list, other) {
    var count2 = 0;
    for (var i = 0; i < list.length; i++) {
      var v1 = list[i].pt;
      for (var j = 0; j < other.length; j++) {
        var v2 = other[j].pt;
        if (Vector.len(Vector.diff(v1, v2)) == 0) {
          count2++;
        }
      }
    }
    return count2;
  }
  static makeCompoundPath(mt) {
    var list = _Path.findIntersecting(mt);
    if (list.length == 0 || _Path.containsImage(list) || _Path.anyCrossing(list, mt)) {
      mt.setAttribute("fill", Paint.fillcolor);
    } else {
      var filled = false;
      list.sort(function(l1, l2) {
        var a = SVGTools.getArea(l1);
        var b = SVGTools.getArea(l2);
        return a > b ? -1 : a < b ? 1 : 0;
      });
      var res = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].getAttribute("fill") != "none") {
          filled = true;
        }
        if (list[i].nodeName == "image") {
          filled = true;
        }
        if (list[i].tagName == "path" && !SVG2Canvas.isCloseDPath(list[i])) {
          filled = true;
        }
        if (i == 0) {
          res.push(list[i]);
        }
        if (i > 0) {
          if (!Layer.insideMe(list[i], list[i - 1])) {
            res.push(list[i]);
          }
        }
      }
      if (filled) {
        mt.setAttribute("fill", Paint.fillcolor);
      } else {
        _Path.processCompoundPath(mt, res);
      }
    }
  }
  static findIntersecting(mt) {
    var rpos = Paint.root.createSVGRect();
    var box = SVGTools.getBox(mt);
    rpos.x = box.x;
    rpos.y = box.y;
    rpos.width = box.width;
    rpos.height = box.height;
    var list = Paint.root.getIntersectionList(rpos, null);
    var res = [];
    if (list != null) {
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item.parentNode.id == "ghostlayer") {
          continue;
        }
        if (item.id == mt.id) {
          continue;
        }
        if (Layer.includesBox(mt, item)) {
          res.push(item);
        }
      }
    }
    return res;
  }
  static containsImage(objlist) {
    for (var i = 0; i < objlist.length; i++) {
      if (objlist[i].nodeName == "image") {
        return true;
      }
    }
    return false;
  }
  static anyCrossing(objlist, mt) {
    for (var i = 0; i < objlist.length; i++) {
      if (mt == objlist[i]) {
        continue;
      }
      if (objlist[i].nodeName == "g") {
        continue;
      }
      var contatctPoints = _Path.getPathCrossing(objlist[i], mt);
      if (contatctPoints.length > 0) {
        return true;
      }
    }
    return false;
  }
  static getPathCrossing(obj, mt) {
    var list = _Path.getAllPoints(obj.getAttribute("d"));
    var other = _Path.getAllPoints(mt.getAttribute("d"));
    var res = [];
    for (var i = 1; i < list.length; i++) {
      var v1 = list[i - 1];
      var v2 = list[i];
      for (var j = 1; j < other.length; j++) {
        var v3 = other[j - 1];
        var v4 = other[j];
        var pt = Vector.lineIntersect(v1, v2, v3, v4);
        if (pt) {
          res.push([i, j, pt]);
        }
      }
    }
    return res;
  }
  static getAllPoints(d) {
    var list = SVG2Canvas.getCommandList(d);
    if (list.length == 0) {
      return [];
    }
    var res = [];
    var lastpt = {
      x: list[0][1],
      y: list[0][2]
    };
    res.push(lastpt);
    for (var i = 1; i < list.length; i++) {
      var pts = list[i];
      var cmd = pts.shift();
      switch (cmd.toLowerCase()) {
        case "l":
          lastpt = {
            x: Number(pts[0]),
            y: Number(pts[1])
          };
          res.push(lastpt);
          break;
        case "c":
          pts.unshift(lastpt.y);
          pts.unshift(lastpt.x);
          var l = pts.length;
          lastpt = {
            x: pts[l - 2],
            y: pts[l - 1]
          };
          var seg = _Path.getBezierPoints(pts);
          res = res.concat(seg);
          break;
        case "z":
          lastpt = {
            x: res[0].x,
            y: res[0].y
          };
          res.push(lastpt);
          break;
      }
    }
    let bezierList = _Path.cleanBezier(res, 5);
    return bezierList.length < 5 ? res : bezierList;
  }
  ////////////////////////////////////////////////////////////
  // from C to bezier points
  ////////////////////////////////////////////////////////////
  static getBezierPoints(points) {
    if (points.length < 8) {
      return [];
    }
    var p1x, p2x, p3x, p4x, p1y, p2y, p3y, p4y;
    p1x = points[0];
    p1y = points[1];
    p2x = points[2];
    p2y = points[3];
    p3x = points[4];
    p3y = points[5];
    p4x = points[6];
    p4y = points[7];
    var x, y, t;
    var xl = p1x - 1;
    var yl = p1y - 1;
    t = 0;
    var f = 1;
    var k = 1.1;
    var curvePoints = [];
    while (t <= 1 && t >= 0) {
      x = 0;
      y = 0;
      x = (1 - t) * (1 - t) * (1 - t) * p1x + 3 * (1 - t) * (1 - t) * t * p2x + 3 * (1 - t) * t * t * p3x + t * t * t * p4x;
      y = (1 - t) * (1 - t) * (1 - t) * p1y + 3 * (1 - t) * (1 - t) * t * p2y + 3 * (1 - t) * t * t * p3y + t * t * t * p4y;
      x = Math.round(x);
      y = Math.round(y);
      if (x != xl || y != yl) {
        if (t == 0) {
          xl = x;
          yl = y;
        }
        if (x - xl > 1 || y - yl > 1 || xl - x > 1 || yl - y > 1) {
          t -= f;
          f = f / k;
        } else {
          curvePoints[curvePoints.length] = {
            x,
            y
          };
          xl = x;
          yl = y;
        }
      } else {
        t -= f;
        f = f * k;
      }
      t += f;
    }
    return curvePoints;
  }
  // for debugging
  static placePoint(p, pt, c) {
    var el = SVGTools.addEllipse(p, pt.x, pt.y);
    el.setAttributeNS(null, "stroke-width", "0.5");
    el.setAttributeNS(null, "rx", "4");
    el.setAttributeNS(null, "ry", "4");
    el.setAttributeNS(null, "fill", c);
  }
  // Path.placePoint(gn("testlayer")!, pt, c ? c : "#0093ff");
  static cleanBezier(points, dist) {
    var n = points.length;
    var i = 1;
    var j = 0;
    var plist = [];
    plist.push(points[0]);
    while (i < n - 1) {
      var before = points[j];
      var here = points[i];
      var after = points[i + 1];
      var l1 = Vector.diff(before, here);
      var l2 = Vector.diff(after, here);
      if (Vector.len(l2) > dist || Vector.len(l1) > dist) {
        plist.push(points[i]);
        j = i;
      }
      i++;
    }
    return plist;
  }
  static processCompoundPath(mt, list) {
    var dir = _Path.isClockWise(mt.getAttribute("d"));
    Transform.applyToCmds(mt, Transform.combineAll(mt));
    Transform.eliminateAll(mt);
    var d = mt.getAttribute("d");
    var yourdir;
    for (var i = 0; i < list.length; i++) {
      if (list[i] == mt) {
        continue;
      }
      if (list[i].getAttribute("fill") != "none") {
        list[i].parentNode.appendChild(list[i]);
        continue;
      }
      list[i].setAttribute("relatedto", mt.id);
      if (SVG2Canvas.isCompoundPath(list[i])) {
        Transform.applyToCmds(list[i], Transform.combineAll(list[i]));
        Transform.eliminateAll(list[i]);
        var paths = list[i].getAttribute("d").match(/[M][^M]*/g);
        yourdir = _Path.isClockWise(paths[0]);
        if (dir == yourdir) {
          d += _Path.reverse(paths[0]);
        } else {
          d += paths[0];
        }
      } else {
        yourdir = _Path.isClockWise(list[i].getAttribute("d"));
        if (dir == yourdir) {
          list[i].setAttribute("d", _Path.flip(list[i]));
        }
        Transform.applyToCmds(list[i], Transform.combineAll(list[i]));
        Transform.eliminateAll(list[i]);
        d += list[i].getAttribute("d");
      }
    }
    mt.setAttribute("d", d);
  }
};

// src/app/src/painteditor/Camera.ts
var view = "front";
var target = null;
var available = false;
var Camera = class _Camera {
  static active;
  static flip;
  static get available() {
    return available;
  }
  static set available(newAvailable) {
    available = newAvailable;
  }
  static startFeed(feedTarget) {
    ScratchAudio.sndFX("entertap.wav");
    if (!Paint.canvasFits()) {
      Paint.scaleToFit();
    }
    target = feedTarget;
    _Camera.active = true;
    var devicePixelRatio2 = window.devicePixelRatio;
    var viewbox = SVGTools.getBox(target).rounded();
    var box = new Rectangle(0, 0, Paint.workspaceWidth, Paint.workspaceHeight);
    viewbox = viewbox.expandBy(20);
    viewbox.crop(box);
    var mask = _Camera.getLayerMask(target);
    var data = {};
    var x = Math.floor((viewbox.x + viewbox.width / 2) * Paint.currentZoom - viewbox.width / 2);
    var y = Math.floor((viewbox.y + viewbox.height / 2) * Paint.currentZoom - viewbox.height / 2);
    data.x = globalx(gn("workspacebkg")) + x + gn("maincanvas").dx + gn("maincanvas").cx - gn("maincanvas").cx * Paint.currentZoom;
    data.y = globaly(gn("workspacebkg")) + y + gn("maincanvas").dy + gn("maincanvas").cy - gn("maincanvas").cy * Paint.currentZoom;
    data.width = viewbox.width;
    data.height = viewbox.height;
    data.scale = Paint.currentZoom;
    data.devicePixelRatio = devicePixelRatio2;
    data.mx = globalx(gn("workspacebkg")) + gn("maincanvas").dx;
    data.my = globaly(gn("workspacebkg")) + gn("maincanvas").dy;
    data.mw = Paint.workspaceWidth;
    data.mh = Paint.workspaceHeight;
    data.image = mask.toDataURL("image/png");
    iOS.startfeed(data, iOS.trace);
    Paint.cameraToolsOn();
  }
  static prepareForLandscapeMode(cnv) {
    var result = document.createElement("canvas");
    setCanvasSize(result, cnv.height, cnv.width);
    var finalctx = result.getContext("2d");
    var min = Math.min(cnv.width, cnv.height);
    var max = Math.max(cnv.width, cnv.height);
    var delta2 = (max - min) / 2;
    var pt = {
      x: cnv.width / 2,
      y: cnv.height / 2
    };
    finalctx.translate(pt.x, pt.y);
    finalctx.rotate(90 * DEGTOR);
    finalctx.translate(-pt.x, -pt.y);
    finalctx.drawImage(cnv, delta2, delta2);
    return result;
  }
  static doAction(str) {
    switch (str) {
      case "cameraflip":
        ScratchAudio.sndFX("tap.wav");
        view = view == "front" ? "back" : "front";
        iOS.choosecamera(view, _Camera.flip);
        break;
      case "camerasnap":
        _Camera.snapShot();
        Paint.cameraToolsOff();
        break;
      case "cammera":
        _Camera.close();
        Paint.selectButton("select");
        break;
      default:
        _Camera.close();
        Paint.selectButton(str);
        break;
    }
  }
  static close() {
    target = null;
    view = "front";
    _Camera.active = false;
    iOS.stopfeed();
    Paint.cameraToolsOff();
    if (isAndroid) {
      ScratchJr.onBackButtonCallback.pop();
    }
  }
  static snapShot() {
    iOS.captureimage("Camera.processimage");
  }
  static getLayerMask(elem) {
    var w, h;
    if (isAndroid) {
      var mainCanvas = gn("maincanvas");
      var mainCanvasRect = mainCanvas.getBoundingClientRect();
      w = mainCanvasRect.width;
      h = mainCanvasRect.height;
    } else {
      w = Paint.workspaceWidth;
      h = Paint.workspaceHeight;
    }
    var cnv = document.createElement("canvas");
    setCanvasSize(cnv, w, h);
    var ctx = cnv.getContext("2d");
    ctx.fillStyle = ScratchJr.stagecolor;
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    if (isAndroid) {
      ctx.save();
      ctx.scale(Paint.currentZoom, Paint.currentZoom);
    }
    SVG2Canvas.drawImage(gn("paintgrid"), ctx);
    var isgroup = elem.parentNode && elem.parentNode.id != "layer1";
    var index3 = isgroup ? Layer.groupStartsAt(gn("layer1"), elem.parentNode) : Layer.groupStartsAt(gn("layer1"), elem);
    _Camera.drawLayers(gn("layer1"), ctx, 0, index3);
    let localindex = 0;
    if (isgroup) {
      localindex = Layer.groupStartsAt(elem.parentNode, elem);
      _Camera.drawLayers(elem.parentNode, ctx, 0, localindex);
    }
    _Camera.drawHole(elem, ctx);
    if (isgroup) {
      _Camera.drawLayers(
        elem.parentNode,
        ctx,
        localindex + 1,
        elem.parentNode.childElementCount
      );
    }
    _Camera.drawLayers(
      gn("layer1"),
      ctx,
      index3 + 1,
      gn("layer1").childElementCount
    );
    if (isAndroid) {
      ctx.restore();
    }
    return cnv;
  }
  static drawLayers(p, ctx, startat, endat) {
    var min = Math.min(startat, p.childElementCount);
    var max = Math.min(endat, p.childElementCount);
    for (var i = min; i < max; i++) {
      SVG2Canvas.drawLayer(p.childNodes[i], ctx, SVG2Canvas.drawLayer);
    }
  }
  static drawHole(elem, ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    SVG2Canvas.drawElementHole(elem, ctx);
    ctx.restore();
    ctx.fillStyle = "rgba(0, 0, 0,0)";
    ctx.strokeStyle = !elem.getAttribute("stroke") ? "none" : elem.getAttribute("stroke");
    ctx.lineCap = elem.getAttribute("stroke-linecap") ? elem.getAttribute("stroke-linecap") : SVG2Canvas.strokevalues["stroke-linecap"];
    ctx.lineWidth = elem.getAttribute("stroke-width") ? Number(elem.getAttribute("stroke-width")) : Number(SVG2Canvas.strokevalues["stroke-width"]);
    ctx.miterLimit = Number(elem.getAttribute("stroke-miterlimit") ? elem.getAttribute("stroke-miterlimit") : SVG2Canvas.strokevalues["stroke-miterlimit"]);
    ctx.linejoin = elem.getAttribute("stroke-linejoin") ? elem.getAttribute("stroke-linejoin") : SVG2Canvas.strokevalues["stroke-linejoin"];
    SVG2Canvas.processXMLnode(elem, ctx, true);
  }
  static processimage(str) {
    if (!target) {
      return;
    }
    if (str != "error getting a still") {
      SVGImage.addCameraFill(target, str);
    }
    _Camera.close();
    Paint.cameraToolsOff();
    Paint.selectButton("select");
    if (str != "error getting a still") {
      PaintUndo.record();
      Ghost.drawOffscreen();
    }
  }
};
window.Camera = Camera;

// src/app/src/painteditor/PaintUndo.ts
var buffer = [];
var index = 0;
var PaintUndo = class _PaintUndo {
  // Getters/setters for globally used properties
  static set buffer(newBuffer) {
    buffer = newBuffer;
  }
  static get index() {
    return index;
  }
  static set index(newIndex) {
    index = newIndex;
  }
  ////////////////////////////////////////
  // Undo Controls Setup
  ///////////////////////////////////////
  static setup(p) {
    var div = newHTML("div", "paintundo", p);
    div.setAttribute("id", "paintundocontrols");
    var lib = [["undo", _PaintUndo.undo], ["redo", _PaintUndo.redo]];
    var _dx = 20;
    for (var i = 0; i < lib.length; i++) {
      var bt = _PaintUndo.newToggleClicky(div, "id_p", lib[i][0], lib[i][1]);
      _dx += bt.offsetWidth;
      _dx += 20;
    }
    _PaintUndo.updateActiveUndo();
  }
  static newToggleClicky(p, prefix, key, fcn) {
    var button = newHTML("div", "undocircle", p);
    newHTML("div", key + " off", button);
    button.setAttribute("type", "toggleclicky");
    button.setAttribute("id", prefix + key);
    if (fcn) {
      button.onmousedown = function(evt) {
        fcn(evt);
      };
    }
    return button;
  }
  static runUndo() {
    Path.quitEditMode();
    Paint.root.removeChild(gn("layer1"));
    Paint.root.appendChild(SVGTools.toObject(buffer[index]));
    Paint.root.appendChild(gn("draglayer"));
    Paint.root.appendChild(gn("paintgrid"));
    Paint.setZoomTo(Paint.currentZoom);
  }
  // you record before introducing a change
  static record(dontStartStories) {
    if (index + 1 <= buffer.length) {
      buffer.splice(index + 1, buffer.length);
    }
    buffer.push(_PaintUndo.getCanvas());
    index++;
    if (gn("id_pundo")) {
      _PaintUndo.updateActiveUndo();
    }
    if (!dontStartStories) {
      ScratchJr.storyStart("PaintUndo.record");
    }
  }
  static getCanvas() {
    return SVGTools.svg2string(gn("layer1"));
  }
  //////////////////////////////////
  // Control buttons callbacks
  //////////////////////////////////
  static undo(e) {
    if (e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (Camera.active) {
      Camera.doAction("undo");
    }
    while (index >= buffer.length) {
      index--;
    }
    index--;
    var snd = index < 0 ? "boing.wav" : "tap.wav";
    ScratchAudio.sndFX(snd);
    if (index < 0) {
      index = 0;
    } else {
      _PaintUndo.runUndo();
    }
    _PaintUndo.updateActiveUndo();
  }
  static redo(e) {
    if (e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (Camera.active) {
      Camera.doAction("undo");
    }
    index++;
    var snd = index > buffer.length - 1 ? "boing.wav" : "tap.wav";
    ScratchAudio.sndFX(snd);
    if (index > buffer.length - 1) {
      index = buffer.length - 1;
    } else {
      _PaintUndo.runUndo();
    }
    _PaintUndo.updateActiveUndo();
  }
  static updateActiveUndo() {
    if (gn("id_pundo")) {
      if (buffer.length == 1) {
        _PaintUndo.tunOffButton(gn("id_pundo"));
      } else {
        if (index < 1) {
          _PaintUndo.tunOffButton(gn("id_pundo"));
        } else {
          _PaintUndo.tunOnButton(gn("id_pundo"));
        }
      }
      if (index >= buffer.length - 1) {
        _PaintUndo.tunOffButton(gn("id_predo"));
      } else {
        _PaintUndo.tunOnButton(gn("id_predo"));
      }
    }
  }
  static tunOnButton(p) {
    var kid = p.childNodes[0];
    var kclass = kid.getAttribute("class").split(" ")[0];
    kid.setAttribute("class", kclass + " on");
  }
  static tunOffButton(p) {
    var kid = p.childNodes[0];
    var kclass = kid.getAttribute("class").split(" ")[0];
    kid.setAttribute("class", kclass + " off");
  }
};

// src/app/src/painteditor/PaintAction.ts
function isPathTip(grab) {
  var indx = Path.getDotPos(grab);
  if (indx < 0) {
    return false;
  }
  if (indx == 0) {
    return true;
  }
  return indx == gn("pathdots").childElementCount - 1;
}
var currentShape = null;
var target2 = null;
var dragGroup = [];
var startAngle = 0;
var dragging = false;
var timeoutEvent2 = null;
var mindist = 10;
var PaintAction = class _PaintAction {
  static center;
  static currentshape;
  // Getters/setters for globally used properties
  static set target(newTarget) {
    target2 = newTarget;
  }
  static get dragGroup() {
    return dragGroup;
  }
  static mouseDown(evt) {
    target2 = null;
    if (!gn("layer1")) {
      return;
    }
    if (evt.touches && evt.touches.length > 1) {
      return;
    }
    _PaintAction.clearDragGroup();
    dragging = false;
    var mt = _PaintAction.getMouseTarget(evt);
    if (!mt) {
      return;
    }
    if (mt.tagName.toLowerCase() != "div" && mt.tagName.toLowerCase() != "svg") {
      target2 = mt;
    }
    evt.preventDefault();
    Paint.initialPoint = _PaintAction.getScreenPt(evt);
    Paint.deltaPoint = _PaintAction.getScreenPt(evt);
    if (Path.hitDot(evt)) {
      Paint.mode = "grab";
    }
    currentShape = null;
    _PaintAction.clearEvents();
    cmdForMouseDown[Paint.mode](evt);
    _PaintAction.setEvents();
  }
  static clearDragGroup() {
    for (var j = 0; j < gn("layer1").childElementCount; j++) {
      var kid = gn("layer1").childNodes[j];
      var erot = Transform.getRotation(kid);
      if (erot.angle == 0) {
        continue;
      }
      var res = [];
      for (let i = 0; i < kid.childElementCount; i++) {
        var elem = kid.childNodes[i];
        if (!elem) {
          continue;
        }
        Transform.rotateFromPoint(erot, elem);
        res.push(elem);
      }
      for (let i = 0; i < kid.childElementCount; i++) {
        gn("layer1").appendChild(res[i]);
      }
      gn("layer1").removeChild(kid);
    }
  }
  static clearEvents() {
    currentShape = null;
    window.onmousemove = null;
    window.onmouseup = null;
  }
  static stopAction(e) {
    var list = ["path", "ellipse", "rect", "tri"];
    var isCreator = list.indexOf(Paint.mode) > -1;
    if (currentShape && currentShape.parentNode && isCreator) {
      _PaintAction.removeShape(null);
    } else {
      var othertools = ["select", "grab", "rotate"];
      if (othertools.indexOf(Paint.mode) < 0) {
        return;
      }
      if (Paint.mode == "select") {
        if (timeoutEvent2) {
          clearTimeout(timeoutEvent2);
        }
        if (dragging) {
          _PaintAction.stopDrag();
        }
      }
      if (Paint.mode == "grab" || Paint.mode == "rotate") {
        cmdForMouseUp[Paint.mode](e);
      }
      Ghost.clearLayer();
      if (target2 || currentShape) {
        PaintUndo.record();
      }
      Transform.updateAll(currentShape);
      Ghost.drawOffscreen();
    }
  }
  static setEvents() {
    window.onmousemove = function(evt) {
      _PaintAction.mouseMove(evt);
    };
    window.onmouseup = function(evt) {
      _PaintAction.mouseUp(evt);
    };
    window.ontouchcancel = function(evt) {
      _PaintAction.mouseMove(evt);
      _PaintAction.mouseUp(evt);
    };
  }
  static mouseMove(evt) {
    evt.preventDefault();
    cmdForMouseMove[Paint.mode](evt);
    Paint.deltaPoint = _PaintAction.getScreenPt(evt);
  }
  static mouseUp(evt) {
    evt.preventDefault();
    cmdForMouseUp[Paint.mode](evt);
    Ghost.clearLayer();
    if (!dragging) {
      var mt = _PaintAction.getMouseTarget(evt);
      if (mt) {
        cmdForClick[Paint.mode](evt);
      }
    } else if (target2 || currentShape) {
      PaintUndo.record();
    }
    if (Paint.mode == "grab") {
      Paint.mode = "select";
    }
    var oldshape = currentShape;
    currentShape = null;
    dragGroup = [];
    dragging = false;
    Transform.updateAll(oldshape);
    _PaintAction.clearEvents();
    Ghost.drawOffscreen();
  }
  //Calls from the Mouse Down
  static selectMouseDown(evt) {
    _PaintAction.fingerDown(evt);
    if (currentShape) {
      currentShape = currentShape.getAttribute("stencil") == "yes" ? null : currentShape;
    }
    var holdit = getValidHold();
    if (holdit) {
      _PaintAction.startHold(evt);
    }
    function getValidHold() {
      if (!currentShape) {
        return false;
      }
      if (currentShape.getAttribute("stencil") == "yes") {
        return false;
      }
      return true;
    }
  }
  static fingerDown(evt) {
    currentShape = Ghost.findTarget(evt);
    target2 = currentShape ? currentShape : target2;
    dragGroup = [];
  }
  static fingerUp(evt) {
    currentShape = null;
    target2 = null;
    _PaintAction.fingerDown(evt);
  }
  static startHold(e) {
    if (!currentShape) {
      return;
    }
    var repeat = function() {
      Layer.bringToFront(currentShape);
      timeoutEvent2 = null;
    };
    timeoutEvent2 = setTimeout(repeat, 600);
  }
  static cloneMouseDown(evt) {
    _PaintAction.fingerDown(evt);
    _PaintAction.selectTarget();
    if (currentShape && currentShape.id == "staticbkg") {
      currentShape = null;
    }
  }
  static pathMouseDown() {
    currentShape = SVGTools.addPolyline(gn("layer1"), Paint.initialPoint.x, Paint.initialPoint.y);
    var mt = Path.getClosestPath(Paint.initialPoint, currentShape, gn("layer1"), Path.maxDistance());
    if (!mt) {
      return;
    }
    var s = currentShape.getAttribute("stroke");
    var sw = currentShape.getAttribute("stroke-width");
    if (s != mt.getAttribute("stroke") || sw != mt.getAttribute("stroke-width")) {
      return;
    }
    var g = SVGTools.createGroup(gn("draglayer"), "cusorstate");
    Ghost.getKid(g, mt, 0.7);
    target2 = mt;
  }
  static selectTarget() {
    if (!currentShape) {
      return;
    }
    while (currentShape.parentNode.tagName == "g" && currentShape.parentNode.id != "layer1") {
      currentShape = currentShape.parentNode;
    }
  }
  static makeAgroup(group) {
    var p = gn("layer1");
    var g = SVGTools.createGroup(p, getIdFor("group"));
    for (var i = 0; i < group.length; i++) {
      p.removeChild(group[i]);
      g.appendChild(group[i]);
    }
    return g;
  }
  static ellipseMouseDown() {
    currentShape = SVGTools.addEllipse(gn("layer1"), Paint.initialPoint.x, Paint.initialPoint.y);
  }
  static rectMouseDown() {
    currentShape = SVGTools.addRect(gn("layer1"), Paint.initialPoint.x, Paint.initialPoint.y);
  }
  static triMouseDown() {
    currentShape = SVGTools.addTriangle(gn("layer1"), Paint.initialPoint.x, Paint.initialPoint.y);
  }
  static grabMouseDown() {
    currentShape = target2;
    currentShape.setAttributeNS(null, "fill", Path.selectedDotColor);
    currentShape.setAttributeNS(null, "r", String(Number(currentShape.getAttribute("r")) * 1.5));
  }
  //Calls from the Mouse Move
  static selectMouseMove(evt) {
    if (evt.touches && evt.touches.length > 1) {
      return;
    }
    if (_PaintAction.onBackground()) {
      _PaintAction.clearEvents();
      Paint.Scroll(evt);
      return;
    } else {
      _PaintAction.moveObject(evt);
    }
  }
  static moveObject(evt) {
    if (!target2) {
      return;
    }
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.initialPoint);
    if (!dragging && Vector.len(delta2) > mindist) {
      _PaintAction.startDragShape(evt);
    }
    if (!dragging) {
      return;
    }
    for (var i = 0; i < dragGroup.length; i++) {
      Transform.extract(dragGroup[i], 2).setTranslate(delta2.x, delta2.y);
    }
    Transform.extract(gn("ghostgroup"), 2).setTranslate(delta2.x, delta2.y);
  }
  static onBackground() {
    if (!currentShape) {
      return true;
    }
    if (target2.id.indexOf("staticbkg") > -1 || currentShape.getAttribute("stencil") == "yes") {
      return true;
    }
    return false;
  }
  static paintBucketMouseMove(evt) {
    Ghost.findTarget(evt);
  }
  static isMoving(evt) {
    if (dragging) {
      return true;
    }
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.initialPoint);
    return !dragging && Vector.len(delta2) > mindist;
  }
  static fingerMove(evt) {
    Ghost.findTarget(evt);
  }
  static cloneMouseMove(evt) {
    Ghost.findTarget(evt);
  }
  static startDragShape(e) {
    if (timeoutEvent2) {
      clearTimeout(timeoutEvent2);
    }
    _PaintAction.selectTarget();
    timeoutEvent2 = null;
    Path.quitEditMode();
    dragGroup = Layer.findGroup(currentShape);
    for (var i = 0; i < dragGroup.length; i++) {
      Transform.eleminateTranslates(dragGroup[i]);
      gn("layer1").appendChild(dragGroup[i]);
    }
    Ghost.highlight(dragGroup);
    for (var j = 0; j < dragGroup.length; j++) {
      Transform.appendForMove(dragGroup[j], Transform.getTranslateTransform());
    }
    Transform.appendForMove(gn("ghostgroup"), Transform.getTranslateTransform());
    dragging = true;
  }
  static rotateMouseMove(evt) {
    if (!target2) {
      return;
    }
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.initialPoint);
    if (!dragging && Vector.len(delta2) > mindist) {
      _PaintAction.startRotateShape(evt);
    }
    if (!currentShape) {
      return;
    }
    if (!dragging) {
      return;
    }
    _PaintAction.rotateFromMouse(evt, currentShape);
    _PaintAction.rotateFromMouse(evt, gn("ghostgroup"));
  }
  static startRotateShape(evt) {
    _PaintAction.selectTarget();
    if (!currentShape) {
      return;
    }
    if (currentShape && currentShape.tagName.toLowerCase() == "svg") {
      currentShape = null;
    }
    if (_PaintAction.onBackground()) {
      currentShape = null;
    }
    if (!currentShape) {
      return;
    }
    dragGroup = Layer.findGroup(currentShape);
    Ghost.highlight(dragGroup);
    currentShape = _PaintAction.makeAgroup(dragGroup);
    var pt = _PaintAction.getScreenPt(evt);
    var mtx = Transform.getCombinedMatrices(currentShape);
    _PaintAction.center = SVGTools.getBoxCenter(currentShape);
    var center = {
      x: _PaintAction.center.x,
      y: _PaintAction.center.y
    };
    center = Transform.point(center.x, center.y, mtx);
    var delta2 = Vector.diff(center, pt);
    startAngle = Math.atan2(delta2.y, delta2.x) * (180 / Math.PI) % 360;
    startAngle -= 90;
    SVGTools.getBoxCenter(currentShape);
    dragging = true;
  }
  static rotateFromMouse(evt, elem) {
    var pt = _PaintAction.getScreenPt(evt);
    var rot = Transform.getRotation(elem);
    var mtx = Transform.getCombinedMatrices(elem);
    var center = {
      x: _PaintAction.center.x,
      y: _PaintAction.center.y
    };
    center = Transform.point(center.x, center.y, mtx);
    var delta2 = Vector.diff(center, pt);
    var angle = Math.atan2(delta2.y, delta2.x) * (180 / Math.PI) % 360;
    angle -= 90;
    angle -= startAngle;
    angle = angle < 0 ? 360 + angle : angle;
    angle = angle % 360;
    rot.setRotate(angle, center.x, center.y);
  }
  static rectMouseMove(evt) {
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.initialPoint);
    if (!dragging && Vector.len(delta2) > mindist) {
      dragging = true;
    }
    if (!dragging) {
      return;
    }
    var w = Math.abs(delta2.x);
    var h = Math.abs(delta2.y);
    var new_x, new_y;
    if (evt.shiftKey) {
      w = h = Math.max(w, h);
      new_x = Paint.initialPoint.x < pt.x ? Paint.initialPoint.x : Paint.initialPoint.x - w;
      new_y = Paint.initialPoint.y < pt.y ? Paint.initialPoint.y : Paint.initialPoint.y - h;
    } else {
      new_x = Math.min(Paint.initialPoint.x, pt.x);
      new_y = Math.min(Paint.initialPoint.y, pt.y);
    }
    var attr = {
      "width": w,
      "height": h,
      "x": new_x,
      "y": new_y
    };
    for (var val in attr) {
      currentShape.setAttributeNS(null, val, String(attr[val]));
    }
  }
  static triMouseMove(evt) {
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.initialPoint);
    if (!dragging && Vector.len(delta2) > mindist) {
      dragging = true;
    }
    if (!dragging) {
      return;
    }
    var w = delta2.x;
    var h = delta2.y;
    var x = Paint.initialPoint.x;
    var y = Paint.initialPoint.y;
    var cmds = [["M", x, y + h], ["L", x + w * 0.5, y], ["L", x + w, y + h], ["L", x, y + h], ["z"]];
    var d = SVG2Canvas.arrayToString(cmds);
    currentShape.setAttribute("d", d);
  }
  static pathMouseMove(evt) {
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.initialPoint);
    if (!dragging && Vector.len(delta2) > mindist) {
      dragging = true;
    }
    if (!dragging) {
      return;
    }
    var place = " " + pt.x + "," + pt.y + " ";
    var d = currentShape.getAttribute("points");
    d += place;
    currentShape.setAttributeNS(null, "points", d);
  }
  static ellipseMouseMove(evt) {
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.initialPoint);
    if (!dragging && Vector.len(delta2) > mindist) {
      dragging = true;
    }
    if (!dragging) {
      return;
    }
    var w = Math.abs(delta2.x);
    var h = Math.abs(delta2.y);
    var new_x, new_y;
    if (evt.shiftKey) {
      w = h = Math.max(w, h);
      new_x = Paint.initialPoint.x < pt.x ? Paint.initialPoint.x : Paint.initialPoint.x - w;
      new_y = Paint.initialPoint.y < pt.y ? Paint.initialPoint.y : Paint.initialPoint.y - h;
    } else {
      new_x = Math.min(Paint.initialPoint.x, pt.x);
      new_y = Math.min(Paint.initialPoint.y, pt.y);
    }
    var rx = w / 2;
    var cx = new_x + rx;
    var ry = h / 2;
    var cy = new_y + ry;
    var attr = {
      "cx": cx,
      "cy": cy,
      "rx": rx,
      "ry": ry
    };
    for (var val in attr) {
      currentShape.setAttributeNS(null, val, String(attr[val]));
    }
  }
  static grabMouseMove(evt) {
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, Paint.deltaPoint);
    _PaintAction.movePointByDrag(delta2.x, delta2.y);
    dragging = true;
    var elem = gn(currentShape.getAttribute("parentid"));
    var state = SVG2Canvas.isCloseDPath(elem);
    Path.reshape(elem);
    var newstate = SVG2Canvas.isCloseDPath(elem);
    if (state != newstate) {
      _PaintAction.playSnapSound(state);
    }
    if (SVG2Canvas.isCloseDPath(elem)) {
      return;
    }
    if (!isPathTip(currentShape)) {
      return;
    }
    Ghost.clearLayer();
    var mt = Path.getClosestPath(pt, elem, gn("layer1"), Path.maxDistance());
    if (!mt) {
      return;
    }
    var g = SVGTools.createGroup(gn("draglayer"), "cusorstate");
    Ghost.getKid(g, mt, 0.7);
    target2 = mt;
  }
  static playSnapSound(state) {
    ScratchAudio.sndFX(state ? "cut.wav" : "snap.wav");
  }
  static movePointByDrag(dx, dy) {
    var cx = currentShape.getAttribute("cx");
    var cy = currentShape.getAttribute("cy");
    var newcx = Number(cx) + dx;
    var newcy = Number(cy) + dy;
    currentShape.setAttributeNS(null, "cx", String(newcx));
    currentShape.setAttributeNS(null, "cy", String(newcy));
  }
  //Calls from the Mouse Up
  static rectMouseUp(evt) {
    var w = Number(currentShape.getAttribute("width"));
    var h = Number(currentShape.getAttribute("height"));
    var x = Number(currentShape.getAttribute("x"));
    var y = Number(currentShape.getAttribute("y"));
    var pl = [{
      x,
      y
    }, {
      x: x + w,
      y
    }, {
      x: x + w,
      y: y + h
    }, {
      x,
      y: y + h
    }];
    var shape = Path.makeRectangle(currentShape.parentNode, pl);
    currentShape.parentNode.removeChild(currentShape);
    currentShape = shape;
    var box = SVGTools.getBox(currentShape);
    if (SVGTools.notValidBox(box) || box.isEmpty()) {
      _PaintAction.removeShape(evt);
    }
  }
  static triMouseUp(evt) {
    var box = SVGTools.getBox(currentShape);
    if (SVGTools.notValidBox(box)) {
      _PaintAction.removeShape(evt);
    }
  }
  static ellipseMouseUp(evt) {
    var box = SVGTools.getBox(currentShape);
    if (SVGTools.notValidBox(box)) {
      _PaintAction.removeShape(evt);
    } else {
      var shape = Path.makeEllipse(currentShape);
      currentShape.parentNode.removeChild(currentShape);
      currentShape = shape;
    }
  }
  static rotateMouseUp(evt) {
    if (!currentShape) {
      return;
    }
    if (!dragging) {
      return;
    }
    _PaintAction.rotateFromMouse(evt, currentShape);
    var erot = Transform.getRotation(currentShape);
    for (var i = 0; i < dragGroup.length; i++) {
      gn("layer1").appendChild(dragGroup[i]);
      if (erot.angle != 0) {
        Transform.rotateFromPoint(erot, dragGroup[i]);
      }
    }
    gn("layer1").removeChild(currentShape);
    currentShape = target2;
  }
  static pathMouseUp(evt) {
    if (dragging) {
      currentShape = Path.process(currentShape);
      var box1 = SVGTools.getBox(currentShape);
      var box2 = new Rectangle(0, 0, Paint.workspaceWidth, Paint.workspaceHeight);
      if (!box1.intersects(box2)) {
        _PaintAction.removeShape(evt);
      } else if (!SVG2Canvas.isCloseDPath(currentShape)) {
        var pt = _PaintAction.getScreenPt(evt);
        var mt = Path.getClosestPath(pt, currentShape, gn("layer1"), Path.maxDistance());
        if (!mt) {
          pt = Path.getCommands(currentShape.getAttribute("d"))[0].pt;
          mt = Path.getClosestPath(
            pt,
            currentShape,
            gn("layer1"),
            Path.maxDistance()
          );
        }
        var s = currentShape.getAttribute("stroke");
        var sw = currentShape.getAttribute("stroke-width");
        if (mt && s == mt.getAttribute("stroke") && sw == mt.getAttribute("stroke-width")) {
          currentShape = Path.join(currentShape, mt, pt);
        }
        if (gn("staticbkg")) {
          Path.checkBackgroundCrop(currentShape);
        }
      }
    } else {
      _PaintAction.removeShape(evt);
    }
  }
  static selectMouseUp(evt) {
    if (timeoutEvent2) {
      clearTimeout(timeoutEvent2);
    }
    if (dragging) {
      _PaintAction.stopDrag();
    } else {
      _PaintAction.fingerUp(evt);
      if (Path.selector && Path.selector != currentShape) {
        Path.quitEditMode();
      }
      if (!currentShape) {
        return;
      }
      if (dragging && !Path.selector) {
        Path.enterEditMode(currentShape);
      }
    }
  }
  static scissorsMouseUp(evt) {
    _PaintAction.fingerUp(evt);
    _PaintAction.selectTarget();
    if (currentShape && currentShape.id == "fixed") {
      currentShape = null;
    }
    if (!currentShape) {
      return;
    }
    ScratchAudio.sndFX("cut.wav");
    var mtimage = SVGImage.getImage(currentShape);
    var p = currentShape.parentNode;
    var res = [];
    for (var i = 0; i < p.childElementCount; i++) {
      var kid = p.childNodes[i];
      if (kid.getAttribute("relatedto") == currentShape.id) {
        res.push(kid);
      }
    }
    for (var j = 0; j < res.length; j++) {
      p.removeChild(res[j]);
    }
    if (mtimage) {
      SVGImage.removeClip(mtimage);
    } else if (currentShape.parentNode) {
      currentShape.parentNode.removeChild(currentShape);
    }
    SVGTools.cleanup(gn("layer1"));
    PaintUndo.record();
  }
  static cameraMouseUp(evt) {
    if (isTouch) {
      _PaintAction.fingerUp(evt);
    }
    if (currentShape == void 0) {
      return;
    }
    Camera.startFeed(currentShape);
    ScratchJr.onBackButtonCallback.push(function() {
      Paint.closeCameraMode();
    });
  }
  static cloneMouseUp(evt) {
    _PaintAction.fingerUp(evt);
    _PaintAction.selectTarget();
    if (currentShape && currentShape.id == "staticbkg") {
      currentShape = null;
    }
    if (!currentShape) {
      return;
    }
    ScratchAudio.sndFX("copy.wav");
    SVGTools.cloneSVGelement(currentShape);
    Ghost.clearLayer();
    PaintUndo.record();
    _PaintAction.backToSelect(evt);
  }
  static setStrokeSizeAndColor() {
    if (!currentShape) {
      return;
    }
    if (currentShape.getAttribute("stroke") == Paint.fillcolor && currentShape.getAttribute("stroke-width") == String(Paint.strokewidth)) {
      return;
    }
    var stroke = currentShape.getAttribute("stroke");
    if (!stroke) {
      var borderEl = gn(currentShape.id + "Border");
      if (borderEl) {
        currentShape = borderEl;
      }
      if (currentShape.id.indexOf("Border") > -1) {
        currentShape.setAttribute("fill", Paint.fillcolor);
      }
    } else {
      currentShape.setAttribute("stroke", Paint.fillcolor);
      currentShape.setAttribute("stroke-width", String(Paint.strokewidth));
    }
    PaintUndo.record();
  }
  static paintBucketMouseUp(evt) {
    _PaintAction.fingerUp(evt);
    if (!currentShape) {
      return;
    }
    _PaintAction.paintRegion(evt);
  }
  static paintRegion(e) {
    ScratchAudio.sndFX("splash.wav");
    switch (_PaintAction.getPaintType()) {
      case "paths":
        Path.setData(currentShape);
        break;
      case "image":
        var mt = SVGImage.getImage(currentShape);
        SVGImage.paint(mt);
        break;
      // if the stroke and fill are the same and they are "relatedto" paths stokes needs to be changed too.
      case "check":
        var group = Layer.findGroup(currentShape);
        for (var i = 0; i < group.length; i++) {
          if (group[i].id == currentShape.id || group[i].getAttribute("relatedto") == currentShape.id) {
            group[i].setAttribute("stroke", Paint.fillcolor);
          }
        }
        break;
      default:
        break;
    }
    currentShape.setAttribute("fill", Paint.fillcolor);
    PaintUndo.record();
  }
  static getPaintType() {
    var mtimage = SVGImage.getImage(currentShape);
    if (mtimage) {
      return "image";
    }
    if (!_PaintAction.justPaint(currentShape)) {
      return "paths";
    }
    if (currentShape.getAttribute("fill") == null && currentShape.getAttribute("stroke") == null) {
      return "paths";
    }
    if (currentShape.getAttribute("fill") == currentShape.getAttribute("stroke")) {
      return "check";
    }
    return "none";
  }
  static justPaint(mt) {
    if (mt.tagName != "path") {
      return true;
    }
    if (SVG2Canvas.isCompoundPath(mt)) {
      return true;
    }
    return mt.getAttribute("fill") != "none" || mt.getAttribute("fill") != null;
  }
  static stopDrag() {
    if (!dragging) {
      return;
    }
    if (dragGroup.length == 0) {
      return;
    }
    for (var i = 0; i < dragGroup.length; i++) {
      Transform.eleminateTranslates(dragGroup[i]);
    }
    var box1 = SVGTools.getTransformedBox(dragGroup[0]);
    var box2 = new Rectangle(0, 0, Paint.workspaceWidth, Paint.workspaceHeight);
    for (var j = 1; j < dragGroup.length; j++) {
      box1 = box1.union(
        SVGTools.getTransformedBox(dragGroup[j]).expandBy(
          SVGTools.getPenWidthForm(dragGroup[j])
        )
      );
    }
    if (!box1.intersects(box2)) {
      ScratchAudio.sndFX("boing.wav");
      var delta2 = {
        x: 0,
        y: 0
      };
      if (box1.x > Paint.workspaceWidth) {
        delta2.x = Math.floor(Paint.workspaceWidth - box1.x - box1.width * 0.25);
      }
      if (box1.y > box2.height) {
        delta2.y = Math.floor(Paint.workspaceHeight - box1.y - box1.height * 0.25);
      }
      if (box1.x < 0) {
        delta2.x = Math.floor(-box1.x - box1.width * 0.75);
      }
      if (box1.y < 0) {
        delta2.y = Math.floor(-box1.y - box1.height * 0.75);
      }
      window.xform.setTranslate(delta2.x, delta2.y);
      for (var k = 0; k < dragGroup.length; k++) {
        Transform.translateTo(dragGroup[k], window.xform);
      }
    }
    dragGroup = [];
  }
  static ignoreEvt() {
  }
  static backToSelect(e) {
    Paint.selectButton("select");
  }
  static grabMouseUp(evt) {
    var elem = gn(currentShape.getAttribute("parentid"));
    currentShape.setAttributeNS(null, "fill", Path.getDotColor(elem, currentShape));
    currentShape.setAttributeNS(null, "r", String(Number(currentShape.getAttribute("r")) / 1.5));
    var pt = _PaintAction.getScreenPt(evt);
    if (!dragging) {
      Path.deleteDot(currentShape, elem);
    } else {
      var delta2 = Vector.diff(pt, Paint.deltaPoint);
      _PaintAction.movePointByDrag(delta2.x, delta2.y);
      Path.reshape(elem);
      if (isPathTip(currentShape) && !SVG2Canvas.isCloseDPath(elem)) {
        var mt = Path.getClosestPath(pt, elem, gn("layer1"), Path.maxDistance());
        if (!mt) {
          return;
        }
        if (mt != elem) {
          elem = Path.join(elem, mt, pt);
        }
      }
      Path.showDots(elem);
    }
  }
  /////////////////////////////////////////////
  //Calls for click
  static removeShape(e) {
    if (currentShape == void 0) {
      return;
    }
    currentShape.parentNode.removeChild(currentShape);
    currentShape = null;
  }
  static rectClick(evt) {
    if (!currentShape) {
      return;
    }
    _PaintAction.removeShape(evt);
    currentShape = SVGTools.addRect(gn("layer1"), Paint.initialPoint.x, Paint.initialPoint.y);
    var c = currentShape.getAttribute("stroke");
    var attr = {
      "width": 16 / Paint.currentZoom,
      "height": 16 / Paint.currentZoom
    };
    for (var val in attr) {
      currentShape.setAttribute(val, String(attr[val]));
    }
    _PaintAction.rectMouseUp(evt);
    attr = {
      "fill": String(c),
      "stroke-width": 4
    };
    for (var vl in attr) {
      currentShape.setAttribute(vl, String(attr[vl]));
    }
    PaintUndo.record();
  }
  static ellipseClick(evt) {
    if (!currentShape) {
      return;
    }
    _PaintAction.removeShape(evt);
    currentShape = SVGTools.addEllipse(gn("layer1"), Paint.initialPoint.x, Paint.initialPoint.y);
    var c = currentShape.getAttribute("stroke");
    var attr = {
      "rx": 8 / Paint.currentZoom,
      "ry": 8 / Paint.currentZoom
    };
    for (var val in attr) {
      currentShape.setAttribute(val, String(attr[val]));
    }
    _PaintAction.ellipseMouseUp(evt);
    attr = {
      "fill": String(c),
      "stroke-width": 4
    };
    for (var vl in attr) {
      currentShape.setAttribute(vl, String(attr[vl]));
    }
    PaintUndo.record();
  }
  static pathClick(evt) {
    currentShape = Ghost.findWho(evt);
    if (!currentShape) {
      return;
    }
    if (currentShape.getAttribute("fixed") != "yes") {
      _PaintAction.setStrokeSizeAndColor();
    }
  }
  static triClick(evt) {
    if (!currentShape) {
      return;
    }
    _PaintAction.removeShape(evt);
    currentShape = SVGTools.addTriangle(gn("layer1"), Paint.initialPoint.x, Paint.initialPoint.y);
    var w = 16 / Paint.currentZoom;
    var h = 16 / Paint.currentZoom;
    var x = Paint.initialPoint.x;
    var y = Paint.initialPoint.y;
    var cmds = [["M", x, y + h], ["L", x + w * 0.5, y], ["L", x + w, y + h], ["L", x, y + h]];
    var d = SVG2Canvas.arrayToString(cmds);
    d += "z";
    var c = currentShape.getAttribute("stroke");
    var attr = {
      "fill": String(c),
      "stroke-width": 2,
      "d": d
    };
    for (var val in attr) {
      currentShape.setAttribute(val, String(attr[val]));
    }
    PaintUndo.record();
  }
  static selectClick(evt) {
    if (!timeoutEvent2) {
      return;
    }
    timeoutEvent2 = null;
    if (!currentShape) {
      return;
    }
    if (currentShape && currentShape.parentNode && currentShape.parentNode.tagName == "g" && currentShape.parentNode.id != "layer1") {
      return;
    }
    if (currentShape && currentShape.id == "staticbkg") {
      return;
    }
    if (currentShape && currentShape.tagName == "g") {
      return;
    }
    var pt = _PaintAction.getScreenPt(evt);
    var delta2 = Vector.len(Vector.diff(pt, Paint.initialPoint));
    if (delta2 > mindist) {
      return;
    }
    if (Path.selector && Path.selector == currentShape) {
      Path.addDot(Path.selector);
    }
    if (!Path.selector) {
      Path.enterEditMode(currentShape);
    }
  }
  static paintBucketClick() {
  }
  //Mouse Targets and groups
  ///////////////////////////
  static getMouseTarget(evt) {
    if (evt == null) {
      return null;
    }
    var mt = evt.target;
    if (!mt) {
      return null;
    }
    var useEl = mt;
    if (useEl.correspondingUseElement) {
      mt = useEl.correspondingUseElement;
    }
    if (mt.id == "maincanvas") {
      return mt.childNodes[0];
    }
    if (mt.id == "workspacebkg") {
      return mt;
    }
    while (mt && Paint.xmlns != mt.namespaceURI && mt != Paint.root && mt != Paint.frame) {
      mt = mt.parentNode;
    }
    if (!mt) {
      return null;
    }
    if (!mt.parentNode) {
      return null;
    }
    if (mt.parentNode.id.indexOf("group_") > -1) {
      return mt.parentNode;
    }
    return mt;
  }
  static getScreenPt(evt) {
    var pt = Events.getTargetPoint(evt);
    return _PaintAction.zoomPt(pt);
  }
  static zoomPt(pt) {
    var mc = gn("maincanvas");
    if (!mc) {
      return pt;
    }
    var pt2 = Paint.root.createSVGPoint();
    pt2.x = pt.x;
    pt2.y = pt.y;
    var globalPoint = pt2.matrixTransform(Paint.root.getScreenCTM().inverse());
    globalPoint.x = globalPoint.x / Paint.currentZoom;
    globalPoint.y = globalPoint.y / Paint.currentZoom;
    return globalPoint;
  }
};
var cmdForMouseDown = {
  "select": PaintAction.selectMouseDown,
  "rotate": PaintAction.fingerDown,
  "tri": PaintAction.triMouseDown,
  "rect": PaintAction.rectMouseDown,
  "path": PaintAction.pathMouseDown,
  "ellipse": PaintAction.ellipseMouseDown,
  "grab": PaintAction.grabMouseDown,
  "paintbucket": PaintAction.fingerDown,
  "stamper": PaintAction.cloneMouseDown,
  "scissors": PaintAction.cloneMouseDown,
  "camera": PaintAction.fingerDown
};
var cmdForMouseMove = {
  "select": PaintAction.selectMouseMove,
  "rotate": PaintAction.rotateMouseMove,
  "tri": PaintAction.triMouseMove,
  "rect": PaintAction.rectMouseMove,
  "path": PaintAction.pathMouseMove,
  "ellipse": PaintAction.ellipseMouseMove,
  "grab": PaintAction.grabMouseMove,
  "paintbucket": PaintAction.paintBucketMouseMove,
  "stamper": PaintAction.cloneMouseMove,
  "scissors": PaintAction.cloneMouseMove,
  "camera": PaintAction.fingerMove
};
var cmdForMouseUp = {
  "select": PaintAction.selectMouseUp,
  "rotate": PaintAction.rotateMouseUp,
  "tri": PaintAction.triMouseUp,
  "rect": PaintAction.rectMouseUp,
  "path": PaintAction.pathMouseUp,
  "ellipse": PaintAction.ellipseMouseUp,
  "grab": PaintAction.grabMouseUp,
  "paintbucket": PaintAction.paintBucketMouseUp,
  "stamper": PaintAction.ignoreEvt,
  "scissors": PaintAction.scissorsMouseUp,
  "camera": PaintAction.cameraMouseUp
};
var cmdForClick = {
  "select": PaintAction.selectClick,
  "rotate": PaintAction.ignoreEvt,
  "tri": PaintAction.triClick,
  "rect": PaintAction.rectClick,
  "path": PaintAction.pathClick,
  "ellipse": PaintAction.ellipseClick,
  "grab": PaintAction.ignoreEvt,
  "paintbucket": PaintAction.paintBucketClick,
  "stamper": PaintAction.cloneMouseUp,
  "scissors": PaintAction.ignoreEvt,
  "camera": PaintAction.ignoreEvt
};

// src/app/src/painteditor/Ghost.ts
var maskCanvas = document.createElement("canvas");
var maskData = {};
var linemask = 16;
var maskColor = 16;
var hitTestCtx = null;
function pointInPathData(d, x, y) {
  if (!hitTestCtx) {
    hitTestCtx = document.createElement("canvas").getContext("2d");
  }
  if (!hitTestCtx) {
    return false;
  }
  hitTestCtx.save();
  hitTestCtx.setTransform(1, 0, 0, 1, 0, 0);
  let inside = false;
  try {
    inside = hitTestCtx.isPointInPath(new Path2D(d), x, y);
  } finally {
    hitTestCtx.restore();
  }
  return inside;
}
var Ghost = class _Ghost {
  static get maskCanvas() {
    return maskCanvas;
  }
  static get maskData() {
    return maskData;
  }
  static set maskData(newMaskData) {
    maskData = newMaskData;
  }
  static get linemask() {
    return linemask;
  }
  static highlight(group) {
    _Ghost.clearLayer();
    var g = SVGTools.createGroup(gn("draglayer"), "ghostgroup");
    g.setAttribute("class", "active3d");
    for (var i = 0; i < group.length; i++) {
      _Ghost.hightlightElem(g, group[i], 0.5, "5,5", "black", 3);
    }
  }
  static hightlightElem(p, elem, opacity, space, c, sw) {
    if (elem.tagName == "g") {
      for (var i = 0; i < elem.childElementCount; i++) {
        _Ghost.hightlightElem(p, elem.childNodes[i], opacity, space, c, sw);
      }
    } else {
      if (_Ghost.hasGhost(elem)) {
        _Ghost.getKid(p, elem, opacity, space, c, sw);
      }
    }
  }
  static hasGhost(elem) {
    if (!elem.id) {
      return true;
    }
    if (elem.id.indexOf("Border") < 0) {
      return true;
    }
    var mfill = elem.id.split("Border")[0];
    if (mfill == "") {
      return true;
    }
    return !gn(mfill);
  }
  static clearLayer() {
    var p = gn("draglayer");
    if (!p) {
      return;
    }
    while (p.childElementCount > 0) {
      p.removeChild(p.childNodes[0]);
    }
  }
  ///////////////////////////////////
  // Ghost Management
  ///////////////////////////////////
  static findTarget(evt) {
    _Ghost.clearLayer();
    if (evt == null) {
      return null;
    }
    var pt = PaintAction.getScreenPt(evt);
    if (_Ghost.outsideArea(Vector.floor(Vector.scale(pt, Paint.currentZoom)), maskCanvas)) {
      return null;
    } else {
      return _Ghost.allTools(pt);
    }
  }
  static findWho(evt) {
    _Ghost.clearLayer();
    if (evt == null) {
      return null;
    }
    var pt = PaintAction.getScreenPt(evt);
    var color = _Ghost.getPtColor(pt);
    var id = maskData[color];
    var mt = id && gn(id) ? gn(id) : null;
    return mt && mt.getAttribute("fixed") != "yes" ? mt : _Ghost.getHitObject(pt);
  }
  static allTools(pt) {
    var color = _Ghost.getPtColor(pt);
    var id = maskData[color];
    if (id) {
      return _Ghost.hitSomething(pt, id, color);
    } else {
      return _Ghost.notHitted(pt);
    }
  }
  static hitSomething(pt, id, color) {
    var mt = gn(id);
    var dogohst = true;
    if (mt && mt.getAttribute("relatedto")) {
      mt = gn(mt.getAttribute("relatedto"));
    }
    switch (Paint.mode) {
      case "select":
      case "rotate":
      case "stamper":
      case "scissors":
      case "path":
        if (mt.getAttribute("fixed") == "yes") {
          mt = _Ghost.getHitObject(pt, Paint.mode == "path");
        }
        dogohst = mt ? mt.getAttribute("fixed") != "yes" : false;
        break;
      case "paintbucket":
      case "camera":
        mt = _Ghost.getHitObject(pt, Paint.mode == "path");
        break;
    }
    if (mt && dogohst) {
      return _Ghost.setGhostTo(mt);
    }
    return null;
  }
  static svgHit(pt) {
    var rpos = Paint.root.createSVGRect();
    rpos.x = pt.x;
    rpos.y = pt.y;
    rpos.width = 1;
    rpos.height = 1;
    var matches = Paint.root.getIntersectionList(rpos, null);
    if (matches !== null) {
      return matches;
    } else {
      return _Ghost.svgHitHelper(gn("layer1"), pt);
    }
  }
  /**
   * Iterates all the path elements of the root and checks if 'pt'
   * is inside the path.
   */
  static svgHitHelper(root2, pt) {
    var matches = [];
    if (!root2) {
      return matches;
    }
    var paths = root2.getElementsByTagName("path");
    for (var i = 0; i < paths.length; ++i) {
      var pathData = paths[i].getAttribute("d");
      if (pathData && pointInPathData(pathData, pt.x, pt.y)) {
        matches.push(paths[i]);
      }
    }
    return matches;
  }
  static setGhostTo(mt) {
    var g = SVGTools.createGroup(gn("draglayer"), "ghostlayer");
    _Ghost.setDashBorder(g, mt, 0.7, "5,5", "black", 3);
    return mt;
  }
  static notHitted(pt) {
    var mt;
    switch (Paint.mode) {
      case "select":
      case "rotate":
      case "stamper":
      case "scissors":
        mt = _Ghost.getActualHit(_Ghost.getHitObject(pt, Paint.mode != "path"), pt);
        if (mt && mt.id) {
          if (mt.getAttribute("relatedto")) {
            mt = gn(mt.getAttribute("relatedto"));
          }
          var isStencil = mt.id.indexOf("staticbkg") > -1 || mt.getAttribute("stencil") == "yes" || mt.getAttribute("fixed") == "yes";
          if (isStencil) {
            mt = void 0;
          }
        }
        break;
      case "camera":
      case "paintbucket":
        var targ = _Ghost.getHitObject(pt, false);
        var target3 = _Ghost.getActualHit(targ, pt);
        if (target3 && target3.nodeName != "g") {
          mt = target3;
        }
        break;
    }
    if (mt) {
      return _Ghost.setGhostTo(mt);
    }
    return null;
  }
  static getActualHit(mt, pt, id) {
    if (!mt) {
      return null;
    }
    pt = Vector.floor(Vector.scale(pt, Paint.currentZoom));
    var list = Layer.findUnderMe(mt);
    for (var i = 0; i < list.length; i++) {
      var obj = list[i];
      if (!_Ghost.contains(mt, obj)) {
        continue;
      }
      if (!_Ghost.hittedSingleObject(obj, pt)) {
        continue;
      }
      mt = obj;
    }
    return mt;
  }
  static contains(e1, e2) {
    var box1 = SVGTools.getBox(e1);
    var box2 = SVGTools.getBox(e2);
    var boxi = box1.intersection(box2);
    if (boxi.isEmpty()) {
      return false;
    }
    return boxi.isEqual(box2);
  }
  static hittedSingleObject(obj, pt) {
    var ctx = ScratchJr.workingCanvas.getContext("2d");
    ctx.clearRect(0, 0, ScratchJr.workingCanvas.width, ScratchJr.workingCanvas.height);
    ctx.save();
    Layer.drawInContext(obj, ctx, Paint.currentZoom);
    ctx.restore();
    var pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
    return pixel[3] != 0;
  }
  static getPtColor(pt) {
    pt = Vector.floor(Vector.scale(pt, Paint.currentZoom));
    if (_Ghost.outsideArea(pt, maskCanvas)) {
      return 0;
    }
    var ctx = maskCanvas.getContext("2d");
    var pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
    var r = pixel[0];
    var g = pixel[1];
    var b = pixel[2];
    return _Ghost.getHex([r, g, b]);
  }
  static outsideArea(node, canvas) {
    if (node.x < 0 || node.x > canvas.width - 1) {
      return true;
    }
    if (node.y < 0 || node.y > canvas.height - 1) {
      return true;
    }
    return false;
  }
  static setDashBorder(p, elem, opacity, space, c, sw) {
    if (elem.tagName == "g") {
      for (var i = 0; i < elem.childElementCount; i++) {
        _Ghost.setDashBorder(p, elem.childNodes[i], opacity, space, c, sw);
      }
    } else {
      _Ghost.getKid(p, elem, opacity, space, c, sw);
    }
  }
  static getKid(p, elem, opacity, space, c, sw) {
    if (!sw) {
      sw = elem.getAttribute("stroke-width");
    }
    var attr = SVGTools.attributeTable[elem.tagName];
    if (!attr) {
      attr = [];
    }
    var drawattr = SVGTools.attributePenTable[elem.tagName];
    if (!drawattr) {
      drawattr = [];
    }
    var shape = document.createElementNS(Paint.xmlns, elem.tagName);
    p.appendChild(shape);
    attr = attr.concat(drawattr);
    for (var i = 0; i < attr.length; i++) {
      if (elem.getAttribute(attr[i]) == null) {
        continue;
      }
      shape.setAttribute(attr[i], elem.getAttribute(attr[i]));
    }
    shape.setAttribute("fill", "none");
    shape.setAttribute("stroke", c);
    shape.setAttribute("stroke-width", String(Number(sw) / Paint.currentZoom));
    shape.setAttribute("class", "active3d");
    var ang = Transform.getRotationAngle(elem);
    if (ang != 0) {
      Transform.applyRotation(shape, ang);
    }
    if (opacity) {
      shape.setAttribute("opacity", String(opacity));
    }
    var dash = document.createElementNS(Paint.xmlns, elem.tagName);
    p.appendChild(dash);
    attr = attr.concat(drawattr);
    for (var j = 0; j < attr.length; j++) {
      if (elem.getAttribute(attr[j]) == null) {
        continue;
      }
      dash.setAttribute(attr[j], elem.getAttribute(attr[j]));
    }
    dash.setAttribute("fill", "none");
    dash.setAttribute("stroke", "white");
    dash.setAttribute("stroke-width", String(3 / Paint.currentZoom));
    dash.setAttribute("stroke-dasharray", space);
    dash.setAttribute("class", "active3d");
    if (opacity) {
      dash.setAttribute("opacity", String(opacity));
    }
    if (ang != 0) {
      Transform.applyRotation(dash, ang);
    }
    return dash;
  }
  //////////////////////////////////////////////////
  //   Offscreen for cursor
  //////////////////////////////////////////////////
  static drawOffscreen() {
    setCanvasSize(
      maskCanvas,
      Math.round(Number(Paint.root.getAttribute("width")) * Paint.currentZoom),
      Math.round(Number(Paint.root.getAttribute("height")) * Paint.currentZoom)
    );
    var ctx = maskCanvas.getContext("2d");
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    var p = gn("layer1");
    if (!p) {
      return;
    }
    maskData = {};
    maskColor = 16;
    _Ghost.drawElements(p, ctx);
  }
  static drawElements(p, ctx) {
    for (var i = 0; i < p.childElementCount; i++) {
      var elem = p.childNodes[i];
      if (elem.id == "pathdots") {
        continue;
      }
      if (elem.tagName == "image") {
        continue;
      }
      if (elem.tagName == "clipPath") {
        continue;
      }
      if (elem.nodeName == "g") {
        _Ghost.drawElements(elem, ctx);
      } else {
        _Ghost.drawElement(elem, ctx);
      }
    }
  }
  static drawElement(elem, ctx) {
    var c = _Ghost.getRGB(maskColor);
    var bc = _Ghost.getRGB(maskColor + 8);
    maskColor += 16;
    ctx.save();
    var nostroke = !elem.getAttribute("stroke") || elem.getAttribute("stroke") == "none";
    var n = Number(elem.getAttribute("stroke-width"));
    ctx.lineWidth = nostroke ? 0 : n;
    ctx.fillStyle = elem.getAttribute("fill") == "none" ? "rgba(0,0,0,0)" : "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",255)";
    ctx.strokeStyle = !elem.getAttribute("stroke") ? "rgba(0,0,0,0)" : "rgba(" + bc[0] + "," + bc[1] + "," + bc[2] + ",255)";
    if (!SVG2Canvas.isCloseDPath(elem)) {
      ctx.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",255)";
    }
    if (elem.id.indexOf("pathborder_image") > -1) {
      ctx.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",255)";
    }
    if (!elem.getAttribute("fill") && !elem.getAttribute("stroke")) {
      ctx.fillStyle = "rgba(" + bc[0] + "," + bc[1] + "," + bc[2] + ",255)";
    }
    maskData[_Ghost.getHex(c)] = elem.id;
    maskData[_Ghost.getHex(bc)] = elem.id;
    var rot = Transform.extract(elem, 4);
    if (rot.angle != 0) {
      Layer.rotateFromCenter(ctx, elem, rot.angle);
    }
    ctx.scale(Paint.currentZoom, Paint.currentZoom);
    SVG2Canvas.processXMLnode(elem, ctx, true);
    ctx.restore();
    if (SVG2Canvas.isCloseDPath(elem)) {
      return;
    }
    ctx.save();
    ctx.scale(Paint.currentZoom, Paint.currentZoom);
    ctx.lineWidth = linemask < n ? n : linemask;
    ctx.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",255)";
    ctx.strokeStyle = "rgba(" + bc[0] + "," + bc[1] + "," + bc[2] + ",255)";
    rot = Transform.extract(elem, 4);
    if (rot.angle != 0) {
      Layer.rotateFromCenter(ctx, elem, rot.angle);
    }
    SVG2Canvas.renderPathTips(elem, ctx);
    ctx.restore();
  }
  static getRGB(color) {
    return [Number(color >> 16 & 255), Number(color >> 8 & 255), Number(color & 255)];
  }
  static getHex(rgb) {
    var r = rgb[0].toString(16);
    if (r.length < 2) {
      r = "0" + r;
    }
    var g = rgb[1].toString(16);
    if (g.length < 2) {
      g = "0" + g;
    }
    var b = rgb[2].toString(16);
    if (b.length < 2) {
      b = "0" + b;
    }
    return r + g + b;
  }
  static getHitObject(pt, isTip, exclude) {
    var list = _Ghost.svgHit(pt);
    pt = Vector.floor(Vector.scale(pt, Paint.currentZoom));
    if (!Paint.root) {
      return null;
    }
    setCanvasSize(
      ScratchJr.workingCanvas,
      Math.round(Number(Paint.root.getAttribute("width")) * Paint.currentZoom),
      Math.round(Number(Paint.root.getAttribute("height")) * Paint.currentZoom)
    );
    var ctx = ScratchJr.workingCanvas.getContext("2d");
    if (_Ghost.outsideArea(pt, ScratchJr.workingCanvas)) {
      return null;
    }
    ctx.clearRect(0, 0, ScratchJr.workingCanvas.width, ScratchJr.workingCanvas.height);
    return _Ghost.findHit(list, pt, ScratchJr.workingCanvas.getContext("2d"), isTip, exclude);
  }
  static findHit(list, pt, ctx, isTip, exclude) {
    for (var i = list.length - 1; i >= 0; i--) {
      var elem = list[i];
      if (exclude && elem == exclude) {
        continue;
      }
      var lw = elem.getAttribute("stroke-width") ? elem.getAttribute("stroke-width") : 0;
      ctx.save();
      Layer.drawInContext(elem, ctx, Paint.currentZoom, lw, isTip);
      ctx.restore();
      var pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      if (pixel[3] != 0) {
        return elem;
      }
    }
    return null;
  }
  ////////////////////
  // Debugging hit masks
  ////////////////////////
  static showmask() {
    var mask = newDiv(Paint.frame, 0, 0, maskCanvas.width, maskCanvas.height, {
      position: "absolute",
      zIndex: ScratchJr.layerTop + 20
    });
    mask.setAttribute("id", "ghostmask");
    mask.appendChild(maskCanvas);
  }
  static off() {
    gn("ghostmask").style.visibility = "hidden";
  }
  static on() {
    gn("ghostmask").style.visibility = "visible";
  }
};

// src/app/src/painteditor/Paint.ts
var namedForms = document.forms;
var xmlns = "http://www.w3.org/2000/svg";
var xmlnslink = "http://www.w3.org/1999/xlink";
var fillcolor = "#080808";
var workspaceWidth = 432;
var workspaceHeight = 384;
var mode = "select";
var pensizes = [1, 2, 4, 8, 16];
var strokewidth = 2;
var spriteId;
var currentName;
var costumeScale;
var nativeJr;
var isBkg = false;
var currentMd5 = null;
var currentZoom = 1;
var root;
var saving = false;
var paintFrame = null;
var saveMD5 = null;
var svgdata = null;
var splash = null;
var splashshade = null;
var maxZoom = 5;
var minZoom = 1;
var initialPoint = {
  x: 0,
  y: 0
};
var deltaPoint = {
  x: 0,
  y: 0
};
var Paint = class _Paint {
  static skipNext;
  static get xmlns() {
    return xmlns;
  }
  static get xmlnslink() {
    return xmlnslink;
  }
  static get fillcolor() {
    return fillcolor;
  }
  static get workspaceWidth() {
    return workspaceWidth;
  }
  static get workspaceHeight() {
    return workspaceHeight;
  }
  static get mode() {
    return mode;
  }
  static set mode(newMode) {
    mode = newMode;
  }
  static get strokewidth() {
    return strokewidth;
  }
  static get currentZoom() {
    return currentZoom;
  }
  static set currentZoom(newCurrentZoom) {
    currentZoom = 1;
  }
  static get root() {
    return root;
  }
  static get saving() {
    return saving;
  }
  static get frame() {
    return paintFrame;
  }
  static get splash() {
    return splash;
  }
  static get splashshade() {
    return splashshade;
  }
  static get initialPoint() {
    return initialPoint;
  }
  static set initialPoint(newInitialPoint) {
    initialPoint = newInitialPoint;
  }
  static get deltaPoint() {
    return deltaPoint;
  }
  static set deltaPoint(newDeltaPoint) {
    deltaPoint = newDeltaPoint;
  }
  ///////////////////////////////////////////
  //Opening and Layout
  ///////////////////////////////////////////
  static init(w, h) {
    paintFrame = document.getElementById("paintframe");
    paintFrame.style.width = w + "px";
    paintFrame.style.height = h + "px";
    BlockSpecs.loadCount++;
    IO.requestFromServer("assets/paint/splash.svg", _Paint.setSplash);
    BlockSpecs.loadCount++;
    IO.requestFromServer("assets/paint/splashshade.svg", _Paint.setSplashShade);
  }
  static setSplash(str) {
    BlockSpecs.loadCount--;
    splash = str;
  }
  static setSplashShade(str) {
    BlockSpecs.loadCount--;
    splashshade = "data:image/svg+xml;base64," + btoa(str);
  }
  static open(bkg, md5, sname, cname, cscale, sw, sh) {
    iOS.analyticsEvent("editor", "paint_editor_opened", bkg ? "bkg" : "character");
    PaintUndo.buffer = [];
    PaintUndo.index = 0;
    maxZoom = 5;
    minZoom = 1;
    workspaceWidth = 432;
    workspaceHeight = 384;
    _Paint.clearWorkspace();
    frame.style.display = "none";
    paintFrame.className = "paintframe appear";
    currentMd5 = md5 ?? null;
    isBkg = bkg;
    spriteId = sname;
    currentName = cname;
    costumeScale = cscale;
    SVGTools.init();
    nativeJr = true;
    if (isBkg) {
      _Paint.initBkg(480, 360);
    } else {
      _Paint.initSprite(sw, sh);
    }
    window.onmousedown = _Paint.detectGesture;
    window.ondevicemotion = null;
    ScratchJr.onBackButtonCallback.push(function() {
      var e = document.createEvent("TouchEvent");
      e.initTouchEvent();
      _Paint.backToProject(e);
    });
  }
  //Paint Editor Gestures
  static blockGestures(e) {
    if (!e.touches) {
      return;
    }
    if (e.touches.length == 4) {
      _Paint.ignore(e);
    }
  }
  static detectGesture(e) {
    if (Camera.active) {
      return;
    }
    _Paint.clearEvents(e);
    initialPoint = PaintAction.getScreenPt(e);
    deltaPoint = PaintAction.getScreenPt(e);
    _Paint.mouseDown(e);
  }
  static clearEvents(e) {
    window.onmousemove = null;
    window.onmouseup = null;
    if (PaintAction.currentshape) {
      PaintAction.stopAction(e);
    }
    Events.clearEvents();
    PaintAction.clearEvents();
  }
  static ignore(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  static Scroll(e) {
    e.preventDefault();
    e.stopPropagation();
    if (_Paint.canvasFits()) {
      return;
    }
    Ghost.clearLayer();
    initialPoint = PaintAction.getScreenPt(e);
    window.onmousemove = function(evt) {
      _Paint.dragBackground(evt);
    };
    window.onmouseup = function() {
      _Paint.bounceBack();
      _Paint.setCanvasTransform(currentZoom);
      PaintAction.clearEvents();
    };
  }
  static pinchStart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (PaintAction.currentshape) {
      return;
    }
    window.onmousemove = function() {
      _Paint.gestureStart(e);
    };
  }
  static gestureStart(e) {
    window.onmousemove = null;
    var skipmodes = ["path", "ellipse", "rect"];
    if (skipmodes.indexOf(mode) > -1) {
      if (PaintAction.currentshape && PaintAction.currentshape.parentNode) {
        PaintAction.currentshape.parentNode.removeChild(PaintAction.currentshape);
      }
    }
    Ghost.clearLayer();
    Events.scaleStartsAt = currentZoom;
    Events.updatePinchCenter(e);
    initialPoint = PaintAction.zoomPt(Events.pinchcenter);
    Events.clearEvents();
    Events.clearDragAndDrop();
    window.onmousemove = _Paint.gestureChange;
    window.onmouseup = _Paint.gestureEnd;
  }
  static gestureChange(e) {
    e.preventDefault();
    var scale = Math.min(maxZoom, Events.scaleStartsAt * Events.zoomScale(e));
    scale = Math.max(minZoom, scale);
    var mc = gn("maincanvas");
    var w = mc.offsetWidth * scale;
    var h = mc.offsetHeight * scale;
    var size2 = Math.min(w, h);
    if (size2 < 240) {
      return;
    }
    _Paint.updateZoomScale(scale);
    var pt = PaintAction.zoomPt(Events.pinchcenter);
    var delta2 = Vector.diff(pt, initialPoint);
    _Paint.adjustPos(delta2);
  }
  static gestureEnd(e) {
    e.preventDefault();
    window.onmousemove = null;
    window.onmouseup = null;
    var scale = Math.min(maxZoom, Events.scaleStartsAt * Events.zoomScale(e));
    scale = Math.max(minZoom, scale);
    _Paint.updateZoomScale(scale);
    var pt = PaintAction.zoomPt(Events.pinchcenter);
    var delta2 = Vector.diff(pt, initialPoint);
    _Paint.adjustPos(delta2);
    Events.scaleStartsAt = currentZoom;
    if (Path.selector) {
      Path.showDots(Path.selector);
    }
    _Paint.setZoomTo(scale);
  }
  static canvasFits() {
    return gn("maincanvas").offsetWidth * currentZoom <= gn("workspacebkg").offsetWidth && gn("maincanvas").offsetHeight * currentZoom <= gn("workspacebkg").offsetHeight;
  }
  static mouseDown(e) {
    var t = e.target;
    if (t.onmousedown) {
      return;
    }
    var pt = Events.getTargetPoint(e);
    if (hitRect(gn("donecheck"), pt)) {
      _Paint.backToProject(e);
    } else {
      if (t.parentNode && t.parentNode.getAttribute("key")) {
        return;
      } else {
        PaintAction.mouseDown(e);
      }
    }
  }
  static close() {
    saving = true;
    paintFrame.className = "paintframe disappear";
    frame.style.display = "block";
    ScratchJr.editorEvents();
    window.onmousemove = null;
    window.onmouseup = null;
    window.onmousemove = null;
    Alert.close();
    _Paint.clearWorkspace();
    PaintUndo.buffer = [];
    PaintUndo.index = 0;
    Ghost.maskData = {};
    setTimeout(function() {
      saving = false;
    }, 500);
  }
  static backToProject(e) {
    e.preventDefault();
    e.stopPropagation();
    if (saving) {
      return;
    }
    if (PaintAction.dragGroup.length > 0) {
      return;
    }
    var te = e;
    if (te.touches && te.touches.length > 1) {
      return;
    }
    Path.quitEditMode();
    Camera.close();
    PaintAction.clearDragGroup();
    ScratchJr.unfocus();
    ScratchAudio.sndFX("tap.wav");
    if (spriteId == null && currentName == null) {
      _Paint.savePageImage(_Paint.changePage);
    } else {
      _Paint.saveSprite(_Paint.changePageSprite);
    }
    ScratchJr.onBackButtonCallback.pop();
  }
  static saveEditState(fcn) {
    Camera.close();
    ScratchJr.unfocus();
    ScratchAudio.sndFX("tap.wav");
    if (spriteId == null && currentName == null) {
      _Paint.savePageImage();
    } else {
      _Paint.saveSprite();
    }
  }
  /////////////////////////
  //Modes
  /////////////////////////
  static setMode(e) {
    var te = e;
    if (te.touches && te.touches.length > 1) {
      return;
    }
    e.preventDefault();
    var t = e.target;
    if (t == null) {
      return;
    }
    Path.quitEditMode();
    if (Camera.active) {
      Camera.doAction(t.getAttribute("key"));
    } else {
      var tools = ["select", "rotate", "stamper", "scissors", "camera", "paintbucket"];
      if (tools.indexOf(t.getAttribute("key")) > -1) {
        ScratchAudio.sndFX("tap.wav");
      }
      _Paint.selectButton(t.getAttribute("key"));
    }
  }
  static selectButton(str) {
    _Paint.selectButtonFromDiv(gn("painttools"), str);
    _Paint.selectButtonFromDiv(gn("selectortools"), str);
    _Paint.selectButtonFromDiv(gn("edittools"), str);
    _Paint.selectButtonFromDiv(gn("filltools"), str);
    if (gn("stamps")) {
      _Paint.selectButtonFromDiv(gn("stamps"), str);
    }
    mode = str;
    _Paint.selectPenSize(pensizes.indexOf(strokewidth));
  }
  static selectButtonFromDiv(p, str) {
    for (var i = 0; i < p.childElementCount; i++) {
      var elem = p.childNodes[i];
      var icon = elem.childNodes[0];
      if (icon.getAttribute("key") == str) {
        elem.setAttribute("class", _Paint.getClass(elem, "on"));
        if (icon.getAttribute("class")) {
          icon.setAttribute("class", _Paint.getClass(icon, "on"));
        }
      } else {
        elem.setAttribute("class", _Paint.getClass(elem, "off"));
        if (icon.getAttribute("class")) {
          icon.setAttribute("class", _Paint.getClass(icon, "off"));
        }
      }
    }
  }
  static getClass(elem, state) {
    var list = elem.getAttribute("class").split(" ");
    list.pop();
    list.push(state);
    return list.join(" ");
  }
  //Zoom Management
  ///////////////////////////////////////////
  static setZoomTo(value) {
    currentZoom = 1;
    _Paint.bounceBack();
    _Paint.setCanvasTransform(value);
    Ghost.drawOffscreen();
  }
  static updateZoomScale(value) {
    currentZoom = 1;
    _Paint.setCanvasTransform(value);
  }
  static setCanvasTransform(value) {
    if (isAndroid) {
      gn("maincanvas").style.webkitTransform = "translate3d(" + gn("maincanvas").dx + "px," + gn("maincanvas").dy + "px, 0px) scale(" + value + "," + value + ")";
    } else {
      gn("maincanvas").style.webkitTransform = "translate(" + gn("maincanvas").dx + "px," + gn("maincanvas").dy + "px) scale(" + value + "," + value + ")";
    }
  }
  static adjustPos(delta2) {
    gn("maincanvas").dx += delta2.x;
    gn("maincanvas").dy += delta2.y;
    _Paint.setCanvasTransform(currentZoom);
  }
  static bounceBack() {
    var mx = Math.floor((gn("workspacebkg").offsetWidth - workspaceWidth) / 2);
    var my = Math.floor((gn("workspacebkg").offsetHeight - workspaceHeight) / 2);
    gn("maincanvas").dx = _Paint.canvasFits() ? mx : _Paint.getCoorx(20, mx);
    gn("maincanvas").dy = _Paint.canvasFits() ? my : _Paint.getCoory(20, my);
  }
  static getCoorx(indent, val) {
    if (gn("maincanvas").offsetWidth * currentZoom <= gn("workspacebkg").offsetWidth) {
      return val;
    }
    var dx = gn("maincanvas").dx + gn("maincanvas").cx - gn("maincanvas").cx * currentZoom;
    if (dx > indent) {
      return gn("maincanvas").dx + (indent - dx);
    }
    val = (dx / currentZoom + gn("maincanvas").offsetWidth) * currentZoom;
    var edge = gn("workspacebkg").offsetWidth - indent;
    if (val < edge) {
      return gn("maincanvas").dx + (edge - val);
    }
    return gn("maincanvas").dx;
  }
  static getCoory(indent, val) {
    if (gn("maincanvas").offsetHeight * currentZoom <= gn("workspacebkg").offsetHeight) {
      return val;
    }
    var dy = gn("maincanvas").dy + gn("maincanvas").cy - gn("maincanvas").cy * currentZoom;
    if (dy > indent) {
      return gn("maincanvas").dy + (indent - dy);
    }
    val = (dy / currentZoom + gn("maincanvas").offsetHeight) * currentZoom;
    var edge = gn("workspacebkg").offsetHeight - indent;
    if (val < edge) {
      return gn("maincanvas").dy + (edge - val);
    }
    return gn("maincanvas").dy;
  }
  static scaleToFit() {
    var dh = root.parentNode.parentNode.offsetHeight / (workspaceHeight + 10);
    var dw = root.parentNode.parentNode.offsetWidth / (workspaceWidth + 10);
    _Paint.setZoomTo(Math.min(dw, dh));
  }
  static dragBackground(evt) {
    if (_Paint.canvasFits()) {
      return;
    }
    var pt = PaintAction.getScreenPt(evt);
    var delta2 = Vector.diff(pt, initialPoint);
    _Paint.adjustPos(delta2);
  }
  /////////////////////////////////////////////////////////
  //dispatch table
  // Originally PaintLayout.js
  /////////////////////////////////
  //Layout Setup
  /////////////////////////////////
  static layout() {
    _Paint.topbar();
    var div = newHTML("div", "innerpaint", paintFrame);
    _Paint.leftPalette(div);
    var workspaceContainer = newHTML("div", "workspacebkg-container", div);
    var workspace = newHTML("div", "workspacebkg", workspaceContainer);
    workspace.setAttribute("id", "workspacebkg");
    _Paint.rightPalette(div);
    _Paint.colorPalette(paintFrame);
    _Paint.selectButton("path");
    _Paint.createSVGeditor(workspace);
  }
  /////////////////////////////////
  //top bar
  /////////////////////////////////
  static topbar() {
    var pt = newHTML("div", "paintop", paintFrame);
    _Paint.checkMark(pt);
    PaintUndo.setup(pt);
    _Paint.nameOfcostume(pt);
  }
  static checkMark(pt) {
    var clicky = newHTML("div", "paintdone", pt);
    clicky.id = "donecheck";
    clicky.onmousedown = _Paint.backToProject;
  }
  static nameOfcostume(p) {
    var sform = newHTML("form", "spriteform", p);
    sform.name = "spriteform";
    var ti = newHTML("input", void 0, sform);
    ti.autocomplete = false;
    ti.autocorrect = false;
    ti.name = "name";
    ti.maxLength = 25;
    ti.firstTime = true;
    ti.onmousedown = () => {
    };
    ti.onfocus = _Paint.nameFocus;
    ti.onblur = _Paint.nameBlur;
    ti.onkeypress = _Paint.handleNamePress;
    ti.onkeyup = _Paint.handleKeyRelease;
    sform.onsubmit = _Paint.submitNameChange;
  }
  static submitNameChange(e) {
    e.preventDefault();
    var input = e.target;
    input.blur();
  }
  static nameFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    var ti = e.target;
    ti.firstTime = true;
    ScratchJr.activeFocus = ti;
    if (isAndroid) {
      AndroidInterface.scratchjr_setsoftkeyboardscrolllocation(
        ti.getBoundingClientRect().top * window.devicePixelRatio,
        ti.getBoundingClientRect().bottom * window.devicePixelRatio
      );
    }
    setTimeout(function() {
      ti.setSelectionRange(ti.value.length, ti.value.length);
    }, 1);
  }
  static nameBlur(e) {
    ScratchJr.activeFocus = void 0;
    var spr = ScratchJr.getSprite();
    var ti = e.target;
    var val = ScratchJr.validate(ti.value, spr.name);
    ti.value = val.substring(0, ti.maxLength);
    ScratchJr.storyStart("Paint.nameBlur");
  }
  static handleNamePress(e) {
    var key = e.keyCode || e.which;
    if (key == 13) {
      _Paint.submitNameChange(e);
    } else {
      var ti = e.target;
      if (ti.firstTime) {
        ti.firstTime = false;
        ti.value = "";
      }
      if (ti.value.length == 25) {
        ScratchAudio.sndFX("boing.wav");
      }
    }
  }
  static handleKeyRelease(e) {
    var key = e.keyCode || e.which;
    var ti = e.target;
    if (key != 8) {
      return;
    }
    if (ti.firstTime) {
      ti.firstTime = false;
      ti.value = "";
    }
  }
  /////////////////////////////////
  //Left Palette
  /////////////////////////////////
  static leftPalette(div) {
    var leftpal = newHTML("div", "side up", div);
    var pal = newHTML("div", "paintpalette", leftpal);
    pal.setAttribute("id", "paintpalette");
    _Paint.setupEditPalette(pal);
    _Paint.createSizeSelector(pal);
  }
  static setupEditPalette(pal) {
    var section = newHTML("div", "section", pal);
    section.setAttribute("id", "painttools");
    var list = ["path", "ellipse", "rect", "tri"];
    var i = 0;
    for (i = 0; i < list.length; i++) {
      var but = newHTML("div", "element off", section);
      var icon = newHTML("div", "tool " + list[i] + " off", but);
      icon.setAttribute("key", list[i]);
      icon.onmousedown = _Paint.setMode;
    }
  }
  static createSizeSelector(pal) {
    var section = newHTML("div", "section space", pal);
    section.setAttribute("id", "sizeSelector");
    for (var i = 0; i < pensizes.length; i++) {
      var ps = newHTML("div", "pensizeholder", section);
      ps.key = i;
      ps.onmousedown = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var n = Number(this.key);
        strokewidth = pensizes[Number(this.key)];
        _Paint.selectPenSize(n);
      };
      var c = newHTML("div", "line t" + i, ps);
      _Paint.drawPenSizeInColor(c);
    }
    strokewidth = pensizes[1];
    _Paint.selectPenSize(1);
  }
  ////////////////////////////////////////
  // Pen sizes
  ////////////////////////////////////////
  static drawPenSizeInColor(c) {
    c.style.background = fillcolor;
  }
  static updateStrokes() {
    var div = gn("sizeSelector");
    if (!div) {
      return;
    }
    for (var i = 0; i < div.childElementCount; i++) {
      var elem = div.childNodes[i];
      _Paint.drawPenSizeInColor(elem.childNodes[0]);
    }
  }
  static selectPenSize(str) {
    var p = gn("sizeSelector");
    for (var i = 0; i < p.childElementCount; i++) {
      var elem = p.childNodes[i];
      if (elem.key == str) {
        elem.setAttribute("class", "pensizeholder on");
      } else {
        elem.setAttribute("class", "pensizeholder off");
      }
    }
  }
  /////////////////////////////////
  //Right Palette
  /////////////////////////////////
  static rightPalette(div) {
    var rightpal = newHTML("div", "side", div);
    _Paint.addSidePalette(rightpal, "selectortools", ["select", "rotate"]);
    _Paint.addSidePalette(rightpal, "edittools", ["stamper", "scissors"]);
    _Paint.addSidePalette(rightpal, "filltools", iOS.camera == "1" && Camera.available ? ["camera", "paintbucket"] : ["paintbucket"]);
  }
  static addSidePalette(p, id, list) {
    var pal = newHTML("div", "paintpalette short", p);
    pal.setAttribute("id", id);
    for (var i = 0; i < list.length; i++) {
      var but = newHTML("div", "element off", pal);
      var icon = newHTML("div", "tool " + list[i] + " off", but);
      icon.setAttribute("key", list[i]);
      icon.onmousedown = _Paint.setMode;
    }
  }
  static cameraToolsOn() {
    gn("backdrop").setAttribute("class", "modal-backdrop fade dark");
    setProps(gn("backdrop").style, {
      display: "block"
    });
    var topbar = newHTML("div", "phototopbar", gn("backdrop"));
    topbar.setAttribute("id", "photocontrols");
    var fc = newHTML("div", "flipcamera", topbar);
    fc.setAttribute("id", "cameraflip");
    fc.setAttribute("key", "cameraflip");
    if (isAndroid && !AndroidInterface.scratchjr_has_multiple_cameras()) {
      fc.style.display = "none";
    }
    fc.onmousedown = _Paint.setMode;
    var captureContainer = newHTML("div", "snapshot-container", gn("backdrop"));
    captureContainer.setAttribute("id", "capture-container");
    var capture = newHTML("div", "snapshot", captureContainer);
    capture.setAttribute("id", "capture");
    capture.setAttribute("key", "camerasnap");
    capture.onmousedown = _Paint.setMode;
    var cc = newHTML("div", "cameraclose", topbar);
    cc.setAttribute("id", "cameraclose");
    cc.onmousedown = _Paint.closeCameraMode;
  }
  static closeCameraMode() {
    ScratchAudio.sndFX("exittap.wav");
    Camera.close();
    _Paint.selectButton("select");
  }
  static cameraToolsOff() {
    gn("backdrop").setAttribute("class", "modal-backdrop fade");
    setProps(gn("backdrop").style, {
      display: "none"
    });
    if (gn("photocontrols")) {
      gn("photocontrols").parentNode.removeChild(gn("photocontrols"));
    }
    if (gn("capture")) {
      var captureContainer = gn("capture").parentNode;
      var captureContainerParent = captureContainer.parentNode;
      captureContainer.removeChild(gn("capture"));
      captureContainerParent.removeChild(gn("capture-container"));
    }
  }
  //////////////////////////////////
  // canvas Area
  //////////////////////////////////
  static setUpCanvasArea() {
    var workspace = gn("workspacebkg");
    var dx = Math.floor((workspace.offsetWidth - workspaceWidth) / 2);
    var dy = Math.floor((workspace.offsetHeight - workspaceHeight) / 2);
    var w = workspaceWidth;
    var h = workspaceHeight;
    var div = gn("maincanvas");
    div.style.background = "#F5F2F7";
    div.style.top = "0px";
    div.style.left = "0px";
    div.style.width = w + "px";
    div.style.height = h + "px";
    div.cx = div.offsetWidth / 2;
    div.cy = div.offsetHeight / 2;
    div.dx = dx;
    div.dy = dy;
    root.setAttributeNS(null, "width", String(w));
    root.setAttributeNS(null, "height", String(h));
    _Paint.drawGrid(w, h);
    PaintAction.clearEvents();
  }
  /////////////////////////////////
  //Color Palette
  /////////////////////////////////
  static colorPalette(div) {
    var swatchlist = _Paint.initSwatchList();
    var spalContainer = newHTML("div", "swatchpalette-container", div);
    var spal = newHTML("div", "swatchpalette", spalContainer);
    spal.setAttribute("id", "swatches");
    for (var i = 0; i < swatchlist.length; i++) {
      var colour = newHTML("div", "swatchbucket", spal);
      var sf = newHTML("div", "swatchframe", colour);
      var sc = newHTML("div", "swatchcolor", sf);
      sc.style.background = swatchlist[i];
      sf = newHTML("div", "splasharea off", colour);
      _Paint.setSplashColor(sf, splash, swatchlist[i]);
      _Paint.addImageUrl(sf, splashshade);
      colour.onmousedown = _Paint.selectSwatch;
    }
    _Paint.setSwatchColor(gn("swatches").childNodes[swatchlist.indexOf("#1C1C1C")]);
  }
  static setSplashColor(p, str, color) {
    var dataurl = "data:image/svg+xml;base64," + btoa(str.replace(/#662D91/g, color));
    _Paint.addImageUrl(p, dataurl);
  }
  static addImageUrl(p, url) {
    var img = document.createElement("img");
    img.src = url;
    img.style.position = "absolute";
    p.appendChild(img);
  }
  static selectSwatch(e) {
    var te = e;
    if (te.touches && te.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (Camera.active) {
      return;
    }
    var t = e.target;
    var b = "swatchbucket" != t.className;
    while (b) {
      t = t.parentNode;
      b = !!t && "swatchbucket" != t.className;
    }
    if (!t) {
      return;
    }
    ScratchAudio.sndFX("splash.wav");
    _Paint.setSwatchColor(t);
  }
  static setSwatchColor(t) {
    var tools = ["select", "wand", "stamper", "scissors", "rotate"];
    if (t && tools.indexOf(mode) > -1) {
      _Paint.selectButton("paintbucket");
    }
    var c = t.childNodes[0].childNodes[0].style.backgroundColor;
    for (var i = 0; i < gn("swatches").childElementCount; i++) {
      const swatchNode = gn("swatches").childNodes[i];
      const swatchColor = swatchNode.childNodes[0].childNodes[0];
      var mycolor = swatchColor.style.backgroundColor;
      if (c == mycolor) {
        swatchNode.childNodes[1].setAttribute("class", "splasharea on");
      } else {
        swatchNode.childNodes[1].setAttribute("class", "splasharea off");
      }
    }
    fillcolor = c;
    Path.quitEditMode();
    _Paint.updateStrokes();
  }
  static initSwatchList() {
    return [
      //	"#FF5500", // new orange
      "#FFD2F2",
      "#FF99D6",
      "#FF4583",
      // red pinks
      "#C30001",
      "#FF0023",
      "#FF8300",
      "#FFB200",
      "#FFF42E",
      "#FFF9C2",
      // pale yellow
      "#E2FFBD",
      //  pale green
      "#CFF500",
      // lime green
      "#50D823",
      // problematic
      //          "#2BFC49", // less problematic
      "#29C130",
      //          "#56C43B",  // ERROR?
      "#2BBF8A",
      // new green
      "#027607",
      "#114D24",
      //greens
      "#FFFFFF",
      "#CCDDE7",
      "#61787C",
      "#1C1C1C",
      // grays
      "#D830A3",
      // sarah's pink shoes border
      "#FF64E9",
      // purple pinks
      "#D999FF",
      " #A159D3",
      // vilote
      "#722696",
      // sarah's violet
      "#141463",
      "#003399",
      "#1D40ED",
      "#0079D3",
      "#009EFF",
      "#76C8FF",
      "#ACE0FD",
      "#11B7BC",
      "#21F9F3",
      "#C3FCFC",
      "#54311E",
      "#8E572A",
      "#E4B69D",
      "#FFCDA4",
      "#FFEDD7"
      // skin colors
    ];
  }
  /////////////////////////////////////////////////
  //  Setup SVG Editor
  ////////////////////////////////////////////////
  static createSVGeditor(container) {
    var div = newHTML("div", "maincanvas", container);
    div.setAttribute("id", "maincanvas");
    div.style.background = "#F5F2F7";
    div.style.top = "0px";
    div.style.left = "0px";
    window.onmousemove = null;
    window.onmouseup = null;
    root = SVGTools.create(div);
    root.setAttribute("class", "active3d");
    window.xform = Transform.getTranslateTransform();
    window.selxform = Transform.getTranslateTransform();
    var layer = SVGTools.createGroup(root, "layer1");
    layer.setAttribute("style", "pointer-events:visiblePainted");
    SVGTools.createGroup(root, "draglayer");
    SVGTools.createGroup(root, "paintgrid");
    gn("paintgrid").setAttribute("opacity", "0.5");
  }
  static clearWorkspace() {
    var fcn = function(div) {
      while (div.childElementCount > 0) {
        div.removeChild(div.childNodes[0]);
      }
    };
    fcn(gn("layer1"));
    fcn(gn("paintgrid"));
    fcn(gn("draglayer"));
    Path.quitEditMode();
  }
  static drawGrid(w, h) {
    var attr, path;
    if (!isBkg) {
      attr = {
        "d": _Paint.getGridPath(w, h, 12),
        "id": getIdFor("gridpath"),
        "opacity": 1,
        "stroke": "#dcddde",
        "fill": "none",
        "stroke-width": 0.5
      };
      path = SVGTools.addChild(gn("paintgrid"), "path", attr);
      path.setAttribute("style", "pointer-events:none;");
    }
    attr = {
      "d": _Paint.getGridPath(w, h, isBkg ? 24 : 48),
      "id": getIdFor("gridpath"),
      "opacity": 1,
      "stroke": "#c1c2c3",
      "fill": "none",
      "stroke-width": 0.5
    };
    path = SVGTools.addChild(gn("paintgrid"), "path", attr);
    path.setAttribute("style", "pointer-events:none;");
  }
  static getGridPath(w, h, gridsize) {
    var str = "";
    var dx = gridsize;
    var cmd;
    for (let i = 0; i < w / gridsize; i++) {
      cmd = "M" + dx + ",0L" + dx + "," + h;
      str += cmd;
      dx += gridsize;
    }
    var dy = gridsize;
    for (let i = 0; i < h / gridsize; i++) {
      cmd = "M0," + dy + "L" + w + "," + dy;
      str += cmd;
      dy += gridsize;
    }
    return str;
  }
  // Originally PaintIO.js
  ///////////////////////////
  // Loading and saving
  //////////////////////////
  static initBkg(ow, oh) {
    nativeJr = true;
    workspaceWidth = ow;
    workspaceHeight = oh;
    _Paint.setUpCanvasArea();
    var dh = root.parentNode.parentNode.offsetHeight / (workspaceHeight + 10);
    var dw = root.parentNode.parentNode.offsetWidth / (workspaceWidth + 10);
    _Paint.setZoomTo(Math.min(dw, dh));
    document.forms.spriteform.style.visibility = "hidden";
    if (currentMd5) {
      _Paint.loadBackground(currentMd5);
    } else {
      var attr = {
        "id": "staticbkg",
        "opacity": 1,
        "fixed": "yes",
        fill: ScratchJr.stagecolor
      };
      var cmds = [["M", 0, 0], ["L", 480, 0], ["L", 480, 360], ["L", 0, 360], ["L", 0, 0]];
      attr.d = SVG2Canvas.arrayToString(cmds);
      SVGTools.addChild(gn("layer1"), "path", attr);
      Ghost.drawOffscreen();
      PaintUndo.record(true);
    }
  }
  static loadBackground(md5) {
    if (md5.indexOf("samples/") >= 0) {
      _Paint.loadChar(md5);
    } else if (!MediaLib.keys[md5]) {
      iOS.getmedia(md5, nextStep);
    } else {
      _Paint.getBkg(MediaLib.path + md5);
    }
    function nextStep(base64) {
      var str = atob(base64);
      IO.getImagesInSVG(str, function() {
        _Paint.loadBkg(str);
      });
    }
  }
  static getBkg(url) {
    var xmlrequest = new XMLHttpRequest();
    xmlrequest.onreadystatechange = function() {
      if (xmlrequest.readyState == 4) {
        _Paint.createBkgFromXML(xmlrequest.responseText);
      }
    };
    xmlrequest.open("GET", url, true);
    xmlrequest.send(null);
  }
  static loadBkg(str) {
    _Paint.createBkgFromXML(str);
  }
  static createBkgFromXML(str) {
    nativeJr = str.indexOf("Scratch Jr") > -1;
    str = str.replace(/>\s*</g, "><");
    var xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    var extxml = document.importNode(xmlDoc.documentElement, true);
    var flat = _Paint.skipUnwantedElements(extxml, []);
    for (var i = 0; i < flat.length; i++) {
      gn("layer1").appendChild(flat[i]);
      if (flat[i].getAttribute("id") == "fixed") {
        flat[i].setAttribute("fixed", "yes");
      }
      flat[i].setAttribute("file", "yes");
    }
    _Paint.doAbsolute(gn("layer1"));
    if (!nativeJr) {
      _Paint.reassingIds(gn("layer1"));
    }
    var dh = root.parentNode.parentNode.offsetHeight / (workspaceHeight + 10);
    var dw = root.parentNode.parentNode.offsetWidth / (workspaceWidth + 10);
    _Paint.setZoomTo(Math.min(dw, dh));
    PaintUndo.record(true);
    if (!nativeJr) {
      _Paint.selectButton("paintbucket");
    }
  }
  static initSprite(ow, oh) {
    nativeJr = true;
    namedForms.spriteform.style.visibility = "visible";
    namedForms.spriteform.name.value = gn(currentName) ? gn(currentName).owner.name : currentName;
    if (ow) {
      workspaceWidth = ow;
    }
    if (oh) {
      workspaceHeight = oh;
    }
    if (currentMd5) {
      _Paint.loadCharacter(currentMd5);
    } else {
      _Paint.setUpCanvasArea();
      setCanvasSize(
        Ghost.maskCanvas,
        Math.round(Number(root.getAttribute("width")) * currentZoom),
        Math.round(Number(root.getAttribute("height")) * currentZoom)
      );
      var dh = root.parentNode.parentNode.offsetHeight / (workspaceHeight + 10);
      var dw = root.parentNode.parentNode.offsetWidth / (workspaceWidth + 10);
      _Paint.setZoomTo(Math.min(dw, dh));
      PaintUndo.record(true);
    }
  }
  static loadCharacter(md5) {
    if (md5.indexOf("samples/") >= 0) {
      _Paint.loadChar(md5);
    } else if (!MediaLib.keys[md5]) {
      iOS.getmedia(md5, nextStep);
    } else {
      _Paint.loadChar(MediaLib.path + md5);
    }
    function nextStep(base64) {
      var str = atob(base64);
      IO.getImagesInSVG(str, function() {
        _Paint.loadSprite(str);
      });
    }
  }
  static loadSprite(svg) {
    _Paint.createCharFromXML(svg, currentName);
  }
  static loadChar(url) {
    var xmlrequest = new XMLHttpRequest();
    xmlrequest.onreadystatechange = function() {
      if (xmlrequest.readyState == 4) {
        _Paint.createCharFromXML(xmlrequest.responseText, currentName);
      }
    };
    xmlrequest.open("GET", url, true);
    xmlrequest.send(null);
  }
  static adjustShapePosition(dx, dy) {
    window.xform.setTranslate(dx, dy);
    Transform.translateTo(gn("layer1"), window.xform);
  }
  ///////////////////////////////////
  // Saving
  /////////////////////////////////
  static savePageImage(fcn) {
    var worthsaving = gn("layer1").childElementCount > 0;
    if (!worthsaving) {
      _Paint.close();
    } else {
      saving = true;
      if (fcn) {
        Alert.open(paintFrame, gn("donecheck"), Localization.localize("ALERT_SAVING"), "#28A5DA");
        Alert.balloon.style.zIndex = String(12e3);
      }
      svgdata = SVGTools.saveBackground(gn("layer1"), workspaceWidth, workspaceHeight);
      IO.setMedia(svgdata, "svg", function(str) {
        _Paint.changeBackground(str, fcn);
      });
    }
  }
  static changeBackground(md5, fcn) {
    saveMD5 = md5;
    var type2 = "userbkgs";
    var mobj = {
      op: "select",
      table: type2,
      items: ["*"],
      where: [
        { col: "md5", op: "=", value: saveMD5 },
        { col: "version", op: "=", value: ScratchJr.version }
      ]
    };
    IO.query(type2, mobj, function(str) {
      _Paint.checkDuplicateBkg(str, fcn);
    });
  }
  static checkDuplicateBkg(str, fcn) {
    var list = JSON.parse(str);
    if (list.length > 0) {
      if (fcn) {
        fcn("duplicate");
      }
    } else {
      _Paint.addToBkgLib(fcn);
    }
  }
  /////////////////////////////////////
  // userbkgs:  stores backgrounds
  /////////////////////////////////////
  /*
      [version] =>
      [md5] =>
      [altmd5] =>  //for PNG option
      [ext] => png / svg
     	[width] =>
     	[height] =>
  */
  static addToBkgLib(fcn) {
    var dataurl = IO.getThumbnail(svgdata, 480, 360, 120, 90);
    var pngBase64 = dataurl.split(",")[1];
    iOS.setmedia(pngBase64, "png", setBkgRecord);
    function setBkgRecord(pngmd5) {
      iOS.stmt({
        op: "insert",
        table: "userbkgs",
        row: {
          md5: saveMD5,
          altmd5: pngmd5,
          version: ScratchJr.version,
          width: "480",
          height: "360",
          ext: "svg"
        }
      }, fcn);
    }
  }
  static changePage() {
    ScratchJr.stage.currentPage.setBackground(saveMD5, ScratchJr.stage.currentPage.updateBkg);
    _Paint.close();
  }
  static saveSprite(fcn) {
    var cname = namedForms.spriteform.name.value;
    var worthsaving = gn("layer1").childElementCount > 0 && PaintUndo.index > 0;
    if (worthsaving) {
      saving = true;
      if (fcn) {
        Alert.open(paintFrame, gn("donecheck"), "Saving...", "#28A5DA");
        Alert.balloon.style.zIndex = String(12e3);
      }
      svgdata = SVGTools.saveShape(gn("layer1"), workspaceWidth, workspaceHeight);
      IO.setMedia(svgdata, "svg", function(str) {
        _Paint.addOrModifySprite(str, fcn);
      });
    } else {
      var type2 = _Paint.getLoadType(spriteId, cname);
      if (cname != currentName && type2 == "modify") {
        ScratchJr.stage.currentPage.modifySpriteName(cname, spriteId);
      } else if (currentMd5 && type2 == "add") {
        ScratchJr.stage.currentPage.addSprite(costumeScale, currentMd5, cname);
      }
      _Paint.close();
    }
  }
  static addOrModifySprite(str, fcn) {
    saveMD5 = str;
    var mobj = {
      op: "select",
      table: "usershapes",
      items: ["*"],
      where: [
        { col: "md5", op: "=", value: saveMD5 },
        { col: "version", op: "=", value: ScratchJr.version }
      ]
    };
    IO.query("usershapes", mobj, function(str2) {
      _Paint.checkDuplicate(str2, fcn);
    });
  }
  static checkDuplicate(str, fcn) {
    var list = JSON.parse(str);
    if (list.length > 0) {
      if (fcn) {
        fcn("duplicate");
      }
    } else {
      _Paint.addToLib(fcn);
    }
  }
  /////////////////////////////////////
  // usershapes:  stores costumes
  /////////////////////////////////////
  /* current data
          [md5] =>
          [altmd5] =>  // for PNG  -- not used
          [version] =>
      		[scale] =>
          [ext] => png / svg
         	[width] =>
         	[height] =>
          [name] =>
  
      */
  static addToLib(fcn) {
    var scale = "0.5";
    var cname = namedForms.spriteform.name.value;
    cname = unescape(cname).replace(/[0-9]/g, "").replace(/\s*/g, "");
    var box = SVGTools.getBox(gn("layer1")).rounded();
    box = box.expandBy(20);
    var w = box.width.toString();
    var h = box.height.toString();
    var dataurl = IO.getThumbnail(svgdata, w, h, 120, 90);
    var pngBase64 = dataurl.split(",")[1];
    iOS.setmedia(pngBase64, "png", setCostumeRecord);
    function setCostumeRecord(pngmd5) {
      iOS.stmt({
        op: "insert",
        table: "usershapes",
        row: {
          scale,
          md5: saveMD5,
          altmd5: pngmd5,
          version: ScratchJr.version,
          width: w,
          height: h,
          ext: "svg",
          name: cname
        }
      }, fcn);
    }
  }
  static changePageSprite() {
    _Paint.close();
    var cname = namedForms.spriteform.name.value;
    var type2 = _Paint.getLoadType(spriteId, cname);
    switch (type2) {
      case "modify":
        ScratchJr.stage.currentPage.modifySprite(saveMD5, cname, spriteId);
        break;
      case "add":
        ScratchJr.stage.currentPage.addSprite(costumeScale, saveMD5, cname);
        break;
      default:
        ScratchJr.stage.currentPage.update();
        break;
    }
  }
  static getLoadType(sid, cid) {
    if (!cid) {
      return "none";
    }
    if (sid && cid) {
      return "modify";
    }
    return "add";
  }
  ///////////////////////////
  // XML import processs
  ///////////////////////////
  static skipUnwantedElements(p, res) {
    for (var i = 0; i < p.childNodes.length; i++) {
      var elem = p.childNodes[i];
      if (elem.nodeName == "metadata") {
        continue;
      }
      if (elem.nodeName == "defs") {
        continue;
      }
      if (elem.nodeName == "sodipodi:namedview") {
        continue;
      }
      if (elem.nodeName == "#comment") {
        continue;
      }
      if (elem.nodeName == "g" && elem.id == "layer1") {
        _Paint.skipUnwantedElements(elem, res);
        if (elem.removeAttribute("id")) {
          elem.removeAttribute("id");
        }
      } else {
        res.push(elem);
      }
    }
    return res;
  }
  static reassingIds(p) {
    for (var i = 0; i < p.childNodes.length; i++) {
      var elem = p.childNodes[i];
      if (elem.parentNode.getAttribute("fixed") == "yes") {
        elem.setAttribute("fixed", "yes");
      }
      var id = elem.getAttribute("id");
      if (!id) {
        elem.setAttribute("id", getIdFor(elem.nodeName));
      }
      if (elem.nodeName == "g") {
        _Paint.reassingIds(elem);
      }
    }
  }
  static createCharFromXML(str, fcn) {
    nativeJr = str.indexOf("Scratch Jr") > -1;
    var dx = workspaceWidth < 432 ? Math.floor((432 - workspaceWidth) / 2) : 0;
    var dy = workspaceHeight < 384 ? Math.floor((384 - workspaceHeight) / 2) : 0;
    if (workspaceWidth < 432) {
      workspaceWidth = 432;
    }
    if (workspaceHeight < 384) {
      workspaceHeight = 384;
    }
    _Paint.setUpCanvasArea();
    str = str.replace(/>\s*</g, "><");
    var xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    var extxml = document.importNode(xmlDoc.documentElement, true);
    var flat = _Paint.skipUnwantedElements(extxml, []);
    for (var i = 0; i < flat.length; i++) {
      gn("layer1").appendChild(flat[i]);
    }
    _Paint.doAbsolute(gn("layer1"));
    _Paint.adjustShapePosition(dx, dy);
    if (!nativeJr) {
      _Paint.reassingIds(gn("layer1"));
    }
    _Paint.scaleToFit();
    minZoom = currentZoom < 1 ? currentZoom / 2 : 1;
    var maxpix = 2290 * 2289;
    var ratio = maxpix / (workspaceWidth * workspaceHeight);
    var zoom = Math.floor(Math.sqrt(ratio));
    if (zoom < maxZoom) {
      maxZoom = zoom;
    }
    PaintUndo.record(true);
    if (!nativeJr) {
      _Paint.selectButton("paintbucket");
    }
  }
  static doAbsolute(div) {
    for (var i = 0; i < div.childElementCount; i++) {
      var elem = div.childNodes[i];
      if (elem.tagName == "path") {
        SVG2Canvas.setAbsolutePath(elem);
      }
      if (elem.tagName == "g") {
        _Paint.doAbsolute(elem);
      }
    }
  }
  static getComponents(p, res) {
    for (var i = 0; i < p.childNodes.length; i++) {
      var elem = p.childNodes[i];
      if (elem.nodeName == "metadata") {
        continue;
      }
      if (elem.nodeName == "defs") {
        continue;
      }
      if (elem.nodeName == "sodipodi:namedview") {
        continue;
      }
      if (elem.nodeName == "#comment") {
        continue;
      }
      if (elem.nodeName == "g") {
        _Paint.getComponents(elem, res);
        if (elem.getAttribute("id")) {
          elem.removeAttribute("id");
        }
      } else {
        res.push(elem);
      }
    }
    return res;
  }
};

// src/app/src/painteditor/SVGTools.ts
var attributeTable = {
  "path": ["d"],
  "image": ["x", "y", "width", "height"],
  "ellipse": ["cx", "cy", "rx", "ry"],
  "rect": ["x", "y", "width", "height"],
  "circle": ["cx", "cy", "r"],
  "line": ["x1", "y1", "x2", "y2"],
  "text": [
    "x",
    "y",
    "font-size",
    "font-family",
    "font-style",
    "font-weight",
    "text-anchor",
    "xml:space"
  ],
  "polyline": ["points"],
  "polygon": ["points"]
};
var attributePenTable = {};
var SVGTools = class _SVGTools {
  // Getters/setters for globally used properties
  static get attributeTable() {
    return attributeTable;
  }
  static get attributePenTable() {
    return attributePenTable;
  }
  static init() {
    attributePenTable = _SVGTools.getPenAttributes();
  }
  static getPenAttributes() {
    return {
      "path": _SVGTools.onlyKeys(_SVGTools.getPenAttr()),
      "ellipse": _SVGTools.onlyKeys(_SVGTools.getPenAttr()),
      "rect": _SVGTools.onlyKeys(_SVGTools.getPenAttr()),
      "line": _SVGTools.onlyKeys(_SVGTools.getPenAttr()),
      "image": [],
      "polyline": _SVGTools.onlyKeys(_SVGTools.getPenAttr()),
      "polygon": _SVGTools.onlyKeys(_SVGTools.getPenAttr())
    };
  }
  static create(parent, w, h) {
    var el = document.createElementNS(Paint.xmlns, "svg");
    el.setAttributeNS(null, "version", "1.1");
    if (w) {
      el.setAttributeNS(null, "width", String(w));
    }
    if (h) {
      el.setAttributeNS(null, "height", String(h));
    }
    parent.appendChild(el);
    return el;
  }
  static createGroup(parent, id) {
    var el = document.createElementNS(Paint.xmlns, "g");
    if (id) {
      el.setAttribute("id", id);
    }
    if (parent) {
      parent.appendChild(el);
    }
    return el;
  }
  //////////////////////////////////////////
  // Element creation
  /////////////////////////////////////////
  static addChild(div, type2, attr) {
    var shape = document.createElementNS(Paint.xmlns, type2);
    for (var val in attr) {
      shape.setAttribute(val, String(attr[val]));
    }
    if (div) {
      div.appendChild(shape);
    }
    return shape;
  }
  static addPath(div, x, y) {
    var shape = document.createElementNS(Paint.xmlns, "path");
    var str = "M" + x + "," + y;
    var attr = {
      "d": str,
      "id": getIdFor("path"),
      "opacity": 1
    };
    var drawattr = _SVGTools.getPolyAttr();
    for (var val in attr) {
      shape.setAttribute(val, String(attr[val]));
    }
    for (var ps in drawattr) {
      shape.setAttribute(ps, String(drawattr[ps]));
    }
    div.appendChild(shape);
    return shape;
  }
  static addPolyline(div, x, y) {
    var shape = document.createElementNS(Paint.xmlns, "polyline");
    var str = " " + x + "," + y + " ";
    var attr = {
      "points": str,
      "id": getIdFor("polyline"),
      "opacity": 1
    };
    var drawattr = _SVGTools.getPolyAttr();
    for (var val in attr) {
      shape.setAttribute(val, String(attr[val]));
    }
    for (var ps in drawattr) {
      shape.setAttribute(ps, String(drawattr[ps]));
    }
    div.appendChild(shape);
    return shape;
  }
  static addEllipse(div, x, y) {
    var shape = document.createElementNS(Paint.xmlns, "ellipse");
    var attr = {
      "cx": x,
      "cy": y,
      "rx": 0,
      "ry": 0,
      "id": getIdFor("ellipse"),
      "opacity": 1
    };
    for (var val in attr) {
      shape.setAttribute(val, String(attr[val]));
    }
    var drawattr = _SVGTools.getPenAttr(shape);
    for (var ps in drawattr) {
      shape.setAttribute(ps, String(drawattr[ps]));
    }
    div.appendChild(shape);
    return shape;
  }
  static addTriangle(div, x, y) {
    var shape = document.createElementNS(Paint.xmlns, "path");
    var attr = {
      "id": getIdFor("path"),
      "opacity": 1
    };
    var cmds = [["M", x, y + 1], ["L", x + 0.5, y], ["L", x + 1, y + 1], ["L", x, y + 1]];
    attr.d = SVG2Canvas.arrayToString(cmds);
    var drawattr = _SVGTools.getPenAttr();
    for (var val in attr) {
      shape.setAttribute(val, String(attr[val]));
    }
    for (var ps in drawattr) {
      shape.setAttribute(ps, String(drawattr[ps]));
    }
    div.appendChild(shape);
    return shape;
  }
  static addRect(div, x, y) {
    var shape = document.createElementNS(Paint.xmlns, "rect");
    var attr = {
      "x": x,
      "y": y,
      "width": 0,
      "height": 0,
      "id": getIdFor("rect"),
      "opacity": 1
    };
    for (var val in attr) {
      shape.setAttribute(val, String(attr[val]));
    }
    var drawattr = _SVGTools.getPenAttr(shape);
    for (var ps in drawattr) {
      shape.setAttribute(ps, String(drawattr[ps]));
    }
    div.appendChild(shape);
    return shape;
  }
  static getPolyAttr() {
    return {
      "fill": "none",
      "stroke": Paint.fillcolor,
      "stroke-width": Paint.strokewidth,
      "stroke-linecap": "round",
      "opacity": 1,
      "style": "pointer-events:visiblePainted;"
    };
  }
  static getPenAttr(shape) {
    return {
      "fill": "none",
      "stroke": Paint.fillcolor,
      "stroke-width": Paint.strokewidth,
      "opacity": 1,
      "style": "pointer-events:visiblePainted;"
    };
  }
  ///////////////////////////////////////
  // SVG clones
  ///////////////////////////////////////
  static getCopy(spr) {
    return _SVGTools.toObject(_SVGTools.svg2string(spr));
  }
  static svg2string(elem) {
    var str = new XMLSerializer().serializeToString(elem);
    var header = '<svg xmlns="' + Paint.xmlns + '" xmlns:xlink="' + Paint.xmlnslink + '">';
    str = str.replace(/ href="data:image/g, ' xlink:href="data:image');
    return header + str + "</svg>";
  }
  static toObject(str) {
    str.replace(/>\s*</g, "><");
    var xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    var node = document.importNode(xmlDoc.documentElement.firstChild, true);
    return node;
  }
  static rename(elem) {
    if (elem == void 0) {
      return;
    }
    var pname = elem.tagName;
    let name2;
    switch (pname) {
      case "g":
        if (elem.id) {
          name2 = unescape(elem.id).replace(/[0-9]/g, "").replace(/\s*/g, "");
          elem.id = getIdFor(name2);
        }
        for (var i = 0; i < elem.childElementCount; i++) {
          _SVGTools.rename(elem.childNodes[i]);
        }
        break;
      case "image":
        var corner = Transform.point(
          elem.getAttribute("x"),
          elem.getAttribute("y"),
          window.xform.matrix
        );
        elem.setAttributeNS(null, "x", String(corner.x));
        elem.setAttributeNS(null, "y", String(corner.y));
        elem.id = getIdFor("image");
        if (elem.getAttribute("pathUrl")) {
          var cp = getIdFor("clippath");
          gn(elem.getAttribute("pathUrl")).id = cp;
          elem.setAttribute("pathUrl", cp);
        }
        break;
      default:
        if (elem.id) {
          name2 = unescape(elem.id).replace(/[0-9]/g, "").replace(/\s*/g, "");
          elem.id = getIdFor(name2);
        }
        break;
    }
  }
  static saveBackground(elem, w, h) {
    var serializer = new XMLSerializer();
    var str = serializer.serializeToString(elem);
    str = str.replace(/ href/g, " xlink:href");
    var svgdata2 = '<svg xmlns="' + Paint.xmlns + '" xmlns:xlink="' + Paint.xmlnslink + '" viewBox= "0 0 ' + w + " " + h + '" width="' + w + 'px" height="' + h + 'px">';
    var comment = document.createComment("Created with Scratch Jr");
    svgdata2 += serializer.serializeToString(comment);
    svgdata2 += str;
    svgdata2 += "</svg>";
    return svgdata2.replace(/></g, ">\n<");
  }
  static cleanup(elem) {
    if (elem.childElementCount == 0) {
      if (elem.id != "layer1") {
        elem.parentNode.removeChild(elem);
      }
      return;
    }
    for (var i = 0; i < elem.childElementCount; i++) {
      var kid = elem.childNodes[i];
      if (kid.tagName == "g") {
        _SVGTools.cleanup(kid);
      }
    }
  }
  static saveShape(shape, w, h) {
    _SVGTools.cleanup(shape);
    var elem = _SVGTools.getCopy(shape);
    var serializer = new XMLSerializer();
    var box = _SVGTools.calculateViewBox(elem);
    w = box.width;
    h = box.height;
    var str = serializer.serializeToString(elem);
    str = str.replace(/ href/g, " xlink:href");
    var svgdata2 = '<svg xmlns="' + Paint.xmlns + '" xmlns:xlink="' + Paint.xmlnslink + '" viewBox= "0 0 ' + w + " " + h + '" width="' + w + 'px" height="' + h + 'px">';
    var comment = document.createComment("Created with Scratch Jr");
    svgdata2 += serializer.serializeToString(comment);
    svgdata2 += str;
    svgdata2 += "</svg>";
    return svgdata2.replace(/></g, ">\n<");
  }
  static calculateViewBox(elem) {
    var box = _SVGTools.getBox(elem, true).rounded();
    if (_SVGTools.outsideBounds(box)) {
      return {
        width: Paint.workspaceWidth,
        height: Paint.workspaceHeight
      };
    }
    box = box.expandBy(20);
    window.xform.setTranslate(-box.x, -box.y);
    Transform.translateTo(elem, window.xform);
    return box;
  }
  static outsideBounds(box) {
    if (box.x < 0) {
      return true;
    }
    if (box.y < 0) {
      return true;
    }
    if (box.width > Paint.workspaceWidth) {
      return true;
    }
    if (box.height > Paint.workspaceHeight) {
      return true;
    }
    return false;
  }
  static notValidBox(box) {
    if (box.x + box.width < 0) {
      return true;
    }
    if (box.y + box.height < 0) {
      return true;
    }
    if (box.x > Paint.workspaceWidth) {
      return true;
    }
    if (box.y > Paint.workspaceHeight) {
      return true;
    }
    return false;
  }
  static getBoxCenter(elem) {
    var box = _SVGTools.getBox(elem);
    var cx = box.x + box.width / 2;
    var cy = box.y + box.height / 2;
    return {
      x: cx,
      y: cy
    };
  }
  ///////////////////////////////////////
  // Boxes
  //////////////////////////////////////
  static getTransformedBox(elem) {
    var m = Transform.getCombinedMatrices(elem);
    var box = _SVGTools.getBox(elem);
    var p = Transform.point(box.x, box.y, m);
    box.width = Math.abs(box.width * m.a);
    box.height = Math.abs(box.height * m.d);
    box.x = p.x;
    box.y = p.y;
    if (m.a < 0) {
      box.x -= box.width;
    }
    if (m.d < 0) {
      box.y -= box.height;
    }
    var angle = Transform.getRotationAngle(elem);
    if (angle != 0) {
      var rot = Transform.getRotation(elem);
      var list = [];
      list.push(Transform.point(box.x, box.y, rot.matrix));
      list.push(Transform.point(box.x + box.width, box.y, rot.matrix));
      list.push(Transform.point(box.x + box.width, box.y + box.height, rot.matrix));
      list.push(Transform.point(box.x, box.y + box.height, rot.matrix));
      box = _SVGTools.getMinMax(list);
    }
    return box;
  }
  static getBox(elem, isSaving) {
    var box = new Rectangle(0, 0, 0, 0);
    if (elem == void 0) {
      return box;
    }
    switch (elem.tagName) {
      case "circle":
        box.x = Number(elem.getAttribute("cx")) - Number(elem.getAttribute("r"));
        box.y = Number(elem.getAttribute("cy")) - Number(elem.getAttribute("r"));
        box.width = Number(elem.getAttribute("r")) * 2;
        box.height = Number(elem.getAttribute("r")) * 2;
        box = box.expandBy(_SVGTools.getPenWidthForm(elem));
        break;
      case "g":
      case "svg":
        if (elem.childElementCount == 0) {
          return box;
        }
        box = _SVGTools.getTransformedBox(elem.childNodes[0]);
        for (var i = 0; i < elem.childElementCount; i++) {
          if (isSaving && elem.childNodes[i].tagName == "image") {
            continue;
          }
          var rect = _SVGTools.getTransformedBox(elem.childNodes[i]);
          if (rect.isEmpty()) {
            continue;
          }
          box = box.union(rect);
        }
        break;
      case "ellipse":
        box.x = Number(elem.getAttribute("cx")) - Number(elem.getAttribute("rx"));
        box.y = Number(elem.getAttribute("cy")) - Number(elem.getAttribute("ry"));
        box.width = Number(elem.getAttribute("rx")) * 2;
        box.height = Number(elem.getAttribute("ry")) * 2;
        box = box.expandBy(_SVGTools.getPenWidthForm(elem));
        break;
      case "clipPath":
        box = _SVGTools.getTransformedBox(elem.childNodes[0]);
        break;
      case "image":
        box.x = Number(elem.getAttribute("x"));
        box.y = Number(elem.getAttribute("y"));
        box.width = Number(elem.getAttribute("width"));
        box.height = Number(elem.getAttribute("height"));
        break;
      case "path":
        box = _SVGTools.getPathBox(elem).expandBy(_SVGTools.getPenWidthForm(elem));
        break;
      case "line":
        var x1 = Number(elem.getAttribute("x1"));
        var x2 = Number(elem.getAttribute("x2"));
        var y1 = Number(elem.getAttribute("y1"));
        var y2 = Number(elem.getAttribute("y2"));
        var minx = Math.min(x1, x2);
        var maxx = Math.max(x1, x2);
        var miny = Math.min(y1, y2);
        var maxy = Math.max(y1, y2);
        box = new Rectangle(minx, miny, maxx - minx, maxy - miny).expandBy(_SVGTools.getPenWidthForm(elem));
        break;
      case "polygon":
        var points = elem.points;
        var list = [];
        for (var j = 0; j < points.numberOfItems; j++) {
          list.push(points.getItem(j));
        }
        box = _SVGTools.getMinMax(list).expandBy(_SVGTools.getPenWidthForm(elem));
        break;
    }
    return box;
  }
  static getArea(elem) {
    var area = 0;
    var list;
    var sw = Number(elem.getAttribute("stroke-width")) / 2;
    switch (elem.tagName) {
      case "g":
        var box = _SVGTools.getBox(elem);
        area = box.width * box.height;
        break;
      case "circle":
        area = Math.PI * Number(elem.getAttribute("r")) * Number(elem.getAttribute("r"));
        break;
      case "ellipse":
        area = Math.PI * Number(elem.getAttribute("rx")) * Number(elem.getAttribute("ry"));
        break;
      case "path":
        var d;
        if (SVG2Canvas.isCompoundPath(elem)) {
          var paths = elem.getAttribute("d").match(/[M][^M]*/g);
          d = paths[0];
        } else {
          d = elem.getAttribute("d");
        }
        d = Path.isClockWise(d) ? Path.reverse(d) : d;
        list = Path.getAllPoints(d);
        if (list.length == 2) {
          list = _SVGTools.getPolygon(list[0], list[1], sw);
        }
        area = _SVGTools.polygonArea(list);
        break;
      case "line":
        var x1 = Number(elem.getAttribute("x1"));
        var x2 = Number(elem.getAttribute("x2"));
        var y1 = Number(elem.getAttribute("y1"));
        var y2 = Number(elem.getAttribute("y2"));
        var poly = _SVGTools.getPolygon({
          x: x1,
          y: y1
        }, {
          x: x2,
          y: y2
        }, sw);
        area = _SVGTools.polygonArea(poly);
        break;
      case "polygon":
        var points = elem.points;
        list = [];
        for (var i = 0; i < points.numberOfItems; i++) {
          list.push(points.getItem(i));
        }
        area = _SVGTools.polygonArea(list);
        break;
    }
    return area;
  }
  static getPolygon(before, here, size2) {
    var v1 = Vector.diff(here, before);
    var pt = Vector.scale(v1, 0.5);
    var perp = Vector.perp(pt);
    var unitvector = Vector.norm(perp);
    var pt1 = Vector.sum(before, Vector.scale(unitvector, size2));
    var pt4 = Vector.sum(before, Vector.scale(unitvector, -size2));
    var pt2 = Vector.sum(here, Vector.scale(unitvector, size2));
    var pt3 = Vector.sum(here, Vector.scale(unitvector, -size2));
    return [pt1, pt2, pt3, pt4];
  }
  static polygonArea(list) {
    var xlist = [];
    var ylist = [];
    for (var n = 0; n < list.length; n++) {
      xlist.push(list[n].x);
      ylist.push(list[n].y);
    }
    var len = list.length;
    var area = 0;
    var j = len - 1;
    for (var i = 0; i < len; i++) {
      area += (xlist[j] + xlist[i]) * (ylist[j] - ylist[i]);
      j = i;
    }
    return area / 2;
  }
  static getPenWidthForm(elem) {
    var res = elem.getAttribute("stroke-width");
    return Number(res).toString() == "NaN" ? 0 : Number(res);
  }
  static getMinMax(list) {
    var box = new Rectangle(0, 0, 0, 0);
    if (list.length < 1) {
      return box;
    }
    var minx = 9999999;
    var miny = 9999999;
    var maxx = -9999999;
    var maxy = -9999999;
    for (var i = 0; i < list.length; i++) {
      if (list[i].x < minx) {
        minx = list[i].x;
      }
      if (list[i].x > maxx) {
        maxx = list[i].x;
      }
      if (list[i].y < miny) {
        miny = list[i].y;
      }
      if (list[i].y > maxy) {
        maxy = list[i].y;
      }
    }
    box.x = minx;
    box.y = miny;
    box.width = maxx - minx;
    box.height = maxy - miny;
    return box;
  }
  static getPathBox(elem) {
    var box;
    var data = elem.getAttribute("d");
    var paths = data.match(/[M][^M]*/g);
    if (!paths) {
      paths = [elem.getAttribute("d")];
    }
    for (var j = 0; j < paths.length; j++) {
      var pbox = _SVGTools.getOnePathBox(paths[j]);
      if (pbox.isEmpty()) {
        continue;
      }
      if (!box) {
        box = pbox;
      } else {
        box = pbox.union(box);
      }
    }
    return box;
  }
  static getOnePathBox(d) {
    var path = SVG2Canvas.getCommandList(d);
    var allpoints = [];
    for (var i = 0; i < path.length; i++) {
      var cmd = SVG2Canvas.getAbsoluteCommand(path[i]);
      if (SVG2Canvas.acurve) {
        allpoints.push({
          x: cmd[1],
          y: cmd[2]
        });
        if (cmd.length > 4) {
          allpoints.push({
            x: cmd[3],
            y: cmd[4]
          });
        }
      }
      allpoints.push(SVG2Canvas.endp);
    }
    var box = _SVGTools.getMinMax(allpoints);
    return box;
  }
  static onlyKeys(obj) {
    var res = [];
    for (var key in obj) {
      res.push(key);
    }
    return res;
  }
  ///////////////////////////////////
  // image mask
  //////////////////////////////////
  static getDataurl(copy, w, h) {
    var serializer = new XMLSerializer();
    var header = '<svg  xmlns="' + Paint.xmlns + '" viewBox= "0 0 ' + w + " " + h + '" width="' + w + 'px" height="' + h + 'px">';
    var svgdata2 = header + "\n" + serializer.serializeToString(copy) + "</svg>";
    return "data:image/svg+xml;base64," + btoa(svgdata2);
  }
  static getLayersAbove(p, index3, w, h) {
    var serializer = new XMLSerializer();
    var svgdata2 = '<svg  xmlns="' + Paint.xmlns + '" viewBox= "0 0 ' + w + " " + h + '" width="' + w + 'px" height="' + h + 'px">';
    svgdata2 += "\n";
    var startat = Math.min(index3 + 1, p.childElementCount);
    for (var i = startat; i < p.childElementCount; i++) {
      svgdata2 += serializer.serializeToString(p.childNodes[i]) + "\n";
    }
    svgdata2 += "</svg>";
    return "data:image/svg+xml;base64," + btoa(svgdata2);
  }
  /////////////////////////////
  // Cloning
  /////////////////////////////
  static getCount(p) {
    var n = 0;
    if (p.tagName == "g") {
      n += p.childElementCount;
      for (var i = 0; i < p.childElementCount; i++) {
        var elem = p.childNodes[i];
        if (elem.tagName == "g") {
          n += _SVGTools.getCount(elem);
        }
      }
    }
    return n;
  }
  static cloneSVGelement(elem) {
    var group = Layer.findGroup(elem);
    var p = gn("layer1");
    if (!p) {
      return;
    }
    window.xform.setTranslate(5, 5);
    var old = [];
    var newlist = [];
    if (_SVGTools.getCount(p) > 175) {
      return;
    }
    for (var i = 0; i < group.length; i++) {
      if (_SVGTools.getCount(p) > 175) {
        return;
      }
      var shape = _SVGTools.getClonedElement(p, group[i]);
      if (!shape) {
        continue;
      }
      if (shape.tagName == "g") {
        continue;
      }
      old.push(group[i].id);
      newlist.push(shape.id);
      if (group[i].getAttribute("id").indexOf("Boder") > -1) {
        var name2 = group[i].getAttribute("id").split("Border")[0];
        var k = old.indexOf(name2);
        if (k > -1) {
          shape.setAttribute("id", newlist[k] + "Border");
        }
      }
      if (group[i].getAttribute("relatedto")) {
        var n = old.indexOf(group[i].getAttribute("relatedto"));
        if (n > -1) {
          shape.setAttribute("relatedto", newlist[n]);
        }
      }
    }
    var elems = _SVGTools.getFlatten(p);
    _SVGTools.removeDuplicates(elems);
  }
  static removeDuplicates(list) {
    for (var i = 0; i < list.length; i++) {
      var mt = gn(list[i]);
      if (!mt) {
        continue;
      }
      if (!mt.parentNode) {
        continue;
      }
      if (mt.tagName != "path") {
        continue;
      }
      for (var j = i + 1; j < list.length; j++) {
        var elem = gn(list[j]);
        if (!elem) {
          continue;
        }
        if (!elem.parentNode) {
          continue;
        }
        if (elem.tagName != "path") {
          continue;
        }
        if (elem.getAttribute("d") == mt.getAttribute("d")) {
          if (mt.id.indexOf("pathborder_image") > -1 && elem.id.indexOf("pathborder_image") > -1) {
            var imageid = elem.id.substring(String("pathborder_").length, elem.id.length);
            var group = gn("group_" + imageid);
            if (group) {
              group.parentNode.removeChild(group);
            }
          }
          elem.parentNode.removeChild(elem);
        }
      }
    }
  }
  static getFlatten(p) {
    var res = [];
    for (var i = 0; i < p.childElementCount; i++) {
      var elem = p.childNodes[i];
      if (elem.id.indexOf("group_image_") > -1) {
        continue;
      }
      if (elem.tagName == "g") {
        res = res.concat(_SVGTools.getFlatten(elem));
      } else {
        res.push(elem.id);
      }
    }
    return res;
  }
  static getClonedElement(p, elem) {
    if (elem.id.indexOf("pathborder_image_") > -1) {
      return null;
    }
    if (elem.tagName == "image") {
      return null;
    }
    if (elem.tagName == "clipPath") {
      return null;
    }
    if (elem.tagName == "g") {
      var mt = SVGImage.getImage(elem);
      if (mt) {
        return SVGImage.cloneImage(p, mt);
      }
      var old = [];
      var newlist = [];
      var g = _SVGTools.createGroup(p, getIdFor("group"));
      for (var i = 0; i < elem.childElementCount; i++) {
        var kid = elem.childNodes[i];
        var shape = _SVGTools.getClonedElement(g, kid);
        old.push(kid.id);
        newlist.push(shape.id);
        if (kid.getAttribute("id").indexOf("Border") > -1) {
          var name2 = kid.getAttribute("id").split("Border")[0];
          var k = old.indexOf(name2);
          if (k > -1) {
            shape.setAttribute("id", newlist[k] + "Border");
          }
        }
      }
      return g;
    } else {
      return _SVGTools.getClone(p, elem);
    }
  }
  static getClone(p, elem) {
    var attr = attributeTable[elem.tagName];
    var drawattr = attributePenTable[elem.tagName];
    var shape = document.createElementNS(Paint.xmlns, elem.tagName);
    p.appendChild(shape);
    attr = attr.concat(drawattr);
    for (var i = 0; i < attr.length; i++) {
      if (elem.getAttribute(attr[i]) == null) {
        continue;
      }
      shape.setAttribute(attr[i], elem.getAttribute(attr[i]));
    }
    if (elem.getAttribute("stroke-linecap")) {
      shape.setAttribute("stroke-linecap", elem.getAttribute("stroke-linecap"));
    }
    shape.setAttribute("id", getIdFor(elem.tagName));
    var ang = Transform.getRotationAngle(elem);
    let mtx;
    if (Transform.hasScaleMatrix(elem)) {
      mtx = Transform.getScaleMatrix(elem);
    }
    if (ang != 0) {
      Transform.applyRotation(shape, ang);
    }
    if (mtx) {
      Transform.applyMatrix(shape, mtx);
    }
    Transform.translateTo(shape, window.xform);
    return shape;
  }
  ///////////////////////////////
  // Water Mark
  ///////////////////////////////
  static getWatermark(shape, color) {
    var svg = _SVGTools.getCopy(shape);
    _SVGTools.removeExtras(svg);
    _SVGTools.changeShape(svg, color);
    return svg;
  }
  static changeShape(svg, color) {
    for (var i = 0; i < svg.childElementCount; i++) {
      var elem = svg.childNodes[i];
      if (elem.tagName == "g") {
        _SVGTools.changeShape(elem, color);
      } else {
        _SVGTools.setObjectWaterMark(elem, color);
      }
    }
  }
  static removeExtras(svg) {
    var n = 0;
    var valid = n < svg.childElementCount;
    while (valid) {
      var elem = svg.childNodes[n];
      if (elem.nodeName == "image" || elem.nodeName == "clipPath") {
        svg.removeChild(elem);
      } else {
        if (elem.tagName == "g") {
          _SVGTools.removeExtras(elem);
        }
        n++;
      }
      valid = n < svg.childElementCount;
    }
  }
  static setObjectWaterMark(elem, color) {
    var fill = elem.getAttribute("fill");
    var stroke = elem.getAttribute("stroke") ? color : elem.id.indexOf("Draw") > -1 ? color : "none";
    var lw = elem.getAttribute("stroke-width") ? Number(elem.getAttribute("stroke-width")) : Number(SVG2Canvas.strokevalues["stroke-width"]);
    var attr = {
      "fill": "white",
      "stroke": stroke,
      "stroke-width": lw,
      "stroke-miterlimit": elem.getAttribute("stroke-miterlimit") ? elem.getAttribute("stroke-miterlimit") : 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    };
    attr.fill = fill == "none" ? "none" : "white";
    if (fillWithColor()) {
      attr.fill = color;
    }
    function fillWithColor() {
      if (!fill) {
        return true;
      }
      if (fill == "none") {
        return false;
      }
      if (elem.id.indexOf("Border") > -1) {
        return true;
      }
      if (elem.id.indexOf("Skip") > -1) {
        return false;
      }
      if (elem.id.indexOf("Draw") > -1) {
        return false;
      }
      if (fill == "#080808" || fill == "#000000" || fill == "rgba(0, 0, 0, 0)") {
        return true;
      }
      var hsb = rgb2hsb(fill);
      var brightness = hsb[2];
      if (brightness < 0.25) {
        return true;
      }
      var dist = Vector.len(Vector.diff({
        x: 0.5,
        y: 0.5
      }, {
        x: hsb[1],
        y: hsb[2]
      }));
      return dist < 0.25;
    }
    for (var val in attr) {
      elem.setAttribute(val, String(attr[val]));
    }
  }
  static isCompoundPath(elem) {
    if (elem.tagName != "path") {
      return false;
    }
    return SVG2Canvas.isCompoundPath(elem);
  }
};

// src/app/src/editor/engine/Sprite.ts
var namedForms2 = document.forms;
var Sprite = class {
  // Instance state — populated from project attrs and during asset load
  div;
  img;
  originalImg;
  svg;
  code;
  id;
  md5;
  name;
  type;
  sounds;
  threads;
  borderOn;
  outline;
  scale;
  defaultScale;
  xcoor;
  ycoor;
  w;
  h;
  cx;
  cy;
  angle;
  dirx;
  diry;
  speed;
  shown;
  flip;
  homex;
  homey;
  homescale;
  homeshown;
  homeflip;
  str;
  fontsize;
  color;
  border;
  balloon = null;
  page;
  watermark;
  thumbnail;
  oldvalue;
  readOnly;
  constructor(attr, whenDone) {
    if (attr.type == "sprite") {
      this.createSprite(attr.page, attr.md5, attr.id, attr, whenDone);
    } else {
      this.createText(attr, whenDone);
    }
  }
  createSprite(page, md5, id, attr, fcn) {
    enginePorts().storyStart("Sprite.prototype.createSprite");
    this.div = document.createElement("div");
    setProps(this.div.style, {
      position: "absolute",
      left: "0px",
      top: "0px"
    });
    this.div.owner = this;
    this.div.id = id;
    this.id = id;
    this.md5 = md5;
    this.borderOn = false;
    this.outline = document.createElement("canvas");
    this.code = enginePorts().scriptsCreate(this);
    setProps(this, attr);
    if (Localization.isSampleLocalizedKey(this.name) && enginePorts().isSampleOrStarter()) {
      this.name = Localization.localize("SAMPLE_TEXT_" + this.name);
    }
    for (var i = 0; i < this.sounds.length; i++) {
      ScratchAudio.loadProjectSound(this.sounds[i]);
    }
    var sprites = JSON.parse(page.sprites);
    if (sprites.indexOf(this.id) < 0) {
      sprites.push(this.id);
    }
    page.sprites = JSON.stringify(sprites);
    var me = this;
    page.div.appendChild(this.div);
    this.div.style.visibility = "hidden";
    this.getAsset(gotImage);
    function gotImage(dataurl) {
      me.setCostume(dataurl, fcn);
    }
  }
  getAsset(whenDone) {
    var md5 = this.md5;
    var spr = this;
    var keys = MediaLib.keys;
    var url = keys[md5] ? MediaLib.path + md5 : md5.indexOf("/") < 0 ? iOS.path + md5 : md5;
    md5 = keys[md5] ? MediaLib.path + md5 : md5;
    if (md5.indexOf("/") > -1) {
      IO.requestFromServer(md5, doNext);
    } else {
      iOS.getmedia(md5, nextStep);
    }
    function nextStep(base64) {
      doNext(atob(base64));
    }
    function doNext(str) {
      str = str.replace(/>\s*</g, "><");
      spr.setSVG(str);
      if (str.indexOf("xlink:href") < 0 && iOS.path) {
        whenDone(url);
      } else {
        var base64 = IO.getImageDataURL(spr.md5, btoa(str));
        IO.getImagesInSVG(str, function() {
          whenDone(base64);
        });
      }
    }
  }
  setSVG(str) {
    var xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    var extxml = document.importNode(xmlDoc.documentElement, true);
    if (extxml.childNodes[0].nodeName == "#comment") {
      extxml.removeChild(extxml.childNodes[0]);
    }
    this.svg = extxml;
  }
  setCostume(dataurl, fcn) {
    var img = document.createElement("img");
    img.src = dataurl;
    this.img = img;
    this.originalImg = img.cloneNode(false);
    setProps(this.img.style, {
      position: "absolute",
      left: "0px",
      top: "0px"
    });
    this.div.appendChild(img);
    var sprite = this;
    if (!img.complete) {
      img.onload = function() {
        sprite.displaySprite(fcn);
      };
    } else {
      sprite.displaySprite(fcn);
    }
  }
  displaySprite(whenDone) {
    var w = this.img.width;
    var h = this.img.height;
    this.div.style.width = this.img.width + "px";
    this.div.style.height = this.img.height + "px";
    this.cx = Math.floor(w / 2);
    this.cy = Math.floor(h / 2);
    this.w = w;
    this.h = h;
    this.setPos(this.xcoor, this.ycoor);
    this.doRender(whenDone);
  }
  doRender(whenDone) {
    this.drawBorder();
    this.render();
    SVG2Canvas.drawInCanvas(this);
    this.readOnly = SVG2Canvas.svgerror;
    this.watermark = SVGTools.getWatermark(this.svg, "#B3B3B3");
    if (whenDone) {
      whenDone(this);
    }
  }
  drawBorder() {
    var w, h, extxml;
    if (isAndroid) {
      this.border = document.createElement("canvas");
      w = this.originalImg.width;
      h = this.originalImg.height;
      extxml = this.svg;
      this.border.width = w;
      this.border.height = h;
      this.border.style.width = w * this.scale + "px";
      this.border.style.height = h * this.scale + "px";
      SVG2Canvas.drawBorder(extxml, this.border.getContext("2d"));
    } else {
      this.border = document.createElement("canvas");
      w = this.img.width;
      h = this.img.height;
      extxml = this.svg;
      setCanvasSize(this.border, w, h);
      SVG2Canvas.drawBorder(extxml, this.border.getContext("2d"));
    }
  }
  //////////////////////////////////////
  // sprite thumbnail
  /////////////////////////////////////
  spriteThumbnail(p) {
    var tb = newHTML("div", "spritethumb off", p);
    tb.setAttribute("id", getIdFor("spritethumb"));
    tb.type = "spritethumb";
    setModelRef(tb, "spritethumb", this.id);
    var c = newHTML("canvas", "thumbcanvas", tb);
    if (isAndroid) {
      setCanvasSizeScaledToWindowDocumentHeight(c, 64, 64);
    } else {
      setCanvasSize(c, 64, 64);
    }
    this.drawMyImage(c, c.width, c.height);
    p = newHTML("p", "sname", tb);
    p.textContent = this.name;
    newHTML("div", "brush", tb);
    this.thumbnail = tb;
    return tb;
  }
  updateSpriteThumb() {
    var tb = this.thumbnail;
    if (!tb) {
      return;
    }
    var cnv = tb.childNodes[0];
    this.drawMyImage(cnv, cnv.width, cnv.height);
    tb.childNodes[1].textContent = this.name;
  }
  drawMyImage(cnv, w, h) {
    if (!this.img) {
      return;
    }
    setCanvasSize(cnv, w, h);
    var img;
    if (isAndroid) {
      img = this.originalImg;
    } else {
      img = this.img;
    }
    var imgw = img.naturalWidth ? img.naturalWidth : img.width;
    var imgh = img.naturalHeight ? img.naturalHeight : img.height;
    var scale = Math.min(w / imgw, h / imgh);
    var ctx = cnv.getContext("2d");
    var iw = Math.floor(scale * imgw);
    var ih = Math.floor(scale * imgh);
    var ix = Math.floor((w - scale * imgw) / 2);
    var iy = Math.floor((h - scale * imgh) / 2);
    ctx.drawImage(this.border, 0, 0, this.border.width, this.border.height, ix, iy, iw, ih);
    if (!img.complete) {
      img.onload = function() {
        ctx.drawImage(img, 0, 0, imgw, imgh, ix, iy, iw, ih);
      };
    } else {
      ctx.drawImage(img, 0, 0, imgw, imgh, ix, iy, iw, ih);
    }
  }
  ///////////////////////////////////////////////////////////////////////////////
  // sprite Primitives
  //////////////////////////////////////////////////////////////////////////////
  goHome() {
    this.setPos(this.homex, this.homey);
    this.scale = this.homescale;
    this.shown = this.homeshown;
    this.div.style.opacity = this.shown ? "1" : "0";
    this.setHeading(0);
    this.render();
  }
  touchingAny() {
    if (!this.shown) {
      return false;
    }
    setCanvasSize(enginePorts().getWorkingCanvas(), 480, 360);
    setCanvasSize(enginePorts().getWorkingCanvas2(), 480, 360);
    var page = this.div.parentNode;
    var box = this.getBoxWithEffects();
    for (var i = 0; i < page.childElementCount; i++) {
      var other = page.childNodes[i].owner;
      if (!other) {
        continue;
      }
      if (other.type == "text") {
        continue;
      }
      if (!other.shown) {
        continue;
      }
      if (other.id == this.id) {
        continue;
      }
      if (Events.dragthumbnail && other == Events.dragthumbnail.owner) {
        continue;
      }
      var box2 = other.getBoxWithEffects();
      if (!box.intersects(box2)) {
        continue;
      }
      if (this.verifyHit(other)) {
        return true;
      }
    }
    return false;
  }
  verifyHit(other) {
    var ctx = enginePorts().getWorkingCanvas().getContext("2d");
    var ctx2 = enginePorts().getWorkingCanvas2().getContext("2d");
    ctx.clearRect(0, 0, 480, 360);
    ctx2.clearRect(0, 0, 480, 360);
    var box = this.getBoxWithEffects();
    var box2 = other.getBoxWithEffects();
    var rect = box.intersection(box2);
    if (rect.width == 0) {
      return false;
    }
    if (rect.height == 0) {
      return false;
    }
    ctx.globalCompositeOperation = "source-over";
    this.stamp(ctx);
    ctx2.globalCompositeOperation = "source-over";
    other.stamp(ctx2);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(enginePorts().getWorkingCanvas2(), 0, 0);
    var pixels = ctx.getImageData(rect.x, rect.y, rect.width, rect.height).data;
    var max = Math.floor(pixels.length / 4);
    for (var i = 0; i < max; i++) {
      var pt = {
        x: i % rect.width,
        y: Math.floor(i / rect.width)
      };
      if (this.getAlpha(pixels, pt, rect.width) > 0) {
        return true;
      }
    }
    return false;
  }
  getAlpha(data, node, w) {
    return data[node.x * 4 + node.y * w * 4 + 3];
  }
  setHeading(angle) {
    this.angle = angle % 360;
    this.render();
  }
  setPos(dx, dy) {
    this.dirx = dx - this.xcoor == 0 ? 1 : (dx - this.xcoor) / Math.abs(dx - this.xcoor);
    this.diry = dy - this.ycoor == 0 ? 1 : (dy - this.ycoor) / Math.abs(dy - this.ycoor);
    this.xcoor = dx;
    this.ycoor = dy;
    this.wrap();
    this.render();
    setProps(this.div.style, {
      position: "absolute",
      left: "0px",
      top: "0px"
    });
    this.updateBubble();
  }
  wrap() {
    if (this.type == "text") {
      this.wrapText();
    } else {
      this.wrapChar();
    }
  }
  wrapChar() {
    if (this.xcoor < 0) {
      this.xcoor = 480 + this.xcoor;
    }
    if (this.ycoor < 0) {
      this.ycoor = 360 + this.ycoor;
    }
    if (this.xcoor >= 480) {
      this.xcoor = this.xcoor - 480;
    }
    if (this.ycoor >= 360) {
      this.ycoor = this.ycoor - 360;
    }
  }
  wrapText() {
    var max = this.cx > 480 ? this.cx : 480;
    var min = this.cx > 480 ? 480 - this.cx : 0;
    if (this.xcoor < min) {
      this.xcoor = max + this.xcoor;
    }
    if (this.ycoor < 0) {
      this.ycoor = 360 + this.ycoor;
    }
    if (this.xcoor >= max) {
      this.xcoor = this.xcoor - max;
    }
    if (this.ycoor >= 360) {
      this.ycoor = this.ycoor - 360;
    }
  }
  render() {
    var dx, dy, mtx;
    if (isAndroid) {
      mtx = "";
      if (this.img) {
        dx = this.xcoor - this.cx * this.scale;
        dy = this.ycoor - this.cy * this.scale;
        mtx = "translate3d(" + dx + "px," + dy + "px, 0px)";
        mtx += " rotate(" + this.angle + "deg)";
        if (this.flip) {
          mtx += " scale(-1, 1)";
        } else {
          mtx += " scale(1, 1)";
        }
        var w = this.originalImg.width * this.scale;
        var h = this.originalImg.height * this.scale;
        this.div.style.width = w + "px";
        this.div.style.height = h + "px";
        if (this.border) {
          this.border.style.width = w + "px";
          this.border.style.height = h + "px";
        }
        this.img.style.width = w + "px";
        this.img.style.height = h + "px";
      } else {
        dx = this.xcoor - this.cx;
        dy = this.ycoor - this.cy;
        mtx = "translate3d(" + dx + "px," + dy + "px, 0px)";
      }
      this.setTransform(mtx);
    } else {
      dx = this.xcoor - this.cx;
      dy = this.ycoor - this.cy;
      mtx = "translate3d(" + dx + "px," + dy + "px, 0px)";
      if (this.img) {
        mtx += " rotate(" + this.angle + "deg)";
        if (this.flip) {
          mtx += "scale(" + -this.scale + ", " + this.scale + ")";
        } else {
          mtx += "scale(" + this.scale + ", " + this.scale + ")";
        }
      }
      this.setTransform(mtx);
    }
  }
  select() {
    if (this.borderOn) {
      return;
    }
    if (!this.img) {
      return;
    }
    if (!this.border) {
      return;
    }
    this.div.appendChild(this.border);
    setProps(this.border.style, {
      position: "absolute",
      left: "0px",
      top: "0px"
    });
    this.div.appendChild(this.img);
    setProps(this.img.style, {
      position: "absolute",
      left: "0px",
      top: "0px"
    });
    this.borderOn = true;
    this.render();
  }
  unselect() {
    if (!this.borderOn) {
      return;
    }
    while (this.div.childElementCount > 0) {
      this.div.removeChild(this.div.childNodes[0]);
    }
    this.div.appendChild(this.img);
    this.borderOn = false;
  }
  setTransform(transform) {
    this.div.style.webkitTransform = transform;
  }
  screenLeft() {
    return Math.round(this.xcoor - this.cx * this.scale);
  }
  screenTop() {
    return Math.round(this.ycoor - this.cy * this.scale);
  }
  noScaleFor() {
    this.setScaleTo(this.defaultScale);
  }
  changeSizeBy(num) {
    var n = Number(num) + Number(this.scale) * 100;
    this.scale = this.getScale(n / 100);
    this.setPos(this.xcoor, this.ycoor);
    this.render();
  }
  setScaleTo(n) {
    n = this.getScale(n);
    if (n == this.scale) {
      return;
    }
    this.scale = n;
    this.setPos(this.xcoor, this.ycoor);
    this.render();
  }
  getScale(n) {
    var mins = Math.max(Math.max(this.w, this.h) * n, 36);
    var maxs = Math.min(Math.min(this.w, this.h) * n, 360);
    if (mins == 36) {
      return 36 / Math.max(this.w, this.h);
    }
    if (maxs == 360) {
      return 360 / Math.min(this.w, this.h);
    }
    return n;
  }
  getBox() {
    var box = {
      x: this.screenLeft(),
      y: this.screenTop(),
      width: this.w * this.scale,
      height: this.h * this.scale
    };
    return box;
  }
  getBoxWithEffects() {
    if (this.type == "text") {
      return new Rectangle(this.screenLeft(), this.screenTop(), this.w * this.scale, this.h * this.scale);
    }
    var max = Math.max(this.outline.width, this.outline.height);
    var w = Math.floor(max * 1.5 * this.scale);
    var h = Math.floor(max * 1.5 * this.scale);
    return new Rectangle(
      Math.floor(this.xcoor - w / 2),
      Math.floor(this.ycoor - h / 2),
      Math.floor(w),
      Math.floor(h)
    );
  }
  //////////////////////////////////////////////////
  // Balloon
  //////////////////////////////////////////////////
  closeBalloon() {
    if (!this.balloon) {
      return;
    }
    this.balloon.parentNode.removeChild(this.balloon);
    this.balloon = null;
  }
  openBalloon(label) {
    if (this.balloon) {
      this.closeBalloon();
    }
    var w = 200;
    var h = 36;
    var curve = 6;
    var dy = this.screenTop();
    this.balloon = newDiv(enginePorts().getStage().currentPage.div, 0, 0, w, h, {
      position: "absolute",
      zIndex: 2,
      visibility: "hidden"
    });
    var bimg = document.createElement("img");
    setProps(bimg.style, {
      position: "absolute",
      zIndex: 2
    });
    this.balloon.appendChild(bimg);
    var p = newP(this.balloon, label, {});
    p.setAttribute("class", "balloon");
    w = p.offsetWidth;
    if (w < 36) {
      w = 36;
    }
    if (w > 200) {
      w = 200;
    }
    const stageOwner = gn("stage").owner;
    w += 10 * stageOwner.currentZoom;
    setProps(p.style, {
      position: "absolute",
      width: w + "px"
    });
    w += 10;
    w = Math.round(w);
    var offset = this.screenLeft() + this.div.offsetWidth * this.scale / 2 - w / 2;
    var dx = offset < 0 ? 0 : offset + w > 480 ? 478 - w : offset;
    dx = Math.round(dx);
    h = p.offsetHeight + curve * 2 + 7;
    setCanvasSize(this.balloon, w, h);
    dy -= h;
    if (dy < 2) {
      dy = 2;
    }
    this.balloon.style.webkitTransform = "translate3d(" + dx + "px," + dy + "px, 0px)";
    this.balloon.left = dx;
    this.balloon.top = dy;
    setProps(this.balloon.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      visibility: "visible"
    });
    this.drawBalloon();
  }
  updateBubble() {
    if (this.balloon == null) {
      return;
    }
    var w = this.balloon.offsetWidth;
    var h = this.balloon.offsetHeight;
    var dy = this.screenTop();
    var offset = this.screenLeft() + this.div.offsetWidth * this.scale / 2 - w / 2;
    var dx = offset < 0 ? 0 : offset + w > 480 ? 478 - w : offset;
    dx = Math.round(dx);
    dy -= h;
    if (dy < 2) {
      dy = 2;
    }
    this.balloon.style.webkitTransform = "translate3d(" + dx + "px," + dy + "px, 0px)";
    this.balloon.left = dx;
    this.balloon.top = dy;
    this.drawBalloon();
  }
  drawBalloon() {
    var img = this.balloon.childNodes[0];
    var w = this.balloon.offsetWidth;
    var h = this.balloon.offsetHeight;
    var curve = 6;
    var dx = this.balloon.left;
    var x = this.xcoor;
    var h2 = h - 8;
    var w2 = w - 1;
    var side2 = x - dx;
    var margin = 20;
    if (side2 < margin) {
      side2 = margin;
    }
    if (side2 > w2 - margin) {
      side2 = w2 - margin;
    }
    var side1 = w2 - side2;
    var str = BlockSpecs.balloon.concat();
    str = str.replace('width="30px"', 'width="' + w + 'px"');
    str = str.replace('height="44px"', 'height="' + h + 'px"');
    str = str.replace('viewBox="0 0 30 44"', 'viewBox="0 0 ' + w + " " + h + '"');
    str = str.replace("h17", "h" + (w2 - curve * 2));
    str = str.replace("v24", "v" + (h2 - curve * 2));
    var a = str.split("h-2");
    var b = a[1].split("h-1");
    str = a[0] + "h" + (-side1 + 7 + curve) + b[0] + "h" + (-side2 + 7 + curve) + b[1];
    img.src = "data:image/svg+xml;base64," + btoa(str);
  }
  /////////////////////////////////////
  // Sprite rendering
  ////////////////////////////////////
  stamp(ctx, deltax, deltay) {
    var w = this.outline.width * this.scale;
    var h = this.outline.height * this.scale;
    var dx = deltax ? deltax : 0;
    var dy = deltay ? deltay : 0;
    ctx.save();
    ctx.translate(this.xcoor + dx, this.ycoor + dy);
    ctx.rotate(this.angle * DEGTOR);
    if (this.flip) {
      ctx.scale(-1, 1);
    }
    ctx.drawImage(this.outline, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  /////////////////////////////////////
  // Text Creation
  /////////////////////////////////////
  createText(attr, whenDone) {
    var page = attr.page;
    setProps(this, attr);
    this.div = newHTML("p", "textsprite", page.div);
    setProps(this.div.style, {
      fontSize: this.fontsize + "px",
      color: this.color,
      fontFamily: window.Settings.textSpriteFont
    });
    this.div.owner = this;
    this.div.id = this.id;
    this.scale = 1;
    this.homescale = 1;
    this.homeshown = true;
    this.homeflip = false;
    this.outline = document.createElement("canvas");
    var sprites = JSON.parse(page.sprites);
    if (sprites.indexOf(this.id) < 0) {
      sprites.push(this.id);
    }
    page.sprites = JSON.stringify(sprites);
    if (this.str == "" && !whenDone) {
      this.setTextBox();
      this.activateInput();
      var delta2 = this.fontsize * 1.35;
      page.textstartat += delta2;
      if (page.textstartat + delta2 > 360) {
        page.textstartat = 42;
      }
    } else {
      if (Localization.isSampleLocalizedKey(this.str) && enginePorts().isSampleOrStarter()) {
        this.str = Localization.localize("SAMPLE_TEXT_" + this.str);
      }
      this.recalculateText();
      if (whenDone) {
        whenDone(this);
      }
    }
  }
  setTextBox() {
    var sform = namedForms2.activetextbox;
    sform.textsprite = this;
    var box = this.getBox();
    var ti = namedForms2.activetextbox.typing;
    ti.value = this.str;
    var styles;
    if (isAndroid) {
      styles = {
        color: this.color,
        fontSize: this.fontsize * scaleMultiplier + "px"
      };
    } else {
      styles = {
        color: this.color,
        fontSize: this.fontsize + "px"
      };
    }
    var ci = BlockSpecs.fontcolors.indexOf(rgbToHex(this.color));
    enginePorts().uiSetMenuTextColor(gn("textcolormenu").childNodes[ci < 0 ? 9 : ci]);
    setProps(ti.style, styles);
    var dy;
    if (isAndroid) {
      dy = box.y * scaleMultiplier + globaly(gn("stage")) - 10 * scaleMultiplier;
    } else {
      dy = box.y + globaly(gn("stage")) - 10;
    }
    var formsize = 470;
    gn("textbox").className = "pagetext on";
    var dx;
    if (isAndroid) {
      const inputParent = ti.parentNode.parentNode;
      AndroidInterface.scratchjr_setsoftkeyboardscrolllocation(dy * window.devicePixelRatio, (dy + inputParent.getBoundingClientRect().height * 1.7) * window.devicePixelRatio);
      dx = (-10 + 240 - Math.round(formsize / 2)) * scaleMultiplier + globalx(gn("stage"));
      setProps(gn("textbox").style, {
        top: dy + "px",
        left: dx + "px",
        zIndex: 10
      });
      setProps(sform.style, {
        height: (this.fontsize + 10) * scaleMultiplier + "px"
      });
      setTimeout(function() {
        AndroidInterface.scratchjr_forceShowKeyboard();
      }, 500);
    } else {
      dx = -10 + 240 - Math.round(formsize / 2) + globalx(gn("stage"));
      setProps(gn("textbox").style, {
        top: dy + "px",
        left: dx + "px",
        zIndex: 10
      });
      setProps(sform.style, {
        height: this.fontsize + 10 + "px"
      });
    }
  }
  unfocusText() {
    enginePorts().blur();
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
    var form = namedForms2.activetextbox;
    var changed2 = this.oldvalue != form.typing.value;
    if (this.noChars(form.typing.value)) {
      this.deleteText(this.oldvalue != "");
    } else {
      this.contractText();
      this.div.style.visibility = "visible";
      if (isAndroid) {
        gn("textbox").style.visibility = "hidden";
      }
      gn("textbox").className = "pagetext off";
      gn("textcolormenu").className = "textuicolormenu off";
      gn("textfontsizes").className = "textuifont off";
      gn("fontsizebutton").className = "fontsizeText off";
      gn("fontcolorbutton").className = "changecolorText off";
      form.textsprite = null;
      this.deactivateInput();
      if (changed2) {
        const parentPage = this.div.parentNode.owner;
        enginePorts().undoRecord({
          action: "edittext",
          where: parentPage.id,
          who: this.id
        });
        enginePorts().storyStart("Sprite.prototype.unfocusText");
      }
    }
    enginePorts().thumbsUpdatePages();
    if (isAndroid) {
      enginePorts().popBackButtonCallback();
      AndroidInterface.scratchjr_forceHideKeyboard();
    }
  }
  deleteText(record) {
    var id = this.id;
    var page = enginePorts().getStage().currentPage;
    page.textstartat = this.ycoor + this.fontsize * 1.35 > 360 ? 36 : this.ycoor;
    var list = JSON.parse(page.sprites);
    var n = list.indexOf(this.id);
    if (n < 0) {
      return;
    }
    list.splice(n, 1);
    this.div.parentNode.removeChild(this.div);
    page.sprites = JSON.stringify(list);
    var form = namedForms2.activetextbox;
    gn("textbox").style.visibility = "hidden";
    form.textsprite = null;
    if (record) {
      enginePorts().undoRecord({
        action: "deletesprite",
        who: id,
        where: enginePorts().getStage().currentPage.id
      });
      enginePorts().storyStart("Sprite.prototype.deleteText");
    }
  }
  noChars(str) {
    for (var i = 0; i < str.length; i++) {
      if (str[i] != " ") {
        return false;
      }
    }
    return true;
  }
  contractText() {
    var form = namedForms2.activetextbox;
    this.str = form.typing.value.substring(0, form.typing.maxLength);
    this.recalculateText();
  }
  clickOnText(e) {
    e.stopPropagation();
    this.setTextBox();
    gn("textbox").style.visibility = "visible";
    this.div.style.visibility = "hidden";
    this.activateInput();
  }
  activateInput() {
    this.oldvalue = this.str;
    var ti = namedForms2.activetextbox.typing;
    gn("textbox").style.visibility = "visible";
    var me = this;
    ti.onblur = function() {
      me.unfocusText();
    };
    ti.onkeypress = function(evt) {
      me.handleWrite(evt);
    };
    ti.onkeyup = function(evt) {
      me.handleKeyUp(evt);
    };
    ti.onsubmit = function() {
      me.unfocusText();
    };
    if (isAndroid) {
      setTimeout(function() {
        ti.focus();
      }, 500);
      enginePorts().pushBackButtonCallback(function() {
        me.unfocusText();
      });
    } else {
      if (isTouch) {
        ti.focus();
      } else {
        setTimeout(function() {
          ti.focus();
        }, 100);
      }
    }
  }
  handleWrite(e) {
    var key = e.keyCode || e.which;
    var ti = e.target;
    if (key == 13) {
      e.preventDefault();
      ti.blur();
    } else {
      if (!ti.parentNode.textsprite) {
        gn("textbox").style.visibility = "hidden";
        this.deactivateInput();
      }
    }
  }
  handleKeyUp(e) {
    var ti = e.target;
    var form = ti.parentNode;
    if (!form.textsprite) {
      return;
    }
    const sprite = form.textsprite;
    sprite.str = ti.value;
  }
  deactivateInput() {
    var ti = namedForms2.activetextbox.typing;
    ti.onblur = null;
    ti.onkeypress = null;
    ti.onsubmit = null;
  }
  activate() {
    var list = fitInRect(this.w, this.h, enginePorts().scriptsPaneWatermark().offsetWidth, enginePorts().scriptsPaneWatermark().offsetHeight);
    var div = enginePorts().scriptsPaneWatermark();
    while (div.childElementCount > 0) {
      div.removeChild(div.childNodes[0]);
    }
    var img = this.getSVGimage(this.watermark);
    div.appendChild(img);
    var attr = {
      width: this.w + "px",
      height: this.h + "px",
      left: list[0] + "px",
      top: list[1] + "px",
      zoom: Math.floor(list[2] / this.w * 100) + "%"
    };
    setProps(img.style, attr);
  }
  getSVGimage(svg) {
    var img = document.createElement("img");
    var str = new XMLSerializer().serializeToString(svg);
    str = str.replace(/ href="data:image/g, ' xlink:href="data:image');
    img.src = "data:image/svg+xml;base64," + btoa(str);
    return img;
  }
  /////////////////////////////////////////////////
  // Text fcn
  ////////////////////////////////////////////////
  setColor(c) {
    this.color = c;
    this.div.style.color = this.color;
  }
  setFontSize(n) {
    if (n < 12) {
      n = 12;
    }
    if (n > 72) {
      n = 72;
    }
    this.fontsize = n;
  }
  recalculateText() {
    this.div.style.color = this.color;
    this.div.style.fontSize = this.fontsize + "px";
    this.div.textContent = this.str;
    var ctx = this.outline.getContext("2d");
    ctx.font = "bold " + this.fontsize + "px " + window.Settings.textSpriteFont;
    var w = ctx.measureText(this.str).width;
    this.w = Math.round(w) + 1;
    this.div.style.width = this.w * 2 + "px";
    this.h = this.div.offsetHeight;
    this.cx = this.w / 2;
    this.cy = this.h / 2;
    setCanvasSize(this.outline, this.w, this.h);
    ctx.clearRect(0, 0, this.outline.width, this.outline.height);
    ctx.font = "bold " + this.fontsize + "px " + window.Settings.textSpriteFont;
    ctx.fillStyle = this.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(this.str, 0, 0);
    this.setPos(this.xcoor, this.ycoor);
  }
  startShaking() {
    var p = this.div.parentNode;
    var shake = newHTML("div", "shakeme", p);
    shake.id = "shakediv";
    if (isAndroid) {
      setProps(shake.style, {
        position: "absolute",
        left: this.screenLeft() + "px",
        top: this.screenTop() + "px",
        width: this.w * this.scale + "px",
        height: this.h * this.scale + "px"
      });
    } else {
      setProps(shake.style, {
        position: "absolute",
        left: this.screenLeft() / this.scale + "px",
        top: this.screenTop() / this.scale + "px",
        width: this.w + "px",
        height: this.h + "px",
        zoom: Math.floor(this.scale * 100) + "%"
      });
    }
    var mtx = "translate3d(0px, 0px, 0px)";
    if (this.img) {
      mtx += " rotate(" + this.angle + "deg)";
      if (this.flip) {
        mtx += "scale(-1, 1)";
      } else {
        mtx += "scale(1, 1)";
      }
    }
    this.setTransform(mtx);
    shake.appendChild(this.div);
    var cb = newHTML("div", this.type == "sprite" ? "deletesprite" : "deletetext", shake);
    if (isiOS && this.type == "sprite") {
      cb.style.zoom = Math.floor(1 / this.scale * 100) + "%";
    }
    if (globalx(cb) - globalx(enginePorts().getStage().div) < 0) {
      cb.style.left = Math.abs(globalx(cb) - globalx(enginePorts().getStage().div)) * this.scale + "px";
    }
    if (globaly(cb) - globaly(enginePorts().getStage().div) < 0) {
      cb.style.top = Math.abs(globaly(cb) - globaly(enginePorts().getStage().div)) * this.scale + "px";
    }
    cb.id = "deletesprite";
    this.div = shake;
    this.div.owner = this;
  }
  stopShaking() {
    if (this.div.id != "shakediv") {
      return;
    }
    var p = this.div;
    this.div = this.div.childNodes[0];
    enginePorts().getStage().currentPage.div.appendChild(this.div);
    if (p.id == "shakediv") {
      p.parentNode.removeChild(p);
    }
    if (isAndroid) {
      this.render();
    } else {
      var mtx = "translate3d(" + (this.xcoor - this.cx) + "px," + (this.ycoor - this.cy) + "px, 0px)";
      if (this.img) {
        mtx += " rotate(" + this.angle + "deg)";
        if (this.flip) {
          mtx += "scale(" + -this.scale + ", " + this.scale + ")";
        } else {
          mtx += "scale(" + this.scale + ", " + this.scale + ")";
        }
      }
      this.setTransform(mtx);
    }
  }
  drawCloseButton() {
    const canvasDiv = this.div;
    var ctx = canvasDiv.getContext("2d");
    var img = document.createElement("img");
    img.src = "assets/ui/closeit.svg";
    if (!img.complete) {
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
      };
    } else {
      ctx.drawImage(img, 0, 0);
    }
  }
  //////////////////////////////////////////
  // Save data
  /////////////////////////////////////////
  getData() {
    var data = this.type == "sprite" ? this.getSpriteData() : this.getTextBoxData();
    if (this.type != "sprite") {
      return data;
    }
    const scriptsOwner = getModelRefAs(gn(this.id + "_scripts"), "scripts");
    var res = [];
    var topblocks = scriptsOwner.getEncodableBlocks();
    for (var i = 0; i < topblocks.length; i++) {
      res.push(enginePorts().projectEncodeStrip(topblocks[i]));
    }
    data.scripts = res;
    return data;
  }
  getSpriteData() {
    var data = {};
    data.shown = this.shown;
    data.type = this.type;
    data.md5 = this.md5;
    data.id = this.id;
    data.flip = this.flip;
    data.name = this.name;
    data.angle = this.angle;
    data.scale = this.scale;
    data.speed = this.speed;
    data.defaultScale = this.defaultScale;
    data.sounds = this.sounds;
    data.xcoor = this.xcoor;
    data.ycoor = this.ycoor;
    data.cx = this.cx;
    data.cy = this.cy;
    data.w = this.w;
    data.h = this.h;
    data.homex = this.homex;
    data.homey = this.homey;
    data.homescale = this.homescale;
    data.homeshown = this.homeshown;
    data.homeflip = this.homeflip;
    return data;
  }
  getTextBoxData() {
    var data = {};
    data.shown = this.shown;
    data.type = this.type;
    data.id = this.id;
    data.speed = this.speed;
    data.cx = this.cx;
    data.cy = this.cy;
    data.w = Math.floor(this.w);
    data.h = Math.floor(this.h);
    data.xcoor = this.xcoor;
    data.ycoor = this.ycoor;
    data.homex = this.homex;
    data.homey = this.homey;
    data.str = this.str;
    data.color = this.color;
    data.fontsize = this.fontsize;
    return data;
  }
};

// src/app/src/geom/Matrix.ts
var Matrix = class _Matrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  identity() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
  }
  setMatrix(mtx) {
    this.a = mtx.a;
    this.b = mtx.b;
    this.c = mtx.c;
    this.d = mtx.d;
    this.e = mtx.e;
    this.f = mtx.f;
  }
  isIdentity() {
    return this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1 && this.e == 0 && this.f == 0;
  }
  rotate(angleDeg) {
    const cos = Math.cos(angleDeg * Math.PI / 180);
    const sin = Math.sin(angleDeg * Math.PI / 180);
    this.a = cos;
    this.b = sin;
    this.c = -sin;
    this.d = cos;
  }
  scale(scalex, scaley) {
    this.a = scalex;
    this.d = scaley ? scaley : scalex;
  }
  translate(dx, dy) {
    this.e = dx;
    this.f = dy;
  }
  transformPoint(pt) {
    return {
      x: this.a * pt.x + this.c * pt.y + this.e,
      y: this.b * pt.x + this.d * pt.y + this.f
    };
  }
  multiply(m2) {
    const zero = 1e-14;
    const m = new _Matrix();
    m.a = this.a * m2.a + this.c * m2.b;
    m.b = this.b * m2.a + this.d * m2.b;
    m.c = this.a * m2.c + this.c * m2.d;
    m.d = this.b * m2.c + this.d * m2.d;
    m.e = this.a * m2.e + this.c * m2.f + this.e;
    m.f = this.b * m2.e + this.d * m2.f + this.f;
    if (Math.abs(m.a) < zero) m.a = 0;
    if (Math.abs(m.b) < zero) m.b = 0;
    if (Math.abs(m.c) < zero) m.c = 0;
    if (Math.abs(m.d) < zero) m.d = 0;
    if (Math.abs(m.e) < zero) m.e = 0;
    if (Math.abs(m.f) < zero) m.f = 0;
    return m;
  }
};

// src/app/src/editor/engine/Page.ts
var Page = class {
  div;
  bkg;
  currentSpriteName;
  id;
  md5;
  num;
  sprites;
  svg;
  textstartat;
  thumbnail;
  constructor(id, data, fcn) {
    var container = enginePorts().getStage().pagesdiv;
    this.div = newHTML("div", "stagepage", container);
    this.div.owner = this;
    this.id = id;
    this.textstartat = 36;
    this.div.setAttribute("id", this.id);
    enginePorts().getStage().currentPage = this;
    this.num = data ? data.num : enginePorts().getStage().pages.length + 1;
    this.sprites = JSON.stringify([]);
    this.bkg = newDiv(this.div, 0, 0, 480, 360, {
      position: "absolute",
      background: enginePorts().getStageColor()
    });
    this.bkg.type = "background";
    enginePorts().getStage().pages.push(this);
    if (!data) {
      this.emptyPage();
    } else {
      this.loadPageData(data, fcn);
    }
  }
  loadPageData(data, fcn) {
    this.currentSpriteName = data.lastSprite;
    if (data.textstartat) {
      this.textstartat = Number(data.textstartat);
    }
    if (data.md5 && data.md5 != "undefined") {
      bumpMediaCount(1);
      this.setBackground(data.md5, checkBkgDone);
    } else {
      this.clearBackground();
    }
    var list = data.sprites;
    for (var j = 0; j < list.length; j++) {
      enginePorts().projectRecreateObject(this, list[j], data[list[j]], checkCount);
    }
    var layers = data.layers;
    for (var i = 0; i < layers.length; i++) {
      var obj = gn(layers[i]);
      if (obj) {
        this.div.appendChild(obj);
      }
    }
    function checkCount() {
      if (!fcn) {
        return;
      }
      if (getMediaCount() < 1) {
        fcn();
      }
    }
    function checkBkgDone() {
      enginePorts().projectSubstractCount();
      if (!fcn) {
        return;
      }
      if (getMediaCount() < 1) {
        fcn();
      }
    }
  }
  emptyPage() {
    this.clearBackground();
    this.createCat();
  }
  setCurrentSprite(spr) {
    if (enginePorts().getSprite()) {
      enginePorts().getSprite().unselect();
    }
    if (spr) {
      this.currentSpriteName = spr.id;
      spr.div.style.visibility = "visible";
      enginePorts().paletteShow();
      gn("scripts").style.display = enginePorts().isInFullscreen() ? "none" : "block";
      spr.activate();
    } else {
      this.currentSpriteName = void 0;
      enginePorts().paletteHide();
      gn("scripts").style.display = "none";
    }
  }
  clearBackground() {
    while (this.bkg.childElementCount > 0) {
      this.bkg.removeChild(this.bkg.childNodes[0]);
    }
  }
  setBackground(name2, fcn) {
    if (name2 == "undefined") {
      return;
    }
    this.clearBackground();
    this.md5 = void 0;
    if (name2 == "none") {
      if (fcn) {
        fcn();
      }
      return;
    }
    this.md5 = name2;
    if (!name2) {
      return;
    }
    var me = this;
    var keys = MediaLib.keys;
    var url = keys[name2] ? MediaLib.path + name2 : name2.indexOf("/") < 0 ? iOS.path + name2 : name2;
    var md5 = keys[name2] ? MediaLib.path + name2 : name2;
    if (md5.substr(md5.length - 3) == "png") {
      this.setBackgroundImage(url, fcn);
      this.svg = null;
      return;
    }
    if (md5.indexOf("/") > -1) {
      IO.requestFromServer(md5, doNext);
    } else {
      iOS.getmedia(md5, nextStep);
    }
    function nextStep(base64) {
      doNext(atob(base64));
    }
    function doNext(str) {
      str = str.replace(/>\s*</g, "><");
      me.setSVG(str);
      if (str.indexOf("xlink:href") < 0 && iOS.path) {
        me.setBackgroundImage(url, fcn);
      } else {
        var base64 = IO.getImageDataURL(me.md5, btoa(str));
        IO.getImagesInSVG(str, function() {
          me.setBackgroundImage(base64, fcn);
        });
      }
    }
  }
  setSVG(str) {
    var xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    var extxml = document.importNode(xmlDoc.documentElement, true);
    if (extxml.childNodes[0].nodeName == "#comment") {
      extxml.removeChild(extxml.childNodes[0]);
    }
    this.svg = extxml;
  }
  setBackgroundImage(url, fcn) {
    var img = document.createElement("img");
    img.src = url;
    this.bkg.originalImg = img.cloneNode(false);
    this.bkg.appendChild(img);
    setProps(img.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%"
    });
    this.bkg.img = img;
    if (!img.complete) {
      img.onload = function() {
        if (gn("backdrop").className == "modal-backdrop fade in") {
          enginePorts().projectSetProgress(enginePorts().projectGetMediaLoadRatio(70));
        }
        if (fcn) {
          fcn();
        }
      };
    } else {
      if (gn("backdrop").className == "modal-backdrop fade in") {
        enginePorts().projectSetProgress(enginePorts().projectGetMediaLoadRatio(70));
      }
      if (fcn) {
        fcn();
      }
    }
  }
  setPageSprites(showstate) {
    var list = JSON.parse(this.sprites);
    for (var i = 0; i < list.length; i++) {
      gn(list[i]).style.visibility = showstate;
    }
  }
  redoChangeBkg(data) {
    var me = this;
    var pagebag = data[this.id];
    var md5 = pagebag.md5 || "none";
    this.setBackground(md5, me.updateThumb);
  }
  //////////////////////////////////////
  // page thumbnail
  /////////////////////////////////////
  updateThumb(page) {
    var me = page ? page : enginePorts().getStage().currentPage;
    if (!me.thumbnail) {
      return;
    }
    var c = me.thumbnail.childNodes[0].childNodes[0];
    me.setPageThumb(c);
  }
  pageThumbnail(p) {
    var tb = newHTML("div", "pagethumb", p);
    tb.setAttribute("id", getIdFor("pagethumb"));
    setModelRef(tb, "pagethumb", this.id);
    tb.type = "pagethumb";
    var container = newHTML("div", "pc-container", tb);
    var c = newHTML("canvas", "pc", container);
    this.setPageThumb(c);
    var num = newHTML("div", "pagenum", tb);
    var pq = newHTML("p", void 0, num);
    pq.textContent = String(this.num);
    newHTML("div", "deletethumb", tb);
    tb.onmousedown = function(evt) {
      enginePorts().thumbsPageMouseDown(evt);
    };
    this.thumbnail = tb;
    return tb;
  }
  setPageThumb(c) {
    var w0, h0;
    if (window.Settings.edition == "PBS") {
      w0 = 136;
      h0 = 101;
    } else {
      w0 = 132;
      h0 = 99;
    }
    setCanvasSizeScaledToWindowDocumentHeight(c, w0, h0);
    var w = c.width;
    var h = c.height;
    var ctx = c.getContext("2d");
    if (window.Settings.edition == "PBS") {
      ctx.rect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.fill();
    } else {
      ctx.drawImage(BlockSpecs.canvasMask, 0, 0, w, h);
    }
    if (this.bkg.childElementCount > 0) {
      var img = this.bkg.originalImg;
      var imgw = img.naturalWidth ? img.naturalWidth : img.width;
      var imgh = img.naturalHeight ? img.naturalHeight : img.height;
      ctx.drawImage(img, 0, 0, imgw, imgh, 0, 0, w, h);
    }
    var scale = w / 480;
    for (var i = 0; i < this.div.childElementCount; i++) {
      var spr = this.div.childNodes[i].owner;
      if (!spr) {
        continue;
      }
      this.stampSpriteAt(ctx, spr, scale);
    }
    if (window.Settings.edition != "PBS") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(BlockSpecs.canvasMask, 0, 0, w, h);
      ctx.restore();
    }
  }
  stampSpriteAt(ctx, spr, scale) {
    if (!spr.shown) {
      return;
    }
    var img = spr.type == "sprite" ? spr.originalImg : spr.outline;
    this.drawSpriteImage(ctx, img, spr, scale);
  }
  drawSpriteImage(ctx, img, spr, scale) {
    if (!spr.shown) {
      return;
    }
    if (!img) {
      return;
    }
    var htmlImg = img;
    var imgw = htmlImg.naturalWidth ? htmlImg.naturalWidth : img.width;
    var imgh = htmlImg.naturalHeight ? htmlImg.naturalHeight : img.height;
    var sw = imgw * spr.scale;
    var sh = imgh * spr.scale;
    ctx.save();
    var pt = {
      x: spr.cx * spr.scale * scale,
      y: spr.cy * spr.scale * scale
    };
    ctx.translate(pt.x, pt.y);
    ctx.rotate(spr.angle * DEGTOR);
    ctx.translate(-pt.x, -pt.y);
    if (spr.flip) {
      ctx.scale(-1, 1);
      ctx.translate(-img.width * scale * spr.scale, 0);
    }
    var mtx = this.getMatrixFor(spr, scale);
    var pos = Vector.floor(mtx.transformPoint({
      x: Math.floor(spr.screenLeft() * scale),
      y: Math.floor(spr.screenTop() * scale)
    }));
    ctx.drawImage(img, 0, 0, imgw, imgh, pos.x, pos.y, Math.floor(sw * scale), Math.floor(sh * scale));
    ctx.restore();
  }
  getMatrixFor(spr, scale) {
    var sx = new Matrix();
    var angle = spr.angle ? -spr.angle : 0;
    if (spr.flip) {
      sx.a = -1;
      sx.d = 1;
    }
    var rx = new Matrix();
    rx.rotate(angle);
    return sx.multiply(rx);
  }
  /////////////////////
  // Saving
  /////////////////////
  encodePage() {
    var p = this.div;
    var spritelist = JSON.parse(this.sprites);
    var data = {};
    data.textstartat = this.textstartat;
    data.sprites = spritelist;
    var md5 = this.md5;
    if (md5) {
      data.md5 = md5;
    }
    data.num = this.num;
    const owner = this.currentSpriteName ? gn(this.currentSpriteName).owner : null;
    const isSpriteOwner = owner != null && typeof owner === "object" && "type" in owner && owner.type == "sprite";
    this.currentSpriteName = !this.currentSpriteName ? void 0 : isSpriteOwner ? this.currentSpriteName : this.getSprites()[0];
    data.lastSprite = this.currentSpriteName;
    for (var j = 0; j < spritelist.length; j++) {
      data[spritelist[j]] = enginePorts().projectEncodeSprite(spritelist[j]);
    }
    var layers = [];
    for (var i = 1; i < p.childElementCount; i++) {
      const layerNode = p.childNodes[i];
      var layerid = layerNode.id;
      if (layerid && layerid != "") {
        layers.push(layerid);
      }
    }
    data.layers = layers;
    return data;
  }
  getSprites() {
    var spritelist = JSON.parse(this.sprites);
    var res = [];
    for (var i = 0; i < spritelist.length; i++) {
      const owner = gn(spritelist[i]).owner;
      if (owner && typeof owner === "object" && "type" in owner && owner.type == "sprite") {
        res.push(spritelist[i]);
      }
    }
    return res;
  }
  /////////////////////////////
  // Object creation
  /////////////////////////////
  createText() {
    var textAttr = {
      shown: true,
      type: "text",
      scale: 1,
      defaultScale: 1,
      speed: 2,
      dirx: 1,
      diry: 1,
      angle: 0,
      homex: 240,
      homey: this.textstartat,
      xcoor: 240,
      ycoor: this.textstartat,
      str: "",
      color: BlockSpecs.fontcolors[BlockSpecs.fontcolors.length - 1],
      fontsize: 36,
      cx: 0,
      cy: 32 * 1.35 / 2,
      w: 0,
      h: 36 * 1.35
    };
    textAttr.page = this;
    textAttr.id = getIdFor("Text");
    return new Sprite(textAttr);
  }
  createCat() {
    var sprAttr = enginePorts().uiMascotData(enginePorts().getStage().currentPage);
    bumpMediaCount(1);
    var me = this;
    return new Sprite(sprAttr, me.pageAdded);
  }
  update(spr) {
    if (spr) {
      enginePorts().undoRecord({
        action: "modify",
        where: this.id,
        who: spr.id
      });
    } else {
      enginePorts().undoRecord({
        action: "recreatepage",
        where: this.id,
        who: this.id
      });
    }
    if (spr) {
      enginePorts().thumbsUpdateSprite(spr);
    } else {
      enginePorts().thumbsUpdateSprites();
    }
    enginePorts().thumbsUpdatePages();
  }
  updateBkg() {
    var me = enginePorts().getStage().currentPage;
    enginePorts().storyStart("Page.prototype.updateBkg");
    enginePorts().undoRecord({
      action: "changebkg",
      where: me.id,
      who: me.id
    });
    enginePorts().thumbsUpdatePages();
  }
  spriteAdded(spr) {
    var me = spr.div.parentNode.owner;
    me.setCurrentSprite(spr);
    me.update(spr);
    enginePorts().uiSpriteInView(spr);
    enginePorts().setOnHold(false);
  }
  pageAdded(spr) {
    var me = spr.div.parentNode.owner;
    bumpMediaCount(-1);
    me.setCurrentSprite(spr);
    enginePorts().storyStart("Page.prototype.pageAdded");
    if (enginePorts().getStage().pages.length > 1) {
      enginePorts().undoRecord({
        action: "addpage",
        where: me.id,
        who: me.id
      });
    }
    enginePorts().thumbsUpdateSprites();
    enginePorts().thumbsUpdatePages();
  }
  addSprite(scale, md5, cname) {
    enginePorts().setOnHold(true);
    var sprAttr = {
      flip: false,
      angle: 0,
      shown: true,
      type: "sprite",
      scale,
      defaultScale: scale,
      speed: 2,
      dirx: 1,
      diry: 1,
      sounds: ["pop.mp3"],
      homex: 240,
      homescale: scale,
      homey: 180,
      xcoor: 240,
      ycoor: 180,
      homeshown: true
    };
    sprAttr.page = enginePorts().getStage().currentPage;
    sprAttr.id = getIdFor(cname);
    sprAttr.name = cname;
    sprAttr.md5 = md5;
    return new Sprite(sprAttr, this.spriteAdded);
  }
  createSprite(data) {
    return new Sprite(data, this.spriteAdded);
  }
  modifySprite(md5, cid, sid) {
    var sprite = gn(unescape(sid)).owner;
    if (!sprite) {
      sprite = enginePorts().getSprite();
    }
    sprite.md5 = md5;
    sprite.name = cid;
    var me = this;
    sprite.getAsset(gotImage);
    function gotImage(dataurl) {
      sprite.setCostume(dataurl, me.spriteAdded);
    }
  }
  modifySpriteName(cid, sid) {
    var sprite = gn(unescape(sid)).owner;
    if (!sprite) {
      sprite = enginePorts().getSprite();
    }
    sprite.name = cid;
    sprite.thumbnail.childNodes[1].textContent = cid;
    enginePorts().undoRecord({
      action: "modify",
      where: this.id,
      who: sprite.id
    });
    enginePorts().storyStart("Page.prototype.modifySpriteName");
  }
};

// src/app/src/editor/ui/Undo.ts
var buffer2 = [];
var index2 = 0;
var tryCounter;
var Undo = class _Undo {
  static init() {
    index2 = buffer2.length;
    _Undo.update();
  }
  static setup(p) {
    var div = newHTML("div", "controlundo", p);
    div.setAttribute("id", "undocontrols");
    var lib = [["undo", _Undo.prevStep], ["redo", _Undo.nextStep]];
    for (var i = 0; i < lib.length; i++) {
      _Undo.newToggleClicky(div, "id_", lib[i][0], lib[i][1]);
    }
    _Undo.update();
  }
  static newToggleClicky(p, prefix, key, fcn) {
    var div = newHTML("div", key + "button", p);
    div.setAttribute("type", "toggleclicky");
    div.setAttribute("id", prefix + key);
    if (fcn) {
      div.onmousedown = function(evt) {
        fcn(evt);
      };
    }
    return div;
  }
  static record(obj) {
    if (ScratchJr.getActiveScript()) {
      const activeScripts = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
      activeScripts.removeCaret();
    }
    if (index2 + 1 <= buffer2.length) {
      buffer2.splice(index2 + 1, buffer2.length);
    }
    var data = Project.getUndo();
    for (var key in obj) {
      data[key] = obj[key];
    }
    buffer2.push(data);
    index2++;
    _Undo.update();
    ScratchJr.changed = true;
  }
  //////////////////////////////////
  // Control buttons callbacks
  //
  ////////////////////////////////
  static prevStep(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    ScratchJr.unfocus();
    ScratchJr.time = e.timeStamp;
    while (index2 >= buffer2.length) {
      index2--;
    }
    index2--;
    var snd = index2 < 0 ? "boing.wav" : "tap.wav";
    ScratchAudio.sndFX(snd);
    if (index2 < 0) {
      index2 = 0;
    } else {
      _Undo.smartRecreate("prev", buffer2[index2 + 1], buffer2[index2]);
    }
  }
  static nextStep(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    ScratchJr.unfocus();
    ScratchJr.time = e.timeStamp;
    index2++;
    var snd = index2 > buffer2.length - 1 ? "boing.wav" : "tap.wav";
    ScratchAudio.sndFX(snd);
    if (index2 > buffer2.length - 1) {
      index2 = buffer2.length - 1;
    } else {
      _Undo.smartRecreate("next", buffer2[index2], buffer2[index2]);
    }
  }
  static smartRecreate(cmd, elem, data) {
    ScratchJr.stopStrips();
    var action = elem.action;
    var page = elem.where;
    var spr = elem.who;
    switch (action) {
      case "pageorder":
        ScratchJr.stage.pages = _Undo.getPageOrder(data);
        _Undo.recreateAllScripts(data);
        ScratchJr.stage.setPage(gn(data.currentPage).owner, false);
        if (Palette.numcat == 5) {
          Palette.selectCategory(5);
        }
        break;
      case "changepage":
        ScratchJr.stage.setPage(gn(data.currentPage).owner, false);
        break;
      case "changebkg":
        gn(page).owner.redoChangeBkg(data);
        break;
      case "scripts":
        _Undo.redoScripts(data, page, spr);
        if (spr && gn(spr)) {
          const pageOwner = gn(page).owner;
          pageOwner.setCurrentSprite(gn(spr).owner);
          Thumbs.selectThisSprite(gn(spr).owner);
          UI.resetSpriteLibrary();
        }
        break;
      case "deletepage":
      case "addpage":
        if (data[page]) {
          _Undo.copyPage(data, page);
        } else {
          _Undo.removePage(data, page);
        }
        break;
      case "deletesprite":
      case "copy":
        if (data[page][spr]) {
          _Undo.copySprite(data, page, spr);
        } else {
          _Undo.removeSprite(data, page, spr);
        }
        break;
      case "deletesound":
        var sounds = data[page][spr].sounds.concat();
        gn(spr).owner.sounds = sounds;
        _Undo.redoScripts(data, page, spr);
        if (Palette.numcat == 3) {
          Palette.selectCategory(3);
        }
        break;
      case "recordsound":
        var recspr = gn(data[page][spr].id).owner;
        if (elem.sound && recspr.sounds.indexOf(elem.sound) > -1) {
          var indx = recspr.sounds.indexOf(elem.sound);
          if (indx > -1) {
            recspr.sounds.splice(indx, 1);
          }
        } else {
          recspr.sounds.push(elem.sound);
        }
        if (Palette.numcat == 3) {
          Palette.selectCategory(3);
        }
        break;
      case "edittext":
      // sprite delete or add
      case "modify":
        _Undo.removeSprite(data, page, spr);
        if (data[page][spr]) {
          _Undo.copySprite(data, page, spr);
        }
        break;
      default:
        Project.clear();
        _Undo.recreate(buffer2[index2]);
        break;
    }
    _Undo.update();
  }
  static copyPage(obj, page) {
    var sc = ScratchJr.getSprite() ? gn(ScratchJr.stage.currentPage.currentSpriteName + "_scripts") : void 0;
    if (sc) {
      getModelRefAs(sc, "scripts").deactivate();
    }
    Project.recreatePage(page, obj[page], nextStep2);
    function nextStep2() {
      ScratchJr.stage.pages = _Undo.getPageOrder(obj);
      ScratchJr.stage.setPage(gn(obj.currentPage).owner, false);
      _Undo.recreateAllScripts(obj);
      var spritename = obj[obj.currentPage].lastSprite;
      if (spritename && gn(spritename)) {
        var spr = gn(spritename).owner;
        var page2 = spr.div.parentNode.owner;
        page2.setCurrentSprite(spr);
        Thumbs.selectThisSprite(spr);
        if (Palette.numcat == 5) {
          Palette.selectCategory(5);
        }
      }
    }
  }
  static getPageOrder(data) {
    var pages = data.pages;
    var res = [];
    for (var i = 0; i < pages.length; i++) {
      res.push(gn(pages[i]).owner);
    }
    return res;
  }
  static recreateAllScripts(data) {
    for (var n = 0; n < data.pages.length; n++) {
      var page = data[data.pages[n]];
      var sprnames = page.sprites;
      for (var i = 0; i < sprnames.length; i++) {
        var spr = page[sprnames[i]];
        if (!spr) {
          continue;
        }
        if (spr.type != "sprite") {
          continue;
        }
        var sc = gn(spr.id + "_scripts");
        if (!sc) {
          continue;
        }
        _Undo.redoScripts(data, data.pages[n], sprnames[i]);
      }
    }
  }
  static removePage(data, str) {
    if (!gn(str)) {
      return;
    }
    var page = gn(str).owner;
    if (!page) {
      return;
    }
    ScratchJr.stage.removePageBlocks(str);
    ScratchJr.stage.removePage(page);
    ScratchJr.stage.pages = _Undo.getPageOrder(data);
    if (ScratchJr.stage.pages.length == 0) {
      _Undo.copyPage(data, data.currentPage);
    } else {
      ScratchJr.stage.setViewPage(gn(data.currentPage).owner);
      Thumbs.updateSprites();
      Thumbs.updatePages();
    }
  }
  static redoScripts(data, page, spr) {
    var div = gn(spr + "_scripts");
    while (div.childElementCount > 0) {
      div.removeChild(div.childNodes[0]);
    }
    var sc = getModelRefAs(div, "scripts");
    var list = data[page][spr].scripts;
    for (var j = 0; j < list.length; j++) {
      sc.recreateStrip(list[j]);
    }
  }
  static copySprite(data, page, spr) {
    var obj = data[page][spr];
    var fcn = function(spr2) {
      if (spr2.type == "sprite") {
        if (page == ScratchJr.stage.currentPage.id) {
          spr2.div.style.visibility = "visible";
        }
        _Undo.setSprite(page, data);
      } else {
        var delta2 = spr2.fontsize * 1.35;
        if (spr2.homey == spr2.page.textstartat) {
          spr2.page.textstartat += delta2;
        }
        Thumbs.updatePages();
      }
    };
    Project.recreateObject(gn(page).owner, spr, obj, fcn, data[page].lastSprite == spr);
  }
  static setSprite(page, data) {
    Thumbs.updatePages();
    if (page != ScratchJr.stage.currentPage.id) {
      return;
    }
    var pageobj = gn(page).owner;
    var lastspritename = data[page].lastSprite;
    var lastsprite = lastspritename ? gn(lastspritename) : void 0;
    if (!lastsprite) {
      pageobj.setCurrentSprite(void 0);
    } else {
      var cs = lastsprite.owner;
      pageobj.setCurrentSprite(cs);
      UI.needsScroll();
      Thumbs.updateSprites();
    }
  }
  static removeSprite(data, page, spr) {
    if (!gn(spr)) {
      return;
    }
    var sprite = gn(spr).owner;
    var th = sprite.thumbnail;
    ScratchJr.runtime.stopThreadSprite(sprite);
    var pageobj = gn(page).owner;
    var list = JSON.parse(pageobj.sprites);
    var n = list.indexOf(spr);
    list.splice(n, 1);
    pageobj.sprites = JSON.stringify(list);
    gn(spr).parentNode.removeChild(gn(spr));
    if (!gn(spr + "_scripts")) {
      Thumbs.updatePages();
      return;
    }
    var sc = gn(spr + "_scripts");
    if (sc) {
      sc.parentNode.removeChild(sc);
    }
    if (th && th.parentNode) {
      th.parentNode.removeChild(th);
    }
    _Undo.setSprite(page, data);
  }
  static recreate(data) {
    Project.mediaCount = 0;
    ScratchJr.stage.pages = [];
    var pages = data.pages;
    if (data.projectsounds) {
      const scratchAudioWithTypos = ScratchAudio;
      scratchAudioWithTypos.projectsounds = data.projectsounds;
    }
    for (var i = 0; i < pages.length; i++) {
      Project.recreatePage(pages[i], data[pages[i]]);
    }
    _Undo.loadPage(data.currentPage);
  }
  static loadPage(pageid2) {
    var pages = ScratchJr.stage.getPagesID();
    if (pages.indexOf(pageid2) < 0) {
      ScratchJr.stage.currentPage = ScratchJr.stage.pages[0];
    } else {
      ScratchJr.stage.currentPage = ScratchJr.stage.getPage(pageid2);
    }
    ScratchJr.stage.currentPage.div.style.visibility = "visible";
    ScratchJr.stage.currentPage.setPageSprites("visible");
    tryCounter = 100;
    if (Project.mediaCount > 0) {
      setTimeout(function() {
        _Undo.updateImages();
      }, 20);
    } else {
      _Undo.doneLoading();
    }
  }
  static updateImages() {
    tryCounter--;
    var done = Project.mediaCount < 1 || tryCounter < 1;
    if (done) {
      _Undo.doneLoading();
    } else {
      setTimeout(function() {
        _Undo.updateImages();
      }, 20);
    }
  }
  static flashIcon(div, press) {
    div.setAttribute("class", press);
    setTimeout(function() {
      _Undo.update();
    }, 1e3);
  }
  static doneLoading() {
    Thumbs.updateSprites();
    Thumbs.updatePages();
  }
  static update() {
    if (gn("id_undo")) {
      if (buffer2.length == 1) {
        _Undo.tunOffButton(gn("id_undo"));
      } else {
        if (index2 < 1) {
          _Undo.tunOffButton(gn("id_undo"));
        } else {
          _Undo.tunOnButton(gn("id_undo"));
        }
      }
      if (index2 >= buffer2.length - 1) {
        _Undo.tunOffButton(gn("id_redo"));
      } else {
        _Undo.tunOnButton(gn("id_redo"));
      }
    }
  }
  static tunOnButton(kid) {
    var kclass = kid.getAttribute("class").split(" ")[0];
    kid.setAttribute("class", kclass + " enable");
  }
  static tunOffButton(kid) {
    var kclass = kid.getAttribute("class").split(" ")[0];
    kid.setAttribute("class", kclass + " disable");
  }
};
window.Undo = Undo;

// src/app/src/editor/ui/Thumbs.ts
var caret = null;
var Thumbs = class _Thumbs {
  static t;
  static updatePages() {
    var pthumbs = gn("pagecc");
    while (pthumbs.childElementCount > 0) {
      pthumbs.removeChild(pthumbs.childNodes[0]);
    }
    var prev = null;
    let th;
    for (var i = 0; i < ScratchJr.stage.pages.length; i++) {
      var page = ScratchJr.stage.pages[i];
      page.num = i + 1;
      th = page.pageThumbnail(pthumbs);
      th.prev = prev;
      if (prev) {
        prev.next = th;
      }
      if (page.id == ScratchJr.stage.currentPage.id) {
        _Thumbs.highlighPage(th);
      } else {
        _Thumbs.unhighlighPage(th);
      }
      ScriptsPane.updateScriptsPageBlocks(JSON.parse(page.sprites));
      prev = th;
    }
    const currentThumb = pthumbs.querySelector(".pagethumb.on");
    if (currentThumb) {
      currentThumb.scrollIntoView({ block: "nearest" });
    }
    if (ScratchJr.stage.pages.length >= (window.Settings.maxPages ?? 4) || !ScratchJr.isEditable()) {
      return;
    }
    var ep = _Thumbs.emptyPage(pthumbs);
    ep.prev = prev;
    th.next = ep;
  }
  static getObjectFor(div, id) {
    for (var i = 0; i < div.childElementCount; i++) {
      if (getModelRefAs(div.childNodes[i], "spritethumb") === id) {
        return div.childNodes[i];
      }
    }
    return div.childNodes[0];
  }
  static getType(div, str) {
    while (div != null) {
      if (div.type == str) {
        return div;
      }
      div = div.parentNode;
    }
    return null;
  }
  static pageMouseDown(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    if (ScratchJr.onHold) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    _Thumbs.t = e.target;
    var tb = _Thumbs.getType(_Thumbs.t, "pagethumb");
    if (ScratchJr.shaking && e.target.className == "deletethumb") {
      ScratchJr.clearSelection();
      ScratchJr.stage.deletePage(getModelRefAs(tb, "pagethumb"));
      return;
    }
    if (ScratchJr.shaking) {
      ScratchJr.clearSelection();
      return;
    }
    if (!tb) {
      return;
    }
    if (!ScratchJr.isEditable() || gn("pagecc").childElementCount < 3) {
      _Thumbs.clickOnPage(e, getModelRefAs(tb, "pagethumb"));
    } else {
      Events.startDrag(e, tb, _Thumbs.prepareToDragPage, _Thumbs.dropPage, _Thumbs.draggingPage, _Thumbs.clickPage, _Thumbs.startPageShaking);
    }
  }
  static prepareToDragPage(e) {
    e.preventDefault();
    e.stopPropagation();
    ScratchAudio.sndFX("grab.wav");
    var pt = Events.getTargetPoint(e);
    Events.dragmousex = pt.x;
    Events.dragmousey = pt.y;
    var mx = Events.dragmousex - frame.offsetLeft - localx(Events.dragthumbnail, Events.dragmousex);
    var my = Events.dragmousey - frame.offsetTop - localy(Events.dragthumbnail, Events.dragmousey);
    var mstyle = {
      position: "absolute",
      left: "0px",
      top: "0px",
      zIndex: ScratchJr.dragginLayer
    };
    Events.dragcanvas = Events.dragthumbnail;
    setProps(Events.dragcanvas.style, mstyle);
    Events.move3D(Events.dragcanvas, mx, my);
    frame.appendChild(Events.dragcanvas);
    caret = newHTML("div", "pagethumb caret", gn("pagecc"));
    caret.prev = Events.dragthumbnail.prev;
    caret.next = Events.dragthumbnail.next;
    if (Events.dragthumbnail.prev) {
      Events.dragthumbnail.prev.next = caret;
    }
    if (Events.dragthumbnail.next) {
      Events.dragthumbnail.next.prev = caret;
    }
    _Thumbs.layoutPages();
    Events.dragthumbnail.pos = _Thumbs.getPagePos(Events.dragcanvas.top);
  }
  static layoutPages() {
    var thispage = _Thumbs.findFirst();
    var p = gn("pagecc");
    while (thispage) {
      p.appendChild(thispage);
      thispage = thispage.next;
    }
  }
  static findFirst() {
    var kid = gn("pagecc").childNodes[0];
    while (kid.prev) {
      kid = kid.prev;
    }
    return kid;
  }
  static findLast() {
    var kid = gn("pagecc").childNodes[0];
    while (kid.next) {
      kid = kid.next;
    }
    return kid;
  }
  static getPageOrder() {
    var page = _Thumbs.findFirst();
    var res = [];
    while (page) {
      var pagename = getModelRefAs(page, "pagethumb");
      if (pagename) {
        res.push(gn(pagename).owner);
      }
      page = page.next;
    }
    return res;
  }
  static draggingPage(e, el) {
    e.preventDefault();
    var pt = Events.getTargetPoint(e);
    var dx = pt.x - Events.dragmousex;
    var dy = pt.y - Events.dragmousey;
    Events.move3D(el, dx, dy);
    if (!caret) {
      return;
    }
    _Thumbs.removeCaret();
    _Thumbs.insertCaret(el);
    _Thumbs.layoutPages();
  }
  static removeCaret() {
    var myprev = caret.prev;
    var mynext = caret.next;
    if (myprev) {
      myprev.next = mynext;
    }
    if (mynext) {
      mynext.prev = myprev;
    }
    caret.prev = void 0;
    caret.next = void 0;
    var p = caret.parentNode;
    if (p) {
      p.removeChild(caret);
    }
  }
  static insertCaret(el) {
    var pos = _Thumbs.getPagePos(el.top);
    _Thumbs.positionMe(pos, caret);
    gn("pagecc").appendChild(caret);
  }
  static getPagePos(dy) {
    const pageSecond = gn("pagecc").childNodes[1];
    const pageFirst = gn("pagecc").childNodes[0];
    var delta2 = pageSecond.offsetTop - pageFirst.offsetTop;
    var pos = Math.floor((localy(gn("pagecc"), dy + delta2 / 2) + gn("pagecc").scrollTop) / delta2);
    pos = Math.max(0, pos);
    var max = _Thumbs.getPageOrder().length;
    return Math.min(max, pos);
  }
  static positionMe(pos, elem) {
    var beforewho = pos >= gn("pagecc").childElementCount ? void 0 : gn("pagecc").childNodes[pos];
    if (!beforewho) {
      var last = _Thumbs.findLast();
      last.next = elem;
      elem.prev = last;
      elem.next = void 0;
    } else {
      var prev = beforewho.prev;
      beforewho.prev = elem;
      elem.next = beforewho;
      if (prev) {
        prev.next = elem;
        elem.prev = prev;
      }
    }
  }
  static repositionThumb(thumb, dy) {
    var pos = _Thumbs.getPagePos(dy);
    if (pos != thumb.pos) {
      ScratchAudio.sndFX("snap.wav");
    }
    var myprev = thumb.prev;
    var mynext = thumb.next;
    if (myprev) {
      myprev.next = mynext;
    }
    if (mynext) {
      mynext.prev = myprev;
    }
    _Thumbs.positionMe(pos, thumb);
  }
  static dropPage(e) {
    ScratchJr.storyStart("Thumbs.dropPage");
    e.preventDefault();
    if (!caret) {
      return;
    }
    Events.dragthumbnail.prev = caret.prev;
    Events.dragthumbnail.next = caret.next;
    if (Events.dragthumbnail.prev) {
      Events.dragthumbnail.prev.next = Events.dragthumbnail;
    }
    if (Events.dragthumbnail.next) {
      Events.dragthumbnail.next.prev = Events.dragthumbnail;
    }
    if (caret.parentNode) {
      caret.parentNode.removeChild(caret);
    }
    caret = null;
    Events.dragthumbnail.style.position = "";
    Events.dragthumbnail.style.left = "";
    Events.dragthumbnail.style.top = "";
    Events.dragthumbnail.style.webkitTransform = "";
    var oldpos = Number(Events.dragthumbnail.childNodes[1].childNodes[0].textContent) - 1;
    var oldpage = getModelRefAs(Events.dragthumbnail, "pagethumb");
    _Thumbs.repositionThumb(Events.dragthumbnail, Events.dragthumbnail.top);
    var oldlist = ScratchJr.stage.getPagesID();
    ScratchJr.stage.pages = _Thumbs.getPageOrder();
    _Thumbs.layoutPages();
    _Thumbs.updatePages();
    ScratchJr.stage.renumberPageBlocks(oldlist);
    if (Palette.numcat == 5) {
      Palette.selectCategory(5);
    }
    if (_Thumbs.getPageOrder()[oldpos].id != oldpage) {
      Undo.record({
        action: "pageorder",
        who: oldpage,
        where: oldpage
      });
    }
  }
  static clickPage(e) {
    ScratchJr.clearSelection();
    _Thumbs.clickOnPage(e, getModelRefAs(Events.dragthumbnail, "pagethumb"));
    Events.clearEvents();
    Events.dragthumbnail = null;
  }
  static clickOnPage(e, pagename) {
    ScratchJr.unfocus(e);
    var pthumbs = gn("pagecc");
    for (var i = 0; i < pthumbs.childElementCount; i++) {
      var thumb = pthumbs.childNodes[i];
      if (thumb.id == "emptypage") {
        continue;
      }
    }
    if (ScratchJr.stage.currentPage.id == pagename) {
      return;
    }
    var page = gn(pagename).owner;
    ScratchJr.stage.setPage(page, false);
    Undo.record({
      action: "changepage",
      who: pagename,
      where: pagename
    });
  }
  static startPageShaking(tb) {
    ScratchJr.shaking = tb;
    ScratchJr.stopShaking = _Thumbs.stopPageShaking;
    var cc = tb.getAttribute("class");
    tb.setAttribute("class", cc + " shakeme");
    tb.childNodes[tb.childElementCount - 1].style.visibility = "visible";
  }
  static stopPageShaking(b) {
    ScratchJr.shaking = void 0;
    ScratchJr.stopShaking = void 0;
    var cc = b.getAttribute("class");
    cc = cc.substr(0, cc.length - 8);
    b.setAttribute("class", cc);
    b.childNodes[b.childElementCount - 1].style.visibility = "hidden";
  }
  static emptyPage(p) {
    var tb = newHTML("div", "pagethumb", p);
    var c = newHTML("div", "empty", tb);
    var img;
    if (window.Settings.edition == "PBS") {
      img = newImage(c, "assets/ui/newpage.svg");
    } else {
      img = newImage(c, "assets/ui/newpage.png", {
        position: "absolute"
      });
    }
    img.setAttribute("class", "unselectable");
    tb.setAttribute("id", "emptypage");
    tb.onmousedown = function(evt) {
      _Thumbs.clickOnEmptyPage(evt);
    };
    return tb;
  }
  static clickOnEmptyPage(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    ScratchAudio.sndFX("tap.wav");
    e.preventDefault();
    ScratchJr.stage.currentPage.div.style.visibility = "hidden";
    ScratchJr.stage.currentPage.setPageSprites("hidden");
    var sc = gn(ScratchJr.stage.currentPage.currentSpriteName + "_scripts");
    if (sc) {
      getModelRefAs(sc, "scripts").deactivate();
    }
    ScratchJr.unfocus(e);
    let page = new Page(getIdFor("page"));
  }
  static highlighPage(page) {
    page.setAttribute("class", "pagethumb on");
  }
  static unhighlighPage(page) {
    page.setAttribute("class", "pagethumb off");
  }
  static overpage(page) {
    page.setAttribute("class", "pagethumb drop");
  }
  //////////////////////////////////////
  //   Library
  /////////////////////////////////////
  static updateSprites() {
    var costumes = gn("spritecc");
    costumes.parentElement.scrollTop = 0;
    while (costumes.childElementCount > 0) {
      costumes.removeChild(costumes.childNodes[0]);
    }
    var sprites = JSON.parse(ScratchJr.stage.currentPage.sprites);
    for (var i = 0; i < sprites.length; i++) {
      var s = gn(sprites[i]);
      if (!s) {
        continue;
      }
      var spr = s.owner;
      if (spr.type != "sprite") {
        continue;
      }
      var th = spr.spriteThumbnail(costumes);
      if (spr.id == ScratchJr.stage.currentPage.currentSpriteName) {
        _Thumbs.highlighSprite(th);
      } else {
        _Thumbs.unhighlighSprite(th);
      }
    }
    if (!ScratchJr.getSprite()) {
      ScratchJr.stage.currentPage.setCurrentSprite(void 0);
    }
    UI.resetSpriteLibrary();
  }
  static updateSprite(spr) {
    if (!spr) {
      return;
    }
    if (spr.thumbnail) {
      spr.updateSpriteThumb();
    } else {
      var costumes = gn("spritecc");
      if (spr.type != "sprite") {
        return;
      }
      spr.spriteThumbnail(costumes);
      _Thumbs.selectThisSprite(spr);
      UI.resetSpriteLibrary();
    }
  }
  /////////////////////////////////////////////
  //  Sprite Thumbnails
  ////////////////////////////////////////////
  static startDragThumb(e, tb) {
    if (ScratchJr.shaking && e.target.id == "deletespritethumb") {
      ScratchJr.clearSelection();
      ScratchJr.stage.removeSprite(gn(getModelRefAs(tb, "spritethumb")).owner);
    }
    if (ScratchJr.shaking) {
      ScratchJr.clearSelection();
    }
    if (!ScratchJr.isEditable()) {
      _Thumbs.clickOnSprite(e, tb);
    } else {
      Events.startDrag(e, tb, _Thumbs.prepareToDrag, _Thumbs.drop, _Thumbs.dragging, _Thumbs.click, _Thumbs.startCharShaking);
    }
  }
  static startCharShaking(tb) {
    if (!tb) {
      return;
    }
    ScratchJr.shaking = tb;
    ScratchJr.stopShaking = _Thumbs.stopCharShaking;
    var cc = tb.getAttribute("class");
    tb.setAttribute("class", cc + " shakethumb");
    var close = newHTML("div", "deletespritethumb", tb);
    close.id = "deletespritethumb";
  }
  static stopCharShaking(b) {
    ScratchJr.shaking = void 0;
    ScratchJr.stopShaking = void 0;
    var cc = b.getAttribute("class");
    cc = cc.substr(0, cc.length - 8);
    b.setAttribute("class", cc);
    var ic = b.childNodes[b.childElementCount - 1];
    if (ic.getAttribute("class") == "deletespritethumb") {
      b.removeChild(ic);
    }
  }
  static selectThisSprite(spr) {
    var costumes = gn("spritecc");
    var el = spr.thumbnail;
    for (var i = 0; i < costumes.childElementCount; i++) {
      var th = costumes.childNodes[i];
      if (th == el) {
        _Thumbs.highlighSprite(el);
      } else {
        _Thumbs.unhighlighSprite(th);
      }
    }
  }
  static clickOnSprite(e, el) {
    if (ScratchJr.shaking && ScratchJr.shaking == el) {
      ScratchJr.clearSelection();
      ScratchJr.stage.removeSprite(gn(getModelRefAs(el, "spritethumb")).owner);
      return;
    }
    var spritename = getModelRefAs(el, "spritethumb");
    if (!gn(spritename)) {
      return;
    }
    ScratchJr.unfocus(e);
    var spr = gn(spritename).owner;
    var page = spr.div.parentNode.owner;
    page.setCurrentSprite(spr);
    _Thumbs.selectThisSprite(spr);
  }
  static prepareToDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    ScratchAudio.sndFX("grab.wav");
    var pt = Events.getTargetPoint(e);
    Events.dragmousex = pt.x;
    Events.dragmousey = pt.y;
    Events.dragthumbnail = _Thumbs.getObjectFor(gn("spritecc"), getModelRefAs(Events.dragthumbnail, "spritethumb"));
    var mx = Events.dragmousex - frame.offsetLeft - localx(Events.dragthumbnail, Events.dragmousex) - gn("topsection").offsetLeft;
    var my = Events.dragmousey - frame.offsetTop - localy(Events.dragthumbnail, Events.dragmousey) - gn("topsection").offsetTop;
    var sy = Events.dragthumbnail.parentNode.parentNode.scrollTop;
    var sx = Events.dragthumbnail.parentNode.parentNode.scrollLeft;
    my -= sy;
    mx -= sx;
    var mstyle = {
      position: "absolute",
      left: "0px",
      top: "0px",
      zIndex: ScratchJr.dragginLayer,
      zoom: 100 / window.devicePixelRatio + "%"
    };
    var spr = gn(getModelRefAs(Events.dragthumbnail, "spritethumb")).owner;
    Events.dragcanvas = document.createElement("canvas");
    spr.drawMyImage(
      Events.dragcanvas,
      76 * scaleMultiplier * window.devicePixelRatio,
      (76 - 12) * scaleMultiplier * window.devicePixelRatio
    );
    setProps(Events.dragcanvas.style, mstyle);
    Events.move3D(Events.dragcanvas, mx * window.devicePixelRatio, my * window.devicePixelRatio);
    setModelRef(Events.dragcanvas, "spritethumb", getModelRefAs(Events.dragthumbnail, "spritethumb"));
    frame.appendChild(Events.dragcanvas);
  }
  static dragging(e, el) {
    e.preventDefault();
    var pt = Events.getTargetPoint(e);
    var dx = pt.x - Events.dragmousex;
    var dy = pt.y - Events.dragmousey;
    Events.move3D(el, dx * window.devicePixelRatio, dy * window.devicePixelRatio);
    if (Palette.getLandingPlace(el, e, window.devicePixelRatio) != "pages") {
      _Thumbs.removePagesCaret();
      return;
    }
    var thumb = Palette.getHittedThumb(el, gn("pagecc"), window.devicePixelRatio);
    if (thumb && !hasModelRef(thumb)) {
      thumb = null;
    }
    if (thumb) {
      _Thumbs.overpage(thumb);
    }
    for (var i = 0; i < gn("pagecc").childElementCount; i++) {
      var spr = gn("pagecc").childNodes[i];
      if (!hasModelRef(spr)) {
        continue;
      }
      var page = gn(getModelRefAs(spr, "pagethumb"));
      if (thumb && thumb.id != spr.id) {
        const dragPage = page.owner;
        if (dragPage.id == ScratchJr.stage.currentPage.id) {
          _Thumbs.highlighPage(spr);
        } else {
          _Thumbs.unhighlighPage(spr);
        }
      }
    }
  }
  static removePagesCaret() {
    for (var i = 0; i < gn("pagecc").childElementCount; i++) {
      var spr = gn("pagecc").childNodes[i];
      if (!hasModelRef(spr)) {
        continue;
      }
      var page = gn(getModelRefAs(spr, "pagethumb"));
      const pageOwner = page.owner;
      if (pageOwner.id == ScratchJr.stage.currentPage.id) {
        _Thumbs.highlighPage(spr);
      } else {
        _Thumbs.unhighlighPage(spr);
      }
    }
  }
  static drop(e, el) {
    e.preventDefault();
    switch (Palette.getLandingPlace(el, e, window.devicePixelRatio)) {
      case "pages":
        var thumb = Palette.getHittedThumb(el, gn("pagecc"), window.devicePixelRatio);
        if (thumb && thumb.id != "emptypage") {
          ScratchJr.stage.copySprite(el, thumb);
        }
        break;
      default:
        break;
    }
    if (Events.dragcanvas) {
      Events.dragcanvas.parentNode.removeChild(Events.dragcanvas);
    }
    Events.dragcanvas = null;
  }
  static click(e, el) {
    e.preventDefault();
    e.stopPropagation();
    _Thumbs.t = e.target;
    el.setAttribute("class", ScratchJr.isEditable() ? "spritethumb on" : "spritethumb noneditable");
    _Thumbs.clickOnSprite(e, el);
  }
  static highlighSprite(spr) {
    spr.setAttribute("class", ScratchJr.isEditable() ? "spritethumb on" : "spritethumb noneditable");
    ScriptsPane.setActiveScript(getModelRefAs(spr, "spritethumb"));
    Palette.reset();
  }
  static unhighlighSprite(spr) {
    spr.setAttribute("class", "spritethumb off");
    var currentsc = gn(getModelRefAs(spr, "spritethumb") + "_scripts");
    getModelRefAs(currentsc, "scripts").deactivate();
    for (var i = 0; i < currentsc.childElementCount; i++) {
      if (currentsc.childNodes[i].owner) {
        getModelRefAs(currentsc.childNodes[i], "block")?.unhighlight();
      }
    }
  }
  static quickHighlight(spr) {
    if (getModelRefAs(spr, "spritethumb") == ScratchJr.stage.currentPage.currentSpriteName) {
      spr.className = "spritethumb on target";
    } else {
      spr.className = "spritethumb off target";
    }
  }
  static quickRestore(spr) {
    if (getModelRefAs(spr, "spritethumb") == ScratchJr.stage.currentPage.currentSpriteName) {
      spr.className = ScratchJr.isEditable() ? "spritethumb on" : "spritethumb noneditable";
    } else {
      spr.className = "spritethumb off";
    }
  }
};

// src/app/src/editor/ui/Scroll.ts
var Scroll = class {
  hasHorizontal;
  hasVertical;
  arrowDistance;
  aleft;
  aright;
  aup;
  adown;
  contents;
  getContent;
  getObjects;
  constructor(div, id, w, h, cfcn, ofcn) {
    this.hasHorizontal = true;
    this.hasVertical = true;
    this.arrowDistance = 6;
    this.aleft = null;
    this.aright = null;
    this.aup = null;
    this.adown = null;
    this.contents = newDiv(div, 0, 0, w, h, {});
    this.contents.setAttribute("id", id);
    this.contents.owner = this;
    this.addArrows(div, w, h);
    this.getContent = cfcn;
    this.getObjects = ofcn;
    div.scroll = this;
  }
  update() {
    this.adjustCanvas();
    this.refresh();
    this.bounceBack();
  }
  /////////////////////////////////////////////////////////////
  // Arrows
  ////////////////////////////////////////////////////////////
  addArrows(sc, w, h) {
    this.aleft = newHTML("div", "leftarrow", sc);
    this.aleft.style.height = h + "px";
    var larrow = newHTML("span", void 0, this.aleft);
    larrow.style.top = Math.floor((h - larrow.offsetHeight) / 2) + "px";
    this.aright = newHTML("div", "rightarrow", sc);
    this.aright.style.height = h + "px";
    var rarrow = newHTML("span", void 0, this.aright);
    rarrow.style.top = Math.floor((h - rarrow.offsetHeight) / 2) + "px";
    this.aup = newHTML("div", "toparrow", sc);
    this.adown = newHTML("div", "bottomarrow", sc);
    newHTML("div", "halign up", this.aup);
    newHTML("div", "halign down", this.adown);
    var me = this;
    this.aup.onmousedown = function(e) {
      me.scrolldown(e);
    };
    this.adown.onmousedown = function(e) {
      me.scrollup(e);
    };
    this.aleft.onmousedown = function(e) {
      me.scrollright(e);
    };
    this.aright.onmousedown = function(e) {
      me.scrollleft(e);
    };
  }
  /////////////////////////////////////////////////////////////
  // Scrolling
  ////////////////////////////////////////////////////////////
  repositionArrows(h) {
    this.aleft.style.height = h + "px";
    const leftArrow = this.aleft.childNodes[0];
    leftArrow.style.top = Math.floor((h - leftArrow.offsetHeight) / 2) + "px";
    this.aright.style.height = h + "px";
    const rightArrow = this.aright.childNodes[0];
    rightArrow.style.top = Math.floor((h - rightArrow.offsetHeight) / 2) + "px";
  }
  getAdjustment(rect) {
    var d = this.contents.parentNode;
    var w = d.offsetWidth;
    var h = d.offsetHeight;
    if (rect.x > 0 && rect.y > 0) {
      return "topleft";
    }
    if (rect.x + rect.width < w && rect.y + rect.height < h) {
      return "bottomright";
    }
    if (rect.x > 0 && rect.y + rect.height < h) {
      return "bottomleft";
    }
    if (rect.x + rect.width < w && rect.y > 0) {
      return "topright";
    }
    if (rect.x + rect.width < w) {
      return "right";
    }
    if (rect.y + rect.height < h) {
      return "down";
    }
    if (rect.y > 0) {
      return "up";
    }
    if (rect.x > 0) {
      return "left";
    }
    return "none";
  }
  bounceBack() {
    var owner = this;
    var p = this.contents;
    var bc = this.getContent();
    var valx = bc.left;
    var valy = bc.top;
    var h = p.offsetHeight;
    var w = p.offsetWidth;
    var rect = {
      x: valx,
      y: valy,
      width: bc.offsetWidth,
      height: bc.offsetHeight
    };
    var transition = {
      duration: 0.5,
      transition: "ease-out",
      style: {},
      onComplete: function() {
        owner.refresh();
      }
    };
    switch (this.getAdjustment(rect)) {
      case "topright":
        transition.style.left = (this.hasHorizontal ? w - rect.width : 0) + "px";
        transition.style.top = "0px";
        CSSTransition3D(bc, transition);
        break;
      case "bottomright":
        transition.style.left = (this.hasHorizontal ? w - rect.width : 0) + "px";
        transition.style.top = (this.hasVertical ? h - rect.height : 0) + "px";
        CSSTransition3D(bc, transition);
        break;
      case "topleft":
        transition.style.top = "0px";
        transition.style.left = "0px";
        CSSTransition3D(bc, transition);
        break;
      case "bottomleft":
        transition.style.top = (this.hasVertical ? h - rect.height : 0) + "px";
        transition.style.left = "0px";
        CSSTransition3D(bc, transition);
        break;
      case "right":
        transition.style.top = valy + "px";
        transition.style.left = (this.hasHorizontal ? w - rect.width : 0) + "px";
        CSSTransition3D(bc, transition);
        break;
      case "left":
        if (this.hasHorizontal) {
          transition.style.top = valy + "px";
          transition.style.left = "0px";
          CSSTransition3D(bc, transition);
        }
        break;
      case "down":
        transition.style.top = h - rect.height + "px";
        transition.style.left = valx + "px";
        CSSTransition3D(bc, transition);
        break;
      case "up":
        if (this.hasVertical) {
          transition.style.top = "0px";
          transition.style.left = valx + "px";
          CSSTransition3D(bc, transition);
        }
        break;
    }
  }
  /////////////////////////////////////////////////////////////
  // Refreshing
  ////////////////////////////////////////////////////////////
  refresh() {
    var p = this.contents;
    var bc = this.getContent();
    var w = p.offsetWidth;
    var h = p.offsetHeight;
    var you = null;
    var needleft = "hidden";
    var needright = "hidden";
    var needup = "hidden";
    var needdown = "hidden";
    var allblocks = this.getObjects();
    for (var i = 0; i < allblocks.length; i++) {
      const block = allblocks[i];
      you = block.div;
      if (you == null) {
        continue;
      }
      if (!you.owner) {
        continue;
      }
      if (you.style.visibility == "hidden") {
        continue;
      }
      if (you.left + bc.left < 0) {
        needleft = "visible";
      }
      if (you.left + you.offsetWidth + bc.left > w) {
        needright = "visible";
      }
      if (you.top + bc.top + 10 < 0) {
        needup = "visible";
      }
      if (you.top + you.offsetHeight + bc.top > h) {
        needdown = "visible";
      }
    }
    this.aleft.style.visibility = needleft;
    this.aright.style.visibility = needright;
    this.aup.style.visibility = needup;
    this.adown.style.visibility = needdown;
  }
  adjustCanvas() {
    var bc = this.getContent();
    var p = this.contents;
    var w = p.offsetWidth;
    var h = p.offsetHeight;
    var ow = bc.offsetWidth;
    var oh = bc.offsetHeight;
    var you = null;
    var minx = 99999;
    var maxwidth = 0;
    var miny = 99999;
    var maxheight = 0;
    var padding = 0;
    var allblocks = this.getObjects();
    for (var i = 0; i < allblocks.length; i++) {
      const block = allblocks[i];
      you = block.div;
      if (you == null) {
        continue;
      }
      if (!you.owner) {
        continue;
      }
      if (you.style.visibility == "hidden") {
        continue;
      }
      if (you.left < minx) {
        minx = you.left;
      }
      if (you.left + you.offsetWidth + padding > maxwidth) {
        maxwidth = you.left + you.offsetWidth + padding;
      }
      if (you.top < miny) {
        miny = you.top;
      }
      if (you.top + you.offsetHeight + 20 > maxheight) {
        maxheight = you.top + you.offsetHeight + 20;
      }
    }
    if (minx < 0) {
      minx -= padding;
      minx += bc.left;
      w -= minx;
    } else {
      minx = 0;
    }
    if (miny < 0) {
      miny -= 20;
      miny += bc.top;
      h -= miny;
    } else {
      miny = 0;
    }
    if (maxwidth - minx > w) {
      w = Math.round(maxwidth - minx);
    }
    if (maxheight - miny > h) {
      h = Math.round(maxheight - miny);
    }
    if (ow != w || oh != h) {
      setCanvasSize(bc, w, h);
    }
    if (minx < 0 || miny < 0) {
      this.moveBlocks(-minx, -miny);
      Events.move3D(bc, minx, miny);
    }
  }
  moveBlocks(dx, dy) {
    var allblocks = this.getObjects();
    for (var i = 0; i < allblocks.length; i++) {
      var b = allblocks[i];
      b.moveBlock(b.div.left + dx, b.div.top + dy);
    }
  }
  /////////////////////////////////////////////////////////////
  // Scrolling
  ////////////////////////////////////////////////////////////
  scrolldown(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var owner = this;
    var p = this.contents;
    var sc = this.getContent();
    var h = p.offsetHeight;
    var valy = sc.top + h;
    if (valy > 0) {
      valy = 0;
    }
    valy = Math.round(valy);
    var transition = {
      duration: 0.5,
      transition: "ease-out",
      style: {
        top: valy + "px"
      },
      onComplete: function() {
        owner.refresh();
      }
    };
    CSSTransition3D(sc, transition);
  }
  scrollup(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var owner = this;
    var p = this.contents;
    var sc = this.getContent();
    var h = p.offsetHeight;
    var valy = sc.top - h;
    if (valy + sc.offsetHeight < h) {
      valy = h - sc.offsetHeight;
    }
    valy = Math.round(valy);
    var transition = {
      duration: 0.5,
      transition: "ease-out",
      style: {
        top: valy + "px"
      },
      onComplete: function() {
        owner.refresh();
      }
    };
    CSSTransition3D(sc, transition);
  }
  scrollright(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var owner = this;
    var p = this.contents;
    var sc = this.getContent();
    var w = p.offsetWidth;
    var valx = sc.left + w;
    if (valx > 0) {
      valx = 0;
    }
    valx = Math.round(valx);
    var transition = {
      duration: 0.5,
      transition: "ease-out",
      style: {
        left: valx + "px"
      },
      onComplete: function() {
        owner.refresh();
      }
    };
    CSSTransition3D(sc, transition);
  }
  scrollleft(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var owner = this;
    var p = this.contents;
    var sc = this.getContent();
    var w = p.offsetWidth;
    var valx = sc.left - w;
    if (valx + sc.offsetWidth < w) {
      valx = w - sc.offsetWidth;
    }
    valx = Math.round(valx);
    var transition = {
      duration: 0.5,
      transition: "ease-out",
      style: {
        left: valx + "px"
      },
      onComplete: function() {
        owner.refresh();
      }
    };
    CSSTransition3D(sc, transition);
  }
  fitToScreen() {
    var p = this.contents;
    var sc = this.getContent();
    var valx = sc.left;
    var valy = sc.top;
    var h = p.offsetHeight;
    var w = p.offsetWidth;
    var rect = {
      x: valx,
      y: valy,
      width: sc.offsetWidth,
      height: sc.offsetHeight
    };
    switch (this.getAdjustment(rect)) {
      case "topright":
        valx = w - rect.width;
        valy = 0;
        break;
      case "bottomright":
        valx = w - rect.width;
        valy = h - rect.height;
        break;
      case "topleft":
        valx = 0;
        valy = 0;
        break;
      case "bottomleft":
        valy = h - rect.height;
        valx = 0;
        break;
      case "right":
        valx = w - rect.width;
        break;
      case "left":
        valx = 0;
        break;
      case "down":
        valy = h - rect.height;
        break;
      case "up":
        valy = 0;
        break;
    }
    Events.move3D(sc, valx, valy);
  }
};

// src/app/src/editor/ui/ScriptsPane.ts
var scroll;
var watermark;
var ScriptsPane = class _ScriptsPane {
  static get scroll() {
    return scroll;
  }
  static get watermark() {
    return watermark;
  }
  static createScripts(parent) {
    var div = newHTML("div", "scripts", parent);
    div.setAttribute("id", "scripts");
    watermark = newHTML("div", "watermark", div);
    var h = Math.max(getDocumentHeight(), frame.offsetHeight);
    setCanvasSize(div, div.offsetWidth, h - div.offsetTop);
    scroll = new Scroll(div, "scriptscontainer", div.offsetWidth, h - div.offsetTop, ScratchJr.getActiveScript, ScratchJr.getBlocks);
  }
  static resizeScripts(height2) {
    var div = gn("scripts");
    if (!div || !scroll) {
      return;
    }
    var width2 = div.offsetWidth;
    setCanvasSize(div, width2, height2);
    setCanvasSize(scroll.contents, width2, height2);
    scroll.repositionArrows(height2);
  }
  static setActiveScript(sprname) {
    var currentsc = gn(sprname + "_scripts");
    if (!currentsc) {
      return;
    }
    ScratchJr.stage.currentPage.setCurrentSprite(gn(sprname).owner);
    const scriptsOwner = getModelRefAs(currentsc, "scripts");
    scriptsOwner.activate();
    const scriptsParent = currentsc.parentNode;
    scriptsParent.onmousedown = function(evt) {
      scriptsOwner.scriptsMouseDown(evt);
    };
    scroll.update();
  }
  static runBlock(e, div) {
    e.preventDefault();
    e.stopPropagation();
    var b = getModelRefAs(div, "block").findFirst();
    if (!b) {
      return;
    }
    ScratchJr.runtime.addRunScript(ScratchJr.getSprite(), b);
    ScratchJr.startCurrentPageStrips(["ontouch"]);
    ScratchJr.userStart = true;
  }
  static prepareToDrag(e) {
    e.preventDefault();
    var pt = Events.getTargetPoint(e);
    _ScriptsPane.pickBlock(pt.x, pt.y, e);
  }
  static pickBlock(x, y, e) {
    if (!ScratchJr.runtime.inactive()) {
      ScratchJr.stopStrips();
    }
    _ScriptsPane.cleanCarets();
    ScratchJr.unfocus(e);
    var sc = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
    sc.dragList = sc.findGroup(getModelRefAs(Events.dragthumbnail, "block"));
    sc.flowCaret = null;
    var sy = Events.dragthumbnail.parentNode.scrollTop;
    var sx = Events.dragthumbnail.parentNode.scrollLeft;
    Events.dragmousex = x;
    Events.dragmousey = y;
    var lpt = {
      x: localx(Events.dragthumbnail.parentNode, x),
      y: localy(Events.dragthumbnail.parentNode, y)
    };
    var mx = Events.dragmousex - globalx(Events.dragDiv) - lpt.x + Events.dragthumbnail.left;
    var my = Events.dragmousey - globaly(Events.dragDiv) - lpt.y + Events.dragthumbnail.top;
    var mtx = new WebKitCSSMatrix(window.getComputedStyle(Events.dragthumbnail).webkitTransform);
    my -= sy;
    mx -= sx;
    Events.dragcanvas = Events.dragthumbnail;
    Events.dragcanvas.origin = "scripts";
    Events.dragcanvas.startx = mtx.m41;
    Events.dragcanvas.starty = mtx.m42;
    if (!Events.dragcanvas.isReporter && Events.dragcanvas.parentNode) {
      Events.dragcanvas.parentNode.removeChild(Events.dragcanvas);
    }
    Events.move3D(Events.dragcanvas, mx, my);
    Events.dragcanvas.style.zIndex = String(ScratchJr.dragginLayer);
    Events.dragDiv.appendChild(Events.dragcanvas);
    var b = getModelRefAs(Events.dragcanvas, "block");
    b.detachBlock();
    if (Events.dragcanvas.isReporter) {
      return;
    }
    getModelRefAs(ScratchJr.getActiveScript(), "scripts").prepareCaret(b);
    for (var i = 1; i < sc.dragList.length; i++) {
      b = sc.dragList[i];
      var pos = new WebKitCSSMatrix(window.getComputedStyle(b.div).webkitTransform);
      var dx = pos.m41 - mtx.m41;
      var dy = pos.m42 - mtx.m42;
      b.moveBlock(dx, dy);
      Events.dragcanvas.appendChild(b.div);
    }
  }
  ////////////////////////////////////////////////
  //  Events MouseMove
  ////////////////////////////////////////////////
  static draggingBlock(e) {
    e.preventDefault();
    var pt = Events.getTargetPoint(e);
    var dx = pt.x - Events.dragmousex;
    var dy = pt.y - Events.dragmousey;
    Events.move3D(Events.dragcanvas, dx, dy);
    _ScriptsPane.blockFeedback(Events.dragcanvas.left, Events.dragcanvas.top, e);
  }
  static blockFeedback(dx, dy, e) {
    var script = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
    const paletteParent = gn("palette").parentNode;
    var limit = paletteParent.offsetTop + paletteParent.offsetHeight;
    var ycor = dy + Events.dragcanvas.offsetHeight;
    if (ycor < limit) {
      script.removeCaret();
    } else {
      script.removeCaret();
      script.insertCaret(dx, dy);
    }
    var thumb;
    switch (Palette.getLandingPlace(script.dragList[0].div, e)) {
      case "library":
        thumb = Palette.getHittedThumb(script.dragList[0].div, gn("spritecc"));
        if (thumb && gn(getModelRefAs(thumb, "spritethumb")).owner.type == ScratchJr.getSprite().type) {
          Thumbs.quickHighlight(thumb);
        } else {
          thumb = void 0;
        }
        for (var i = 0; i < gn("spritecc").childElementCount; i++) {
          var spr = gn("spritecc").childNodes[i];
          if (spr.nodeName == "FORM") {
            continue;
          }
          if (thumb && thumb.id != spr.id) {
            Thumbs.quickRestore(spr);
          }
        }
        break;
      default:
        _ScriptsPane.removeLibCaret();
        break;
    }
  }
  ////////////////////////////////////////////////
  //  Events MouseUP
  ////////////////////////////////////////////////
  static dropBlock(e, el) {
    e.preventDefault();
    var sc = ScratchJr.getActiveScript();
    var spr = getModelRefAs(sc, "scripts").spr.id;
    var page = ScratchJr.stage.currentPage;
    switch (Palette.getLandingPlace(el, e)) {
      case "scripts":
        var dx = localx(sc, el.left);
        var dy = localy(sc, el.top);
        _ScriptsPane.blockDropped(sc, dx, dy);
        break;
      case "library":
        var thumb = Palette.getHittedThumb(el, gn("spritecc"));
        _ScriptsPane.blockDropped(ScratchJr.getActiveScript(), el.startx, el.starty);
        if (thumb && gn(getModelRefAs(thumb, "spritethumb")).owner.type == gn(page.currentSpriteName).owner.type) {
          ScratchJr.storyStart("ScriptsPane.dropBlock:library");
          ScratchAudio.sndFX("copy.wav");
          Thumbs.quickHighlight(thumb);
          setTimeout(function() {
            Thumbs.quickRestore(thumb);
          }, 300);
          const scScripts = getModelRefAs(gn(getModelRefAs(thumb, "spritethumb") + "_scripts"), "scripts");
          var strip = Project.encodeStrip(getModelRefAs(el, "block"));
          var firstblock = strip[0];
          var delta2 = scScripts.gettopblocks().length * 3;
          firstblock[2] = firstblock[2] + delta2;
          firstblock[3] = firstblock[3] + delta2;
          scScripts.recreateStrip(strip);
          spr = getModelRefAs(thumb, "spritethumb");
        }
        break;
      default:
        getModelRefAs(ScratchJr.getActiveScript(), "scripts").deleteBlocks();
        scroll.adjustCanvas();
        scroll.refresh();
        scroll.fitToScreen();
        break;
    }
    Undo.record({
      action: "scripts",
      where: page.id,
      who: spr
    });
    getModelRefAs(ScratchJr.getActiveScript(), "scripts").dragList = [];
  }
  static blockDropped(sc, dx, dy) {
    Events.dragcanvas.style.zIndex = "";
    var script = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
    _ScriptsPane.cleanCarets();
    script.addBlockToScripts(Events.dragcanvas, dx, dy);
    script.layout(getModelRefAs(Events.dragcanvas, "block"));
    if (sc.id == ScratchJr.getActiveScript().id) {
      scroll.adjustCanvas();
      scroll.refresh();
      scroll.bounceBack();
    }
  }
  static cleanCarets() {
    getModelRefAs(ScratchJr.getActiveScript(), "scripts").removeCaret();
    _ScriptsPane.removeLibCaret();
  }
  static removeLibCaret() {
    for (var i = 0; i < gn("spritecc").childElementCount; i++) {
      var spr = gn("spritecc").childNodes[i];
      if (spr.nodeName == "FORM") {
        continue;
      }
      Thumbs.quickRestore(spr);
    }
  }
  //----------------------------------
  //  Drag Script Background
  //----------------------------------
  static dragBackground(e) {
    if (Menu.openMenu) {
      return;
    }
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var sc = ScratchJr.getActiveScript();
    sc.top = sc.offsetTop;
    sc.left = sc.offsetLeft;
    var pt = Events.getTargetPoint(e);
    Events.dragmousex = pt.x;
    Events.dragmousey = pt.y;
    Events.dragged = false;
    _ScriptsPane.setDragBackgroundEvents(_ScriptsPane.dragMove, _ScriptsPane.dragEnd);
  }
  static setDragBackgroundEvents(fcnmove, fcnup) {
    window.onmousemove = function(evt) {
      fcnmove(evt);
    };
    window.onmouseup = function(evt) {
      fcnup(evt);
    };
  }
  static dragMove(e) {
    var pt = Events.getTargetPoint(e);
    if (!Events.dragged && Events.distance(Events.dragmousex - pt.x, Events.dragmousey - pt.y) < 5) {
      return;
    }
    Events.dragged = true;
    var dx = pt.x - Events.dragmousex;
    var dy = pt.y - Events.dragmousey;
    Events.dragmousex = pt.x;
    Events.dragmousey = pt.y;
    Events.move3D(ScratchJr.getActiveScript(), dx, dy);
    scroll.refresh();
    e.preventDefault();
  }
  static dragEnd(e) {
    Events.dragged = false;
    e.preventDefault();
    Events.clearEvents();
    scroll.bounceBack();
  }
  //////////////////////
  //
  //////////////////////
  static updateScriptsPageBlocks(list) {
    for (var j = 0; j < list.length; j++) {
      if (!gn(list[j] + "_scripts")) {
        continue;
      }
      var sc = getModelRefAs(gn(list[j] + "_scripts"), "scripts");
      if (!sc) {
        continue;
      }
      var allblocks = sc.getBlocks();
      for (var i = 0; i < allblocks.length; i++) {
        allblocks[i].updateBlock();
      }
    }
  }
};

// src/app/src/editor/ui/Record.ts
var interval = null;
var recordedSound = null;
var isRecording = false;
var isPlaying = false;
var available2 = true;
var error = false;
var dialogOpen = false;
var timeLimit = null;
var playTimeLimit = null;
var Record = class _Record {
  // Assigned by startRecording; retained for debugging
  static soundname;
  static get available() {
    return available2;
  }
  static set available(newAvailable) {
    available2 = newAvailable;
  }
  static get dialogOpen() {
    return dialogOpen;
  }
  // Create the recording window, including buttons and volume indicators
  static init() {
    var modal = newHTML("div", "record fade", frame);
    modal.setAttribute("id", "recorddialog");
    var topbar = newHTML("div", "toolbar", modal);
    var actions = newHTML("div", "actions", topbar);
    newHTML("div", "microphone", actions);
    var buttons = newHTML("div", "recordbuttons", actions);
    var okbut = newHTML("div", "recorddone", buttons);
    okbut.onmousedown = _Record.saveSoundAndClose;
    var sc = newHTML("div", "soundbox", modal);
    sc.setAttribute("id", "soundbox");
    var sv = newHTML("div", "soundvolume", sc);
    sv.setAttribute("id", "soundvolume");
    for (var i = 0; i < 13; i++) {
      var si = newHTML("div", "indicator", sv);
      newHTML("div", "soundlevel", si);
    }
    var ctrol = newHTML("div", "soundcontrols", sc);
    ctrol.setAttribute("id", "soundcontrols");
    var lib = [["record", _Record.record], ["stop", _Record.stopSnd], ["play", _Record.playSnd]];
    for (var j = 0; j < lib.length; j++) {
      _Record.newToggleClicky(ctrol, "id_", lib[j][0], lib[j][1]);
    }
  }
  // Dialog box hide/show
  static appear() {
    gn("backdrop").setAttribute("class", "modal-backdrop fade in");
    setProps(gn("backdrop").style, {
      display: "block"
    });
    gn("recorddialog").setAttribute("class", "record fade in");
    ScratchJr.stopStrips();
    dialogOpen = true;
    ScratchJr.onBackButtonCallback.push(_Record.saveSoundAndClose);
  }
  static disappear() {
    setTimeout(function() {
      gn("backdrop").setAttribute("class", "modal-backdrop fade");
      setProps(gn("backdrop").style, {
        display: "none"
      });
      gn("recorddialog").setAttribute("class", "record fade");
    }, 333);
    dialogOpen = false;
    ScratchJr.onBackButtonCallback.pop();
  }
  // Register toggle buttons and handlers
  static newToggleClicky(p, prefix, key, fcn) {
    var button = newHTML("div", "controlwrap", p);
    newHTML("div", key + "snd off", button);
    button.setAttribute("type", "toggleclicky");
    button.setAttribute("id", prefix + key);
    if (fcn) {
      button.onmousedown = function(evt) {
        fcn(evt);
      };
    }
    return button;
  }
  // Toggle button appearance on/off
  static toggleButtonUI(button, newState) {
    var element = "id_" + button;
    var newStateStr = newState ? "on" : "off";
    var attrclass = button + "snd";
    const childNode = gn(element).childNodes[0];
    childNode.setAttribute("class", attrclass + " " + newStateStr);
  }
  // Volume UI updater
  static updateVolume(f) {
    var num = Math.round(f * 13);
    var div = gn("soundvolume");
    if (!isRecording) {
      num = 0;
    }
    for (var i = 0; i < 13; i++) {
      const childNode = div.childNodes[i].childNodes[0];
      childNode.setAttribute("class", i > num ? "soundlevel off" : "soundlevel on");
    }
  }
  // Stop recording UI and turn off volume levels
  static recordUIoff() {
    _Record.toggleButtonUI("record", false);
    var div = gn("soundvolume");
    for (var i = 0; i < gn("soundvolume").childElementCount; i++) {
      const childNode = div.childNodes[i].childNodes[0];
      childNode.setAttribute("class", "soundlevel off");
    }
  }
  // On press record button
  static record(e) {
    if (error) {
      _Record.killRecorder(e);
      return;
    }
    if (isPlaying) {
      _Record.stopPlayingSound(doRecord);
    } else {
      doRecord();
    }
    function doRecord() {
      if (isRecording) {
        _Record.stopRecording();
      } else {
        iOS.sndrecord(_Record.startRecording);
      }
    }
  }
  static startRecording(filename) {
    if (parseInt(filename) < 0) {
      recordedSound = null;
      isRecording = false;
      _Record.killRecorder();
      Palette.selectCategory(3);
    } else {
      recordedSound = filename;
      isRecording = true;
      error = false;
      _Record.soundname = filename;
      _Record.toggleButtonUI("record", true);
      var poll = function() {
        iOS.volume(_Record.updateVolume, _Record.recordError);
      };
      interval = setInterval(poll, 33);
      timeLimit = setTimeout(function() {
        if (isRecording) {
          _Record.stopRecording();
        }
      }, 3e4);
    }
  }
  // Press the play button
  static playSnd(e) {
    if (error) {
      _Record.killRecorder(e);
      return;
    }
    if (!recordedSound) {
      return;
    }
    if (isPlaying) {
      _Record.stopPlayingSound();
    } else {
      if (isRecording) {
        _Record.stopRecording(_Record.startPlaying);
      } else {
        _Record.startPlaying();
      }
    }
  }
  // Start playing the sound and switch UI appropriately
  static startPlaying() {
    iOS.startplay(_Record.timeOutPlay);
    _Record.toggleButtonUI("play", true);
    isPlaying = true;
  }
  // Gets the sound duration from iOS and changes play UI state after time
  static timeOutPlay(timeout) {
    if (parseInt(String(timeout)) < 0) {
      timeout = 0.1;
    }
    playTimeLimit = setTimeout(function() {
      _Record.toggleButtonUI("play", false);
      isPlaying = false;
    }, Number(timeout) * 1e3);
  }
  // Press on stop
  static stopSnd(e) {
    if (error) {
      _Record.killRecorder(e);
      return;
    }
    if (!recordedSound) {
      return;
    }
    _Record.flashStopButton();
    if (isRecording) {
      _Record.stopRecording();
    } else if (isPlaying) {
      _Record.stopPlayingSound();
    }
  }
  static flashStopButton() {
    _Record.toggleButtonUI("stop", true);
    setTimeout(function() {
      _Record.toggleButtonUI("stop", false);
    }, 200);
  }
  // Stop playing the sound and switch UI appropriately
  static stopPlayingSound(fcn) {
    iOS.stopplay(fcn);
    _Record.toggleButtonUI("play", false);
    isPlaying = false;
    window.clearTimeout(playTimeLimit);
    playTimeLimit = null;
  }
  // Stop the volume monitor and recording
  static stopRecording(fcn) {
    if (timeLimit != null) {
      clearTimeout(timeLimit);
      timeLimit = null;
    }
    if (interval != null) {
      window.clearInterval(interval);
      interval = null;
      setTimeout(function() {
        _Record.volumeCheckStopped(fcn);
      }, 33);
    } else {
      _Record.volumeCheckStopped(fcn);
    }
  }
  static volumeCheckStopped(fcn) {
    isRecording = false;
    _Record.recordUIoff();
    iOS.recordstop(fcn);
  }
  // Press OK (check)
  static saveSoundAndClose() {
    if (error || !recordedSound) {
      _Record.killRecorder();
    } else {
      if (isPlaying) {
        _Record.stopPlayingSound(_Record.closeContinueSave);
      } else {
        if (isRecording) {
          _Record.stopRecording(_Record.closeContinueSave);
        } else {
          _Record.closeContinueSave();
        }
      }
    }
  }
  static closeContinueSave() {
    iOS.recorddisappear("YES", _Record.registerProjectSound);
  }
  static closeContinueRemove() {
    iOS.recorddisappear("NO", _Record.tearDownRecorder);
  }
  static registerProjectSound() {
    function whenDone(snd) {
      if (snd != "error") {
        var spr = ScratchJr.getSprite();
        var page = spr.div.parentNode.owner;
        spr.sounds.push(recordedSound);
        Undo.record({
          action: "recordsound",
          who: spr.id,
          where: page.id,
          sound: recordedSound
        });
        ScratchJr.storyStart("Record.registerProjectSound");
      }
      _Record.tearDownRecorder();
      Palette.selectCategory(3);
    }
    if (!isAndroid) {
      ScratchAudio.loadFromLocal("Documents", recordedSound, whenDone);
    } else {
      ScratchAudio.loadFromLocal("", recordedSound, whenDone);
    }
  }
  // Called on error - remove everything and hide the recorder
  static killRecorder(e) {
    if (isPlaying) {
      _Record.stopPlayingSound(_Record.closeContinueRemove);
    } else {
      if (isRecording) {
        _Record.stopRecording(_Record.closeContinueRemove);
      } else {
        _Record.closeContinueRemove();
      }
    }
  }
  static tearDownRecorder() {
    if (error) {
      error = false;
    }
    isRecording = false;
    recordedSound = null;
    _Record.disappear();
  }
  // Called when the app is put into the background
  static recordError() {
    error = true;
    _Record.killRecorder();
  }
};

// src/app/src/editor/ui/Palette.ts
var blockscale = 0.75;
var numcat = 0;
var betweenblocks = null;
var blockdy = 5;
var timeoutid = null;
var helpballoon = null;
var dxblocks = 10;
var Palette = class _Palette {
  static blockdx;
  static get numcat() {
    return numcat;
  }
  static get helpballoon() {
    return helpballoon;
  }
  static set helpballoon(newHelpballoon) {
    helpballoon = newHelpballoon;
  }
  static setup(parent) {
    blockscale *= scaleMultiplier;
    blockdy *= scaleMultiplier;
    _Palette.blockdx *= scaleMultiplier;
    betweenblocks = 90 * blockscale;
    _Palette.createCategorySelectors(parent);
    var div = newHTML("div", "palette", parent);
    div.setAttribute("id", "palette");
    div.onmousedown = function(evt) {
      _Palette.paletteMouseDown(evt);
    };
    var pc = newHTML("div", "papercut", parent);
    newHTML("div", "withstyle", pc);
  }
  static createCategorySelectors(parent) {
    var sel = newHTML("div", "categoryselector", parent);
    sel.setAttribute("id", "selectors");
    var bkg = newHTML("div", "catbkg", sel);
    newHTML("div", "catimage", bkg);
    var leftPx = 15 * scaleMultiplier;
    var widthPx = 54 * scaleMultiplier;
    for (var i = 0; i < BlockSpecs.categories.length; i++) {
      _Palette.createSelector(sel, i, leftPx + i * widthPx, 0, BlockSpecs.categories[i]);
    }
  }
  static paletteMouseDown(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    if (ScratchJr.onHold) {
      return;
    }
    e.preventDefault();
    ScratchJr.blur();
    var pal = gn("palette");
    var spt = Events.getTargetPoint(e);
    var pt = {
      x: localx(pal, spt.x),
      y: localy(pal, spt.y)
    };
    for (var i = 0; i < pal.childElementCount; i++) {
      var ths = pal.childNodes[i];
      if (!hitRect(ths, pt)) {
        continue;
      }
      if (ScratchJr.shaking && ScratchJr.shaking == ths) {
        _Palette.removeSound(ths);
      } else {
        Events.startDrag(e, ths, _Palette.prepareForDrag, _Palette.dropBlockFromPalette, ScriptsPane.draggingBlock, _Palette.showHelp, _Palette.startShaking);
      }
    }
    ScratchJr.clearSelection();
  }
  static isRecorded(ths) {
    var val = getModelRefAs(ths, "block").getArgValue();
    const activeScripts = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
    var list = activeScripts.spr.sounds;
    return list.indexOf(val) > 0;
  }
  static removeSound(ths) {
    ScratchAudio.sndFX("cut.wav");
    var indx = getModelRefAs(ths, "block").getArgValue();
    var spr = ScratchJr.getSprite();
    if (!spr) {
      return;
    }
    var page = spr.div.parentNode.owner;
    var sounds = spr.sounds.concat();
    if (indx >= sounds.length) {
      return;
    }
    sounds.splice(indx, 1);
    spr.sounds = sounds;
    var sprdata = spr.getData();
    var div = gn(spr.id + "_scripts");
    while (div.childElementCount > 0) {
      div.removeChild(div.childNodes[0]);
    }
    var sc = getModelRefAs(div, "scripts");
    var list = sprdata.scripts;
    for (var j = 0; j < list.length; j++) {
      sc.recreateStrip(list[j]);
    }
    Undo.record({
      action: "deletesound",
      who: spr.id,
      where: page.id,
      sound: name
    });
    ScratchJr.storyStart("Palette.removeSound");
    _Palette.selectCategory(3);
  }
  static showHelp(e, b) {
    var block = getModelRefAs(b, "block");
    var help = BlockSpecs.blockDesc(block, ScratchJr.getSprite());
    var str = help[block.blocktype];
    if (!str) {
      return;
    }
    _Palette.openPaletteBalloon(b, str);
    timeoutid = setTimeout(_Palette.closeHelpBalloon, 2e3);
  }
  static startShaking(b) {
    if (!hasModelRef(b)) {
      return;
    }
    if (getModelRefAs(b, "block").blocktype != "playusersnd") {
      _Palette.showHelp(null, b);
      return;
    }
    ScratchJr.shaking = b;
    ScratchJr.stopShaking = _Palette.stopShaking;
    b.setAttribute("class", "shakeme");
    newHTML("div", "deletesound", b);
  }
  static clickBlock(e, b) {
    if (ScratchJr.shaking && b == ScratchJr.shaking) {
      _Palette.removeSound(b);
    } else {
      ScratchJr.clearSelection();
      _Palette.showHelp(e, b);
    }
  }
  static stopShaking(b) {
    if (!hasModelRef(b)) {
      return;
    }
    ScratchJr.shaking = void 0;
    ScratchJr.stopShaking = void 0;
    b.setAttribute("class", "");
    var ic = b.childNodes[b.childElementCount - 1];
    if (ic.getAttribute("class") == "deletesound") {
      b.removeChild(ic);
    }
  }
  static openPaletteBalloon(obj, label) {
    if (helpballoon) {
      _Palette.closeHelpBalloon();
    }
    var fontSize = Math.floor(14 * window.devicePixelRatio * scaleMultiplier);
    var w = window.devicePixelRatio * 80 * scaleMultiplier;
    var h = window.devicePixelRatio * 36 * scaleMultiplier;
    var dy = globaly(obj) - 36 * scaleMultiplier;
    helpballoon = newCanvas(frame, 0, dy, w, h, {
      position: "absolute",
      zIndex: 1e3
    });
    helpballoon.icon = obj;
    var ctx = helpballoon.getContext("2d");
    w = 16 * window.devicePixelRatio * scaleMultiplier + getStringSize(ctx, "bold " + fontSize + "px " + window.Settings.paletteBalloonFont, label).width;
    if (w < 36 * scaleMultiplier) {
      w = 36 * scaleMultiplier;
    }
    var dx = (globalx(obj) + obj.offsetWidth / 2) * window.devicePixelRatio - w / 2;
    setCanvasSize(helpballoon, w, h);
    setProps(helpballoon.style, {
      position: "absolute",
      webkitTransform: "translate(" + -w / 2 + "px, " + -h / 2 + "px) scale(" + 1 / window.devicePixelRatio + ") translate(" + (dx + w / 2) + "px, " + h / 2 + "px)"
    });
    _Palette.drawBalloon(helpballoon.getContext("2d"), w, h);
    writeText(ctx, "bold " + fontSize + "px " + window.Settings.paletteBalloonFont, "white", label, 21 * window.devicePixelRatio * scaleMultiplier, 8 * window.devicePixelRatio * scaleMultiplier);
  }
  static hide() {
    const blocksPaletteFirst = gn("blockspalette").childNodes[0];
    const blocksPaletteSecond = gn("blockspalette").childNodes[1];
    blocksPaletteFirst.style.display = "none";
    blocksPaletteSecond.style.display = "none";
  }
  static show() {
    const showFirst = gn("blockspalette").childNodes[0];
    const showSecond = gn("blockspalette").childNodes[1];
    showFirst.style.display = "inline-block";
    showSecond.style.display = "inline-block";
  }
  static closeHelpBalloon() {
    if (timeoutid) {
      clearTimeout(timeoutid);
    }
    if (helpballoon) {
      helpballoon.parentNode.removeChild(helpballoon);
    }
    helpballoon = null;
    timeoutid = null;
  }
  static drawBalloon(ctx, w, h) {
    var curve = 4;
    var path = [
      ["M", 0, curve],
      ["q", 0, -curve, curve, -curve],
      ["h", w - curve * 2],
      ["q", curve, 0, curve, curve],
      ["v", h - 11 - curve * 2],
      ["q", 0, curve, -curve, curve],
      ["h", -(w / 2) + curve + 11],
      ["l", -11, 11],
      ["l", -11, -11],
      ["h", -(w / 2) + curve + 11],
      ["q", -curve, 0, -curve, -curve],
      ["z"]
    ];
    ctx.clearRect(0, 0, Math.max(ctx.canvas.width, w), Math.max(ctx.canvas.height, h));
    ctx.fillStyle = "#4682B5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    DrawPath.render(ctx, path);
    ctx.fill();
  }
  static prepareForDrag(e) {
    e.preventDefault();
    ScratchAudio.sndFX("grab.wav");
    if (!ScratchJr.runtime.inactive()) {
      ScratchJr.stopStrips();
    }
    var sc = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
    sc.flowCaret = null;
    var pt = Events.getTargetPoint(e);
    Events.dragmousex = pt.x;
    Events.dragmousey = pt.y;
    if (!Events.dragthumbnail.parentNode) {
      Events.dragthumbnail = _Palette.getBlockNamed(getModelRefAs(Events.dragthumbnail, "block").blocktype);
      if (!Events.dragthumbnail) {
        Events.cancelAll();
        return;
      }
    }
    var mx = Events.dragmousex - frame.offsetLeft - localx(Events.dragthumbnail, Events.dragmousex);
    var my = Events.dragmousey - frame.offsetTop - localy(Events.dragthumbnail, Events.dragmousey);
    const dragOwner = getModelRefAs(Events.dragthumbnail, "block");
    Events.dragcanvas = dragOwner.duplicateBlock(mx, my, sc.spr).div;
    Events.dragcanvas.style.zIndex = String(ScratchJr.dragginLayer);
    Events.dragDiv.appendChild(Events.dragcanvas);
    sc.dragList = [getModelRefAs(Events.dragcanvas, "block")];
    sc.prepareCaret(getModelRefAs(Events.dragcanvas, "block"));
  }
  static getBlockNamed(str) {
    var pal = gn("palette");
    for (var i = 0; i < pal.childElementCount; i++) {
      const owner = getModelRefAs(pal.childNodes[i], "block");
      if (owner.blocktype == str) {
        return pal.childNodes[i];
      }
    }
    return null;
  }
  static createSelector(parent, n, dx, dy, spec) {
    var pxWidth = 51 * scaleMultiplier;
    var pxHeight = 57 * scaleMultiplier;
    var div = newDiv(parent, dx, dy, pxWidth, pxHeight, {
      position: "absolute"
    });
    div.index = n;
    var officon = spec[1].cloneNode(true);
    officon.width = pxWidth;
    officon.height = pxHeight;
    div.appendChild(officon);
    setProps(officon.style, {
      position: "absolute",
      zIndex: 6,
      visibility: "visible"
    });
    var onicon = spec[0].cloneNode(true);
    onicon.width = pxWidth;
    onicon.height = pxHeight;
    div.appendChild(onicon);
    div.bkg = spec[2];
    setProps(onicon.style, {
      position: "absolute",
      zIndex: 8,
      visibility: "hidden"
    });
    div.onmousedown = function(evt) {
      _Palette.clickOnCategory(evt);
    };
  }
  static getPaletteSize() {
    var first = gn("palette").childNodes[0];
    var last = gn("palette").childNodes[gn("palette").childElementCount - 1];
    return last.offsetLeft + last.offsetWidth - first.offsetLeft;
  }
  static clickOnCategory(e) {
    if (!e) {
      return;
    }
    e.preventDefault();
    ScratchJr.unfocus(e);
    var t = e.target;
    ScratchAudio.sndFX("keydown.wav");
    var index3 = t.parentNode ? t.parentNode.index : 2;
    _Palette.selectCategory(index3);
  }
  static selectCategory(n) {
    var div = gn("selectors");
    numcat = n;
    var currentSel = div.childNodes[n + 1];
    for (var i = 1; i < div.childElementCount; i++) {
      var sel = div.childNodes[i];
      const selFirst = sel.childNodes[0];
      const selSecond = sel.childNodes[1];
      selFirst.style.visibility = sel.index != n ? "visible" : "hidden";
      selSecond.style.visibility = sel.index == n ? "visible" : "hidden";
    }
    var pal = gn("palette");
    gn("blockspalette").style.background = currentSel.bkg;
    while (pal.childElementCount > 0) {
      pal.removeChild(pal.childNodes[0]);
    }
    if (!ScratchJr.getSprite()) {
      return;
    }
    var list = BlockSpecs.palettes[n].concat();
    var dx = dxblocks;
    for (var k = 0; k < list.length; k++) {
      if (list[k] == "space") {
        dx += 30 * blockscale;
      } else {
        var newb = _Palette.newScaledBlock(
          pal,
          list[k],
          list[k] == "repeat" ? 0.65 * scaleMultiplier : blockscale,
          dx,
          blockdy
        );
        newb.lift();
        dx += betweenblocks;
      }
    }
    dx += 30;
    if (n == BlockSpecs.categories.length - 1 && ScratchJr.stage.pages.length > 1) {
      _Palette.addPagesBlocks(dx);
    }
    if (n == 3 && ScratchJr.getSprite().sounds.length > 0) {
      _Palette.addSoundsBlocks(dxblocks);
    }
  }
  static reset() {
    if (numcat == BlockSpecs.categories.length - 1) {
      _Palette.selectCategory(BlockSpecs.categories.length - 1);
    }
    if (numcat == 3) {
      _Palette.selectCategory(3);
    }
  }
  static showSelectors(b) {
    var n = numcat;
    var div = gn("selectors");
    for (var i = 0; i < div.childElementCount; i++) {
      var sel = div.childNodes[i];
      const selFirst = sel.childNodes[0];
      const selSecond = sel.childNodes[1];
      const selThird = sel.childNodes[2];
      const selFourth = sel.childNodes[3];
      selFirst.style.visibility = sel.index != n && b ? "visible" : "hidden";
      selSecond.style.visibility = sel.index == n && b ? "visible" : "hidden";
      selThird.style.visibility = sel.index != n && b ? "visible" : "hidden";
      selFourth.style.visibility = sel.index == n && b ? "visible" : "hidden";
    }
  }
  static addPagesBlocks(dx) {
    var pal = gn("palette");
    var spec = BlockSpecs.defs.gotopage;
    for (var i = 0; i < ScratchJr.stage.pages.length; i++) {
      if (ScratchJr.stage.pages[i].id == ScratchJr.stage.currentPage.id) {
        continue;
      }
      spec[4] = i + 1;
      var newb = _Palette.newScaledBlock(pal, "gotopage", blockscale, dx, blockdy);
      newb.lift();
      dx += betweenblocks + 5;
    }
  }
  static addSoundsBlocks(dx) {
    var pal = gn("palette");
    var spr = ScratchJr.getSprite();
    var list = spr ? spr.sounds : [];
    var newb;
    for (var i = 0; i < list.length; i++) {
      var op = MediaLib.sounds.indexOf(list[i]) < 0 ? "playusersnd" : "playsnd";
      var val = MediaLib.sounds.indexOf(list[i]) < 0 ? i : list[i];
      newb = _Palette.addBlockSound(pal, op, val, dx, blockdy);
      newb.lift();
      dx += betweenblocks;
    }
    if (list.length < 6 && Record.available && newb) {
      _Palette.drawRecordSound(newb.div.offsetWidth, newb.div.offsetHeight, dx);
    }
  }
  static addBlockSound(parent, op, val, dx, dy) {
    var spec = BlockSpecs.defs[op];
    var old = spec[4];
    spec[4] = val;
    var newb = _Palette.newScaledBlock(parent, op, blockscale, dx, dy);
    spec[4] = old;
    return newb;
  }
  static drawRecordSound(w, h, dx) {
    var pal = gn("palette");
    var div = newDiv(pal, dx, 0, w, h, {
      top: 6 * scaleMultiplier + "px"
    });
    var cnv = newCanvas(
      div,
      0,
      0,
      div.offsetWidth * window.devicePixelRatio,
      div.offsetHeight * window.devicePixelRatio,
      {
        webkitTransform: "translate(" + -div.offsetWidth * window.devicePixelRatio / 2 + "px, " + -div.offsetHeight * window.devicePixelRatio / 2 + "px) scale(" + 1 / window.devicePixelRatio + ") translate(" + div.offsetWidth * window.devicePixelRatio / 2 + "px, " + div.offsetHeight * window.devicePixelRatio / 2 + "px)"
      }
    );
    if (BlockSpecs.mic.complete) {
      drawScaled(BlockSpecs.mic, cnv);
    } else {
      BlockSpecs.mic.onload = function() {
        drawScaled(BlockSpecs.mic, cnv);
      };
    }
    if (isTouch) {
      div.onmousedown = _Palette.recordSound;
    }
  }
  static recordSound(e) {
    e.preventDefault();
    e.stopPropagation();
    ScratchJr.clearSelection();
    Record.appear();
  }
  static inStatesPalette() {
    var div = gn("selectors");
    var sel = div.childNodes[div.childElementCount - 1];
    return sel.childNodes[0].style.visibility == "hidden";
  }
  // move to scratch jr app
  static getLandingPlace(el, e, scale) {
    scale = typeof scale !== "undefined" ? scale : 1;
    var sc = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
    var pt = e ? Events.getTargetPoint(e) : null;
    if (pt && !pt.x) {
      pt = null;
    }
    var box = new Rectangle(el.left / scale, el.top / scale, el.offsetWidth / scale, el.offsetHeight / scale);
    var box2 = new Rectangle(globalx(gn("palette")), globaly(gn("palette")), gn("palette").offsetWidth, gn("palette").offsetHeight);
    if (sc.flowCaret != null && (sc.flowCaret.prev != null || sc.flowCaret.next != null || sc.flowCaret.inside != null)) {
      return "scripts";
    }
    if (box2.overlapElemBy(box, 0.66) && box2.hitRect({ x: el.left / scale, y: el.top / scale })) {
      return "palette";
    }
    if (pt && box2.hitRect(pt)) {
      return "palette";
    }
    if (_Palette.overlapsWith(gn("blockspalette"), box)) {
      return "palette";
    }
    if (_Palette.overlapsWith(gn("scripts"), box)) {
      return "scripts";
    }
    if (_Palette.overlapsWith(gn("library"), box)) {
      return "library";
    }
    if (_Palette.overlapsWith(gn("pages"), box)) {
      return "pages";
    }
    return null;
  }
  static overlapsWith(el, box) {
    var box2 = new Rectangle(globalx(el), globaly(el), el.offsetWidth, el.offsetHeight);
    return box.intersects(box2);
  }
  static overlapsWith2(el, box) {
    var box2 = new Rectangle(el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight);
    return box.intersects(box2);
  }
  static getBlockfromChild(div) {
    return findUpModelRefEl(div);
  }
  static getHittedThumb(el, div, scale) {
    scale = typeof scale !== "undefined" ? scale : 1;
    var box1 = new Rectangle(el.left / scale, el.top / scale, el.offsetWidth / scale, el.offsetHeight / scale);
    var area = 0;
    var res = null;
    var dh = div.parentNode.scrollTop;
    for (var i = 0; i < div.childElementCount; i++) {
      var node = div.childNodes[i];
      if (node.nodeName == "FORM") {
        continue;
      }
      var box2 = new Rectangle(globalx(node), globaly(node) - dh, node.offsetWidth, node.offsetHeight);
      var boxi = box1.intersection(box2);
      var a = boxi.width * boxi.height;
      if (a > area) {
        area = a;
        res = node;
      }
    }
    return res;
  }
  //////////////////////////////////////
  //  Palette Block
  /////////////////////////////////////
  static newScaledBlock(parent, op, scale, dx, dy) {
    var bbx = new Block(BlockSpecs.defs[op], true, scale);
    setProps(bbx.div.style, {
      position: "absolute",
      left: dx + "px",
      top: dy + "px"
    });
    parent.appendChild(bbx.div);
    return bbx;
  }
  static dropBlockFromPalette(e, element) {
    e.preventDefault();
    switch (_Palette.getLandingPlace(element, e)) {
      case "scripts":
        iOS.analyticsEvent("editor", "new_block", getModelRefAs(element, "block").blocktype);
        var sc = ScratchJr.getActiveScript();
        var dx = localx(sc, element.left);
        var dy = localy(sc, element.top);
        ScriptsPane.blockDropped(sc, dx, dy);
        const activeScripts = getModelRefAs(ScratchJr.getActiveScript(), "scripts");
        var spr = activeScripts.spr;
        const parentPage = spr.div.parentNode.owner;
        Undo.record({
          action: "scripts",
          where: parentPage.id,
          who: spr.id
        });
        ScratchJr.storyStart("Palette.dropBlockFromPalette");
        break;
      default:
        getModelRefAs(ScratchJr.getActiveScript(), "scripts").deleteBlocks();
        break;
    }
    getModelRefAs(ScratchJr.getActiveScript(), "scripts").dragList = [];
  }
};

// src/app/src/editor/ui/Project.ts
var metadata = null;
var saving2 = false;
var interval2 = null;
var pageid = null;
var loadIcon = null;
var error2 = false;
var projectbarsize = 66;
var mediaCountBase = 1;
var Project = class _Project {
  static get metadata() {
    return metadata;
  }
  static set metadata(newMetadata) {
    metadata = newMetadata;
  }
  static get mediaCount() {
    return getMediaCount();
  }
  static set mediaCount(newMediaCount) {
    setMediaCount(newMediaCount);
  }
  static set loadIcon(newLoadIcon) {
    loadIcon = newLoadIcon;
  }
  static get loadIcon() {
    return loadIcon;
  }
  static get error() {
    return error2;
  }
  static clear() {
    ScratchJr.stage.clear();
    UI.clear();
  }
  static load(md5) {
    mediaCountBase = 1;
    ScratchJr.log("Project load status", ScratchJr.getTime(), "sec", BlockSpecs.loadCount);
    if (BlockSpecs.loadCount > 0) {
      setTimeout(function() {
        _Project.delayLoad();
      }, 32);
    } else {
      _Project.startLoad();
    }
  }
  static delayLoad() {
    if (BlockSpecs.loadCount < 1) {
      _Project.startLoad();
    } else {
      setTimeout(function() {
        _Project.delayLoad();
      }, 32);
    }
  }
  static startLoad() {
    ScratchJr.log("all UI assets recieved - procced to call server", ScratchJr.getTime(), "sec");
    _Project.setProgress(20);
    UI.layout();
    IO.getObject(ScratchJr.currentProject, _Project.dataRecieved);
  }
  static dataRecieved(str) {
    ScratchJr.log("got project metadata", ScratchJr.getTime(), "sec");
    var rows = JSON.parse(str);
    if (!rows || rows.length === 0) {
      console.error("Project dataRecieved: project not found in database for id:", ScratchJr.currentProject);
      metadata = {
        id: ScratchJr.currentProject,
        name: "Project",
        version: window.Settings?.scratchJrVersion || "1.0.0"
      };
    } else {
      var data = rows[0];
      metadata = IO.parseProjectData(data);
    }
    if (!metadata.name || metadata.name === "undefined") {
      metadata.name = "Project";
    }
    if (!metadata.version) {
      metadata.version = window.Settings?.scratchJrVersion || "1.0.0";
    }
    setMediaCount(-1);
    if (metadata.json) {
      _Project.loadData(metadata.json, doneProjectLoad);
    } else {
      setMediaCount(0);
      let page = new Page(getIdFor("page"));
      Palette.selectCategory(1);
      setTimeout(function() {
        Palette.selectCategory(1);
      }, 100);
      _Project.loadwait(doneProjectLoad);
    }
    function doneProjectLoad() {
      if ("id" in metadata) {
        metadata.isgift = "0";
        IO.setProjectIsGift(metadata);
      }
      Palette.selectCategory(1);
      setTimeout(function() {
        Palette.selectCategory(1);
      }, 100);
      Paint.layout();
      _Project.setProgress(100);
      _Project.liftCurtain();
      ScratchJr.stage.currentPage.update();
      ScratchJr.changed = false;
      ScratchJr.storyStarted = false;
      UI.needsScroll();
      ScratchJr.log("all thumbnails updated", ScratchJr.getTime(), "sec");
      if (isAndroid) {
        AndroidInterface.notifyEditorDoneLoading();
      }
    }
  }
  static init() {
    ScratchJr.log("Project init", ScratchJr.getTime(), "sec");
    var bd = newHTML("div", "modal-backdrop fade", frame.parentNode);
    bd.setAttribute("id", "backdrop");
    setProps(gn("backdrop").style, {
      display: "none"
    });
    var modalOuter = newHTML("div", "modal-outer", frame.parentNode);
    var modalMiddle = newHTML("div", "modal-middle", modalOuter);
    var modal = newHTML("div", "modal hide fade", modalMiddle);
    modal.setAttribute("id", "modaldialog");
    setProps(gn("modaldialog").style, {});
    var body = newHTML("div", "modal-body", modal);
    body.setAttribute("id", "modalbody");
    setProps(body.style, {
      zoom: scaleMultiplier
    });
    if (loadIcon.complete) {
      _Project.addFeedback();
    } else {
      loadIcon.onload = function() {
        _Project.addFeedback();
      };
    }
    _Project.drawBlind();
  }
  static addFeedback() {
    var body = gn("modalbody");
    newHTML("div", "loadscreenfill", body);
    newHTML("div", "topfill", body);
    var cover = newHTML("div", "loadscreencover", body);
    cover.setAttribute("id", "progressbar");
    var topcover = newHTML("div", "topcover", body);
    topcover.setAttribute("id", "topcover");
    var cover2 = newHTML("div", "progressbar2", body);
    cover2.setAttribute("id", "progressbar2");
    var li = newHTML("div", "loadicon", body);
    li.appendChild(loadIcon);
  }
  static setProgress(perc) {
    if (!gn("progressbar")) {
      return;
    }
    var h = projectbarsize - Math.round(projectbarsize * perc / 100);
    ScratchJr.log("setProgress", perc, h, getMediaCount(), mediaCountBase);
    gn("progressbar").style.height = h + "px";
    if (h == 0) {
      gn("progressbar2").style.height = "0px";
      gn("topcover").style.background = "#F9A737";
    }
  }
  static drawBlind() {
    gn("backdrop").setAttribute("class", "modal-backdrop fade in");
    setProps(gn("backdrop").style, {
      display: "block"
    });
    setProps(gn("modaldialog").style, {
      display: "block"
    });
    gn("modaldialog").setAttribute("class", "modal fade in");
  }
  static loadwait(whenDone) {
    if (interval2 != null) {
      window.clearInterval(interval2);
    }
    mediaCountBase = getMediaCount();
    if (getMediaCount() <= 0) {
      _Project.getStarted(whenDone);
    } else {
      interval2 = window.setInterval(function() {
        _Project.loadTask(whenDone);
      }, 32);
    }
  }
  static loadTask(whenDone) {
    if (getMediaCount() <= 0) {
      _Project.getStarted(whenDone);
    } else {
      _Project.setProgress(_Project.getMediaLoadRatio(70));
    }
  }
  static getMediaLoadRatio(f) {
    if (getMediaCount() > mediaCountBase) {
      mediaCountBase = getMediaCount();
    }
    return 20 + f - getMediaCount() / mediaCountBase * f;
  }
  static getStarted(whenDone) {
    _Project.setProgress(90);
    if (interval2) {
      window.clearInterval(interval2);
    }
    interval2 = null;
    ScratchJr.log("Project images retrieved from server", ScratchJr.getTime(), "sec");
    _Project.setLoadPage(pageid, whenDone);
    ScratchJr.log("load done", ScratchJr.getTime(), "sec", "-- media missing = ", getMediaCount());
    ScratchJr.stage.resetPages();
    ScratchJr.runtime.beginTimer();
  }
  static liftCurtain() {
    gn("backdrop").setAttribute("class", "modal-backdrop fade");
    setProps(gn("backdrop").style, {
      display: "none"
    });
    gn("modaldialog").setAttribute("class", "modal fade");
    setProps(gn("modaldialog").style, {
      display: "none"
    });
  }
  static setLoadPage(pageid2, whenDone) {
    ScratchJr.log("setLoadPage", ScratchJr.getTime(), "sec");
    var pages = ScratchJr.stage.getPagesID();
    if (pages.indexOf(pageid2) < 0) {
      ScratchJr.stage.currentPage = ScratchJr.stage.pages[0];
    } else {
      ScratchJr.stage.currentPage = ScratchJr.stage.getPage(pageid2);
    }
    ScratchJr.stage.currentPage.div.style.visibility = "visible";
    var list = ScratchJr.stage.pages;
    for (var i = 0; i < list.length; i++) {
      if (ScratchJr.stage.currentPage == list[i]) {
        ScratchJr.stage.currentPage.setPageSprites("visible");
      } else {
        list[i].setPageSprites("hidden");
      }
    }
    if (whenDone) {
      whenDone();
    }
  }
  static loadData(data, fcn) {
    try {
      data = typeof data === "string" ? JSON.parse(data) : data;
      setMediaCount(0);
      _Project.loadme(data, fcn);
      error2 = false;
    } catch (e) {
      console.log(e);
      var errorMessage = "Error -- project data corrupted.";
      if (window.reloadDebug) {
        document.write(e.message + "\n" + metadata.json);
        return;
      }
      Alert.open(frame, gn("flip"), errorMessage, "#ff0000");
      if (interval2) {
        window.clearInterval(interval2);
      }
      interval2 = null;
      Palette.selectCategory(1);
      setTimeout(function() {
        Palette.selectCategory(1);
      }, 100);
      _Project.liftCurtain();
      error2 = true;
    }
  }
  static loadme(data, fcn) {
    _Project.recreate(data);
    _Project.loadwait(fcn);
  }
  static getLoadType(bkgid, sid, cid) {
    if (bkgid != null) {
      return "bkg";
    }
    if (!cid) {
      return "none";
    }
    if (sid && cid) {
      return "modify";
    }
    return "add";
  }
  //////////////////////////////////////////////////
  // load project data
  //////////////////////////////////////////////////
  static recreate(data) {
    ScratchJr.log("Project data structures start loading", ScratchJr.getTime(), "sec");
    setMediaCount(0);
    ScratchJr.stage.pages = [];
    var pages = data.pages;
    pageid = data.currentPage;
    for (var i = 0; i < pages.length; i++) {
      _Project.recreatePage(pages[i], data[pages[i]]);
    }
    mediaCountBase = getMediaCount();
  }
  static recreatePage(name2, data, fcn) {
    var page = new Page(name2, data, fcn);
    page.div.style.visibility = "hidden";
  }
  static substractCount() {
    bumpMediaCount(-1);
    if (gn("backdrop").className != "modal-backdrop fade in" || mediaCountBase == 0) {
      return;
    }
    _Project.setProgress(_Project.getMediaLoadRatio(70));
  }
  static recreateObject(page, name2, data, callBack, active) {
    var list = data.scripts;
    var spr;
    data.page = page;
    if (data.type == "sprite") {
      bumpMediaCount(1);
      var fcn = function(spr2) {
        spr2.setPos(data.xcoor, data.ycoor);
        bumpMediaCount(-1);
        if (gn("backdrop").className == "modal-backdrop fade in") {
          _Project.setProgress(_Project.getMediaLoadRatio(70));
        }
        ScratchJr.log(spr2.name, ScratchJr.getTime(), "sec");
        if (callBack) {
          callBack(spr2);
        }
      };
      if (!data.defaultScale) {
        data.defaultScale = 0.5;
      }
      spr = new Sprite(data, fcn);
      var sc = getModelRefAs(gn(name2 + "_scripts"), "scripts");
      for (var j = 0; j < list.length; j++) {
        sc.recreateStrip(list[j]);
      }
      if (active) {
        sc.activate();
      } else {
        sc.deactivate();
      }
    } else {
      spr = new Sprite(data, callBack);
    }
    spr.div.style.opacity = String(spr.shown ? 1 : 0);
    return spr;
  }
  //////////////////////////////////////////////////
  // Save project data
  //////////////////////////////////////////////////
  static prepareToSave(id, whenDone) {
    if (saving2) {
      Alert.open(frame, gn("flip"), "Waiting", "#28A5DA");
      _Project.waitUntilSaved(id, whenDone);
    } else {
      Alert.open(frame, gn("flip"), "Saving", "#28A5DA");
      _Project.save(id, whenDone);
    }
  }
  static waitUntilSaved(id, fcn) {
    if (saving2) {
      setTimeout(function() {
        _Project.waitUntilSaved(id, fcn);
      }, 500);
    } else {
      _Project.save(id, fcn);
    }
  }
  // Determine if thumbnailMD5 is unique to projectID
  // callback(true/false)
  static thumbnailUnique(thumbnailMD5, projectID, callback) {
    var json = {
      op: "select",
      table: iOS.database,
      items: ["name", "thumbnail", "id"],
      where: [
        { col: "deleted", op: "=", value: "NO" },
        { col: "id", op: "!=", value: projectID },
        { col: "gallery", op: "IS NULL" }
      ]
    };
    IO.query(iOS.database, json, function(result) {
      var pdata = JSON.parse(result);
      var isUnique = true;
      for (var p = 0; p < pdata.length; p++) {
        var thispdata = IO.parseProjectData(pdata[p]);
        var th = thispdata.thumbnail;
        if (th) {
          var thumb = typeof th == "string" ? JSON.parse(th) : th;
          if (thumb && thumb.md5) {
            if (thumb.md5 == thumbnailMD5) {
              isUnique = false;
            }
          }
        }
      }
      callback(isUnique);
    });
  }
  static save(id, whenDone) {
    saving2 = true;
    var saved = false;
    var safetyTimer = window.setTimeout(function() {
      if (!saved) {
        saved = true;
        saving2 = false;
        if (whenDone) {
          whenDone();
        }
      }
    }, 15e3);
    function resetSaving() {
      if (saved) return;
      saved = true;
      window.clearTimeout(safetyTimer);
      saving2 = false;
      if (whenDone) {
        whenDone();
      }
    }
    if (!metadata) {
      resetSaving();
      return;
    }
    try {
      var th = metadata.thumbnail;
      if (th && ScratchJr.editmode != "storyStarter") {
        var thumb = typeof th === "string" ? JSON.parse(th) : th;
        if (thumb && thumb.md5.indexOf("samples/") < 0) {
          _Project.thumbnailUnique(thumb.md5, id, function(isUnique) {
            if (isUnique) {
              iOS.remove(thumb.md5, iOS.trace);
            }
          });
        }
      }
      metadata.id = id;
      metadata.json = _Project.getProject(ScratchJr.stage.pages[0].id);
      _Project.getThumbnailPNG(ScratchJr.stage.pages[0], 192, 144, getMD5);
    } catch (_e) {
      resetSaving();
    }
    function getMD5(dataurl) {
      var parts = dataurl.split(",");
      var pngBase64 = parts.length > 1 ? parts[1] : "";
      iOS.getmd5(pngBase64, function(str) {
        if (!str) {
          resetSaving();
          return;
        }
        savePNG(str, pngBase64);
      });
    }
    function savePNG(md5, pngBase64) {
      var projectName = ScratchJr.currentProject || "unknown";
      var filename = projectName + "_" + md5;
      iOS.setmedianame(pngBase64, filename, "png", doNext);
    }
    function doNext(md5) {
      if (!metadata) {
        resetSaving();
        return;
      }
      metadata.thumbnail = {
        "pagecount": ScratchJr.stage.pages.length,
        "md5": md5
      };
      metadata.mtime = (/* @__PURE__ */ new Date()).getTime().toString();
      try {
        IO.saveProject(metadata, resetSaving);
      } catch (_e) {
        resetSaving();
      }
    }
  }
  static getProject(pageid2) {
    var obj = {
      pages: ScratchJr.stage.getPagesID(),
      currentPage: pageid2
    };
    for (var i = 0; i < ScratchJr.stage.pages.length; i++) {
      obj[ScratchJr.stage.pages[i].id] = ScratchJr.stage.pages[i].encodePage();
    }
    return obj;
  }
  static getUndo() {
    return _Project.getProject(ScratchJr.stage.currentPage.id);
  }
  static encodeSprite(name2) {
    return gn(name2).owner.getData();
  }
  static encodeStrip(b) {
    var res = [];
    var hasargs = ["playsnd", "gotopage", "playusersnd", "setcolor", "onmessage", "message", "setspeed"];
    var loops = ["repeat"];
    var carets = ["caretcmd", "caretend", "caretstart"];
    while (b != null) {
      var bt = b.blocktype;
      if (carets.indexOf(bt) > -1) {
        b = b.next;
        continue;
      }
      if (bt == "caretrepeat") {
        bt = "repeat";
      }
      var arg = b.arg != null || hasargs.indexOf(bt) > -1 ? b.getArgValue() : null;
      if (!arg && arg != 0) {
        arg = "null";
      }
      var dx = b.div.left / b.scale;
      var dy = b.div.top / b.scale;
      var data = [bt, arg, dx, dy];
      if (loops.indexOf(bt) > -1) {
        var inside = _Project.encodeStrip(b.inside);
        data.push(inside);
      }
      res.push(data);
      b = b.next;
    }
    return res;
  }
  /////////////////////////////
  // Project PNG Thumbnail
  /////////////////////////////
  static getThumbnailPNG(page, w, h, fcn) {
    var scale = w / 480;
    var data = {};
    data.pagecount = ScratchJr.stage.pages.length;
    var c = document.createElement("canvas");
    setCanvasSize(c, w, h);
    var ctx = c.getContext("2d");
    var md5 = page.md5;
    ctx.fillStyle = window.Settings.stageColor;
    ctx.fillRect(0, 0, w, h);
    if (!md5) {
      _Project.drawSprites(page, scale, c, w, h, fcn);
    } else {
      var pcnv;
      if (md5.substr(md5.length - 3) == "png") {
        var bgimg = page.div.firstElementChild.firstElementChild;
        pcnv = _Project.drawPNGInCanvas(bgimg, 480, 360);
      } else {
        pcnv = _Project.drawSVGinCanvas(page.svg, 480, 360);
      }
      ctx.drawImage(pcnv, 0, 0, 480, 360, 0, 0, w, h);
      _Project.drawSprites(page, scale, c, w, h, fcn);
    }
  }
  static drawPNGInCanvas(png, w, h) {
    var srccnv = document.createElement("canvas");
    setCanvasSize(srccnv, w, h);
    var ctx = srccnv.getContext("2d");
    ctx.drawImage(png, 0, 0, w, h);
    return srccnv;
  }
  static drawSVGinCanvas(extxml, w, h) {
    var srccnv = document.createElement("canvas");
    setCanvasSize(srccnv, w, h);
    var ctx = srccnv.getContext("2d");
    for (var i = 0; i < extxml.childElementCount; i++) {
      SVG2Canvas.drawLayer(extxml.childNodes[i], ctx, SVG2Canvas.drawLayer);
    }
    return srccnv;
  }
  static maskBorders(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    if (window.Settings.edition != "PBS") {
      ctx.drawImage(BlockSpecs.projectThumb, 0, 0, w, h);
    }
    ctx.restore();
  }
  static drawSprites(page, scale, c, w, h, fcn) {
    var ctx = c.getContext("2d");
    doNext(1);
    function doNext(n) {
      if (!(n < page.div.childElementCount)) {
        _Project.maskBorders(c.getContext("2d"), w, h);
        fcn(c.toDataURL("image/png"));
      } else {
        var spr = page.div.childNodes[n].owner;
        if (!spr || !spr.shown) {
          doNext(n + 1);
        } else {
          drawLoadedImage(page, ctx, spr.outline, spr, scale, n);
        }
      }
    }
    function drawLoadedImage(page2, ctx2, img, spr, scale2, n) {
      page2.drawSpriteImage(ctx2, img, spr, scale2);
      doNext(n + 1);
    }
  }
};

// src/app/src/editor/engine/stageMetrics.ts
var GRID_SIZE = 24;

// src/app/src/editor/engine/Prims.ts
var tinterval = 1;
var hopList = [-48, -30, -22, -14, -6, 0, 6, 14, 22, 30, 48];
var Prims = class _Prims {
  // Attached by ScratchJr.js at startup (block implementations)
  static Bigger;
  static Smaller;
  static SetColor;
  static time;
  static table;
  static get hopList() {
    return hopList;
  }
  static init() {
    _Prims.table = {
      done: _Prims.Done,
      missing: _Prims.Ignore,
      onflag: _Prims.Ignore,
      onmessage: _Prims.Ignore,
      onclick: _Prims.Ignore,
      ontouch: _Prims.OnTouch,
      onchat: _Prims.Ignore,
      repeat: _Prims.Repeat,
      forward: _Prims.Forward,
      back: _Prims.Back,
      up: _Prims.Up,
      down: _Prims.Down,
      left: _Prims.Left,
      right: _Prims.Right,
      home: _Prims.Home,
      setspeed: _Prims.SetSpeed,
      message: _Prims.Message,
      setcolor: _Prims.SetColor,
      bigger: _Prims.Bigger,
      smaller: _Prims.Smaller,
      wait: _Prims.Wait,
      caretcmd: _Prims.Ignore,
      caretstart: _Prims.Ignore,
      caretend: _Prims.Ignore,
      caretrepeat: _Prims.Ignore,
      gotopage: _Prims.GotoPage,
      endstack: _Prims.DoNextBlock,
      stopall: _Prims.StopAll,
      stopmine: _Prims.StopMine,
      forever: _Prims.Forever,
      hop: _Prims.Hop,
      show: _Prims.Show,
      hide: _Prims.Hide,
      playsnd: _Prims.playSound,
      playusersnd: _Prims.playSound,
      grow: _Prims.Grow,
      shrink: _Prims.Shrink,
      same: _Prims.Same,
      say: _Prims.Say
    };
  }
  static Done(strip) {
    if (strip.oldblock != null) {
      strip.oldblock.unhighlight();
    }
    strip.oldblock = null;
    strip.isRunning = false;
  }
  static setTime(strip) {
    strip.time = Date.now();
  }
  static showTime(strip) {
  }
  static DoNextBlock(strip) {
    strip.waitTimer = tinterval * 10;
    strip.thisblock = strip.thisblock.next;
  }
  static StopAll() {
    enginePorts().stopStrips();
  }
  static StopMine(strip) {
    var spr = strip.spr;
    for (var i = 0; i < enginePorts().getRuntime().threadsRunning.length; i++) {
      if (enginePorts().getRuntime().threadsRunning[i].spr == spr && enginePorts().getRuntime().threadsRunning[i].thisblock != strip.thisblock) {
        enginePorts().getRuntime().threadsRunning[i].stop(true);
      }
    }
    strip.thisblock = strip.thisblock.next;
    enginePorts().getRuntime().yield = true;
  }
  static playSound(strip) {
    var b = strip.thisblock;
    var name2 = b.getSoundName(strip.spr.sounds);
    if (!strip.audio) {
      var snd = ScratchAudio.projectSounds[name2];
      if (!snd) {
        strip.thisblock = strip.thisblock.next;
        return;
      }
      strip.audio = snd;
      snd.play();
    }
    if (strip.audio && strip.audio.done()) {
      strip.audio.clear();
      strip.thisblock = strip.thisblock.next;
      strip.audio = void 0;
    }
    strip.waitTimer = tinterval * 4;
  }
  static Say(strip) {
    var b = strip.thisblock;
    var s = strip.spr;
    var str = b.getArgValue();
    if (strip.count < 0) {
      strip.count = Math.max(30, Math.round(str.length / 8) * 30);
      s.openBalloon(str);
      _Prims.setTime(strip);
    } else {
      var count2 = strip.count;
      count2--;
      if (count2 < 0) {
        strip.count = -1;
        s.closeBalloon();
        _Prims.showTime(strip);
        strip.thisblock = strip.thisblock.next;
      } else {
        strip.waitTimer = tinterval;
        strip.count = count2;
      }
    }
  }
  static GotoPage(strip) {
    var b = strip.thisblock;
    var n = Number(b.getArgValue());
    if (strip.count < 0) {
      strip.count = 2;
      _Prims.setTime(strip);
    } else {
      var count2 = strip.count;
      count2--;
      if (count2 < 0) {
        strip.count = -1;
        _Prims.showTime(strip);
        enginePorts().getStage().gotoPage(n);
      } else {
        strip.waitTimer = tinterval;
        strip.count = count2;
      }
    }
  }
  static Forever(strip) {
    strip.thisblock = strip.firstBlock.aStart ? strip.firstBlock.next : strip.firstBlock;
    enginePorts().getRuntime().yield = true;
  }
  static Repeat(strip) {
    var b = strip.thisblock;
    var n = Number(b.getArgValue());
    if (n < 1) {
      n = 1;
    }
    if (b.repeatCounter < 0) {
      b.repeatCounter = n;
    }
    if (b.repeatCounter == 0) {
      b.repeatCounter = -1;
      strip.thisblock = strip.thisblock.next;
      strip.waitTimer = tinterval;
    } else {
      strip.stack.push(strip.thisblock);
      b.repeatCounter--;
      strip.thisblock = strip.thisblock.inside;
      enginePorts().getRuntime().yield = true;
    }
  }
  static Ignore(strip) {
    strip.thisblock = strip.thisblock.next;
  }
  static Wait(strip) {
    var n = Number(strip.thisblock.getArgValue());
    strip.waitTimer = Math.round(n * 3.125);
    _Prims.setTime(strip);
    strip.thisblock = strip.thisblock.next;
  }
  static Home(strip) {
    var spr = strip.spr;
    spr.goHome();
    strip.waitTimer = tinterval;
    strip.thisblock = strip.thisblock.next;
  }
  static SetSpeed(strip) {
    var s = strip.spr;
    var num = Number(strip.thisblock.getArgValue());
    s.speed = 2 ** num;
    strip.waitTimer = tinterval;
    strip.thisblock = strip.thisblock.next;
  }
  static Hop(strip) {
    if (strip.count < 0) {
      strip.count = hopList.length;
      _Prims.setTime(strip);
    }
    _Prims.hopTo(strip);
  }
  static hopTo(strip) {
    var s = strip.spr;
    var b = strip.thisblock;
    var n = Number(b.getArgValue());
    var count2 = strip.count;
    count2--;
    if (count2 < 0) {
      strip.count = -1;
      strip.vector = {
        x: 0,
        y: 0
      };
      _Prims.showTime(strip);
      strip.thisblock = strip.thisblock.next;
    } else {
      strip.vector = {
        x: 0,
        y: hopList[count2]
      };
      var dy = s.ycoor - strip.vector.y / 5 * n;
      if (dy < 0) {
        dy = 0;
      }
      if (dy >= 360 - GRID_SIZE) {
        dy = 360 - GRID_SIZE;
      }
      s.setPos(s.xcoor + strip.vector.x, dy);
      strip.waitTimer = tinterval + Math.floor(2 ** (2 - Math.floor(s.speed / 2)) / 2);
      strip.count = count2;
    }
  }
  static moveInDirection(strip, vec, flip) {
    var s = strip.spr;
    var num = Number(strip.thisblock.getArgValue()) * 24;
    var distance = Math.abs(num);
    if (flip === "forward" && s.flip) {
      s.flip = false;
      s.render();
    } else if (flip === "back" && !s.flip) {
      s.flip = true;
      s.render();
    }
    if (num == 0) {
      strip.thisblock = strip.thisblock.next;
      strip.waitTimer = flip ? tinterval * 2 ** (2 - Math.floor(s.speed / 2)) : tinterval;
      strip.vector = { x: 0, y: 0 };
      strip.distance = -1;
      return;
    }
    if (strip.distance < 0) {
      strip.distance = distance;
      strip.vector = vec;
      _Prims.setTime(strip);
    }
    _Prims.moveAtSpeed(strip);
  }
  static Down(strip) {
    _Prims.moveInDirection(strip, { x: 0, y: 2 });
  }
  static Up(strip) {
    _Prims.moveInDirection(strip, { x: 0, y: -2 });
  }
  static Forward(strip) {
    _Prims.moveInDirection(strip, { x: 2, y: 0 }, "forward");
  }
  static Back(strip) {
    _Prims.moveInDirection(strip, { x: -2, y: 0 }, "back");
  }
  static moveAtSpeed(strip) {
    var s = strip.spr;
    var distance = strip.distance;
    var num = Number(strip.thisblock.getArgValue()) * 12;
    var vector = Vector.scale(strip.vector, s.speed * Math.abs(num) / num);
    distance -= Math.abs(Vector.len(vector));
    if (distance < 0) {
      vector = Vector.scale(strip.vector, strip.distance);
      s.setPos(s.xcoor + vector.x, s.ycoor + vector.y);
      strip.distance = -1;
      strip.vector = {
        x: 0,
        y: 0
      };
      _Prims.showTime(strip);
      strip.thisblock = strip.thisblock.next;
    } else {
      s.setPos(s.xcoor + vector.x, s.ycoor + vector.y);
      strip.waitTimer = tinterval;
      strip.distance = distance;
    }
  }
  static turn(strip, direction) {
    var s = strip.spr;
    var num = Number(strip.thisblock.getArgValue()) * 30;
    if (strip.count < 0) {
      strip.count = Math.floor(Math.abs(num) / s.speed * 0.25);
      strip.angleStep = direction * s.speed * 4 * Math.abs(num) / num;
      strip.finalAngle = s.angle + direction * num;
      strip.finalAngle = strip.finalAngle % 360;
      if (strip.finalAngle < 0) {
        strip.finalAngle += 360;
      }
      if (strip.finalAngle > 360) {
        strip.finalAngle -= 360;
      }
      _Prims.setTime(strip);
    }
    _Prims.turning(strip);
  }
  static Right(strip) {
    _Prims.turn(strip, 1);
  }
  static Left(strip) {
    _Prims.turn(strip, -1);
  }
  static turning(strip) {
    var s = strip.spr;
    var count2 = strip.count;
    count2--;
    if (count2 < 0) {
      strip.count = -1;
      s.setHeading(strip.finalAngle);
      _Prims.showTime(strip);
      strip.thisblock = strip.thisblock.next;
    } else {
      s.setHeading(s.angle + strip.angleStep);
      strip.waitTimer = tinterval;
      strip.count = count2;
    }
  }
  static Same(strip) {
    var s = strip.spr;
    var n = (s.defaultScale - s.scale) / s.defaultScale * 10;
    if (n == 0) {
      strip.waitTimer = tinterval;
      strip.thisblock = strip.thisblock.next;
      strip.count = -1;
      strip.distance = -1;
      if (!strip.firstBlock.aStart) {
        s.homescale = s.defaultScale;
      }
      return;
    }
    if (strip.count < 0) {
      strip.distance = s.defaultScale * Math.abs(n) / n * s.speed;
      strip.count = Math.floor(5 * Math.floor(Math.abs(n)) / s.speed);
      _Prims.setTime(strip);
      if (!strip.firstBlock.aStart) {
        s.homescale = s.defaultScale;
      }
    }
    if (strip.count == 0) {
      strip.count = -1;
      s.noScaleFor();
      strip.distance = -1;
      _Prims.showTime(strip);
      strip.thisblock = strip.thisblock.next;
    } else {
      s.changeSizeBy(strip.distance * 2);
      strip.waitTimer = tinterval;
      strip.count = strip.count - 1;
    }
  }
  static resizeSprite(strip, direction) {
    var s = strip.spr;
    var n = Number(strip.thisblock.getArgValue());
    if (strip.count < 0) {
      strip.distance = s.scale + direction * (10 * n * s.defaultScale) / 100;
      strip.distance = Math.round(strip.distance * 1e3) / 1e3;
      strip.count = Math.floor(5 * Math.abs(n) / s.speed);
      _Prims.setTime(strip);
    }
    if (strip.count == 0) {
      strip.count = -1;
      s.setScaleTo(strip.distance);
      if (!strip.firstBlock.aStart) {
        s.homescale = s.scale;
      }
      strip.distance = -1;
      _Prims.showTime(strip);
      strip.thisblock = strip.thisblock.next;
    } else {
      s.changeSizeBy(direction * s.defaultScale * 2 * s.speed * Math.abs(n) / n);
      strip.waitTimer = tinterval;
      strip.count = strip.count - 1;
    }
  }
  static Grow(strip) {
    _Prims.resizeSprite(strip, 1);
  }
  static Shrink(strip) {
    _Prims.resizeSprite(strip, -1);
  }
  static fadeSprite(strip, shown) {
    var s = strip.spr;
    s.shown = shown;
    if (strip.count < 0) {
      strip.count = s.speed == 4 ? 0 : Math.floor(15 / s.speed);
      _Prims.setTime(strip);
    }
    if (strip.count == 0) {
      strip.count = -1;
      s.div.style.opacity = shown ? "1" : "0";
      _Prims.showTime(strip);
      strip.thisblock = strip.thisblock.next;
      if (!strip.firstBlock.aStart) {
        s.homeshown = shown;
      }
    } else {
      var current = Number(s.div.style.opacity);
      var delta2 = s.speed / 15;
      s.div.style.opacity = String(shown ? Math.min(1, current + delta2) : Math.max(0, current - delta2));
      strip.waitTimer = tinterval * 2;
      strip.count = strip.count - 1;
    }
  }
  static Show(strip) {
    _Prims.fadeSprite(strip, true);
  }
  static Hide(strip) {
    _Prims.fadeSprite(strip, false);
  }
  static OnTouch(strip) {
    var s = strip.spr;
    if (s.touchingAny()) {
      strip.stack.push(strip.firstBlock);
      strip.thisblock = strip.thisblock.next;
    }
    strip.waitTimer = tinterval;
  }
  static Message(strip) {
    var b = strip.thisblock;
    var pair;
    if (strip.firstTime) {
      var receivers = [];
      var msg = b.getArgValue();
      var findReceivers = function(block, s) {
        if (block.blocktype == "onmessage" && block.getArgValue() == msg) {
          receivers.push([s, block]);
        }
      };
      _Prims.applyToAllStrips(["onmessage"], findReceivers);
      var newthreads = [];
      for (var i = 0; i < receivers.length; i++) {
        pair = receivers[i];
        newthreads.push(enginePorts().getRuntime().restartThread(pair[0], pair[1], true));
      }
      strip.firstTime = false;
      strip.called = newthreads;
    }
    var done = true;
    for (var j = 0; j < strip.called.length; j++) {
      if (strip.called[j].isRunning) {
        done = false;
      }
    }
    if (done) {
      strip.called = null;
      strip.firstTime = true;
      strip.thisblock = strip.thisblock.next;
      strip.waitTimer = tinterval * 2;
    } else {
      enginePorts().getRuntime().yield = true;
    }
  }
  static applyToAllStrips(list, fcn) {
    if (!enginePorts().getStage()) {
      return;
    }
    var page = enginePorts().getStage().currentPage;
    if (!page) {
      return;
    }
    if (!page.div) {
      return;
    }
    for (var i = 0; i < page.div.childElementCount; i++) {
      var spr = page.div.childNodes[i].owner;
      if (!spr) {
        continue;
      }
      var sc = gn(spr.id + "_scripts");
      if (!sc) {
        continue;
      }
      const scriptsOwner = getModelRefAs(sc, "scripts");
      var topblocks = scriptsOwner.getBlocksType(list);
      for (var j = 0; j < topblocks.length; j++) {
        fcn(topblocks[j], spr);
      }
    }
  }
};

// src/app/src/editor/ui/Library.ts
var selectedOne = null;
var nativeJr2 = true;
var clickThumb = null;
var shaking = null;
var type = null;
var timeoutEvent3 = null;
var libFrame = null;
var Library = class _Library {
  static init() {
    libFrame = document.getElementById("libframe");
    libFrame.style.minHeight = Math.max(getDocumentHeight(), frame.offsetHeight) + "px";
    var topbar = newHTML("div", "topbar", libFrame);
    topbar.setAttribute("id", "topbar");
    var actions = newHTML("div", "actions", topbar);
    actions.setAttribute("id", "libactions");
    var ascontainer = newHTML("div", "assetname-container", topbar);
    var as = newHTML("div", "assetname", ascontainer);
    var myname = newHTML("p", void 0, as);
    myname.setAttribute("id", "assetname");
    myname.textContent = "";
    _Library.layoutHeader();
  }
  static createScrollPanel() {
    var inner = newHTML("div", "innerlibrary", libFrame);
    inner.setAttribute("id", "asssetsview");
    var div = newHTML("div", "scrollarea", inner);
    div.setAttribute("id", "scrollarea");
    _Library.resizeScroll();
  }
  static open(libType) {
    type = libType;
    gn("assetname").textContent = "";
    nativeJr2 = true;
    frame.style.display = "none";
    libFrame.className = "libframe appear";
    libFrame.focus();
    selectedOne = null;
    gn("okbut").onmousedown = type == "costumes" ? _Library.closeSpriteSelection : _Library.closeBkgSelection;
    _Library.clean();
    _Library.createScrollPanel();
    _Library.addThumbnails(type);
    window.onmousedown = null;
    window.onmouseup = null;
    document.onmousemove = null;
    window.onresize = null;
    gn("library_paintme").style.opacity = "1";
    gn("library_paintme").onmousedown = _Library.editResource;
    ScratchJr.onBackButtonCallback.push(function() {
      var e = document.createEvent("TouchEvent");
      e.initTouchEvent();
      _Library.cancelPick(e);
    });
  }
  static clean() {
    if (gn("scrollarea")) {
      var div = gn("scrollarea").parentNode;
      libFrame.removeChild(div);
    }
  }
  static close(e) {
    e.preventDefault();
    e.stopPropagation();
    ScratchAudio.sndFX("tap.wav");
    ScratchJr.blur();
    selectedOne = null;
    clickThumb = null;
    window.onmouseup = null;
    window.onmousemove = null;
    if (libFrame) {
      const thumbs = libFrame.querySelectorAll(".assetbox");
      for (let i = 0; i < thumbs.length; i++) {
        thumbs[i].onmouseup = null;
        thumbs[i].onmousemove = null;
      }
    }
    libFrame.className = "libframe disappear";
    document.body.scrollTop = 0;
    frame.style.display = "block";
    ScratchJr.editorEvents();
    ScratchJr.onBackButtonCallback.pop();
  }
  static layoutHeader() {
    var buttons = newHTML("div", "bkgbuttons", gn("libactions"));
    var paintme = newHTML("div", "painticon", buttons);
    paintme.id = "library_paintme";
    paintme.onmousedown = _Library.editResource;
    var okbut = newHTML("div", "okicon", buttons);
    okbut.setAttribute("id", "okbut");
    var cancelbut = newHTML("div", "cancelicon", buttons);
    cancelbut.onmousedown = _Library.cancelPick;
  }
  static cancelPick(e) {
    ScratchJr.onHold = true;
    _Library.close(e);
    setTimeout(function() {
      ScratchJr.onHold = false;
    }, 1e3);
  }
  static addThumbnails(type2) {
    var div = gn("scrollarea");
    _Library.addEmptyThumb(div, type2 == "costumes" ? 118 * scaleMultiplier : 120 * scaleMultiplier, type2 == "costumes" ? 90 * scaleMultiplier : 90 * scaleMultiplier);
    var key = type2 == "costumes" ? "usershapes" : "userbkgs";
    var json = {
      op: "select",
      table: key,
      items: type2 == "costumes" ? ["md5", "altmd5", "name", "scale", "width", "height"] : ["altmd5", "md5", "width", "height"],
      where: [{ col: "ext", op: "=", value: "svg" }, { col: "version", op: "=", value: ScratchJr.version }],
      order: { col: "ctime", dir: "desc" }
    };
    IO.query(key, json, _Library.displayAssets);
  }
  static skipUserAssets() {
    var div = gn("scrollarea");
    _Library.addEmptyThumb(div, type == "costumes" ? 118 * scaleMultiplier : 120 * scaleMultiplier, type == "costumes" ? 90 * scaleMultiplier : 90 * scaleMultiplier);
    _Library.addHR(div);
    _Library.displayLibAssets(type == "costumes" ? MediaLib.sprites : MediaLib.backgrounds);
  }
  static getpadding(div) {
    var w = Math.min(getDocumentWidth(), libFrame.offsetWidth);
    var dw = div.childNodes[1].offsetLeft - div.childNodes[0].offsetLeft;
    var qty = Math.floor(w / dw);
    var pad = Math.floor((w - qty * dw) / 2);
    if (pad < 10) {
      return Math.floor((w - (qty - 1) * dw) / 2);
    }
    return pad;
  }
  static displayAssets(str) {
    nativeJr2 = true;
    var div = gn("scrollarea");
    var data = JSON.parse(str);
    if (data.length > 0) {
      for (var i = 0; i < data.length; i++) {
        _Library.addAssetThumbChoose(div, data[i], 120 * scaleMultiplier, 90 * scaleMultiplier, _Library.selectAsset);
      }
    }
    _Library.addHR(div);
    nativeJr2 = false;
    data = type == "costumes" ? MediaLib.sprites : MediaLib.backgrounds;
    _Library.displayLibAssets(data);
  }
  static displayLibAssets(data) {
    var div = gn("scrollarea");
    if (data.length < 1) {
      return;
    }
    var order = data[0].order;
    var key = order ? order.split(",")[1] : "";
    for (var i = 0; i < data.length; i++) {
      order = data[i].order;
      var key2 = order ? order.split(",")[1] : "";
      if (key2 != key) {
        _Library.addHR(div);
        key = key2;
      }
      if ("separator" in data[i]) {
        _Library.addHR(div);
      } else {
        _Library.addLocalThumbChoose(div, data[i], 120 * scaleMultiplier, 90 * scaleMultiplier, _Library.selectAsset);
      }
    }
  }
  /** Create a thumbnail div and populate metadata from a data bag. */
  static createThumbElement(parent, data) {
    var tb = document.createElement("div");
    parent.appendChild(tb);
    tb.byme = nativeJr2 ? 1 : 0;
    tb.setAttribute("class", "assetbox off");
    tb.setAttribute("id", data.md5);
    tb.scale = !data.scale ? 0.5 : data.scale;
    tb.fieldname = data.name;
    tb.w = Number(data.width);
    tb.h = Number(data.height);
    return tb;
  }
  static addAssetThumbChoose(parent, aa, w, h, fcn) {
    var data = _Library.parseAssetData(aa);
    var tb = _Library.createThumbElement(parent, data);
    var tw = tb.w;
    var th = tb.h;
    var scale = Math.min(w / tw, h / th);
    var img = newHTML("img", void 0, tb);
    img.style.left = 9 * scaleMultiplier + "px";
    img.style.top = 7 * scaleMultiplier + "px";
    img.style.position = "relative";
    img.style.height = Number(data.height) * scale + "px";
    if (data.altmd5) {
      IO.getAsset(data.altmd5, function(dataurl) {
        img.src = dataurl;
      });
    }
    tb.onmousedown = function(evt) {
      fcn(evt, tb);
    };
    return tb;
  }
  static addLocalThumbChoose(parent, data, w, h, fcn) {
    var tb = _Library.createThumbElement(parent, data);
    var tw = tb.w;
    var th = tb.h;
    var img = newHTML("img", void 0, tb);
    var scale = Math.min(w / tw, h / th);
    img.style.height = th * scale + "px";
    img.style.width = tw * scale + "px";
    img.style.left = Math.floor((w - scale * tw) / 2 + 9 * scaleMultiplier) + "px";
    img.style.top = Math.floor((h - scale * th) / 2 + 9 * scaleMultiplier) + "px";
    img.style.position = "relative";
    var pngPath = MediaLib.path.replace("svg", "png");
    img.src = pngPath + IO.getFilename(data.md5) + ".png";
    tb.onmousedown = function(evt) {
      fcn(evt, tb);
    };
    return tb;
  }
  static userAssetThumbnail(img, cnv, sizew, sizeh) {
    var scale = Math.min(sizew / img.width, sizeh / img.height);
    var currentCtx = cnv.getContext("2d");
    var iw = Math.floor(scale * img.width);
    var ih = Math.floor(scale * img.height);
    var ix = Math.floor((sizew - scale * img.width) / 2);
    var iy = Math.floor((sizeh - scale * img.height) / 2);
    currentCtx.drawImage(img, 0, 0, img.width, img.height, ix, iy, iw, ih);
  }
  static addEmptyThumb(parent, w, h) {
    var tb = document.createElement("div");
    tb.setAttribute("class", "assetbox off");
    tb.setAttribute("id", "none");
    tb.fieldname = type == "costumes" ? Localization.localize("LIBRARY_CHARACTER") : Localization.localize("LIBRARY_BACKGROUND");
    tb.byme = 1;
    var cnv = newCanvas(tb, 9 * scaleMultiplier, 7 * scaleMultiplier, w, h, {
      position: "relative"
    });
    var ctx = cnv.getContext("2d");
    ctx.fillStyle = ScratchJr.stagecolor;
    ctx.fillRect(0, 0, w, h);
    parent.appendChild(tb);
    tb.onmousedown = function(evt) {
      _Library.selectAsset(evt, tb);
    };
  }
  static addHR(div) {
    var hr = document.createElement("hr");
    div.appendChild(hr);
    hr.setAttribute("class", "bigdivide");
  }
  ///////////////////////////
  //selection
  static selectAsset(e, tb) {
    tb.pt = JSON.stringify(Events.getTargetPoint(e));
    if (shaking && e.target.className == "deleteasset") {
      _Library.removeFromAssetList();
      return;
    } else if (shaking) {
      _Library.stopShaking();
    }
    if (tb.byme && tb.id != "none") {
      holdit();
    }
    tb.onmouseup = function(evt) {
      clickMe(evt, tb);
    };
    window.onmouseup = function(evt) {
      clickMe(evt, tb);
    };
    window.onmousemove = function(evt) {
      clearEvents(evt, tb);
    };
    function holdit() {
      var repeat = function() {
        tb.onmouseup = null;
        window.onmouseup = null;
        window.onmousemove = null;
        timeoutEvent3 = null;
        _Library.stopShaking();
        shaking = tb;
        _Library.clearAllSelections();
        _Library.startShaking(tb);
      };
      timeoutEvent3 = setTimeout(repeat, 500);
    }
    function clearEvents(e2, tb2) {
      var pt = Events.getTargetPoint(e2);
      var pt2 = JSON.parse(tb2.pt);
      if (_Library.distance(pt, pt2) < 30) {
        return;
      }
      e2.preventDefault();
      if (timeoutEvent3) {
        clearTimeout(timeoutEvent3);
      }
      if (clickThumb) {
        _Library.unSelect(clickThumb);
      }
      timeoutEvent3 = null;
      tb2.onmouseup = null;
      window.onmouseup = function() {
        window.onmousemove = null;
        window.onmouseup = null;
      };
    }
    function clickMe(e2, tb2) {
      if (timeoutEvent3) {
        clearTimeout(timeoutEvent3);
      }
      _Library.selectThisAsset(e2, tb2);
      timeoutEvent3 = null;
      tb2.onmouseup = null;
      tb2.onmouseup = null;
      window.onmousemove = null;
      window.onmouseup = null;
    }
  }
  static startShaking(b) {
    b.className = b.className + " shakeme";
    newHTML("div", "deleteasset", b);
    shaking = b;
  }
  static stopShaking() {
    if (!shaking) {
      return;
    }
    var b = shaking;
    b.setAttribute("class", "assetbox off");
    var ic = b.childNodes[b.childElementCount - 1];
    if (ic.getAttribute("class") == "deleteasset") {
      b.removeChild(ic);
    }
    shaking = null;
  }
  static removeFromAssetList() {
    ScratchAudio.sndFX("cut.wav");
    var b = shaking;
    b.parentNode.removeChild(b);
    var key = type == "costumes" ? "usershapes" : "userbkgs";
    var json = {
      op: "select",
      table: key,
      items: ["*"],
      where: [{ col: "md5", op: "=", value: b.id }]
    };
    IO.query(key, json, _Library.removeAssetFromLib);
    clickThumb = null;
    selectedOne = null;
    return true;
  }
  // Determine if an asset thumbnail is unique
  // md5: thumbnail md5 to determine uniqueness
  // type: "costumes" or "backgrounds"
  // callback: called with true if unique, false if duplicate exists
  static assetThumbnailUnique(md5, type2, callback) {
    var key = type2 == "costumes" ? "usershapes" : "userbkgs";
    var json = {
      op: "select",
      table: key,
      items: ["md5", "altmd5"],
      where: [{ col: "ext", op: "=", value: "svg" }, { col: "altmd5", op: "=", value: md5 }],
      order: { col: "ctime", dir: "desc" }
    };
    IO.query(key, json, function(results) {
      results = JSON.parse(results);
      callback(results.length <= 1);
    });
  }
  static removeAssetFromLib(str) {
    var key = type == "costumes" ? "usershapes" : "userbkgs";
    var aa = JSON.parse(str)[0];
    var data = _Library.parseAssetData(aa);
    if (data.altmd5) {
      _Library.assetThumbnailUnique(data.altmd5, type, function(isUnique) {
        if (isUnique) {
          iOS.remove(data.altmd5, iOS.trace);
        }
      });
    }
    IO.deleteobject(key, data.id, iOS.trace);
  }
  static parseAssetData(data) {
    var res = {};
    for (var key in data) {
      res[key.toLowerCase()] = data[key];
    }
    return res;
  }
  static selectThisAsset(e, tb) {
    if (tb.id == selectedOne) {
      if (type == "costumes") {
        _Library.closeSpriteSelection(e);
      } else {
        _Library.closeBkgSelection(e);
      }
    } else {
      _Library.clearAllSelections();
      var thumbID = tb.id;
      var thumbType = thumbID.substr(thumbID.length - 3);
      if (thumbType == "png") {
        gn("library_paintme").style.opacity = "0";
        gn("library_paintme").onmousedown = null;
      } else {
        gn("library_paintme").style.opacity = "1";
        gn("library_paintme").onmousedown = _Library.editResource;
      }
      tb.className = "assetbox on";
      selectedOne = tb.id;
      clickThumb = tb;
      if (tb.fieldname) {
        gn("assetname").textContent = tb.fieldname;
      }
    }
  }
  static clearAllSelections() {
    var div = gn("scrollarea");
    for (var i = 0; i < div.childElementCount; i++) {
      if (div.childNodes[i].nodeName == "DIV") {
        div.childNodes[i].className = "assetbox off";
      }
    }
  }
  static unSelect(tb) {
    gn("assetname").textContent = "";
    tb.className = "assetbox off";
    selectedOne = null;
    if (clickThumb) {
      if (tb.byme && clickThumb.childElementCount > 1) {
        clickThumb.childNodes[clickThumb.childElementCount - 1].style.visibility = "hidden";
      }
      clickThumb = null;
    }
  }
  static resizeScroll() {
    var w = Math.min(getDocumentWidth(), frame.offsetWidth);
    var h = Math.max(getDocumentHeight(), frame.offsetHeight);
    var dx = w - 20 * scaleMultiplier;
    setProps(gn("scrollarea").style, {
      width: dx + "px",
      height: h - 120 * scaleMultiplier + "px"
    });
  }
  ///////////////////////////////////////////
  // Object actions
  //////////////////////////////////////////
  static editResource(e) {
    _Library.close(e);
    if (type != "costumes") {
      _Library.editBackground(e);
    } else {
      _Library.editCostume(e);
    }
  }
  static editBackground(e) {
    var md5 = selectedOne && selectedOne != "none" ? selectedOne : void 0;
    Paint.open(true, md5);
  }
  static editCostume(e) {
    var sname;
    var cname = selectedOne ? clickThumb.fieldname : Localization.localize("LIBRARY_CHARACTER");
    var scale = selectedOne && selectedOne != "none" ? clickThumb.scale : 0.5;
    var md5 = selectedOne && selectedOne != "none" ? selectedOne : void 0;
    var w = selectedOne && selectedOne != "none" ? Math.round(clickThumb.w) : void 0;
    var h = selectedOne && selectedOne != "none" ? Math.round(clickThumb.h) : void 0;
    Paint.open(false, md5, sname, cname, scale, w, h);
  }
  static closeSpriteSelection(e) {
    e.preventDefault();
    e.stopPropagation();
    if (ScratchJr.onHold) {
      return;
    }
    var id = selectedOne ? clickThumb.fieldname : Localization.localize("LIBRARY_CHARACTER");
    if (selectedOne && selectedOne != "none") {
      ScratchJr.stage.currentPage.addSprite(clickThumb.scale, selectedOne, id);
    }
    if (clickThumb) {
      var analyticsName = clickThumb.fieldname;
      if (!(selectedOne in MediaLib.keys)) {
        analyticsName = "user_asset";
      }
      iOS.analyticsEvent("editor", "new_character", analyticsName);
    }
    _Library.close(e);
  }
  static closeBkgSelection(e) {
    e.preventDefault();
    e.stopPropagation();
    if (selectedOne) {
      ScratchJr.stage.currentPage.setBackground(selectedOne, ScratchJr.stage.currentPage.updateBkg);
    }
    _Library.close(e);
  }
  /////////////////////////////////////////
  //Key Handeling Top Level prevention
  /////////////////////////////////////////
  static distance(pt1, pt2) {
    var dx = pt1.x - pt2.x;
    var dy = pt1.y - pt2.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  }
};

// src/app/src/editor/ui/Grid.ts
var width = 482;
var height = 362;
var size = GRID_SIZE;
var hidden = true;
var Grid = class _Grid {
  static get size() {
    return size;
  }
  static get hidden() {
    return hidden;
  }
  static init(div) {
    var w = div.offsetWidth;
    var h = div.offsetHeight;
    var grid = newDiv(div, 0, 0, width, height, {
      position: "absolute",
      zIndex: ScratchJr.layerTop
    });
    _Grid.setScaleAndPosition(grid, scaleMultiplier, 47, 75, width, height);
    grid.setAttribute("id", "livegrid");
    _Grid.drawLines(grid, width, height);
    _Grid.createNumbering(w, h);
    _Grid.createCursor();
    _Grid.createYcursor();
    _Grid.createXcursor();
  }
  static setScaleAndPosition(grid, scale, x, y, w, h) {
    setProps(grid.style, {
      webkitTransform: "translate(" + -w / 2 + "px, " + -h / 2 + "px) scale(" + scale + ") translate(" + (w / 2 + x) + "px, " + (h / 2 + y) + "px)"
    });
  }
  static drawLines(grid, w, h) {
    var cnv = newCanvas(grid, 0, 0, w, h, {
      position: "absolute"
    });
    cnv.style.opacity = "0.5";
    var ctx = cnv.getContext("2d");
    ctx.strokeStyle = "#B3B3B3";
    ctx.lineWidth = 1;
    var dx = size;
    for (let i = 0; i < 480 / size; i++) {
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx, 360);
      ctx.stroke();
      dx += size;
    }
    var dy = size;
    for (let i = 0; i < 360 / size; i++) {
      ctx.moveTo(0, dy);
      ctx.lineTo(480, dy);
      ctx.stroke();
      dy += size;
    }
    cnv.onmousedown = function(evt) {
      ScratchJr.stage.mouseDown(evt);
    };
  }
  static createNumbering(w, h) {
    var row = newDiv(gn("stageframe"), 0, 0, w - 46 - 30, 24, {
      position: "absolute",
      zIndex: ScratchJr.layerTop
    });
    row.setAttribute("id", "rownum");
    _Grid.setScaleAndPosition(row, scaleMultiplier, 46 - 24, 75 + height, w - 46 - 30, 24);
    var offset = size;
    var dx = offset;
    for (var i = 0; i < 480 / offset; i++) {
      var num = newDiv(row, dx, 0, size, size, {
        position: "absolute",
        zIndex: 10
      });
      var p = newP(num, Localization.localize("GRID_NUMBER", {
        N: i + 1
      }), {});
      p.setAttribute("class", "stylelabel");
      dx += offset;
    }
    var column = newDiv(gn("stageframe"), 0, 0, 24, h + 24, {
      position: "absolute",
      zIndex: ScratchJr.layerTop
    });
    column.setAttribute("id", "colnum");
    _Grid.setScaleAndPosition(column, scaleMultiplier, 46 - 24, 74 + 1, 24, h + 24);
    var dy = 360 - offset;
    for (var j = 0; j < 360 / offset; j++) {
      var numj = newDiv(column, 0, dy, size, size, {
        position: "absolute",
        zIndex: 10
      });
      var py = newP(numj, Localization.localize("GRID_NUMBER", {
        N: j + 1
      }), {});
      py.setAttribute("class", "stylelabel");
      dy -= offset;
    }
  }
  static createYcursor() {
    var num = newDiv(gn("colnum"), 0, 0, size, size, {
      position: "absolute",
      zIndex: 20
    });
    num.setAttribute("class", "circle");
    num.style.background = "#6a99c1";
    num.setAttribute("id", "ycursor");
    var p = newP(num, String(15), {});
    p.setAttribute("class", "circlenum");
  }
  static createXcursor() {
    var num = newDiv(gn("rownum"), size, 0, size, size, {
      position: "absolute",
      zIndex: 20
    });
    num.setAttribute("class", "circle");
    num.style.background = "#6a99c1";
    num.setAttribute("id", "xcursor");
    var p = newP(num, String(1), {});
    p.setAttribute("class", "circlenum");
  }
  static createCursor() {
    var gc = newDiv(gn("livegrid"), 0, 0, size + 2, size + 2, {
      position: "absolute",
      zIndex: ScratchJr.layerAboveBottom
    });
    gc.setAttribute("id", "circlenum");
    var cnv = newCanvas(gc, 0, 0, size + 2, size + 2, {
      position: "absolute"
    });
    cnv.onmousedown = function(evt) {
      _Grid.mouseDownOnCursor(evt);
    };
    var ctx = cnv.getContext("2d");
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#28A5DA";
    ctx.strokeStyle = "#656e73";
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, size - 6, size - 6);
    ctx.fillRect(3, 3, size - 6, size - 6);
    gc.onmousedown = _Grid.mouseDownOnCursor;
  }
  static mouseDownOnCursor(e) {
    e.preventDefault();
    e.stopPropagation();
    var pt = ScratchJr.stage.getStagePt(e);
    var spr = ScratchJr.getSprite();
    ScratchJr.stage.initialPoint = {
      x: pt.x,
      y: pt.y
    };
    Events.dragthumbnail = spr.div;
    Events.clearEvents();
    if (!ScratchJr.inFullscreen && spr) {
      Events.holdit(spr.div, ScratchJr.stage.startShaking);
    }
    ScratchJr.stage.setEvents();
  }
  static updateCursor() {
    if (hidden) {
      return;
    }
    if (ScratchJr.inFullscreen) {
      return;
    }
    if (!ScratchJr.stage.currentPage) {
      return;
    }
    if (!ScratchJr.getSprite()) {
      gn("circlenum").style.visibility = "hidden";
      gn("xcursor").style.visibility = "hidden";
      gn("ycursor").style.visibility = "hidden";
      return;
    }
    var spr = gn(ScratchJr.stage.currentPage.currentSpriteName);
    if (!spr) {
      return;
    }
    var obj = spr.owner;
    var c = gn("circlenum");
    if (!c) {
      return;
    }
    var dx = obj.xcoor + size / 2;
    var dy = obj.ycoor - size / 2;
    gn("xcursor").style.visibility = "visible";
    gn("ycursor").style.visibility = "visible";
    gn("circlenum").style.visibility = "visible";
    _Grid.setCursorsValues(dx, dy);
  }
  static setCursorsValues(dx, dy) {
    var c = gn("circlenum");
    var numX = Math.round(dx / size);
    var numY = Math.round(dy / size);
    if (c.offsetLeft != numX * 24) {
      var xc = gn("xcursor");
      var xstate = numX < 1 || numX > 20 ? "hidden" : "visible";
      setProps(xc.style, {
        position: "absolute",
        left: numX * 24 + "px",
        visibility: xstate
      });
      xc.childNodes[0].textContent = Localization.localize("GRID_NUMBER", {
        N: numX
      });
    }
    if (c.offsetTop != numY * 24) {
      var yc = gn("ycursor");
      var ystate = numY < 0 || numY > 14 ? "hidden" : "visible";
      setProps(yc.style, {
        position: "absolute",
        top: numY * 24 + "px",
        visibility: ystate
      });
      yc.childNodes[0].textContent = Localization.localize("GRID_NUMBER", {
        N: 15 - numY
      });
    }
    setProps(c.style, {
      position: "absolute",
      top: numY * 24 + "px",
      left: (numX - 1) * 24 + "px"
    });
  }
  static hide(b) {
    hidden = b;
    var mystate = hidden ? "hidden" : "visible";
    gn("livegrid").style.visibility = mystate;
    gn("rownum").style.visibility = mystate;
    gn("colnum").style.visibility = mystate;
    if (ScratchJr.stage.currentPage) {
      mystate = !ScratchJr.getSprite() ? "hidden" : mystate;
    }
    gn("circlenum").style.visibility = mystate;
    gn("xcursor").style.visibility = mystate;
    gn("ycursor").style.visibility = mystate;
  }
};

// src/app/src/editor/engine/Thread.ts
var Thread = class _Thread {
  // Instance state assigned by the constructor and step loop
  firstBlock;
  thisblock;
  oldblock;
  spr;
  audio;
  stack;
  firstTime;
  count;
  waitTimer;
  distance;
  called;
  vector;
  isRunning;
  time;
  angleStep;
  finalAngle;
  constructor(s, block) {
    this.firstBlock = block.findFirst();
    this.thisblock = block;
    this.oldblock = null;
    this.spr = s;
    this.audio = void 0;
    this.stack = [];
    this.firstTime = true;
    this.count = -1;
    this.waitTimer = 0;
    this.distance = -1;
    this.called = [];
    this.vector = {
      x: 0,
      y: 0
    };
    this.isRunning = true;
    this.time = 0;
    return this;
  }
  clear() {
    this.stack = [];
    this.firstTime = true;
    this.count = -1;
    this.waitTimer = 0;
    this.vector = {
      x: 0,
      y: 0
    };
    this.distance = -1;
    this.called = [];
    this.thisblock = this.firstBlock;
  }
  duplicate() {
    var thread = new _Thread(this.spr, this.firstBlock);
    thread.count = -1;
    thread.firstBlock = this.firstBlock;
    thread.thisblock = this.thisblock;
    thread.oldblock = null;
    thread.spr = this.spr;
    thread.stack = this.stack;
    thread.firstTime = this.firstTime;
    thread.vector = {
      x: 0,
      y: 0
    };
    thread.waitTimer = 0;
    thread.distance = -1;
    thread.called = this.called;
    thread.isRunning = this.isRunning;
    return thread;
  }
  deselect(b) {
    while (b != null) {
      b.unhighlight();
      if (b.inside) {
        b.repeatCounter = -1;
        this.deselect(b.inside);
      }
      b = b.next;
    }
  }
  stop(b) {
    this.stopping(b);
    this.isRunning = false;
  }
  stopping(b) {
    this.endPrim(b);
    this.deselect(this.firstBlock);
    this.clear();
    this.spr.closeBalloon();
  }
  endPrim(stopMine) {
    if (!this.thisblock) {
      return;
    }
    var b = this.thisblock;
    var s = this.spr;
    switch (b.blocktype) {
      case "down":
      case "back":
      case "forward":
      case "up":
        if (this.distance > -1 && !stopMine) {
          var vector = Vector.scale(this.vector, this.distance % 24);
          s.setPos(s.xcoor + vector.x, s.ycoor + vector.y);
        }
        break;
      case "hop":
        var count2 = this.count;
        var n = Number(b.getArgValue());
        count2--;
        if (count2 > 0) {
          var delta2 = 0;
          for (var i = count2; i > -1; i--) {
            delta2 += Prims.hopList[count2];
          }
          this.vector = {
            x: 0,
            y: delta2
          };
          var dy = s.ycoor - this.vector.y / 5 * n;
          if (dy < 0) {
            dy = 0;
          }
          if (dy >= 360 - GRID_SIZE) {
            dy = 360 - GRID_SIZE;
          }
          s.setPos(s.xcoor + this.vector.x, dy);
        }
        break;
      case "playsnd":
        if (this.audio) {
          this.audio.stop();
          this.audio = void 0;
        }
        break;
      case "playusersnd":
        if (this.audio) {
          this.audio.stop();
          this.audio = void 0;
        }
        break;
      case "hide":
        s.div.style.opacity = "0";
        if (!this.firstBlock.aStart && !stopMine) {
          s.homeshown = false;
        }
        break;
      case "show":
        s.div.style.opacity = "1";
        if (!this.firstBlock.aStart && !stopMine) {
          s.homeshown = true;
        }
        break;
      case "same":
        s.noScaleFor();
        break;
      case "grow":
      case "shrink":
        if (!this.firstBlock.aStart && !stopMine) {
          s.homescale = s.scale;
        }
        break;
      case "right":
      case "left":
        var angle = s.angle;
        if (angle % 30 != 0) {
          angle = (Math.floor(angle / 30) + 1) * 30;
        }
        s.setHeading(angle);
        break;
      default:
        break;
    }
  }
};

// src/app/src/editor/engine/Runtime.ts
var Runtime = class {
  threadsRunning;
  thread;
  intervalId;
  yield;
  constructor() {
    this.threadsRunning = [];
    this.thread = null;
    this.intervalId = void 0;
    this.yield = false;
  }
  beginTimer() {
    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
    }
    var rt = this;
    this.intervalId = window.setInterval(function() {
      rt.tickTask();
    }, 32);
    enginePorts().projectClearSaving();
    this.threadsRunning = [];
  }
  tickTask() {
    enginePorts().updateRunStopButtons();
    if (this.threadsRunning.length < 1) {
      return;
    }
    var activeThreads = [];
    for (var i = 0; i < this.threadsRunning.length; i++) {
      if (this.threadsRunning[i].isRunning) {
        activeThreads.push(this.threadsRunning[i]);
      }
    }
    this.threadsRunning = activeThreads;
    for (var j = 0; j < this.threadsRunning.length; j++) {
      this.step(j);
    }
  }
  inactive() {
    if (this.threadsRunning.length < 1) {
      return true;
    }
    var inactive = true;
    for (var i = 0; i < this.threadsRunning.length; i++) {
      var t = this.threadsRunning[i];
      if (!t) {
        continue;
      }
      if (t.isRunning && t.firstBlock.blocktype != "ontouch") {
        inactive = false;
      }
      if (t.firstBlock.blocktype == "ontouch" && t.thisblock != null && t.thisblock.blocktype != "ontouch") {
        inactive = false;
      }
    }
    return inactive;
  }
  step(n) {
    this.yield = false;
    this.thread = this.threadsRunning[n];
    while (true) {
      if (!this.thread.isRunning) {
        return;
      }
      if (this.thread.waitTimer > 0) {
        this.thread.waitTimer += -1;
        return;
      }
      if (this.yield) {
        return;
      }
      if (this.thread.thisblock == null) {
        this.endCase();
        this.yield = true;
      } else {
        this.runPrim();
      }
    }
  }
  addRunScript(spr, b) {
    this.restartThread(spr, b);
  }
  stopThreads() {
    for (var i = 0; i < this.threadsRunning.length; i++) {
      this.threadsRunning[i].stop();
    }
    this.threadsRunning = [];
  }
  stopThreadBlock(b) {
    for (var i = 0; i < this.threadsRunning.length; i++) {
      if (this.threadsRunning[i].firstBlock == b) {
        this.threadsRunning[i].stop();
      }
    }
  }
  stopThreadSprite(spr) {
    for (var i = 0; i < this.threadsRunning.length; i++) {
      if (this.threadsRunning[i].spr == spr) {
        this.threadsRunning[i].stop();
      }
    }
  }
  removeRunScript(spr) {
    var res = [];
    for (var i = 0; i < this.threadsRunning.length; i++) {
      if (this.threadsRunning[i].spr == spr) {
        if (this.threadsRunning[i].isRunning) {
          if (this.threadsRunning[i].thisblock != null) {
            this.threadsRunning[i].endPrim();
          }
          res.push(this.threadsRunning[i].duplicate());
        }
        this.threadsRunning[i].isRunning = false;
        if (this.threadsRunning[i].oldblock != null) {
          this.threadsRunning[i].oldblock.unhighlight();
        }
      }
    }
    return res;
  }
  runPrim() {
    if (this.thread.oldblock != null) {
      this.thread.oldblock.unhighlight();
    }
    this.thread.oldblock = null;
    var token = Prims.table[this.thread.thisblock.blocktype];
    if (token == null) {
      token = Prims.table.missing;
    } else {
      var noh = ["repeat", "gotopage"];
      if (noh.indexOf(this.thread.thisblock.blocktype) < 0) {
        this.thread.thisblock.highlight();
        this.thread.oldblock = this.thread.thisblock;
      }
      Prims.time = Date.now();
      token(this.thread);
    }
  }
  endCase() {
    if (this.thread.oldblock != null) {
      this.thread.oldblock.unhighlight();
    }
    if (this.thread.stack.length == 0) {
      Prims.Done(this.thread);
    } else {
      var thing = this.thread.stack.pop();
      this.thread.thisblock = thing;
      this.runPrim();
    }
  }
  restartThread(spr, b, active) {
    var newThread = new Thread(spr, b);
    var wasRunning = false;
    for (var i = 0; i < this.threadsRunning.length; i++) {
      if (this.threadsRunning[i].firstBlock == b) {
        wasRunning = true;
        if (b.blocktype != "ontouch") {
          if (this.threadsRunning[i].oldblock != null) {
            this.threadsRunning[i].oldblock.unhighlight();
          }
          this.threadsRunning[i].stopping(active);
          newThread = this.threadsRunning[i];
        }
      }
    }
    if (!wasRunning) {
      this.threadsRunning.push(newThread);
    }
    return newThread;
  }
};

// src/app/src/editor/ScratchJr.ts
var namedForms3 = document.forms;
var workingCanvas = document.createElement("canvas");
var workingCanvas2 = document.createElement("canvas");
var activeFocus;
var changed = false;
var storyStarted = false;
var runtime;
var stage;
var inFullscreen = false;
var keypad;
var textForm;
var editfirst = false;
var stagecolor;
var defaultSprite;
var layerTop = 10;
var layerAboveBottom = 4;
var dragginLayer = 7e3;
var currentProject;
var editmode;
var isDebugging = false;
var time;
var userStart = false;
var onHold = false;
var shaking2;
var stopShaking;
var version;
var autoSaveEnabled = true;
var autoSaveSetInterval = null;
var onBackButtonCallback = [];
var ScratchJr = class _ScratchJr {
  static get workingCanvas() {
    return workingCanvas;
  }
  static get workingCanvas2() {
    return workingCanvas2;
  }
  static get activeFocus() {
    return activeFocus;
  }
  static set activeFocus(newActiveFocus) {
    activeFocus = newActiveFocus;
  }
  static set changed(newChanged) {
    changed = newChanged;
  }
  static set storyStarted(newStoryStarted) {
    storyStarted = newStoryStarted;
  }
  static get runtime() {
    return runtime;
  }
  static get stage() {
    return stage;
  }
  static set stage(newStage) {
    stage = newStage;
  }
  static get inFullscreen() {
    return inFullscreen;
  }
  static get stagecolor() {
    return stagecolor;
  }
  static get defaultSprite() {
    return defaultSprite;
  }
  static get layerTop() {
    return layerTop;
  }
  static get layerAboveBottom() {
    return layerAboveBottom;
  }
  static get dragginLayer() {
    return dragginLayer;
  }
  static get currentProject() {
    return currentProject;
  }
  static set currentProject(newValue) {
    currentProject = newValue;
  }
  static get editmode() {
    return editmode;
  }
  static set editmode(newEditmode) {
    editmode = newEditmode;
  }
  static set time(newTime) {
    time = newTime;
  }
  static set userStart(newUserStart) {
    userStart = newUserStart;
  }
  static get onHold() {
    return onHold;
  }
  static set onHold(newOnHold) {
    onHold = newOnHold;
  }
  static get shaking() {
    return shaking2;
  }
  static set shaking(newShaking) {
    shaking2 = newShaking;
  }
  static get stopShaking() {
    return stopShaking;
  }
  static set stopShaking(newStopShaking) {
    stopShaking = newStopShaking;
  }
  static get version() {
    return version;
  }
  static get onBackButtonCallback() {
    return onBackButtonCallback;
  }
  static appinit(v) {
    stagecolor = window.Settings.stageColor;
    defaultSprite = window.Settings.defaultSprite;
    version = v;
    document.body.scrollTop = 0;
    time = Date.now();
    var urlvars = getUrlVars();
    iOS.hascamera();
    _ScratchJr.log("starting the app");
    BlockSpecs.initBlocks();
    Project.loadIcon = document.createElement("img");
    Project.loadIcon.src = "assets/loading.png";
    _ScratchJr.log("blocks init", _ScratchJr.getTime(), "sec", BlockSpecs.loadCount);
    currentProject = urlvars.pmd5;
    editmode = urlvars.mode;
    libInit();
    Project.init();
    _ScratchJr.log("Start ui init", _ScratchJr.getTime(), "sec");
    Project.setProgress(10);
    ScratchAudio.init();
    Library.init();
    Paint.init();
    Record.init();
    Prims.init();
    runtime = new Runtime();
    Undo.init();
    _ScratchJr.editorEvents();
    Project.load(currentProject);
    Events.init();
    if (window.Settings.autoSaveInterval > 0) {
      autoSaveSetInterval = window.setInterval(function() {
        const projectWithSaving = Project;
        if (autoSaveEnabled && !onHold && !projectWithSaving.saving && !UI.infoBoxOpen) {
          _ScratchJr.saveProject(null, function() {
            Alert.close();
          });
        }
      }, window.Settings.autoSaveInterval);
    }
  }
  // Event handler for when a story is started
  // When called and enabled, this will trigger sample projects to save copies
  // Here for debugging, run-time filtering, etc.
  static storyStart(_eventName) {
    storyStarted = true;
  }
  static editorEvents() {
    document.ongesturestart = void 0;
    document.onmousemove = function(e) {
      e.preventDefault();
    };
    window.onmousedown = _ScratchJr.unfocus;
    window.onmouseup = null;
  }
  static unfocus(evt) {
    if (Palette.helpballoon) {
      Palette.helpballoon.parentNode.removeChild(Palette.helpballoon);
      Palette.helpballoon = null;
    }
    if (namedForms3.editable) {
      if (evt && evt.target == namedForms3.editable.field) {
        return;
      }
    }
    if (namedForms3.activetextbox) {
      if (evt && evt.target == namedForms3.activetextbox.typing) {
        return;
      }
    }
    if (namedForms3.projectname) {
      if (evt && evt.target == namedForms3.projectname.myproject) {
        return;
      }
    }
    if (document.activeElement.tagName.toLowerCase() == "input") {
      document.activeElement.blur();
    }
    _ScratchJr.clearSelection();
    _ScratchJr.blur();
  }
  static clearSelection() {
    if (shaking2) {
      stopShaking(shaking2);
    }
  }
  static blur() {
    if (ScratchAudio.firstTime) {
      ScratchAudio.firstClick();
    }
    _ScratchJr.editDone();
    Menu.closeMyOpenMenu();
  }
  static getSprite() {
    if (!stage.currentPage.currentSpriteName) {
      return void 0;
    }
    if (!gn(stage.currentPage.currentSpriteName)) {
      return void 0;
    }
    return gn(stage.currentPage.currentSpriteName).owner;
  }
  static gestureStart(e) {
    e.preventDefault();
    if (ScratchAudio.firstTime) {
      ScratchAudio.firstClick();
    }
  }
  static log(...args) {
    if (!isDebugging) {
      return;
    }
    console.log(args);
  }
  static getTime() {
    return (Date.now() - time) / 1e3;
  }
  static isSampleOrStarter() {
    return editmode == "look" || editmode == "storyStarter";
  }
  static isEditable() {
    return editmode != "look";
  }
  // Called when ScratchJr is brought back to focus
  // Here, we fix up some UI elements that may not have been properly shut down when the app was paused.
  // Note that on Android Lollipop and up we have much more limited
  // opportunity to save progress, etc. before the app is
  // paused, and so we just suspend the whole webview and then restore it here.
  static onResume() {
    if (Record.dialogOpen) {
      Record.recordError();
    }
    autoSaveEnabled = true;
    if (autoSaveSetInterval !== null) {
      window.clearInterval(autoSaveSetInterval);
    }
    autoSaveSetInterval = window.setInterval(function() {
      const projectWithSaving = Project;
      if (autoSaveEnabled && !onHold && !projectWithSaving.saving && !UI.infoBoxOpen) {
        _ScratchJr.saveProject(null, function() {
          Alert.close();
        });
      }
    }, window.Settings.autoSaveInterval);
  }
  static onPause() {
    autoSaveEnabled = false;
    if (autoSaveSetInterval !== null) {
      window.clearInterval(autoSaveSetInterval);
      autoSaveSetInterval = null;
    }
  }
  static saveProject(e, onDone) {
    if (_ScratchJr.isEditable() && editmode == "storyStarter" && storyStarted && !Project.error) {
      iOS.analyticsEvent("samples", "story_starter_edited", Project.metadata.name);
      var sampleName = Localization.localize("SAMPLE_" + Project.metadata.name);
      IO.uniqueProjectName({
        name: sampleName
      }, function(jsonData) {
        var newName = jsonData.name;
        Project.metadata.name = newName;
        IO.createProject({
          name: newName,
          version,
          mtime: (/* @__PURE__ */ new Date()).getTime().toString()
        }, function(md5) {
          currentProject = md5;
          editmode = "edit";
          Project.prepareToSave(currentProject, onDone);
        });
      }, true);
    } else if (_ScratchJr.isEditable() && currentProject && !Project.error && changed) {
      Project.prepareToSave(currentProject, onDone);
    } else {
      if (onDone) {
        onDone();
      }
    }
  }
  static saveAndFlip(e) {
    onHold = true;
    _ScratchJr.stopStripsFromTop(e);
    _ScratchJr.unfocus(e);
    _ScratchJr.saveProject(e, _ScratchJr.flippage);
  }
  static flippage() {
    Alert.close();
    iOS.cleanassets("wav", doNext);
    function doNext() {
      iOS.cleanassets("svg", _ScratchJr.switchPage);
    }
  }
  static switchPage() {
    window.location.href = _ScratchJr.getGotoLink();
  }
  static getGotoLink() {
    if (editmode == "storyStarter") {
      if (!storyStarted) {
        return "home.html?place=help";
      } else {
        return "home.html?place=home";
      }
    }
    if (!currentProject) {
      return "home.html?place=home";
    }
    if (Project.metadata.gallery == "samples") {
      return "home.html?place=help";
    } else {
      return "home.html?place=home&timestamp=" + (/* @__PURE__ */ new Date()).getTime();
    }
  }
  static updateRunStopButtons() {
    var isOff = runtime.inactive();
    if (inFullscreen) {
      gn("go").className = isOff ? "go on presentationmode" : "go off presentationmode";
      UI.updatePageControls();
    } else {
      gn("go").className = isOff ? "go on" : "go off";
      Grid.updateCursor();
    }
    if (_ScratchJr.getSprite()) {
      if (isOff && !inFullscreen) {
        _ScratchJr.getSprite().select();
      } else {
        _ScratchJr.getSprite().unselect();
      }
    }
    if (isOff && userStart) {
      stage.currentPage.updateThumb();
      userStart = false;
    }
  }
  static runStrips(e) {
    _ScratchJr.stopStripsFromTop(e);
    _ScratchJr.unfocus(e);
    _ScratchJr.startGreenFlagThreads();
    userStart = true;
  }
  static startGreenFlagThreads() {
    _ScratchJr.resetSprites();
    _ScratchJr.startCurrentPageStrips(["onflag", "ontouch"]);
  }
  static startCurrentPageStrips(list) {
    var page = stage.currentPage.div;
    for (var i = 0; i < page.childElementCount; i++) {
      var spr = page.childNodes[i].owner;
      if (!spr) {
        continue;
      }
      if (!gn(spr.id + "_scripts")) {
        continue;
      }
      _ScratchJr.startScriptsFor(spr, list);
    }
  }
  static startScriptsFor(spr, list) {
    var sc = gn(spr.id + "_scripts");
    const scriptsOwner = getModelRefAs(sc, "scripts");
    var topblocks = scriptsOwner.getBlocksType(list);
    for (var j = 0; j < topblocks.length; j++) {
      var b = topblocks[j];
      runtime.addRunScript(spr, b);
    }
  }
  static stopStripsFromTop(e) {
    e.preventDefault();
    e.stopPropagation();
    _ScratchJr.unfocus(e);
    _ScratchJr.stopStrips();
    userStart = false;
  }
  static stopStrips() {
    runtime.stopThreads();
    stage.currentPage.updateThumb();
  }
  static resetSprites() {
    stage.resetPage(stage.currentPage);
  }
  static fullScreen(e) {
    if (gn("full").className == "fullscreen") {
      onBackButtonCallback.push(function() {
        var fakeEvent = document.createEvent("TouchEvent");
        fakeEvent.initTouchEvent();
        _ScratchJr.quitFullScreen(fakeEvent);
      });
      _ScratchJr.enterFullScreen(e);
    } else {
      _ScratchJr.quitFullScreen(e);
    }
  }
  static displayStatus(type2) {
    var ids = ["topsection", "blockspalette", "scripts", "flip", "projectinfo"];
    for (var i = 0; i < ids.length; i++) {
      if (gn(ids[i])) {
        gn(ids[i]).style.display = type2;
      }
    }
  }
  static enterFullScreen(e) {
    if (onHold) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    _ScratchJr.unfocus(e);
    _ScratchJr.displayStatus("none");
    inFullscreen = true;
    UI.enterFullScreen();
    iOS.analyticsEvent("editor", "full_screen_entered");
    document.body.style.background = "black";
  }
  static quitFullScreen(e) {
    e.preventDefault();
    e.stopPropagation();
    _ScratchJr.displayStatus("block");
    inFullscreen = false;
    UI.quitFullScreen();
    onBackButtonCallback.pop();
    document.body.style.background = "white";
  }
  /////////////////////////////////////////
  //UI calls
  /////////////////////////////////////////
  static getActiveScript() {
    var str = stage.currentPage.currentSpriteName + "_scripts";
    return gn(str);
  }
  static getBlocks() {
    return getModelRefAs(_ScratchJr.getActiveScript(), "scripts").getBlocks();
  }
  /////////////////////////////////////////////////
  //Setup editable field
  static setupEditableField() {
    textForm = newHTML("form", "textform", frame);
    textForm.name = "editable";
    var ti = newHTML("input", "textinput", textForm);
    ti.name = "field";
    ti.onkeypress = function(evt) {
      handleKeyPress(evt);
    };
    textForm.onsubmit = function(evt) {
      submitOverride(evt);
    };
    function handleKeyPress(e) {
      var key = e.keyCode || e.which;
      if (key == 13) {
        submitOverride(e);
      }
    }
    function submitOverride(e) {
      e.preventDefault();
      e.stopPropagation();
      var input = e.target;
      input.blur();
      onBackButtonCallback.pop();
    }
    ti.maxLength = 50;
    ti.onfocus = _ScratchJr.handleTextFieldFocus;
    ti.onblur = _ScratchJr.handleTextFieldBlur;
  }
  /////////////////////////////////////////////////
  //Argument Clicked
  static editArg(e, ti) {
    e.preventDefault();
    e.stopPropagation();
    const argOwner = ti ? getModelRefAs(ti, "blockarg") : void 0;
    if (argOwner && argOwner.isText()) {
      _ScratchJr.textClicked(e, ti);
    } else {
      _ScratchJr.numberClicked(e, ti);
    }
    onBackButtonCallback.push(function() {
      _ScratchJr.editDone();
    });
  }
  static textClicked(e, div) {
    var b = getModelRefAs(div, "blockarg");
    activeFocus = b;
    var pt = b.getScreenPt();
    var sc = _ScratchJr.getActiveScript();
    div = sc.parentNode;
    var w = div.offsetWidth;
    var h = div.offsetHeight;
    var dx = pt.x + 480 * scaleMultiplier > w ? w - 486 * scaleMultiplier : pt.x - 6 * scaleMultiplier;
    var ti = namedForms3.editable.field;
    ti.style.textAlign = "center";
    namedForms3.editable.style.left = dx + "px";
    var top = pt.y + 55 * scaleMultiplier;
    namedForms3.editable.style.top = top + "px";
    if (isAndroid) {
      AndroidInterface.scratchjr_setsoftkeyboardscrolllocation(
        top * window.devicePixelRatio,
        (top + h) * window.devicePixelRatio
      );
    }
    namedForms3.editable.className = "textform on";
    ti.value = String(b.argValue);
    if (isAndroid) {
      AndroidInterface.scratchjr_forceShowKeyboard();
    }
    ti.focus();
  }
  static handleTextFieldFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    activeFocus.oldvalue = activeFocus.input.textContent;
  }
  static handleTextFieldBlur(e) {
    onBackButtonCallback.pop();
    e.preventDefault();
    e.stopPropagation();
    var focus = activeFocus;
    var ti = namedForms3.editable.field;
    var str = ti.value.substring(0, ti.maxLength);
    focus.argValue = str;
    focus.setValue(str);
    namedForms3.editable.className = "textform off";
    if (focus.daddy.div.parentNode) {
      var spr = getModelRefAs(focus.daddy.div.parentNode, "scripts").spr;
      var action = {
        action: "scripts",
        where: spr.div.parentNode.owner.id,
        who: spr.id
      };
      if (focus.input.textContent != focus.oldvalue) {
        Undo.record(action);
        _ScratchJr.storyStart("ScratchJr.handleTextFieldBlur");
      }
    }
    activeFocus = void 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
    if (isAndroid) {
      AndroidInterface.scratchjr_forceHideKeyboard();
    }
  }
  /////////////////////////////////////////
  //Numeric keyboard
  /////////////////////////////////////////
  static setupKeypad() {
    keypad = newHTML("div", "picokeyboard", frame);
    keypad.onmousedown = _ScratchJr.eatEvent;
    var pad = newHTML("div", "insidekeyboard", keypad);
    for (var i = 1; i < 10; i++) {
      _ScratchJr.keyboardAddKey(pad, i, "onekey");
    }
    _ScratchJr.keyboardAddKey(pad, "-", "onekey minus");
    _ScratchJr.keyboardAddKey(pad, "0", "onekey");
    _ScratchJr.keyboardAddKey(pad, void 0, "onekey delete");
    document.addEventListener("keydown", _ScratchJr.onNumberKeyDown);
  }
  static isNumberPadKeyCode(e) {
    return isFinite(Number(e.key)) || e.keyCode == 8 || e.keyCode === 46;
  }
  static onNumberKeyDown(e) {
    if (_ScratchJr.isNumberPadKeyCode(e) && document.getElementsByClassName("picokeyboard on").length > 0) {
      e.preventDefault();
      e.stopPropagation();
      if (e.keyCode == 8 || e.keyCode === 46) {
        _ScratchJr.numEditDelete();
      } else {
        const newChar = e.key;
        var input = activeFocus.input;
        var val = input.textContent;
        if (editfirst) {
          editfirst = false;
          val = "0";
        }
        if (val == "0") {
          val = newChar;
        } else {
          val += newChar;
        }
        if (Number(val).toString() != "NaN" && (Number(val) > 99 || Number(val) < -99)) {
          ScratchAudio.sndFX("boing.wav");
        } else {
          activeFocus.setValue(val);
        }
      }
    }
  }
  static eatEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  static keyboardAddKey(p, str, c) {
    var keym = newHTML("div", c, p);
    var mk = newHTML("span", void 0, keym);
    mk.textContent = str ? String(str) : "";
    keym.onmousedown = _ScratchJr.numEditKey;
  }
  /////////////////////////////////////////////////
  //Number Clicked
  static numberClicked(e, ti) {
    var delta2 = activeFocus ? activeFocus.delta : 0;
    if (activeFocus && activeFocus.type == "blockarg") {
      activeFocus.div.className = "numfield off";
      _ScratchJr.numEditDone();
    }
    var b = getModelRefAs(ti, "blockarg");
    activeFocus = b;
    activeFocus.delta = delta2;
    b.oldvalue = ti.textContent;
    activeFocus.div.className = "numfield on";
    keypad.className = "picokeyboard on";
    editfirst = true;
    var p = getModelRefAs(ti.parentNode.parentNode, "block");
    if (Number(p.min) < 0) {
      _ScratchJr.setMinusKey();
    } else {
      _ScratchJr.setSpaceKey();
    }
    if (delta2 == 0) {
      _ScratchJr.needsToScroll(b);
    }
  }
  static needsToScroll(b) {
    var look = _ScratchJr.getActiveScript();
    var dx = b.daddy.div.left + b.daddy.div.offsetWidth + look.left;
    var w = window.innerWidth - keypad.offsetWidth - 10;
    var delta2 = dx > w ? w - dx : 0;
    if (delta2 < 0) {
      var transition = {
        duration: 0.5,
        transition: "ease-out",
        style: {
          left: look.left + delta2 + "px"
        },
        onComplete: function() {
          ScriptsPane.scroll.refresh();
        }
      };
      CSSTransition3D(look, transition);
    }
    activeFocus.delta = delta2;
  }
  static numEditKey(e) {
    e.preventDefault();
    e.stopPropagation();
    var t = e.target;
    if (!t) {
      return;
    }
    if (t.className == "") {
      t = t.parentNode;
    }
    if (t.className != "onekey space") {
      ScratchAudio.sndFX("keydown.wav");
    }
    var c = t.textContent;
    var input = activeFocus.input;
    if (!c) {
      const parent = t.parentNode;
      if (parent.className == "onekey delete" || t.className == "onekey delete") {
        _ScratchJr.numEditDelete();
      }
      return;
    }
    var val = input.textContent;
    if (editfirst) {
      editfirst = false;
      val = "0";
    }
    if (c == "-" && val != "0") {
      ScratchAudio.sndFX("boing.wav");
      return;
    }
    if (val == "0") {
      val = c;
    } else {
      val += c;
    }
    if (Number(val).toString() != "NaN" && (Number(val) > 99 || Number(val) < -99)) {
      ScratchAudio.sndFX("boing.wav");
    } else {
      activeFocus.setValue(val);
    }
  }
  static setSpaceKey() {
    const row = keypad.childNodes[0];
    const key = row.childNodes[9];
    key.className = "onekey space";
    key.childNodes[0].textContent = "";
  }
  static setMinusKey() {
    const row = keypad.childNodes[0];
    const key = row.childNodes[9];
    key.className = "onekey minus";
    key.childNodes[0].textContent = "-";
  }
  static validateNumber(val) {
    return Number(val);
  }
  static numEditDelete() {
    var val = activeFocus.input.textContent;
    if (val.length != 0) {
      val = val.substring(0, val.length - 1);
    }
    if (val.length == 0) {
      val = "0";
    }
    activeFocus.setValue(val);
  }
  static editDone() {
    if (document.activeElement.tagName === "INPUT") {
      document.activeElement.blur();
    }
    if (activeFocus == void 0) {
      return;
    }
    if (activeFocus.type != "blockarg") {
      return;
    }
    if (activeFocus.isText()) {
      namedForms3.editable.field.blur();
    } else {
      _ScratchJr.closeNumberEdit();
      onBackButtonCallback.pop();
    }
  }
  static closeNumberEdit() {
    _ScratchJr.numEditDone();
    _ScratchJr.resetScroll();
    keypad.className = "picokeyboard off";
    activeFocus.div.className = "numfield off";
    activeFocus = void 0;
  }
  static numEditDone() {
    var val = activeFocus.input.textContent ?? "";
    if (val == "-") {
      val = 0;
    }
    if (val == "-0") {
      val = 0;
    }
    val = _ScratchJr.validateNumber(val);
    var ba = activeFocus;
    activeFocus.setValue(parseFloat(String(val)));
    ba.argValue = val;
    if (ba.daddy && ba.daddy.div.parentNode.owner) {
      var spr = getModelRefAs(ba.daddy.div.parentNode, "scripts").spr;
      if (spr && spr.div.parentNode) {
        var action = {
          action: "scripts",
          where: spr.div.parentNode.owner.id,
          who: spr.id
        };
        if (ba.argValue != ba.oldvalue) {
          _ScratchJr.storyStart("ScratchJr.numEditDone");
          Undo.record(action);
        }
      }
    }
  }
  static resetScroll() {
    var delta2 = activeFocus.delta;
    if (delta2 < 0) {
      var look = _ScratchJr.getActiveScript();
      var transition = {
        duration: 0.5,
        transition: "ease-out",
        style: {
          left: look.left - delta2 + "px"
        },
        onComplete: function() {
          ScriptsPane.scroll.refresh();
        }
      };
      CSSTransition3D(look, transition);
    }
  }
  static validate(str, name2) {
    var str2 = str.replace(/\s*/g, "");
    if (str2.length == 0) {
      return name2;
    }
    return str;
  }
};
window.ScratchJr = ScratchJr;

// src/app/src/editor/engine/Stage.ts
var namedForms4 = document.forms;
var Stage = class _Stage {
  currentPage;
  div;
  pages;
  pagesdiv;
  width;
  height;
  stageScale;
  currentZoom;
  initialPoint;
  deltaPoint;
  constructor(div) {
    this.currentPage = null;
    this.div = newHTML("div", "stage", div);
    this.div.setAttribute("id", "stage");
    this.div.style.webkitTextSizeAdjust = "100%";
    this.width = 480;
    this.height = 360;
    this.setStageScaleAndPosition(scaleMultiplier, 46, 74);
    this.pages = [];
    this.pagesdiv = newDiv(this.div, 0, 0, 480, 360, {
      position: "absolute"
    });
    var me = this;
    this.div.onmousedown = function(evt) {
      me.mouseDown(evt);
    };
    this.div.owner = this;
    this.currentZoom = 1;
    this.initialPoint = {
      x: 0,
      y: 0
    };
    this.deltaPoint = {
      x: 0,
      y: 0
    };
  }
  setStageScaleAndPosition(scale, x, y) {
    this.stageScale = scale;
    setProps(gn("stage").style, {
      webkitTransform: "translate(" + -this.width / 2 + "px, " + -this.height / 2 + "px) scale(" + scale + ") translate(" + (this.width / 2 + x) + "px, " + (this.height / 2 + y) + "px)"
    });
  }
  getPagesID() {
    var res = [];
    for (var i = 0; i < this.pages.length; i++) {
      res.push(this.pages[i].id);
    }
    return res;
  }
  getPage(id) {
    for (var i = 0; i < this.pages.length; i++) {
      if (this.pages[i].id == id) {
        return this.pages[i];
      }
    }
    return this.pages[0];
  }
  resetPage(obj) {
    var page = obj.div;
    for (var i = 0; i < page.childElementCount; i++) {
      var spr = page.childNodes[i].owner;
      if (!spr) {
        continue;
      }
      if (spr.type == "sprite") {
        spr.goHome();
      }
    }
  }
  resetPages() {
    for (var i = 0; i < enginePorts().getStage().pages.length; i++) {
      _Stage.prototype.resetPage(enginePorts().getStage().pages[i]);
    }
  }
  //goto page
  gotoPage(n) {
    if (n < 1) {
      return;
    }
    if (n > this.pages.length) {
      return;
    }
    if (Events.dragthumbnail && Events.dragthumbnail.owner) {
      return;
    }
    this.setPage(this.pages[n - 1], true);
  }
  setPage(page, isOn) {
    enginePorts().stopStrips();
    var sc = enginePorts().getSprite() ? gn(enginePorts().getStage().currentPage.currentSpriteName + "_scripts") : void 0;
    if (sc) {
      const scriptsOwner = getModelRefAs(sc, "scripts");
      scriptsOwner.deactivate();
    }
    this.currentPage.div.style.visibility = "hidden";
    this.currentPage.setPageSprites("hidden");
    this.currentPage = page;
    this.currentPage.div.style.visibility = "visible";
    this.currentPage.setPageSprites("visible");
    enginePorts().thumbsUpdateSprites();
    enginePorts().thumbsUpdatePages();
    var spr = enginePorts().getSprite();
    if (spr) {
      spr.activate();
    }
    if (isOn) {
      this.loadPageThreads();
    }
  }
  loadPageThreads() {
    enginePorts().blur();
    var page = this.currentPage;
    for (var i = 0; i < page.div.childElementCount; i++) {
      var spr = page.div.childNodes[i].owner;
      if (!spr) {
        continue;
      }
      spr.goHome();
      var sc = gn(spr.id + "_scripts");
      if (!sc) {
        continue;
      }
      const scriptsOwner = getModelRefAs(sc, "scripts");
      var topblocks = scriptsOwner.getBlocksType(["onflag", "ontouch"]);
      for (var j = 0; j < topblocks.length; j++) {
        var b = topblocks[j];
        enginePorts().getRuntime().addRunScript(spr, b);
      }
    }
  }
  //Copy Sprite
  /////////////////////////////////'
  copySprite(el, thumb) {
    ScratchAudio.sndFX("copy.wav");
    enginePorts().thumbsOverpage(thumb);
    var data = enginePorts().projectEncodeSprite(el.owner);
    if (gn(thumb.owner).owner == this.currentPage) {
      data.xcoor = Number(data.xcoor) + 10;
      data.ycoor = Number(data.ycoor) + 10;
      data.homex = data.xcoor;
      data.homey = data.ycoor;
    }
    var a = data.id.split(" ");
    if (Number(a[a.length - 1]).toString() != "NaN") {
      a.pop();
    }
    var page = gn(thumb.owner).owner;
    var name2 = getIdFor(a.join(" "));
    data.id = name2;
    var stg = this;
    var whenDone = function(spr) {
      if (spr.page.id == enginePorts().getStage().currentPage.id) {
        spr.div.style.visibility = "visible";
      }
      if (!page.currentSpriteName) {
        page.currentSpriteName = spr.id;
      }
      enginePorts().thumbsUpdateSprites();
      enginePorts().thumbsUpdatePages();
      const ownerPage = gn(thumb.owner).owner;
      enginePorts().undoRecord({
        action: "copy",
        who: name2,
        where: ownerPage.id
      });
      enginePorts().storyStart("Stage.prototype.copySprite");
    };
    enginePorts().projectRecreateObject(page, name2, data, whenDone, page.id == stg.currentPage.id);
  }
  //Delete page
  deletePage(str, data) {
    enginePorts().storyStart("Stage.prototype.deletePage");
    var pageid2 = getIdFor("page");
    var sprAttr = enginePorts().uiMascotData();
    var newp = {};
    var catid = sprAttr.id;
    newp.sprites = [catid];
    newp.num = 1;
    newp.lastSprite = catid;
    newp[catid] = sprAttr;
    newp.layers = [catid];
    var page = gn(str).owner;
    var indx = this.getPagesID().indexOf(str);
    if (indx < 0) {
      return;
    }
    var form = namedForms4.activetextbox;
    var cnv = form.textsprite;
    if (cnv && gn(cnv.id)) {
      enginePorts().blur();
    }
    this.removePageBlocks(str);
    this.pages.splice(indx, 1);
    if (!data) {
      ScratchAudio.sndFX("cut.wav");
    }
    this.removePage(page);
    if (this.pages.length == 0) {
      var p = new Page(pageid2, newp, refreshPage);
      sprAttr.page = p;
    } else {
      if (str == this.currentPage.id) {
        this.setViewPage(this.pages[0]);
      }
      enginePorts().thumbsUpdateSprites();
      enginePorts().thumbsUpdatePages();
      if (!data) {
        enginePorts().undoRecord({
          action: "deletepage",
          where: str,
          who: str
        });
      }
    }
    function refreshPage() {
      enginePorts().getStage().setViewPage(enginePorts().getStage().currentPage);
      enginePorts().thumbsUpdateSprites();
      enginePorts().thumbsUpdatePages();
      if (!data) {
        enginePorts().undoRecord({
          action: "deletepage",
          where: str,
          who: str
        });
      }
    }
  }
  setViewPage(page) {
    this.currentPage = page;
    this.currentPage.div.style.visibility = "visible";
    this.currentPage.setPageSprites("visible");
  }
  removePageBlocks(str) {
    var indx = this.getPagesID().indexOf(str);
    for (var n = 0; n < this.pages.length; n++) {
      var page = this.pages[n];
      for (var i = 0; i < page.div.childElementCount; i++) {
        var spr = page.div.childNodes[i].owner;
        if (!spr) {
          continue;
        }
        var sc = gn(spr.id + "_scripts");
        if (!sc) {
          continue;
        }
        const scriptsOwner = getModelRefAs(sc, "scripts");
        var gotoblocks = scriptsOwner.getBlocksType(["gotopage"]);
        for (var j = 0; j < gotoblocks.length; j++) {
          var b = gotoblocks[j];
          var pageindex = b.getArgValue() - 1;
          if (this.pages[pageindex].id == str) {
            var prev = b.prev;
            b.detachBlock();
            b.div.parentNode.removeChild(b.div);
            if (prev && prev.aStart) {
              prev.div.parentNode.removeChild(prev.div);
            }
          } else if (b.getArgValue() - 1 > indx) {
            b.arg.argValue -= 1;
            this.pages[pageindex].num = b.arg.argValue;
            b.arg.updateIcon();
          }
        }
      }
    }
  }
  //Events MouseDown
  mouseDown(e) {
    if (enginePorts().isOnHold()) {
      return;
    }
    e.preventDefault();
    enginePorts().blur();
    if (!this.currentPage) {
      return;
    }
    if (namedForms4.activetextbox.textsprite) {
      return;
    }
    var pt = this.getStagePt(e);
    setCanvasSize(enginePorts().getWorkingCanvas(), 480, 360);
    var ctx = enginePorts().getWorkingCanvas().getContext("2d");
    const targetEl = e.target;
    var target3 = targetEl.nodeName == "CANVAS" ? this.checkShaking(pt, targetEl) : targetEl;
    const shaking3 = enginePorts().getShaking();
    if (shaking3 && target3.id == "deletesprite") {
      this.removeSprite(shaking3.owner);
      return;
    }
    ctx.clearRect(0, 0, 480, 360);
    var hitobj = this.whoIsIt(ctx, pt);
    if (shaking3 && hitobj && hitobj.id == shaking3.id) {
      var sprname = shaking3.id;
      const sprnameOwner = gn(sprname).owner;
      if (pt.x - sprnameOwner.screenLeft() < 45 && pt.y - sprnameOwner.screenTop() < 45) {
        this.removeSprite(shaking3.owner);
        return;
      }
    }
    if (!hitobj) {
      enginePorts().clearSelection();
      return;
    }
    if (enginePorts().getShaking()) {
      enginePorts().clearSelection();
    } else {
      this.mouseDownOnSprite(hitobj, pt);
    }
  }
  checkShaking(pt, target3) {
    if (!enginePorts().getShaking()) {
      return target3;
    }
    var dx = globalx(gn("deletesprite")) - globalx(enginePorts().getStage().pagesdiv);
    var dy = globaly(gn("deletesprite")) - globaly(enginePorts().getStage().pagesdiv);
    var w = gn("deletesprite").offsetWidth;
    var h = gn("deletesprite").offsetHeight;
    var rect = new Rectangle(dx, dy, w, h);
    return rect.hitRect(pt) ? gn("deletesprite") : target3;
  }
  mouseDownOnSprite(spr, pt) {
    this.initialPoint = {
      x: pt.x,
      y: pt.y
    };
    Events.dragthumbnail = spr.div;
    Events.clearEvents();
    if (!enginePorts().isInFullscreen() && enginePorts().isEditable()) {
      Events.holdit(spr.div, this.startShaking);
    }
    this.setEvents();
  }
  whoIsIt(ctx, pt) {
    var page = this.currentPage.div;
    var spr;
    var pixel;
    for (var i = page.childElementCount - 1; i > -1; i--) {
      spr = page.childNodes[i].owner;
      if (!spr) {
        continue;
      }
      if (!spr.shown) {
        continue;
      }
      spr.stamp(ctx);
      pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      if (pixel[3] != 0) {
        return spr;
      }
    }
    var fuzzy = 5;
    ctx.clearRect(0, 0, 480, 360);
    for (var j = page.childElementCount - 1; j > -1; j--) {
      spr = page.childNodes[j].owner;
      if (!spr) {
        continue;
      }
      if (!spr.shown) {
        continue;
      }
      spr.stamp(ctx);
      spr.stamp(ctx, fuzzy, 0);
      spr.stamp(ctx, 0, fuzzy);
      spr.stamp(ctx, -fuzzy, 0);
      spr.stamp(ctx, 0, -fuzzy);
      pixel = ctx.getImageData(pt.x, pt.y, 1, 1).data;
      if (pixel[3] != 0) {
        return spr;
      }
    }
    return void 0;
  }
  getStagePt(evt) {
    var pt = Events.getTargetPoint(evt);
    var mc = this.div;
    var dx = globalx(mc);
    var dy = globaly(mc);
    pt.x -= dx;
    pt.y -= dy;
    pt.x /= this.stageScale;
    pt.y /= this.stageScale;
    return pt;
  }
  setEvents() {
    var me = this;
    window.onmousemove = function(evt) {
      me.mouseMove(evt);
    };
    window.onmouseup = function(evt) {
      me.mouseUp(evt);
    };
  }
  startShaking(b) {
    if (!b.owner) {
      return;
    }
    Events.clearEvents();
    enginePorts().setShaking(b);
    enginePorts().setStopShaking(() => enginePorts().getStage().stopShaking(enginePorts().getShaking()));
    b.owner.startShaking();
  }
  stopShaking(b) {
    if (!b.owner) {
      return;
    }
    b.owner.stopShaking();
    enginePorts().setShaking(void 0);
    enginePorts().setStopShaking(void 0);
  }
  startSpriteDrag(e) {
    var spr = Events.dragthumbnail.owner;
    spr.threads = enginePorts().getRuntime().removeRunScript(spr);
    this.currentPage.div.appendChild(Events.dragthumbnail);
    this.deltaPoint = {
      x: this.initialPoint.x,
      y: this.initialPoint.y
    };
    Events.dragged = true;
    enginePorts().markChanged();
  }
  mouseMove(e) {
    if (!Events.dragthumbnail) {
      return;
    }
    var pt = this.getStagePt(e);
    var delta2 = Vector.diff(pt, this.initialPoint);
    var dist = enginePorts().isInFullscreen() ? 15 : 5;
    if (!Events.dragged && Vector.len(delta2) > dist) {
      this.startSpriteDrag(e);
    }
    if (!Events.dragged) {
      return;
    }
    if (Events.timeoutEvent) {
      clearTimeout(Events.timeoutEvent);
    }
    Events.timeoutEvent = void 0;
    var spr = Events.dragthumbnail.owner;
    delta2 = this.wrapDelta(spr, Vector.diff(pt, this.deltaPoint));
    spr.xcoor += delta2.x;
    spr.ycoor += delta2.y;
    spr.render();
    this.deltaPoint = {
      x: pt.x,
      y: pt.y
    };
  }
  wrapDelta(spr, delta2) {
    if (spr.type == "text") {
      return this.wrapText(spr, delta2);
    } else {
      return this.wrapChar(spr, delta2);
    }
  }
  wrapChar(spr, delta2) {
    if (delta2.x + spr.xcoor < 0) {
      delta2.x -= spr.xcoor + delta2.x;
    }
    if (delta2.y + spr.ycoor < 0) {
      delta2.y -= spr.ycoor + delta2.y;
    }
    if (delta2.x + spr.xcoor >= 480) {
      delta2.x += 479 - (spr.xcoor + delta2.x);
    }
    if (delta2.y + spr.ycoor >= 360) {
      delta2.y += 359 - (spr.ycoor + delta2.y);
    }
    return delta2;
  }
  wrapText(spr, delta2) {
    var max = spr.cx > 480 ? spr.cx : 480;
    var min = spr.cx > 480 ? 480 - spr.cx : 0;
    if (delta2.x + spr.xcoor <= min) {
      delta2.x -= spr.xcoor + delta2.x - min;
    }
    if (delta2.y + spr.ycoor < 0) {
      delta2.y -= spr.ycoor + delta2.y;
    }
    if (delta2.x + spr.xcoor > max) {
      delta2.x += max - 1 - (spr.xcoor + delta2.x);
    }
    if (delta2.y + spr.ycoor >= 360) {
      delta2.y += 359 - (spr.ycoor + delta2.y);
    }
    return delta2;
  }
  mouseUp(e) {
    var spr = Events.dragthumbnail.owner;
    if (Events.timeoutEvent) {
      clearTimeout(Events.timeoutEvent);
    }
    Events.timeoutEvent = void 0;
    if (!Events.dragged) {
      this.clickOnElement(e, Events.dragthumbnail);
    } else {
      this.moveElementBy(spr);
      if (spr.type == "sprite") {
        var rt = enginePorts().getRuntime();
        rt.threadsRunning = rt.threadsRunning.concat(spr.threads);
        enginePorts().startCurrentPageStrips(["ontouch"]);
      }
    }
    Events.clearEvents();
    Events.dragged = false;
    Events.dragthumbnail = null;
  }
  moveElementBy(spr) {
    if (!enginePorts().isInFullscreen()) {
      spr.homex = spr.xcoor;
      spr.homey = spr.ycoor;
      spr.homeflip = spr.flip;
    }
    enginePorts().thumbsUpdatePages();
  }
  clickOnSprite(e, spr) {
    e.preventDefault();
    enginePorts().clearSelection();
    enginePorts().startScriptsFor(spr, ["onclick"]);
    enginePorts().startCurrentPageStrips(["ontouch"]);
  }
  //Delete Sprite
  /////////////////////////////////'
  removeSprite(sprite) {
    enginePorts().setShaking(void 0);
    enginePorts().setStopShaking(void 0);
    ScratchAudio.sndFX("cut.wav");
    if (sprite.type == "text") {
      sprite.deleteText(true);
    } else {
      this.removeCharacter(sprite);
    }
    this.currentPage.updateThumb();
    this.updatePageBlocks();
  }
  removeCharacter(spr) {
    enginePorts().getRuntime().stopThreadSprite(spr);
    this.removeFromPage(spr);
    enginePorts().undoRecord({
      action: "deletesprite",
      who: spr.id,
      where: enginePorts().getStage().currentPage.id
    });
    enginePorts().storyStart("Stage.prototype.removeCharacter");
    enginePorts().thumbsUpdateSprites();
  }
  updatePageBlocks() {
    for (var i = 0; i < enginePorts().getStage().pages.length; i++) {
      var page = enginePorts().getStage().pages[i];
      enginePorts().scriptsPaneUpdateScriptsPageBlocks(JSON.parse(page.sprites));
    }
  }
  removeFromPage(spr) {
    var id = spr.id;
    var sc = gn(id + "_scripts");
    var page = this.currentPage;
    var list = JSON.parse(page.sprites);
    var n = list.indexOf(id);
    if (n < 0) {
      return;
    }
    var th = spr.thumbnail;
    var sprite = enginePorts().getSprite();
    list.splice(n, 1);
    spr.div.parentNode.removeChild(spr.div);
    if (sc) {
      sc.parentNode.removeChild(sc);
    }
    page.sprites = JSON.stringify(list);
    th.parentNode.removeChild(th);
    if (sprite && sprite.id == spr.id) {
      var sprites = page.getSprites();
      page.setCurrentSprite(sprites.length > 0 ? gn(sprites[0]).owner : void 0);
    }
  }
  renumberPageBlocks(list) {
    var pages = this.getPagesID();
    for (var n = 0; n < this.pages.length; n++) {
      var page = this.pages[n];
      for (var i = 0; i < page.div.childElementCount; i++) {
        var spr = page.div.childNodes[i].owner;
        if (!spr) {
          continue;
        }
        var sc = gn(spr.id + "_scripts");
        if (!sc) {
          continue;
        }
        const scriptsOwner = getModelRefAs(sc, "scripts");
        var gotoblocks = scriptsOwner.getBlocksType(["gotopage"]);
        for (var j = 0; j < gotoblocks.length; j++) {
          var b = gotoblocks[j];
          var indx = b.getArgValue() - 1;
          if (indx < 0 || indx >= list.length) continue;
          b.arg.argValue = pages.indexOf(list[indx]) + 1;
          b.updateBlock();
        }
      }
    }
  }
  clickOnElement(e, spr) {
    const owner = spr.owner;
    if (owner.type == "text") {
      if (!enginePorts().isInFullscreen()) {
        owner.clickOnText(e);
      }
    } else if (owner.type == "sprite") {
      this.clickOnSprite(e, owner);
    }
  }
  //Stage clear
  ///////////////////////////////////////
  clear() {
    for (var i = 0; i < this.pages.length; i++) {
      this.removePage(this.pages[i]);
    }
    this.pages = [];
    while (this.pagesdiv.childElementCount > 0) {
      this.pagesdiv.removeChild(this.pagesdiv.childNodes[0]);
    }
  }
  removePage(p) {
    var list = JSON.parse(p.sprites);
    for (var j = 0; j < list.length; j++) {
      var name2 = list[j];
      var sprite = gn(name2);
      var sc = gn(name2 + "_scripts");
      if (sc) {
        sc.parentNode.removeChild(sc);
      }
      sprite.parentNode.removeChild(sprite);
    }
    p.div.parentNode.removeChild(p.div);
  }
  //Debugging hit masks
  ///////////////////////////
  sd() {
    var stg = gn("stage");
    var mask = newDiv(gn("stageframe"), stg.offsetLeft + 1, stg.offsetTop + 1, 482, 362, {
      position: "absolute",
      zIndex: enginePorts().getLayerTop() + 20,
      visibility: "hidden"
    });
    mask.setAttribute("id", "pagemask");
    mask.appendChild(enginePorts().getWorkingCanvas());
  }
  on() {
    gn("pagemask").style.visibility = "visible";
  }
  off() {
    gn("pagemask").style.visibility = "hidden";
  }
  sm(spr) {
    var stg = gn("stage");
    var w = spr.outline.width;
    var h = spr.outline.height;
    var mask = newDiv(gn("stageframe"), stg.offsetLeft + 1, stg.offsetTop + 1, w, h, {
      position: "absolute",
      zIndex: enginePorts().getLayerTop() + 20,
      visibility: "hidden"
    });
    mask.setAttribute("id", "spritemask");
    mask.appendChild(spr.outline);
  }
  son() {
    gn("spritemask").style.visibility = "visible";
  }
  soff() {
    gn("spritemask").style.visibility = "hidden";
  }
};

// src/app/src/editor/ui/UI.ts
var namedForms5 = document.forms;
var projectNameTextInput = null;
var info = null;
var okclicky = null;
var infoBoxOpen = false;
var UI = class _UI {
  // Static DOM handles
  static nextpage;
  static prevpage;
  static get infoBoxOpen() {
    return infoBoxOpen;
  }
  static layout() {
    _UI.topSection();
    _UI.middleSection();
    _UI.BottomSection();
    _UI.fullscreenControls();
    _UI.createFormForText(frame);
    ScratchJr.setupKeypad();
    ScratchJr.setupEditableField();
    _UI.aspectRatioAdjustment();
  }
  /** Clear any previously applied aspect-ratio tweaks so they can be recalculated. */
  static clearAspectRatioAdjustments() {
    var library = gn("library");
    var pages = gn("pages");
    var topsection = gn("topsection");
    var pagecc = gn("pagecc");
    var scripts = gn("scripts");
    var stageframe = gn("stageframe");
    if (library) {
      library.style.transform = "";
    }
    if (pages) {
      pages.style.transform = "";
      pages.style.width = "";
    }
    if (topsection) {
      topsection.style.height = "";
    }
    if (pagecc) {
      pagecc.style.height = "";
      pagecc.style.width = "";
    }
    if (scripts) {
      scripts.style.height = "";
    }
    var leftPanel = library?.parentNode;
    var rightPanel = pages?.parentNode;
    if (leftPanel) {
      leftPanel.style.height = "";
    }
    if (rightPanel) {
      rightPanel.style.height = "";
      rightPanel.style.width = "";
      rightPanel.style.top = "";
    }
    if (stageframe) {
      stageframe.style.height = "";
    }
  }
  /** Shift the library and pages panels horizontally to balance gaps around the stage. */
  static balanceHorizontal(docWidth) {
    var library = gn("library");
    var pages = gn("pages");
    var stage2 = gn("stage");
    var stageBox = stage2.getBoundingClientRect();
    var libraryBox = library.getBoundingClientRect();
    var pagesBox = pages.getBoundingClientRect();
    var leftGap = stageBox.left - (libraryBox.left + libraryBox.width);
    var rightGap = pagesBox.left - (stageBox.left + stageBox.width);
    var desiredGap = Math.min(130, Math.round(docWidth * 0.07));
    var libraryShift = Math.min(Math.max(0, Math.round(leftGap - desiredGap)), Math.round(docWidth * 0.16));
    var pagesShift = Math.min(Math.max(0, Math.round(rightGap - desiredGap)), Math.round(docWidth * 0.1));
    if (libraryShift > 0) {
      library.style.transform = "translateX(" + libraryShift + "px)";
    }
    if (pagesShift > 0) {
      pages.style.transform = "translateX(-" + pagesShift + "px)";
    }
  }
  /** Size the stage, panels, and scripts area vertically. */
  static balanceVertical(docWidth, docHeight) {
    var topsection = gn("topsection");
    var pagecc = gn("pagecc");
    var scripts = gn("scripts");
    var stageframe = gn("stageframe");
    var pages = gn("pages");
    var library = gn("library");
    var blockspalette = gn("blockspalette");
    var leftPanel = library.parentNode;
    var rightPanel = pages.parentNode;
    var minStageHeight = 434;
    var desiredScriptsHeight = Math.max(260, Math.round(docHeight * 0.3));
    var maxTopHeight = Math.max(
      minStageHeight,
      docHeight - blockspalette.offsetHeight - desiredScriptsHeight
    );
    var targetTopHeight = Math.min(
      Math.max(minStageHeight, Math.round(docHeight * 0.57)),
      maxTopHeight
    );
    if (topsection) {
      topsection.style.height = targetTopHeight + "px";
    }
    if (leftPanel) {
      leftPanel.style.height = targetTopHeight + "px";
    }
    var rightPanelTop = Math.round(12 * scaleMultiplier);
    if (rightPanel) {
      rightPanel.style.top = rightPanelTop + "px";
      rightPanel.style.height = Math.max(200, targetTopHeight - rightPanelTop) + "px";
    }
    if (stageframe) {
      stageframe.style.height = targetTopHeight + "px";
    }
    if (pagecc) {
      var pagesVisibleHeight = Math.max(0, pages.offsetHeight - pagecc.offsetTop - Math.round(12 * scaleMultiplier));
      pagecc.style.height = pagesVisibleHeight + "px";
    }
    if (scripts) {
      var scriptsHeight = Math.max(220, docHeight - scripts.offsetTop);
      if (ScriptsPane.scroll) {
        ScriptsPane.resizeScripts(scriptsHeight);
        if (ScratchJr.stage && ScratchJr.stage.currentPage) {
          ScriptsPane.scroll.update();
        }
      }
    }
  }
  /** Tweak some elements depending on aspect ratio */
  static aspectRatioAdjustment() {
    var library = gn("library");
    var pages = gn("pages");
    var stage2 = gn("stage");
    if (!library || !pages || !stage2) {
      return;
    }
    _UI.clearAspectRatioAdjustments();
    var docWidth = getDocumentWidth();
    var docHeight = getDocumentHeight();
    if (docWidth / docHeight <= 1.45) {
      return;
    }
    var newRightWidth = Math.round(docHeight * 0.225);
    var rightPanel = pages.parentNode;
    if (rightPanel) {
      rightPanel.style.width = newRightWidth + "px";
    }
    pages.style.width = newRightWidth + "px";
    var pagecc = gn("pagecc");
    if (pagecc) {
      pagecc.style.width = newRightWidth + "px";
    }
    _UI.balanceHorizontal(docWidth);
    _UI.balanceVertical(docWidth, docHeight);
  }
  static topSection() {
    var div = newHTML("div", "topsection", frame);
    div.setAttribute("id", "topsection");
    if (ScratchJr.isEditable()) {
      _UI.addProjectInfo();
    }
    _UI.leftPanel(div);
    _UI.stageArea(div);
    _UI.rightPanel(div);
  }
  static leftPanel(div) {
    var sl = newHTML("div", "leftpanel", div);
    var flip = newHTML("div", "flipme", sl);
    flip.setAttribute("id", "flip");
    flip.onmousedown = function(evt) {
      ScratchJr.saveAndFlip(evt);
    };
    _UI.layoutLibrary(sl);
  }
  static middleSection() {
    var bp = newHTML("div", "blockspalette", frame);
    bp.setAttribute("id", "blockspalette");
    Palette.setup(bp);
    Undo.setup(bp);
  }
  static BottomSection() {
    ScriptsPane.createScripts(frame);
  }
  static addProjectInfo() {
    info = newHTML("div", "info", frame);
    info.setAttribute("id", "projectinfo");
    var infobox = newHTML("div", "infobox fade", frame);
    infobox.setAttribute("id", "infobox");
    okclicky = newHTML("div", "paintdone", infobox);
    newHTML("div", "infoboxlogo", infobox);
    var nameField = _UI.addEditableName(infobox);
    var staticinfo = newHTML("div", "fixedinfo", infobox);
    var author = newHTML("div", "infolabel", staticinfo);
    author.setAttribute("id", "deviceName");
    if (window.Settings.shareEnabled) {
      var shareButtons = newHTML("div", "infoboxShareButtons", infobox);
      var shareEmail = newHTML("div", "infoboxShareButton", shareButtons);
      shareEmail.id = "infoboxShareButtonEmail";
      shareEmail.textContent = Localization.localize("SHARING_BY_EMAIL");
      if (isAndroid) {
        shareEmail.style.margin = "auto";
      } else {
        shareEmail.style.float = "left";
      }
      if (!isAndroid) {
        var shareAirdrop = newHTML("div", "infoboxShareButton", shareButtons);
        shareAirdrop.id = "infoboxShareButtonAirdrop";
        shareAirdrop.textContent = Localization.localize("SHARING_BY_AIRDROP");
        shareAirdrop.style.float = "right";
        shareAirdrop.onmousedown = function(e) {
          _UI.parentalGate(e, function(e2) {
            _UI.infoDoShare(e2, nameField, shareLoadingGif, 1);
          });
        };
      }
      iOS.deviceName(function(name2) {
        gn("deviceName").textContent = name2;
      });
      var shareLoadingGif = newHTML("img", "infoboxShareLoading", shareButtons);
      shareLoadingGif.src = "./assets/ui/loader.png";
      shareEmail.onmousedown = function(e) {
        _UI.parentalGate(e, function(e2) {
          _UI.infoDoShare(e2, nameField, shareLoadingGif, 0);
        });
      };
    }
    info.onmousedown = _UI.showInfoBox;
    okclicky.onmousedown = function(evt) {
      _UI.hideInfoBox(evt, nameField);
    };
  }
  static parentalGate(evt, callback) {
    ScratchAudio.sndFX("tap.wav");
    var pgFrame = newHTML("div", "parentalgate", gn("frame"));
    var pgCloseButton = newHTML("div", "paintdone", pgFrame);
    pgCloseButton.onmousedown = function() {
      parentalGateClose(false);
    };
    var pgProblem = newHTML("div", "parentalgateproblem", pgFrame);
    var pgChoiceA = newHTML("div", "parentalgatechoice", pgFrame);
    var pgChoiceB = newHTML("div", "parentalgatechoice", pgFrame);
    var pgChoiceC = newHTML("div", "parentalgatechoice", pgFrame);
    var problems = [
      // Problem, Choice A, Choice B, Choice C, Correct choice #
      ["30 + 7", "37", "9", "28", 0],
      ["22 + 3", "18", "25", "3", 1],
      ["91 + 1", "32", "74", "92", 2],
      ["30 + 4", "34", "59", "12", 0],
      ["48 + 1", "9", "49", "20", 1],
      ["32 + 6", "23", "99", "38", 2],
      ["53 + 4", "57", "12", "90", 0],
      ["26 + 3", "17", "29", "8", 1],
      ["71 + 1", "58", "14", "72", 2],
      ["11 + 8", "19", "23", "67", 0]
    ];
    var problemChoice = Math.floor(Math.random() * problems.length);
    var theProblem = problems[problemChoice];
    pgProblem.textContent = theProblem[0];
    pgChoiceA.textContent = theProblem[1];
    pgChoiceB.textContent = theProblem[2];
    pgChoiceC.textContent = theProblem[3];
    pgChoiceA.onmousedown = function() {
      parentalGateClose(theProblem[4] == 0);
    };
    pgChoiceB.onmousedown = function() {
      parentalGateClose(theProblem[4] == 1);
    };
    pgChoiceC.onmousedown = function() {
      parentalGateClose(theProblem[4] == 2);
    };
    var pgExplain = newHTML("div", "parentalgateexplain", pgFrame);
    pgExplain.textContent = Localization.localize("PARENTAL_GATE_EXPLANATION");
    function parentalGateClose(success) {
      ScratchAudio.sndFX("exittap.wav");
      gn("frame").removeChild(pgFrame);
      if (success) {
        callback(evt);
      }
    }
  }
  /*
  +    Save the project, including the new name, then package the project and send native-side for sharing
  +
  +    evt: reference to touch event triggering share
  +    nameField: reference to the project rename field
  +    shareLoadingGif: reference to HTML element to show during packaging/loading and hide for completion
  +    shareType: which dialog to show - 0 for email; 1 for airdrop
  + */
  static infoDoShare(evt, nameField, shareLoadingGif, shareType) {
    ScratchAudio.sndFX("tap.wav");
    shareLoadingGif.style.visibility = "visible";
    nameField.blur();
    setTimeout(saveAndShare, 500);
    iOS.analyticsEvent("editor", "share_button", shareType == 0 ? "email" : "airdrop");
    function saveAndShare() {
      _UI.handleTextFieldSave(true);
      ScratchJr.onHold = true;
      ScratchJr.stopStripsFromTop(evt);
      Project.prepareToSave(ScratchJr.currentProject, function() {
        Alert.close();
        IO.zipProject(ScratchJr.currentProject, function(contents) {
          ScratchJr.onHold = false;
          var emailSubject = Localization.localize("SHARING_EMAIL_SUBJECT", {
            PROJECT_NAME: IO.shareName
          });
          iOS.sendSjrToShareDialog(IO.zipFileName, emailSubject, Localization.localize("SHARING_EMAIL_TEXT"), shareType, contents);
          shareLoadingGif.style.visibility = "hidden";
        });
      });
    }
  }
  static addEditableName(p) {
    var pname = newHTML("form", "projectname", p);
    pname.name = "projectname";
    pname.id = "title";
    pname.onsubmit = function(evt) {
      submitChange(evt);
    };
    var ti = newHTML("input", "pnamefield", pname);
    projectNameTextInput = ti;
    ti.name = "myproject";
    ti.maxLength = 30;
    ti.onkeypress = null;
    ti.autocomplete = "off";
    ti.autocorrect = false;
    ti.onblur = null;
    ti.onfocus = function(e) {
      e.preventDefault();
      ti.oldvalue = ti.value;
      if (isAndroid) {
        AndroidInterface.scratchjr_setsoftkeyboardscrolllocation(
          ti.getBoundingClientRect().top * devicePixelRatio,
          ti.getBoundingClientRect().bottom * devicePixelRatio
        );
        AndroidInterface.scratchjr_forceShowKeyboard();
      }
    };
    ti.onkeypress = function(evt) {
      handleNamePress(evt);
    };
    function handleNamePress(e) {
      var key = e.keyCode || e.which;
      if (key == 13) {
        submitChange(e);
      }
    }
    function submitChange(e) {
      e.preventDefault();
      var input = e.target;
      input.blur();
    }
    return ti;
  }
  static handleTextFieldSave(dontHide) {
    if (ScratchJr.isEditable() && ScratchJr.editmode == "storyStarter" && !Project.error) {
      iOS.analyticsEvent("samples", "story_starter_edited", Project.metadata.name);
      var sampleName = Localization.localize("SAMPLE_" + Project.metadata.name);
      IO.uniqueProjectName({
        name: sampleName
      }, function(jsonData) {
        var newName = jsonData.name;
        Project.metadata.name = newName;
        IO.createProject({
          name: newName,
          version: ScratchJr.version,
          mtime: (/* @__PURE__ */ new Date()).getTime().toString()
        }, function(md5) {
          Project.metadata.id = md5;
          ScratchJr.currentProject = md5;
          ScratchJr.editmode = "edit";
          Project.metadata.gallery = "";
          _UI.finishTextFieldSave(dontHide);
        });
      });
    } else {
      _UI.finishTextFieldSave(dontHide);
    }
  }
  static finishTextFieldSave(dontHide) {
    var ti = projectNameTextInput;
    var pname = ti.value.length == 0 ? ti.oldvalue : ti.value.substring(0, ti.maxLength);
    if (Project.metadata.name != pname) {
      ScratchJr.storyStart("UI.handleTextFieldSave");
    }
    Project.metadata.name = pname;
    ScratchJr.changed = true;
    iOS.setfield(iOS.database, Project.metadata.id, "name", pname);
    if (!dontHide) {
      ScratchAudio.sndFX("exittap.wav");
      gn("infobox").className = "infobox fade";
    }
  }
  static showInfoBox(e) {
    infoBoxOpen = true;
    e.preventDefault();
    e.stopPropagation();
    if (Paint.saving) {
      return;
    }
    if (ScratchJr.onHold) {
      return;
    }
    setTimeout(function() {
      projectNameTextInput.onblur = function() {
        if (isAndroid) {
          AndroidInterface.scratchjr_forceHideKeyboard();
        }
      };
    }, 500);
    projectNameTextInput.onblur = function() {
      if (ScratchJr.isEditable()) {
        namedForms5.projectname.myproject.focus();
      }
    };
    info.onmousedown = null;
    ScratchJr.onBackButtonCallback.push(function() {
      var e2 = document.createEvent("TouchEvent");
      e2.initTouchEvent();
      e2.preventDefault();
      e2.stopPropagation();
      _UI.hideInfoBox(e2);
    });
    ScratchAudio.sndFX("entertap.wav");
    ScratchJr.stopStrips();
    if (!Project.metadata.ctime) {
      Project.metadata.mtime = (/* @__PURE__ */ new Date()).getTime();
      Project.metadata.ctime = _UI.formatTime((/* @__PURE__ */ new Date()).getTime());
    }
    if (ScratchJr.isEditable()) {
      namedForms5.projectname.myproject.value = Project.metadata.name;
    } else {
      gn("pname").textContent = String(Project.metadata.name);
    }
    gn("infobox").className = "infobox fade in";
    if (ScratchJr.isEditable()) {
      setTimeout(function() {
      }, 500);
    }
  }
  static formatTime(unixtime) {
    var date = new Date(unixtime);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
  }
  static hideInfoBox(e, dontHide) {
    e.preventDefault();
    e.stopPropagation();
    ScratchJr.onBackButtonCallback.pop();
    setTimeout(function() {
      info.onmousedown = _UI.showInfoBox;
    }, 500);
    if (ScratchJr.isEditable()) {
      namedForms5.projectname.myproject.blur();
      _UI.handleTextFieldSave();
    } else {
      ScratchAudio.sndFX("exittap.wav");
      gn("infobox").className = "infobox fade";
    }
    infoBoxOpen = false;
  }
  //////////////////////////////////////
  //   Library
  /////////////////////////////////////
  static layoutLibrary(sl) {
    var sprites = newHTML("div", "thumbpanel", sl);
    sprites.setAttribute("id", "library");
    var p = newHTML("div", "spritethumbs", sprites);
    p.onscroll = function() {
      _UI.updateSpriteScroll();
    };
    var div = newHTML("div", "spritecc", p);
    div.setAttribute("id", "spritecc");
    div.onmousedown = _UI.spriteThumbsActions;
    var sb = newHTML("div", "scrollbar", sprites);
    sb.setAttribute("id", "scrollbar");
    var sbthumb = newHTML("div", "sbthumb", sb);
    sbthumb.setAttribute("id", "sbthumb");
    if (ScratchJr.isEditable()) {
      var ns = newHTML("div", "addsprite", sprites);
      ns.onmousedown = _UI.addSprite;
    }
  }
  static mascotData(page) {
    var sprAttr = {
      flip: false,
      angle: 0,
      shown: true,
      type: "sprite",
      scale: 0.5,
      defaultScale: 0.5,
      speed: 2,
      dirx: 1,
      diry: 1,
      sounds: ["pop.mp3"],
      homex: 240,
      homey: 180,
      xcoor: 240,
      ycoor: 180,
      homeshown: true,
      homeflip: false,
      homescale: 0.5,
      scripts: []
    };
    sprAttr.page = page;
    sprAttr.md5 = ScratchJr.defaultSprite;
    var catkey = MediaLib.keys[sprAttr.md5].name;
    sprAttr.id = getIdFor(catkey);
    sprAttr.name = catkey;
    return sprAttr;
  }
  //////////////////////////////////////
  // Scrolling
  //////////////////////////////////////
  static needsScroll() {
    var sc = gn("spritecc");
    var p = sc.parentNode;
    if (sc.scrollHeight / p.offsetHeight == 1 || gn("spritecc").childElementCount == 0) {
      gn("scrollbar").setAttribute("class", "scrollbar off");
    } else {
      gn("scrollbar").setAttribute("class", "scrollbar on");
      _UI.updateSpriteScroll();
    }
  }
  static updateSpriteScroll() {
    var sc = gn("spritecc");
    var p = sc.parentNode;
    var dy = -p.scrollTop;
    var top = -dy / (sc.scrollHeight / p.offsetHeight);
    var size2 = p.offsetHeight / sc.scrollHeight * p.offsetHeight;
    var thumb = gn("sbthumb");
    thumb.style.height = size2 + "px";
    thumb.style.top = top + "px";
  }
  static spriteInView(spr) {
    var sc = gn("spritecc");
    var p = sc.parentNode;
    var achild = spr.thumbnail;
    if (!achild) {
      return;
    }
    var h = p.offsetHeight;
    var scroll2 = -p.scrollTop;
    var dy = -p.scrollTop;
    if (achild.offsetTop + achild.offsetHeight + scroll2 > h) {
      dy = h - (achild.offsetTop + achild.offsetHeight);
    }
    if (achild.offsetTop <= scroll2) {
      dy = achild.offsetTop + scroll2;
    }
    if (dy > 0) {
      dy = 0;
    }
    p.scrollTop = -dy;
    _UI.needsScroll();
  }
  static resetSpriteLibrary() {
    if (!ScratchJr.getSprite()) {
      return;
    }
    _UI.spriteInView(ScratchJr.getSprite());
  }
  ///////////////////////////////////
  // Sprite Thumbs Events
  //////////////////////////////////
  static spriteThumbsActions(e) {
    if (isTouch && e.touches && e.touches.length > 1) {
      return;
    }
    if (ScratchJr.onHold) {
      return;
    }
    var pt = Events.getTargetPoint(e);
    var t = e.target;
    e.preventDefault();
    e.stopPropagation();
    ScratchJr.blur();
    t.focus();
    if (t.className == "brush") {
      _UI.putInPaintEditor(e);
      return;
    }
    var tb = Thumbs.getType(t, "spritethumb");
    if (!tb) {
      if (ScratchJr.shaking) {
        ScratchJr.clearSelection();
      }
      return;
    }
    var x = localx(t, pt.x);
    if (tb && x < 70 && ScratchJr.isEditable()) {
      Thumbs.startDragThumb(e, tb);
    } else {
      _UI.startSpriteScroll(e, tb);
    }
  }
  static startSpriteScroll(e, tb) {
    if (ScratchJr.shaking) {
      ScratchJr.clearSelection();
    }
    if (!tb) {
      return;
    }
    if (gn("scrollbar").className == "scrollbar off") {
      Events.startDrag(e, tb, _UI.ignoreEvent, _UI.ignoreEvent, _UI.ignoreEvent, _UI.spriteClicked, ScratchJr.isEditable() ? Thumbs.startCharShaking : void 0);
    } else {
      Events.startDrag(e, tb, _UI.prepareToScroll, _UI.stopScroll, _UI.spriteScolling, _UI.spriteClicked, ScratchJr.isEditable() ? Thumbs.startCharShaking : void 0);
    }
  }
  static ignoreEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  static prepareToScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    _UI.spriteScolling(e, Events.dragthumbnail);
  }
  static stopScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    _UI.spriteScolling(e, Events.dragthumbnail);
  }
  static spriteScolling(e, c) {
    var pt = Events.getTargetPoint(e);
    var deltay = Events.dragmousey - pt.y;
    Events.dragmousey = pt.y;
    var sc = gn("spritecc");
    var p = sc.parentNode;
    var dy = -p.scrollTop;
    dy -= deltay;
    if (dy > 0) {
      dy = 0;
    }
    if (dy + sc.offsetHeight < p.offsetHeight) {
      dy = p.offsetHeight - sc.offsetHeight;
    }
    p.scrollTop = -dy;
    _UI.updateSpriteScroll();
  }
  static spriteClicked(e, el) {
    e.preventDefault();
    e.stopPropagation();
    var t = e.target;
    if (ScratchJr.isEditable() && ScratchJr.getSprite() && (t.className == "sname" && getModelRefAs(el, "spritethumb") == ScratchJr.getSprite().id || t.className == "brush")) {
      _UI.putInPaintEditor(e);
      return;
    }
    if (el.className.indexOf("shakeme") < 0) {
      el.setAttribute("class", "spritethumb on");
    }
    Thumbs.clickOnSprite(e, el);
  }
  static putInPaintEditor(e) {
    ScratchJr.unfocus(e);
    var s = ScratchJr.getSprite();
    if (!s) {
      return;
    }
    ScratchJr.stopStrips();
    Paint.open(false, s.md5, s.id, s.name, s.defaultScale, Math.round(s.w), Math.round(s.h));
  }
  ///////////////////////////////
  // Setup Stage Variables
  //////////////////////////////
  static stageArea(inner) {
    var outerDiv = newHTML("div", "centerpanel", inner);
    var div = newHTML("div", "stageframe", outerDiv);
    div.setAttribute("id", "stageframe");
    ScratchJr.stage = new Stage(div);
    Grid.init(div);
    if (ScratchJr.isEditable()) {
      _UI.creatTopBarClicky(div, "addtext", "addText", _UI.addText);
      _UI.creatTopBarClicky(div, "setbkg", "changeBkg", _UI.addBackground);
    }
    _UI.creatTopBarClicky(div, "grid", "gridToggle off", _UI.switchGrid);
    _UI.creatTopBarClicky(div, "go", "go on", _UI.toggleRun);
    _UI.creatTopBarClicky(div, "resetall", "resetall", _UI.resetAllSprites);
    _UI.creatTopBarClicky(div, "full", "fullscreen", ScratchJr.fullScreen);
    _UI.toggleGrid(true);
  }
  static resetAllSprites(e) {
    e.preventDefault();
    e.stopPropagation();
    if (ScratchJr.onHold) {
      return;
    }
    ScratchAudio.sndFX("tap.wav");
    if (!ScratchJr.runtime.inactive()) {
      ScratchJr.stopStripsFromTop(e);
    }
    ScratchJr.resetSprites();
  }
  static toggleRun(e) {
    var isOff = ScratchJr.runtime.inactive();
    if (isOff) {
      ScratchJr.runStrips(e);
    } else {
      ScratchJr.stopStripsFromTop(e);
    }
  }
  static switchGrid() {
    ScratchAudio.sndFX("tap.wav");
    _UI.toggleGrid(!Grid.hidden);
  }
  static toggleGrid(b) {
    Grid.hide(b);
    gn("grid").className = Grid.hidden ? "gridToggle off" : "gridToggle on";
  }
  static creatTopBarClicky(p, str, mstyle, fcn) {
    var toggle = newHTML("div", mstyle, p);
    toggle.onmousedown = fcn;
    toggle.setAttribute("id", str);
  }
  static fullscreenControls() {
    _UI.nextpage = newHTML("div", "nextpage off", frame);
    _UI.prevpage = newHTML("div", "nextpage off", frame);
    _UI.nextpage.onmousedown = _UI.nextPage;
    _UI.prevpage.onmousedown = _UI.prevPage;
  }
  static updatePageControls() {
    var n = ScratchJr.stage.pages.indexOf(ScratchJr.stage.currentPage);
    if (n == 0) {
      _UI.prevpage.setAttribute("class", "prevpage off");
    } else {
      _UI.prevpage.setAttribute("class", "prevpage on");
    }
    if (n == ScratchJr.stage.pages.length - 1) {
      _UI.nextpage.setAttribute("class", "nextpage off");
    } else {
      _UI.nextpage.setAttribute("class", "nextpage on");
    }
  }
  static nextPage(e) {
    e.preventDefault();
    e.stopPropagation();
    var n = ScratchJr.stage.pages.indexOf(ScratchJr.stage.currentPage);
    n++;
    if (n >= ScratchJr.stage.pages.length) {
      return;
    }
    ScratchJr.stage.setPage(ScratchJr.stage.pages[n], false);
  }
  static prevPage(e) {
    e.preventDefault();
    e.stopPropagation();
    var n = ScratchJr.stage.pages.indexOf(ScratchJr.stage.currentPage);
    if (n < 1) {
      return;
    }
    ScratchJr.stage.setPage(ScratchJr.stage.pages[n - 1], false);
  }
  static enterFullScreen() {
    var w = Math.min(getDocumentWidth(), frame.offsetWidth);
    var h = Math.max(getDocumentHeight(), frame.offsetHeight);
    frame.appendChild(gn("stage"));
    var list = ["go", "full"];
    for (var i = 0; i < list.length; i++) {
      gn(list[i]).className = gn(list[i]).className + " presentationmode";
      frame.appendChild(gn(list[i]));
    }
    const stageOwner = gn("stage").owner;
    var scale = Math.min((w - 136 * scaleMultiplier) / stageOwner.width, h / stageOwner.height);
    var dx = Math.floor((w - stageOwner.width * scale) / 2);
    var dy = Math.floor((h - stageOwner.height * scale) / 2);
    ScratchJr.stage.setStageScaleAndPosition(scale, dx / scale, dy / scale);
    stageOwner.currentZoom = Math.floor(scale * 100) / 100;
    gn("stage").style.webkitTextSizeAdjust = Math.floor(stageOwner.currentZoom * 100) + "%";
    document.body.parentNode.style.background = "black";
    gn("stage").setAttribute("class", "stage fullscreen");
    _UI.nextpage.setAttribute("class", "nextpage on");
  }
  static quitFullScreen() {
    var div = gn("stageframe");
    div.appendChild(gn("stage"));
    ScratchJr.stage.setStageScaleAndPosition(scaleMultiplier, 46, 74);
    gn("go").className = "go off nopresent";
    div.appendChild(gn("go"));
    gn("full").className = "fullscreen";
    div.appendChild(gn("full"));
    const stageOwner = gn("stage").owner;
    stageOwner.currentZoom = 1;
    gn("stage").style.webkitTextSizeAdjust = "100%";
    document.body.parentNode.style.background = "none";
    gn("stage").setAttribute("class", "stage normal");
    _UI.nextpage.setAttribute("class", "nextpage off");
    _UI.prevpage.setAttribute("class", "nextpage off");
    ScratchJr.stage.setViewPage(ScratchJr.stage.currentPage);
    Thumbs.updateSprites();
    Thumbs.updatePages();
  }
  //////////////////////////////////////
  //   Right panel
  /////////////////////////////////////
  static rightPanel(div) {
    var rp = newHTML("div", "rightpanel", div);
    var tb = newHTML("div", "pages", rp);
    tb.setAttribute("id", "pages");
    var ndiv = newHTML("div", "pagescc", tb);
    ndiv.setAttribute("id", "pagecc");
  }
  //////////////////////////////////////
  //   Tools
  /////////////////////////////////////
  static layoutToolbar(div) {
    var h = 56;
    var w = 66 * 2;
    var tb = newDiv(div, 220, 0, w, h, {
      position: "absolute"
    });
    tb.setAttribute("id", "toolbar");
    var addt = newHTML("div", "addText", tb);
    addt.onmousedown = _UI.addText;
    var changebkg = newHTML("div", "changeBkg", tb);
    changebkg.onmousedown = _UI.addBackground;
  }
  static addSprite(e) {
    if (ScratchJr.onHold) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var pt = Events.getTargetPoint(e);
    if (pt.x > globalx(e.target) + 167) {
      return;
    }
    ScratchAudio.sndFX("tap.wav");
    ScratchJr.stopStrips();
    ScratchJr.unfocus(e);
    if (Events.dragthumbnail) {
      Events.mouseUp(e);
    }
    Library.open("costumes");
  }
  static addBackground(e) {
    if (ScratchJr.onHold) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    ScratchJr.stopStrips();
    ScratchJr.unfocus(e);
    if (Events.dragthumbnail) {
      Events.mouseUp(e);
    }
    Library.open("backgrounds");
  }
  static addText(e) {
    if (ScratchJr.onHold) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (isAndroid) {
      if (gn("textbox").style.visibility === "visible") {
        return;
      }
    }
    ScratchJr.unfocus(e);
    ScratchJr.stage.currentPage.createText();
  }
  //////////////////////////////////
  // Key Handling in TextBox
  //////////////////////////////////
  static createFormForText(p) {
    var tf = newHTML("div", "pagetext off", p);
    tf.setAttribute("id", "textbox");
    if (isAndroid) {
      tf.onmousedown = function(e) {
        e.preventDefault();
      };
    }
    var activetb = newHTML("form", "pageform", tf);
    activetb.name = "activetextbox";
    activetb.id = "myform";
    activetb.textsprite = null;
    var field = newTextInput(activetb, "text");
    field.name = "typing";
    field.setAttribute("class", "edittext");
    field.maxLength = 50;
    field.onkeypress = null;
    field.autocomplete = "off";
    field.autocorrect = false;
    field.onblur = null;
    activetb.onsubmit = null;
    var ta = newHTML("div", "pagetextactions", tf);
    var clicky = newHTML("div", "fontsizeText off", ta);
    clicky.setAttribute("id", "fontsizebutton");
    clicky.onmousedown = _UI.openFontSizeMenu;
    var col = newHTML("div", "changecolorText off", ta);
    col.setAttribute("id", "fontcolorbutton");
    col.onmousedown = _UI.topLevelColor;
    _UI.createColorMenu(tf);
    _UI.createTextSizeMenu(tf);
  }
  static createColorMenu(div) {
    var swatchlist = BlockSpecs.fontcolors;
    var spal = newHTML("div", "textuicolormenu off", div);
    spal.setAttribute("id", "textcolormenu");
    for (var i = 0; i < swatchlist.length; i++) {
      var colour = newHTML("div", "textcolorbucket", spal);
      var sf = newHTML("div", "swatchframe", colour);
      var sc = newHTML("div", "swatchcolor", sf);
      sc.style.background = swatchlist[i];
      sf = newHTML("div", "splasharea off", colour);
      Paint.setSplashColor(sf, Paint.splash, swatchlist[i]);
      Paint.addImageUrl(sf, Paint.splashshade);
      colour.onmousedown = _UI.setTextColor;
    }
    _UI.setMenuTextColor(gn("textcolormenu").childNodes[9]);
  }
  static createTextSizeMenu(div) {
    var sizes = BlockSpecs.fontsizes;
    var spal = newHTML("div", "textuifont off", div);
    spal.setAttribute("id", "textfontsizes");
    for (var i = 0; i < sizes.length; i++) {
      var textuisize = newHTML("div", "textuisize t" + (i + 1), spal);
      textuisize.fs = sizes[i];
      var sf = newHTML("span", void 0, textuisize);
      sf.textContent = "A";
      textuisize.onmousedown = _UI.setTextSize;
    }
    _UI.setMenuTextSize(gn("textfontsizes").childNodes[5]);
  }
  static setMenuTextColor(t) {
    const colorNode = t.childNodes[0].childNodes[0];
    var c = colorNode.style.backgroundColor;
    for (var i = 0; i < gn("textcolormenu").childElementCount; i++) {
      const colorMenuChild = gn("textcolormenu").childNodes[i];
      const colorDot = colorMenuChild.childNodes[0].childNodes[0];
      var mycolor = colorDot.style.backgroundColor;
      if (c == mycolor) {
        colorMenuChild.childNodes[1].setAttribute("class", "splasharea on");
      } else {
        colorMenuChild.childNodes[1].setAttribute("class", "splasharea off");
      }
    }
  }
  static setMenuTextSize(t) {
    var c = t.fs;
    for (var i = 0; i < gn("textfontsizes").childElementCount; i++) {
      var kid = gn("textfontsizes").childNodes[i];
      var fs = kid.fs;
      var ckid = kid.className.split(" ")[1];
      if (c == fs) {
        gn("textfontsizes").childNodes[i].className = "textuisize " + ckid + " on";
      } else {
        gn("textfontsizes").childNodes[i].className = "textuisize " + ckid + " off";
      }
    }
  }
  /////////////////////////////////////////////////////////
  // Text color and size
  /////////////////////////////////////////////////////////
  static topLevelColor(e) {
    e.preventDefault();
    e.stopPropagation();
    if (gn("fontcolorbutton").className == "changecolorText on") {
      gn("fontcolorbutton").className = "changecolorText off";
      gn("textcolormenu").className = "textuicolormenu off";
    } else {
      gn("fontsizebutton").className = "fontsizeText off";
      gn("textfontsizes").className = "textuifont off";
      var text = namedForms5.activetextbox.textsprite;
      var indx = BlockSpecs.fontcolors.indexOf(text);
      if (indx > -1) {
        _UI.setMenuTextColor(gn("textcolormenu").childNodes[indx]);
      }
      gn("textcolormenu").className = "textuicolormenu on";
      gn("fontcolorbutton").className = "changecolorText on";
    }
  }
  static setTextColor(e) {
    if (e.touches && e.touches.length > 1) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    let t = e.target;
    var b = "textcolorbucket" != t.className;
    while (b) {
      t = t.parentNode;
      b = t && "textcolorbucket" != t.className;
    }
    if (!t) {
      return;
    }
    ScratchAudio.sndFX("splash.wav");
    _UI.setMenuTextColor(t);
    var text = namedForms5.activetextbox.textsprite;
    var c = t.childNodes[0].childNodes[0].style.background;
    text.setColor(c);
    const textOwnerPage = text.div.parentNode.owner;
    Undo.record({
      action: "edittext",
      where: textOwnerPage.id,
      who: text.id
    });
    ScratchJr.storyStart("UI.setTextColor");
    var ti = namedForms5.activetextbox.typing;
    ti.style.color = c;
  }
  static openFontSizeMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    if (gn("fontsizebutton").className == "fontsizeText on") {
      gn("fontsizebutton").className = "fontsizeText off";
      gn("textfontsizes").className = "textuifont off";
    } else {
      gn("fontcolorbutton").className = "changecolorText off";
      gn("textcolormenu").className = "textuicolormenu off";
      var text = namedForms5.activetextbox.textsprite;
      var indx = BlockSpecs.fontsizes.indexOf(text.fontsize);
      if (indx > -1) {
        _UI.setMenuTextSize(gn("textfontsizes").childNodes[indx]);
      }
      gn("textfontsizes").className = "textuifont on";
      gn("fontsizebutton").className = "fontsizeText on";
    }
  }
  static setTextSize(e) {
    e.preventDefault();
    e.stopPropagation();
    var t = e.target;
    if (t.nodeName == "SPAN") {
      t = t.parentNode;
    }
    if (!t) {
      return;
    }
    var ckid = t.className.split(" ")[0];
    if (ckid != "textuisize") {
      return;
    }
    _UI.setMenuTextSize(t);
    var text = namedForms5.activetextbox.textsprite;
    text.setFontSize(t.fs);
    const textOwnerPage = text.div.parentNode.owner;
    Undo.record({
      action: "edittext",
      where: textOwnerPage.id,
      who: text.id
    });
    ScratchJr.storyStart("UI.setTextSize");
    var ti = namedForms5.activetextbox.typing;
    ti.style.fontSize = t.fs * scaleMultiplier + "px";
    setProps(namedForms5.activetextbox.style, {
      height: (t.fs + 10) * scaleMultiplier + "px"
    });
  }
  ///////////////////////////////////////////
  // UI clear
  /////////////////////////////////////////
  static clear() {
    var costumes = gn("spritecc");
    while (costumes.childElementCount > 0) {
      costumes.removeChild(costumes.childNodes[0]);
    }
    var pthumbs = gn("pagecc");
    while (pthumbs.childElementCount > 0) {
      pthumbs.removeChild(pthumbs.childNodes[0]);
    }
  }
};

export {
  setModelRef,
  getModelRefAs,
  BlockSpecs,
  Events,
  Camera,
  setEnginePorts,
  Block,
  ScriptsPane,
  Record,
  Palette,
  UI,
  Thumbs,
  Undo,
  ScratchJr,
  Project
};
//# sourceMappingURL=chunk-PAFQKGPP.js.map
