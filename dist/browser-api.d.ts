import { createApp, state, signal, computed, effect, batch, untrack, resource, createScope, onCleanup, getCurrentScope, trustedHTML } from './index.js';

declare const brio: {
    createApp: typeof createApp;
    state: typeof state;
    signal: typeof signal;
    computed: typeof computed;
    effect: typeof effect;
    batch: typeof batch;
    flush: () => void;
    untrack: typeof untrack;
    resource: typeof resource;
    createScope: typeof createScope;
    onCleanup: typeof onCleanup;
    getCurrentScope: typeof getCurrentScope;
    trustedHTML: typeof trustedHTML;
};
export default brio;
