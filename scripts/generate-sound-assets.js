// Generates clean 44.1kHz 16-bit PCM WAV audio files for ScratchJr sound library
const fs = require('fs');
const path = require('path');

function createWavBuffer(sampleRate, samples) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = samples.length * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // fmt subchunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
    buffer.writeUInt16LE(1, 20);  // audioFormat (1 for PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    // data subchunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < samples.length; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
        buffer.writeInt16LE(Math.floor(val), 44 + i * 2);
    }

    return buffer;
}

const sampleRate = 44100;

// Synthesis routines
const synth = {
    // Cat meow: rising then falling pitch with formant vocal harmonics
    cat: () => {
        const duration = 0.85;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        let phase = 0;
        for (let i = 0; i < total; i++) {
            const t = i / sampleRate;
            const progress = i / total;
            // Pitch contour: 380Hz -> 650Hz -> 420Hz
            const freq = progress < 0.4 
                ? 380 + (650 - 380) * (progress / 0.4) 
                : 650 - (650 - 420) * ((progress - 0.4) / 0.6);
            phase += 2 * Math.PI * freq / sampleRate;
            // Vocal harmonics ("m-e-o-w")
            const env = Math.sin(Math.PI * Math.pow(progress, 0.7));
            const harmonic2 = Math.sin(2 * phase) * 0.45;
            const harmonic3 = Math.sin(3 * phase) * 0.25;
            const harmonic4 = Math.sin(4 * phase) * 0.15;
            const vibrato = Math.sin(2 * Math.PI * 5 * t) * 0.05;
            samples[i] = (Math.sin(phase) + harmonic2 + harmonic3 + harmonic4) * env * 0.6 * (1 + vibrato);
        }
        return samples;
    },

    // Dog bark: two punchy, resonant acoustic barks
    dog: () => {
        const duration = 0.65;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        
        function bark(startSec, lenSec) {
            const startIdx = Math.floor(startSec * sampleRate);
            const count = Math.floor(lenSec * sampleRate);
            let phase = 0;
            for (let i = 0; i < count && (startIdx + i) < total; i++) {
                const prog = i / count;
                const env = Math.pow(1 - prog, 1.8) * Math.sin(Math.PI * Math.min(1, prog * 6));
                const freq = 280 - 120 * prog;
                phase += 2 * Math.PI * freq / sampleRate;
                const noise = (Math.random() * 2 - 1) * 0.2;
                samples[startIdx + i] += (Math.sin(phase) + 0.4 * Math.sin(2 * phase) + noise) * env * 0.7;
            }
        }
        bark(0.0, 0.25);
        bark(0.3, 0.3);
        return samples;
    },

    // Bird chirp: joyful ascending two-note trill
    bird: () => {
        const duration = 0.6;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        let phase = 0;
        for (let i = 0; i < total; i++) {
            const progress = i / total;
            const t = i / sampleRate;
            let freq;
            let env = 0;
            if (progress < 0.45) {
                const p = progress / 0.45;
                freq = 2400 + Math.sin(p * Math.PI * 4) * 400 + p * 600;
                env = Math.sin(Math.PI * p);
            } else if (progress > 0.55) {
                const p = (progress - 0.55) / 0.45;
                freq = 3000 + Math.sin(p * Math.PI * 6) * 500 + (1 - p) * 400;
                env = Math.sin(Math.PI * p);
            }
            phase += 2 * Math.PI * freq / sampleRate;
            samples[i] = Math.sin(phase) * env * 0.5;
        }
        return samples;
    },

    // Frog ribbit: deep guttural resonant pulse train
    frog: () => {
        const duration = 0.8;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        for (let i = 0; i < total; i++) {
            const prog = i / total;
            const env = Math.sin(Math.PI * prog);
            const t = i / sampleRate;
            // 25Hz pulse modulating a 180Hz / 360Hz resonant formant
            const pulse = (Math.sin(2 * Math.PI * 28 * t) > 0 ? 1 : 0.2);
            const carrier = Math.sin(2 * Math.PI * 190 * t) + 0.5 * Math.sin(2 * Math.PI * 380 * t);
            samples[i] = carrier * pulse * env * 0.6;
        }
        return samples;
    },

    // Cow moo: rich low resonant cello-like acoustic moo
    cow: () => {
        const duration = 1.1;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        let phase = 0;
        for (let i = 0; i < total; i++) {
            const prog = i / total;
            const env = Math.sin(Math.PI * Math.pow(prog, 0.6));
            // Slight pitch drop: 130Hz -> 110Hz
            const freq = 130 - 20 * prog;
            phase += 2 * Math.PI * freq / sampleRate;
            const h2 = Math.sin(2 * phase) * 0.5;
            const h3 = Math.sin(3 * phase) * 0.35;
            const h4 = Math.sin(4 * phase) * 0.2;
            samples[i] = (Math.sin(phase) + h2 + h3 + h4) * env * 0.6;
        }
        return samples;
    },

    // Duck quack: nasal resonant double quack
    duck: () => {
        const duration = 0.7;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        function quack(startSec, lenSec) {
            const startIdx = Math.floor(startSec * sampleRate);
            const count = Math.floor(lenSec * sampleRate);
            let phase = 0;
            for (let i = 0; i < count && (startIdx + i) < total; i++) {
                const p = i / count;
                const env = Math.sin(Math.PI * p);
                const freq = 450 - 120 * p;
                phase += 2 * Math.PI * freq / sampleRate;
                // Strong 3rd and 5th odd harmonics for nasal "quack"
                const nasal = Math.sin(phase) + 0.7 * Math.sin(3 * phase) + 0.4 * Math.sin(5 * phase);
                samples[startIdx + i] += nasal * env * 0.45;
            }
        }
        quack(0.0, 0.3);
        quack(0.35, 0.3);
        return samples;
    },

    // Drum beat: punchy acoustic kick & snappy snare rim
    drum: () => {
        const duration = 0.55;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        let phase = 0;
        for (let i = 0; i < total; i++) {
            const t = i / sampleRate;
            const kickEnv = Math.exp(-t * 14);
            const kickFreq = 160 * Math.exp(-t * 30) + 45;
            phase += 2 * Math.PI * kickFreq / sampleRate;
            const kick = Math.sin(phase) * kickEnv;
            // Snappy noise rim
            const snareEnv = Math.exp(-t * 22);
            const noise = (Math.random() * 2 - 1) * snareEnv * 0.4;
            samples[i] = (kick * 0.7 + noise) * 0.8;
        }
        return samples;
    },

    // Piano chime: warm triad arpeggio (C5 - E5 - G5)
    piano: () => {
        const duration = 1.0;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
            const startSec = idx * 0.12;
            const startIdx = Math.floor(startSec * sampleRate);
            let phase = 0;
            for (let i = 0; i < (total - startIdx); i++) {
                const t = i / sampleRate;
                const env = Math.exp(-t * 4);
                phase += 2 * Math.PI * freq / sampleRate;
                const tone = Math.sin(phase) + 0.3 * Math.sin(2 * phase) + 0.1 * Math.sin(3 * phase);
                samples[startIdx + i] += tone * env * 0.28;
            }
        });
        return samples;
    },

    // Trumpet fanfare: bright brassy two-note call
    trumpet: () => {
        const duration = 0.9;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        const notes = [
            { freq: 440, start: 0.0, len: 0.25 },  // A4
            { freq: 587.33, start: 0.28, len: 0.58 } // D5
        ];
        notes.forEach(({ freq, start, len }) => {
            const startIdx = Math.floor(start * sampleRate);
            const count = Math.floor(len * sampleRate);
            let phase = 0;
            for (let i = 0; i < count && (startIdx + i) < total; i++) {
                const p = i / count;
                const env = Math.min(p * 8, 1) * Math.min((1 - p) * 6, 1);
                phase += 2 * Math.PI * freq / sampleRate;
                // Rich brass harmonics
                const brass = Math.sin(phase) + 0.6 * Math.sin(2 * phase) + 0.4 * Math.sin(3 * phase) + 0.25 * Math.sin(4 * phase);
                samples[startIdx + i] += brass * env * 0.35;
            }
        });
        return samples;
    },

    // Bell ring: pure crystal chime with long warm shimmer
    bell: () => {
        const duration = 1.2;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        const partials = [
            { f: 1046.5, a: 0.5, d: 2.5 },  // Fundamental C6
            { f: 2093.0, a: 0.25, d: 3.5 }, // Octave
            { f: 2793.8, a: 0.15, d: 5.0 }, // 4th
            { f: 3322.4, a: 0.1, d: 6.0 }   // Shimmer
        ];
        for (let i = 0; i < total; i++) {
            const t = i / sampleRate;
            let sum = 0;
            for (const { f, a, d } of partials) {
                sum += Math.sin(2 * Math.PI * f * t) * a * Math.exp(-t * d);
            }
            samples[i] = sum * 0.7;
        }
        return samples;
    },

    // Xylophone: wooden mallet strike with bright marimba overtone
    xylophone: () => {
        const duration = 0.85;
        const total = Math.floor(sampleRate * duration);
        const samples = new Float32Array(total);
        const notes = [659.25, 783.99, 987.77]; // E5, G5, B5
        notes.forEach((freq, idx) => {
            const startSec = idx * 0.14;
            const startIdx = Math.floor(startSec * sampleRate);
            for (let i = 0; i < (total - startIdx); i++) {
                const t = i / sampleRate;
                const env = Math.exp(-t * 9);
                const click = (i < 40 ? (Math.random() * 2 - 1) * 0.3 : 0);
                const bar = Math.sin(2 * Math.PI * freq * t) + 0.2 * Math.sin(2 * Math.PI * 3 * freq * t);
                samples[startIdx + i] += (bar + click) * env * 0.35;
            }
        });
        return samples;
    }
};

const soundsDir = path.resolve('src/app/sounds');
console.log('Generating synthesized library sounds into', soundsDir);

for (const [name, fn] of Object.entries(synth)) {
    const raw = fn();
    const wav = createWavBuffer(sampleRate, raw);
    const dest = path.join(soundsDir, `${name}.wav`);
    fs.writeFileSync(dest, wav);
    console.log(`- Created ${dest} (${wav.length} bytes)`);
}

// Copy the existing rich verified sounds for fx
const samplesDir = path.resolve('src/app/samples');
const fxCopies = [
    { src: 'AnimalRace_horn.wav', dest: 'carhorn.wav' },
    { src: 'Dance_magic.wav', dest: 'magic.wav' },
    { src: 'Dance_celebrate.wav', dest: 'cheer.wav' }
];

for (const { src, dest } of fxCopies) {
    const srcFile = path.join(samplesDir, src);
    const destFile = path.join(soundsDir, dest);
    fs.copyFileSync(srcFile, destFile);
    console.log(`- Copied ${src} -> ${destFile}`);
}

console.log('Audio asset generation complete.');
