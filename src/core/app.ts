import {
    ObjectConstructor,
    isString,
    getLength,
    createError,
    createTypeError,
    arrayFrom,
    objectEntries,
    isInstanceOf,
    isFunction,
    isBoolean,
    deleteItem,
    includesItem,
    ATTRIBUTES,
} from './native';
import { getChildNodes, removeAttribute } from '../dom/native';
import { createExpressionScope, ENGINE } from './expression';
import type { ExpressionEngine } from './expression';
import { hydrateRoot } from '../dom/mount';
import { createInsert } from '../dom/insert';
import { getNodeOwner } from '../dom/ownership';
import { trustedHTML, UNTRUSTED } from '../dom/types';
import type { ComponentDefinition, DomRuntime } from '../dom/types';
import { createScope, onCleanup } from './scope';
import { state } from '../reactivity/state';
import { flush } from '../reactivity/effect';
import { createScopedState } from './scoped-state';
import { combinedError } from './errors';
import { copyContextValues, emptyContextValues } from './context-values';
import { createRefs } from '../dom/refs';
import { checkPlugin, sharedPlugins } from './shared-plugins';
import type {
    AppOptions,
    BrioApp,
    BrioPlugin,
    BrioPluginObject,
    MountHandle,
    StoreMap,
} from './types';
import { createRegistry, registerDirective } from '../dom/directives/registry';
import type { DirectiveRegistry } from '../dom/directives/registry';
import {
    notifyAppCreated,
    notifyAppDisposed,
    notifyRootMounted,
    notifyRootUnmounted,
} from '../plugins/devtools-bridge';

const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const activeMountRoots = new Set<Element>();
const helperPattern = /^\$[A-Za-z_][\w]*$/;
const reservedHelpers = '$data $el $emit $event $index $props $provided $ref $route $stores $value'.split(' ');

/** How an app evaluates expressions, and whether it hydrates only templates defined in JavaScript. */
export type AppMode = {
    engine: ExpressionEngine;
    untrusted?: DomRuntime['untrusted'];
    /** Extra rules for component templates, run on every registration path. */
    checkComponent?: (name: string, template: unknown) => void;
};

/** Builds an app in the given mode. The public `createApp` functions supply the mode for their build. */
export function buildApp<
    T extends Record<string, unknown> = Record<string, unknown>,
    S extends StoreMap = StoreMap,
