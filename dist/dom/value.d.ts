/**
 * Writes `value` to an element's `value` property. When the element is a focused text field, the selection
 * stays on the same characters: text changed before it shifts it, text changed after it leaves it alone.
 * Browsers otherwise move the cursor to the end whenever a script changes the value.
 */
export declare const writeValue: (element: Element, value: unknown) => void;
