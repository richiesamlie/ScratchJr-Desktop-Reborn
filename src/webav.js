// Host-agnostic web-AV classes shared by every host: AudioCapture (mic
// recording via MediaRecorder + volume meter), VideoCapture and
// CameraPickerDialog (getUserMedia camera feed + canvas snapshot).
//
// Extracted verbatim from electronClient.js (which used to define them
// inline); no bridge, Electron, or Android dependencies allowed in here.
// Loaded as a classic script BEFORE hostClient.js by every root page; the
// classes land on the global scope for electronClient.js (desktop) and
// webhost.js (Android shim) to use.

/* eslint-disable no-unused-vars */
/* global AudioCapture, VideoCapture, CameraPickerDialog */

/* eslint-disable no-console */
/** @param {...unknown} args */
function avlog(...args) {
    try {
        console.log('[webav]', ...args); // eslint-disable-line no-console
    } catch (e) { /* logging must never break AV flows */ }
}
class AudioCapture {
    constructor () {
        this.audioCtx = new (window.AudioContext || webkitAudioContext)(); // eslint-disable-line no-undef
        this.audioElement = new window.Audio();
        this.audioPlaybackElement = /** @type {HTMLAudioElement | null} */ (null);
        this.errorHandler = /** @type {((e: unknown) => void) | null} */ (null);
        /** @type {boolean} */ this.isRecordingPermitted = false;
        /** @type {boolean} */ this.isDisconnected = false;
        /** @type {any} */ this.id = undefined;
        /** @type {any} */ this.chunks = undefined;
        /** @type {MediaStream | null} */ this.currentStream = null;
        /** @type {MediaRecorder | null} */ this.mediaRecorder = null;
        /** @type {Blob | null} */ this.savedBlob = null;
        /** @type {any} */ this.audioProcessor = null;
        /** @type {MediaStreamAudioSourceNode | null} */ this.mediaStreamSource = null;
        /** @type {number} */ this.recordStartTime = 0;
        /** @type {number} */ this.recordDuration = 0;
    }

    /** @param {boolean} [isNewRecording] */
    getId (isNewRecording) {

        if (isNewRecording || !this.id) {
            // uuid generator
            this.id =  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

        }
        return this.id;
    }
    /** @param {MediaStreamConstraints} [constraints] */
    startRecord(constraints) {
        this.savedBlob = null;
        this.recordStartTime = Date.now();
        this.recordDuration = 0;

        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(function() {});
        }

