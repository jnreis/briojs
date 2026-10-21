import { getLength, deleteItem } from '../core/native';
import { combinedError, locate, getScopeNode } from '../core/errors';
import { devtoolsEnabled, notifyEffectCreated, notifyEffectDisposed } from '../plugins/devtools-bridge';
import type { EffectOptions, Scope, Stop } from './types';
import { getCurrentScope, addDisposer, removeDisposer, setEffectFrame, runUnscoped } from '../core/scope';
import type { EffectFrame } from '../core/scope';

export type ReactiveEffect = {
    fn: () => unknown;
    scheduler?: () => void;
    scope?: Scope;
    deps: Set<ReactiveEffect>[];
    active: boolean;
    running: boolean;
    frame: EffectFrame;
    devtoolsTracked?: boolean;
};

let activeEffect: ReactiveEffect | undefined;
let batchDepth = 0;
const queuedEffects = new Set<ReactiveEffect>();

export const getActiveEffect = (): ReactiveEffect | undefined => activeEffect;

export const cleanupEffect = (eff: ReactiveEffect) => {
    for (const dep of eff.deps) deleteItem(dep, eff);
    eff.deps.length = 0;
};

/** Runs the cleanups registered by the previous run, untracked; returns their failure instead of throwing. */
const runCleanups = (eff: ReactiveEffect): unknown => {
    const cleanups = eff.frame.cleanups;
    if (!cleanups) return;
    eff.frame.cleanups = undefined;
    const previous = activeEffect;
    activeEffect = undefined;
    const errors: unknown[] = [];
    for (const cleanup of cleanups) {
        try {
            cleanup();
        } catch (error) {
            errors.push(error);
        }
    }
    activeEffect = previous;
    if (getLength(errors)) return locate(combinedError('One or more effect cleanups failed.', errors), getScopeNode(eff.scope));
};

export const runEffect = (eff: ReactiveEffect): unknown => {
    if (!eff.active || eff.scope?.disposed) return;
    if (eff.running) return;
    const cleanupFailure = runCleanups(eff);
    cleanupEffect(eff);
    const previous = activeEffect;
    const previousFrame = setEffectFrame(eff.frame);
    activeEffect = eff;
    eff.running = true;
    let result: unknown;
    try {
        result = eff.scope ? eff.scope.run(eff.fn) : runUnscoped(eff.fn);
    } catch (error) {
        throw locate(error, getScopeNode(eff.scope));
    } finally {
        eff.running = false;
        activeEffect = previous;
        setEffectFrame(previousFrame);
    }
    if (cleanupFailure) throw cleanupFailure;
    return result;
};

/** Runs `fn` without subscribing the current effect or computed to anything it reads. */
export function untrack<T>(fn: () => T): T {
    const previous = activeEffect;
    activeEffect = undefined;
    try {
        return fn();
    } finally {
        activeEffect = previous;
    }
}

export const queueEffect = (eff: ReactiveEffect) => {
    // Schedulers (computed invalidation) run at trigger time so reads inside a batch are never stale and
    // dirty-marking settles before any effect re-runs, which keeps dependency cycles from ping-ponging.
    if (eff.scheduler) {
        if (eff.active && !eff.scope?.disposed) eff.scheduler();
        return;
    }
    queuedEffects.add(eff);
    if (!batchDepth) flush();
};

/** Runs pending effects now, even inside a batch or event handler, so the DOM reflects earlier writes. */
export const flush = (): void => {
    const errors: unknown[] = [];
    while (queuedEffects.size) {
        const current = [...queuedEffects];
        queuedEffects.clear();
        for (const eff of current) {
            try {
                if (eff.active && !eff.scope?.disposed) runEffect(eff);
            } catch (error) {
                errors.push(error);
            }
        }
    }
    if (getLength(errors)) throw combinedError('One or more reactive effects failed.', errors);
};

export function effect<T>(fn: () => T, options: EffectOptions = {}): Stop {
    const scope = getCurrentScope();
    const reactiveEffect: ReactiveEffect = {
        fn,
        scheduler: options.scheduler,
        scope,
        deps: [],
        active: true,
        running: false,
        frame: { scope, cleanups: undefined },
    };
    const stop = (() => {
        if (!reactiveEffect.active) return;
        reactiveEffect.active = (stop as { active: boolean }).active = false;
        if (scope) removeDisposer(scope, stop);
        cleanupEffect(reactiveEffect);
        if (devtoolsEnabled) notifyEffectDisposed(Boolean(reactiveEffect.devtoolsTracked));
        const cleanupFailure = runCleanups(reactiveEffect);
        if (cleanupFailure) throw cleanupFailure;
    }) as Stop & { active: boolean };
    stop.active = true;
    stop.run = () => runEffect(reactiveEffect);
    if (scope) addDisposer(scope, stop);
    if (devtoolsEnabled) reactiveEffect.devtoolsTracked = notifyEffectCreated();
    if (!options.lazy) {
        try {
            runEffect(reactiveEffect);
        } catch (error) {
            stop();
            throw error;
        }
    }
    return stop;
}

/** Allocation-free batch bracket for hot internal paths; `leaveBatch` flushes at the outermost level. */
export const enterBatch = (): void => {
    batchDepth++;
};

export const leaveBatch = (): void => {
    if (!--batchDepth) flush();
};

export function batch<T>(fn: () => T): T {
    batchDepth++;
    let result!: T;
    let failure: unknown;
    let failed = false;
    try {
        result = fn();
    } catch (error) {
        failure = error;
        failed = true;
    }
    batchDepth--;
    if (!batchDepth) {
        try {
            flush();
        } catch (error) {
            if (failed)
                throw combinedError('A Brio batch operation and its reactive effects failed.', [failure, error]);
            throw error;
        }
    }
    if (failed) throw failure;
    return result;
}
