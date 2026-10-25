import { BrioPlugin } from './core/types.js';

/** Adds an add-on's exports to `window.brio` and installs its plugin on every app created afterwards. */
export declare function installBrowserPlugin(exports: object, plugin?: BrioPlugin): void;
