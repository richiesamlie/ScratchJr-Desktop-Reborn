import {
  Alert
} from "./chunk-CQR6IGDX.js";
import {
  DEGTOR,
  __commonJS,
  __require,
  __toESM,
  colorToRGBA,
  drawThumbnail,
  getUrlVars,
  gn,
  isAndroid,
  isTouch,
  isiOS,
  libInit,
  newHTML,
  preprocessAndLoad,
  preprocessAndLoadCss,
  rgb2hsb,
  setCanvasSize
} from "./chunk-SD4UFC5K.js";

// node_modules/jszip/dist/jszip.min.js
var require_jszip_min = __commonJS({
  "node_modules/jszip/dist/jszip.min.js"(exports, module) {
    !(function(e) {
      if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
      else if ("function" == typeof define && define.amd) define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
      }
    })(function() {
      return (function s(a, o, h) {
        function u(r, e2) {
          if (!o[r]) {
            if (!a[r]) {
              var t = "function" == typeof __require && __require;
              if (!e2 && t) return t(r, true);
              if (l) return l(r, true);
              var n = new Error("Cannot find module '" + r + "'");
              throw n.code = "MODULE_NOT_FOUND", n;
            }
            var i = o[r] = { exports: {} };
            a[r][0].call(i.exports, function(e3) {
              var t2 = a[r][1][e3];
              return u(t2 || e3);
            }, i, i.exports, s, a, o, h);
          }
          return o[r].exports;
        }
        for (var l = "function" == typeof __require && __require, e = 0; e < h.length; e++) u(h[e]);
        return u;
      })({ 1: [function(e, t, r) {
        "use strict";
        var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        r.encode = function(e2) {
          for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
          return h.join("");
        }, r.decode = function(e2) {
          var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
          if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
          var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
          return l;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
        "use strict";
        var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
        function o(e2, t2, r2, n2, i2) {
          this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
        }
        o.prototype = { getContentWorker: function() {
          var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
          return e2.on("end", function() {
            if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), e2;
        }, getCompressedWorker: function() {
          return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, o.createWorkerFrom = function(e2, t2, r2) {
          return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
        }, t.exports = o;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
        "use strict";
        var n = e("./stream/GenericWorker");
        r.STORE = { magic: "\0\0", compressWorker: function() {
          return new n("STORE compression");
        }, uncompressWorker: function() {
          return new n("STORE decompression");
        } }, r.DEFLATE = e("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
        "use strict";
        var n = e("./utils");
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2) {
          return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(e, t, r) {
        "use strict";
        r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
      }, {}], 6: [function(e, t, r) {
        "use strict";
        var n = null;
        n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
      }, { lie: 37 }], 7: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
        function h(e2, t2) {
          a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
        }
        r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
          this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
        }, h.prototype.flush = function() {
          a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
        }, h.prototype.cleanUp = function() {
          a.prototype.cleanUp.call(this), this._pako = null;
        }, h.prototype._createPako = function() {
          this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
          var t2 = this;
          this._pako.onData = function(e2) {
            t2.push({ data: e2, meta: t2.meta });
          };
        }, r.compressWorker = function(e2) {
          return new h("Deflate", e2);
        }, r.uncompressWorker = function() {
          return new h("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
        "use strict";
        function A(e2, t2) {
          var r2, n2 = "";
          for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
          return n2;
        }
        function n(e2, t2, r2, n2, i2, s2) {
          var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
          var S = 0;
          t2 && (S |= 8), l || !_ && !g || (S |= 2048);
          var z = 0, C = 0;
          w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= (function(e3, t3) {
            var r3 = e3;
            return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
          })(h.unixPermissions, w)) : (C = 20, z |= (function(e3) {
            return 63 & (e3 || 0);
          })(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
          var E = "";
          return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
        }
        var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
        function s(e2, t2, r2, n2) {
          i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        I.inherits(s, i), s.prototype.push = function(e2) {
          var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
          this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
        }, s.prototype.openedSource = function(e2) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
          var t2 = this.streamFiles && !e2.file.dir;
          if (t2) {
            var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: r2.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = true;
        }, s.prototype.closedSource = function(e2) {
          this.accumulate = false;
          var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: (function(e3) {
            return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
          })(e2), meta: { percent: 100 } });
          else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, s.prototype.flush = function() {
          for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
          var r2 = this.bytesWritten - e2, n2 = (function(e3, t3, r3, n3, i2) {
            var s2 = I.transformTo("string", i2(n3));
            return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
          })(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
          this.push({ data: n2, meta: { percent: 100 } });
        }, s.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, s.prototype.registerPrevious = function(e2) {
          this._sources.push(e2);
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
        }, s.prototype.error = function(e2) {
          var t2 = this._sources;
          if (!i.prototype.error.call(this, e2)) return false;
          for (var r2 = 0; r2 < t2.length; r2++) try {
            t2[r2].error(e2);
          } catch (e3) {
          }
          return true;
        }, s.prototype.lock = function() {
          i.prototype.lock.call(this);
          for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
        }, t.exports = s;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
        "use strict";
        var u = e("../compressions"), n = e("./ZipFileWorker");
        r.generateWorker = function(e2, a, t2) {
          var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
          try {
            e2.forEach(function(e3, t3) {
              h++;
              var r2 = (function(e4, t4) {
                var r3 = e4 || t4, n3 = u[r3];
                if (!n3) throw new Error(r3 + " is not a valid compression method !");
                return n3;
              })(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
              t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
            }), o.entriesCount = h;
          } catch (e3) {
            o.error(e3);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
        "use strict";
        function n() {
          if (!(this instanceof n)) return new n();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var e2 = new n();
            for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
            return e2;
          };
        }
        (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
          return new n().loadAsync(e2, t2);
        }, n.external = e("./external"), t.exports = n;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
        "use strict";
        var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
        function f(n2) {
          return new i.Promise(function(e2, t2) {
            var r2 = n2.decompressed.getContentWorker().pipe(new a());
            r2.on("error", function(e3) {
              t2(e3);
            }).on("end", function() {
              r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
            }).resume();
          });
        }
        t.exports = function(e2, o) {
          var h = this;
          return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
            var t2 = new s(o);
            return t2.load(e3), t2;
          }).then(function(e3) {
            var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
            if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
            return i.Promise.all(t2);
          }).then(function(e3) {
            for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
              var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
              h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
            }
            return t2.zipComment.length && (h.comment = t2.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../stream/GenericWorker");
        function s(e2, t2) {
          i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
        }
        n.inherits(s, i), s.prototype._bindStream = function(e2) {
          var t2 = this;
          (this._stream = e2).pause(), e2.on("data", function(e3) {
            t2.push({ data: e3, meta: { percent: 0 } });
          }).on("error", function(e3) {
            t2.isPaused ? this.generatedError = e3 : t2.error(e3);
          }).on("end", function() {
            t2.isPaused ? t2._upstreamEnded = true : t2.end();
          });
        }, s.prototype.pause = function() {
          return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
        }, t.exports = s;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
        "use strict";
        var i = e("readable-stream").Readable;
        function n(e2, t2, r2) {
          i.call(this, t2), this._helper = e2;
          var n2 = this;
          e2.on("data", function(e3, t3) {
            n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
          }).on("error", function(e3) {
            n2.emit("error", e3);
          }).on("end", function() {
            n2.push(null);
          });
        }
        e("../utils").inherits(n, i), n.prototype._read = function() {
          this._helper.resume();
        }, t.exports = n;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
        "use strict";
        t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
          if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
          return new Buffer(e2, t2);
        }, allocBuffer: function(e2) {
          if (Buffer.alloc) return Buffer.alloc(e2);
          var t2 = new Buffer(e2);
          return t2.fill(0), t2;
        }, isBuffer: function(e2) {
          return Buffer.isBuffer(e2);
        }, isStream: function(e2) {
          return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
        } };
      }, {}], 15: [function(e, t, r) {
        "use strict";
        function s(e2, t2, r2) {
          var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
          s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
          var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
          r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
          var o2 = null;
          o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
          var h2 = new d(e2, o2, s2);
          this.files[e2] = h2;
        }
        var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
          "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
          var t2 = e2.lastIndexOf("/");
          return 0 < t2 ? e2.substring(0, t2) : "";
        }, g = function(e2) {
          return "/" !== e2.slice(-1) && (e2 += "/"), e2;
        }, b = function(e2, t2) {
          return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
        };
        function h(e2) {
          return "[object RegExp]" === Object.prototype.toString.call(e2);
        }
        var n = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(e2) {
          var t2, r2, n2;
          for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
        }, filter: function(r2) {
          var n2 = [];
          return this.forEach(function(e2, t2) {
            r2(e2, t2) && n2.push(t2);
          }), n2;
        }, file: function(e2, t2, r2) {
          if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
          if (h(e2)) {
            var n2 = e2;
            return this.filter(function(e3, t3) {
              return !t3.dir && n2.test(e3);
            });
          }
          var i2 = this.files[this.root + e2];
          return i2 && !i2.dir ? i2 : null;
        }, folder: function(r2) {
          if (!r2) return this;
          if (h(r2)) return this.filter(function(e3, t3) {
            return t3.dir && r2.test(e3);
          });
          var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
          return n2.root = t2.name, n2;
        }, remove: function(r2) {
          r2 = this.root + r2;
          var e2 = this.files[r2];
          if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
          else for (var t2 = this.filter(function(e3, t3) {
            return t3.name.slice(0, r2.length) === r2;
          }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(e2) {
          var t2, r2 = {};
          try {
            if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
            u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
            var n2 = r2.comment || this.comment || "";
            t2 = o.generateWorker(this, r2, n2);
          } catch (e3) {
            (t2 = new l("error")).error(e3);
          }
          return new a(t2, r2.type || "string", r2.mimeType);
        }, generateAsync: function(e2, t2) {
          return this.generateInternalStream(e2).accumulate(t2);
        }, generateNodeStream: function(e2, t2) {
          return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
        } };
        t.exports = n;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
        "use strict";
        t.exports = e("stream");
      }, { stream: void 0 }], 17: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
          for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data[this.zero + e2];
        }, i.prototype.lastIndexOfSignature = function(e2) {
          for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
          return -1;
        }, i.prototype.readAndCheckSignature = function(e2) {
          var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
          return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
        }, i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return [];
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
        "use strict";
        var n = e("../utils");
        function i(e2) {
          this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
        }
        i.prototype = { checkOffset: function(e2) {
          this.checkIndex(this.index + e2);
        }, checkIndex: function(e2) {
          if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
        }, setIndex: function(e2) {
          this.checkIndex(e2), this.index = e2;
        }, skip: function(e2) {
          this.setIndex(this.index + e2);
        }, byteAt: function() {
        }, readInt: function(e2) {
          var t2, r2 = 0;
          for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
          return this.index += e2, r2;
        }, readString: function(e2) {
          return n.transformTo("string", this.readData(e2));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var e2 = this.readInt(4);
          return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
        } }, t.exports = i;
      }, { "../utils": 32 }], 19: [function(e, t, r) {
        "use strict";
        var n = e("./Uint8ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data.charCodeAt(this.zero + e2);
        }, i.prototype.lastIndexOfSignature = function(e2) {
          return this.data.lastIndexOf(e2) - this.zero;
        }, i.prototype.readAndCheckSignature = function(e2) {
          return e2 === this.readData(4);
        }, i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
        "use strict";
        var n = e("./ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
          var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
        t.exports = function(e2) {
          var t2 = n.getTypeOf(e2);
          return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
        "use strict";
        r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../utils");
        function s(e2) {
          n.call(this, "ConvertWorker to " + e2), this.destType = e2;
        }
        i.inherits(s, n), s.prototype.processChunk = function(e2) {
          this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../crc32");
        function s() {
          n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
          this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
        }, t.exports = s;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
        }
        n.inherits(s, i), s.prototype.processChunk = function(e2) {
          if (e2) {
            var t2 = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = t2 + e2.data.length;
          }
          i.prototype.processChunk.call(this, e2);
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataWorker");
          var t2 = this;
          this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
            t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
          }, function(e3) {
            t2.error(e3);
          });
        }
        n.inherits(s, i), s.prototype.cleanUp = function() {
          i.prototype.cleanUp.call(this), this.data = null;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
        }, s.prototype._tickAndRepeat = function() {
          this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
        }, s.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return false;
          var e2 = null, t2 = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              e2 = this.data.substring(this.index, t2);
              break;
            case "uint8array":
              e2 = this.data.subarray(this.index, t2);
              break;
            case "array":
            case "nodebuffer":
              e2 = this.data.slice(this.index, t2);
          }
          return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
        "use strict";
        function n(e2) {
          this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        n.prototype = { push: function(e2) {
          this.emit("data", e2);
        }, end: function() {
          if (this.isFinished) return false;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = true;
          } catch (e2) {
            this.emit("error", e2);
          }
          return true;
        }, error: function(e2) {
          return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
        }, on: function(e2, t2) {
          return this._listeners[e2].push(t2), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(e2, t2) {
          if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
        }, pipe: function(e2) {
          return e2.registerPrevious(this);
        }, registerPrevious: function(e2) {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
        }, resume: function() {
          if (!this.isPaused || this.isFinished) return false;
          var e2 = this.isPaused = false;
          return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
        }, flush: function() {
        }, processChunk: function(e2) {
          this.push(e2);
        }, withStreamInfo: function(e2, t2) {
          return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
        }, lock: function() {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = true, this.previous && this.previous.lock();
        }, toString: function() {
          var e2 = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + e2 : e2;
        } }, t.exports = n;
      }, {}], 29: [function(e, t, r) {
        "use strict";
        var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
        if (n.nodestream) try {
          o = e("../nodejs/NodejsStreamOutputAdapter");
        } catch (e2) {
        }
        function l(e2, o2) {
          return new a.Promise(function(t2, r2) {
            var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
            e2.on("data", function(e3, t3) {
              n2.push(e3), o2 && o2(t3);
            }).on("error", function(e3) {
              n2 = [], r2(e3);
            }).on("end", function() {
              try {
                var e3 = (function(e4, t3, r3) {
                  switch (e4) {
                    case "blob":
                      return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                    case "base64":
                      return u.encode(t3);
                    default:
                      return h.transformTo(e4, t3);
                  }
                })(s2, (function(e4, t3) {
                  var r3, n3 = 0, i3 = null, s3 = 0;
                  for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                  switch (e4) {
                    case "string":
                      return t3.join("");
                    case "array":
                      return Array.prototype.concat.apply([], t3);
                    case "uint8array":
                      for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                      return i3;
                    case "nodebuffer":
                      return Buffer.concat(t3);
                    default:
                      throw new Error("concat : unsupported type '" + e4 + "'");
                  }
                })(i2, n2), a2);
                t2(e3);
              } catch (e4) {
                r2(e4);
              }
              n2 = [];
            }).resume();
          });
        }
        function f(e2, t2, r2) {
          var n2 = t2;
          switch (t2) {
            case "blob":
            case "arraybuffer":
              n2 = "uint8array";
              break;
            case "base64":
              n2 = "string";
          }
          try {
            this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
          } catch (e3) {
            this._worker = new s("error"), this._worker.error(e3);
          }
        }
        f.prototype = { accumulate: function(e2) {
          return l(this, e2);
        }, on: function(e2, t2) {
          var r2 = this;
          return "data" === e2 ? this._worker.on(e2, function(e3) {
            t2.call(r2, e3.data, e3.meta);
          }) : this._worker.on(e2, function() {
            h.delay(t2, arguments, r2);
          }), this;
        }, resume: function() {
          return h.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(e2) {
          if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
          return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
        } }, t.exports = f;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
        "use strict";
        if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
        else {
          var n = new ArrayBuffer(0);
          try {
            r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
          } catch (e2) {
            try {
              var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
            } catch (e3) {
              r.blob = false;
            }
          }
        }
        try {
          r.nodestream = !!e("readable-stream").Readable;
        } catch (e2) {
          r.nodestream = false;
        }
      }, { "readable-stream": 16 }], 31: [function(e, t, s) {
        "use strict";
        for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        u[254] = u[254] = 1;
        function a() {
          n.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function l() {
          n.call(this, "utf-8 encode");
        }
        s.utf8encode = function(e2) {
          return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
            for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          })(e2);
        }, s.utf8decode = function(e2) {
          return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
            for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
            else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
            else {
              for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
              1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
            }
            return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
          })(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
        }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
          var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
          if (this.leftOver && this.leftOver.length) {
            if (h.uint8array) {
              var r2 = t2;
              (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
            } else t2 = this.leftOver.concat(t2);
            this.leftOver = null;
          }
          var n2 = (function(e3, t3) {
            var r3;
            for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
            return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
          })(t2), i2 = t2;
          n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
        }, a.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
          this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
        }, s.Utf8EncodeWorker = l;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
        "use strict";
        var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
        function n(e2) {
          return e2;
        }
        function l(e2, t2) {
          for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
          return t2;
        }
        e("setimmediate"), a.newBlob = function(t2, r2) {
          a.checkSupport("blob");
          try {
            return new Blob([t2], { type: r2 });
          } catch (e2) {
            try {
              var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return n2.append(t2), n2.getBlob(r2);
            } catch (e3) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var i = { stringifyByChunk: function(e2, t2, r2) {
          var n2 = [], i2 = 0, s2 = e2.length;
          if (s2 <= r2) return String.fromCharCode.apply(null, e2);
          for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
          return n2.join("");
        }, stringifyByChar: function(e2) {
          for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
          return t2;
        }, applyCanBeUsed: { uint8array: (function() {
          try {
            return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
          } catch (e2) {
            return false;
          }
        })(), nodebuffer: (function() {
          try {
            return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
          } catch (e2) {
            return false;
          }
        })() } };
        function s(e2) {
          var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
          if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
            return i.stringifyByChunk(e2, r2, t2);
          } catch (e3) {
            t2 = Math.floor(t2 / 2);
          }
          return i.stringifyByChar(e2);
        }
        function f(e2, t2) {
          for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
          return t2;
        }
        a.applyFromCharCode = s;
        var c = {};
        c.string = { string: n, array: function(e2) {
          return l(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.string.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return l(e2, new Uint8Array(e2.length));
        }, nodebuffer: function(e2) {
          return l(e2, r.allocBuffer(e2.length));
        } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
          return new Uint8Array(e2).buffer;
        }, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.arraybuffer = { string: function(e2) {
          return s(new Uint8Array(e2));
        }, array: function(e2) {
          return f(new Uint8Array(e2), new Array(e2.byteLength));
        }, arraybuffer: n, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(new Uint8Array(e2));
        } }, c.uint8array = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return e2.buffer;
        }, uint8array: n, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.nodebuffer = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.nodebuffer.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return f(e2, new Uint8Array(e2.length));
        }, nodebuffer: n }, a.transformTo = function(e2, t2) {
          if (t2 = t2 || "", !e2) return t2;
          a.checkSupport(e2);
          var r2 = a.getTypeOf(t2);
          return c[r2][e2](t2);
        }, a.resolve = function(e2) {
          for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
            var i2 = t2[n2];
            "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
          }
          return r2.join("/");
        }, a.getTypeOf = function(e2) {
          return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, a.checkSupport = function(e2) {
          if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
          var t2, r2, n2 = "";
          for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
          return n2;
        }, a.delay = function(e2, t2, r2) {
          setImmediate(function() {
            e2.apply(r2 || null, t2 || []);
          });
        }, a.inherits = function(e2, t2) {
          function r2() {
          }
          r2.prototype = t2.prototype, e2.prototype = new r2();
        }, a.extend = function() {
          var e2, t2, r2 = {};
          for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
          return r2;
        }, a.prepareContent = function(r2, e2, n2, i2, s2) {
          return u.Promise.resolve(e2).then(function(n3) {
            return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
              var e3 = new FileReader();
              e3.onload = function(e4) {
                t2(e4.target.result);
              }, e3.onerror = function(e4) {
                r3(e4.target.error);
              }, e3.readAsArrayBuffer(n3);
            }) : n3;
          }).then(function(e3) {
            var t2 = a.getTypeOf(e3);
            return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = (function(e4) {
              return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
            })(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
        function h(e2) {
          this.files = [], this.loadOptions = e2;
        }
        h.prototype = { checkSignature: function(e2) {
          if (!this.reader.readAndCheckSignature(e2)) {
            this.reader.index -= 4;
            var t2 = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
          }
        }, isSignature: function(e2, t2) {
          var r2 = this.reader.index;
          this.reader.setIndex(e2);
          var n2 = this.reader.readString(4) === t2;
          return this.reader.setIndex(r2), n2;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
          this.zipComment = this.loadOptions.decodeFileName(r2);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var e2, t2;
          for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
        }, readCentralDir: function() {
          var e2;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
          if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
          if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
          this.reader.setIndex(e2);
          var t2 = e2;
          if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
            if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var r2 = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
          var n2 = t2 - r2;
          if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
          else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
        }, prepareReader: function(e2) {
          this.reader = n(e2);
        }, load: function(e2) {
          this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, t.exports = h;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
        function l(e2, t2) {
          this.options = e2, this.loadOptions = t2;
        }
        l.prototype = { isEncrypted: function() {
          return 1 == (1 & this.bitFlag);
        }, useUTF8: function() {
          return 2048 == (2048 & this.bitFlag);
        }, readLocalPart: function(e2) {
          var t2, r2;
          if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if (null === (t2 = (function(e3) {
            for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
            return null;
          })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
          this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
        }, readCentralPart: function(e2) {
          this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
          var t2 = e2.readInt(2);
          if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var e2 = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var e2 = n(this.extraFields[1].value);
            this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
          }
        }, readExtraFields: function(e2) {
          var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
          e2.setIndex(i2);
        }, handleUTF8: function() {
          var e2 = u.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
          else {
            var t2 = this.findExtraFieldUnicodePath();
            if (null !== t2) this.fileNameStr = t2;
            else {
              var r2 = s.transformTo(e2, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(r2);
            }
            var n2 = this.findExtraFieldUnicodeComment();
            if (null !== n2) this.fileCommentStr = n2;
            else {
              var i2 = s.transformTo(e2, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(i2);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var e2 = this.extraFields[28789];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var e2 = this.extraFields[25461];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        } }, t.exports = l;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
        "use strict";
        function n(e2, t2, r2) {
          this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
        }
        var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
        n.prototype = { internalStream: function(e2) {
          var t2 = null, r2 = "string";
          try {
            if (!e2) throw new Error("No output type specified.");
            var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
            "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
            var i2 = !this._dataBinary;
            i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
          } catch (e3) {
            (t2 = new h("error")).error(e3);
          }
          return new s(t2, r2, "");
        }, async: function(e2, t2) {
          return this.internalStream(e2).accumulate(t2);
        }, nodeStream: function(e2, t2) {
          return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
        }, _compressWorker: function(e2, t2) {
          if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
          var r2 = this._decompressWorker();
          return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
        }, _decompressWorker: function() {
          return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
        } };
        for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
        t.exports = n;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
        (function(t2) {
          "use strict";
          var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
          if (e2) {
            var i = 0, s = new e2(u), a = t2.document.createTextNode("");
            s.observe(a, { characterData: true }), r = function() {
              a.data = i = ++i % 2;
            };
          } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
            var e3 = t2.document.createElement("script");
            e3.onreadystatechange = function() {
              u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
            }, t2.document.documentElement.appendChild(e3);
          } : function() {
            setTimeout(u, 0);
          };
          else {
            var o = new t2.MessageChannel();
            o.port1.onmessage = u, r = function() {
              o.port2.postMessage(0);
            };
          }
          var h = [];
          function u() {
            var e3, t3;
            n = true;
            for (var r2 = h.length; r2; ) {
              for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
              r2 = h.length;
            }
            n = false;
          }
          l.exports = function(e3) {
            1 !== h.push(e3) || n || r();
          };
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 37: [function(e, t, r) {
        "use strict";
        var i = e("immediate");
        function u() {
        }
        var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
        function o(e2) {
          if ("function" != typeof e2) throw new TypeError("resolver must be a function");
          this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
        }
        function h(e2, t2, r2) {
          this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
        }
        function f(t2, r2, n2) {
          i(function() {
            var e2;
            try {
              e2 = r2(n2);
            } catch (e3) {
              return l.reject(t2, e3);
            }
            e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
          });
        }
        function c(e2) {
          var t2 = e2 && e2.then;
          if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
            t2.apply(e2, arguments);
          };
        }
        function d(t2, e2) {
          var r2 = false;
          function n2(e3) {
            r2 || (r2 = true, l.reject(t2, e3));
          }
          function i2(e3) {
            r2 || (r2 = true, l.resolve(t2, e3));
          }
          var s2 = p(function() {
            e2(i2, n2);
          });
          "error" === s2.status && n2(s2.value);
        }
        function p(e2, t2) {
          var r2 = {};
          try {
            r2.value = e2(t2), r2.status = "success";
          } catch (e3) {
            r2.status = "error", r2.value = e3;
          }
          return r2;
        }
        (t.exports = o).prototype.finally = function(t2) {
          if ("function" != typeof t2) return this;
          var r2 = this.constructor;
          return this.then(function(e2) {
            return r2.resolve(t2()).then(function() {
              return e2;
            });
          }, function(e2) {
            return r2.resolve(t2()).then(function() {
              throw e2;
            });
          });
        }, o.prototype.catch = function(e2) {
          return this.then(null, e2);
        }, o.prototype.then = function(e2, t2) {
          if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
          var r2 = new this.constructor(u);
          this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
          return r2;
        }, h.prototype.callFulfilled = function(e2) {
          l.resolve(this.promise, e2);
        }, h.prototype.otherCallFulfilled = function(e2) {
          f(this.promise, this.onFulfilled, e2);
        }, h.prototype.callRejected = function(e2) {
          l.reject(this.promise, e2);
        }, h.prototype.otherCallRejected = function(e2) {
          f(this.promise, this.onRejected, e2);
        }, l.resolve = function(e2, t2) {
          var r2 = p(c, t2);
          if ("error" === r2.status) return l.reject(e2, r2.value);
          var n2 = r2.value;
          if (n2) d(e2, n2);
          else {
            e2.state = a, e2.outcome = t2;
            for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
          }
          return e2;
        }, l.reject = function(e2, t2) {
          e2.state = s, e2.outcome = t2;
          for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
          return e2;
        }, o.resolve = function(e2) {
          if (e2 instanceof this) return e2;
          return l.resolve(new this(u), e2);
        }, o.reject = function(e2) {
          var t2 = new this(u);
          return l.reject(t2, e2);
        }, o.all = function(e2) {
          var r2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var n2 = e2.length, i2 = false;
          if (!n2) return this.resolve([]);
          var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
          for (; ++t2 < n2; ) h2(e2[t2], t2);
          return o2;
          function h2(e3, t3) {
            r2.resolve(e3).then(function(e4) {
              s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
            }, function(e4) {
              i2 || (i2 = true, l.reject(o2, e4));
            });
          }
        }, o.race = function(e2) {
          var t2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var r2 = e2.length, n2 = false;
          if (!r2) return this.resolve([]);
          var i2 = -1, s2 = new this(u);
          for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
            n2 || (n2 = true, l.resolve(s2, e3));
          }, function(e3) {
            n2 || (n2 = true, l.reject(s2, e3));
          });
          var a2;
          return s2;
        };
      }, { immediate: 36 }], 38: [function(e, t, r) {
        "use strict";
        var n = {};
        (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
        "use strict";
        var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
        function p(e2) {
          if (!(this instanceof p)) return new p(e2);
          this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
          var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
          if (r2 !== l) throw new Error(i[r2]);
          if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
            var n2;
            if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
            this._dict_set = true;
          }
        }
        function n(e2, t2) {
          var r2 = new p(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
          return r2.result;
        }
        p.prototype.push = function(e2, t2) {
          var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
          do {
            if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
            0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
          } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
          return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
        }, p.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, p.prototype.onEnd = function(e2) {
          e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, n(e2, t2);
        }, r.gzip = function(e2, t2) {
          return (t2 = t2 || {}).gzip = true, n(e2, t2);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
        "use strict";
        var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
        function a(e2) {
          if (!(this instanceof a)) return new a(e2);
          this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var r2 = c.inflateInit2(this.strm, t2.windowBits);
          if (r2 !== m.Z_OK) throw new Error(n[r2]);
          this.header = new s(), c.inflateGetHeader(this.strm, this.header);
        }
        function o(e2, t2) {
          var r2 = new a(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
          return r2.result;
        }
        a.prototype.push = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
          do {
            if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
            h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
          } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
          return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
        }, a.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, a.prototype.onEnd = function(e2) {
          e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, o(e2, t2);
        }, r.ungzip = o;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
        r.assign = function(e2) {
          for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
            var r2 = t2.shift();
            if (r2) {
              if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
              for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
            }
          }
          return e2;
        }, r.shrinkBuf = function(e2, t2) {
          return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
        };
        var i = { arraySet: function(e2, t2, r2, n2, i2) {
          if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
          else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          var t2, r2, n2, i2, s2, a;
          for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
          for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
          return a;
        } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
          for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          return [].concat.apply([], e2);
        } };
        r.setTyped = function(e2) {
          e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
        }, r.setTyped(n);
      }, {}], 42: [function(e, t, r) {
        "use strict";
        var h = e("./common"), i = true, s = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (e2) {
          i = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          s = false;
        }
        for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function l(e2, t2) {
          if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
          for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
          return r2;
        }
        u[254] = u[254] = 1, r.string2buf = function(e2) {
          var t2, r2, n2, i2, s2, a = e2.length, o = 0;
          for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
          return t2;
        }, r.buf2binstring = function(e2) {
          return l(e2, e2.length);
        }, r.binstring2buf = function(e2) {
          for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
          return t2;
        }, r.buf2string = function(e2, t2) {
          var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
          for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
          else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
          else {
            for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
            1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
          }
          return l(o, n2);
        }, r.utf8border = function(e2, t2) {
          var r2;
          for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
          return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
        };
      }, { "./common": 41 }], 43: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2, r2, n) {
          for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
            for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
            i %= 65521, s %= 65521;
          }
          return i | s << 16 | 0;
        };
      }, {}], 44: [function(e, t, r) {
        "use strict";
        t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(e, t, r) {
        "use strict";
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2, r2, n) {
          var i = o, s = n + r2;
          e2 ^= -1;
          for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
          return -1 ^ e2;
        };
      }, {}], 46: [function(e, t, r) {
        "use strict";
        var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
        function R(e2, t2) {
          return e2.msg = n[t2], t2;
        }
        function T(e2) {
          return (e2 << 1) - (4 < e2 ? 9 : 0);
        }
        function D(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        function F(e2) {
          var t2 = e2.state, r2 = t2.pending;
          r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
        }
        function N(e2, t2) {
          u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = t2;
        }
        function P(e2, t2) {
          e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
        }
        function L(e2, t2) {
          var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
          do {
            if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
              s2 += 2, r2++;
              do {
              } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
              if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              }
            }
          } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
          return a2 <= e2.lookahead ? a2 : e2.lookahead;
        }
        function j(e2) {
          var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
          do {
            if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
              for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              i2 += f2;
            }
            if (0 === e2.strm.avail_in) break;
            if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
          } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
        }
        function Z(e2, t2) {
          for (var r2, n2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
              for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
              e2.strstart++;
            } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
            else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
            if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function W(e2, t2) {
          for (var r2, n2, i2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
              for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
              if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            } else if (e2.match_available) {
              if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
            } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
          }
          return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function M(e2, t2, r2, n2, i2) {
          this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
        }
        function H() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function G(e2) {
          var t2;
          return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
        }
        function K(e2) {
          var t2 = G(e2);
          return t2 === m && (function(e3) {
            e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
          })(e2.state), t2;
        }
        function Y(e2, t2, r2, n2, i2, s2) {
          if (!e2) return _;
          var a2 = 1;
          if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
          8 === n2 && (n2 = 9);
          var o2 = new H();
          return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
        }
        h = [new M(0, 0, 0, 0, function(e2, t2) {
          var r2 = 65535;
          for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
            if (e2.lookahead <= 1) {
              if (j(e2), 0 === e2.lookahead && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            e2.strstart += e2.lookahead, e2.lookahead = 0;
            var n2 = e2.block_start + r2;
            if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
            if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
        }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
          return Y(e2, t2, v, 15, 8, 0);
        }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
          return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
        }, r.deflate = function(e2, t2) {
          var r2, n2, i2, s2;
          if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
          if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
          if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
          else {
            var a2 = v + (n2.w_bits - 8 << 4) << 8;
            a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
          }
          if (69 === n2.status) if (n2.gzhead.extra) {
            for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
          } else n2.status = 73;
          if (73 === n2.status) if (n2.gzhead.name) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
          } else n2.status = 91;
          if (91 === n2.status) if (n2.gzhead.comment) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
          } else n2.status = 103;
          if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
            if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
          } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
          if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
          if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
            var o2 = 2 === n2.strategy ? (function(e3, t3) {
              for (var r3; ; ) {
                if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                  if (t3 === l) return A;
                  break;
                }
                if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : 3 === n2.strategy ? (function(e3, t3) {
              for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                if (e3.lookahead <= S) {
                  if (j(e3), e3.lookahead <= S && t3 === l) return A;
                  if (0 === e3.lookahead) break;
                }
                if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                  s3 = e3.strstart + S;
                  do {
                  } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                  e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                }
                if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : h[n2.level].func(n2, t2);
            if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
            if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
          }
          return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
        }, r.deflateEnd = function(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
        }, r.deflateSetDictionary = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
          if (!e2 || !e2.state) return _;
          if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
          for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
            for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
            r2.strstart = n2, r2.lookahead = x - 1, j(r2);
          }
          return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
        }, r.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
      }, {}], 48: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2) {
          var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
          r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
          e: do {
            p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
            t: for (; ; ) {
              if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
              else {
                if (!(16 & y)) {
                  if (0 == (64 & y)) {
                    v = m[(65535 & v) + (d & (1 << y) - 1)];
                    continue t;
                  }
                  if (32 & y) {
                    r2.mode = 12;
                    break e;
                  }
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break e;
                }
                w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                r: for (; ; ) {
                  if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                    if (0 == (64 & y)) {
                      v = _[(65535 & v) + (d & (1 << y) - 1)];
                      continue r;
                    }
                    e2.msg = "invalid distance code", r2.mode = 30;
                    break e;
                  }
                  if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break e;
                  }
                  if (d >>>= y, p -= y, (y = s - a) < k) {
                    if (l < (y = k - y) && r2.sane) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (S = c, (x = 0) === f) {
                      if (x += u - y, y < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        x = s - k, S = C;
                      }
                    } else if (f < y) {
                      if (x += u + f - y, (y -= f) < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        if (x = 0, f < w) {
                          for (w -= y = f; C[s++] = c[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                      }
                    } else if (x += f - y, y < w) {
                      for (w -= y; C[s++] = c[x++], --y; ) ;
                      x = s - k, S = C;
                    }
                    for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                    w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                  } else {
                    for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                    w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (n < i && s < o);
          n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
        };
      }, {}], 49: [function(e, t, r) {
        "use strict";
        var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
        function L(e2) {
          return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        }
        function s() {
          this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function a(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
        }
        function o(e2) {
          var t2;
          return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
        }
        function h(e2, t2) {
          var r2, n2;
          return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
        }
        function u(e2, t2) {
          var r2, n2;
          return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
        }
        var l, f, c = true;
        function j(e2) {
          if (c) {
            var t2;
            for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
            for (; t2 < 256; ) e2.lens[t2++] = 9;
            for (; t2 < 280; ) e2.lens[t2++] = 7;
            for (; t2 < 288; ) e2.lens[t2++] = 8;
            for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
            T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
          }
          e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
        }
        function Z(e2, t2, r2, n2) {
          var i2, s2 = e2.state;
          return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
        }
        r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
          return u(e2, 15);
        }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
          12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
          e: for (; ; ) switch (r2.mode) {
            case P:
              if (0 === r2.wrap) {
                r2.mode = 13;
                break;
              }
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (2 & r2.wrap && 35615 === u2) {
                E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                break;
              }
              if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                e2.msg = "incorrect header check", r2.mode = 30;
                break;
              }
              if (8 != (15 & u2)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
              else if (k > r2.wbits) {
                e2.msg = "invalid window size", r2.mode = 30;
                break;
              }
              r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
              break;
            case 2:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.flags = u2, 8 != (255 & r2.flags)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (57344 & r2.flags) {
                e2.msg = "unknown header flags set", r2.mode = 30;
                break;
              }
              r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
            case 3:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
            case 4:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
            case 5:
              if (1024 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
              } else r2.head && (r2.head.extra = null);
              r2.mode = 6;
            case 6:
              if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
              r2.length = 0, r2.mode = 7;
            case 7:
              if (2048 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.name = null);
              r2.length = 0, r2.mode = 8;
            case 8:
              if (4096 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.comment = null);
              r2.mode = 9;
            case 9:
              if (512 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (65535 & r2.check)) {
                  e2.msg = "header crc mismatch", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
              break;
            case 10:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
            case 11:
              if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
              e2.adler = r2.check = 1, r2.mode = 12;
            case 12:
              if (5 === t2 || 6 === t2) break e;
            case 13:
              if (r2.last) {
                u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                break;
              }
              for (; l2 < 3; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                case 0:
                  r2.mode = 14;
                  break;
                case 1:
                  if (j(r2), r2.mode = 20, 6 !== t2) break;
                  u2 >>>= 2, l2 -= 2;
                  break e;
                case 2:
                  r2.mode = 17;
                  break;
                case 3:
                  e2.msg = "invalid block type", r2.mode = 30;
              }
              u2 >>>= 2, l2 -= 2;
              break;
            case 14:
              for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                e2.msg = "invalid stored block lengths", r2.mode = 30;
                break;
              }
              if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
            case 15:
              r2.mode = 16;
            case 16:
              if (d = r2.length) {
                if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                break;
              }
              r2.mode = 12;
              break;
            case 17:
              for (; l2 < 14; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                e2.msg = "too many length or distance symbols", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 18;
            case 18:
              for (; r2.have < r2.ncode; ) {
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
              }
              for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
              if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid code lengths set", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 19;
            case 19:
              for (; r2.have < r2.nlen + r2.ndist; ) {
                for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                else {
                  if (16 === b) {
                    for (z = _ + 2; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                  } else if (17 === b) {
                    for (z = _ + 3; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                  } else {
                    for (z = _ + 7; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                  }
                  if (r2.have + d > r2.nlen + r2.ndist) {
                    e2.msg = "invalid bit length repeat", r2.mode = 30;
                    break;
                  }
                  for (; d--; ) r2.lens[r2.have++] = k;
                }
              }
              if (30 === r2.mode) break;
              if (0 === r2.lens[256]) {
                e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                break;
              }
              if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid literal/lengths set", r2.mode = 30;
                break;
              }
              if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                e2.msg = "invalid distances set", r2.mode = 30;
                break;
              }
              if (r2.mode = 20, 6 === t2) break e;
            case 20:
              r2.mode = 21;
            case 21:
              if (6 <= o2 && 258 <= h2) {
                e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                break;
              }
              for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (g && 0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                r2.mode = 26;
                break;
              }
              if (32 & g) {
                r2.back = -1, r2.mode = 12;
                break;
              }
              if (64 & g) {
                e2.msg = "invalid literal/length code", r2.mode = 30;
                break;
              }
              r2.extra = 15 & g, r2.mode = 22;
            case 22:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              r2.was = r2.length, r2.mode = 23;
            case 23:
              for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                e2.msg = "invalid distance code", r2.mode = 30;
                break;
              }
              r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
            case 24:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              if (r2.offset > r2.dmax) {
                e2.msg = "invalid distance too far back", r2.mode = 30;
                break;
              }
              r2.mode = 25;
            case 25:
              if (0 === h2) break e;
              if (d = c2 - h2, r2.offset > d) {
                if ((d = r2.offset - d) > r2.whave && r2.sane) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
              } else m = i2, p = a2 - r2.offset, d = r2.length;
              for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
              0 === r2.length && (r2.mode = 21);
              break;
            case 26:
              if (0 === h2) break e;
              i2[a2++] = r2.length, h2--, r2.mode = 21;
              break;
            case 27:
              if (r2.wrap) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 |= n2[s2++] << l2, l2 += 8;
                }
                if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                  e2.msg = "incorrect data check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 28;
            case 28:
              if (r2.wrap && r2.flags) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (4294967295 & r2.total)) {
                  e2.msg = "incorrect length check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 29;
            case 29:
              x = 1;
              break e;
            case 30:
              x = -3;
              break e;
            case 31:
              return -4;
            case 32:
            default:
              return U;
          }
          return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
        }, r.inflateEnd = function(e2) {
          if (!e2 || !e2.state) return U;
          var t2 = e2.state;
          return t2.window && (t2.window = null), e2.state = null, N;
        }, r.inflateGetHeader = function(e2, t2) {
          var r2;
          return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
        }, r.inflateSetDictionary = function(e2, t2) {
          var r2, n2 = t2.length;
          return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
        }, r.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
        "use strict";
        var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        t.exports = function(e2, t2, r2, n, i, s, a, o) {
          var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
          for (b = 0; b <= 15; b++) O[b] = 0;
          for (v = 0; v < n; v++) O[t2[r2 + v]]++;
          for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
          if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
          for (y = 1; y < w && 0 === O[y]; y++) ;
          for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
          if (0 < z && (0 === e2 || 1 !== w)) return -1;
          for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
          for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
          if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
          for (; ; ) {
            for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
            for (h = 1 << b - 1; E & h; ) h >>= 1;
            if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
              if (b === w) break;
              b = t2[r2 + a[v]];
            }
            if (k < b && (E & f) !== l) {
              for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
              if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
              i[l = E & f] = k << 24 | x << 16 | c - s | 0;
            }
          }
          return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(e, t, r) {
        "use strict";
        t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(e, t, r) {
        "use strict";
        var i = e("../utils/common"), o = 0, h = 1;
        function n(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
        n(z);
        var C = new Array(2 * f);
        n(C);
        var E = new Array(512);
        n(E);
        var A = new Array(256);
        n(A);
        var I = new Array(a);
        n(I);
        var O, B, R, T = new Array(f);
        function D(e2, t2, r2, n2, i2) {
          this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
        }
        function F(e2, t2) {
          this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
        }
        function N(e2) {
          return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
        }
        function P(e2, t2, r2) {
          e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
        }
        function L(e2, t2, r2) {
          P(e2, r2[2 * t2], r2[2 * t2 + 1]);
        }
        function j(e2, t2) {
          for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
          return r2 >>> 1;
        }
        function Z(e2, t2, r2) {
          var n2, i2, s2 = new Array(g + 1), a2 = 0;
          for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
          for (i2 = 0; i2 <= t2; i2++) {
            var o2 = e2[2 * i2 + 1];
            0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
          }
        }
        function W(e2) {
          var t2;
          for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
          for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
          for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
          e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
        }
        function M(e2) {
          8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
        }
        function H(e2, t2, r2, n2) {
          var i2 = 2 * t2, s2 = 2 * r2;
          return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
        }
        function G(e2, t2, r2) {
          for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
          e2.heap[r2] = n2;
        }
        function K(e2, t2, r2) {
          var n2, i2, s2, a2, o2 = 0;
          if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
          L(e2, m, t2);
        }
        function Y(e2, t2) {
          var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
          for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
          for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
          for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
          for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
          e2.heap[--e2.heap_max] = e2.heap[1], (function(e3, t3) {
            var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
            for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
            for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
            if (0 !== m2) {
              do {
                for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
              } while (0 < m2);
              for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
            }
          })(e2, t2), Z(s2, u2, e2.bl_count);
        }
        function X(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
        }
        function V(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
            if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
            else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
            s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
          }
        }
        n(T);
        var q = false;
        function J(e2, t2, r2, n2) {
          P(e2, (s << 1) + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
          })(e2, t2, r2, true);
        }
        r._tr_init = function(e2) {
          q || ((function() {
            var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
            for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
            for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
            for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
            for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
            for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
            for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
            for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
            O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
          })(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
        }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
          var i2, s2, a2 = 0;
          0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = (function(e3) {
            var t3, r3 = 4093624447;
            for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
            if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
            for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
            return o;
          })(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = (function(e3) {
            var t3;
            for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
            return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
          })(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            var i3;
            for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
            V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
          })(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
        }, r._tr_tally = function(e2, t2, r2) {
          return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
        }, r._tr_align = function(e2) {
          P(e2, 2, 3), L(e2, m, z), (function(e3) {
            16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
          })(e2);
        };
      }, { "../utils/common": 41 }], 53: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(e, t, r) {
        (function(e2) {
          !(function(r2, n) {
            "use strict";
            if (!r2.setImmediate) {
              var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
              e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                process.nextTick(function() {
                  c(e4);
                });
              } : (function() {
                if (r2.postMessage && !r2.importScripts) {
                  var e4 = true, t3 = r2.onmessage;
                  return r2.onmessage = function() {
                    e4 = false;
                  }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                }
              })() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                r2.postMessage(a + e4, "*");
              }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                c(e4.data);
              }, function(e4) {
                t2.port2.postMessage(e4);
              }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                var t3 = l.createElement("script");
                t3.onreadystatechange = function() {
                  c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                }, s.appendChild(t3);
              }) : function(e4) {
                setTimeout(c, 0, e4);
              }, e3.setImmediate = function(e4) {
                "function" != typeof e4 && (e4 = new Function("" + e4));
                for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                var n2 = { callback: e4, args: t3 };
                return h[o] = n2, i(o), o++;
              }, e3.clearImmediate = f;
            }
            function f(e4) {
              delete h[e4];
            }
            function c(e4) {
              if (u) setTimeout(c, 0, e4);
              else {
                var t3 = h[e4];
                if (t3) {
                  u = true;
                  try {
                    !(function(e5) {
                      var t4 = e5.callback, r3 = e5.args;
                      switch (r3.length) {
                        case 0:
                          t4();
                          break;
                        case 1:
                          t4(r3[0]);
                          break;
                        case 2:
                          t4(r3[0], r3[1]);
                          break;
                        case 3:
                          t4(r3[0], r3[1], r3[2]);
                          break;
                        default:
                          t4.apply(n, r3);
                      }
                    })(t3);
                  } finally {
                    f(e4), u = false;
                  }
                }
              }
            }
            function d(e4) {
              e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
            }
          })("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}] }, {}, [10])(10);
    });
  }
});

// src/app/src/iPad/IO.ts
var import_jszip = __toESM(require_jszip_min());

// node_modules/@formatjs/fast-memoize/index.js
function memoize(fn, options) {
  const cache = options && options.cache ? options.cache : cacheDefault;
  const serializer = options && options.serializer ? options.serializer : serializerDefault;
  return (options && options.strategy ? options.strategy : strategyDefault)(fn, {
    cache,
    serializer
  });
}
function isPrimitive(value) {
  return value == null || typeof value === "number" || typeof value === "boolean";
}
function monadic(fn, cache, serializer, arg) {
  const cacheKey = isPrimitive(arg) ? arg : serializer(arg);
  let computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.call(this, arg);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function variadic(fn, cache, serializer) {
  const args = Array.prototype.slice.call(arguments, 3);
  const cacheKey = serializer(args);
  let computedValue = cache.get(cacheKey);
  if (typeof computedValue === "undefined") {
    computedValue = fn.apply(this, args);
    cache.set(cacheKey, computedValue);
  }
  return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
  return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
  const strategy = fn.length === 1 ? monadic : variadic;
  return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
  return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
function strategyMonadic(fn, options) {
  return assemble(fn, this, monadic, options.cache.create(), options.serializer);
}
var serializerDefault = function() {
  return JSON.stringify(arguments);
};
var ObjectWithoutPrototypeCache = class {
  constructor() {
    this.cache = /* @__PURE__ */ Object.create(null);
  }
  get(key) {
    return this.cache[key];
  }
  set(key, value) {
    this.cache[key] = value;
  }
};
var cacheDefault = { create: function create() {
  return new ObjectWithoutPrototypeCache();
} };
var strategies = {
  variadic: strategyVariadic,
  monadic: strategyMonadic
};

// node_modules/@formatjs/icu-skeleton-parser/index.js
var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
function parseDateTimeSkeleton(skeleton) {
  const result = {};
  skeleton.replace(DATE_TIME_REGEX, (match) => {
    const len = match.length;
    switch (match[0]) {
      case "G":
        result.era = len === 4 ? "long" : len === 5 ? "narrow" : "short";
        break;
      case "y":
        result.year = len === 2 ? "2-digit" : "numeric";
        break;
      case "Y":
      case "u":
      case "U":
      case "r":
        throw new RangeError("`Y/u/U/r` (year) patterns are not supported, use `y` instead");
      case "q":
      case "Q":
        throw new RangeError("`q/Q` (quarter) patterns are not supported");
      case "M":
      case "L":
        result.month = [
          "numeric",
          "2-digit",
          "short",
          "long",
          "narrow"
        ][len - 1];
        break;
      case "w":
      case "W":
        throw new RangeError("`w/W` (week) patterns are not supported");
      case "d":
        result.day = ["numeric", "2-digit"][len - 1];
        break;
      case "D":
      case "F":
      case "g":
        throw new RangeError("`D/F/g` (day) patterns are not supported, use `d` instead");
      case "E":
        result.weekday = len === 4 ? "long" : len === 5 ? "narrow" : "short";
        break;
      case "e":
        if (len < 4) throw new RangeError("`e..eee` (weekday) patterns are not supported");
        result.weekday = [
          "short",
          "long",
          "narrow",
          "short"
        ][len - 3];
        break;
      case "c":
        if (len < 4) throw new RangeError("`c..ccc` (weekday) patterns are not supported");
        result.weekday = [
          "short",
          "long",
          "narrow",
          "short"
        ][len - 3];
        break;
      case "a":
        result.hour12 = true;
        break;
      case "b":
      case "B":
        throw new RangeError("`b/B` (period) patterns are not supported, use `a` instead");
      case "h":
        result.hourCycle = "h12";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "H":
        result.hourCycle = "h23";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "K":
        result.hourCycle = "h11";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "k":
        result.hourCycle = "h24";
        result.hour = ["numeric", "2-digit"][len - 1];
        break;
      case "j":
      case "J":
      case "C":
        throw new RangeError("`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead");
      case "m":
        result.minute = ["numeric", "2-digit"][len - 1];
        break;
      case "s":
        result.second = ["numeric", "2-digit"][len - 1];
        break;
      case "S":
      case "A":
        throw new RangeError("`S/A` (second) patterns are not supported, use `s` instead");
      case "z":
        result.timeZoneName = len < 4 ? "short" : "long";
        break;
      case "Z":
      case "O":
      case "v":
      case "V":
      case "X":
      case "x":
        throw new RangeError("`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead");
    }
    return "";
  });
  return result;
}
var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;
function parseNumberSkeletonFromString(skeleton) {
  if (skeleton.length === 0) throw new Error("Number skeleton cannot be empty");
  const stringTokens = skeleton.split(WHITE_SPACE_REGEX).filter((x) => x.length > 0);
  const tokens = [];
  for (const stringToken of stringTokens) {
    let stemAndOptions = stringToken.split("/");
    if (stemAndOptions.length === 0) throw new Error("Invalid number skeleton");
    const [stem, ...options] = stemAndOptions;
    for (const option of options) if (option.length === 0) throw new Error("Invalid number skeleton");
    tokens.push({
      stem,
      options
    });
  }
  return tokens;
}
function icuUnitToEcma(unit) {
  return unit.replace(/^(.*?)-/, "");
}
var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
function parseSignificantPrecision(str) {
  const result = {};
  if (str[str.length - 1] === "r") result.roundingPriority = "morePrecision";
  else if (str[str.length - 1] === "s") result.roundingPriority = "lessPrecision";
  str.replace(SIGNIFICANT_PRECISION_REGEX, function(_, g1, g2) {
    if (typeof g2 !== "string") {
      result.minimumSignificantDigits = g1.length;
      result.maximumSignificantDigits = g1.length;
    } else if (g2 === "+") result.minimumSignificantDigits = g1.length;
    else if (g1[0] === "#") result.maximumSignificantDigits = g1.length;
    else {
      result.minimumSignificantDigits = g1.length;
      result.maximumSignificantDigits = g1.length + (typeof g2 === "string" ? g2.length : 0);
    }
    return "";
  });
  return result;
}
function parseSign(str) {
  switch (str) {
    case "sign-auto":
      return { signDisplay: "auto" };
    case "sign-accounting":
    case "()":
      return { currencySign: "accounting" };
    case "sign-always":
    case "+!":
      return { signDisplay: "always" };
    case "sign-accounting-always":
    case "()!":
      return {
        signDisplay: "always",
        currencySign: "accounting"
      };
    case "sign-except-zero":
    case "+?":
      return { signDisplay: "exceptZero" };
    case "sign-accounting-except-zero":
    case "()?":
      return {
        signDisplay: "exceptZero",
        currencySign: "accounting"
      };
    case "sign-never":
    case "+_":
      return { signDisplay: "never" };
  }
}
function parseConciseScientificAndEngineeringStem(stem) {
  let result;
  if (stem[0] === "E" && stem[1] === "E") {
    result = { notation: "engineering" };
    stem = stem.slice(2);
  } else if (stem[0] === "E") {
    result = { notation: "scientific" };
    stem = stem.slice(1);
  }
  if (result) {
    const signDisplay = stem.slice(0, 2);
    if (signDisplay === "+!") {
      result.signDisplay = "always";
      stem = stem.slice(2);
    } else if (signDisplay === "+?") {
      result.signDisplay = "exceptZero";
      stem = stem.slice(2);
    }
    if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) throw new Error("Malformed concise eng/scientific notation");
    result.minimumIntegerDigits = stem.length;
  }
  return result;
}
function parseNotationOptions(opt) {
  const result = {};
  const signOpts = parseSign(opt);
  if (signOpts) return signOpts;
  return result;
}
function parseNumberSkeleton(tokens) {
  let result = {};
  for (const token of tokens) {
    switch (token.stem) {
      case "percent":
      case "%":
        result.style = "percent";
        continue;
      case "%x100":
        result.style = "percent";
        result.scale = 100;
        continue;
      case "currency":
        result.style = "currency";
        result.currency = token.options[0];
        continue;
      case "group-off":
      case ",_":
        result.useGrouping = false;
        continue;
      case "precision-integer":
      case ".":
        result.maximumFractionDigits = 0;
        continue;
      case "measure-unit":
      case "unit":
        result.style = "unit";
        result.unit = icuUnitToEcma(token.options[0]);
        continue;
      case "compact-short":
      case "K":
        result.notation = "compact";
        result.compactDisplay = "short";
        continue;
      case "compact-long":
      case "KK":
        result.notation = "compact";
        result.compactDisplay = "long";
        continue;
      case "scientific":
        result = {
          ...result,
          notation: "scientific",
          ...token.options.reduce((all, opt) => ({
            ...all,
            ...parseNotationOptions(opt)
          }), {})
        };
        continue;
      case "engineering":
        result = {
          ...result,
          notation: "engineering",
          ...token.options.reduce((all, opt) => ({
            ...all,
            ...parseNotationOptions(opt)
          }), {})
        };
        continue;
      case "notation-simple":
        result.notation = "standard";
        continue;
      case "unit-width-narrow":
        result.currencyDisplay = "narrowSymbol";
        result.unitDisplay = "narrow";
        continue;
      case "unit-width-short":
        result.currencyDisplay = "code";
        result.unitDisplay = "short";
        continue;
      case "unit-width-full-name":
        result.currencyDisplay = "name";
        result.unitDisplay = "long";
        continue;
      case "unit-width-iso-code":
        result.currencyDisplay = "symbol";
        continue;
      case "scale":
        result.scale = parseFloat(token.options[0]);
        continue;
      case "rounding-mode-floor":
        result.roundingMode = "floor";
        continue;
      case "rounding-mode-ceiling":
        result.roundingMode = "ceil";
        continue;
      case "rounding-mode-down":
        result.roundingMode = "trunc";
        continue;
      case "rounding-mode-up":
        result.roundingMode = "expand";
        continue;
      case "rounding-mode-half-even":
        result.roundingMode = "halfEven";
        continue;
      case "rounding-mode-half-down":
        result.roundingMode = "halfTrunc";
        continue;
      case "rounding-mode-half-up":
        result.roundingMode = "halfExpand";
        continue;
      case "integer-width":
        if (token.options.length > 1) throw new RangeError("integer-width stems only accept a single optional option");
        token.options[0].replace(INTEGER_WIDTH_REGEX, function(_, g1, g2, g3, g4, g5) {
          if (g1) result.minimumIntegerDigits = g2.length;
          else if (g3 && g4) throw new Error("We currently do not support maximum integer digits");
          else if (g5) throw new Error("We currently do not support exact integer digits");
          return "";
        });
        continue;
    }
    if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
      result.minimumIntegerDigits = token.stem.length;
      continue;
    }
    if (FRACTION_PRECISION_REGEX.test(token.stem)) {
      if (token.options.length > 1) throw new RangeError("Fraction-precision stems only accept a single optional option");
      token.stem.replace(FRACTION_PRECISION_REGEX, function(_, g1, g2, g3, g4, g5) {
        if (g2 === "*") result.minimumFractionDigits = g1.length;
        else if (g3 && g3[0] === "#") result.maximumFractionDigits = g3.length;
        else if (g4 && g5) {
          result.minimumFractionDigits = g4.length;
          result.maximumFractionDigits = g4.length + g5.length;
        } else {
          result.minimumFractionDigits = g1.length;
          result.maximumFractionDigits = g1.length;
        }
        return "";
      });
      const opt = token.options[0];
      if (opt === "w") result = {
        ...result,
        trailingZeroDisplay: "stripIfInteger"
      };
      else if (opt) result = {
        ...result,
        ...parseSignificantPrecision(opt)
      };
      continue;
    }
    if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
      result = {
        ...result,
        ...parseSignificantPrecision(token.stem)
      };
      continue;
    }
    const signOpts = parseSign(token.stem);
    if (signOpts) result = {
      ...result,
      ...signOpts
    };
    const conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
    if (conciseScientificAndEngineeringOpts) result = {
      ...result,
      ...conciseScientificAndEngineeringOpts
    };
  }
  return result;
}

// node_modules/@formatjs/icu-messageformat-parser/index.js
var ErrorKind = /* @__PURE__ */ (function(ErrorKind2) {
  ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
  ErrorKind2[ErrorKind2["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
  ErrorKind2[ErrorKind2["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
  ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
  ErrorKind2[ErrorKind2["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
  ErrorKind2[ErrorKind2["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
  ErrorKind2[ErrorKind2["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
  ErrorKind2[ErrorKind2["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
  ErrorKind2[ErrorKind2["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
  ErrorKind2[ErrorKind2["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
  ErrorKind2[ErrorKind2["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
  ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
  ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
  ErrorKind2[ErrorKind2["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
  ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
  ErrorKind2[ErrorKind2["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
  ErrorKind2[ErrorKind2["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
  ErrorKind2[ErrorKind2["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
  ErrorKind2[ErrorKind2["INVALID_TAG"] = 23] = "INVALID_TAG";
  ErrorKind2[ErrorKind2["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
  ErrorKind2[ErrorKind2["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
  ErrorKind2[ErrorKind2["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
  return ErrorKind2;
})({});
function isLiteralElement(el) {
  return el.type === 0;
}
function isArgumentElement(el) {
  return el.type === 1;
}
function isNumberElement(el) {
  return el.type === 2;
}
function isDateElement(el) {
  return el.type === 3;
}
function isTimeElement(el) {
  return el.type === 4;
}
function isSelectElement(el) {
  return el.type === 5;
}
function isPluralElement(el) {
  return el.type === 6;
}
function isPoundElement(el) {
  return el.type === 7;
}
function isTagElement(el) {
  return el.type === 8;
}
function isNumberSkeleton(el) {
  return !!(el && typeof el === "object" && el.type === 0);
}
function isDateTimeSkeleton(el) {
  return !!(el && typeof el === "object" && el.type === 1);
}
var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;
var timeData = {
  "001": ["H", "h"],
  "419": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "AC": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "AD": ["H", "hB"],
  "AE": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "AF": [
    "H",
    "hb",
    "hB",
    "h"
  ],
  "AG": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "AI": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "AL": [
    "h",
    "H",
    "hB"
  ],
  "AM": ["H", "hB"],
  "AO": ["H", "hB"],
  "AR": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "AS": ["h", "H"],
  "AT": ["H", "hB"],
  "AU": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "AW": ["H", "hB"],
  "AX": ["H"],
  "AZ": [
    "H",
    "hB",
    "h"
  ],
  "BA": [
    "H",
    "hB",
    "h"
  ],
  "BB": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "BD": [
    "h",
    "hB",
    "H"
  ],
  "BE": ["H", "hB"],
  "BF": ["H", "hB"],
  "BG": [
    "H",
    "hB",
    "h"
  ],
  "BH": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "BI": ["H", "h"],
  "BJ": ["H", "hB"],
  "BL": ["H", "hB"],
  "BM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "BN": [
    "hb",
    "hB",
    "h",
    "H"
  ],
  "BO": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "BQ": ["H"],
  "BR": ["H", "hB"],
  "BS": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "BT": ["h", "H"],
  "BW": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "BY": ["H", "h"],
  "BZ": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "CA": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "CC": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "CD": ["hB", "H"],
  "CF": [
    "H",
    "h",
    "hB"
  ],
  "CG": ["H", "hB"],
  "CH": [
    "H",
    "hB",
    "h"
  ],
  "CI": ["H", "hB"],
  "CK": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "CL": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "CM": [
    "H",
    "h",
    "hB"
  ],
  "CN": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "CO": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "CP": ["H"],
  "CR": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "CU": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "CV": ["H", "hB"],
  "CW": ["H", "hB"],
  "CX": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "CY": [
    "h",
    "H",
    "hb",
    "hB"
  ],
  "CZ": ["H"],
  "DE": ["H", "hB"],
  "DG": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "DJ": ["h", "H"],
  "DK": ["H"],
  "DM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "DO": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "DZ": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "EA": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "EC": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "EE": ["H", "hB"],
  "EG": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "EH": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "ER": ["h", "H"],
  "ES": [
    "H",
    "hB",
    "h",
    "hb"
  ],
  "ET": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "FI": ["H"],
  "FJ": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "FK": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "FM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "FO": ["H", "h"],
  "FR": ["H", "hB"],
  "GA": ["H", "hB"],
  "GB": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "GD": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "GE": [
    "H",
    "hB",
    "h"
  ],
  "GF": ["H", "hB"],
  "GG": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "GH": ["h", "H"],
  "GI": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "GL": ["H", "h"],
  "GM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "GN": ["H", "hB"],
  "GP": ["H", "hB"],
  "GQ": [
    "H",
    "hB",
    "h",
    "hb"
  ],
  "GR": [
    "h",
    "H",
    "hb",
    "hB"
  ],
  "GS": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "GT": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "GU": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "GW": ["H", "hB"],
  "GY": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "HK": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "HN": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "HR": ["H", "hB"],
  "HU": ["H", "h"],
  "IC": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "ID": ["H"],
  "IE": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "IL": ["H", "hB"],
  "IM": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "IN": ["h", "H"],
  "IO": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "IQ": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "IR": ["hB", "H"],
  "IS": ["H"],
  "IT": ["H", "hB"],
  "JE": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "JM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "JO": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "JP": [
    "H",
    "K",
    "h"
  ],
  "KE": [
    "hB",
    "hb",
    "H",
    "h"
  ],
  "KG": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "KH": [
    "hB",
    "h",
    "H",
    "hb"
  ],
  "KI": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "KM": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "KN": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "KP": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "KR": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "KW": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "KY": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "KZ": ["H", "hB"],
  "LA": [
    "H",
    "hb",
    "hB",
    "h"
  ],
  "LB": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "LC": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "LI": [
    "H",
    "hB",
    "h"
  ],
  "LK": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "LR": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "LS": ["h", "H"],
  "LT": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "LU": [
    "H",
    "h",
    "hB"
  ],
  "LV": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "LY": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "MA": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "MC": ["H", "hB"],
  "MD": ["H", "hB"],
  "ME": [
    "H",
    "hB",
    "h"
  ],
  "MF": ["H", "hB"],
  "MG": ["H", "h"],
  "MH": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "MK": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "ML": ["H"],
  "MM": [
    "hB",
    "hb",
    "H",
    "h"
  ],
  "MN": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "MO": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "MP": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "MQ": ["H", "hB"],
  "MR": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "MS": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "MT": ["H", "h"],
  "MU": ["H", "h"],
  "MV": ["H", "h"],
  "MW": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "MX": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "MY": [
    "hb",
    "hB",
    "h",
    "H"
  ],
  "MZ": ["H", "hB"],
  "NA": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "NC": ["H", "hB"],
  "NE": ["H"],
  "NF": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NG": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NI": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "NL": ["H", "hB"],
  "NO": ["H", "h"],
  "NP": [
    "H",
    "h",
    "hB"
  ],
  "NR": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NU": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "NZ": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "OM": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "PA": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "PE": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "PF": [
    "H",
    "h",
    "hB"
  ],
  "PG": ["h", "H"],
  "PH": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "PK": [
    "h",
    "hB",
    "H"
  ],
  "PL": ["H", "h"],
  "PM": ["H", "hB"],
  "PN": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "PR": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "PS": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "PT": ["H", "hB"],
  "PW": ["h", "H"],
  "PY": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "QA": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "RE": ["H", "hB"],
  "RO": ["H", "hB"],
  "RS": [
    "H",
    "hB",
    "h"
  ],
  "RU": ["H"],
  "RW": ["H", "h"],
  "SA": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "SB": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SC": [
    "H",
    "h",
    "hB"
  ],
  "SD": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "SE": ["H"],
  "SG": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SH": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "SI": ["H", "hB"],
  "SJ": ["H"],
  "SK": ["H"],
  "SL": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "SM": [
    "H",
    "h",
    "hB"
  ],
  "SN": [
    "H",
    "h",
    "hB"
  ],
  "SO": ["h", "H"],
  "SR": ["H", "hB"],
  "SS": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "ST": ["H", "hB"],
  "SV": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "SX": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "SY": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "SZ": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "TA": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "TC": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "TD": [
    "h",
    "H",
    "hB"
  ],
  "TF": [
    "H",
    "h",
    "hB"
  ],
  "TG": ["H", "hB"],
  "TH": ["H", "h"],
  "TJ": ["H", "h"],
  "TL": [
    "H",
    "hB",
    "hb",
    "h"
  ],
  "TM": ["H", "h"],
  "TN": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "TO": ["h", "H"],
  "TR": ["H", "hB"],
  "TT": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "TW": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "TZ": [
    "hB",
    "hb",
    "H",
    "h"
  ],
  "UA": [
    "H",
    "hB",
    "h"
  ],
  "UG": [
    "hB",
    "hb",
    "H",
    "h"
  ],
  "UM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "US": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "UY": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "UZ": [
    "H",
    "hB",
    "h"
  ],
  "VA": [
    "H",
    "h",
    "hB"
  ],
  "VC": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "VE": [
    "h",
    "H",
    "hB",
    "hb"
  ],
  "VG": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "VI": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "VN": ["H", "h"],
  "VU": ["h", "H"],
  "WF": ["H", "hB"],
  "WS": ["h", "H"],
  "XK": [
    "H",
    "hB",
    "h"
  ],
  "YE": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "YT": ["H", "hB"],
  "ZA": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "ZM": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "ZW": ["H", "h"],
  "af-ZA": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "ar-001": [
    "h",
    "hB",
    "hb",
    "H"
  ],
  "ca-ES": [
    "H",
    "h",
    "hB"
  ],
  "en-001": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "en-HK": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "en-IL": [
    "H",
    "h",
    "hb",
    "hB"
  ],
  "en-MY": [
    "h",
    "hb",
    "H",
    "hB"
  ],
  "es-BR": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-ES": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "es-GQ": [
    "H",
    "h",
    "hB",
    "hb"
  ],
  "fr-CA": [
    "H",
    "h",
    "hB"
  ],
  "gl-ES": [
    "H",
    "h",
    "hB"
  ],
  "gu-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "hi-IN": [
    "hB",
    "h",
    "H"
  ],
  "it-CH": [
    "H",
    "h",
    "hB"
  ],
  "it-IT": [
    "H",
    "h",
    "hB"
  ],
  "kn-IN": [
    "hB",
    "h",
    "H"
  ],
  "ku-SY": ["H", "hB"],
  "ml-IN": [
    "hB",
    "h",
    "H"
  ],
  "mr-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "pa-IN": [
    "hB",
    "hb",
    "h",
    "H"
  ],
  "ta-IN": [
    "hB",
    "h",
    "hb",
    "H"
  ],
  "te-IN": [
    "hB",
    "h",
    "H"
  ],
  "zu-ZA": [
    "H",
    "hB",
    "hb",
    "h"
  ]
};
function getBestPattern(skeleton, locale) {
  let skeletonCopy = "";
  for (let patternPos = 0; patternPos < skeleton.length; patternPos++) {
    const patternChar = skeleton.charAt(patternPos);
    if (patternChar === "j") {
      let extraLength = 0;
      while (patternPos + 1 < skeleton.length && skeleton.charAt(patternPos + 1) === patternChar) {
        extraLength++;
        patternPos++;
      }
      let hourLen = 1 + (extraLength & 1);
      let dayPeriodLen = extraLength < 2 ? 1 : 3 + (extraLength >> 1);
      let dayPeriodChar = "a";
      let hourChar = getDefaultHourSymbolFromLocale(locale);
      if (hourChar == "H" || hourChar == "k") dayPeriodLen = 0;
      while (dayPeriodLen-- > 0) skeletonCopy += dayPeriodChar;
      while (hourLen-- > 0) skeletonCopy = hourChar + skeletonCopy;
    } else if (patternChar === "J") skeletonCopy += "H";
    else skeletonCopy += patternChar;
  }
  return skeletonCopy;
}
function getDefaultHourSymbolFromLocale(locale) {
  let hourCycle = locale.hourCycle;
  if (hourCycle === void 0 && locale.hourCycles && locale.hourCycles.length) hourCycle = locale.hourCycles[0];
  if (hourCycle) switch (hourCycle) {
    case "h24":
      return "k";
    case "h23":
      return "H";
    case "h12":
      return "h";
    case "h11":
      return "K";
    default:
      throw new Error("Invalid hourCycle");
  }
  const languageTag = locale.language;
  let regionTag;
  if (languageTag !== "root") regionTag = locale.maximize().region;
  return (timeData[regionTag || ""] || timeData[languageTag || ""] || timeData[`${languageTag}-001`] || timeData["001"])[0];
}
var SPACE_SEPARATOR_START_REGEX = new RegExp(`^${SPACE_SEPARATOR_REGEX.source}*`);
var SPACE_SEPARATOR_END_REGEX = new RegExp(`${SPACE_SEPARATOR_REGEX.source}*$`);
function createLocation(start, end) {
  return {
    start,
    end
  };
}
var hasNativeFromEntries = !!Object.fromEntries;
var hasTrimStart = !!String.prototype.trimStart;
var hasTrimEnd = !!String.prototype.trimEnd;
var fromEntries = hasNativeFromEntries ? Object.fromEntries : function fromEntries2(entries) {
  const obj = {};
  for (const [k, v] of entries) obj[k] = v;
  return obj;
};
var trimStart = hasTrimStart ? function trimStart2(s) {
  return s.trimStart();
} : function trimStart3(s) {
  return s.replace(SPACE_SEPARATOR_START_REGEX, "");
};
var trimEnd = hasTrimEnd ? function trimEnd2(s) {
  return s.trimEnd();
} : function trimEnd3(s) {
  return s.replace(SPACE_SEPARATOR_END_REGEX, "");
};
var IDENTIFIER_PREFIX_RE = /* @__PURE__ */ new RegExp("([^\\p{White_Space}\\p{Pattern_Syntax}]*)", "yu");
function matchIdentifierAtIndex(s, index) {
  IDENTIFIER_PREFIX_RE.lastIndex = index;
  return IDENTIFIER_PREFIX_RE.exec(s)[1] ?? "";
}
function plainTopLevelEndPosition(message) {
  if (message.length === 0) return null;
  let line = 1;
  let column = 1;
  for (let offset = 0; offset < message.length; ) {
    const code = message.charCodeAt(offset);
    switch (code) {
      case 35:
      case 39:
      case 60:
      case 123:
      case 125:
        return null;
    }
    if (code === 10) {
      line++;
      column = 1;
      offset++;
    } else {
      column++;
      if (code >= 55296 && code <= 56319 && offset + 1 < message.length) {
        const next = message.charCodeAt(offset + 1);
        offset += next >= 56320 && next <= 57343 ? 2 : 1;
      } else offset++;
    }
  }
  return {
    offset: message.length,
    line,
    column
  };
}
var Parser = class {
  constructor(message, options = {}) {
    this.message = message;
    this.position = {
      offset: 0,
      line: 1,
      column: 1
    };
    this.ignoreTag = !!options.ignoreTag;
    this.locale = options.locale;
    this.requiresOtherClause = !!options.requiresOtherClause;
    this.shouldParseSkeletons = !!options.shouldParseSkeletons;
  }
  parse() {
    if (this.offset() !== 0) throw Error("parser can only be used once");
    if (this.message.length > 0) {
      const firstCode = this.message.charCodeAt(0);
      if (firstCode !== 35 && firstCode !== 39 && firstCode !== 60 && firstCode !== 123 && firstCode !== 125) {
        const plainEndPosition = plainTopLevelEndPosition(this.message);
        if (plainEndPosition) {
          const start = this.clonePosition();
          this.position = plainEndPosition;
          return {
            val: [{
              type: 0,
              value: this.message,
              location: createLocation(start, this.clonePosition())
            }],
            err: null
          };
        }
      }
    }
    return this.parseMessage(0, "", false);
  }
  parseMessage(nestingLevel, parentArgType, expectingCloseTag) {
    let elements = [];
    while (!this.isEOF()) {
      const char = this.char();
      if (char === 123) {
        const result = this.parseArgument(nestingLevel, expectingCloseTag);
        if (result.err) return result;
        elements.push(result.val);
      } else if (char === 125 && nestingLevel > 0) break;
      else if (char === 35 && (parentArgType === "plural" || parentArgType === "selectordinal")) {
        const position = this.clonePosition();
        this.bump();
        elements.push({
          type: 7,
          location: createLocation(position, this.clonePosition())
        });
      } else if (char === 60 && !this.ignoreTag && this.peek() === 47) if (expectingCloseTag) break;
      else return this.error(26, createLocation(this.clonePosition(), this.clonePosition()));
      else if (char === 60 && !this.ignoreTag && _isAlpha(this.peek() || 0)) {
        const result = this.parseTag(nestingLevel, parentArgType);
        if (result.err) return result;
        elements.push(result.val);
      } else {
        const result = this.parseLiteral(nestingLevel, parentArgType);
        if (result.err) return result;
        elements.push(result.val);
      }
    }
    return {
      val: elements,
      err: null
    };
  }
  /**
  * A tag name must start with an ASCII lower/upper case letter. The grammar is based on the
  * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
  * are accepted:
  *
  * ```
  * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
  * tagName ::= [a-z] (PENChar)*
  * PENChar ::=
  *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
  *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
  *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
  * ```
  *
  * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
  * NOTE: We're a bit more lax here since HTML technically does not allow uppercase HTML element but we do
  * since other tag-based engines like React allow it
  */
  parseTag(nestingLevel, parentArgType) {
    const startPosition = this.clonePosition();
    this.bump();
    const tagName = this.parseTagName();
    this.bumpSpace();
    if (this.bumpIf("/>")) return {
      val: {
        type: 0,
        value: `<${tagName}/>`,
        location: createLocation(startPosition, this.clonePosition())
      },
      err: null
    };
    else if (this.bumpIf(">")) {
      const childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
      if (childrenResult.err) return childrenResult;
      const children = childrenResult.val;
      const endTagStartPosition = this.clonePosition();
      if (this.bumpIf("</")) {
        if (this.isEOF() || !_isAlpha(this.char())) return this.error(23, createLocation(endTagStartPosition, this.clonePosition()));
        const closingTagNameStartPosition = this.clonePosition();
        if (tagName !== this.parseTagName()) return this.error(26, createLocation(closingTagNameStartPosition, this.clonePosition()));
        this.bumpSpace();
        if (!this.bumpIf(">")) return this.error(23, createLocation(endTagStartPosition, this.clonePosition()));
        return {
          val: {
            type: 8,
            value: tagName,
            children,
            location: createLocation(startPosition, this.clonePosition())
          },
          err: null
        };
      } else return this.error(27, createLocation(startPosition, this.clonePosition()));
    } else return this.error(23, createLocation(startPosition, this.clonePosition()));
  }
  /**
  * This method assumes that the caller has peeked ahead for the first tag character.
  */
  parseTagName() {
    const startOffset = this.offset();
    this.bump();
    while (!this.isEOF() && _isPotentialElementNameChar(this.char())) this.bump();
    return this.message.slice(startOffset, this.offset());
  }
  parseLiteral(nestingLevel, parentArgType) {
    const start = this.clonePosition();
    let value = "";
    while (true) {
      const parseQuoteResult = this.tryParseQuote(parentArgType);
      if (parseQuoteResult) {
        value += parseQuoteResult;
        continue;
      }
      const parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
      if (parseUnquotedResult) {
        value += parseUnquotedResult;
        continue;
      }
      const parseLeftAngleResult = this.tryParseLeftAngleBracket();
      if (parseLeftAngleResult) {
        value += parseLeftAngleResult;
        continue;
      }
      break;
    }
    const location = createLocation(start, this.clonePosition());
    return {
      val: {
        type: 0,
        value,
        location
      },
      err: null
    };
  }
  tryParseLeftAngleBracket() {
    if (!this.isEOF() && this.char() === 60 && (this.ignoreTag || !_isAlphaOrSlash(this.peek() || 0))) {
      this.bump();
      return "<";
    }
    return null;
  }
  /**
  * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
  * a character that requires quoting (that is, "only where needed"), and works the same in
  * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
  */
  tryParseQuote(parentArgType) {
    if (this.isEOF() || this.char() !== 39) return null;
    switch (this.peek()) {
      case 39:
        this.bump();
        this.bump();
        return "'";
      case 123:
      case 60:
      case 62:
      case 125:
        break;
      case 35:
        if (parentArgType === "plural" || parentArgType === "selectordinal") break;
        return null;
      default:
        return null;
    }
    this.bump();
    const codePoints = [this.char()];
    this.bump();
    while (!this.isEOF()) {
      const ch = this.char();
      if (ch === 39) if (this.peek() === 39) {
        codePoints.push(39);
        this.bump();
      } else {
        this.bump();
        break;
      }
      else codePoints.push(ch);
      this.bump();
    }
    return String.fromCodePoint(...codePoints);
  }
  tryParseUnquoted(nestingLevel, parentArgType) {
    if (this.isEOF()) return null;
    const ch = this.char();
    if (ch === 60 || ch === 123 || ch === 35 && (parentArgType === "plural" || parentArgType === "selectordinal") || ch === 125 && nestingLevel > 0) return null;
    else {
      this.bump();
      return String.fromCodePoint(ch);
    }
  }
  parseArgument(nestingLevel, expectingCloseTag) {
    const openingBracePosition = this.clonePosition();
    this.bump();
    this.bumpSpace();
    if (this.isEOF()) return this.error(1, createLocation(openingBracePosition, this.clonePosition()));
    if (this.char() === 125) {
      this.bump();
      return this.error(2, createLocation(openingBracePosition, this.clonePosition()));
    }
    let value = this.parseIdentifierIfPossible().value;
    if (!value) return this.error(3, createLocation(openingBracePosition, this.clonePosition()));
    this.bumpSpace();
    if (this.isEOF()) return this.error(1, createLocation(openingBracePosition, this.clonePosition()));
    switch (this.char()) {
      case 125:
        this.bump();
        return {
          val: {
            type: 1,
            value,
            location: createLocation(openingBracePosition, this.clonePosition())
          },
          err: null
        };
      case 44:
        this.bump();
        this.bumpSpace();
        if (this.isEOF()) return this.error(1, createLocation(openingBracePosition, this.clonePosition()));
        return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
      default:
        return this.error(3, createLocation(openingBracePosition, this.clonePosition()));
    }
  }
  /**
  * Advance the parser until the end of the identifier, if it is currently on
  * an identifier character. Return an empty string otherwise.
  */
  parseIdentifierIfPossible() {
    const startingPosition = this.clonePosition();
    const startOffset = this.offset();
    const value = matchIdentifierAtIndex(this.message, startOffset);
    const endOffset = startOffset + value.length;
    this.bumpTo(endOffset);
    return {
      value,
      location: createLocation(startingPosition, this.clonePosition())
    };
  }
  parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition) {
    let typeStartPosition = this.clonePosition();
    let argType = this.parseIdentifierIfPossible().value;
    let typeEndPosition = this.clonePosition();
    switch (argType) {
      case "":
        return this.error(4, createLocation(typeStartPosition, typeEndPosition));
      case "number":
      case "date":
      case "time": {
        this.bumpSpace();
        let styleAndLocation = null;
        if (this.bumpIf(",")) {
          this.bumpSpace();
          const styleStartPosition = this.clonePosition();
          const result = this.parseSimpleArgStyleIfPossible();
          if (result.err) return result;
          const style = trimEnd(result.val);
          if (style.length === 0) return this.error(6, createLocation(this.clonePosition(), this.clonePosition()));
          styleAndLocation = {
            style,
            styleLocation: createLocation(styleStartPosition, this.clonePosition())
          };
        }
        const argCloseResult = this.tryParseArgumentClose(openingBracePosition);
        if (argCloseResult.err) return argCloseResult;
        const location = createLocation(openingBracePosition, this.clonePosition());
        if (styleAndLocation && styleAndLocation.style.startsWith("::")) {
          let skeleton = trimStart(styleAndLocation.style.slice(2));
          if (argType === "number") {
            const result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
            if (result.err) return result;
            return {
              val: {
                type: 2,
                value,
                location,
                style: result.val
              },
              err: null
            };
          } else {
            if (skeleton.length === 0) return this.error(10, location);
            let dateTimePattern = skeleton;
            if (this.locale) dateTimePattern = getBestPattern(skeleton, this.locale);
            const style = {
              type: 1,
              pattern: dateTimePattern,
              location: styleAndLocation.styleLocation,
              parsedOptions: this.shouldParseSkeletons ? parseDateTimeSkeleton(dateTimePattern) : {}
            };
            return {
              val: {
                type: argType === "date" ? 3 : 4,
                value,
                location,
                style
              },
              err: null
            };
          }
        }
        return {
          val: {
            type: argType === "number" ? 2 : argType === "date" ? 3 : 4,
            value,
            location,
            style: styleAndLocation?.style ?? null
          },
          err: null
        };
      }
      case "plural":
      case "selectordinal":
      case "select": {
        const typeEndPosition2 = this.clonePosition();
        this.bumpSpace();
        if (!this.bumpIf(",")) return this.error(12, createLocation(typeEndPosition2, { ...typeEndPosition2 }));
        this.bumpSpace();
        let identifierAndLocation = this.parseIdentifierIfPossible();
        let pluralOffset = 0;
        if (argType !== "select" && identifierAndLocation.value === "offset") {
          if (!this.bumpIf(":")) return this.error(13, createLocation(this.clonePosition(), this.clonePosition()));
          this.bumpSpace();
          const result = this.tryParseDecimalInteger(13, 14);
          if (result.err) return result;
          this.bumpSpace();
          identifierAndLocation = this.parseIdentifierIfPossible();
          pluralOffset = result.val;
        }
        const optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
        if (optionsResult.err) return optionsResult;
        const argCloseResult = this.tryParseArgumentClose(openingBracePosition);
        if (argCloseResult.err) return argCloseResult;
        const location = createLocation(openingBracePosition, this.clonePosition());
        if (argType === "select") return {
          val: {
            type: 5,
            value,
            options: fromEntries(optionsResult.val),
            location
          },
          err: null
        };
        else return {
          val: {
            type: 6,
            value,
            options: fromEntries(optionsResult.val),
            offset: pluralOffset,
            pluralType: argType === "plural" ? "cardinal" : "ordinal",
            location
          },
          err: null
        };
      }
      default:
        return this.error(5, createLocation(typeStartPosition, typeEndPosition));
    }
  }
  tryParseArgumentClose(openingBracePosition) {
    if (this.isEOF() || this.char() !== 125) return this.error(1, createLocation(openingBracePosition, this.clonePosition()));
    this.bump();
    return {
      val: true,
      err: null
    };
  }
  /**
  * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
  */
  parseSimpleArgStyleIfPossible() {
    let nestedBraces = 0;
    const startPosition = this.clonePosition();
    while (!this.isEOF()) switch (this.char()) {
      case 39: {
        this.bump();
        let apostrophePosition = this.clonePosition();
        if (!this.bumpUntil("'")) return this.error(11, createLocation(apostrophePosition, this.clonePosition()));
        this.bump();
        break;
      }
      case 123:
        nestedBraces += 1;
        this.bump();
        break;
      case 125:
        if (nestedBraces > 0) nestedBraces -= 1;
        else return {
          val: this.message.slice(startPosition.offset, this.offset()),
          err: null
        };
        break;
      default:
        this.bump();
        break;
    }
    return {
      val: this.message.slice(startPosition.offset, this.offset()),
      err: null
    };
  }
  parseNumberSkeletonFromString(skeleton, location) {
    let tokens = [];
    try {
      tokens = parseNumberSkeletonFromString(skeleton);
    } catch {
      return this.error(7, location);
    }
    return {
      val: {
        type: 0,
        tokens,
        location,
        parsedOptions: this.shouldParseSkeletons ? parseNumberSkeleton(tokens) : {}
      },
      err: null
    };
  }
  /**
  * @param nesting_level The current nesting level of messages.
  *     This can be positive when parsing message fragment in select or plural argument options.
  * @param parent_arg_type The parent argument's type.
  * @param parsed_first_identifier If provided, this is the first identifier-like selector of
  *     the argument. It is a by-product of a previous parsing attempt.
  * @param expecting_close_tag If true, this message is directly or indirectly nested inside
  *     between a pair of opening and closing tags. The nested message will not parse beyond
  *     the closing tag boundary.
  */
  tryParsePluralOrSelectOptions(nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
    let hasOtherClause = false;
    const options = [];
    const parsedSelectors = /* @__PURE__ */ new Set();
    let { value: selector, location: selectorLocation } = parsedFirstIdentifier;
    while (true) {
      if (selector.length === 0) {
        const startPosition = this.clonePosition();
        if (parentArgType !== "select" && this.bumpIf("=")) {
          const result = this.tryParseDecimalInteger(16, 19);
          if (result.err) return result;
          selectorLocation = createLocation(startPosition, this.clonePosition());
          selector = this.message.slice(startPosition.offset, this.offset());
        } else break;
      }
      if (parsedSelectors.has(selector)) return this.error(parentArgType === "select" ? 21 : 20, selectorLocation);
      if (selector === "other") hasOtherClause = true;
      this.bumpSpace();
      const openingBracePosition = this.clonePosition();
      if (!this.bumpIf("{")) return this.error(parentArgType === "select" ? 17 : 18, createLocation(this.clonePosition(), this.clonePosition()));
      const fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
      if (fragmentResult.err) return fragmentResult;
      const argCloseResult = this.tryParseArgumentClose(openingBracePosition);
      if (argCloseResult.err) return argCloseResult;
      options.push([selector, {
        value: fragmentResult.val,
        location: createLocation(openingBracePosition, this.clonePosition())
      }]);
      parsedSelectors.add(selector);
      this.bumpSpace();
      ({ value: selector, location: selectorLocation } = this.parseIdentifierIfPossible());
    }
    if (options.length === 0) return this.error(parentArgType === "select" ? 15 : 16, createLocation(this.clonePosition(), this.clonePosition()));
    if (this.requiresOtherClause && !hasOtherClause) return this.error(22, createLocation(this.clonePosition(), this.clonePosition()));
    return {
      val: options,
      err: null
    };
  }
  tryParseDecimalInteger(expectNumberError, invalidNumberError) {
    let sign = 1;
    const startingPosition = this.clonePosition();
    if (this.bumpIf("+")) {
    } else if (this.bumpIf("-")) sign = -1;
    let hasDigits = false;
    let decimal = 0;
    while (!this.isEOF()) {
      const ch = this.char();
      if (ch >= 48 && ch <= 57) {
        hasDigits = true;
        decimal = decimal * 10 + (ch - 48);
        this.bump();
      } else break;
    }
    const location = createLocation(startingPosition, this.clonePosition());
    if (!hasDigits) return this.error(expectNumberError, location);
    decimal *= sign;
    if (!Number.isSafeInteger(decimal)) return this.error(invalidNumberError, location);
    return {
      val: decimal,
      err: null
    };
  }
  offset() {
    return this.position.offset;
  }
  isEOF() {
    return this.offset() === this.message.length;
  }
  clonePosition() {
    return {
      offset: this.position.offset,
      line: this.position.line,
      column: this.position.column
    };
  }
  /**
  * Return the code point at the current position of the parser.
  * Throws if the index is out of bound.
  */
  char() {
    const offset = this.position.offset;
    if (offset >= this.message.length) throw Error("out of bound");
    const code = this.message.codePointAt(offset);
    if (code === void 0) throw Error(`Offset ${offset} is at invalid UTF-16 code unit boundary`);
    return code;
  }
  error(kind, location) {
    return {
      val: null,
      err: {
        kind,
        message: this.message,
        location
      }
    };
  }
  /** Bump the parser to the next UTF-16 code unit. */
  bump() {
    if (this.isEOF()) return;
    const code = this.char();
    if (code === 10) {
      this.position.line += 1;
      this.position.column = 1;
      this.position.offset += 1;
    } else {
      this.position.column += 1;
      this.position.offset += code < 65536 ? 1 : 2;
    }
  }
  /**
  * If the substring starting at the current position of the parser has
  * the given prefix, then bump the parser to the character immediately
  * following the prefix and return true. Otherwise, don't bump the parser
  * and return false.
  */
  bumpIf(prefix) {
    if (this.message.startsWith(prefix, this.offset())) {
      for (let i = 0; i < prefix.length; i++) this.bump();
      return true;
    }
    return false;
  }
  /**
  * Bump the parser until the pattern character is found and return `true`.
  * Otherwise bump to the end of the file and return `false`.
  */
  bumpUntil(pattern) {
    const currentOffset = this.offset();
    const index = this.message.indexOf(pattern, currentOffset);
    if (index >= 0) {
      this.bumpTo(index);
      return true;
    } else {
      this.bumpTo(this.message.length);
      return false;
    }
  }
  /**
  * Bump the parser to the target offset.
  * If target offset is beyond the end of the input, bump the parser to the end of the input.
  */
  bumpTo(targetOffset) {
    if (this.offset() > targetOffset) throw Error(`targetOffset ${targetOffset} must be greater than or equal to the current offset ${this.offset()}`);
    targetOffset = Math.min(targetOffset, this.message.length);
    while (true) {
      const offset = this.offset();
      if (offset === targetOffset) break;
      if (offset > targetOffset) throw Error(`targetOffset ${targetOffset} is at invalid UTF-16 code unit boundary`);
      this.bump();
      if (this.isEOF()) break;
    }
  }
  /** advance the parser through all whitespace to the next non-whitespace code unit. */
  bumpSpace() {
    while (!this.isEOF() && _isWhiteSpace(this.char())) this.bump();
  }
  /**
  * Peek at the *next* Unicode codepoint in the input without advancing the parser.
  * If the input has been exhausted, then this returns null.
  */
  peek() {
    if (this.isEOF()) return null;
    const code = this.char();
    const offset = this.offset();
    return this.message.charCodeAt(offset + (code >= 65536 ? 2 : 1)) ?? null;
  }
};
function _isAlpha(codepoint) {
  return codepoint >= 97 && codepoint <= 122 || codepoint >= 65 && codepoint <= 90;
}
function _isAlphaOrSlash(codepoint) {
  return _isAlpha(codepoint) || codepoint === 47;
}
function _isPotentialElementNameChar(c) {
  return c === 45 || c === 46 || c >= 48 && c <= 57 || c === 95 || c >= 97 && c <= 122 || c >= 65 && c <= 90 || c == 183 || c >= 192 && c <= 214 || c >= 216 && c <= 246 || c >= 248 && c <= 893 || c >= 895 && c <= 8191 || c >= 8204 && c <= 8205 || c >= 8255 && c <= 8256 || c >= 8304 && c <= 8591 || c >= 11264 && c <= 12271 || c >= 12289 && c <= 55295 || c >= 63744 && c <= 64975 || c >= 65008 && c <= 65533 || c >= 65536 && c <= 983039;
}
function _isWhiteSpace(c) {
  return c >= 9 && c <= 13 || c === 32 || c === 133 || c >= 8206 && c <= 8207 || c === 8232 || c === 8233;
}
function pruneLocation(els) {
  els.forEach((el) => {
    delete el.location;
    if (isSelectElement(el) || isPluralElement(el)) for (const k in el.options) {
      delete el.options[k].location;
      pruneLocation(el.options[k].value);
    }
    else if (isNumberElement(el) && isNumberSkeleton(el.style)) delete el.style.location;
    else if ((isDateElement(el) || isTimeElement(el)) && isDateTimeSkeleton(el.style)) delete el.style.location;
    else if (isTagElement(el)) pruneLocation(el.children);
  });
}
function parse(message, opts = {}) {
  opts = {
    shouldParseSkeletons: true,
    requiresOtherClause: true,
    ...opts
  };
  const result = new Parser(message, opts).parse();
  if (result.err) {
    const error = SyntaxError(ErrorKind[result.err.kind]);
    error.location = result.err.location;
    error.originalMessage = result.err.message;
    throw error;
  }
  if (!opts?.captureLocation) pruneLocation(result.val);
  return result.val;
}

// node_modules/intl-messageformat/index.js
var FormatError = class extends Error {
  constructor(msg, code, originalMessage) {
    super(msg);
    this.code = code;
    this.originalMessage = originalMessage;
  }
  toString() {
    return `[formatjs Error: ${this.code}] ${this.message}`;
  }
};
var InvalidValueError = class extends FormatError {
  constructor(variableId, value, options, originalMessage) {
    super(`Invalid values for "${variableId}": "${value}". Options are "${Object.keys(options).join('", "')}"`, "INVALID_VALUE", originalMessage);
  }
};
var InvalidValueTypeError = class extends FormatError {
  constructor(value, type, originalMessage) {
    super(`Value for "${value}" must be of type ${type}`, "INVALID_VALUE", originalMessage);
  }
};
var MissingValueError = class extends FormatError {
  constructor(variableId, originalMessage) {
    super(`The intl string context variable "${variableId}" was not provided to the string "${originalMessage}"`, "MISSING_VALUE", originalMessage);
  }
};
function mergeLiteral(parts) {
  if (parts.length < 2) return parts;
  return parts.reduce((all, part) => {
    const lastPart = all[all.length - 1];
    if (!lastPart || lastPart.type !== 0 || part.type !== 0) all.push(part);
    else lastPart.value += part.value;
    return all;
  }, []);
}
function isFormatXMLElementFn(el) {
  return typeof el === "function";
}
function formatToParts(els, locales, formatters, formats, values, currentPluralValue, originalMessage) {
  if (els.length === 1 && isLiteralElement(els[0])) return [{
    type: 0,
    value: els[0].value
  }];
  const result = [];
  for (const el of els) {
    if (isLiteralElement(el)) {
      result.push({
        type: 0,
        value: el.value
      });
      continue;
    }
    if (isPoundElement(el)) {
      if (typeof currentPluralValue === "number") result.push({
        type: 0,
        value: formatters.getNumberFormat(locales).format(currentPluralValue)
      });
      continue;
    }
    const { value: varName } = el;
    if (!(values && varName in values)) throw new MissingValueError(varName, originalMessage);
    let value = values[varName];
    if (isArgumentElement(el)) {
      if (!value || typeof value === "string" || typeof value === "number" || typeof value === "bigint") value = typeof value === "string" || typeof value === "number" || typeof value === "bigint" ? String(value) : "";
      result.push({
        type: typeof value === "string" ? 0 : 1,
        value
      });
      continue;
    }
    if (isDateElement(el)) {
      const style = typeof el.style === "string" ? formats.date[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : void 0;
      result.push({
        type: 0,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }
    if (isTimeElement(el)) {
      const style = typeof el.style === "string" ? formats.time[el.style] : isDateTimeSkeleton(el.style) ? el.style.parsedOptions : formats.time.medium;
      result.push({
        type: 0,
        value: formatters.getDateTimeFormat(locales, style).format(value)
      });
      continue;
    }
    if (isNumberElement(el)) {
      const style = typeof el.style === "string" ? formats.number[el.style] : isNumberSkeleton(el.style) ? el.style.parsedOptions : void 0;
      if (style && style.scale) {
        const scale = style.scale || 1;
        if (typeof value === "bigint") {
          if (!Number.isInteger(scale)) throw new TypeError(`Cannot apply fractional scale ${scale} to bigint value. Scale must be an integer when formatting bigint.`);
          value = value * BigInt(scale);
        } else value = value * scale;
      }
      result.push({
        type: 0,
        value: formatters.getNumberFormat(locales, style).format(value)
      });
      continue;
    }
    if (isTagElement(el)) {
      const { children, value: value2 } = el;
      const formatFn = values[value2];
      if (!isFormatXMLElementFn(formatFn)) throw new InvalidValueTypeError(value2, "function", originalMessage);
      let chunks = formatFn(formatToParts(children, locales, formatters, formats, values, currentPluralValue).map((p) => p.value));
      if (!Array.isArray(chunks)) chunks = [chunks];
      result.push(...chunks.map((c) => {
        return {
          type: typeof c === "string" ? 0 : 1,
          value: c
        };
      }));
    }
    if (isSelectElement(el)) {
      const key = value;
      const opt = (Object.prototype.hasOwnProperty.call(el.options, key) ? el.options[key] : void 0) || el.options.other;
      if (!opt) throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      result.push(...formatToParts(opt.value, locales, formatters, formats, values));
      continue;
    }
    if (isPluralElement(el)) {
      const exactKey = `=${value}`;
      let opt = Object.prototype.hasOwnProperty.call(el.options, exactKey) ? el.options[exactKey] : void 0;
      if (!opt) {
        if (!Intl.PluralRules) throw new FormatError(`Intl.PluralRules is not available in this environment.
Try polyfilling it using "@formatjs/intl-pluralrules"
`, "MISSING_INTL_API", originalMessage);
        const numericValue2 = typeof value === "bigint" ? Number(value) : value;
        const rule = formatters.getPluralRules(locales, { type: el.pluralType }).select(numericValue2 - (el.offset || 0));
        opt = (Object.prototype.hasOwnProperty.call(el.options, rule) ? el.options[rule] : void 0) || el.options.other;
      }
      if (!opt) throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
      const numericValue = typeof value === "bigint" ? Number(value) : value;
      result.push(...formatToParts(opt.value, locales, formatters, formats, values, numericValue - (el.offset || 0)));
      continue;
    }
  }
  return mergeLiteral(result);
}
function mergeConfig(c1, c2) {
  if (!c2) return c1;
  return {
    ...c1,
    ...c2,
    ...Object.keys(c1).reduce((all, k) => {
      all[k] = {
        ...c1[k],
        ...c2[k]
      };
      return all;
    }, {})
  };
}
function mergeConfigs(defaultConfig, configs) {
  if (!configs) return defaultConfig;
  return Object.keys(defaultConfig).reduce((all, k) => {
    all[k] = mergeConfig(defaultConfig[k], configs[k]);
    return all;
  }, { ...defaultConfig });
}
function createFastMemoizeCache(store) {
  return { create() {
    return {
      get(key) {
        return store[key];
      },
      set(key, value) {
        store[key] = value;
      }
    };
  } };
}
function createDefaultFormatters(cache = {
  number: {},
  dateTime: {},
  pluralRules: {}
}) {
  return {
    getNumberFormat: memoize((...args) => new Intl.NumberFormat(...args), {
      cache: createFastMemoizeCache(cache.number),
      strategy: strategies.variadic
    }),
    getDateTimeFormat: memoize((...args) => new Intl.DateTimeFormat(...args), {
      cache: createFastMemoizeCache(cache.dateTime),
      strategy: strategies.variadic
    }),
    getPluralRules: memoize((...args) => new Intl.PluralRules(...args), {
      cache: createFastMemoizeCache(cache.pluralRules),
      strategy: strategies.variadic
    })
  };
}
var IntlMessageFormat = class IntlMessageFormat2 {
  constructor(message, locales = IntlMessageFormat2.defaultLocale, overrideFormats, opts) {
    this.formatterCache = {
      number: {},
      dateTime: {},
      pluralRules: {}
    };
    this.format = (values) => {
      const parts = this.formatToParts(values);
      if (parts.length === 1) return parts[0].value;
      const result = parts.reduce((all, part) => {
        if (!all.length || part.type !== 0 || typeof all[all.length - 1] !== "string") all.push(part.value);
        else all[all.length - 1] += part.value;
        return all;
      }, []);
      if (result.length <= 1) return result[0] || "";
      return result;
    };
    this.formatToParts = (values) => formatToParts(this.ast, this.locales, this.formatters, this.formats, values, void 0, this.message);
    this.resolvedOptions = () => ({ locale: this.resolvedLocale?.toString() || Intl.NumberFormat.supportedLocalesOf(this.locales)[0] });
    this.getAst = () => this.ast;
    this.locales = locales;
    this.resolvedLocale = IntlMessageFormat2.resolveLocale(locales);
    if (typeof message === "string") {
      this.message = message;
      if (!IntlMessageFormat2.__parse) throw new TypeError("IntlMessageFormat.__parse must be set to process `message` of type `string`");
      const { ...parseOpts } = opts || {};
      this.ast = IntlMessageFormat2.__parse(message, {
        ...parseOpts,
        locale: this.resolvedLocale
      });
    } else this.ast = message;
    if (!Array.isArray(this.ast)) throw new TypeError("A message must be provided as a String or AST.");
    this.formats = mergeConfigs(IntlMessageFormat2.formats, overrideFormats);
    this.formatters = opts && opts.formatters || createDefaultFormatters(this.formatterCache);
  }
  static {
    this.memoizedDefaultLocale = null;
  }
  static get defaultLocale() {
    if (!IntlMessageFormat2.memoizedDefaultLocale) IntlMessageFormat2.memoizedDefaultLocale = new Intl.NumberFormat().resolvedOptions().locale;
    return IntlMessageFormat2.memoizedDefaultLocale;
  }
  static {
    this.resolveLocale = (locales) => {
      if (typeof Intl.Locale === "undefined") return;
      const supportedLocales = Intl.NumberFormat.supportedLocalesOf(locales);
      if (supportedLocales.length > 0) return new Intl.Locale(supportedLocales[0]);
      return new Intl.Locale(typeof locales === "string" ? locales : locales[0]);
    };
  }
  static {
    this.__parse = parse;
  }
  static {
    this.formats = {
      number: {
        integer: { maximumFractionDigits: 0 },
        currency: { style: "currency" },
        percent: { style: "percent" }
      },
      date: {
        short: {
          month: "numeric",
          day: "numeric",
          year: "2-digit"
        },
        medium: {
          month: "short",
          day: "numeric",
          year: "numeric"
        },
        long: {
          month: "long",
          day: "numeric",
          year: "numeric"
        },
        full: {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        }
      },
      time: {
        short: {
          hour: "numeric",
          minute: "numeric"
        },
        medium: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        },
        long: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZoneName: "short"
        },
        full: {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          timeZoneName: "short"
        }
      }
    };
  }
};

// src/app/src/utils/Cookie.ts
var Cookie = class {
  // Thanks to http://www.quirksmode.org/js/cookies.html
  static set(key, value) {
    window.localStorage.setItem(key, value);
  }
  static get(key) {
    return window.localStorage[key] || null;
  }
};

// src/app/src/utils/Localization.ts
var currentLocale;
var localizationMessages = {};
var sampleKeyPrefix = "key_";
var Localization = class {
  static get currentLocale() {
    return currentLocale;
  }
  // Take the browser's reported locale from navigator.language
  // Normalize this value and find a match in supportedLocales
  // If we support a similar language but not the specific one, it's returned.
  // E.g., if we support 'en-US' but not 'en-GB', the user gets 'en-US'
  // The match in supported locales (or the default locale) is returned.
  static determineLocaleFromBrowser() {
    let defaultLocale = window.Settings.defaultLocale;
    let supportedLocales = window.Settings.supportedLocales;
    var localizationLanguage = window.navigator.userLanguage || window.navigator.language || "en-us";
    var localizationLanguageParts = localizationLanguage.split("-");
    localizationLanguageParts[localizationLanguageParts.length - 1] = localizationLanguageParts[localizationLanguageParts.length - 1].toUpperCase();
    var desiredLocale = localizationLanguageParts.join("-");
    if (desiredLocale in Object.keys(supportedLocales)) {
      return desiredLocale;
    }
    for (var localeKey in supportedLocales) {
      var supportedLocale = supportedLocales[localeKey];
      var parts = supportedLocale.split("-");
      if (parts[0] == localizationLanguageParts[0]) {
        return supportedLocale;
      }
    }
    return defaultLocale;
  }
  // Include locale support files and load the messages
  // Call this when the app is initialized
  static async includeLocales(localizationRoot, whenDone) {
    var cliLang = null;
    try {
      cliLang = await window.scratchjr.io_getLang();
    } catch (_) {
    }
    if (cliLang) {
      currentLocale = cliLang;
    } else {
      var localizationCookie = Cookie.get("localization");
      if (localizationCookie === null) {
        currentLocale = this.determineLocaleFromBrowser();
      } else {
        currentLocale = localizationCookie;
      }
    }
    var topLevel = currentLocale.split("-")[0];
    if (topLevel === "zh") {
      topLevel = currentLocale.toLowerCase();
    }
    IO.requestFromServer(localizationRoot + "localizations/" + topLevel + ".json", (result) => {
      localizationMessages = JSON.parse(result);
      whenDone();
    });
  }
  // Translate a particular message given the message key and info
  static localize(key, formatting) {
    var message;
    if (IntlMessageFormat) {
      if (key in localizationMessages) {
        message = new IntlMessageFormat(localizationMessages[key], currentLocale);
        return message.format(formatting);
      }
    } else {
      return "Loc missing: " + key;
    }
    return "String missing: " + key;
  }
  // For sample projects, some fields (sprite names, text on stage, and text in say blocks)
  // may have a special prefix to indicate that it should be replaced with a localized value.
  // E.g., we might have some text on the stage that says "Touch me" in English. This gets translated.
  static isSampleLocalizedKey(str) {
    return str.slice(0, sampleKeyPrefix.length) == sampleKeyPrefix;
  }
};

// src/app/src/iPad/MediaLib.ts
var path;
var samples;
var backgrounds;
var sprites;
var sounds;
var keys = {};
var MediaLib = class _MediaLib {
  static get path() {
    return path;
  }
  static get samples() {
    return samples;
  }
  static get sprites() {
    return sprites;
  }
  static get backgrounds() {
    return backgrounds;
  }
  static get sounds() {
    return sounds;
  }
  static get keys() {
    return keys;
  }
  static loadMediaLib(root, whenDone) {
    IO.requestFromServer(root + "media.json", (result) => {
      let parsedResult = JSON.parse(result);
      path = parsedResult.path;
      samples = parsedResult.samples;
      sprites = parsedResult.sprites;
      backgrounds = parsedResult.backgrounds;
      sounds = parsedResult.sounds;
      _MediaLib.localizeMediaNames();
      _MediaLib.generateKeys();
      whenDone();
    });
  }
  static localizeMediaNames() {
    for (let i = 0; i < sprites.length; i++) {
      sprites[i].name = Localization.localize("CHARACTER_" + sprites[i].md5);
    }
    for (let i = 0; i < backgrounds.length; i++) {
      backgrounds[i].name = Localization.localize("BACKGROUND_" + backgrounds[i].md5);
    }
  }
  static generateKeys() {
    for (let i = 0; i < backgrounds.length; i++) {
      var bg = backgrounds[i];
      keys[bg.md5] = { width: bg.width, height: bg.height, name: bg.name };
    }
    for (let i = 0; i < sprites.length; i++) {
      var spr = sprites[i];
      keys[spr.md5] = { width: spr.width, height: spr.height, name: spr.name };
    }
  }
};

// src/app/src/geom/Vector.ts
var Vector = class _Vector {
  static sum(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
  }
  static diff(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
  }
  static equal(a, b) {
    return _Vector.len(_Vector.diff(a, b)) == 0;
  }
  static floor(a) {
    return { x: Math.floor(a.x), y: Math.floor(a.y) };
  }
  static neg(a) {
    return { x: -a.x, y: -a.y };
  }
  static len(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  }
  static norm(a) {
    let len = _Vector.len(a);
    if (len == 0) {
      len = 1e-3;
    }
    return { x: a.x / len, y: a.y / len };
  }
  static perp(a) {
    return { x: -a.y, y: a.x };
  }
  static scale(a, s) {
    return { x: a.x * s, y: a.y * s };
  }
  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }
  static mid(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  static lineIntersect(v1, v2, v3, v4) {
    const seg1 = _Vector.diff(v2, v1);
    const seg2 = _Vector.diff(v4, v3);
    const seg3 = _Vector.diff(v1, v3);
    const denom = seg2.y * seg1.x - seg2.x * seg1.y;
    const numera = seg2.x * seg3.y - seg2.y * seg3.x;
    const numerb = seg1.x * seg3.y - seg1.y * seg3.x;
    if (denom == 0) {
      return null;
    }
    const mua = numera / denom;
    const mub = numerb / denom;
    if (mua < 0 || mua > 1 || mub < 0 || mub > 1) {
      return null;
    }
    return { x: v1.x + mua * seg1.x, y: v1.y + mua * seg1.y };
  }
};

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
    if (mytarget != _Home.actionTarget && _Home.actionTarget && _Home.actionTarget.childElementCount > 2) {
      const actionChild = _Home.actionTarget.childNodes[_Home.actionTarget.childElementCount - 1];
      actionChild.style.visibility = "hidden";
    }
    _Home.actionTarget = mytarget;
    _Home.initialPt = Events.getTargetPoint(e);
    if (_Home.actionTarget) {
      holdit();
    }
    function holdit() {
      frame.onmousemove = _Home.handleMove;
      var repeat = function() {
        if (_Home.actionTarget && _Home.actionTarget.childElementCount > 2) {
          const actionChild = _Home.actionTarget.childNodes[_Home.actionTarget.childElementCount - 1];
          actionChild.style.visibility = "visible";
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
          iOS.setfile("homescroll.sjr", gn("wrapc").scrollTop, function() {
            doNext();
          });
        }
        break;
      case "delete":
        ScratchAudio.sndFX("cut.wav");
        import("./Project-OPUQKDS2.js").then((m) => {
          m.default.thumbnailUnique(_Home.actionTarget.thumb, _Home.actionTarget.id, function(isUnique) {
            if (isUnique) {
              iOS.remove(_Home.actionTarget.thumb, iOS.trace);
            }
          });
          iOS.setfield(iOS.database, _Home.actionTarget.id, "deleted", "YES", _Home.removeProjThumb);
        });
        break;
      default:
        if (_Home.actionTarget && _Home.actionTarget.childElementCount > 2) {
          const actionChild = _Home.actionTarget.childNodes[_Home.actionTarget.childElementCount - 1];
          actionChild.style.visibility = "hidden";
        }
        break;
    }
    function doNext() {
      iOS.analyticsEvent("lobby", "existing_project_edited");
      window.location.href = "editor.html?pmd5=" + md5 + "&mode=edit";
    }
  }
  static createNewProject() {
    iOS.analyticsEvent("lobby", "project_created");
    var obj = {};
    var prefix = Localization.localize("NEW_PROJECT_PREFIX");
    obj.name = _Home.getNextName(prefix || "Project");
    obj.version = version || window.Settings?.scratchJrVersion || "1.0.0";
    obj.mtime = (/* @__PURE__ */ new Date()).getTime().toString();
    IO.createProject(obj, _Home.gotoEditor);
  }
  static gotoEditor(md5) {
    if (!md5 || md5 === -1 || md5 === 0 || md5 === "0" || md5 === "-1") {
      console.error("gotoEditor: Failed to create project in database, invalid id:", md5);
      import("./Alert-R3HDLSHO.js").then((m) => {
        m.default.open(frame, gn("flip"), "Error creating project", "#D62222");
      });
      return;
    }
    iOS.setfile("homescroll.sjr", gn("wrapc").scrollTop, function() {
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
    for (var i = 0; i < div.childElementCount; i++) {
      const child = div.childNodes[i];
      if (child.id == "newproject") {
        continue;
      }
      pn.push(div.childNodes[i].childNodes[1].childNodes[0].textContent);
    }
    var n = 1;
    while (pn.indexOf(name + " " + n) > -1) {
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
    if (_Home.actionTarget.childElementCount > 2) {
      const actionChild = _Home.actionTarget.childNodes[_Home.actionTarget.childElementCount - 1];
      shown = actionChild.style.visibility == "visible";
    }
    if (e && shown) {
      var t = e.target;
      if (t.getAttribute("class") == "closex") {
        return "delete";
      }
    }
    return "project";
  }
  //////////////////////////
  // Gather projects
  //////////////////////////
  static displayYourProjects() {
    iOS.getfile("homescroll.sjr", gotScrollsState);
    function gotScrollsState(str) {
      var num = Number(atob(str));
      scrollvalue = num.toString() == "NaN" ? 0 : num;
      var json = {
        op: "select",
        table: iOS.database,
        items: ["name", "thumbnail", "id", "isgift"],
        where: [
          { col: "deleted", op: "=", value: "NO" },
          { col: "version", op: "=", value: version || window.Settings.scratchJrVersion },
          { col: "gallery", op: "IS NULL" }
        ],
        order: { col: "ctime", dir: "desc" }
      };
      IO.query(iOS.database, json, _Home.displayProjects);
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
    newHTML("div", "closex", tb);
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
    iOS.analyticsEvent("samples", "sample_opened", mt.textContent);
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

// src/app/src/utils/AppUsage.ts
var currentUsage;
var AppUsage = class {
  static get currentUsage() {
    return currentUsage;
  }
  /**
   * Initialize currentUsage for attaching to Analytics events from
   * the usage cookie if it is set. currentUsage is blank if the cookie is
   * not set.
   */
  static initUsage() {
    currentUsage = window.localStorage.appUsage;
  }
  /**
   * Check whether the App should ask for the usage data (first time launched)
   * @return {boolean} True if the usage cookie has never been set
   */
  static askForUsage() {
    return window.localStorage.appUsage === void 0;
  }
  /**
   * Set the usage cookie for tracking Analytics Events
   * @param {string} kind answer from user to the usage survey (home, school, other, noanswer)
   */
  static setUsage(kind) {
    if (kind === "") {
      kind = "noanswer";
    }
    window.localStorage.appUsage = kind;
    currentUsage = kind === "" ? "noanswer::" : kind + "::";
  }
};

// src/app/appEntry.js
function loadSettings(settingsRoot, whenDone) {
  IO.requestFromServer(settingsRoot + "settings.json", (result) => {
    window.Settings = JSON.parse(result);
    whenDone();
  });
}
var pageEntries = {
  index: () => import("./entry-KRGYPKD5.js").then((m) => iOS.waitForInterface(m.indexMain)),
  home: () => import("./home-ZZ4PN5PP.js").then((m) => iOS.waitForInterface(m.homeMain)),
  editor: () => import("./editor-KQTKRF3Z.js").then((m) => iOS.waitForInterface(m.editorMain)),
  gettingStarted: () => import("./gettingstarted-ZYPVQYRD.js").then((m) => iOS.waitForInterface(m.gettingStartedMain)),
  inappAbout: () => import("./inapp-CWCMNI5U.js").then((m) => m.inappAbout()),
  inappInterfaceGuide: () => import("./inapp-CWCMNI5U.js").then((m) => m.inappInterfaceGuide()),
  inappPaintEditorGuide: () => import("./inapp-CWCMNI5U.js").then((m) => m.inappPaintEditorGuide()),
  inappBlocksGuide: () => import("./inapp-CWCMNI5U.js").then((m) => m.inappBlocksGuide())
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
    if (isAndroid) {
      AndroidInterface.notifyDoneLoading();
    }
  }
  static setPage(page) {
    if (busy) {
      return;
    }
    if (gn("hometab").className == "home on") {
      var doNext = function(page2) {
        _Lobby.changePage(page2);
      };
      iOS.setfile("homescroll.sjr", gn("wrapc").scrollTop, function() {
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
        iOS.analyticsEvent("lobby", "language_changed", newLocale);
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

// src/app/src/utils/SVG2Canvas.ts
var endp;
var startp;
var curveoptions = ["C", "c", "s", "S"];
var qcurveoptions = ["Q", "q", "T", "t"];
var acurve = false;
var aqcurve = false;
var lastcxy;
var svgerror;
var strokevalues = {
  "stroke-width": 1,
  "stroke-linecap": "butt",
  "stroke": "rgba(0, 0, 0,0)",
  "stroke-linejoin": "miter",
  "stroke-miterlimit": 4,
  "stroke-dasharray": "none",
  "stroke-dashoffset": 0,
  "stroke-opacity": 1
};
var SVG2Canvas = class _SVG2Canvas {
  static acurve;
  // Getters/setters for globally used properties
  static get endp() {
    return endp;
  }
  static get curveoptions() {
    return curveoptions;
  }
  static get lastcxy() {
    return lastcxy;
  }
  static set lastcxy(newlastcxy) {
    lastcxy = newlastcxy;
  }
  static get svgerror() {
    return svgerror;
  }
  static get strokevalues() {
    return strokevalues;
  }
  static drawInCanvas(spr) {
    svgerror = false;
    setCanvasSize(spr.outline, spr.originalImg.width, spr.originalImg.height);
    var ctx = spr.outline.getContext("2d");
    _SVG2Canvas.drawImage(spr.svg, ctx);
  }
  static drawLayers(svg, ctx, fcn) {
    for (var i = 0; i < svg.childElementCount; i++) {
      var elem = svg.childNodes[i];
      fcn(elem, ctx);
    }
  }
  static drawImage(svg, ctx) {
    for (var i = 0; i < svg.childElementCount; i++) {
      _SVG2Canvas.drawLayer(svg.childNodes[i], ctx);
    }
  }
  static drawLayer(elem, ctx, _fcn) {
    ctx.fillStyle = !elem.getAttribute("fill") ? "black" : elem.getAttribute("fill") == "none" ? "rgba(0, 0, 0,0)" : elem.getAttribute("fill");
    if (elem.getAttribute("opacity")) {
      ctx.fillStyle = colorToRGBA(ctx.fillStyle, elem.getAttribute("opacity"));
    }
    ctx.strokeStyle = !elem.getAttribute("stroke") ? "rgba(0, 0, 0,0)" : elem.getAttribute("stroke");
    ctx.lineCap = elem.getAttribute("stroke-linecap") ? elem.getAttribute("stroke-linecap") : _SVG2Canvas.strokevalues["stroke-linecap"];
    ctx.lineWidth = elem.getAttribute("stroke-width") ? Number(elem.getAttribute("stroke-width")) : Number(_SVG2Canvas.strokevalues["stroke-width"]);
    ctx.miterLimit = elem.getAttribute("stroke-miterlimit") ? Number(elem.getAttribute("stroke-miterlimit")) : Number(_SVG2Canvas.strokevalues["stroke-miterlimit"]);
    ctx.linejoin = elem.getAttribute("stroke-linejoin") ? elem.getAttribute("stroke-linejoin") : _SVG2Canvas.strokevalues["stroke-linejoin"];
    _SVG2Canvas.processXMLnode(elem, ctx, _SVG2Canvas.drawLayer);
  }
  static drawElementHole(elem, ctx) {
    ctx.fillStyle = !elem.getAttribute("fill") || elem.getAttribute("fill") == "none" ? "black" : elem.getAttribute("fill");
    ctx.strokeStyle = !elem.getAttribute("stroke") ? "rgba(0, 0, 0,0)" : elem.getAttribute("stroke");
    ctx.lineCap = elem.getAttribute("stroke-linecap") ? elem.getAttribute("stroke-linecap") : _SVG2Canvas.strokevalues["stroke-linecap"];
    ctx.lineWidth = elem.getAttribute("stroke-width") ? Number(elem.getAttribute("stroke-width")) : Number(_SVG2Canvas.strokevalues["stroke-width"]);
    ctx.miterLimit = elem.getAttribute("stroke-miterlimit") ? Number(elem.getAttribute("stroke-miterlimit")) : Number(_SVG2Canvas.strokevalues["stroke-miterlimit"]);
    ctx.linejoin = elem.getAttribute("stroke-linejoin") ? elem.getAttribute("stroke-linejoin") : _SVG2Canvas.strokevalues["stroke-linejoin"];
    if (elem.tagName) {
      _SVG2Canvas.processXMLnode(elem, ctx, _SVG2Canvas.drawElementHole);
    } else {
    }
  }
  static drawElementMask(elem, ctx) {
    if (elem.nodeName == "image") {
      return;
    }
    if (elem.nodeName == "clipPath") {
      return;
    }
    if (elem.id.indexOf("pathborder_image") > -1) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = elem.getAttribute("fill") == "none" ? "rgba(0, 0, 0,0)" : "white";
    }
    ctx.strokeStyle = elem.getAttribute("stroke") ? "white" : "rgba(0, 0, 0,0)";
    ctx.lineCap = elem.getAttribute("stroke-linecap") ? elem.getAttribute("stroke-linecap") : _SVG2Canvas.strokevalues["stroke-linecap"];
    ctx.lineWidth = elem.getAttribute("stroke-width") ? Number(elem.getAttribute("stroke-width")) : Number(_SVG2Canvas.strokevalues["stroke-width"]);
    ctx.miterLimit = elem.getAttribute("stroke-miterlimit") ? Number(elem.getAttribute("stroke-miterlimit")) : Number(_SVG2Canvas.strokevalues["stroke-miterlimit"]);
    ctx.linejoin = elem.getAttribute("stroke-linejoin") ? elem.getAttribute("stroke-linejoin") : _SVG2Canvas.strokevalues["stroke-linejoin"];
    _SVG2Canvas.processXMLnode(elem, ctx, _SVG2Canvas.drawElementMask);
  }
  static drawElementOutline(elem, ctx) {
    if (elem.nodeName == "image") {
      return;
    }
    if (elem.nodeName == "clipPath") {
      return;
    }
    if (elem.id.indexOf("pathborder_image") > -1) {
      ctx.fillStyle = window.Settings.spriteOutlineColor;
    } else {
      ctx.fillStyle = elem.getAttribute("fill") == "none" ? "rgba(0, 0, 0,0)" : window.Settings.spriteOutlineColor;
    }
    ctx.strokeStyle = window.Settings.spriteOutlineColor;
    ctx.lineCap = "round";
    ctx.lineWidth = elem.getAttribute("stroke-width") ? Number(elem.getAttribute("stroke-width")) + 12 : 12;
    ctx.miterLimit = 2;
    ctx.linejoin = "round";
    _SVG2Canvas.processXMLnode(elem, ctx, _SVG2Canvas.drawElementOutline);
  }
  static drawBorder(svg, ctx) {
    for (var i = 0; i < svg.childElementCount; i++) {
      _SVG2Canvas.drawElementOutline(svg.childNodes[i], ctx);
    }
  }
  static drawWaterMark(svg, ctx) {
    for (var i = 0; i < svg.childElementCount; i++) {
      var elem = svg.childNodes[i];
      if (elem.tagName == "g") {
        _SVG2Canvas.drawWaterMark(elem, ctx);
      } else {
        _SVG2Canvas.drawObjectWaterMark(elem, ctx);
      }
    }
  }
  static drawObjectWaterMark(elem, ctx) {
    if (elem.nodeName == "image") {
      return;
    }
    if (elem.nodeName == "clipPath") {
      return;
    }
    if (elem.id.indexOf("pathborder_image") > -1) {
      ctx.fillStyle = "black";
    }
    var fill = elem.getAttribute("fill");
    ctx.fillStyle = fill == "none" ? "rgba(0, 0, 0,0)" : "black";
    ctx.strokeStyle = elem.getAttribute("stroke") ? "black" : "rgba(0, 0, 0,0)";
    ctx.lineCap = "round";
    ctx.lineWidth = elem.getAttribute("stroke-width") ? Number(elem.getAttribute("stroke-width")) : Number(_SVG2Canvas.strokevalues["stroke-width"]);
    ctx.miterLimit = elem.getAttribute("stroke-miterlimit") ? Number(elem.getAttribute("stroke-miterlimit")) : Number(_SVG2Canvas.strokevalues["stroke-miterlimit"]);
    ctx.linejoin = "round";
    if (ctx.lineWidth < 2) {
      ctx.lineWidth = 2;
    }
    ctx.save();
    _SVG2Canvas.processXMLnode(elem, ctx);
    ctx.restore();
    if (skipFill()) {
      return;
    }
    ctx.save();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "rgba(0, 0, 0,0)";
    ctx.globalCompositeOperation = "destination-out";
    _SVG2Canvas.processXMLnode(elem, ctx);
    ctx.restore();
    function skipFill() {
      if (elem.id.indexOf("pathborder_image") > -1) {
        return false;
      }
      if (fill == "none") {
        return true;
      }
      if (!fill) {
        return true;
      }
      if (fill == "#080808" || fill == "#000000") {
        return true;
      }
      if (fill == "rgba(0, 0, 0, 0)") {
        return true;
      }
      var brightness = rgb2hsb(fill)[2];
      return brightness < 0.25;
    }
  }
  /**
   * Draws an embedded <image> element masked by its border path.
   * Moved here from painteditor/SVGImage so the rasterizer no longer pulls
   * the whole paint editor into every page's bundle.
   */
  static drawImageElem(image, clip, ctx) {
    var angle = 0;
    var tl = image.transform;
    if (tl) {
      var items = tl.baseVal;
      for (var i = 0; i < items.numberOfItems; ++i) {
        if (items.getItem(i).type == 4) {
          angle = items.getItem(i).angle;
          break;
        }
      }
    }
    var center = {
      x: Number(image.getAttribute("x")) + Number(image.getAttribute("width")) / 2,
      y: Number(image.getAttribute("y")) + Number(image.getAttribute("height")) / 2
    };
    var newcnv = document.createElement("canvas");
    setCanvasSize(newcnv, ctx.canvas.width, ctx.canvas.height);
    var newctx = newcnv.getContext("2d");
    var dataurl = image.getAttribute("xlink:href");
    var img = document.createElement("img");
    img.src = dataurl;
    if (!img.complete) {
      img.onload = function() {
        drame(img, newctx, angle * DEGTOR, center);
      };
    } else {
      drame(img, newctx, angle * DEGTOR, center);
    }
    function drame(img2, c, angle2, center2) {
      var x = Number(image.getAttribute("x"));
      var y = Number(image.getAttribute("y"));
      var width = Number(image.getAttribute("width"));
      var height = Number(image.getAttribute("height"));
      c.fillStyle = "red";
      c.fillRect(x, y, width, height);
      c.save();
      c.translate(center2.x, center2.y);
      c.rotate(angle2);
      c.translate(-center2.x, -center2.y);
      c.drawImage(img2, x, y, width, height);
      c.restore();
      c.save();
      c.globalCompositeOperation = "destination-in";
      c.fillStyle = "#f30";
      c.strokeStyle = "rgba(0,0,0,0)";
      _SVG2Canvas.processXMLnode(clip, c);
      c.restore();
      ctx.drawImage(newcnv, 0, 0);
    }
  }
  ////////////////////////////////////////////////////////
  //  Drawing SVG path commands
  ////////////////////////////////////////////////////////
  static processXMLnode(elem, ctx, fcn) {
    if (!elem) {
      return;
    }
    switch (elem.tagName) {
      case "g":
        _SVG2Canvas.drawLayers(elem, ctx, fcn);
        break;
      case "text":
        _SVG2Canvas.drawText(elem, ctx);
        break;
      case "image":
        var p = elem.parentNode;
        while (p.tagName != "svg") {
          p = p.parentNode;
        }
        var targetPathId = "pathborder_" + elem.id;
        var targetPathElement = p.getElementById(targetPathId);
        if (!targetPathElement) {
          var paths = p.getElementsByTagName("path");
          for (var i = 0; i < paths.length; i++) {
            if (paths[i].id == targetPathId) {
              targetPathElement = paths[i];
            }
          }
        }
        _SVG2Canvas.drawImageElem(elem, targetPathElement, ctx);
        break;
      case "clipPath":
        break;
      case "line":
        _SVG2Canvas.drawLine(elem, ctx);
        break;
      case "rect":
        _SVG2Canvas.drawRect(elem, ctx);
        break;
      case "ellipse":
        _SVG2Canvas.drawEllipse(elem, ctx);
        break;
      case "circle":
        _SVG2Canvas.drawCircle(elem, ctx);
        break;
      case "polygon":
        _SVG2Canvas.drawStraightLines(elem, ctx);
        break;
      case "path":
        _SVG2Canvas.renderPath(elem, ctx);
        break;
      case "polyline":
        _SVG2Canvas.drawPolyline(elem, ctx);
        break;
      default:
        svgerror = true;
        break;
    }
  }
  static drawRect(shape, ctx) {
    ctx.save();
    var x = Number(shape.getAttribute("x"));
    var y = Number(shape.getAttribute("y"));
    var w = Number(shape.getAttribute("width"));
    var h = Number(shape.getAttribute("height"));
    if (ctx.strokeStyle && ctx.strokeStyle != "rgba(0, 0, 0,0)") {
      ctx.strokeRect(x, y, w, h);
    }
    if (ctx.fillStyle && ctx.fillStyle != "rgba(0, 0, 0,0)") {
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }
  static drawLine(shape, ctx) {
    var x1 = Number(shape.getAttribute("x1"));
    var y1 = Number(shape.getAttribute("y1"));
    var x2 = Number(shape.getAttribute("x2"));
    var y2 = Number(shape.getAttribute("y2"));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }
  static drawEllipse(shape, ctx) {
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
    d = _SVG2Canvas.arrayToString(d);
    var commands = _SVG2Canvas.getCommandList(d);
    if (!commands) {
      return;
    }
    acurve = false;
    aqcurve = false;
    ctx.save();
    ctx.beginPath();
    for (var i = 0; i < commands.length; i++) {
      _SVG2Canvas.drawCommand(ctx, commands[i]);
    }
    if (commands[commands.length - 1].indexOf("z") > -1) {
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  static drawCircle(shape, ctx) {
    var r = Number(shape.getAttribute("r"));
    var cx = Number(shape.getAttribute("cx"));
    var cy = Number(shape.getAttribute("cy"));
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  static drawText(kid, ctx) {
    ctx.font = kid.getAttribute("font-weight") + " " + kid.getAttribute("font-size") + "px " + kid.getAttribute("font-family");
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(kid.textContent, 0, 0);
  }
  static renderPath(spr, ctx) {
    var d = spr.getAttribute("d");
    var commands = _SVG2Canvas.getCommandList(d);
    if (!commands) {
      return;
    }
    acurve = false;
    aqcurve = false;
    ctx.save();
    ctx.beginPath();
    for (var i = 0; i < commands.length; i++) {
      _SVG2Canvas.drawCommand(ctx, commands[i]);
    }
    if (commands[commands.length - 1].indexOf("z") > -1) {
      ctx.closePath();
    }
    ctx.fill();
    if (ctx.globalCompositeOperation != "destination-in") {
      ctx.stroke();
    }
    ctx.restore();
  }
  static renderPathTips(spr, ctx) {
    var d = spr.getAttribute("d");
    var commands = _SVG2Canvas.getCommandList(d);
    if (!commands) {
      return;
    }
    acurve = false;
    aqcurve = false;
    _SVG2Canvas.getAbsoluteCommand(commands[0]);
    _SVG2Canvas.drawTip(ctx, endp.x, endp.y, 4);
    for (var i = 1; i < commands.length; i++) {
      _SVG2Canvas.getAbsoluteCommand(commands[i]);
    }
    _SVG2Canvas.drawTip(ctx, endp.x, endp.y, 4);
    ctx.restore();
  }
  static drawTip(ctx, cx, cy, r) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  static getLastPathCommand(spr) {
    var d = spr.getAttribute("d");
    var commands = d.match(/[A-DF-Za-df-z][^A-Za-df-z]*/g);
    return commands.length > 0 ? commands[commands.length - 1].charAt(0) : null;
  }
  static isCloseDPath(elem) {
    if (elem.tagName != "path") {
      return true;
    }
    if (_SVG2Canvas.isCompoundPath(elem)) {
      return true;
    }
    var d = elem.getAttribute("d");
    var commands = d.match(/[A-DF-Za-df-z][^A-Za-df-z]*/g);
    if (commands.length < 2) {
      return false;
    }
    var lastCmd = commands[commands.length - 1];
    if (lastCmd.charAt(0) == "z") {
      return true;
    }
    if (commands.length < 4) {
      return false;
    }
    var firstCmd = commands[0];
    if (lastCmd.charAt(0).toLocaleUpperCase() != lastCmd.charAt(0)) {
      return false;
    }
    var firstdata = _SVG2Canvas.splitNumericArgs(firstCmd.substr(1, firstCmd.length));
    var lastdata = _SVG2Canvas.splitNumericArgs(lastCmd.substr(1, lastCmd.length));
    if (firstdata.length < 2) {
      return false;
    }
    if (lastdata.length < 2) {
      return false;
    }
    var pt1 = {
      x: firstdata[firstdata.length - 2],
      y: firstdata[firstdata.length - 1]
    };
    var pt2 = {
      x: lastdata[lastdata.length - 2],
      y: lastdata[lastdata.length - 1]
    };
    return Vector.len(Vector.diff(pt1, pt2)) < 10;
  }
  static isCompoundPath(shape) {
    var paths = shape.getAttribute("d").match(/[M][^M]*/g);
    if (!paths) {
      return false;
    }
    return paths.length > 1;
  }
  static drawCommand(ctx, cmd) {
    var key = cmd[0];
    dispatchDrawCmd[key](ctx, cmd);
    acurve = curveoptions.indexOf(key) > -1;
    aqcurve = qcurveoptions.indexOf(key) > -1;
  }
  static splitNumericArgs(str) {
    var res = [];
    if (!str) {
      return res;
    }
    var list = str.match(/(?:\+|-)?\d+(?:\.\d+)?(?:e(?:\+|-)?\d+)?/g);
    for (var i = 0; i < list.length; i++) {
      res.push(Number(list[i]));
    }
    return res;
  }
  // moves
  static absoulteMove(ctx, cmd) {
    endp = {
      x: cmd[1],
      y: cmd[2]
    };
    ctx.moveTo(endp.x, endp.y);
    startp = endp;
  }
  static relativeMove(ctx, cmd) {
    endp = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    ctx.moveTo(endp.x, endp.y);
    startp = endp;
  }
  // lines
  static closePath(ctx) {
    endp = startp;
    ctx.lineTo(endp.x, endp.y);
  }
  static absoluteLine(ctx, cmd) {
    endp = {
      x: cmd[1],
      y: cmd[2]
    };
    ctx.lineTo(endp.x, endp.y);
  }
  static relativeLine(ctx, cmd) {
    endp = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    ctx.lineTo(endp.x, endp.y);
  }
  static absoluteHLine(ctx, cmd) {
    var dx = cmd[1];
    endp = {
      x: dx,
      y: endp.y
    };
    ctx.lineTo(endp.x, endp.y);
  }
  static relativeHLine(ctx, cmd) {
    var dx = endp.x + cmd[1];
    endp = {
      x: dx,
      y: endp.y
    };
    ctx.lineTo(endp.x, endp.y);
  }
  static absoluteVLine(ctx, cmd) {
    var dy = cmd[1];
    endp = {
      x: endp.x,
      y: dy
    };
    ctx.lineTo(endp.x, endp.y);
  }
  static relativeVLine(ctx, cmd) {
    var dy = endp.y + cmd[1];
    endp = {
      x: endp.x,
      y: dy
    };
    ctx.lineTo(endp.x, endp.y);
  }
  // curves
  static absoluteCurve(ctx, cmd) {
    ctx.bezierCurveTo(cmd[1], cmd[2], cmd[3], cmd[4], cmd[5], cmd[6]);
    lastcxy = {
      x: cmd[3],
      y: cmd[4]
    };
    endp = {
      x: cmd[5],
      y: cmd[6]
    };
  }
  static relativeCurve(ctx, cmd) {
    var pt1 = {
      x: cmd[1],
      y: cmd[2]
    };
    var pt2 = {
      x: cmd[3],
      y: cmd[4]
    };
    var pt3 = {
      x: cmd[5],
      y: cmd[6]
    };
    var c1 = Vector.sum(endp, pt1);
    var c2 = Vector.sum(endp, pt2);
    lastcxy = c2;
    var endat = Vector.sum(endp, pt3);
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, endat.x, endat.y);
    endp = endat;
  }
  static absoluteSmooth(ctx, cmd) {
    var c1 = acurve ? Vector.sum(endp, Vector.diff(endp, lastcxy)) : endp;
    var c2 = {
      x: cmd[1],
      y: cmd[2]
    };
    var endat = {
      x: cmd[3],
      y: cmd[4]
    };
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, endat.x, endat.y);
    endp = endat;
    lastcxy = c2;
  }
  static relativeSmooth(ctx, cmd) {
    var c1 = acurve ? Vector.sum(endp, Vector.diff(endp, lastcxy)) : endp;
    var c2 = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    var endat = Vector.sum(endp, {
      x: cmd[3],
      y: cmd[4]
    });
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, endat.x, endat.y);
    endp = endat;
    lastcxy = c2;
  }
  // 	Quadratic
  static absoluteQCurve(ctx, cmd) {
    var c1 = {
      x: cmd[1],
      y: cmd[2]
    };
    endp = {
      x: cmd[3],
      y: cmd[4]
    };
    ctx.quadraticCurveTo(c1.x, c1.y, endp.x, endp.y);
    lastcxy = c1;
  }
  static relativeQCurve(ctx, cmd) {
    var c1 = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    endp = Vector.sum(endp, {
      x: cmd[3],
      y: cmd[4]
    });
    lastcxy = c1;
    ctx.quadraticCurveTo(c1.x, c1.y, endp.x, endp.y);
  }
  static absoluteQSmooth(ctx, cmd) {
    var c1 = aqcurve ? Vector.sum(endp, Vector.diff(endp, lastcxy)) : endp;
    endp = {
      x: cmd[1],
      y: cmd[2]
    };
    lastcxy = c1;
    ctx.quadraticCurveTo(c1.x, c1.y, endp.x, endp.y);
  }
  static relativeQSmooth(ctx, cmd) {
    var c1 = aqcurve ? Vector.sum(endp, Vector.diff(endp, lastcxy)) : endp;
    endp = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    lastcxy = c1;
    ctx.quadraticCurveTo(c1.x, c1.y, endp.x, endp.y);
  }
  ////////////////////////////////////////
  // Drawing Polygon
  ////////////////////////////////////////
  static drawStraightLines(elem, ctx) {
    var points = elem.points;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points.getItem(0).x, points.getItem(0).y);
    for (var i = 1; i < points.numberOfItems; i++) {
      ctx.lineTo(points.getItem(i).x, points.getItem(i).y);
    }
    ctx.lineTo(points.getItem(0).x, points.getItem(0).y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  static drawPolyline(elem, ctx) {
    var points = elem.points;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points.getItem(0).x, points.getItem(0).y);
    for (var i = 1; i < points.numberOfItems; i++) {
      ctx.lineTo(points.getItem(i).x, points.getItem(i).y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ////////////////////////////////////////////////////
  // Relative to Absolute Path conversion
  ///////////////////////////////////////////////////
  static setAbsolutePath(spr) {
    var d = spr.getAttribute("d");
    var commands = _SVG2Canvas.getCommandList(d);
    if (!commands) {
      return;
    }
    var absolute = _SVG2Canvas.getAbsoluteCommands(commands);
    var path3 = _SVG2Canvas.arrayToString(absolute);
    spr.setAttribute("d", path3);
  }
  static getSVGcommands(shape) {
    return _SVG2Canvas.getCommandList(shape.getAttribute("d"));
  }
  static getCommandList(d) {
    if (!d) {
      return null;
    }
    var commands = d.match(/[A-DF-Za-df-z][^A-Za-df-z]*/g);
    if (!commands) {
      return null;
    }
    var res = [];
    for (var i = 0; i < commands.length; i++) {
      var cmd = commands[i];
      var ct = cmd.charAt(0);
      var cmddata = ct.toLowerCase() == "z" ? [] : _SVG2Canvas.splitNumericArgs(cmd.substr(1, cmd.length));
      cmddata.unshift(ct);
      res.push(cmddata);
    }
    return res;
  }
  static arrayToString(res) {
    var str = "";
    for (var i = 0; i < res.length; i++) {
      var cmd = res[i];
      str += cmd[0];
      if (cmd.length > 1) {
        cmd.shift();
        str += cmd.toString();
      }
    }
    return str;
  }
  static getAbsoluteCommands(list) {
    var res = [];
    for (var i = 0; i < list.length; i++) {
      res.push(_SVG2Canvas.getAbsoluteCommand(list[i]));
    }
    return res;
  }
  static getAbsoluteCommand(cmd) {
    var key = cmd[0];
    acurve = curveoptions.indexOf(key) > -1;
    aqcurve = qcurveoptions.indexOf(key) > -1;
    return dispatchAbsouluteCmd[key](cmd);
  }
  // moves
  static setAbsoluteMove(cmd) {
    acurve = false;
    aqcurve = false;
    endp = {
      x: cmd[1],
      y: cmd[2]
    };
    startp = endp;
    lastcxy = endp;
    return cmd;
  }
  static setRelativeMove(cmd) {
    endp = {
      x: cmd[1],
      y: cmd[2]
    };
    startp = endp;
    return ["M", endp.x, endp.y];
  }
  // lines
  static setClosePath(cmd) {
    endp = startp;
    return cmd;
  }
  static setAbsoluteLine(cmd) {
    endp = {
      x: cmd[1],
      y: cmd[2]
    };
    return cmd;
  }
  static setRelativeLine(cmd) {
    endp = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    return ["L", endp.x, endp.y];
  }
  static setAbsoluteHLine(cmd) {
    endp = {
      x: cmd[1],
      y: endp.y
    };
    return ["L", endp.x, endp.y];
  }
  static setRelativeHLine(cmd) {
    endp = {
      x: endp.x + cmd[1],
      y: endp.y
    };
    return ["L", endp.x, endp.y];
  }
  static setAbsoluteVLine(cmd) {
    endp = {
      x: endp.x,
      y: cmd[1]
    };
    return ["L", endp.x, endp.y];
  }
  static setRelativeVLine(cmd) {
    endp = {
      x: endp.x,
      y: endp.y + cmd[1]
    };
    return ["L", endp.x, endp.y];
  }
  // curves
  // Cubic
  static setAbsoluteCurve(cmd) {
    lastcxy = {
      x: cmd[3],
      y: cmd[4]
    };
    endp = {
      x: cmd[5],
      y: cmd[6]
    };
    return cmd;
  }
  static setRelativeCurve(cmd) {
    var pt1 = {
      x: cmd[1],
      y: cmd[2]
    };
    var pt2 = {
      x: cmd[3],
      y: cmd[4]
    };
    var pt3 = {
      x: cmd[5],
      y: cmd[6]
    };
    var c1 = Vector.sum(endp, pt1);
    var c2 = Vector.sum(endp, pt2);
    lastcxy = c2;
    endp = Vector.sum(endp, pt3);
    return ["C", c1.x, c1.y, c2.x, c2.y, endp.x, endp.y];
  }
  static setAbsoluteSmooth(cmd) {
    lastcxy = {
      x: cmd[1],
      y: cmd[2]
    };
    endp = {
      x: cmd[3],
      y: cmd[4]
    };
    return cmd;
  }
  static setRelativeSmooth(cmd) {
    var c1 = acurve ? Vector.sum(endp, Vector.diff(endp, lastcxy)) : endp;
    var c2 = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    var endat = Vector.sum(endp, {
      x: cmd[3],
      y: cmd[4]
    });
    endp = endat;
    lastcxy = c2;
    return ["C", c1.x, c1.y, c2.x, c2.y, endat.x, endat.y];
  }
  // 	Quadratic
  static setAbsoluteQCurve(cmd) {
    lastcxy = {
      x: cmd[1],
      y: cmd[2]
    };
    endp = {
      x: cmd[3],
      y: cmd[4]
    };
    return cmd;
  }
  static setRelativeQCurve(cmd) {
    lastcxy = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    endp = Vector.sum(endp, {
      x: cmd[3],
      y: cmd[4]
    });
    return ["Q", lastcxy.x, lastcxy.y, null, null];
  }
  static setAbsoluteQSmooth(cmd) {
    var c1 = aqcurve ? Vector.sum(endp, Vector.diff(endp, lastcxy)) : endp;
    endp = {
      x: cmd[1],
      y: cmd[2]
    };
    lastcxy = c1;
    return cmd;
  }
  static setRelativeQSmooth(cmd) {
    lastcxy = aqcurve ? Vector.sum(endp, Vector.diff(endp, lastcxy)) : endp;
    endp = Vector.sum(endp, {
      x: cmd[1],
      y: cmd[2]
    });
    return ["T", endp.x, endp.y];
  }
};
var dispatchDrawCmd = {
  "M": SVG2Canvas.absoulteMove,
  "m": SVG2Canvas.relativeMove,
  "L": SVG2Canvas.absoluteLine,
  "l": SVG2Canvas.relativeLine,
  "H": SVG2Canvas.absoluteHLine,
  "h": SVG2Canvas.relativeHLine,
  "V": SVG2Canvas.absoluteVLine,
  "v": SVG2Canvas.relativeVLine,
  "C": SVG2Canvas.absoluteCurve,
  "c": SVG2Canvas.relativeCurve,
  "S": SVG2Canvas.absoluteSmooth,
  "s": SVG2Canvas.relativeSmooth,
  "Q": SVG2Canvas.absoluteQCurve,
  "q": SVG2Canvas.relativeQCurve,
  "T": SVG2Canvas.absoluteQSmooth,
  "t": SVG2Canvas.relativeQSmooth,
  "Z": SVG2Canvas.closePath,
  "z": SVG2Canvas.closePath
};
var dispatchAbsouluteCmd = {
  "M": SVG2Canvas.setAbsoluteMove,
  "m": SVG2Canvas.setRelativeMove,
  "L": SVG2Canvas.setAbsoluteLine,
  "l": SVG2Canvas.setRelativeLine,
  "H": SVG2Canvas.setAbsoluteHLine,
  "h": SVG2Canvas.setRelativeHLine,
  "V": SVG2Canvas.setAbsoluteVLine,
  "v": SVG2Canvas.setRelativeVLine,
  "C": SVG2Canvas.setAbsoluteCurve,
  "c": SVG2Canvas.setRelativeCurve,
  "S": SVG2Canvas.setAbsoluteSmooth,
  "s": SVG2Canvas.setRelativeSmooth,
  "Q": SVG2Canvas.setAbsoluteQCurve,
  "q": SVG2Canvas.setRelativeQCurve,
  "T": SVG2Canvas.setAbsoluteQSmooth,
  "t": SVG2Canvas.setRelativeQSmooth,
  "Z": SVG2Canvas.setClosePath,
  "z": SVG2Canvas.setClosePath
};

// src/app/src/iPad/IO.ts
var database = "projects";
var collectLibraryAssets = false;
var zipFile = null;
var zipFileName = "";
var shareName = "";
var IO = class _IO {
  static get zipFileName() {
    return zipFileName;
  }
  static get shareName() {
    return shareName;
  }
  static requestFromServer(url, whenDone) {
    iOS.waitForInterface(function() {
      iOS.gettextresource(url, whenDone);
    });
  }
  static getThumbnail(str, w, h, destw, desth) {
    str = str.replace(/>\s*</g, "><");
    var xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    var extxml = document.importNode(xmlDoc.documentElement, true);
    if (extxml.childNodes[0].nodeName == "#comment") {
      extxml.removeChild(extxml.childNodes[0]);
    }
    var srccnv = document.createElement("canvas");
    setCanvasSize(srccnv, Number(w), Number(h));
    var ctx = srccnv.getContext("2d");
    for (var i = 0; i < extxml.childElementCount; i++) {
      SVG2Canvas.drawLayer(extxml.childNodes[i], ctx);
    }
    if (!destw || !desth) {
      return srccnv.toDataURL("image/png");
    }
    var cnv = document.createElement("canvas");
    setCanvasSize(cnv, destw, desth);
    drawThumbnail(srccnv, cnv);
    return cnv.toDataURL("image/png");
  }
  // in iOS casting an svg url in a img.src works except when the SVG has images.
  // This code avoids that bug
  // also when in debug mode you need to get the base64 to avoid sandboxing issues
  static getAsset(md5, fcn) {
    if (MediaLib.keys[md5]) {
      fcn(MediaLib.path + md5);
      return;
    }
    if (md5.indexOf("/") > -1) {
      _IO.requestFromServer(md5, gotit);
      return;
    }
    if (_IO.getExtension(md5) == "png" && iOS.path) {
      fcn(iOS.path + md5);
    } else {
      iOS.getmedia(md5, nextStep);
    }
    function gotit(str) {
      var base64 = _IO.getImageDataURL(md5, btoa(str));
      if (str.indexOf("xlink:href") < 0) {
        fcn(md5);
      } else {
        _IO.getImagesInSVG(str, function() {
          fcn(base64);
        });
      }
    }
    function nextStep(dataurl) {
      var str = atob(dataurl);
      if (str.indexOf("xlink:href") < 0 && iOS.path) {
        fcn(iOS.path + md5);
      } else {
        var base64 = _IO.getImageDataURL(md5, dataurl);
        _IO.getImagesInSVG(str, function() {
          fcn(base64);
        });
      }
    }
  }
  static getImagesInSVG(str, whenDone) {
    str = str.replace(/>\s*</g, "><");
    if (str.indexOf("xlink:href") < 0) {
      whenDone();
    } else {
      loadInnerImages(str, whenDone);
    }
    function loadInnerImages(str2, whenDone2) {
      var xmlDoc = new DOMParser().parseFromString(str2, "text/xml");
      var extxml = document.importNode(xmlDoc.documentElement, true);
      if (extxml.childNodes[0].nodeName == "#comment") {
        extxml.removeChild(extxml.childNodes[0]);
      }
      var images = _IO.getImages(extxml, []);
      var imageCount = images.length;
      for (var i = 0; i < images.length; i++) {
        var dataurl = images[i].getAttribute("xlink:href");
        var svgimg = document.createElement("img");
        svgimg.src = dataurl;
        if (!svgimg.complete) {
          svgimg.onload = function() {
            readToLad();
          };
        } else {
          readToLad();
        }
      }
      function readToLad() {
        imageCount--;
        if (imageCount < 1) {
          extxml = null;
          xmlDoc = null;
          whenDone2();
        }
      }
    }
  }
  static getImages(p, res) {
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
      if (elem.nodeName == "image") {
        res.push(elem);
      }
      if (elem.nodeName == "g") {
        _IO.getImages(elem, res);
      }
    }
    return res;
  }
  static getImageDataURL(md5, data) {
    var header = "";
    switch (_IO.getExtension(md5)) {
      case "svg":
        header = "data:image/svg+xml;base64,";
        break;
      case "png":
        header = "data:image/png;base64,";
        break;
    }
    return header + data;
  }
  static getObject(md5, fcn) {
    if (md5.indexOf("/") > -1) {
      var gotit = function(str) {
        fcn(str);
      };
      _IO.requestFromServer(md5, gotit);
    } else {
      _IO.getObjectinDB(database, md5, fcn);
    }
  }
  static getObjectinDB(db, md5, fcn) {
    var json = { op: "select", table: db, where: [{ col: "id", op: "=", value: md5 }] };
    iOS.query(json, fcn);
  }
  static setMedia(data, type, fcn) {
    iOS.setmedia(btoa(data), type, fcn);
  }
  static query(type, obj, fcn) {
    var json = { op: "select", table: type, items: obj.items, where: obj.where, order: obj.order };
    iOS.query(json, fcn);
  }
  static deleteobject(type, id, fcn) {
    iOS.stmt({ op: "delete", table: type, id }, fcn);
  }
  ////////////////////////
  // projects
  ///////////////////////
  /*
      +[id] =>  // SQL ID creates this
      [deleted] =>
      [name] =>
      [json] => project data
      [thumb] =>
      [mtime] => modification time
  */
  static createProject(obj, fcn) {
    var row = {
      name: obj.name || "Project",
      version: obj.version || window.Settings?.scratchJrVersion || "1.0.0",
      deleted: "NO",
      mtime: (/* @__PURE__ */ new Date()).getTime().toString(),
      isgift: obj.isgift ? obj.isgift : "0"
    };
    if (obj.json) {
      row.json = JSON.stringify(obj.json);
    }
    if (obj.thumbnail) {
      row.thumbnail = JSON.stringify(obj.thumbnail);
    }
    iOS.stmt({ op: "insert", table: database, row }, fcn);
  }
  static saveProject(obj, fcn) {
    try {
      var row = {
        version: obj.version || window.Settings?.scratchJrVersion || "1.0.0",
        deleted: obj.deleted || "NO",
        name: obj.name || "Project",
        json: JSON.stringify(obj.json),
        thumbnail: JSON.stringify(obj.thumbnail),
        mtime: (/* @__PURE__ */ new Date()).getTime().toString()
      };
      iOS.stmt({ op: "update", table: database, row, id: obj.id }, fcn);
    } catch (e) {
      if (fcn) {
        fcn(-1);
      }
    }
  }
  // Since saveProject is changing the modified time of the project,
  // let's just simply update the isgift flag in a separate function...
  static setProjectIsGift(obj, fcn) {
    iOS.stmt({ op: "update", table: database, row: { isgift: obj.isgift }, id: obj.id }, fcn);
  }
  static getExtension(str) {
    return str.substring(str.indexOf(".") + 1, str.length);
  }
  static getFilename(str) {
    return str.substring(0, str.indexOf("."));
  }
  static parseProjectData(data) {
    var res = {};
    for (var key in data) {
      res[key.toLowerCase()] = data[key];
    }
    return res;
  }
  //////////////////
  // Sharing
  ////////////////////
  static zipProject(projectReference, finished) {
    _IO.getObject(projectReference, function(projectFromDB) {
      var projectMetadata = {
        "thumbnails": [],
        "characters": [],
        "backgrounds": [],
        "sounds": []
      };
      var jsonData = _IO.parseProjectData(JSON.parse(projectFromDB)[0]);
      if (typeof jsonData.json == "string") {
        jsonData.json = JSON.parse(jsonData.json);
      }
      if (typeof jsonData.thumbnail == "string") {
        jsonData.thumbnail = JSON.parse(jsonData.thumbnail);
      }
      var collectAsset = function(assetType, md5) {
        if (md5 && typeof md5 !== "undefined") {
          if (md5.indexOf("samples/") < 0) {
            if (collectLibraryAssets) {
              if (projectMetadata[assetType].indexOf(md5) < 0 && MediaLib.sounds.indexOf(md5) < 0) {
                projectMetadata[assetType].push(md5);
              }
            } else {
              if (md5 && typeof md5 !== "undefined" && !MediaLib.keys[md5] && MediaLib.sounds.indexOf(md5) < 0) {
                if (projectMetadata[assetType].indexOf(md5) < 0) {
                  projectMetadata[assetType].push(md5);
                }
              }
            }
          }
        }
      };
      const thumbnail = jsonData.thumbnail;
      if (thumbnail && typeof thumbnail === "object" && "md5" in thumbnail) {
        collectAsset("thumbnails", thumbnail.md5);
      }
      var projectData = jsonData.json;
      if (projectData && typeof projectData === "object" && "pages" in projectData && Array.isArray(projectData.pages)) {
        var pages = projectData.pages;
        for (var p = 0; p < pages.length; p++) {
          var pageReference = pages[p];
          var page = projectData[pageReference];
          collectAsset("backgrounds", page.md5);
          var sprites2 = page.sprites;
          for (var s = 0; s < sprites2.length; s++) {
            var spriteReference = sprites2[s];
            var sprite = page[spriteReference];
            if (sprite.type != "sprite") {
              continue;
            }
            collectAsset("characters", sprite.md5);
            var sounds2 = sprite.sounds;
            for (var snd = 0; snd < sounds2.length; snd++) {
              collectAsset("sounds", sounds2[snd]);
            }
          }
        }
      }
      zipFile = new import_jszip.default();
      zipFile.folder("project");
      var projectDataForZip = JSON.stringify(jsonData);
      zipFile.file("project/data.json", projectDataForZip, {});
      var addMediaToZip = function(folder, md5) {
        return new Promise(function(resolve) {
          var addToZip = function(b64data) {
            zipFile.file("project/" + folder + "/" + md5, b64data, {
              base64: true,
              createFolders: true
            });
            resolve();
          };
          if (md5 in MediaLib.keys) {
            _IO.requestFromServer(MediaLib.path + md5, function(raw) {
              addToZip(btoa(raw));
            });
          } else {
            iOS.getmedia(md5, addToZip);
          }
        });
      };
      var pendingAssets = [];
      for (var j = 0; j < projectMetadata.thumbnails.length; j++) {
        pendingAssets.push(addMediaToZip("thumbnails", projectMetadata.thumbnails[j]));
      }
      for (var k = 0; k < projectMetadata.characters.length; k++) {
        pendingAssets.push(addMediaToZip("characters", projectMetadata.characters[k]));
      }
      for (var l = 0; l < projectMetadata.backgrounds.length; l++) {
        pendingAssets.push(addMediaToZip("backgrounds", projectMetadata.backgrounds[l]));
      }
      for (var m = 0; m < projectMetadata.sounds.length; m++) {
        pendingAssets.push(addMediaToZip("sounds", projectMetadata.sounds[m]));
      }
      var illegalRe = /[\/\?<>\\:\*\|":]/g;
      var controlRe = /[\x00-\x1f\x80-\x9f]/g;
      var reservedRe = /^\.+$/;
      var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
      var windowsTrailingRe = /[\. ]+$/;
      const projectName = typeof jsonData.name === "string" ? jsonData.name : "";
      zipFileName = projectName.replace(/\s*/g, "");
      zipFileName = zipFileName.replace(illegalRe, "_").replace(controlRe, "_").replace(reservedRe, "_").replace(windowsReservedRe, "_").replace(windowsTrailingRe, "_");
      shareName = projectName;
      Promise.all(pendingAssets).then(function() {
        finished(zipFile.generate({
          "compression": "STORE"
        }));
      });
    });
  }
  static uniqueProjectName(jsonData, callback, useOne) {
    var nameAndNumber = function(name) {
      var splitName = name.split(" ");
      var lastPart = splitName.pop();
      if (!isNaN(Number(lastPart))) {
        return {
          "name": splitName.join(" "),
          "number": parseInt(lastPart)
        };
      } else {
        return {
          "name": name,
          "number": null
        };
      }
    };
    var giftProjectNameParts = nameAndNumber(jsonData.name);
    var json = {
      op: "select",
      table: iOS.database,
      items: ["name"],
      where: [{ col: "deleted", op: "=", value: "NO" }, { col: "gallery", op: "IS NULL" }]
    };
    _IO.query(iOS.database, json, function(existingProjects) {
      var newNumber = null;
      var existingProjectList = JSON.parse(existingProjects);
      for (var i = 0; i < existingProjectList.length; i++) {
        var existingProjectName = _IO.parseProjectData(existingProjectList[i]).name;
        var existingProjectNameParts = nameAndNumber(existingProjectName);
        if (giftProjectNameParts.name == existingProjectNameParts.name) {
          if (existingProjectNameParts.number != null) {
            newNumber = existingProjectNameParts.number + 1;
          } else {
            newNumber = 2;
          }
        }
      }
      if (newNumber != null && (!giftProjectNameParts.number || newNumber > giftProjectNameParts.number)) {
        jsonData.name = giftProjectNameParts.name + " " + newNumber;
      } else if (useOne) {
        jsonData.name = giftProjectNameParts.name + " 1";
      }
      callback(jsonData);
    });
  }
  // Receive a base64-encoded zip from iOS (upon open a project)
  static loadProjectFromSjr(b64data) {
    var saveExpected = 0;
    var saveActual = 0;
    var receivedZip = new import_jszip.default();
    receivedZip.load(b64data, {
      "base64": true
    });
    var characterNames = {};
    receivedZip.forEach(function(relativePath, file) {
      if (file.dir) {
        return;
      }
      var fullName = relativePath.split("/").pop();
      if (fullName == "data.json") {
        var jsonData = JSON.parse(file.asText());
        var currentVersion = 1;
        var projectVersion = parseInt(jsonData.version.replace("iOSv", "")) || 0;
        if (projectVersion > currentVersion) {
          throw new Error("Project created in a new version of ScratchJr. Please upgrade ScratchJr.");
        }
        _IO.uniqueProjectName(jsonData, function(jsonData2) {
          jsonData2.isgift = "1";
          _IO.createProject(jsonData2, function() {
          });
        });
        var projectData = jsonData.json;
        for (var p = 0; p < projectData.pages.length; p++) {
          var pageReference = projectData.pages[p];
          var page = projectData[pageReference];
          for (var s = 0; s < page.sprites.length; s++) {
            var spriteReference = page.sprites[s];
            var sprite = page[spriteReference];
            if (sprite.type == "sprite") {
              characterNames[sprite.md5] = unescape(sprite.name).replace(/[0-9]/g, "").replace(/\s*/g, "");
            }
          }
        }
      }
    });
    receivedZip.forEach(function(relativePath, file) {
      if (file.dir) {
        return;
      }
      saveExpected++;
      var subFolder = relativePath.split("/")[1];
      var fullName = relativePath.split("/").pop();
      var name = fullName.split(".")[0];
      var ext = fullName.split(".").pop();
      if (!name || !ext) {
        return;
      }
      if (fullName in MediaLib.keys) {
        saveActual++;
        return;
      }
      var data = file.asBinary();
      var b2data = btoa(data);
      if (subFolder == "thumbnails" || subFolder == "sounds") {
        iOS.setmedianame(b2data, name, ext, function() {
          saveActual++;
        });
      } else if (subFolder == "characters") {
        iOS.setmedianame(b2data, name, ext, function() {
          var svgParser = new DOMParser().parseFromString(data, "text/xml");
          var width = svgParser.getElementsByTagName("svg")[0].width.baseVal.value;
          var height = svgParser.getElementsByTagName("svg")[0].height.baseVal.value;
          var scale = "0.5";
          _IO.getImagesInSVG(data, gotSVGImages);
          function gotSVGImages() {
            var thumbnailDataURL = _IO.getThumbnail(data, width, height, 120, 90);
            var thumbnailPngBase64 = thumbnailDataURL.split(",")[1];
            var charName = characterNames[fullName];
            iOS.setmedia(thumbnailPngBase64, "png", function(thumbnailMD5) {
              var json = {
                op: "select",
                table: "usershapes",
                items: ["*"],
                where: [
                  { col: "ext", op: "=", value: "svg" },
                  { col: "md5", op: "=", value: fullName },
                  { col: "altmd5", op: "=", value: thumbnailMD5 },
                  { col: "name", op: "=", value: charName },
                  { col: "scale", op: "=", value: scale },
                  { col: "width", op: "=", value: width.toString() },
                  { col: "height", op: "=", value: height.toString() }
                ],
                order: { col: "ctime", dir: "desc" }
              };
              _IO.query("usershapes", json, function(results) {
                results = JSON.parse(results);
                if (results.length == 0) {
                  iOS.stmt({
                    op: "insert",
                    table: "usershapes",
                    row: {
                      scale,
                      md5: fullName,
                      altmd5: thumbnailMD5,
                      version: "iOSv01",
                      width: width.toString(),
                      height: height.toString(),
                      ext: "svg",
                      name: charName
                    }
                  }, function() {
                    saveActual++;
                  });
                } else {
                  saveActual++;
                }
              });
            });
          }
        });
      } else if (subFolder == "backgrounds") {
        iOS.setmedianame(b2data, name, ext, function() {
          _IO.getImagesInSVG(data, gotSVGImages);
          function gotSVGImages() {
            var thumbnailDataURL = _IO.getThumbnail(data, 480, 360, 120, 90);
            var thumbnailPngBase64 = thumbnailDataURL.split(",")[1];
            iOS.setmedia(thumbnailPngBase64, "png", function(thumbnailMD5) {
              var json = {
                op: "select",
                table: "userbkgs",
                items: ["*"],
                where: [
                  { col: "ext", op: "=", value: "svg" },
                  { col: "md5", op: "=", value: fullName },
                  { col: "altmd5", op: "=", value: thumbnailMD5 }
                ],
                order: { col: "ctime", dir: "desc" }
              };
              _IO.query("userbkgs", json, function(results) {
                results = JSON.parse(results);
                if (results.length == 0) {
                  iOS.stmt({
                    op: "insert",
                    table: "userbkgs",
                    row: {
                      md5: fullName,
                      altmd5: thumbnailMD5,
                      version: "iOSv01",
                      width: "480",
                      height: "360",
                      ext: "svg"
                    }
                  }, function() {
                    saveActual++;
                  });
                } else {
                  saveActual++;
                }
              });
            });
          }
        });
      } else {
        saveActual++;
      }
    });
    function refreshLobby() {
      if (gn("hometab") !== null) {
        if (saveActual == saveExpected) {
          Lobby.setPage("home");
        } else {
          setTimeout(refreshLobby, 100);
        }
      }
    }
    refreshLobby();
  }
};

// src/app/src/iPad/iOS.ts
var path2;
var camera;
var database2 = "projects";
var mediacounter = 0;
var tabletInterface = null;
var iOS = class _iOS {
  // Getters/setters for properties used in other classes
  static get path() {
    return path2;
  }
  static set path(newPath) {
    path2 = newPath;
  }
  static get camera() {
    return camera;
  }
  static get database() {
    return database2;
  }
  // Wait for the tablet interface to be injected into the webview
  static waitForInterface(fcn) {
    if (tabletInterface != null) {
      fcn();
      return;
    }
    if (typeof AndroidInterface !== "undefined") {
      tabletInterface = AndroidInterface;
      if (fcn) {
        fcn();
      }
      return;
    }
    if (typeof window.tablet != "object") {
      setTimeout(function() {
        _iOS.waitForInterface(fcn);
      }, 100);
    } else {
      tabletInterface = window.tablet;
      if (fcn) {
        fcn();
      }
    }
  }
  // Database functions
  static async stmt(json, fcn) {
    try {
      var result = await tabletInterface.database_stmt(JSON.stringify(json));
      if (typeof fcn !== "undefined") {
        fcn(result);
      }
    } catch (e) {
      if (typeof fcn !== "undefined") {
        fcn(-1);
      }
    }
  }
  static async query(json, fcn) {
    var result = await tabletInterface.database_query(JSON.stringify(json));
    if (typeof fcn !== "undefined") {
      fcn(result);
    }
  }
  static setfield(db, id, fieldname, val, fcn) {
    var row = {};
    row[fieldname] = val;
    row.mtime = (/* @__PURE__ */ new Date()).getTime().toString();
    _iOS.stmt({ op: "update", table: db, row, id }, fcn);
  }
  // IO functions
  static async cleanassets(ft, fcn) {
    await tabletInterface.io_cleanassets(ft);
    fcn();
  }
  static async getmedia(file, fcn) {
    mediacounter++;
    var nextStep = async function(file2, key, whenDone) {
      var result = await tabletInterface.io_getmedialen(file2, String(key));
      _iOS.processdata(String(key), 0, result, "", whenDone);
    };
    nextStep(file, mediacounter, fcn);
  }
  static async getmediadata(key, offset, len, fcn) {
    var result = await tabletInterface.io_getmediadata(key, offset, len);
    if (fcn) {
      fcn(result);
    }
  }
  static async processdata(key, off, len, oldstr, fcn) {
    if (len == 0) {
      _iOS.getmediadone(key);
      fcn(oldstr);
      return;
    }
    var newlen = len < 1e5 ? len : 1e5;
    _iOS.getmediadata(key, off, newlen, function(str) {
      _iOS.processdata(key, off + newlen, len - newlen, oldstr + str, fcn);
    });
  }
  static async getsettings(fcn) {
    var result = await tabletInterface.io_getsettings();
    if (fcn) {
      fcn(result);
    }
  }
  static async getmediadone(file, fcn) {
    var result = await tabletInterface.io_getmediadone(file);
    if (fcn) {
      fcn(result);
    }
  }
  static async setmedia(str, ext, fcn) {
    var result = await tabletInterface.io_setmedia(str, ext);
    if (fcn) {
      fcn(result);
    }
  }
  static async setmedianame(str, name, ext, fcn) {
    var result = await tabletInterface.io_setmedianame(str, name, ext);
    if (fcn) {
      fcn(result);
    }
  }
  static async getmd5(str, fcn) {
    var result = await tabletInterface.io_getmd5(str);
    if (fcn) {
      fcn(result);
    }
  }
  static async remove(str, fcn) {
    var result = await tabletInterface.io_remove(str);
    if (fcn) {
      fcn(result);
    }
  }
  static async getfile(str, fcn) {
    var result = await tabletInterface.io_getfile(str);
    if (fcn) {
      fcn(result);
    }
  }
  static async gettextresource(filename, fcn) {
    var result = await tabletInterface.io_gettextresource(filename);
    if (fcn) {
      fcn(result);
    }
  }
  static async setfile(name, str, fcn) {
    var result = await tabletInterface.io_setfile(name, btoa(String(str)));
    if (fcn) {
      fcn(result);
    }
  }
  // Sound functions
  static registerSound(dir, name, fcn) {
    var result = tabletInterface.io_registersound(dir, name);
    if (fcn) {
      fcn(result);
    }
  }
  static playSound(name, fcn) {
    var result = tabletInterface.io_playsound(name);
    if (fcn) {
      fcn(result);
    }
  }
  static stopSound(name, fcn) {
    var result = tabletInterface.io_stopsound(name);
    if (fcn) {
      fcn(result);
    }
  }
  // Web Wiew delegate call backs
  static soundDone(name) {
    ScratchAudio.soundDone(name);
  }
  static sndrecord(fcn) {
    var result = tabletInterface.recordsound_recordstart();
    if (fcn) {
      fcn(result);
    }
  }
  static recordstop(fcn) {
    var result = tabletInterface.recordsound_recordstop();
    if (fcn) {
      fcn(result);
    }
  }
  static volume(fcn, err) {
    var result = tabletInterface.recordsound_volume();
    if (fcn) {
      fcn(result);
    }
  }
  static startplay(fcn) {
    var result = tabletInterface.recordsound_startplay();
    if (fcn) {
      fcn(result);
    }
  }
  static stopplay(fcn) {
    var result = tabletInterface.recordsound_stopplay();
    if (fcn) {
      fcn(result);
    }
  }
  static recorddisappear(b, fcn) {
    var result = tabletInterface.recordsound_recordclose(b);
    if (fcn) {
      fcn(result);
    }
  }
  // Record state
  static askpermission() {
    if (isiOS) {
      tabletInterface.askForPermission();
    }
  }
  // camera functions
  static hascamera() {
    camera = tabletInterface.scratchjr_cameracheck();
  }
  static startfeed(data, fcn) {
    var str = JSON.stringify(data);
    var result = tabletInterface.scratchjr_startfeed(str);
    if (fcn) {
      fcn(result);
    }
  }
  static stopfeed(fcn) {
    var result = tabletInterface.scratchjr_stopfeed();
    if (fcn) {
      fcn(result);
    }
  }
  static choosecamera(mode, fcn) {
    var result = tabletInterface.scratchjr_choosecamera(mode);
    if (fcn) {
      fcn(result);
    }
  }
  static captureimage(fcn) {
    tabletInterface.scratchjr_captureimage(fcn);
  }
  static hidesplash(fcn) {
    if (isiOS) {
      tabletInterface.hideSplash();
    }
    if (fcn) {
      fcn();
    }
  }
  static trace(str) {
    console.log(str);
  }
  static parse(str) {
    console.log(JSON.parse(str));
  }
  static tracemedia(str) {
    console.log(atob(str));
  }
  ignore() {
  }
  ///////////////
  // Sharing
  ///////////////
  // Called on the JS side to trigger native UI for project sharing.
  // fileName: name for the file to share
  // emailSubject: subject text to use for an email
  // emailBody: body HTML to use for an email
  // shareType: 0 for Email; 1 for Airdrop
  // b64data: base-64 encoded .SJR file to share
  static sendSjrToShareDialog(fileName, emailSubject, emailBody, shareType, b64data) {
    const bridge = tabletInterface;
    bridge.sendSjrUsingShareDialog(fileName, emailSubject, emailBody, shareType, b64data);
  }
  // Called on the Objective-C side.  The argument is a base64-encoded .SJR file,
  // to be unzipped, processed, and stored.
  static loadProjectFromSjr(b64data) {
    try {
      IO.loadProjectFromSjr(b64data);
    } catch (err) {
      var errorMessage = "Couldn't load share -- project data corrupted. " + err.message;
      Alert.open(gn("frame"), gn("frame"), errorMessage, "#ff0000");
      console.log(err);
      return 0;
    }
    return 1;
  }
  // Name of the device/iPad to display on the sharing dialog page
  // fcn is called with the device name as an arg
  static deviceName(fcn) {
    fcn(tabletInterface.deviceName());
  }
  static analyticsEvent(category, action, label, value) {
    if (!value) {
      value = 1;
    }
    let usageLabel = label ? AppUsage.currentUsage + label : AppUsage.currentUsage;
    tabletInterface.analyticsEvent(category, action, usageLabel, value);
  }
  // Web Wiew delegate call backs
  static pageError(desc) {
    console.log("XCODE ERROR:", desc);
    if (window.location.href.indexOf("home.html") > -1) {
      if (Lobby.errorTimer) {
        Lobby.errorLoading(desc);
      }
    }
  }
};
window.iOS = iOS;

// src/app/src/utils/Sound.ts
var Sound = class {
  url;
  soundPlayId;
  name;
  time;
  playing;
  constructor(name, time) {
    if (isAndroid) {
      this.url = name;
      this.soundPlayId = null;
    } else {
      this.name = name;
      this.time = time;
      this.playing = false;
    }
  }
  play() {
    if (isAndroid) {
      if (this.soundPlayId) {
        this.stop();
      }
      this.soundPlayId = AndroidInterface.audio_play(this.url, 1);
    } else {
      if (this.playing) {
        this.stop();
      }
      iOS.playSound(this.name);
      this.playing = true;
    }
  }
  done() {
    if (isAndroid) {
      return this.soundPlayId == null || !AndroidInterface.audio_isplaying(this.soundPlayId);
    }
    return !this.playing;
  }
  clear() {
    if (isAndroid) {
      this.soundPlayId = null;
    } else {
      this.playing = false;
    }
  }
  stop() {
    if (isAndroid) {
      if (this.soundPlayId) {
        AndroidInterface.audio_stop(this.soundPlayId);
      }
      this.soundPlayId = null;
    } else {
      iOS.stopSound(this.name);
      this.playing = false;
    }
  }
};

// src/app/src/utils/ScratchAudio.ts
var uiSounds = {};
var defaultSounds = [
  "cut.wav",
  "snap.wav",
  "copy.wav",
  "grab.wav",
  "boing.wav",
  "tap.wav",
  "keydown.wav",
  "entertap.wav",
  "exittap.wav",
  "splash.wav"
];
var projectSounds = {};
var ScratchAudio = class _ScratchAudio {
  // Attached by ScratchJr.js at startup
  static firstTime;
  static firstClick;
  static get uiSounds() {
    return uiSounds;
  }
  static get projectSounds() {
    return projectSounds;
  }
  static sndFX(name) {
    _ScratchAudio.sndFXWithVolume(name, 1);
  }
  static sndFXWithVolume(name, volume) {
    if (!isAndroid) {
      if (!uiSounds[name]) {
        return;
      }
      uiSounds[name].play();
    } else {
      AndroidInterface.audio_sndfxwithvolume(name, volume);
    }
  }
  static init(prefix) {
    if (!prefix) {
      prefix = "";
    }
    if (!isAndroid) {
      prefix = "HTML5/";
    }
    uiSounds = {};
    for (var i = 0; i < defaultSounds.length; i++) {
      _ScratchAudio.addSound(prefix + "sounds/", defaultSounds[i], uiSounds);
    }
    _ScratchAudio.addSound(prefix, "pop.mp3", projectSounds);
  }
  static addSound(url, snd, dict, fcn) {
    var name = snd;
    if (!isAndroid) {
      var whenDone = function(str) {
        if (str != "error") {
          var result = snd.split(",");
          dict[snd] = new Sound(result[0], result[1]);
        } else {
          name = "error";
        }
        if (fcn) {
          fcn(name);
        }
      };
      iOS.registerSound(url, snd, whenDone);
    } else {
      dict[snd] = new Sound(url + snd);
      if (fcn) {
        fcn(snd);
      }
    }
  }
  static soundDone(name) {
    if (!projectSounds[name]) return;
    projectSounds[name].playing = false;
  }
  static loadProjectSound(md5, fcn) {
    if (!md5) {
      return;
    }
    var dir = "";
    if (!isAndroid) {
      if (md5.indexOf("/") > -1) dir = "HTML5/";
      else if (md5.indexOf("wav") > -1) dir = "Documents";
    }
    _ScratchAudio.loadFromLocal(dir, md5, fcn);
  }
  static loadFromLocal(dir, md5, fcn) {
    if (projectSounds[md5] != void 0) {
      if (fcn) fcn(md5);
      return;
    }
    _ScratchAudio.addSound(dir, md5, projectSounds, fcn);
  }
};
window.ScratchAudio = ScratchAudio;

export {
  ScratchAudio,
  Vector,
  SVG2Canvas,
  MediaLib,
  Lobby,
  AppUsage,
  iOS,
  IO,
  Localization,
  bootApp,
  loadPage
};
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
//# sourceMappingURL=chunk-ZS5RBQB5.js.map
