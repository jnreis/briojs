import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

for (const name of ['brio.min.js', 'brio.dev.min.js']) {
    for (const operation of ['handle', 'unmount', 'dispose']) {
        test(`${name}: ${operation} releases behavior without restoring outgoing markup`, t => {
            const dom = new JSDOM('<main b-data=""><button b-on-click="$data.count++" b-text="$data.count"></button></main>', { runScripts: 'outside-only' });
            t.after(() => dom.window.close());
            const { window } = dom;
            window.eval(readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8'));
            const app = window.eval('brio.createApp({ state: () => ({ count: 0 }) })');
            const root = window.document.querySelector('main');
            const handle = app.mount(root);
            const button = root.firstChild;
            button.click();
            const release = () => operation === 'handle'
                ? handle.unmount({ restore: false })
                : app[operation]({ restore: false });
            release();
            release();
            assert.equal(handle.unmounted, true);
            assert.equal(app.roots.size, 0);
            assert.equal(root.firstChild, button);
            assert.equal(root.hasAttribute('b-data'), false);
            button.click();
            app.state.count = 5;
            assert.equal(button.textContent, '1');
            if (operation === 'dispose') {
                assert.throws(() => app.mount(root), /disposed/);
            } else {
                root.innerHTML = '<span b-text="$data.count"></span>';
                app.mount(root);
                assert.equal(root.textContent, '5');
            }
            app.dispose();
        });
    }

    test(`${name}: default unmount restores markup and teardown errors release all roots`, t => {
        const dom = new JSDOM('<main><button b-text="$data.count">Server</button></main><aside><b b-text="$data.count">Other</b></aside>', { runScripts: 'outside-only' });
        t.after(() => dom.window.close());
        const { window } = dom;
        window.eval(readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8'));
        const app = window.eval('brio.createApp({ state: () => ({ count: 3 }) })');
        const root = window.document.querySelector('main');
        const original = root.innerHTML;
        app.mount(root).unmount();
        assert.equal(root.innerHTML, original);
        root.innerHTML = '<script b-script>({onCleanup}) => { onCleanup(() => { throw new Error("cleanup failure"); }); }</script>';
        app.mount(root);
        const other = window.document.querySelector('aside');
        const button = other.firstChild;
        app.mount(other);
        assert.throws(() => app.dispose({ restore: false }), /unmount|cleanup|disposal/i);
        assert.equal(app.roots.size, 0);
        assert.equal(other.firstChild, button);
        app.state.count = 9;
        assert.equal(other.textContent, '3');
        app.dispose();
        const next = window.brio.createApp();
        next.mount(other);
        next.dispose();
    });

    test(`${name}: failed hydration restores authored markup and releases ownership`, t => {
        const dom = new JSDOM('<main><p b-text="$data.count">Server</p><b b-text="missingName">Original</b></main>', { runScripts: 'outside-only' });
        t.after(() => dom.window.close());
        const { window } = dom;
        window.eval(readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8'));
        const app = window.eval('brio.createApp({ state: () => ({ count: 3 }) })');
        const root = window.document.querySelector('main');
        const original = root.innerHTML;
        assert.throws(() => app.mount(root), /expression failed/);
        assert.equal(root.innerHTML, original);
        assert.equal(app.roots.size, 0);
        root.lastChild.remove();
        app.mount(root);
        assert.equal(root.textContent, '3');
        app.dispose({ restore: false });
    });
}
