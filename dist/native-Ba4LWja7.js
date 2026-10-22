const GET_OWN_PROPERTY_DESCRIPTOR = "getOwnPropertyDescriptor";
const $PARENT = "$parent";
const TEMPLATE = "template";
const TELEPORT = "teleport";
const B_TELEPORT = "b-" + TELEPORT;
const ATTRIBUTES = "attributes";
const ObjectConstructor = Object;
const ReflectApi = Reflect;
const isArray = (value) => Array.isArray(value);
const objectKeys = (value) => ObjectConstructor.keys(value);
const objectEntries = (value) => ObjectConstructor.entries(value);
const ownKeys = (value) => ReflectApi.ownKeys(value);
function arrayFrom(items, map, thisArg) {
  return getLength(arguments) === 1 ? Array.from(items) : Array.from(items, map, thisArg);
}
const snapshotList = (list) => {
  const length = getLength(list);
  const copy = new Array(length);
  for (let index = 0; index < length; index++) copy[index] = list[index];
  return copy;
};
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
  ObjectConstructor as O,
  ReflectApi as R,
  TELEPORT as T,
  arrayFrom as a,
  createError as b,
  createTypeError as c,
  deleteItem as d,
  isObjectType as e,
  isNumber as f,
  getLength as g,
  isInstanceOf as h,
  isFunction as i,
  isArray as j,
  ownKeys as k,
  isString as l,
  createSyntaxError as m,
  includesItem as n,
  objectEntries as o,
  objectKeys as p,
  brioErrors as q,
  removeElement as r,
  startsWith as s,
  TEMPLATE as t,
  isBoolean as u,
  snapshotList as v
};
//# sourceMappingURL=native-Ba4LWja7.js.map
