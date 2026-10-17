import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('../', import.meta.url));
const skill = resolve(root, 'ai/brio-apps');
const migrationSkill = resolve(root, 'ai/brio-migrate-1-1-5');
const bundle = readFileSync(resolve(root, 'dist/brio.min.js'), 'utf8');

function recipe(t, name, pathname = '/', prepare, directory = skill) {
    const markup = readFileSync(resolve(directory, 'assets', `${name}.html`), 'utf8');
    const dom = new JSDOM(markup, {
        url: `https://brio.test${pathname}`,
        runScripts: 'outside-only',
    });
    const { window } = dom;
    const errors = [];
    window.addEventListener('error', event => {
        errors.push(event.error);
        event.preventDefault();
    });
    prepare?.(window);
    window.eval(bundle);
    for (const script of dom.window.document.querySelectorAll('script[src]')) {
        const name = script.getAttribute('src').split('/').pop();
        if (/^brio\.(router|persistence|http|forms|step|money-mask)\.min\.js$/.test(name))
            window.eval(readFileSync(resolve(root, 'dist', name), 'utf8'));
    }
    const bootstrap = window.document.querySelector('script[data-brio-recipe]');
    assert.ok(bootstrap, 'Recipe must include an identifiable bootstrap script');
    // Execute the shipped bootstrap unchanged, then retain the app for assertions.
    window.eval(`${bootstrap.textContent}\nwindow.__recipeApp = app;`);
    const app = window.__recipeApp;
    t.after(() => {
        try {
            app.dispose();
            assert.deepEqual(errors, []);
        } finally {
            window.close();
        }
    });
    return {
        window, app, document: window.document,
        pulse: () => window.dispatchEvent(new window.Event('brio-recipe-pulse')),
    };
}

test('shipped widget recipe verifies ancestry, keyed updates, conditional state and cleanup', t => {
    const { app, window, document, pulse } = recipe(t, 'widget');
    const click = selector => document.querySelector(selector).click();
    assert.equal(document.querySelector('#host-button').textContent, 'Unaffected host control');
    assert.equal(document.querySelector('li span').textContent, 'Group A: One');
    const oldRow = document.querySelector('li span');
    app.state.groups[0].name = 'Changed';
    assert.equal(oldRow.textContent, 'Changed: One');
    app.state.groups[0].items.push({ id: 'two', name: 'Two' });
    app.state.groups[0].items.reverse();
    assert.equal(document.querySelectorAll('li span')[1], oldRow);
    click('#shared');
    click('#conditional button');
    assert.equal(document.querySelector('#total').textContent, '2');
    assert.equal(document.querySelector('#conditional output').textContent, '1');
    const oldConditional = document.querySelector('#conditional button');
    click('#toggle-if');
    oldConditional.click();
    assert.equal(app.state.total, 2);
    click('#toggle-if');
    assert.equal(document.querySelector('#conditional output').textContent, '0');

    click('#preserved button');
    const preserved = document.querySelector('#preserved');
    click('#toggle-show');
    assert.equal(preserved.isConnected, false);
    click('#toggle-show');
    assert.equal(document.querySelector('#preserved'), preserved);
    assert.equal(preserved.querySelector('output').textContent, '1');

    click('#insert');
    const inserted = document.querySelector('#dynamic button');
    inserted.click();
    assert.equal(inserted.textContent, 'Inserted: 1');
    assert.equal(app.state.total, 2);
    const insertion = app.state.insertion;
    click('#remove');
    assert.equal(insertion.removed, true);
    inserted.click();
    assert.equal(inserted.textContent, 'Inserted: 1');
    assert.equal(document.querySelector('#dynamic').textContent, '');
    pulse();
    assert.equal(app.state.pulses, 1);
    window.dispatchEvent(new window.Event('pagehide'));
    pulse();
    assert.equal(app.state.pulses, 1);
    oldConditional.click();
    assert.equal(app.state.total, 2);
    assert.equal(document.querySelector('#host-button').textContent, 'Unaffected host control');
});

