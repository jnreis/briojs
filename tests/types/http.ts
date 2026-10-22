import { http, HttpError } from '@jnreis/briojs';
import type { HttpBody, HttpMethod, HttpOptions, HttpParser, HttpQuery, HttpQueryValue } from '@jnreis/briojs';

const options: HttpOptions = { signal: new AbortController().signal, credentials: 'include',
    headers: [['X-Test', 'yes']], duplex: 'half' };
const method: HttpMethod = 'GET';
const parser: HttpParser = 'blob';
const value: HttpQueryValue = { rows: [{ id: 1 }], date: new Date(), optional: undefined };
const query: HttpQuery = { value, tags: ['one', 'two'], nothing: null };
const body: HttpBody = new Uint8Array([1, 2]);
const unknownResult: Promise<unknown> = http.get('/items', query, options);
const json: Promise<{ id: number } | undefined> = http.get<{ id: number }>('/items');
const strictJson: Promise<{ id: number }> = http.get<{ id: number }>('/items', null, { parser: 'json' });
const text: Promise<string> = http.post('/save', body, { parser: 'text' });
const blob: Promise<Blob> = http.get('/download', undefined, { parser });
const bytes: Promise<ArrayBuffer> = http.get('/bytes', null, { parser: 'arrayBuffer' });
const form: Promise<FormData> = http.get('/form', new URLSearchParams(), { parser: 'formData' });
const deleted: Promise<unknown> = http.delete('/item', null);
interface Payload { title: string }
const payload: Payload = { title: 'Title' };
http.post('/save', payload);
http.put('/save', false);
http.patch('/save', null);
// @ts-expect-error GET arguments are query objects, not raw bodies.
http.get('/items', 'a=1');
// @ts-expect-error DELETE arguments are query objects, not request bodies.
http.delete('/items', new Blob());
// @ts-expect-error Functions are not query values.
http.get('/items', { callback() {} });
// @ts-expect-error Headers must be valid Fetch headers.
http.post('/save', {}, { headers: { count: 1 } });
// @ts-expect-error Method is controlled by the helper.
http.post('/save', {}, { method: 'PUT' });
// @ts-expect-error Body belongs in the second argument.
http.post('/save', {}, { body: 'wrong' });
// @ts-expect-error Only supported parsers are accepted.
http.get('/items', null, { parser: 'xml' });
// @ts-expect-error Native text parser returns a string, not a Blob.
const wrong: Promise<Blob> = http.get('/items', null, { parser: 'text' });
// @ts-expect-error A JSON generic cannot override the native text parser's return type.
http.get<number>('/items', null, { parser: 'text' });
const error = new HttpError(new Response(null, { status: 400 }));
const status: number = error.status;
const response: Response = error.response;
// @ts-expect-error Error metadata is read-only.
error.status = 500;
void [method, unknownResult, json, strictJson, text, blob, bytes, form, deleted, wrong, status, response];
