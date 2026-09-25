export interface SoundItem {
    name: string;
    label: string;
    category: 'animals' | 'instruments' | 'fx';
    iconSrc: string;
    icon?: HTMLImageElement;
}

const SOUND_ITEMS: SoundItem[] = [
    // Animals
    { name: 'cat.wav', label: 'Cat', category: 'animals', iconSrc: 'assets/blockicons/cat_icon.svg' },
    { name: 'dog.wav', label: 'Dog', category: 'animals', iconSrc: 'assets/blockicons/dog_icon.svg' },
    { name: 'bird.wav', label: 'Bird', category: 'animals', iconSrc: 'assets/blockicons/bird_icon.svg' },
    { name: 'frog.wav', label: 'Frog', category: 'animals', iconSrc: 'assets/blockicons/frog_icon.svg' },
    { name: 'cow.wav', label: 'Cow', category: 'animals', iconSrc: 'assets/blockicons/cow_icon.svg' },
    { name: 'duck.wav', label: 'Duck', category: 'animals', iconSrc: 'assets/blockicons/duck_icon.svg' },

    // Instruments
    { name: 'drum.wav', label: 'Drum', category: 'instruments', iconSrc: 'assets/blockicons/drum_icon.svg' },
    { name: 'piano.wav', label: 'Piano', category: 'instruments', iconSrc: 'assets/blockicons/piano_icon.svg' },
    { name: 'trumpet.wav', label: 'Trumpet', category: 'instruments', iconSrc: 'assets/blockicons/trumpet_icon.svg' },
    { name: 'bell.wav', label: 'Bell', category: 'instruments', iconSrc: 'assets/blockicons/bell_icon.svg' },
    { name: 'xylophone.wav', label: 'Xylophone', category: 'instruments', iconSrc: 'assets/blockicons/xylophone_icon.svg' },

    // Fun FX
    { name: 'boing.wav', label: 'Boing', category: 'fx', iconSrc: 'assets/blockicons/boing_icon.svg' },
    { name: 'splash.wav', label: 'Splash', category: 'fx', iconSrc: 'assets/blockicons/splash_icon.svg' },
    { name: 'magic.wav', label: 'Magic', category: 'fx', iconSrc: 'assets/blockicons/magic_icon.svg' },
    { name: 'carhorn.wav', label: 'Car Horn', category: 'fx', iconSrc: 'assets/blockicons/carhorn_icon.svg' },
    { name: 'cheer.wav', label: 'Cheer', category: 'fx', iconSrc: 'assets/blockicons/cheer_icon.svg' }
];

export default class SoundLib {
    static categories: Array<{ id: 'animals' | 'instruments' | 'fx'; label: string; icon: string }> = [
        { id: 'animals', label: 'Animals', icon: '🐾' },
        { id: 'instruments', label: 'Instruments', icon: '🎵' },
        { id: 'fx', label: 'Fun FX', icon: '✨' }
    ];

    private static soundMap = new Map<string, SoundItem>();
    private static initialized = false;

    static init () {
        if (SoundLib.initialized) return;
        SoundLib.soundMap.clear();
        for (const item of SOUND_ITEMS) {
            SoundLib.soundMap.set(item.name, item);
            if (typeof document !== 'undefined') {
                const img = document.createElement('img');
                img.src = item.iconSrc;
                item.icon = img;
            }
        }
        SoundLib.initialized = true;
    }

    static getAllSounds (): SoundItem[] {
        SoundLib.init();
        return SOUND_ITEMS;
    }

    static getSoundsByCategory (category: 'animals' | 'instruments' | 'fx'): SoundItem[] {
        SoundLib.init();
        return SOUND_ITEMS.filter((item) => item.category === category);
    }

    static getSoundItem (name: string): SoundItem | undefined {
        SoundLib.init();
        return SoundLib.soundMap.get(name);
    }

    static isLibrarySound (name: string): boolean {
        SoundLib.init();
        return SoundLib.soundMap.has(name);
    }

    static getIcon (name: string): HTMLImageElement | null {
        SoundLib.init();
        const item = SoundLib.soundMap.get(name);
        return item?.icon || null;
    }

    static getLabel (name: string): string {
        SoundLib.init();
        const item = SoundLib.soundMap.get(name);
        return item ? item.label : name;
    }
}
