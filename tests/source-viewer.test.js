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
