import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';
import { httpFixtures } from './http-fixtures.js';

class LocalResources extends ResourceLoader {
    fetch(url) {
        const path = new URL(url).pathname;
        if (path === '/tests/source-viewer.js' || path === '/tests/source-viewer.css' ||
            path === '/site/public/theme.js' || path === '/tests/shared/showcase.css' ||
            /^\/site\/public\/(?:demo-theme|theme-tokens)\.css$/.test(path) ||
            /^\/dist\/brio(?:\.(?:http|forms|step|money-mask))?\.min\.js$/.test(path))
            return Promise.resolve(readFileSync(new URL(`..${path}`, import.meta.url)));
        throw new Error(`Unexpected source-viewer test resource: ${url}`);
    }
}

async function page(t, path) {
    const failures = [];
    const console = new VirtualConsole();
    console.on('jsdomError', error => {
        if (error.type !== 'css parsing') failures.push(error);
    });
    const dom = new JSDOM(readFileSync(new URL(path, import.meta.url), 'utf8'), {
        runScripts: 'dangerously',
        resources: new LocalResources(),
        url: `https://brio.test/tests/${path.replace('./', '')}`,
        virtualConsole: console,
        beforeParse(window) {
            window.matchMedia = () => ({ matches: false, addEventListener() {} });
        },
    });
    t.after(() => {
        dom.window.dispatchEvent(new dom.window.Event('pagehide'));
        dom.window.close();
    });
    await new Promise(resolve => dom.window.addEventListener('load', resolve, { once: true }));
    assert.deepEqual(failures, []);
    return dom.window;
}

test('mask manual page demonstrates Unicode tokens, escapes, custom functions and optional money', async t => {
    const window = await page(t, './directives/mask.html');
    const { document } = window;
    const enter = (id, value) => {
        const input = document.getElementById(id);
        input.value = value;
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        return input.value;
    };
    assert.equal(enter('unicode', 'é中١２Ж7😀'), 'é中-١２-Ж7-😀');
    assert.equal(enter('escaped', '12'), 'A12');
    assert.equal(enter('uppercase', 'Brio'), 'BRIO');
    assert.equal(enter('money', '123456'), '1,234.56');
    assert.equal(enter('money-options', '123456'), '1.234,56');
    document.querySelector('button').click();
    assert.equal(document.getElementById('money-options').value, '1 234,56');
});

test('validation manual page uses app methods, numeric age bounds and clears stale errors', async t => {
    const window = await page(t, './methods/validate.html');
    const { document } = window;
    const failures = [];
    window.addEventListener('error', event => failures.push(event.error));
    const submit = () => document.getElementById('validate-btn').click();
    const input = (id, value) => {
        const element = document.getElementById(id);
        element.value = value;
        element.dispatchEvent(new window.Event('input', { bubbles: true }));
    };
    const errors = () => [...document.querySelectorAll('.error-msg')].map(element => element.textContent);
    submit();
    assert.deepEqual(errors(), ['Username is required', 'Email is required', 'Age is required']);
    assert.equal(document.querySelector('.success-box'), null);
    input('username', 'Al');
    input('email', 'invalid');
    input('age', '17');
    submit();
    assert.deepEqual(errors(), ['Username must be at least 3 characters', 'Invalid email address', 'Must be at least 18']);
    input('username', 'Ada');
    input('email', 'ada@example.com');
    for (const age of ['18', '100']) {
        input('age', age);
        submit();
        assert.deepEqual(errors(), []);
        assert.match(document.querySelector('.success-box').textContent, /completely valid/);
    }
    input('age', '101');
    submit();
    assert.deepEqual(errors(), ['Must be 100 or younger']);
    assert.equal(document.querySelector('.success-box'), null);
    input('age', '');
    submit();
    assert.deepEqual(errors(), ['Age is required']);
    input('age', '25');
    submit();
    assert.deepEqual(errors(), []);
    window.dispatchEvent(new window.Event('pagehide'));
    const disposedMarkup = document.querySelector('.card').innerHTML;
    input('username', '');
    submit();
    assert.equal(document.querySelector('.card').innerHTML, disposedMarkup);
    assert.deepEqual(failures, []);
});

