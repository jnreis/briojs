import { state, signal, computed, effect, batch, untrack, resource, createScope, onCleanup, getCurrentScope, trustedHTML } from './exports.js';
import { createApp as CreateApp } from './core/create-app.js';
import { BrioPlugin } from './core/types.js';
/** Builds the `window.brio` API around the given createApp, so the CSP bundles never load the eval engine. */
export declare function createBrowserApi(createApp: typeof CreateApp): {
    createApp: typeof CreateApp;
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
    defineDirective: <D extends import('./exports.js').DirectiveDefinition>(definition: D) => D;
    definePlugin: <P extends import('./exports.js').BrioPluginObject>(plugin: P) => P;
    /** Installs a plugin on every app created afterwards. Add-on scripts call this for you. */
    use(plugin: BrioPlugin): /*elided*/ any;
};
export type BrowserApi = ReturnType<typeof createBrowserApi>;