test('shipped MPA recipe models and validates forms without taking over navigation', t => {
    const { app, document, window } = recipe(t, 'multi-page', '/settings');
    const form = document.querySelector('#form');
    const input = form.querySelector('input');
    const submit = () => form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    assert.equal(form.querySelector('label').htmlFor, input.id);
    assert.ok(input.id.startsWith('brio-'));
    submit();
    assert.match(document.querySelector('#status').textContent, /Email is required/);
    input.value = '  invalid  ';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(app.state.email, 'invalid');
    submit();
    assert.equal(document.querySelector('#status').textContent, 'Enter a valid email');
    input.value = '  user@example.com  ';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    submit();
    assert.equal(app.state.email, 'user@example.com');
    assert.equal(document.querySelector('#status').textContent, 'Valid email');
    const navigation = new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    document.querySelector('#normal-link').addEventListener('click', event => {
        assert.equal(event.defaultPrevented, false);
        event.preventDefault();
    });
    document.querySelector('#normal-link').dispatchEvent(navigation);
    assert.equal(app.router, undefined);

    const select = document.querySelector('select');
    select.value = 'dark';
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(document.querySelector('#theme').textContent, 'dark');
    assert.equal(JSON.parse(window.localStorage.getItem('brio-recipe-theme-v4')).theme, 'dark');
    app.dispose();
    select.value = 'light';
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(JSON.parse(window.localStorage.getItem('brio-recipe-theme-v4')).theme, 'dark');
});

test('shipped MPA recipe restores an existing preference in component setup', t => {
    const { document } = recipe(t, 'multi-page', '/settings', window => {
        window.localStorage.setItem('brio-recipe-theme-v4', '{"theme":"dark"}');
    });
    assert.equal(document.querySelector('select').value, 'dark');
    assert.equal(document.querySelector('#theme').textContent, 'dark');
});

test('shipped SPA recipe routes, binds props, emits events, projects slots and cleans listeners', t => {
    const { app, document, pulse } = recipe(t, 'spa');
    document.querySelector('#component-counter').click();
    assert.equal(document.querySelector('#component-count').textContent, '1');
    assert.equal(document.querySelector('#selected').textContent, '1');
    app.state.label = 'Updated';
    assert.match(document.querySelector('#component-counter').textContent, /Updated/);
    assert.equal(document.querySelector('#projected').textContent, 'Updated');
    const oldCounter = document.querySelector('#component-counter');
    document.querySelector('#item-link').click();
    assert.equal(document.querySelector('#item-id').textContent, '42');
    const oldPulses = document.querySelector('#item-pulses');
    pulse();
    assert.equal(oldPulses.textContent, '1');
    assert.equal(app.router.navigate('/items/99'), true);
    assert.equal(document.querySelector('#item-id').textContent, '99');
    document.querySelector('#home-link').click();
    pulse();
    assert.equal(oldPulses.textContent, '1');
    oldCounter.click();
    assert.equal(app.state.selected, 1);
    assert.equal(document.querySelector('#component-count').textContent, '0');
    assert.equal(app.router.navigate('/not-a-route'), false);
});

test('shipped SPA recipe mounts a direct parameterized URL', t => {
    const { document, window } = recipe(t, 'spa', '/items/17');
    assert.equal(document.querySelector('#item-id').textContent, '17');
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new window.PopStateEvent('popstate'));
    assert.ok(document.querySelector('#component-counter'));
});

function files(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory() ? files(path) : [path];
    });
}

