import assert from 'node:assert/strict';
import test from 'node:test';
import { assertStandaloneAssets, openApp, settle } from '../harness.js';

/** Opens Conduit at `path` with an instant mock server; `token` starts the page signed in. */
function open(t, start = '', { token, latency = 0, mode } = {}) {
    const page = openApp(t, 'conduit', {
        hash: start,
        before(window) {
            // jsdom has no Fetch API; the mock server builds real Response objects.
            window.Headers = Headers;
            window.Response = Response;
            window.conduitBase = '/conduit/';
            if (mode) window.conduitMode = mode;
            window.conduitLatency = latency;
            window.confirm = () => true;
            if (token) window.localStorage.setItem('conduit.token', JSON.stringify(token));
        },
    });
    const { window, $, $$, text } = page;
    const server = window.conduitServer;
    const waitFor = async (check, message = 'condition') => {
        for (let attempt = 0; attempt < 200; attempt++) {
            const value = check();
            if (value) return value;
            await new Promise(resolve => setTimeout(resolve, 2));
        }
        assert.fail(`Timed out waiting for ${message}`);
    };
    const path = () => `${window.location.pathname.replace('/conduit', '')}${window.location.search}`;
    const titles = () => $$('[data-testid="preview"] h2').map(heading => heading.textContent);
    const preview = title => $$('[data-testid="preview"]').find(element => element.querySelector('h2').textContent === title);
    const link = (label, scope = window.document) =>
        [...scope.querySelectorAll('a')].find(anchor => anchor.textContent.replace(/\s+/g, ' ').trim() === label);
    const loaded = () => waitFor(() => $$('[data-testid="preview"]').length || $('list-empty'), 'the article list');
    const navText = () => text('nav');
    const fill = (fields) => {
        for (const [id, value] of Object.entries(fields)) page.user.type($(id), value);
    };
    return { ...page, server, waitFor, path, titles, preview, link, loaded, navText, fill };
}

const newestTitles = [
    'Drop-in apps for content sites', 'Debugging effects with intent', 'Shared stores across mounts',
    'A love letter to the template element', 'Hydrating islands on demand',
];

test('optional hash routing supports static hosting without changing the history-mode default', async t => {
    const app = open(t, '#/login', { mode: 'hash' });
    await app.waitFor(() => app.window.document.querySelector('input[type="password"]'));
    assert.equal(app.window.location.hash, '#/login');
    app.user.click(app.link('Home'));
    await app.loaded();
    assert.equal(app.window.location.hash, '#/');
    assert.equal(app.$('nav-login').getAttribute('href'), '#/login');
});

test('guests see the global feed, newest first, with pages and popular tags', async t => {
    const app = open(t);
    await app.loaded();
    assert.equal(app.path(), '/');
    assert.match(app.text(app.document.querySelector('.banner')), /A place to share your knowledge/);
    assert.equal(app.titles().length, 10);
    assert.deepEqual(app.titles().slice(0, 5), newestTitles);
    assert.equal(app.$('tab-feed'), null, 'Your Feed needs an account');
    assert.ok(app.$('tab-global').classList.contains('active'));
    assert.equal(app.text('pagination'), '1 2 3');
    await app.waitFor(() => app.$('tags'), 'tags');
    assert.deepEqual([...app.$('tags').children].slice(0, 3).map(tag => tag.textContent), ['html', 'javascript', 'reactivity']);
    assert.equal(app.navText(), 'Home Sign in Sign up');
    assert.equal(app.document.querySelector('nav a[aria-current="page"]').textContent, 'Home');

    const first = app.preview('Drop-in apps for content sites');
    assert.match(app.text(first), /ada March 23, 2026/);
    assert.equal(app.text(first.querySelector('[data-testid="favorites-count"]')), '1');
    assert.deepEqual([...first.querySelectorAll('.tag-list li')].map(tag => tag.textContent), ['widgets', 'html']);
    assert.equal(app.document.title, 'Conduit · Brio');
});

