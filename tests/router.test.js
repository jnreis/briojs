import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createRouter } from 'briojs/router';

const routes = [
    { path: '/', component: 'home-page' },
    { path: '/users/:username', component: 'user-page' },
];

test('router base normalization, app URL generation and browser URL matching work without a DOM', () => {
    for (const input of ['/my-app', '/my-app/']) {
        const router = createRouter(routes, { base: input });
        assert.equal(router.base, '/my-app/');
        assert.equal(router.href('/'), '/my-app/');
        assert.equal(router.href('/users/ada?sort=name#details'), '/my-app/users/ada?sort=name#details');
        assert.equal(router.href('/users/%E4%B8%AD?q=a%20b#details'), '/my-app/users/%E4%B8%AD?q=a%20b#details');
        assert.equal(router.href('/users/中?q=hello world#详细'), '/my-app/users/%E4%B8%AD?q=hello%20world#%E8%AF%A6%E7%BB%86');
        for (const root of ['/my-app', '/my-app/'])
            assert.equal(router.match(root).path, '/');
        assert.deepEqual(router.match('/my-app/users/ada?sort=name#details'), {
            path: '/users/ada', params: { username: 'ada' }, component: 'user-page',
        });
        assert.equal(router.match('http://localhost/my-app/users/%E4%B8%AD').params.username, '中');
        for (const outside of ['/users/ada', '/my-app-other/users/ada', '/my-application',
            'https://other.test/my-app/users/ada'])
            assert.equal(router.match(outside), null, outside);
        assert.equal(router.match('/my-app/users/%E0%A4'), null);
        assert.equal(router.match('/my-app/missing'), null);
        assert.throws(() => router.href('/../outside'), /escape/);
    }
    const root = createRouter(routes);
    assert.equal(root.base, '/');
    assert.equal(root.href('/users/ada?sort=name#details'), '/users/ada?sort=name#details');
    assert.equal(root.match('/users/ada').path, '/users/ada');
    const unicode = createRouter(routes, { base: '/应用' });
    assert.equal(unicode.base, '/%E5%BA%94%E7%94%A8/');
    assert.equal(unicode.match(unicode.href('/users/ada')).path, '/users/ada');
    for (const base of ['', 'my-app', 'https://example.test/my-app', '//example.test/my-app',
        '/my-app?x=1', '/my-app#x', '/a/../b', '/a/%2e%2e/b', '/a//b', '/a\\b', '/a b']) {
        assert.throws(() => createRouter(routes, { base }), /Router base/, base);
    }
    for (const path of ['users/ada', 'https://example.test/users/ada', '//example.test/users/ada', '/a\\b']) {
        assert.throws(() => root.href(path), /application paths/, path);
        assert.throws(() => root.navigate(path), /application paths/, path);
    }
    for (const path of ['//host/path', '/a/../b', '/a\\b'])
        assert.throws(() => createRouter([{ path, component: 'a-page' }]), /Route path/);
});

