const fs = require('fs');
const path = require('path');

const outDir = path.resolve('src/app/assets/blockicons');

// Base wrapper for standard 76x66 ScratchJr sound block icon
function wrapSvg(inner) {
    return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="76px" height="66px" viewBox="0 0 76 66">
${inner}
</svg>`;
}

const icons = {
    // Cat face with ears and whiskers
    cat_icon: `
    <!-- Head -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 23,28 L 19,16 L 31,22 C 34,21 42,21 45,22 L 57,16 L 53,28 C 60,35 60,46 51,52 C 45,56 31,56 25,52 C 16,46 16,35 23,28 Z" />
    <!-- Eyes -->
    <ellipse cx="31" cy="36" rx="3" ry="4" fill="#64A01F" />
    <ellipse cx="45" cy="36" rx="3" ry="4" fill="#64A01F" />
    <circle cx="32" cy="35" r="1.2" fill="#FFFFFF" />
    <circle cx="46" cy="35" r="1.2" fill="#FFFFFF" />
    <!-- Nose & mouth -->
    <polygon points="38,41 36,44 40,44" fill="#64A01F" />
    <path d="M 38,44 Q 35,48 32,46 M 38,44 Q 41,48 44,46" fill="none" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    <!-- Whiskers -->
    <line x1="16" y1="38" x2="26" y2="40" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    <line x1="16" y1="44" x2="26" y2="43" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    <line x1="60" y1="38" x2="50" y2="40" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    <line x1="60" y1="44" x2="50" y2="43" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    `,

    // Dog face with floppy ears
    dog_icon: `
    <!-- Floppy ears -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 22,24 C 14,24 12,38 18,46 C 22,50 26,46 25,36 Z" />
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 54,24 C 62,24 64,38 58,46 C 54,50 50,46 51,36 Z" />
    <!-- Head -->
    <ellipse cx="38" cy="36" rx="18" ry="16" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <!-- Snout -->
    <ellipse cx="38" cy="42" rx="10" ry="8" fill="#FFFFFF" stroke="#64A01F" stroke-width="2" />
    <!-- Big cute nose -->
    <path d="M 34,39 Q 38,37 42,39 Q 38,45 34,39 Z" fill="#64A01F" />
    <path d="M 38,43 L 38,47 M 35,46 Q 38,49 41,46" fill="none" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    <!-- Eyes -->
    <circle cx="31" cy="30" r="3" fill="#64A01F" />
    <circle cx="45" cy="30" r="3" fill="#64A01F" />
    <circle cx="32" cy="29" r="1" fill="#FFFFFF" />
    <circle cx="46" cy="29" r="1" fill="#FFFFFF" />
    `,

    // Bird singing
    bird_icon: `
    <!-- Body -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 22,38 C 22,25 35,20 44,22 C 52,24 56,32 54,42 C 50,50 36,52 26,48 C 20,44 14,46 12,48 C 14,43 18,39 22,38 Z" />
    <!-- Wing -->
    <path d="M 26,36 C 30,34 38,36 37,44 C 32,46 27,42 26,36 Z" fill="#FFFFFF" stroke="#64A01F" stroke-width="2" />
    <!-- Eye -->
    <circle cx="45" cy="27" r="2.5" fill="#64A01F" />
    <circle cx="46" cy="26.5" r="0.8" fill="#FFFFFF" />
    <!-- Open Beak singing -->
    <polygon points="53,28 62,25 54,32" fill="#64A01F" />
    <polygon points="54,33 60,36 53,36" fill="#64A01F" />
    <!-- Music note -->
    <path d="M 60,18 L 65,16 L 65,22 M 60,18 L 60,24" stroke="#64A01F" stroke-width="1.8" fill="none" />
    <circle cx="59" cy="24" r="2" fill="#64A01F" />
    <circle cx="64" cy="22" r="2" fill="#64A01F" />
    `,

    // Frog
    frog_icon: `
    <!-- Big eye bumps -->
    <circle cx="26" cy="24" r="8" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <circle cx="50" cy="24" r="8" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <circle cx="26" cy="24" r="3.5" fill="#64A01F" />
    <circle cx="50" cy="24" r="3.5" fill="#64A01F" />
    <circle cx="27" cy="23" r="1.2" fill="#FFFFFF" />
    <circle cx="51" cy="23" r="1.2" fill="#FFFFFF" />
    <!-- Frog face -->
    <ellipse cx="38" cy="38" rx="22" ry="14" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <!-- Wide happy smile -->
    <path d="M 22,37 Q 38,50 54,37" fill="none" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <!-- Nostrils -->
    <circle cx="35" cy="33" r="1" fill="#64A01F" />
    <circle cx="41" cy="33" r="1" fill="#64A01F" />
    `,

    // Cow
    cow_icon: `
    <!-- Horns -->
    <path d="M 22,22 Q 16,14 24,14" fill="none" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <path d="M 54,22 Q 60,14 52,14" fill="none" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <!-- Ears -->
    <ellipse cx="18" cy="27" rx="7" ry="4" transform="rotate(-20 18 27)" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    <ellipse cx="58" cy="27" rx="7" ry="4" transform="rotate(20 58 27)" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    <!-- Head -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3"
          d="M 24,20 L 52,20 C 54,28 54,34 50,40 L 26,40 C 22,34 22,28 24,20 Z" />
    <!-- Spot -->
    <path d="M 44,20 C 48,24 45,30 51,32 L 52,20 Z" fill="#64A01F" />
    <!-- Big snout -->
    <rect x="22" y="36" width="32" height="18" rx="9" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <ellipse cx="30" cy="45" rx="2.5" ry="3" fill="#64A01F" />
    <ellipse cx="46" cy="45" rx="2.5" ry="3" fill="#64A01F" />
    <!-- Eyes -->
    <circle cx="31" cy="29" r="2.5" fill="#64A01F" />
    <circle cx="45" cy="29" r="2.5" fill="#64A01F" />
    `,

    // Duck
    duck_icon: `
    <!-- Head and Body -->
    <circle cx="35" cy="26" r="12" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 24,34 C 18,36 14,46 22,52 C 34,56 48,54 54,46 C 58,40 54,34 44,34 Z" />
    <!-- Big Bill -->
    <path d="M 43,26 Q 59,26 56,33 Q 45,36 43,32 Z" fill="#64A01F" />
    <!-- Eye -->
    <circle cx="38" cy="24" r="2.5" fill="#64A01F" />
    <circle cx="39" cy="23" r="0.8" fill="#FFFFFF" />
    `,

    // Drum
    drum_icon: `
    <!-- Drum Sticks -->
    <line x1="20" y1="12" x2="35" y2="25" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <circle cx="20" cy="12" r="3" fill="#64A01F" />
    <line x1="56" y1="12" x2="41" y2="25" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <circle cx="56" cy="12" r="3" fill="#64A01F" />
    <!-- Drum Body -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3"
          d="M 16,28 L 16,46 C 16,53 60,53 60,46 L 60,28 Z" />
    <!-- Drum Head -->
    <ellipse cx="38" cy="28" rx="22" ry="7" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <!-- Rim zigzag lines -->
    <path d="M 16,29 L 27,49 L 38,29 L 49,49 L 60,29" fill="none" stroke="#64A01F" stroke-width="2" />
    `,

    // Piano keys
    piano_icon: `
    <!-- Piano body outline -->
    <rect x="14" y="16" width="48" height="36" rx="4" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <!-- White keys dividers -->
    <line x1="22" y1="16" x2="22" y2="52" stroke="#64A01F" stroke-width="2" />
    <line x1="30" y1="16" x2="30" y2="52" stroke="#64A01F" stroke-width="2" />
    <line x1="38" y1="16" x2="38" y2="52" stroke="#64A01F" stroke-width="2" />
    <line x1="46" y1="16" x2="46" y2="52" stroke="#64A01F" stroke-width="2" />
    <line x1="54" y1="16" x2="54" y2="52" stroke="#64A01F" stroke-width="2" />
    <!-- Black keys -->
    <rect x="19" y="16" width="6" height="22" fill="#64A01F" rx="1" />
    <rect x="27" y="16" width="6" height="22" fill="#64A01F" rx="1" />
    <rect x="43" y="16" width="6" height="22" fill="#64A01F" rx="1" />
    <rect x="51" y="16" width="6" height="22" fill="#64A01F" rx="1" />
    `,

    // Trumpet
    trumpet_icon: `
    <!-- Bell Flare -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 52,22 L 62,14 L 62,50 L 52,42 Z" />
    <!-- Main Tubes -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3"
          d="M 16,36 L 20,36 L 20,32 L 52,32 L 52,36 L 24,36 L 24,40 L 52,40 L 52,32" />
    <!-- Mouthpiece -->
    <polygon points="12,34 16,36 16,38 12,40" fill="#64A01F" />
    <!-- Valves -->
    <rect x="30" y="22" width="3" height="10" fill="#64A01F" />
    <circle cx="31.5" cy="21" r="2" fill="#64A01F" />
    <rect x="36" y="22" width="3" height="10" fill="#64A01F" />
    <circle cx="37.5" cy="21" r="2" fill="#64A01F" />
    <rect x="42" y="22" width="3" height="10" fill="#64A01F" />
    <circle cx="43.5" cy="21" r="2" fill="#64A01F" />
    <!-- Sound waves -->
    <path d="M 64,24 Q 69,32 64,40" fill="none" stroke="#64A01F" stroke-width="2.5" stroke-linecap="round" />
    `,

    // Bell
    bell_icon: `
    <!-- Top ring -->
    <path d="M 34,16 A 4,4 0 0,1 42,16" fill="none" stroke="#64A01F" stroke-width="3" />
    <!-- Bell body -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 38,16 C 30,16 26,26 25,38 C 24,45 18,48 18,48 L 58,48 C 58,48 52,45 51,38 C 50,26 46,16 38,16 Z" />
    <!-- Clapper (bottom ball) -->
    <circle cx="38" cy="52" r="4.5" fill="#64A01F" />
    <!-- Shimmer waves -->
    <path d="M 14,28 Q 10,36 14,44" fill="none" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    <path d="M 62,28 Q 66,36 62,44" fill="none" stroke="#64A01F" stroke-width="2" stroke-linecap="round" />
    `,

    // Xylophone
    xylophone_icon: `
    <!-- Mallet -->
    <line x1="22" y1="14" x2="48" y2="30" stroke="#64A01F" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="22" cy="14" r="4.5" fill="#64A01F" />
    <!-- Slanted bars from large to small -->
    <rect x="16" y="26" width="7" height="30" rx="2" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    <rect x="26" y="30" width="7" height="26" rx="2" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    <rect x="36" y="34" width="7" height="22" rx="2" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    <rect x="46" y="38" width="7" height="18" rx="2" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    <rect x="56" y="42" width="7" height="14" rx="2" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    `,

    // Boing spring
    boing_icon: `
    <!-- Spring coil -->
    <path fill="none" stroke="#64A01F" stroke-width="3.5" stroke-linecap="round"
          d="M 28,14 Q 48,16 48,22 Q 28,26 28,32 Q 48,36 48,42 Q 28,46 28,52 L 44,52" />
    <!-- Upward arrow -->
    <path d="M 38,8 L 30,16 L 46,16 Z" fill="#64A01F" />
    `,

    // Splash water
    splash_icon: `
    <!-- Central droplet -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3"
          d="M 38,14 C 38,14 47,28 47,35 C 47,41 43,46 38,46 C 33,46 29,41 29,35 C 29,28 38,14 38,14 Z" />
    <!-- Side splashes -->
    <circle cx="20" cy="30" r="3.5" fill="#64A01F" />
    <circle cx="56" cy="30" r="3.5" fill="#64A01F" />
    <circle cx="16" cy="42" r="2.5" fill="#64A01F" />
    <circle cx="60" cy="42" r="2.5" fill="#64A01F" />
    <ellipse cx="38" cy="52" rx="18" ry="4" fill="none" stroke="#64A01F" stroke-width="2.5" />
    `,

    // Magic wand & stars
    magic_icon: `
    <!-- Wand -->
    <line x1="20" y1="52" x2="48" y2="24" stroke="#64A01F" stroke-width="4" stroke-linecap="round" />
    <line x1="42" y1="30" x2="48" y2="24" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" />
    <!-- Big star at tip -->
    <polygon points="52,14 54,20 60,22 54,24 52,30 50,24 44,22 50,20" fill="#64A01F" />
    <!-- Smaller sparkle stars -->
    <polygon points="32,16 33,19 36,20 33,21 32,24 31,21 28,20 31,19" fill="#64A01F" />
    <polygon points="56,36 57,38 60,39 57,40 56,42 55,40 52,39 55,38" fill="#64A01F" />
    `,

    // Car horn
    carhorn_icon: `
    <!-- Squeeze bulb -->
    <ellipse cx="22" cy="33" rx="8" ry="11" fill="#FFFFFF" stroke="#64A01F" stroke-width="3" />
    <!-- Horn tube and bell -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 30,31 L 46,31 L 58,20 L 58,46 L 46,35 L 30,35 Z" />
    <!-- Beep waves -->
    <path d="M 61,24 Q 66,33 61,42" fill="none" stroke="#64A01F" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 66,20 Q 72,33 66,46" fill="none" stroke="#64A01F" stroke-width="2.5" stroke-linecap="round" />
    `,

    // Cheer / applause
    cheer_icon: `
    <!-- Two clapping hands -->
    <path fill="#FFFFFF" stroke="#64A01F" stroke-width="3" stroke-linejoin="round"
          d="M 26,48 L 34,36 C 36,33 40,34 38,38 L 34,44 L 42,34 C 44,31 48,32 46,36 L 40,44 L 46,38 C 48,35 52,37 50,40 L 38,54 Z" />
    <!-- Confetti / applause bursts -->
    <line x1="22" y1="24" x2="16" y2="18" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <line x1="38" y1="20" x2="38" y2="12" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <line x1="54" y1="24" x2="60" y2="18" stroke="#64A01F" stroke-width="3" stroke-linecap="round" />
    <circle cx="28" cy="18" r="2" fill="#64A01F" />
    <circle cx="48" cy="18" r="2" fill="#64A01F" />
    `,

    // Add sound library button in palette (musical note + plus badge)
    addsound: `
    <!-- Big musical eighth note -->
    <path d="M 30,36 L 30,18 L 48,14 L 48,32 M 30,23 L 48,19" fill="none" stroke="#64A01F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
    <ellipse cx="26" cy="38" rx="6" ry="4.5" fill="#64A01F" transform="rotate(-15 26 38)" />
    <ellipse cx="44" cy="34" rx="6" ry="4.5" fill="#64A01F" transform="rotate(-15 44 34)" />
    <!-- Tactile Plus badge in bottom corner -->
    <circle cx="53" cy="49" r="9" fill="#FFFFFF" stroke="#64A01F" stroke-width="2.5" />
    <line x1="53" y1="44" x2="53" y2="54" stroke="#64A01F" stroke-width="2.5" stroke-linecap="round" />
    <line x1="48" y1="49" x2="58" y2="49" stroke="#64A01F" stroke-width="2.5" stroke-linecap="round" />
    `
};

console.log('Writing block icons into', outDir);
for (const [name, content] of Object.entries(icons)) {
    const file = path.join(outDir, `${name}.svg`);
    fs.writeFileSync(file, wrapSvg(content.trim()));
    console.log(`- Created ${file}`);
}
console.log('Block icons generation complete.');