test('pagination lives in the URL, so back and forward restore the page', async t => {
    const app = open(t);
    await app.loaded();
    const homePage = app.$('outlet').firstElementChild;
    app.user.click(app.link('2', app.$('pagination')));
    assert.equal(app.path(), '/?page=2');
    assert.equal(app.$('outlet').firstElementChild, homePage, 'a query-only change keeps the page mounted');
    await app.waitFor(() => app.titles()[0] === 'Writing CSS for components you do not own', 'page 2');
    assert.equal(app.titles().length, 10);
    assert.equal(app.$('pagination').querySelector('[aria-current="page"]').textContent, '2');
    assert.deepEqual(app.server.log.filter(entry => entry.startsWith('GET /api/articles')).at(-1), 'GET /api/articles?limit=10&offset=10');

    app.user.click(app.link('3', app.$('pagination')));
    await app.waitFor(() => app.titles().length === 3, 'the last page');
    assert.deepEqual(app.titles(), ['The case for HTML-first apps', 'Why signals beat dirty checking', 'Designing small reactive runtimes']);

    app.window.history.back();
    await app.waitFor(() => app.path() === '/?page=2' && app.titles()[0] === 'Writing CSS for components you do not own', 'back to page 2');
    app.window.history.back();
    await app.waitFor(() => app.path() === '/' && app.titles()[0] === newestTitles[0], 'back to page 1');
    app.window.history.forward();
    await app.waitFor(() => app.titles()[0] === 'Writing CSS for components you do not own', 'forward to page 2');
    assert.equal(app.server.log.filter(entry => entry === 'GET /api/tags').length, 1, 'popular tags load once across pages');
});

test('a popular tag filters the feed in its own tab', async t => {
    const app = open(t);
    await app.loaded();
    await app.waitFor(() => app.$('tags'), 'tags');
    app.user.click(app.link('performance', app.$('tags')));
    assert.equal(app.path(), '/?tag=performance');
    await app.waitFor(() => app.titles().length === 4, 'tagged articles');
    assert.equal(app.text('tab-tag'), '# performance');
    assert.ok(app.$('tab-tag').classList.contains('active'));
    assert.ok(!app.$('tab-global').classList.contains('active'));
    for (const element of app.$$('[data-testid="preview"]')) assert.match(app.text(element.querySelector('.tag-list')), /performance/);
    assert.equal(app.$('pagination'), null, 'one page needs no pagination');

    app.user.click(app.$('tab-global'));
    await app.waitFor(() => app.titles().length === 10, 'the global feed');
    assert.equal(app.$('tab-tag'), null);
});

test('sign in validates, reports server errors, and returns to the home feed', async t => {
    const app = open(t);
    await app.loaded();
    app.user.click(app.$('nav-login'));
    assert.equal(app.path(), '/login');
    await app.waitFor(() => app.$('auth-form'), 'the sign-in form');
    assert.equal(app.text(app.document.querySelector('.auth-col h1')), 'Sign in');
    assert.equal(app.$('username'), null, 'sign in has no username');

    app.user.click(app.$('submit'));
    assert.deepEqual(app.$$('[data-testid="errors"] li').map(item => item.textContent),
        ["email can't be blank", 'email is invalid', "password can't be blank"]);
    assert.equal(app.server.log.length, 2, 'invalid forms are not sent');

    app.fill({ email: 'ada@conduit.test', password: 'wrong-password' });
    app.user.click(app.$('submit'));
    assert.equal(app.$('email').closest('fieldset').disabled, true, 'the form is locked while submitting');
    await app.waitFor(() => app.text('errors') === 'email or password is invalid', 'the server error');
    assert.equal(app.$('email').closest('fieldset').disabled, false);
    assert.equal(app.window.localStorage.getItem('conduit.token'), '""');

    app.user.type(app.$('password'), 'password123');
    app.user.click(app.$('submit'));
    await app.waitFor(() => app.path() === '/' && app.$('tab-feed'), 'the signed-in home page');
    assert.equal(app.navText(), 'Home ✎ New Article ⚙ Settings ada');
    assert.equal(app.window.localStorage.getItem('conduit.token'), '"jwt.ada"');
    assert.equal(app.document.querySelector('.banner'), null, 'members skip the banner');
    assert.equal(app.window.history.length, 2, 'login was replaced by home');
});

