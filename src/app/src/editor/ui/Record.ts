import ScratchJr from '../ScratchJr';
import { getModelRefAs } from '../modelRegistry';
import Palette from './Palette';
import Undo from './Undo';
import PlatformBridge from '../../platform/PlatformBridge';
import ScratchAudio from '../../utils/ScratchAudio';
import type Sprite from '../engine/Sprite';
import type Page from '../engine/Page';
import {frame, gn, newHTML, setProps} from '../../utils/lib';

let interval: NodeJS.Timeout | null = null;
let recordedSound: string | null = null;
let isRecording = false;
let isPlaying = false;
let available = true;
let error = false;
let dialogOpen = false;
let timeLimit: NodeJS.Timeout | null = null;
let playTimeLimit: NodeJS.Timeout | null = null;

export default class Record {
    // Assigned by startRecording; retained for debugging
    static soundname: string;

    static get available () {
        return available;
    }

    static set available (newAvailable) {
        available = newAvailable;
    }

    static get dialogOpen () {
        return dialogOpen;
    }

    // Create the recording window, including buttons and volume indicators
    static init () {
        var parent = (frame.parentNode || document.body) as HTMLElement;
        var modal = newHTML('div', 'record fade', parent);
        modal.setAttribute('id', 'recorddialog');
        var topbar = newHTML('div', 'toolbar', modal);
        var actions = newHTML('div', 'actions', topbar);
        newHTML('div', 'microphone', actions);
        var buttons = newHTML('div', 'recordbuttons', actions);
        var importbut = newHTML('div', 'recordimport', buttons);
        importbut.setAttribute('title', 'Import audio file');
        importbut.onmousedown = Record.importAudio;
        importbut.ontouchend = function (e: TouchEvent) {
            e.preventDefault();
            Record.importAudio();
        };
        var okbut = newHTML('div', 'recorddone', buttons);
        okbut.onmousedown = Record.saveSoundAndClose;
        okbut.ontouchend = function (e: TouchEvent) {
            e.preventDefault();
            Record.saveSoundAndClose();
        };
        var sc = newHTML('div', 'soundbox', modal);
        sc.setAttribute('id', 'soundbox');
        var sv = newHTML('div', 'soundvolume', sc);
        sv.setAttribute('id', 'soundvolume');
        for (var i = 0; i < 13; i++) {
            var si = newHTML('div', 'indicator', sv);
            newHTML('div', 'soundlevel', si);
        }
        var ctrol = newHTML('div', 'soundcontrols', sc);
        ctrol.setAttribute('id', 'soundcontrols');
        var lib: Array<[string, (e: MouseEvent) => void]> = [['record', Record.record], ['stop', Record.stopSnd], ['play', Record.playSnd]];
        for (var j = 0; j < lib.length; j++) {
            Record.newToggleClicky(ctrol, 'id_', lib[j][0], lib[j][1]);
        }
    }

    // Dialog box hide/show
    static appear () {
        if (dialogOpen) {
            return;
        }
        var bd = gn('backdrop');
        if (bd) {
            bd.setAttribute('class', 'modal-backdrop fade in');
            setProps(bd.style, {
                display: 'block'
            });
            bd.onmousedown = Record.saveSoundAndClose;
            bd.ontouchend = function (e: TouchEvent) {
                e.preventDefault();
                Record.saveSoundAndClose();
            };
        }
        var dlg = gn('recorddialog');
        if (dlg) {
            dlg.setAttribute('class', 'record fade in');
            dlg.onmousedown = function (e: MouseEvent) {
                e.stopPropagation();
            };
            dlg.ontouchend = function (e: TouchEvent) {
                e.stopPropagation();
            };
        }
        ScratchJr.stopStrips();
        dialogOpen = true;
        // Typo in original (pushed undefined); intent is the save handler
        ScratchJr.onBackButtonCallback.push(Record.saveSoundAndClose);
    }

    static disappear () {
        var bd = gn('backdrop');
        if (bd) {
            bd.onmousedown = null;
            bd.ontouchend = null;
        }
        var dlg = gn('recorddialog');
        if (dlg) {
            dlg.setAttribute('class', 'record fade out');
        }
        setTimeout(function () {
            if (bd) {
                bd.setAttribute('class', 'modal-backdrop fade');
                setProps(bd.style, {
                    display: 'none'
                });
            }
            if (dlg) {
                dlg.setAttribute('class', 'record fade');
            }
        }, 333);
        dialogOpen = false;
        ScratchJr.onBackButtonCallback.pop();
    }

