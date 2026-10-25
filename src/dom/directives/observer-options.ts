import { isInstanceOf, ObjectConstructor, isString, isBoolean, isNumber, createTypeError, createSyntaxError } from '../../core/native';

import { getAttribute, getOwnerDocument } from '../native';
import type { DirectiveBinding } from './registry';

/** Modifiers are shorthands for `true`; values from `.options` win. */
export function observerOptions(element: Element, { directive, modifiers, options }: DirectiveBinding): Record<string, unknown> {
    if (getAttribute(element, 'b-options') !== null)
        throw createSyntaxError(`b-options was removed in Brio 5. Configure each observer with ${directive}.options="{ … }".`);
    return ObjectConstructor.assign({}, modifiers, options);
}

export function observerTarget(value: unknown, element: Element, label: string): Element | Document | Text {
    const target = isString(value) ? getOwnerDocument(element).querySelector(value) : value;
    const view = getOwnerDocument(element).defaultView!;
    if (!(isInstanceOf(target, view.Element)) && !(isInstanceOf(target, view.Document)) && !(isInstanceOf(target, view.Text)))
        throw createTypeError(`${label} must resolve to an element, document, or text node.`);
    return target;
}

export function observerBoolean(options: Record<string, unknown>, name: string, fallback: boolean): boolean {
    const value = options[name];
    if (value === undefined) return fallback;
    if (!isBoolean(value)) throw createTypeError(`Observer ${name} must be a boolean.`);
    return value;
}

export function observerDelay(options: Record<string, unknown>): number | undefined {
    const value = options.debounce;
    if (value === undefined || value === false) return;
    if (value === true) return 100;
    if (!isNumber(value) || !Number.isFinite(value) || value < 0)
        throw createTypeError('Observer debounce must be a boolean or non-negative finite milliseconds.');
    return value;
}
