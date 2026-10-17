import type { MaskContext, MaskFormatter } from '../dom/directives/mask';

export type MoneyMaskOptions = {
    thousands?: string;
    decimal?: string;
    precision?: number;
};

export function moneyMask(options: MoneyMaskOptions = {}): MaskFormatter {
    if (options === null || typeof options !== 'object' || Array.isArray(options))
        throw new TypeError('Money mask options must be an object.');
    const { thousands = ',', decimal = '.', precision = 2 } = options;
    if (typeof thousands !== 'string') throw new TypeError('Money mask thousands must be a string.');
    if (typeof decimal !== 'string' || !decimal) throw new TypeError('Money mask decimal must be a non-empty string.');
    if (!Number.isInteger(precision) || precision < 0 || precision > 100)
        throw new RangeError('Money mask precision must be an integer between 0 and 100.');
    if (thousands === decimal) throw new TypeError('Money mask thousands and decimal separators must differ.');
    return ({ value, selectionStart, selectionEnd }: MaskContext) => {
        // Money entry intentionally uses ASCII digits and fixed minor-unit precision.
        const digits = value.replace(/\D/g, '');
        const negative = value.trim().startsWith('-');
        const integer = precision ? digits.slice(0, -precision) || '0' : digits;
        const fraction = precision ? digits.slice(-precision).padStart(precision, '0') : '';
        const grouped = (integer.replace(/^0+/, '') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, () => thousands);
        const formatted = digits ? `${negative ? '-' : ''}${grouped}${fraction ? decimal + fraction : ''}` : '';
        const map = (position: number | null) => {
            if (position === null) return undefined;
            if (position === 0) return 0;
            const rightDigits = value.slice(position).replace(/\D/g, '').length;
            // Separators may themselves contain digits, so map against the numeric parts.
            const offsets: number[] = [];
            let offset = negative ? 1 : 0;
            const plainInteger = integer.replace(/^0+/, '') || '0';
            for (let index = 0; index < plainInteger.length; index++) {
                if (index && (plainInteger.length - index) % 3 === 0) offset += thousands.length;
                offsets.push(++offset);
            }
            if (fraction) {
                offset += decimal.length;
                for (let index = 0; index < fraction.length; index++) offsets.push(++offset);
            }
            return formatted ? offsets[Math.max(0, offsets.length - rightDigits) - 1] ?? (negative ? 1 : 0) : 0;
        };
        return { value: formatted, selectionStart: map(selectionStart), selectionEnd: map(selectionEnd) };
    };
}
