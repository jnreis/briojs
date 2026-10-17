import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import * as npm from 'briojs';

function environment(t, bundle) {
    let host = globalThis;
    let api = npm;
    if (bundle) {
        const dom = new JSDOM('', { runScripts: 'outside-only', url: 'https://brio.test/app/' });
        host = dom.window;
        for (const name of ['Headers', 'FormData', 'URLSearchParams', 'Blob', 'ArrayBuffer', 'ReadableStream'])
            host[name] = globalThis[name];
        host.eval(readFileSync(new URL(`../dist/${bundle}`, import.meta.url), 'utf8'));
        host.eval(readFileSync(new URL('../dist/brio.http.min.js', import.meta.url), 'utf8'));
        api = host.brio;
        t.after(() => host.close());
    }
    const original = host.fetch;
    const requests = [];
    let respond = () => new Response('ok');
    host.fetch = async (url, options) => {
        requests.push({ url, options });
        return respond(url, options);
    };
    t.after(() => { host.fetch = original; });
    return { ...api, requests, respond: callback => { respond = callback; } };
}

for (const bundle of [undefined, 'brio.min.js', 'brio.dev.min.js']) {
    const label = bundle ?? 'npm';
    test(`${label}: HTTP queries preserve URLs, serialize nested data and accept explicit keys`, async t => {
        const { http, requests } = environment(t, bundle);
        const shared = { id: 7 };
        const query = Object.assign(Object.create({ inherited: 'omit' }), { own: 'yes' });
        await assert.rejects(http.get('https://brio.test/items', query), /plain object/);
        await http.get('https://brio.test/items?keep=1#section', {
            user: { name: 'Ada & Lin', absent: undefined, empty: null },
            tags: ['js', 'html'], rows: [{ id: 1 }, { id: 2 }],
            matrix: [[1, 2], [3]], shared: [shared, shared], empty: [], object: {},
            scalar: [false, 0, null, undefined], when: new Date('2026-01-02T00:00:00Z'),
        });
        const url = new URL(requests.at(-1).url);
        assert.equal(url.hash, '#section');
        assert.deepEqual([...url.searchParams], [
            ['keep', '1'], ['user[name]', 'Ada & Lin'], ['user[empty]', ''],
            ['tags[]', 'js'], ['tags[]', 'html'], ['rows[0][id]', '1'], ['rows[1][id]', '2'],
            ['matrix[0][]', '1'], ['matrix[0][]', '2'], ['matrix[1][]', '3'],
            ['shared[0][id]', '7'], ['shared[1][id]', '7'],
            ['scalar[]', 'false'], ['scalar[]', '0'], ['scalar[]', ''],
            ['when', '2026-01-02T00:00:00.000Z'],
        ]);
        assert.equal(requests.at(-1).options.body, undefined);
        const explicit = new URLSearchParams([['tag', 'a'], ['tag', 'b']]);
        await http.delete('/items?tag=old', explicit);
        assert.deepEqual([...new URL(requests.at(-1).url).searchParams], [
            ['tag', 'old'], ['tag', 'a'], ['tag', 'b'],
        ]);
        assert.equal(explicit.toString(), 'tag=a&tag=b');
        assert.equal(requests.at(-1).options.method, 'DELETE');
        for (const input of [undefined, null]) {
            await http.get('/relative', input, { cache: 'no-store' });
            assert.equal(requests.at(-1).url, '/relative');
        }
        await http.get('https://brio.test/', { ['__proto__']: { constructor: 'safe' } });
        assert.equal(new URL(requests.at(-1).url).searchParams.get('__proto__[constructor]'), 'safe');
    });

    test(`${label}: HTTP queries reject unsupported values and cycles before fetching`, async t => {
        const { http, requests } = environment(t, bundle);
        const cycle = {};
        cycle.self = cycle;
        const array = [];
        array.push(array);
        for (const value of [cycle, { array }, { bad: Symbol() }, { bad() {} }, { bad: 1n },
            { bad: NaN }, { bad: Infinity }, { bad: new Map() }, { bad: new Date('invalid') },
            [], 'raw=query', false, new Date()]) {
            await assert.rejects(http.get('https://brio.test/', value));
        }
        assert.equal(requests.length, 0);
    });

    test(`${label}: HTTP sends JSON and native Fetch bodies without mutating inputs`, async t => {
        const { http, requests } = environment(t, bundle);
        const headers = new Headers({ 'Content-Type': 'application/problem+json', 'X-Test': 'one' });
        const options = { headers, credentials: 'include' };
        for (const method of ['post', 'put', 'patch']) {
            await http[method]('/save', { quantity: 7 }, options);
            const sent = requests.at(-1).options;
            assert.equal(sent.body, '{"quantity":7}');
            assert.equal(sent.method, method.toUpperCase());
            assert.equal(sent.credentials, 'include');
            assert.equal(sent.headers.get('Content-Type'), 'application/problem+json');
            assert.notEqual(sent.headers, headers);
        }
        assert.deepEqual([...headers], [['content-type', 'application/problem+json'], ['x-test', 'one']]);
        for (const value of [null, false, 0, [1, 2]]) {
            await http.post('/save', value, { headers: [['X-Test', 'two']] });
            assert.equal(requests.at(-1).options.body, JSON.stringify(value));
            assert.equal(requests.at(-1).options.headers.get('Content-Type'), 'application/json');
            assert.equal(requests.at(-1).options.headers.get('X-Test'), 'two');
        }
        const form = new FormData();
        form.append('name', 'Ada');
        const bytes = new Uint8Array([0, 1, 2, 3]);
        const native = [
            'raw', form, new URLSearchParams({ name: 'Ada' }), new Blob(['file']),
            bytes.buffer, bytes.subarray(1, 3), new DataView(bytes.buffer, 1, 2),
            new ReadableStream({ start(controller) { controller.close(); } }),
        ];
        for (const value of native) {
            await http.post('/save', value, { duplex: 'half' });
            assert.equal(requests.at(-1).options.body, value);
            assert.equal(requests.at(-1).options.headers.has('Content-Type'), false);
            assert.equal(requests.at(-1).options.duplex, 'half');
        }
        await http.post('/save');
        assert.equal(requests.at(-1).options.body, undefined);
        assert.equal(requests.at(-1).options.headers.has('Content-Type'), false);
        for (const value of [Symbol(), () => {}, 1n, new Map(), new Date(), { toJSON() {} }]) {
            const count = requests.length;
            await assert.rejects(http.post('/save', value));
            assert.equal(requests.length, count);
        }
        const cycle = {};
        cycle.self = cycle;
        await assert.rejects(http.post('/save', cycle), /circular|cyclic/i);
    });

    test(`${label}: HTTP automatic parsing recognizes JSON media types and empty responses`, async t => {
        const { http, respond } = environment(t, bundle);
        for (const type of ['application/json', 'Application/JSON; charset=UTF-8',
            'application/problem+json', 'application/vnd.api+json; charset=utf-8']) {
            respond(() => new Response('{"ok":true}', { headers: { 'Content-Type': type } }));
            assert.equal((await http.get('/result')).ok, true);
            respond(() => new Response('', { headers: { 'Content-Type': type } }));
            assert.equal(await http.get('/result'), undefined);
            respond(() => new Response(' ', { headers: { 'Content-Type': type } }));
            await assert.rejects(http.get('/result'), error => error.name === 'SyntaxError');
            respond(() => new Response('{broken', { headers: { 'Content-Type': type } }));
            await assert.rejects(http.get('/result'), error => error.name === 'SyntaxError');
        }
        for (const status of [204, 205]) {
            respond(() => new Response(null, { status, headers: { 'Content-Type': 'application/json' } }));
            assert.equal(await http.delete('/result'), undefined);
        }
        for (const type of ['text/plain', 'application/jsonp', 'text/html', '']) {
            respond(() => new Response('{"ok":true}', { headers: { 'Content-Type': type } }));
            assert.equal(await http.get('/result'), '{"ok":true}');
            respond(() => new Response('', { headers: { 'Content-Type': type } }));
            assert.equal(await http.get('/result'), '');
        }
        respond(() => new Response('null', { headers: { 'Content-Type': 'application/json' } }));
        assert.equal(await http.get('/result'), null);
    });

    test(`${label}: HTTP explicit parsers preserve native behavior and never reach Fetch options`, async t => {
        const { http, requests, respond } = environment(t, bundle);
        respond(() => new Response('{"ok":true}', { headers: { 'Content-Type': 'text/plain' } }));
        assert.equal((await http.get('/result', undefined, { parser: 'json' })).ok, true);
        for (const status of [200, 204, 205]) {
            respond(() => new Response(status === 200 ? '' : null, { status }));
            await assert.rejects(http.get('/result', undefined, { parser: 'json' }), SyntaxError);
            assert.equal(await http.get('/result', undefined, { parser: 'text' }), '');
        }
        respond(() => new Response('hello'));
        assert.equal(await http.get('/result', null, { parser: 'text' }), 'hello');
        assert.equal(await (await http.get('/result', null, { parser: 'blob' })).text(), 'hello');
        assert.equal(new TextDecoder().decode(await http.get('/result', null, { parser: 'arrayBuffer' })), 'hello');
        respond(() => new Response('name=Ada&tag=js', { headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        } }));
        assert.equal((await http.get('/result', null, { parser: 'formData' })).get('name'), 'Ada');
        for (const request of requests) assert.equal('parser' in request.options, false);
        const count = requests.length;
        for (const parser of ['missing', '', null])
            await assert.rejects(http.get('/result', undefined, { parser }), /Unknown HTTP parser/);
        assert.equal(requests.length, count);
    });

    test(`${label}: HTTP errors expose unread responses; network, abort and parser errors stay native`, async t => {
        const { http, HttpError, requests, respond } = environment(t, bundle);
        const response = new Response('{"problem":"invalid"}', {
            status: 422, statusText: 'Invalid', headers: { 'Content-Type': 'application/problem+json' },
        });
        respond(() => response);
        await assert.rejects(http.post('/save', {}, { parser: 'json' }), error => {
            assert.ok(error instanceof HttpError);
            assert.equal(error.name, 'HttpError');
            assert.equal(error.status, 422);
            assert.equal(error.response, response);
            assert.equal(error.response.bodyUsed, false);
            assert.match(error.message, /HTTP 422: Invalid/);
            return true;
        });
        assert.deepEqual(await response.json(), { problem: 'invalid' });
        const network = new TypeError('Offline');
        respond(() => { throw network; });
        await assert.rejects(http.get('/save'), error => error === network);
        const controller = new AbortController();
        controller.abort();
        respond((_url, options) => { options.signal.throwIfAborted(); });
        await assert.rejects(http.get('/save', undefined, { signal: controller.signal }),
            error => error === controller.signal.reason);
        assert.equal(requests.at(-1).options.signal, controller.signal);
    });
}

test('HTTP public types cover Fetch options, query values, parser return types and generics', () => {
    execFileSync(fileURLToPath(new URL('../node_modules/.bin/tsc', import.meta.url)), [
        '--noEmit', '--strict', '--target', 'ES2022', '--module', 'ESNext',
        '--moduleResolution', 'bundler', 'tests/types/http.ts',
    ], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', stdio: 'pipe' });
});
