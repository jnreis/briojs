import { EffectOptions, Scope, Stop } from './types';
import { EffectFrame } from '../core/scope';

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
export declare const getActiveEffect: () => ReactiveEffect | undefined;
export declare const cleanupEffect: (eff: ReactiveEffect) => void;
export declare const runEffect: (eff: ReactiveEffect) => unknown;
/** Runs `fn` without subscribing the current effect or computed to anything it reads. */
export declare function untrack<T>(fn: () => T): T;
export declare const queueEffect: (eff: ReactiveEffect) => void;
/** Runs pending effects now, even inside a batch or event handler, so the DOM reflects earlier writes. */
export declare const flush: () => void;
export declare function effect<T>(fn: () => T, options?: EffectOptions): Stop;
/** Allocation-free batch bracket for hot internal paths; `leaveBatch` flushes at the outermost level. */
export declare const enterBatch: () => void;
export declare const leaveBatch: () => void;
export declare function batch<T>(fn: () => T): T;
