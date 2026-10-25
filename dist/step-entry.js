import { p as objectKeys, c as createTypeError, g as getLength, O as ObjectConstructor, j as isString, e as isObjectType, n as includesItem, l as ownKeys, G as GET_OWN_PROPERTY_DESCRIPTOR } from "./native-C6Z9zuZA.js";
import { a as signal } from "./state-D6RTXn8X.js";
function properties(value, label) {
  if (!value || !isObjectType(value) || !includesItem([ObjectConstructor.prototype, null], ObjectConstructor.getPrototypeOf(value)))
    throw createTypeError(`${label} must be a plain object.`);
  const result = ObjectConstructor.create(null);
  for (const key of ownKeys(value)) {
    const descriptor = ObjectConstructor[GET_OWN_PROPERTY_DESCRIPTOR](value, key);
    if (!isString(key) || !("value" in descriptor))
      throw createTypeError(`${label} must contain string-keyed data properties.`);
    result[key] = descriptor.value;
  }
  return result;
}
const validName = (value) => isString(value) && getLength(value.trim()) > 0;
function createStepEngine(options) {
  const config = properties(options, "Step options");
  if (objectKeys(config).some((key) => key !== "initial" && key !== "steps"))
    throw createTypeError("Step options support only initial and steps.");
  const definitions = properties(config.steps, "Step definitions");
  const names = objectKeys(definitions);
  if (!getLength(names) || names.some((name) => !validName(name)))
    throw createTypeError("Step definitions require nonempty step names.");
  const links = /* @__PURE__ */ new Map();
  for (const name of names) {
    const definition = properties(definitions[name], `Step "${name}"`);
    if (objectKeys(definition).some((key) => key !== "next"))
      throw createTypeError(`Step "${name}" supports only next.`);
    const next = definition.next;
    if (ObjectConstructor.prototype.hasOwnProperty.call(definition, "next") && !validName(next))
      throw createTypeError(`Step "${name}" next must be a nonempty string.`);
    links.set(name, isString(next) ? next : void 0);
  }
  const initial = config.initial;
  if (!validName(initial) || !links.has(initial))
    throw createTypeError("Step initial must name a registered step.");
  for (const [name, next] of links) {
    if (next !== void 0 && !links.has(next))
      throw createTypeError(`Step "${name}" has an unknown next step "${next}".`);
  }
  let current = initial;
  const history = [];
  const revision = signal(0);
  let version = 0;
  const notify = () => {
    revision.value = ++version;
  };
  const observe = () => {
    revision.value;
  };
  const go = (name) => {
    if (!validName(name) || !links.has(name))
      throw createTypeError("Step go target must name a registered step.");
    if (name === current) return true;
    history.push(current);
    current = name;
    notify();
    return true;
  };
  return ObjectConstructor.freeze({
    get current() {
      observe();
      return current;
    },
    get canGoNext() {
      observe();
      return links.get(current) !== void 0;
    },
    get canGoBack() {
      observe();
      return getLength(history) > 0;
    },
    isActive(name) {
      observe();
      return current === name;
    },
    go,
    next() {
      const next = links.get(current);
      return next === void 0 ? false : go(next);
    },
    back() {
      if (!getLength(history)) return false;
      current = history.pop();
      notify();
      return true;
    },
    reset() {
      if (current === initial && !getLength(history)) return false;
      current = initial;
      history.length = 0;
      notify();
      return true;
    }
  });
}
export {
  createStepEngine
};
//# sourceMappingURL=step-entry.js.map