test('sign up reports taken usernames and signs the new member in', async t => {
    const app = open(t, 'register');
    await app.waitFor(() => app.$('auth-form'), 'the sign-up form');
    assert.equal(app.text(app.document.querySelector('.auth-col h1')), 'Sign up');
    assert.equal(app.text('auth-switch'), 'Have an account?');

    app.fill({ username: 'grace', email: 'new@conduit.test', password: 'short' });
    app.user.click(app.$('submit'));
    assert.deepEqual(app.$$('[data-testid="errors"] li').map(item => item.textContent), ['password is too short (minimum is 8 characters)']);

    app.user.type(app.$('password'), 'long-enough');
    app.user.click(app.$('submit'));
    await app.waitFor(() => app.text('errors') === 'username has already been taken', 'the 422 error');

    app.user.type(app.$('username'), 'hopper');
    app.user.click(app.$('submit'));
    await app.waitFor(() => app.navText()?.endsWith('hopper'), 'the new member');
    assert.ok(app.server.users.has('hopper'));
});

test('members-only pages send guests to sign in and back again', async t => {
    const app = open(t, 'settings');
    await app.waitFor(() => app.path() === '/login?redirect=%2Fsettings', 'the redirect');
    assert.equal(app.window.history.length, 1, 'the guarded page is replaced, so back does not loop');
    await app.waitFor(() => app.$('auth-form'), 'the sign-in form');
    assert.equal(app.$('auth-switch').getAttribute('href'), '/conduit/register?redirect=%2Fsettings');

    app.fill({ email: 'grace@conduit.test', password: 'password123' });
    app.user.click(app.$('submit'));
    await app.waitFor(() => app.path() === '/settings' && app.$('settings-form'), 'the settings page');
    assert.equal(app.$('username').value, 'grace');
    assert.equal(app.$('email').value, 'grace@conduit.test');
    assert.equal(app.$('nav-settings').getAttribute('aria-current'), 'page');
});

test('an open redirect is ignored after sign in', async t => {
    const app = open(t, 'login?redirect=//evil.example/steal');
    await app.waitFor(() => app.$('auth-form'), 'the sign-in form');
    app.fill({ email: 'ada@conduit.test', password: 'password123' });
    app.user.click(app.$('submit'));
    await app.waitFor(() => app.$('tab-feed'), 'home');
    assert.equal(app.window.location.href, 'https://apps.brio.test/conduit/');
});

test('a stored session is restored, and Your Feed shows followed authors', async t => {
    const app = open(t, '?feed=you', { token: 'jwt.ada' });
    assert.equal(app.text(app.document.querySelector('.nav li.muted')), 'Signing in…');
    await app.waitFor(() => app.navText()?.endsWith('ada'), 'the restored session');
    await app.waitFor(() => app.$('tab-feed')?.classList.contains('active') && app.titles().length, 'the personal feed');
    const authors = app.$$('[data-testid="preview"] .author').map(element => element.textContent);
    assert.equal(authors.length, 6);
    assert.deepEqual([...new Set(authors)], ['grace']);
    assert.ok(app.server.log.includes('GET /api/articles/feed?limit=10&offset=0'));
});

test('an expired stored token signs the visitor out quietly', async t => {
    const app = open(t, '', { token: 'jwt.nobody' });
    await app.waitFor(() => app.$('nav-login'), 'the guest nav');
    assert.equal(app.window.localStorage.getItem('conduit.token'), '""');
    await app.loaded();
});

