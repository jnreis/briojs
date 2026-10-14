import type { ComponentDefinition } from '../dom/types';
import type { Router } from '../plugins/router';

export type BrioPlugin = (app: BrioApp) => void;
export type ComponentMap = Record<string, ComponentDefinition>;
export type StoreMap = Record<string, unknown>;

export type AppOptions<
    T extends Record<string, unknown> = Record<string, unknown>,
    S extends StoreMap = StoreMap,
> = {
    state?: () => T;
    stores?: S;
    components?: ComponentMap;
    router?: Router;
    plugins?: BrioPlugin[];
};

export type MountHandle = {
    readonly root: Element;
    readonly unmounted: boolean;
    unmount(): void;
};

export type InsertPlacement = 'before' | 'after' | 'prepend' | 'append' |
    'replaceWith' | 'replaceChildren' | 'textContent';
export type InsertOptions = { data?: Record<string, unknown> };
export type InsertHandle = {
    readonly nodes: readonly Node[];
    readonly removed: boolean;
    remove(): void;
};
export type Insert = (
    target: Node | string,
    placement: InsertPlacement,
    content: string | Node,
    options?: InsertOptions,
) => InsertHandle;

export type BrioApp<
    T extends Record<string, unknown> = Record<string, unknown>,
    S extends StoreMap = StoreMap,
> = {
    readonly state: T;
    readonly stores: Readonly<S>;
    readonly components: Map<string, ComponentDefinition>;
    readonly roots: ReadonlySet<MountHandle>;
    readonly router?: Router;
    component(name: string, definition: ComponentDefinition): BrioApp<T, S>;
    plugin(plugin: BrioPlugin): BrioApp<T, S>;
    mount(target: Element | string): MountHandle;
    insert: Insert;
    unmount(): void;
    dispose(): void;
};
