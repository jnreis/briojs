export type DevtoolsApp = {
    state: object;
    roots: ReadonlySet<{
        root: Element;
        unmounted: boolean;
    }>;
};
export type DevtoolsBridge = {
    appCreated(app: object, state: object): void;
    appDisposed(app: object): void;
    rootMounted(app: object, root: Element): void;
    rootUnmounted(app: object, root: Element): void;
    effectCreated(): void;
    effectDisposed(): void;
};
export declare function installDevtoolsBridge(next: DevtoolsBridge): void;
export declare const notifyAppCreated: (app: object, state: object) => void | undefined;
export declare const notifyAppDisposed: (app: object) => void | undefined;
export declare const notifyRootMounted: (app: object, root: Element) => void | undefined;
export declare const notifyRootUnmounted: (app: object, root: Element) => void | undefined;
export declare const notifyEffectCreated: () => boolean;
export declare const notifyEffectDisposed: (tracked: boolean) => void;
