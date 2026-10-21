import { createError, deleteItem, isInstanceOf } from './native';
import { combinedError } from '../core/errors';

export type Scope = {
    run<T>(fn: () => T): T;
    dispose(): void;
    readonly disposed: boolean;
};

type Cleanup = (() => void) | BrioScope;

let activeScope: BrioScope | undefined;
const noop = () => {};

// Methods live on the prototype and cleanups are allocated lazily: one scope is created per hydrated node.
class BrioScope implements Scope {
    _disposed = false;
    _cleanups: Set<Cleanup> | undefined;
    _parent: BrioScope | undefined;
    _node: Node | undefined;

    constructor(parent: BrioScope | undefined) {
        if (!parent) return;
        this._node = parent._node;
        if (parent._disposed) {
            this._disposed = true;
            return;
        }
        this._parent = parent;
        (parent._cleanups ??= new Set()).add(this);
    }

    get disposed(): boolean {
        return this._disposed;
    }

    run<T>(fn: () => T): T {
        if (this._disposed) throw createError('Cannot run a disposed Brio scope.');
        const previous = activeScope;
        activeScope = this;
        try {
            return fn();
        } finally {
            activeScope = previous;
        }
    }

    dispose(): void {
        if (this._disposed) return;
        this._disposed = true;
        const parent = this._parent;
        // A disposing parent clears its whole set afterwards, so skip the per-child removal.
        if (parent && !parent._disposed) deleteItem(parent._cleanups, this);
        const cleanups = this._cleanups;
        if (!cleanups) return;
        let errors: unknown[] | undefined;
        for (const cleanup of cleanups) {
            try {
                if (isInstanceOf(cleanup, BrioScope)) cleanup.dispose();
                else cleanup();
            } catch (error) {
                (errors ??= []).push(error);
            }
        }
        cleanups.clear();
        if (errors) throw combinedError('One or more Brio scope cleanups failed.', errors);
    }
}

export function createScope(parent: Scope | undefined = activeScope): Scope {
    return new BrioScope(parent as BrioScope | undefined);
}

export function onDispose(scope: Scope | undefined, cleanup: () => void): () => void {
    if (!scope) return noop;
    const owner = scope as BrioScope;
    if (owner._disposed) {
        cleanup();
        return noop;
    }
    let active = true;
    const wrapped = () => {
        if (!active) return;
        active = false;
        if (!owner._disposed) deleteItem(owner._cleanups, wrapped);
        cleanup();
    };
    (owner._cleanups ??= new Set()).add(wrapped);
    return wrapped;
}

/** Registers an idempotent cleanup without a wrapper; pair with `removeDisposer` when it runs early. */
export function addDisposer(scope: Scope, cleanup: () => void): void {
    const owner = scope as BrioScope;
    if (owner._disposed) cleanup();
    else (owner._cleanups ??= new Set()).add(cleanup);
}

export function removeDisposer(scope: Scope, cleanup: () => void): void {
    const owner = scope as BrioScope;
    if (!owner._disposed) deleteItem(owner._cleanups, cleanup);
}

/** The effect run currently executing directly in its own scope; its `onCleanup` calls are per run. */
export type EffectFrame = { scope: Scope | undefined; cleanups: (() => void)[] | undefined };
let effectFrame: EffectFrame | undefined;

/** Runs `fn` with no active scope, so unowned effects never adopt whichever scope triggered them. */
export function runUnscoped<T>(fn: () => T): T {
    const previous = activeScope;
    activeScope = undefined;
    try {
        return fn();
    } finally {
        activeScope = previous;
    }
}

export function setEffectFrame(frame: EffectFrame | undefined): EffectFrame | undefined {
    const previous = effectFrame;
    effectFrame = frame;
    return previous;
}

export function onCleanup(cleanup: () => void): () => void {
    // Inside an effect body (not a nested scope.run), cleanup runs before the next run and when the effect stops.
    if (effectFrame && effectFrame.scope === activeScope) {
        const frame = effectFrame;
        let active = true;
        const wrapped = () => {
            if (!active) return;
            active = false;
            const index = frame.cleanups ? frame.cleanups.indexOf(wrapped) : -1;
            if (index !== -1) frame.cleanups!.splice(index, 1);
            cleanup();
        };
        (frame.cleanups ??= []).push(wrapped);
        return wrapped;
    }
    if (!activeScope) throw createError('This operation requires an active Brio scope.');
    return onDispose(activeScope, cleanup);
}

export function getCurrentScope(): Scope | undefined {
    return activeScope;
}

export function setActiveScope(scope: Scope | undefined): Scope | undefined {
    const prev = activeScope;
    activeScope = scope as BrioScope | undefined;
    return prev;
}
