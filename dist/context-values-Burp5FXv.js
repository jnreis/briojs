import { i as isFunction, c as createTypeError, g as getLength, O as ObjectConstructor, b as createError, n as createSyntaxError, e as isObjectType, m as includesItem, p as objectKeys, R as ReflectApi, G as GET_OWN_PROPERTY_DESCRIPTOR, l as ownKeys } from "./native-BneND9DN.js";
import { m as mark, k as describeNode, n as directiveError, u as untrack, e as effect } from "./effect-BL1g_AaG.js";
import { t as trigger, b as track } from "./state-1Xtmucgt.js";
const $CONTEXT = "$context";
const contextNames = ["$data", "$el", "$event", "$id", "$ref", "$for", "$mutations", "$size", "$entry", "$props", "$slot", "$emit", "$insert", "$stores", "$provided", "$route", "trustedHTML", "flush", "onCleanup"];
const ENGINE = Symbol("brio.engine");
let defaultEngine;
const setDefaultEngine = (engine) => {
  defaultEngine = engine;
};
const getDefaultEngine = () => defaultEngine;
function evaluateFunction(source, context, node) {
  const fn = compile("function", source, context, "b-script", node);
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
const compile = (kind, source, scope, directive, node) => {
  const engine = scope[ENGINE] ?? defaultEngine;
  if (!engine) throw createError("No Brio expression engine is installed. Import createApp from @jnreis/briojs or @jnreis/briojs/csp.");
  const make = engine[kind];
  if (!make) throw mark(createError(
    `${directive ?? "This expression"} is not available in the Brio CSP build. Move the code into component setup.`
  ), node, directive);
  try {
    return make(source, scope);
  } catch (error) {
    throw mark(createSyntaxError(
      `Invalid Brio expression "${source}"${directive ? ` in ${directive}` : ""}${node ? ` on ${describeNode(node)}` : ""}: ${String(error)}`
    ), node, directive);
  }
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
  const fn = compile("value", source, scope, directive, node);
  try {
    return fn(scope);
  } catch (error) {
    throw directiveError(`Brio expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
  }
}
function execute(source, scope, event, directive, node = scope.$el) {
  const fn = compile("statement", source, scope, directive, node);
  try {
    fn(event === void 0 ? scope : createExpressionScope({ $event: event }, scope));
  } catch (error) {
    throw directiveError(`Brio event expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
  }
}
function assign(source, scope, value, directive, node = scope.$el) {
  const fn = compile("assign", source, scope, directive, node);
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
  $CONTEXT as $,
  ENGINE as E,
  evaluate as a,
  execute as b,
  createExpressionScope as c,
  assign as d,
  evaluateFunction as e,
  copyContextValues as f,
  getDefaultEngine as g,
  contextNames as h,
  emptyContextValues as i,
  createProvidedValues as j,
  setDefaultEngine as s
};
//# sourceMappingURL=context-values-Burp5FXv.js.map