test('favorites update optimistically and stay in sync between the list and the article', async t => {
    const app = open(t, '', { token: 'jwt.ada', latency: 5 });
    await app.loaded();
    await app.waitFor(() => app.navText()?.endsWith('ada'), 'the session');
    const card = app.preview('Debugging effects with intent');
    const button = card.querySelector('[data-testid="favorite"]');
    assert.equal(button.getAttribute('aria-pressed'), 'false');
    assert.equal(app.text(button), '♥ 1');

    app.user.click(button);
    assert.equal(app.text(button), '♥ 2', 'optimistic');
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    assert.equal(button.disabled, true, 'one request at a time');
    await app.waitFor(() => !button.disabled, 'the server');
    assert.ok(app.server.users.get('ada').favorites.has('debugging-effects-with-intent'));

    app.user.click(card.querySelector('[data-testid="preview-link"]'));
    assert.equal(app.path(), '/article/debugging-effects-with-intent');
    assert.equal(app.text('article-title'), 'Debugging effects with intent', 'the cached preview renders immediately');
    const buttons = () => app.$$('.article-page [data-testid="favorite"]');
    assert.equal(buttons().length, 2);
    assert.ok(buttons().every(element => app.text(element) === '♥ Unfavorite Article (2)'));
    await app.waitFor(() => app.$('article-body'), 'the article body');
    assert.match(app.$('article-body').innerHTML, /<h3>Debugging effects with intent<\/h3>/);
    assert.match(app.$('article-body').innerHTML, /<strong>sample<\/strong>/);

    app.user.click(buttons()[1]);
    assert.ok(buttons().every(element => app.text(element) === '♥ Favorite Article (1)'), 'both copies update');
    await app.waitFor(() => !buttons()[0].disabled, 'the server');

    app.window.history.back();
    await app.loaded();
    assert.equal(app.text(app.preview('Debugging effects with intent').querySelector('[data-testid="favorite"]')), '♥ 1');
});

test('a failed favorite rolls back and explains why', async t => {
    const app = open(t, '', { token: 'jwt.ada' });
    await app.loaded();
    await app.waitFor(() => app.navText()?.endsWith('ada'), 'the session');
    const button = app.preview('Debugging effects with intent').querySelector('[data-testid="favorite"]');
    app.server.failNext = 500;
    app.user.click(button);
    assert.equal(app.text(button), '♥ 2');
    await app.waitFor(() => app.$('notice'), 'the notice');
    assert.equal(app.text(button), '♥ 1');
    assert.match(app.text('notice'), /server is having a bad day/);
    app.user.click(app.$('notice').querySelector('button'));
    assert.equal(app.$('notice'), null);
});

test('guests who favorite are asked to sign in first', async t => {
    const app = open(t, '?tag=css');
    await app.loaded();
    app.user.click(app.$('favorite'));
    assert.equal(app.path(), '/login?redirect=%2F%3Ftag%3Dcss');
    assert.equal(app.server.log.some(entry => entry.includes('/favorite')), false);
});

test('a 401 mid-session signs the member out with a notice', async t => {
    const app = open(t, '', { token: 'jwt.ada' });
    await app.loaded();
    await app.waitFor(() => app.navText()?.endsWith('ada'), 'the session');
    app.server.failNext = 401;
    app.user.click(app.$('favorite'));
    await app.waitFor(() => app.$('nav-login'), 'the guest nav');
    assert.match(app.text('notice'), /Your session has expired/);
    assert.equal(app.window.localStorage.getItem('conduit.token'), '""');
});

test('following an author updates every follow button and the profile', async t => {
    const app = open(t, 'article/keyed-lists-without-a-virtual-dom', { token: 'jwt.ada' });
    await app.waitFor(() => app.$('article-body') && app.navText()?.endsWith('ada'), 'the article');
    const follows = () => app.$$('[data-testid="follow"]');
    assert.equal(follows().length, 2);
    assert.ok(follows().every(button => app.text(button) === '+ Follow linus'));

    app.user.click(follows()[0]);
    assert.ok(follows().every(button => app.text(button) === '✓ Unfollow linus'));
    await app.waitFor(() => !follows()[0].disabled, 'the server');
    assert.ok(app.server.users.get('ada').following.has('linus'));

    app.user.click(app.document.querySelector('.banner .author'));
    assert.equal(app.path(), '/profile/linus');
    await app.waitFor(() => app.text('profile-name') === 'linus', 'the profile');
    assert.equal(app.text('follow'), '✓ Unfollow linus');
    assert.equal(app.text('profile-bio'), 'Kernels and version control. Mostly patches.');
    await app.loaded();
    assert.ok(app.titles().every(Boolean));
    assert.ok(app.$$('[data-testid="preview"] .author').every(element => element.textContent === 'linus'));

    app.user.click(app.$('tab-favorites'));
    assert.equal(app.path(), '/profile/linus/favorites');
    await app.waitFor(() => app.titles().length === 3, 'linus favorites');
    assert.ok(app.$('tab-favorites').classList.contains('active'));
});

