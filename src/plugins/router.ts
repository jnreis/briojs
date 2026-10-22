import {
    isInstanceOf, isString, getLength, createTypeError, createError, deleteItem, includesItem, startsWith,
    objectConstructor, objectKeys,
} from '../core/native';

import { addEventListener, removeEventListener } from '../dom/native';
import { signal, state } from '../reactivity/state';
import { batch, effect, untrack } from '../reactivity/effect';
import type { Signal } from '../reactivity/types';

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
    navigate(path: string, options?: { replace?: boolean }): boolean;
    start(root: Element): () => void;
};

export type RouterOptions = { base?: string; mode?: 'history' | 'hash'; guard?: RouteGuard };

type Segment = { value: string; parameter: boolean };
type Compiled = { route: RouteDefinition; segments: Segment[] };

const MAX_REDIRECTS = 10;
const FALLBACK = '*';
const origin = (): string => globalThis.location?.origin ?? 'http://localhost';
const isAbsolutePath = (path: unknown): path is string =>
    isString(path) && startsWith(path, '/') && !startsWith(path, '//') &&
    !/[\\\u0000-\u001f\u007f]/u.test(path);
const hasDotSegments = (path: string): boolean => path.split('/').some(segment =>
    includesItem(['.', '..'], segment.replace(/%2e/gi, '.')));
