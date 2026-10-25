import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

function environment(t, markup, state = '{}', bundle = 'brio.min.js') {
    const dom = new JSDOM(`<main id="app">${markup}</main><aside id="portal"></aside>`, { runScripts: 'outside-only' });
    const { window } = dom;
    window.eval(readFileSync(new URL(`../dist/${bundle}`, import.meta.url), 'utf8'));
    const app = window.eval(`brio.createApp({state: () => (${state})})`);
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    return { app, root: window.document.querySelector('main'), portal: window.document.querySelector('aside'), window };
}

for (const bundle of ['brio.min.js', 'brio.dev.min.js']) {
    test(`${bundle}: nested template output is removed and disposed with its conditional`, t => {
        const { app, root } = environment(t, `
            <template b-template b-if="$data.visible">
                text:\${$data.count}
                <template b-template><button b-on-click="$data.count++">increment</button></template>
                <span b-text="$data.count"></span>
                <script b-script>({$data,onCleanup}) => {
                    $data.mounts++;
                    onCleanup(() => $data.cleanups++);
                }</script>
            </template><footer>tail</footer>`,
        '{visible:true,count:0,mounts:0,cleanups:0}', bundle);
        app.mount(root);
        const button = root.querySelector('button');
        const span = root.querySelector('span');
        button.click();
        assert.equal(span.textContent, '1');
        app.state.visible = false;
        assert.equal(root.textContent.trim(), 'tail');
        assert.equal(app.state.cleanups, 1);
        button.click();
        app.state.count++;
        assert.equal(app.state.count, 2);
        assert.equal(span.textContent, '1');
        app.state.visible = true;
        assert.notEqual(root.querySelector('button'), button);
        assert.equal(app.state.mounts, 2);
        app.unmount();
        assert.equal(app.state.cleanups, 2);
    });

    test(`${bundle}: detach preserves a fragment chain and updates while disconnected`, t => {
        const { app, root } = environment(t, `
            <template b-if.detach="$data.tab === 1" b-template>
                first:<button b-on-click="$data.count++"></button><b b-text="$data.count"></b>
            </template>
            <template b-else-if="$data.tab === 2" b-template><i b-text="$data.count"></i></template>
            <template b-else b-template>fallback</template>`,
        '{tab:0,count:0}', bundle);
        app.mount(root);
        assert.equal(root.textContent.trim(), 'fallback');
        app.state.tab = 1;
        const button = root.querySelector('button');
        const first = root.querySelector('b');
        button.click();
        app.state.tab = 2;
        const second = root.querySelector('i');
        assert.equal(first.isConnected, false);
        button.click();
        assert.equal(first.textContent, '2');
        assert.equal(second.textContent, '2');
        app.state.tab = 1;
        assert.equal(root.querySelector('button'), button);
        assert.equal(root.querySelector('b'), first);
        assert.equal(second.isConnected, false);
    });
}

test('keyed fragments move text and multiple roots together, preserving per-row IDs and state', t => {
    const { app, root, window } = environment(t, `
        <template b-template b-for="item, index in $data.items" b-key="$for.item.id"
                  b-id="['field']" b-provide="{item:$for.item}">
            \${$for.index}:
            <label b-bind-for="$id.field" b-text="$provided.item.name"></label>
            <input b-bind-id="$id.field">
            <template b-template><button b-on-click="$data.clicks++" b-text="$for.item.name"></button></template>
        </template><footer>tail</footer>`,
    '{items:[{id:1,name:"one"},{id:2,name:"two"}],clicks:0}');
    app.mount(root);
    const first = root.querySelector('input');
    const buttons = [...root.querySelectorAll('button')];
    const ids = [...root.querySelectorAll('input')].map(node => node.id);
    assert.equal(new Set(ids).size, 2);
    first.value = 'local value';
    app.state.items.reverse();
    assert.equal(root.querySelectorAll('input')[1], first);
    assert.equal(first.value, 'local value');
    assert.deepEqual([...root.querySelectorAll('label')].map(node => node.htmlFor), ids.toReversed());
    assert.match(root.textContent, /0:\s*two\s*two\s*1:\s*one\s*one\s*tail/);
    app.state.items[1] = window.JSON.parse('{"id":1,"name":"updated"}');
    assert.equal(root.querySelectorAll('button')[1], buttons[0]);
    assert.equal(buttons[0].textContent, 'updated');
    app.state.items.splice(1, 1);
    assert.equal(first.isConnected, false);
    buttons[0].click();
    assert.equal(app.state.clicks, 0);
    app.state.items.push(window.JSON.parse('{"id":3,"name":"three"}'));
    assert.equal(root.querySelectorAll('input').length, 2);
});

