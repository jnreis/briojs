import { combinedError } from '../core/errors';
import { notifyEffectCreated, notifyEffectDisposed } from '../plugins/devtools-bridge';
import type { EffectOptions, Scope, Stop } from './types';
import { getCurrentScope, onDispose } from '../core/scope';

export type ReactiveEffect = {
    fn: () => unknown;
    scheduler?: () => void;
    scope?: Scope;
    deps: Set<ReactiveEffect>[];
    active: boolean;
    running: boolean;
    devtoolsTracked: boolean;
};

let activeEffect: ReactiveEffect | undefined;
let batchDepth = 0;
const queuedEffects = new Set<ReactiveEffect>();

export const getActiveEffect = (): ReactiveEffect | undefined => activeEffect;

export const cleanupEffect = (eff: ReactiveEffect) => {
    for (const dep of eff.deps) dep.delete(eff);
    eff.deps.length = 0;
};

export const runEffect = (eff: ReactiveEffect): unknown => {
    if (!eff.active) return;
    if (eff.running) return;
    cleanupEffect(eff);
    const previous = activeEffect;
    activeEffect = eff;
    eff.running = true;
    try {
        if (eff.scope) {
            return eff.scope.run(() => eff.fn());
        }
        return eff.fn();
    } finally {
        eff.running = false;
        activeEffect = previous;
    }
};

export const queueEffect = (eff: ReactiveEffect) => {
    queuedEffects.add(eff);
    if (!batchDepth) flushEffects();
};

export const flushEffects = () => {
    const errors: unknown[] = [];
    while (queuedEffects.size) {
        const current = [...queuedEffects];
        queuedEffects.clear();
        for (const eff of current) {
            try {
                if (eff.active) eff.scheduler ? eff.scheduler() : runEffect(eff);
            } catch (error) {
                errors.push(error);
            }
        }
    }
    if (errors.length) throw combinedError('One or more reactive effects failed.', errors);
};

export function effect<T>(fn: () => T, options: EffectOptions = {}): Stop {
    const reactiveEffect: ReactiveEffect = {
        fn,
        scheduler: options.scheduler,
        scope: getCurrentScope(),
        deps: [],
        active: true,
        running: false,
        devtoolsTracked: false,
    };
    const stop = (() => {
        if (!reactiveEffect.active) return;
        reactiveEffect.active = false;
        cleanupEffect(reactiveEffect);
        notifyEffectDisposed(reactiveEffect.devtoolsTracked);
    }) as Stop;
    Object.defineProperty(stop, 'active', { get: () => reactiveEffect.active });
    stop.run = () => runEffect(reactiveEffect);
    const currentScope = getCurrentScope();
    if (currentScope) onDispose(currentScope, stop);
    reactiveEffect.devtoolsTracked = notifyEffectCreated();
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
            flushEffects();
        } catch (error) {
            if (failed)
                throw combinedError('A Brio batch operation and its reactive effects failed.', [failure, error]);
            throw error;
        }
    }
    if (failed) throw failure;
    return result;
}
