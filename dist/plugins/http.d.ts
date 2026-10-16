export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type HttpParser = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
export type HttpOptions = Omit<RequestInit, 'method' | 'body'> & {
    parser?: HttpParser;
    duplex?: 'half';
};
export type HttpQueryValue = string | number | boolean | Date | null | undefined | readonly HttpQueryValue[] | {
    readonly [key: string]: HttpQueryValue;
};
export type HttpQuery = Readonly<Record<string, HttpQueryValue>> | URLSearchParams | null;
export type HttpBody = BodyInit | object | number | boolean | null;
type ParserResults = {
    json: unknown;
    text: string;
    blob: Blob;
    arrayBuffer: ArrayBuffer;
    formData: FormData;
};
export declare class HttpError extends Error {
    readonly response: Response;
    readonly status: number;
    constructor(response: Response);
}
export declare const http: {
    get: {
        <T = unknown>(url: string, input: HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: "json";
        }): Promise<T>;
        <P extends Exclude<HttpParser, "json">>(url: string, input: HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: P;
        }): Promise<ParserResults[P]>;
        <T = unknown>(url: string, input?: HttpQuery | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser?: undefined;
        }) | undefined): Promise<T | undefined>;
        (url: string, input?: HttpQuery | undefined, options?: HttpOptions): Promise<unknown>;
    };
    post: {
        <T = unknown>(url: string, input: HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: "json";
        }): Promise<T>;
        <P extends Exclude<HttpParser, "json">>(url: string, input: HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: P;
        }): Promise<ParserResults[P]>;
        <T = unknown>(url: string, input?: HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser?: undefined;
        }) | undefined): Promise<T | undefined>;
        (url: string, input?: HttpBody | undefined, options?: HttpOptions): Promise<unknown>;
    };
    put: {
        <T = unknown>(url: string, input: HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: "json";
        }): Promise<T>;
        <P extends Exclude<HttpParser, "json">>(url: string, input: HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: P;
        }): Promise<ParserResults[P]>;
        <T = unknown>(url: string, input?: HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser?: undefined;
        }) | undefined): Promise<T | undefined>;
        (url: string, input?: HttpBody | undefined, options?: HttpOptions): Promise<unknown>;
    };
    patch: {
        <T = unknown>(url: string, input: HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: "json";
        }): Promise<T>;
        <P extends Exclude<HttpParser, "json">>(url: string, input: HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: P;
        }): Promise<ParserResults[P]>;
        <T = unknown>(url: string, input?: HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser?: undefined;
        }) | undefined): Promise<T | undefined>;
        (url: string, input?: HttpBody | undefined, options?: HttpOptions): Promise<unknown>;
    };
    delete: {
        <T = unknown>(url: string, input: HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: "json";
        }): Promise<T>;
        <P extends Exclude<HttpParser, "json">>(url: string, input: HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser: P;
        }): Promise<ParserResults[P]>;
        <T = unknown>(url: string, input?: HttpQuery | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
            parser?: HttpParser;
            duplex?: "half";
        } & {
            parser?: undefined;
        }) | undefined): Promise<T | undefined>;
        (url: string, input?: HttpQuery | undefined, options?: HttpOptions): Promise<unknown>;
    };
};
export {};
