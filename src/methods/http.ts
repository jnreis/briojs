import { has } from '../tools';
import { ERROR, TEXT, GET, DELETE, PUT, POST, PATCH, UNDEFINED, METHOD } from '../tools/constants';
import { getKey } from '../tools/object';
import { parse, queryString } from '../tools/string';
import { isObject } from '../tools/typeCheck';

let _http = (method: 'get' | 'delete' | 'post' | 'put' | 'patch') => 
    async (endpoint: string, body?: any, options: HttpOptions = {}): Promise<any> => {

    let TEXT_STATUS: 'status' = 'status';

    /**
     * The name of the `parser` can be provided to explicitly specify how the response should be parsed.
     * 
     * By default, the response is parsed as `json` based on the content type.
     */
    let parser: ResponseParser = getKey(options, 'parser');

    // If the method is GET or DELETE and the body is an object, convert the object to a query string
    if (has([GET, DELETE], method) && isObject(body)) {
        endpoint += queryString(body);
        body = UNDEFINED;
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