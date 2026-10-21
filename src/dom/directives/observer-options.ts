import { isInstanceOf, isObjectType, objectConstructor, ReflectApi, isString, isBoolean, isNumber, isArray, createTypeError } from '../../core/native';

import { getAttribute, getOwnerDocument } from '../native';
import { evaluate } from '../../core/expression';
import type { ExpressionScope } from '../../core/expression';

export function observerOptions(
    element: Element,
    attrName: string,
    modifiers: Record<string, boolean>,
    context: ExpressionScope,
): Record<string, unknown> {
    const expression = getAttribute(element, 'b-options');
    const mapping: unknown = expression === null ? {} : evaluate(expression, context);
    if (!mapping || !isObjectType(mapping) || isArray(mapping))
        throw createTypeError('b-options must evaluate to an object keyed by directive name.');
    const base = attrName.split('.')[0];
    const result: Record<string, unknown> = {};
    for (const name of new Set([base, attrName])) {
        const options: unknown = objectConstructor.prototype.hasOwnProperty.call(mapping, name)
            ? ReflectApi.get(mapping, name) : undefined;
        if (options === undefined) continue;
        if (!options || !isObjectType(options) || isArray(options))
            throw createTypeError(`b-options["${name}"] must be an object.`);
        objectConstructor.assign(result, options);
    }
    return objectConstructor.assign(result, modifiers);
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
