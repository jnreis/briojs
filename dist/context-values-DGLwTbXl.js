import { i as isFunction, c as createTypeError, g as getLength, o as objectConstructor, n as createSyntaxError, d as deleteItem, f as isObjectType, p as includesItem, q as objectKeys, R as ReflectApi, G as GET_OWN_PROPERTY_DESCRIPTOR, l as ownKeys } from "./native-DNTl55LH.js";
import { m as mark, f as describeNode, h as directiveError, u as untrack, e as effect } from "./effect-BTu8V88D.js";
import { t as trigger, a as track } from "./state-BKD4-QHU.js";
const valueExpressions = /* @__PURE__ */ new Map();
const statementExpressions = /* @__PURE__ */ new Map();
const assignmentExpressions = /* @__PURE__ */ new Map();
const functionExpressions = /* @__PURE__ */ new Map();
const $CONTEXT = "$context";
const contextNames = ["$data", "$el", "$event", "$id", "$ref", "$for", "$mutations", "$size", "$entry", "$props", "$emit", "$insert", "$stores", "$provided", "trustedHTML", "flush", "onCleanup"];
const contextBindings = (expression) => {
  const names = contextNames.filter((name) => new RegExp(`(?<![\\w$])${name.replace("$", "\\$")}(?![\\w$])`).test(expression));
  return `"use strict";${getLength(names) ? ` const { ${names.join(", ")} } = ${$CONTEXT};` : ""}
`;
};
function evaluateFunction(source, context, node) {
  const fn = compile(
    functionExpressions,
    source,
    (expression) => new Function($CONTEXT, `${contextBindings(expression)} return (${expression.replace(/;\s*$/, "")});`),
    "b-script",
    node
  );
  const result = fn(context);
  if (!isFunction(result))
    throw createTypeError(`b-script must contain a function expression, such as (${$CONTEXT}) => { ... }.`);
  return result;
}
function createExpressionScope(...sources) {
  const last = getLength(sources) - 1;
  let scope = last < 1 ? objectConstructor.assign(objectConstructor.create(null), sources[0]) : sources[last];
  for (let index = last - 1; index >= 0; index--)
    scope = objectConstructor.assign(objectConstructor.create(scope), sources[index]);
  return scope;
}
const compile = (cache, source, make, directive, node) => {
  let fn = cache.get(source);
  if (!fn) {
    try {
      fn = make(source);
    } catch (error) {
      throw mark(createSyntaxError(
        `Invalid Brio expression "${source}"${directive ? ` in ${directive}` : ""}${node ? ` on ${describeNode(node)}` : ""}: ${String(error)}`
      ), node, directive);
    }
    cache.set(source, fn);
    if (cache.size > 500)
      deleteItem(cache, cache.keys().next().value);
  }
  return fn;
};
const holds = (value, name) => value !== null && typeof value === "object" && name in value;
const referenceHint = (error, scope) => {
  var _a;
  const name = error instanceof ReferenceError && ((_a = /^(\S+) is not defined$/.exec(error.message)) == null ? void 0 : _a[1]);
  if (!name) return "";
  return untrack(() => {
    try {
      for (let loop = scope.$for, path = "$for."; loop; loop = loop.$parent, path += "$parent.")
        if (holds(loop, name)) return `. Loop variables are read through $for: use ${path}${name}.`;
      for (const owner of ["$props", "$data"])
        if (holds(scope[owner], name)) return `. Use ${owner}.${name}.`;
    } catch {
    }
    return "";
  });
};
function evaluate(source, scope, directive, node = scope.$el) {
  const fn = compile(
    valueExpressions,
    source,
    (expression) => new Function($CONTEXT, `${contextBindings(expression)} return (${expression});`),
    directive,
    node
  );
  try {
    return fn(scope);
  } catch (error) {
    throw directiveError(`Brio expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
  }
}
function execute(source, scope, event, directive, node = scope.$el) {
  const fn = compile(
    statementExpressions,
    source,
    (expression) => new Function($CONTEXT, `${contextBindings(expression)} ${expression}`),
    directive,
    node
  );
  try {
    fn(event === void 0 ? scope : createExpressionScope({ $event: event }, scope));
  } catch (error) {
    throw directiveError(`Brio event expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
  }
}
function assign(source, scope, value, directive, node = scope.$el) {
  const fn = compile(
    assignmentExpressions,
    source,
    (expression) => new Function($CONTEXT, "$value", `${contextBindings(expression)} return (${expression} = $value);`),
    directive,
    node
  );
  try {
    fn(scope, value);
  } catch (error) {
    throw directiveError(`Brio model expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
  }
}
function copyContextValues(value, label) {
  if (value === null || !isObjectType(value) || !includesItem([objectConstructor.prototype, null], objectConstructor.getPrototypeOf(value)))
    throw createTypeError(`${label} must be a synchronous plain object.`);
  const result = objectConstructor.create(null);
  for (const key of objectKeys(value)) {
    const descriptor = objectConstructor[GET_OWN_PROPERTY_DESCRIPTOR](value, key);
    if (!("value" in descriptor))
      throw createTypeError(`${label} must contain data properties, not accessors.`);
    result[key] = ReflectApi.get(value, key);
  }
  return result;
}
const emptyContextValues = objectConstructor.freeze(objectConstructor.create(null));
function createProvidedValues(getValues, parent = emptyContextValues) {
  let values = objectConstructor.create(null);
  const holder = {};
  effect(() => {
    values = copyContextValues(getValues(), "b-provide");
    trigger(holder, "values", "set");
  });
  const readOnly = () => {
    throw createTypeError("$provided names are read-only.");
  };
  const hasOwn = (key) => objectConstructor.prototype.hasOwnProperty.call(values, key);
  return new Proxy(objectConstructor.create(null), {
    get(_target, key) {
      track(holder, "values");
      return hasOwn(key) ? ReflectApi.get(values, key) : ReflectApi.get(parent, key);
    },
    has(_target, key) {
      track(holder, "values");
      return hasOwn(key) || ReflectApi.has(parent, key);
    },
    ownKeys() {
      track(holder, "values");
      return [.../* @__PURE__ */ new Set([...ownKeys(parent), ...ownKeys(values)])];
    },
    [GET_OWN_PROPERTY_DESCRIPTOR](_target, key) {
      track(holder, "values");
      if (!hasOwn(key) && !objectConstructor.prototype.hasOwnProperty.call(parent, key)) return;
      return {
        configurable: true,
        enumerable: true,
        writable: false,
        value: hasOwn(key) ? ReflectApi.get(values, key) : ReflectApi.get(parent, key)
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
//# sourceMappingURL=context-values-DGLwTbXl.js.map
