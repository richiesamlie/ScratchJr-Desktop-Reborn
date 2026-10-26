// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Home from '../../src/app/src/lobby/Home';
import UI from '../../src/app/src/editor/ui/UI';
import Project from '../../src/app/src/editor/ui/Project';
import { gn } from '../../src/app/src/utils/lib';
import { stubMedia } from './helpers/editor-fixtures.js';

describe('Sketchboard & Sticker-Book UI/UX Overhaul', () => {
    let htmlcontents;
    let inner;
    let scrollarea;

    beforeEach(() => {
        stubMedia();
        document.body.innerHTML = '<div id="htmlcontents"><div class="inner"><div id="scrollarea" class="scrollarea"></div></div></div>';
        htmlcontents = gn('htmlcontents');
        inner = htmlcontents.querySelector('.inner');
        scrollarea = gn('scrollarea');
        Home.searchQuery = '';
        Home.sortMode = 'recent';
        Home.cachedProjects = [];
    });

    describe('Lobby Toolbar & Hierarchy Invariants', () => {
        it('mounts #lobby-toolbar in .inner before #scrollarea (TRAP 1 prevention)', () => {
            const toolbar = Home.createLobbyToolbar(inner);
            expect(toolbar).not.toBeNull();
            expect(toolbar.id).toBe('lobby-toolbar');
            expect(toolbar.className).toBe('lobby-toolbar');

            // Must be sibling of scrollarea inside .inner, positioned before scrollarea
            expect(toolbar.parentElement).toBe(inner);
            expect(scrollarea.parentElement).toBe(inner);
            expect(toolbar.nextElementSibling).toBe(scrollarea);

            // Must contain search input, clear button, and sort toggle button
            expect(toolbar.querySelector('#lobby-search-input')).not.toBeNull();
            expect(toolbar.querySelector('#lobby-sort-btn')).not.toBeNull();
        });

        it('ensures Home.getNextName completely ignores #lobby-toolbar elements', () => {
            Home.createLobbyToolbar(inner);
            Home.emptyProjectThumbnail(scrollarea);
            Home.openProjectThumbnail(scrollarea);

            // getNextName inspects scrollarea, never toolbar
            expect(Home.getNextName('Project')).toBe('Project 1');

            // Add Project 1 to scrollarea
            const p1 = document.createElement('div');
            p1.className = 'projectthumb';
            p1.id = '1';
            p1.innerHTML = '<div class="aproject"></div><div class="projecttitle"><h4>Project 1</h4></div>';
            scrollarea.appendChild(p1);

            expect(Home.getNextName('Project')).toBe('Project 2');
        });

        it('bypasses lobby touch panning when interacting with toolbar inputs (TRAP 2 prevention)', () => {
            Home.createLobbyToolbar(inner);
            const searchInput = gn('lobby-search-input');

            // Simulate touch event on search input
            const touchEvent = {
                target: searchInput,
                touches: [{ pageX: 100, pageY: 100 }],
                preventDefault: vi.fn(),
                stopPropagation: vi.fn()
            };

            Home.handleTouchStart(touchEvent);
            // Touches on input should bypass drag tracking
            expect(Home.actionTarget).toBeNull();
        });
    });

    describe('Lobby Search Filtering', () => {
        beforeEach(() => {
            Home.emptyProjectThumbnail(scrollarea);
            Home.openProjectThumbnail(scrollarea);

            const projects = [
                { id: '10', name: 'Jumping Frog' },
                { id: '20', name: 'Space Rocket' },
                { id: '30', name: 'Frog Prince' }
            ];

            projects.forEach((p) => {
                const el = document.createElement('div');
                el.className = 'projectthumb';
                el.id = p.id;
                el.innerHTML = `<div class="aproject"></div><div class="projecttitle"><h4>${p.name}</h4></div>`;
                scrollarea.appendChild(el);
            });
        });

        it('filters projects case-insensitively and keeps empty/open project cards visible', () => {
            Home.searchQuery = 'frog';
            Home.filterVisibleCards();

            const p10 = scrollarea.querySelector('#\\31 0');
            const p20 = scrollarea.querySelector('#\\32 0');
            const p30 = scrollarea.querySelector('#\\33 0');
            const emptyCard = scrollarea.querySelector('#newproject');
            const openCard = scrollarea.querySelector('#openproject');

            expect(p10.style.display).not.toBe('none');
            expect(p30.style.display).not.toBe('none');
            expect(p20.style.display).toBe('none');

            // Empty & open project cards must always remain visible
            expect(emptyCard.style.display).not.toBe('none');
            expect(openCard.style.display).not.toBe('none');
        });

        it('restores all project cards when search query is cleared', () => {
            Home.searchQuery = 'rocket';
            Home.filterVisibleCards();
            expect(scrollarea.querySelector('#\\31 0').style.display).toBe('none');
            expect(scrollarea.querySelector('#\\32 0').style.display).not.toBe('none');

            Home.searchQuery = '';
            Home.filterVisibleCards();
            expect(scrollarea.querySelector('#\\31 0').style.display).not.toBe('none');
            expect(scrollarea.querySelector('#\\32 0').style.display).not.toBe('none');
            expect(scrollarea.querySelector('#\\33 0').style.display).not.toBe('none');
        });
    });

    describe('Lobby Sort Modes', () => {
        beforeEach(() => {
            Home.emptyProjectThumbnail(scrollarea);
            Home.openProjectThumbnail(scrollarea);

            Home.cachedProjects = [
                { id: '1', name: 'Zebra Safari', thumbnail: JSON.stringify({ md5: 'z.png', pagecount: 1 }) },
                { id: '2', name: 'Apple Orchard', thumbnail: JSON.stringify({ md5: 'a.png', pagecount: 1 }) },
                { id: '3', name: 'Moon Landing', thumbnail: JSON.stringify({ md5: 'm.png', pagecount: 1 }) }
            ];

            Home.cachedProjects.forEach((p) => {
                Home.addProjectLink(scrollarea, p);
            });
        });

        it('toggles sort mode between recent and alpha', () => {
            Home.createLobbyToolbar(inner);
            expect(Home.sortMode).toBe('recent');

            Home.toggleSort();
            expect(Home.sortMode).toBe('alpha');

            Home.toggleSort();
            expect(Home.sortMode).toBe('recent');
        });

        it('sorts projects alphabetically by title while retaining special cards at the start', () => {
            Home.sortMode = 'alpha';
            Home.sortAndRenderCards();

            const thumbs = Array.from(scrollarea.children);
            expect(thumbs[0].id).toBe('newproject');
            expect(thumbs[1].id).toBe('openproject');

            // Alphabetical order: Apple Orchard (2), Moon Landing (3), Zebra Safari (1)
            expect(thumbs[2].id).toBe('2');
            expect(thumbs[3].id).toBe('3');
            expect(thumbs[4].id).toBe('1');
        });

        it('restores original recent/database order when switching back to recent', () => {
            Home.sortMode = 'alpha';
            Home.sortAndRenderCards();

            Home.sortMode = 'recent';
            Home.sortAndRenderCards();

            const thumbs = Array.from(scrollarea.children);
            expect(thumbs[0].id).toBe('newproject');
            expect(thumbs[1].id).toBe('openproject');

            // Original order: Zebra Safari (1), Apple Orchard (2), Moon Landing (3)
            expect(thumbs[2].id).toBe('1');
            expect(thumbs[3].id).toBe('2');
            expect(thumbs[4].id).toBe('3');
        });
    });

    describe('Tactile Sticker Card Features (Scene Badge & Project Menu)', () => {
        it('renders unclamped scene count in .scene-badge and mounts .projectmenu button', () => {
            const rawData = {
                id: '55',
                name: 'Mega Story',
                thumbnail: JSON.stringify({ md5: 'ms.png', pagecount: 7 }),
                isgift: '0'
            };

            Home.addProjectLink(scrollarea, rawData);

            const card = scrollarea.querySelector('#\\35 5');
            expect(card).not.toBeNull();

            const badge = card.querySelector('.scene-badge');
            expect(badge).not.toBeNull();
            expect(badge.textContent).toBe('7');
            expect(badge.title).toBe('7 pages');

            const menuBtn = card.querySelector('.projectmenu');
            expect(menuBtn).not.toBeNull();
            expect(menuBtn.getAttribute('aria-label')).toBe('Project options');
        });

        it('routes .projectmenu clicks to "menu" action and toggles controls safely (TRAP 3 prevention)', () => {
            const rawData = {
                id: '56',
                name: 'Playful Journey',
                thumbnail: JSON.stringify({ md5: 'pj.png', pagecount: 2 }),
                isgift: '0'
            };

            Home.addProjectLink(scrollarea, rawData);
            const card = scrollarea.querySelector('#\\35 6');
            const menuBtn = card.querySelector('.projectmenu');
            const closex = card.querySelector('.closex');
            const dup = card.querySelector('.duplicatebtn');
            const exportBtn = card.querySelector('.exportbtn');

            Home.actionTarget = card;

            // Clicking projectmenu returns 'menu'
            expect(Home.getAction({ target: menuBtn })).toBe('menu');

            // Initially, project management controls are hidden (not visible)
            expect(closex.style.visibility).not.toBe('visible');
            expect(dup.style.visibility).not.toBe('visible');
            expect(exportBtn.style.visibility).not.toBe('visible');

            // Performing 'menu' action toggles controls visible
            Home.performAction({ target: menuBtn, preventDefault: () => {}, stopPropagation: () => {} });
            expect(closex.style.visibility).toBe('visible');
            expect(dup.style.visibility).toBe('visible');
            expect(exportBtn.style.visibility).toBe('visible');

            // Performing 'menu' action again toggles controls hidden
            Home.performAction({ target: menuBtn, preventDefault: () => {}, stopPropagation: () => {} });
            expect(closex.style.visibility).toBe('hidden');
            expect(dup.style.visibility).toBe('hidden');
            expect(exportBtn.style.visibility).toBe('hidden');
        });
    });

    describe('Editor Sketchboard Project Name Badge', () => {
        let editorContainer;

        beforeEach(() => {
            editorContainer = document.createElement('div');
            document.body.appendChild(editorContainer);
        });

        it('mounts #editor-project-badge in leftPanel and updates via UI.updateProjectBadge', () => {
            Project.metadata = { name: 'Awesome Animation' };
            const lp = UI.leftPanel(editorContainer);
            expect(lp).not.toBeNull();

            const badge = gn('editor-project-badge');
            expect(badge).not.toBeNull();
            expect(badge.textContent).toBe('Awesome Animation');

            // Update badge dynamically
            UI.updateProjectBadge('Revised Adventure');
            expect(badge.textContent).toBe('Revised Adventure');
            expect(badge.title).toBe('Revised Adventure');

            // Clearing badge
            UI.updateProjectBadge('');
            expect(badge.textContent).toBe('');
            expect(badge.title).toBe('');
        });
    });
});
