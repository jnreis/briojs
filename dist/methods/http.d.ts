/**
 * Convert nested objects and arrays into a flat key-value pair format.
 * This is useful for sending data in a format that can be easily parsed by servers.
 * URLSearchParams is used for `application/x-www-form-urlencoded`.
 * - It also helps avoid CORS issues by avoiding preflight requests.
 * - It works with every type of request, including GET and DELETE.
 * FormData is used for `multipart/form-data`.
 * - It is especially useful for file uploads.
 * - It does not work with GET and DELETE requests.
 */
export declare let encodeParams: (obj: any, paramType?: string, prefix?: string) => URLSearchParams | FormData;
export declare let http: {
    get: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    post: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    put: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    patch: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    delete: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
};