test('HTTP manual page runs GET/POST and restores loading state on success and failure', async t => {
    const window = await page(t, './methods/http.html');
    const { document } = window;
    const failures = [];
    window.addEventListener('error', event => failures.push(event.error));
    window.Headers = Headers;
    const requests = [];
    let resolveRequest;
    let rejectRequest;
    window.fetch = (url, options) => {
        requests.push({ url, options });
        return new Promise((resolve, reject) => {
            resolveRequest = resolve;
            rejectRequest = reject;
        });
    };
    const get = document.getElementById('get-todo');
    const post = document.getElementById('create-post');
    const result = document.getElementById('http-result');
    const settle = () => new Promise(resolve => setImmediate(resolve));
    const expectLoading = loading => {
        assert.equal(get.disabled, loading);
        assert.equal(post.disabled, loading);
        assert.equal(Boolean(document.querySelector('.card em')), loading);
    };
    expectLoading(false);
    get.click();
    expectLoading(true);
    assert.equal(requests[0].url, 'https://jsonplaceholder.typicode.com/todos/1');
    assert.equal(requests[0].options.method, 'GET');
    resolveRequest(new Response(JSON.stringify({ id: 1, title: 'Test todo' }), {
        headers: { 'Content-Type': 'application/json' },
    }));
    await settle();
    assert.deepEqual(JSON.parse(result.textContent), { id: 1, title: 'Test todo' });
    expectLoading(false);
    post.click();
    expectLoading(true);
    assert.equal(requests[1].url, 'https://jsonplaceholder.typicode.com/posts');
    assert.equal(requests[1].options.method, 'POST');
    assert.equal(requests[1].options.headers.get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(requests[1].options.body), {
        title: 'Brio Framework Post', body: 'Testing http.post from Brio.js', userId: 1,
    });
    resolveRequest(new Response(JSON.stringify({ id: 101 }), {
        headers: { 'Content-Type': 'application/json' },
    }));
    await settle();
    assert.deepEqual(JSON.parse(result.textContent), { id: 101 });
    expectLoading(false);
    get.click();
    rejectRequest(new Error('Network unavailable'));
    await settle();
    assert.equal(result.textContent, 'Error: Network unavailable');
    expectLoading(false);
    post.click();
    resolveRequest(new Response('', { status: 503, statusText: 'Service Unavailable' }));
    await settle();
    assert.equal(result.textContent, 'Error: HTTP 503: Service Unavailable');
    expectLoading(false);
    assert.deepEqual(failures, []);
});

