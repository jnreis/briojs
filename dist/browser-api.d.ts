import { createApp, state, signal, computed, effect, batch, createScope, onCleanup, getCurrentScope, trustedHTML } from './index';

declare const brio: {
    createApp: typeof createApp;
    state: typeof state;
    signal: typeof signal;
    computed: typeof computed;
    effect: typeof effect;
    batch: typeof batch;
    flush: () => void;
    createScope: typeof createScope;
    onCleanup: typeof onCleanup;
    getCurrentScope: typeof getCurrentScope;
    trustedHTML: typeof trustedHTML;
};
export default brio;