    // Register toggle buttons and handlers
    static newToggleClicky (p: HTMLElement, prefix: string, key: string, fcn: (e: MouseEvent) => void) {
        var button = newHTML('div', 'controlwrap', p);
        newHTML('div', key + 'snd off', button);
        button.setAttribute('type', 'toggleclicky');
        button.setAttribute('id', prefix + key);
        if (fcn) {
            button.onmousedown = function (evt: MouseEvent) {
                fcn(evt);
            };
            button.ontouchend = function (evt: TouchEvent) {
                evt.preventDefault();
                fcn(evt as unknown as MouseEvent);
            };
        }
        return button;
    }

    // Import external audio file (wav, mp3, ogg, webm, m4a)
    static importAudio () {
        var spr = ScratchJr.getSprite() as Sprite;
        if (!spr || spr.sounds.length >= 6) {
            return;
        }
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*,audio/wav,audio/mp3,audio/mpeg,audio/ogg,audio/webm,audio/x-m4a,audio/aac';
        input.style.display = 'none';
        input.onchange = function () {
            if (!input.files || input.files.length === 0) return;
            var file = input.files[0];
            var ext = file.name.split('.').pop()?.toLowerCase() || 'wav';
            if (ext === 'mp3' || ext === 'mpeg') ext = 'mp3';
            else if (ext === 'ogg' || ext === 'oga') ext = 'ogg';
            else if (ext === 'm4a' || ext === 'aac') ext = 'm4a';
            else if (ext === 'webm') ext = 'webm';
            else ext = 'wav';

            var reader = new FileReader();
            reader.onload = function () {
                var dataUri = String(reader.result);
                var soundId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                var soundName = soundId + '.' + ext;
                var b64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;

                if (isPlaying) {
                    Record.stopPlayingSound();
                }
                if (isRecording) {
                    Record.stopRecording();
                }

                // If on desktop with tablet client, cache dataUri for instant playback
                try {
                    const tablet = (window as unknown as { tablet?: { loadSoundFromDataURI?: (name: string, uri: string) => void } }).tablet;
                    if (tablet && tablet.loadSoundFromDataURI) {
                        tablet.loadSoundFromDataURI(soundName, dataUri);
                    }
                } catch (_) { /* ignore */ }

                PlatformBridge.setmedianame(b64, soundId, ext, function () {
                    ScratchAudio.loadFromLocal('Documents', soundName, function (loadedName) {
                        if (loadedName !== 'error') {
                            var page = getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page')!;
                            spr.sounds.push(soundName);
                            Undo.record({
                                action: 'recordsound',
                                who: spr.id,
                                where: page ? page.id : '',
                                sound: soundName
                            });
                            ScratchJr.storyStart('Record.importAudio');
                        }
                        Record.tearDownRecorder();
                        Palette.selectCategory(3);
                    });
                });
            };
            reader.readAsDataURL(file);
        };
        document.body.appendChild(input);
        input.click();
        setTimeout(function () {
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
        }, 1000);
    }

    // Toggle button appearance on/off
    static toggleButtonUI (button: string, newState: boolean) {
        var element = 'id_' + button;
        var newStateStr = (newState) ? 'on' : 'off';
        var attrclass = button + 'snd';
        const childNode = gn(element)!.childNodes[0] as HTMLElement;
        childNode.setAttribute('class', attrclass + ' ' + newStateStr);
    }

    // Volume UI updater
    static updateVolume (f: number) {
        var num = Math.round(f * 13);
        var div = gn('soundvolume')!;
        if (!isRecording) {
            num = 0;
        }
        for (var i = 0; i < 13; i++) {
            const childNode = div.childNodes[i].childNodes[0] as HTMLElement;
            childNode.setAttribute('class', ((i > num) ? 'soundlevel off' : 'soundlevel on'));
        }
    }

    // Stop recording UI and turn off volume levels
    static recordUIoff () {
        Record.toggleButtonUI('record', false);
        var div = gn('soundvolume')!;
        for (var i = 0; i < gn('soundvolume')!.childElementCount; i++) {
            const childNode = div.childNodes[i].childNodes[0] as HTMLElement;
            childNode.setAttribute('class', 'soundlevel off');
        }
    }

    // On press record button
    static record (e: MouseEvent) {
        if (error) {
            Record.killRecorder(e);
            return;
        }
        if (isPlaying) {
            Record.stopPlayingSound(doRecord);
        } else {
            doRecord();
        }
        function doRecord () {
            if (isRecording) {
                Record.stopRecording(); // Stop if we're already recording
            } else {
                PlatformBridge.sndrecord(Record.startRecording as (result: unknown) => void); // Start a recording
            }
        }
    }

    static startRecording (filename: string) {
        if (parseInt(filename) < 0) {
            // Error in getting record filename - go back to editor
            recordedSound = null;
            isRecording = false;
            Record.killRecorder();
            Palette.selectCategory(3);
        } else {
            // Save recording's filename for later
            recordedSound = filename;
            isRecording = true;
            error = false;
            Record.soundname = filename;
            Record.toggleButtonUI('record', true);
            var poll = function () {
                PlatformBridge.volume(Record.updateVolume, Record.recordError);
            };
            interval = setInterval(poll, 33);
            timeLimit = setTimeout(function () {
                if (isRecording) {
                    Record.stopRecording();
                }
            }, 30000);
        }
    }

