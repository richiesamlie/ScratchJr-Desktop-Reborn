const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rawDir = path.resolve('scratch/raw_animals');
const outDir = path.resolve('src/app/sounds');

console.log('Processing natural animal sounds into', outDir);

// 1. Cat: real Siamese cat meow (1.5s total)
console.log('Processing cat.wav...');
execSync(`ffmpeg -y -i "${path.join(rawDir, 'cat.wav')}" -af "volume=1.2,afade=t=in:ss=0:d=0.03,afade=t=out:st=1.3:d=0.2" -ar 44100 -ac 1 "${path.join(outDir, 'cat.wav')}"`);

// 2. Bird: real bird chirp
console.log('Processing bird.wav...');
execSync(`ffmpeg -y -i "${path.join(rawDir, 'bird.mp3')}" -af "volume=1.3,afade=t=in:ss=0:d=0.02,afade=t=out:st=0.85:d=0.15" -ar 44100 -ac 1 "${path.join(outDir, 'bird.wav')}"`);

// 3. Dog: real dog bark (take first 1.3s of clean bark)
console.log('Processing dog.wav...');
execSync(`ffmpeg -y -ss 0.1 -i "${path.join(rawDir, 'dog.ogg')}" -t 1.2 -af "volume=1.4,afade=t=in:ss=0:d=0.02,afade=t=out:st=1.0:d=0.2" -ar 44100 -ac 1 "${path.join(outDir, 'dog.wav')}"`);

// 4. Cow: real cow moo (2.0s of warm acoustic moo)
console.log('Processing cow.wav...');
execSync(`ffmpeg -y -ss 0.1 -i "${path.join(rawDir, 'cow.ogg')}" -t 2.0 -af "volume=1.5,afade=t=in:ss=0:d=0.05,afade=t=out:st=1.7:d=0.3" -ar 44100 -ac 1 "${path.join(outDir, 'cow.wav')}"`);

// 5. Frog: real natural frog croak (1.3s)
console.log('Processing frog.wav...');
execSync(`ffmpeg -y -ss 0.2 -i "${path.join(rawDir, 'frog.oga')}" -t 1.4 -af "volume=1.6,afade=t=in:ss=0:d=0.03,afade=t=out:st=1.1:d=0.3" -ar 44100 -ac 1 "${path.join(outDir, 'frog.wav')}"`);

// 6. Duck: real domestic duck quack (take 1.5s quack)
console.log('Processing duck.wav...');
execSync(`ffmpeg -y -ss 0.5 -i "${path.join(rawDir, 'duck.wav')}" -t 1.4 -af "volume=1.4,afade=t=in:ss=0:d=0.03,afade=t=out:st=1.1:d=0.3" -ar 44100 -ac 1 "${path.join(outDir, 'duck.wav')}"`);

console.log('\n--- Resulting files in src/app/sounds ---');
for (const animal of ['cat', 'dog', 'bird', 'cow', 'frog', 'duck']) {
    const f = path.join(outDir, `${animal}.wav`);
    const size = fs.statSync(f).size;
    const dur = execSync(`ffprobe -i "${f}" -show_entries format=duration -v quiet -of csv=p=0`).toString().trim();
    console.log(`- ${animal}.wav: ${size} bytes, ${dur} sec`);
}

console.log('Natural audio processing complete.');
