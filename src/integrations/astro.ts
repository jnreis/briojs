import { copyContextValues } from '../core/context-values';
import { combinedError } from '../core/errors';
import { evaluate } from '../core/expression';
import type { BrioApp } from '../core/types';

export type AstroAppProps = Readonly<Record<string, unknown>>;
export type AstroApp = Pick<BrioApp, 'roots' | 'mount' | 'dispose'>;
export type AstroAppFactory = (root: Element, props: AstroAppProps) => AstroApp;
const lazyMarker = Symbol('brio.astro.lazy');
export type LazyAstroApp = {
    readonly [lazyMarker]: true;
    readonly load: () => Promise<{ default: AstroAppFactory }>;
};
export type AstroAppRegistry = Record<string, AstroAppFactory | LazyAstroApp>;
export type AstroEnhanceOptions = {
    apps: AstroAppRegistry;
    onError: (error: unknown, root: Element) => void;
};
export type AstroEnhancement = { dispose(): void };

export function lazyApp(load: LazyAstroApp['load']): LazyAstroApp {
    if (typeof load !== 'function') throw new TypeError('lazyApp requires a module loader.');
    return Object.freeze({ [lazyMarker]: true as const, load });
}

const installations = new WeakSet<Document>();
const ownedApps = new WeakSet<AstroApp>();
const persistAttribute = 'data-astro-transition-persist';
type Island = { root: Element; app?: AstroApp; active: boolean };

export function enhanceAstro(options: AstroEnhanceOptions): AstroEnhancement {
    if (typeof document === 'undefined') throw new Error('enhanceAstro requires a browser document.');
    if (!options || typeof options.onError !== 'function')
        throw new TypeError('enhanceAstro requires onError(error, root).');
    const apps: AstroAppRegistry = Object.create(null);
    for (const [name, entry] of Object.entries(copyContextValues(options.apps, 'Astro apps'))) {
        if (!name.trim() || (!isFactory(entry) && !isLazy(entry)))
            throw new TypeError(`Invalid Astro app registration "${name}".`);
        apps[name] = entry;
    }
    const doc = document;
    if (installations.has(doc)) throw new Error('Brio Astro enhancement is already installed.');
    installations.add(doc);
    const islands = new Map<Element, Island>();
    const loads = new Map<LazyAstroApp, Promise<AstroAppFactory>>();
    let disposed = false;
    const report = (error: unknown, root: Element) => {
        try {
            options.onError(error, root);
        } catch (callbackError) {
            queueMicrotask(() => { throw callbackError; });
        }
    };
    const release = (island: Island, restore: boolean) => {
        island.active = false;
        islands.delete(island.root);
        if (island.app) island.app.dispose({ restore });
    };
    const mount = (island: Island, factory: AstroAppFactory, props: AstroAppProps) => {
        if (disposed || !island.active || !doc.contains(island.root)) return;
        const app = factory(island.root, props);
        if (!app || typeof app.mount !== 'function' || typeof app.dispose !== 'function' ||
            !app.roots || typeof app.roots.size !== 'number')
            throw new TypeError('Astro app factory must return a fresh unmounted Brio app.');
        if (ownedApps.has(app) || app.roots.size)
            throw new TypeError('Astro app factory must return a fresh unmounted Brio app.');
        ownedApps.add(app);
        island.app = app;
        // A factory can synchronously initiate navigation or dispose the integration.
        if (disposed || !island.active || !doc.contains(island.root)) {
            try { app.dispose(); } catch (error) { report(error, island.root); }
            return;
        }
        try {
            app.mount(island.root);
        } catch (error) {
            try {
                app.dispose();
            } catch (cleanupError) {
                throw combinedError('Astro app mounting and cleanup failed.', [error, cleanupError]);
            }
            throw error;
        }
    };
    const fail = (island: Island, error: unknown) => {
        if (!disposed && island.active) report(error, island.root);
    };
    const discover = () => {
        if (disposed) return;
        for (const island of islands.values()) {
            if (!doc.contains(island.root)) {
                try { release(island, false); } catch (error) { report(error, island.root); }
            }
        }
        const roots = Array.from(doc.querySelectorAll('[b-app]'));
        for (const root of roots) {
            if (islands.has(root)) continue;
            const island: Island = { root, active: true };
            islands.set(root, island);
            try {
                if (root.parentElement?.closest('[b-app]') || root.querySelector('[b-app]'))
                    throw new Error('Brio Astro islands cannot be nested.');
                const name = root.getAttribute('b-app')!;
                if (!Object.prototype.hasOwnProperty.call(apps, name))
                    throw new Error(`Unknown Brio Astro app "${name}".`);
                const source = root.getAttribute('b-props');
                const props = Object.freeze(copyContextValues(
                    source === null ? {} : evaluate(source, { $el: root }), 'b-props',
                ));
                const entry = apps[name];
                if (typeof entry === 'function') {
                    mount(island, entry, props);
                } else if (isLazy(entry)) {
                    let pending = loads.get(entry);
                    if (!pending) {
                        pending = Promise.resolve().then(() => entry.load()).then(module => {
                            if (typeof module?.default !== 'function')
                                throw new TypeError('Lazy Astro module must default-export an app factory.');
                            return module.default;
                        });
                        loads.set(entry, pending);
                    }
                    void pending.then(factory => {
                        try { mount(island, factory, props); } catch (error) { fail(island, error); }
                    }, error => fail(island, error));
                }
            } catch (error) {
                fail(island, error);
            }
        }
    };
    const beforeSwap = (event: Event) => {
        const incoming: unknown = 'newDocument' in event ? event.newDocument : undefined;
        if (!(incoming instanceof Document)) {
            for (const island of islands.values())
                report(new TypeError('Astro before-swap requires newDocument.'), island.root);
            return;
        }
        const names = new Set(Array.from(incoming.querySelectorAll(`[${persistAttribute}]`),
            element => element.getAttribute(persistAttribute)));
        for (const island of islands.values()) {
            let ancestor: Element | null = island.root;
            let retained = false;
            while (ancestor) {
                if (ancestor.hasAttribute(persistAttribute) && names.has(ancestor.getAttribute(persistAttribute))) {
                    retained = true;
                    break;
                }
                ancestor = ancestor.parentElement;
            }
            if (!retained) {
                try { release(island, false); } catch (error) { report(error, island.root); }
            }
        }
    };
    doc.addEventListener('astro:before-swap', beforeSwap);
    doc.addEventListener('astro:page-load', discover);
    discover();
    return {
        dispose() {
            if (disposed) return;
            disposed = true;
            doc.removeEventListener('astro:before-swap', beforeSwap);
            doc.removeEventListener('astro:page-load', discover);
            const errors: unknown[] = [];
            for (const island of islands.values()) {
                try { release(island, true); } catch (error) { errors.push(error); }
            }
            installations.delete(doc);
            if (errors.length) throw combinedError('Brio Astro disposal failed.', errors);
        },
    };
}

function isLazy(value: unknown): value is LazyAstroApp {
    return value !== null && typeof value === 'object' &&
        lazyMarker in value && value[lazyMarker] === true &&
        'load' in value && typeof value.load === 'function';
}

function isFactory(value: unknown): value is AstroAppFactory {
    return typeof value === 'function';
}
