import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/features/register.all';
import 'monaco-editor/languages/definitions/html/register';
import 'monaco-editor/languages/definitions/css/register';
import 'monaco-editor/languages/definitions/javascript/register';
import { htmlDefaults } from 'monaco-editor/language/html/monaco.contribution';
import { cssDefaults } from 'monaco-editor/language/css/monaco.contribution';
import { javascriptDefaults } from 'monaco-editor/language/typescript/monaco.contribution';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import HtmlWorker from 'monaco-editor/language/html/html.worker?worker';
import CssWorker from 'monaco-editor/language/css/css.worker?worker';
import TypeScriptWorker from 'monaco-editor/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
    getWorker(_moduleId, label) {
        if (label === 'html') return new HtmlWorker();
        if (label === 'css') return new CssWorker();
        if (label === 'javascript' || label === 'typescript') return new TypeScriptWorker();
        return new EditorWorker();
    },
};

htmlDefaults.setModeConfiguration({ ...htmlDefaults.modeConfiguration, documentFormattingEdits: false, documentRangeFormattingEdits: false });
cssDefaults.setModeConfiguration({ ...cssDefaults.modeConfiguration, documentFormattingEdits: false, documentRangeFormattingEdits: false });
javascriptDefaults.setModeConfiguration({ ...javascriptDefaults.modeConfiguration, documentFormattingEdits: false, documentRangeFormattingEdits: false });
const declarations = import.meta.glob('../../../dist/**/*.d.ts', { query: '?raw', import: 'default', eager: true });
for (const [path, content] of Object.entries(declarations))
    javascriptDefaults.addExtraLib(content, `file:///node_modules/@jnreis/briojs/dist/${path.split('/dist/')[1]}`);
javascriptDefaults.addExtraLib(`
import api from './node_modules/@jnreis/briojs/dist/browser';
declare global { const brio: typeof api; }
`, 'file:///brio-global.d.ts');

export function createEditors(onChange, onFormat) {
    const languages = { html: 'html', css: 'css', js: 'javascript' };
    const names = { html: 'HTML', css: 'CSS', js: 'JavaScript' };
    const models = Object.fromEntries(Object.entries(languages).map(([key, language]) => {
        const model = monaco.editor.createModel('', language, monaco.Uri.parse(`file:///playground.${key}`));
        model.updateOptions({ tabSize: 2, insertSpaces: true });
        return [key, model];
    }));
    const container = document.createElement('div');
    container.className = 'play-monaco';
    document.querySelector('#play-html').append(container);
    const view = monaco.editor.create(container, {
        model: models.html,
        ariaLabel: 'HTML code',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 22,
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: false,
        fixedOverflowWidgets: true,
        // Keep popup surfaces in the document where Monaco's generated theme variables are available.
        useShadowDOM: false,
        editContext: false,
    });
    const states = {};
    let active = 'html';
    let loading = false;
    const listeners = Object.values(models).map(model => model.onDidChangeContent(() => {
        if (!loading) onChange();
    }));
    listeners.push(view.addAction({
        id: 'brio.formatDocument',
        label: 'Format Document',
        keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
        contextMenuGroupId: '1_modification',
        contextMenuOrder: 1.3,
        run: onFormat,
    }));
    function setTheme() {
        const dark = document.documentElement.dataset.theme === 'dark';
        const css = getComputedStyle(document.body);
        const color = name => css.getPropertyValue(name).trim();
        monaco.editor.defineTheme('brio', {
            base: dark ? 'vs-dark' : 'vs',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: color('--code-keyword').slice(1) },
                { token: 'string', foreground: color('--code-string').slice(1) },
                { token: 'number', foreground: color('--code-number').slice(1) },
                { token: 'tag', foreground: color('--code-tag').slice(1) },
                { token: 'attribute.name', foreground: color('--code-property').slice(1) },
                { token: 'comment', foreground: color('--code-comment').slice(1), fontStyle: 'italic' },
            ],
            colors: {
                'editor.background': color('--surface'),
                'editor.foreground': color('--ink'),
                'editorLineNumber.foreground': color('--muted'),
                'editor.lineHighlightBackground': color('--soft'),
                'editorWidget.background': color('--surface'),
                'editorWidget.foreground': color('--ink'),
                'editorWidget.border': color('--line'),
                'input.background': color('--bg'),
                'input.foreground': color('--ink'),
                'input.border': color('--line'),
                'input.placeholderForeground': color('--muted'),
                'menu.background': color('--surface'),
                'menu.foreground': color('--ink'),
                'menu.border': color('--line'),
                'menu.selectionBackground': color('--soft'),
                'menu.selectionForeground': color('--ink'),
            },
        });
        monaco.editor.setTheme('brio');
    }
    setTheme();
    const themeObserver = new MutationObserver(setTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const editors = Object.fromEntries(Object.entries(models).map(([key, model]) => [key, {
        get value() { return model.getValue(); },
        set value(value) {
            loading = true;
            try { model.setValue(value); } finally { loading = false; }
            delete states[key];
        },
        replace(value) {
            if (value === model.getValue()) return;
            const selections = key === active ? view.getSelections() : null;
            model.pushStackElement();
            model.pushEditOperations(selections, [{ range: model.getFullModelRange(), text: value }], () =>
                selections?.map(selection => {
                    const start = model.validatePosition(selection.getSelectionStart());
                    const end = model.validatePosition(selection.getPosition());
                    return new monaco.Selection(start.lineNumber, start.column, end.lineNumber, end.column);
                }) ?? null);
            model.pushStackElement();
        },
    }]));
    const tabs = [...document.querySelectorAll('.play-tabs [role="tab"]')];
    function select(tab) {
        states[active] = view.saveViewState();
        for (const item of tabs) {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected));
            item.tabIndex = selected ? 0 : -1;
            document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
        }
        active = tab.id.slice(4);
        document.getElementById(tab.getAttribute('aria-controls')).append(container);
        view.setModel(models[active]);
        view.updateOptions({ ariaLabel: `${names[active]} code` });
        view.layout();
        if (states[active]) view.restoreViewState(states[active]);
    }
    for (const [index, tab] of tabs.entries()) {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = tabs.length - 1;
            if (next === undefined) return;
            event.preventDefault();
            select(tabs[next]);
            tabs[next].focus();
        });
    }
    addEventListener('pagehide', event => {
        if (event.persisted) return;
        themeObserver.disconnect();
        for (const listener of listeners) listener.dispose();
        view.dispose();
        for (const model of Object.values(models)) model.dispose();
    });
    return editors;
}