test('members comment, see validation, and delete their own comments', async t => {
    const app = open(t, 'article/drop-in-apps-for-content-sites', { token: 'jwt.margaret' });
    await app.waitFor(() => app.$$('[data-testid="comment"]').length === 2 && app.$('comment-form'), 'comments');
    assert.equal(app.$('delete-comment'), null, 'others’ comments cannot be deleted');

    app.user.click(app.$('post-comment'));
    assert.equal(app.text('errors'), "body can't be blank");

    app.user.type(app.$('comment-input'), 'We do this on our marketing site too!');
    app.user.click(app.$('post-comment'));
    await app.waitFor(() => app.$$('[data-testid="comment"]').length === 3, 'the new comment');
    const [mine] = app.$$('[data-testid="comment"]');
    assert.match(app.text(mine), /^We do this on our marketing site too! margaret/);
    assert.equal(app.$('comment-input').value, '');
    assert.equal(app.$('errors'), null);

    app.user.click(mine.querySelector('[data-testid="delete-comment"]'));
    assert.equal(app.$$('[data-testid="comment"]').length, 2);
    await app.waitFor(() => app.server.comments.get('drop-in-apps-for-content-sites').length === 2, 'the deletion');
});

test('guests read comments and are invited to sign in', async t => {
    const app = open(t, 'article/drop-in-apps-for-content-sites');
    await app.waitFor(() => app.$$('[data-testid="comment"]').length === 2, 'comments');
    assert.equal(app.$('comment-form'), null);
    assert.equal(app.link('Sign in', app.$('comment-signin')).getAttribute('href'),
        '/conduit/login?redirect=%2Farticle%2Fdrop-in-apps-for-content-sites');
    assert.equal(app.$$('[data-testid="follow"]').length, 2, 'guests see follow buttons that lead to sign in');
});

test('authors write, edit, and delete articles', async t => {
    const app = open(t, '', { token: 'jwt.ada' });
    await app.waitFor(() => app.$('nav-editor'), 'the member nav');
    app.user.click(app.$('nav-editor'));
    await app.waitFor(() => app.$('editor-form'), 'the editor');

    app.user.click(app.$('publish'));
    assert.deepEqual(app.$$('[data-testid="errors"] li').map(item => item.textContent),
        ["title can't be blank", "description can't be blank", "body can't be blank"]);

    app.fill({ title: 'Brio in production', description: 'What we learned', body: '## Lessons\n\n- Keep it small\n- <script>alert(1)</script>' });
    app.user.type(app.$('tag-input'), 'Brio, Lessons');
    const enter = app.user.key('Enter', { target: app.$('tag-input') });
    assert.equal(enter.defaultPrevented, true, 'Enter adds tags instead of submitting');
    assert.equal(app.text('tag-list'), '×brio ×lessons');
    app.user.type(app.$('tag-input'), 'brio');
    app.user.key('Enter', { target: app.$('tag-input') });
    assert.equal(app.text('tag-list'), '×brio ×lessons', 'no duplicate tags');
    app.user.click(app.$('tag-list').querySelector('button[aria-label="Remove tag lessons"]'));
    assert.equal(app.text('tag-list'), '×brio');

    app.user.click(app.$('publish'));
    await app.waitFor(() => app.path() === '/article/brio-in-production' && app.$('article-body'), 'the new article');
    assert.equal(app.text('article-title'), 'Brio in production');
    assert.equal(app.$('article-body').innerHTML,
        '<h3>Lessons</h3><ul><li>Keep it small</li><li>&lt;script&gt;alert(1)&lt;/script&gt;</li></ul>', 'Markdown is escaped');
    assert.equal(app.text('article-tags'), 'brio');
    assert.equal(app.$$('[data-testid="edit-article"]').length, 2);
    assert.equal(app.$('favorite'), null, 'authors manage rather than favorite their own article');

    app.user.click(app.$('edit-article'));
    assert.equal(app.path(), '/editor/brio-in-production');
    await app.waitFor(() => app.$('title')?.value === 'Brio in production', 'the loaded draft');
    assert.equal(app.text('publish'), 'Update Article');
    assert.equal(app.text('tag-list'), '×brio');
    app.user.type(app.$('title'), 'Brio in production, a year later');
    app.user.click(app.$('publish'));
    await app.waitFor(() => app.path() === '/article/brio-in-production-a-year-later' && app.$('article-body'), 'the renamed article');
    assert.equal(app.text('article-title'), 'Brio in production, a year later');
    assert.equal(app.window.conduitApp.cache.articles['brio-in-production'], undefined, 'the stale slug is forgotten');

    app.user.click(app.$('delete-article'));
    await app.waitFor(() => app.path() === '/' && app.titles().length, 'the home feed');
    assert.ok(!app.titles().some(title => title.startsWith('Brio in production')));
    assert.equal(app.server.articles.has('brio-in-production-a-year-later'), false);
});

