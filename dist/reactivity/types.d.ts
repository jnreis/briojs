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
export type Resource<T> = {
    readonly data: Signal<T | undefined>;
    readonly loading: Signal<boolean>;
    readonly error: Signal<unknown | undefined>;
    refetch(): Promise<void>;
    dispose(): void;
};
