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
export declare const flushEffects: () => void;
export declare function effect<T>(fn: () => T, options?: EffectOptions): Stop;
export declare function batch<T>(fn: () => T): T;
