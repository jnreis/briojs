const GET_OWN_PROPERTY_DESCRIPTOR = "getOwnPropertyDescriptor";
const $PARENT = "$parent";
const TEMPLATE = "template";
const TELEPORT = "teleport";
const B_TELEPORT = "b-" + TELEPORT;
const ATTRIBUTES = "attributes";
const objectConstructor = Object;
const ReflectApi = Reflect;
const isArray = (value) => Array.isArray(value);
const objectKeys = (value) => objectConstructor.keys(value);
const objectEntries = (value) => objectConstructor.entries(value);
const ownKeys = (value) => ReflectApi.ownKeys(value);
function arrayFrom(...args) {
  return ReflectApi.apply(Array.from, Array, args);
}
const brioErrors = /* @__PURE__ */ new WeakSet();
const ownError = (error) => (brioErrors.add(error), error);
const createError = (message) => ownError(new Error(message));
const createTypeError = (message) => ownError(new TypeError(message));
const createSyntaxError = (message) => ownError(new SyntaxError(message));
const isString = (value) => typeof value === "string";
const isObjectType = (value) => typeof value === "object";
const isNumber = (value) => typeof value === "number";
const isBoolean = (value) => typeof value === "boolean";
const isFunction = (value) => typeof value === "function";
const getLength = (value) => value.length;
const isInstanceOf = (value, constructor) => value instanceof constructor;
const removeElement = (element) => element == null ? void 0 : element.remove();
const deleteItem = (collection, item) => collection == null ? void 0 : collection.delete(item);
const includesItem = (collection, item) => collection.includes(item);
const startsWith = (value, prefix) => value.startsWith(prefix);
export {
  $PARENT as $,
  ATTRIBUTES as A,
  B_TELEPORT as B,
  GET_OWN_PROPERTY_DESCRIPTOR as G,
  ReflectApi as R,
  TELEPORT as T,
  arrayFrom as a,
  createError as b,
  createTypeError as c,
  deleteItem as d,
  objectEntries as e,
  isObjectType as f,
  getLength as g,
  isNumber as h,
  isFunction as i,
  isInstanceOf as j,
  isArray as k,
  ownKeys as l,
  isString as m,
  createSyntaxError as n,
  objectConstructor as o,
  includesItem as p,
  objectKeys as q,
  removeElement as r,
  brioErrors as s,
  startsWith as t,
  TEMPLATE as u,
  isBoolean as v
};
//# sourceMappingURL=native-CjaBWh7p.js.map