>(
    mode: AppMode,
    options: AppOptions<T, S> = {},
): BrioApp<T, S> {
    const { engine, untrusted, checkComponent } = mode;
    const { textInterpolation = true } = options;
    if (!isBoolean(textInterpolation))
        throw createTypeError('createApp textInterpolation must be true or false.');
    const appState = state((options.state?.() ?? {}) as T);
    const stores = ObjectConstructor.freeze(copyContextValues(
        options.stores === undefined ? {} : options.stores, 'Brio stores',
    )) as Readonly<S>;
    const components = new Map<string, ComponentDefinition>();
    const roots = new Set<MountHandle>();
    const appScope = createScope();
    let disposed = false;
    const plugins = new Set<BrioPlugin>();
    const pluginNames = new Set<string>();
    const helpers: Record<string, unknown> = {};
    const mountHooks: NonNullable<BrioPluginObject['onMount']>[] = [];
    let registry: DirectiveRegistry | undefined;
    let mounted = false;
    const beforeMount = (what: string) => {
        if (disposed) throw createError(`Cannot register ${what} on a disposed Brio app.`);
        if (mounted) throw createError(`Register ${what} before the app mounts, so every root hydrates with the same directives and helpers.`);
    };
    const installObject = (plugin: BrioPluginObject) => {
        const { name } = plugin;
        if (!isString(name) || !name.trim()) throw createTypeError('A Brio plugin object needs a name.');
        if (pluginNames.has(name)) throw createError(`A different Brio plugin named "${name}" is already installed.`);
        // Registration is all-or-nothing: a plugin that fails part-way leaves no directives, helpers, or components behind.
        const saved = [registry && { ...registry, exact: new Map(registry.exact), withArg: [...registry.withArg] },
            { ...helpers }, new Map(components), getLength(mountHooks)] as const;
        try {
            for (const definition of plugin.directives ?? []) addDirective(definition, `plugin "${name}"`);
            for (const [helper, value] of objectEntries(plugin.helpers ?? {})) app.helper(helper, value);
            for (const [component, definition] of objectEntries(plugin.components ?? {})) app.component(component, definition);
            if (plugin.onMount) mountHooks.push(plugin.onMount);
            plugin.setup?.(app);
            pluginNames.add(name);
        } catch (error) {
            registry = runtime.directives = saved[0];
            for (const key in helpers) delete helpers[key];
            ObjectConstructor.assign(helpers, saved[1]);
            components.clear();
            saved[2].forEach((definition, key) => components.set(key, definition));
            mountHooks.length = saved[3];
            throw error;
        }
    };
    const addDirective = (definition: Parameters<BrioApp['directive']>[0], owner: string) => {
        beforeMount('directives');
        registerDirective(registry ??= runtime.directives = createRegistry(), definition, owner);
    };
    const runtime: DomRuntime = {
        app: undefined,
        state: appState,
        components,
        router: options.router,
        textInterpolation,
        untrusted,
    };

    const app: BrioApp<T, S> = {
        state: appState,
        get stores() { return stores; },
        components,
        router: options.router,
        get roots() {
            return roots;
        },
        component(name, definition) {
            if (disposed) throw createError('Cannot register a component on a disposed Brio app.');
            const normalized = name.toLowerCase();
            if (!componentNamePattern.test(normalized))
                throw createTypeError(`Component name "${name}" must be a custom-element name such as "user-card".`);
            if (components.has(normalized))
                throw createError(`Component "${normalized}" is already registered.`);
            const template = definition.template;
            if (isString(template) ? !template.trim() : (template as Element)?.localName !== 'template')
                throw createTypeError(`Component "${normalized}" requires a non-empty template string, "#id" selector, or <template> element.`);
            checkComponent?.(normalized, template);
            for (const [prop, type] of objectEntries(definition.props ?? {}))
                if (!includesItem([Boolean, Number, String], type))
                    throw createTypeError(`Component "${normalized}" prop "${prop}" must be declared as Boolean, Number, or String.`);
            components.set(normalized, definition);
            return app;
        },
        directive(definition) {
            addDirective(definition, 'the app');
            return app;
        },
        helper(name, value) {
            beforeMount('helpers');
            if (!isString(name) || !helperPattern.test(name))
                throw createTypeError(`Helper name "${String(name)}" must start with "$", such as "$format".`);
            if (includesItem(reservedHelpers, name) || name in helpers)
                throw createError(`Helper "${name}" is already defined${includesItem(reservedHelpers, name) ? ' by Brio' : ''}.`);
            helpers[name] = value;
            return app;
        },
        use(plugin) {
            if (disposed) throw createError('Cannot install a plugin on a disposed Brio app.');
            if (plugins.has(plugin)) return app;
            checkPlugin(plugin);
            plugins.add(plugin);
            const scope = createScope(appScope);
            try {
                scope.run(() => isFunction(plugin) ? (plugin as (app: BrioApp) => void)(app) : installObject(plugin as BrioPluginObject));
            } catch (error) {
                deleteItem(plugins, plugin);
                try {
                    scope.dispose();
                } catch (cleanupError) {
                    throw combinedError('Brio plugin installation and cleanup both failed.', [error, cleanupError]);
                }
                throw error;
            }
            return app;
        },
        insert(target, placement, content, insertOptions) {
            if (disposed) throw createError('Cannot insert into a disposed Brio app.');
            const matches = [...roots].filter(handle => isString(target)
                ? handle.root.matches(target) || Boolean(handle.root.querySelector(target))
                : isInstanceOf(target, Node) && (handle.root.contains(target) || getNodeOwner(target)?.runtime.root === handle.root));
            if (getLength(matches) !== 1)
                throw createError('Brio insert target must belong to exactly one mounted root of this app.');
            const owner = getNodeOwner(matches[0].root);
            if (!owner) throw createError('Brio insert requires an active mounted Brio root.');
            return createInsert(owner.runtime)(target, placement, content, insertOptions);
        },
        mount(target) {
            if (disposed) throw createError('Cannot mount a disposed Brio app.');
            const root = isString(target) ? document.querySelector(target) : target;
            if (!isInstanceOf(root, Element))
                throw createTypeError(`Brio mount target "${String(target)}" did not resolve to an element.`);
            if ([...activeMountRoots].some(mounted => mounted.contains(root) || root.contains(mounted)))
                throw createError('Brio mount roots cannot be equal or nested; use one app root with child components.');
            if (arrayFrom(root[ATTRIBUTES]).some(attribute =>
                includesItem(['b-if', 'b-for', 'b-template'], attribute.name.split('.')[0])))
                throw createError('b-if, b-for and b-template require a container root; wrap the structural directive in another element.');

            const originalAttributes = arrayFrom(root[ATTRIBUTES])
                .map(attribute => [attribute.name, attribute.value] as const);
            const originalChildren = arrayFrom(getChildNodes(root), child => child.cloneNode(true));

            const scope = createScope(appScope);
            let unmounted = false;
            const handle: MountHandle = {
                root,
                get unmounted() {
                    return unmounted;
                },
                unmount(options = {}) {
                    if (unmounted) return;
                    unmounted = true;
                    try {
                        scope.dispose();
                    } finally {
                        deleteItem(roots, handle);
                        deleteItem(activeMountRoots, root);
                        notifyRootUnmounted(app, root);
                        if (options.restore !== false) {
                            for (const attribute of arrayFrom(root.attributes))
                                removeAttribute(root, attribute.name);
                            for (const [name, value] of originalAttributes)
                                root.setAttribute(name, value);
                            root.replaceChildren(...originalChildren.map(child => child.cloneNode(true)));
                        }
                    }
                },
            };
            mounted = true;
            roots.add(handle);
            activeMountRoots.add(root);
            notifyRootMounted(app, root);

            const context = createExpressionScope(
                { ...helpers, $data: createScopedState(appState), $stores: stores, $provided: emptyContextValues, $ref: createRefs(), $route: options.router?.route, trustedHTML, flush,
                    [ENGINE]: engine, ...untrusted ? { [UNTRUSTED]: true } : {} },
            );
            try {
                scope.run(() => {
                    if (options.router) {
                        const stopRouter = options.router.start(root);
                        onCleanup(stopRouter);
                    }
                    hydrateRoot(root, context, { ...runtime, root });
                    for (const hook of mountHooks) {
                        const cleanup = hook(root, app as BrioApp);
                        if (isFunction(cleanup)) onCleanup(cleanup as () => void);
                    }
                });
            } catch (error) {
                try {
                    handle.unmount();
                } catch (cleanupError) {
                    throw combinedError('Brio mounting and cleanup both failed.', [error, cleanupError]);
                }
                throw error;
            }
            return handle;
        },
        unmount(options) {
            const errors: unknown[] = [];
            for (const root of [...roots]) {
                try {
                    root.unmount(options);
                } catch (error) {
                    errors.push(error);
                }
            }
            if (getLength(errors)) throw combinedError('One or more Brio app roots failed to unmount.', errors);
        },
        dispose(options) {
            if (disposed) return;
            let failure: unknown;
            try {
                app.unmount(options);
            } catch (error) {
                failure = error;
            }
            disposed = true;
            try {
                appScope.dispose();
            } catch (error) {
                failure = failure === undefined
                    ? error
                    : combinedError('Brio app unmount and disposal both failed.', [failure, error]);
            }
            components.clear();
            notifyAppDisposed(app);
            if (failure !== undefined) throw failure;
        },
    };
    runtime.app = app;
    try {
        for (const [name, definition] of objectEntries(options.components ?? {}))
            app.component(name, definition);
        for (const plugin of [...sharedPlugins, options.router?.plugin, ...options.plugins ?? []])
            if (plugin) app.use(plugin);
    } catch (error) {
        try {
            app.dispose();
        } catch (cleanupError) {
            throw combinedError('Brio app initialization and cleanup both failed.', [error, cleanupError]);
        }
        throw error;
    }
    appScope.run(() => notifyAppCreated(app, appState));
    return app;
}
