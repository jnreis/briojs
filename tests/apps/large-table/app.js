(() => {
    const ADJECTIVES = ['pretty', 'large', 'big', 'small', 'tall', 'short', 'long', 'handsome', 'plain', 'quaint', 'clean',
        'elegant', 'easy', 'angry', 'crazy', 'helpful', 'mushy', 'odd', 'unsightly', 'adorable', 'important', 'inexpensive',
        'cheap', 'expensive', 'fancy'];
    const COLOURS = ['red', 'yellow', 'blue', 'green', 'pink', 'brown', 'purple', 'brown', 'white', 'black', 'orange'];
    const NOUNS = ['table', 'chair', 'house', 'bbq', 'desk', 'car', 'pony', 'cookie', 'sandwich', 'burger', 'pizza', 'mouse',
        'keyboard'];

    // Seeded so every page load (and every test) produces the same labels.
    let seed = 0x2f6b7d;
    const random = max => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * max);
    };
    const pick = list => list[random(list.length)];

    let nextId = 1;
    const build = count => Array.from({ length: count }, () => ({
        id: nextId++,
        label: `${pick(ADJECTIVES)} ${pick(COLOURS)} ${pick(NOUNS)}`,
        selected: false,
    }));

    let timingId = 0;

    const app = brio.createApp({
        state: () => ({
            rows: [],
            selectedRow: null,
            timings: [],

            measure(name, operation) {
                const started = performance.now();
                operation();
                // Handlers are batched; flush so the timing includes the DOM work.
                brio.flush();
                const ms = performance.now() - started;
                this.timings.unshift({ id: ++timingId, name, ms });
                if (this.timings.length > 5) this.timings.pop();
            },
            run(count) {
                this.selectedRow = null;
                this.rows = build(count);
            },
            add(count) {
                this.rows.push(...build(count));
            },
            update() {
                const rows = this.rows;
                for (let index = 0; index < rows.length; index += 10) rows[index].label += ' !!!';
            },
            clear() {
                this.selectedRow = null;
                this.rows = [];
            },
            swap() {
                const rows = this.rows;
                if (rows.length < 999) return;
                const second = rows[1];
                rows[1] = rows[998];
                rows[998] = second;
            },
            select(row) {
                if (this.selectedRow === row) return;
                if (this.selectedRow) this.selectedRow.selected = false;
                row.selected = true;
                this.selectedRow = row;
            },
            remove(row) {
                const index = this.rows.indexOf(row);
                if (index === -1) return;
                this.rows.splice(index, 1);
                if (this.selectedRow === row) this.selectedRow = null;
            },
        }),
    });

    app.mount('#table-app');
    window.tableApp = { app };
})();
