import { inspectDevtools, devtoolsPanel, enableDevtools } from './devtools-entry.js';

declare const brio: {
    devtools: {
        subscribe(callback: () => void): () => void;
        getSnapshot: () => import('./index.js').DevtoolsSnapshot;
        reset(): void;
    };
    inspectDevtools: typeof inspectDevtools;
    devtoolsPanel: typeof devtoolsPanel;
    enableDevtools: typeof enableDevtools;
    createApp: typeof import('./index.js').createApp;
    state: typeof import('./index.js').state;
    signal: typeof import('./index.js').signal;
    computed: typeof import('./index.js').computed;
    effect: typeof import('./index.js').effect;
    batch: typeof import('./index.js').batch;
    flush: () => void;
    untrack: typeof import('./index.js').untrack;
    resource: typeof import('./index.js').resource;
    createScope: typeof import('./index.js').createScope;
    onCleanup: typeof import('./index.js').onCleanup;
    getCurrentScope: typeof import('./index.js').getCurrentScope;
    trustedHTML: typeof import('./index.js').trustedHTML;
};
export default brio;
