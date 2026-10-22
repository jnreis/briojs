import { isInstanceOf, ObjectConstructor, createTypeError, arrayFrom, isArray, includesItem } from '../../core/native';

import { addEventListener, removeEventListener } from '../native';
import { writeValue } from '../value';
import { assign, evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { onCleanup } from '../../core/scope';

export function handleModel(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): (() => void) | undefined {
    if (!(isInstanceOf(element, HTMLInputElement) || isInstanceOf(element, HTMLTextAreaElement) || isInstanceOf(element, HTMLSelectElement)))
        throw createTypeError('b-model can only be used on input, textarea, and select elements.');

    const isLazy = Boolean(modifiers.lazy);
    const isTrim = Boolean(modifiers.trim);
    const isNumber = Boolean(modifiers.number);

    const formatValue = (val: string): unknown => {
        let res = isTrim ? val.trim() : val;
        if (isNumber) {
            const parsed = parseFloat(res);
            return isNaN(parsed) ? res : parsed;
        }
        return res;
    };

    const updateState = () => {
        const input = element as HTMLInputElement;
        const current = evaluate(expression, context, 'b-model', element);
        if (isInstanceOf(element, HTMLSelectElement) && element.multiple) {
            assign(expression, context, arrayFrom(element.selectedOptions, option => formatValue(option.value)), 'b-model', element);
        } else if (input.type === 'checkbox' && isArray(current)) {
            const values = current.slice() as unknown[];
            const formattedVal = formatValue(input.value);
            const index = values.indexOf(formattedVal);
            if (input.checked && index < 0) values.push(formattedVal);
            else if (!input.checked && index >= 0) values.splice(index, 1);
            assign(expression, context, values, 'b-model', element);
        } else if (input.type === 'checkbox') {
            assign(expression, context, input.checked, 'b-model', element);
        } else if (input.type === 'radio') {
            if (input.checked) assign(expression, context, formatValue(input.value), 'b-model', element);
        } else {
            assign(expression, context, formatValue(element.value), 'b-model', element);
        }
    };

    const eventName = isLazy ? 'change' : 'input';
    addEventListener(element, eventName, updateState);
    if (!isLazy && (isInstanceOf(element, HTMLInputElement) && (element.type === 'checkbox' || element.type === 'radio') || isInstanceOf(element, HTMLSelectElement))) {
        addEventListener(element, 'change', updateState);
    }

    onCleanup(() => {
        removeEventListener(element, eventName, updateState);
        removeEventListener(element, 'change', updateState);
    });

    const updateElement = (value: unknown) => {
        const input = element as HTMLInputElement;
        if (isInstanceOf(element, HTMLSelectElement) && element.multiple && isArray(value)) {
            const selected = new Set(value.map(String));
            for (const option of arrayFrom(element.options)) option.selected = selected.has(option.value);
        } else if (input.type === 'checkbox') {
            input.checked = isArray(value) ? includesItem(value, formatValue(input.value)) : Boolean(value);
        } else if (input.type === 'radio') {
            input.checked = ObjectConstructor.is(value, formatValue(input.value));
        } else if (element.value !== String(value ?? '')) {
            writeValue(element, String(value ?? ''));
        }
    };

    const start = () => {
        effect(() => updateElement(evaluate(expression, context, 'b-model', element)));
    };

    if (isInstanceOf(element, HTMLSelectElement)) {
        const observer = new MutationObserver(() => updateElement(evaluate(expression, context, 'b-model', element)));
        observer.observe(element, { childList: true, subtree: true });
        onCleanup(() => observer.disconnect());
        // Options may be rendered by child directives, so selection starts after children hydrate.
        return start;
    }
    start();
}
