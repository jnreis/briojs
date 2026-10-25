import {
    createApp,
    state,
    signal,
    computed,
    effect,
    batch,
    flush,
    untrack,
    resource,
    createScope,
    onCleanup,
    getCurrentScope,
    trustedHTML,
    defineDirective,
    definePlugin,
} from './index';
import { checkPlugin, sharedPlugins } from './core/shared-plugins';
import { isFunction, isString } from './core/native';
import type { BrioPlugin } from './core/types';

const brio = {
    createApp,
    state,
    signal,
    computed,
    effect,
    batch,
    flush,
    untrack,
    resource,
    createScope,
    onCleanup,
    getCurrentScope,
    trustedHTML,
    defineDirective,
    definePlugin,
    /** Installs a plugin on every app created afterwards. Add-on scripts call this for you. */
    use(plugin: BrioPlugin) {
        checkPlugin(plugin);
        const name = (plugin as { name?: unknown }).name;
        // A plugin object re-added under the same name (e.g. an add-on script loaded twice) replaces the earlier one.
        const index = sharedPlugins.findIndex(added => added === plugin
            || (!isFunction(plugin) && !isFunction(added) && isString(name) && added.name === name));
        if (index < 0) sharedPlugins.push(plugin);
        else sharedPlugins[index] = plugin;
        return brio;
    },
};

export default brio;
