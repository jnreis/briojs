/**
 * An in-memory RealWorld (Conduit) backend behind `fetch`, following the public API spec:
 * https://realworld-docs.netlify.app/specifications/backend/endpoints/
 * Only `/api/*` requests are handled; anything else goes to the original fetch.
 */
window.createConduitServer = function createConduitServer({ latency = 250, now = () => Date.now() } = {}) {
    const day = 86_400_000;
    const start = Date.UTC(2026, 2, 1, 9, 30);
    const slugify = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'article';

    const users = new Map();
    const addUser = (username, email, bio, password = 'password123') =>
        users.set(username, { username, email, bio, image: null, password, following: new Set(), favorites: new Set() });
    addUser('ada', 'ada@conduit.test', 'Writes about engines, notes, and the poetry of computation.');
    addUser('grace', 'grace@conduit.test', 'Compilers, COBOL, and nanoseconds you can hold in your hand.');
    addUser('linus', 'linus@conduit.test', 'Kernels and version control. Mostly patches.');
    addUser('margaret', 'margaret@conduit.test', 'Software engineering, before it had a name.');

    const topics = [
        ['Designing small reactive runtimes', ['javascript', 'reactivity'], 'ada'],
        ['Why signals beat dirty checking', ['javascript', 'performance'], 'grace'],
        ['The case for HTML-first apps', ['html', 'architecture'], 'margaret'],
        ['Keyed lists without a virtual DOM', ['javascript', 'performance'], 'linus'],
        ['Routing is just state', ['architecture', 'routing'], 'ada'],
        ['Shipping widgets into legacy pages', ['html', 'widgets'], 'margaret'],
        ['A field guide to fetch errors', ['javascript', 'http'], 'grace'],
        ['Accessibility checklists that stick', ['a11y', 'html'], 'margaret'],
        ['Effects, cleanups, and other lifecycles', ['reactivity'], 'ada'],
        ['Pagination patterns that respect the back button', ['routing', 'ux'], 'linus'],
        ['Optimistic UI without regrets', ['ux', 'http'], 'grace'],
        ['Tokens, sessions, and the tab you forgot', ['security', 'http'], 'linus'],
        ['Writing CSS for components you do not own', ['css', 'widgets'], 'margaret'],
        ['Frozen data for fast dashboards', ['performance', 'reactivity'], 'ada'],
        ['Forms are state machines', ['ux', 'forms'], 'grace'],
        ['The tiny joy of view transitions', ['css', 'ux'], 'linus'],
        ['Validation messages people read', ['forms', 'a11y'], 'margaret'],
        ['Server errors are UI too', ['http', 'ux'], 'ada'],
        ['Hydrating islands on demand', ['architecture', 'performance'], 'grace'],
        ['A love letter to the template element', ['html'], 'linus'],
        ['Shared stores across mounts', ['reactivity', 'architecture'], 'margaret'],
        ['Debugging effects with intent', ['reactivity', 'javascript'], 'grace'],
        ['Drop-in apps for content sites', ['widgets', 'html'], 'ada'],
    ];
    const articles = new Map();
    topics.forEach(([title, tags, author], index) => {
        const createdAt = start + index * day;
        const slug = slugify(title);
        articles.set(slug, {
            slug, title, author, tagList: tags,
            description: `Notes on ${title.toLowerCase()}.`,
            body: `## ${title}\n\nThis is a **sample** article by ${author} about *${tags.join(' and ')}*.\n\n` +
                `Every paragraph is plain text that the app renders as Markdown.\n\n` +
                `- Point one\n- Point two\n\nUse \`code\` for inline snippets.`,
            createdAt, updatedAt: createdAt,
        });
    });
    // A few favorites so counts are realistic.
    const favoriteSeed = { ada: [2, 3, 6], grace: [0, 4, 8, 13], linus: [0, 2, 20], margaret: [1, 8, 21, 22] };
    for (const [name, indexes] of Object.entries(favoriteSeed))
        for (const index of indexes) users.get(name).favorites.add(slugify(topics[index][0]));
    users.get('ada').following.add('grace');

    const comments = new Map();
    let commentId = 1;
    const addComment = (slug, author, body, createdAt) => {
        const list = comments.get(slug) ?? [];
        list.push({ id: commentId++, body, author, createdAt, updatedAt: createdAt });
        comments.set(slug, list);
    };
    const newest = slugify(topics.at(-1)[0]);
    addComment(newest, 'grace', 'This is exactly how we embed widgets on our docs site.', start + 22 * day);
    addComment(newest, 'linus', 'Show me the bundle size and I will believe it.', start + 22 * day + 3_600_000);

    // --- Serialization -----------------------------------------------------------------------------

    const iso = time => new Date(time).toISOString();
    const profile = (username, viewer) => {
        const user = users.get(username);
        return { username, bio: user.bio, image: user.image, following: Boolean(viewer?.following.has(username)) };
    };
    const favoritesCount = slug => [...users.values()].filter(user => user.favorites.has(slug)).length;
    const articleJson = (article, viewer, withBody = true) => ({
        slug: article.slug, title: article.title, description: article.description,
        ...(withBody ? { body: article.body } : {}),
        tagList: [...article.tagList], createdAt: iso(article.createdAt), updatedAt: iso(article.updatedAt),
        favorited: Boolean(viewer?.favorites.has(article.slug)), favoritesCount: favoritesCount(article.slug),
        author: profile(article.author, viewer),
    });
    const userJson = user => ({ email: user.email, token: `jwt.${user.username}`, username: user.username, bio: user.bio, image: user.image });

    // --- HTTP plumbing -----------------------------------------------------------------------------

    class Failure extends Error {
        constructor(status, errors) {
            super(`HTTP ${status}`);
            this.status = status;
            this.errors = errors;
        }
    }
    const invalid = (field, message) => { throw new Failure(422, { [field]: [message] }); };
    const required = (value, field) => {
        if (typeof value !== 'string' || !value.trim()) invalid(field, "can't be blank");
        return value.trim();
    };

    const routes = [];
    const route = (method, pattern, handler) =>
        routes.push({ method, handler, regex: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`) });

    const viewerOf = request => {
        const header = request.headers.get('authorization') ?? '';
        if (!header) return null;
        const match = /^Token jwt\.(.+)$/.exec(header);
        const user = match && users.get(match[1]);
        if (!user) throw new Failure(401, { token: ['is invalid or expired'] });
        return user;
    };
    const authenticated = request => {
        const viewer = viewerOf(request);
        if (!viewer) throw new Failure(401, { token: ['is missing'] });
        return viewer;
    };
    const findArticle = slug => {
        const article = articles.get(slug);
        if (!article) throw new Failure(404, { article: ['not found'] });
        return article;
    };
    const findUser = username => {
        const user = users.get(username);
        if (!user) throw new Failure(404, { profile: ['not found'] });
        return user;
    };
    const page = (list, query) => {
        const limit = Math.min(Math.max(Number(query.get('limit') ?? 20) || 20, 1), 100);
        const offset = Math.max(Number(query.get('offset') ?? 0) || 0, 0);
        return { items: list.slice(offset, offset + limit), count: list.length };
    };
    const byNewest = list => [...list].sort((left, right) => right.createdAt - left.createdAt);

    // --- Endpoints ---------------------------------------------------------------------------------

    route('POST', '/api/users/login', ({ body }) => {
        const email = required(body?.user?.email, 'email');
        const password = required(body?.user?.password, 'password');
        const user = [...users.values()].find(entry => entry.email === email.toLowerCase());
        if (!user || user.password !== password) throw new Failure(401, { 'email or password': ['is invalid'] });
        return { user: userJson(user) };
    });
    route('POST', '/api/users', ({ body }) => {
        const username = required(body?.user?.username, 'username');
        const email = required(body?.user?.email, 'email').toLowerCase();
        const password = required(body?.user?.password, 'password');
        if (users.has(username)) invalid('username', 'has already been taken');
        if ([...users.values()].some(user => user.email === email)) invalid('email', 'has already been taken');
        if (password.length < 8) invalid('password', 'is too short (minimum is 8 characters)');
        addUser(username, email, '', password);
        return [201, { user: userJson(users.get(username)) }];
    });
    route('GET', '/api/user', ({ request }) => ({ user: userJson(authenticated(request)) }));
    route('PUT', '/api/user', ({ request, body }) => {
        const viewer = authenticated(request);
        const changes = body?.user ?? {};
        if ('username' in changes && changes.username !== viewer.username) {
            const username = required(changes.username, 'username');
            if (users.has(username)) invalid('username', 'has already been taken');
            users.delete(viewer.username);
            for (const article of articles.values()) if (article.author === viewer.username) article.author = username;
            for (const list of comments.values()) for (const comment of list) if (comment.author === viewer.username) comment.author = username;
            for (const user of users.values()) if (user.following.delete(viewer.username)) user.following.add(username);
            viewer.username = username;
            users.set(username, viewer);
        }
        if ('email' in changes) viewer.email = required(changes.email, 'email').toLowerCase();
        if ('bio' in changes) viewer.bio = String(changes.bio ?? '');
        if ('image' in changes) viewer.image = changes.image ? String(changes.image) : null;
        if (changes.password) {
            if (changes.password.length < 8) invalid('password', 'is too short (minimum is 8 characters)');
            viewer.password = changes.password;
        }
        return { user: userJson(viewer) };
    });

    route('GET', '/api/profiles/:username', ({ request, params }) =>
        ({ profile: profile(findUser(params.username).username, viewerOf(request)) }));
    route('POST', '/api/profiles/:username/follow', ({ request, params }) => {
        const viewer = authenticated(request);
        viewer.following.add(findUser(params.username).username);
        return { profile: profile(params.username, viewer) };
    });
    route('DELETE', '/api/profiles/:username/follow', ({ request, params }) => {
        const viewer = authenticated(request);
        viewer.following.delete(findUser(params.username).username);
        return { profile: profile(params.username, viewer) };
    });

    route('GET', '/api/articles', ({ request, query }) => {
        const viewer = viewerOf(request);
        let list = byNewest(articles.values());
        const tag = query.get('tag');
        const author = query.get('author');
        const favorited = query.get('favorited');
        if (tag) list = list.filter(article => article.tagList.includes(tag));
        if (author) list = list.filter(article => article.author === author);
        if (favorited) list = list.filter(article => users.get(favorited)?.favorites.has(article.slug));
        const { items, count } = page(list, query);
        return { articles: items.map(article => articleJson(article, viewer, false)), articlesCount: count };
    });
    route('GET', '/api/articles/feed', ({ request, query }) => {
        const viewer = authenticated(request);
        const list = byNewest(articles.values()).filter(article => viewer.following.has(article.author));
        const { items, count } = page(list, query);
        return { articles: items.map(article => articleJson(article, viewer, false)), articlesCount: count };
    });
    route('POST', '/api/articles', ({ request, body }) => {
        const viewer = authenticated(request);
        const input = body?.article ?? {};
        const title = required(input.title, 'title');
        let slug = slugify(title);
        for (let suffix = 2; articles.has(slug); suffix++) slug = `${slugify(title)}-${suffix}`;
        const time = now();
        const article = {
            slug, title, author: viewer.username, createdAt: time, updatedAt: time,
            description: required(input.description, 'description'), body: required(input.body, 'body'),
            tagList: [...new Set((input.tagList ?? []).map(tag => String(tag).trim()).filter(Boolean))],
        };
        articles.set(slug, article);
        return [201, { article: articleJson(article, viewer) }];
    });
    route('GET', '/api/articles/:slug', ({ request, params }) =>
        ({ article: articleJson(findArticle(params.slug), viewerOf(request)) }));
    route('PUT', '/api/articles/:slug', ({ request, params, body }) => {
        const viewer = authenticated(request);
        const article = findArticle(params.slug);
        if (article.author !== viewer.username) throw new Failure(403, { article: ['is not yours to edit'] });
        const input = body?.article ?? {};
        if ('title' in input) {
            article.title = required(input.title, 'title');
            const slug = slugify(article.title);
            if (slug !== article.slug && !articles.has(slug)) {
                articles.delete(article.slug);
                if (comments.has(article.slug)) {
                    comments.set(slug, comments.get(article.slug));
                    comments.delete(article.slug);
                }
                for (const user of users.values()) if (user.favorites.delete(article.slug)) user.favorites.add(slug);
                article.slug = slug;
                articles.set(slug, article);
            }
        }
        if ('description' in input) article.description = required(input.description, 'description');
        if ('body' in input) article.body = required(input.body, 'body');
        if ('tagList' in input) article.tagList = [...new Set(input.tagList.map(tag => String(tag).trim()).filter(Boolean))];
        article.updatedAt = now();
        return { article: articleJson(article, viewer) };
    });
    route('DELETE', '/api/articles/:slug', ({ request, params }) => {
        const viewer = authenticated(request);
        const article = findArticle(params.slug);
        if (article.author !== viewer.username) throw new Failure(403, { article: ['is not yours to delete'] });
        articles.delete(article.slug);
        comments.delete(article.slug);
        for (const user of users.values()) user.favorites.delete(article.slug);
        return [204];
    });
    route('POST', '/api/articles/:slug/favorite', ({ request, params }) => {
        const viewer = authenticated(request);
        viewer.favorites.add(findArticle(params.slug).slug);
        return { article: articleJson(articles.get(params.slug), viewer) };
    });
    route('DELETE', '/api/articles/:slug/favorite', ({ request, params }) => {
        const viewer = authenticated(request);
        viewer.favorites.delete(findArticle(params.slug).slug);
        return { article: articleJson(articles.get(params.slug), viewer) };
    });

    const commentJson = (comment, viewer) => ({
        id: comment.id, body: comment.body, createdAt: iso(comment.createdAt), updatedAt: iso(comment.updatedAt),
        author: profile(comment.author, viewer),
    });
    route('GET', '/api/articles/:slug/comments', ({ request, params }) => {
        const viewer = viewerOf(request);
        findArticle(params.slug);
        return { comments: (comments.get(params.slug) ?? []).map(comment => commentJson(comment, viewer)) };
    });
    route('POST', '/api/articles/:slug/comments', ({ request, params, body }) => {
        const viewer = authenticated(request);
        findArticle(params.slug);
        addComment(params.slug, viewer.username, required(body?.comment?.body, 'body'), now());
        return [201, { comment: commentJson(comments.get(params.slug).at(-1), viewer) }];
    });
    route('DELETE', '/api/articles/:slug/comments/:id', ({ request, params }) => {
        const viewer = authenticated(request);
        const list = comments.get(findArticle(params.slug).slug) ?? [];
        const index = list.findIndex(comment => comment.id === Number(params.id));
        if (index < 0) throw new Failure(404, { comment: ['not found'] });
        if (list[index].author !== viewer.username) throw new Failure(403, { comment: ['is not yours to delete'] });
        list.splice(index, 1);
        return [204];
    });

    route('GET', '/api/tags', () => {
        const counts = new Map();
        for (const article of articles.values())
            for (const tag of article.tagList) counts.set(tag, (counts.get(tag) ?? 0) + 1);
        return { tags: [...counts].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([tag]) => tag) };
    });

    // --- fetch -------------------------------------------------------------------------------------

    const abortError = signal => signal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
    const server = {
        latency,
        /** Fails the next API request with this HTTP status (0 = network error), or `{ status, path }` for the next request under a path. */
        failNext: null,
        log: [],
        users, articles, comments,
        async fetch(input, init = {}) {
            const url = new URL(String(input?.url ?? input), location.href);
            const method = (init.method ?? 'GET').toUpperCase();
            const request = { url, method, headers: new Headers(init.headers) };
            server.log.push(`${method} ${url.pathname}${url.search}`);
            await new Promise((resolve, reject) => {
                if (init.signal?.aborted) return reject(abortError(init.signal));
                const timer = setTimeout(resolve, server.latency);
                init.signal?.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(abortError(init.signal));
                }, { once: true });
            });
            const planned = server.failNext;
            const applies = planned != null && (typeof planned !== 'object' || url.pathname.startsWith(planned.path));
            const failure = applies ? (typeof planned === 'object' ? planned.status : planned) : null;
            if (applies) server.failNext = null;
            if (failure === 0) throw new TypeError('Failed to fetch');
            const respond = (status, body) => new Response(body === undefined ? null : JSON.stringify(body), {
                status, headers: body === undefined ? {} : { 'content-type': 'application/json; charset=utf-8' },
            });
            if (failure) return respond(failure, { errors: { server: ['is having a bad day'] } });
            const path = url.pathname.replace(/\/+$/, '');
            for (const candidate of routes) {
                const match = candidate.method === method && candidate.regex.exec(path);
                if (!match) continue;
                try {
                    const params = Object.fromEntries(Object.entries(match.groups ?? {}).map(([key, value]) => [key, decodeURIComponent(value)]));
                    const body = typeof init.body === 'string' && init.body ? JSON.parse(init.body) : undefined;
                    const result = candidate.handler({ request, params, query: url.searchParams, body });
                    const [status, payload] = Array.isArray(result) ? result : [200, result];
                    return respond(status, payload);
                } catch (error) {
                    if (error instanceof Failure) return respond(error.status, { errors: error.errors });
                    throw error;
                }
            }
            return respond(404, { errors: { path: ['not found'] } });
        },
        install(target = window) {
            const original = target.fetch?.bind(target);
            target.fetch = (input, init) => {
                const url = new URL(String(input?.url ?? input), location.href);
                return url.pathname.startsWith('/api/') || !original ? server.fetch(input, init) : original(input, init);
            };
            return server;
        },
    };
    return server;
};

// Pages can set window.conduitLatency (ms) before this script runs, e.g. 0 in tests or 1500 to watch loading states.
window.conduitServer ??= window.createConduitServer({ latency: window.conduitLatency ?? 250 }).install();
