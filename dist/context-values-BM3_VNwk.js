import { i as isFunction, c as createTypeError, g as getLength, O as ObjectConstructor, m as createSyntaxError, d as deleteItem, n as includesItem, e as isObjectType, p as objectKeys, R as ReflectApi, G as GET_OWN_PROPERTY_DESCRIPTOR, l as ownKeys } from "./native-C6Z9zuZA.js";
import { m as mark, k as describeNode, n as directiveError, u as untrack, e as effect } from "./effect-alBOOBUf.js";
import { t as trigger, b as track } from "./state-D6RTXn8X.js";
const valueExpressions = /* @__PURE__ */ new Map();
const statementExpressions = /* @__PURE__ */ new Map();
const assignmentExpressions = /* @__PURE__ */ new Map();
const functionExpressions = /* @__PURE__ */ new Map();
const $CONTEXT = "$context";
const contextNames = ["$data", "$el", "$event", "$id", "$ref", "$for", "$mutations", "$size", "$entry", "$props", "$emit", "$insert", "$stores", "$provided", "$route", "trustedHTML", "flush", "onCleanup"];
const contextBindings = (expression, extras) => {
  const names = contextNames.filter((name) => new RegExp(`(?<![\\w$])${name.replace("$", "\\$")}(?![\\w$])`).test(expression)).concat(extras);
  return `"use strict";${getLength(names) ? ` const { ${names.join(", ")} } = ${$CONTEXT};` : ""}
`;
};
const customNames = /* @__PURE__ */ new Map();
const presentNames = (source, scope) => {
  let names = customNames.get(source);
  if (!names) {
    names = [...new Set(source.match(new RegExp("(?<![\\w$])\\$[\\w$]+", "g")))].filter((name) => !includesItem(contextNames, name) && name !== $CONTEXT && name !== "$value");
    if (customNames.size > 500) customNames.clear();
    customNames.set(source, names);
  }
  return getLength(names) ? names.filter((name) => name in scope) : names;
};
function evaluateFunction(source, context, node) {
  const fn = compile(
    functionExpressions,
    source,
    (expression, bindings) => new Function($CONTEXT, `${bindings} return (${expression.replace(/;\s*$/, "")});`),
    context,
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
  let scope = last < 1 ? ObjectConstructor.assign(ObjectConstructor.create(null), sources[0]) : sources[last];
  for (let index = last - 1; index >= 0; index--)
    scope = ObjectConstructor.assign(ObjectConstructor.create(scope), sources[index]);
  return scope;
}
const compile = (cache, source, make, scope, directive, node) => {
  const extras = presentNames(source, scope);
  const key = getLength(extras) ? `${source}\0${extras}` : source;
  let fn = cache.get(key);
  if (!fn) {
    try {
      fn = make(source, contextBindings(source, extras));
    } catch (error) {
      throw mark(createSyntaxError(
        `Invalid Brio expression "${source}"${directive ? ` in ${directive}` : ""}${node ? ` on ${describeNode(node)}` : ""}: ${String(error)}`
      ), node, directive);
    }
    cache.set(key, fn);
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
    (expression, bindings) => new Function($CONTEXT, `${bindings} return (${expression});`),
    scope,
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
    (expression, bindings) => new Function($CONTEXT, `${bindings} ${expression}`),
    scope,
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
    (expression, bindings) => new Function($CONTEXT, "$value", `${bindings} return (${expression} = $value);`),
    scope,
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
  if (value === null || !isObjectType(value) || !includesItem([ObjectConstructor.prototype, null], ObjectConstructor.getPrototypeOf(value)))
    throw createTypeError(`${label} must be a synchronous plain object.`);
  const result = ObjectConstructor.create(null);
  for (const key of objectKeys(value)) {
    const descriptor = ObjectConstructor[GET_OWN_PROPERTY_DESCRIPTOR](value, key);
    if (!("value" in descriptor))
      throw createTypeError(`${label} must contain data properties, not accessors.`);
    result[key] = ReflectApi.get(value, key);
  }
  return result;
}
const emptyContextValues = ObjectConstructor.freeze(ObjectConstructor.create(null));
function createProvidedValues(getValues, parent = emptyContextValues) {
  let values = ObjectConstructor.create(null);
  const holder = {};
  effect(() => {
    values = copyContextValues(getValues(), "b-provide");
    trigger(holder, "values", "set");
  });
  const readOnly = () => {
    throw createTypeError("$provided names are read-only.");
  };
  const hasOwn = (key) => ObjectConstructor.prototype.hasOwnProperty.call(values, key);
  return new Proxy(ObjectConstructor.create(null), {
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
      if (!hasOwn(key) && !ObjectConstructor.prototype.hasOwnProperty.call(parent, key)) return;
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
  evaluate as a,
  execute as b,
  createExpressionScope as c,
  assign as d,
  evaluateFunction as e,
  copyContextValues as f,
  emptyContextValues as g,
  createProvidedValues as h
};
//# sourceMappingURL=context-values-BM3_VNwk.js.map
