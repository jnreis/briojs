import { flushSync, mount } from 'svelte';
import App from './App.svelte';
import { store } from './svelte-store.svelte.js';
import { buildData } from '../apps/shared.js';

mount(App, { target: document.getElementById('app') });

// flushSync applies each change before returning, the same synchronous contract the other pages use.
const apply = change => flushSync(change);

window.bench = {
    name: 'svelte',
    run: count => apply(() => { store.rows = buildData(count); store.selected = 0; }),
    add: count => apply(() => { store.rows.push(...buildData(count)); }),
    update: () => apply(() => { const rows = store.rows; for (let index = 0; index < rows.length; index += 10) rows[index].label += ' !!!'; }),
    select: index => apply(() => { store.selected = store.rows[index].id; }),
    swap: () => apply(() => { const rows = store.rows; const row = rows[1]; rows[1] = rows[998]; rows[998] = row; }),
    remove: index => apply(() => { store.rows.splice(index, 1); }),
    clear: () => apply(() => { store.rows = []; }),
    settle: () => Promise.resolve(),
};
window.benchReady = true;
