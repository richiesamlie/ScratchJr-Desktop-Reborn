import JSZip from 'jszip';

import iOS from './iOS.js';
import MediaLib from './MediaLib.js';
import {setCanvasSize, drawThumbnail, gn} from '../utils/lib';
import Lobby from '../lobby/Lobby';
import SVG2Canvas from '../utils/SVG2Canvas';

const database = 'projects';
const collectLibraryAssets = false;

// Project row bag as passed between the lobby/editor and the projects table.
// All fields optional: callers construct partial bags and JSON bags are
// structurally compatible (Record<string, unknown>).
interface ProjectRecord {
    name?: string;
    version?: string;
    deleted?: string;
    isgift?: string;
    json?: unknown;
    thumbnail?: unknown;
    id?: string;
    mtime?: string;
}

// Sharing state
let zipFile: JSZip | null = null;
let zipFileName = '';
let shareName = '';

export default class IO {
    static get zipFileName () {
        return zipFileName;
    }

    static get shareName () {
        return shareName;
    }

    static requestFromServer (url: string, whenDone: (result: string) => void) {
      
        iOS.waitForInterface(function() {
        	iOS.gettextresource(url, whenDone);
        });
        
    }

    static getThumbnail (str: string, w: number | string, h: number | string, destw?: number, desth?: number) {
        str = str.replace(/>\s*</g, '><');
        var xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
        var extxml = document.importNode(xmlDoc.documentElement, true);
        if (extxml.childNodes[0].nodeName == '#comment') {
            extxml.removeChild(extxml.childNodes[0]);
        }
        var srccnv = document.createElement('canvas');
        setCanvasSize(srccnv, Number(w), Number(h));
        var ctx = srccnv.getContext('2d')!;
        for (var i = 0; i < extxml.childElementCount; i++) {
            SVG2Canvas.drawLayer(extxml.childNodes[i] as Element, ctx);
        }
        if (!destw || !desth) {
            return srccnv.toDataURL('image/png');
        }
        var cnv = document.createElement('canvas');
        setCanvasSize(cnv, destw, desth);
        drawThumbnail(srccnv, cnv);
        return cnv.toDataURL('image/png');
    }

    // in iOS casting an svg url in a img.src works except when the SVG has images.
    // This code avoids that bug
    // also when in debug mode you need to get the base64 to avoid sandboxing issues
    static getAsset (md5: string, fcn: (data: string) => void) { // returns either a link or a base64 dataurl
        if (MediaLib.keys[md5]) {
            fcn(MediaLib.path + md5); return;
        } // just url link assets do not have photos
        if (md5.indexOf('/') > -1) {
            IO.requestFromServer(md5, gotit); // get url contents
            return;
        }
        if ((IO.getExtension(md5) == 'png') && iOS.path) {
            fcn(iOS.path + md5); // only if it is not in debug mode
        } else {
            iOS.getmedia(md5, nextStep);
        } // get url contents

        function gotit (str: string) {
            var base64 = IO.getImageDataURL(md5, btoa(str));
            if (str.indexOf('xlink:href') < 0) {
                fcn(md5); // does not have embedded images
            } else {
                IO.getImagesInSVG(str, function () {
                    fcn(base64);
                });
            } // base64 dataurl
        }

        function nextStep (dataurl: string) { // iOS 7 requires to read the internal base64 images before returning contents
            var str = atob(dataurl);
            if ((str.indexOf('xlink:href') < 0) && iOS.path) {
                fcn(iOS.path + md5); // does not have embedded images
            } else {
                var base64 = IO.getImageDataURL(md5, dataurl);
                IO.getImagesInSVG(str, function () {
                    fcn(base64);
                }); // base64 dataurl
            }
        }
    }

