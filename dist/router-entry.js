import { b as signal } from "./state-FLvgaPZh.js";
const origin = () => {
  var _a;
  return ((_a = globalThis.location) == null ? void 0 : _a.origin) ?? "http://localhost";
};
const isAbsolutePath = (path) => typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !/[\\\u0000-\u001f\u007f]/u.test(path);
const hasDotSegments = (path) => path.split("/").some((segment) => [".", ".."].includes(segment.replace(/%2e/gi, ".")));
function normalizeBase(base) {
  if (!isAbsolutePath(base) || /[ ?#]/u.test(base) || hasDotSegments(base) || base.includes("//"))
    throw new TypeError("Router base must be an absolute pathname without an origin, query, fragment, or dot segments.");
  const pathname = new URL(base, "http://localhost").pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}
const parsePath = (path) => path.split("/").filter(Boolean).map((part) => {
  if (part.startsWith(":")) {
    const value = part.slice(1);
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(value))
      throw new TypeError(`Invalid route parameter "${part}" in "${path}".`);
    return { value, parameter: true };
  }
  try {
    return { value: decodeURIComponent(part), parameter: false };
  } catch (error) {
    throw new TypeError(`Invalid encoded path segment "${part}" in "${path}".`, { cause: error });
  }
});
function createRouter(routes, options = {}) {
  const base = normalizeBase(options.base ?? "/");
  const prefix = base === "/" ? "" : base.slice(0, -1);
  const appPath = (pathname) => {
    if (!prefix) return pathname;
    if (pathname === prefix) return "/";
    return pathname.startsWith(base) ? pathname.slice(prefix.length) : null;
  };
  const href = (path) => {
    if (!isAbsolutePath(path))
      throw new TypeError('Router application paths must start with a single "/" and contain no origin or backslashes.');
    const url = new URL(`${prefix}${path}`, origin());
    if (appPath(url.pathname) === null)
      throw new TypeError("Router application path cannot escape its base.");
    return `${url.pathname}${url.search}${url.hash}`;
  };
  const seenPaths = /* @__PURE__ */ new Set();
  const compiled = routes.map((route) => {
    if (!isAbsolutePath(route.path) || route.path.includes("?") || route.path.includes("#") || hasDotSegments(route.path))
      throw new TypeError(`Route path "${route.path}" must be an absolute pathname without a query or fragment.`);
    if (!route.component) throw new TypeError(`Route "${route.path}" requires a component name.`);
    const segments = parsePath(route.path);
    const signature = segments.map((segment) => segment.parameter ? ":" : segment.value).join("/");
    if (seenPaths.has(signature)) throw new Error(`Duplicate route pattern "${route.path}".`);
    seenPaths.add(signature);
    return { route, segments };
  }).sort(
    (left, right) => right.segments.filter((segment) => !segment.parameter).length - left.segments.filter((segment) => !segment.parameter).length
  );
  const current = signal(null);
  const mountedRoots = /* @__PURE__ */ new Set();
  let listening = false;
  const onPopState = () => {
    const url = new URL(location.href);
    current.value = match(url.href);
  };
  const onClick = (event) => {
    if (!(event instanceof MouseEvent) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) return;
    if (![...mountedRoots].some((root) => root.contains(anchor))) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || !match(url.href)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    event.preventDefault();
    commit(url, false);
  };
  const match = (path) => {
    var _a;
    const url = new URL(path, ((_a = globalThis.location) == null ? void 0 : _a.href) ?? "http://localhost/");
    if (url.origin !== origin()) return null;
    const pathname = appPath(url.pathname);
    if (pathname === null) return null;
    const requested = pathname.split("/").filter(Boolean);
    for (const candidate of compiled) {
      if (candidate.segments.length !== requested.length) continue;
      const params = {};
      let valid = true;
      for (let index = 0; index < requested.length; index++) {
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
      if (valid) return { path: pathname, params, component: candidate.route.component };
    }
    return null;
  };
  const commit = (url, replace) => {
    const route = match(url.href);
    if (!route) return false;
    if (replace) history.replaceState(null, "", url.href);
    else history.pushState(null, "", url.href);
    current.value = route;
    return true;
  };
  const navigate = (path, options2 = {}) => commit(new URL(href(path), origin()), Boolean(options2.replace));
  const start = (root) => {
    mountedRoots.add(root);
    if (!listening) {
      listening = true;
      globalThis.addEventListener("popstate", onPopState);
      document.addEventListener("click", onClick);
      onPopState();
    }
    return () => {
      mountedRoots.delete(root);
      if (!mountedRoots.size && listening) {
        listening = false;
        globalThis.removeEventListener("popstate", onPopState);
        document.removeEventListener("click", onClick);
      }
    };
  };
  return { base, current, href, match, navigate, start };
}
export {
  createRouter
};
//# sourceMappingURL=router-entry.js.map
