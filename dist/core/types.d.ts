import { ComponentDefinition } from '../dom/types.js';
import { Router } from '../plugins/router.js';
import { DirectiveDefinition } from '../dom/directives/registry.js';
export type BrioPluginObject = {
    /** Unique per app; by convention the package name, such as `brio-plugin-tooltip`. */
    name: string;
    directives?: DirectiveDefinition[];
    /** `$`-prefixed names available in every expression of the app. */
    helpers?: Record<string, unknown>;
    components?: ComponentMap;
    /** Runs once at installation, inside a scope that lives until the app is disposed. */
    setup?(app: BrioApp): void;
    /** Runs after each root hydrates, inside the root's scope; the returned function runs when the root unmounts. */
    onMount?(root: Element, app: BrioApp): (() => void) | void;
};
export type BrioPlugin = ((app: BrioApp) => void) | BrioPluginObject;
export type ComponentMap = Record<string, ComponentDefinition>;
export type StoreMap = Record<string, unknown>;
export type AppOptions<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap> = {
    state?: () => T;
    stores?: S;
    components?: ComponentMap;
    router?: Router;
    plugins?: BrioPlugin[];
};
export type UnmountOptions = {
    restore?: boolean;
};
export type MountHandle = {
    readonly root: Element;
    readonly unmounted: boolean;
    unmount(options?: UnmountOptions): void;
};
export type InsertPlacement = 'before' | 'after' | 'prepend' | 'append' | 'replaceWith' | 'replaceChildren' | 'textContent';
export type InsertOptions = {
    data?: Record<string, unknown>;
};
export type InsertHandle = {
    readonly nodes: readonly Node[];
    readonly removed: boolean;
    remove(): void;
};
export type Insert = (target: Node | string, placement: InsertPlacement, content: string | Node, options?: InsertOptions) => InsertHandle;
export type BrioApp<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap> = {
    readonly state: T;
    readonly stores: Readonly<S>;
    readonly components: Map<string, ComponentDefinition>;
    readonly roots: ReadonlySet<MountHandle>;
    readonly router?: Router;
    component(name: string, definition: ComponentDefinition): BrioApp<T, S>;
    /** Installs a plugin on this app. Installing the same plugin again does nothing. */
    use(plugin: BrioPlugin): BrioApp<T, S>;
    /** Registers a custom directive for this app. Must be called before the first mount. */
    directive(definition: DirectiveDefinition): BrioApp<T, S>;
    /** Adds a `$`-prefixed name to every expression in this app. Must be called before the first mount. */
    helper(name: string, value: unknown): BrioApp<T, S>;
    mount(target: Element | string): MountHandle;
    insert: Insert;
    unmount(options?: UnmountOptions): void;
    dispose(options?: UnmountOptions): void;
};
