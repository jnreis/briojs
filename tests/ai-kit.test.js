import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('../', import.meta.url));
const skill = resolve(root, 'ai/brio-apps');
const bundle = readFileSync(resolve(root, 'dist/brio.min.js'), 'utf8');

function recipe(t, name, pathname = '/', prepare) {
    const markup = readFileSync(resolve(skill, 'assets', `${name}.html`), 'utf8');
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

test('Brio skill has valid discovery metadata and all Markdown links travel with the folder', () => {
    const content = readFileSync(resolve(skill, 'SKILL.md'), 'utf8');
    const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(content);
    assert.ok(frontmatter);
    assert.match(frontmatter[1], /^name: brio-apps$/m);
    const description = /^description: (".*")$/m.exec(frontmatter[1]);
    assert.ok(description);
    const parsed = JSON.parse(description[1]);
    assert.ok(parsed.length <= 1024);
    assert.match(parsed, /Brio\.js v4/);
    assert.match(parsed, /widgets/);
    for (const path of files(skill).filter(path => path.endsWith('.md'))) {
        const markdown = readFileSync(path, 'utf8');
        for (const link of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
            assert.ok(link[1].startsWith('./'), `Nonportable link in ${path}: ${link[1]}`);
            const target = resolve(dirname(path), link[1]);
            assert.ok(!relative(skill, target).startsWith('..'), `Link escapes skill: ${link[1]}`);
            assert.ok(existsSync(target), `Missing skill link: ${link[1]}`);
        }
    }
    for (const path of files(resolve(skill, 'assets'))) {
        const markup = readFileSync(path, 'utf8');
        const source = /<script src="([^"]+)"><\/script>/.exec(markup);
        assert.ok(source, `Missing runtime bundle in ${path}`);
        const base = path.endsWith('/spa.html') ? 'https://brio.test/items/42' : 'https://brio.test/widget.html';
        assert.equal(new URL(source[1], base).pathname, '/brio.min.js',
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
});
