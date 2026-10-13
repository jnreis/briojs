import { onCleanup } from '../../core/scope';
import { createExpressionScope, evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';

export interface MoneyMaskOptions {
    thousands?: string;
    decimal?: string;
    precision?: number;
}

function validateMoneyOptions(options: MoneyMaskOptions): void {
    if (options === null || typeof options !== 'object' || Array.isArray(options))
        throw new TypeError('Money mask options must be an object.');
    if (options.thousands !== undefined && typeof options.thousands !== 'string')
        throw new TypeError('Money mask thousands must be a string.');
    if (options.decimal !== undefined && (typeof options.decimal !== 'string' || !options.decimal))
        throw new TypeError('Money mask decimal must be a non-empty string.');
    if (options.precision !== undefined && (!Number.isInteger(options.precision) || options.precision < 0 || options.precision > 100))
        throw new RangeError('Money mask precision must be an integer between 0 and 100.');
    if ((options.thousands ?? ',') === (options.decimal ?? '.'))
        throw new TypeError('Money mask thousands and decimal separators must differ.');
}

export function formatMoney(value: string, options: MoneyMaskOptions = {}): string {
    validateMoneyOptions(options);
    const thousands = options.thousands ?? ',';
    const decimal = options.decimal ?? '.';
    const precision = options.precision ?? 2;

    const isNegative = value.trim().startsWith('-');
    // Keep only digits and decimal separators
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (!digitsOnly) return '';

    let integerStr: string;
    let decimalStr: string;

    if (precision > 0) {
        // Treat input as cents/fixed precision like currency inputs or partition by decimal
        if (digitsOnly.length <= precision) {
            integerStr = '0';
            decimalStr = digitsOnly.padStart(precision, '0');
        } else {
            integerStr = digitsOnly.slice(0, digitsOnly.length - precision).replace(/^0+/, '') || '0';
            decimalStr = digitsOnly.slice(digitsOnly.length - precision);
        }
    } else {
        integerStr = digitsOnly.replace(/^0+/, '') || '0';
        decimalStr = '';
    }

    // Add thousands separators
    const formattedInteger = integerStr.replace(/\B(?=(\d{3})+(?!\d))/g, () => thousands);
    const result = decimalStr ? `${formattedInteger}${decimal}${decimalStr}` : formattedInteger;

    return isNegative ? `-${result}` : result;
}

function formatPattern(value: string, pattern: string, positions?: { input: number; output: number }[]): string {
    let result = '';
    let valIndex = 0;
    for (let i = 0; i < pattern.length && valIndex < value.length; i++) {
        const patternChar = pattern[i];
        if (patternChar === '9' || patternChar === '#') {
            while (valIndex < value.length && !/\d/.test(value[valIndex])) valIndex++;
            if (valIndex < value.length) {
                positions?.push({ input: valIndex, output: result.length + 1 });
                result += value[valIndex++];
            }
        } else if (patternChar === 'a' || patternChar === 'A') {
            while (valIndex < value.length && !/[a-zA-Z]/.test(value[valIndex])) valIndex++;
            if (valIndex < value.length) {
                positions?.push({ input: valIndex, output: result.length + 1 });
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

export function formatMask(value: string, pattern: string): string {
    return formatPattern(value, pattern);
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

    const trimmed = expression.trim();
    const money = (options: MoneyMaskOptions = {}) => {
        validateMoneyOptions(options);
        return { kind: 'money' as const, options };
    };
    const maskContext = createExpressionScope({ money }, context);
    let configuration: string | ReturnType<typeof money> = '';
    const applyMask = (event?: Event) => {
        if (event instanceof InputEvent && event.isComposing) return;
        const current = element.value;
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const direction = element.selectionDirection;
        const positions: { input: number; output: number }[] = [];
        const formatted = typeof configuration === 'string'
            ? formatPattern(current, configuration, positions)
            : formatMoney(current, configuration.options);
        const deleting = event instanceof InputEvent && event.inputType.startsWith('delete');
        const mapPosition = (position: number): number => {
            if (typeof configuration === 'string') {
                if (!deleting) return formatMask(current.slice(0, position), configuration).length;
                return positions.filter(entry => entry.input < position).at(-1)?.output ?? 0;
            }
            // Anchor to the digits on the right: padding and grouping may change the left side.
            const rightDigits = current.slice(position).replace(/\D/g, '').length;
            const digits = [...formatted.matchAll(/\d/g)];
            const leftDigits = digits.length - rightDigits;
            if (position === 0) return 0;
            return leftDigits > 0 ? digits[leftDigits - 1].index! + 1 : (formatted.startsWith('-') ? 1 : 0);
        };
        const preserveSelection = element.ownerDocument.activeElement === element && start !== null && end !== null;
        const mappedStart = preserveSelection ? mapPosition(start) : null;
        const mappedEnd = preserveSelection ? mapPosition(end) : null;

        if (element.value !== formatted) {
            element.value = formatted;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (mappedStart !== null && mappedEnd !== null && (current !== formatted || deleting))
            element.setSelectionRange(mappedStart, mappedEnd, direction ?? 'none');
    };

    element.addEventListener('input', applyMask, true);
    onCleanup(() => {
        element.removeEventListener('input', applyMask, true);
    });
    effect(() => {
        const value = trimmed ? evaluate(trimmed, maskContext) : undefined;
        if (modifiers.money) configuration = money(value);
        else if (value === 'money' || value === money) configuration = money();
        else if (typeof value === 'string') configuration = value;
        else if (value && typeof value === 'object' && value.kind === 'money') configuration = money(value.options);
        else throw new TypeError('b-mask must evaluate to a pattern string or money(options).');
        applyMask();
    });
}