test('migrated example verifies explicit contexts, numeric models, branch lifetime and insertion cleanup', t => {
    const { app, document, window } = recipe(t, 'after', '/', undefined, migrationSkill);
    document.querySelector('#increment').click();
    assert.equal(document.querySelector('#count').textContent, '1');
    const input = document.querySelector('#quantity');
    input.value = '7';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(app.state.quantity, 7);
    assert.equal(document.querySelector('#quantity-type').textContent, 'number');
    const invalid = window.brio.validate({ quantity: 7 }, {
        quantity: [{ name: 'min', value: 10 }],
    });
    assert.ok(Array.isArray(invalid.quantity));
    assert.notEqual(window.brio.validate({ name: ' ' }, {
        name: [{ name: 'required' }],
    }), true);
    const money = document.querySelector('#money');
    assert.equal(money.value, '1,234.56');
    money.value = '123456';
    money.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(money.value, '1,234.56');
    const oldRow = document.querySelector('li');
    app.state.items.reverse();
    assert.equal(document.querySelectorAll('li')[1], oldRow);
    assert.equal(oldRow.querySelector('span').textContent, '1: Alpha');
    document.querySelector('#conditional button').click();
    assert.equal(document.querySelector('#conditional output').textContent, '1');
    const oldLocal = document.querySelector('#conditional button');
    document.querySelector('#toggle').click();
    assert.equal(document.querySelector('#preserved').isConnected, true);
    assert.equal(document.querySelector('#preserved').style.display, 'none');
    oldLocal.click();
    document.querySelector('#toggle').click();
    assert.equal(document.querySelector('#conditional output').textContent, '0');
    document.querySelector('#insert').click();
    const inserted = document.querySelector('#dynamic button');
    inserted.click();
    assert.equal(document.querySelector('#count').textContent, '2');
    document.querySelector('#remove').click();
    inserted.click();
    assert.equal(app.state.count, 2);
    window.dispatchEvent(new window.Event('migration-pulse'));
    assert.equal(app.state.pulses, 1);
    window.dispatchEvent(new window.Event('pagehide'));
    window.dispatchEvent(new window.Event('migration-pulse'));
    assert.equal(app.state.pulses, 1);
    assert.equal(document.querySelector('#host').textContent, 'Host page outside the Brio root');
});

test('v4 migration HTTP contract uses JSON bodies, content-type parsing and explicit error-body handling', async t => {
    const { window } = recipe(t, 'after', '/', current => {
        current.Headers = Headers;
    }, migrationSkill);
    let request;
    let ok = true;
    const payload = '{"saved":true}';
    window.fetch = async (url, options) => {
        request = { url, options };
        return {
            ok, status: 422, statusText: 'Invalid',
            headers: { get: () => 'text/plain' },
            text: async () => payload,
            json: async () => JSON.parse(payload),
        };
    };
    assert.equal(await window.brio.http.post('/save', { quantity: 7 }), payload);
    assert.equal(request.options.body, '{"quantity":7}');
    assert.equal(request.options.headers.get('Content-Type'), 'application/json');
    assert.equal((await window.brio.http.post('/save', { quantity: 7 }, { parser: 'json' })).saved, true);
    ok = false;
    await assert.rejects(window.brio.http.post('/save', { quantity: 7 }), error => {
        assert.equal(error.content, undefined);
        assert.equal(error.response.status, 422);
        return true;
    });
});

const legacyPath = resolve(root, 'scripts/briojs.1.1.5.min.js');
const legacyMapPath = `${legacyPath}.map`;

test('preserved legacy source map matches the 1.1.5 evidence baseline', {
    skip: !existsSync(legacyPath) || !existsSync(legacyMapPath) ? 'Preserved legacy artifacts not present' : false,
}, () => {
    for (const [path, hash] of [
        [legacyPath, '34f67bd85c28daa96311375a3599de4b8ab68db94e590d5129f60230c4b36886'],
        [legacyMapPath, '9af05db3ad94e2c0a3585d7ed92a2adb4ad2259ecf2b0add3bbdd848e19f0ac6'],
    ]) assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), hash);
    const map = JSON.parse(readFileSync(legacyMapPath, 'utf8'));
    assert.equal(map.sources.length, 44);
    for (let index = 0; index < map.sources.length; index++) {
        const path = map.sources[index].replace(/^\.\.\//, '');
        assert.equal(map.sourcesContent[index], execFileSync('git', ['show', `df5fbdc:${path}`], {
            cwd: root, encoding: 'utf8',
        }), `Legacy mapped source differs: ${path}`);
    }
});

