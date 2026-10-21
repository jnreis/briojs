import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

// Guards the observable behaviour that the performance work (anchorless rows, bulk clears,
// prototype contexts, lazy refs, memoized writes and raw array mutators) must preserve.
const bundle = readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8');

function environment(t, markup, state = {}) {
    const dom = new JSDOM(`<main id="app">${markup}</main>`, { runScripts: 'outside-only', pretendToBeVisual: true });
    const { window } = dom;
    window.eval(bundle);
    const errors = [];
    window.addEventListener('error', event => {
        errors.push(event.error);
        event.preventDefault();
    });
    const app = window.brio.createApp({ state: () => window.JSON.parse(JSON.stringify(state)) });
    t.after(() => {
        app.dispose();
        window.close();
        assert.deepEqual(errors, []);
    });
    const root = window.document.querySelector('#app');
    // Values must come from the page realm to be observable plain objects.
    const local = value => window.JSON.parse(JSON.stringify(value));
    return { window, app, root, local };
}

const rows = count => Array.from({ length: count }, (_, index) => ({ id: index + 1, label: `row ${index + 1}` }));
const comments = node => [...node.childNodes].filter(child => child.nodeType === 8).length;

const table = `
    <table><tbody id="body">
        <tr b-for="row in $data.rows" b-key="$for.row.id" b-bind-class="{ active: $data.selected === $for.row.id }">
            <td b-text="$for.row.label"></td>
            <td><button b-on-click="$data.selected = $for.row.id">select</button></td>
        </tr>
    </tbody></table>`;

test('keyed rows keep element identity across remove, append, swap and partial replace', t => {
    const { app, root, local } = environment(t, table, { rows: rows(5), selected: 0 });
    app.mount(root);
    const body = root.querySelector('#body');
    const before = [...body.querySelectorAll('tr')];
    assert.equal(before.length, 5);

    app.state.rows.splice(2, 1);
    let after = [...body.querySelectorAll('tr')];
    assert.deepEqual(after, [before[0], before[1], before[3], before[4]]);
    assert.equal(before[2].isConnected, false);

    app.state.rows.push(local({ id: 6, label: 'row 6' }));
    after = [...body.querySelectorAll('tr')];
    assert.deepEqual(after.slice(0, 4), [before[0], before[1], before[3], before[4]]);
    assert.equal(after[4].textContent.trim().startsWith('row 6'), true);

    app.state.rows = [app.state.rows[4], ...app.state.rows.slice(1, 4), app.state.rows[0]];
    assert.deepEqual([...body.querySelectorAll('tr')].map(row => row.cells[0].textContent),
        ['row 6', 'row 2', 'row 4', 'row 5', 'row 1']);
    assert.equal(body.querySelectorAll('tr')[4], before[0]);

    app.state.rows = local([{ id: 2, label: 'two' }, { id: 9, label: 'nine' }]);
    const replaced = [...body.querySelectorAll('tr')];
    assert.equal(replaced[0], before[1]);
    assert.equal(replaced[0].cells[0].textContent, 'two');
    assert.equal(replaced[1].cells[0].textContent, 'nine');
});

test('single-element rows render without range comments; template rows keep their anchors', t => {
    const { app, root, local } = environment(t, `
        ${table}
        <ul id="list"><template b-for="item in $data.items" b-key="$for.item" b-template><li b-text="$for.item"></li></template></ul>`,
    { rows: rows(3), selected: 0, items: ['a', 'b'] });
    app.mount(root);
    const body = root.querySelector('#body');
    const loopAnchors = comments(body);
    app.state.rows.push(...local([{ id: 4, label: 'row 4' }, { id: 5, label: 'row 5' }]));
    assert.equal(body.querySelectorAll('tr').length, 5);
    assert.equal(comments(body), loopAnchors, 'adding rows adds no comments');
    const list = root.querySelector('#list');
    assert.ok(comments(list) >= 2 + loopAnchors, 'template rows are bounded by range comments');
    assert.deepEqual([...list.querySelectorAll('li')].map(item => item.textContent), ['a', 'b']);
});

