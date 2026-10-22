import { Signal } from '../reactivity/types.js';

export type RouteMatch = {
    /** Matched application pathname, without the base (still percent-encoded). */
    path: string;
    params: Record<string, string>;
    /** Query string values; a repeated key keeps its last value. */
    query: Record<string, string>;
    /** Fragment including `#`, or `''`. Always `''` in hash mode. */
    hash: string;
    /** `path` + query + hash: pass it back to `navigate()` to return here. */
    fullPath: string;
    component: string;
};
/** Returns `true` to allow, `false` to block, or an application path to redirect to. Runs reactively. */
export type RouteGuard = (to: RouteMatch) => boolean | string;
export type RouteDefinition = {
    /** `/static`, `/items/:id`, or `*` for a fallback that matches every other path. */
    path: string;
    /** Rendered by `b-router-outlet`; without one (and no redirect) the route matches and the outlet stays empty. */
    component?: string;
    redirect?: string | ((to: RouteMatch) => string);
    guard?: RouteGuard;
};
/** A reactive mirror of `current`; `matched` is false when no route is shown. */
export type RouteState = Readonly<Omit<RouteMatch, 'params' | 'query'> & {
    matched: boolean;
    params: Readonly<Record<string, string>>;
    query: Readonly<Record<string, string>>;
}>;
export type Router = {
    readonly base: string;
    readonly mode: 'history' | 'hash';
    readonly current: Signal<RouteMatch | null>;
    readonly route: RouteState;
    href(path: string): string;
    match(path: string): RouteMatch | null;
    navigate(path: string, options?: {
        replace?: boolean;
    }): boolean;
    start(root: Element): () => void;
};
export type RouterOptions = {
    base?: string;
    mode?: 'history' | 'hash';
    guard?: RouteGuard;
};
export declare function createRouter(routes: RouteDefinition[], options?: RouterOptions): Router;