    static getImagesInSVG (str: string, whenDone: () => void) {
        str = str.replace(/>\s*</g, '><');
        if (str.indexOf('xlink:href') < 0) {
            whenDone(); // needs this in case of reading a PNG in debug mode
        } else {
            loadInnerImages(str, whenDone);
        }

        function loadInnerImages (str: string, whenDone: () => void) {
            var xmlDoc: Document | null = new DOMParser().parseFromString(str, 'text/xml');
            var extxml: HTMLElement | null = document.importNode(xmlDoc.documentElement, true);
            if (extxml!.childNodes[0].nodeName == '#comment') {
                extxml!.removeChild(extxml!.childNodes[0]);
            }
            var images = IO.getImages(extxml!, []);
            var imageCount = images.length;
            for (var i = 0; i < images.length; i++) {
                var dataurl = images[i].getAttribute('xlink:href');
                var svgimg = document.createElement('img');
                svgimg.src = dataurl!;
                if (!svgimg.complete) {
                    svgimg.onload = function () {
                        readToLad();
                    };
                } else {
                    readToLad();
                }
            }

            function readToLad () {
                imageCount--;
                if (imageCount < 1) {
                    extxml = null;
                    xmlDoc = null;
                    whenDone();
                }
            }
        }
    }

    static getImages (p: HTMLElement, res: HTMLElement[]) {
        for (var i = 0; i < p.childNodes.length; i++) {
            var elem = p.childNodes[i];
            if (elem.nodeName == 'metadata') {
                continue;
            }
            if (elem.nodeName == 'defs') {
                continue;
            }
            if (elem.nodeName == 'sodipodi:namedview') {
                continue;
            }
            if (elem.nodeName == '#comment') {
                continue;
            }
            if (elem.nodeName == 'image') {
                res.push(elem as HTMLElement);
            }
            if (elem.nodeName == 'g') {
                IO.getImages(elem as HTMLElement, res);
            }
        }
        return res;
    }
    static getImageDataURL (md5: string, data: string) {
        var header = '';
        switch (IO.getExtension(md5)) {
        case 'svg': header = 'data:image/svg+xml;base64,';
            break;
        case 'png': header = 'data:image/png;base64,';
            break;
        }
        return header + data;
    }

    static getObject (md5: string, fcn: (obj: string) => void) {
        if (md5.indexOf('/') > -1) {
            var gotit = function (str: string) {
                fcn(str);
            };
            IO.requestFromServer(md5, gotit);
        } else {
            IO.getObjectinDB(database, md5, fcn);
        }
    }

    static getObjectinDB (db: string, md5: string, fcn: (obj: string) => void) {
        var json: DbSelectIntent = { op: 'select', table: db, where: [{ col: 'id', op: '=', value: md5 }] };
        iOS.query(json, fcn);
    }

    static setMedia (data: string, type: string, fcn?: (result: string) => void) {
        iOS.setmedia(btoa(data), type, fcn);
    }

    static query (type: string, obj: Omit<DbSelectIntent, 'op' | 'table'>, fcn: (result: string) => void) {
        var json: DbSelectIntent = { op: 'select', table: type, items: obj.items, where: obj.where, order: obj.order };
        iOS.query(json, fcn);
    }

