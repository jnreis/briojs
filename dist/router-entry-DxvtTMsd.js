import { c as createTypeError, j as isString, b as createError, t as startsWith, m as includesItem, g as getLength, d as deleteItem, h as isInstanceOf, p as objectKeys, O as ObjectConstructor } from "./native-BneND9DN.js";
import { a as addEventListener, r as removeEventListener } from "./native-B0OLxTjP.js";
import { s as state, a as signal } from "./state-1Xtmucgt.js";
import { e as effect, u as untrack, c as createScope, b as batch } from "./effect-BL1g_AaG.js";
const defineDirective = (definition) => definition;
const definePlugin = (plugin) => plugin;
const outletDirective = defineDirective({
  name: "b-router-outlet",
  value: "none",
  children: false,
  mount(element, binding) {
    const app = binding.app;
    const router = app.router;
    if (!router) throw createError("b-router-outlet requires a router on the Brio app.");
    let childScope;
    let child;
    let mountedKey;
    const clear = () => {
      try {
        childScope == null ? void 0 : childScope.dispose();
      } finally {
        child == null ? void 0 : child.remove();
        childScope = child = mountedKey = void 0;
      }
    };
    binding.onCleanup(clear);
    binding.effect(() => {
      const route = router.current.value;
      const key = route && `${route.component} ${route.path}`;
      if (key === mountedKey) return;
      clear();
      if (!(route == null ? void 0 : route.component)) return;
      if (!app.components.has(route.component))
        throw createError(`No component registered for route "${route.component}".`);
      const page = child = element.ownerDocument.createElement(route.component);
      const scope = childScope = createScope();
      mountedKey = key;
      element.append(page);
      untrack(() => scope.run(() => binding.hydrate(page)));
    });
  }
});
const routerPlugin = { name: "brio-router", directives: [outletDirective] };
const MAX_REDIRECTS = 10;
const FALLBACK = "*";
const origin = () => {
  var _a;
  return ((_a = globalThis.location) == null ? void 0 : _a.origin) ?? "http://localhost";
};
const isAbsolutePath = (path) => isString(path) && startsWith(path, "/") && !startsWith(path, "//") && !/[\\\u0000-\u001f\u007f]/u.test(path);
const hasDotSegments = (path) => path.split("/").some((segment) => includesItem([".", ".."], segment.replace(/%2e/gi, ".")));
const sameRecord = (left, right) => getLength(objectKeys(left)) === getLength(objectKeys(right)) && objectKeys(left).every((key) => left[key] === right[key]);
function normalizeBase(base) {
  if (!isAbsolutePath(base) || /[ ?#]/u.test(base) || hasDotSegments(base) || base.includes("//"))
    throw createTypeError("Router base must be an absolute pathname without an origin, query, fragment, or dot segments.");
  const pathname = new URL(base, "http://localhost").pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}
const parsePath = (path) => path.split("/").filter(Boolean).map((part) => {
  if (startsWith(part, ":")) {
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
function createRouter(routes, options = {}) {
  const hashMode = options.mode === "hash";
  if (options.mode !== void 0 && !hashMode && options.mode !== "history")
    throw createTypeError('Router mode must be "history" or "hash".');
  const base = normalizeBase(options.base ?? "/");
  const prefix = base === "/" ? "" : base.slice(0, -1);
  const appPath = (pathname) => {
    if (pathname === `${base}index.html`) return "/";
    if (!prefix) return pathname;
    if (pathname === prefix) return "/";
    return startsWith(pathname, base) ? pathname.slice(getLength(prefix)) : null;
  };
  const href = (path) => {
    if (!isAbsolutePath(path))
      throw createTypeError('Router application paths must start with a single "/" and contain no origin or backslashes.');
    const url = new URL(`${prefix}${path}`, origin());
    if (appPath(url.pathname) === null)
      throw createTypeError("Router application path cannot escape its base.");
    if (hashMode) return `#${url.pathname.slice(getLength(prefix)) || "/"}${url.search}${url.hash}`;
    return `${url.pathname}${url.search}${url.hash}`;
  };
  const seenPaths = /* @__PURE__ */ new Set();
  let fallback;
  const compiled = [];
  for (const route2 of routes) {
    if (route2.component !== void 0 && (!isString(route2.component) || !route2.component))
      throw createTypeError(`Route "${route2.path}" component must be a non-empty component name.`);
    if (route2.path === FALLBACK) {
      if (fallback) throw createError('Duplicate route pattern "*".');
      fallback = { route: route2, segments: [] };
      continue;
    }
    if (!isAbsolutePath(route2.path) || route2.path.includes("?") || route2.path.includes("#") || hasDotSegments(route2.path))
      throw createTypeError(`Route path "${route2.path}" must be "*" or an absolute pathname without a query or fragment.`);
    const segments = parsePath(route2.path);
    const signature = segments.map((segment) => segment.parameter ? ":" : segment.value).join("/");
    if (seenPaths.has(signature)) throw createError(`Duplicate route pattern "${route2.path}".`);
    seenPaths.add(signature);
    compiled.push({ route: route2, segments });
  }
  const staticCount = (entry) => getLength(entry.segments.filter((segment) => !segment.parameter));
  compiled.sort((left, right) => staticCount(right) - staticCount(left));
  const guarded = Boolean(options.guard) || routes.some((route2) => route2.guard);
  const current = signal(null);
  const route = state({ matched: false, component: "", path: "", params: {}, query: {}, hash: "", fullPath: "" });
  const mountedRoots = /* @__PURE__ */ new Set();
  let listening = false;
  let stopGuards;
  const toApp = (input) => {
    var _a;
    if (hashMode && isAbsolutePath(input)) return new URL(input, origin());
    const url = new URL(input, ((_a = globalThis.location) == null ? void 0 : _a.href) ?? "http://localhost/");
    if (url.origin !== origin()) return null;
    if (hashMode) {
      const here = globalThis.location;
      if (here && (url.pathname !== here.pathname || url.search !== here.search)) return null;
      const fragment = url.hash.slice(1);
      if (fragment && !startsWith(fragment, "/")) return null;
      return new URL(fragment || "/", origin());
    }
    const pathname = appPath(url.pathname);
    return pathname === null ? null : new URL(`${pathname}${url.search}${url.hash}`, origin());
  };
  const appUrl = (path) => {
    const target = href(path);
    return hashMode ? new URL(target.slice(1), origin()) : toApp(new URL(target, origin()).href);
  };
  const find = (url) => {
    const pathname = url.pathname;
    const requested = pathname.split("/").filter(Boolean);
    const create = (candidate, params) => {
      const hash = hashMode ? "" : url.hash;
      return [{
        path: pathname,
        params,
        query: ObjectConstructor.fromEntries(url.searchParams),
        hash,
        fullPath: `${pathname}${url.search}${hash}`,
        component: candidate.route.component ?? ""
      }, candidate.route];
    };
    for (const candidate of compiled) {
      if (getLength(candidate.segments) !== getLength(requested)) continue;
      const params = {};
      let valid = true;
      for (let index = 0; index < getLength(requested); index++) {
        const part = candidate.segments[index];
        let decoded;
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
  const check = (to, definition) => {
    for (const guard of [options.guard, definition.guard]) {
      const verdict = (guard == null ? void 0 : guard(to)) ?? true;
      if (verdict !== true) return verdict;
    }
    return true;
  };
  const resolve = (url) => {
    let redirected = false;
    for (let hops = 0; hops <= MAX_REDIRECTS; hops++) {
      const found = find(url);
      if (!found) return null;
      const [match2, definition] = found;
      const target = definition.redirect === void 0 ? check(match2, definition) : isString(definition.redirect) ? definition.redirect : definition.redirect(match2);
      if (target === true) return { match: match2, url, redirected };
      if (target === false) return false;
      url = appUrl(target);
      redirected = true;
    }
    throw createError(`Brio router redirected more than ${MAX_REDIRECTS} times; check route guards and redirects for a loop.`);
  };
  const show = (match2) => batch(() => {
    const previous = current.value;
    if (previous && match2 && previous.fullPath === match2.fullPath && previous.component === match2.component) return;
    current.value = match2;
    const writable = route;
    writable.matched = Boolean(match2);
    writable.component = (match2 == null ? void 0 : match2.component) ?? "";
    writable.path = (match2 == null ? void 0 : match2.path) ?? "";
    writable.hash = (match2 == null ? void 0 : match2.hash) ?? "";
    writable.fullPath = (match2 == null ? void 0 : match2.fullPath) ?? "";
    if (!sameRecord(route.params, (match2 == null ? void 0 : match2.params) ?? {})) writable.params = (match2 == null ? void 0 : match2.params) ?? {};
    if (!sameRecord(route.query, (match2 == null ? void 0 : match2.query) ?? {})) writable.query = (match2 == null ? void 0 : match2.query) ?? {};
  });
  const write = (url, replace) => {
    const target = href(`${url.pathname}${url.search}${url.hash}`);
    if (replace) history.replaceState(history.state, "", target);
    else history.pushState(null, "", target);
  };
  const sync = () => {
    let url = toApp(location.href);
    if (!url && hashMode) {
      if (current.value) return;
      url = new URL("/", origin());
    }
    if (!url) return show(null);
    const result = untrack(() => resolve(url));
    if (result && (result.redirected || location.pathname === `${base}index.html`)) write(result.url, true);
    show(result ? result.match : null);
  };
  const onClick = (event) => {
    if (!isInstanceOf(event, MouseEvent) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!isInstanceOf(target, Element)) return;
    const anchor = target.closest("a[href]");
    if (!isInstanceOf(anchor, HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) return;
    if (![...mountedRoots].some((root) => root.contains(anchor))) return;
    const url = new URL(anchor.href, location.href);
    if (!hashMode && url.pathname === location.pathname && url.search === location.search && url.hash) return;
    const app = toApp(url.href);
    if (!app || !find(app)) return;
    event.preventDefault();
    commit(app, false);
  };
  const match = (path) => {
    var _a;
    const url = toApp(path);
    return url ? ((_a = find(url)) == null ? void 0 : _a[0]) ?? null : null;
  };
  const commit = (url, replace) => {
    const result = untrack(() => resolve(url));
    if (!result) return false;
    write(result.url, replace || result.redirected);
    show(result.match);
    return true;
  };
  const navigate = (path, options2 = {}) => commit(appUrl(path), Boolean(options2.replace));
  const start = (root) => {
    mountedRoots.add(root);
    if (!listening) {
      listening = true;
      addEventListener(globalThis, "popstate", sync);
      if (hashMode) addEventListener(globalThis, "hashchange", sync);
      addEventListener(document, "click", onClick);
      sync();
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
        stopGuards == null ? void 0 : stopGuards();
        stopGuards = void 0;
        removeEventListener(globalThis, "popstate", sync);
        removeEventListener(globalThis, "hashchange", sync);
        removeEventListener(document, "click", onClick);
      }
    };
  };
  return { base, mode: hashMode ? "hash" : "history", current, route, href, match, navigate, start, plugin: routerPlugin };
}
export {
  definePlugin as a,
  createRouter as c,
  defineDirective as d
};
//# sourceMappingURL=router-entry-DxvtTMsd.js.map
