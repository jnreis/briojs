import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

function environment(t, markup, source = '({})', bundle = 'brio.min.js') {
    const dom = new JSDOM(`<main id="app">${markup}</main><aside id="external"></aside>`, {
        runScripts: 'outside-only', url: 'https://brio.test/',
    });
    const { window } = dom;
    window.eval(readFileSync(new URL(`../dist/${bundle}`, import.meta.url), 'utf8'));
    const value = window.eval(source);
    const app = window.brio.createApp(value.components ? value : window.eval(`({state:()=>(${source})})`));
    t.after(() => { try { app.dispose(); } finally { window.close(); } });
    return { app, window, root: window.document.querySelector('main') };
}

const capture = '<script b-script>() => { window.refs = $ref; }</script>';
const labels = parent => [...parent.children].map(node => node.textContent).join(',');
const errors = error => [error.message, error.cause && errors(error.cause),
    ...(error.errors ?? []).map(errors)].filter(Boolean).join('\n');

for (const bundle of ['brio.min.js', 'brio.dev.min.js']) {
    test(`${bundle}: teleport accepts selectors and refs with all placements and default after`, t => {
        for (const ref of [false, true]) {
            for (const placement of ['before', 'after', 'prepend', 'append', undefined]) {
                const target = ref ? '$ref.target' : "'#target'";
                const expression = placement ? `[${target}, '${placement}']` : target;
                const { app, root } = environment(t, `
                    <section><b>head</b><div id="target" b-ref="target"><i>old</i></div><b>tail</b></section>
                    <span b-teleport="${expression}">new</span>`, '({})', bundle);
                app.mount(root);
                const container = root.querySelector('section');
                const expected = placement === 'before' ? 'head,new,old,tail' :
                    placement === 'prepend' ? 'head,newold,tail' :
                        placement === 'append' ? 'head,oldnew,tail' : 'head,old,new,tail';
                assert.equal(labels(container), expected);
                app.unmount();
                assert.equal(container.querySelector('span'), null);
            }
        }
    });
}

test('later refs, disappearance and replacement move the same live output through its authored source', t => {
    const { app, root, window } = environment(t, `${capture}
        <section id="source"><input b-ref="field" b-teleport="[$ref.target, 'append']"
            b-on-click="$data.count++"><footer>source tail</footer></section>
        <aside b-if="$data.visible" b-ref="target"><i>target child</i></aside>`,
    '({visible:true,count:0})');
    app.mount(root);
    const input = window.refs.field;
    const first = window.refs.target;
    input.value = 'retained';
    assert.equal(input.parentNode, first);
    assert.equal(first.querySelectorAll('i').length, 1);
    app.state.visible = false;
    assert.equal(input.parentNode.id, 'source');
    assert.equal(input.nextElementSibling.tagName, 'FOOTER');
    input.click();
    app.state.visible = true;
    assert.notEqual(window.refs.target, first);
    assert.equal(input.parentNode, window.refs.target);
    assert.equal(input.value, 'retained');
    assert.equal(app.state.count, 1);
    app.unmount();
    input.click();
    assert.equal(app.state.count, 1);
});

test('selector strings never resolve ref names; null and undefined preserve source position', t => {
    const { app, root } = environment(t, `<section b-ref="aside"></section><aside></aside>
        <div id="source"><b b-teleport="$data.target">live</b><i>tail</i></div>`,
    '({target:null})');
    app.mount(root);
    const output = root.querySelector('b');
    app.state.target = 'aside';
    assert.equal(output.previousElementSibling.tagName, 'ASIDE');
    app.state.target = undefined;
    assert.equal(output.parentNode.id, 'source');
    assert.equal(output.nextElementSibling.tagName, 'I');
});

test('selector misses warn once per unresolved result and do not observe arbitrary DOM insertion', t => {
    const { app, root, window } = environment(t,
        '<b b-teleport="[$data.target, $data.placement]">live</b>',
        '({target:"#missing",placement:"after"})');
    const warnings = [];
    window.console.warn = message => warnings.push(message);
    app.mount(root);
    const output = root.querySelector('b');
    app.state.placement = 'before';
    assert.equal(warnings.length, 1);
    const target = window.document.createElement('aside');
    target.id = 'missing';
    root.append(target);
    assert.equal(output.nextElementSibling, target);
    app.state.placement = 'append';
    assert.equal(output.parentNode, target);
    app.state.target = '#different';
    assert.equal(warnings.length, 2);
    assert.equal(output.parentNode, root);
});

