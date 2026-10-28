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
const brioError = /* @__PURE__ */ Symbol.for("brio.error");
const isBrioError = (error) => (error == null ? void 0 : error[brioError]) === true;
const ownError = (error) => ObjectConstructor.defineProperty(error, brioError, { value: true });
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
  isString as j,
  isArray as k,
  ownKeys as l,
  includesItem as m,
  createSyntaxError as n,
  objectEntries as o,
  objectKeys as p,
  isBrioError as q,
  removeElement as r,
  snapshotList as s,
  startsWith as t,
  isBoolean as u,
  TEMPLATE as v
};
//# sourceMappingURL=native-BneND9DN.js.map
