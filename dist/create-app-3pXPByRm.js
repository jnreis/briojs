import { b as buildApp } from "./app-BJAG0TST.js";
import { $ as $CONTEXT, h as contextNames, s as setDefaultEngine } from "./context-values-Burp5FXv.js";
import { g as getLength, d as deleteItem, m as includesItem } from "./native-BneND9DN.js";
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
const cached = (make) => {
  const cache = /* @__PURE__ */ new Map();
  return (source, scope) => {
    const extras = presentNames(source, scope);
    const key = getLength(extras) ? `${source}\0${extras}` : source;
    let fn = cache.get(key);
    if (!fn) {
      cache.set(key, fn = make(source, contextBindings(source, extras)));
      if (cache.size > 500) deleteItem(cache, cache.keys().next().value);
    }
    return fn;
  };
};
const functionEngine = {
  value: cached((expression, bindings) => new Function($CONTEXT, `${bindings} return (${expression});`)),
  statement: cached((expression, bindings) => new Function($CONTEXT, `${bindings} ${expression}`)),
  assign: cached((expression, bindings) => new Function($CONTEXT, "$value", `${bindings} return (${expression} = $value);`)),
  function: cached((expression, bindings) => new Function($CONTEXT, `${bindings} return (${expression.replace(/;\s*$/, "")});`))
};
setDefaultEngine(functionEngine);
function createApp(options) {
  return buildApp({ engine: functionEngine }, options);
}
export {
  createApp as c
};
//# sourceMappingURL=create-app-3pXPByRm.js.map