const sameRecord = (left: Record<string, string>, right: Record<string, string>): boolean =>
    getLength(objectKeys(left)) === getLength(objectKeys(right)) && objectKeys(left).every(key => left[key] === right[key]);

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
    const hashMode = options.mode === 'hash';
    if (options.mode !== undefined && !hashMode && options.mode !== 'history')
        throw createTypeError('Router mode must be "history" or "hash".');
    const base = normalizeBase(options.base ?? '/');
    const prefix = base === '/' ? '' : base.slice(0, -1);
    const appPath = (pathname: string): string | null => {
        if (pathname === `${base}index.html`) return '/';
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
        if (hashMode) return `#${url.pathname.slice(getLength(prefix)) || '/'}${url.search}${url.hash}`;
        return `${url.pathname}${url.search}${url.hash}`;
    };
    const seenPaths = new Set<string>();
    let fallback: Compiled | undefined;
    const compiled: Compiled[] = [];
    for (const route of routes) {
        if (!route.component && route.redirect === undefined)
            throw createTypeError(`Route "${route.path}" requires a component name or a redirect.`);
        if (route.path === FALLBACK) {
            if (fallback) throw createError('Duplicate route pattern "*".');
            fallback = { route, segments: [] };
            continue;
        }
        if (!isAbsolutePath(route.path) || route.path.includes('?') || route.path.includes('#') ||
            hasDotSegments(route.path))
            throw createTypeError(`Route path "${route.path}" must be "*" or an absolute pathname without a query or fragment.`);
        const segments = parsePath(route.path);
        const signature = segments.map(segment => segment.parameter ? ':' : segment.value).join('/');
        if (seenPaths.has(signature)) throw createError(`Duplicate route pattern "${route.path}".`);
        seenPaths.add(signature);
        compiled.push({ route, segments });
    }
    const staticCount = (entry: Compiled) => getLength(entry.segments.filter(segment => !segment.parameter));
    compiled.sort((left, right) => staticCount(right) - staticCount(left));
    const guarded = Boolean(options.guard) || routes.some(route => route.guard);

    const current = signal<RouteMatch | null>(null);
    const route = state({ matched: false, component: '', path: '', params: {}, query: {}, hash: '', fullPath: '' }) as RouteState;
    const mountedRoots = new Set<Element>();
    let listening = false;
    let stopGuards: (() => void) | undefined;

    /** Resolves a browser URL to an application URL (pathname relative to the base), or null when outside the app. */
    const toApp = (input: string): URL | null => {
        if (hashMode && isAbsolutePath(input)) return new URL(input, origin());
        const url = new URL(input, globalThis.location?.href ?? 'http://localhost/');
        if (url.origin !== origin()) return null;
        if (hashMode) {
            const here = globalThis.location;
            if (here && (url.pathname !== here.pathname || url.search !== here.search)) return null;
            const fragment = url.hash.slice(1);
            if (fragment && !startsWith(fragment, '/')) return null;
            return new URL(fragment || '/', origin());
        }
        const pathname = appPath(url.pathname);
        return pathname === null ? null : new URL(`${pathname}${url.search}${url.hash}`, origin());
    };

    /** Validates an application path and returns it as an application URL. */
    const appUrl = (path: string): URL => {
        const target = href(path);
        return hashMode ? new URL(target.slice(1), origin()) : toApp(new URL(target, origin()).href)!;
    };

    const find = (url: URL): [RouteMatch, RouteDefinition] | null => {
        const pathname = url.pathname;
        const requested = pathname.split('/').filter(Boolean);
        const create = (candidate: Compiled, params: Record<string, string>): [RouteMatch, RouteDefinition] => {
            const hash = hashMode ? '' : url.hash;
            return [{
                path: pathname, params, query: objectConstructor.fromEntries(url.searchParams), hash,
                fullPath: `${pathname}${url.search}${hash}`, component: candidate.route.component ?? '',
            }, candidate.route];
        };
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
            if (valid) return create(candidate, params);
        }
        return fallback ? create(fallback, {}) : null;
    };

    const check = (to: RouteMatch, definition: RouteDefinition): boolean | string => {
        for (const guard of [options.guard, definition.guard]) {
            const verdict = guard?.(to) ?? true;
            if (verdict !== true) return verdict;
        }
        return true;
    };

    /** Follows redirect routes and guards; `false` means blocked, `null` means unmatched. */
    const resolve = (url: URL): { match: RouteMatch; url: URL; redirected: boolean } | false | null => {
        let redirected = false;
        for (let hops = 0; hops <= MAX_REDIRECTS; hops++) {
            const found = find(url);
            if (!found) return null;
            const [match, definition] = found;
            const target = definition.redirect === undefined
                ? check(match, definition)
                : isString(definition.redirect) ? definition.redirect : definition.redirect(match);
            if (target === true) return { match, url, redirected };
            if (target === false) return false;
            url = appUrl(target);
            redirected = true;
        }
        throw createError(`Brio router redirected more than ${MAX_REDIRECTS} times; check route guards and redirects for a loop.`);
    };

    const show = (match: RouteMatch | null) => batch(() => {
        const previous = current.value;
        if (previous && match && previous.fullPath === match.fullPath && previous.component === match.component) return;
        current.value = match;
        const writable = route as any;
        writable.matched = Boolean(match);
        writable.component = match?.component ?? '';
        writable.path = match?.path ?? '';
        writable.hash = match?.hash ?? '';
        writable.fullPath = match?.fullPath ?? '';
        if (!sameRecord(route.params, match?.params ?? {})) writable.params = match?.params ?? {};
        if (!sameRecord(route.query, match?.query ?? {})) writable.query = match?.query ?? {};
    });

    const write = (url: URL, replace: boolean) => {
        const target = href(`${url.pathname}${url.search}${url.hash}`);
        if (replace) history.replaceState(history.state, '', target);
        else history.pushState(null, '', target);
    };

    const sync = () => {
        let url = toApp(location.href);
        if (!url && hashMode) {
            // A non-route fragment in hash mode is an in-page anchor: keep the current page.
            if (current.value) return;
            url = new URL('/', origin());
        }
        if (!url) return show(null);
        const result = untrack(() => resolve(url));
        if (result && (result.redirected || location.pathname === `${base}index.html`)) write(result.url, true);
        show(result ? result.match : null);
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
        if (!hashMode && url.pathname === location.pathname && url.search === location.search && url.hash) return;
        const app = toApp(url.href);
        if (!app || !find(app)) return;
        event.preventDefault();
        commit(app, false);
    };

    const match = (path: string): RouteMatch | null => {
        const url = toApp(path);
        return url ? find(url)?.[0] ?? null : null;
    };

    const commit = (url: URL, replace: boolean): boolean => {
        const result = untrack(() => resolve(url));
        if (!result) return false;
        write(result.url, replace || result.redirected);
        show(result.match);
        return true;
    };

    const navigate = (path: string, options: { replace?: boolean } = {}): boolean =>
        commit(appUrl(path), Boolean(options.replace));

    const start = (root: Element) => {
        mountedRoots.add(root);
        if (!listening) {
            listening = true;
            addEventListener(globalThis, 'popstate', sync);
            if (hashMode) addEventListener(globalThis, 'hashchange', sync);
            addEventListener(document, 'click', onClick);
            sync();
            // Guards re-run when anything they read changes, e.g. signing out on a protected page.
            if (guarded) stopGuards = effect(() => {
                const to = current.value;
                if (!to) return;
                const found = find(new URL(to.fullPath, origin()));
                const verdict = found ? check(to, found[1]) : true;
                if (verdict === true) return;
                untrack(() => verdict === false ? show(null) : navigate(verdict, { replace: true }));
            });
        }
        return () => {
            deleteItem(mountedRoots, root);
            if (!mountedRoots.size && listening) {
                listening = false;
                stopGuards?.();
                stopGuards = undefined;
                removeEventListener(globalThis, 'popstate', sync);
                removeEventListener(globalThis, 'hashchange', sync);
                removeEventListener(document, 'click', onClick);
            }
        };
    };

    return { base, mode: hashMode ? 'hash' : 'history', current, route, href, match, navigate, start };
}
