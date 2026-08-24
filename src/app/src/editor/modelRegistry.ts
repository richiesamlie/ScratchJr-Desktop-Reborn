/**
 * Element -> model reference registry.
 *
 * Replaces the legacy DOM-expando object graph (`div.owner = model`) with a
 * WeakMap-backed lookup, migrated per subsystem. Kind tags keep the polymorphic
 * walkers honest: an element registered as 'block' will not satisfy a
 * 'sprite' query.
 *
 * Lifecycle note: entries die with their elements (WeakMap), matching the old
 * expando behavior — no explicit unregistration needed.
 */

export type ModelKind =
    | 'block'
    | 'blockarg'
    | 'scripts'
    | 'sprite'
    | 'page'
    | 'scroll'
    | 'thumb'
    | 'pagethumb'
    | 'spritethumb'
    | 'stage';

interface ModelRef {
    kind: ModelKind;
    model: unknown;
}

const refs = new WeakMap<HTMLElement, ModelRef>();

export function setModelRef (el: HTMLElement, kind: ModelKind, model: unknown): void {
    refs.set(el, { kind, model });
}

export function hasModelRef (el: HTMLElement): boolean {
    return refs.has(el);
}

export function getModelRef (el: HTMLElement): { kind: ModelKind; model: unknown } | null {
    const r = refs.get(el);
    return r ? { kind: r.kind, model: r.model } : null;
}

/** Typed accessor; returns undefined when el is unregistered or another kind. */
export function getModelRefAs<T> (el: HTMLElement | null | undefined, kind: ModelKind): T | undefined {
    if (!el) return undefined;
    const r = refs.get(el);
    return (r && r.kind === kind) ? (r.model as T) : undefined;
}

/** Walk up the tree until an element carries any model ref (legacy walker semantics). */
export function findUpModelRefEl (start: HTMLElement | null): HTMLElement | null {
    let el: HTMLElement | null = start;
    while (el != null) {
        if (refs.has(el)) return el;
        el = el.parentNode as HTMLElement | null;
    }
    return null;
}

// Read-only debug/test seam: lets the CDP interaction harness inspect the
// graph without touching internals. Not used by application code.
declare global {
    interface Window {
        __modelRefs?: {
            setModelRef: typeof setModelRef;
            getModelRef: typeof getModelRef;
            getModelRefAs: typeof getModelRefAs;
            hasModelRef: typeof hasModelRef;
            findUpModelRefEl: typeof findUpModelRefEl;
        };
    }
}

if (typeof window !== 'undefined') {
    window.__modelRefs = {
        setModelRef,
        getModelRef,
        getModelRefAs,
        hasModelRef,
        findUpModelRefEl,
    };
}