test('HTTP manual scenarios exercise real local Fetch requests, native bodies, parsing and cancellation', async t => {
    const server = createServer((request, response) => httpFixtures(request, response, () => {
        response.writeHead(404);
        response.end('Not found');
    }));
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
    }));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const window = await page(t, './methods/http.html');
    const { document } = window;
    const failures = [];
    window.addEventListener('error', event => failures.push(event.error));
    for (const name of ['Headers', 'FormData', 'URLSearchParams', 'Blob', 'TextDecoder', 'AbortController'])
        window[name] = globalThis[name];
    const requests = [];
    window.fetch = (url, options) => {
        requests.push({ url, options });
        const target = new URL(url, window.location.href);
        return fetch(new URL(target.pathname + target.search, origin), options);
    };
    const waitFor = async predicate => {
        for (let attempt = 0; attempt < 200; attempt++) {
            if (predicate()) return;
            await new Promise(resolve => setTimeout(resolve, 5));
        }
        assert.fail('HTTP manual scenario did not settle');
    };
    const run = async (id, output) => {
        document.getElementById(id).click();
        const result = document.getElementById(output + '-result');
        await waitFor(() => !result.textContent.startsWith('Loading '));
        assert.equal(document.getElementById(id).disabled, false);
        return JSON.parse(result.textContent);
    };
    const nested = await run('query-nested', 'query');
    assert.equal(nested.method, 'GET');
    assert.deepEqual(nested.query, [
        ['keep', 'original'], ['user[name]', 'Ada & Lin'], ['user[empty]', ''],
        ['tags[]', 'js'], ['tags[]', 'html'], ['rows[0][id]', '1'], ['rows[1][id]', '2'],
        ['date', '2026-01-02T00:00:00.000Z'],
    ]);
    const explicit = await run('query-explicit', 'query');
    assert.equal(explicit.method, 'DELETE');
    assert.deepEqual(explicit.query, [['tag', 'original'], ['tag', 'js'], ['tag', 'html']]);
    const json = await run('body-json', 'body');
    assert.equal(json.method, 'POST');
    assert.equal(json.contentType, 'application/vnd.brio+json');
    assert.equal(json.demoHeader, 'preserved');
    assert.deepEqual(JSON.parse(json.body), { title: 'Brio', published: true });
    const form = await run('body-form', 'body');
    assert.equal(form.method, 'PUT');
    assert.match(form.contentType, /^application\/x-www-form-urlencoded/);
    assert.equal(new URLSearchParams(form.body).get('topic'), 'JS & HTML');
    const multipart = await run('body-multipart', 'body');
    assert.match(multipart.contentType, /^multipart\/form-data; boundary=/);
    assert.match(multipart.body, /filename="hello.txt"/);
    assert.match(multipart.body, /Hello Brio/);
    const binary = await run('body-binary', 'body');
    assert.equal(binary.method, 'PATCH');
    assert.deepEqual(binary.bytes, [1, 2, 3]);
    assert.equal((await run('body-string', 'body')).body, 'Plain request text');
    const automatic = await run('parse-auto', 'parse');
    assert.equal(automatic.json.type, 'object');
    assert.equal(automatic['problem-json'].type, 'object');
    assert.equal(automatic['text-json'].type, 'string');
    const empty = await run('parse-empty', 'parse');
    for (const name of ['no-content', 'reset-content', 'empty-json'])
        assert.deepEqual(empty[name], { type: 'undefined', value: '(undefined)' });
    assert.deepEqual(empty['empty-text'], { type: 'string', value: '' });
    const malformed = await run('parse-malformed', 'parse');
    assert.equal(malformed.name, 'SyntaxError');
    assert.equal(malformed.isHttpError, false);
    const parsers = await run('parse-explicit', 'explicit');
    assert.equal(parsers.json.type, 'object');
    assert.equal(parsers.text.type, 'string');
    assert.equal(parsers.blob.type, 'application/json');
    assert.equal(parsers.blob.text, parsers.arrayBuffer.text);
    assert.equal(parsers.blob.size, parsers.arrayBuffer.byteLength);
    assert.deepEqual(parsers.formData, [['name', 'Ada'], ['tag', 'js'], ['tag', 'html']]);
    assert.equal((await run('parse-strict-empty', 'explicit')).name, 'SyntaxError');
    const error = await run('error-http', 'errors');
    assert.equal(error.name, 'HttpError');
    assert.equal(error.isHttpError, true);
    assert.equal(error.status, 422);
    assert.equal(error.unreadBefore, true);
    assert.equal(error.consumedAfter, true);
    assert.equal(error.body.field, 'email');
    const count = requests.length;
    const invalid = await run('error-query', 'errors');
    assert.equal(invalid.name, 'TypeError');
    assert.equal(invalid.isHttpError, false);
    assert.equal(requests.length, count);
    document.getElementById('request-slow').click();
    assert.equal(document.getElementById('request-slow').disabled, true);
    assert.equal(document.getElementById('request-cancel').disabled, false);
    document.getElementById('request-cancel').click();
    await waitFor(() => document.getElementById('request-cancel').disabled);
    const aborted = JSON.parse(document.getElementById('errors-result').textContent);
    assert.equal(aborted.name, 'AbortError');
    assert.equal(aborted.isHttpError, false);
    assert.equal(document.getElementById('request-slow').disabled, false);
    document.getElementById('request-slow').click();
    const signal = requests.at(-1).options.signal;
    window.dispatchEvent(new window.Event('pagehide'));
    assert.equal(signal.aborted, true);
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(failures, []);
});