for (const core of ['brio.min.js', 'brio.dev.min.js']) {
    function environment(t, url = 'https://brio.test/my-app/users/ada?sort=name#details') {
        const dom = new JSDOM('<main></main><aside></aside>', { url, runScripts: 'outside-only' });
        t.after(() => dom.window.close());
        const { window } = dom;
        window.eval(readFileSync(new URL(`../dist/${core}`, import.meta.url), 'utf8'));
        window.eval(readFileSync(new URL('../dist/brio.router.min.js', import.meta.url), 'utf8'));
        const router = window.brio.createRouter(window.JSON.parse(JSON.stringify(routes)), { base: '/my-app' });
        return { window, router, root: window.document.querySelector('main') };
    }

    test(`${core}: direct loading, app navigation and real back/forward use the base exactly once`, async t => {
        const { window, router, root } = environment(t);
        const stop = router.start(root);
        assert.equal(router.current.value.path, '/users/ada');
        assert.equal(router.navigate('/users/grace?sort=date#bio'), true);
        assert.equal(window.location.pathname, '/my-app/users/grace');
        assert.equal(window.location.search, '?sort=date');
        assert.equal(window.location.hash, '#bio');
        assert.equal(router.current.value.path, '/users/grace');
        const pop = () => new Promise(resolve => window.addEventListener('popstate', resolve, { once: true }));
        let popped = pop();
        window.history.back();
        await popped;
        assert.equal(router.current.value.params.username, 'ada');
        assert.equal(window.location.search, '?sort=name');
        popped = pop();
        window.history.forward();
        await popped;
        assert.equal(router.current.value.params.username, 'grace');
        const length = window.history.length;
        assert.equal(router.navigate('/', { replace: true }), true);
        assert.equal(window.history.length, length);
        assert.equal(window.location.pathname, '/my-app/');
        assert.equal(router.current.value.path, '/');
        assert.equal(router.navigate('/missing'), false);
        assert.equal(window.location.pathname, '/my-app/');
        window.history.replaceState(null, '', '/my-app-other/users/ada');
        window.dispatchEvent(new window.PopStateEvent('popstate'));
        assert.equal(router.current.value, null);
        stop();
        window.history.replaceState(null, '', '/my-app/users/stopped');
        window.dispatchEvent(new window.PopStateEvent('popstate'));
        assert.equal(router.current.value, null);
    });

    test(`${core}: interception consumes browser URLs rather than applying the base again`, t => {
        const { window, router, root } = environment(t);
        const second = window.document.querySelector('aside');
        const stop = router.start(root);
        const stopSecond = router.start(second);
        t.after(stop);
        t.after(stopSecond);
        const click = (href, options = {}, parent = root, attributes = {}) => {
            const anchor = window.document.createElement('a');
            anchor.href = href;
            for (const [key, value] of Object.entries(attributes)) anchor.setAttribute(key, value);
            anchor.innerHTML = '<span>Navigate</span>';
            parent.append(anchor);
            const event = new window.MouseEvent('click', { bubbles: true, cancelable: true, ...options });
            // Suppress jsdom's unimplemented default navigation after recording interception.
            let intercepted;
            window.document.addEventListener('click', event => {
                intercepted = event.defaultPrevented;
                event.preventDefault();
            }, { once: true });
            anchor.firstChild.dispatchEvent(event);
            return intercepted;
        };
        assert.equal(click(router.href('/users/grace?sort=date#bio')), true);
        assert.equal(window.location.pathname, '/my-app/users/grace');
        assert.equal(window.location.search + window.location.hash, '?sort=date#bio');
        assert.equal(router.current.value.path, '/users/grace');
        assert.equal(click('/my-app/users/grace?sort=other#bio'), true);
        assert.equal(window.location.search, '?sort=other');
        assert.equal(click('/my-app/users/grace?sort=other#section'), false);
        for (const href of ['/users/ada', '/my-app-other/users/ada', '/my-app/missing',
            'https://other.test/my-app/users/ada'])
            assert.equal(click(href), false, href);
        for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }])
            assert.equal(click('/my-app/users/ada', options), false);
        assert.equal(click('/my-app/users/ada', {}, root, { download: '' }), false);
        assert.equal(click('/my-app/users/ada', {}, root, { target: '_blank' }), false);
        const outside = window.document.createElement('footer');
        window.document.body.append(outside);
        assert.equal(click('/my-app/users/ada', {}, outside), false);
        stop();
        assert.equal(click('/my-app/users/ada'), false);
        assert.equal(click('/my-app/users/ada', {}, second), true);
        stopSecond();
        assert.equal(click('/my-app/users/grace', {}, second), false);
    });

    test(`${core}: direct loading outside the base never claims a route`, t => {
        const { router, root } = environment(t, 'https://brio.test/my-app-other/users/ada');
        const stop = router.start(root);
        assert.equal(router.current.value, null);
        stop();
    });

    test(`${core}: shipped router page demonstrates base-aware anchors, API navigation and deep loads`, t => {
        const markup = readFileSync(new URL('./methods/route.html', import.meta.url), 'utf8');
        const setup = /<script type="module">([\s\S]*?)<\/script>/.exec(markup)[1]
            .replace(/import .*? from '.*?';/g, '');
        for (const path of ['/tests/methods/route.html', '/my-app/users/grace?sort=date#details']) {
            const dom = new JSDOM(markup, { url: `https://brio.test${path}`, runScripts: 'outside-only' });
            const { window } = dom;
            t.after(() => {
                window.dispatchEvent(new window.PageTransitionEvent('pagehide'));
                window.close();
            });
            window.eval(readFileSync(new URL(`../dist/${core}`, import.meta.url), 'utf8'));
            window.eval(readFileSync(new URL('../dist/brio.router.min.js', import.meta.url), 'utf8'));
            window.eval(`const {createApp, effect, createRouter} = brio; ${setup}`);
            const text = id => window.document.getElementById(id).textContent;
            assert.equal(text('base'), '/my-app/');
            assert.equal(text('current-path'), path.includes('grace') ? '/users/grace' : '/');
            if (path.includes('grace')) assert.equal(text('username'), 'grace');
            assert.match(text('boundary-match'), / -> null$/);
            assert.match(text('outside-match'), / -> null$/);
            assert.equal(window.document.getElementById('generated-link').getAttribute('href'),
                '/my-app/users/grace?sort=date#details');
            window.document.getElementById('link-ada').click();
            assert.equal(text('current-path'), '/users/ada');
            assert.equal(text('username'), 'ada');
            assert.equal(text('browser-url'), '/my-app/users/ada?sort=name#details');
            const length = window.history.length;
            window.document.getElementById('btn-replace').click();
            assert.equal(window.history.length, length);
            assert.equal(text('current-path'), '/about');
            window.document.getElementById('btn-unmatched').click();
            assert.match(text('navigation-result'), /returned false/);
            assert.equal(text('current-path'), '/about');
        }
    });
}
