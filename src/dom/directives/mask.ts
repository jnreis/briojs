import { onCleanup } from '../../core/scope';

export interface MoneyMaskOptions {
    thousands?: string;
    decimal?: string;
    precision?: number;
}

export function formatMoney(value: string, options: MoneyMaskOptions = {}): string {
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
    const formattedInteger = integerStr.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    const result = decimalStr ? `${formattedInteger}${decimal}${decimalStr}` : formattedInteger;

    return isNegative ? `-${result}` : result;
}

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
    _context: Record<PropertyKey, any>,
): void {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        throw new TypeError('b-mask can only be used on input and textarea elements.');
    }

    const trimmed = expression.trim();
    const isMoney = Boolean(modifiers.money) || trimmed.startsWith('money') || trimmed === "'money'";

    const applyMask = () => {
        const current = element.value;
        let formatted = '';

        if (isMoney) {
            formatted = formatMoney(current);
        } else {
            const pattern = trimmed.replace(/^['"]|['"]$/g, '');
            formatted = formatMask(current, pattern);
        }

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
