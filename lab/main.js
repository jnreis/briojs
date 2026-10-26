import { effect } from '@jnreis/briojs/reactivity';
import { createSpecimen } from './workbench.js';
import specimenSource from './workbench.js?raw';
import './astro-frame.js';
import { highlightSource } from '../tests/source-highlight.js';

const template = document.querySelector('#specimen-template');
document.querySelector('#specimen-html').textContent = template.innerHTML.trim();
document.querySelector('#specimen-js').textContent = specimenSource.trim();
highlightSource(document.querySelector('#specimen-html'), 'markup');
highlightSource(document.querySelector('#specimen-js'), 'javascript');
document.querySelector('#specimen').append(template.content.cloneNode(true));

const app = createSpecimen();
app.mount('#specimen');

const stopSnapshot = effect(() => {
    document.querySelector('#state-snapshot').textContent = JSON.stringify({
        draft: app.state.draft,
        tasks: app.state.tasks.map(({ id, label, done }) => ({ id, label, done })),
    }, null, 2);
});

const preview = document.querySelector('#queue-preview');
const identities = new WeakMap();
let nextNode = 0;
const nodeId = node => {
    if (!identities.has(node)) identities.set(node, ++nextNode);
    return identities.get(node);
};
const inspect = () => {
    const entries = [...preview.querySelectorAll('[data-task-id]')].map(node => {
        const entry = document.createElement('li');
        entry.dataset.taskId = node.dataset.taskId;
        entry.dataset.nodeId = nodeId(node);
        const key = document.createElement('span');
        key.textContent = `key ${node.dataset.taskId}`;
        const identity = document.createElement('code');
        identity.textContent = `DOM node #${nodeId(node)}`;
        entry.append(key, identity);
        return entry;
    });
    document.querySelector('#node-map').replaceChildren(...entries);
};
inspect();

let delivery = 0;
const trace = document.querySelector('#dom-trace');
const observer = new MutationObserver(records => {
    inspect();
    const added = new Set();
    const removed = new Set();
    let text = 0;
    let attributes = 0;
    for (const record of records) {
        if (record.type === 'attributes') attributes++;
        else if (record.type === 'characterData') text++;
        else {
            for (const node of record.addedNodes) {
                if (node instanceof Element && node.matches('[data-task-id]')) added.add(node);
                else if (node.nodeType === Node.TEXT_NODE) text++;
            }
            for (const node of record.removedNodes) {
                if (node instanceof Element && node.matches('[data-task-id]')) removed.add(node);
            }
        }
    }
    const moved = [...added].filter(node => removed.has(node));
    const inserted = [...added].filter(node => !removed.has(node));
    const deleted = [...removed].filter(node => !added.has(node));
    const parts = [];
    if (moved.length) parts.push(`moved ${moved.map(node => `#${nodeId(node)}`).join(', ')}`);
    if (inserted.length) parts.push(`inserted ${inserted.map(node => `#${nodeId(node)}`).join(', ')}`);
    if (deleted.length) parts.push(`removed ${deleted.map(node => `#${nodeId(node)}`).join(', ')}`);
    if (text) parts.push(`${text} text change${text === 1 ? '' : 's'}`);
    if (attributes) parts.push(`${attributes} attribute change${attributes === 1 ? '' : 's'}`);
    if (!parts.length) parts.push(`${records.length} structural mutation${records.length === 1 ? '' : 's'}`);
    const entry = document.createElement('li');
    entry.textContent = `${String(++delivery).padStart(2, '0')}  ${parts.join(' / ')}`;
    trace.querySelector('.trace-empty')?.remove();
    trace.prepend(entry);
    while (trace.children.length > 12) trace.lastElementChild.remove();
});
observer.observe(preview, { childList: true, characterData: true, attributes: true, subtree: true });

const clear = () => {
    trace.replaceChildren();
    const empty = document.createElement('li');
    empty.className = 'trace-empty';
    empty.textContent = 'Trace cleared. Waiting for the next change.';
    trace.append(empty);
};
document.querySelector('#clear-trace').addEventListener('click', clear);

addEventListener('pagehide', event => {
    if (event.persisted) return;
    observer.disconnect();
    stopSnapshot();
    document.querySelector('#clear-trace').removeEventListener('click', clear);
    app.dispose();
});
