/**
 * Pending-media counter shared by the loader UI and the engine's page/sprite
 * construction. Lives in a neutral module so neither side owns singleton
 * state the other must reach into.
 */

let count = -1;

export function getMediaCount (): number {
    return count;
}

export function setMediaCount (n: number): void {
    count = n;
}

export function bumpMediaCount (delta: number): void {
    count += delta;
}
