/*
 * Kanban — a Trello-style board: drag-and-drop (mouse and keyboard), nested lists/cards/checklists,
 * optimistic updates with rollback, and realtime sync with teammates through a versioned change feed.
 */
(() => {
    const BOARD = 'launch';
    const STEP = 1024;
    const CLIENT_ID = `tab-${Math.random().toString(36).slice(2, 8)}`;
    const server = window.kanbanServer;
    let sequence = 0;
    /** Client-generated ids keep keyed rows stable when the server confirms a new card or list. */
    const newId = prefix => `${prefix}-${CLIENT_ID.slice(4)}-${(++sequence).toString(36)}`;
    const clone = value => JSON.parse(JSON.stringify(value));
    const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
    const byPosition = (left, right) => left.position - right.position;

    // --- API -------------------------------------------------------------------------------------

    class ApiError extends Error {
        constructor(status, errors, cause) {
            const sentence = text => text.charAt(0).toUpperCase() + text.slice(1);
            const first = Object.entries(errors ?? {}).flatMap(([field, list]) => [].concat(list).map(text => sentence(`${field} ${text}`)))[0];
            super(status === 0 ? 'You appear to be offline' : status === 404 ? 'It no longer exists' : first ?? 'The server had a problem', { cause });
            this.name = 'ApiError';
            this.status = status;
        }
    }
    async function request(method, path, input) {
        try {
            return await brio.http[method](`/api${path}`, input, { headers: { 'x-client-id': CLIENT_ID } });
        } catch (error) {
            if (error instanceof brio.HttpError) {
                const payload = await error.response.json().catch(() => null);
                throw new ApiError(error.status, payload?.errors, error);
            }
            throw new ApiError(0, null, error);
        }
    }
    const api = {
        get: (path, query) => request('get', path, query),
        post: (path, body) => request('post', path, body),
        patch: (path, body) => request('patch', path, body),
        delete: path => request('delete', path),
    };

    // --- Board state -----------------------------------------------------------------------------
    // `board` is what the user sees: server data plus optimistic changes, nested as lists → cards → checklist.

    const board = brio.state({
        status: 'loading', error: '', title: '', version: 0,
        lists: [], labels: [], members: [],
    });
    const sync = brio.state({
        connection: 'connecting',
        saving: 0,
        /** `kind:id` → number of requests in flight, so tiles can show that they are saving. */
        busy: {},
        toasts: [],
        activity: [],
        /** Card id → teammate who just changed it, for a short highlight. */
        touched: {},
        /** Card id → who deleted it, so an open card can explain why it vanished. */
        deletedBy: {},
        get status() {
            if (this.connection === 'offline') return 'offline';
            if (this.saving) return 'saving';
            return this.connection === 'live' ? 'saved' : 'connecting';
        },
    });
    const prefs = brio.persist('kanban.prefs', { activity: true });
    const filter = brio.state({
        text: '',
        labels: [],
        get active() { return Boolean(this.text.trim() || this.labels.length); },
        clear() {
            this.text = '';
            this.labels = [];
        },
        toggle(label) {
            const index = this.labels.indexOf(label);
            if (index < 0) this.labels.push(label);
            else this.labels.splice(index, 1);
        },
    });
    const matches = card => {
        const text = filter.text.trim().toLowerCase();
        return (!text || card.title.toLowerCase().includes(text) || card.description.toLowerCase().includes(text)) &&
            filter.labels.every(label => card.labels.includes(label));
    };

    const find = {
        list: id => board.lists.find(list => list.id === id) ?? null,
        card(id) {
            for (const list of board.lists) {
                const card = list.cards.find(entry => entry.id === id);
                if (card) return { list, card };
            }
            return null;
        },
        member: id => board.members.find(member => member.id === id) ?? { id, name: id, initials: '?', color: '#6b7280' },
        label: id => board.labels.find(label => label.id === id),
    };
    const insertSorted = (items, item) => {
        const index = items.findIndex(other => other.position > item.position);
        items.splice(index < 0 ? items.length : index, 0, item);
    };
    const freshCard = data => ({
        id: data.id, listId: data.listId, title: data.title, description: data.description ?? '',
        labels: clone(data.labels ?? []), checklist: clone(data.checklist ?? []), due: data.due ?? null, position: data.position,
    });
    /** Moves a card (the same reactive object) to a list and position. */
    const place = (card, listId, position) => {
        const from = find.card(card.id);
        if (from) from.list.cards.splice(from.list.cards.indexOf(from.card), 1);
        card.listId = listId;
        card.position = position;
        const target = find.list(listId);
        if (target) insertSorted(target.cards, card);
    };

    // --- Sync engine -----------------------------------------------------------------------------
    // `shadow` holds the newest server copy of each entity. Visible state = shadow + fields with requests in flight.
    // Server responses and change events update the shadow; `reconcile` then rewrites every field that is not
    // in flight. A failed request simply stops being in flight, so reconciling rolls it back to the server's
    // copy, including any teammate changes that arrived meanwhile.

    const shadow = { card: new Map(), list: new Map() };
    const inflight = new Map();
    const CARD_FIELDS = ['title', 'description', 'labels', 'checklist', 'due'];
    const pending = (kind, id, field) => (inflight.get(`${kind}:${id}`)?.get(field) ?? 0) > 0;
    const mark = (kind, id, fields, delta) => {
        const key = `${kind}:${id}`;
        const counts = inflight.get(key) ?? new Map();
        for (const field of fields) counts.set(field, (counts.get(field) ?? 0) + delta);
        inflight.set(key, counts);
        sync.busy[key] = (sync.busy[key] ?? 0) + delta;
        if (!sync.busy[key]) delete sync.busy[key];
    };
    const remember = (kind, data, version = data.version) => {
        const known = shadow[kind].get(data.id);
        if (known && known.version > version) return false;
        shadow[kind].set(data.id, { ...clone(data), version });
        return true;
    };

    function reconcileCard(id) {
        const truth = shadow.card.get(id);
        const local = find.card(id)?.card;
        const owned = field => pending('card', id, field);
        if (!truth || truth.deleted) {
            if (local && !owned('exists')) place(local, null, local.position);
            return;
        }
        if (!local) {
            if (!owned('exists') && find.list(truth.listId)) insertSorted(find.list(truth.listId).cards, freshCard(truth));
            return;
        }
        for (const field of CARD_FIELDS)
            if (!owned(field) && !same(local[field], truth[field])) local[field] = clone(truth[field]);
        if (!owned('place') && (local.listId !== truth.listId || local.position !== truth.position))
            place(local, truth.listId, truth.position);
    }

    function reconcileList(id) {
        const truth = shadow.list.get(id);
        const local = find.list(id);
        const owned = field => pending('list', id, field);
        if (!truth || truth.deleted) {
            if (local && !owned('exists')) board.lists.splice(board.lists.indexOf(local), 1);
            return;
        }
        if (!local) {
            if (owned('exists')) return;
            const list = { id, title: truth.title, position: truth.position, cards: [] };
            insertSorted(board.lists, list);
            for (const card of shadow.card.values())
                if (card.listId === id && !card.deleted) reconcileCard(card.id);
            return;
        }
        if (!owned('title') && local.title !== truth.title) local.title = truth.title;
        if (!owned('place') && local.position !== truth.position) {
            board.lists.splice(board.lists.indexOf(local), 1);
            local.position = truth.position;
            insertSorted(board.lists, local);
        }
    }
    const reconcile = (kind, id) => (kind === 'card' ? reconcileCard : reconcileList)(id);

    let toastSeed = 0;
    const toast = (message, { retry, tone = 'error' } = {}) => {
        const entry = { id: ++toastSeed, message, tone, retry };
        sync.toasts.push(entry);
        if (!retry) setTimeout(() => dismiss(entry.id), 5000);
    };
    const dismiss = id => {
        const index = sync.toasts.findIndex(entry => entry.id === id);
        if (index >= 0) sync.toasts.splice(index, 1);
    };

    /**
     * Applies a change immediately, sends it, and lets the server's answer win. `fields` are protected from
     * teammate updates while the request is in flight; on failure they fall back to the server copy.
     */
    async function mutate({ kind, id, fields, describe, apply, send, retry }) {
        brio.batch(() => {
            mark(kind, id, fields, 1);
            sync.saving++;
            apply();
        });
        let failure = null;
        try {
            const response = await send();
            const data = response?.[kind];
            // DELETE answers 204; nothing newer can exist for a deleted id.
            if (data) remember(kind, data);
            else remember(kind, { id, deleted: true }, Infinity);
        } catch (error) {
            failure = error;
            // Deleting something that is already gone is still a success.
            if (error.status === 404 && fields.includes('exists') && !find[kind](id)) failure = null;
        }
        brio.batch(() => {
            mark(kind, id, fields, -1);
            sync.saving--;
            reconcile(kind, id);
        });
        if (failure) {
            toast(`Couldn't ${describe}. ${failure.message}.`, { retry: failure.status === 404 ? undefined : retry });
            if (failure.status === 404) catchUp();
        }
        return !failure;
    }

    // --- Remote changes --------------------------------------------------------------------------

    let catching = null;
    let again = false;
    /** Pulls every event after our version; serialized so events always apply in order. */
    function catchUp() {
        if (board.status !== 'ready') return null;
        if (catching) {
            again = true;
            return catching;
        }
        catching = (async () => {
            do {
                again = false;
                const { events } = await api.get(`/boards/${BOARD}/changes`, { since: board.version });
                brio.batch(() => events.forEach(applyEvent));
            } while (again);
        })().catch(() => {
            // Offline or failing: the next notification or reconnect tries again.
        }).finally(() => {
            catching = null;
        });
        return catching;
    }

    const touchTimers = new Map();
    function applyEvent(event) {
        if (event.version <= board.version) return;
        board.version = event.version;
        const mine = event.clientId === CLIENT_ID;
        for (const change of event.changes) {
            const data = change.deleted ? { id: change.id, deleted: true } : change.data;
            if (!remember(change.kind, data, change.version)) continue;
            if (change.kind === 'list') reconcileList(change.id);
            else reconcileCard(change.id);
            if (mine || change.kind !== 'card') continue;
            if (change.deleted) sync.deletedBy[change.id] = find.member(event.actor).name;
            sync.touched[change.id] = event.actor;
            clearTimeout(touchTimers.get(change.id));
            touchTimers.set(change.id, setTimeout(() => delete sync.touched[change.id], 2500));
        }
        sync.activity.unshift({ version: event.version, actor: mine ? 'you' : event.actor, text: event.text, at: event.at });
        sync.activity.splice(30);
    }

    async function load() {
        board.status = 'loading';
        try {
            const { board: data } = await api.get(`/boards/${BOARD}`);
            brio.batch(() => {
                shadow.card.clear();
                shadow.list.clear();
                Object.assign(board, {
                    title: data.title, version: data.version, labels: data.labels, members: data.members,
                    lists: data.lists.map(list => {
                        remember('list', list);
                        return {
                            id: list.id, title: list.title, position: list.position,
                            cards: list.cards.map(card => (remember('card', card), freshCard(card))),
                        };
                    }),
                    status: 'ready', error: '',
                });
            });
            catchUp();
        } catch (error) {
            board.status = 'error';
            board.error = error.message;
        }
    }

    // --- Actions ---------------------------------------------------------------------------------

    const quote = text => `“${text}”`;
    const actions = {
        addList(title) {
            const last = board.lists.at(-1);
            const list = { id: newId('l'), title: title.trim(), position: (last?.position ?? 0) + STEP, cards: [] };
            return mutate({
                kind: 'list', id: list.id, fields: ['exists', 'title', 'place'], describe: `add the list ${quote(list.title)}`,
                apply: () => board.lists.push(list),
                send: () => api.post(`/boards/${BOARD}/lists`, { list: { id: list.id, title: list.title, position: list.position } }),
                retry: () => actions.addList(title),
            });
        },
        renameList(id, title) {
            const list = find.list(id);
            if (!list || !title.trim() || title.trim() === list.title) return;
            const before = list.title;
            return mutate({
                kind: 'list', id, fields: ['title'], describe: `rename ${quote(before)}`,
                apply: () => { list.title = title.trim(); },
                send: () => api.patch(`/lists/${id}`, { list: { title: title.trim() } }),
                retry: () => actions.renameList(id, title),
            });
        },
        moveList(id, offset) {
            const list = find.list(id);
            const others = board.lists.filter(entry => entry !== list);
            const index = board.lists.indexOf(list) + offset;
            if (!list || index < 0 || index > others.length) return;
            const before = others[index - 1]?.position ?? 0;
            const after = others[index]?.position ?? before + 2 * STEP;
            const position = (before + after) / 2;
            return mutate({
                kind: 'list', id, fields: ['place'], describe: `move the list ${quote(list.title)}`,
                apply: () => {
                    board.lists.splice(board.lists.indexOf(list), 1);
                    list.position = position;
                    insertSorted(board.lists, list);
                },
                send: () => api.patch(`/lists/${id}`, { list: { position } }),
                retry: () => actions.moveList(id, offset),
            });
        },
        removeList(id) {
            const list = find.list(id);
            if (!list) return;
            return mutate({
                kind: 'list', id, fields: ['exists'], describe: `delete ${quote(list.title)}`,
                apply: () => board.lists.splice(board.lists.indexOf(list), 1),
                send: () => api.delete(`/lists/${id}`),
                retry: () => actions.removeList(id),
            }).then(ok => {
                // The server deleted the cards with the list.
                if (ok) for (const card of list.cards) remember('card', { id: card.id, deleted: true }, Infinity);
                return ok;
            });
        },
        addCard(listId, title) {
            const list = find.list(listId);
            if (!list || !title.trim()) return;
            const last = list.cards.at(-1);
            const card = freshCard({ id: newId('c'), listId, title: title.trim(), position: (last?.position ?? 0) + STEP });
            return mutate({
                kind: 'card', id: card.id, fields: ['exists', 'title', 'place'], describe: `add ${quote(card.title)}`,
                apply: () => list.cards.push(card),
                send: () => api.post(`/lists/${listId}/cards`, { card: { id: card.id, title: card.title, position: card.position } }),
                retry: () => actions.addCard(listId, title),
            });
        },
        /** Moves a card in front of `beforeId` (or to the end) of a list. */
        moveCard(id, listId, beforeId = null) {
            const found = find.card(id);
            const target = find.list(listId);
            if (!found || !target) return;
            const { card } = found;
            const others = target.cards.filter(entry => entry !== card);
            const index = beforeId ? others.findIndex(entry => entry.id === beforeId) : others.length;
            if (index < 0) return;
            if (card.listId === listId && target.cards.indexOf(card) === index) return;
            const before = others[index - 1]?.position ?? 0;
            const after = others[index]?.position ?? before + 2 * STEP;
            const position = (before + after) / 2;
            const from = found.list.title;
            return mutate({
                kind: 'card', id, fields: ['place'],
                describe: card.listId === listId ? `move ${quote(card.title)}` : `move ${quote(card.title)} from ${from} to ${target.title}`,
                apply: () => place(card, listId, position),
                send: () => api.patch(`/cards/${id}`, { card: { listId, position } }),
                retry: () => actions.moveCard(id, listId, beforeId),
            });
        },
        updateCard(id, patch, describe) {
            const card = find.card(id)?.card;
            if (!card) return;
            const fields = Object.keys(patch);
            if (fields.every(field => same(card[field], patch[field]))) return;
            return mutate({
                kind: 'card', id, fields, describe: describe ?? `update ${quote(card.title)}`,
                apply: () => Object.assign(card, clone(patch)),
                send: () => api.patch(`/cards/${id}`, { card: patch }),
                retry: () => actions.updateCard(id, patch, describe),
            });
        },
        removeCard(id) {
            const found = find.card(id);
            if (!found) return;
            return mutate({
                kind: 'card', id, fields: ['exists'], describe: `delete ${quote(found.card.title)}`,
                apply: () => found.list.cards.splice(found.list.cards.indexOf(found.card), 1),
                send: () => api.delete(`/cards/${id}`),
                retry: () => actions.removeCard(id),
            });
        },
        retry(entry) {
            dismiss(entry.id);
            entry.retry?.();
        },
        dismiss,
        reload: load,
    };

    // --- Drag and drop ---------------------------------------------------------------------------
    // Mouse dragging uses native HTML drag events; keyboard users press Space on a card, move with the arrow
    // keys, and press Space again to drop or Escape to cancel. Both only move a drop marker until the drop.

    const dnd = brio.state({ kind: null, id: null, target: null, keyboard: false, announcement: '' });
    const visible = list => list.cards.filter(matches);
    // Reorders inside one list keep focus on their own; a card moved to another list is a new element.
    const focusCard = id => {
        brio.flush();
        const card = document.querySelector(`[data-card="${id}"]`);
        if (card && document.activeElement !== card) card.focus();
    };
    const setTarget = target => {
        if (!same(dnd.target, target)) dnd.target = target;
    };
    /** The card slot a card occupies now, as "in front of the next visible card". */
    const ownSlot = card => {
        const list = find.list(card.listId);
        const shown = visible(list);
        return { listId: list.id, beforeId: shown[shown.indexOf(card) + 1]?.id ?? null };
    };
    const describeTarget = () => {
        const list = find.list(dnd.target.listId);
        const shown = visible(list).filter(card => card.id !== dnd.id);
        const index = dnd.target.beforeId ? shown.findIndex(card => card.id === dnd.target.beforeId) : shown.length;
        return `${list.title}, position ${index + 1} of ${shown.length + 1}`;
    };
    const drag = {
        get active() { return dnd.kind !== null; },
        isDragged: id => dnd.id === id,
        isBefore: card => dnd.kind === 'card' && dnd.target?.beforeId === card.id,
        isEnd: list => dnd.kind === 'card' && dnd.target?.listId === list.id && dnd.target.beforeId === null,
        isListBefore: list => dnd.kind === 'list' && dnd.target?.beforeId === list.id,
        get listAtEnd() { return dnd.kind === 'list' && dnd.target?.beforeId === null; },
        start(event, kind, id) {
            if (kind === 'card' && filter.active) {
                event.preventDefault();
                toast('Clear the filter to rearrange cards.', { tone: 'info' });
                return;
            }
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', id);
            }
            Object.assign(dnd, { kind, id, keyboard: false, target: kind === 'card' ? ownSlot(find.card(id).card) : null });
        },
        overCard(event, card, list) {
            if (dnd.kind === 'list') return drag.overList(event, list);
            if (dnd.kind !== 'card' || dnd.keyboard) return;
            if (card.id === dnd.id) return setTarget(ownSlot(card));
            const box = event.currentTarget.getBoundingClientRect();
            const after = event.clientY > box.top + box.height / 2;
            const shown = visible(list).filter(entry => entry.id !== dnd.id);
            setTarget({ listId: list.id, beforeId: after ? shown[shown.indexOf(card) + 1]?.id ?? null : card.id });
        },
        overList(event, list) {
            if (dnd.keyboard) return;
            if (dnd.kind === 'card') return setTarget({ listId: list.id, beforeId: null });
            if (dnd.kind !== 'list') return;
            const box = event.currentTarget.getBoundingClientRect();
            const after = event.clientX > box.left + box.width / 2;
            const next = board.lists[board.lists.indexOf(list) + 1];
            setTarget({ beforeId: after ? next?.id ?? null : list.id });
        },
        drop() {
            const { kind, id, target } = dnd;
            drag.end();
            if (!target) return;
            if (kind === 'card') actions.moveCard(id, target.listId, target.beforeId);
            if (kind === 'list') {
                const list = find.list(id);
                const others = board.lists.filter(entry => entry !== list);
                const index = target.beforeId ? others.findIndex(entry => entry.id === target.beforeId) : others.length;
                actions.moveList(id, index - board.lists.indexOf(list));
            }
        },
        end() {
            Object.assign(dnd, { kind: null, id: null, target: null, keyboard: false });
        },

        // Keyboard
        grab(card) {
            if (dnd.keyboard) return drag.place();
            if (filter.active) return toast('Clear the filter to rearrange cards.', { tone: 'info' });
            Object.assign(dnd, { kind: 'card', id: card.id, keyboard: true, target: ownSlot(card) });
            dnd.announcement = `Picked up ${quote(card.title)}. ${describeTarget()}. Use the arrow keys to move, Space to drop, Escape to cancel.`;
        },
        step(event) {
            if (!dnd.keyboard) return;
            event.preventDefault();
            const lists = board.lists;
            let list = find.list(dnd.target.listId);
            let shown = visible(list).filter(card => card.id !== dnd.id);
            let slot = dnd.target.beforeId ? shown.findIndex(card => card.id === dnd.target.beforeId) : shown.length;
            if (event.key === 'ArrowUp') slot = Math.max(0, slot - 1);
            if (event.key === 'ArrowDown') slot = Math.min(shown.length, slot + 1);
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                const next = lists[lists.indexOf(list) + (event.key === 'ArrowLeft' ? -1 : 1)];
                if (!next) return;
                list = next;
                shown = visible(list).filter(card => card.id !== dnd.id);
                slot = Math.min(slot, shown.length);
            }
            dnd.target = { listId: list.id, beforeId: shown[slot]?.id ?? null };
            dnd.announcement = describeTarget();
        },
        place() {
            const { id, target } = dnd;
            const where = describeTarget();
            drag.end();
            actions.moveCard(id, target.listId, target.beforeId);
            dnd.announcement = `Dropped. ${where}.`;
            focusCard(id);
        },
        cancel() {
            if (!dnd.keyboard) return;
            const id = dnd.id;
            drag.end();
            dnd.announcement = 'Move cancelled.';
            focusCard(id);
        },
    };

    // --- Formatting ------------------------------------------------------------------------------

    const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
    const today = () => new Date().toISOString().slice(0, 10);
    const format = {
        due: iso => (iso ? shortDate.format(new Date(`${iso}T00:00:00Z`)) : ''),
        dueState(iso) {
            if (!iso) return '';
            const days = (Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today()}T00:00:00Z`)) / 86_400_000;
            return days < 0 ? 'overdue' : days <= 1 ? 'soon' : '';
        },
        time: iso => time.format(new Date(iso)),
        member: find.member,
        label: find.label,
        progress: card => {
            const done = card.checklist.filter(item => item.done).length;
            return { done, total: card.checklist.length, complete: card.checklist.length > 0 && done === card.checklist.length };
        },
    };

    // --- Demo controls ---------------------------------------------------------------------------

    let autoTimer = null;
    const demo = brio.state({
        latency: server.latency,
        auto: false,
        get online() { return sync.connection !== 'offline'; },
        setLatency(value) {
            this.latency = Number(value);
            server.latency = this.latency;
        },
        toggleOnline() { server.setOnline(!server.online); },
        failNext() {
            server.failNext = { status: 500, method: 'PATCH' };
            toast('The next save will fail on the server.', { tone: 'info' });
        },
        teammate() { server.teammate(); },
        toggleAuto() {
            this.auto = !this.auto;
            clearInterval(autoTimer);
            if (this.auto) autoTimer = setInterval(() => server.teammate(), 2500);
        },
    });

    // --- Router ----------------------------------------------------------------------------------

    // The board is always on screen; a card opens in a dialog at #/card/:id, so links can be shared.
    const router = brio.createRouter([
        { path: '/' },
        { path: '/card/:id', component: 'card-dialog' },
        { path: '*', redirect: '/' },
    ], { mode: 'hash' });

    // --- App -------------------------------------------------------------------------------------

    const app = brio.createApp({
        router,
        stores: { board, sync, filter, actions, drag, dnd, format, demo, prefs, to: { card: id => router.href(`/card/${id}`) } },
        state: () => ({
            addingList: false,
            listDraft: '',
            get visibleCount() { return board.lists.reduce((sum, list) => sum + visible(list).length, 0); },
            get totalCount() { return board.lists.reduce((sum, list) => sum + list.cards.length, 0); },
            openListComposer() {
                this.addingList = true;
                brio.flush();
                document.querySelector('[data-testid="new-list-title"]')?.focus();
            },
            async submitList() {
                const title = this.listDraft.trim();
                if (!title) return;
                this.listDraft = '';
                await actions.addList(title);
            },
            closeListComposer() {
                this.addingList = false;
                this.listDraft = '';
            },
        }),
    });

    app.component('kanban-list', {
        template: '#tpl-kanban-list',
        setup({ $props, $ref }) {
            const focus = name => {
                brio.flush();
                $ref[name]?.focus();
            };
            return {
                renaming: false,
                titleDraft: '',
                composing: false,
                cardDraft: '',
                menu: false,
                get cards() { return visible($props.list); },
                get count() {
                    const shown = this.cards.length;
                    return filter.active ? `${shown} of ${$props.list.cards.length}` : String(shown);
                },
                get first() { return board.lists[0] === $props.list; },
                get last() { return board.lists.at(-1) === $props.list; },
                startRename() {
                    this.titleDraft = $props.list.title;
                    this.renaming = true;
                    focus('title');
                    $ref.title?.select();
                },
                saveRename() {
                    if (!this.renaming) return;
                    this.renaming = false;
                    actions.renameList($props.list.id, this.titleDraft);
                },
                cancelRename() { this.renaming = false; },
                openComposer() {
                    this.composing = true;
                    this.menu = false;
                    focus('composer');
                },
                addCard() {
                    const title = this.cardDraft.trim();
                    if (!title) return;
                    this.cardDraft = '';
                    actions.addCard($props.list.id, title);
                    focus('composer');
                },
                closeComposer() {
                    this.composing = false;
                    this.cardDraft = '';
                },
                move(offset) {
                    this.menu = false;
                    actions.moveList($props.list.id, offset);
                },
                remove() {
                    this.menu = false;
                    const count = $props.list.cards.length;
                    if (count && !confirm(`Delete ${quote($props.list.title)} and its ${count} card${count === 1 ? '' : 's'}?`)) return;
                    actions.removeList($props.list.id);
                },
            };
        },
    });

    app.component('kanban-card', {
        template: '#tpl-kanban-card',
        setup({ $props }) {
            return {
                get labels() { return $props.card.labels.map(find.label).filter(Boolean); },
                get progress() { return format.progress($props.card); },
                get dueState() { return format.dueState($props.card.due); },
                get saving() { return Boolean(sync.busy[`card:${$props.card.id}`]); },
                get touchedBy() { return sync.touched[$props.card.id] ? find.member(sync.touched[$props.card.id]) : null; },
            };
        },
    });

    app.component('card-dialog', {
        template: '#tpl-card-dialog',
        setup({ route }) {
            const id = route.params.id;
            const close = () => router.navigate('/');
            const card = () => find.card(id)?.card ?? null;
            return {
                id,
                get card() { return card(); },
                get list() { return find.card(id)?.list ?? null; },
                get missing() { return board.status === 'ready' && !card(); },
                get deletedBy() { return sync.deletedBy[id] ?? ''; },
                get progress() { return card() ? format.progress(card()) : { done: 0, total: 0 }; },
                get percent() { return this.progress.total ? Math.round(this.progress.done / this.progress.total * 100) : 0; },
                get saving() { return Boolean(sync.busy[`card:${id}`]); },
                editingDescription: false,
                descriptionDraft: '',
                itemDraft: '',
                close,
                saveTitle(event) {
                    const value = event.target.value.trim();
                    if (!value) {
                        event.target.value = card().title;
                        return;
                    }
                    actions.updateCard(id, { title: value }, `rename ${quote(card().title)}`);
                },
                editDescription() {
                    this.descriptionDraft = card().description;
                    this.editingDescription = true;
                    brio.flush();
                    document.querySelector('[data-testid="description-input"]')?.focus();
                },
                saveDescription() {
                    this.editingDescription = false;
                    actions.updateCard(id, { description: this.descriptionDraft.trim() }, `save the description of ${quote(card().title)}`);
                },
                hasLabel: label => card()?.labels.includes(label) ?? false,
                toggleLabel(label) {
                    const labels = card().labels.includes(label) ? card().labels.filter(entry => entry !== label) : [...card().labels, label];
                    actions.updateCard(id, { labels }, `change the labels on ${quote(card().title)}`);
                },
                toggleItem(item) {
                    const checklist = card().checklist.map(entry => (entry.id === item.id ? { ...entry, done: !entry.done } : { ...entry }));
                    actions.updateCard(id, { checklist }, `update the checklist on ${quote(card().title)}`);
                },
                removeItem(item) {
                    const checklist = card().checklist.filter(entry => entry.id !== item.id).map(entry => ({ ...entry }));
                    actions.updateCard(id, { checklist }, `update the checklist on ${quote(card().title)}`);
                },
                addItem() {
                    const text = this.itemDraft.trim();
                    if (!text) return;
                    this.itemDraft = '';
                    const checklist = [...card().checklist.map(entry => ({ ...entry })), { id: newId('i'), text, done: false }];
                    actions.updateCard(id, { checklist }, `add ${quote(text)} to the checklist`);
                },
                setDue(value) { actions.updateCard(id, { due: value || null }, `change the due date of ${quote(card().title)}`); },
                moveTo(listId) {
                    if (listId !== card().listId) actions.moveCard(id, listId, find.list(listId)?.cards[0]?.id ?? null);
                },
                remove() {
                    if (!confirm(`Delete ${quote(card().title)}? This cannot be undone.`)) return;
                    actions.removeCard(id);
                    close();
                },
            };
        },
    });

    const root = app.mount('#app');
    const disconnect = server.connect(message => {
        if (message.type === 'closed') sync.connection = 'offline';
        if (message.type === 'open') {
            sync.connection = 'live';
            catchUp();
        }
        if (message.type === 'change' && message.version > board.version) catchUp();
    });
    load();
    window.addEventListener('pagehide', () => {
        disconnect();
        clearInterval(autoTimer);
    });
    window.kanbanApp = { app, root, router, board, sync, filter, dnd, drag, actions, shadow, server, catchUp, clientId: CLIENT_ID };
})();
