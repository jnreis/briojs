var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { p as includesItem, c as createTypeError, j as isInstanceOf, f as isObjectType, e as objectEntries, m as isString, h as isNumber, v as isBoolean, k as isArray, o as objectConstructor, d as deleteItem } from "./native-DNTl55LH.js";
class HttpError extends Error {
  constructor(response) {
    super(`HTTP ${response.status}: ${response.statusText}`);
    __publicField(this, "response");
    __publicField(this, "status");
    this.name = "HttpError";
    this.response = response;
    this.status = response.status;
  }
}
function isPlainObject(value) {
  const prototype = objectConstructor.getPrototypeOf(value);
  return prototype === null || objectConstructor.getPrototypeOf(prototype) === null && objectConstructor.prototype.toString.call(value) === "[object Object]";
}
function isDate(value) {
  return objectConstructor.prototype.toString.call(value) === "[object Date]";
}
function appendQuery(url, query) {
  const target = new URL(url, typeof location !== "undefined" ? location.href : "http://localhost");
  if (isInstanceOf(query, URLSearchParams)) {
    query.forEach((value, key) => target.searchParams.append(key, value));
  } else {
    if (query === null || !isObjectType(query) || !isPlainObject(query))
      throw createTypeError("HTTP query must be a plain object or URLSearchParams.");
    const ancestors = /* @__PURE__ */ new Set();
    const append = (key, value) => {
      if (value === void 0) return;
      if (value === null) {
        target.searchParams.append(key, "");
      } else if (isDate(value)) {
        target.searchParams.append(key, Date.prototype.toISOString.call(value));
      } else if (isString(value) || isBoolean(value) || isNumber(value) && Number.isFinite(value)) {
        target.searchParams.append(key, String(value));
      } else if (isObjectType(value) && (isArray(value) || isPlainObject(value))) {
        if (ancestors.has(value)) throw createTypeError(`Circular HTTP query at "${key}".`);
        ancestors.add(value);
        if (isArray(value)) {
          value.forEach((item, index) => {
            const structured = item !== null && isObjectType(item) && !isDate(item);
            append(`${key}[${structured ? index : ""}]`, item);
          });
        } else {
          for (const [name, item] of objectEntries(value)) append(`${key}[${name}]`, item);
        }
        deleteItem(ancestors, value);
      } else {
        throw createTypeError(`Unsupported HTTP query value at "${key}".`);
      }
    };
    ancestors.add(query);
    for (const [key, value] of objectEntries(query)) append(key, value);
  }
  return target.href;
}
function encodeBody(body, headers) {
  if (isString(body) || typeof FormData !== "undefined" && isInstanceOf(body, FormData) || typeof URLSearchParams !== "undefined" && isInstanceOf(body, URLSearchParams) || typeof Blob !== "undefined" && isInstanceOf(body, Blob) || isInstanceOf(body, ArrayBuffer) || ArrayBuffer.isView(body) || typeof ReadableStream !== "undefined" && isInstanceOf(body, ReadableStream)) return body;
  if (body !== null && !isNumber(body) && !isBoolean(body) && !(isObjectType(body) && (isArray(body) || isPlainObject(body))))
    throw createTypeError("HTTP body must be JSON data or a native Fetch body.");
  const json = JSON.stringify(body);
  if (json === void 0) throw createTypeError("HTTP body did not serialize to JSON.");
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return json;
}
function request(method) {
  async function send(url, input, options = {}) {
    const { parser, ...init } = options;
    if (parser !== void 0 && !includesItem(["json", "text", "blob", "arrayBuffer", "formData"], parser))
      throw createTypeError(`Unknown HTTP parser: "${parser}".`);
    const headers = new Headers(init.headers);
    let body;
    if (method === "GET" || method === "DELETE") {
      if (input !== void 0 && input !== null) url = appendQuery(url, input);
    } else if (input !== void 0) {
      body = encodeBody(input, headers);
    }
    const response = await fetch(url, { ...init, method, headers, body });
    if (!response.ok) throw new HttpError(response);
    if (parser !== void 0) return response[parser]();
    if (response.status === 204 || response.status === 205) return void 0;
    const contentType = (response.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase();
    const text = await response.text();
    if (contentType === "application/json" || /^[^/\s]+\/[^/\s]+\+json$/.test(contentType))
      return text === "" ? void 0 : JSON.parse(text);
    return text;
  }
  return send;
}
const http = {
  get: request("GET"),
  post: request("POST"),
  put: request("PUT"),
  patch: request("PATCH"),
  delete: request("DELETE")
};
export {
  HttpError,
  http
};
//# sourceMappingURL=http-entry.js.map
