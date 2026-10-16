import { createApp, state, signal, computed, effect, batch, createScope, onCleanup, getCurrentScope, createStepEngine, validate, HttpError, trustedHTML } from './index';

declare const brio: {
    createApp: typeof createApp;
    state: typeof state;
    signal: typeof signal;
    computed: typeof computed;
    effect: typeof effect;
    batch: typeof batch;
    createScope: typeof createScope;
    onCleanup: typeof onCleanup;
    getCurrentScope: typeof getCurrentScope;
    createStepEngine: typeof createStepEngine;
    validate: typeof validate;
    http: {
        get: {
            <T = unknown>(url: string, input: import('./index').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('./index').HttpParser, "json">>(url: string, input: import('./index').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: P;
            }): Promise<{
                json: unknown;
                text: string;
                blob: Blob;
                arrayBuffer: ArrayBuffer;
                formData: FormData;
            }[P]>;
            <T = unknown>(url: string, input?: import('./index').HttpQuery | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('./index').HttpQuery | undefined, options?: import('./index').HttpOptions): Promise<unknown>;
        };
        post: {
            <T = unknown>(url: string, input: import('./index').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('./index').HttpParser, "json">>(url: string, input: import('./index').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: P;
            }): Promise<{
                json: unknown;
                text: string;
                blob: Blob;
                arrayBuffer: ArrayBuffer;
                formData: FormData;
            }[P]>;
            <T = unknown>(url: string, input?: import('./index').HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('./index').HttpBody | undefined, options?: import('./index').HttpOptions): Promise<unknown>;
        };
        put: {
            <T = unknown>(url: string, input: import('./index').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('./index').HttpParser, "json">>(url: string, input: import('./index').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: P;
            }): Promise<{
                json: unknown;
                text: string;
                blob: Blob;
                arrayBuffer: ArrayBuffer;
                formData: FormData;
            }[P]>;
            <T = unknown>(url: string, input?: import('./index').HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('./index').HttpBody | undefined, options?: import('./index').HttpOptions): Promise<unknown>;
        };
        patch: {
            <T = unknown>(url: string, input: import('./index').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('./index').HttpParser, "json">>(url: string, input: import('./index').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: P;
            }): Promise<{
                json: unknown;
                text: string;
                blob: Blob;
                arrayBuffer: ArrayBuffer;
                formData: FormData;
            }[P]>;
            <T = unknown>(url: string, input?: import('./index').HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('./index').HttpBody | undefined, options?: import('./index').HttpOptions): Promise<unknown>;
        };
        delete: {
            <T = unknown>(url: string, input: import('./index').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('./index').HttpParser, "json">>(url: string, input: import('./index').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser: P;
            }): Promise<{
                json: unknown;
                text: string;
                blob: Blob;
                arrayBuffer: ArrayBuffer;
                formData: FormData;
            }[P]>;
            <T = unknown>(url: string, input?: import('./index').HttpQuery | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('./index').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('./index').HttpQuery | undefined, options?: import('./index').HttpOptions): Promise<unknown>;
        };
    };
    HttpError: typeof HttpError;
    trustedHTML: typeof trustedHTML;
};
export default brio;
