import { d as deleteItem, r as removeElement, a as arrayFrom, g as getLength } from "./native-CjaBWh7p.js";
import { i as installDevtoolsBridge, e as effect, c as causedError } from "./effect-CdkoKvuz.js";
let effectsCreated = 0;
let activeEffects = 0;
const apps = /* @__PURE__ */ new Map();
const subscribers = /* @__PURE__ */ new Set();
const notifySubscribers = () => {
  for (const subscriber of [...subscribers]) subscriber();
};
const getSnapshot = () => {
  const appSnapshots = arrayFrom(apps, ([app, record]) => ({
    app,
    roots: arrayFrom(record.roots, (root) => {
      const id = root.id ? `#${root.id}` : "";
      const classes = getLength(root.classList) ? `.${arrayFrom(root.classList).join(".")}` : "";
      return `${root.tagName.toLowerCase()}${id}${classes}`;
    }),
    state: record.state
  }));
  return {
    appCount: apps.size,
    mountedRoots: appSnapshots.reduce((total, record) => total + getLength(record.roots), 0),
    effectsCreated,
    activeEffects,
    apps: appSnapshots
  };
};
let enabled = false;
const bridge = {
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
    record == null ? void 0 : record.snapshot();
    deleteItem(apps, app);
    notifySubscribers();
  },
  rootMounted(app, root) {
    const record = apps.get(app);
    if (!record) return;
    record.roots.add(root);
    notifySubscribers();
  },
  rootUnmounted(app, root) {
    const record = apps.get(app);
    if (!record) return;
    deleteItem(record.roots, root);
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
};
function enableDevtools() {
  if (enabled) return;
  enabled = true;
  installDevtoolsBridge(bridge);
}
const devtools = {
  subscribe(callback) {
    subscribers.add(callback);
    callback();
    return () => deleteItem(subscribers, callback);
  },
  getSnapshot,
  reset() {
    effectsCreated = 0;
    activeEffects = 0;
    apps.clear();
    subscribers.clear();
  }
};
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
    deleteItem(subscribers, update);
    removeElement(panel);
  };
}
export {
  devtoolsPanel as a,
  devtools as d,
  enableDevtools as e,
  inspectDevtools as i
};
//# sourceMappingURL=devtools-CR2Bel5O.js.map
