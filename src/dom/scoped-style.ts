import { onCleanup } from '../core/scope';
import type { DomRuntime } from './types';
import { getNodeOwner } from './ownership';

const boundaries = new WeakSet<Element>();
const styles = new WeakMap<Element, { className: string; count: number }>();
let nextId = 0;

export function markStyleBoundary(element: Element): void {
    boundaries.add(element);
    onCleanup(() => boundaries.delete(element));
}

export function findStyleBoundary(node: Node, runtime: DomRuntime): Element | undefined {
    for (let parent = node.parentElement; parent; parent = parent.parentElement) {
        if (boundaries.has(parent) && getNodeOwner(parent)?.runtime.app === runtime.app) return parent;
    }
    return runtime.styleBoundary ?? runtime.root;
}

export function getStyleClass(element: Element): string | undefined {
    return styles.get(element)?.className;
}

function scopeSelectors(value: string, className: string, nested: boolean): string {
    const prefix = `.${className}`;
    const guard = `:where(${prefix}, ${prefix} *)`;
    const selectors: string[] = [];
    let selector = '', quote = '', depth = 0, attribute = 0, pseudoElement = -1, hasScope = false;
    const finish = () => {
        const leading = selector.length - selector.trimStart().length;
        const text = selector.trim();
        const index = pseudoElement < 0 ? text.length : pseudoElement - leading;
        selectors.push(nested || hasScope
            ? text.slice(0, index) + guard + text.slice(index)
            : `${prefix} ${text}`);
        selector = '';
        pseudoElement = -1;
        hasScope = false;
    };
    // CSSOM parses CSS; this scan only edits selector tokens without splitting strings or functions.
    for (let index = 0; index < value.length; index++) {
        const character = value[index];
        if (character === '\\') {
            selector += character + (value[++index] ?? '');
            continue;
        }
        if (quote) {
            selector += character;
            if (character === quote) quote = '';
            continue;
        }
        if (character === '"' || character === "'") quote = character;
        else if (character === '[') attribute++;
        else if (character === ']') attribute--;
        else if (!attribute) {
            if (character === '(') depth++;
            else if (character === ')') depth--;
            else if (character === ',' && !depth) { finish(); continue; }
            else if (character === '&' && !nested)
                throw new Error('Top-level & requires a nesting parent in b-style; use :scope for the boundary.');
            else if (character === ':') {
                if (/^:scope(?![\w-])/i.test(value.slice(index))) {
                    selector += prefix;
                    hasScope = true;
                    index += 5;
                    continue;
                }
                if (!depth && pseudoElement < 0 && (
                    value[index + 1] === ':' || /^:(before|after|first-letter|first-line)(?![\w-])/i.test(value.slice(index))
                )) pseudoElement = selector.length;
            }
        }
        selector += character;
    }
    finish();
    return selectors.join(', ');
}

function scopeRules(rules: CSSRuleList, className: string, nested = false): void {
    for (const rule of Array.from(rules)) {
        if (rule.type === 1) {
            const style = rule as CSSStyleRule;
            const original = style.selectorText;
            const scoped = scopeSelectors(original, className, nested);
            style.selectorText = scoped;
            if (style.selectorText === original && scoped !== original)
                throw new Error(`b-style could not scope selector "${original}".`);
        } else {
            const name = /^@([\w-]+)/.exec(rule.cssText)?.[1].toLowerCase();
            if (name === 'keyframes' || name === '-webkit-keyframes') continue;
            // Native nesting can expose interleaved declarations as their own CSSOM rule.
            if (!name && nested && 'style' in rule) continue;
            if (!name || !['media', 'supports', 'container', 'layer'].includes(name))
                throw new Error(`${name ? `@${name}` : 'This CSS rule'} is not supported in b-style; use an ordinary global stylesheet.`);
        }
        const group = rule as CSSRule & { cssRules?: CSSRuleList };
        if (group.cssRules) scopeRules(group.cssRules, className, nested || rule.type === 1);
    }
}

export function scopeCss(content: string, className: string, document: Document): string {
    // An inert document gives us CSSOM parsing without applying styles or loading imports.
    const parsingDocument = document.implementation.createHTMLDocument('');
    const source = parsingDocument.createElement('style');
    source.textContent = content;
    parsingDocument.head.append(source);
    if (!source.sheet) throw new Error('b-style stylesheet could not be parsed by this browser.');
    scopeRules(source.sheet.cssRules, className);
    return Array.from(source.sheet.cssRules, rule => rule.cssText).join('\n');
}

export function installScopedStyle(source: HTMLStyleElement, boundary: Element): void {
    let registration = styles.get(boundary);
    if (!registration) {
        let className: string;
        do className = `brio-scope-${++nextId}`;
        while (boundary.ownerDocument.querySelector(`.${className}, style[data-brio-scoped="${className}"]`) ||
            boundary.classList.contains(className));
        registration = { className, count: 0 };
    }
    const document = boundary.ownerDocument;
    const css = scopeCss(source.textContent ?? '', registration.className, document);
    if (!document.head) throw new Error('b-style requires a document head for its owned stylesheet.');
    const compiled = document.createElement('style');
    for (const attribute of Array.from(source.attributes)) {
        if (['media', 'nonce', 'title', 'type'].includes(attribute.name))
            compiled.setAttribute(attribute.name, attribute.value);
    }
    if (source.nonce) compiled.nonce = source.nonce;
    compiled.dataset.brioScoped = registration.className;
    compiled.textContent = css;
    registration.count++;
    styles.set(boundary, registration);
    boundary.classList.add(registration.className);
    onCleanup(() => {
        compiled.remove();
        if (--registration.count === 0) {
            boundary.classList.remove(registration.className);
            styles.delete(boundary);
        }
    });
    source.textContent = '';
    document.head.append(compiled);
}
