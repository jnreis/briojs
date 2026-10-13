export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type HttpOptions = {
    headers?: Record<string, string> | Headers;
    parser?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
    [key: string]: unknown;
};
export declare const http: {
    get: (url: string, body?: any, options?: HttpOptions) => Promise<any>;
    post: (url: string, body?: any, options?: HttpOptions) => Promise<any>;
    put: (url: string, body?: any, options?: HttpOptions) => Promise<any>;
    patch: (url: string, body?: any, options?: HttpOptions) => Promise<any>;
    delete: (url: string, body?: any, options?: HttpOptions) => Promise<any>;
};