        constraints = constraints || { audio: true };
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints).then(
                                this.beginStartRecord.bind(this),
                                this.onError.bind(this));
        }
        return this.getId(/*isNewRecording*/ true) + '.webm';
    }

    /** @param {MediaStream} stream */
    beginStartRecord(stream) {
        if ((/** @type {any} */ (this)).isRecordingPermitted === false) {
            throw (new Error('Recording audio is turned off'));
        }
        this.chunks = null;
        this.currentStream = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = this.onRecordData.bind(this);
        this.mediaRecorder.start();

    }

    /** @param {unknown} e */
    onError(e) {
        avlog('audio capture error:', e);
        if (this.errorHandler) {
            this.errorHandler(e);
        }

    }

    /** @param {BlobEvent} e */
    onRecordData (e) {
        if (!this.chunks) {
            this.chunks = [];
        }
        this.chunks.push(e.data);


    }

    captureRecordingAsBlob() {
        if (this.savedBlob) return this.savedBlob;

        try {
            if (!this.chunks || this.chunks.length == 0) {
                if (this.mediaRecorder && this.mediaRecorder.state != 'inactive') {
                    this.mediaRecorder.requestData();
                }
            }

            if (!this.chunks) return null;

            let blob  = new Blob(this.chunks, { type: 'audio/ogg; codecs=opus' });
            this.chunks = [];

            this.audioElement.srcObject = this.currentStream;

            this.savedBlob = blob;
            return this.savedBlob;

        } catch (e) {
            avlog('ERROR saving audio.', e);
            this.savedBlob = null;
            return null;
        }

    }
    stopRecord() {

        if (this.recordStartTime) {
            this.recordDuration = Math.max(0.5, (Date.now() - this.recordStartTime) / 1000);
            this.recordStartTime = 0;
        }

        this.stopAudioMeter();

        if (this.currentStream) {
            var tracks = this.currentStream.getTracks();
            for (var i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
        }
        if (this.mediaRecorder) {
            this.mediaRecorder.requestData();
            this.mediaRecorder.stop();
        }
        this.mediaRecorder = null;
        this.currentStream = null;

    }

    stopPlay() {
        if (this.audioPlaybackElement) {
            this.audioPlaybackElement.pause();
            this.audioPlaybackElement = null;
        }
    }
    startPlay() {
        // stop the recording
        if (this.mediaRecorder) {
            this.stopRecord();
        }

        let blob = this.captureRecordingAsBlob();

        if (blob) {
            let fileReader = new FileReader();
            fileReader.onload = () => {
                const capture = this;
                capture.audioPlaybackElement = new Audio(/** @type {string} */ (fileReader.result));
                capture.audioPlaybackElement.volume = 0.8; // don't oversaturate speakers;
                capture.tryPlayAudio(capture.audioPlaybackElement);
            };
            fileReader.readAsDataURL(blob);
        }

        return this.recordDuration || 1;
    }
    /** @param {HTMLAudioElement} audioElement */
    tryPlayAudio(audioElement) {
        try {
            let playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.then(function(){}).catch(function(error) {}); // eslint-disable-line no-unused-vars
            }
        } catch (e) {
            avlog('could not play sound', e);
        }
    }
    getVolume() {

        // https://github.com/cwilso/volume-meter/blob/master/volume-meter.js

        if (/** @type {any} */ (this).isDisconnected) return 0;

        if (!this.audioProcessor && this.currentStream) {
            this.startAudioMeter();
        }

        if (this.audioProcessor) {
            return this.audioProcessor.volume;
        }
        return 0;
    }



    /**
     * starts processing audio stream for mic volume
     * https://github.com/cwilso/volume-meter/blob/master/volume-meter.js
     * @param {number} [clipLevel]
     * @param {number} [averaging]
     * @param {number} [clipLag]
     */
    startAudioMeter(clipLevel, averaging, clipLag) {

        if (!this.currentStream) {
            return; // no stream to monitor.
        }
        if (!this.audioCtx || this.audioCtx.state === 'closed') {
            this.audioCtx = new (window.AudioContext || webkitAudioContext)(); // eslint-disable-line no-undef
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(function() {});
        }
        let audioContext = this.audioCtx;
        if (!this.mediaStreamSource) {
            this.mediaStreamSource = this.audioCtx.createMediaStreamSource(this.currentStream);
        }

        if (!this.audioProcessor) {

            // "It is recommended for authors to not specify this buffer size and allow the implementation to pick a good
            // buffer size to balance between latency and audio quality."
            // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
            let processor = audioContext.createScriptProcessor((typeof AudioContext != 'undefined' ? undefined : 512), 1, 1);
            processor.onaudioprocess = this.processVolume.bind(this);
            processor.clipping = false;
            /** @type {any} */ (processor).lastClip = 0;
            /** @type {any} */ (processor).volume = 0;
            /** @type {any} */ (processor).clipLevel = clipLevel || 0.98;
            /** @type {any} */ (processor).averaging = averaging || 0.95;
            /** @type {any} */ (processor).clipLag = clipLag || 750;

            // this will have no effect, since we don't copy the input to the output,
            // but works around a current Chrome bug.
            processor.connect(audioContext.destination);

            processor.checkClipping = function() {

                if (!processor.clipping) {
                    return false;
                }
                if ((/** @type {any} */ (processor).lastClip + /** @type {any} */ (processor).clipLag) < window.performance.now()) {
                    processor.clipping = false;
                }
                return processor.clipping;
            };

            processor.shutdown = function(){
                processor.disconnect();
                processor.onaudioprocess = null;
            };

            this.audioProcessor = processor;
            this.mediaStreamSource.connect(this.audioProcessor);
        }


    }
    stopAudioMeter() {
        if (this.audioProcessor) {
            if (this.audioProcessor.shutdown) this.audioProcessor.shutdown();
            if (this.mediaStreamSource) this.mediaStreamSource.disconnect(this.audioProcessor);
            this.audioProcessor = null;
        }

        this.mediaStreamSource = null;
    }


    /** Process volume using root mean square.
        @param {object} event from audioContext.createScriptProcessor.onaudioprocess
        @this {AudioProcessor} audioProcessor
    */
    /** @param {AudioProcessingEvent} event */
    processVolume(event) {

        let buf = event.inputBuffer.getChannelData(0);
        let bufLength = buf.length;
        let sum = 0;
        let x;

        // Average out the absolute values
        for (var i = 0; i < bufLength; i++) {
            x = buf[i];
            sum += Math.abs(x);
        }

        // ... then take the square root of the sum.
        let avg =  Math.sqrt(sum / bufLength);

        // divide by .5 because the max value seems to be around .5...
        // this needs to be improved as it is not accurate, but it's enough to show
        // a bit of a microphone level.
        this.audioProcessor.volume =  avg / 0.5;
    }

} // AudioCapture

