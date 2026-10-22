/*
 * Conduit — a Medium-style blogging app following the RealWorld spec (https://realworld-docs.netlify.app).
 * Routing, authentication, API requests, pagination, and a normalized cache shared by every page.
 */
(() => {
    const BASE = window.conduitBase ?? new URL('.', document.currentScript.src).pathname;
    const PAGE_SIZE = 10;

    // --- Formatting ------------------------------------------------------------------------------

    const longDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const escapeHtml = text => String(text).replace(/[&<>"']/g, char =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    const inline = text => escapeHtml(text)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    /** A deliberately small Markdown subset: headings, lists, paragraphs, and inline emphasis/code. Input is escaped first. */
    const markdown = source => String(source ?? '').trim().split(/\n{2,}/).map(block => {
        const heading = /^(#{1,3})\s+(.*)$/.exec(block);
        if (heading) return `<h${heading[1].length + 1}>${inline(heading[2])}</h${heading[1].length + 1}>`;
        const lines = block.split('\n');
        if (lines.every(line => /^[-*]\s+/.test(line)))
            return `<ul>${lines.map(line => `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
        return `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
    const avatarColors = ['#5cb85c', '#3d8b3d', '#4f46e5', '#d97706', '#0ea5e9', '#be185d'];
    const avatar = profile => {
        if (profile?.image) return profile.image;
        const name = profile?.username ?? '?';
        const color = avatarColors[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="16" fill="${color}"/>` +
            `<text x="16" y="21" font-family="sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">${escapeHtml(name[0].toUpperCase())}</text></svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };
    const format = { date: iso => longDate.format(new Date(iso)), avatar, markdown };

    // --- Session ---------------------------------------------------------------------------------

    // Module-level persisted state lives as long as the page and syncs across tabs.
    const token = brio.persist('conduit.token', '');
    const session = brio.state({
        user: null,
        /** `checking` while a stored token is verified with GET /user. */
        status: 'ready',
        notice: '',
        get signedIn() { return Boolean(this.user); },
    });

    // --- API -------------------------------------------------------------------------------------

    class ApiError extends Error {
        constructor(status, errors, cause) {
            // RealWorld errors look like { email: ['has already been taken'] }.
            const messages = Object.entries(errors ?? {}).flatMap(([field, list]) =>
                [].concat(list).map(message => `${field} ${message}`));
            super(messages[0] ?? 'Something went wrong. Please try again.', { cause });
            this.name = 'ApiError';
            this.status = status;
            this.messages = messages.length ? messages : [this.message];
        }
    }

    const report = error => {
        if (error.status !== 401) session.notice = error.message;
    };
    const expireSession = () => {
        token.value = '';
        session.user = null;
        session.notice = 'Your session has expired. Please sign in again.';
    };

    async function request(method, path, input, { signal } = {}) {
        const headers = token.value ? { authorization: `Token ${token.value}` } : {};
        try {
            return await brio.http[method](`/api${path}`, input, { headers, signal });
        } catch (error) {
            if (error?.name === 'AbortError') throw error;
            if (error instanceof brio.HttpError) {
                const payload = await error.response.json().catch(() => null);
                if (error.status === 401 && token.value && !path.startsWith('/users')) expireSession();
                throw new ApiError(error.status, payload?.errors ?? { server: [`responded with ${error.status}`] }, error);
            }
            throw new ApiError(0, { network: ['is unreachable. Check your connection and try again.'] }, error);
        }
    }
    const api = {
        get: (path, query, options) => request('get', path, query, options),
        post: (path, body, options) => request('post', path, body, options),
        put: (path, body, options) => request('put', path, body, options),
        delete: (path, options) => request('delete', path, undefined, options),
    };

    // --- Normalized cache ------------------------------------------------------------------------
    // Every article and profile has one reactive record, so a favorite or follow anywhere updates it everywhere.

    const cache = brio.state({ articles: {}, profiles: {} });
    const rememberProfile = profile => {
        const existing = cache.profiles[profile.username];
        if (existing) Object.assign(existing, profile);
        else cache.profiles[profile.username] = { ...profile };
        return cache.profiles[profile.username];
    };
    const rememberArticle = article => {
        const record = { ...article, author: rememberProfile(article.author) };
        const existing = cache.articles[article.slug];
        if (existing) {
            // List responses omit the body; keep one we already have.
            Object.assign(existing, 'body' in record ? record : { ...record, body: existing.body });
        } else {
            cache.articles[article.slug] = record;
        }
        return cache.articles[article.slug];
    };
    const forget = slug => { delete cache.articles[slug]; };

    // --- Router ----------------------------------------------------------------------------------

    /** Sends guests to sign in once the session is known, and back here afterwards. Re-checked when the session changes. */
    const signedIn = to => session.status !== 'ready' || Boolean(session.user) ||
        `/login?redirect=${encodeURIComponent(to.fullPath)}`;

    const router = brio.createRouter([
        { path: '/', component: 'home-page' },
        { path: '/login', component: 'auth-page' },
        { path: '/register', component: 'auth-page' },
        { path: '/settings', component: 'settings-page', guard: signedIn },
        { path: '/editor', component: 'editor-page', guard: signedIn },
        { path: '/editor/:slug', component: 'editor-page', guard: signedIn },
        { path: '/article/:slug', component: 'article-page' },
        { path: '/profile/:username', component: 'profile-page' },
        { path: '/profile/:username/favorites', component: 'profile-page' },
        { path: '*', component: 'not-found-page' },
    ], { base: BASE });
    const route = router.route;

    const link = (path, query = {}) => {
        const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== '' && value != null && value !== 1));
        return router.href(`${path}${params.size ? `?${params}` : ''}`);
    };
    const to = {
        article: slug => link(`/article/${encodeURIComponent(slug)}`),
        profile: username => link(`/profile/${encodeURIComponent(username)}`),
        editor: slug => link(`/editor/${encodeURIComponent(slug)}`),
    };
    const go = (path, options) => router.navigate(path, options);

    // --- Actions ---------------------------------------------------------------------------------

    const pending = brio.state({});
    const actions = {
        async toggleFavorite(article) {
            if (!session.user) return go(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
            const key = `favorite:${article.slug}`;
            if (pending[key]) return;
            const was = article.favorited;
            pending[key] = true;
            // Optimistic: flip now, reconcile with the server's answer, roll back on failure.
            Object.assign(article, { favorited: !was, favoritesCount: article.favoritesCount + (was ? -1 : 1) });
            try {
                const result = await (was ? api.delete(`/articles/${article.slug}/favorite`) : api.post(`/articles/${article.slug}/favorite`));
                rememberArticle(result.article);
            } catch (error) {
                Object.assign(article, { favorited: was, favoritesCount: article.favoritesCount + (was ? 1 : -1) });
                report(error);
            } finally {
                delete pending[key];
            }
        },
        async toggleFollow(profile) {
            if (!session.user) return go(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
            const key = `follow:${profile.username}`;
            if (pending[key]) return;
            const was = profile.following;
            pending[key] = true;
            profile.following = !was;
            try {
                const path = `/profiles/${encodeURIComponent(profile.username)}/follow`;
                rememberProfile((await (was ? api.delete(path) : api.post(path))).profile);
            } catch (error) {
                profile.following = was;
                report(error);
            } finally {
                delete pending[key];
            }
        },
        isPending: key => Boolean(pending[key]),
        isMine: author => session.user?.username === author?.username,
        signIn(user) {
            token.value = user.token;
            session.user = user;
            session.notice = '';
        },
        signOut() {
            token.value = '';
            session.user = null;
            go('/');
        },
        dismiss() {
            session.notice = '';
        },
    };

    // Reconciles the session with the stored token at startup and whenever another tab changes it.
    brio.effect(() => {
        const value = token.value;
        brio.untrack(() => syncSession(value));
    });
    async function syncSession(value) {
        if (!value) {
            session.user = null;
            session.status = 'ready';
            return;
        }
        if (session.user?.token === value) return;
        session.status = 'checking';
        try {
            const { user } = await api.get('/user');
            if (token.value === value) session.user = user;
        } catch (error) {
            if (token.value === value && error.status !== 401) session.notice = `Could not restore your session: ${error.message}`;
        } finally {
            if (token.value === value) session.status = 'ready';
        }
    }

    // --- App -------------------------------------------------------------------------------------

    const app = brio.createApp({
        router,
        stores: { session, cache, actions, format, link, to, api },
        state: () => ({ year: new Date().getUTCFullYear() }),
    });

    // Lists are paged with ?page=N, so the browser's back button and shared links restore the same page.
    app.component('article-list', {
        template: '#tpl-article-list',
        setup({ $props }) {
            const page = brio.computed(() => Math.max(1, Number.parseInt($props.page, 10) || 1));
            const feed = brio.resource(async signal => {
                const source = $props.source ?? {};
                const query = { limit: PAGE_SIZE, offset: (page.value - 1) * PAGE_SIZE, ...source.filter };
                const result = await api.get(source.feed ? '/articles/feed' : '/articles', query, { signal });
                return { articles: result.articles.map(rememberArticle), articlesCount: result.articlesCount };
            });
            return {
                get loading() { return feed.loading.value; },
                get error() { return feed.error.value?.message ?? ''; },
                get articles() { return feed.data.value?.articles ?? []; },
                get count() { return feed.data.value?.articlesCount ?? 0; },
                get pages() { return Math.ceil(this.count / PAGE_SIZE); },
                get page() { return page.value; },
                pageHref: number => link(route.path, { ...route.query, page: number }),
                retry: () => feed.refetch(),
            };
        },
    });

    app.component('article-meta', {
        template: '#tpl-article-meta',
    });

    app.component('favorite-button', {
        template: '#tpl-favorite-button',
        props: { compact: Boolean },
    });

    app.component('follow-button', {
        template: '#tpl-follow-button',
    });

    app.component('error-list', {
        template: '#tpl-error-list',
    });

    app.component('home-page', {
        template: '#tpl-home-page',
        setup() {
            const tags = brio.resource(signal => api.get('/tags', null, { signal }));
            return {
                get tab() {
                    const { query } = route;
                    if (query.tag) return 'tag';
                    return query.feed === 'you' && session.user ? 'feed' : 'global';
                },
                get tag() { return route.query.tag ?? ''; },
                get page() { return route.query.page ?? 1; },
                get source() {
                    if (this.tab === 'feed') return { feed: true };
                    return { filter: this.tag ? { tag: this.tag } : {} };
                },
                get tags() { return tags.data.value?.tags ?? []; },
                get tagsLoading() { return tags.loading.value; },
                get tagsError() { return tags.error.value?.message ?? ''; },
            };
        },
    });

    app.component('auth-page', {
        template: '#tpl-auth-page',
        setup() {
            const register = route.path === '/register';
            const redirect = route.query.redirect;
            const form = brio.state({ username: '', email: '', password: '', submitting: false, errors: [], touched: false });
            const schema = {
                ...(register ? { username: [{ name: 'required', message: "username can't be blank" }] } : {}),
                email: [{ name: 'required', message: "email can't be blank" }, { name: 'email', message: 'email is invalid' }],
                password: [
                    { name: 'required', message: "password can't be blank" },
                    ...(register ? [{ name: 'min', value: 8, message: 'password is too short (minimum is 8 characters)' }] : []),
                ],
            };
            return {
                register,
                form,
                get title() { return register ? 'Sign up' : 'Sign in'; },
                get switchHref() { return link(register ? '/login' : '/register', { redirect }); },
                get switchText() { return register ? 'Have an account?' : 'Need an account?'; },
                async submit() {
                    if (form.submitting) return;
                    const result = brio.validate(form, schema);
                    if (result !== true) {
                        form.errors = Object.values(result).flat();
                        return;
                    }
                    form.submitting = true;
                    form.errors = [];
                    try {
                        const user = register
                            ? { username: form.username.trim(), email: form.email.trim(), password: form.password }
                            : { email: form.email.trim(), password: form.password };
                        const result = await api.post(register ? '/users' : '/users/login', { user });
                        actions.signIn(result.user);
                        // Only same-app paths are honored, so ?redirect= cannot send users elsewhere.
                        go(redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/', { replace: true });
                    } catch (error) {
                        form.errors = error.messages ?? [error.message];
                    } finally {
                        form.submitting = false;
                    }
                },
            };
        },
    });

    app.component('settings-page', {
        template: '#tpl-settings-page',
        setup() {
            const user = session.user ?? {};
            const form = brio.state({
                image: user.image ?? '', username: user.username ?? '', bio: user.bio ?? '', email: user.email ?? '', password: '',
                submitting: false, errors: [], saved: false,
            });
            // A stored session can finish loading after this page mounts.
            brio.effect(() => {
                const current = session.user;
                if (current && !form.username) brio.untrack(() => Object.assign(form, {
                    image: current.image ?? '', username: current.username, bio: current.bio ?? '', email: current.email,
                }));
            });
            return {
                form,
                async submit() {
                    if (form.submitting) return;
                    const result = brio.validate(form, {
                        username: [{ name: 'required', message: "username can't be blank" }],
                        email: [{ name: 'required', message: "email can't be blank" }, { name: 'email', message: 'email is invalid' }],
                    });
                    if (result !== true) {
                        form.errors = Object.values(result).flat();
                        return;
                    }
                    form.submitting = true;
                    form.errors = [];
                    try {
                        const changes = { image: form.image.trim() || null, username: form.username.trim(), bio: form.bio, email: form.email.trim() };
                        if (form.password) changes.password = form.password;
                        const { user: updated } = await api.put('/user', { user: changes });
                        session.user = updated;
                        token.value = updated.token;
                        rememberProfile({ username: updated.username, bio: updated.bio, image: updated.image, following: false });
                        go(`/profile/${encodeURIComponent(updated.username)}`);
                    } catch (error) {
                        form.errors = error.messages ?? [error.message];
                    } finally {
                        form.submitting = false;
                    }
                },
                signOut: () => actions.signOut(),
            };
        },
    });

    app.component('editor-page', {
        template: '#tpl-editor-page',
        setup() {
            const slug = route.params.slug;
            const form = brio.state({ title: '', description: '', body: '', tagInput: '', tagList: [], submitting: false, errors: [] });
            const original = slug ? brio.resource(signal => api.get(`/articles/${encodeURIComponent(slug)}`, null, { signal })) : null;
            if (original) brio.effect(() => {
                const loaded = original.data.value?.article;
                if (loaded) brio.untrack(() => {
                    const { title, description, body, tagList } = rememberArticle(loaded);
                    Object.assign(form, { title, description, body, tagList: [...tagList] });
                });
            });
            return {
                form,
                editing: Boolean(slug),
                get loading() { return Boolean(original?.loading.value); },
                get loadError() { return original?.error.value?.message ?? ''; },
                get forbidden() {
                    const loaded = original?.data.value?.article;
                    return Boolean(loaded && session.user && loaded.author.username !== session.user.username);
                },
                addTag() {
                    const tags = form.tagInput.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
                    for (const tag of tags) if (!form.tagList.includes(tag)) form.tagList.push(tag);
                    form.tagInput = '';
                },
                removeTag(tag) {
                    form.tagList.splice(form.tagList.indexOf(tag), 1);
                },
                async submit() {
                    if (form.submitting) return;
                    if (form.tagInput.trim()) this.addTag();
                    const result = brio.validate(form, {
                        title: [{ name: 'required', message: "title can't be blank" }],
                        description: [{ name: 'required', message: "description can't be blank" }],
                        body: [{ name: 'required', message: "body can't be blank" }],
                    });
                    if (result !== true) {
                        form.errors = Object.values(result).flat();
                        return;
                    }
                    form.submitting = true;
                    form.errors = [];
                    try {
                        const article = { title: form.title.trim(), description: form.description.trim(), body: form.body, tagList: [...form.tagList] };
                        const response = slug
                            ? await api.put(`/articles/${encodeURIComponent(slug)}`, { article })
                            : await api.post('/articles', { article });
                        if (slug && response.article.slug !== slug) forget(slug);
                        go(`/article/${encodeURIComponent(rememberArticle(response.article).slug)}`, { replace: Boolean(slug) });
                    } catch (error) {
                        form.errors = error.messages ?? [error.message];
                    } finally {
                        form.submitting = false;
                    }
                },
            };
        },
    });

    app.component('article-page', {
        template: '#tpl-article-page',
        setup() {
            const slug = route.params.slug;
            const path = `/articles/${encodeURIComponent(slug)}`;
            const loaded = brio.resource(async signal => rememberArticle((await api.get(path, null, { signal })).article));
            const thread = brio.resource(signal => api.get(`${path}/comments`, null, { signal }));
            const comments = brio.state({ list: [], draft: '', posting: false, errors: [] });
            brio.effect(() => {
                const list = thread.data.value?.comments;
                if (list) brio.untrack(() => {
                    comments.list = list.map(comment => ({ ...comment, author: rememberProfile(comment.author) }));
                });
            });
            return {
                comments,
                // Shows the cached copy immediately when we came from a list, then the full article once it arrives.
                get article() { return loaded.data.value ?? cache.articles[slug] ?? null; },
                get hasBody() { return typeof this.article?.body === 'string'; },
                get loading() { return loaded.loading.value; },
                get error() { return loaded.error.value; },
                get notFound() { return this.error?.status === 404; },
                get commentsLoading() { return thread.loading.value; },
                get mine() { return actions.isMine(this.article?.author); },
                deleting: false,
                async remove() {
                    if (this.deleting || !confirm('Delete this article? This cannot be undone.')) return;
                    this.deleting = true;
                    try {
                        await api.delete(path);
                        forget(slug);
                        go('/', { replace: true });
                    } catch (error) {
                        report(error);
                        this.deleting = false;
                    }
                },
                async post() {
                    if (comments.posting) return;
                    if (!comments.draft.trim()) {
                        comments.errors = ["body can't be blank"];
                        return;
                    }
                    comments.posting = true;
                    comments.errors = [];
                    try {
                        const { comment } = await api.post(`${path}/comments`, { comment: { body: comments.draft } });
                        comments.list.unshift({ ...comment, author: rememberProfile(comment.author) });
                        comments.draft = '';
                    } catch (error) {
                        comments.errors = error.messages ?? [error.message];
                    } finally {
                        comments.posting = false;
                    }
                },
                async removeComment(comment) {
                    const index = comments.list.indexOf(comment);
                    if (index < 0) return;
                    comments.list.splice(index, 1);
                    try {
                        await api.delete(`${path}/comments/${comment.id}`);
                    } catch (error) {
                        comments.list.splice(index, 0, comment);
                        report(error);
                    }
                },
            };
        },
    });

    app.component('profile-page', {
        template: '#tpl-profile-page',
        setup() {
            const username = route.params.username;
            const favorites = route.path.endsWith('/favorites');
            const loaded = brio.resource(async signal =>
                rememberProfile((await api.get(`/profiles/${encodeURIComponent(username)}`, null, { signal })).profile));
            return {
                username,
                favorites,
                get profile() { return loaded.data.value ?? cache.profiles[username] ?? null; },
                get loading() { return loaded.loading.value; },
                get notFound() { return loaded.error.value?.status === 404; },
                get error() { return loaded.error.value?.message ?? ''; },
                get mine() { return session.user?.username === username; },
                get page() { return route.query.page ?? 1; },
                source: { filter: favorites ? { favorited: username } : { author: username } },
                myHref: link(`/profile/${encodeURIComponent(username)}`),
                favoritesHref: link(`/profile/${encodeURIComponent(username)}/favorites`),
            };
        },
    });


    app.component('not-found-page', {
        template: '#tpl-not-found-page',
    });

    app.component('article-actions', {
        template: '#tpl-article-actions',
    });

    const root = app.mount('#app');
    window.conduitApp = { app, root, router, session, cache, token, api, route };
})();
