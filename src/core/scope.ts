import { combinedError } from '../core/errors';

export type Scope = {
    run<T>(fn: () => T): T;
    dispose(): void;
    readonly disposed: boolean;
};

let activeScope: Scope | undefined;
const scopeCleanups = new WeakMap<Scope, Set<() => void>>();

export function createScope(parent: Scope | undefined = activeScope): Scope {
    let disposed = false;
    const cleanups = new Set<() => void>();
    let detachFromParent: (() => void) | undefined;
    const scope: Scope = {
        get disposed() {
            return disposed;
        },
        run<T>(fn: () => T): T {
            if (disposed) throw new Error('Cannot run a disposed Brio scope.');
            const previous = activeScope;
            activeScope = scope;
            try {
                return fn();
            } finally {
                activeScope = previous;
            }
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            detachFromParent?.();
            const errors: unknown[] = [];
            for (const cleanup of [...cleanups]) {
                try {
                    cleanup();
                } catch (error) {
                    errors.push(error);
                }
            }
            cleanups.clear();
            if (errors.length) throw combinedError('One or more Brio scope cleanups failed.', errors);
        },
    };
    scopeCleanups.set(scope, cleanups);
    if (parent) detachFromParent = onDispose(parent, () => scope.dispose());
    return scope;
}

export function onDispose(scope: Scope | undefined, cleanup: () => void): () => void {
    if (!scope) return () => {};
    if (scope.disposed) {
        cleanup();
        return () => {};
    }
    const originalCleanup = cleanup;
    let active = true;
    const wrapped = () => {
        if (!active) return;
        active = false;
        scopeCleanups.get(scope)?.delete(wrapped);
        originalCleanup();
    };
    scopeCleanups.get(scope)?.add(wrapped);
    return wrapped;
}

export function onCleanup(cleanup: () => void): () => void {
    if (!activeScope) throw new Error('This operation requires an active Brio scope.');
    return onDispose(activeScope, cleanup);
}

export function getCurrentScope(): Scope | undefined {
    return activeScope;
}

export function setActiveScope(scope: Scope | undefined): Scope | undefined {
    const prev = activeScope;
    activeScope = scope;
    return prev;
}
