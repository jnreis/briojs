import { createApp, state, signal, computed, effect, batch, createScope, onCleanup, getCurrentScope, createStepEngine, trustedHTML } from './index';

declare const brio: {
    createApp: typeof createApp;
    state: typeof state;
    signal: typeof signal;
    computed: typeof computed;
    effect: typeof effect;
    batch: typeof batch;
    createScope: typeof createScope;
    onCleanup: typeof onCleanup;
    getCurrentScope: typeof getCurrentScope;
    createStepEngine: typeof createStepEngine;
    http: {
        get: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        post: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        put: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        patch: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
        delete: (url: string, body?: any, options?: import('./plugins/http').HttpOptions) => Promise<any>;
    };
    trustedHTML: typeof trustedHTML;
};
export default brio;