    // Press the play button
    static playSnd (e: MouseEvent) {
        if (error) {
            Record.killRecorder(e);
            return;
        }
        if (!recordedSound) {
            return;
        }
        if (isPlaying) {
            Record.stopPlayingSound();
        } else {
            if (isRecording) {
                Record.stopRecording(Record.startPlaying);
            } else {
                Record.startPlaying();
            }
        }
    }

    // Start playing the sound and switch UI appropriately
    static startPlaying () {
        PlatformBridge.startplay(Record.timeOutPlay);
        Record.toggleButtonUI('play', true);
        isPlaying = true;
    }

    // Gets the sound duration from host bridge and changes play UI state after time
    static timeOutPlay (timeout: number | string) { // duration from the native audio bridge (may be numeric string)
        if (parseInt(String(timeout)) < 0) {
            timeout = 0.1; // Error - stop playing immediately
        }
        playTimeLimit = setTimeout(function () {
            Record.toggleButtonUI('play', false);
            isPlaying = false;
        }, Number(timeout) * 1000);
    }

    // Press on stop
    static stopSnd (e: MouseEvent) {
        if (error) {
            Record.killRecorder(e);
            return;
        }
        if (!recordedSound) {
            return;
        }
        Record.flashStopButton();
        if (isRecording) {
            Record.stopRecording();
        } else if (isPlaying) {
            Record.stopPlayingSound();
        }
    }

    static flashStopButton () {
        Record.toggleButtonUI('stop', true);
        setTimeout(function () {
            Record.toggleButtonUI('stop', false);
        }, 200);
    }

    // Stop playing the sound and switch UI appropriately
    static stopPlayingSound (fcn?: () => void) {
        PlatformBridge.stopplay(fcn!);
        Record.toggleButtonUI('play', false);
        isPlaying = false;
        window.clearTimeout(playTimeLimit!);
        playTimeLimit = null;
    }

    // Stop the volume monitor and recording
    static stopRecording (fcn?: () => void) {
        if (timeLimit != null) {
            clearTimeout(timeLimit);
            timeLimit = null;
        }
        if (interval != null) {
            window.clearInterval(interval);
            interval = null;
            setTimeout(function () {
                Record.volumeCheckStopped(fcn);
            }, 33);
        } else {
            Record.volumeCheckStopped(fcn);
        }
    }

    static volumeCheckStopped (fcn?: () => void) {
        isRecording = false;
        Record.recordUIoff();
        PlatformBridge.recordstop(fcn);
    }

    // Press OK (check)
    static saveSoundAndClose () {
        if (error || !recordedSound) {
            Record.killRecorder();
        } else {
            if (isPlaying) {
                Record.stopPlayingSound(Record.closeContinueSave);
            } else {
                if (isRecording) {
                    Record.stopRecording(Record.closeContinueSave);
                } else {
                    Record.closeContinueSave();
                }
            }
        }
    }

    static closeContinueSave () {
        PlatformBridge.recorddisappear('YES', Record.registerProjectSound);
    }

    static closeContinueRemove () {
        // don't get the sound - proceed right to tearDown
        PlatformBridge.recorddisappear('NO', Record.tearDownRecorder);
    }

    static registerProjectSound () {
        function whenDone (snd: string) {
            if (snd != 'error') {
                var spr = ScratchJr.getSprite() as Sprite;
                var page = getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page')!;
                spr.sounds.push(recordedSound!);
                Undo.record({
                    action: 'recordsound',
                    who: spr.id,
                    where: page.id,
                    sound: recordedSound
                });
                ScratchJr.storyStart('Record.registerProjectSound');
            }
            Record.tearDownRecorder();
            Palette.selectCategory(3);
        }
        ScratchAudio.loadFromLocal('Documents', recordedSound!, whenDone);
    }

    // Called on error - remove everything and hide the recorder
    static killRecorder (e?: MouseEvent) {
        // Inform host bridge and then tear-down
        if (isPlaying) {
            Record.stopPlayingSound(Record.closeContinueRemove); // stop playing and tear-down
        } else {
            if (isRecording) {
                Record.stopRecording(Record.closeContinueRemove); // stop recording and tear-down
            } else {
                Record.closeContinueRemove();
            }
        }
    }

    static tearDownRecorder () {
        // Clear errors
        if (error) {
            error = false;
        }
        // Refresh audio context
        isRecording = false;
        recordedSound = null;
        // Hide the dialog
        Record.disappear();
    }

    // Called when the app is put into the background
    static recordError () {
        error = true;
        Record.killRecorder();
    }
}
