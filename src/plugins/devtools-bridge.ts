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

let bridge: DevtoolsBridge | undefined;

export function installDevtoolsBridge(next: DevtoolsBridge): void {
    bridge = next;
}

export const notifyAppCreated = (app: object, state: object) => bridge?.appCreated(app, state);
export const notifyAppDisposed = (app: object) => bridge?.appDisposed(app);
export const notifyRootMounted = (app: object, root: Element) => bridge?.rootMounted(app, root);
export const notifyRootUnmounted = (app: object, root: Element) => bridge?.rootUnmounted(app, root);
export const notifyEffectCreated = () => {
    if (!bridge) return false;
    bridge.effectCreated();
    return true;
};
export const notifyEffectDisposed = (tracked: boolean) => {
    if (tracked) bridge?.effectDisposed();
};
