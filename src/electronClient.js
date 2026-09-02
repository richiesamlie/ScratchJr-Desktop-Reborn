// This file lives in the client side and has access to the dom
// It communicates with the main process through the preload bridge (window.scratchjr).
// Direct require('electron') is no longer allowed — nodeIntegration is off.
//
// AudioCapture/VideoCapture/CameraPickerDialog now live in webav.js (loaded
// before this file by every root page) so the Android WebView host can share
// them; this file only wires them to the Electron bridge.
/* global AudioCapture, CameraPickerDialog */

const bridge = /** @type {ScratchJrBridge} */ (window.scratchjr);


const DEBUG = false;
//const DEBUG =   remote.getCurrentWebContents().browserWindowOptions.isDebug;  // grab the DEBUG variable from main. This is passed through the BrowserWindow creation
const DEBUG_FILEIO =  DEBUG && true;       // saving and loading user files
const DEBUG_RESOURCEIO = DEBUG && false;  // files from the application directory
const DEBUG_NYI = DEBUG && true;          // stuff not yet implemented
const DEBUG_DATABASE = DEBUG &&  false;    // database access
const DEBUG_CAMERA = DEBUG && false;      // camera access
const DEBUG_AUDIO = DEBUG && true;           // audio interface
const _DEBUG_AUDIOMETER = DEBUG && false;    // volume feedback (used in webav.js)
const DEBUG_WRITE_ERRLOG = DEBUG && true;

/** @type {boolean | undefined} */
let hasCapturedErrors;

// Debugging the electron process:
// note to use a debugger use 'npm run debugMain' and load up chrome://inspect
// ============================================================================
// use one wrapper for debugging so we can turn it on and off at a
// central place
/** @param {...unknown} args */
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args); // eslint-disable-line no-console
    }
    
    if (DEBUG_WRITE_ERRLOG) {
    	if (!hasCapturedErrors) {
    		hasCapturedErrors = true;
    		
    		// install an error event handler to capture unhandled messages
    		window.addEventListener('error', function (e) {
			  	bridge.debugWriteLog(e);
			});
    	}
    	return bridge.debugWriteLog(args);
    }
    return true;
}
debugLog('electronClient debugLog enabled =======================');


// reload the projects if the database has been reloaded off disk.
bridge.onDatabaseRestored(function() {
    // same as homeGoBack - reload the projects
    window.location.href = 'index.html?back=yes';
});




class ElectronDesktopInterface {


    constructor () {
        /** @type {Record<string, HTMLAudioElement>} */
        this.currentAudio = {};
        /** @type {AudioCapture | null} */
        this.audioCaptureElement = null;
        /** @type {CameraPickerDialog | null} */
        this.cameraPickerDialog = null;
    }

    /** @param {string} json */
    async database_stmt(json) {
        return await bridge.database_stmt(json);

    }
    /** @param {string} json */
    async database_query(json) {
        if (DEBUG_DATABASE) debugLog('beginning database_query', json);
        let res = await bridge.database_query(json);
        if (DEBUG_DATABASE) debugLog('end database_query', res);
        return res;

    }

    async io_getsettings(){

        if (DEBUG_RESOURCEIO) debugLog('io_getsettings');
        let settings = await bridge.io_getsettings();
        return settings;


    }

    /** @param {string} file */
    async io_getmedia(file){

        if (DEBUG_FILEIO) debugLog('io_getmedia', file);
        return await bridge.io_getmedia(file);

    }

    /** @param {string} key @param {number} offset @param {number} length */
    async io_getmediadata(key, offset, length){

        if (DEBUG_FILEIO) debugLog('io_getmediadata', key, offset, length);
        return await bridge.io_getmediadata(key, offset, length);

    }

    /** @param {string} key */
    async io_getmediadone(key){

        if (DEBUG_FILEIO) debugLog('io_getmediadone', key);
        return await bridge.io_getmediadone(key);

    }
    /** @param {string} file @param {string} key */
    async io_getmedialen(file, key){

        if (DEBUG_FILEIO) debugLog('io_getmedialen', file, key);
        return await bridge.io_getmedialen(file, key);

    }

    /** @param {string} str @param {string} ext */
    async io_setmedia(str,  ext){
        if (DEBUG_FILEIO)  debugLog('io_setmedia', str, ext);
        return await bridge.io_setmedia(str, ext);

    }

    /** @param {string} str @param {string} name @param {string} ext */
    async io_setmedianame(str, name, ext){
        if (DEBUG_FILEIO) debugLog('io_setmedianame', name, ext);

        return await bridge.io_setmedianame(str, name, ext);
    }

