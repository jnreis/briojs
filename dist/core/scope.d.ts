export type Scope = {
    run<T>(fn: () => T): T;
    dispose(): void;
    readonly disposed: boolean;
};
export declare function createScope(parent?: Scope | undefined): Scope;
export declare function onDispose(scope: Scope | undefined, cleanup: () => void): () => void;
/** Registers an idempotent cleanup without a wrapper; pair with `removeDisposer` when it runs early. */
export declare function addDisposer(scope: Scope, cleanup: () => void): void;
export declare function removeDisposer(scope: Scope, cleanup: () => void): void;
export declare function onCleanup(cleanup: () => void): () => void;
export declare function getCurrentScope(): Scope | undefined;
export declare function setActiveScope(scope: Scope | undefined): Scope | undefined;