test('preserved 1.1.5 bundle runs the before example and exposes important migration differences', {
    skip: !existsSync(legacyPath) ? 'Preserved legacy bundle not present' : false,
}, async t => {
    const markup = readFileSync(resolve(migrationSkill, 'assets/before.html'), 'utf8');
    const dom = new JSDOM(markup, {
        url: 'https://brio.test/', runScripts: 'outside-only', pretendToBeVisual: true,
    });
    const { window } = dom;
    const { document } = window;
    const errors = [];
    window.addEventListener('error', event => {
        errors.push(event.error);
        event.preventDefault();
    });
    window.console.error = (...args) => errors.push(args);
    let app;
    t.after(() => {
        try {
            app?.gc.$dom.dehydrate(document.querySelector('#migration'), false);
            assert.deepEqual(errors, []);
        } finally {
            window.close();
        }
    });
    window.eval(readFileSync(legacyPath, 'utf8'));
    window.eval(`${document.querySelector('script[data-brio-recipe]').textContent}
        window.__legacyApp = app; window.__legacyReady = ready;`);
    app = window.__legacyApp;
    await window.__legacyReady;
    const waitFor = async predicate => {
        const deadline = Date.now() + 2000;
        while (!predicate() && Date.now() < deadline) {
            await new Promise(resolve => window.setTimeout(resolve, 10));
        }
        assert.ok(predicate(), 'Legacy DOM update did not complete within two seconds');
    };
    await waitFor(() => document.querySelector('#money').value === '1,234.56'
        && document.querySelector('#conditional button')
        && document.querySelector('li span')?.textContent === '0: Alpha');
    const data = app.gc.$dom.context('#migration').$data;
    const validator = app.gc.$tools.validate(data);
    validator.prop('quantity', [{ name: 'min', value: 10 }]);
    assert.equal(validator.validate(), false);
    assert.ok(Array.isArray(validator.errors.quantity));
    const required = app.gc.$tools.validate({ name: ' ' });
    required.prop('name', ['required']);
    assert.equal(required.validate(), true);
    document.querySelector('#increment').click();
    await waitFor(() => document.querySelector('#count').textContent === '1');
    assert.equal(document.querySelector('#count').textContent, '1');
    const input = document.querySelector('#quantity');
    input.value = '7';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    await waitFor(() => document.querySelector('#quantity-type').textContent === 'number');
    assert.equal(data.quantity, 7);
    assert.equal(document.querySelector('#quantity-type').textContent, 'number');
    assert.equal(document.querySelector('li span').textContent, '0: Alpha');
    const money = document.querySelector('#money');
    assert.equal(money.value, '1,234.56');
    money.value = '123456';
    money.dispatchEvent(new window.Event('input', { bubbles: true }));
    await waitFor(() => money.value === '123,456');
    assert.equal(money.value, '123,456');
    document.querySelector('#conditional button').click();
    await waitFor(() => document.querySelector('#conditional output').textContent === '1');
    assert.equal(document.querySelector('#conditional output').textContent, '1');
    document.querySelector('#toggle').click();
    await waitFor(() => !document.querySelector('#conditional'));
    assert.equal(document.querySelector('#conditional'), null);
    assert.equal(document.querySelector('#preserved').isConnected, true);
    assert.equal(document.querySelector('#preserved').style.display, 'none');
    document.querySelector('#toggle').click();
    await waitFor(() => document.querySelector('#conditional output')?.textContent === '0');
    assert.equal(document.querySelector('#conditional output').textContent, '0');
    document.querySelector('#insert').click();
    await waitFor(() => document.querySelector('#dynamic button'));
    const inserted = document.querySelector('#dynamic button');
    inserted.click();
    await waitFor(() => document.querySelector('#count').textContent === '2');
    assert.equal(data.count, 2);
    document.querySelector('#remove').click();
    inserted.click();
    assert.equal(data.count, 2);
    window.dispatchEvent(new window.Event('migration-pulse'));
    assert.equal(data.pulses, 1);
    window.dispatchEvent(new window.Event('pagehide'));
    window.dispatchEvent(new window.Event('migration-pulse'));
    assert.equal(data.pulses, 1);
    assert.equal(document.querySelector('#host').textContent, 'Host page outside the Brio root');
    let request;
    let ok = true;
    window.fetch = async (url, options) => {
        request = { url, options };
        return {
            ok, status: 422, statusText: 'Invalid',
            text: async () => '{"saved":true}',
        };
    };
    assert.equal((await app.gc.$http.post('/save', { quantity: 7 })).saved, true);
    assert.equal(request.options.body.toString(), 'quantity=7');
    assert.ok(request.options.body instanceof window.URLSearchParams);
    ok = false;
    await assert.rejects(app.gc.$http.post('/save', { quantity: 7 }), error => {
        assert.equal(error.content.saved, true);
        assert.equal(error.response.status, 422);
        return true;
    });
});