    /** @param {string} str */
    async io_getmd5(str){
        if (DEBUG_FILEIO) debugLog('io_getmd5', str);
        return (str) ? await bridge.io_getmd5(str) : null;
    }


    /** @param {string} str */
    async io_remove(str){
        if (DEBUG_NYI)  debugLog('io_remove - NYI', str);
        return await bridge.io_remove(str);

    }

    /** @param {string} str */
    async io_cleanassets(str){
        if (DEBUG_NYI) {
            debugLog('io_cleanassets - NYI', str);
        }
        return await bridge.io_cleanassets(str);

    }


    /** @param {string} dir @param {string} name */
    async io_registersound(dir, name) {
        if (!this.currentAudio[name]) {
            let dataUri = await bridge.io_getAudioData(name);
            this.loadSoundFromDataURI(name, dataUri || '');

        }

    }

    /** @param {string} name @param {string} dataUri */
    loadSoundFromDataURI(name, dataUri) {
        if (dataUri && name) {
            let audio = new window.Audio(dataUri);
            audio.volume = 0.8;  // don't oversaturate the speakers
            audio.onended = function() {
                // we need to tell ScratchJR the sound is done
                // so that it will progress to the next block.
                const hostBridge = /** @type {any} */ (window).PlatformBridge || /** @type {any} */ (window).iOS;
                if (hostBridge) hostBridge.soundDone(name);
            };
            
            this.currentAudio[name] = audio;
        }
    }

    /** @param {string} str */
    async io_getfile(str){
        if (DEBUG_FILEIO) debugLog('io_getfile', str);

        // returns a file from the scratch jr documents folder
        return await bridge.io_getfile(str);

    }

    /** @param {string} filename */
    async io_gettextresource(filename){
        if (DEBUG_RESOURCEIO) debugLog('io_gettextresource', filename);

        // returns a file from the app resource folder
        return await bridge.io_gettextresource(filename);
    }




    /** @param {string} name @param {string} btoa_str */
    async io_setfile(name, btoa_str){
        if (DEBUG_FILEIO)  debugLog('io_setfile', name, btoa_str);

        return await bridge.io_setfile(name, btoa_str);
    }




    getAudioCaptureElement() {
        if (!this.audioCaptureElement) {
            this.audioCaptureElement = new AudioCapture();
            // this is mainly used for debugging purposes
            // so we can test when there is no microphone.
            /** @type {any} */ (this.audioCaptureElement).isRecordingPermitted = true;
             
        }
        return this.audioCaptureElement;
    }

    // sounds
    /** @param {string} name */
    io_playsound(name){
        if (DEBUG_AUDIO) debugLog('io_playsound', name);

		let audioElement = this.currentAudio[name];
        if (!audioElement) {
            debugLog('io_playsound: unable to play unregistered sound - skipping', name);
         
         	// tell scratch the empty sound has finished - otherwise
         	// the green blocks will not progress
         	setTimeout(function() {
         		const hostBridge = /** @type {any} */ (window).PlatformBridge || /** @type {any} */ (window).iOS;
         		if (hostBridge) hostBridge.soundDone(name);
         	}, 1);
         
            return;
        }

        //https://medium.com/@Jeff_Duke_io/working-with-html5-audio-in-electron-645b2d2202bd

        try {
            let playPromise = audioElement.play();

            // In browsers that don’t yet support this functionality,
            // playPromise won’t be defined.
            if (playPromise !== undefined) {
				  playPromise.then(
				  	function() {
					// Automatic playback started!
					}).catch(function(error) {
					// Automatic playback failed.
					// Show a UI element to let the user manually start playback.
					debugLog(error);
				  });
            }
        }  catch (e) {
            debugLog('could not play sound', e);
        }
    }


    /** @param {string} name */
    io_stopsound(name){
        if (DEBUG_AUDIO) debugLog('io_stopsound', name);

		let audioElement = this.currentAudio[name];
    
        if (audioElement) {
          audioElement.pause();  
        }
        
    }



    /** called when the record button is pressed*/
    recordsound_recordstart(){
        return this.getAudioCaptureElement().startRecord();
    }

    /** called when the stop button is pressed or the tickmark is pressed during the record operation*/
    recordsound_recordstop(){

        this.getAudioCaptureElement().stopRecord();

    }

    /** called during recording to display volume on the volume meter */
    recordsound_volume (){

        return this.getAudioCaptureElement().getVolume();

    }

