// Setup for csp.html. The page's policy blocks inline scripts, so it lives in this file.
const monitor = brio.state({ evalBlocked: false, evalViolations: 0, otherViolations: [], events: [] });

document.addEventListener('securitypolicyviolation', event => {
    if (event.blockedURI === 'eval') monitor.evalViolations++;
    else monitor.otherViolations.push(`${event.effectiveDirective}: ${event.blockedURI || 'inline'}`);
});

try {
    new Function('return 1')();
} catch {
    monitor.evalBlocked = true;
}

const app = brio.createApp();

app.component('csp-status', {
    template: `
        <dl class="facts">
            <dt>Bundle</dt>
            <dd>brio.csp.min.js</dd>
            <dt>new Function()</dt>
            <dd b-bind-class="{ ok: $data.monitor.evalBlocked, bad: !$data.monitor.evalBlocked }">
                \${$data.monitor.evalBlocked ? 'Blocked by the policy' : 'Allowed: the policy is not active'}
            </dd>
            <dt>eval violations</dt>
            <dd b-bind-class="{ ok: $data.monitor.evalViolations <= 1, bad: $data.monitor.evalViolations > 1 }">
                \${$data.monitor.evalViolations} (1 expected, from the probe)
            </dd>
            <dt>Other violations</dt>
            <dd b-bind-class="{ ok: !$data.monitor.otherViolations.length, bad: $data.monitor.otherViolations.length }">
                \${$data.monitor.otherViolations.length ? $data.monitor.otherViolations.join(', ') : 'None'}
            </dd>
        </dl>`,
    setup: () => ({ monitor }),
});

app.component('click-counter', {
    props: { start: Number },
    template: `
        <button type="button" b-on-click="$data.count++; $emit('change', { label: $props.label, count: $data.count })">
            \${$props.label ?? 'Count'}: \${$data.count} (twice: \${$data.count * 2})
        </button>`,
    setup: ({ $props }) => ({ count: $props.start || 0 }),
});

app.component('task-list', {
    template: `
        <form class="row" b-on-submit.prevent="$data.add()">
            <input type="text" b-model="$data.draft" placeholder="New task" aria-label="New task">
            <button type="submit" b-bind-disabled="!$data.draft.trim()">Add</button>
        </form>
        <ul>
            <li b-for="task in $data.tasks" b-key="$for.task.id">
                <label>
                    <input type="checkbox" b-model="$for.task.done">
                    <span b-bind-class="{ done: $for.task.done }">\${$for.task.title}</span>
                </label>
            </li>
        </ul>
        <p b-if="!$data.tasks.length">No tasks.</p>
        <p>\${$data.remaining()} of \${$data.tasks.length} left</p>`,
    setup: () => ({
        draft: '',
        nextId: 3,
        tasks: [{ id: 1, title: 'Write a component', done: true }, { id: 2, title: 'Ship it', done: false }],
        add() {
            this.tasks.push({ id: this.nextId++, title: this.draft.trim(), done: false });
            this.draft = '';
        },
        remaining() {
            return this.tasks.filter(task => !task.done).length;
        },
    }),
});

app.component('event-log', {
    template: `
        <ol class="log" b-if="$data.monitor.events.length">
            <li b-for="entry, index in $data.monitor.events" b-key="$for.index">\${$for.entry}</li>
        </ol>
        <p b-if="!$data.monitor.events.length">No events yet.</p>`,
    setup: () => ({ monitor }),
});

const untrustedHTML = `
    <p>Text interpolation: \${1 + 1}</p>
    <p b-text="'b-text ran'">b-text did not run.</p>
    <button type="button" b-on-click="$el.textContent = 'b-on-click ran'">b-on-click is ignored</button>
    <click-counter label="Inserted counter" start="10"></click-counter>`;

app.component('insert-demo', {
    template: `
        <div class="row">
            <button type="button" class="primary" b-on-click="$data.insert()">Insert untrusted HTML</button>
            <button type="button" b-on-click="$data.clear()">Clear</button>
        </div>`,
    setup: () => ({
        insert: () => app.insert('#inject-target', 'replaceChildren', untrustedHTML),
        clear: () => app.insert('#inject-target', 'textContent', 'Nothing inserted yet.'),
    }),
});

const rejection = template => {
    try {
        app.component(`rejected-${Math.random().toString(36).slice(2)}`, { template });
        return 'Accepted (unexpected)';
    } catch (error) {
        return error.message;
    }
};

app.component('registration-guards', {
    template: `
        <dl class="facts">
            <dt>template: '#csp-page-template'</dt>
            <dd class="result">\${$data.byId}</dd>
            <dt>template: &lt;template&gt; element</dt>
            <dd class="result">\${$data.byElement}</dd>
        </dl>`,
    setup: () => ({
        byId: rejection('#csp-page-template'),
        byElement: rejection(document.querySelector('#csp-page-template')),
    }),
});

const sample = () => ({ name: 'Ada', items: [3, 1, 2], user: { profile: null } });
const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

// Evaluates in a throwaway app, so a failing expression cannot affect this page.
function runExpression(source) {
    const probe = brio.createApp();
    probe.component('expression-probe', {
        // `.prop` hands over the raw value, so objects can be shown as JSON below.
        template: `<output b-bind-result.prop="${escapeAttribute(source)}"></output>`,
        setup: sample,
    });
    const host = document.createElement('div');
    host.innerHTML = '<expression-probe></expression-probe>';
    try {
        probe.mount(host);
        brio.flush();
        const { result } = host.querySelector('output');
        const text = typeof result === 'string' ? result : JSON.stringify(result) ?? String(result);
        return { ok: true, text };
    } catch (error) {
        return { ok: false, text: error.message };
    } finally {
        probe.dispose();
    }
}

app.component('expression-lab', {
    template: `
        <div class="row">
            <button type="button" b-for="preset in $data.presets" b-key="$for.preset"
                    b-on-click="$data.run($for.preset)">\${$for.preset}</button>
        </div>
        <form class="row" b-on-submit.prevent="$data.run($data.source)">
            <input type="text" b-model="$data.source" aria-label="Expression" spellcheck="false">
            <button type="submit" class="primary">Run</button>
        </form>
        <p b-if="$data.result" class="result" b-bind-class="{ ok: $data.result.ok, bad: !$data.result.ok }">\${$data.result.text}</p>`,
    setup: () => ({
        presets: [
            'Math.max(...$data.items)',
            '{ ...$data.user, admin: true }',
            '`Hello, ${$data.name}!`',
            '$data.user.profile?.email ?? "no email"',
            '$data.items.map(item => item * 2)',
            '$data.items.constructor',
            'window',
            'new Date()',
        ],
        source: '`Hello, ${$data.name}!`',
        result: null,
        run(source) {
            this.source = source;
            this.result = runExpression(source);
        },
    }),
});

app.component('script-source', {
    template: `<pre class="box script-source"><code>\${$data.text}</code></pre>`,
    setup: () => {
        const data = brio.state({ text: 'Loading…' });
        fetch('/tests/methods/csp.js')
            .then(response => response.text())
            .then(text => { data.text = text; }, error => { data.text = error.message; });
        return data;
    },
});

app.mount('body');

for (const counter of document.querySelectorAll('click-counter'))
    counter.addEventListener('change', event => {
        monitor.events.unshift(`${event.detail.label} → ${event.detail.count}`);
    });
