import { basicSetup, EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { tags } from '@lezer/highlight';

const highlighting = HighlightStyle.define([
    { tag: [tags.keyword, tags.modifier, tags.operatorKeyword], color: 'var(--code-keyword)' },
    { tag: [tags.string, tags.regexp], color: 'var(--code-string)' },
    { tag: [tags.number, tags.bool, tags.null], color: 'var(--code-number)' },
    { tag: [tags.tagName, tags.typeName], color: 'var(--code-tag)' },
    { tag: [tags.attributeName, tags.propertyName, tags.definition(tags.variableName)], color: 'var(--code-property)' },
    { tag: tags.comment, color: 'var(--code-comment)', fontStyle: 'italic' },
]);

const theme = EditorView.theme({
    '&': { height: '100%', color: 'var(--ink)', backgroundColor: 'var(--surface)', fontSize: '13px' },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', lineHeight: '1.7' },
    '.cm-content': { padding: '16px 0', caretColor: 'var(--ink)' },
    '.cm-line': { padding: '0 16px' },
    '.cm-gutters': { backgroundColor: 'var(--surface)', color: 'var(--muted)', borderRight: '1px solid var(--line)' },
    '.cm-gutterElement': { paddingLeft: '10px' },
    '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--soft)' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--soft)' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--ink)' },
    '.cm-panels, .cm-tooltip': { backgroundColor: 'var(--bg)', color: 'var(--ink)', borderColor: 'var(--line)' },
    '.cm-search input, .cm-search button': { background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)' },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--soft)', color: 'var(--ink)' },
});

export function createEditors(onChange) {
    const languages = { html: html(), css: css(), js: javascript() };
    const names = { html: 'HTML', css: 'CSS', js: 'JavaScript' };
    const editors = Object.fromEntries(Object.entries(languages).map(([key, language]) => {
        const extensions = [
            basicSetup, language, theme, syntaxHighlighting(highlighting),
            EditorView.contentAttributes.of({ 'aria-label': `${names[key]} code`, 'aria-describedby': 'play-status' }),
            EditorState.tabSize.of(2),
            EditorView.updateListener.of(update => { if (update.docChanged) onChange(); }),
        ];
        const state = doc => EditorState.create({ doc, extensions });
        const view = new EditorView({ state: state(''), parent: document.querySelector(`#play-${key}`) });
        return [key, {
            get value() { return view.state.doc.toString(); },
            set value(value) { view.setState(state(value)); },
            measure() { view.requestMeasure(); },
        }];
    }));
    const tabs = [...document.querySelectorAll('.play-tabs [role="tab"]')];
    function select(tab) {
        for (const item of tabs) {
            const selected = item === tab;
            item.setAttribute('aria-selected', String(selected));
            item.tabIndex = selected ? 0 : -1;
            document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
        }
        editors[tab.id.slice(4)].measure();
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
    return editors;
}
