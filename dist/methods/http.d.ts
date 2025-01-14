export declare let http: {
    get: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    post: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    put: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    patch: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
    delete: (endpoint: string, body?: any, options?: HttpOptions) => Promise<any>;
};