test('unchanged targets do not reposition neighboring portals when another dependency changes', t => {
    const { app, root } = environment(t, `<aside id="target"></aside>
        <b b-teleport="($data.tick, '#target')">first</b>
        <i b-teleport="'#target'">second</i>`, '({tick:0})');
    app.mount(root);
    const before = [...root.childNodes];
    app.state.tick++;
    assert.deepEqual([...root.childNodes], before);
});

test('invalid teleport input is explicit and failed reactive updates preserve the last valid position', t => {
    for (const expression of ['123', 'false', '{}', '[]', "['#target']", "['#target','replaceWith']",
        "['#target','append',1]", "'['", '#target', '$ref.target.value']) {
        const { app, root } = environment(t,
            `<aside id="target"></aside><b b-teleport="${expression}">live</b>`);
        assert.throws(() => app.mount(root));
        assert.equal(root.querySelector('aside').textContent, '');
    }
    const { app, root } = environment(t, `<aside id="target"></aside>
        <b b-teleport="['#target',$data.placement]">live</b>`, '({placement:"append"})');
    app.mount(root);
    const output = root.querySelector('b');
    assert.throws(() => { app.state.placement = 'invalid'; }, error => /placement must/.test(errors(error)));
    assert.equal(output.parentNode.id, 'target');
    app.state.placement = 'before';
    assert.equal(output.nextElementSibling.id, 'target');
});

test('teleport rejects modifiers, cycles, controlled containers and invalid insertion destinations', t => {
    for (const markup of [
        '<b b-teleport.ref="target"></b>',
        '<b b-ref="self" b-teleport="$ref.self"></b>',
        '<b b-teleport="\'i\'"><i></i></b>',
        '<div b-text="\'text\'" b-ref="target"></div><b b-teleport="[$ref.target, \'append\']"></b>',
        '<div b-html="\'text\'" b-ref="target"></div><b b-teleport="[$ref.target, \'prepend\']"></b>',
        '<div b-ignore id="target"></div><b b-teleport="[\'#target\', \'append\']"></b>',
        '<template id="target"></template><b b-teleport="[\'#target\', \'append\']"></b>',
        '<b b-teleport="\'html\'"></b>',
    ]) {
        const { app, root } = environment(t, markup);
        assert.throws(() => app.mount(root));
    }
    const { app, root } = environment(t, `<b b-teleport="[$ref.target,'append']">live</b>
        <div b-ref="target" b-text="'controlled'"></div>`);
    assert.throws(() => app.mount(root), error => /controlled/.test(errors(error)));
});

test('a component host ref is ready after rendering and projected teleport retains author refs', t => {
    const { app, root, window } = environment(t, `${capture}
        <input b-ref="field" b-teleport="[$ref.host, 'append']">
        <ref-card b-ref="host"><b b-teleport="[$ref.target,'append']">slot</b></ref-card>
        <aside b-ref="target"></aside>`, `({
        components: {'ref-card': {template:'<i>component</i><slot></slot>',
            setup({$ref}) { window.privateRefs = $ref; return {}; }}}
    })`);
    app.mount(root);
    assert.equal(window.refs.field.parentNode, window.refs.host);
    assert.equal(root.querySelector('aside b').textContent, 'slot');
    assert.equal(window.privateRefs.target, undefined);
    assert.equal(window.refs.host.querySelector('i').textContent, 'component');
});

test('selector targets later in hydration wait for component rendering and reject controlled children', t => {
    const { app, root } = environment(t, `<input b-teleport="['#host','append']">
        <ref-card id="host"></ref-card>`, `({
        components: {'ref-card': {template:'<i>component</i>'}}
    })`);
    app.mount(root);
    assert.equal(root.querySelector('input').parentNode.id, 'host');
    for (const directive of ['b-ignore', 'b-text="1"', 'b-html="1"']) {
        const environmentResult = environment(t, `<b b-teleport="['#later','append']"></b>
            <aside id="later" ${directive}></aside>`);
        assert.throws(() => environmentResult.app.mount(environmentResult.root),
            error => /controlled/.test(errors(error)));
    }
});

