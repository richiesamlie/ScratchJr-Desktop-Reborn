import {
  getStringSize,
  globalx,
  globaly,
  newCanvas,
  scaleMultiplier,
  setCanvasSize,
  setProps,
  writeText
} from "./chunk-FO3Y3LNK.js";

// src/app/src/utils/DrawPath.ts
var startx = 0;
var starty = 0;
var pathx = 0;
var pathy = 0;
var DrawPath = class _DrawPath {
  static render(ctx, path) {
    pathx = 0;
    pathy = 0;
    for (var i = 0; i < path.length; i++) {
      _DrawPath.drawSection(path[i], ctx);
    }
  }
  static drawSection(item, ctx) {
    var cx, cy, px, py;
    switch (String(item[0]).toLowerCase()) {
      case "m":
        _DrawPath.absoluteMove(item[1], item[2]);
        ctx.moveTo(pathx, pathy);
        startx = item[1];
        starty = item[2];
        break;
      case "l":
        _DrawPath.relativeMove(item[1], item[2]);
        ctx.lineTo(pathx, pathy);
        break;
      case "h":
        pathx += item[1];
        ctx.lineTo(pathx, pathy);
        break;
      case "v":
        pathy += item[1];
        ctx.lineTo(pathx, pathy);
        break;
      case "q":
        cx = pathx + item[1];
        cy = pathy + item[2];
        px = pathx + item[3];
        py = pathy + item[4];
        ctx.quadraticCurveTo(cx, cy, px, py);
        _DrawPath.relativeMove(item[3], item[4]);
        break;
      case "c":
        cx = pathx + item[1];
        cy = pathy + item[2];
        var c2x = pathx + item[3];
        var c2y = pathy + item[4];
        px = pathx + item[5];
        py = pathy + item[6];
        ctx.bezierCurveTo(cx, cy, c2x, c2y, px, py);
        _DrawPath.relativeMove(item[5], item[6]);
        break;
      case "z":
        _DrawPath.absoluteMove(startx, starty);
        ctx.lineTo(pathx, pathy);
        break;
      default:
        break;
    }
  }
  static absoluteMove(dx, dy) {
    pathx = dx;
    pathy = dy;
  }
  static relativeMove(dx, dy) {
    pathx += dx;
    pathy += dy;
  }
};

// src/app/src/editor/ui/Alert.ts
var balloon = null;
var Alert = class _Alert {
  static get balloon() {
    return balloon;
  }
  static close() {
    if (!balloon) {
      return;
    }
    balloon.parentNode.removeChild(balloon);
    balloon = null;
  }
  static open(p, obj, label, color) {
    if (balloon) {
      _Alert.close();
    }
    var scale = scaleMultiplier;
    var w = 80;
    var h = 24;
    var dx = globalx(obj) + obj.offsetWidth / 2 - (w + 7 * 2 + 4) * scale / 2;
    var dy = globaly(obj) - 24 * scale;
    if (dy < 5 * scale) {
      dy = 5 * scale;
    }
    balloon = newCanvas(p, dx, dy, w, h, {
      position: "absolute",
      zIndex: 2
    });
    balloon.icon = obj;
    var ctx = balloon.getContext("2d");
    w = 16 + getStringSize(ctx, "bold 14px Verdana", label).width;
    if (w < 36) {
      w = 36;
    }
    dx = globalx(obj) + obj.offsetWidth / 2 - (w + 7 * 2 + 4) * scale / 2;
    if (dx < 5 * scale) {
      dx = 5 * scale;
    }
    dx = Math.floor(dx);
    setCanvasSize(balloon, w, 36);
    setProps(balloon.style, {
      position: "absolute",
      left: dx + "px",
      zIndex: 1e3,
      webkitTransform: "translate(" + -w / 2 + "px, " + -h / 2 + "px) scale(" + scale + ", " + scale + ") translate(" + w / 2 + "px, " + h / 2 + "px) "
    });
    _Alert.draw(balloon.getContext("2d"), 6, w, h, color);
    writeText(ctx, "bold 14px Verdana", "white", label, 20, 8);
  }
  static draw(ctx, curve, w, h, color) {
    curve = 10;
    var path = [
      ["M", 0, curve],
      ["q", 0, -curve, curve, -curve],
      ["h", w - curve * 2],
      ["q", curve, 0, curve, curve],
      ["v", h - curve * 2],
      ["q", 0, curve, -curve, curve],
      ["h", -(w / 2) + 7 + curve],
      ["l", -7, 7],
      ["l", -7, -7],
      ["h", -(w / 2) + 7 + curve],
      ["q", -curve, 0, -curve, -curve],
      ["Z"]
    ];
    ctx.clearRect(0, 0, Math.max(ctx.canvas.width, w), Math.max(ctx.canvas.height, h));
    ctx.fillStyle = color;
    ctx.beginPath();
    DrawPath.render(ctx, path);
    ctx.fill();
  }
};

export {
  DrawPath,
  Alert
};
//# sourceMappingURL=chunk-VS23VAOM.js.map
