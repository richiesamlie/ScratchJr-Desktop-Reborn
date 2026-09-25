import ScratchJr from '../ScratchJr';
import Palette from './Palette';
import Undo from './Undo';
import SoundLib, { type SoundItem } from '../../utils/SoundLib';
import ScratchAudio from '../../utils/ScratchAudio';
import PlatformBridge from '../../platform/PlatformBridge';
import { getModelRefAs } from '../modelRegistry';
import type Sprite from '../engine/Sprite';
import type Page from '../engine/Page';
import { frame, gn, newHTML, setProps } from '../../utils/lib';

let dialogOpen = false;
let currentCategory: 'animals' | 'instruments' | 'fx' = 'animals';
let selectedSoundName: string | null = null;
let modalEl: HTMLElement | null = null;
let cardsGridEl: HTMLElement | null = null;
let tabButtons: Map<string, HTMLElement> = new Map();

export default class SoundPicker {
    static get dialogOpen () {
        return dialogOpen;
    }

    static init () {
        if (gn('soundpicker')) return;
        const parent = (frame?.parentNode || document.body) as HTMLElement;
        const modal = newHTML('div', 'soundpicker fade', parent);
        modal.setAttribute('id', 'soundpicker');
        modalEl = modal;

        // Toolbar
        const topbar = newHTML('div', 'soundpicker-topbar', modal);

        // Cancel button (left)
        const cancelBtn = newHTML('div', 'soundpicker-btn soundpicker-cancel', topbar);
        cancelBtn.setAttribute('title', 'Cancel');
        cancelBtn.onmousedown = (e) => { e.preventDefault(); SoundPicker.close(); };
        cancelBtn.ontouchend = (e) => { e.preventDefault(); SoundPicker.close(); };

        // Category Tabs (middle)
        const tabsContainer = newHTML('div', 'soundpicker-tabs', topbar);
        tabButtons.clear();
        for (const cat of SoundLib.categories) {
            const tab = newHTML('div', `soundpicker-tab ${cat.id === currentCategory ? 'active' : ''}`, tabsContainer);
            tab.textContent = `${cat.icon} ${cat.label}`;
            tab.setAttribute('data-cat', cat.id);
            const catId = cat.id;
            tab.onmousedown = (e) => { e.preventDefault(); SoundPicker.switchCategory(catId); };
            tab.ontouchend = (e) => { e.preventDefault(); SoundPicker.switchCategory(catId); };
            tabButtons.set(cat.id, tab);
        }

        // Done button (right)
        const okBtn = newHTML('div', 'soundpicker-btn soundpicker-ok', topbar);
        okBtn.setAttribute('title', 'Add to palette');
        okBtn.onmousedown = (e) => { e.preventDefault(); SoundPicker.confirmAndAdd(); };
        okBtn.ontouchend = (e) => { e.preventDefault(); SoundPicker.confirmAndAdd(); };

        // Grid Container
        const grid = newHTML('div', 'soundpicker-grid', modal);
        grid.setAttribute('id', 'soundpicker-grid');
        cardsGridEl = grid;
    }

    static open () {
        if (dialogOpen) return;
        if (!modalEl || !gn('soundpicker')) {
            SoundPicker.init();
        }

        const bd = gn('backdrop');
        if (bd) {
            bd.setAttribute('class', 'modal-backdrop fade in');
            setProps(bd.style, { display: 'block' });
            bd.onmousedown = SoundPicker.close;
            bd.ontouchend = (e: TouchEvent) => {
                e.preventDefault();
                SoundPicker.close();
            };
        }

        if (modalEl) {
            modalEl.setAttribute('class', 'soundpicker fade in');
            modalEl.onmousedown = (e: MouseEvent) => { e.stopPropagation(); };
            modalEl.ontouchend = (e: TouchEvent) => { e.stopPropagation(); };
        }

        ScratchJr.stopStrips();
        dialogOpen = true;
        ScratchJr.onBackButtonCallback.push(SoundPicker.close);

        // Select first available sound by default
        SoundPicker.renderGrid();
    }

