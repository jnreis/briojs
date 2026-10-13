import { i as installDevtoolsBridge, e as effect, c as causedError } from "./reactivity-bRcZEPpQ.js";
let effectsCreated = 0;
let activeEffects = 0;
const apps = /* @__PURE__ */ new Map();
const subscribers = /* @__PURE__ */ new Set();
const notifySubscribers = () => {
  for (const subscriber of [...subscribers]) subscriber();
};
const getSnapshot = () => {
  const appSnapshots = Array.from(apps, ([app, record]) => ({
    app,
    roots: Array.from(record.roots, (root) => {
      const id = root.id ? `#${root.id}` : "";
      const classes = root.classList.length ? `.${Array.from(root.classList).join(".")}` : "";
      return `${root.tagName.toLowerCase()}${id}${classes}`;
    }),
    state: record.state
  }));
  return {
    appCount: apps.size,
    mountedRoots: appSnapshots.reduce((total, record) => total + record.roots.length, 0),
    effectsCreated,
    activeEffects,
    apps: appSnapshots
  };
};
installDevtoolsBridge({
  appCreated(app, appState) {
    const record = { state: void 0, roots: /* @__PURE__ */ new Set(), snapshot: () => {
    } };
    record.snapshot = effect(() => {
      try {
        record.state = JSON.parse(JSON.stringify(appState));
      } catch (error) {
        record.state = causedError("Unable to snapshot app state in Brio devtools.", error);
      }
      notifySubscribers();
    });
    apps.set(app, record);
    notifySubscribers();
  },
  appDisposed(app) {
    const record = apps.get(app);
    if (!record) return;
    record.snapshot();
    apps.delete(app);
    notifySubscribers();
  },
  rootMounted(app, root) {
    var _a;
    (_a = apps.get(app)) == null ? void 0 : _a.roots.add(root);
    notifySubscribers();
  },
  rootUnmounted(app, root) {
    var _a;
    (_a = apps.get(app)) == null ? void 0 : _a.roots.delete(root);
    notifySubscribers();
  },
  effectCreated() {
    effectsCreated++;
    activeEffects++;
    notifySubscribers();
  },
  effectDisposed() {
    activeEffects--;
    notifySubscribers();
  }
});
function inspectDevtools() {
  return getSnapshot();
}
function devtoolsPanel(container) {
  const panel = document.createElement("pre");
  panel.setAttribute("data-brio-devtools", "");
  container.replaceChildren(panel);
  const update = () => {
    const snapshot = getSnapshot();
    panel.textContent = [
      `Apps: ${snapshot.appCount}`,
      `Mounted roots: ${snapshot.mountedRoots}`,
      `Effects active: ${snapshot.activeEffects}/${snapshot.effectsCreated}`,
      ...snapshot.apps.map(({ roots, state: appState }) => `${roots.join(", ") || "(not mounted)"}
${JSON.stringify(appState, null, 2)}`)
    ].join("\n\n");
  };
  subscribers.add(update);
  update();
  return () => {
    subscribers.delete(update);
    panel.remove();
  };
}
export {
  devtoolsPanel,
  inspectDevtools
};
//# sourceMappingURL=devtools-entry.js.map
