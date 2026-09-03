// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect } from 'vitest';
import LibraryEx from '../../src/app/src/editor/ui/LibraryEx';

describe('Media Library Categorization & Search (LibraryEx)', () => {
    it('provides category lists for costumes and backgrounds', () => {
        const costumeCats = LibraryEx.getCategories('costumes');
        expect(costumeCats.length).toBeGreaterThan(3);
        expect(costumeCats[0].id).toBe('all');
        expect(costumeCats.map(c => c.id)).toContain('animals');
        expect(costumeCats.map(c => c.id)).toContain('people');

        const bkgCats = LibraryEx.getCategories('backgrounds');
        expect(bkgCats.length).toBeGreaterThan(2);
        expect(bkgCats[0].id).toBe('all');
        expect(bkgCats.map(c => c.id)).toContain('indoors');
        expect(bkgCats.map(c => c.id)).toContain('city');
    });

    it('classifies costume items correctly based on tags and order', () => {
        const catItem = { name: 'Cat', order: 'characters,03 animals', tags: ['characters', '03 animals'] };
        expect(LibraryEx.getItemCategory(catItem, 'costumes')).toBe('animals');

        const kidItem = { name: 'Child', order: 'characters,01 family', tags: ['characters', '01 family'] };
        expect(LibraryEx.getItemCategory(kidItem, 'costumes')).toBe('people');

        const dragonItem = { name: 'Dragon', order: 'characters,04 magic', tags: ['characters', '04 magic'] };
        expect(LibraryEx.getItemCategory(dragonItem, 'costumes')).toBe('fantasy');

        const treeItem = { name: 'Oak Tree', order: 'characters,06 plants', tags: ['characters', '06 plants'] };
        expect(LibraryEx.getItemCategory(treeItem, 'costumes')).toBe('plants');

        const sunItem = { name: 'Sun', order: 'characters,07 weather', tags: ['characters', '07 weather'] };
        expect(LibraryEx.getItemCategory(sunItem, 'costumes')).toBe('nature');
    });

    it('classifies background items correctly', () => {
        expect(LibraryEx.getItemCategory({ name: 'Bedroom' }, 'backgrounds')).toBe('indoors');
        expect(LibraryEx.getItemCategory({ name: 'Classroom' }, 'backgrounds')).toBe('indoors');
        expect(LibraryEx.getItemCategory({ name: 'City' }, 'backgrounds')).toBe('city');
        expect(LibraryEx.getItemCategory({ name: 'Park' }, 'backgrounds')).toBe('city');
        expect(LibraryEx.getItemCategory({ name: 'Underwater' }, 'backgrounds')).toBe('space_water');
        expect(LibraryEx.getItemCategory({ name: 'Space' }, 'backgrounds')).toBe('space_water');
        expect(LibraryEx.getItemCategory({ name: 'Jungle' }, 'backgrounds')).toBe('nature');
    });

    it('filters items by category', () => {
        const items = [
            { name: 'Cat', order: 'characters,03 animals', tags: ['03 animals'] },
            { name: 'Dog', order: 'characters,03 animals', tags: ['03 animals'] },
            { name: 'Mom', order: 'characters,01 family', tags: ['01 family'] },
            { name: 'Wizard', order: 'characters,04 magic', tags: ['04 magic'] }
        ];

        const allItems = LibraryEx.filterAssets(items, 'costumes', 'all', '');
        expect(allItems.length).toBe(4);

        const animalItems = LibraryEx.filterAssets(items, 'costumes', 'animals', '');
        expect(animalItems.length).toBe(2);
        expect(animalItems.map(i => i.name)).toEqual(['Cat', 'Dog']);

        const peopleItems = LibraryEx.filterAssets(items, 'costumes', 'people', '');
        expect(peopleItems.length).toBe(1);
        expect(peopleItems[0].name).toBe('Mom');
    });

    it('filters items by real-time keyword search and relevance', () => {
        const items = [
            { name: 'Cat', order: 'characters,03 animals', tags: ['feline', 'pet'] },
            { name: 'Caterpillar', order: 'characters,03 animals', tags: ['bug', 'insect'] },
            { name: 'Dog', order: 'characters,03 animals', tags: ['canine', 'pet'] },
            { name: 'Bobcat', order: 'characters,03 animals', tags: ['wild'] }
        ];

        const results = LibraryEx.filterAssets(items, 'costumes', 'all', 'cat');
        expect(results.length).toBe(3);
        expect(results[0].name).toBe('Cat');
        expect(results[1].name).toBe('Caterpillar');
        expect(results[2].name).toBe('Bobcat');

        const petResults = LibraryEx.filterAssets(items, 'costumes', 'all', 'pet');
        expect(petResults.length).toBe(2);
        expect(petResults.map(i => i.name)).toContain('Cat');
        expect(petResults.map(i => i.name)).toContain('Dog');

        const emptyResults = LibraryEx.filterAssets(items, 'costumes', 'all', 'spaceship');
        expect(emptyResults.length).toBe(0);
    });

    it('combines category filter and keyword search simultaneously', () => {
        const items = [
            { name: 'Cat', order: 'characters,03 animals', tags: ['pet'] },
            { name: 'Dog', order: 'characters,03 animals', tags: ['pet'] },
            { name: 'Cat Costume Kid', order: 'characters,01 family', tags: ['people', 'pet'] }
        ];

        const animalCats = LibraryEx.filterAssets(items, 'costumes', 'animals', 'cat');
        expect(animalCats.length).toBe(1);
        expect(animalCats[0].name).toBe('Cat');
    });
});
