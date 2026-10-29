import { defaultProject } from './default.js';
import { decodeProject, encodeProject, validateProject } from './share.js';
import { loadBrio, previewDocument } from './preview.js';
import { createEditors } from './editors.js';
import { formatCode, formatProject } from './code.js';
import { createConsole } from './console.js';

const status = document.querySelector('#play-status');
const output = createConsole();
const preview = document.querySelector('#play-preview');
const shareButton = document.querySelector('#play-share');
const shareLink = document.querySelector('#play-link');
let formatting = false;
let frame;
let token;
let generation = 0;
let dirty = false;
let hadErrors = false;
let revision = 0;
let initialProject = defaultProject;
let initialUrl = location.pathname + location.search;
const editors = createEditors(() => {
    revision++;
    dirty = true;
    hideShareLink();
    status.textContent = 'Code changed. Click Run to update the preview.';
}, formatActiveEditor);

function hideShareLink() {
    shareLink.hidden = true;
    shareLink.parentElement.hidden = true;
}

const currentTheme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

function report(message, statusMessage = 'The preview reported an error. See the console below.') {
    hadErrors = true;
    output.add('error', message);
    status.textContent = statusMessage;
}

function project() {
    return validateProject({ version: 1, ...Object.fromEntries(Object.entries(editors).map(([key, editor]) => [key, editor.value])) });
}

function fill(value) {
    revision++;
    for (const [key, editor] of Object.entries(editors)) editor.value = value[key];
    dirty = false;
    hideShareLink();
}

function clearPreview() {
    frame?.remove();
    frame = undefined;
    token = undefined;
    output.reset();
    hadErrors = false;
}

async function run() {
    const current = ++generation;
    clearPreview();
    try {
        const value = project();
        dirty = false;
        status.textContent = 'Starting preview...';
        const brio = await loadBrio();
        if (current !== generation) return;
        token = crypto.randomUUID();
        frame = document.createElement('iframe');
        frame.title = 'Brio playground preview';
        frame.setAttribute('sandbox', 'allow-scripts allow-forms');
        frame.referrerPolicy = 'no-referrer';
        frame.srcdoc = previewDocument(value, { token, theme: currentTheme(), brio });
        preview.replaceChildren(frame);
    } catch (error) {
        if (current === generation) report(`Unable to run: ${error.message}`);
    }
}

async function formatActiveEditor() {
    if (formatting) return;
    const language = document.querySelector('.play-tabs [aria-selected="true"]').id.slice(4);
    const editor = editors[language];
    const sourceRevision = revision;
    const sourceGeneration = generation;
    formatting = true;
    try {
        const formatted = await formatCode(language, editor.value);
        if (sourceGeneration !== generation) return;
        if (sourceRevision !== revision) {
            status.textContent = 'Code changed while formatting. Format again to apply it.';
            return;
        }
        editor.replace(formatted);
        status.textContent = 'Document formatted. Click Run to update the preview.';
    } catch (error) {
        if (sourceRevision !== revision || sourceGeneration !== generation) return;
        report(`Unable to format ${language === 'js' ? 'JavaScript' : language.toUpperCase()}: ${error.message}`,
            'Formatting failed. Your code has not changed.');
    } finally {
        formatting = false;
    }
}

async function loadLocation() {
    const current = ++generation;
    const loadedRevision = revision;
    const loadedUrl = location.pathname + location.search + location.hash;
    clearPreview();
    hideShareLink();
    const shared = Boolean(location.hash);
    let value = defaultProject;
    status.textContent = shared ? 'Loading shared code...' : 'Formatting code...';
    try {
        if (shared) value = await decodeProject(location.hash);
    } catch (error) {
        if (current !== generation || loadedRevision !== revision) return;
        initialProject = defaultProject;
        initialUrl = location.pathname + location.search;
        fill(defaultProject);
        report(`Unable to load shared code: ${error.message}. Reset to start with the creature.`);
        return;
    }
    try {
        value = await formatProject(value);
    } catch (error) {
        if (current !== generation || loadedRevision !== revision) return;
        initialProject = value;
        initialUrl = loadedUrl;
        fill(value);
        report(`Unable to format code: ${error.message}. Your original code has been preserved; review it before running.`);
        return;
    }
    if (current !== generation || loadedRevision !== revision) return;
    initialProject = value;
    initialUrl = loadedUrl;
    fill(value);
    if (shared) status.textContent = 'Shared code loaded. Review it, then click Run. It has not executed.';
    else run();
}

addEventListener('message', event => {
    if (!frame || event.source !== frame.contentWindow || event.data?.token !== token) return;
    if (event.data.type === 'clear') output.clear();
    if (event.data.type === 'console' && typeof event.data.message === 'string') {
        const message = event.data.message.slice(0, 8000);
        if (event.data.level === 'error') report(message);
        else output.add(event.data.level, message);
    }
    if (event.data.type === 'ready' && !dirty && !hadErrors) status.textContent = 'Preview running.';
});
document.querySelector('.play-workspace').addEventListener('keydown', event => {
    if (event.code === 'KeyF' && event.shiftKey && event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        void formatActiveEditor();
        return;
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        run();
    }
}, true);
document.querySelector('#play-run').addEventListener('click', run);
document.querySelector('#play-stop').addEventListener('click', () => {
    ++generation;
    clearPreview();
    status.textContent = 'Preview stopped.';
});
document.querySelector('#play-reset').addEventListener('click', () => {
    if (dirty && !confirm('Discard your changes and restore the initially loaded code?')) return;
    ++generation;
    history.replaceState(null, '', initialUrl);
    fill(initialProject);
    run();
});
shareButton.addEventListener('click', async () => {
    shareButton.disabled = true;
    const sharedRevision = revision;
    let url;
    let link;
    try {
        const value = project();
        link = encodeProject(value).then(fragment => {
            if (sharedRevision !== revision) throw new Error('Code changed while preparing the link. Click Copy link again.');
            url = new URL(location.href);
            url.hash = fragment;
            return url.href;
        });
        // Promise-backed clipboard data retains the click's user activation while encoding.
        if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
            await navigator.clipboard.write([new ClipboardItem({
                'text/plain': link.then(text => new Blob([text], { type: 'text/plain' })),
            })]);
        } else {
            const text = await link;
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable in this browser.');
            await navigator.clipboard.writeText(text);
        }
        if (sharedRevision !== revision) {
            status.textContent = 'The copied link contains an earlier edit. Click Copy link again for your latest code.';
            return;
        }
        history.replaceState(null, '', url);
        status.textContent = 'Link copied. Recipients must click Run.';
    } catch (error) {
        try {
            await link;
        } catch (preparationError) {
            error = preparationError;
        }
        if (url && sharedRevision === revision) {
            shareLink.value = url.href;
            shareLink.parentElement.hidden = false;
            shareLink.hidden = false;
            shareLink.focus();
            shareLink.select();
            status.textContent = `Unable to copy link: ${error.message}. Copy it manually from the selected field.`;
        } else report(`Unable to copy link: ${error.message}`);
    } finally {
        shareButton.disabled = false;
    }
});
addEventListener('hashchange', loadLocation);
new MutationObserver(() => {
    frame?.contentWindow.postMessage({ token, type: 'theme', theme: currentTheme() }, '*');
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
export function installPlayground() {
    loadLocation();
}
