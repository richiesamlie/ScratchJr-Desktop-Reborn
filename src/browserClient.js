/**
 * ScratchJr Browser & PWA Host Adapter (src/browserClient.js)
 *
 * Implements ScratchJrBridge in standard browser environments (Chrome, Safari, Firefox, Edge).
 * Uses in-memory sql.js (WebAssembly SQLite) with IndexedDB persistence for relational data,
 * and IndexedDB object stores for media assets (photos, drawings, voice recordings).
 */

/* global AudioCapture, CameraPickerDialog */
/* eslint-disable no-console */

(function () {
    if (window.scratchjr) return; // Desktop Electron
    if (typeof AndroidInterface !== 'undefined') return; // Android WebView

    // Simple compact MD5 implementation (RFC 1321) for content addressing
    /** @param {string} str */
    function md5(str) {
        /** @param {number} x @param {number} y */
        function safeAdd(x, y) {
            var lsw = (x & 0xffff) + (y & 0xffff);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xffff);
        }
        /** @param {number} num @param {number} cnt */
        function bitRotateLeft(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }
        /** @param {number} q @param {number} a @param {number} b @param {number} x @param {number} s @param {number} t */
        function md5cmn(q, a, b, x, s, t) {
            return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
        }
        /** @param {number} a @param {number} b @param {number} c @param {number} d @param {number} x @param {number} s @param {number} t */
        function md5ff(a, b, c, d, x, s, t) {
            return md5cmn((b & c) | (~b & d), a, b, x, s, t);
        }
        /** @param {number} a @param {number} b @param {number} c @param {number} d @param {number} x @param {number} s @param {number} t */
        function md5gg(a, b, c, d, x, s, t) {
            return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
        }
        /** @param {number} a @param {number} b @param {number} c @param {number} d @param {number} x @param {number} s @param {number} t */
        function md5hh(a, b, c, d, x, s, t) {
            return md5cmn(b ^ c ^ d, a, b, x, s, t);
        }
        /** @param {number} a @param {number} b @param {number} c @param {number} d @param {number} x @param {number} s @param {number} t */
        function md5ii(a, b, c, d, x, s, t) {
            return md5cmn(c ^ (b | ~d), a, b, x, s, t);
        }

        /** @type {number[]} */
        var words = [];
        var byteLen = str.length;
        for (var i = 0; i < byteLen; i++) {
            words[i >> 2] |= (str.charCodeAt(i) & 0xff) << ((i % 4) * 8);
        }
        words[byteLen >> 2] |= 0x80 << ((byteLen % 4) * 8);
        words[(((byteLen + 8) >> 6) << 4) + 14] = byteLen * 8;

        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (var j = 0; j < words.length; j += 16) {
            var olda = a; var oldb = b; var oldc = c; var oldd = d;

            a = md5ff(a, b, c, d, words[j], 7, -680876936);
            d = md5ff(d, a, b, c, words[j + 1], 12, -389564586);
            c = md5ff(c, d, a, b, words[j + 2], 17, 606105819);
            b = md5ff(b, c, d, a, words[j + 3], 22, -1044525330);
            a = md5ff(a, b, c, d, words[j + 4], 7, -176418897);
            d = md5ff(d, a, b, c, words[j + 5], 12, 1200080426);
            c = md5ff(c, d, a, b, words[j + 6], 17, -1473231341);
            b = md5ff(b, c, d, a, words[j + 7], 22, -45705983);
            a = md5ff(a, b, c, d, words[j + 8], 7, 1770035416);
            d = md5ff(d, a, b, c, words[j + 9], 12, -1958414417);
            c = md5ff(c, d, a, b, words[j + 10], 17, -42063);
            b = md5ff(b, c, d, a, words[j + 11], 22, -1990404162);
            a = md5ff(a, b, c, d, words[j + 12], 7, 1804603682);
            d = md5ff(d, a, b, c, words[j + 13], 12, -40341101);
            c = md5ff(c, d, a, b, words[j + 14], 17, -1502002290);
            b = md5ff(b, c, d, a, words[j + 15], 22, 1236535329);

            a = md5gg(a, b, c, d, words[j + 1], 5, -165796510);
            d = md5gg(d, a, b, c, words[j + 6], 9, -1069501632);
            c = md5gg(c, d, a, b, words[j + 11], 14, 643717713);
            b = md5gg(b, c, d, a, words[j], 20, -373897302);
            a = md5gg(a, b, c, d, words[j + 5], 5, -701558691);
            d = md5gg(d, a, b, c, words[j + 10], 9, 38016083);
            c = md5gg(c, d, a, b, words[j + 15], 14, -660478335);
            b = md5gg(b, c, d, a, words[j + 4], 20, -405537848);
            a = md5gg(a, b, c, d, words[j + 9], 5, 568446438);
            d = md5gg(d, a, b, c, words[j + 14], 9, -1019803690);
            c = md5gg(c, d, a, b, words[j + 3], 14, -187363961);
            b = md5gg(b, c, d, a, words[j + 8], 20, 1163531501);
            a = md5gg(a, b, c, d, words[j + 13], 5, -1444681467);
            d = md5gg(d, a, b, c, words[j + 2], 9, -51403784);
            c = md5gg(c, d, a, b, words[j + 7], 14, 1735328473);
            b = md5gg(b, c, d, a, words[j + 12], 20, -1926607734);

            a = md5hh(a, b, c, d, words[j + 5], 4, -378558);
            d = md5hh(d, a, b, c, words[j + 8], 11, -2022574463);
            c = md5hh(c, d, a, b, words[j + 11], 16, 1839030562);
            b = md5hh(b, c, d, a, words[j + 14], 23, -35309556);
            a = md5hh(a, b, c, d, words[j + 1], 4, -1530992060);
            d = md5hh(d, a, b, c, words[j + 4], 11, 1272893353);
            c = md5hh(c, d, a, b, words[j + 7], 16, -155497632);
            b = md5hh(b, c, d, a, words[j + 10], 23, -1094730640);
            a = md5hh(a, b, c, d, words[j + 13], 4, 681279174);
            d = md5hh(d, a, b, c, words[j], 11, -358537222);
            c = md5hh(c, d, a, b, words[j + 3], 16, -722521979);
            b = md5hh(b, c, d, a, words[j + 6], 23, 76029189);
            a = md5hh(a, b, c, d, words[j + 9], 4, -640364487);
            d = md5hh(d, a, b, c, words[j + 12], 11, -421815835);
            c = md5hh(c, d, a, b, words[j + 15], 16, 530742520);
            b = md5hh(b, c, d, a, words[j + 2], 23, -995338651);

            a = md5ii(a, b, c, d, words[j], 6, -198630844);
            d = md5ii(d, a, b, c, words[j + 7], 10, 1126891415);
            c = md5ii(c, d, a, b, words[j + 14], 15, -1416354905);
            b = md5ii(b, c, d, a, words[j + 5], 21, -57434055);
            a = md5ii(a, b, c, d, words[j + 12], 6, 1700485571);
            d = md5ii(d, a, b, c, words[j + 3], 10, -1894986606);
            c = md5ii(c, d, a, b, words[j + 10], 15, -1051523);
            b = md5ii(b, c, d, a, words[j + 1], 21, -2054922799);
            a = md5ii(a, b, c, d, words[j + 8], 6, 1873313359);
            d = md5ii(d, a, b, c, words[j + 15], 10, -30611744);
            c = md5ii(c, d, a, b, words[j + 6], 15, -1560198380);
            b = md5ii(b, c, d, a, words[j + 13], 21, 1309151649);
            a = md5ii(a, b, c, d, words[j + 4], 6, -145523070);
            d = md5ii(d, a, b, c, words[j + 11], 10, -1120210379);
            c = md5ii(c, d, a, b, words[j + 2], 15, 718787259);
            b = md5ii(b, c, d, a, words[j + 9], 21, -343485551);

            a = safeAdd(a, olda);
            b = safeAdd(b, oldb);
            c = safeAdd(c, oldc);
            d = safeAdd(d, oldd);
        }

        var hex = '';
        var arr = [a, b, c, d];
        for (var k = 0; k < arr.length * 4; k++) {
            hex += ((arr[k >> 2] >> ((k % 4) * 8 + 4)) & 0xf).toString(16)
                + ((arr[k >> 2] >> ((k % 4) * 8)) & 0xf).toString(16);
        }
        return hex;
    }

    // ---- IndexedDB Storage Layer ----
    var IDB_NAME = 'scratchjr_browser_storage';
    var IDB_VERSION = 1;
    var STORE_SQLITE = 'sqlite_db';
    var STORE_MEDIA = 'media_store';

    function openIdb() {
        return new Promise(function (/** @type {(db: IDBDatabase) => void} */ resolve, reject) {
            var req = indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = function (/** @type {any} */ ev) {
                var db = ev.target.result;
                if (!db.objectStoreNames.contains(STORE_SQLITE)) {
                    db.createObjectStore(STORE_SQLITE);
                }
                if (!db.objectStoreNames.contains(STORE_MEDIA)) {
                    db.createObjectStore(STORE_MEDIA);
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    /** @param {string} storeName @param {string} key */
    function idbGet(storeName, key) {
        return openIdb().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(storeName, 'readonly');
                var store = tx.objectStore(storeName);
                var req = store.get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    /** @param {string} storeName @param {string} key @param {any} val */
    function idbPut(storeName, key, val) {
        return openIdb().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(storeName, 'readwrite');
                var store = tx.objectStore(storeName);
                var req = store.put(val, key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    /** @param {string} storeName @param {string} key */
    function idbDelete(storeName, key) {
        return openIdb().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(storeName, 'readwrite');
                var store = tx.objectStore(storeName);
                var req = store.delete(key);
                req.onsuccess = function () { resolve(undefined); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    // ---- In-Memory Media LRU Cache ----
    // Avoids repetitive IndexedDB roundtrips for active sprite costumes and sound effects
    // (Mirrors the MediaCache.kt LRU architecture used on Android)
    var MEDIA_CACHE_LIMIT = 100;
    /** @type {Map<string, string>} */
    var mediaCache = new Map();

    function getMediaCache(/** @type {string} */ key) {
        if (!mediaCache.has(key)) return null;
        var val = /** @type {string} */ (mediaCache.get(key));
        mediaCache.delete(key);
        mediaCache.set(key, val);
        return val;
    }

    function putMediaCache(/** @type {string} */ key, /** @type {string} */ val) {
        if (!key || !val) return;
        if (mediaCache.has(key)) {
            mediaCache.delete(key);
        } else if (mediaCache.size >= MEDIA_CACHE_LIMIT) {
            var firstKey = mediaCache.keys().next().value;
            if (firstKey !== undefined) {
                mediaCache.delete(firstKey);
            }
        }
        mediaCache.set(key, val);
    }

    function removeMediaCache(/** @type {string} */ key) {
        if (mediaCache.has(key)) {
            mediaCache.delete(key);
        }
    }

    // ---- Multi-Tab Concurrency Guard & Web Lock ----
    // Concurrency locking (Web Locks API), storage eviction protection, and
    // corruption quarantine inspired by patdx/scratchjr (https://github.com/patdx/scratchjr)
    var hasExclusiveLock = true;
    /** @type {((value?: any) => void) | null} */
    var releaseExclusiveLock = null;

    function showMultiTabNotice() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('scratchjr_multitab_notice')) return;
        var banner = document.createElement('div');
        banner.id = 'scratchjr_multitab_notice';
        var noticeText = 'ScratchJr is already open in another tab. This window is in safe read-only mode.';
        try {
            var loc = /** @type {any} */ (window).Localization;
            if (loc && typeof loc.localizeWithFallback === 'function') {
                noticeText = loc.localizeWithFallback('MULTI_TAB_NOTICE', noticeText);
            } else if (loc && typeof loc.localize === 'function') {
                var l = loc.localize('MULTI_TAB_NOTICE');
                if (l && !l.startsWith('String missing') && !l.startsWith('Loc missing')) {
                    noticeText = l;
                }
            }
        } catch (_) {
            /* localization not yet loaded, fallback to default English text */
        }
        banner.textContent = noticeText;
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.right = '0';
        banner.style.backgroundColor = '#c0392b';
        banner.style.color = '#fff';
        banner.style.padding = '8px 16px';
        banner.style.textAlign = 'center';
        banner.style.fontFamily = 'sans-serif';
        banner.style.fontSize = '14px';
        banner.style.fontWeight = 'bold';
        banner.style.zIndex = '999999';
        banner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        var closeBtn = document.createElement('span');
        closeBtn.textContent = ' ✕';
        closeBtn.style.marginLeft = '12px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function () {
            banner.remove();
        };
        banner.appendChild(closeBtn);

        var append = function () {
            if (document.body && !document.getElementById('scratchjr_multitab_notice')) {
                document.body.appendChild(banner);
            }
        };
        if (document.body) {
            append();
        } else {
            window.addEventListener('DOMContentLoaded', append);
        }
    }

    function acquireWebLock() {
        if (typeof navigator === 'undefined' || !navigator.locks || typeof navigator.locks.request !== 'function') {
            return Promise.resolve(true);
        }
        return new Promise(function (resolve) {
            var settled = false;
            navigator.locks.request('scratchjr_db_lock', { ifAvailable: true }, function (lock) {
                if (!lock) {
                    if (!settled) {
                        settled = true;
                        resolve(false);
                    }
                    return Promise.resolve();
                }
                if (settled) {
                    return Promise.resolve();
                }
                settled = true;
                resolve(true);
                return new Promise(function (rel) {
                    releaseExclusiveLock = rel;
                });
            }).catch(function (err) {
                console.warn('[browserClient] navigator.locks error:', err);
                if (!settled) {
                    settled = true;
                    resolve(true);
                }
            });

            setTimeout(function () {
                if (!settled) {
                    settled = true;
                    resolve(true);
                }
            }, 600);
        });
    }

    // ---- sql.js WebAssembly Database Manager ----
    /** @type {any} */
    var sqlDb = null;
    /** @type {any} */
    var dbInitPromise = null;
    /** @type {any} */
    var dbSaveTimer = null;
    /** @type {Promise<any> | null} */
    var pendingDbSavePromise = null;

    function doActualDbSave() {
        pendingDbSavePromise = null;
        if (!sqlDb) return Promise.resolve();
        if (!hasExclusiveLock) {
            console.warn('[browserClient] Secondary tab: skipping IndexedDB save to protect active session');
            return Promise.resolve();
        }
        try {
            var data = sqlDb.export();
            return idbPut(STORE_SQLITE, 'db_bytes', data).catch(function (/** @type {any} */ e) {
                console.error('[browserClient] IndexedDB save failed:', e);
            });
        } catch (err) {
            console.error('[browserClient] sql.js export error:', err);
            return Promise.resolve();
        }
    }

    /**
     * @param {boolean} [immediate]
     */
    function flushDbSave(immediate) {
        if (!sqlDb) return Promise.resolve();
        if (dbSaveTimer) {
            clearTimeout(dbSaveTimer);
            dbSaveTimer = null;
        }
        if (immediate) {
            return doActualDbSave();
        }
        if (!pendingDbSavePromise) {
            pendingDbSavePromise = new Promise(function (resolve) {
                dbSaveTimer = setTimeout(function () {
                    dbSaveTimer = null;
                    doActualDbSave().then(resolve);
                }, 250);
            });
        }
        return pendingDbSavePromise;
    }

    // Flush database immediately when navigating away or switching tabs
    if (typeof window !== 'undefined') {
        var onLeave = function () {
            flushDbSave(true).finally(function () {
                if (releaseExclusiveLock) {
                    var rel = releaseExclusiveLock;
                    releaseExclusiveLock = null;
                    rel();
                }
            });
        };
        window.addEventListener('beforeunload', onLeave);
        window.addEventListener('pagehide', onLeave);
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') {
                flushDbSave(true);
            }
        });
    }

    function initDatabase() {
        if (dbInitPromise) return dbInitPromise;
        dbInitPromise = acquireWebLock().then(function (acquired) {
            hasExclusiveLock = acquired;
            if (!hasExclusiveLock) {
                console.warn('[browserClient] Multi-tab detected: running in read-only mode');
                showMultiTabNotice();
            }

            // Storage eviction defense: request persistent storage
            if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function') {
                navigator.storage.persist().then(function (persisted) {
                    if (persisted) {
                        console.log('[browserClient] Storage will not be evicted under disk pressure');
                    }
                }).catch(function (err) {
                    console.warn('[browserClient] Storage persist request failed:', err);
                });
            }

            return new Promise(function (resolve, reject) {
                function loadSqlEngine() {
                    var locateWasm = function (/** @type {string} */ file) {
                        return '../' + file;
                    };
                    var sqlInit = /** @type {any} */ (window).initSqlJs;
                    sqlInit({ locateFile: locateWasm }).then(function (/** @type {any} */ SQL) {
                        idbGet(STORE_SQLITE, 'db_bytes').then(function (savedBytes) {
                            if (savedBytes && savedBytes.length > 0) {
                                try {
                                    sqlDb = new SQL.Database(new Uint8Array(savedBytes));
                                } catch (e) {
                                    console.warn('[browserClient] Saved database corrupt, quarantining and creating fresh DB:', e);
                                    if (hasExclusiveLock) {
                                        var corruptKey = 'db_bytes_corrupt_' + Date.now();
                                        idbPut(STORE_SQLITE, corruptKey, savedBytes).catch(function (err) {
                                            console.error('[browserClient] Failed to quarantine corrupt DB:', err);
                                        });
                                    }
                                    sqlDb = new SQL.Database();
                                }
                            } else {
                                sqlDb = new SQL.Database();
                            }

                        // Run standard table initialization
                        sqlDb.run(
                            'CREATE TABLE IF NOT EXISTS PROJECTS ('
                            + 'ID INTEGER PRIMARY KEY AUTOINCREMENT, '
                            + 'CTIME TEXT, MTIME TEXT, ALTMD5 TEXT, POS INTEGER, '
                            + 'NAME TEXT, JSON TEXT, THUMBNAIL TEXT, OWNER TEXT, '
                            + 'GALLERY TEXT, DELETED TEXT, VERSION TEXT, ISGIFT INTEGER);'
                        );
                        sqlDb.run(
                            'CREATE TABLE IF NOT EXISTS USERSHAPES ('
                            + 'ID INTEGER PRIMARY KEY AUTOINCREMENT, '
                            + 'CTIME TEXT, MD5 TEXT, ALTMD5 TEXT, WIDTH TEXT, HEIGHT TEXT, '
                            + 'EXT TEXT, NAME TEXT, OWNER TEXT, SCALE TEXT, VERSION TEXT);'
                        );
                        sqlDb.run(
                            'CREATE TABLE IF NOT EXISTS USERBKGS ('
                            + 'ID INTEGER PRIMARY KEY AUTOINCREMENT, '
                            + 'CTIME TEXT, MD5 TEXT, ALTMD5 TEXT, WIDTH TEXT, HEIGHT TEXT, '
                            + 'EXT TEXT, OWNER TEXT, VERSION TEXT);'
                        );
                        sqlDb.run(
                            'CREATE TABLE IF NOT EXISTS PROJECTFILES ('
                            + 'MD5 TEXT PRIMARY KEY, CONTENTS TEXT);'
                        );

                        flushDbSave(true).then(function () {
                            resolve(sqlDb);
                        });
                    }).catch(function (err) {
                        console.error('[browserClient] IDB load error:', err);
                        sqlDb = new SQL.Database();
                        resolve(sqlDb);
                    });
                }).catch(reject);
            }

            if (typeof (/** @type {any} */ (window).initSqlJs) === 'function') {
                loadSqlEngine();
            } else {
                var checkInterval = setInterval(function () {
                    if (typeof (/** @type {any} */ (window).initSqlJs) === 'function') {
                        clearInterval(checkInterval);
                        loadSqlEngine();
                    }
                }, 20);
            }
        });
    });
    return dbInitPromise;
}

    // SQL Intent statement/query composer (matches src/lib/db-intents.ts)
    /** @param {any} intent */
    function executeIntent(intent) {
        return initDatabase().then(function (/** @type {any} */ db) {
            var op = intent.op;
            var table = (intent.table || '').toUpperCase();

            if (op === 'insert') {
                var row = intent.row || {};
                var cols = Object.keys(row);
                var placeholders = cols.map(function () { return '?'; }).join(', ');
                var values = cols.map(function (c) { return row[c]; });
                var sql = 'INSERT INTO ' + table + ' (' + cols.join(', ') + ') VALUES (' + placeholders + ')';
                db.run(sql, values);
                var res = db.exec('SELECT last_insert_rowid() AS id');
                var insertId = res[0].values[0][0];
                flushDbSave();
                return Promise.resolve(insertId);
            }

            if (op === 'update') {
                var updateRow = intent.row || {};
                var updateCols = Object.keys(updateRow);
                var setClauses = updateCols.map(function (c) { return c + ' = ?'; }).join(', ');
                var setVals = updateCols.map(function (c) { return updateRow[c]; });

                var whereClauses = [];
                var whereVals = [];
                if (intent.id !== undefined) {
                    whereClauses.push('ID = ?');
                    whereVals.push(intent.id);
                } else if (intent.where && intent.where.length > 0) {
                    intent.where.forEach(function (/** @type {any} */ w) {
                        whereClauses.push(w.col + ' ' + (w.op || '=') + ' ?');
                        whereVals.push(w.value);
                    });
                }
                var updateSql = 'UPDATE ' + table + ' SET ' + setClauses;
                if (whereClauses.length > 0) {
                    updateSql += ' WHERE ' + whereClauses.join(' AND ');
                }
                db.run(updateSql, setVals.concat(whereVals));
                var updatedRows = db.getRowsModified();
                flushDbSave();
                return Promise.resolve(updatedRows);
            }

            if (op === 'delete') {
                var delWhere = [];
                var delVals = [];
                if (intent.id !== undefined) {
                    delWhere.push('ID = ?');
                    delVals.push(intent.id);
                } else if (intent.where && intent.where.length > 0) {
                    intent.where.forEach(function (/** @type {any} */ w) {
                        delWhere.push(w.col + ' ' + (w.op || '=') + ' ?');
                        delVals.push(w.value);
                    });
                }
                var delSql = 'DELETE FROM ' + table;
                if (delWhere.length > 0) {
                    delSql += ' WHERE ' + delWhere.join(' AND ');
                }
                db.run(delSql, delVals);
                var deletedRows = db.getRowsModified();
                flushDbSave();
                return Promise.resolve(deletedRows);
            }

            if (op === 'select') {
                var items = intent.items && intent.items.length > 0 ? intent.items.join(', ') : '*';
                /** @type {string[]} */
                var selWhere = [];
                /** @type {any[]} */
                var selVals = [];
                if (intent.where && intent.where.length > 0) {
                    intent.where.forEach(function (/** @type {any} */ w) {
                        if (w.op === 'IS NULL') {
                            selWhere.push(w.col + ' IS NULL');
                        } else {
                            selWhere.push(w.col + ' ' + (w.op || '=') + ' ?');
                            selVals.push(w.value);
                        }
                    });
                }
                var selSql = 'SELECT ' + items + ' FROM ' + table;
                if (selWhere.length > 0) {
                    selSql += ' WHERE ' + selWhere.join(' AND ');
                }
                if (intent.order && intent.order.col) {
                    selSql += ' ORDER BY ' + intent.order.col + ' ' + (intent.order.dir || 'ASC');
                }
                var queryRes = db.exec(selSql, selVals);
                if (!queryRes || queryRes.length === 0) return '[]';

                var columns = queryRes[0].columns;
                var rows = queryRes[0].values.map(function (/** @type {any[]} */ rowArray) {
                    /** @type {Record<string, any>} */
                    var obj = {};
                    columns.forEach(function (/** @type {string} */ colName, /** @type {number} */ idx) {
                        obj[colName.toLowerCase()] = rowArray[idx];
                    });
                    return obj;
                });
                return JSON.stringify(rows);
            }

            throw new Error('Unsupported intent op: ' + op);
        });
    }

    // Audio & Camera instances
    /** @type {any} */
    var audioCapture = null;
    function getAudioCapture() {
        if (!audioCapture) {
            audioCapture = new AudioCapture();
            audioCapture.isRecordingPermitted = true;
        }
        return audioCapture;
    }

    // Sound player registry for Web Audio
    /** @type {Record<string, AudioBuffer>} */
    var soundBuffers = {};
    /** @type {AudioContext | null} */
    var audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            var Ctx = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
            if (Ctx) {
                audioCtx = new Ctx();
            }
        }
        return audioCtx;
    }

    // In-memory cache for chunked media transfer across PlatformBridge
    /** @type {Record<string, string>} */
    var mediaTransferCache = {};

    // ---- Browser Host Client Interface ----
    /** @type {any} */
    var browserHost = {
        cameraPickerDialog: null,

        // ---- Database ----
        database_stmt: function (/** @type {string} */ jsonStr) {
            try {
                var intent = JSON.parse(jsonStr);
                return executeIntent(intent).catch(function (/** @type {any} */ e) {
                    console.error('[browserClient] database_stmt error:', e);
                    return -3;
                });
            } catch (err) {
                console.error('[browserClient] malformed intent JSON:', err);
                return Promise.resolve(-2);
            }
        },

        database_query: function (/** @type {string} */ jsonStr) {
            try {
                var intent = JSON.parse(jsonStr);
                return executeIntent(intent).catch(function (/** @type {any} */ e) {
                    console.error('[browserClient] database_query error:', e);
                    return '[]';
                });
            } catch (err) {
                console.error('[browserClient] query JSON parse error:', err);
                return Promise.resolve('[]');
            }
        },

        // ---- Settings & Resources ----
        io_getsettings: function () {
            return Promise.resolve('browser,false,YES,YES');
        },

        io_gettextresource: function (/** @type {string} */ filename) {
            return fetch(filename)
                .then(function (res) {
                    if (!res.ok) {
                        return fetch('./' + filename).then(function (res2) {
                            if (!res2.ok) return '';
                            return res2.text();
                        }).catch(function () { return ''; });
                    }
                    return res.text();
                })
                .catch(function () {
                    return '';
                });
        },

        io_getIsDebug: function () {
            return Promise.resolve(window.location.search.indexOf('debug') > -1);
        },

        io_getLang: function () {
            return Promise.resolve(localStorage.getItem('localization') || null);
        },

        // ---- In-Memory Media LRU Cache ----
        // Avoids repetitive IndexedDB roundtrips for active sprite costumes and sound effects
        // (Mirrors the MediaCache.kt architecture used on Android)
        // ---- Virtual File & Media I/O (with In-Memory LRU Cache) ----
        io_setfile: function (/** @type {string} */ name, /** @type {string} */ contents) {
            putMediaCache(name, contents);
            return idbPut(STORE_MEDIA, name, contents);
        },

        io_getfile: function (/** @type {string} */ name) {
            var inMem = getMediaCache(name);
            if (inMem !== null) {
                return Promise.resolve(inMem);
            }
            return idbGet(STORE_MEDIA, name).then(function (val) {
                var res = val || '';
                if (res) putMediaCache(name, res);
                return res;
            });
        },

        io_remove: function (/** @type {string} */ name) {
            removeMediaCache(name);
            return idbDelete(STORE_MEDIA, name);
        },

        io_cleanassets: function () {
            return Promise.resolve();
        },

        io_getmd5: function (/** @type {string} */ str) {
            return Promise.resolve(md5(str));
        },

        io_setmedia: function (/** @type {string} */ base64ContentStr, /** @type {string} */ ext) {
            try {
                var hash = md5(base64ContentStr);
                var filename = hash + '.' + ext;
                putMediaCache(filename, base64ContentStr);
                return idbPut(STORE_MEDIA, filename, base64ContentStr).then(function () {
                    return filename;
                });
            } catch (e) {
                console.error('[browserClient] io_setmedia error:', e);
                return Promise.resolve(null);
            }
        },

        io_setmedianame: function (/** @type {string} */ encodedData, /** @type {string} */ key, /** @type {string} */ ext) {
            try {
                var filename = key.endsWith('.' + ext) ? key : (key + '.' + ext);
                putMediaCache(filename, encodedData);
                if (sqlDb) {
                    try {
                        sqlDb.run('INSERT OR REPLACE INTO PROJECTFILES (MD5, CONTENTS) VALUES (?, ?);', [filename, encodedData]);
                        flushDbSave();
                    } catch (_) {
                        /* ignore sqlite fallback error */
                    }
                }
                return idbPut(STORE_MEDIA, filename, encodedData).then(function () {
                    return filename;
                });
            } catch (e) {
                console.error('[browserClient] io_setmedianame error:', e);
                return Promise.resolve(null);
            }
        },

        io_getmedia: function (/** @type {string} */ file) {
            if (!file) return Promise.resolve('');
            if (file.indexOf('data:') === 0) {
                return Promise.resolve(file);
            }

            var inMemory = getMediaCache(file);
            if (inMemory !== null) {
                return Promise.resolve(inMemory);
            }

            return idbGet(STORE_MEDIA, file).then(function (cached) {
                if (cached && typeof cached === 'string') {
                    var clean = cached.indexOf('data:') === 0 ? (cached.split(',')[1] || cached) : cached;
                    putMediaCache(file, clean);
                    return clean;
                }

                // Check SQLite PROJECTFILES table
                if (sqlDb) {
                    try {
                        var res = sqlDb.exec('SELECT CONTENTS FROM PROJECTFILES WHERE MD5 = ?', [file]);
                        if (res && res.length > 0 && res[0].values.length > 0) {
                            var rowVal = res[0].values[0][0];
                            if (rowVal && typeof rowVal === 'string') {
                                idbPut(STORE_MEDIA, file, rowVal).catch(function () {});
                                var cleanRow = rowVal.indexOf('data:') === 0 ? (rowVal.split(',')[1] || rowVal) : rowVal;
                                putMediaCache(file, cleanRow);
                                return cleanRow;
                            }
                        }
                    } catch (_) {
                        /* ignore sqlite read error */
                    }
                }

                // Try with alternative extension naming
                var altKey = file.indexOf('.') > -1 ? file.split('.')[0] : (file + '.png');
                var altInMemory = getMediaCache(altKey);
                if (altInMemory !== null) {
                    return altInMemory;
                }

                return idbGet(STORE_MEDIA, altKey).then(function (altCached) {
                    if (altCached && typeof altCached === 'string') {
                        var cleanAlt = altCached.indexOf('data:') === 0 ? (altCached.split(',')[1] || altCached) : altCached;
                        putMediaCache(altKey, cleanAlt);
                        putMediaCache(file, cleanAlt);
                        return cleanAlt;
                    }

                    var assetPath = file;
                    if (assetPath.indexOf('/') === -1) {
                        assetPath = 'assets/' + file;
                    }
                    return fetch(assetPath)
                        .then(function (res) {
                            if (!res.ok) throw new Error('Asset 404: ' + assetPath);
                            return res.blob();
                        })
                        .then(function (blob) {
                            return new Promise(function (resolve) {
                                var reader = new FileReader();
                                reader.onloadend = function () {
                                    var resStr = reader.result;
                                    var b64 = String(resStr).split(',')[1] || '';
                                    putMediaCache(file, b64);
                                    resolve(b64);
                                };
                                reader.readAsDataURL(blob);
                            });
                        })
                        .catch(function () {
                            return '';
                        });
                });
            });
        },

        io_getmedialen: function (/** @type {string} */ file, /** @type {string} */ key) {
            return browserHost.io_getmedia(file).then(function (/** @type {string} */ data) {
                if (data && key) {
                    mediaTransferCache[key] = data;
                }
                return data ? data.length : 0;
            });
        },

        io_getmediadata: function (/** @type {string} */ key, /** @type {number} */ offset, /** @type {number} */ length) {
            var str = mediaTransferCache[key];
            if (str) {
                return Promise.resolve(str.substr(offset, length));
            }
            return Promise.resolve('');
        },

        io_getmediadone: function (/** @type {string} */ key) {
            if (key) {
                delete mediaTransferCache[key];
            }
            return Promise.resolve();
        },

        io_getAudioData: function (/** @type {string} */ name) {
            return idbGet(STORE_MEDIA, name).then(function (val) {
                return val || null;
            });
        },

        // ---- Sound Playback ----
        io_registersound: function (/** @type {string} */ dir, /** @type {string} */ name) {
            var url = (dir ? dir + '/' : '') + name;
            return fetch(url)
                .then(function (res) { return res.arrayBuffer(); })
                .then(function (buf) {
                    var ctx = getAudioContext();
                    if (ctx) {
                        return ctx.decodeAudioData(buf).then(function (decoded) {
                            soundBuffers[name] = decoded;
                        });
                    }
                })
                .catch(function (e) {
                    console.warn('[browserClient] registerSound error:', name, e);
                });
        },

        io_playsound: function (/** @type {string} */ name) {
            var ctx = getAudioContext();
            if (ctx && soundBuffers[name]) {
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }
                var source = ctx.createBufferSource();
                source.buffer = soundBuffers[name];
                source.connect(ctx.destination);
                source.start(0);
            }
        },

        io_stopsound: function () {
            // Web Audio stops when buffer finishes
        },

        // ---- Microphone Recording (via webav.js) ----
        recordsound_recordstart: function () {
            return getAudioCapture().startRecord();
        },

        recordsound_recordstop: function () {
            getAudioCapture().stopRecord();
        },

        recordsound_volume: function () {
            return getAudioCapture().getVolume();
        },

        recordsound_startplay: function () {
            getAudioCapture().startPlay();
        },

        recordsound_stopplay: function () {
            getAudioCapture().stopPlay();
        },

        recordsound_recordclose: function (/** @type {string} */ keep) {
            try {
                if (keep === 'YES') {
                    var capture = getAudioCapture();
                    var blob = capture.captureRecordingAsBlob();
                    if (blob) {
                        var filename = capture.getId();
                        var fileReader = new FileReader();
                        fileReader.onload = function () {
                            var result = fileReader.result;
                            var b64 = String(result).split(',')[1];
                            browserHost.io_setmedianame(b64, filename, 'webm');
                        };
                        fileReader.readAsDataURL(blob);
                    }
                } else {
                    getAudioCapture().stopRecord();
                }
            } catch (e) {
                console.error('[browserClient] recordsound_recordclose error:', e);
            }
        },

        // ---- Camera Photo Capture (via webav.js) ----
        scratchjr_startfeed: function (/** @type {string} */ str) {
            var data = JSON.parse(str);
            if (!browserHost.cameraPickerDialog) {
                browserHost.cameraPickerDialog = new CameraPickerDialog(data);
                browserHost.cameraPickerDialog.show();
            }
        },

        scratchjr_stopfeed: function () {
            if (browserHost.cameraPickerDialog) {
                browserHost.cameraPickerDialog.hide();
                browserHost.cameraPickerDialog = null;
            }
        },

        scratchjr_choosecamera: function () {},

        scratchjr_cameracheck: function () {
            return 'true';
        },

        scratchjr_captureimage: function (/** @type {() => void} */ whenDone) {
            if (browserHost.cameraPickerDialog) {
                var imgData = browserHost.cameraPickerDialog.snapshot();
                if (imgData) {
                    var base64NoPrefix = imgData.split(',')[1];
                    var cam = /** @type {any} */ (window).Camera;
                    if (cam && cam.processimage) {
                        cam.processimage(base64NoPrefix);
                    }
                }
            }
            if (whenDone) { whenDone(); }
        },

        // ---- Export & Sharing (Browser File Downloads) ----
        sendExportedSjr: function (/** @type {string} */ dataB64, /** @type {string} */ suggestedName) {
            flushDbSave(true);
            try {
                var bin = atob(dataB64);
                var bytes = new Uint8Array(bin.length);
                for (var i = 0; i < bin.length; i++) {
                    bytes[i] = bin.charCodeAt(i);
                }
                var blob = new Blob([bytes], { type: 'application/x-scratchjr-project' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                var safeName = (suggestedName || 'Project').replace(/[/\\?%*:|"<>]/g, '_');
                var filename = safeName.toLowerCase().endsWith('.sjr') ? safeName : (safeName + '.sjr');
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
                return Promise.resolve(filename);
            } catch (err) {
                console.error('[browserClient] Export SJR error:', err);
                return Promise.resolve(null);
            }
        },

        sendExportedPng: function (/** @type {string} */ dataUrl, /** @type {string} */ suggestedName) {
            try {
                var a = document.createElement('a');
                a.href = dataUrl;
                var safeName = (suggestedName || 'Stage').replace(/[/\\?%*:|"<>]/g, '_');
                var filename = safeName.toLowerCase().endsWith('.png') ? safeName : (safeName + '.png');
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                return Promise.resolve(filename);
            } catch (err) {
                console.error('[browserClient] Export PNG error:', err);
                return Promise.resolve(null);
            }
        },

        sendSjrUsingShareDialog: function (/** @type {string} */ fileName, /** @type {string} */ _emailSubject, /** @type {string} */ _emailBody, /** @type {string} */ _shareType, /** @type {string} */ b64data) {
            return browserHost.sendExportedSjr(b64data, fileName);
        },

        openImportSjrDialog: function () {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.sjr';
            input.onchange = function (/** @type {any} */ e) {
                if (e.target && e.target.files && e.target.files.length > 0) {
                    var file = e.target.files[0];
                    var reader = new FileReader();
                    reader.onload = function () {
                        var resStr = reader.result;
                        var b64 = String(resStr).split(',')[1] || '';
                        var bridge = /** @type {any} */ (window).PlatformBridge;
                        if (bridge && bridge.loadProjectFromSjr) {
                            bridge.loadProjectFromSjr(b64);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        },

        /** @type {Array<() => void>} */
        exportProjectCallbacks: [],
        onExportProjectRequest: function (/** @type {() => void} */ callback) {
            if (typeof callback === 'function') {
                browserHost.exportProjectCallbacks.push(callback);
            }
        },

        /** @type {Array<() => void>} */
        exportStageCallbacks: [],
        onExportStageRequest: function (/** @type {() => void} */ callback) {
            if (typeof callback === 'function') {
                browserHost.exportStageCallbacks.push(callback);
            }
        },

        triggerExportProject: function () {
            if (browserHost.exportProjectCallbacks.length > 0) {
                for (var i = 0; i < browserHost.exportProjectCallbacks.length; i++) {
                    try {
                        browserHost.exportProjectCallbacks[i]();
                    } catch (err) {
                        console.error('[browserClient] Export callback error:', err);
                    }
                }
                return true;
            }
            return false;
        },

        // ---- Misc Host Hooks ----
        askForPermission: function () {
            return true;
        },

        hideSplash: function () {
            return true;
        },

        deviceName: function () {
            return 'Web Browser';
        },

        debugWriteLog: function (/** @type {string} */ msg) {
            console.log('[ScratchJr-Browser]', msg);
        },

        sendAppClosedAcked: function () {},
        analyticsEvent: function () {},

        onDatabaseRestored: function () {},
        onKeyboardShortcut: function () {},
        onAppClose: function () {}
    };

    // Global shortcut listener for browser window (Ctrl+S to save/export, Ctrl+O to open/import)
    window.addEventListener('keydown', function (/** @type {KeyboardEvent} */ e) {
        if ((e.ctrlKey || e.metaKey) && !e.altKey) {
            var key = e.key.toLowerCase();
            if (key === 's') {
                e.preventDefault();
                flushDbSave();
                browserHost.triggerExportProject();
            } else if (key === 'o') {
                e.preventDefault();
                browserHost.openImportSjrDialog();
            }
        }
    });

    // Expose as window.tablet and window.scratchjr
    /** @type {any} */ (window).tablet = browserHost;
    /** @type {any} */ (window).scratchjr = browserHost;

    // Trigger database initialization early
    initDatabase().catch(function (/** @type {any} */ err) {
        console.error('[browserClient] Early DB init failed:', err);
    });
}());