test('conditional loop fragments own dynamic rows through detach and destructive removal', t => {
    for (const mode of ['', '.detach']) {
        const { app, root } = environment(t, `
            <template b-if${mode}="$data.visible" b-for="n in $data.items" b-key="$for.n" b-template>
                <span b-text="$for.n"></span><b>row</b>
            </template>`, '{visible:true,items:[1,2]}');
        app.mount(root);
        const first = root.querySelector('span');
        app.state.visible = false;
        assert.equal(root.textContent.trim(), '');
        app.state.items.push(3);
        app.state.visible = true;
        assert.deepEqual([...root.querySelectorAll('span')].map(node => node.textContent), ['1', '2', '3']);
        assert.equal(root.querySelector('span') === first, mode === '.detach');
        app.state.visible = false;
        app.unmount();
        assert.equal(first.isConnected, false);
    }
});

test('nested conditionals and loops remain inside keyed fragment ranges', t => {
    const { app, root } = environment(t, `
        <template b-template b-for="n in $data.items" b-key="$for.n">
            <template b-if="$data.visible" b-template>
                <b b-for="child in $for.n" b-text="$for.$parent.n + ':' + $for.child"></b>
            </template>
        </template>`, '{items:[1,2],visible:false}');
    app.mount(root);
    app.state.items.reverse();
    app.state.visible = true;
    assert.deepEqual([...root.querySelectorAll('b')].map(node => node.textContent), ['2:1', '2:2', '1:1']);
    app.state.items.pop();
    assert.equal(root.querySelectorAll('b').length, 2);
    app.state.visible = false;
    assert.equal(root.textContent.trim(), '');
});

test('teleported fragments detach/reconnect at their destination and dispose listeners and effects', t => {
    for (const mode of ['', '.detach']) {
        const { app, root, portal } = environment(t, `
            <template b-if${mode}="$data.visible" b-template b-teleport="['#portal', 'append']"
                b-effect="$data.record($data.count)">
                remote:<button b-on-click="$data.count++"></button><b b-text="$data.count"></b>
            </template>`, '{visible:false,count:0}');
        const records = [];
        app.state.record = value => records.push(value);
        app.mount(root);
        assert.equal(portal.textContent, '');
        assert.equal(records.length, mode ? 1 : 0);
        app.state.visible = true;
        const button = portal.querySelector('button');
        const output = portal.querySelector('b');
        button.click();
        app.state.visible = false;
        assert.equal(portal.childNodes.length, mode ? 1 : 0);
        app.state.count++;
        assert.equal(output.textContent, mode ? '2' : '1');
        app.state.visible = true;
        assert.equal(portal.querySelector('button') === button, Boolean(mode));
        assert.equal(root.querySelector('button'), null);
        app.unmount();
        assert.equal(portal.childNodes.length, 0);
        const count = app.state.count;
        button.click();
        assert.equal(app.state.count, count);
    }
});

test('keyed teleported fragments reorder at the destination without pulling output back', t => {
    const { app, root, portal } = environment(t, `
        <template b-for="n in $data.items" b-key="$for.n" b-template b-teleport="['#portal', 'append']">
            <button b-text="$for.n"></button><b b-text="$for.n"></b>
        </template>`, '{items:[1,2,3]}');
    app.mount(root);
    const first = portal.querySelector('button');
    app.state.items.reverse();
    assert.deepEqual([...portal.querySelectorAll('button')].map(node => node.textContent), ['3', '2', '1']);
    assert.equal(portal.querySelectorAll('button')[2], first);
    assert.equal(root.querySelector('button'), null);
    app.state.items.pop();
    assert.equal(first.isConnected, false);
    app.unmount();
    assert.equal(portal.childNodes.length, 0);
});

test('a detached conditional loop suspends all teleported rows and reconciles their hidden order', t => {
    const { app, root, portal } = environment(t, `
        <template b-if.detach="$data.visible" b-for="n in $data.items" b-key="$for.n"
                  b-template b-teleport="['#portal', 'append']">
            <button b-text="$for.n"></button><b b-text="$for.n"></b>
        </template>`, '{visible:true,items:[1,2,3]}');
    app.mount(root);
    const first = portal.querySelector('button');
    app.state.visible = false;
    assert.equal(portal.querySelector('button'), null);
    app.state.items.reverse();
    app.state.items.push(4);
    assert.equal(portal.querySelector('button'), null);
    app.state.visible = true;
    assert.deepEqual([...portal.querySelectorAll('button')].map(node => node.textContent), ['3', '2', '1', '4']);
    assert.equal(portal.querySelectorAll('button')[2], first);
    assert.equal(root.querySelector('button'), null);
    app.unmount();
    assert.equal(portal.childNodes.length, 0);
});

