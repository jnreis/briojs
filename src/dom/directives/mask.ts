import { onCleanup } from '../../core/scope';

export function formatMask(value: string, pattern: string): string {
    let result = '';
    let valIndex = 0;
    for (let i = 0; i < pattern.length && valIndex < value.length; i++) {
        const patternChar = pattern[i];
        if (patternChar === '9' || patternChar === '#') {
            while (valIndex < value.length && !/\d/.test(value[valIndex])) valIndex++;
            if (valIndex < value.length) {
                result += value[valIndex++];
            }
        } else if (patternChar === 'a' || patternChar === 'A') {
            while (valIndex < value.length && !/[a-zA-Z]/.test(value[valIndex])) valIndex++;
            if (valIndex < value.length) {
                result += value[valIndex++];
            }
        } else {
            result += patternChar;
            if (value[valIndex] === patternChar) {
                valIndex++;
            }
        }
    }
    return result;
}

export function handleMask(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        throw new TypeError('b-mask can only be used on input and textarea elements.');
    }

    const pattern = expression.replace(/^['"]|['"]$/g, '');

    const applyMask = () => {
        const current = element.value;
        const formatted = formatMask(current, pattern);
        if (element.value !== formatted) {
            element.value = formatted;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    element.addEventListener('input', applyMask);
    onCleanup(() => {
        element.removeEventListener('input', applyMask);
    });
}
