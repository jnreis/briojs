import { evaluate } from '../../core/expression';
import type { ExpressionScope } from '../../core/expression';

export function observerOptions(
    element: Element,
    attrName: string,
    modifiers: Record<string, boolean>,
    context: ExpressionScope,
): Record<string, unknown> {
    const expression = element.getAttribute('b-options');
    const mapping: unknown = expression === null ? {} : evaluate(expression, context);
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping))
        throw new TypeError('b-options must evaluate to an object keyed by directive name.');
    const base = attrName.split('.')[0];
    const result: Record<string, unknown> = {};
    for (const name of new Set([base, attrName])) {
        const options: unknown = Object.prototype.hasOwnProperty.call(mapping, name)
            ? Reflect.get(mapping, name) : undefined;
        if (options === undefined) continue;
        if (!options || typeof options !== 'object' || Array.isArray(options))
            throw new TypeError(`b-options["${name}"] must be an object.`);
        Object.assign(result, options);
    }
    return Object.assign(result, modifiers);
}

export function observerTarget(value: unknown, element: Element, label: string): Element | Document | Text {
    const target = typeof value === 'string' ? element.ownerDocument.querySelector(value) : value;
    const view = element.ownerDocument.defaultView!;
    if (!(target instanceof view.Element) && !(target instanceof view.Document) && !(target instanceof view.Text))
        throw new TypeError(`${label} must resolve to an element, document, or text node.`);
    return target;
}

export function observerBoolean(options: Record<string, unknown>, name: string, fallback: boolean): boolean {
    const value = options[name];
    if (value === undefined) return fallback;
    if (typeof value !== 'boolean') throw new TypeError(`Observer ${name} must be a boolean.`);
    return value;
}

export function observerDelay(options: Record<string, unknown>): number | undefined {
    const value = options.debounce;
    if (value === undefined || value === false) return;
    if (value === true) return 100;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
        throw new TypeError('Observer debounce must be a boolean or non-negative finite milliseconds.');
    return value;
}
