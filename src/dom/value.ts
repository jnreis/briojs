import { getLength, isInstanceOf } from '../core/native';

/**
 * Writes `value` to an element's `value` property. When the element is a focused text field, the selection
 * stays on the same characters: text changed before it shifts it, text changed after it leaves it alone.
 * Browsers otherwise move the cursor to the end whenever a script changes the value.
 */
export const writeValue = (element: Element, value: unknown): void => {
    const field = element as HTMLInputElement;
    const root = element.getRootNode() as Document | ShadowRoot;
    if (!(isInstanceOf(element, HTMLInputElement) || isInstanceOf(element, HTMLTextAreaElement)) || root.activeElement !== element) {
        field.value = value as string;
        return;
    }
    const previous = field.value;
    let start: number | null = null;
    let end: number | null = null;
    let direction: HTMLInputElement['selectionDirection'] = null;
    try {
        ({ selectionStart: start, selectionEnd: end, selectionDirection: direction } = field);
    } catch {
        // Some input types (email, number) have no selection.
    }
    field.value = value as string;
    const next = field.value;
    if (start === null || end === null || next === previous) return;
    const before = getLength(previous);
    const after = getLength(next);
    const shortest = Math.min(before, after);
    let prefix = 0;
    while (prefix < shortest && previous[prefix] === next[prefix]) prefix++;
    let suffix = 0;
    while (suffix < shortest - prefix && previous[before - 1 - suffix] === next[after - 1 - suffix]) suffix++;
    const map = (offset: number) => offset <= prefix ? offset
        : offset >= before - suffix ? offset + after - before
            : after - suffix;
    try {
        field.setSelectionRange(map(start), map(end), direction ?? undefined);
    } catch {
        // The type changed to one without a selection.
    }
};
