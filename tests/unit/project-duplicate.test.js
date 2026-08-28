// @vitest-environment jsdom
import './renderer-harness.js';
import { describe, it, expect, beforeEach } from 'vitest';
import Home from '../../src/app/src/lobby/Home';
import { gn } from '../../src/app/src/utils/lib';
import { stubMedia } from './helpers/editor-fixtures.js';

describe('Project Duplication & Lobby Quick Controls', () => {
    let scrollarea;

    beforeEach(() => {
        stubMedia();
        document.body.innerHTML = '<div id="htmlcontents"><div class="inner"><div id="scrollarea" class="scrollarea"></div></div></div>';
        scrollarea = gn('scrollarea');
    });

    it('generates unique project names correctly for new and duplicated projects', () => {
        // Empty scrollarea -> Project 1
        expect(Home.getNextName('Project')).toBe('Project 1');

        // Add "Project 1"
        const p1 = document.createElement('div');
        p1.className = 'projectthumb';
        p1.id = '1';
        p1.innerHTML = '<div class="aproject"></div><div class="projecttitle"><h4>Project 1</h4></div>';
        scrollarea.appendChild(p1);

        // Next new project -> Project 2
        expect(Home.getNextName('Project')).toBe('Project 2');

        // Duplicate "Project 1" -> Project 1 (Copy)
        expect(Home.getNextName('Project 1 (Copy)')).toBe('Project 1 (Copy)');

        // Add "Project 1 (Copy)"
        const p1Copy = document.createElement('div');
        p1Copy.className = 'projectthumb';
        p1Copy.id = '2';
        p1Copy.innerHTML = '<div class="aproject"></div><div class="projecttitle"><h4>Project 1 (Copy)</h4></div>';
        scrollarea.appendChild(p1Copy);

        // Next duplicate -> Project 1 (Copy) 2
        expect(Home.getNextName('Project 1 (Copy)')).toBe('Project 1 (Copy) 2');
    });

    it('creates project thumbnail DOM with close and duplicate buttons', () => {
        const rawData = {
            id: '42',
            name: 'Cat Story',
            thumbnail: JSON.stringify({ md5: 'sample.png', pagecount: 1 }),
            isgift: '0'
        };

        Home.addProjectLink(scrollarea, rawData);

        const thumb = scrollarea.querySelector('#\\34 2') || scrollarea.querySelector('.projectthumb');
        expect(thumb).toBeDefined();
        expect(thumb.querySelector('.closex')).not.toBeNull();
        expect(thumb.querySelector('.duplicatebtn')).not.toBeNull();
        expect(thumb.querySelector('.projecttitle h4').textContent).toBe('Cat Story');
    });

    it('identifies action type based on clicked element in getAction only when controls are shown', () => {
        const thumb = document.createElement('div');
        thumb.id = '99';
        thumb.className = 'projectthumb';
        const closex = document.createElement('div');
        closex.className = 'closex';
        closex.style.visibility = 'hidden';
        const dup = document.createElement('div');
        dup.className = 'duplicatebtn';
        dup.style.visibility = 'hidden';
        thumb.appendChild(closex);
        thumb.appendChild(dup);
        scrollarea.appendChild(thumb);

        Home.actionTarget = thumb;

        // When hidden, clicking closex or dup is safe and defaults to 'project'
        expect(Home.getAction({ target: closex })).toBe('project');
        expect(Home.getAction({ target: dup })).toBe('project');

        // Once shown after 500ms hold, clicks are recognized
        closex.style.visibility = 'visible';
        dup.style.visibility = 'visible';
        expect(Home.getAction({ target: closex })).toBe('delete');
        expect(Home.getAction({ target: dup })).toBe('duplicate');
        expect(Home.getAction({ target: thumb })).toBe('project');
    });

    it('toggles visibility of controls with showProjectControls and hideProjectControls', () => {
        const thumb = document.createElement('div');
        thumb.className = 'projectthumb';
        const closex = document.createElement('div');
        closex.className = 'closex';
        closex.style.visibility = 'hidden';
        const dup = document.createElement('div');
        dup.className = 'duplicatebtn';
        dup.style.visibility = 'hidden';
        thumb.appendChild(closex);
        thumb.appendChild(dup);

        Home.showProjectControls(thumb);
        expect(closex.style.visibility).toBe('visible');
        expect(dup.style.visibility).toBe('visible');

        Home.hideProjectControls(thumb);
        expect(closex.style.visibility).toBe('hidden');
        expect(dup.style.visibility).toBe('hidden');
    });
});
