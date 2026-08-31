import {isiOS, gn} from '../utils/lib';
import IO from './IO.js';
import Alert from '../editor/ui/Alert';
import ScratchAudio from '../utils/ScratchAudio';
import AppUsage from '../utils/AppUsage';

//////////////////////////////////////////////////
//  Platform & Host Bridge functions
//////////////////////////////////////////////////

// This bridge connects renderer code with host/Electron native operations.
// Originally named "iOS" in legacy ScratchJr, it is now unified as PlatformBridge.

let path: string | undefined;
let camera: string | undefined;
let database = 'projects';
let mediacounter = 0;
let hostInterface: ScratchJrBridge | null = null;

export default class PlatformBridge {
    // Getters/setters for properties used in other classes
    static get path (): string {
        return path!;
    }

    static set path (newPath: string | undefined) {
        path = newPath;
    }

    static get camera (): string {
        return camera!;
    }

    static get database () {
        return database;
    }

    // Wait for the desktop/tablet interface to be injected into the webview
    static waitForInterface (fcn: () => void) {
        // Already loaded the interface
        if (hostInterface != null) {
            fcn();
            return;
        }

        // Android device interface (injected on window.AndroidInterface or window.Android)
        const android = (typeof window !== 'undefined' && ((window as any).AndroidInterface || (window as any).Android)) || (typeof AndroidInterface !== 'undefined' ? AndroidInterface : null);
        if (android) {
            hostInterface = android as unknown as ScratchJrBridge;
            if (fcn) {
                fcn();
            }
            return;
        }

        // Desktop / iOS host bridge - might not be loaded yet
        if (typeof window !== 'undefined' && typeof (window.tablet) == 'object') {
            hostInterface = window.tablet;
            if (fcn) {
                fcn();
            }
            return;
        }

        // Retry in 50ms
        setTimeout(function () {
            PlatformBridge.waitForInterface(fcn);
        }, 50);
    }

    // Database functions
    static async stmt(json: DbWriteIntent, fcn?: (result: unknown) => void) {
        try {
            var result = await hostInterface!.database_stmt(JSON.stringify(json));
            if (typeof result === 'number' && result < 0) {
                // Distinct failure codes from the main process (DB_ERRORS):
                // -1 database closed, -2 intent rejected, -3 SQL error.
                console.error('[db] statement failed, code', result, JSON.stringify(json.op));
            }
            if (typeof (fcn) !== 'undefined') {
                fcn(result);
            }
        } catch (e) {
            console.error('[db] statement IPC error:', e);
            if (typeof (fcn) !== 'undefined') {
                fcn(-1);
            }
        }
    }

    static async query(json: DbSelectIntent, fcn: (result: string) => void) {
        var result = await hostInterface!.database_query(JSON.stringify(json));
        if (typeof (fcn) !== 'undefined') {
            fcn(result as string);
        }
    }

    static setfield (db: string, id: string, fieldname: string, val: string | number | boolean | null, fcn?: (result: unknown) => void) {
        var row: Record<string, DbValue> = {};
        row[fieldname] = val;
        row.mtime = (new Date()).getTime().toString();
        // fieldname is a caller-supplied literal column name; the main-side
        // intent validator rejects anything that is not an allowlisted column.
        PlatformBridge.stmt({ op: 'update', table: db, row, id }, fcn);
    }

    // IO functions

    static async cleanassets(ft: string, fcn: () => void) {
        await hostInterface!.io_cleanassets(ft); fcn();
    }

    static async getmedia(file: string, fcn: (data: string) => void) {
        mediacounter++;
        var nextStep = async function (file: string, key: number, whenDone: (data: string) => void) {
            var result = await hostInterface!.io_getmedialen(file, String(key));
            PlatformBridge.processdata(String(key), 0, result, '', whenDone);
        };
        nextStep(file, mediacounter, fcn);
    }

    static async getmediadata(key: string, offset: number, len: number, fcn?: (result: string) => void) {
        var result = await hostInterface!.io_getmediadata(key, offset, len);
        if (fcn) {
            fcn(result as string);
        }
    }

    static async processdata(key: string, off: number, len: number, oldstr: string, fcn: (str: string) => void) {
        if (len == 0) {
            PlatformBridge.getmediadone(key);
            fcn(oldstr);
            return;
        }
        var newlen = (len < 100000) ? len : 100000;
        PlatformBridge.getmediadata(key, off, newlen, function (str) {
            PlatformBridge.processdata(key, off + newlen, len - newlen, oldstr + str, fcn);
        });
    }

    static async getsettings(fcn: (settings: string) => void) {
        var result = await hostInterface!.io_getsettings();
        if (fcn) {
            fcn(result);
        }
    }

    static async getmediadone(file: string, fcn?: (result: unknown) => void) {
        var result = await hostInterface!.io_getmediadone(file);
        if (fcn) {
            fcn(result);
        }
    }

    static async setmedia(str: string, ext: string, fcn?: (result: string) => void) {
        var result = await hostInterface!.io_setmedia(str, ext);
        if (fcn) {
            fcn(result as string);
        }
    }

    static async setmedianame(str: string, name: string, ext: string, fcn?: (result: unknown) => void) {
        var result = await hostInterface!.io_setmedianame(str, name, ext);
        if (fcn) {
            fcn(result);
        }
    }

    static async getmd5(str: string, fcn?: (result: string | null) => void) {
        var result = await hostInterface!.io_getmd5(str);
        if (fcn) {
            fcn(result);
        }
    }

