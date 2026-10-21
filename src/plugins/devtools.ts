import { getLength, arrayFrom, removeElement, deleteItem } from '../core/native';
import { effect } from '../reactivity/effect';
import { causedError } from '../core/errors';
import { installDevtoolsBridge } from './devtools-bridge';
import type { DevtoolsBridge } from './devtools-bridge';

export type DevtoolsSnapshot = {
    appCount: number;
    mountedRoots: number;
    effectsCreated: number;
    activeEffects: number;
    apps: readonly {
        app: object;
        roots: readonly string[];
        state: unknown;
    }[];
};

type AppRecord = {
    state: unknown;
    roots: Set<Element>;
    snapshot: () => void;
};

let effectsCreated = 0;
let activeEffects = 0;
const apps = new Map<object, AppRecord>();
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
    for (const subscriber of [...subscribers]) subscriber();
};

const getSnapshot = (): DevtoolsSnapshot => {
    const appSnapshots = arrayFrom(apps, ([app, record]) => ({
        app,
        roots: arrayFrom(record.roots, root => {
            const id = root.id ? `#${root.id}` : '';
            const classes = getLength(root.classList) ? `.${arrayFrom(root.classList).join('.')}` : '';
            return `${root.tagName.toLowerCase()}${id}${classes}`;
        }),
        state: record.state,
    }));
    return {
        appCount: apps.size,
        mountedRoots: appSnapshots.reduce((total, record) => total + getLength(record.roots), 0),
        effectsCreated,
        activeEffects,
        apps: appSnapshots,
    };
};

let enabled = false;

const bridge: DevtoolsBridge = {
    appCreated(app, appState) {
        const record: AppRecord = { state: undefined, roots: new Set(), snapshot: () => {} };
        record.snapshot = effect(() => {
            try {
                record.state = JSON.parse(JSON.stringify(appState));
            } catch (error) {
                record.state = causedError('Unable to snapshot app state in Brio devtools.', error);
            }
            notifySubscribers();
        });
        apps.set(app, record);
        notifySubscribers();
    },
    appDisposed(app) {
        const record = apps.get(app);
        record?.snapshot();
        deleteItem(apps, app);
        notifySubscribers();
    },
    rootMounted(app, root) {
        const record = apps.get(app);
        if (!record) return;
        record.roots.add(root);
        notifySubscribers();
    },
    rootUnmounted(app, root) {
        const record = apps.get(app);
        if (!record) return;
        deleteItem(record.roots, root);
        notifySubscribers();
    },
    effectCreated() {
        effectsCreated++;
        activeEffects++;
        notifySubscribers();
    },
    effectDisposed() {
        activeEffects--;
        notifySubscribers();
    },
};

export function enableDevtools(): void {
    if (enabled) return;
    enabled = true;
    installDevtoolsBridge(bridge);
}

export const devtools = {
    subscribe(callback: () => void): () => void {
        subscribers.add(callback);
        callback();
        return () => deleteItem(subscribers, callback);
    },
    getSnapshot,
    reset(): void {
        effectsCreated = 0;
        activeEffects = 0;
        apps.clear();
        subscribers.clear();
    },
};

export function inspectDevtools(): DevtoolsSnapshot {
    return getSnapshot();
}

export function devtoolsPanel(container: Element): () => void {
    const panel = document.createElement('pre');
    panel.setAttribute('data-brio-devtools', '');
    container.replaceChildren(panel);
    const update = () => {
        const snapshot = getSnapshot();
        panel.textContent = [
            `Apps: ${snapshot.appCount}`,
            `Mounted roots: ${snapshot.mountedRoots}`,
            `Effects active: ${snapshot.activeEffects}/${snapshot.effectsCreated}`,
            ...snapshot.apps.map(({ roots, state: appState }) =>
                `${roots.join(', ') || '(not mounted)'}\n${JSON.stringify(appState, null, 2)}`),
        ].join('\n\n');
    };
    subscribers.add(update);
    update();
    return () => {
        deleteItem(subscribers, update);
        removeElement(panel);
    };
}
