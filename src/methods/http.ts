import { entries } from '../tools';
import { each } from '../tools/array';
import { TEXT, GET, DELETE, PUT, POST, PATCH, METHOD, HEADERS, CONTENT__$CAP, APPEND, DATA, CONTENT } from '../tools/constants';
import { getProp } from '../tools/object';
import { endsWith, lower, parse, stringify } from '../tools/string';
import { isArray, isObject } from '../tools/typeCheck';

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
let encodeParams = (obj: any, paramType = '', prefix = '') => {
    let ParamsType = paramType == DATA ? FormData : URLSearchParams;
    let params = new ParamsType();

    let buildParams = (data: any, keyPrefix = '') => {
      if (isObject(data) || isArray(data)) {
        each(entries(data), ([key, value]) => {
          let newKey = keyPrefix
            ? `${keyPrefix}[${key}]`
            : key;

          buildParams(value, newKey);
        });
      } else {
        params[APPEND](keyPrefix, data);
      }
    }

    buildParams(obj, prefix);

    return params;
}

let _http = (method: 'get' | 'delete' | 'post' | 'put' | 'patch') => 
    async (endpoint: string, body?: any, options: HttpOptions = {}): Promise<any> => {

    let TEXT_STATUS: 'status' = 'status';
    let CONTENT_TYPE = CONTENT__$CAP + '-Type' as 'Content-Type';

    /**
     * The name of the `parser` can be provided to explicitly specify how the response should be parsed.
     * 
     * By default, the response is parsed as `text` if no parser is provided.
     * The response is then attempted to be parsed as JSON if no parser is provided.
     */
    let parser: ResponseParser = getProp(options, 'parser');

    if (isObject(body) || isArray(body)) {
        let headers = new Headers(options[HEADERS]);
        let contentTypeValue = lower(headers.get(CONTENT_TYPE) || '');

        // Append the body to the endpoint as query parameters
        // REASON: GET and DELETE requests should not have a body
        if (method == GET || method == DELETE) {
            let params = encodeParams(body) as URLSearchParams;
            let url = new URL(endpoint, location.href);
            params.forEach((value, key) => url.searchParams.append(key, value));
            endpoint = url.href;
            body = undefined;
        }
        // Stringify the body as JSON
        else if (endsWith(contentTypeValue, 'json')) {
            body = stringify(body);
            headers.set(CONTENT_TYPE, 'application/json');
        }
        // Use FormData if the content type ends with 'form-data'
        else if (endsWith(contentTypeValue, 'form-data')) {
            body = encodeParams(body, DATA);
            headers.delete(CONTENT_TYPE);
        }
        // Stringify the body as x-www-form-urlencoded
        else {
            body = encodeParams(body);
            headers.set(CONTENT_TYPE, 'application/x-www-form-urlencoded;charset=UTF-8');
        }

        options = {...options, [HEADERS]: headers};
    }

    let response = await fetch(endpoint, {...options, [METHOD]: method, body});

    // Get the response content
    let content = await response[parser || TEXT]();

    // If the parser is not provided, attempt to parse the response as JSON.
    if (!parser) {
        content = parse(content);
    }

    if (!response.ok) {
        let error = new Error(`HTTP ${response[TEXT_STATUS]}! Status text: ` + response.statusText) as any;
        error.response = response;
        error[CONTENT] = content;
        throw error;
    }

    return content;
}

export let http = {
    get: _http(GET),
    post: _http(POST),
    put: _http(PUT),
    [PATCH]: _http(PATCH),
    [DELETE]: _http(DELETE)
};