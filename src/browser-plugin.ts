import { isFunction, ObjectConstructor, createError } from './core/native';
import type { BrioPlugin } from './core/types';
import type { BrowserApi } from './browser-api';

/** Adds an add-on's exports to `window.brio` and installs its plugin on every app created afterwards. */
export function installBrowserPlugin(exports: object, plugin?: BrioPlugin): void {
    const brio = (window as Window & { brio?: BrowserApi }).brio;
    if (!brio || !isFunction(brio.use))
        throw createError('Load the Brio 5 core bundle (brio.min.js or brio.csp.min.js) before Brio add-on scripts.');
    ObjectConstructor.assign(brio, exports);
    if (plugin) brio.use(plugin);
}