test('only the author can open the editor for an article', async t => {
    const app = open(t, 'editor/routing-is-just-state', { token: 'jwt.grace' });
    await app.waitFor(() => app.$('editor-forbidden'), 'the forbidden message');
    assert.equal(app.$('editor-form'), null);
});

test('settings update the profile, and logout returns to the public site', async t => {
    const app = open(t, 'settings', { token: 'jwt.grace' });
    await app.waitFor(() => app.$('username')?.value === 'grace', 'the settings form');
    app.user.type(app.$('bio'), 'Admiral, compiler pioneer.');
    app.user.type(app.$('email'), 'not-an-email');
    app.user.click(app.$('submit'));
    assert.equal(app.text('errors'), 'email is invalid');

    app.user.type(app.$('email'), 'grace@conduit.test');
    app.user.click(app.$('submit'));
    await app.waitFor(() => app.path() === '/profile/grace' && app.text('profile-bio') === 'Admiral, compiler pioneer.', 'the profile');
    assert.equal(app.$('edit-profile').getAttribute('href'), '/conduit/settings');
    assert.equal(app.$('follow'), null, 'you cannot follow yourself');

    app.user.click(app.$('edit-profile'));
    await app.waitFor(() => app.$('logout'), 'settings');
    app.user.click(app.$('logout'));
    assert.equal(app.path(), '/');
    assert.equal(app.navText(), 'Home Sign in Sign up');
    assert.equal(app.window.localStorage.getItem('conduit.token'), '""');
    await app.loaded();
});

test('signing out in another tab signs this one out too', async t => {
    const app = open(t, 'settings', { token: 'jwt.ada' });
    await app.waitFor(() => app.$('username')?.value === 'ada', 'the settings form');
    app.window.localStorage.setItem('conduit.token', '""');
    app.window.dispatchEvent(new app.window.StorageEvent('storage', {
        key: 'conduit.token', newValue: '""', storageArea: app.window.localStorage,
    }));
    await app.waitFor(() => app.path() === '/login?redirect=%2Fsettings', 'the sign-in redirect');
    assert.equal(app.navText(), 'Home Sign in Sign up');
});

test('unknown pages, articles, and profiles explain themselves', async t => {
    const missingRoute = open(t, 'nowhere/at/all');
    await settle();
    assert.match(missingRoute.text('no-route'), /We couldn't find that page/);
    assert.equal(missingRoute.$('outlet').firstElementChild.localName, 'not-found-page');

    const missingArticle = open(t, 'article/not-a-real-article');
    await missingArticle.waitFor(() => missingArticle.$('article-missing'), 'the missing article');

    const missingProfile = open(t, 'profile/nobody');
    await missingProfile.waitFor(() => missingProfile.$('profile-missing'), 'the missing profile');
});

test('a failed list request can be retried', async t => {
    const app = open(t);
    app.server.failNext = { status: 0, path: '/api/articles' };
    await app.waitFor(() => app.$('list-error'), 'the error');
    assert.match(app.text('list-error'), /network is unreachable/);
    app.user.click(app.$('list-error').querySelector('button'));
    await app.loaded();
    assert.equal(app.titles().length, 10);
});

test('the page works opened from a static server at index.html', async t => {
    const app = open(t, 'index.html');
    assert.equal(app.window.location.pathname, '/conduit/');
    await app.loaded();
});

test('conduit loads only files that exist', () => {
    assertStandaloneAssets('conduit');
});
