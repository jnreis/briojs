import { effect } from './reactivity';
import { causedError } from './errors';
import { installDevtoolsBridge } from './devtools-bridge';

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
    const appSnapshots = Array.from(apps, ([app, record]) => ({
        app,
        roots: Array.from(record.roots, root => {
            const id = root.id ? `#${root.id}` : '';
            const classes = root.classList.length ? `.${Array.from(root.classList).join('.')}` : '';
            return `${root.tagName.toLowerCase()}${id}${classes}`;
        }),
        state: record.state,
    }));
    return {
        appCount: apps.size,
        mountedRoots: appSnapshots.reduce((total, record) => total + record.roots.length, 0),
        effectsCreated,
        activeEffects,
        apps: appSnapshots,
    };
};

installDevtoolsBridge({
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
        if (!record) return;
        record.snapshot();
        apps.delete(app);
        notifySubscribers();
    },
    rootMounted(app, root) {
        apps.get(app)?.roots.add(root);
        notifySubscribers();
    },
    rootUnmounted(app, root) {
        apps.get(app)?.roots.delete(root);
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
});

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
        subscribers.delete(update);
        panel.remove();
    };
}