test('teleporting to the source parent preserves destination placement through detach and keyed movement', t => {
    const { app, root } = environment(t, `
        <template b-if.detach="$data.visible" b-template b-teleport="['#app', 'append']"><b>remote branch</b></template>
        <template b-for="n in $data.items" b-key="$for.n" b-template b-teleport="['#app', 'append']"><i b-text="$for.n"></i></template>
        <footer>tail</footer>`, '{visible:true,items:[1,2]}');
    app.mount(root);
    const branch = root.querySelector('b');
    const first = root.querySelector('i');
    assert.deepEqual([...root.children].map(node => node.tagName), ['FOOTER', 'B', 'I', 'I']);
    app.state.visible = false;
    app.state.items.reverse();
    app.state.visible = true;
    assert.deepEqual([...root.children].map(node => node.tagName), ['FOOTER', 'B', 'I', 'I']);
    assert.equal(root.querySelector('b'), branch);
    assert.equal(root.querySelectorAll('i')[1], first);
});

test('empty fragments, multiple destinations and sibling portal content retain their boundaries', t => {
    const { app, root, portal } = environment(t, `
        <template b-if="$data.empty" b-template></template>
        <div id="other"></div>
        <template b-for="n in $data.items" b-key="$for.n" b-template b-teleport="['#portal', 'append']">
            <template b-if="$for.n % 2" b-template><span b-text="$for.n"></span></template>
        </template>
        <template b-for="n in $data.items" b-key="$for.n" b-template b-teleport="['#other', 'append']"><b b-text="$for.n"></b></template>`,
    '{empty:true,items:[1,2,3]}');
    portal.innerHTML = '<em>before</em>';
    app.mount(root);
    portal.insertAdjacentHTML('beforeend', '<footer>after</footer>');
    app.state.empty = false;
    app.state.items.reverse();
    assert.equal(portal.firstElementChild.tagName, 'EM');
    assert.equal(portal.lastElementChild.tagName, 'FOOTER');
    assert.deepEqual([...portal.querySelectorAll('span')].map(node => node.textContent), ['3', '1']);
    assert.deepEqual([...root.querySelectorAll('#other b')].map(node => node.textContent), ['3', '2', '1']);
    app.state.items.length = 0;
    assert.equal(portal.textContent, 'beforeafter');
    app.state.items.push(5);
    assert.equal(portal.querySelector('span').textContent, '5');
    app.unmount();
    assert.equal(portal.innerHTML, '<em>before</em><footer>after</footer>');
});

test('managed insertion removes nested template output and teleports and rolls back hydration failures', t => {
    const { app, root, portal } = environment(t, '<div id="target"></div>', '{count:0}');
    app.mount(root);
    const handle = app.insert('#target', 'append', `
        <template b-template><b b-text="$data.count"></b>
            <template b-template b-teleport="['#portal', 'append']"><button b-on-click="$data.count++"></button></template>
        </template>`);
    const button = portal.querySelector('button');
    const text = root.querySelector('b');
    button.click();
    assert.equal(text.textContent, '1');
    handle.remove();
    assert.equal(root.querySelector('#target').childNodes.length, 0);
    assert.equal(portal.childNodes.length, 0);
    button.click();
    app.state.count++;
    assert.equal(text.textContent, '1');
    assert.throws(() => app.insert('#target', 'append',
        '<template b-template><b b-text="$data.missing()"></b></template>'), /missing/);
    assert.equal(root.querySelector('#target').childNodes.length, 0);
});

test('failed fragment mount removes teleports and disposes already hydrated children', t => {
    const { app, root, portal } = environment(t, `
        <template b-if="true" b-template>
            <template b-template b-teleport="['#portal', 'append']"><button b-on-click="$data.count++"></button></template>
            <script b-script>({onCleanup,$data}) => { onCleanup($data.cleaned); }</script>
            <b b-text="$data.missing()"></b>
        </template>`, '{count:0}');
    let cleanups = 0;
    app.state.cleaned = () => cleanups++;
    const original = root.innerHTML;
    assert.throws(() => app.mount(root), /missing/);
    assert.equal(portal.childNodes.length, 0);
    assert.equal(root.innerHTML, original);
    assert.equal(cleanups, 1);
});

