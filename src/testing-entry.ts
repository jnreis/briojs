import { createApp } from './core/create-app';
import { createError, isString } from './core/native';
import { flush } from './reactivity/effect';
import type { AppOptions, BrioApp, MountHandle, StoreMap } from './core/types';

export type RenderOptions<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap> =
    AppOptions<T, S>;

export type Rendered<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap> = {
    /** The `<div>` the markup was rendered into, attached to `document.body`. */
    root: HTMLElement;
    app: BrioApp<T, S>;
    handle: MountHandle;
    /** Runs pending effects so the DOM reflects the latest state. */
    flush(): void;
    /** `root.querySelector`, throwing when nothing matches. */
    get<E extends Element = HTMLElement>(selector: string): E;
    /** Sets a control's value, dispatches `input` and `change`, then flushes. */
    type(target: string | Element, value: string): void;
    /** Clicks an element, then flushes. */
    click(target: string | Element): void;
    /** Disposes the app and removes the root. Safe to call more than once. */
    cleanup(): void;
};

/**
 * Mounts markup with a fresh app for a test. Needs a DOM on `globalThis`, such as jsdom or happy-dom.
 *
 * ```js
 * const view = renderBrio('<button b-copy="\'hi\'">Copy</button>', { plugins: [copyPlugin] });
 * view.click('button');
 * view.cleanup();
 * ```
 */
export function renderBrio<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap>(
    html: string,
    options: RenderOptions<T, S> = {},
): Rendered<T, S> {
    const document = (globalThis as { document?: Document }).document;
    if (!document)
        throw createError('renderBrio needs a DOM on globalThis. Run tests with jsdom or happy-dom (for example, the "global-jsdom" package).');
    const root = document.createElement('div');
    root.innerHTML = html;
    document.body.append(root);
    const app = createApp<T, S>(options);
    let handle: MountHandle;
    try {
        handle = app.mount(root);
    } catch (error) {
        app.dispose();
        root.remove();
        throw error;
    }
    flush();
    const get = <E extends Element = HTMLElement>(selector: string): E => {
        const element = root.querySelector<E>(selector);
        if (!element) throw createError(`renderBrio: nothing matches "${selector}".`);
        return element;
    };
    const element = (target: string | Element) => isString(target) ? get(target) : target;
    return {
        root,
        app,
        handle,
        flush,
        get,
        type(target, value) {
            const control = element(target) as HTMLInputElement;
            control.value = value;
            const view = control.ownerDocument.defaultView!;
            control.dispatchEvent(new view.Event('input', { bubbles: true }));
            control.dispatchEvent(new view.Event('change', { bubbles: true }));
            flush();
        },
        click(target) {
            (element(target) as HTMLElement).click();
            flush();
        },
        cleanup() {
            app.dispose();
            root.remove();
        },
    };
}
