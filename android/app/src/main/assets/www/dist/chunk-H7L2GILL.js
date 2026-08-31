var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app/src/utils/lib.ts
var frame;
var isTouch = "ontouchstart" in window || typeof navigator !== "undefined" && navigator.maxTouchPoints > 0;
var DEGTOR = Math.PI / 180;
var scaleMultiplier = 1;
var isDesktop = true;
var isiOS = false;
var isAndroid = false;
function libInit() {
  frame = document.getElementById("frame");
}
function evaluatePreprocessExpression(expression) {
  var trimmed = expression.trim();
  if (!trimmed) {
    return "";
  }
  var vhvw = trimmed.match(/^css_v([hw])\(\s*(-?\d*\.?\d+)\s*\)$/);
  if (vhvw) {
    var n = parseFloat(vhvw[2]);
    return vhvw[1] === "h" ? css_vh(n) : css_vw(n);
  }
  if (trimmed === "scaleMultiplier") {
    return String(scaleMultiplier);
  }
  if (trimmed === "-scaleMultiplier") {
    return String(-scaleMultiplier);
  }
  var scaled = trimmed.match(/^(-?\d*\.?\d+) \* scaleMultiplier$/);
  if (scaled) {
    return String(parseFloat(scaled[1]) * scaleMultiplier);
  }
  if (/^Math\.max\(1,\s*Math\.ceil\(5 \* scaleMultiplier\)\)$/.test(trimmed)) {
    return String(Math.max(1, Math.ceil(5 * scaleMultiplier)));
  }
  return "${" + expression + "}";
}
function preprocess(s) {
  var result = "";
  var len = s.length;
  var i = 0;
  var j;
  while (i < len && (j = s.indexOf("$", i)) != -1) {
    result += s.substring(i, j);
    i = j + 1;
    if (i < len - 1 && s[i] === "{") {
      var start = i + 1;
      var end = s.indexOf("}", start);
      if (end != -1) {
        var expression = s.substring(start, end);
        result += evaluatePreprocessExpression(expression);
        i = end + 1;
      } else {
        result += "$";
      }
    } else {
      result += "$";
    }
  }
  if (i < len) {
    result += s.substring(i);
  }
  return result;
}
async function preprocessAndLoad(url) {
  var responseText = null;
  if (window.tablet) {
    responseText = await window.tablet.io_gettextresource(url);
  } else {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    responseText = xmlhttp.responseText;
  }
  return preprocess(responseText ?? "");
}
async function preprocessAndLoadCss(baseUrl, url) {
  let existingStyleElement = document.getElementById(url);
  if (existingStyleElement) {
    return;
  }
  var cssData = await preprocessAndLoad(url);
  cssData = cssData.replace(/url\('/g, "url('" + baseUrl + "/");
  cssData = cssData.replace(/url\(([^'])/g, "url(" + baseUrl + "/$1");
  const head = document.head;
  let style = document.createElement("style");
  style.id = url;
  style.type = "text/css";
  if ("styleSheet" in style) {
    const legacyStyleSheet = style.styleSheet;
    if (legacyStyleSheet && typeof legacyStyleSheet === "object" && "cssText" in legacyStyleSheet) {
      legacyStyleSheet.cssText = cssData;
      head.appendChild(style);
      return;
    }
  }
  style.appendChild(document.createTextNode(cssData));
  head.appendChild(style);
}
function newDiv(parent, x, y, w, h, styles) {
  var el = document.createElement("div");
  el.style.position = "absolute";
  el.style.top = y + "px";
  el.style.left = x + "px";
  if (w) {
    el.style.width = w + "px";
  }
  if (h) {
    el.style.height = h + "px";
  }
  setProps(el.style, styles);
  parent.appendChild(el);
  return el;
}
function newImage(parent, src, styles) {
  var img = document.createElement("img");
  img.src = src;
  setProps(img.style, styles);
  if (parent) {
    parent.appendChild(img);
  }
  return img;
}
function newCanvas(parent, x, y, w, h, styles) {
  var canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = y + "px";
  canvas.style.left = x + "px";
  setCanvasSize(canvas, w, h);
  setProps(canvas.style, styles);
  parent.appendChild(canvas);
  return canvas;
}
function newHTML(type, c, p) {
  var e = document.createElement(type);
  if (c) {
    e.setAttribute("class", c);
  }
  if (p) {
    p.appendChild(e);
  }
  return e;
}
function newP(parent, text, styles) {
  var p = document.createElement("p");
  p.appendChild(document.createTextNode(text));
  setProps(p.style, styles);
  parent.appendChild(p);
  return p;
}
function hitRect(c, pt) {
  if (!pt) {
    return false;
  }
  if (!c) {
    return false;
  }
  var x = pt.x;
  var y = pt.y;
  if (c.offsetLeft == void 0) {
    return false;
  }
  if (c.offsetTop == void 0) {
    return false;
  }
  if (x < c.offsetLeft) {
    return false;
  }
  if (x > c.offsetLeft + c.offsetWidth) {
    return false;
  }
  if (y < c.offsetTop) {
    return false;
  }
  if (y > c.offsetTop + c.offsetHeight) {
    return false;
  }
  return true;
}
function hit3DRect(c, pt) {
  if (!pt) {
    return false;
  }
  var x = pt.x;
  var y = pt.y;
  var mtx = new WebKitCSSMatrix(window.getComputedStyle(c).webkitTransform);
  if (mtx.m41 == void 0) {
    return false;
  }
  if (mtx.m42 == void 0) {
    return false;
  }
  if (x < mtx.m41) {
    return false;
  }
  if (x > mtx.m41 + c.offsetWidth) {
    return false;
  }
  if (y < mtx.m42) {
    return false;
  }
  if (y > mtx.m42 + c.offsetHeight) {
    return false;
  }
  return true;
}
function setCanvasSize(c, w, h) {
  c.width = w;
  c.height = h;
  c.style.width = w + "px";
  c.style.height = h + "px";
}
function setCanvasSizeScaledToWindowDocumentHeight(c, w, h) {
  var multiplier = window.devicePixelRatio * scaleMultiplier;
  var scaledWidth = Math.floor(w * multiplier);
  var scaledHeight = Math.floor(h * multiplier);
  c.width = scaledWidth;
  c.height = scaledHeight;
  c.style.width = scaledWidth + "px";
  c.style.height = scaledHeight + "px";
  c.style.zoom = String(scaleMultiplier / multiplier);
}
function dprCenterTransform(w, h) {
  var dpr = window.devicePixelRatio;
  return "translate(" + -w / 2 + "px, " + -h / 2 + "px) scale(" + 1 / dpr + ") translate(" + w / 2 + "px, " + h / 2 + "px)";
}
function localx(el, gx) {
  var lx = gx;
  while (el && el.offsetTop != void 0) {
    lx -= el.offsetLeft + el.clientLeft + new WebKitCSSMatrix(window.getComputedStyle(el).webkitTransform).m41;
    el = el.parentNode;
  }
  return lx;
}
function globalx(el) {
  var lx = 0;
  while (el && el.offsetLeft != void 0) {
    var webkitTransform = new WebKitCSSMatrix(window.getComputedStyle(el).webkitTransform);
    var transformScale = webkitTransform.m11;
    lx += (el.clientWidth - transformScale * el.clientWidth) / 2;
    var transformX = webkitTransform.m41;
    lx += transformX;
    lx += el.offsetLeft + el.clientLeft;
    el = el.parentNode;
  }
  return lx;
}
function localy(el, gy) {
  var ly = gy;
  while (el && el.offsetTop != void 0) {
    ly -= el.offsetTop + el.clientTop + new WebKitCSSMatrix(window.getComputedStyle(el).webkitTransform).m42;
    el = el.parentNode;
  }
  return ly;
}
function globaly(el) {
  var ly = 0;
  while (el && el.offsetTop != void 0) {
    var webkitTransform = new WebKitCSSMatrix(window.getComputedStyle(el).webkitTransform);
    var transformScale = webkitTransform.m22;
    ly += (el.clientHeight - transformScale * el.clientHeight) / 2;
    var transformY = webkitTransform.m42;
    ly += transformY;
    ly += el.offsetTop + el.clientTop;
    el = el.parentNode;
  }
  return ly;
}
function setProps(object, props) {
  for (var i in props) {
    object[i] = props[i];
  }
}
function CSSTransition3D(el, obj) {
  var duration = 1;
  var transition = "ease";
  var style = {
    left: el.left + "px",
    top: el.top + "px"
  };
  if (obj.duration) {
    duration = obj.duration;
  }
  if (obj.transition) {
    transition = obj.transition;
  }
  if (obj.style) {
    for (var key in obj.style) {
      style[key] = obj.style[key];
    }
  }
  var items = "transform " + duration + "s " + transition;
  var translate = "translate3d(" + style.left + "," + style.top + ",0px)";
  el.addEventListener("transitionend", transitionDone, true);
  el.style.transition = items;
  el.style.transform = translate;
  function transitionDone() {
    el.style.transition = "";
    var mtx = new DOMMatrix(window.getComputedStyle(el).transform);
    el.left = mtx.m41;
    el.top = mtx.m42;
    if (obj.onComplete) {
      obj.onComplete();
    }
  }
}
function drawThumbnail(img, c) {
  var w = img.naturalWidth ? img.naturalWidth : img.width;
  var h = img.naturalHeight ? img.naturalHeight : img.height;
  var dx = (c.width - w) / 2;
  var dy = (c.height - h) / 2;
  var dw = c.width / w;
  var dh = c.height / h;
  var wi = w;
  var he = h;
  switch (getFit(dw, dh)) {
    case "noscale":
      break;
    case "scaleh":
      wi = w * dh;
      he = h * dh;
      dx = (c.width - wi) / 2;
      dy = (c.height - he) / 2;
      break;
    case "scalew":
      wi = w * dw;
      he = h * dw;
      dx = (c.width - wi) / 2;
      dy = (c.height - he) / 2;
      break;
  }
  var ctx = c.getContext("2d");
  ctx.drawImage(img, dx, dy, wi, he);
}
function drawScaled(img, c) {
  var imgWidth = img.naturalWidth ? img.naturalWidth : img.width;
  var imgHeight = img.naturalHeight ? img.naturalHeight : img.height;
  var boxWidth = c.width;
  var boxHeight = c.height;
  var scale = boxWidth / imgWidth;
  var w = imgWidth * scale;
  var h = imgHeight * scale;
  if (h > boxHeight) {
    scale = boxHeight / imgHeight;
    w = imgWidth * scale;
    h = imgHeight * scale;
  }
  var x0 = (boxWidth - w) / 2;
  var y0 = (boxHeight - h) / 2;
  var ctx = c.getContext("2d");
  ctx.drawImage(img, x0, y0, w, h);
}
function fitInRect(srcw, srch, destw, desth) {
  var dx = (destw - srcw) / 2;
  var dy = (desth - srch) / 2;
  var dw = destw / srcw;
  var dh = desth / srch;
  var wi = srcw;
  var he = srch;
  switch (getFit(dw, dh)) {
    case "noscale":
      break;
    case "scaleh":
      wi = srcw * dh;
      he = srch * dh;
      dx = (destw - wi) / 2;
      dy = (desth - he) / 2;
      break;
    case "scalew":
      wi = srcw * dw;
      he = srch * dw;
      dx = (destw - wi) / 2;
      dy = (desth - he) / 2;
      break;
  }
  return [dx, dy, wi, he];
}
function getFit(dw, dh) {
  if (dw >= 1 && dh >= 1) {
    return "noscale";
  }
  if (dw >= 1 && dh < 1) {
    return "scaleh";
  }
  if (dw < 1 && dh >= 1) {
    return "scalew";
  }
  if (dw < dh) {
    return "scalew";
  }
  return "scaleh";
}
function getDocumentHeight() {
  return Math.max(document.body.clientHeight, document.documentElement.clientHeight);
}
function getDocumentWidth() {
  return Math.max(document.body.clientWidth, document.documentElement.clientWidth);
}
function getStringSize(ctx, f, label) {
  ctx.font = f;
  return ctx.measureText(label);
}
function writeText(ctx, f, c, label, dy, dx) {
  dx = dx == void 0 ? 0 : dx;
  ctx.font = f;
  ctx.fillStyle = c;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(label, dx, dy);
}
function gn(str) {
  return document.getElementById(str);
}
function newTextInput(p, type, str, mstyle) {
  var input = document.createElement("input");
  input.value = str;
  setProps(input.style, mstyle);
  input.type = type;
  p.appendChild(input);
  return input;
}
function getUrlVars() {
  if (window.location.href.indexOf("?") < 0) {
    return {};
  }
  var args = window.location.href.slice(window.location.href.indexOf("?") + 1);
  var vars = {};
  var hashes = args.split("&");
  for (var i = 0; i < hashes.length; i++) {
    var hash = hashes[i].split("=");
    vars[hash[0]] = hash[1];
  }
  return vars;
}
function getIdFor(name) {
  var n = 1;
  while (gn(name + " " + n) != void 0) {
    n++;
  }
  return name + " " + n;
}
function getIdForCamera(name) {
  var n = 1;
  while (gn(name + "_" + n) != void 0) {
    n++;
  }
  return name + "_" + n;
}
function rgb2hsb(str) {
  if (str == null) {
    return [24, 1, 1];
  }
  var min, val, f, i, hue, sat;
  str = str.indexOf("rgb") > -1 ? rgbToHex(str) : rgbaToHex(str);
  var num = parseInt(str.substring(1, str.length), 16);
  var rgb = getRGB(num);
  var red = rgb[0];
  red /= 255;
  var grn = rgb[1];
  grn /= 255;
  var blu = rgb[2];
  blu /= 255;
  min = Math.min(Math.min(red, grn), blu);
  val = Math.max(Math.max(red, grn), blu);
  if (min == val) {
    return [0, 0, val];
  }
  f = red == min ? grn - blu : grn == min ? blu - red : red - grn;
  i = red == min ? 3 : grn == min ? 5 : 1;
  hue = Math.round((i - f / (val - min)) * 60) % 360;
  sat = Math.round((val - min) / val * 100);
  val = Math.round(val * 100);
  return [hue, sat / 100, val / 100];
}
function rgbToHex(str) {
  if (str.indexOf("rgb") < 0) {
    return str;
  }
  var res = str.substring(4, str.length - 1);
  var a = res.split(",");
  var red = Number(a[0]);
  var grn = Number(a[1]);
  var blu = Number(a[2]);
  return rgbToString({
    r: red,
    g: grn,
    b: blu
  });
}
function rgbaToHex(str) {
  if (str.indexOf("rgba") < 0) {
    return str;
  }
  var res = str.substring(5, str.length - 1);
  var a = res.split(",");
  var red = Number(a[0]);
  var grn = Number(a[1]);
  var blu = Number(a[2]);
  return rgbToString({
    r: red,
    g: grn,
    b: blu
  });
}
function rgbToString(obj) {
  return "#" + getHex(obj.r) + getHex(obj.g) + getHex(obj.b);
}
function getRGB(color) {
  return [
    Number(color >> 16 & 255),
    Number(color >> 8 & 255),
    Number(color & 255)
  ];
}
function getHex(num) {
  var hex = num.toString(16);
  if (hex.length == 1) {
    return "0" + hex;
  }
  return hex;
}
function colorToRGBA(color, opacity) {
  var val = parseInt("0x" + color.substr(1, color.length));
  return "rgba(" + (val >> 16) % 256 + "," + (val >> 8) % 256 + "," + val % 256 + "," + opacity + ")";
}
function css_vh(y) {
  return y * window.innerHeight / 100 + "px";
}
function css_vw(x) {
  return x * window.innerWidth / 100 + "px";
}

export {
  __require,
  __commonJS,
  __toESM,
  frame,
  isTouch,
  DEGTOR,
  scaleMultiplier,
  isDesktop,
  isiOS,
  isAndroid,
  libInit,
  preprocessAndLoad,
  preprocessAndLoadCss,
  newDiv,
  newImage,
  newCanvas,
  newHTML,
  newP,
  hitRect,
  hit3DRect,
  setCanvasSize,
  setCanvasSizeScaledToWindowDocumentHeight,
  dprCenterTransform,
  localx,
  globalx,
  localy,
  globaly,
  setProps,
  CSSTransition3D,
  drawThumbnail,
  drawScaled,
  fitInRect,
  getDocumentHeight,
  getDocumentWidth,
  getStringSize,
  writeText,
  gn,
  newTextInput,
  getUrlVars,
  getIdFor,
  getIdForCamera,
  rgb2hsb,
  rgbToHex,
  colorToRGBA
};
//# sourceMappingURL=chunk-H7L2GILL.js.map
