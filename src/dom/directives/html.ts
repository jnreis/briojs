import { createTypeError, TEMPLATE } from '../../core/native';
import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import type { Scope } from '../../core/scope';
import { isTrustedHTML, getTrustedHTMLString } from '../types';
import type { DomRuntime } from '../types';

export function handleHtml(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateChildrenFn: (element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    let contentScope: Scope | undefined;
    onCleanup(() => contentScope?.dispose());
    effect(() => {
        const html = evaluate(expression, context);
        if (modifiers.hydrate && !isTrustedHTML(html))
            throw createTypeError('b-html.hydrate requires a trustedHTML() value.');
        const htmlStr = isTrustedHTML(html)
            ? getTrustedHTMLString(html)
            : String(html ?? '');
        contentScope?.dispose();
        contentScope = undefined;
        const template = document.createElement(TEMPLATE);
        template.innerHTML = htmlStr;
        element.replaceChildren(template.content);
        if (modifiers.hydrate) {
            contentScope = createScope();
            contentScope.run(() => hydrateChildrenFn(element, context, runtime));
        }
    });
}

export function handleText(
    element: Element,
    expression: string,
    context: Record<PropertyKey, any>,
): void {
    effect(() => {
        const value = evaluate(expression, context);
        const text = value === null || value === undefined ? '' : String(value);
        element.textContent = text;
    });
}
