import { has } from "../tools";
import { lower, stringify } from "../tools/string";

let CONTENT_TYPE: "Content-Type" = "Content-Type";
let CONTENT_TYPE_JSON: "application/json" = "application/json";

type HttpHeaders = HeadersInit | { [key: string]: string };

interface HttpOptions extends RequestInit {
    headers?: HttpHeaders;
}

interface HttpInstance {
    get: (endpoint: string, headers?: HttpHeaders) => Promise<any>;
    post: (endpoint: string, body: any, headers?: HttpHeaders) => Promise<any>;
    put: (endpoint: string, body: any, headers?: HttpHeaders) => Promise<any>;
    patch: (endpoint: string, body: any, headers?: HttpHeaders) => Promise<any>;
    delete: (endpoint: string, headers?: HttpHeaders) => Promise<any>;
}

export let $http = () => (baseUrl: string = '', globalOptions: HttpOptions = {}): HttpInstance => {
    let _http = async (endpoint: string, config: HttpOptions = {}): Promise<any> => {
        let url = `${baseUrl}${endpoint}`;
        let finalConfig = {
            ...globalOptions,
            ...config,
            headers: { ...globalOptions.headers, ...config.headers },
        };

        try {
            let response = await fetch(url, finalConfig);

            if (!response.ok) {
                let error = new Error(`HTTP error! status: ${response.status}`);
                (error as any).response = response;
                throw error;
            }

            let contentType = response.headers.get(lower(CONTENT_TYPE));
            if (contentType && has(contentType, CONTENT_TYPE_JSON)) {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            // Add any additional error handling or logging here
            throw error;
        }
    };

    let _noDataRequest = (method: "GET" | "DELETE") =>
        (endpoint: string, headers: HttpHeaders = {}): Promise<any> =>
            _http(endpoint, {
                method,
                headers,
            });

    let _dataRequest = (method: "POST" | "PUT" | "PATCH") =>
        (endpoint: string, body: any, headers: HttpHeaders = {}): Promise<any> =>
            _http(endpoint, {
                method,
                headers: { [CONTENT_TYPE]: CONTENT_TYPE_JSON, ...headers },
                body: stringify(body),
            });

    return {
        get: _noDataRequest("GET"),
        post: _dataRequest("POST"),
        put: _dataRequest("PUT"),
        patch: _dataRequest("PATCH"),
        delete: _noDataRequest("DELETE"),
    };
};