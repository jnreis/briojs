import { BrioPlugin } from './types.js';
/** Plugins added with the browser global `brio.use()`; every app created afterwards installs them first. */
export declare const sharedPlugins: BrioPlugin[];
export declare function checkPlugin(plugin: unknown): void;
