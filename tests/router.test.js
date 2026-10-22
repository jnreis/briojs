import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { createRouter } from '@jnreis/briojs/router';

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
            path: '/users/ada', params: { username: 'ada' }, query: { sort: 'name' }, hash: '#details',
            fullPath: '/users/ada?sort=name#details', component: 'user-page',
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

for (const core of ['brio.min.js', 'brio.dev.min.js']) {
    function routedApp(t, url, routeList, options = {}, markup = '<nav><a id="link"></a></nav><div b-router-outlet></div><p id="status" b-text="$route.matched ? $route.fullPath : \'none\'"></p>') {
        const dom = new JSDOM(`<main id="app">${markup}</main>`, { url, runScripts: 'outside-only' });
        t.after(() => dom.window.close());
        const { window } = dom;
        window.eval(readFileSync(new URL(`../dist/${core}`, import.meta.url), 'utf8'));
        window.eval(readFileSync(new URL('../dist/brio.router.min.js', import.meta.url), 'utf8'));
        const router = window.brio.createRouter(routeList(window), options);
        const app = window.brio.createApp({ router });
        const mounts = [];
        const page = (name, template) => app.component(name, {
            template,
            setup({ route }) {
                mounts.push(name);
                return Object.assign(window.eval('({})'), { route });
            },
        });
        const text = selector => window.document.querySelector(selector)?.textContent;
        return { window, router, app, page, mounts, text, start: () => app.mount('#app') };
    }
    const click = (window, href) => {
        const anchor = window.document.getElementById('link');
        anchor.setAttribute('href', href);
        let prevented;
        window.document.addEventListener('click', event => {
            prevented = event.defaultPrevented;
            event.preventDefault();
        }, { once: true });
        anchor.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
        return prevented;
    };

    test(`${core}: query and hash are part of the match; $route and setup route are reactive; the outlet keeps the page on query-only changes`, t => {
        const { window, router, page, mounts, text, start } = routedApp(t, 'https://brio.test/app/users/ada?tab=posts#top',
            () => [{ path: '/users/:name', component: 'user-page' }, { path: '/', component: 'home-page' }], { base: '/app' });
        page('user-page', '<h1 b-text="$route.params.name + \':\' + ($data.route.query.tab ?? \'-\') + $route.hash"></h1><input id="draft">');
        page('home-page', '<h1>home</h1>');
        start();
        assert.deepEqual(JSON.parse(JSON.stringify(router.current.value)), {
            path: '/users/ada', params: { name: 'ada' }, query: { tab: 'posts' }, hash: '#top',
            fullPath: '/users/ada?tab=posts#top', component: 'user-page',
        });
        assert.equal(text('h1'), 'ada:posts#top');
        assert.equal(text('#status'), '/users/ada?tab=posts#top');
        window.document.getElementById('draft').value = 'kept';
        const params = router.route.params;
        router.navigate('/users/ada?tab=favorites');
        assert.equal(text('h1'), 'ada:favorites');
        assert.equal(router.route.params, params, 'unchanged params keep their identity so readers do not re-run');
        assert.equal(window.document.getElementById('draft').value, 'kept', 'query-only navigation keeps the mounted page');
        assert.equal(click(window, '/app/users/ada?tab=posts&tab=last'), true);
        assert.equal(text('h1'), 'ada:last', 'a repeated query key keeps its last value');
        assert.deepEqual(mounts, ['user-page']);
        router.navigate('/users/grace');
        assert.equal(text('h1'), 'grace:-');
        assert.equal(window.document.getElementById('draft').value, '', 'a different path remounts the page');
        router.navigate('/');
        assert.deepEqual(mounts, ['user-page', 'user-page', 'home-page']);
        assert.equal(router.route.matched, true);
        assert.deepEqual({ ...router.route.query }, {});
    });

    test(`${core}: the outlet does not track reads made during page setup`, t => {
        const { window, app, text, start } = routedApp(t, 'https://brio.test/', () => [{ path: '/', component: 'home-page' }]);
        const flag = window.brio.signal(1);
        let setups = 0;
        app.component('home-page', {
            template: '<b b-text="$data.initial"></b>',
            setup() {
                setups++;
                return Object.assign(window.eval('({})'), { initial: flag.value });
            },
        });
        start();
        assert.equal(text('b'), '1');
        flag.value = 2;
        assert.equal(setups, 1, 'a signal read synchronously in setup does not remount the page');
        assert.equal(text('b'), '1');
    });

    test(`${core}: reactive guards block, redirect, and re-check when their data changes`, t => {
        let session;
        const { window, router, page, text, start, mounts } = routedApp(t, 'https://brio.test/settings',
            window => {
                session = window.brio.state(window.eval('({ user: null, locked: false })'));
                return [
                    { path: '/', component: 'home-page' },
                    { path: '/login', component: 'login-page' },
                    { path: '/settings', component: 'settings-page',
                        guard: to => session.user ? true : `/login?redirect=${encodeURIComponent(to.fullPath)}` },
                    { path: '/old-settings', redirect: '/settings' },
                    { path: '/legacy/:id', redirect: to => `/item/${to.params.id}` },
                    { path: '/item/:id', component: 'home-page' },
                    { path: '/loop', redirect: '/loop-back' },
                    { path: '/loop-back', redirect: '/loop' },
                ];
            }, { guard: () => !session.locked });
        page('home-page', '<b>home</b>');
        page('login-page', '<b>login</b>');
        page('settings-page', '<b>settings</b>');
        start();
        assert.equal(window.location.pathname + window.location.search, '/login?redirect=%2Fsettings', 'a deep link to a guarded page redirects');
        assert.equal(text('b'), 'login');
        const length = window.history.length;
        session.user = 'ada';
        assert.equal(router.navigate('/settings'), true);
        assert.equal(text('b'), 'settings');
        session.user = null;
        assert.equal(window.location.pathname + window.location.search, '/login?redirect=%2Fsettings', 'signing out re-runs the guard');
        assert.equal(window.history.length, length + 1, 'guard redirects replace the guarded entry');
        assert.equal(router.navigate('/old-settings'), true);
        assert.equal(window.location.search, '?redirect=%2Fsettings', 'redirect routes chain into guards');
        assert.equal(router.navigate('/legacy/9'), true);
        assert.equal(window.location.pathname, '/item/9');
        session.locked = true;
        assert.equal(text('#status'), 'none', 'a global guard returning false on the current page shows nothing');
        assert.equal(router.navigate('/'), false, 'false blocks navigation');
        assert.equal(window.location.pathname, '/item/9');
        session.locked = false;
        assert.throws(() => router.navigate('/loop'), /redirected more than 10 times/);
        assert.equal(mounts.filter(name => name === 'settings-page').length, 1);
    });

    test(`${core}: "*" catches every other in-base path and intercepts its links; without it unmatched links fall through`, t => {
        const { window, router, page, text, start } = routedApp(t, 'https://brio.test/app/nowhere',
            () => [{ path: '/', component: 'home-page' }, { path: '*', component: 'missing-page' }], { base: '/app' });
        page('home-page', '<b>home</b>');
        page('missing-page', '<b b-text="\'missing \' + $route.path"></b>');
        start();
        assert.equal(text('b'), 'missing /nowhere');
        assert.equal(click(window, '/app/also/missing'), true);
        assert.equal(text('b'), 'missing /also/missing');
        assert.equal(click(window, '/elsewhere'), false, 'outside the base still belongs to the server');
        assert.equal(router.match('/app/x').component, 'missing-page');
        assert.throws(() => window.brio.createRouter([{ path: '*', component: 'a-b' }, { path: '*', component: 'c-d' }]), /Duplicate/);
        assert.throws(() => window.brio.createRouter([{ path: '/x', component: '' }]), /non-empty component name/);
    });

    test(`${core}: a route without a component matches, updates $route, and leaves the outlet empty`, t => {
        const { window, router, page, text, start } = routedApp(t, 'https://brio.test/board',
            () => [{ path: '/board' }, { path: '/board/card/:id', component: 'card-page' }]);
        page('card-page', '<b b-text="\'card \' + $route.params.id"></b>');
        start();
        const outlet = window.document.querySelector('nav').nextElementSibling;
        assert.equal(outlet.children.length, 0);
        assert.equal(router.match('/board').component, '');
        assert.equal(click(window, '/board/card/7'), true);
        assert.equal(text('b'), 'card 7');
        assert.equal(click(window, '/board'), true, 'component-less routes intercept links too');
        assert.equal(outlet.children.length, 0, 'leaving the component route clears the outlet');
    });

    test(`${core}: hash mode routes through the fragment and leaves in-page anchors alone`, async t => {
        const { window, router, page, text, start } = routedApp(t, 'https://brio.test/docs/index.html#/users/ada?tab=1',
            () => [{ path: '/', component: 'home-page' }, { path: '/users/:name', component: 'user-page' }], { mode: 'hash' });
        page('home-page', '<b>home</b>');
        page('user-page', '<b b-text="$route.params.name + $route.query.tab"></b>');
        start();
        assert.equal(router.mode, 'hash');
        assert.equal(text('b'), 'ada1');
        assert.equal(router.href('/users/grace?tab=2'), '#/users/grace?tab=2');
        assert.equal(router.match('#/users/zed').params.name, 'zed');
        assert.equal(router.match('/users/zed').params.name, 'zed');
        assert.equal(click(window, '#/users/grace?tab=2'), true);
        assert.equal(window.location.pathname + window.location.hash, '/docs/index.html#/users/grace?tab=2');
        assert.equal(text('b'), 'grace2');
        router.navigate('/');
        assert.equal(window.location.hash, '#/');
        assert.equal(text('b'), 'home');
        assert.equal(click(window, '#section'), false, 'a plain fragment is an in-page anchor');
        window.location.hash = '#section';
        await new Promise(resolve => window.addEventListener('hashchange', resolve, { once: true }));
        assert.equal(text('b'), 'home', 'the page stays mounted for in-page anchors');
        window.location.hash = '#/users/typed?tab=3';
        await new Promise(resolve => window.addEventListener('hashchange', resolve, { once: true }));
        assert.equal(text('b'), 'typed3', 'typing a route into the address bar navigates');
        assert.throws(() => window.brio.createRouter([], { mode: 'memory' }), /history" or "hash/);
    });

    test(`${core}: base + index.html loads the root route and is normalized`, t => {
        const { window, router, page, text, start } = routedApp(t, 'https://brio.test/app/index.html?ref=mail#intro',
            () => [{ path: '/', component: 'home-page' }], { base: '/app' });
        page('home-page', '<b>home</b>');
        start();
        assert.equal(text('b'), 'home');
        assert.equal(window.location.pathname + window.location.search + window.location.hash, '/app/?ref=mail#intro');
        assert.equal(router.current.value.query.ref, 'mail');
    });
}
