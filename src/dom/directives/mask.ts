import { onCleanup } from '../../core/scope';
import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';

export type MaskContext = {
    value: string;
    selectionStart: number | null;
    selectionEnd: number | null;
    selectionDirection: 'forward' | 'backward' | 'none' | null;
    inputType: string | undefined;
};
export type MaskResult = string | {
    value: string;
    selectionStart?: number;
    selectionEnd?: number;
};
export type MaskFormatter = (context: MaskContext) => MaskResult;

type PatternPart = { literal: string } | { accepts: (character: string) => boolean };

function compilePattern(pattern: string): PatternPart[] {
    const parts: PatternPart[] = [];
    const characters = [...pattern];
    for (let index = 0; index < characters.length; index++) {
        const character = characters[index];
        if (character === '\\') {
            if (++index === characters.length) throw new SyntaxError('Mask pattern cannot end with an escape.');
            parts.push({ literal: characters[index] });
        } else if (character === '*') parts.push({ accepts: () => true });
        else if (character === 'A') parts.push({ accepts: value => /[\p{L}\p{Nd}]/u.test(value) });
        else if (character === 'a') parts.push({ accepts: value => /\p{L}/u.test(value) });
        else if (character === '#') parts.push({ accepts: value => /\p{Nd}/u.test(value) });
        else parts.push({ literal: character });
    }
    return parts;
}

function patternFormatter(pattern: string): MaskFormatter {
    const parts = compilePattern(pattern);
    return context => {
        const input = [...context.value];
        const positions: { input: number; output: number }[] = [];
        let value = '';
        let index = 0;
        let offset = 0;
        for (const part of parts) {
            if (index >= input.length) break;
            if ('literal' in part) {
                value += part.literal;
                if (input[index] === part.literal) {
                    offset += input[index++].length;
                }
            } else {
                while (index < input.length && !part.accepts(input[index]))
                    offset += input[index++].length;
                if (index < input.length) {
                    const character = input[index++];
                    value += character;
                    offset += character.length;
                    positions.push({ input: offset, output: value.length });
                }
            }
        }
        const map = (position: number | null): number | undefined => {
            if (position === null) return undefined;
            return positions.filter(entry => entry.input <= position).at(-1)?.output ?? 0;
        };
        return { value, selectionStart: map(context.selectionStart), selectionEnd: map(context.selectionEnd) };
    };
}

function validateResult(result: unknown): asserts result is MaskResult {
    if (typeof result === 'string') return;
    if (result === null || typeof result !== 'object' || !('value' in result) || typeof result.value !== 'string')
        throw new TypeError('Mask formatter must return a string or { value, selectionStart?, selectionEnd? }.');
    for (const key of ['selectionStart', 'selectionEnd'] as const) {
        const position: unknown = key in result ? Reflect.get(result, key) : undefined;
        if (position !== undefined && (typeof position !== 'number' || !Number.isInteger(position) ||
            position < 0 || position > result.value.length))
            throw new TypeError(`Mask formatter ${key} must be an integer within the formatted value.`);
    }
}

export function handleMask(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement))
        throw new TypeError('b-mask can only be used on input and textarea elements.');
    if (Object.keys(modifiers).length) throw new TypeError('b-mask does not support modifiers; use a pattern or formatter function.');

    let formatter: MaskFormatter;
    let applying = false;
    let composing = false;
    const applyMask = (event?: Event) => {
        if (applying || composing || (event instanceof InputEvent && event.isComposing)) return;
        const current = element.value;
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const direction = element.selectionDirection;
        const result = formatter({
            value: current, selectionStart: start, selectionEnd: end, selectionDirection: direction,
            inputType: event instanceof InputEvent ? event.inputType : undefined,
        });
        validateResult(result);
        const value = typeof result === 'string' ? result : result.value;
        const clamp = (position: number) => Math.min(position, value.length);
        const mappedStart = typeof result === 'string' ? start : result.selectionStart ?? start;
        const mappedEnd = typeof result === 'string' ? end : result.selectionEnd ?? end;
        applying = true;
        try {
            if (current !== value) {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (element.ownerDocument.activeElement === element && mappedStart !== null && mappedEnd !== null)
                element.setSelectionRange(clamp(mappedStart), clamp(mappedEnd), direction ?? 'none');
        } finally {
            applying = false;
        }
    };
    const compositionStart = () => { composing = true; };
    const compositionEnd = () => { composing = false; applyMask(); };
    element.addEventListener('input', applyMask, true);
    element.addEventListener('compositionstart', compositionStart);
    element.addEventListener('compositionend', compositionEnd);
    onCleanup(() => {
        element.removeEventListener('input', applyMask, true);
        element.removeEventListener('compositionstart', compositionStart);
        element.removeEventListener('compositionend', compositionEnd);
    });
    effect(() => {
        const value = evaluate(expression, context);
        if (typeof value === 'string') formatter = patternFormatter(value);
        else if (typeof value === 'function') formatter = value;
        else throw new TypeError('b-mask must evaluate to a pattern string or formatter function.');
        applyMask();
    });
}
