import { assign, evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { onCleanup } from '../../core/scope';

export function handleModel(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement))
        throw new TypeError('b-model can only be used on input, textarea, and select elements.');

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
        const current = evaluate(expression, context);
        if (element instanceof HTMLSelectElement && element.multiple) {
            assign(expression, context, Array.from(element.selectedOptions, option => formatValue(option.value)));
        } else if (input.type === 'checkbox' && Array.isArray(current)) {
            const values = current.slice() as unknown[];
            const formattedVal = formatValue(input.value);
            const index = values.indexOf(formattedVal);
            if (input.checked && index < 0) values.push(formattedVal);
            else if (!input.checked && index >= 0) values.splice(index, 1);
            assign(expression, context, values);
        } else if (input.type === 'checkbox') {
            assign(expression, context, input.checked);
        } else if (input.type === 'radio') {
            if (input.checked) assign(expression, context, formatValue(input.value));
        } else {
            assign(expression, context, formatValue(element.value));
        }
    };

    const eventName = isLazy ? 'change' : 'input';
    element.addEventListener(eventName, updateState);
    if (!isLazy && (element instanceof HTMLInputElement && (element.type === 'checkbox' || element.type === 'radio') || element instanceof HTMLSelectElement)) {
        element.addEventListener('change', updateState);
    }

    onCleanup(() => {
        element.removeEventListener(eventName, updateState);
        element.removeEventListener('change', updateState);
    });

    const updateElement = (value: unknown) => {
        const input = element as HTMLInputElement;
        if (element instanceof HTMLSelectElement && element.multiple && Array.isArray(value)) {
            const selected = new Set(value.map(String));
            for (const option of Array.from(element.options)) option.selected = selected.has(option.value);
        } else if (input.type === 'checkbox') {
            input.checked = Array.isArray(value) ? value.includes(input.value) : Boolean(value);
        } else if (input.type === 'radio') {
            input.checked = Object.is(value, input.value);
        } else if (element.value !== String(value ?? '')) {
            element.value = String(value ?? '');
        }
    };

    effect(() => updateElement(evaluate(expression, context)));

    if (element instanceof HTMLSelectElement) {
        const observer = new MutationObserver(() => updateElement(evaluate(expression, context)));
        observer.observe(element, { childList: true, subtree: true });
        onCleanup(() => observer.disconnect());
    }
}
