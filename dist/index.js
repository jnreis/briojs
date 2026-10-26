import { c, a, h, t } from "./app-BI_J_Eae.js";
import { a as a2, b, l, v, c as c2, k, n, e, j, f, h as h2, t as t2, p, m, g, o, r, d, i, s, q, u } from "./effect-alBOOBUf.js";
import { d as d2, c as c3, a as a3, e as e2, b as b2 } from "./context-values-CwL8HLy9.js";
import { g as getLength } from "./native-C6Z9zuZA.js";
import { c as c4, d as d3, a as a4 } from "./router-entry-bqMq6RsY.js";
import { a as a5, s as s2 } from "./state-D6RTXn8X.js";
import { computed, resource } from "./reactivity.js";
import { persist } from "./persistence-entry.js";
import { createStepEngine } from "./step-entry.js";
import { inputsPlugin, moneyMask, validate } from "./inputs-entry.js";
import { observersPlugin } from "./observers-entry.js";
import { HttpError, http } from "./http-entry.js";
import { d as d4, a as a6, e as e3, i as i2 } from "./devtools-CGDy_lc4.js";
let scheduledQueue = [];
let isFlushing = false;
function queueTask(task) {
  scheduledQueue.push(task);
  if (!isFlushing) {
    isFlushing = true;
    queueMicrotask(flushQueue);
  }
}
function flushQueue() {
  try {
    const queue = scheduledQueue;
    scheduledQueue = [];
    for (let i3 = 0; i3 < getLength(queue); i3++) {
      queue[i3]();
    }
  } finally {
    isFlushing = false;
    if (getLength(scheduledQueue)) {
      queueMicrotask(flushQueue);
    }
  }
}
export {
  HttpError,
  a2 as addDisposer,
  d2 as assign,
  b as batch,
  l as causedError,
  v as combinedError,
  computed,
  c as createApp,
  c3 as createExpressionScope,
  c4 as createRouter,
  c2 as createScope,
  createStepEngine,
  d3 as defineDirective,
  a4 as definePlugin,
  k as describeNode,
  d4 as devtools,
  a6 as devtoolsPanel,
  n as directiveError,
  e as effect,
  e3 as enableDevtools,
  j as errorText,
  a3 as evaluate,
  e2 as evaluateFunction,
  b2 as execute,
  f as flush,
  h2 as getCurrentScope,
  t2 as getScopeNode,
  http,
  a as hydrateNode,
  h as hydrateRoot,
  inputsPlugin,
  i2 as inspectDevtools,
  p as locate,
  m as mark,
  moneyMask,
  observersPlugin,
  g as onCleanup,
  o as onDispose,
  persist,
  queueTask,
  r as removeDisposer,
  resource,
  d as runUnscoped,
  i as setActiveScope,
  s as setEffectFrame,
  q as setScopeNode,
  a5 as signal,
  s2 as state,
  t as trustedHTML,
  u as untrack,
  validate
};
//# sourceMappingURL=index.js.map
