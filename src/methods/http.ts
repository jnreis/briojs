import { has } from "../tools";
import { lower, stringify } from "../tools/string";

let CONTENT_TYPE: "Content-Type" = "Content-Type";
let CONTENT_TYPE_JSON: "application/json" = "application/json";

type HttpHeaders = HeadersInit | { [key: string]: string };

interface HttpOptions extends RequestInit {
  headers?: HttpHeaders;
}

let _http = async (endpoint: string, config: HttpOptions = {}): Promise<any> => {

  try {
    let response = await fetch(endpoint, config);

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

let _noDataRequest = (method: 'GET' | 'DELETE') => (endpoint: string, headers: HttpHeaders = {}): Promise<any> => _http(endpoint, {
  method,
  headers
});

let _dataRequest = (method: 'POST' | 'PUT' | 'PATCH') => (endpoint: string, body: any, headers: HttpHeaders = {}): Promise<any> => _http(endpoint, {
  method,
  headers: { [CONTENT_TYPE]: CONTENT_TYPE_JSON, ...headers },
  body: stringify(body)
});

export let $http = {
  get: _noDataRequest('GET'),
  post: _dataRequest('POST'),
  put: _dataRequest('PUT'),
  patch: _dataRequest('PATCH'),
  delete: _noDataRequest('DELETE'),
};