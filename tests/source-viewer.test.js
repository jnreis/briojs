import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';

class LocalResources extends ResourceLoader {
    fetch(url) {
        const path = new URL(url).pathname;
        if (path === '/tests/source-viewer.js' || path === '/tests/source-viewer.css' || path === '/dist/brio.min.js')
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
    });
    t.after(() => {
        dom.window.dispatchEvent(new dom.window.Event('pagehide'));
        dom.window.close();
    });
    await new Promise(resolve => dom.window.addEventListener('load', resolve, { once: true }));
    assert.deepEqual(failures, []);
    return dom.window;
}

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
    assert.equal(pages, 30);
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
