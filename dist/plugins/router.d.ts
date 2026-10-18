import { Signal } from '../reactivity/types';

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
    readonly base: string;
    readonly current: Signal<RouteMatch | null>;
    href(path: string): string;
    match(path: string): RouteMatch | null;
    navigate(path: string, options?: {
        replace?: boolean;
    }): boolean;
    start(root: Element): () => void;
};
export type RouterOptions = {
    base?: string;
};
export declare function createRouter(routes: RouteDefinition[], options?: RouterOptions): Router;
