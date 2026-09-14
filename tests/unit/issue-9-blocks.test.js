// @vitest-environment jsdom
import './renderer-harness.js';
import './engine-port-adapter.js';
import {beforeEach, afterEach, describe, it, expect, vi} from 'vitest';
import BlockSpecs from '../../src/app/src/editor/blocks/BlockSpecs';
import Block from '../../src/app/src/editor/blocks/Block';
import Menu from '../../src/app/src/editor/blocks/Menu';
import Prims from '../../src/app/src/editor/engine/Prims';
import Runtime from '../../src/app/src/editor/engine/Runtime';
import Stage from '../../src/app/src/editor/engine/Stage';
import Page from '../../src/app/src/editor/engine/Page';
import Sprite from '../../src/app/src/editor/engine/Sprite';
import ScratchJr from '../../src/app/src/editor/ScratchJr';
import Project from '../../src/app/src/editor/ui/Project';
import Undo from '../../src/app/src/editor/ui/Undo';
import {resetGoldenDom, stubMedia, makePage, stripShape} from './helpers/editor-fixtures.js';

function character(page, id) {
    return new Sprite({type: 'sprite', page, md5: 'm1', id, name: id, sounds: []});
}

beforeEach(() => {
    resetGoldenDom();
    stubMedia();
    BlockSpecs.initBlocks();
    Prims.init();
    ScratchJr.userStart = true;
});
afterEach(() => { vi.restoreAllMocks(); Menu.closeMyOpenMenu(); });

describe('random wait', () => {
    it.each([[0, 0], [0.5, 16], [0.999999, 31]])('samples once using existing wait units (%s)', (random, ticks) => {
        const sample = vi.spyOn(Math, 'random').mockReturnValue(random);
        const next = {};
        const thread = {thisblock: {getArgValue: () => 10, next}};
        Prims.WaitRandom(thread);
        expect(thread.waitTimer).toBe(ticks);
        expect(thread.thisblock).toBe(next);
        expect(sample).toHaveBeenCalledTimes(1);
    });
    it.each([[-1, 0], [0, 0], ['invalid', 0], [Infinity, 0], [999, 156]])('bounds imported arguments (%s)', (value, ticks) => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999999);
        const thread = {thisblock: {getArgValue: () => value, next: null}};
        Prims.WaitRandom(thread);
        expect(thread.waitTimer).toBe(ticks);
    });
});

