import { createApp, state, signal, computed, effect, batch, untrack, resource, createScope, onCleanup, getCurrentScope, trustedHTML } from './index.js';
import { BrioPlugin } from './core/types.js';

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
    defineDirective: <D extends import('./index.js').DirectiveDefinition>(definition: D) => D;
    definePlugin: <P extends import('./index.js').BrioPluginObject>(plugin: P) => P;
    /** Installs a plugin on every app created afterwards. Add-on scripts call this for you. */
    use(plugin: BrioPlugin): /*elided*/ any;
};
export default brio;