test('later selector targets hydrate safely during managed insertion and reactive HTML replacement', t => {
    for (const mode of ['insert', 'html', 'template']) {
        const { app, root } = environment(t,
            `<section id="container"${mode === 'html' ? ' b-html.hydrate="trustedHTML($data.html)"' : ''}></section>`,
            `({state:()=>({html:''}),components:{'ref-card':{template:'<i>component</i>'}}})`);
        app.mount(root);
        const content = `<input b-teleport="['#host','append']"><ref-card id="host"></ref-card>`;
        if (mode === 'html') app.state.html = content;
        else app.insert('#container', 'append', mode === 'template' ? `<template b-template>${content}</template>` : content);
        assert.equal(root.querySelector('input').parentNode.id, 'host');
        assert.equal(root.querySelector('#host i').textContent, 'component');
    }
});

test('sibling placements beside directive-controlled containers remain valid', t => {
    const { app, root } = environment(t, `<aside b-ref="target" b-text="'owned'"></aside>
        <b b-teleport="[$ref.target,'before']">before</b>
        <i b-teleport="$ref.target">after</i>`);
    app.mount(root);
    assert.equal(labels(root), 'before,owned,after');
});

test('teleport uses local-only data refs and valid disconnected elements without connectivity polling', t => {
    const { app, root, window } = environment(t, `${capture}<aside b-ref="target"></aside>
        <section b-data><b b-teleport="$ref.target">local</b></section>
        <input b-ref="field" b-teleport="[$ref.target,'append']">`);
    app.mount(root);
    assert.equal(root.querySelector('b').parentNode.tagName, 'SECTION');
    const target = window.refs.target;
    target.remove();
    assert.equal(window.refs.field.parentNode, target);
    assert.equal(window.refs.field.isConnected, false);
});

for (const placement of ['before', 'after', 'prepend', 'append']) {
    test(`keyed fragment rows preserve order and neighbors with reactive ${placement} destinations`, t => {
        const { app, root } = environment(t, `<section><aside id="one">one</aside><aside id="two">two</aside></section>
            <template b-for="n in $data.items" b-key="$for.n" b-template
                b-teleport="[$data.target, $data.placement]"><b b-text="$for.n"></b><i>!</i></template>`,
        `({items:[1,2,3],target:'#one',placement:'${placement}'})`);
        app.mount(root);
        const output = root.querySelectorAll('b')[0];
        const one = root.querySelector('#one');
        const two = root.querySelector('#two');
        const order = () => [...root.querySelectorAll('b')].map(node => node.textContent);
        assert.deepEqual(order(), ['1', '2', '3']);
        app.state.items.reverse();
        assert.deepEqual(order(), ['3', '2', '1']);
        app.state.target = '#two';
        assert.deepEqual(order(), ['3', '2', '1']);
        assert.equal(root.querySelectorAll('b')[2], output);
        if (placement === 'before') assert.equal(two.previousElementSibling.tagName, 'I');
        else if (placement === 'after') assert.equal(two.nextElementSibling.tagName, 'B');
        else assert.equal(output.parentNode, two);
        assert.equal(one.textContent, 'one');
        app.state.target = null;
        assert.deepEqual(order(), ['3', '2', '1']);
        assert.equal(output.parentNode, root);
        app.state.items.pop();
        assert.equal(output.isConnected, false);
        app.state.target = '#one';
        assert.deepEqual(order(), ['3', '2']);
        app.state.items = [];
        assert.equal(one.textContent, 'one');
        assert.equal(two.textContent, 'two');
    });
}

test('distinct targets and placements sharing a parent remain independent across row changes', t => {
    const { app, root } = environment(t, `<section><aside id="one">one</aside><aside id="two">two</aside></section>
        <b b-for="item in $data.items" b-key="$for.item.id" b-text="$for.item.id"
            b-teleport="[$for.item.target, $for.item.placement]"></b>`,
    `({items:[{id:1,target:'#one',placement:'before'},{id:2,target:'#two',placement:'before'},
        {id:3,target:'#one',placement:'after'},{id:4,target:'#two',placement:'after'}]})`);
    app.mount(root);
    const section = root.querySelector('section');
    assert.equal(labels(section), '1,one,3,2,two,4');
    app.state.items.reverse();
    assert.equal(labels(section), '1,one,3,2,two,4');
    app.state.items[0].target = '#one';
    assert.equal(labels(section), '1,one,4,3,2,two');
});