describe('character touch trigger', () => {
    it('clears deleted targets before IDs can be reused', () => {
        const page = makePage();
        const owner = character(page, 'owner');
        const target = character(page, 'target');
        ScratchJr.stage.currentPage = page;
        const block = owner.code.recreateStrip([['ontouchsprite', 'target', 0, 0]])[0];
        const removeFromPage = vi.fn(spr => spr.div.remove());
        Stage.prototype.removeCharacter.call({removeFromPage}, target);
        expect(block.getArgValue()).toBe('');
        expect(removeFromPage).toHaveBeenCalledWith(target);
        character(page, 'target');
        expect(block.getArgValue()).toBe('');
    });
    it('only tests the selected visible character on the same page', () => {
        const page = makePage();
        const owner = character(page, 'owner');
        const target = character(page, 'target');
        const other = character(page, 'other');
        for (const spr of [owner, target, other]) {
            spr.shown = true;
            spr.getBoxWithEffects = () => ({intersects: () => true});
        }
        owner.verifyHit = vi.fn(() => true);
        expect(owner.touchingAny('target')).toBe(true);
        expect(owner.verifyHit).toHaveBeenCalledExactlyOnceWith(target);
        target.name = 'Renamed';
        expect(owner.touchingAny('target')).toBe(true);
        target.shown = false;
        expect(owner.touchingAny('target')).toBe(false);
        target.shown = true;
        target.div.remove();
        expect(owner.touchingAny('target')).toBe(false);
        expect(owner.touchingAny('')).toBe(false);
        expect(owner.touchingAny('owner')).toBe(false);
        expect(owner.touchingAny()).toBe(true);
    });
    it('waits until play starts, then uses the existing bump loop', () => {
        const next = {};
        const block = {blocktype: 'ontouchsprite', getArgValue: () => 'target', next};
        const spr = {touchingAny: vi.fn(() => true)};
        const thread = {spr, thisblock: block, firstBlock: block, stack: []};
        ScratchJr.userStart = false;
        Prims.OnTouch(thread);
        expect(spr.touchingAny).not.toHaveBeenCalled();
        ScratchJr.userStart = true;
        Prims.OnTouch(thread);
        expect(spr.touchingAny).toHaveBeenCalledWith('target');
        expect(thread.stack).toEqual([block]);
        expect(thread.thisblock).toBe(next);
    });
    it('treats waiting trigger threads as inactive and executing bodies as active', () => {
        const rt = new Runtime();
        const trigger = {blocktype: 'ontouchsprite'};
        const thread = {firstBlock: trigger, thisblock: trigger, isRunning: true};
        rt.threadsRunning = [thread];
        expect(rt.inactive()).toBe(true);
        thread.thisblock = {blocktype: 'waitrandom'};
        expect(rt.inactive()).toBe(false);
    });
    it('round-trips both blocks and duplicates without changing palette defaults', () => {
        const page = makePage();
        const owner = character(page, 'owner');
        character(page, 'target');
        const data = [['ontouchsprite', 'target', 0, 0], ['waitrandom', 25, 0, 0]];
        const blocks = owner.code.recreateStrip(data);
        expect(stripShape(Project.encodeStrip(blocks[0]))).toEqual(stripShape(data));
        const saved = JSON.parse(JSON.stringify(page.encodePage()));
        expect(stripShape(saved.owner.scripts[0])).toEqual(stripShape(data));
        const duplicate = blocks[0].duplicateBlock(0, 0, owner);
        expect(duplicate.getArgValue()).toBe('target');
        expect(BlockSpecs.defs.ontouchsprite[4]).toBe('');
        const fresh = new Block(BlockSpecs.defs.ontouchsprite, true, 1);
        expect(fresh.getArgValue()).toBe('');
        const copy = character(page, 'copy');
        const restored = copy.code.recreateStrip(saved.owner.scripts[0]);
        expect(restored[0].getArgValue()).toBe('target');
        const anotherPage = new Page('page2', {lastSprite: '', sprites: [], layers: [], num: 2});
        const otherPageOwner = character(anotherPage, 'cross-page');
        expect(blocks[0].duplicateBlock(0, 0, otherPageOwner).getArgValue()).toBe('');
    });
    it('offers only other characters, records selection, and reports a missing target', () => {
        const page = makePage();
        const owner = character(page, 'owner');
        const target = character(page, 'target');
        const block = owner.code.recreateStrip([['ontouchsprite', '', 0, 0]])[0];
        expect(block.arg.spriteChoices()).toEqual([target]);
        block.arg.div.click();
        const choice = Array.from(Menu.openMenu.querySelectorAll('button')).find(el => el.textContent === 'target');
        expect(choice).toBeDefined();
        choice.click();
        expect(block.getArgValue()).toBe('target');
        expect(globalThis.__enginePortCalls.at(-1).obj).toMatchObject({action: 'scripts', who: 'owner'});
        target.div.remove();
        block.update(owner);
        expect(block.arg.div.textContent).toBe('?');
        expect(block.getArgValue()).toBe('target');
    });
    it('undo restores the previous target', () => {
        const page = makePage();
        const owner = character(page, 'owner');
        character(page, 'target');
        character(page, 'other');
        ScratchJr.stage.pages.push(page);
        ScratchJr.stage.currentPage = page;
        ScratchJr.unfocus = () => {};
        ScratchJr.stopStrips = () => {};
        const block = owner.code.recreateStrip([['ontouchsprite', 'target', 0, 0]])[0];
        Undo.record({action: 'modify', where: page.id, who: owner.id});
        block.arg.argValue = 'other';
        Undo.record({action: 'modify', where: page.id, who: owner.id});
        Undo.prevStep({preventDefault() {}, stopPropagation() {}, timeStamp: 1});
        expect(page.encodePage().owner.scripts[0][0][1]).toBe('target');
        Undo.nextStep({preventDefault() {}, stopPropagation() {}, timeStamp: 2});
        expect(page.encodePage().owner.scripts[0][0][1]).toBe('other');
    });
    it('undo and redo of target deletion restore and clear incoming references', () => {
        const page = makePage();
        const owner = character(page, 'owner');
        const target = character(page, 'target');
        const block = owner.code.recreateStrip([['ontouchsprite', 'target', 0, 0]])[0];
        ScratchJr.unfocus = () => {};
        ScratchJr.stopStrips = () => {};
        Undo.record({action: 'modify', where: page.id, who: owner.id});
        block.arg.argValue = '';
        target.div.remove();
        target.code.sc.remove();
        page.sprites = JSON.stringify(['owner']);
        Undo.record({action: 'deletesprite', where: page.id, who: 'target'});
        Undo.prevStep({preventDefault() {}, stopPropagation() {}, timeStamp: 1});
        expect(page.encodePage().owner.scripts[0][0][1]).toBe('target');
        expect(document.getElementById('target')).not.toBeNull();
        Undo.nextStep({preventDefault() {}, stopPropagation() {}, timeStamp: 2});
        expect(page.encodePage().owner.scripts[0][0][1]).toBe('');
        expect(document.getElementById('target')).toBeNull();
    });
});