test('every manual example page loads the source viewer before bootstrap', () => {
    let pages = 0;
    for (const folder of ['directives', 'methods', 'reactivity']) {
        for (const file of readdirSync(new URL(`./${folder}/`, import.meta.url)).filter(file => file.endsWith('.html'))) {
            const source = readFileSync(new URL(`./${folder}/${file}`, import.meta.url), 'utf8');
            const includes = [...source.matchAll(/<script src="\/tests\/source-viewer.js"><\/script>/g)];
            assert.equal(includes.length, 1, `${folder}/${file}`);
            assert.ok(includes[0].index < source.search(/<script (?:src="\/dist\/|type="module")/), `${folder}/${file}`);
            pages++;
        }
    }
    assert.equal(pages, 31);
});

test('source panels preserve authored directives, literal interpolation and template content without hydrating it', async t => {
    const window = await page(t, './directives/template.html');
    const { document } = window;
    const panels = [...document.querySelectorAll('.card > .example-source')];
    assert.equal(panels.length, 6);
    assert.ok(panels.every(panel => !panel.open && panel.hasAttribute('b-ignore')));
    const first = panels[0].querySelector('code');
    assert.ok(first.textContent.includes('<div b-template="" class="box">'));
    assert.ok(first.textContent.includes('${$data.message}'));
    assert.equal(first.querySelector('div'), null);
    assert.equal(document.querySelector('.card [b-template]'), null);
    const rows = panels[3].querySelector('code').textContent;
    assert.ok(rows.includes('b-for="row, index in $data.rows"'));
    assert.ok(rows.includes('b-bind-data-row="$for.row.id"'));
    document.getElementById('reverse').click();
    assert.equal(panels[3].querySelector('code').textContent, rows);
    assert.ok(!first.textContent.includes('example-source'));
    const setup = document.querySelector('.example-source-setup');
    assert.ok(setup.textContent.includes("message: 'Hello from parent context!'"));
    assert.ok(setup.textContent.includes('<script src="/dist/brio.min.js"></script>'));
    assert.ok(setup.textContent.includes('.card {'));
    assert.ok(!setup.textContent.includes('<script src="/tests/source-viewer.js">'));
});

test('source panels do not register duplicate refs or break live native controls', async t => {
    const { document } = await page(t, './directives/ref.html');
    const code = document.querySelector('.example-source code');
    assert.ok(code.textContent.includes('b-ref="search"'));
    document.getElementById('focus').click();
    assert.equal(document.activeElement.id, 'search');
    document.getElementById('toggle-conditional').click();
    assert.equal(document.getElementById('membership').textContent, 'false');
    assert.ok(document.querySelectorAll('input[b-ref]').length === 0);
    assert.equal(document.querySelectorAll('#search').length, 1);
});

test('immediate bootstrap retains original nested provider source and exposes initialization JavaScript', async t => {
    const { document } = await page(t, './directives/provide.html');
    const code = document.querySelector('.card > .example-source code');
    assert.ok(code.textContent.includes('b-provide="{ theme: $data.theme, counter: $stores.counter }"'));
    assert.ok(code.textContent.includes('b-text="$provided.theme"'));
    assert.ok(document.querySelectorAll('.nested > .example-source').length >= 5);
    const before = document.getElementById('provided-count').textContent;
    document.getElementById('provided-increment').click();
    assert.notEqual(document.getElementById('provided-count').textContent, before);
    assert.ok(document.querySelector('.example-source-setup').textContent.includes('const counter = brio.state'));
});

test('body context and teleported examples remain visible in original source after moving or detaching', async t => {
    const { document } = await page(t, './directives/teleport.html');
    const source = document.querySelector('#origin').closest('section').querySelector('.example-source code');
    assert.ok(source.textContent.includes('b-teleport="[$data.second ? $ref.two : $ref.one, $data.placement]"'));
    assert.equal(document.getElementById('moving').parentNode.id === 'origin', false);
    document.getElementById('switch-target').click();
    assert.ok(source.textContent.includes('id="origin"'));
    const context = document.querySelector('.example-source-setup .example-source code').textContent;
    assert.ok(context.startsWith('<body b-data='));
    assert.ok(context.includes("placement: 'after'"));
    assert.equal(document.querySelectorAll('.example-source-setup').length, 1);
});

test('module pages include source for headingless example cards and their import/setup code', async t => {
    const { document } = await page(t, './methods/route.html');
    const code = document.querySelector('#app-root > .example-source code');
    assert.ok(code.textContent.includes('b-router-outlet'));
    assert.ok(code.textContent.includes('b-on-click="$data.goTo'));
    const setup = document.querySelector('.example-source-setup');
    assert.ok(setup.textContent.includes("import { createRouter } from '/dist/router-entry.js'"));
    assert.ok(setup.textContent.includes("app.component('user-page'"));
});

test('DOM manual page demonstrates every placement through contextual $insert with cleanup and cloning', async t => {
    const { document } = await page(t, './methods/dom.html');
    const click = id => document.getElementById(id).click();
    const target = document.getElementById('target-container');
    click('btn-remove');
    click('btn-prepend');
    const prepended = target.firstElementChild;
    assert.ok(prepended.textContent.includes('count: 1'));
    prepended.querySelector('button').click();
    assert.ok(prepended.textContent.includes('count: 2'));
    click('btn-append');
    assert.ok(target.lastElementChild.textContent.includes('count: 2'));
    click('btn-remove');
    assert.equal(target.children.length, 2);
    click('btn-before');
    const before = target.previousElementSibling;
    assert.ok(before.textContent.includes('before'));
    before.querySelector('button').click();
    assert.ok(before.textContent.includes('1'));
    click('btn-after');
    assert.ok(target.nextElementSibling.textContent.includes('after'));
    click('btn-replace');
    assert.equal(target.children.length, 1);
    assert.ok(target.textContent.includes('Replaced all content'));
    const stopped = prepended.textContent;
    prepended.querySelector('button').click();
    assert.equal(prepended.textContent, stopped);
    click('btn-replace-node');
    assert.equal(target.textContent, 'Replacement: 0');
    click('btn-increment');
    assert.equal(target.textContent, 'Replacement: 1');
    click('btn-text');
    assert.equal(target.textContent, '<b>Literal text: ${$data.count}</b>');
    assert.equal(target.children.length, 0);
    click('btn-clone');
    const clone = target.querySelector('button');
    assert.equal(clone.textContent, 'Cloned counter: 1');
    clone.click();
    assert.equal(clone.textContent, 'Cloned counter: 2');
    assert.equal(document.getElementById('clone-source').content.querySelector('button').textContent,
        'Cloned counter: ${$data.count}');
    click('btn-remove');
    assert.equal(clone.isConnected, false);
    clone.click();
    click('btn-context');
    assert.equal(target.querySelector('span').textContent, '2');
    const source = document.querySelector('.card > .example-source code').textContent;
    assert.ok(source.includes("$insert($ref.target, 'prepend'"));
    assert.ok(source.includes('let lastInsertion'));
    assert.ok(!source.includes('insertAndHydrate'));
});

test('step manual page advances, goes back and restarts using its app-state methods', async t => {
    const window = await page(t, './methods/step.html');
    const { document } = window;
    const failures = [];
    window.addEventListener('error', event => failures.push(event.error));
    const expectStep = (heading, indicator) => {
        assert.equal(document.querySelectorAll('.step-container').length, 1);
        assert.ok(document.querySelector('.step-container h4').textContent.includes(heading));
        assert.equal(document.querySelectorAll('.step-pill.active').length, 1);
        assert.equal(document.querySelector('.step-pill.active').textContent, indicator);
    };
    const click = text => {
        const button = [...document.querySelectorAll('.step-container button')]
            .find(button => button.textContent.includes(text));
        assert.ok(button, `Missing wizard button: ${text}`);
        button.click();
        assert.deepEqual(failures, []);
    };
    expectStep('Welcome', '1. Intro');
    assert.equal(document.querySelector('.step-container button').disabled, true);
    click('Next');
    expectStep('Enter Information', '2. Details');
    click('Back');
    expectStep('Welcome', '1. Intro');
    click('Next');
    click('Next');
    expectStep('Review', '3. Review');
    assert.equal([...document.querySelectorAll('.step-container button')]
        .find(button => button.textContent.includes('Next')).disabled, true);
    click('Back');
    expectStep('Enter Information', '2. Details');
    click('Next');
    click('Start Over');
    expectStep('Welcome', '1. Intro');
    assert.equal(document.getElementById('can-back').textContent, 'false');
    document.getElementById('jump-review').click();
    expectStep('Review', '3. Review');
    click('Back');
    expectStep('Welcome', '1. Intro');
    document.getElementById('jump-review').click();
    document.getElementById('loop-intro').click();
    expectStep('Welcome', '1. Intro');
    assert.equal(document.getElementById('can-back').textContent, 'true');
    click('Back');
    expectStep('Review', '3. Review');
    document.getElementById('reset-wizard').click();
    expectStep('Welcome', '1. Intro');
    assert.equal(document.getElementById('can-back').textContent, 'false');
    click('Next');
    click('Next');
    expectStep('Review', '3. Review');
});