test('conditional teleports update pending locations without reconnecting detached output', t => {
    const { app, root, window } = environment(t, `${capture}
        <aside b-ref="one"></aside><aside b-ref="two"></aside>
        <input b-if.detach="$data.visible" b-ref="field"
            b-teleport="[$data.second ? $ref.two : $ref.one, $data.placement]">`,
    '({visible:true,second:false,placement:"append"})');
    app.mount(root);
    const input = window.refs.field;
    app.state.visible = false;
    app.state.second = true;
    app.state.placement = 'before';
    assert.equal(input.isConnected, false);
    app.state.visible = true;
    assert.equal(input.nextElementSibling, window.refs.two);
    assert.equal(window.refs.field, input);
});

test('disposing detached output never resolves a stale pending destination', t => {
    const { app, root } = environment(t, `<aside id="one"></aside><aside id="two"></aside>
        <input b-if.detach="$data.visible" b-teleport="[$data.target,'after']">`,
    '({visible:true,target:"#one"})');
    app.mount(root);
    const input = root.querySelector('input');
    app.state.visible = false;
    app.state.target = '#two';
    root.querySelector('#two').remove();
    assert.doesNotThrow(() => app.unmount());
    assert.equal(input.isConnected, false);
});

test('leave reversal retains teleported identity while its ref destination disappears and returns', t => {
    const { app, root, window } = environment(t, `${capture}
        <aside b-if="$data.targetVisible" b-ref="target"></aside>
        <button b-if="$data.visible" b-ref="field" b-teleport="[$ref.target,'append']"
            b-transition="'fade'" b-on-click="$data.count++"
            style="transition-property:opacity;transition-duration:1s;transition-delay:0s">live</button>`,
    '({visible:true,targetVisible:true,count:0})');
    const frames = new Map();
    const timers = new Map();
    let next = 0;
    window.requestAnimationFrame = callback => { frames.set(++next, callback); return next; };
    window.cancelAnimationFrame = id => frames.delete(id);
    window.setTimeout = callback => { timers.set(++next, callback); return next; };
    window.clearTimeout = id => timers.delete(id);
    const advance = () => {
        for (let index = 0; index < 2; index++) {
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach(callback => callback());
        }
    };
    app.mount(root);
    const button = window.refs.field;
    app.state.visible = false;
    advance();
    const stale = [...timers.values()][0];
    app.state.targetVisible = false;
    assert.equal(button.parentNode, root);
    app.state.visible = true;
    stale();
    app.state.targetVisible = true;
    assert.equal(window.refs.field, button);
    assert.equal(button.parentNode, window.refs.target);
    button.click();
    assert.equal(app.state.count, 1);
    app.state.visible = false;
    advance();
    [...timers.values()].forEach(callback => callback());
    assert.equal(window.refs.field, undefined);
    button.click();
    assert.equal(app.state.count, 1);
});

test('detached keyed loops reconcile new destinations, placement and collection changes while hidden', t => {
    const { app, root } = environment(t, `<aside id="one"></aside><aside id="two"></aside>
        <template b-if.detach="$data.visible" b-for="n in $data.items" b-key="$for.n"
            b-template b-teleport="[$data.target,$data.placement]"><b b-text="$for.n"></b></template>`,
    '({visible:true,items:[1,2],target:"#one",placement:"append"})');
    app.mount(root);
    const first = root.querySelector('b');
    app.state.visible = false;
    app.state.target = '#two';
    app.state.placement = 'before';
    app.state.items.reverse();
    app.state.items.push(3);
    assert.equal(root.querySelectorAll('b').length, 0);
    app.state.visible = true;
    assert.deepEqual([...root.querySelectorAll('b')].map(node => node.textContent), ['2', '1', '3']);
    assert.equal(root.querySelectorAll('b')[1], first);
    assert.equal(root.querySelector('#two').previousElementSibling.textContent, '3');
});

test('managed target removal and HTML replacement preserve foreign source-owned effects', t => {
    for (const mode of ['insert', 'html']) {
        const { app, root, window } = environment(t, `${capture}
            <button b-ref="field" b-teleport="[$ref.target,'append']" b-on-click="$data.count++">live</button>
            <section id="container"${mode === 'html' ? ' b-html.hydrate="trustedHTML($data.html)"' : ''}></section>`,
        `({count:0,html:'<aside b-ref="target"></aside>'})`);
        app.mount(root);
        let handle;
        if (mode === 'insert') handle = app.insert('#container', 'append', '<aside b-ref="target"></aside>');
        const button = window.refs.field;
        assert.equal(button.parentNode, window.refs.target);
        if (handle) handle.remove();
        else app.state.html = '<i>replacement</i>';
        assert.equal(button.parentNode, root);
        button.click();
        assert.equal(app.state.count, 1);
        if (mode === 'insert') {
            app.insert('#container', 'append', '<aside b-ref="target"></aside>');
            app.insert('#container', 'replaceChildren', '<em>replacement</em>');
            assert.equal(button.parentNode, root);
            button.click();
            assert.equal(app.state.count, 2);
        }
    }
});

