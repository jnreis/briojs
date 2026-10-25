import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const core = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');
const addons = ['router', 'inputs', 'observers']
    .map(name => readFileSync(new URL(`../dist/brio.${name}.min.js`, import.meta.url), 'utf8'));
const documentation = readFileSync(new URL('../DOCUMENTATION.md', import.meta.url), 'utf8');

const probe = (name, markup, verify, verifyAfterUpdate, verifyAfterDispose) => ({
    name, markup, verify, verifyAfterUpdate, verifyAfterDispose,
});

const directives = [
    probe('b-ignore', `
        <div id="probe-ignore" b-ignore><span data-probe="ignore" b-text="$data.value"></span></div>`,
    ({ pair, root }) => {
        const node = root.querySelector('[data-probe="ignore"]');
        equal(pair, 'b-ignore', 'retains skipped child directive', node.getAttribute('b-text'), '$data.value');
        equal(pair, 'b-ignore', 'leaves skipped child output inert', node.textContent, '');
    }),
    probe('b-cloak', `
        <div data-probe="cloak" b-cloak><span data-probe="cloak-text" b-cloak b-text="$data.value"></span></div>`,
    ({ pair, root }) => {
        equal(pair, 'b-cloak', 'removes the cloak from hydrated elements',
            root.querySelectorAll('[data-probe^="cloak"][b-cloak]').length, 0);
        equal(pair, 'b-cloak', 'hydrates cloaked content',
            root.querySelector('[data-probe="cloak-text"]')?.textContent, 'ready');
    },
    ({ pair, root }) => equal(pair, 'b-cloak', 'keeps cloaked content reactive',
        root.querySelector('[data-probe="cloak-text"]')?.textContent, 'updated')),
    probe('b-if', `
        <div b-if="$data.visible"><span data-probe="if" b-text="$data.value"></span></div>`,
    ({ pair, root }) => equal(pair, 'b-if', 'renders its true branch',
        root.querySelector('[data-probe="if"]')?.textContent, 'ready'),
    ({ pair, root }) => equal(pair, 'b-if', 'keeps its branch reactive',
        root.querySelector('[data-probe="if"]')?.textContent, 'updated'),
    ({ pair, root }) => equal(pair, 'b-if', 'disposes its conditional output',
        root.querySelector('[data-probe="if"]'), null)),
    probe('b-else-if', `
        <div b-if="false"><span>first</span></div>
        <div b-else-if="$data.visible"><span data-probe="else-if" b-text="$data.value"></span></div>`,
    ({ pair, root }) => equal(pair, 'b-else-if', 'selects the matching branch',
        root.querySelector('[data-probe="else-if"]')?.textContent, 'ready'),
    ({ pair, root }) => equal(pair, 'b-else-if', 'keeps its branch reactive',
        root.querySelector('[data-probe="else-if"]')?.textContent, 'updated'),
    ({ pair, root }) => equal(pair, 'b-else-if', 'disposes its conditional output',
        root.querySelector('[data-probe="else-if"]'), null)),
    probe('b-else', `
        <div b-if="false">first</div><div b-else data-probe="else">fallback</div>`,
    ({ pair, root }) => equal(pair, 'b-else', 'renders the fallback branch',
        root.querySelector('[data-probe="else"]')?.textContent, 'fallback')),
    probe('b-data', `
        <div b-data="{ local: $data.value }"><span data-probe="data" b-text="$data.local"></span></div>`,
    ({ pair, root }) => equal(pair, 'b-data', 'creates its local data scope',
        root.querySelector('[data-probe="data"]')?.textContent, 'ready')),
    probe('b-for', `
        <ul><li b-for="item in $data.items" b-key="$for.item.id" data-probe="for"
            b-text="$for.item.name"></li></ul>`,
    ({ pair, root }) => equal(pair, 'b-for', 'renders the keyed row',
        root.querySelector('[data-probe="for"]')?.textContent, 'First')),
    probe('b-key', `<div b-key="'stable'" data-probe="key">key is loop metadata</div>`,
        ({ pair, root }) => equal(pair, 'b-key', 'does not bind outside b-for',
            root.querySelector('[data-probe="key"]')?.getAttribute('b-key'), "'stable'")),
    probe('b-id', `
        <div b-id="'field'"><span data-probe="id" b-text="$id.field"></span></div>`,
    ({ pair, root }) => assert.match(
        root.querySelector('[data-probe="id"]')?.textContent ?? '',
        /^brio-\d+$/,
        `${pair}: b-id should expose a generated ID through $id.field`,
    )),
    probe('b-provide', `
        <div b-provide="{ shared: $data.value }"><span data-probe="provide"
            b-text="$provided.shared"></span></div>`,
    ({ pair, root }) => equal(pair, 'b-provide', 'exposes a provided value',
        root.querySelector('[data-probe="provide"]')?.textContent, 'ready'),
    ({ pair, root }) => equal(pair, 'b-provide', 'updates live provided values',
        root.querySelector('[data-probe="provide"]')?.textContent, 'updated'),
    ({ pair, root }) => equal(pair, 'b-provide', 'stops updating after disposal',
        root.querySelector('[data-probe="provide"]')?.textContent, 'updated')),
    probe('b-ref', `<button b-ref="interactionTarget" data-probe="ref">target</button>`,
        ({ pair, root }) => {
            const node = root.querySelector('[data-probe="ref"]');
            equal(pair, 'b-ref', 'registers a concrete target', node?.hasAttribute('b-ref'), false);
            equal(pair, 'b-ref', 'keeps the registered target mounted', node?.isConnected, true);
        }),
    probe('b-template', `
        <section b-template><span data-probe="template" b-text="$data.value"></span></section>`,
    ({ pair, root }) => {
        equal(pair, 'b-template', 'unwraps its host', root.querySelector('section'), null);
        equal(pair, 'b-template', 'hydrates unwrapped children',
            root.querySelector('[data-probe="template"]')?.textContent, 'ready');
    }),
    probe('component host', `<probe-card id="probe-component"></probe-card>`,
        ({ pair, root }) => equal(pair, 'component host', 'hydrates the registered component',
            root.querySelector('#probe-component [data-probe="component"]')?.textContent, 'component')),
    probe('b-text', `<p data-probe="text" b-text="$data.value">original</p>`,
        ({ pair, root }) => equal(pair, 'b-text', 'owns and updates text content',
            root.querySelector('[data-probe="text"]')?.textContent, 'ready'),
        ({ pair, root }) => equal(pair, 'b-text', 'reacts to shared state updates',
            root.querySelector('[data-probe="text"]')?.textContent, 'updated'),
        ({ pair, root }) => equal(pair, 'b-text', 'stops reacting after disposal',
            root.querySelector('[data-probe="text"]')?.textContent, 'updated')),
    probe('b-bind-name', `<button data-probe="bind" b-bind-title="$data.value"></button>`,
        ({ pair, root }) => equal(pair, 'b-bind-name', 'binds its attribute',
            root.querySelector('[data-probe="bind"]')?.getAttribute('title'), 'ready'),
        ({ pair, root }) => equal(pair, 'b-bind-name', 'reacts to shared state updates',
            root.querySelector('[data-probe="bind"]')?.getAttribute('title'), 'updated'),
        ({ pair, root }) => equal(pair, 'b-bind-name', 'stops reacting after disposal',
            root.querySelector('[data-probe="bind"]')?.getAttribute('title'), 'updated')),
    probe('b-on-event', `<button data-probe="on" b-on-click="$data.clicks++"></button>`,
        ({ pair, root, app }) => {
            root.querySelector('[data-probe="on"]').click();
            equal(pair, 'b-on-event', 'runs the event expression', app.state.clicks, 1);
        },
        null,
        ({ pair, root, app }) => {
            const button = root.querySelector('[data-probe="on"]');
            const previous = app.state.clicks;
            button.click();
            equal(pair, 'b-on-event', 'removes its listener at disposal', app.state.clicks, previous);
        }),
    probe('b-model', `<input data-probe="model" b-model="$data.modelValue">`,
        ({ pair, root, app, window }) => {
            const input = root.querySelector('[data-probe="model"]');
            equal(pair, 'b-model', 'reflects initial model state', input.value, 'model-seed');
            input.value = 'changed';
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
            equal(pair, 'b-model', 'writes input events to state', app.state.modelValue, 'changed');
        },
        null,
        ({ pair, root, app, window }) => {
            const input = root.querySelector('[data-probe="model"]');
            input.value = 'after-dispose';
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
            equal(pair, 'b-model', 'removes input listeners at disposal', app.state.modelValue, 'changed');
        }),
    probe('b-html', `<div data-probe="html" b-html="$data.markup"></div>`,
        ({ pair, root }) => {
            const node = root.querySelector('[data-probe="html"] span');
            equal(pair, 'b-html', 'inserts default markup', node?.textContent, 'inert');
            equal(pair, 'b-html', 'does not hydrate default inserted directives',
                node?.getAttribute('b-text'), '$data.value');
        }),
    probe('b-mask', `<input data-probe="mask" b-mask="'##-##'">`,
        ({ pair, root, window }) => {
            const input = root.querySelector('[data-probe="mask"]');
            input.value = '1234';
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
            equal(pair, 'b-mask', 'formats input with the pattern', input.value, '12-34');
        }),
    probe('b-form', `
        <form data-probe="form" b-form="{ rules: { name: [{ name: 'required' }] } }" novalidate>
            <input name="name" data-probe="form-input">
            <i data-probe="form-valid" b-text="$form.valid"></i>
        </form>`,
        ({ pair, root, window }) => {
            const input = root.querySelector('[data-probe="form-input"]');
            const valid = root.querySelector('[data-probe="form-valid"]');
            equal(pair, 'b-form', 'starts invalid', valid.textContent, 'false');
            input.value = 'Ada';
            input.dispatchEvent(new window.Event('input', { bubbles: true }));
            equal(pair, 'b-form', 'tracks values and validity', valid.textContent, 'true');
        }),
    probe('b-teleport', `
        <div id="probe-teleport" b-teleport="['#portal', 'append']">
            <span data-probe="teleport" b-text="$data.value"></span>
        </div>`,
    ({ pair, window }) => equal(pair, 'b-teleport', 'moves and hydrates its owned range',
        window.document.querySelector('#portal [data-probe="teleport"]')?.textContent, 'ready'),
    ({ pair, window }) => equal(pair, 'b-teleport', 'keeps teleported content reactive',
        window.document.querySelector('#portal [data-probe="teleport"]')?.textContent, 'updated'),
    ({ pair, window }) => equal(pair, 'b-teleport', 'removes its range at disposal',
        window.document.querySelector('#portal [data-probe="teleport"]'), null)),
    probe('b-transition', `
        <div id="probe-transition" b-if="$data.visible" b-transition="'matrix'"></div>`,
    ({ pair, root }) => {
        equal(pair, 'b-transition', 'processes the transition directive',
            root.querySelector('#probe-transition')?.hasAttribute('b-transition'), false);
        equal(pair, 'b-transition', 'keeps the active branch mounted',
            root.querySelector('#probe-transition')?.isConnected, true);
    }),
    probe('b-effect', `<i data-probe="effect" b-effect="$data.effectRuns++"></i>`,
        ({ pair, app }) => equal(pair, 'b-effect', 'runs its initial reactive effect',
            app.state.effectRuns, 1)),
    probe('b-script', `
        <script b-script>({ $data }) => { $data.scriptRuns++; }</script>`,
    ({ pair, app }) => equal(pair, 'b-script', 'runs its contextual script once',
        app.state.scriptRuns, 1)),
    probe('b-router-outlet', `<div id="probe-router" b-router-outlet></div>`,
        ({ pair, root }) => equal(pair, 'b-router-outlet', 'renders the current route',
            root.querySelector('#probe-router [data-probe="route"]')?.textContent, 'home')),
    probe('b-on-enter', `<i id="probe-on-enter" b-on-enter="$data.observerRuns++"></i>`,
        ({ pair, observers }) => equal(pair, 'b-on-enter', 'creates an intersection observer',
            observers.created.filter(observer => observer.kind === 'intersection' && observer.target?.id === 'probe-on-enter').length, 1)),
    probe('b-on-exit', `<i id="probe-on-exit" b-on-exit="$data.observerRuns++"></i>`,
        ({ pair, observers }) => equal(pair, 'b-on-exit', 'creates an exit intersection observer',
            observers.created.filter(observer => observer.kind === 'intersection' && observer.target?.id === 'probe-on-exit').length, 1)),
    probe('b-on-addednodes', `<i id="probe-on-addednodes" b-on-addednodes="$data.observerRuns++"></i>`,
        ({ pair, observers }) => equal(pair, 'b-on-addednodes', 'creates a mutation observer',
            observers.created.filter(observer => observer.kind === 'mutation' && observer.target?.id === 'probe-on-addednodes').length, 1)),
    probe('b-on-removednodes', `<i id="probe-on-removednodes" b-on-removednodes="$data.observerRuns++"></i>`,
        ({ pair, observers }) => equal(pair, 'b-on-removednodes', 'creates a mutation observer',
            observers.created.filter(observer => observer.kind === 'mutation' && observer.target?.id === 'probe-on-removednodes').length, 1)),
    probe('b-on-attrs', `<i id="probe-on-attrs" b-on-attrs="$data.observerRuns++"></i>`,
        ({ pair, observers }) => equal(pair, 'b-on-attrs', 'creates a mutation observer',
            observers.created.filter(observer => observer.kind === 'mutation' && observer.target?.id === 'probe-on-attrs').length, 1)),
    probe('b-on-text', `<i id="probe-on-text" b-on-text="$data.observerRuns++"></i>`,
        ({ pair, observers }) => equal(pair, 'b-on-text', 'creates a mutation observer',
            observers.created.filter(observer => observer.kind === 'mutation' && observer.target?.id === 'probe-on-text').length, 1)),
    probe('b-on-resize', `<i id="probe-on-resize" b-on-resize="$data.observerRuns++"></i>`,
        ({ pair, observers }) => equal(pair, 'b-on-resize', 'creates a resize observer',
            observers.created.filter(observer => observer.kind === 'resize' && observer.target?.id === 'probe-on-resize').length, 1)),
];