/** @class VideoCapture

This class opens a video stream using the webcam.
*/

class VideoCapture {
    /** @param {HTMLVideoElement} [videoElement] */
    constructor (videoElement) {
        // https://www.html5rocks.com/en/tutorials/getusermedia/intro/
        this.videoElement = videoElement || document.createElement('video');
        this.errorHandler = /** @type {((e: unknown) => void) | null} */ (null);
    }


    getId() {

        if (!this.id) {
            // uuid generator
            this.id =  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });

        }
        return this.id;
    }
    /** @param {MediaStreamConstraints} [constraints] */
    startRecord(constraints) {
        constraints = constraints || { video: true, audio: false };
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var self = this;
            navigator.mediaDevices.getUserMedia(constraints).then(
                this.beginStartRecord.bind(this)
            ).catch(function(err) {
                avlog('getUserMedia with specific constraints failed, attempting fallback { video: true }:', err);
                if (constraints && constraints.video && typeof constraints.video === 'object') {
                    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(
                        self.beginStartRecord.bind(self)
                    ).catch(self.onError.bind(self));
                } else {
                    self.onError(err);
                }
            });
        }
        return this.getId() + '.webm';
    }

    stopRecord() {
        try {
            if (this.currentStream) {

                let audioTracks = this.currentStream.getAudioTracks();
                if (audioTracks) {
                    for (let i = 0; i < audioTracks.length; i++) {
                        audioTracks[i].stop();
                    }
                }
                let videoTracks = this.currentStream.getVideoTracks();
                if (videoTracks) {
                    for (let i = 0; i < videoTracks.length; i++) {
                        videoTracks[i].stop();
                    }
                }
                this.videoElement.pause();

                this.videoElement.src = /** @type {any} */ (null);

            }
        } catch (e) {
            avlog('could not close webcam');
        }
    }

    /** @param {MediaStream} stream */
    beginStartRecord(stream) {
        this.videoElement.srcObject = stream;
        this.currentStream = stream;

        if ((/** @type {any} */ (this)).isRecordingPermitted === false) {
            this.stopRecord();
            throw new Error('Recording video is not permitted.');
        }


    }

    /** @param {unknown} e */
    onError(e) {
        avlog(e);
        if (!this.inOnError) {
            try {
                this.inOnError = true;
                this.stopRecord();
            } finally {
                this.inOnError = false;
            }

        }

        if (this.errorHandler) {
            this.errorHandler(e);
        }
    }


    /** takes a picture of the current video feed and returns a data: url in png format */
    /** @param {{x:number,y:number,width:number,height:number}} cameraRect @param {boolean} isMirrored */
    snapshot(cameraRect, isMirrored) {

        if (!this.currentStream ||     /** @type {any} */ (this).isRecordingPermitted === false) return null;

        // make a canvas to draw the current video frame to
        let canvas = document.createElement('canvas');

        // make the canvas the same size as the videoElement.
        let w = cameraRect.width;//this.videoElement.clientWidth;
        let h = cameraRect.height; //this.videoElement.clientHeight;

        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';


        // draw the video to the canvas, then convert to an image.
        let ctx = canvas.getContext('2d');

        if (ctx) {
            if (isMirrored) {
                // mirror the context so that the image draws reversed too
                ctx.translate(w, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(this.videoElement, 0, 0, cameraRect.width, cameraRect.height);
        }

        let data =  canvas.toDataURL('image/png');
        return data;

    }

}

class CameraPickerDialog {

    /** @param {any} data */
    constructor(data) {
        this.shapeData = data;
        this.isMirrored = true;
    }

    show() {
        if (!this.cameraPickerDiv) {
            const frameEl = document.getElementById('frame') || document.querySelector('.frame');
            const frameRect = frameEl && typeof frameEl.getBoundingClientRect === 'function'
                ? frameEl.getBoundingClientRect()
                : { left: 0, top: 0 };
            const scale = (typeof window !== 'undefined' && /** @type {any} */ (window).ScratchJr && typeof /** @type {any} */ (window).ScratchJr.getUiScale === 'function')
                ? /** @type {any} */ (window).ScratchJr.getUiScale()
                : (typeof window !== 'undefined' && /** @type {any} */ (window).getUiScale ? /** @type {any} */ (window).getUiScale() : 1.0);

            this.cameraPickerDiv = document.createElement('div');
            this.cameraPickerDiv.id = 'cameraPickerDiv';
            this.cameraPickerDiv.style.position = 'absolute';
            this.cameraPickerDiv.style.top = (frameRect.top || 0) + 'px';
            this.cameraPickerDiv.style.left = (frameRect.left || 0) + 'px';
            if (scale && scale !== 1.0) {
                this.cameraPickerDiv.style.transform = 'scale(' + scale + ')';
                this.cameraPickerDiv.style.transformOrigin = '0 0';
            }
            this.cameraPickerDiv.style.zIndex = '90000';
            this.cameraPickerDiv.style.pointerEvents = 'none';

            this.cameraPickerDiv.innerHTML = '';
            var video = document.createElement('video');
            video.id = 'CameraPickerDialog-cameraFeed';
            video.style.pointerEvents = 'none';
            video.style.objectFit = 'cover';
            if (this.isMirrored) {
                video.style.transform = 'scaleX(-1)';
            }
            video.autoplay = true;
            video.playsInline = true;
            this.cameraPickerDiv.appendChild(video);
            var img = document.createElement('img');
            img.id = 'CameraPickerDialog-maskImg';
            img.style.pointerEvents = 'none';
            img.src = this.shapeData.image;
            this.cameraPickerDiv.appendChild(img);

            var bd = document.getElementById('backdrop');
            if (bd) {
                bd.appendChild(this.cameraPickerDiv);
            }

            this.videoElement = document.getElementById('CameraPickerDialog-cameraFeed');
            this.maskImg = document.getElementById('CameraPickerDialog-maskImg');

            this.layoutDiv(/** @type {HTMLElement} */ (this.videoElement), this.shapeData.x, this.shapeData.y, this.shapeData.width, this.shapeData.height);
            this.layoutDiv(/** @type {HTMLElement} */ (this.maskImg), this.shapeData.mx, this.shapeData.my, this.shapeData.mw, this.shapeData.mh);

            this.videoCaptureElement = new VideoCapture(/** @type {HTMLVideoElement} */ (this.videoElement));
            /** @type {any} */ (this.videoCaptureElement).isRecordingPermitted = true;
            this.videoCaptureElement.startRecord({
                video: {
                    width: { ideal: Math.max(640, this.shapeData.width || 0) },
                    height: { ideal: Math.max(480, this.shapeData.height || 0) }
                }
            });
        }
    }

    /** @param {HTMLElement} el @param {number} x @param {number} y @param {number} w @param {number} h */
    layoutDiv(el, x, y, w, h) {
        try {
            el.style.position = 'absolute';
            el.style.top = y + 'px';
            el.style.left = x + 'px';
            if (w) {
                el.style.width = w + 'px';
            }
            if (h) {
                el.style.height = h + 'px';
            }
        } catch (e) {
            avlog('Cannot layout element', el, e);
        }
    }

    snapshot() {
        if (!this.videoCaptureElement) {
            avlog('snapshot: no active video feed');
            return null;
        }

        let cameraRect = {
            x: 0,
            y: 0,
            width: this.shapeData.width || (this.videoElement ? this.videoElement.clientWidth : 320),
            height: this.shapeData.height || (this.videoElement ? this.videoElement.clientHeight : 240)
        };
        return this.videoCaptureElement.snapshot(cameraRect, this.isMirrored);
    }

    hide() {
        if (this.videoCaptureElement) {
            try {
                this.videoCaptureElement.stopRecord();
            } catch (e) {
                avlog('stopRecord error', e);
            }
            this.videoCaptureElement = null;
        }
        if (this.cameraPickerDiv) {
            try {
                /** @type {HTMLDivElement} */ (this.cameraPickerDiv).remove();
            } catch (e) {
                avlog('remove cameraPickerDiv error', e);
            }
            this.cameraPickerDiv = null;
            this.videoElement = null;
        }
    }
} // CameraPickerDialog
