var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || Object.getPrototypeOf(prototype) === null && Object.prototype.toString.call(value) === "[object Object]";
}
function isDate(value) {
  return Object.prototype.toString.call(value) === "[object Date]";
}
function appendQuery(url, query) {
  const target = new URL(url, typeof location !== "undefined" ? location.href : "http://localhost");
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => target.searchParams.append(key, value));
  } else {
    if (query === null || typeof query !== "object" || !isPlainObject(query))
      throw new TypeError("HTTP query must be a plain object or URLSearchParams.");
    const ancestors = /* @__PURE__ */ new Set();
    const append = (key, value) => {
      if (value === void 0) return;
      if (value === null) {
        target.searchParams.append(key, "");
      } else if (isDate(value)) {
        target.searchParams.append(key, Date.prototype.toISOString.call(value));
      } else if (typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value)) {
        target.searchParams.append(key, String(value));
      } else if (typeof value === "object" && (Array.isArray(value) || isPlainObject(value))) {
        if (ancestors.has(value)) throw new TypeError(`Circular HTTP query at "${key}".`);
        ancestors.add(value);
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            const structured = item !== null && typeof item === "object" && !isDate(item);
            append(`${key}[${structured ? index : ""}]`, item);
          });
        } else {
          for (const [name, item] of Object.entries(value)) append(`${key}[${name}]`, item);
        }
        ancestors.delete(value);
      } else {
        throw new TypeError(`Unsupported HTTP query value at "${key}".`);
      }
    };
    ancestors.add(query);
    for (const [key, value] of Object.entries(query)) append(key, value);
  }
  return target.href;
}
function encodeBody(body, headers) {
  if (typeof body === "string" || typeof FormData !== "undefined" && body instanceof FormData || typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams || typeof Blob !== "undefined" && body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body) || typeof ReadableStream !== "undefined" && body instanceof ReadableStream) return body;
  if (body !== null && typeof body !== "number" && typeof body !== "boolean" && !(typeof body === "object" && (Array.isArray(body) || isPlainObject(body))))
    throw new TypeError("HTTP body must be JSON data or a native Fetch body.");
  const json = JSON.stringify(body);
  if (json === void 0) throw new TypeError("HTTP body did not serialize to JSON.");
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return json;
}
function request(method) {
  async function send(url, input, options = {}) {
    const { parser, ...init } = options;
    if (parser !== void 0 && !["json", "text", "blob", "arrayBuffer", "formData"].includes(parser))
      throw new TypeError(`Unknown HTTP parser: "${parser}".`);
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