test('clearing and fully replacing a loop disposes rows, keeps siblings and stays reactive', t => {
    const { window, app, root, local } = environment(t, `
        ${table}
        <ul id="mixed"><li id="first">first</li><li b-for="item in $data.items" b-key="$for.item" b-text="$for.item"></li><li id="last">last</li></ul>`,
    { rows: rows(4), selected: 0, items: ['a', 'b', 'c'] });
    app.mount(root);
    const body = root.querySelector('#body');
    const oldButton = body.querySelector('button');
    const oldRow = body.querySelector('tr');

    app.state.rows = local([]);
    assert.equal(body.querySelectorAll('tr').length, 0);
    oldButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert.equal(app.state.selected, 0, 'listeners on cleared rows are disposed');
    app.state.selected = 1;
    assert.equal(oldRow.className, '', 'bindings on cleared rows are disposed');

    app.state.rows = local(rows(2));
    assert.equal(body.querySelectorAll('tr').length, 2);
    body.querySelectorAll('button')[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert.equal(app.state.selected, 2);
    assert.equal(body.querySelectorAll('tr')[1].className, 'active');

    app.state.rows = local([{ id: 7, label: 'seven' }, { id: 8, label: 'eight' }]);
    assert.deepEqual([...body.querySelectorAll('tr')].map(row => row.cells[0].textContent), ['seven', 'eight']);

    const mixed = root.querySelector('#mixed');
    app.state.items = local([]);
    assert.deepEqual([...mixed.children].map(item => item.id), ['first', 'last']);
    app.state.items = local(['x', 'y']);
    assert.deepEqual([...mixed.children].map(item => item.textContent), ['first', 'x', 'y', 'last']);
    app.state.items = local(['z']);
    assert.deepEqual([...mixed.children].map(item => item.textContent), ['first', 'z', 'last']);
});

test('$context reads see the whole scope chain while own keys stay local to the element', t => {
    const { app, root } = environment(t, `
        <section b-data="{ local: 1 }">
            <p id="read" b-text="[$context.$data.$parent.title, $context.$data.local, $context.$el.id].join('|')"></p>
            <p id="own" b-text="Object.keys($context).join(',')"></p>
        </section>`, { title: 'hello' });
    app.mount(root);
    assert.equal(root.querySelector('#read').textContent, 'hello|1|read');
    const own = root.querySelector('#own').textContent.split(',');
    assert.ok(own.includes('$el'));
    assert.ok(!own.includes('$data'), 'inherited values are not own keys');
});

test('loop rows create $ref registries lazily and still support b-ref and $ref reads', t => {
    const { window, app, root, local } = environment(t, `
        <div b-for="item in $data.items" b-key="$for.item">
            <input b-ref="field" b-bind-value="$for.item">
            <button b-on-click="$data.picked = $ref.field.value">pick</button>
        </div>
        <p b-for="item in $data.items" b-key="$for.item" b-text="$for.item"></p>`, { items: ['a', 'b'], picked: '' });
    app.mount(root);
    root.querySelectorAll('button')[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert.equal(app.state.picked, 'b');
    app.state.items = local(['b', 'c']);
    root.querySelectorAll('button')[1].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert.equal(app.state.picked, 'c');
    assert.deepEqual([...root.querySelectorAll('p')].map(item => item.textContent), ['b', 'c']);
});

test('unchanged primitive bindings, text and interpolation skip DOM writes', t => {
    const { window, app, root } = environment(t, `
        <p id="bound" b-bind-title="$data.title" b-bind-class="{ on: $data.on }" b-text="$data.text"></p>
        <p id="interpolated">A \${$data.text} B \${$data.missing} C</p>`, { title: 't', on: true, text: 'x', other: 0 });
    app.mount(root);
    const interpolated = root.querySelector('#interpolated');
    assert.equal(interpolated.textContent, 'A x B  C');
    const records = [];
    const observer = new window.MutationObserver(list => records.push(...list));
    observer.observe(root, { subtree: true, attributes: true, childList: true, characterData: true });
    // Re-assigning equal values re-runs nothing observable.
    app.state.title = 't';
    app.state.on = true;
    app.state.text = 'x';
    app.state.other = 1;
    records.push(...observer.takeRecords());
    assert.deepEqual(records, []);
    app.state.text = 'y';
    records.push(...observer.takeRecords());
    observer.disconnect();
    assert.equal(root.querySelector('#bound').textContent, 'y');
    assert.equal(interpolated.textContent, 'A y B  C');
    assert.ok(records.length > 0);
});

test('array mutators keep reactive results and track length', t => {
    const { app, root, local } = environment(t, `
        <p id="count" b-text="$data.list.length"></p>
        <p id="first" b-text="$data.list[0] && $data.list[0].name"></p>`,
    { list: [{ name: 'c' }, { name: 'a' }, { name: 'b' }] });
    app.mount(root);
    const count = root.querySelector('#count');
    const first = root.querySelector('#first');

    let comparatorSawState = true;
    app.state.list.sort((left, right) => {
        if (!app.state.list.includes(left) || !app.state.list.includes(right)) comparatorSawState = false;
        return left.name.localeCompare(right.name);
    });
    assert.ok(comparatorSawState, 'comparator receives the same values reads return');
    assert.equal(first.textContent, 'a');

    app.state.list.push(local({ name: 'd' }));
    assert.equal(count.textContent, '4');
    const [removed] = app.state.list.splice(0, 1);
    assert.equal(count.textContent, '3');
    assert.equal(first.textContent, 'b');
    removed.name = 'changed';
    const popped = app.state.list.pop();
    assert.equal(count.textContent, '2');
    app.state.list.unshift(popped);
    assert.equal(first.textContent, 'd');
    popped.name = 'reactive';
    assert.equal(first.textContent, 'reactive', 'values returned by mutators are reactive');
    assert.equal(app.state.list.reverse(), app.state.list);
    assert.equal(first.textContent, 'c');
});

test('$insert cannot place content beside a b-for row, but can insert inside one', t => {
    const { window, app, root } = environment(t, `
        <ul><li b-for="item in $data.items" b-key="$for.item" class="row"><span b-text="$for.item"></span></li></ul>
        <button id="beside" b-on-click="try { $insert('.row', 'before', '<li>x</li>') } catch (error) { $data.error = error.message }">beside</button>
        <button id="inside" b-on-click="$insert('.row', 'append', '<b>!</b>')">inside</button>`, { items: ['a', 'b'], error: '' });
    app.mount(root);
    root.querySelector('#beside').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert.match(app.state.error, /b-for/);
    assert.equal(root.querySelectorAll('li').length, 2);
    root.querySelector('#inside').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    assert.equal(root.querySelector('.row b')?.textContent, '!');
});
