export interface SjrFont {
    id: string;
    name: string;
    fontFamily: string;
    category: 'sans' | 'rounded' | 'serif' | 'dyslexic';
}

export const CURATED_FONTS: SjrFont[] = [
    {
        id: 'roboto',
        name: 'Roboto',
        fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        category: 'sans'
    },
    {
        id: 'verdana',
        name: 'Verdana',
        fontFamily: 'Verdana, Geneva, sans-serif',
        category: 'sans'
    },
    {
        id: 'playful',
        name: 'Playful',
        fontFamily: '"Comic Neue", "Comic Sans MS", "Chalkboard SE", "Comic Sans", cursive, sans-serif',
        category: 'rounded'
    },
    {
        id: 'storybook',
        name: 'Storybook',
        fontFamily: 'Georgia, "Times New Roman", serif',
        category: 'serif'
    },
    {
        id: 'easyread',
        name: 'Easy Read',
        fontFamily: 'OpenDyslexic, Lexend, Andika, "Trebuchet MS", sans-serif',
        category: 'dyslexic'
    }
];

export function getFontById(id: string): SjrFont {
    const found = CURATED_FONTS.find((f) => f.id === id);
    return found || CURATED_FONTS[0];
}

export function getFontFamilyById(id: string): string {
    return getFontById(id).fontFamily;
}

export function getDefaultFont(): SjrFont {
    return CURATED_FONTS[0];
}
