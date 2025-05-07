import { find } from '../tools/array';
import { ERROR, TEXT, GET, DELETE, PUT, POST, PATCH, UNDEFINED, METHOD, HEADERS, CONTENT__$CAP } from '../tools/constants';
import { getKey, getKeys } from '../tools/object';
import { lower, parse, queryString, stringify } from '../tools/string';
import { isObject } from '../tools/typeCheck';

let _http = (method: 'get' | 'delete' | 'post' | 'put' | 'patch') => 
    async (endpoint: string, body?: any, options: HttpOptions = {}): Promise<any> => {

    let TEXT_STATUS: 'status' = 'status';
    let CONTENT_TYPE = CONTENT__$CAP + '-Type' as 'Content-Type';
    let APPLICATION_JSON: 'application/json' = 'application/json';

    /**
     * The name of the `parser` can be provided to explicitly specify how the response should be parsed.
     * 
     * By default, the response is parsed as `json` based on the content type.
     */
    let parser: ResponseParser = getKey(options, 'parser');

    // Stringify the body if it is an object
    if (isObject(body)) {

        // Get the headers
        let headers: ObjectType = options[HEADERS] || {};

        // Get the content type key, if it exists
        let contentTypeKey = find(getKeys(headers), key => lower(key) == lower(CONTENT_TYPE));
        let contentTypeValue = headers[contentTypeKey];

        // Append the body to the endpoint
        if (method == GET || (method == DELETE && !contentTypeKey)) {
            endpoint += queryString(body);
            body = UNDEFINED;
        }
        // Stringify the body as JSON
        else if (!contentTypeKey || contentTypeValue == APPLICATION_JSON) {
            body = stringify(body);

            if (!contentTypeKey) {
                // Set the content type to JSON
                headers[CONTENT_TYPE] = APPLICATION_JSON;

                // Save the updated headers
                options[HEADERS] = headers;
            }
        }
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