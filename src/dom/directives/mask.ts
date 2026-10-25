import { isInstanceOf, getLength, isString, isObjectType, ReflectApi, isNumber, isFunction, createSyntaxError, createTypeError } from '../../core/native';

import { getOwnerDocument } from '../native';
import type { DirectiveDefinition } from './registry';

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
    for (let index = 0; index < getLength(characters); index++) {
        const character = characters[index];
        if (character === '\\') {
            if (++index === getLength(characters)) throw createSyntaxError('Mask pattern cannot end with an escape.');
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
            if (index >= getLength(input)) break;
            if ('literal' in part) {
                value += part.literal;
                if (input[index] === part.literal) {
                    offset += getLength(input[index++]);
                }
            } else {
                while (index < getLength(input) && !part.accepts(input[index]))
                    offset += getLength(input[index++]);
                if (index < getLength(input)) {
                    const character = input[index++];
                    value += character;
                    offset += getLength(character);
                    positions.push({ input: offset, output: getLength(value) });
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
    if (isString(result)) return;
    if (result === null || !isObjectType(result) || !('value' in result) || !isString(result.value))
        throw createTypeError('Mask formatter must return a string or { value, selectionStart?, selectionEnd? }.');
    for (const key of ['selectionStart', 'selectionEnd'] as const) {
        const position: unknown = key in result ? ReflectApi.get(result, key) : undefined;
        if (position !== undefined && (!isNumber(position) || !Number.isInteger(position) ||
            position < 0 || position > getLength(result.value)))
            throw createTypeError(`Mask formatter ${key} must be an integer within the formatted value.`);
    }
}

export const maskDirective: DirectiveDefinition = {
    name: 'b-mask',
    modifiers: [],
    mount(element, binding) {
        if (!(isInstanceOf(element, HTMLInputElement) || isInstanceOf(element, HTMLTextAreaElement)))
            throw createTypeError('b-mask can only be used on input and textarea elements.');

        let formatter: MaskFormatter;
        let applying = false;
        let composing = false;
        const applyMask = (event?: Event) => {
            if (applying || composing || (isInstanceOf(event, InputEvent) && event.isComposing)) return;
            const current = element.value;
            const start = element.selectionStart;
            const end = element.selectionEnd;
            const direction = element.selectionDirection;
            const result = formatter({
                value: current, selectionStart: start, selectionEnd: end, selectionDirection: direction,
                inputType: isInstanceOf(event, InputEvent) ? event.inputType : undefined,
            });
            validateResult(result);
            const value = isString(result) ? result : result.value;
            const clamp = (position: number) => Math.min(position, getLength(value));
            const mappedStart = isString(result) ? start : result.selectionStart ?? start;
            const mappedEnd = isString(result) ? end : result.selectionEnd ?? end;
            applying = true;
            try {
                if (current !== value) {
                    element.value = value;
                    element.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (getOwnerDocument(element).activeElement === element && mappedStart !== null && mappedEnd !== null)
                    element.setSelectionRange(clamp(mappedStart), clamp(mappedEnd), direction ?? 'none');
            } finally {
                applying = false;
            }
        };
        // Capture phase: the mask formats before b-model or b-on-input listeners on the same element read the value.
        binding.on(element, 'input', applyMask as EventListener, true);
        binding.on(element, 'compositionstart', () => { composing = true; });
        binding.on(element, 'compositionend', () => { composing = false; applyMask(); });
        binding.effect(() => {
            const value = binding.value();
            if (isString(value)) formatter = patternFormatter(value);
            else if (isFunction(value)) formatter = value;
            else throw createTypeError('b-mask must evaluate to a pattern string or formatter function.');
            applyMask();
        });
    },
};
