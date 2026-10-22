import {
    ObjectConstructor,
    isString,
    getLength,
    createError,
    createTypeError,
    arrayFrom,
    objectEntries,
    isInstanceOf,
    deleteItem,
    includesItem,
    ATTRIBUTES,
} from './native';
import { getChildNodes, removeAttribute } from '../dom/native';
import { createExpressionScope } from './expression';
import { hydrateRoot } from '../dom/mount';
import { createInsert } from '../dom/insert';
import { getNodeOwner } from '../dom/ownership';
import { trustedHTML } from '../dom/types';
import type { ComponentDefinition, DomRuntime } from '../dom/types';
import { createScope, onCleanup } from './scope';
import { state } from '../reactivity/state';
import { flush } from '../reactivity/effect';
import { createScopedState } from './scoped-state';
import { combinedError } from './errors';
import { copyContextValues, emptyContextValues } from './context-values';
import { createRefs } from '../dom/refs';
import type {
    AppOptions,
    BrioApp,
    BrioPlugin,
    MountHandle,
    StoreMap,
} from './types';
import {
    notifyAppCreated,
    notifyAppDisposed,
    notifyRootMounted,
    notifyRootUnmounted,
} from '../plugins/devtools-bridge';

const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const activeMountRoots = new Set<Element>();

export function createApp<
    T extends Record<string, unknown> = Record<string, unknown>,
    S extends StoreMap = StoreMap,
>(
    options: AppOptions<T, S> = {},
): BrioApp<T, S> {
    const appState = state((options.state?.() ?? {}) as T);
    const stores = ObjectConstructor.freeze(copyContextValues(
        options.stores === undefined ? {} : options.stores, 'Brio stores',
    )) as Readonly<S>;
    const components = new Map<string, ComponentDefinition>();
    const roots = new Set<MountHandle>();
    const appScope = createScope();
    let disposed = false;
    const plugins = new Set<BrioPlugin>();
    const runtime: DomRuntime = {
        app: undefined,
        state: appState,
        components,
        router: options.router,
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
            for (const [prop, type] of objectEntries(definition.props ?? {}))
                if (!includesItem([Boolean, Number, String], type))
                    throw createTypeError(`Component "${normalized}" prop "${prop}" must be declared as Boolean, Number, or String.`);
            components.set(normalized, definition);
            return app;
        },
        plugin(plugin) {
            if (disposed) throw createError('Cannot install a plugin on a disposed Brio app.');
            if (plugins.has(plugin)) return app;
            plugins.add(plugin);
            const scope = createScope(appScope);
            try {
                scope.run(() => plugin(app));
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
            roots.add(handle);
            activeMountRoots.add(root);
            notifyRootMounted(app, root);

            const context = createExpressionScope(
                { $data: createScopedState(appState), $stores: stores, $provided: emptyContextValues, $ref: createRefs(), $route: options.router?.route, trustedHTML, flush },
            );
            try {
                scope.run(() => {
                    if (options.router) {
                        const stopRouter = options.router.start(root);
                        onCleanup(stopRouter);
                    }
                    hydrateRoot(root, context, { ...runtime, root });
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
        for (const plugin of options.plugins ?? []) app.plugin(plugin);
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
