import { createExpressionScope } from './expression';
import { hydrateRoot } from '../dom/mount';
import { trustedHTML } from '../dom/types';
import type { ComponentDefinition, DomRuntime } from '../dom/types';
import { createScope, onCleanup } from './scope';
import { state } from '../reactivity/state';
import { combinedError } from './errors';
import type {
    AppOptions,
    BrioApp,
    BrioPlugin,
    MountHandle,
} from './types';
import {
    notifyAppCreated,
    notifyAppDisposed,
    notifyRootMounted,
    notifyRootUnmounted,
} from '../plugins/devtools-bridge';

const componentNamePattern = /^[a-z][a-z0-9]*-[a-z0-9-]+$/;
const activeMountRoots = new Set<Element>();

export function createApp<T extends Record<string, unknown> = Record<string, unknown>>(
    options: AppOptions<T> = {},
): BrioApp<T> {
    const appState = state((options.state?.() ?? {}) as T);
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

    const app: BrioApp<T> = {
        state: appState,
        components,
        router: options.router,
        get roots() {
            return roots;
        },
        component(name, definition) {
            if (disposed) throw new Error('Cannot register a component on a disposed Brio app.');
            const normalized = name.toLowerCase();
            if (!componentNamePattern.test(normalized))
                throw new TypeError(`Component name "${name}" must be a custom-element name such as "user-card".`);
            if (components.has(normalized))
                throw new Error(`Component "${normalized}" is already registered.`);
            if (!definition.template.trim())
                throw new TypeError(`Component "${normalized}" requires a non-empty template.`);
            components.set(normalized, definition);
            return app;
        },
        plugin(plugin) {
            if (disposed) throw new Error('Cannot install a plugin on a disposed Brio app.');
            if (plugins.has(plugin)) return app;
            plugins.add(plugin);
            const scope = createScope(appScope);
            try {
                scope.run(() => plugin(app));
            } catch (error) {
                plugins.delete(plugin);
                try {
                    scope.dispose();
                } catch (cleanupError) {
                    throw combinedError('Brio plugin installation and cleanup both failed.', [error, cleanupError]);
                }
                throw error;
            }
            return app;
        },
        mount(target) {
            if (disposed) throw new Error('Cannot mount a disposed Brio app.');
            const root = typeof target === 'string' ? document.querySelector(target) : target;
            if (!(root instanceof Element))
                throw new TypeError(`Brio mount target "${String(target)}" did not resolve to an element.`);
            if ([...activeMountRoots].some(mounted => mounted.contains(root) || root.contains(mounted)))
                throw new Error('Brio mount roots cannot be equal or nested; use one app root with child components.');
            if (root.hasAttribute('b-if') || root.hasAttribute('b-for'))
                throw new Error('b-if and b-for require a container root; wrap the structural directive in another element.');

            const originalAttributes = Array.from(root.attributes)
                .map(attribute => [attribute.name, attribute.value] as const);
            const originalChildren = Array.from(root.childNodes, child => child.cloneNode(true));

            const scope = createScope(appScope);
            let unmounted = false;
            const handle: MountHandle = {
                root,
                get unmounted() {
                    return unmounted;
                },
                unmount() {
                    if (unmounted) return;
                    unmounted = true;
                    try {
                        scope.dispose();
                    } finally {
                        roots.delete(handle);
                        activeMountRoots.delete(root);
                        notifyRootUnmounted(app, root);
                        for (const attribute of Array.from(root.attributes))
                            root.removeAttribute(attribute.name);
                        for (const [name, value] of originalAttributes)
                            root.setAttribute(name, value);
                        root.replaceChildren(...originalChildren.map(child => child.cloneNode(true)));
                    }
                },
            };
            roots.add(handle);
            activeMountRoots.add(root);
            notifyRootMounted(app, root);

            const context = createExpressionScope(
                { $data: appState, trustedHTML },
            );
            try {
                scope.run(() => {
                    if (options.router) {
                        const stopRouter = options.router.start(root);
                        onCleanup(stopRouter);
                    }
                    hydrateRoot(root, context, runtime);
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
        unmount() {
            const errors: unknown[] = [];
            for (const root of [...roots]) {
                try {
                    root.unmount();
                } catch (error) {
                    errors.push(error);
                }
            }
            if (errors.length) throw combinedError('One or more Brio app roots failed to unmount.', errors);
        },
        dispose() {
            if (disposed) return;
            let failure: unknown;
            try {
                app.unmount();
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
        for (const [name, definition] of Object.entries(options.components ?? {}))
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
