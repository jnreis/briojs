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
export declare const devtoolsEnabled: boolean;
export declare function installDevtoolsBridge(next: DevtoolsBridge): void;
export declare const notifyAppCreated: (app: object, state: object) => void;
export declare const notifyAppDisposed: (app: object) => void;
export declare const notifyRootMounted: (app: object, root: Element) => void;
export declare const notifyRootUnmounted: (app: object, root: Element) => void;
export declare const notifyEffectCreated: () => boolean;
export declare const notifyEffectDisposed: (tracked: boolean) => void;
/** Development only: an unrecognized b-* attribute usually means a missing plugin or a typo. */
export declare const notifyUnknownDirective: (name: string, element: Element) => void;
