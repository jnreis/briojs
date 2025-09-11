import { entries } from '../tools';
import { each, find } from '../tools/array';
import { ERROR, TEXT, GET, DELETE, PUT, POST, PATCH, UNDEFINED, METHOD, HEADERS, CONTENT__$CAP, APPEND, DATA } from '../tools/constants';
import { getProp, getKeys, deleteKey } from '../tools/object';
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
export let encodeParams = (obj: any, paramType = '', prefix = '') => {
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

    // Stringify the body if it is an object
    if (isObject(body)) {

        // Get the headers
        let headers: ObjectType = options[HEADERS] || {};

        // Get the content type key, if it exists
        let contentTypeKey = find(getKeys(headers), key => lower(key) == lower(CONTENT_TYPE));
        let contentTypeValue = lower(headers[contentTypeKey] || '');

        // Let the browser set the content type, if not JSON
        deleteKey(headers, contentTypeKey);

        // Append the body to the endpoint as query parameters
        // REASON: GET and DELETE requests should not have a body
        if (method == GET || method == DELETE) {
            endpoint += encodeParams(body);
            body = UNDEFINED;
        }
        // Stringify the body as JSON
        else if (endsWith(contentTypeValue, 'json')) {
            body = stringify(body);
            // Manually set the content type
            headers[CONTENT_TYPE] = 'application/json';
        }
        // Use FormData if the content type ends with 'form-data'
        else if (endsWith(contentTypeValue, 'form-data')) {
            body = encodeParams(body, DATA);
        }
        // Stringify the body as x-www-form-urlencoded
        else {
            body = encodeParams(body);
        }

        // Save the updated headers
        options[HEADERS] = headers;
    }

    try {
        let response = await fetch(endpoint, {...options, [METHOD]: method, body});

        // If the response is not ok, throw an error
        if (!response.ok) {
            let error = new Error(`HTTP ${ERROR}! ${TEXT_STATUS}: ${response[TEXT_STATUS]}`);
            (error as any).response = response;
            throw error;
        }

        // Get the response content
        let content = await response[parser || TEXT]();

        // If the parser is not provided
        if (!parser) {
            // Attempt to parse the response as JSON
            try {
                content = parse(content);
            }
            catch {}
        }

        return content;

    }
    catch (error) {
        throw error;
    }
}

export let http = {
    get: _http(GET),
    post: _http(POST),
    put: _http(PUT),
    [PATCH]: _http(PATCH),
    [DELETE]: _http(DELETE)
};