import {
    isInstanceOf,
    ObjectConstructor,
    isObjectType,
    isString,
    isBoolean,
    isNumber,
    createTypeError,
    isArray,
    objectEntries,
    deleteItem,
    includesItem,
} from '../core/native';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type HttpParser = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
export type HttpOptions = Omit<RequestInit, 'method' | 'body'> & {
    parser?: HttpParser;
    duplex?: 'half';
};
export type HttpQueryValue = string | number | boolean | Date | null | undefined |
    readonly HttpQueryValue[] | { readonly [key: string]: HttpQueryValue };
export type HttpQuery = Readonly<Record<string, HttpQueryValue>> | URLSearchParams | null;
export type HttpBody = BodyInit | object | number | boolean | null;

type ParserResults = {
    json: unknown;
    text: string;
    blob: Blob;
    arrayBuffer: ArrayBuffer;
    formData: FormData;
};

export class HttpError extends Error {
    readonly response: Response;
    readonly status: number;

    constructor(response: Response) {
        super(`HTTP ${response.status}: ${response.statusText}`);
        this.name = 'HttpError';
        this.response = response;
        this.status = response.status;
    }
}

function isPlainObject(value: object): boolean {
    const prototype = ObjectConstructor.getPrototypeOf(value);
    return prototype === null ||
        (ObjectConstructor.getPrototypeOf(prototype) === null && ObjectConstructor.prototype.toString.call(value) === '[object Object]');
}

function isDate(value: unknown): value is Date {
    return ObjectConstructor.prototype.toString.call(value) === '[object Date]';
}

function appendQuery(url: string, query: unknown): string {
    const target = new URL(url, typeof location !== 'undefined' ? location.href : 'http://localhost');
    if (isInstanceOf(query, URLSearchParams)) {
        query.forEach((value, key) => target.searchParams.append(key, value));
    } else {
        if (query === null || !isObjectType(query) || !isPlainObject(query))
            throw createTypeError('HTTP query must be a plain object or URLSearchParams.');
        const ancestors = new Set<object>();
        const append = (key: string, value: unknown): void => {
            if (value === undefined) return;
            if (value === null) {
                target.searchParams.append(key, '');
            } else if (isDate(value)) {
                target.searchParams.append(key, Date.prototype.toISOString.call(value));
            } else if (isString(value) || isBoolean(value) ||
                (isNumber(value) && Number.isFinite(value))) {
                target.searchParams.append(key, String(value));
            } else if (isObjectType(value) && (isArray(value) || isPlainObject(value))) {
                if (ancestors.has(value)) throw createTypeError(`Circular HTTP query at "${key}".`);
                ancestors.add(value);
                if (isArray(value)) {
                    value.forEach((item, index) => {
                        const structured = item !== null && isObjectType(item) && !isDate(item);
                        append(`${key}[${structured ? index : ''}]`, item);
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

function encodeBody(body: HttpBody, headers: Headers): BodyInit {
    if (isString(body) ||
        (typeof FormData !== 'undefined' && isInstanceOf(body, FormData)) ||
        (typeof URLSearchParams !== 'undefined' && isInstanceOf(body, URLSearchParams)) ||
        (typeof Blob !== 'undefined' && isInstanceOf(body, Blob)) ||
        isInstanceOf(body, ArrayBuffer) || ArrayBuffer.isView(body) ||
        (typeof ReadableStream !== 'undefined' && isInstanceOf(body, ReadableStream))) return body as BodyInit;
    if (body !== null && !isNumber(body) && !isBoolean(body) &&
        !(isObjectType(body) && (isArray(body) || isPlainObject(body))))
        throw createTypeError('HTTP body must be JSON data or a native Fetch body.');
    const json = JSON.stringify(body);
    if (json === undefined) throw createTypeError('HTTP body did not serialize to JSON.');
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return json;
}

function request<Input extends HttpQuery | HttpBody>(method: HttpMethod) {
    function send<T = unknown>(url: string, input: Input | undefined, options: HttpOptions & { parser: 'json' }): Promise<T>;
    function send<P extends Exclude<HttpParser, 'json'>>(url: string, input: Input | undefined, options: HttpOptions & { parser: P }): Promise<ParserResults[P]>;
    function send<T = unknown>(url: string, input?: Input, options?: HttpOptions & { parser?: undefined }): Promise<T | undefined>;
    function send(url: string, input?: Input, options?: HttpOptions): Promise<unknown>;
    async function send(url: string, input?: Input, options: HttpOptions = {}): Promise<unknown> {
        const { parser, ...init } = options;
        if (parser !== undefined && !includesItem(['json', 'text', 'blob', 'arrayBuffer', 'formData'], parser))
            throw createTypeError(`Unknown HTTP parser: "${parser}".`);
        const headers = new Headers(init.headers);
        let body: BodyInit | undefined;
        if (method === 'GET' || method === 'DELETE') {
            if (input !== undefined && input !== null) url = appendQuery(url, input);
        } else if (input !== undefined) {
            body = encodeBody(input, headers);
        }
        const response = await fetch(url, { ...init, method, headers, body });
        if (!response.ok) throw new HttpError(response);
        if (parser !== undefined) return response[parser]();
        if (response.status === 204 || response.status === 205) return undefined;
        const contentType = (response.headers.get('content-type') ?? '').split(';', 1)[0].trim().toLowerCase();
        const text = await response.text();
        if (contentType === 'application/json' || /^[^/\s]+\/[^/\s]+\+json$/.test(contentType))
            return text === '' ? undefined : JSON.parse(text);
        return text;
    }
    return send;
}

export const http = {
    get: request<HttpQuery>('GET'),
    post: request<HttpBody>('POST'),
    put: request<HttpBody>('PUT'),
    patch: request<HttpBody>('PATCH'),
    delete: request<HttpQuery>('DELETE'),
};
