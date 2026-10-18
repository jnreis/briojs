import { c as causedError, e as effect } from "./effect-DGhE0oQi.js";
import { t as trigger, a as track } from "./state-FLvgaPZh.js";
const valueExpressions = /* @__PURE__ */ new Map();
const statementExpressions = /* @__PURE__ */ new Map();
const assignmentExpressions = /* @__PURE__ */ new Map();
const functionExpressions = /* @__PURE__ */ new Map();
const $CONTEXT = "$context";
const contextBindings = `
"use strict";
const { $data, $el, $event, $id, $ref, $for, $mutations, $size, $entry, $props, $emit, $insert, $stores, $provided, trustedHTML, onCleanup } = ${$CONTEXT};
`;
function evaluateFunction(source, context) {
  const fn = compile(
    functionExpressions,
    source,
    (expression) => new Function($CONTEXT, `${contextBindings} return (${expression.replace(/;\s*$/, "")});`)
  );
  const result = fn(context);
  if (typeof result !== "function")
    throw new TypeError(`b-script must contain a function expression, such as (${$CONTEXT}) => { ... }.`);
  return result;
}
function createExpressionScope(...sources) {
  return Object.assign(/* @__PURE__ */ Object.create(null), ...sources.reverse());
}
const compile = (cache, source, make) => {
  let fn = cache.get(source);
  if (!fn) {
    try {
      fn = make(source);
    } catch (error) {
      throw new SyntaxError(`Invalid Brio expression "${source}": ${String(error)}`);
    }
    cache.set(source, fn);
    if (cache.size > 500)
      cache.delete(cache.keys().next().value);
  }
  return fn;
};
function evaluate(source, scope) {
  const fn = compile(
    valueExpressions,
    source,
    (expression) => new Function($CONTEXT, `${contextBindings} return (${expression});`)
  );
  try {
    return fn(scope);
  } catch (error) {
    throw causedError(`Brio expression failed: "${source}"`, error);
  }
}
function execute(source, scope, event) {
  const fn = compile(
    statementExpressions,
    source,
    (expression) => new Function($CONTEXT, `${contextBindings} ${expression}`)
  );
  try {
    fn(event === void 0 ? scope : createExpressionScope({ $event: event }, scope));
  } catch (error) {
    throw causedError(`Brio event expression failed: "${source}"`, error);
  }
}
function assign(source, scope, value) {
  const fn = compile(
    assignmentExpressions,
    source,
    (expression) => new Function($CONTEXT, "$value", `${contextBindings} return (${expression} = $value);`)
  );
  try {
    fn(scope, value);
  } catch (error) {
    throw causedError(`Brio model expression failed: "${source}"`, error);
  }
}
function copyContextValues(value, label) {
  if (value === null || typeof value !== "object" || ![Object.prototype, null].includes(Object.getPrototypeOf(value)))
    throw new TypeError(`${label} must be a synchronous plain object.`);
  const result = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!("value" in descriptor))
      throw new TypeError(`${label} must contain data properties, not accessors.`);
    result[key] = Reflect.get(value, key);
  }
  return result;
}
const emptyContextValues = Object.freeze(/* @__PURE__ */ Object.create(null));
function createProvidedValues(getValues, parent = emptyContextValues) {
  let values = /* @__PURE__ */ Object.create(null);
  const holder = {};
  effect(() => {
    values = copyContextValues(getValues(), "b-provide");
    trigger(holder, "values", "set");
  });
  const readOnly = () => {
    throw new TypeError("$provided names are read-only.");
  };
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(values, key);
  return new Proxy(/* @__PURE__ */ Object.create(null), {
    get(_target, key) {
      track(holder, "values");
      return hasOwn(key) ? Reflect.get(values, key) : Reflect.get(parent, key);
    },
    has(_target, key) {
      track(holder, "values");
      return hasOwn(key) || Reflect.has(parent, key);
    },
    ownKeys() {
      track(holder, "values");
      return [.../* @__PURE__ */ new Set([...Reflect.ownKeys(parent), ...Reflect.ownKeys(values)])];
    },
    getOwnPropertyDescriptor(_target, key) {
      track(holder, "values");
      if (!hasOwn(key) && !Object.prototype.hasOwnProperty.call(parent, key)) return;
      return {
        configurable: true,
        enumerable: true,
        writable: false,
        value: hasOwn(key) ? Reflect.get(values, key) : Reflect.get(parent, key)
      };
    },
    set: readOnly,
    deleteProperty: readOnly,
    defineProperty: readOnly,
    setPrototypeOf: readOnly,
    preventExtensions: readOnly
  });
}
export {
  emptyContextValues as a,
  createExpressionScope as b,
  copyContextValues as c,
  execute as d,
  evaluate as e,
  assign as f,
  createProvidedValues as g,
  evaluateFunction as h
};
//# sourceMappingURL=context-values-BA09Z6wf.js.map