    static deleteobject (type: string, id: string, fcn?: (result: unknown) => void) {
        iOS.stmt({ op: 'delete', table: type, id }, fcn);
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

    static createProject (obj: ProjectRecord, fcn?: (result: unknown) => void) {
        var row: Record<string, DbValue> = {
            name: obj.name || 'Project',
            version: obj.version || window.Settings?.scratchJrVersion || '1.0.0',
            deleted: 'NO',
            mtime: (new Date()).getTime().toString(),
            isgift: obj.isgift ? obj.isgift : '0',
        };
        if (obj.json) {
            row.json = JSON.stringify(obj.json);
        }
        if (obj.thumbnail) {
            row.thumbnail = JSON.stringify(obj.thumbnail);
        }
        iOS.stmt({ op: 'insert', table: database, row }, fcn);
    }

    static saveProject (obj: ProjectRecord, fcn?: (result: unknown) => void) {
        try {
            var row: Record<string, DbValue> = {
                version: obj.version || window.Settings?.scratchJrVersion || '1.0.0',
                deleted: obj.deleted || 'NO',
                name: obj.name || 'Project',
                json: JSON.stringify(obj.json),
                thumbnail: JSON.stringify(obj.thumbnail),
                mtime: (new Date()).getTime().toString(),
            };
            iOS.stmt({ op: 'update', table: database, row, id: obj.id! }, fcn);
        } catch (e) {
            if (fcn) {
                fcn(-1);
            }
        }
    }

    // Since saveProject is changing the modified time of the project,
    // let's just simply update the isgift flag in a separate function...
    static setProjectIsGift (obj: ProjectRecord, fcn?: (result: unknown) => void) {
        iOS.stmt({ op: 'update', table: database, row: { isgift: obj.isgift! }, id: obj.id! }, fcn);
    }

    static getExtension (str: string) {
        return str.substring(str.indexOf('.') + 1, str.length);
    }

    static getFilename (str: string) {
        return str.substring(0, str.indexOf('.'));
    }

    static parseProjectData (data: Record<string, unknown>): Record<string, unknown> {
        var res: Record<string, unknown> = {};
        for (var key in data) {
            res[key.toLowerCase()] = data[key];
        }
        return res;
    }

    //////////////////
    // Sharing
    ////////////////////

    static zipProject (projectReference: string, finished: (contents: string) => void) {
        IO.getObject(projectReference, function (projectFromDB: string) {
            var projectMetadata: Record<string, string[]> = {
                'thumbnails': [],
                'characters': [],
                'backgrounds': [],
                'sounds': []
            };
            var jsonData = IO.parseProjectData(JSON.parse(projectFromDB)[0]);

            // Collect project assets for inclusion in zip file
            // Parse JSON representations of project data / thumbnail into usable types
            if (typeof jsonData.json == 'string') {
                jsonData.json = JSON.parse(jsonData.json);
            }
            if (typeof jsonData.thumbnail == 'string') {
                jsonData.thumbnail = JSON.parse(jsonData.thumbnail);
            }

            // Method to determine if a particular asset needs to be collected
            // If it does, save the reference in projectMetadata for collection
            var collectAsset = function (assetType: string, md5: string) {
                if (md5 && (typeof md5 !== 'undefined')) {
                    if (md5.indexOf('samples/') < 0) { // Exclude sample assets
                        if (collectLibraryAssets) {
                            // Behavior if we want to collect and package library assets
                            if (projectMetadata[assetType].indexOf(md5) < 0 && MediaLib.sounds.indexOf(md5) < 0) {
                                projectMetadata[assetType].push(md5);
                            }
                        } else {
                            // Otherwise, first check if it's in the library
                            if (md5 && (typeof md5 !== 'undefined')
                                && !MediaLib.keys[md5] && MediaLib.sounds.indexOf(md5) < 0) {
                                if (projectMetadata[assetType].indexOf(md5) < 0) {
                                    projectMetadata[assetType].push(md5);
                                }
                            }
                        }
                    }
                }
            };

            // Project thumbnail
            const thumbnail = jsonData.thumbnail;
            if (thumbnail && typeof thumbnail === 'object' && 'md5' in thumbnail) {
                collectAsset('thumbnails', thumbnail.md5 as string);
            }

            // Nested project JSON (pages -> sprites) is an opaque bag; page/sprite
            // shapes vary by project version, so index it dynamically.
            var projectData = jsonData.json as Record<string, unknown>;

            // Data for each page
            if (projectData && typeof projectData === 'object' && 'pages' in projectData && Array.isArray(projectData.pages)) {
                var pages = projectData.pages;
                for (var p = 0; p < pages.length; p++) {
                    var pageReference = pages[p];
                    var page = projectData[pageReference] as Record<string, unknown>;

                    // Page background
                    collectAsset('backgrounds', page.md5 as string);

                    // Sprites
                    var sprites = page.sprites as string[];
                    for (var s = 0; s < sprites.length; s++) {
                        var spriteReference = sprites[s];
                        var sprite = page[spriteReference] as Record<string, unknown>;

                        if (sprite.type != 'sprite') {
                            continue;
                        }

                        // Sprite image
                        collectAsset('characters', sprite.md5 as string);

                        // Sprite's recorded sounds
                        var sounds = sprite.sounds as string[];
                        for (var snd = 0; snd < sounds.length; snd++) {
                            collectAsset('sounds', sounds[snd]);
                        }
                    }
                }
            }

            // Get the media in projectMetadata and add it to a zip file
            zipFile = new JSZip();
            zipFile!.folder('project');

            var projectDataForZip = JSON.stringify(jsonData);
            zipFile!.file('project/data.json', projectDataForZip, {});

            // Generic function for adding media to the zip file; resolves when
            // the asset is in the archive.
            var addMediaToZip = function (folder: string, md5: string): Promise<void> {
                return new Promise(function (resolve) {
                    var addToZip = function (b64data: string) {
                        zipFile!.file('project/' + folder + '/' + md5, b64data, {
                            base64: true,
                            createFolders: true
                        });
                        resolve();
                    };
                    // Determine if the md5 is a MediaLib file or a user one, and download it appropriately
                    // See also, Sprite.getAsset
                    if (md5 in MediaLib.keys) {
                        // Library character
                        IO.requestFromServer(MediaLib.path + md5, function (raw) {
                            addToZip(btoa(raw));
                        });
                    } else {
                        // User file
                        iOS.getmedia(md5, addToZip);
                    }
                });
            };

            var pendingAssets: Promise<void>[] = [];

            // Add each type of media
            for (var j = 0; j < projectMetadata.thumbnails.length; j++) {
                pendingAssets.push(addMediaToZip('thumbnails', projectMetadata.thumbnails[j]));
            }

            for (var k = 0; k < projectMetadata.characters.length; k++) {
                pendingAssets.push(addMediaToZip('characters', projectMetadata.characters[k]));
            }

            for (var l = 0; l < projectMetadata.backgrounds.length; l++) {
                pendingAssets.push(addMediaToZip('backgrounds', projectMetadata.backgrounds[l]));
            }

            for (var m = 0; m < projectMetadata.sounds.length; m++) {
                pendingAssets.push(addMediaToZip('sounds', projectMetadata.sounds[m]));
            }

            // strip spaces and sanitize filename, including windows reserved names even though
            // kids are unlikely to name their project lpt1 etc.
            var illegalRe = /[\/\?<>\\:\*\|":]/g;
            var controlRe = /[\x00-\x1f\x80-\x9f]/g;  // eslint-disable-line no-control-regex
            var reservedRe = /^\.+$/;
            var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
            var windowsTrailingRe = /[\. ]+$/;

            const projectName = (typeof jsonData.name === 'string') ? jsonData.name : '';
            zipFileName = projectName.replace(/\s*/g, '');
            zipFileName = zipFileName
                .replace(illegalRe, '_')
                .replace(controlRe, '_')
                .replace(reservedRe, '_')
                .replace(windowsReservedRe, '_')
                .replace(windowsTrailingRe, '_');
            shareName = projectName;

            // Finish as soon as every asset has landed — replaces the old
            // 200ms expected/actual counter polling.
            Promise.all(pendingAssets).then(async function () {
                const contents = await (zipFile as JSZip).generateAsync({
                    type: 'base64',
                    compression: 'STORE',
                });
                finished(contents);
            });
        });
    }

    static uniqueProjectName (jsonData: ProjectRecord, callback: (jsonData: ProjectRecord) => void, useOne?: boolean) {
        // Ensure the project name is not a duplicate

        // Split project name from trailing number
        // Returns [project name, number]
        // E.g., "Project 2" -> ["Project", 2]
        // "My project" -> ["My project", null];
        var nameAndNumber = function (name: string) {
            var splitName = name.split(' ');
            var lastPart = splitName.pop();
            if (!isNaN(Number(lastPart))) {
                return {
                    'name': splitName.join(' '),
                    'number': parseInt(lastPart as string)
                };
            } else {
                return {
                    'name': name,
                    'number': null
                };
            }
        };

        var giftProjectNameParts = nameAndNumber(jsonData.name!);

        // Get project names already existing in the DB
        var json: DbSelectIntent = {
            op: 'select', table: iOS.database,
            items: ['name'],
            where: [{ col: 'deleted', op: '=', value: 'NO' }, { col: 'gallery', op: 'IS NULL' }],
        };
        IO.query(iOS.database, json, function (existingProjects: string) {
            var newNumber: number | null = null;

            var existingProjectList = JSON.parse(existingProjects);
            for (var i = 0; i < existingProjectList.length; i++) {
                var existingProjectName = IO.parseProjectData(existingProjectList[i]).name;
                var existingProjectNameParts = nameAndNumber(existingProjectName as string);
                if (giftProjectNameParts.name == existingProjectNameParts.name) {
                    if (existingProjectNameParts.number != null) {
                        // "My project 2" -> "My project 3"
                        newNumber = existingProjectNameParts.number + 1;
                    } else {
                        // "My project" -> "My project 2"
                        newNumber = 2;
                    }
                }

            }

            if (newNumber != null && (!giftProjectNameParts.number || newNumber > giftProjectNameParts.number)) {
                // A duplicate project name exists - update it
                jsonData.name = giftProjectNameParts.name + ' ' + newNumber;
            } else if (useOne) {
                jsonData.name = giftProjectNameParts.name + ' 1';
            }
            callback(jsonData);
        });
    }

    // Receive a base64-encoded zip (a .sjr project) and merge its assets.
    static async loadProjectFromSjr (b64data: string) {
        // Together, these two provide a "progress" indication
        // that lets us know when to refresh the lobby (when sE/sA = 1)
        var saveExpected = 0; // How many assets we expect to save - updated as we process the zip
        var saveActual = 0; // How many assets actually saved - updated as we make IO saves

        var receivedZip = await JSZip.loadAsync(b64data, { base64: true });

        // To store character MD5 -> character name map
        // The character name is stored in the project JSON; when we load
        // the actual SVG asset, we need the associated name for storage in the DB
        var characterNames: Record<string, string> = {};

        type ZipEntryLike = { dir: boolean; async (type: string): Promise<string> };
        var dataEntry: ZipEntryLike | null = null;
        var assetEntries: Array<{ relativePath: string; file: ZipEntryLike }> = [];
        receivedZip.forEach(function (relativePath, file) {
            if (file.dir) return;
            var f = file as unknown as ZipEntryLike;
            var fullName = relativePath.split('/').pop();
            if (fullName === 'data.json') dataEntry = f;
            else assetEntries.push({ relativePath, file: f });
        });

        // ---- Pass 1: project row + character-name map from data.json ----
        if (!dataEntry) {
            debugLog('loadProjectFromSjr: no data.json found in archive');
            return;
        }
        var jsonData = JSON.parse(await (dataEntry as ZipEntryLike).async('text')) as {
            version: string;
            json: Record<string, unknown> & { pages: string[] };
        };

        // To require an upgrade, change the major version numbers in .html files and here...
        var currentVersion = 1;
        var projectVersion = parseInt(jsonData.version.replace('iOSv', '')) || 0;

        if (projectVersion > currentVersion) {
            throw new Error('Project created in a new version of ScratchJr. Please upgrade ScratchJr.');
        }

        await new Promise<void>(function (resolve) {
            IO.uniqueProjectName(jsonData as unknown as Parameters<typeof IO.uniqueProjectName>[0], function (jd) {
                (jd as { isgift?: string }).isgift = '1'; // Project will display with a bow and ribbon
                IO.createProject(jd as unknown as ProjectRecord, function () { resolve(); });
            });
        });

        // Build map of character filename -> character name
        var projectData = jsonData.json;
        for (var p = 0; p < projectData.pages.length; p++) {
            var pageReference = projectData.pages[p];
            var page = projectData[pageReference] as { sprites: string[] } & Record<string, { type: string; md5: string; name: string }>;
            for (var s = 0; s < page.sprites.length; s++) {
                var spriteReference = page.sprites[s];
                var sprite = page[spriteReference];
                // Store a database-friendly sprite name
                if (sprite.type == 'sprite') {
                    characterNames[sprite.md5] = (
                        ((unescape(sprite.name)).replace(/[0-9]/g, '')).replace(/\s*/g, '')
                    );
                }
            }
        }

        // ---- Pass 2: assets ----
        for (var e = 0; e < assetEntries.length; e++) {
            var relativePath = assetEntries[e].relativePath;
            var file = assetEntries[e].file;
            saveExpected++; // We expect to save something for each non-directory

            var subFolder = relativePath.split('/')[1]; // should be {backgrounds, characters, thumbnails, sounds}

            // Filename processing
            var fullName = relativePath.split('/').pop()!; // e.g. Cat.svg
            var name = fullName.split('.')[0]; // e.g. Cat
            var ext = fullName.split('.').pop(); // e.g. svg

            if (!name || !ext) {
                continue;
            }

            // Don't save items we already have in the MediaLib
            if (fullName in MediaLib.keys) {
                saveActual++;
                continue;
            }

            // File data (binary string) and base64-encoded data
            var data = await file.async('binarystring');
            var b2data = btoa(data);

            if (subFolder == 'thumbnails' || subFolder == 'sounds') {
                // Save these immediately to the filesystem - no additional processing necessary
                iOS.setmedianame(b2data, name, ext, function () {
                    saveActual++;
                });
            } else if (subFolder == 'characters') {
                // Save the character, generate its thumbnail, and add entry to the database
                iOS.setmedianame(b2data, name, ext, function () { // Saves the SVG
                    // Parse SVG to determine width/height
                    var svgParser = new DOMParser().parseFromString(data, 'text/xml');
                    var width = svgParser.getElementsByTagName('svg')[0].width.baseVal.value;
                    var height = svgParser.getElementsByTagName('svg')[0].height.baseVal.value;
                    var scale = '0.5'; // fixed value - see PaintIO

                    IO.getImagesInSVG(data, gotSVGImages);

                    function gotSVGImages () {
                        var thumbnailDataURL = IO.getThumbnail(data, width, height, 120, 90);

                        var thumbnailPngBase64 = thumbnailDataURL.split(',')[1];

                        var charName = characterNames[fullName];

                        iOS.setmedia(thumbnailPngBase64, 'png', function (thumbnailMD5) {
                            // Sprite thumbnail is saved - save character to the DB

                            // First ensure that this character doesn't already exist in the exact form
                            var json: DbSelectIntent = {
                                op: 'select', table: 'usershapes',
                                items: ['*'],
                                where: [
                                    { col: 'ext', op: '=', value: 'svg' },
                                    { col: 'md5', op: '=', value: fullName },
                                    { col: 'altmd5', op: '=', value: thumbnailMD5 },
                                    { col: 'name', op: '=', value: charName },
                                    { col: 'scale', op: '=', value: scale },
                                    { col: 'width', op: '=', value: width.toString() },
                                    { col: 'height', op: '=', value: height.toString() },
                                ],
                                order: { col: 'ctime', dir: 'desc' },
                            };
                            IO.query('usershapes', json, function (results) {
                                results = JSON.parse(results);
                                if (results.length == 0) {
                                    // This character doesn't already exist - insert it
                                    iOS.stmt({
                                        op: 'insert', table: 'usershapes',
                                        row: {
                                            scale, md5: fullName, altmd5: thumbnailMD5,
                                            version: 'iOSv01', width: width.toString(),
                                            height: height.toString(), ext: 'svg', name: charName,
                                        },
                                    }, function () {
                                        saveActual++;
                                    });
                                } else {
                                    saveActual++;
                                }
                            });
                        });
                    }
                });
            } else if (subFolder == 'backgrounds') {
                // Same idea as characters, but the dimensions are fixed
                iOS.setmedianame(b2data, name, ext, function () {
                    IO.getImagesInSVG(data, gotSVGImages);

                    function gotSVGImages () {
                        var thumbnailDataURL = IO.getThumbnail(data, 480, 360, 120, 90);
                        var thumbnailPngBase64 = thumbnailDataURL.split(',')[1];
                        iOS.setmedia(thumbnailPngBase64, 'png', function (thumbnailMD5) {

                            // First ensure that this bg doesn't already exist in the exact form
                            var json: DbSelectIntent = {
                                op: 'select', table: 'userbkgs',
                                items: ['*'],
                                where: [
                                    { col: 'ext', op: '=', value: 'svg' },
                                    { col: 'md5', op: '=', value: fullName },
                                    { col: 'altmd5', op: '=', value: thumbnailMD5 },
                                ],
                                order: { col: 'ctime', dir: 'desc' },
                            };
                            IO.query('userbkgs', json, function (results) {
                                results = JSON.parse(results);
                                if (results.length == 0) {
                                    // Background is unique, insert into the library
                                    iOS.stmt({
                                        op: 'insert', table: 'userbkgs',
                                        row: {
                                            md5: fullName, altmd5: thumbnailMD5, version: 'iOSv01',
                                            width: '480', height: '360', ext: 'svg',
                                        },
                                    }, function () {
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
                saveActual++; // Ignore this file - someone messed with the SJR...
            }
        }


    }
}

// Read-only debug/test seam (mirrors modelRegistry.__modelRefs): lets the
// interaction harness exercise the .sjr export/import round-trip in-page.
declare global {
    interface Window {
        __ioDebug?: {
            zipProject: (ref: string, fcn: (contents: string) => void) => void;
            loadProjectFromSjr: (b64data: string) => void;
        };
    }
}

if (typeof window !== 'undefined') {
    window.__ioDebug = {
        zipProject: (ref, fcn) => IO.zipProject(ref, fcn),
        loadProjectFromSjr: (b64) => IO.loadProjectFromSjr(b64),
    };
}