for (const [directory, name, keywords] of [
    [skill, 'brio-apps', [/Brio\.js v4/, /widgets/]],
    [migrationSkill, 'brio-migrate-1-1-5', [/1\.1\.5/, /Migrate/, /v4\.0\.0/]],
]) test(`${name} has valid discovery metadata and all Markdown links travel with the folder`, () => {
    const content = readFileSync(resolve(directory, 'SKILL.md'), 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(content);
    assert.ok(frontmatter);
    assert.ok(frontmatter[1].split('\n').includes(`name: ${name}`));
    const description = /^description: (".*")$/m.exec(frontmatter[1]);
    assert.ok(description);
    const parsed = JSON.parse(description[1]);
    assert.ok(parsed.length <= 1024);
    for (const keyword of keywords) assert.match(parsed, keyword);
    for (const path of files(directory).filter(path => path.endsWith('.md'))) {
        const markdown = readFileSync(path, 'utf8');
        for (const link of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
            assert.ok(link[1].startsWith('./'), `Nonportable link in ${path}: ${link[1]}`);
            const target = resolve(dirname(path), link[1]);
            assert.ok(!relative(directory, target).startsWith('..'), `Link escapes skill: ${link[1]}`);
            assert.ok(existsSync(target), `Missing skill link: ${link[1]}`);
        }
    }
    for (const path of files(resolve(directory, 'assets')).filter(path => path.endsWith('.html'))) {
        const markup = readFileSync(path, 'utf8');
        const source = /<script src="([^"]+)"><\/script>/.exec(markup);
        assert.ok(source, `Missing runtime bundle in ${path}`);
        const base = path.endsWith('/spa.html') ? 'https://brio.test/items/42' : 'https://brio.test/widget.html';
        const expected = path.endsWith('/before.html') ? '/briojs.1.1.5.min.js' : '/brio.min.js';
        assert.equal(new URL(source[1], base).pathname, expected,
            'Bundle URL must resolve correctly even on direct SPA routes');
    }
});

test('npm publication includes the complete developer kit', () => {
    const result = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
        cwd: root, encoding: 'utf8',
    }));
    const published = new Set(result[0].files.map(file => file.path));
    for (const path of files(resolve(root, 'ai')))
        assert.ok(published.has(relative(root, path)), `Kit file not published: ${path}`);
    assert.ok(published.has('dist/brio.min.js'));
    assert.ok(published.has('dist/brio.dev.min.js'));
    for (const plugin of ['router', 'persistence', 'http', 'forms', 'step', 'money-mask'])
        assert.ok(published.has(`dist/brio.${plugin}.min.js`));
    assert.equal(published.has('scripts/briojs.1.1.5.min.js'), false);
    assert.equal(published.has('scripts/briojs.1.1.5.min.js.map'), false);
});
