import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { createScope, onCleanup } from '../../core/scope';
import type { Scope } from '../../core/scope';
import { isTrustedHTML, getTrustedHTMLString } from '../types';
import type { DomRuntime } from '../types';

export function handleHtml(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: DomRuntime,
    hydrateChildrenFn: (element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime) => void,
): void {
    let contentScope: Scope | undefined;
    onCleanup(() => contentScope?.dispose());
    effect(() => {
        const html = evaluate(expression, context);
        if (!isTrustedHTML(html))
            throw new TypeError('b-html requires a value created by trustedHTML().');
        contentScope?.dispose();
        contentScope = createScope();
        const template = document.createElement('template');
        template.innerHTML = getTrustedHTMLString(html);
        element.replaceChildren(template.content);
        contentScope.run(() => hydrateChildrenFn(element, context, runtime));
    });
}

export function handleText(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    effect(() => {
        const value = evaluate(expression, context);
        element.textContent = value === null || value === undefined ? '' : String(value);
    });
}