function equal(pair, directive, behavior, actual, expected) {
    assert.equal(
        actual,
        expected,
        `${pair}: ${directive} ${behavior}; expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
}

function makeObservers(window) {
    const created = [];
    const make = kind => class {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.record = { kind, callback, options, observed: false, disconnected: false };
            created.push(this.record);
        }
        observe(target, options) {
            this.record.observed = true;
            this.record.target = target;
            this.record.observeOptions = options;
        }
        unobserve() {}
        disconnect() {
            this.record.disconnected = true;
        }
    };
    window.IntersectionObserver = make('intersection');
    window.MutationObserver = make('mutation');
    window.ResizeObserver = make('resize');
    return { created };
}

function setup(t, left, right, caseId) {
    const dom = new JSDOM(
        `<main id="app">${left.markup}${right.markup}</main><aside id="portal"></aside>`,
        { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://brio.test/' },
    );
    const { window } = dom;
    let app;
    let stopRouter;
    t.after(() => {
        try {
            stopRouter?.();
            app?.dispose();
        } finally {
            window.close();
        }
    });
    window.eval(core);
    for (const addon of addons) window.eval(addon);
    const observers = makeObservers(window);
    const router = window.brio.createRouter([{ path: '/', component: 'home-page' }]);
    app = window.brio.createApp({
        router,
        state: () => window.JSON.parse(JSON.stringify({
            value: 'ready',
            visible: true,
            items: [{ id: 'first', name: 'First' }],
            clicks: 0,
            modelValue: 'model-seed',
            markup: '<span data-probe="html" b-text="$data.value">inert</span>',
            effectRuns: 0,
            scriptRuns: 0,
            observerRuns: 0,
        })),
    });
    app.component('probe-card', {
        template: '<span data-probe="component" b-text="$data.label"></span>',
        setup: () => window.JSON.parse('{"label":"component"}'),
    });
    app.component('home-page', { template: '<p data-probe="route">home</p>' });
    const root = window.document.querySelector('#app');
    stopRouter = router.start(root);
    try {
        app.mount(root);
    } catch (error) {
        throw new Error(
            `${caseId}: expected both directive fixtures to coexist during mount; got ${error?.name}: ${error?.message}`,
            { cause: error },
        );
    }
    return { window, app, root, observers, stopRouter };
}

let pairCount = 0;
const pairNames = new Set();
for (let leftIndex = 0; leftIndex < directives.length; leftIndex++) {
    for (let rightIndex = leftIndex + 1; rightIndex < directives.length; rightIndex++) {
        const left = directives[leftIndex];
        const right = directives[rightIndex];
        const pair = `${left.name} + ${right.name}`;
        pairNames.add(pair);
        const caseId = `DI-${String(++pairCount).padStart(3, '0')} [${pair}]`;
        test(`directive pair ${caseId} coexists, reacts, and disposes correctly`, t => {
            const context = setup(t, left, right, caseId);
            for (const directive of [left, right]) {
                try {
                    directive.verify({ ...context, pair: caseId });
                } catch (error) {
                    throw new Error(
                        `${caseId}: unexpected ${directive.name} behavior: ${error?.message}`,
                        { cause: error },
                    );
                }
            }
            context.app.state.value = 'updated';
            for (const directive of [left, right]) {
                if (!directive.verifyAfterUpdate) continue;
                try {
                    directive.verifyAfterUpdate({ ...context, pair: caseId });
                } catch (error) {
                    throw new Error(
                        `${caseId}: unexpected reactive ${directive.name} behavior: ${error?.message}`,
                        { cause: error },
                    );
                }
            }
            context.app.dispose({ restore: false });
            context.stopRouter();
            context.app.state.value = 'after-dispose';
            for (const directive of [left, right]) {
                if (!directive.verifyAfterDispose) continue;
                try {
                    directive.verifyAfterDispose({ ...context, pair: caseId });
                } catch (error) {
                    throw new Error(
                        `${caseId}: unexpected disposed ${directive.name} behavior: ${error?.message}`,
                        { cause: error },
                    );
                }
            }
            for (const observer of context.observers.created) {
                equal(caseId, observer.kind, 'disconnects during app disposal', observer.disconnected, true);
            }
        });
    }
}

test('directive interaction matrix explicitly covers every unordered directive pair', () => {
    assert.equal(pairCount, directives.length * (directives.length - 1) / 2);
    assert.equal(new Set(directives.map(directive => directive.name)).size, directives.length);
    assert.equal(pairNames.size, pairCount);
    const table = documentation.split('## HTML directives\n')[1]?.split('\n```html')[0] ?? '';
    const documented = table.split('\n')
        .filter(line => /^\| `b-/.test(line))
        .flatMap(line => line.match(/b-[a-z-]+/g) ?? []);
    const documentedConcepts = documented.map(name =>
        name.startsWith('b-bind-') ? 'b-bind-name' :
            name.startsWith('b-on-') && !directives.some(directive => directive.name === name)
                ? 'b-on-event' : name);
    const undocumented = documentedConcepts.filter(name =>
        !directives.some(directive => directive.name === name));
    assert.deepEqual(undocumented, [], 'Every directive in the HTML directive reference needs a matrix fixture.');
    const undocumentedConcepts = directives
        .filter(directive => directive.name !== 'component host' && !documentedConcepts.includes(directive.name))
        .map(directive => directive.name);
    assert.deepEqual(undocumentedConcepts, [], 'Only explicitly identified non-directive hosts may extend the matrix.');
});

test('higher-order keyed rows compose b-for, b-key, b-id, and b-provide across reorder and cleanup', t => {
    const fixture = {
        name: 'higher-order keyed row',
        markup: `
            <ul><li b-for="item in $data.items" b-key="$for.item.id" b-id="'row'"
                b-provide="{ label: $for.item.name }">
                <span data-probe="row-label" b-text="$provided.label"></span>
                <i data-probe="row-id" b-text="$id.row"></i>
            </li></ul>`,
    };
    const context = setup(t, { name: 'empty fixture', markup: '' }, fixture, 'DI-H01');
    const initialRows = [...context.root.querySelectorAll('li')];
    assert.equal(initialRows.length, 1, 'DI-H01: expected one initial keyed row');
    const firstId = initialRows[0].querySelector('[data-probe="row-id"]').textContent;
    equal('DI-H01', 'b-provide', 'exposes row-local data',
        initialRows[0].querySelector('[data-probe="row-label"]').textContent, 'First');
    assert.match(firstId, /^brio-\d+$/, 'DI-H01: expected b-id to generate a row-local ID');

    context.app.state.items = context.window.JSON.parse(JSON.stringify([
        { id: 'second', name: 'Second' },
        { id: 'first', name: 'First' },
    ]));
    const reordered = [...context.root.querySelectorAll('li')];
    equal('DI-H01', 'b-for + b-key', 'renders both rows in new order',
        reordered.map(row => row.querySelector('[data-probe="row-label"]').textContent).join(','),
        'Second,First');
    equal('DI-H01', 'b-key', 'retains keyed DOM identity through reorder',
        reordered[1], initialRows[0]);
    equal('DI-H01', 'b-id', 'retains the keyed row ID through reorder',
        reordered[1].querySelector('[data-probe="row-id"]').textContent, firstId);
    assert.notEqual(
        reordered[0].querySelector('[data-probe="row-id"]').textContent,
        firstId,
        'DI-H01: distinct rows should receive distinct generated IDs',
    );

    context.app.dispose({ restore: false });
    context.stopRouter();
    equal('DI-H01', 'b-for', 'removes owned rows during app disposal',
        context.root.querySelectorAll('li').length, 0);
});
