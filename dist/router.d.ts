import { Signal } from './reactivity';

export type RouteDefinition = {
    path: string;
    component: string;
};
export type RouteMatch = {
    path: string;
    params: Record<string, string>;
    component: string;
};
export type Router = {
    readonly current: Signal<RouteMatch | null>;
    match(path: string): RouteMatch | null;
    navigate(path: string, options?: {
        replace?: boolean;
    }): boolean;
    start(root: Element): () => void;
};
export declare function createRouter(routes: RouteDefinition[]): Router;
