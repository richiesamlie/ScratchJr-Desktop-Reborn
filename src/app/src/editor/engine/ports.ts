/**
 * Typed seam between the engine (editor/engine, editor/blocks) and the editor
 * UI singletons. Engine modules must not import ../ui/* at runtime; instead
 * the editor entry installs one adapter at boot. Calls stay synchronous so
 * undo ordering and thumbnail refresh timing are identical to direct calls.
 */
import type Sprite from './Sprite';
import type Page from './Page';
import type Block from '../blocks/Block';
import type Scripts from '../ui/Scripts';
import type Stage from './Stage';
import type Runtime from './Runtime';

export interface EnginePorts {
    // ---- god-object state accessors ----
    getStage (): Stage;
    getRuntime (): Runtime;
    isOnHold (): boolean;
    setOnHold (v: boolean): void;
    isSampleOrStarter (): boolean;
    isInFullscreen (): boolean;
    isEditable (): boolean;
    getStageColor (): string;
    getLayerTop (): number;
    getWorkingCanvas (): HTMLCanvasElement;
    getWorkingCanvas2 (): HTMLCanvasElement;
    getSprite (): Sprite | undefined;
    getShaking (): HTMLElement | undefined;
    setShaking (b: HTMLElement | undefined): void;
    getStopShaking (): ((b: HTMLElement) => void) | undefined;
    setStopShaking (f: ((b: HTMLElement) => void) | undefined): void;

    // ---- god-object behavior ----
    stopStrips (): void;
    unfocus (e?: Event): void;
    storyStart (where: string): void;
    getActiveScript (): HTMLElement | null;
    updateRunStopButtons (): void;
    blur (): void;
    markChanged (): void;
    clearSelection (): void;
    startCurrentPageStrips (types: string[]): void;
    startScriptsFor (spr: Sprite, types: string[]): void;
    pushBackButtonCallback (fcn: () => void): void;
    popBackButtonCallback (): void;

    // ---- UI singletons ----
    thumbsUpdatePages (): void;
    thumbsUpdateSprites (): void;
    thumbsUpdateSprite (spr: Sprite): void;
    thumbsPageMouseDown (e: MouseEvent & { touches?: TouchList }): void;
    thumbsOverpage (thumb: HTMLElement): void;
    undoRecord (obj: Record<string, unknown>): void;
    paletteShow (): void;
    paletteHide (): void;
    uiMascotData (page?: Page): Record<string, unknown>;
    /** Scrolls the sprite's thumbnail into view; a command, despite the name */
    uiSpriteInView (spr: Sprite): void;
    uiSetMenuTextColor (t: HTMLElement): void;
    /** The watermark element lives on the scripts pane; engine measures it */
    scriptsPaneWatermark (): HTMLElement;
    scriptsPaneUpdateScriptsPageBlocks (list: string[]): void;
    /** Sprites own their code container; the container builds UI chrome */
    scriptsCreate (spr: Sprite): Scripts;
    projectSetProgress (perc: number): void;
    /** Progress-bar helper on ui/Project; ratio of pending media loads */
    projectGetMediaLoadRatio (f: number): number;
    /** Clears the UI save-in-progress flag when a run starts */
    projectClearSaving (): void;
    projectSubstractCount (): void;
    projectRecreateObject (
        page: Page,
        name: string,
        data: Record<string, unknown>,
        callBack: (spr: Sprite) => void,
        active?: boolean
    ): void;
    projectEncodeSprite (name: string): Record<string, unknown>;
    projectEncodeStrip (b: Block | null): unknown[];
}

let ports: EnginePorts | null = null;

export function setEnginePorts (p: EnginePorts): void {
    ports = p;
}

export function enginePorts (): EnginePorts {
    if (!ports) {
        throw new Error('engine ports not installed');
    }
    return ports;
}
