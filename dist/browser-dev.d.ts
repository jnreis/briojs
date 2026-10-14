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
    createScope: typeof import('.').createScope;
    onCleanup: typeof import('.').onCleanup;
    getCurrentScope: typeof import('.').getCurrentScope;
    createStepEngine: typeof import('.').createStepEngine;
    http: {
        get: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        post: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        put: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        patch: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        delete: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
    };
    trustedHTML: typeof import('.').trustedHTML;
};
export default brio;
