/**
 * An in-memory collaborative document backend: REST for the document list, snapshots, and history,
 * plus a realtime channel (think WebSocket) that carries operations, acknowledgements, and presence.
 *
 * The server is the single source of order. A client submits operations made on revision `base`; the
 * server transforms them past everything committed since, applies them, bumps the revision, and
 * broadcasts the result to everyone in the document, including the author (that is the author's ack).
 * Submissions carry an id, so a resend after a dropped connection is acknowledged, not applied twice.
 *
 * Teammates (`server.teammate('grace')`) are simulated people editing from their own browsers.
 * Only `/api/*` requests are handled; anything else goes to the original fetch.
 */
window.createDocsServer = function createDocsServer({ latency = 120, now = () => Date.now() } = {}) {
    const OT = window.DocsOT;
    const MINUTE = 60_000;
    const copy = value => JSON.parse(JSON.stringify(value));

    const members = {
        you: { id: 'you', name: 'You', initials: 'YO', color: '#4f46e5' },
        grace: { id: 'grace', name: 'Grace Hopper', initials: 'GH', color: '#0f766e' },
        ada: { id: 'ada', name: 'Ada Lovelace', initials: 'AL', color: '#be185d' },
    };

    // --- Documents -------------------------------------------------------------------------------

    const docs = new Map();
    let blockSeed = 0;
    let docSeed = 0;
    function createDoc(id, title, entries, { by = 'you', age = 0 } = {}) {
        const blocks = [
            { id: 'title', type: 'title', text: title, checked: false, pos: 0, deleted: false },
            ...entries.map(([type, text, checked = false], index) =>
                ({ id: `b${++blockSeed}`, type, text, checked, pos: (index + 1) * 1024, deleted: false })),
        ];
        const doc = {
            id, blocks, origin: copy(blocks), rev: 0, log: [], applied: new Map(),
            createdAt: now() - age, updatedAt: now() - age, updatedBy: by, deleted: false, deletedBy: null,
            presence: new Map(),
        };
        docs.set(id, doc);
        return doc;
    }
    createDoc('launch-plan', 'Launch plan', [
        ['h2', 'Goals'],
        ['p', 'Ship the new onboarding flow to every workspace by the end of the quarter.'],
        ['todo', 'Finalize pricing copy', true],
        ['todo', 'Record the product walkthrough'],
        ['todo', 'Brief the support team'],
        ['h2', 'Risks'],
        ['quote', 'If the billing migration slips, we launch with the old billing page and switch later.'],
        ['p', 'Owner: Grace. Reviewers: Ada and you.'],
    ], { by: 'grace', age: 12 * MINUTE });
    createDoc('weekly-sync', 'Weekly sync — notes', [
        ['h2', 'Agenda'],
        ['p', 'Metrics review, hiring update, open questions.'],
        ['h2', 'Decisions'],
        ['p', 'Move the design review to Thursdays.'],
        ['h2', 'Action items'],
        ['todo', 'Ada: share the retention dashboard'],
        ['todo', 'Grace: draft the hiring plan', true],
    ], { by: 'ada', age: 3 * 60 * MINUTE });
    createDoc('style-guide', 'Writing style guide', [
        ['p', 'Write like you talk to a smart friend: short sentences, plain words, no jargon.'],
        ['h2', 'Headings'],
        ['p', 'Use sentence case. Skip the period.'],
        ['h2', 'Numbers'],
        ['p', 'Spell out one to nine; use digits for 10 and up.'],
        ['code', 'const price = formatMoney(1999); // "$19.99"'],
    ], { by: 'you', age: 26 * 60 * MINUTE });

    const visible = doc => doc.blocks.filter(block => !block.deleted);
    const summary = doc => {
        const blocks = visible(doc);
        return {
            id: doc.id,
            title: blocks.find(block => block.type === 'title')?.text ?? '',
            excerpt: blocks.find(block => block.type !== 'title' && block.text.trim())?.text ?? '',
            words: blocks.reduce((sum, block) => sum + (block.text.match(/\S+/g)?.length ?? 0), 0),
            updatedAt: new Date(doc.updatedAt).toISOString(),
            updatedBy: doc.updatedBy,
            rev: doc.rev,
            here: [...new Set([...doc.presence.values()].map(entry => entry.actor))],
        };
    };
    const live = id => {
        const doc = docs.get(id);
        return doc && !doc.deleted ? doc : null;
    };

    // --- Realtime channel ------------------------------------------------------------------------

    const connections = new Set();
    let online = true;
    /** Delivers messages in order after half the latency, like one direction of a socket. */
    const pipe = target => {
        const queue = [];
        let timer = null;
        return message => {
            queue.push(copy(message));
            timer ??= setTimeout(() => {
                timer = null;
                for (const item of queue.splice(0)) target(item);
            }, Math.max(1, server.latency / 2));
        };
    };
    const toDoc = (doc, message, except = null) => {
        for (const connection of connections) if (connection !== except && connection.docs.has(doc.id)) connection.push(message);
    };
    const toAll = message => {
        for (const connection of connections) connection.push(message);
    };
    const presenceMessage = doc => ({
        type: 'presence', doc: doc.id, rev: doc.rev,
        users: [...doc.presence.values()].map(entry => ({ ...entry, ...members[entry.actor] })),
    });
    const announcePresence = doc => {
        toDoc(doc, presenceMessage(doc));
        toAll({ type: 'docs', doc: summary(doc) });
    };

    function commit(doc, { client, actor, id = `${client}:${doc.rev + 1}`, ops }) {
        for (const op of ops) OT.apply(doc.blocks, op);
        doc.rev += 1;
        doc.updatedAt = now();
        doc.updatedBy = actor;
        const entry = { doc: doc.id, rev: doc.rev, id, client, actor, at: new Date(doc.updatedAt).toISOString(), ops };
        doc.log.push(entry);
        doc.applied.set(id, entry);
        // Carets follow the text they sit in, so teammates' cursors stay put while others type.
        for (const caret of doc.presence.values()) for (const op of ops) {
            caret.start = OT.mapOffset(caret.block, caret.start, op, caret.client === client);
            caret.end = OT.mapOffset(caret.block, caret.end, op, caret.client === client);
        }
        toDoc(doc, { type: 'ops', ...entry });
        toDoc(doc, presenceMessage(doc));
        toAll({ type: 'docs', doc: summary(doc) });
        return entry;
    }

    function receive(connection, message) {
        if (message.type === 'hello') {
            connection.client = message.client;
            return;
        }
        const doc = live(message.doc);
        if (!doc) {
            const gone = docs.get(message.doc);
            connection.push({ type: 'gone', doc: message.doc, by: gone?.deletedBy ?? null, id: message.id });
            return;
        }
        if (message.type === 'join') {
            connection.docs.add(doc.id);
            for (const entry of doc.log) if (entry.rev > message.rev) connection.push({ type: 'ops', ...entry });
            connection.push(presenceMessage(doc));
        } else if (message.type === 'leave') {
            connection.docs.delete(doc.id);
            if (doc.presence.delete(connection.client)) announcePresence(doc);
        } else if (message.type === 'presence') {
            if (!connection.docs.has(doc.id)) return;
            if (message.block == null) doc.presence.delete(connection.client);
            else doc.presence.set(connection.client, {
                client: connection.client, actor: 'you',
                block: message.block, start: message.start, end: message.end,
            });
            announcePresence(doc);
        } else if (message.type === 'submit') {
            const seen = doc.applied.get(message.id);
            if (seen) return connection.push({ type: 'ops', ...seen });
            if (message.base > doc.rev) return connection.push({ type: 'error', doc: doc.id, id: message.id, message: 'Unknown base revision' });
            let ops = message.ops;
            for (const entry of doc.log) if (entry.rev > message.base) [ops] = OT.transformLists(ops, entry.ops);
            commit(doc, { client: connection.client, actor: 'you', id: message.id, ops });
        }
    }

    function dropConnection(connection) {
        for (const id of connection.docs) {
            const doc = docs.get(id);
            if (doc?.presence.delete(connection.client)) announcePresence(doc);
        }
        connection.docs.clear();
    }

    // --- Teammates -------------------------------------------------------------------------------

    /** A simulated person editing from their own browser: always up to date, so no transforms needed. */
    function teammate(actor) {
        const client = `teammate-${actor}`;
        const caret = docId => live(docId)?.presence.get(client);
        const person = {
            actor,
            /** Puts their cursor in a block (at the end unless `offset` is given). */
            enter(docId, blockId, offset) {
                const doc = live(docId);
                const block = doc?.blocks.find(entry => entry.id === blockId);
                if (!block) return person;
                const at = Math.min(offset ?? block.text.length, block.text.length);
                doc.presence.set(client, { client, actor, block: blockId, start: at, end: at });
                announcePresence(doc);
                return person;
            },
            leave(docId) {
                const doc = live(docId);
                if (doc?.presence.delete(client)) announcePresence(doc);
                return person;
            },
            /** Types text at their cursor, one character every `delay` ms. Resolves when done. */
            async type(docId, text, { delay = 70 } = {}) {
                for (const character of text) {
                    const doc = live(docId);
                    const at = caret(docId);
                    if (!doc || !at || doc.blocks.find(block => block.id === at.block)?.deleted) return;
                    commit(doc, { client, actor, ops: [{ t: 'ins', b: at.block, p: at.start, s: character }] });
                    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
                }
            },
            /** Deletes `count` characters before their cursor (Backspace). */
            backspace(docId, count = 1) {
                const doc = live(docId);
                const at = caret(docId);
                if (!doc || !at || !at.start) return null;
                const n = Math.min(count, at.start);
                return commit(doc, { client, actor, ops: [{ t: 'del', b: at.block, p: at.start - n, n }] });
            },
            /** Commits arbitrary operations, e.g. `{ t: 'set', b, deleted: true }`. */
            edit(docId, ops) {
                const doc = live(docId);
                return doc ? commit(doc, { client, actor, ops: copy(ops) }) : null;
            },
            addBlock(docId, afterId, text, type = 'p') {
                const doc = live(docId);
                if (!doc) return null;
                const blocks = visible(doc);
                const index = blocks.findIndex(block => block.id === afterId);
                const id = `${actor}-${++blockSeed}`;
                person.edit(docId, [{ t: 'add', b: id, type, text, pos: OT.between(blocks[index]?.pos, blocks[index + 1]?.pos) }]);
                return id;
            },
            removeDoc(docId) {
                const doc = live(docId);
                if (!doc) return;
                doc.deleted = true;
                doc.deletedBy = actor;
                removed(doc);
            },
        };
        return person;
    }
    const removed = doc => {
        toDoc(doc, { type: 'gone', doc: doc.id, by: doc.deletedBy });
        for (const connection of connections) connection.docs.delete(doc.id);
        doc.presence.clear();
        toAll({ type: 'docs', removed: doc.id });
    };

    // --- HTTP ------------------------------------------------------------------------------------

    class Failure extends Error {
        constructor(status, errors) {
            super(Object.values(errors).flat()[0]);
            this.status = status;
            this.errors = errors;
        }
    }
    const fail = (status, errors) => {
        throw new Failure(status, errors);
    };
    const required = id => live(id) ?? fail(404, { document: [docs.get(id)?.deletedBy ? `was deleted by ${members[docs.get(id).deletedBy].name}` : 'not found'] });
    const routes = [
        ['GET', /^\/api\/members$/, () => Object.values(members)],
        ['GET', /^\/api\/docs$/, () => [...docs.values()].filter(doc => !doc.deleted).map(summary)
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))],
        ['POST', /^\/api\/docs$/, ({ body }) => {
            const title = String(body?.title ?? '').trim();
            if (title.length > 120) fail(422, { title: ['is too long (120 characters at most)'] });
            const slug = (title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'doc';
            const doc = createDoc(`${slug}-${++docSeed}`, title, [['p', '']]);
            toAll({ type: 'docs', doc: summary(doc) });
            return [201, summary(doc)];
        }],
        ['GET', /^\/api\/docs\/(?<id>[^/]+)$/, ({ params }) => {
            const doc = required(params.id);
            return { id: doc.id, rev: doc.rev, blocks: doc.blocks };
        }],
        ['DELETE', /^\/api\/docs\/(?<id>[^/]+)$/, ({ params }) => {
            const doc = required(params.id);
            doc.deleted = true;
            doc.deletedBy = 'you';
            removed(doc);
            return [204];
        }],
        ['GET', /^\/api\/docs\/(?<id>[^/]+)\/history$/, ({ params }) => {
            const doc = required(params.id);
            return { origin: doc.origin, createdAt: new Date(doc.createdAt).toISOString(), entries: doc.log };
        }],
    ].map(([method, regex, handler]) => ({ method, regex, handler }));

    const abortError = signal => signal.reason ?? new DOMException('The operation was aborted.', 'AbortError');
    const server = {
        latency,
        /** Fails the next API request with this HTTP status (0 = network error). */
        failNext: null,
        log: [],
        docs, members,
        teammate,
        get online() { return online; },
        get connections() { return connections.size; },
        /** How many connections have joined a document; tests use it to catch leaked subscriptions. */
        joined: id => [...connections].filter(connection => connection.docs.has(id)).length,
        /** Simulates losing or regaining the network: requests fail and realtime messages are dropped. */
        setOnline(value) {
            if (online === Boolean(value)) return;
            online = Boolean(value);
            for (const connection of connections) {
                if (!online) dropConnection(connection);
                connection.status(online ? 'open' : 'closed');
            }
        },
        /** Opens a realtime connection. `listener` receives server messages; `send` delivers client messages. */
        connect(listener) {
            const connection = { client: null, docs: new Set() };
            connection.push = pipe(message => {
                if (online && connections.has(connection)) listener(message);
            });
            connection.status = type => setTimeout(() => connections.has(connection) && listener({ type }), 0);
            const inbox = pipe(message => {
                if (online && connections.has(connection)) receive(connection, message);
            });
            connections.add(connection);
            connection.status(online ? 'open' : 'closed');
            return {
                send(message) {
                    if (online) inbox(message);
                },
                close() {
                    dropConnection(connection);
                    connections.delete(connection);
                },
            };
        },
        async fetch(input, init = {}) {
            const url = new URL(String(input?.url ?? input), location.href);
            const method = (init.method ?? 'GET').toUpperCase();
            server.log.push(`${method} ${url.pathname}`);
            await new Promise((resolve, reject) => {
                if (init.signal?.aborted) return reject(abortError(init.signal));
                const timer = setTimeout(resolve, server.latency);
                init.signal?.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(abortError(init.signal));
                }, { once: true });
            });
            if (!online) throw new TypeError('Failed to fetch');
            const failure = server.failNext;
            server.failNext = null;
            if (failure === 0) throw new TypeError('Failed to fetch');
            const respond = (status, body) => new Response(body === undefined ? null : JSON.stringify(body), {
                status, headers: body === undefined ? {} : { 'content-type': 'application/json; charset=utf-8' },
            });
            if (failure) return respond(failure, { errors: { server: ['is having a bad day'] } });
            const path = url.pathname.replace(/\/+$/, '');
            for (const route of routes) {
                const match = route.method === method && route.regex.exec(path);
                if (!match) continue;
                try {
                    const params = Object.fromEntries(Object.entries(match.groups ?? {}).map(([key, value]) => [key, decodeURIComponent(value)]));
                    const body = typeof init.body === 'string' && init.body ? JSON.parse(init.body) : undefined;
                    const result = route.handler({ params, body });
                    const [status, payload] = Array.isArray(result) && typeof result[0] === 'number' ? result : [200, result];
                    return respond(status, payload === undefined ? undefined : copy(payload));
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

// Pages can set window.docsLatency (ms) before this script runs, e.g. 0 in tests or 800 to watch conflicts unfold.
window.docsServer ??= window.createDocsServer({ latency: window.docsLatency ?? 120 }).install();
