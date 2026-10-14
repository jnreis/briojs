export type DevtoolsApp = {
    state: object;
    roots: ReadonlySet<{ root: Element; unmounted: boolean }>;
};

export type DevtoolsBridge = {
    appCreated(app: object, state: object): void;
    appDisposed(app: object): void;
    rootMounted(app: object, root: Element): void;
    rootUnmounted(app: object, root: Element): void;
    effectCreated(): void;
    effectDisposed(): void;
};

declare const __BRIO_DEVTOOLS__: boolean;
export const devtoolsEnabled = typeof __BRIO_DEVTOOLS__ === 'undefined' || __BRIO_DEVTOOLS__;

let bridge: DevtoolsBridge | undefined;

export function installDevtoolsBridge(next: DevtoolsBridge): void {
    bridge = next;
}

export const notifyAppCreated = (app: object, state: object) => {
    if (devtoolsEnabled) bridge?.appCreated(app, state);
};
export const notifyAppDisposed = (app: object) => {
    if (devtoolsEnabled) bridge?.appDisposed(app);
};
export const notifyRootMounted = (app: object, root: Element) => {
    if (devtoolsEnabled) bridge?.rootMounted(app, root);
};
export const notifyRootUnmounted = (app: object, root: Element) => {
    if (devtoolsEnabled) bridge?.rootUnmounted(app, root);
};
export const notifyEffectCreated = () => {
    if (!devtoolsEnabled || !bridge) return false;
    bridge.effectCreated();
    return true;
};
export const notifyEffectDisposed = (tracked: boolean) => {
    if (devtoolsEnabled && tracked) bridge?.effectDisposed();
};
