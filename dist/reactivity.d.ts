export type Stop = (() => void) & {
    readonly active: boolean;
    run(): unknown;
};
export type Signal<T> = {
    value: T;
};
export type Scope = {
    run<T>(fn: () => T): T;
    dispose(): void;
    readonly disposed: boolean;
};
export type EffectOptions = {
    lazy?: boolean;
    scheduler?: () => void;
};
export declare function state<T extends object>(target: T): T;
export declare function signal<T>(initialValue: T): Signal<T>;
export declare function effect<T>(fn: () => T, options?: EffectOptions): Stop;
export declare function computed<T>(getter: () => T): {
    readonly value: T;
    dispose: () => void;
};
export declare function batch<T>(fn: () => T): T;
export declare function createScope(parent?: Scope | undefined): Scope;
export declare function onDispose(scope: Scope | undefined, cleanup: () => void): () => void;
export declare function onCleanup(cleanup: () => void): () => void;
export declare function getCurrentScope(): Scope | undefined;
