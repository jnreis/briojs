/**
 * An in-memory Kanban backend behind `fetch`, plus a realtime channel and a simulated teammate.
 *
 * Every mutation bumps the board `version` and records an event, so clients can catch up with
 * `GET /api/boards/:id/changes?since=<version>` after a realtime notification or a reconnect.
 * Only `/api/*` requests are handled; anything else goes to the original fetch.
 */
window.createKanbanServer = function createKanbanServer({ latency = 300, now = () => Date.now() } = {}) {
    const DAY = 86_400_000;
    const isoDay = offset => new Date(now() + offset * DAY).toISOString().slice(0, 10);

    const members = {
        you: { id: 'you', name: 'You', initials: 'YO', color: '#4f46e5' },
        grace: { id: 'grace', name: 'Grace Hopper', initials: 'GH', color: '#0f766e' },
        ada: { id: 'ada', name: 'Ada Lovelace', initials: 'AL', color: '#be185d' },
    };
    const labels = [
        { id: 'feature', name: 'Feature', color: 'green' },
        { id: 'bug', name: 'Bug', color: 'red' },
        { id: 'design', name: 'Design', color: 'purple' },
        { id: 'research', name: 'Research', color: 'blue' },
        { id: 'urgent', name: 'Urgent', color: 'orange' },
    ];
    const board = { id: 'launch', title: 'Website relaunch', version: 1 };
    const lists = new Map();
    const cards = new Map();
    const events = [];

    const STEP = 1024;
    [['backlog', 'Backlog'], ['todo', 'To do'], ['doing', 'In progress'], ['review', 'Review'], ['done', 'Done']]
        .forEach(([id, title], index) => lists.set(id, { id, title, position: (index + 1) * STEP, version: 1 }));

    let itemSeed = 0;
    const checklist = (...items) => items.map(([text, done]) => ({ id: `i${++itemSeed}`, text, done }));
    const seed = [
        ['backlog', 'Audit pricing page copy', ['research'], 'Compare against the three competitor pages and flag anything we cannot back up.'],
        ['backlog', 'Dark mode for docs', ['feature', 'design'], ''],
        ['backlog', 'Investigate slow search on mobile', ['bug', 'research'], 'Reported on mid-range Android phones. Start with a performance trace.'],
        ['backlog', 'Localize checkout (DE, FR)', ['feature'], ''],
        ['todo', 'Design onboarding checklist', ['design'], '', checklist(['Sketch flows', true], ['Review with support', false], ['Hand off to engineering', false]), 3],
        ['todo', 'Fix broken links in footer', ['bug', 'urgent'], 'Legal and careers links 404 since the CMS move.', [], -1],
        ['todo', 'Write launch blog post', [], 'Outline: why we rebuilt, what changed, what is next.'],
        ['doing', 'New navigation menu', ['feature', 'design'], '', checklist(['Mega menu layout', true], ['Keyboard support', true], ['Mobile drawer', false], ['Analytics events', false]), 1],
        ['doing', 'Migrate images to CDN', ['feature'], ''],
        ['review', 'Accessibility pass on forms', ['bug'], 'Labels, error summaries, and focus order.', checklist(['Labels', true], ['Error summary', true], ['Focus order', true])],
        ['done', 'Set up analytics dashboard', ['feature'], ''],
        ['done', 'Choose typography', ['design'], ''],
    ];
    const counts = {};
    seed.forEach(([listId, title, cardLabels, description, items = [], due], index) => {
        counts[listId] = (counts[listId] ?? 0) + 1;
        const id = `c${index + 1}`;
        cards.set(id, {
            id, listId, title, description, labels: cardLabels, checklist: items,
            due: due === undefined ? null : isoDay(due), position: counts[listId] * STEP, version: 1,
        });
    });

    // --- Mutations -----------------------------------------------------------------------------

    class Failure extends Error {
        constructor(status, errors) {
            super(Object.values(errors).flat()[0]);
            this.status = status;
            this.errors = errors;
        }
    }
    function fail(status, errors) { throw new Failure(status, errors); }
    const copy = value => JSON.parse(JSON.stringify(value));
    const listeners = new Set();
    let online = true;
    const notify = message => {
        for (const listener of listeners) setTimeout(() => {
            if (online && listeners.has(listener)) listener(message);
        }, Math.max(1, server.latency / 2));
    };
    const record = (actor, clientId, text, changes) => {
        board.version += 1;
        for (const change of changes) {
            const entity = (change.kind === 'card' ? cards : lists).get(change.id);
            if (entity) entity.version = board.version;
            change.version = board.version;
            change.data = entity ? copy(entity) : undefined;
            change.deleted = !entity;
        }
        events.push({ version: board.version, actor, clientId, at: new Date(now()).toISOString(), text, changes });
        notify({ type: 'change', version: board.version });
        return board.version;
    };

    const quote = text => `“${text}”`;
    const listName = id => lists.get(id)?.title ?? 'a deleted list';
    const findList = id => lists.get(id) ?? fail(404, { list: ['not found'] });
    const findCard = id => cards.get(id) ?? fail(404, { card: ['not found'] });
    const title = value => {
        const text = String(value ?? '').trim();
        if (!text) fail(422, { title: ["can't be blank"] });
        if (text.length > 200) fail(422, { title: ['is too long (maximum is 200 characters)'] });
        return text;
    };
    const position = value => Number.isFinite(value) ? value : fail(422, { position: ['must be a number'] });
    const newId = (value, taken) => {
        if (value === undefined) return `s${now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        if (typeof value !== 'string' || !/^[\w-]{1,48}$/.test(value)) fail(422, { id: ['is invalid'] });
        if (taken.has(value)) fail(409, { id: ['has already been taken'] });
        return value;
    };

    const mutations = {
        createList(actor, clientId, input) {
            const list = { id: newId(input.id, lists), title: title(input.title), position: position(input.position), version: 0 };
            lists.set(list.id, list);
            record(actor, clientId, `added the list ${quote(list.title)}`, [{ kind: 'list', id: list.id }]);
            return list;
        },
        updateList(actor, clientId, id, patch) {
            const list = findList(id);
            const before = { ...list };
            const next = { ...list };
            if ('title' in patch) next.title = title(patch.title);
            if ('position' in patch) next.position = position(patch.position);
            Object.assign(list, next);
            const text = list.title !== before.title
                ? `renamed the list ${quote(before.title)} to ${quote(list.title)}`
                : `moved the list ${quote(list.title)}`;
            record(actor, clientId, text, [{ kind: 'list', id }]);
            return list;
        },
        deleteList(actor, clientId, id) {
            const list = findList(id);
            const changes = [{ kind: 'list', id }];
            lists.delete(id);
            for (const card of [...cards.values()]) if (card.listId === id) {
                cards.delete(card.id);
                changes.push({ kind: 'card', id: card.id });
            }
            record(actor, clientId, `deleted the list ${quote(list.title)}`, changes);
        },
        createCard(actor, clientId, listId, input) {
            findList(listId);
            const card = {
                id: newId(input.id, cards), listId, title: title(input.title), description: '', labels: [],
                checklist: [], due: null, position: position(input.position), version: 0,
            };
            cards.set(card.id, card);
            record(actor, clientId, `added ${quote(card.title)} to ${listName(listId)}`, [{ kind: 'card', id: card.id }]);
            return card;
        },
        updateCard(actor, clientId, id, patch) {
            const card = findCard(id);
            const next = { ...card };
            if ('title' in patch) next.title = title(patch.title);
            if ('description' in patch) next.description = String(patch.description ?? '');
            if ('listId' in patch) next.listId = findList(patch.listId).id;
            if ('position' in patch) next.position = position(patch.position);
            if ('due' in patch) {
                if (patch.due !== null && !/^\d{4}-\d{2}-\d{2}$/.test(patch.due)) fail(422, { due: ['must be a date'] });
                next.due = patch.due;
            }
            if ('labels' in patch) {
                if (!Array.isArray(patch.labels) || patch.labels.some(label => !labels.some(known => known.id === label)))
                    fail(422, { labels: ['are not on this board'] });
                next.labels = [...new Set(patch.labels)];
            }
            if ('checklist' in patch) {
                if (!Array.isArray(patch.checklist) || patch.checklist.some(item => !item?.id || !String(item.text ?? '').trim()))
                    fail(422, { checklist: ['items need text'] });
                next.checklist = patch.checklist.map(item => ({ id: String(item.id), text: String(item.text).trim(), done: Boolean(item.done) }));
            }
            let text = `updated ${quote(next.title)}`;
            if (next.listId !== card.listId) text = `moved ${quote(next.title)} from ${listName(card.listId)} to ${listName(next.listId)}`;
            else if (next.title !== card.title) text = `renamed ${quote(card.title)} to ${quote(next.title)}`;
            else if (next.position !== card.position) text = `reordered ${quote(next.title)} in ${listName(next.listId)}`;
            else if ('checklist' in patch) {
                const done = next.checklist.filter(item => item.done).length;
                text = `updated the checklist on ${quote(next.title)} (${done}/${next.checklist.length})`;
            } else if ('labels' in patch) text = `changed the labels on ${quote(next.title)}`;
            else if ('due' in patch) text = next.due ? `set ${quote(next.title)} due ${next.due}` : `removed the due date from ${quote(next.title)}`;
            else if ('description' in patch) text = `edited the description of ${quote(next.title)}`;
            Object.assign(card, next);
            record(actor, clientId, text, [{ kind: 'card', id }]);
            return card;
        },
        deleteCard(actor, clientId, id) {
            const card = findCard(id);
            cards.delete(id);
            record(actor, clientId, `deleted ${quote(card.title)} from ${listName(card.listId)}`, [{ kind: 'card', id }]);
        },
    };

    // --- HTTP routes ---------------------------------------------------------------------------

    const routes = [];
    const route = (method, pattern, handler) => {
        const source = pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)');
        routes.push({ method, regex: new RegExp(`^${source}$`), handler });
    };
    const byPosition = (a, b) => a.position - b.position;
    const snapshot = () => ({
        ...board, labels, members: Object.values(members),
        lists: [...lists.values()].sort(byPosition).map(list => ({
            ...copy(list),
            cards: [...cards.values()].filter(card => card.listId === list.id).sort(byPosition).map(copy),
        })),
    });
    const boardOnly = id => id === board.id || fail(404, { board: ['not found'] });

    route('GET', '/api/boards/:board', ({ params }) => boardOnly(params.board) && { board: snapshot() });
    route('GET', '/api/boards/:board/changes', ({ params, query }) => {
        boardOnly(params.board);
        const since = Number(query.get('since'));
        if (!Number.isInteger(since) || since < 0) fail(422, { since: ['must be a version'] });
        return { version: board.version, events: copy(events.filter(event => event.version > since)) };
    });
    route('POST', '/api/boards/:board/lists', ({ params, body, client }) =>
        boardOnly(params.board) && [201, { list: copy(mutations.createList('you', client, body?.list ?? {})) }]);
    route('PATCH', '/api/lists/:id', ({ params, body, client }) => ({ list: copy(mutations.updateList('you', client, params.id, body?.list ?? {})) }));
    route('DELETE', '/api/lists/:id', ({ params, client }) => {
        mutations.deleteList('you', client, params.id);
        return [204];
    });
    route('POST', '/api/lists/:id/cards', ({ params, body, client }) =>
        [201, { card: copy(mutations.createCard('you', client, params.id, body?.card ?? {})) }]);
    route('PATCH', '/api/cards/:id', ({ params, body, client }) => ({ card: copy(mutations.updateCard('you', client, params.id, body?.card ?? {})) }));
    route('DELETE', '/api/cards/:id', ({ params, client }) => {
        mutations.deleteCard('you', client, params.id);
        return [204];
    });

    // --- Teammates -----------------------------------------------------------------------------

    /** Direct mutations by another member, as if made from their own browser. */
    const as = actor => Object.fromEntries(Object.entries(mutations).map(([name, mutate]) =>
        [name, (...args) => {
            const result = mutate(actor, `teammate-${actor}`, ...args);
            return result ? copy(result) : null;
        }]));
    const sorted = listId => [...cards.values()].filter(card => card.listId === listId).sort(byPosition);
    const pick = items => items[Math.floor(Math.random() * items.length)];
    const ideas = ['Update favicon set', 'Draft release notes', 'QA on Safari 17', 'Refresh team photos', 'Cookie banner copy', 'Check 404 page design'];
    /** One plausible random change by a teammate, for watching realtime sync by hand. */
    const teammate = (actor = pick(['grace', 'ada'])) => {
        const member = as(actor);
        const orderedLists = [...lists.values()].sort(byPosition);
        if (!orderedLists.length) return member.createList({ title: 'Ideas', position: STEP });
        const all = [...cards.values()];
        const roll = Math.random();
        if (!all.length || roll < 0.2) {
            const list = pick(orderedLists);
            const last = sorted(list.id).at(-1);
            return member.createCard(list.id, { title: pick(ideas), position: (last?.position ?? 0) + STEP });
        }
        const card = pick(all);
        if (roll < 0.6) {
            const index = orderedLists.findIndex(list => list.id === card.listId);
            const target = orderedLists[(index + 1) % orderedLists.length];
            const first = sorted(target.id).find(other => other.id !== card.id);
            return member.updateCard(card.id, { listId: target.id, position: first ? first.position / 2 : STEP });
        }
        if (roll < 0.8 && card.checklist.length) {
            const items = card.checklist.map(item => ({ ...item }));
            const item = items.find(entry => !entry.done) ?? items[0];
            item.done = !item.done;
            return member.updateCard(card.id, { checklist: items });
        }
        const label = pick(labels).id;
        return member.updateCard(card.id, {
            labels: card.labels.includes(label) ? card.labels.filter(id => id !== label) : [...card.labels, label],
        });
    };

    // --- fetch and the realtime channel ---------------------------------------------------------

    const abortError = signal => signal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
    const server = {
        latency,
        /** Fails the next API request with this HTTP status (0 = network error), or `{ status, path, method }` to target one. */
        failNext: null,
        log: [],
        board, lists, cards, events, members, labels,
        as,
        teammate,
        get online() { return online; },
        /** Simulates losing or regaining the connection: requests fail and the realtime channel closes. */
        setOnline(value) {
            if (online === Boolean(value)) return;
            online = Boolean(value);
            for (const listener of listeners) listener({ type: online ? 'open' : 'closed', version: board.version });
        },
        /** Subscribes to realtime notifications: `{ type: 'open' | 'closed' | 'change', version }`. */
        connect(listener) {
            listeners.add(listener);
            setTimeout(() => listeners.has(listener) && listener({ type: online ? 'open' : 'closed', version: board.version }), 0);
            return () => listeners.delete(listener);
        },
        async fetch(input, init = {}) {
            const url = new URL(String(input?.url ?? input), location.href);
            const method = (init.method ?? 'GET').toUpperCase();
            const headers = new Headers(init.headers);
            server.log.push(`${method} ${url.pathname}${url.search}`);
            await new Promise((resolve, reject) => {
                if (init.signal?.aborted) return reject(abortError(init.signal));
                const timer = setTimeout(resolve, server.latency);
                init.signal?.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(abortError(init.signal));
                }, { once: true });
            });
            if (!online) throw new TypeError('Failed to fetch');
            const planned = server.failNext;
            const applies = planned != null && (typeof planned !== 'object' ||
                ((!planned.path || url.pathname.startsWith(planned.path)) && (!planned.method || planned.method === method)));
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
                    const result = candidate.handler({ params, query: url.searchParams, body, client: headers.get('x-client-id') ?? 'anonymous' });
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

// Pages can set window.kanbanLatency (ms) before this script runs, e.g. 0 in tests or 1500 to watch optimistic updates.
window.kanbanServer ??= window.createKanbanServer({ latency: window.kanbanLatency ?? 300 }).install();
