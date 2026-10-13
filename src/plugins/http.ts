export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type HttpOptions = {
    headers?: Record<string, string> | Headers;
    parser?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
    [key: string]: unknown;
};

const request = (method: HttpMethod) => async (url: string, body?: any, options: HttpOptions = {}): Promise<any> => {
    const headers = new Headers(options.headers);
    let finalBody: BodyInit | undefined = undefined;

    if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
        if (body instanceof FormData || body instanceof URLSearchParams || typeof body === 'string') {
            finalBody = body;
        } else {
            headers.set('Content-Type', 'application/json');
            finalBody = JSON.stringify(body);
        }
    } else if (body !== undefined && (method === 'GET' || method === 'DELETE')) {
        const u = new URL(url, typeof location !== 'undefined' ? location.href : 'http://localhost');
        if (typeof body === 'object') {
            for (const [k, v] of Object.entries(body)) {
                u.searchParams.append(k, String(v));
            }
        }
        url = u.href;
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
        body: finalBody,
    });

    if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any;
        error.response = response;
        throw error;
    }

    const parser = options.parser;
    if (parser) {
        return response[parser]();
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
};

export const http = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    patch: request('PATCH'),
    delete: request('DELETE'),
};
