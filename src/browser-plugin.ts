import { isFunction, ObjectConstructor, createError } from './core/native';
import type api from './browser-api';

export function installBrowserPlugin(plugin: object): void {
    const brio = (window as Window & { brio?: typeof api }).brio;
    if (!brio || !isFunction(brio.createApp))
        throw createError('Load the Brio core bundle before optional plugin scripts.');
    ObjectConstructor.assign(brio, plugin);
}