test('multiple loops retain independent bounded destinations and remove every portal anchor on unmount', t => {
    const { app, root, window } = environment(t, `
        <b b-for="n in $data.items" b-text="$for.n" b-teleport="['#external','prepend']"></b>
        <i b-for="n in $data.items" b-text="$for.n" b-teleport="['#external','prepend']"></i>`,
    '({items:[1,2]})');
    const external = window.document.querySelector('#external');
    external.innerHTML = '<em>existing</em>';
    app.mount(root);
    assert.equal(labels(external), '1,2,1,2,existing');
    app.state.items.reverse();
    assert.equal(labels(external), '2,1,2,1,existing');
    app.unmount();
    assert.equal(external.innerHTML, '<em>existing</em>');
});

test('empty fragment teleports and row-local refs preserve output ownership through keyed reuse', t => {
    const { app, root } = environment(t, `<aside id="target"></aside>
        <template b-template b-teleport="['#target','prepend']"></template>
        <section b-for="n in $data.items" b-key="$for.n">
            <input b-teleport="[$ref.local,'append']">
            <aside b-ref="local"><b b-text="$for.n"></b></aside>
        </section>`, '({items:[1,2]})');
    app.mount(root);
    const first = root.querySelector('section input');
    first.value = 'kept';
    app.state.items.reverse();
    assert.equal(root.querySelectorAll('section input')[1], first);
    assert.equal(first.parentNode.querySelector('b').textContent, '1');
    assert.equal(first.value, 'kept');
    app.unmount();
});

test('failed hydration removes teleported fragments and pending target callbacks', t => {
    const { app, root, window } = environment(t, `
        <template b-template b-teleport="['#external','append']"><input></template>
        <input b-teleport="[$ref.later,'append']">
        <aside b-ref="later"><b b-text="$data.fail()"></b></aside>`);
    assert.throws(() => app.mount(root));
    assert.equal(window.document.querySelector('#external').childNodes.length, 0);
    assert.equal(root.querySelector('aside input'), null);
});

test('manual teleport page exercises placements, late refs, identity and hidden keyed changes', t => {
    const markup = readFileSync(new URL('./directives/teleport.html', import.meta.url), 'utf8');
    const dom = new JSDOM(markup, { runScripts: 'outside-only' });
    const { window } = dom;
    t.after(() => { try { window.dispatchEvent(new window.Event('pagehide')); } finally { window.close(); } });
    window.eval(readFileSync(new URL('../dist/brio.min.js', import.meta.url), 'utf8'));
    window.eval([...window.document.querySelectorAll('script')].at(-1).textContent);
    window.dispatchEvent(new window.Event('DOMContentLoaded'));
    const document = window.document;
    const byId = id => document.getElementById(id);
    const click = id => byId(id).click();
    const select = (id, value) => {
        byId(id).value = value;
        byId(id).dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    assert.equal(byId('default-after').previousElementSibling, byId('default-target'));
    assert.equal(byId('explicit-append').parentNode, byId('default-target'));
    const moving = byId('moving');
    moving.value = 'kept';
    select('placement', 'append');
    click('switch-target');
    assert.equal(moving.parentNode, byId('two'));
    assert.equal(moving.value, 'kept');
    const late = byId('late-input');
    click('toggle-target');
    assert.equal(late.parentNode, byId('late-target'));
    click('toggle-target');
    assert.equal(late.parentNode, byId('late-source'));
    const detached = byId('detached-input');
    click('toggle-detach');
    click('switch-target');
    assert.equal(detached.isConnected, false);
    click('toggle-detach');
    assert.equal(detached.parentNode, byId('one'));
    const row = document.querySelector('[data-row="1"]');
    row.value = 'row kept';
    click('toggle-rows');
    select('row-target', '#rows-two');
    select('row-placement', 'before');
    click('reverse-rows');
    click('add-row');
    assert.equal(document.querySelector('.row'), null);
    click('toggle-rows');
    assert.deepEqual([...document.querySelectorAll('.row b')].map(node => node.textContent), ['3', '2', '1', '4']);
    assert.equal(document.querySelector('[data-row="1"]'), row);
    assert.equal(row.value, 'row kept');
});
