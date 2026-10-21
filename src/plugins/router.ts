import {
    isInstanceOf, isString, getLength, createTypeError, createError, deleteItem, includesItem, startsWith,
} from '../core/native';

import { addEventListener, removeEventListener } from '../dom/native';
import { signal } from '../reactivity/state';
import type { Signal } from '../reactivity/types';

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
    navigate(path: string, options?: { replace?: boolean }): boolean;
    start(root: Element): () => void;
};

export type RouterOptions = { base?: string };

type Segment = { value: string; parameter: boolean };

const origin = (): string => globalThis.location?.origin ?? 'http://localhost';
const isAbsolutePath = (path: unknown): path is string =>
    isString(path) && startsWith(path, '/') && !startsWith(path, '//') &&
    !/[\\\u0000-\u001f\u007f]/u.test(path);
const hasDotSegments = (path: string): boolean => path.split('/').some(segment =>
    includesItem(['.', '..'], segment.replace(/%2e/gi, '.')));

function normalizeBase(base: string): string {
    if (!isAbsolutePath(base) || /[ ?#]/u.test(base) ||
        hasDotSegments(base) || base.includes('//'))
        throw createTypeError('Router base must be an absolute pathname without an origin, query, fragment, or dot segments.');
    const pathname = new URL(base, 'http://localhost').pathname;
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

const parsePath = (path: string): Segment[] => path.split('/').filter(Boolean).map(part => {
    if (startsWith(part, ':')) {
        const value = part.slice(1);
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value))
            throw createTypeError(`Invalid route parameter "${part}" in "${path}".`);
        return { value, parameter: true };
    }
    try {
        return { value: decodeURIComponent(part), parameter: false };
    } catch (error) {
        throw new TypeError(`Invalid encoded path segment "${part}" in "${path}".`, { cause: error });
    }
});

export function createRouter(routes: RouteDefinition[], options: RouterOptions = {}): Router {
    const base = normalizeBase(options.base ?? '/');
    const prefix = base === '/' ? '' : base.slice(0, -1);
    const appPath = (pathname: string): string | null => {
        if (!prefix) return pathname;
        if (pathname === prefix) return '/';
        return startsWith(pathname, base) ? pathname.slice(getLength(prefix)) : null;
    };
    const href = (path: string): string => {
        if (!isAbsolutePath(path))
            throw createTypeError('Router application paths must start with a single "/" and contain no origin or backslashes.');
        const url = new URL(`${prefix}${path}`, origin());
        if (appPath(url.pathname) === null)
            throw createTypeError('Router application path cannot escape its base.');
        return `${url.pathname}${url.search}${url.hash}`;
    };
    const seenPaths = new Set<string>();
    const compiled = routes.map(route => {
        if (!isAbsolutePath(route.path) || route.path.includes('?') || route.path.includes('#') ||
            hasDotSegments(route.path))
            throw createTypeError(`Route path "${route.path}" must be an absolute pathname without a query or fragment.`);
        if (!route.component) throw createTypeError(`Route "${route.path}" requires a component name.`);
        const segments = parsePath(route.path);
        const signature = segments.map(segment => segment.parameter ? ':' : segment.value).join('/');
        if (seenPaths.has(signature)) throw createError(`Duplicate route pattern "${route.path}".`);
        seenPaths.add(signature);
        return { route, segments };
    }).sort((left, right) =>
        getLength(right.segments.filter(segment => !segment.parameter)) -
        getLength(left.segments.filter(segment => !segment.parameter))
    );
    const current = signal<RouteMatch | null>(null);
    const mountedRoots = new Set<Element>();
    let listening = false;

    const onPopState = () => {
        const url = new URL(location.href);
        current.value = match(url.href);
    };

    const onClick = (event: Event) => {
        if (!(isInstanceOf(event, MouseEvent)) || event.defaultPrevented ||
            event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = event.target;
        if (!(isInstanceOf(target, Element))) return;
        const anchor = target.closest('a[href]');
        if (!(isInstanceOf(anchor, HTMLAnchorElement)) || anchor.target || anchor.hasAttribute('download')) return;
        if (![...mountedRoots].some(root => root.contains(anchor))) return;
        const url = new URL(anchor.href, location.href);
        if (url.origin !== location.origin || !match(url.href)) return;
        if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
        event.preventDefault();
        commit(url, false);
    };

    const match = (path: string): RouteMatch | null => {
        const url = new URL(path, globalThis.location?.href ?? 'http://localhost/');
        if (url.origin !== origin()) return null;
        const pathname = appPath(url.pathname);
        if (pathname === null) return null;
        const requested = pathname.split('/').filter(Boolean);
        for (const candidate of compiled) {
            if (getLength(candidate.segments) !== getLength(requested)) continue;
            const params: Record<string, string> = {};
            let valid = true;
            for (let index = 0; index < getLength(requested); index++) {
                const part = candidate.segments[index];
                let decoded: string;
                try {
                    decoded = decodeURIComponent(requested[index]);
                } catch {
                    valid = false;
                    break;
                }
                if (!part.parameter) {
                    if (part.value !== decoded) {
                        valid = false;
                        break;
                    }
                    continue;
                }
                params[part.value] = decoded;
            }
            if (valid) return { path: pathname, params, component: candidate.route.component };
        }
        return null;
    };

    const commit = (url: URL, replace: boolean): boolean => {
        const route = match(url.href);
        if (!route) return false;
        if (replace) history.replaceState(null, '', url.href);
        else history.pushState(null, '', url.href);
        current.value = route;
        return true;
    };

    const navigate = (path: string, options: { replace?: boolean } = {}): boolean =>
        commit(new URL(href(path), origin()), Boolean(options.replace));

    const start = (root: Element) => {
        mountedRoots.add(root);
        if (!listening) {
            listening = true;
            addEventListener(globalThis, 'popstate', onPopState);
            addEventListener(document, 'click', onClick);
            onPopState();
        }
        return () => {
            deleteItem(mountedRoots, root);
            if (!mountedRoots.size && listening) {
                listening = false;
                removeEventListener(globalThis, 'popstate', onPopState);
                removeEventListener(document, 'click', onClick);
            }
        };
    };

    return { base, current, href, match, navigate, start };
}