    static close () {
        if (!dialogOpen) return;
        const bd = gn('backdrop');
        if (bd) {
            bd.setAttribute('class', 'modal-backdrop fade');
            setProps(bd.style, { display: 'none' });
            bd.onmousedown = null;
            bd.ontouchend = null;
        }

        if (modalEl) {
            modalEl.setAttribute('class', 'soundpicker fade');
        }

        dialogOpen = false;
        const idx = ScratchJr.onBackButtonCallback.indexOf(SoundPicker.close);
        if (idx > -1) {
            ScratchJr.onBackButtonCallback.splice(idx, 1);
        }
    }

    static switchCategory (catId: 'animals' | 'instruments' | 'fx') {
        currentCategory = catId;
        ScratchAudio.sndFX('tap.wav');
        for (const [id, btn] of tabButtons) {
            if (id === catId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
        SoundPicker.renderGrid();
    }

    static renderGrid () {
        if (!cardsGridEl) return;
        while (cardsGridEl.firstChild) {
            cardsGridEl.removeChild(cardsGridEl.firstChild);
        }

        const sounds = SoundLib.getSoundsByCategory(currentCategory);
        if (sounds.length > 0 && (!selectedSoundName || !SoundLib.getSoundItem(selectedSoundName) || SoundLib.getSoundItem(selectedSoundName)?.category !== currentCategory)) {
            selectedSoundName = sounds[0].name;
        }

        for (const item of sounds) {
            const card = newHTML('div', `soundpicker-card ${item.name === selectedSoundName ? 'selected' : ''}`, cardsGridEl);
            card.setAttribute('data-sound', item.name);

            // Icon thumbnail
            const iconImg = newHTML('img', 'soundpicker-card-icon', card) as HTMLImageElement;
            iconImg.src = item.iconSrc;
            iconImg.alt = item.label;

            // Label
            const label = newHTML('div', 'soundpicker-card-label', card);
            label.textContent = item.label;

            card.onmousedown = (e) => {
                e.preventDefault();
                SoundPicker.selectSound(item, card);
            };
            card.ontouchend = (e) => {
                e.preventDefault();
                SoundPicker.selectSound(item, card);
            };
            card.ondblclick = (e) => {
                e.preventDefault();
                SoundPicker.selectSound(item, card);
                SoundPicker.confirmAndAdd();
            };
        }
    }

    static selectSound (item: SoundItem, card: HTMLElement) {
        selectedSoundName = item.name;

        // Visual selection
        if (cardsGridEl) {
            const allCards = cardsGridEl.querySelectorAll('.soundpicker-card');
            allCards.forEach((c) => c.classList.remove('selected'));
        }
        card.classList.add('selected');

        // Play audio preview
        SoundPicker.previewSound(item.name);
    }

    static previewSound (name: string) {
        const snd = ScratchAudio.projectSounds[name];
        if (snd) {
            snd.play();
        } else {
            PlatformBridge.playSound(name);
        }
    }

    static confirmAndAdd () {
        if (!selectedSoundName) {
            SoundPicker.close();
            return;
        }

        const spr = ScratchJr.getSprite() as Sprite;
        if (!spr) {
            SoundPicker.close();
            return;
        }

        if (spr.sounds.length >= 6) {
            // Already full
            SoundPicker.close();
            return;
        }

        const soundToAdd = selectedSoundName;
        // Avoid duplicating the exact same sound in palette
        if (spr.sounds.indexOf(soundToAdd) < 0) {
            const page = spr.div?.parentNode ? getModelRefAs<Page>(spr.div.parentNode as HTMLElement, 'page') : null;
            const pageId = page?.id || ScratchJr.stage?.currentPage?.id || 'page1';
            spr.sounds.push(soundToAdd);
            Undo.record({
                action: 'recordsound',
                who: spr.id,
                where: pageId,
                sound: soundToAdd
            });
            ScratchJr.storyStart('SoundPicker.confirmAndAdd');
            ScratchAudio.loadProjectSound(soundToAdd);
        }

        ScratchAudio.sndFX('snap.wav');
        SoundPicker.close();
        Palette.selectCategory(3);
    }
}
