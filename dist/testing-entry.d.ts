import { AppOptions, BrioApp, MountHandle, StoreMap } from './core/types.js';
export type RenderOptions<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap> = AppOptions<T, S>;
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
export declare function renderBrio<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap>(html: string, options?: RenderOptions<T, S>): Rendered<T, S>;
