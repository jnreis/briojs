import { EffectOptions, Scope, Stop } from './types';

export type ReactiveEffect = {
    fn: () => unknown;
    scheduler?: () => void;
    scope?: Scope;
    deps: Set<ReactiveEffect>[];
    active: boolean;
    running: boolean;
    devtoolsTracked?: boolean;
};
export declare const getActiveEffect: () => ReactiveEffect | undefined;
export declare const cleanupEffect: (eff: ReactiveEffect) => void;
export declare const runEffect: (eff: ReactiveEffect) => unknown;
export declare const queueEffect: (eff: ReactiveEffect) => void;
/** Runs pending effects now, even inside a batch or event handler, so the DOM reflects earlier writes. */
export declare const flush: () => void;
export declare function effect<T>(fn: () => T, options?: EffectOptions): Stop;
/** Allocation-free batch bracket for hot internal paths; `leaveBatch` flushes at the outermost level. */
export declare const enterBatch: () => void;
export declare const leaveBatch: () => void;
export declare function batch<T>(fn: () => T): T;
