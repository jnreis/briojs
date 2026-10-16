import { inspectDevtools, devtoolsPanel, enableDevtools } from './devtools-entry';

declare const brio: {
    devtools: {
        subscribe(callback: () => void): () => void;
        getSnapshot: () => import('.').DevtoolsSnapshot;
        reset(): void;
    };
    inspectDevtools: typeof inspectDevtools;
    devtoolsPanel: typeof devtoolsPanel;
    enableDevtools: typeof enableDevtools;
    createApp: typeof import('.').createApp;
    state: typeof import('.').state;
    signal: typeof import('.').signal;
    computed: typeof import('.').computed;
    effect: typeof import('.').effect;
    batch: typeof import('.').batch;
    createScope: typeof import('.').createScope;
    onCleanup: typeof import('.').onCleanup;
    getCurrentScope: typeof import('.').getCurrentScope;
    createStepEngine: typeof import('.').createStepEngine;
    validate: typeof import('.').validate;
    http: {
        get: {
            <T = unknown>(url: string, input: import('.').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('.').HttpParser, "json">>(url: string, input: import('.').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
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
            <T = unknown>(url: string, input?: import('.').HttpQuery | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('.').HttpQuery | undefined, options?: import('.').HttpOptions): Promise<unknown>;
        };
        post: {
            <T = unknown>(url: string, input: import('.').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('.').HttpParser, "json">>(url: string, input: import('.').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
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
            <T = unknown>(url: string, input?: import('.').HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('.').HttpBody | undefined, options?: import('.').HttpOptions): Promise<unknown>;
        };
        put: {
            <T = unknown>(url: string, input: import('.').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('.').HttpParser, "json">>(url: string, input: import('.').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
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
            <T = unknown>(url: string, input?: import('.').HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('.').HttpBody | undefined, options?: import('.').HttpOptions): Promise<unknown>;
        };
        patch: {
            <T = unknown>(url: string, input: import('.').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('.').HttpParser, "json">>(url: string, input: import('.').HttpBody | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
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
            <T = unknown>(url: string, input?: import('.').HttpBody | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('.').HttpBody | undefined, options?: import('.').HttpOptions): Promise<unknown>;
        };
        delete: {
            <T = unknown>(url: string, input: import('.').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser: "json";
            }): Promise<T>;
            <P extends Exclude<import('.').HttpParser, "json">>(url: string, input: import('.').HttpQuery | undefined, options: Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
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
            <T = unknown>(url: string, input?: import('.').HttpQuery | undefined, options?: (Omit<RequestInit, "body" | "method"> & {
                parser?: import('.').HttpParser;
                duplex?: "half";
            } & {
                parser?: undefined;
            }) | undefined): Promise<T | undefined>;
            (url: string, input?: import('.').HttpQuery | undefined, options?: import('.').HttpOptions): Promise<unknown>;
        };
    };
    HttpError: typeof import('.').HttpError;
    trustedHTML: typeof import('.').trustedHTML;
};
export default brio;
