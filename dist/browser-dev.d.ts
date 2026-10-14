import { inspectDevtools, devtoolsPanel } from './devtools-entry';

declare const brio: {
    devtools: {
        subscribe(callback: () => void): () => void;
        getSnapshot: () => import('./devtools-entry').DevtoolsSnapshot;
        reset(): void;
    };
    inspectDevtools: typeof inspectDevtools;
    devtoolsPanel: typeof devtoolsPanel;
    createApp: typeof import('.').createApp;
    state: typeof import('.').state;
    signal: typeof import('.').signal;
    computed: typeof import('.').computed;
    effect: typeof import('.').effect;
    batch: typeof import('.').batch;
    createScope: typeof import('.').createScope;
    onCleanup: typeof import('.').onCleanup;
    persist: typeof import('.').persist;
    createRouter: typeof import('.').createRouter;
    createStepEngine: typeof import('.').createStepEngine;
    validate: typeof import('.').validate;
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
