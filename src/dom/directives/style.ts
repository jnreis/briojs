import { installScopedStyle } from '../scoped-style';
import type { DomRuntime } from '../types';

export function handleStyle(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    runtime: DomRuntime,
): void {
    if (element.tagName.toLowerCase() !== 'style')
        throw new TypeError('b-style can only be used on a <style> element.');
    if (expression.trim() || Object.keys(modifiers).length)
        throw new SyntaxError('Use <style b-style> with static CSS, no expression or modifiers.');
    if (Array.from(element.attributes).some(attribute =>
        ['b-text', 'text', 'b-html', 'html'].includes(attribute.name.split('.')[0])))
        throw new SyntaxError('b-style cannot be combined with text or HTML content directives; use CSS custom properties for reactive values.');
    if (!runtime.styleBoundary)
        throw new Error('b-style requires a concrete b-data element, component host, or mounted root.');
    installScopedStyle(element as HTMLStyleElement, runtime.styleBoundary);
}