    /** called when the tickmark is chosen in the record dialog @param {string} keep */
    recordsound_recordclose(keep) {

		try {
			let electronDesktopInterface =  this;

			let audioCaptureElement = this.getAudioCaptureElement();

			if (keep === 'YES') {

				let blob = audioCaptureElement.captureRecordingAsBlob();
				if (blob) {
					let filename = audioCaptureElement.getId();

					let fileReader = new FileReader();
					fileReader.onload = function () {
						// saving new sound...  will save as a webm file.
						electronDesktopInterface.io_setmedianame(/** @type {string} */ (fileReader.result), filename, 'webm');
						electronDesktopInterface.loadSoundFromDataURI(filename + '.webm', /** @type {string} */ (fileReader.result));
			
					};
					fileReader.readAsDataURL(blob);
				}

			}
        } catch (e) {
    		debugLog('Error saving sound', e);
        }

    }


    recordsound_startplay (){
        if (DEBUG_AUDIO) debugLog('recordsound_recordstart');
        this.getAudioCaptureElement().startPlay();



    }
    recordsound_stopplay(){
        if (DEBUG_AUDIO) debugLog('recordsound_stopplay');
        this.getAudioCaptureElement().stopPlay();

    }


    askForPermission(){
        if (DEBUG_AUDIO) debugLog('askForPermission', name);
        return true;
    }

    hideSplash(){
    	return true;
    }

    deviceName(){
        return 'desktop';
    }

    /** @param {string} category @param {string} action @param {string} usageLabel @param {number} value */
    analyticsEvent(category, action, usageLabel, value) {
        if (DEBUG_NYI) debugLog('Analytics Event!', category, action, usageLabel, value);
    }


    scratchjr_stopfeed() {
        if (DEBUG_CAMERA) debugLog('scratchjr_stopfeed NYI');
        if (this.cameraPickerDialog) {
            this.cameraPickerDialog.hide();
            this.cameraPickerDialog = null;

        }

    }
    /** @param {string} mode */
    scratchjr_choosecamera(mode) {
        if (DEBUG_CAMERA) debugLog('scratchjr_choosecamera NYI', mode);
    }

    /** @param {() => void} whenDone */
    scratchjr_captureimage(whenDone) {
        if (DEBUG_CAMERA) debugLog('scratchjr_captureimage NYI', whenDone);


        if (this.cameraPickerDialog) {
           let imgData =    this.cameraPickerDialog.snapshot();
           if (imgData) {
                let base64resultNoDataPrefix = imgData.split(',')[1];

                /** @type {any} */ (window).Camera.processimage(base64resultNoDataPrefix); // eslint-disable-line no-undef
           }


        }

    }

    /** @param {...unknown} args */
    scratchjr_cameracheck(...args) {
        if (DEBUG_CAMERA || DEBUG_NYI) debugLog('scratchjr_cameracheck', args);

        return true;
    }
    /** @param {string} str */
    scratchjr_startfeed(str) {
        if (DEBUG_CAMERA) debugLog('scratchjr_startfeed', str);
        let data = JSON.parse(str);

        if (!this.cameraPickerDialog) {

            this.cameraPickerDialog = new CameraPickerDialog(data);
            this.cameraPickerDialog.show();

        }




    }




} // class ElectronDesktopInterface










bridge.onKeyboardShortcut(function(action) {
  // The ESM bundle exposes ScratchJr/Undo/Home on window (globals.d.ts).
  // Undo.prevStep/nextStep normally receive real MouseEvents; shortcuts pass a
  // minimal stand-in since there is nothing to preventDefault here.
  var syntheticEvt = {
    preventDefault: function () {},
    stopPropagation: function () {},
    timeStamp: performance.now(),
    touches: undefined
  };
  switch (action) {
    case 'save':
      if (typeof ScratchJr !== 'undefined' && ScratchJr.saveProject) { // eslint-disable-line no-undef
        ScratchJr.saveProject(null, function() {}); // eslint-disable-line no-undef
      }
      break;
    case 'undo':
      if (typeof Undo !== 'undefined' && Undo.prevStep) { // eslint-disable-line no-undef
        Undo.prevStep(syntheticEvt); // eslint-disable-line no-undef
      }
      break;
    case 'redo':
      if (typeof Undo !== 'undefined' && Undo.nextStep) { // eslint-disable-line no-undef
        Undo.nextStep(syntheticEvt); // eslint-disable-line no-undef
      }
      break;
    case 'new':
      if (typeof Home !== 'undefined' && Home.createNewProject) { // eslint-disable-line no-undef
        Home.createNewProject(); // eslint-disable-line no-undef
      }
      break;
  }
});

/** @type {any} */ (window).tablet = new ElectronDesktopInterface();