test('failed newly added fragment rows are removed and can be reconciled after recovery', t => {
    const { app, root } = environment(t, `
        <template b-for="n in $data.items" b-key="$for.n" b-template>
            <b b-text="$for.n === 2 ? $data.missing() : $for.n"></b>
        </template>`, '{items:[1]}');
    app.mount(root);
    const first = root.querySelector('b');
    assert.throws(() => app.state.items.push(2), error => {
        assert.match(error.message, /reactive effects failed/);
        assert.match(error.errors[0].message, /missing/);
        return true;
    });
    assert.equal(root.querySelectorAll('b').length, 1);
    app.state.items.pop();
    app.state.items.push(3);
    assert.equal(root.querySelector('b'), first);
    assert.deepEqual([...root.querySelectorAll('b')].map(node => node.textContent), ['1', '3']);
});

test('fragment hide and mount-root unwrapping are explicitly rejected', t => {
    for (const markup of [
        '<template b-if.hide="true" b-template><b></b></template>',
        '<template b-if.hide="false" b-template></template>',
    ]) {
        const { app, root } = environment(t, markup);
        assert.throws(() => app.mount(root), /concrete branch/);
    }
    const { app, root } = environment(t, '');
    root.setAttribute('b-template', '');
    assert.throws(() => app.mount(root), /container root/);
});

test('component and projected fragment scopes dispose once with their conditional owner', t => {
    const { app, root, window } = environment(t, `
        <template b-if="$data.visible" b-template>
            <fragment-card><template b-template><em b-text="$data.label"></em></template></fragment-card>
        </template>`, '{visible:true,label:"parent"}');
    let cleanups = 0;
    app.component('fragment-card', {
        template: '<template b-template b-for="n in 2"><b b-text="$data.label"></b><slot></slot></template>',
        setup() {
            window.brio.onCleanup(() => cleanups++);
            return window.JSON.parse('{"label":"component"}');
        },
    });
    app.mount(root);
    const slot = root.querySelector('em');
    assert.equal(root.querySelectorAll('em').length, 2);
    assert.equal(root.querySelector('b').textContent, 'component');
    app.state.label = 'updated';
    assert.equal(slot.textContent, 'updated');
    app.state.visible = false;
    assert.equal(cleanups, 1);
    app.state.label = 'stopped';
    assert.equal(slot.textContent, 'updated');
    app.unmount();
    assert.equal(cleanups, 1);
});

test('native table template rows preserve valid parents and keyed node identity', t => {
    const { app, root } = environment(t, `
        <table><tbody><template b-for="n in $data.items" b-key="$for.n" b-template>
            <tr><td b-text="$for.n"></td></tr><tr><td>detail</td></tr>
        </template></tbody></table>`, '{items:[1,2]}');
    app.mount(root);
    const first = root.querySelector('tr');
    app.state.items.reverse();
    assert.equal(root.querySelectorAll('tr')[2], first);
    assert.equal(first.parentElement.tagName, 'TBODY');
    app.state.items.pop();
    assert.equal(root.querySelectorAll('tr').length, 2);
});

test('manual template page exercises retained nodes, remote reconciliation, IDs and effects', t => {
    const markup = readFileSync(new URL('./directives/template.html', import.meta.url), 'utf8');
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });
    const { window } = dom;
    let app;
    t.after(() => { try { app?.dispose(); } finally { window.close(); } });
    window.eval(readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8'));
    const createApp = window.brio.createApp;
    window.brio.createApp = options => (app = createApp(options));
    window.eval([...window.document.querySelectorAll('script')].at(-1).textContent);
    window.dispatchEvent(new window.Event('DOMContentLoaded'));
    const { document } = window;
    const click = id => document.getElementById(id).click();
    const first = document.querySelector('#rows input');
    const remote = document.querySelector('#template-portal input');
    first.value = 'local';
    remote.value = 'remote';
    click('toggle-remote');
    click('reverse');
    click('add');
    click('toggle-remote');
    assert.equal(document.querySelectorAll('#rows input')[1], first);
    assert.equal(document.querySelectorAll('#template-portal input')[1], remote);
    assert.equal(remote.value, 'remote');
    assert.deepEqual([...document.querySelectorAll('.remote-name')].map(node => node.textContent), ['Grace', 'Ada', 'Row 3']);
    const preserved = document.querySelector('#preserved-input');
    click('toggle-preserved');
    click('increment');
    click('toggle-preserved');
    assert.equal(document.querySelector('#preserved-input'), preserved);
    assert.equal(document.querySelector('#preserved-count').textContent, '1');
    assert.equal(document.querySelector('#effect-value').textContent, '1');
    click('local-count');
    click('toggle-destructive');
    assert.equal(document.querySelector('#destructive').textContent.trim(), '');
    click('toggle-destructive');
    assert.equal(document.querySelector('#local-count').textContent, 'Local: 0');
});
