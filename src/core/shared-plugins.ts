import { createTypeError, isFunction, isObjectType } from './native';
import type { BrioPlugin } from './types';

/** Plugins added with the browser global `brio.use()`; every app created afterwards installs them first. */
export const sharedPlugins: BrioPlugin[] = [];

export function checkPlugin(plugin: unknown): void {
    if (!isFunction(plugin) && !(plugin && isObjectType(plugin)))
        throw createTypeError('A Brio plugin must be a function or a plugin object.');
}
