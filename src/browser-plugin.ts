import type api from './browser-api';

export function installBrowserPlugin(plugin: object): void {
    const brio = (window as Window & { brio?: typeof api }).brio;
    if (!brio || typeof brio.createApp !== 'function')
        throw new Error('Load the Brio core bundle before optional plugin scripts.');
    Object.assign(brio, plugin);
}
