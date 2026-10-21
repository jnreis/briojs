import { inspectDevtools, devtoolsPanel, enableDevtools } from './devtools-entry';

declare const brio: {
    devtools: {
        subscribe(callback: () => void): () => void;
        getSnapshot: () => import('.').DevtoolsSnapshot;
        reset(): void;
    };
    inspectDevtools: typeof inspectDevtools;
    devtoolsPanel: typeof devtoolsPanel;
    enableDevtools: typeof enableDevtools;
    createApp: typeof import('.').createApp;
    state: typeof import('.').state;
    signal: typeof import('.').signal;
    computed: typeof import('.').computed;
    effect: typeof import('.').effect;
    batch: typeof import('.').batch;
    flush: () => void;
    untrack: typeof import('.').untrack;
    resource: typeof import('.').resource;
    createScope: typeof import('.').createScope;
    onCleanup: typeof import('.').onCleanup;
    getCurrentScope: typeof import('.').getCurrentScope;
    trustedHTML: typeof import('.').trustedHTML;
};
export default brio;
