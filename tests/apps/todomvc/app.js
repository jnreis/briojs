(() => {
    const STORAGE_KEY = 'brio-apps:todos';
    const FILTERS = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'completed', label: 'Completed' },
    ];
    const matches = {
        all: () => true,
        active: todo => !todo.completed,
        completed: todo => todo.completed,
    };

    const filterFromHash = hash => {
        const id = String(hash).replace(/^#\/?/, '');
        return id in matches ? id : 'all';
    };

    let lastId = 0;
    const createId = () => `${Date.now().toString(36)}-${(++lastId).toString(36)}`;
    const isTodo = value => value && typeof value.id === 'string' && typeof value.title === 'string';

    // persist() must be owned by a scope so its effect and cross-tab listener can be released.
    const storage = brio.createScope();
    const saved = storage.run(() => brio.persist(STORAGE_KEY, { todos: [] }));
    if (!Array.isArray(saved.todos)) saved.todos = [];
    else if (!saved.todos.every(isTodo)) saved.todos = saved.todos.filter(isTodo);

    const app = brio.createApp({
        state: () => ({
            saved,
            filters: FILTERS,
            filter: filterFromHash(location.hash),
            newTitle: '',
            editingId: null,
            draft: '',

            get todos() { return this.saved.todos; },
            get visible() { return this.todos.filter(matches[this.filter]); },
            get remaining() { return this.todos.filter(matches.active).length; },
            get completed() { return this.todos.length - this.remaining; },
            get allCompleted() { return this.todos.length > 0 && this.remaining === 0; },
            set allCompleted(done) {
                for (const todo of this.todos) if (todo.completed !== done) todo.completed = done;
            },

            route(hash) {
                this.filter = filterFromHash(hash);
            },
            add() {
                const title = this.newTitle.trim();
                if (!title) return;
                this.todos.push({ id: createId(), title, completed: false });
                this.newTitle = '';
            },
            destroy(todo) {
                const index = this.todos.findIndex(item => item.id === todo.id);
                if (index !== -1) this.todos.splice(index, 1);
                if (this.editingId === todo.id) this.editingId = null;
            },
            clearCompleted() {
                this.saved.todos = this.todos.filter(matches.active);
            },
            edit(todo) {
                this.editingId = todo.id;
                this.draft = todo.title;
            },
            save(todo) {
                // Enter and Escape end editing before the input is removed, so a trailing blur is a no-op.
                if (this.editingId !== todo.id) return;
                const title = this.draft.trim();
                this.editingId = null;
                if (title) todo.title = title;
                else this.destroy(todo);
            },
            cancel() {
                this.editingId = null;
            },
            editKey(event, todo) {
                if (event.key === 'Enter' && !event.isComposing) this.save(todo);
                else if (event.key === 'Escape') this.cancel();
            },
        }),
    });

    app.mount('#todo-app');
    window.todoApp = { app, storage };
})();