    static async remove(str: string, fcn?: (result: unknown) => void) {
        var result = await hostInterface!.io_remove(str);
        if (fcn) {
            fcn(result);
        }
    }

    static async getfile(str: string, fcn?: (result: string) => void) {
        var result = await hostInterface!.io_getfile(str);
        if (fcn) {
            fcn(result);
        }
    }

    static async gettextresource(filename: string, fcn?: (result: string) => void) {
        var result = await hostInterface!.io_gettextresource(filename);
        if (fcn) {
            fcn(result);
        }
    }

    static async setfile(name: string, str: string | number, fcn?: (result: unknown) => void) {
        var result = await hostInterface!.io_setfile(name, btoa(String(str)));
        if (fcn) {
            fcn(result);
        }
    }

    // Sound functions

    static registerSound (dir: string, name: string, fcn?: (result: unknown) => void) {
        var result = hostInterface!.io_registersound(dir, name);
        if (fcn) {
            fcn(result);
        }
    }

    static playSound (name: string, fcn?: (result: unknown) => void) {
        var result = hostInterface!.io_playsound(name);
        if (fcn) {
            fcn(result);
        }
    }

    static stopSound (name: string, fcn?: (result: unknown) => void) {
        var result = hostInterface!.io_stopsound(name);
        if (fcn) {
            fcn(result);
        }
    }

    // Web view delegate callbacks

    static soundDone (name: string) {
        ScratchAudio.soundDone(name);
    }

    static sndrecord (fcn?: (result: unknown) => void) {
        var result = hostInterface!.recordsound_recordstart();
        if (fcn) {
            fcn(result);
        }
    }

    static recordstop (fcn?: (result: unknown) => void) {
        var result = hostInterface!.recordsound_recordstop();
        if (fcn) {
            fcn(result);
        }
    }

    static volume (fcn?: (result: number) => void, _err?: unknown) {
        var result = hostInterface!.recordsound_volume();
        if (fcn) {
            fcn(result);
        }
    }

    static startplay (fcn?: (result: number) => void) {
        // Native returns the playback duration; the Electron stub returns void
        var result = hostInterface!.recordsound_startplay() as unknown as number;
        if (fcn) {
            fcn(result);
        }
    }

    static stopplay (fcn?: (result: unknown) => void) {
        var result = hostInterface!.recordsound_stopplay();
        if (fcn) {
            fcn(result);
        }
    }

    static recorddisappear (b: string, fcn?: (result: unknown) => void) {
        var result = hostInterface!.recordsound_recordclose(b as unknown as boolean);
        if (fcn) {
            fcn(result);
        }
    }

    // Record state
    static askpermission () {
        if (isiOS) {
            hostInterface!.askForPermission();
        }
    }

    // Camera functions

    static hascamera () {
        camera = hostInterface!.scratchjr_cameracheck() as string;
    }

    static startfeed (data: unknown, fcn?: (result: unknown) => void) {
        var str = JSON.stringify(data);
        var result = hostInterface!.scratchjr_startfeed(str);
        if (fcn) {
            fcn(result);
        }
    }

    static stopfeed (fcn?: (result: unknown) => void) {
        var result = hostInterface!.scratchjr_stopfeed();
        if (fcn) {
            fcn(result);
        }
    }

    static choosecamera (mode: string, fcn: unknown) {
        var result = hostInterface!.scratchjr_choosecamera(mode);
        if (fcn) {
            (fcn as (result: unknown) => void)(result);
        }
    }

    static captureimage (fcn: unknown) {
        // Legacy: callers pass a callback name string; the bridge expects a function
        hostInterface!.scratchjr_captureimage(fcn as () => void);
    }

    static trace (str: unknown) {
        console.log(str); // eslint-disable-line no-console
    }

    static parse (str: string) {
        console.log(JSON.parse(str)); // eslint-disable-line no-console
    }

    ignore () {
    }

    ///////////////
    // Sharing
    ///////////////

    // Called on the JS side to trigger native UI for project sharing.
    static sendSjrToShareDialog (fileName: string, emailSubject: string, emailBody: string, shareType: string, b64data: string) {
        const bridge = hostInterface as unknown as {
            sendSjrUsingShareDialog: (fileName: string, emailSubject: string, emailBody: string, shareType: string, b64data: string) => void;
        };
        bridge.sendSjrUsingShareDialog(fileName, emailSubject, emailBody, shareType, b64data);
    }

    // Process and store base64-encoded .SJR file
    static loadProjectFromSjr (b64data: string) {
        IO.loadProjectFromSjr(b64data).catch(function (err: Error) {
            var frame = gn('frame');
            var errorMessage = 'Couldn\'t load share -- project data corrupted. ' + (err ? err.message : '');
            if (frame) {
                Alert.open(frame, frame, errorMessage, '#ff0000');
            }
            console.error('PlatformBridge.loadProjectFromSjr error:', err);
        });
        return 1;
    }

    // Name of the host device to display on sharing dialog
    static deviceName (fcn: (name: string) => void) {
        fcn(hostInterface!.deviceName());
    }

    static analyticsEvent (category: string, action: string, label?: string, value?: number) {
        if (!value) {
            value = 1;
        }
        let usageLabel = label ? AppUsage.currentUsage + label : AppUsage.currentUsage;
        hostInterface!.analyticsEvent(category, action, usageLabel, value);
    }
}

// Backwards-compatible aliases
export { PlatformBridge as iOS };

// Expose methods on window for callbacks
window.PlatformBridge = PlatformBridge;
window.iOS = PlatformBridge;
