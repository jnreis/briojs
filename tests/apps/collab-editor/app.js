/*
 * Brio Docs — a collaborative block editor: realtime operational transformation with teammates,
 * live cursors, offline editing that syncs on reconnect, version history, and documents whose
 * sessions outlive the page that opened them until every change is saved.
 */
(() => {
    const OT = window.DocsOT;
    const server = window.docsServer;
    const CLIENT_ID = `tab-${Math.random().toString(36).slice(2, 8)}`;
    let sequence = 0;
    const newId = prefix => `${prefix}-${CLIENT_ID.slice(4)}-${(++sequence).toString(36)}`;
    const quote = text => `“${text.length > 40 ? `${text.slice(0, 39)}…` : text || 'Untitled'}”`;

    // --- API -------------------------------------------------------------------------------------

    class ApiError extends Error {
        constructor(status, errors, cause) {
            const sentence = text => text.charAt(0).toUpperCase() + text.slice(1);
            const first = Object.entries(errors ?? {}).flatMap(([field, list]) => [].concat(list).map(text => sentence(`${field} ${text}`)))[0];
            super(status === 0 ? 'You appear to be offline' : first ?? 'The server had a problem', { cause });
            this.name = 'ApiError';
            this.status = status;
        }
    }
    async function request(method, path, input, options) {
        try {
            return await brio.http[method](`/api${path}`, input, options);
        } catch (error) {
            if (error?.name === 'AbortError') throw error;
            if (error instanceof brio.HttpError) {
                const payload = await error.response.json().catch(() => null);
                throw new ApiError(error.status, payload?.errors, error);
            }
            throw new ApiError(0, null, error);
        }
    }
    const api = {
        get: (path, options) => request('get', path, undefined, options),
        post: (path, body) => request('post', path, body),
        delete: path => request('delete', path),
    };

    // --- Shared stores ---------------------------------------------------------------------------

    const members = brio.state({
        list: Object.values(server.members),
        get(id) { return this.list.find(member => member.id === id) ?? { id, name: id, initials: '?', color: '#6b7280' }; },
    });
    const net = brio.state({ status: 'connecting' });
    const sync = brio.state({
        /** Document id → changes not yet confirmed by the server, including documents closed while saving. */
        pending: {},
        get total() { return Object.values(this.pending).reduce((sum, count) => sum + count, 0); },
        get status() {
            if (net.status === 'offline') return 'offline';
            if (this.total) return 'saving';
            return net.status === 'live' ? 'saved' : 'connecting';
        },
    });
    const toasts = brio.state({
        list: [],
        announcement: '',
        show(message, { tone = 'info', action = null, timeout = action ? 10_000 : 5000 } = {}) {
            const toast = { id: newId('toast'), message, tone, action };
            this.list.push(toast);
            this.announcement = message;
            setTimeout(() => this.dismiss(toast.id), timeout);
            return toast;
        },
        run(toast) {
            this.dismiss(toast.id);
            toast.action?.run();
        },
        dismiss(id) {
            const index = this.list.findIndex(toast => toast.id === id);
            if (index >= 0) this.list.splice(index, 1);
        },
    });

    // --- Realtime connection ---------------------------------------------------------------------

    const sessions = new Map();
    let socket = null;
    let dropped = false;
    const send = message => net.status === 'live' && socket.send(message);
    function connect() {
        socket = server.connect(message => {
            if (message.type === 'open') {
                net.status = 'live';
                socket.send({ type: 'hello', client: CLIENT_ID });
                for (const session of sessions.values()) session.join();
                // List updates sent while offline were missed.
                if (dropped) library.load();
                dropped = false;
            } else if (message.type === 'closed') {
                net.status = 'offline';
                dropped = true;
                for (const session of sessions.values()) session.disconnect();
            } else if (message.type === 'docs') {
                library.receive(message);
            } else {
                sessions.get(message.doc)?.receive(message);
            }
        });
    }

    // --- Document sessions -----------------------------------------------------------------------

    /**
     * One open document. The client keeps at most one batch of operations in flight; everything typed
     * meanwhile waits in `buffer`. Remote operations are transformed past both before they are applied,
     * so local text never jumps, and pending local work is transformed past them in turn.
     *
     * Sessions are shared and reference-counted: every view that shows the document retains it. When the
     * last view releases it, the session stays alive until the server has confirmed every change, so
     * leaving a document (or going offline and navigating away) never loses typing.
     */
    class Session {
        constructor(id) {
            this.id = id;
            this.state = brio.state({
                status: 'loading', error: '', deletedBy: '', rev: 0, blocks: [], presence: [], pending: 0,
                get titleBlock() { return this.blocks.find(block => block.type === 'title') ?? null; },
                get title() { return this.titleBlock?.text ?? ''; },
                get visible() { return this.blocks.filter(block => !block.deleted && block.type !== 'title'); },
            });
            this.refs = 0;
            this.closed = false;
            this.joined = false;
            this.inflight = null;
            this.buffer = [];
            this.remote = [];
            this.caret = null;
            this.sentCaret = 'null';
            this.seq = 0;
            this.controller = new AbortController();
            this.load();
        }

        get blocks() { return this.state.blocks; }
        block(id) { return this.state.blocks.find(block => block.id === id) ?? null; }

        async load() {
            const { state } = this;
            state.status = 'loading';
            state.error = '';
            try {
                const snapshot = await api.get(`/docs/${encodeURIComponent(this.id)}`, { signal: this.controller.signal });
                if (this.closed) return;
                brio.batch(() => {
                    state.rev = snapshot.rev;
                    state.blocks = snapshot.blocks;
                    state.status = 'ready';
                });
                this.join();
            } catch (error) {
                if (this.closed || error?.name === 'AbortError') return;
                state.status = error.status === 404 ? 'gone' : 'error';
                state.error = error.message;
            }
        }

        join() {
            if (this.closed || this.joined || net.status !== 'live' || this.state.status !== 'ready') return;
            this.joined = true;
            send({ type: 'join', doc: this.id, rev: this.state.rev });
            // A batch sent before the connection dropped may or may not have landed; the id makes the resend safe.
            if (this.inflight) send({ type: 'submit', doc: this.id, ...this.inflight.submitted });
            this.sentCaret = 'null';
            this.flush();
            this.announce();
        }

        disconnect() {
            this.joined = false;
            this.remote = [];
            this.state.presence = [];
        }

        receive(message) {
            if (message.type === 'ops') return this.receiveOps(message);
            if (message.type === 'presence') {
                if (message.rev !== this.state.rev) return;
                this.remote = message.users.filter(user => user.client !== CLIENT_ID && user.block);
                return this.remap();
            }
            if (message.type === 'gone') {
                brio.batch(() => {
                    this.state.status = 'gone';
                    this.state.deletedBy = members.get(message.by).name;
                    this.state.presence = [];
                });
                this.inflight = null;
                this.buffer = [];
                this.joined = false;
                return this.update();
            }
            if (message.type === 'error') this.resync(message.message);
        }

        receiveOps(message) {
            const { state } = this;
            if (state.status !== 'ready' || message.rev <= state.rev) return;
            if (message.rev !== state.rev + 1) return this.resync('Missed an update');
            if (this.inflight?.submitted.id === message.id) {
                this.inflight = null;
                state.rev = message.rev;
                this.update();
                return this.flush();
            }
            let remote = message.ops;
            if (this.inflight) [this.inflight.ops, remote] = OT.transformLists(this.inflight.ops, remote);
            [this.buffer, remote] = OT.transformLists(this.buffer, remote);
            const editing = this.caret?.block;
            brio.batch(() => {
                for (const op of remote) OT.apply(state.blocks, op);
                state.rev = message.rev;
            });
            const removed = remote.find(op => op.t === 'set' && op.deleted === true && op.b === editing && op.b !== 'title');
            if (removed) {
                const who = members.get(message.actor).name;
                const kind = { h1: 'heading', h2: 'heading', todo: 'to-do', code: 'code block', quote: 'quote', bullet: 'list item' }[this.block(removed.b)?.type] ?? 'paragraph';
                this.setCaret(null);
                toasts.show(`${who} deleted the ${kind} you were editing`, {
                    tone: 'warn',
                    action: { label: 'Restore', run: () => this.restoreBlock(removed.b) },
                });
            }
        }

        /** Applies local operations right away and queues them for the server. */
        edit(ops) {
            if (this.state.status !== 'ready' || !ops.length) return;
            brio.batch(() => {
                for (const op of ops) OT.apply(this.state.blocks, op);
            });
            for (const op of ops) {
                const last = this.buffer.at(-1);
                // Typing a word is one insert, holding Backspace one delete, so batches stay small.
                if (last?.t === 'ins' && op.t === 'ins' && last.b === op.b && last.p + last.s.length === op.p) last.s += op.s;
                else if (last?.t === 'del' && op.t === 'del' && last.b === op.b && op.p + op.n === last.p) {
                    last.p = op.p;
                    last.n += op.n;
                } else this.buffer.push({ ...op });
            }
            this.update();
            this.remap();
            this.flush();
        }

        flush() {
            if (this.inflight || !this.buffer.length || !this.joined || net.status !== 'live') return;
            const submitted = { id: `${CLIENT_ID}:${this.id}:${++this.seq}`, base: this.state.rev, ops: this.buffer };
            this.inflight = { submitted, ops: this.buffer };
            this.buffer = [];
            send({ type: 'submit', doc: this.id, ...submitted });
        }

        update() {
            const pending = (this.inflight ? this.inflight.submitted.ops.length : 0) + this.buffer.length;
            if (this.state.pending !== pending) this.state.pending = pending;
            if (pending) sync.pending[this.id] = pending;
            else if (this.id in sync.pending) delete sync.pending[this.id];
            if (pending) return;
            this.announce();
            if (!this.refs) this.finish();
        }

        /** Teammates' cursors arrive in server coordinates; shift them past local changes the server hasn't seen. */
        remap() {
            const pending = [...(this.inflight?.ops ?? []), ...this.buffer];
            this.state.presence = this.remote.map(user => {
                let { start, end } = user;
                for (const op of pending) {
                    start = OT.mapOffset(user.block, start, op);
                    end = OT.mapOffset(user.block, end, op);
                }
                return { ...user, start, end };
            });
        }

        setCaret(block, start = 0, end = start) {
            this.caret = block ? { block, start, end } : null;
            this.announce();
        }

        /** Shares the cursor once the server has every local change, so the offsets mean the same thing there. */
        announce() {
            if (!this.joined || this.state.pending) return;
            const key = JSON.stringify(this.caret);
            if (key === this.sentCaret) return;
            this.sentCaret = key;
            send({ type: 'presence', doc: this.id, block: this.caret?.block ?? null, start: this.caret?.start, end: this.caret?.end });
        }

        resync(reason) {
            if (this.joined) send({ type: 'leave', doc: this.id });
            this.joined = false;
            const lost = Boolean(this.inflight || this.buffer.length);
            this.inflight = null;
            this.buffer = [];
            this.update();
            if (lost) toasts.show(`${reason}. Reloaded the document; your last edit may need retyping.`, { tone: 'warn' });
            this.load();
        }

        retain() {
            this.refs += 1;
            return this;
        }

        release() {
            this.refs -= 1;
            if (!this.refs && (!this.state.pending || this.state.status !== 'ready')) this.finish();
        }

        finish() {
            if (this.refs || this.closed) return;
            this.closed = true;
            this.controller.abort();
            if (this.joined) send({ type: 'leave', doc: this.id });
            this.joined = false;
            if (sessions.get(this.id) === this) sessions.delete(this.id);
            delete sync.pending[this.id];
        }

        // Editing commands ------------------------------------------------------------------------

        /** The block after `block` in document order (deleted blocks included), for picking positions. */
        neighbour(block, offset) {
            return this.blocks[this.blocks.indexOf(block) + offset] ?? null;
        }

        /** Enter: moves the text after the selection into a new block. Returns the block to focus. */
        split(id, start, end) {
            const block = this.block(id);
            if (!block) return null;
            if (block.type === 'title') return this.state.visible[0]?.id ?? this.append('p', '');
            if (!block.text && ['bullet', 'todo', 'quote'].includes(block.type)) {
                this.edit([{ t: 'set', b: id, type: 'p' }]);
                return id;
            }
            const tail = block.text.slice(end);
            const created = newId('b');
            const type = ['bullet', 'todo'].includes(block.type) && start > 0 ? block.type : 'p';
            const ops = [];
            if (block.text.length > start) ops.push({ t: 'del', b: id, p: start, n: block.text.length - start });
            ops.push({ t: 'add', b: created, type, text: tail, pos: OT.between(block.pos, this.neighbour(block, 1)?.pos) });
            this.edit(ops);
            return created;
        }

        /** Backspace at the start: plain text first, then joins the previous block. Returns [block, offset]. */
        merge(id) {
            const block = this.block(id);
            if (!block || block.type === 'title') return null;
            if (block.type !== 'p') {
                this.edit([{ t: 'set', b: id, type: 'p' }]);
                return [id, 0];
            }
            const visible = this.state.visible;
            const previous = visible[visible.indexOf(block) - 1];
            if (!previous) return null;
            const at = previous.text.length;
            const ops = block.text ? [{ t: 'ins', b: previous.id, p: at, s: block.text }] : [];
            ops.push({ t: 'set', b: id, deleted: true });
            this.edit(ops);
            return [previous.id, at];
        }

        append(type, text) {
            const id = newId('b');
            const last = this.blocks.at(-1);
            this.edit([{ t: 'add', b: id, type, text, pos: OT.between(last?.pos, null) }]);
            return id;
        }

        setType(id, type) {
            if (this.block(id)?.type !== type) this.edit([{ t: 'set', b: id, type }]);
        }

        move(id, offset) {
            const visible = this.state.visible;
            const index = visible.findIndex(block => block.id === id);
            const target = index + offset;
            if (index < 0 || target < 0 || target >= visible.length) return;
            const [before, after] = offset < 0 ? [visible[target - 1], visible[target]] : [visible[target], visible[target + 1]];
            this.edit([{ t: 'set', b: id, pos: OT.between(before?.pos ?? 0, after?.pos) }]);
        }

        remove(id) {
            const block = this.block(id);
            if (!block) return;
            this.edit([{ t: 'set', b: id, deleted: true }]);
            toasts.show(`Deleted ${quote(block.text)}`, { action: { label: 'Undo', run: () => this.restoreBlock(id) } });
        }

        restoreBlock(id) {
            if (this.state.status !== 'ready' || !this.block(id)) return;
            this.edit([{ t: 'set', b: id, deleted: false }]);
            focusBlock(id, this.block(id).text.length);
        }

        /** The operations that turn the current document into `target` (a list of blocks). */
        restore(target) {
            const ops = [];
            const current = new Map(this.blocks.map(block => [block.id, block]));
            for (const goal of target) {
                const block = current.get(goal.id);
                if (!block) {
                    ops.push({ t: 'add', b: goal.id, type: goal.type, text: goal.text, pos: goal.pos });
                    if (goal.checked) ops.push({ t: 'set', b: goal.id, checked: true });
                    continue;
                }
                const attrs = {};
                for (const key of ['type', 'checked', 'pos', 'deleted']) if (block[key] !== goal[key]) attrs[key] = goal[key];
                if (Object.keys(attrs).length) ops.push({ t: 'set', b: goal.id, ...attrs });
                ops.push(...OT.diff(goal.id, block.text, goal.text));
            }
            const kept = new Set(target.map(block => block.id));
            for (const block of this.blocks) if (!kept.has(block.id) && !block.deleted) ops.push({ t: 'set', b: block.id, deleted: true });
            this.edit(ops);
            return ops.length;
        }
    }

    function openSession(id) {
        let session = sessions.get(id);
        if (!session) {
            session = new Session(id);
            sessions.set(id, session);
        }
        return session.retain();
    }

    /** Focuses a block's text field once it is rendered, with the caret at `offset`. */
    function focusBlock(id, offset = 0) {
        brio.flush();
        // A block deleted and restored quickly can briefly exist twice: the old copy is still fading out.
        const input = [...document.querySelectorAll('[data-block-id] textarea')]
            .find(field => field.closest('[data-block-id]').dataset.blockId === id && !field.closest('.block-leave-active'));
        if (!input) return;
        input.focus();
        const at = Math.min(offset, input.value.length);
        input.setSelectionRange(at, at);
        input.dispatchEvent(new Event('select'));
    }

    // --- Document list ---------------------------------------------------------------------------

    const library = brio.state({
        status: 'loading', error: '', docs: [], creating: false, createError: '',
        get sorted() { return [...this.docs].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)); },
        async load() {
            if (!this.docs.length) this.status = 'loading';
            try {
                const docs = await api.get('/docs');
                this.docs = docs;
                this.status = 'ready';
                this.error = '';
            } catch (error) {
                if (this.docs.length) return;
                this.status = 'error';
                this.error = error.message;
            }
        },
        receive(message) {
            const index = this.docs.findIndex(doc => doc.id === (message.removed ?? message.doc.id));
            if (message.removed) {
                if (index >= 0) this.docs.splice(index, 1);
            } else if (index >= 0) Object.assign(this.docs[index], message.doc);
            else this.docs.push(message.doc);
        },
        async create(title) {
            if (this.creating) return;
            this.creating = true;
            this.createError = '';
            try {
                const doc = await api.post('/docs', { title: title.trim() });
                this.receive({ doc });
                editor.focus = { doc: doc.id, block: doc.title ? 'first' : 'title' };
                await router.navigate(`/d/${doc.id}`);
                return true;
            } catch (error) {
                this.createError = error.message;
                return false;
            } finally {
                this.creating = false;
            }
        },
        async remove(doc) {
            if (!confirm(`Delete ${quote(doc.title)} for everyone? This cannot be undone.`)) return;
            const index = this.docs.indexOf(doc);
            this.docs.splice(index, 1);
            try {
                await api.delete(`/docs/${encodeURIComponent(doc.id)}`);
                toasts.show(`Deleted ${quote(doc.title)}`);
            } catch (error) {
                if (error.status === 404) return;
                this.docs.splice(Math.min(index, this.docs.length), 0, doc);
                toasts.show(`Couldn't delete ${quote(doc.title)}: ${error.message}`, { tone: 'error' });
            }
        },
    });

    // --- Formatting ------------------------------------------------------------------------------

    const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const clock = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });
    const day = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const now = brio.state({ value: Date.now() });
    setInterval(() => { now.value = Date.now(); }, 30_000);
    const format = {
        ago(iso) {
            const seconds = Math.round((new Date(iso).getTime() - now.value) / 1000);
            if (seconds > -45) return 'just now';
            const minutes = Math.round(seconds / 60);
            if (minutes > -60) return relative.format(minutes, 'minute');
            const hours = Math.round(minutes / 60);
            return hours > -24 ? relative.format(hours, 'hour') : day.format(new Date(iso));
        },
        clock: iso => clock.format(new Date(iso)),
        member: id => members.get(id),
        words: count => `${count} word${count === 1 ? '' : 's'}`,
    };
    const TYPES = [
        { type: 'p', label: 'Text' },
        { type: 'h1', label: 'Heading' },
        { type: 'h2', label: 'Subheading' },
        { type: 'bullet', label: 'Bulleted list' },
        { type: 'todo', label: 'To-do' },
        { type: 'quote', label: 'Quote' },
        { type: 'code', label: 'Code' },
    ];
    /** Typing one of these at the start of a block turns it into that kind of block. */
    const SHORTCUTS = {
        p: [['# ', 'h1'], ['## ', 'h2'], ['- ', 'bullet'], ['* ', 'bullet'], ['[] ', 'todo'], ['> ', 'quote'], ['```', 'code']],
        bullet: [['[ ] ', 'todo'], ['[] ', 'todo']],
    };

    // --- Simulator -------------------------------------------------------------------------------

    /** The open editor's session, and a block to focus once a newly created document has loaded. */
    const editor = brio.state({ doc: null, focus: null });
    const grace = server.teammate('grace');
    const ada = server.teammate('ada');
    let autoTimer = null;
    const demo = brio.state({
        latency: String(server.latency),
        online: true,
        auto: false,
        get open() { return Boolean(editor.doc && editor.doc.state.status === 'ready'); },
        setLatency(value) {
            this.latency = value;
            server.latency = Number(value);
        },
        /** The block you are in (or the first one), where a teammate can type right next to you. */
        target() {
            const doc = editor.doc;
            return doc?.caret?.block ?? doc?.state.visible[0]?.id ?? 'title';
        },
        async typeHere() {
            const doc = editor.doc;
            if (!doc) return;
            grace.enter(doc.id, this.target(), 0);
            await grace.type(doc.id, 'Grace was here. ', { delay: Number(this.latency) ? 90 : 0 });
        },
        async editElsewhere() {
            const doc = editor.doc;
            if (!doc) return;
            const id = ada.addBlock(doc.id, doc.state.visible.at(-1)?.id, '');
            ada.enter(doc.id, id, 0);
            await ada.type(doc.id, 'Ada: numbers look good, shipping Thursday.', { delay: Number(this.latency) ? 60 : 0 });
        },
        deleteYourBlock() {
            const doc = editor.doc;
            const id = this.target();
            if (doc && id !== 'title') grace.edit(doc.id, [{ t: 'set', b: id, deleted: true }]);
        },
        async rename() {
            const doc = editor.doc;
            if (!doc) return;
            ada.enter(doc.id, 'title');
            await ada.type(doc.id, ' (draft)', { delay: Number(this.latency) ? 80 : 0 });
            ada.leave(doc.id);
        },
        deleteDocument() {
            if (editor.doc) grace.removeDoc(editor.doc.id);
        },
        toggleOnline() {
            this.online = !this.online;
            server.setOnline(this.online);
        },
        toggleAuto() {
            this.auto = !this.auto;
            clearInterval(autoTimer);
            if (this.auto) autoTimer = setInterval(() => {
                if (!editor.doc || editor.doc.state.status !== 'ready') return;
                const pick = Math.random();
                if (pick < 0.5) this.typeHere();
                else this.editElsewhere();
            }, 4000);
        },
    });

    // --- Router ----------------------------------------------------------------------------------

    const router = brio.createRouter([
        { path: '/', component: 'doc-list' },
        { path: '/d/:id', component: 'doc-editor' },
        { path: '*', redirect: '/' },
    ], { mode: 'hash' });

    // --- App -------------------------------------------------------------------------------------

    const app = brio.createApp({
        router,
        stores: { library, sync, net, toasts, members, format, demo, editor, to: { doc: id => router.href(`/d/${id}`), home: () => router.href('/') } },
    });

    app.component('doc-list', {
        template: '#tpl-doc-list',
        setup({ $ref }) {
            return {
                draft: '',
                async create() {
                    if (await library.create(this.draft)) this.draft = '';
                    else $ref.title?.focus();
                },
                saving: id => Boolean(sync.pending[id]),
                people: doc => doc.here.map(format.member),
            };
        },
    });

    app.component('doc-editor', {
        template: '#tpl-doc-editor',
        setup({ route }) {
            const doc = openSession(route.params.id);
            editor.doc = doc;
            brio.onCleanup(() => {
                if (editor.doc === doc) editor.doc = null;
                doc.release();
            });
            const { state } = doc;
            brio.effect(() => {
                const request = editor.focus;
                if (state.status !== 'ready' || request?.doc !== doc.id) return;
                editor.focus = null;
                queueMicrotask(() => focusBlock(request.block === 'first' ? state.visible[0]?.id ?? 'title' : request.block));
            });
            return {
                doc,
                get state() { return state; },
                get history() { return 'history' in route.query; },
                /** Everyone in the document, you first. */
                get people() {
                    const actors = [...new Set(state.presence.map(user => user.actor))];
                    return [members.get('you'), ...actors.filter(actor => actor !== 'you').map(members.get.bind(members))];
                },
                get words() {
                    return state.blocks.reduce((sum, block) => sum + (block.deleted ? 0 : block.text.match(/\S+/g)?.length ?? 0), 0);
                },
                toggleHistory() {
                    router.navigate(this.history ? `/d/${doc.id}` : `/d/${doc.id}?history`);
                },
                addBlock() {
                    focusBlock(doc.append('p', ''));
                },
                retry() { doc.load(); },
            };
        },
    });

    app.component('doc-block', {
        template: '#tpl-doc-block',
        setup({ $props, $ref }) {
            const block = () => $props.block;
            const doc = () => $props.doc;
            const track = () => {
                const input = $ref.input;
                if (input && document.activeElement === input) doc().setCaret(block().id, input.selectionStart, input.selectionEnd);
            };
            const caretAt = offset => {
                const input = $ref.input;
                input?.setSelectionRange(offset, offset);
                track();
            };
            return {
                menu: false,
                types: TYPES,
                get label() {
                    return block().type === 'title' ? 'Document title' : `${TYPES.find(entry => entry.type === block().type)?.label ?? 'Text'} block`;
                },
                get placeholder() {
                    if (block().type === 'title') return 'Untitled';
                    return { h1: 'Heading', h2: 'Subheading', todo: 'To-do', code: 'Code', quote: 'Quote', bullet: 'List' }[block().type]
                        ?? 'Type here, or start with #, -, [], > or ```';
                },
                /** Teammates whose cursor is in this block. */
                get editors() { return doc().state.presence.filter(user => user.block === block().id); },
                /**
                 * The block's text cut at teammates' cursors and selections, for the overlay that draws them.
                 * The overlay mirrors the textarea's text exactly (transparent), so marks line up with the letters.
                 */
                get parts() {
                    const text = block().text;
                    const clamp = offset => Math.max(0, Math.min(offset, text.length));
                    const users = this.editors.map(user => ({
                        ...user, from: clamp(Math.min(user.start, user.end)), to: clamp(Math.max(user.start, user.end)), at: clamp(user.end),
                    }));
                    const cuts = [...new Set([0, text.length, ...users.flatMap(user => [user.from, user.to, user.at])])].sort((a, b) => a - b);
                    const parts = [];
                    cuts.forEach((cut, index) => {
                        for (const user of users) if (user.at === cut) parts.push({
                            key: `caret-${user.client}`, text: '', className: 'remote-caret', name: user.name.split(' ')[0],
                            style: { '--who': user.color },
                        });
                        const next = cuts[index + 1];
                        if (next == null || next === cut) return;
                        const owner = users.find(user => user.from <= cut && user.to >= next && user.from !== user.to);
                        parts.push({
                            key: `text-${cut}`, text: text.slice(cut, next), className: owner ? 'remote-selection' : '', name: null,
                            style: owner ? { '--who': owner.color } : {},
                        });
                    });
                    return parts;
                },
                input(event) {
                    const input = event.target;
                    const current = block();
                    const value = input.value;
                    const ops = OT.diff(current.id, current.text, value, input.selectionEnd);
                    const caret = input.selectionEnd;
                    for (const [prefix, type] of SHORTCUTS[current.type] ?? []) {
                        if (caret === prefix.length && value.startsWith(prefix) && !current.text.startsWith(prefix)) {
                            ops.push({ t: 'del', b: current.id, p: 0, n: prefix.length }, { t: 'set', b: current.id, type });
                            break;
                        }
                    }
                    doc().edit(ops);
                    brio.flush();
                    track();
                },
                keydown(event) {
                    const input = event.target;
                    const { selectionStart: start, selectionEnd: end } = input;
                    const current = block();
                    if (event.isComposing) return;
                    if (event.key === 'Enter' && !event.shiftKey && current.type !== 'code') {
                        event.preventDefault();
                        const next = doc().split(current.id, start, end);
                        if (next) focusBlock(next, 0);
                    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && current.type === 'code') {
                        event.preventDefault();
                        focusBlock(doc().split(current.id, end, end), 0);
                    } else if (event.key === 'Backspace' && start === 0 && end === 0) {
                        const target = doc().merge(current.id);
                        if (!target) return;
                        event.preventDefault();
                        if (target[0] === current.id) caretAt(0);
                        else focusBlock(...target);
                    } else if (event.key === 'ArrowUp' && start === 0 && end === 0 || event.key === 'ArrowDown' && start === input.value.length) {
                        const visible = [doc().state.titleBlock, ...doc().state.visible];
                        const neighbour = visible[visible.indexOf(current) + (event.key === 'ArrowUp' ? -1 : 1)];
                        if (!neighbour) return;
                        event.preventDefault();
                        focusBlock(neighbour.id, event.key === 'ArrowUp' ? neighbour.text.length : 0);
                    } else if (event.key === 'Escape') {
                        input.blur();
                    }
                },
                track,
                blur() {
                    if (doc().caret?.block === block().id) doc().setCaret(null);
                },
                toggle() {
                    doc().edit([{ t: 'set', b: block().id, checked: !block().checked }]);
                },
                setType(type) {
                    this.menu = false;
                    doc().setType(block().id, type);
                    focusBlock(block().id, block().text.length);
                },
                move(offset) {
                    this.menu = false;
                    doc().move(block().id, offset);
                },
                remove() {
                    this.menu = false;
                    doc().remove(block().id);
                },
            };
        },
    });

    app.component('doc-history', {
        template: '#tpl-doc-history',
        setup({ $props }) {
            const doc = $props.doc;
            // Reading `rev` before the first await refetches (and aborts the previous request) on every change.
            const history = brio.resource(async signal => {
                const rev = doc.state.rev;
                const result = await api.get(`/docs/${encodeURIComponent(doc.id)}/history`, { signal });
                return { ...result, rev };
            });
            const view = brio.state({ selected: null });
            const replay = upTo => {
                const data = history.data.value;
                const blocks = JSON.parse(JSON.stringify(data.origin));
                for (const entry of data.entries) {
                    if (entry.rev > upTo) break;
                    for (const op of entry.ops) OT.apply(blocks, op);
                }
                return blocks;
            };
            return {
                view,
                get loading() { return history.loading.value && !history.data.value; },
                get error() { return history.error.value?.message ?? ''; },
                /** Consecutive changes by the same person within two minutes read as one edit session. */
                get groups() {
                    const data = history.data.value;
                    if (!data) return [];
                    const groups = [];
                    for (const entry of data.entries) {
                        const last = groups.at(-1);
                        if (last && last.actor === entry.actor && new Date(entry.at) - new Date(last.at) < 120_000) {
                            last.to = entry.rev;
                            last.at = entry.at;
                            last.count += 1;
                        } else groups.push({ actor: entry.actor, from: entry.rev, to: entry.rev, at: entry.at, count: 1 });
                    }
                    groups.reverse();
                    return [...groups, { actor: null, from: 0, to: 0, at: data.createdAt, count: 0 }];
                },
                get preview() {
                    if (view.selected == null || !history.data.value) return null;
                    return replay(view.selected).filter(block => !block.deleted).sort(OT.order);
                },
                isCurrent: group => group.to === doc.state.rev,
                select(group) { view.selected = view.selected === group.to ? null : group.to; },
                restore() {
                    const rev = view.selected;
                    const group = this.groups.find(entry => entry.to === rev);
                    if (rev == null || !group) return;
                    const changed = doc.restore(replay(rev));
                    view.selected = null;
                    toasts.show(changed ? `Restored the version from ${format.clock(group.at)}` : 'That version matches the document');
                },
            };
        },
    });

    // --- Start -----------------------------------------------------------------------------------

    const root = app.mount('#app');
    brio.effect(() => {
        const doc = editor.doc;
        const title = doc?.state.status === 'ready' ? doc.state.title || 'Untitled' : '';
        document.title = title ? `${title} · Brio Docs` : 'Brio Docs';
    });
    connect();
    library.load();
    const unsaved = event => {
        if (!sync.total) return;
        event.preventDefault();
        event.returnValue = '';
    };
    window.addEventListener('beforeunload', unsaved);
    window.addEventListener('pagehide', () => {
        socket.close();
        clearInterval(autoTimer);
    });
    window.docsApp = { app, root, router, library, sync, net, toasts, editor, demo, sessions, server, clientId: CLIENT_ID, focusBlock };
})();
