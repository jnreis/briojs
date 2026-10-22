import { ComponentDefinition } from '../dom/types.js';
import { Router } from '../plugins/router.js';

export type BrioPlugin = (app: BrioApp) => void;
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
    plugin(plugin: BrioPlugin): BrioApp<T, S>;
    mount(target: Element | string): MountHandle;
    insert: Insert;
    unmount(options?: UnmountOptions): void;
    dispose(options?: UnmountOptions): void;
};
