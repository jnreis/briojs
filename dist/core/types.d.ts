import { ComponentDefinition } from '../dom/types';
import { Router } from '../plugins/router';

export type BrioPlugin = (app: BrioApp) => void;
export type ComponentMap = Record<string, ComponentDefinition>;
export type AppOptions<T extends Record<string, unknown> = Record<string, unknown>> = {
    state?: () => T;
    components?: ComponentMap;
    router?: Router;
    plugins?: BrioPlugin[];
};
export type MountHandle = {
    readonly root: Element;
    readonly unmounted: boolean;
    unmount(): void;
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
export type BrioApp<T extends Record<string, unknown> = Record<string, unknown>> = {
    readonly state: T;
    readonly components: Map<string, ComponentDefinition>;
    readonly roots: ReadonlySet<MountHandle>;
    readonly router?: Router;
    component(name: string, definition: ComponentDefinition): BrioApp<T>;
    plugin(plugin: BrioPlugin): BrioApp<T>;
    mount(target: Element | string): MountHandle;
    insert: Insert;
    unmount(): void;
    dispose(): void;
};
