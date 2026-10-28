import { g as getNodeOwner, e as elementContext, c as componentNamePattern, m as mountComponent, a as hydrateNode, d as extractModifiers, f as findPluginDirective, i as createBinding, k as keepCleanup, r as runHook, j as hydrateChildren, b as buildApp } from "./app-BJAG0TST.js";
import { h, t } from "./app-BJAG0TST.js";
import { O as ObjectConstructor, d as deleteItem, m as includesItem, i as isFunction, s as snapshotList, A as ATTRIBUTES, g as getLength, j as isString, c as createTypeError } from "./native-BneND9DN.js";
import { $ as $CONTEXT, h as contextNames, s as setDefaultEngine } from "./context-values-Burp5FXv.js";
import { d, c, a, e, b } from "./context-values-Burp5FXv.js";
import { b as removeAttribute } from "./native-B0OLxTjP.js";
import { c as c2, d as d2, a as a2 } from "./router-entry-DxvtTMsd.js";
import { a as a3, b as b2, l, v, c as c3, k, n, e as e2, j, f, h as h2, t as t2, p, m, g, o, r, d as d3, i, s, q, u } from "./effect-BL1g_AaG.js";
import { a as a4, s as s2 } from "./state-1Xtmucgt.js";
import { computed, resource } from "./reactivity.js";
import { persist } from "./persistence-entry.js";
import { createStepEngine } from "./step-entry.js";
import { inputsPlugin, moneyMask, validate } from "./inputs-entry.js";
import { observersPlugin } from "./observers-entry.js";
import { HttpError, http } from "./http-entry.js";
import { d as d4, a as a5, e as e3, i as i2 } from "./devtools-CzVQ0v4f.js";
import { q as q2 } from "./scheduler-C8E9Nkz-.js";
const SHORT = Symbol("brio.short");
const blockedKeys = /* @__PURE__ */ new Set([
  "constructor",
  "__proto__",
  "prototype",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__"
]);
const functionConstructors = /* @__PURE__ */ new Set([Function, ...[async () => {
}, function* () {
}, async function* () {
}].map((fn) => ObjectConstructor.getPrototypeOf(fn).constructor), globalThis.eval]);
const table = (entries) => ObjectConstructor.assign(ObjectConstructor.create(null), entries);
const globals = table({
  Math,
  JSON,
  Number,
  String,
  Boolean,
  Array,
  Date,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  encodeURIComponent,
  decodeURIComponent,
  encodeURI,
  decodeURI,
  console: globalThis.console,
  NaN: NaN,
  Infinity: Infinity
});
const statement = "statements are not supported";
const unsupported = table({
  "=>": "Arrow functions are not supported",
  new: '"new" is not supported',
  function: "Functions are not supported",
  class: "Classes are not supported",
  this: '"this" is not supported',
  "...": "Spread syntax is not supported",
  delete: '"delete" is not supported',
  await: '"await" is not supported',
  yield: '"yield" is not supported',
  import: '"import" is not supported',
  var: `Declarations are not supported`,
  let: "Declarations are not supported",
  const: "Declarations are not supported",
  if: `"if" ${statement}`,
  for: "Loops are not supported",
  while: "Loops are not supported",
  do: "Loops are not supported",
  return: `"return" ${statement}`,
  throw: `"throw" ${statement}`,
  try: `"try" ${statement}`,
  switch: `"switch" ${statement}`
});
const keyOf = (value) => {
  const key = typeof value === "symbol" ? value : String(value);
  if (typeof key === "string" && blockedKeys.has(key))
    throw new TypeError(`Brio CSP expressions cannot access "${key}".`);
  return key;
};
const read = (object, key) => {
  if (object === null || object === void 0)
    throw new TypeError(`Cannot read properties of ${object} (reading '${String(key)}')`);
  return object[key];
};
const lookup = (scope, name) => {
  if (name === $CONTEXT) return scope;
  if (name[0] === "$" || includesItem(contextNames, name)) {
    if (name in scope) return scope[name];
    if (includesItem(contextNames, name)) return void 0;
  } else if (name in globals) {
    return globals[name];
  }
  throw new ReferenceError(`${name} is not defined`);
};
const call = (fn, self, args, label) => {
  if (!isFunction(fn)) throw new TypeError(`${label} is not a function`);
  if (functionConstructors.has(fn)) throw new TypeError("Brio CSP expressions cannot create functions from strings.");
  return fn.apply(self, args);
};
const binary = table({
  "+": (a6, b3) => a6 + b3,
  "-": (a6, b3) => a6 - b3,
  "*": (a6, b3) => a6 * b3,
  "/": (a6, b3) => a6 / b3,
  "%": (a6, b3) => a6 % b3,
  "**": (a6, b3) => a6 ** b3,
  "==": (a6, b3) => a6 == b3,
  "!=": (a6, b3) => a6 != b3,
  "===": (a6, b3) => a6 === b3,
  "!==": (a6, b3) => a6 !== b3,
  "<": (a6, b3) => a6 < b3,
  ">": (a6, b3) => a6 > b3,
  "<=": (a6, b3) => a6 <= b3,
  ">=": (a6, b3) => a6 >= b3,
  "&": (a6, b3) => a6 & b3,
  "|": (a6, b3) => a6 | b3,
  "^": (a6, b3) => a6 ^ b3,
  "<<": (a6, b3) => a6 << b3,
  ">>": (a6, b3) => a6 >> b3,
  ">>>": (a6, b3) => a6 >>> b3,
  in: (a6, b3) => keyOf(a6) in b3,
  instanceof: (a6, b3) => a6 instanceof b3
});
const precedence = table({
  "??": 1,
  "||": 2,
  "&&": 3,
  "|": 4,
  "^": 5,
  "&": 6,
  "==": 7,
  "!=": 7,
  "===": 7,
  "!==": 7,
  "<": 8,
  ">": 8,
  "<=": 8,
  ">=": 8,
  in: 8,
  instanceof: 8,
  "<<": 9,
  ">>": 9,
  ">>>": 9,
  "+": 10,
  "-": 10,
  "*": 11,
  "/": 11,
  "%": 11,
  "**": 12
});
const assignment = /* @__PURE__ */ new Set(["=", "+=", "-=", "*=", "/=", "%=", "**=", "??=", "||=", "&&="]);
const punctuators = [
  ">>>=",
  "...",
  "===",
  "!==",
  "**=",
  ">>>",
  "<<=",
  ">>=",
  "??=",
  "||=",
  "&&=",
  "=>",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "??",
  "?.",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**",
  "<<",
  ">>",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "=",
  "!",
  "~",
  "&",
  "|",
  "^",
  "?",
  ":",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ",",
  ".",
  ";"
];
const escapes = table({ n: "\n", r: "\r", t: "	", b: "\b", f: "\f", v: "\v", 0: "\0" });
function parse(source, mode) {
  let position = 0;
  let token = { type: "end", value: "", start: 0 };
  const fail = (message, at = (token == null ? void 0 : token.start) ?? position) => {
    throw new SyntaxError(`${message} at position ${at}`);
  };
  const space = () => {
    while (position < source.length) {
      const char = source[position];
      if (/\s/.test(char)) position++;
      else if (source.startsWith("//", position)) {
        while (position < source.length && source[position] !== "\n") position++;
      } else if (source.startsWith("/*", position)) {
        const end = source.indexOf("*/", position + 2);
        if (end < 0) fail("Unterminated comment");
        position = end + 2;
      } else break;
    }
  };
  const escape = (quote) => {
    const char = source[position++];
    if (char === void 0) fail(`Unterminated ${quote === "`" ? "template" : "string"}`);
    if (char === "x" || char === "u") {
      const braced = char === "u" && source[position] === "{";
      const end = braced ? source.indexOf("}", position) : position + (char === "x" ? 2 : 4);
      const hex = source.slice(braced ? position + 1 : position, end);
      if (!/^[0-9a-fA-F]+$/.test(hex)) fail("Invalid escape sequence");
      position = braced ? end + 1 : end;
      return String.fromCodePoint(parseInt(hex, 16));
    }
    if (char === "\r" && source[position] === "\n") position++;
    return char === "\n" || char === "\r" ? "" : escapes[char] ?? char;
  };
  const string = (quote) => {
    let value = "";
    while (true) {
      const char = source[position++];
      if (char === void 0 || char === "\n" && quote !== "`") fail("Unterminated string");
      if (char === quote) return value;
      value += char === "\\" ? escape(quote) : char;
    }
  };
  const next = () => {
    space();
    const start = position;
    if (position >= source.length) return token = { type: "end", value: "", start };
    const char = source[position];
    if (/[A-Za-z_$]/.test(char)) {
      const name = /^[\w$]+/.exec(source.slice(position))[0];
      position += name.length;
      return token = { type: "name", value: name, start };
    }
    if (/\d/.test(char) || char === "." && /\d/.test(source[position + 1] ?? "")) {
      const match = /^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)/.exec(source.slice(position))[0];
      position += match.length;
      if (/[\w$]/.test(source[position] ?? "")) fail("Invalid number");
      return token = { type: "number", value: match.replace(/_/g, ""), start };
    }
    if (char === '"' || char === "'") {
      position++;
      return token = { type: "string", value: string(char), start };
    }
    if (char === "`") {
      position++;
      return token = { type: "template", value: "", start };
    }
    const punct = punctuators.find((candidate) => source.startsWith(candidate, position));
    if (!punct) fail(`Unexpected character "${char}"`);
    if (punct === "?." && /\d/.test(source[position + 2] ?? "")) {
      position++;
      return token = { type: "punct", value: "?", start };
    }
    position += punct.length;
    return token = { type: "punct", value: punct, start };
  };
  const is = (value) => (token.type === "punct" || token.type === "name") && token.value === value;
  const expect = (value) => {
    if (!is(value)) unexpected();
    next();
  };
  const unexpected = () => {
    const reason = unsupported[token.value];
    if (reason && (token.type === "name" || token.type === "punct"))
      fail(`${reason} in the Brio CSP build; move this logic into component setup`);
    return fail(token.type === "end" ? "Unexpected end of expression" : `Unexpected token "${token.value}"`);
  };
  const template = () => {
    const parts = [];
    let text = "";
    while (true) {
      const char = source[position++];
      if (char === void 0) fail("Unterminated template");
      if (char === "`") break;
      if (char === "\\") text += escape("`");
      else if (char === "$" && source[position] === "{") {
        position++;
        parts.push(text);
        text = "";
        next();
        parts.push(expression().get);
        if (!is("}")) unexpected();
      } else text += char;
    }
    parts.push(text);
    next();
    return (scope) => {
      let result = "";
      for (const part of parts) result += typeof part === "string" ? part : String(part(scope));
      return result;
    };
  };
  const args = () => {
    const list = [];
    while (!is(")")) {
      list.push(assign().get);
      if (!is(")")) expect(",");
    }
    next();
    return list;
  };
  const primary = () => {
    const current = token;
    if (current.type === "number") {
      next();
      const value = Number(current.value);
      return { get: () => value };
    }
    if (current.type === "string") {
      next();
      return { get: () => current.value };
    }
    if (current.type === "template") return { get: template() };
    if (is("(")) {
      next();
      const inner = expression();
      expect(")");
      if (is("=>")) unexpected();
      return { get: inner.get };
    }
    if (is("[")) {
      next();
      const items = [];
      while (!is("]")) {
        items.push(assign().get);
        if (!is("]")) expect(",");
      }
      next();
      return { get: (scope) => items.map((item) => item(scope)) };
    }
    if (is("{")) {
      next();
      const entries = [];
      while (!is("}")) {
        let key;
        let value;
        const keyToken = token;
        if (is("[")) {
          next();
          key = assign().get;
          expect("]");
        } else if (keyToken.type === "name" || keyToken.type === "string" || keyToken.type === "number") {
          next();
          const name = keyToken.type === "number" ? String(Number(keyToken.value)) : keyToken.value;
          key = () => name;
          if (keyToken.type === "name" && (is(",") || is("}"))) value = (scope) => lookup(scope, name);
        } else return unexpected();
        if (!value) {
          if (is("(")) unexpected();
          expect(":");
          value = assign().get;
        }
        entries.push([key, value]);
        if (!is("}")) expect(",");
      }
      next();
      return {
        get: (scope) => {
          const object = {};
          for (const [key, value] of entries)
            ObjectConstructor.defineProperty(
              object,
              keyOf(key(scope)),
              { value: value(scope), enumerable: true, configurable: true, writable: true }
            );
          return object;
        }
      };
    }
    if (current.type === "name" && !unsupported[current.value]) {
      next();
      const name = current.value;
      if (is("=>")) unexpected();
      if (name === "true" || name === "false") return { get: () => name === "true" };
      if (name === "null") return { get: () => null };
      if (name === "undefined") return { get: () => void 0 };
      if (precedence[name] || name === "typeof" || name === "void") unexpected();
      return { get: (scope) => lookup(scope, name), name };
    }
    return unexpected();
  };
  const invoke = (callee, list, optionalCall) => ({
    get: (scope) => {
      let fn;
      let self;
      let label = callee.name ?? "expression";
      if (callee.object) {
        self = callee.object(scope);
        if (self === SHORT || callee.optional && (self === null || self === void 0)) return SHORT;
        const key = keyOf(callee.key(scope));
        label = String(key);
        fn = read(self, key);
      } else {
        fn = callee.get(scope);
        if (fn === SHORT) return SHORT;
      }
      if (optionalCall && (fn === null || fn === void 0)) return SHORT;
      return call(fn, self, list.map((arg) => arg(scope)), label);
    }
  });
  const member = (object, key, optional) => ({
    object,
    key,
    optional,
    get: (scope) => {
      const target = object(scope);
      if (target === SHORT || optional && (target === null || target === void 0)) return SHORT;
      return read(target, keyOf(key(scope)));
    },
    set: (scope, value) => {
      const target = object(scope);
      if (target === null || target === void 0)
        throw new TypeError(`Cannot set properties of ${target} (setting '${String(key(scope))}')`);
      return target[keyOf(key(scope))] = value;
    }
  });
  const postfix = () => {
    let ref2 = primary();
    let optional = false;
    while (true) {
      if (is("?.")) {
        optional = true;
        next();
        if (is("(")) {
          next();
          ref2 = invoke(ref2, args(), true);
        } else if (is("[")) {
          next();
          const key = expression().get;
          expect("]");
          ref2 = member(ref2.get, key, true);
        } else {
          if (token.type !== "name") unexpected();
          const name = token.value;
          next();
          ref2 = member(ref2.get, () => name, true);
        }
      } else if (is(".")) {
        next();
        if (token.type !== "name") unexpected();
        const name = token.value;
        next();
        ref2 = member(ref2.get, () => name, false);
      } else if (is("[")) {
        next();
        const key = expression().get;
        expect("]");
        ref2 = member(ref2.get, key, false);
      } else if (is("(")) {
        next();
        ref2 = invoke(ref2, args(), false);
      } else if (token.type === "template") {
        return fail("Tagged templates are not supported in the Brio CSP build");
      } else break;
    }
    if (!optional) return ref2;
    const inner = ref2;
    return { ...inner, get: (scope) => {
      const value = inner.get(scope);
      return value === SHORT ? void 0 : value;
    } };
  };
  const unary = () => {
    const operator = token.value;
    if (token.type === "punct" && (operator === "!" || operator === "-" || operator === "+" || operator === "~")) {
      next();
      const operand = unary().get;
      if (is("**")) fail('Unary operators need parentheses before "**"');
      return { get: operator === "!" ? (scope) => !operand(scope) : operator === "-" ? (scope) => -operand(scope) : operator === "+" ? (scope) => +operand(scope) : (scope) => ~operand(scope) };
    }
    if (token.type === "name" && (operator === "typeof" || operator === "void")) {
      next();
      const operand = unary().get;
      return {
        get: operator === "void" ? (scope) => void operand(scope) : (scope) => {
          try {
            return typeof operand(scope);
          } catch (error) {
            if (error instanceof ReferenceError) return "undefined";
            throw error;
          }
        }
      };
    }
    if (is("++") || is("--")) {
      next();
      const target = unary();
      return update(target, operator === "++" ? 1 : -1, true);
    }
    const ref2 = postfix();
    if (is("++") || is("--")) {
      const delta = is("++") ? 1 : -1;
      next();
      return update(ref2, delta, false);
    }
    return ref2;
  };
  const update = (target, delta, prefix) => {
    const set = writable(target);
    return {
      get: (scope) => {
        const old = Number(target.get(scope));
        set(scope, old + delta);
        return prefix ? old + delta : old;
      }
    };
  };
  const writable = (target) => {
    if (!target.set) fail(target.name ? `Cannot assign to "${target.name}"; assign to a property instead, such as $data.name` : "Invalid assignment target");
    return target.set;
  };
  const binaryExpression = (minimum) => {
    let left = unary();
    while (true) {
      const operator = token.value;
      const level = token.type === "punct" || token.type === "name" ? precedence[operator] : void 0;
      if (!level || level < minimum) return left;
      next();
      const right = binaryExpression(operator === "**" ? level : level + 1).get;
      const leftGet = left.get;
      if (operator === "&&") left = { get: (scope) => leftGet(scope) && right(scope) };
      else if (operator === "||") left = { get: (scope) => leftGet(scope) || right(scope) };
      else if (operator === "??") left = { get: (scope) => leftGet(scope) ?? right(scope) };
      else {
        const apply = binary[operator];
        left = { get: (scope) => apply(leftGet(scope), right(scope)) };
      }
    }
  };
  const conditional = () => {
    const test = binaryExpression(1);
    if (!is("?")) return test;
    next();
    const yes = assign().get;
    expect(":");
    const no = assign().get;
    return { get: (scope) => test.get(scope) ? yes(scope) : no(scope) };
  };
  const assign = () => {
    const target = conditional();
    if (token.type !== "punct" || !assignment.has(token.value)) return target;
    const operator = token.value;
    const set = writable(target);
    next();
    const value = assign().get;
    if (operator === "=") return { get: (scope) => set(scope, value(scope)) };
    const get = target.get;
    if (operator === "??=") return { get: (scope) => get(scope) ?? set(scope, value(scope)) };
    if (operator === "||=") return { get: (scope) => get(scope) || set(scope, value(scope)) };
    if (operator === "&&=") return { get: (scope) => get(scope) && set(scope, value(scope)) };
    const apply = binary[operator.slice(0, -1)];
    return { get: (scope) => set(scope, apply(get(scope), value(scope))) };
  };
  const expression = () => {
    const ref2 = assign();
    if (is(",")) fail("The comma operator is not supported in the Brio CSP build");
    return ref2;
  };
  const atEnd = () => token.type === "end";
  next();
  if (mode === "statement") {
    const statements = [];
    while (!atEnd()) {
      if (is(";")) {
        next();
        continue;
      }
      statements.push(expression().get);
      if (!atEnd()) expect(";");
    }
    return (scope) => {
      for (const statement2 of statements) statement2(scope);
    };
  }
  const ref = expression();
  if (!atEnd()) unexpected();
  if (mode === "assign") {
    const set = writable(ref);
    return (scope, value) => set(scope, value);
  }
  return ref.get;
}
const cached = (mode) => {
  const cache = /* @__PURE__ */ new Map();
  return (source) => {
    let fn = cache.get(source);
    if (!fn) {
      cache.set(source, fn = parse(source, mode));
      if (cache.size > 500) deleteItem(cache, cache.keys().next().value);
    }
    return fn;
  };
};
const cspEngine = {
  value: cached("value"),
  statement: cached("statement"),
  assign: cached("assign"),
  csp: true
};
function hydrateUntrusted(element, parentContext, runtime) {
  const owner = getNodeOwner(element);
  const context = owner.context = elementContext(element, parentContext, runtime);
  removeAttribute(element, "b-cloak");
  if (element.hasAttribute("b-ignore") || element.hasAttribute("ignore")) {
    owner.controlsChildren = true;
    return;
  }
  const tagName = element.localName;
  const definition = componentNamePattern.test(tagName) ? runtime.components.get(tagName) : void 0;
  if (definition) {
    mountComponent(element, definition, context, runtime, hydrateNode, true);
    return;
  }
  const after = [];
  let skipChildren = false;
  for (const attribute of snapshotList(element[ATTRIBUTES])) {
    const { baseName, modifiers } = extractModifiers(attribute.name);
    const match = findPluginDirective(runtime.directives, baseName);
    const definition2 = match == null ? void 0 : match.definition;
    if (!definition2 || definition2.value !== "none" || definition2.scope || attribute.value.trim() || getLength(ObjectConstructor.keys(modifiers))) continue;
    const binding = createBinding(
      element,
      attribute.name,
      "",
      {},
      /* @__PURE__ */ new Map(),
      match,
      runtime.app,
      (node) => hydrateNode(node, owner.context, runtime)
    );
    if (definition2.children === false) owner.controlsChildren = skipChildren = true;
    if (definition2.mount) keepCleanup(runHook(definition2.mount, element, binding), binding);
    const ready = definition2.ready;
    if (ready) after.push(() => keepCleanup(runHook(ready, element, binding), binding));
    removeAttribute(element, attribute.name);
  }
  if (!skipChildren) hydrateChildren(element, context, runtime);
  for (const run of after) run();
}
setDefaultEngine(cspEngine);
const checkComponent = (name, template) => {
  if (!isString(template) || /^#[A-Za-z][\w-]*$/.test(template))
    throw createTypeError(`Component "${name}" needs a template string in the Brio CSP build; "#id" selectors and <template> elements read page markup.`);
};
function createApp(options) {
  return buildApp({ engine: cspEngine, untrusted: hydrateUntrusted, checkComponent }, options);
}
export {
  HttpError,
  a3 as addDisposer,
  d as assign,
  b2 as batch,
  l as causedError,
  v as combinedError,
  computed,
  createApp,
  c as createExpressionScope,
  c2 as createRouter,
  c3 as createScope,
  createStepEngine,
  d2 as defineDirective,
  a2 as definePlugin,
  k as describeNode,
  d4 as devtools,
  a5 as devtoolsPanel,
  n as directiveError,
  e2 as effect,
  e3 as enableDevtools,
  j as errorText,
  a as evaluate,
  e as evaluateFunction,
  b as execute,
  f as flush,
  h2 as getCurrentScope,
  t2 as getScopeNode,
  http,
  hydrateNode,
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
  q2 as queueTask,
  r as removeDisposer,
  resource,
  d3 as runUnscoped,
  i as setActiveScope,
  s as setEffectFrame,
  q as setScopeNode,
  a4 as signal,
  s2 as state,
  t as trustedHTML,
  u as untrack,
  validate
};
//# sourceMappingURL=csp-entry.js.map
