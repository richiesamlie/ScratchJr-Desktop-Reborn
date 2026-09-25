const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve('scratch/raw_animals');
fs.mkdirSync(targetDir, { recursive: true });

const items = [
    { name: 'dog.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Barking_of_a_dog_2.ogg' },
    { name: 'bird.mp3', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Bird_chirp_2_%28Gravity_Sound%29.mp3' },
    { name: 'cow.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Single_Cow_Moo.ogg' },
    { name: 'frog.oga', url: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Single_Frog_Croak.oga' },
    { name: 'duck.wav', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Domestic_duck_sound_01.wav' }
];

for (const item of items) {
    const dest = path.join(targetDir, item.name);
    console.log(`Downloading ${item.name}...`);
    execSync(`curl.exe -s -L -H "User-Agent: Mozilla/5.0" "${item.url}" -o "${dest}"`);
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    console.log(`Saved ${item.name} (${size} bytes)`);
}

console.log('All downloads completed.');
