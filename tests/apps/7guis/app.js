(() => {
    const TASKS = [
        { id: 'counter', label: 'Counter' },
        { id: 'temperature', label: 'Temperature' },
        { id: 'flight', label: 'Flight Booker' },
        { id: 'timer', label: 'Timer' },
        { id: 'crud', label: 'CRUD' },
        { id: 'circles', label: 'Circle Drawer' },
        { id: 'cells', label: 'Cells' },
    ];
    const taskFromHash = hash => {
        const id = String(hash).replace(/^#\/?/, '');
        return TASKS.some(task => task.id === id) ? id : TASKS[0].id;
    };
    const template = id => document.getElementById(id).innerHTML;
    const isEditable = target => target instanceof Element && target.matches('input, select, textarea, [contenteditable]');

    // ---- Counter -------------------------------------------------------------

    const counter = {
        template: template('gui-counter'),
        setup: () => ({ count: 0 }),
    };

    // ---- Temperature converter ---------------------------------------------

    const parseNumber = text => {
        const trimmed = String(text).trim();
        return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(trimmed) ? Number(trimmed) : null;
    };
    const formatNumber = value => String(Math.round(value * 100) / 100);
    const convert = {
        celsius: { to: 'fahrenheit', apply: c => c * 9 / 5 + 32 },
        fahrenheit: { to: 'celsius', apply: f => (f - 32) * 5 / 9 },
    };

    const temperature = {
        template: template('gui-temperature'),
        setup() {
            const texts = brio.state({ celsius: '', fahrenheit: '' });
            const write = (scale, text) => {
                texts[scale] = text;
                const value = parseNumber(text);
                // Invalid input leaves the other field untouched, as 7GUIs specifies.
                if (value !== null) texts[convert[scale].to] = formatNumber(convert[scale].apply(value));
            };
            return {
                valid: scale => texts[scale].trim() === '' || parseNumber(texts[scale]) !== null,
                get celsiusText() { return texts.celsius; },
                set celsiusText(text) { write('celsius', text); },
                get fahrenheitText() { return texts.fahrenheit; },
                set fahrenheitText(text) { write('fahrenheit', text); },
            };
        },
    };

    // ---- Flight booker --------------------------------------------------------

    const pad = value => String(value).padStart(2, '0');
    const formatDate = date => `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
    const parseDate = text => {
        const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(text).trim());
        if (!match) return null;
        const [day, month, year] = match.slice(1).map(Number);
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
    };

    const flightBooker = {
        template: template('gui-flight-booker'),
        setup() {
            const today = formatDate(new Date());
            const form = brio.state({ kind: 'one-way', departure: today, returning: today, message: '' });
            const field = key => ({
                get: () => form[key],
                set: value => {
                    form[key] = value;
                    form.message = '';
                },
            });
            const state = {
                get message() { return form.message; },
                get departureDate() { return parseDate(form.departure); },
                get returnDate() { return parseDate(form.returning); },
                get returnValid() { return this.returnDate !== null; },
                get problem() {
                    if (form.kind !== 'return' || !this.departureDate || !this.returnDate) return '';
                    return this.returnDate < this.departureDate ? 'The return flight cannot be before the departure.' : '';
                },
                get canBook() {
                    if (!this.departureDate) return false;
                    return form.kind === 'one-way' || (this.returnValid && !this.problem);
                },
                book() {
                    if (!this.canBook) return;
                    form.message = form.kind === 'one-way'
                        ? `You have booked a one-way flight on ${form.departure}.`
                        : `You have booked a return flight departing ${form.departure} and returning ${form.returning}.`;
                },
            };
            for (const [name, key] of [['kind', 'kind'], ['departure', 'departure'], ['returning', 'returning']])
                Object.defineProperty(state, name, { ...field(key), enumerable: true });
            return state;
        },
    };

    // ---- Timer --------------------------------------------------------------

    const timer = {
        template: template('gui-timer'),
        setup() {
            const state = brio.state({
                duration: 15,
                elapsed: 0,
                get clamped() { return Math.min(this.elapsed, this.duration); },
                get shown() { return this.clamped.toFixed(1); },
                get progress() { return this.duration > 0 ? Math.round(Math.min(100, this.clamped / this.duration * 100) * 10) / 10 : 100; },
                get finished() { return this.elapsed >= this.duration; },
                reset() { this.elapsed = 0; },
            });
            let last = performance.now();
            const handle = setInterval(() => {
                const now = performance.now();
                const delta = (now - last) / 1000;
                last = now;
                if (state.elapsed < state.duration) state.elapsed = Math.min(state.duration, state.elapsed + delta);
            }, 100);
            brio.onCleanup(() => clearInterval(handle));
            return state;
        },
    };

    // ---- CRUD ----------------------------------------------------------------

    const crud = {
        template: template('gui-crud'),
        setup() {
            let nextId = 1;
            const person = (name, surname) => ({ id: String(nextId++), name, surname });
            const data = brio.state({
                people: [person('Hans', 'Emil'), person('Max', 'Mustermann'), person('Roman', 'Tisch')],
                prefix: '',
                selectedId: '',
                name: '',
                surname: '',
            });
            return {
                get people() { return data.people; },
                get prefix() { return data.prefix; },
                set prefix(value) { data.prefix = value; },
                get name() { return data.name; },
                set name(value) { data.name = value; },
                get surname() { return data.surname; },
                set surname(value) { data.surname = value; },
                get filtered() {
                    const prefix = data.prefix.trim().toLowerCase();
                    return data.people.filter(entry => entry.surname.toLowerCase().startsWith(prefix));
                },
                // A selection hidden by the filter no longer counts as selected.
                get selected() { return this.filtered.find(entry => entry.id === data.selectedId) ?? null; },
                get selection() { return this.selected?.id ?? ''; },
                set selection(id) {
                    data.selectedId = id;
                    const chosen = data.people.find(entry => entry.id === id);
                    if (chosen) {
                        data.name = chosen.name;
                        data.surname = chosen.surname;
                    }
                },
                get complete() { return data.name.trim() !== '' && data.surname.trim() !== ''; },
                create() {
                    if (!this.complete) return;
                    const created = person(data.name.trim(), data.surname.trim());
                    data.people.push(created);
                    data.selectedId = created.id;
                },
                update() {
                    const chosen = this.selected;
                    if (!chosen || !this.complete) return;
                    chosen.name = data.name.trim();
                    chosen.surname = data.surname.trim();
                },
                remove() {
                    const index = data.people.findIndex(entry => entry.id === this.selected?.id);
                    if (index === -1) return;
                    data.people.splice(index, 1);
                    data.selectedId = '';
                    data.name = '';
                    data.surname = '';
                },
            };
        },
    };

    // ---- Circle drawer ----------------------------------------------------------

    const circleDrawer = {
        template: template('gui-circle-drawer'),
        setup({ $ref }) {
            let nextId = 1;
            const copy = circles => circles.map(circle => ({ ...circle }));
            const state = brio.state({
                circles: [],
                history: [[]],
                cursor: 0,
                hovered: null,
                menu: null,
                adjusting: null,
                get canUndo() { return this.cursor > 0; },
                get canRedo() { return this.cursor < this.history.length - 1; },
                get target() { return this.circles.find(circle => circle.id === this.adjusting?.id) ?? null; },
                get diameter() { return this.target ? this.target.r * 2 : 0; },
                set diameter(value) { if (this.target) this.target.r = value / 2; },

                point(event) {
                    const box = $ref.canvas.getBoundingClientRect();
                    return { x: Math.round(event.clientX - box.left), y: Math.round(event.clientY - box.top) };
                },
                circleAt({ x, y }) {
                    let nearest = null;
                    let best = Infinity;
                    for (const circle of this.circles) {
                        const distance = Math.hypot(circle.x - x, circle.y - y);
                        if (distance <= circle.r && distance < best) {
                            nearest = circle;
                            best = distance;
                        }
                    }
                    return nearest;
                },
                commit() {
                    this.history.splice(this.cursor + 1);
                    this.history.push(copy(this.circles));
                    this.cursor = this.history.length - 1;
                },
                restore(cursor) {
                    this.cursor = cursor;
                    this.circles = copy(this.history[cursor]);
                    this.hovered = null;
                },
                undo() { if (this.canUndo && !this.adjusting) this.restore(this.cursor - 1); },
                redo() { if (this.canRedo && !this.adjusting) this.restore(this.cursor + 1); },

                click(event) {
                    if (this.adjusting) return;
                    if (this.menu) return this.closeMenu();
                    const point = this.point(event);
                    const hit = this.circleAt(point);
                    if (hit) {
                        this.hovered = hit.id;
                        return;
                    }
                    const circle = { id: nextId++, ...point, r: 15 };
                    this.circles.push(circle);
                    this.hovered = circle.id;
                    this.commit();
                },
                hover(event) {
                    if (this.menu || this.adjusting) return;
                    this.hovered = this.circleAt(this.point(event))?.id ?? null;
                },
                openMenu(event) {
                    if (this.adjusting) return;
                    const point = this.point(event);
                    const hit = this.circleAt(point);
                    if (!hit) return this.closeMenu();
                    this.hovered = hit.id;
                    this.menu = { ...point, id: hit.id };
                    brio.flush();
                    $ref.menuItem?.focus();
                },
                closeMenu() {
                    this.menu = null;
                },
                startAdjust() {
                    const circle = this.circles.find(entry => entry.id === this.menu?.id);
                    this.menu = null;
                    if (!circle) return;
                    this.adjusting = { id: circle.id, x: circle.x, y: circle.y, r: circle.r };
                    brio.flush();
                    $ref.diameter?.focus();
                },
                finishAdjust() {
                    const target = this.target;
                    const before = this.adjusting;
                    this.adjusting = null;
                    if (target && target.r !== before.r) this.commit();
                    $ref.canvas.focus?.();
                },
                shortcut(event) {
                    if (!(event.ctrlKey || event.metaKey) || isEditable(event.target) && event.target.type !== 'range') return;
                    const key = event.key.toLowerCase();
                    if (key === 'z' && !event.shiftKey) this.undo();
                    else if ((key === 'z' && event.shiftKey) || key === 'y') this.redo();
                    else return;
                    event.preventDefault();
                },
            });
            return state;
        },
    };

    // ---- Cells ---------------------------------------------------------------

    const COLUMNS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
    const ROWS = Number(window.CELL_ROWS ?? 100);

    class CellError {
        constructor(code) { this.code = code; }
        toString() { return this.code; }
    }
    const errors = {
        ref: new CellError('#REF!'),
        cycle: new CellError('#CYCLE!'),
        div: new CellError('#DIV/0!'),
        name: new CellError('#NAME?'),
        value: new CellError('#VALUE!'),
        parse: new CellError('#ERROR!'),
    };

    const parseAddress = text => {
        const match = /^([A-Z])(\d{1,2})$/.exec(text);
        return match ? { column: match[1], row: Number(match[2]) } : null;
    };

    const tokenize = source => {
        const tokens = [];
        const pattern = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([A-Za-z]+\d*)|(.))/gy;
        let match;
        while (pattern.lastIndex < source.length && (match = pattern.exec(source))) {
            if (match[1] !== undefined) tokens.push({ type: 'number', value: Number(match[1]) });
            else if (match[2] !== undefined) tokens.push({ type: 'word', value: match[2].toUpperCase() });
            else if (match[3] !== undefined && match[3].trim()) tokens.push({ type: 'op', value: match[3] });
        }
        return tokens;
    };

    // Recursive descent: expression := term (('+'|'-') term)*, term := unary (('*'|'/') unary)*.
    const parseFormula = source => {
        const tokens = tokenize(source);
        let position = 0;
        const peek = () => tokens[position];
        const take = value => {
            const token = tokens[position];
            if (value !== undefined && token?.value !== value) throw errors.parse;
            position++;
            return token;
        };
        const expression = () => {
            let node = term();
            while (peek()?.type === 'op' && (peek().value === '+' || peek().value === '-'))
                node = { op: take().value, left: node, right: term() };
            return node;
        };
        const term = () => {
            let node = unary();
            while (peek()?.type === 'op' && (peek().value === '*' || peek().value === '/'))
                node = { op: take().value, left: node, right: unary() };
            return node;
        };
        const unary = () => {
            if (peek()?.value === '-') {
                take();
                return { op: 'neg', operand: unary() };
            }
            if (peek()?.value === '+') take();
            return primary();
        };
        const primary = () => {
            const token = take();
            if (!token) throw errors.parse;
            if (token.type === 'number') return { number: token.value };
            if (token.value === '(') {
                const node = expression();
                take(')');
                return node;
            }
            if (token.type !== 'word') throw errors.parse;
            if (peek()?.value === '(') {
                take('(');
                const args = [];
                if (peek()?.value !== ')') {
                    args.push(argument());
                    while (peek()?.value === ',' || peek()?.value === ';') {
                        take();
                        args.push(argument());
                    }
                }
                take(')');
                return { call: token.value, args };
            }
            return { ref: token.value };
        };
        const argument = () => {
            if (peek()?.type === 'word' && tokens[position + 1]?.value === ':') {
                const from = take().value;
                take(':');
                const to = take();
                if (to?.type !== 'word') throw errors.parse;
                return { range: [from, to.value] };
            }
            return expression();
        };
        const tree = expression();
        if (position !== tokens.length) throw errors.parse;
        return tree;
    };

    const FUNCTIONS = {
        SUM: values => values.reduce((total, value) => total + value, 0),
        PROD: values => values.reduce((total, value) => total * value, 1),
        AVG: values => {
            if (!values.length) throw errors.div;
            return values.reduce((total, value) => total + value, 0) / values.length;
        },
        MIN: values => (values.length ? Math.min(...values) : 0),
        MAX: values => (values.length ? Math.max(...values) : 0),
        COUNT: values => values.length,
    };

    const cells = {
        template: template('gui-cells'),
        setup({ el }) {
            const ids = [];
            const rows = Array.from({ length: ROWS }, (_, index) => ({
                index,
                cells: COLUMNS.map(column => {
                    const id = `${column}${index}`;
                    ids.push(id);
                    return { id };
                }),
            }));
            const formulas = brio.state(Object.fromEntries(ids.map(id => [id, ''])));
            const flags = brio.state({ A0: true });

            const valueOf = address => {
                const parsed = parseAddress(address);
                if (!parsed || parsed.row >= ROWS) throw errors.ref;
                return values.get(address).value;
            };
            const numeric = value => {
                if (value instanceof CellError) throw value;
                if (value === '') return 0;
                if (typeof value !== 'number') throw errors.value;
                return value;
            };
            const expand = ([from, to]) => {
                const start = parseAddress(from);
                const end = parseAddress(to);
                if (!start || !end || start.row >= ROWS || end.row >= ROWS) throw errors.ref;
                const [c1, c2] = [start.column, end.column].map(column => column.charCodeAt(0)).sort((a, b) => a - b);
                const [r1, r2] = [start.row, end.row].sort((a, b) => a - b);
                const addresses = [];
                for (let row = r1; row <= r2; row++)
                    for (let code = c1; code <= c2; code++) addresses.push(`${String.fromCharCode(code)}${row}`);
                return addresses;
            };
            const evaluate = node => {
                if ('number' in node) return node.number;
                if ('ref' in node) return valueOf(node.ref);
                if (node.op === 'neg') return -numeric(evaluate(node.operand));
                if (node.op) {
                    const left = numeric(evaluate(node.left));
                    const right = numeric(evaluate(node.right));
                    if (node.op === '+') return left + right;
                    if (node.op === '-') return left - right;
                    if (node.op === '*') return left * right;
                    if (right === 0) throw errors.div;
                    return left / right;
                }
                const fn = FUNCTIONS[node.call];
                if (!fn) throw errors.name;
                const collected = [];
                for (const arg of node.args) {
                    if (!arg.range) {
                        collected.push(numeric(evaluate(arg)));
                        continue;
                    }
                    // Ranges skip blanks and text, like most spreadsheets.
                    for (const address of expand(arg.range)) {
                        const value = valueOf(address);
                        if (value instanceof CellError) throw value;
                        if (typeof value === 'number') collected.push(value);
                    }
                }
                return fn(collected);
            };
            const compute = id => {
                const source = formulas[id].trim();
                if (source === '') return '';
                if (!source.startsWith('=')) return parseNumber(source) ?? source;
                try {
                    const result = evaluate(parseFormula(source.slice(1)));
                    return Number.isFinite(result) ? result : errors.value;
                } catch (error) {
                    if (error instanceof CellError) return error;
                    if (/circular/i.test(String(error?.message))) return errors.cycle;
                    throw error;
                }
            };
            // One computed per cell: a change re-evaluates only the cells that depend on it.
            const values = new Map(ids.map(id => [id, brio.computed(() => compute(id))]));

            const format = value => {
                if (typeof value !== 'number') return String(value);
                return Number.isInteger(value) ? String(value) : String(Math.round(value * 1e6) / 1e6);
            };
            const cellAt = id => el.querySelector(`[data-cell="${id}"]`);
            const editor = () => el.querySelector('[data-testid="cells-editor"]');

            const state = brio.state({
                columns: COLUMNS,
                rows,
                flags,
                active: 'A0',
                draft: '',
                editing: false,
                display: id => format(values.get(id).value),
                classes: id => {
                    const value = values.get(id).value;
                    return { active: Boolean(flags[id]), number: typeof value === 'number', error: value instanceof CellError };
                },
                formula: id => formulas[id],
                setFormula(id, source) { formulas[id] = source; },

                select(id, { focus = true } = {}) {
                    if (id === this.active) return;
                    if (this.editing) this.commit();
                    flags[this.active] = false;
                    flags[id] = true;
                    this.active = id;
                    this.draft = formulas[id];
                    if (focus) {
                        brio.flush();
                        const cell = cellAt(id);
                        cell?.focus();
                        cell?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
                    }
                },
                activate(event) {
                    const cell = event.target.closest?.('td[data-cell]');
                    if (!cell) return false;
                    this.select(cell.dataset.cell);
                    return true;
                },
                move(columns, rows) {
                    const { column, row } = parseAddress(this.active);
                    const nextColumn = Math.min(25, Math.max(0, column.charCodeAt(0) - 65 + columns));
                    const nextRow = Math.min(ROWS - 1, Math.max(0, row + rows));
                    this.select(`${COLUMNS[nextColumn]}${nextRow}`);
                },
                focusEditor(initial) {
                    this.beginEdit();
                    if (initial !== undefined) this.draft = initial;
                    const input = editor();
                    input.focus();
                    input.setSelectionRange?.(input.value.length, input.value.length);
                    return true;
                },
                beginEdit() {
                    if (this.editing) return;
                    this.editing = true;
                    this.draft = formulas[this.active];
                },
                commit() {
                    if (!this.editing) return;
                    this.editing = false;
                    formulas[this.active] = this.draft;
                },
                cancel() {
                    this.editing = false;
                    this.draft = formulas[this.active];
                },
                editorKey(event) {
                    if (event.key === 'Enter' || event.key === 'Tab') {
                        event.preventDefault();
                        this.commit();
                        if (event.key === 'Enter') this.move(0, event.shiftKey ? -1 : 1);
                        else this.move(event.shiftKey ? -1 : 1, 0);
                        cellAt(this.active)?.focus();
                    } else if (event.key === 'Escape') {
                        event.preventDefault();
                        this.cancel();
                        cellAt(this.active)?.focus();
                    }
                },
                sheetKey(event) {
                    if (event.target.tagName !== 'TD' || event.ctrlKey || event.metaKey || event.altKey) return;
                    const moves = {
                        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
                        Tab: [event.shiftKey ? -1 : 1, 0],
                    };
                    if (moves[event.key]) this.move(...moves[event.key]);
                    else if (event.key === 'Enter' || event.key === 'F2') this.focusEditor();
                    else if (event.key === 'Delete' || event.key === 'Backspace') {
                        formulas[this.active] = '';
                        this.draft = '';
                    } else if (event.key.length === 1) this.focusEditor(event.key);
                    else return;
                    event.preventDefault();
                },
            });
            return state;
        },
    };

    // ---- Shell -----------------------------------------------------------------

    const app = brio.createApp({
        state: () => ({
            tasks: TASKS,
            tab: taskFromHash(location.hash),
            route(hash) {
                this.tab = taskFromHash(hash);
            },
            select(id) {
                this.tab = id;
                history.replaceState(null, '', `#/${id}`);
            },
            tabKey(event) {
                const index = TASKS.findIndex(task => task.id === this.tab);
                const next = {
                    ArrowRight: (index + 1) % TASKS.length,
                    ArrowLeft: (index - 1 + TASKS.length) % TASKS.length,
                    Home: 0,
                    End: TASKS.length - 1,
                }[event.key];
                if (next === undefined) return;
                event.preventDefault();
                this.select(TASKS[next].id);
                brio.flush();
                document.getElementById(`tab-${TASKS[next].id}`)?.focus();
            },
        }),
        components: {
            'gui-counter': counter,
            'gui-temperature': temperature,
            'gui-flight-booker': flightBooker,
            'gui-timer': timer,
            'gui-crud': crud,
            'gui-circle-drawer': circleDrawer,
            'gui-cells': cells,
        },
    });

    const started = performance.now();
    app.mount('#guis-app');
    window.guisApp = { app, mountTime: performance.now() - started };
})();
