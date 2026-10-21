import { deleteItem, getLength } from '../core/native';
import { evaluate } from '../core/expression';
import type { ExpressionScope } from '../core/expression';

const interpolationRegex = /\$\{([^}]+)\}/g;
// Alternating literal text and expressions (odd indexes), parsed once per distinct template string.
const parsedTemplates = new Map<string, string[]>();

const parse = (text: string): string[] => {
    let parts = parsedTemplates.get(text);
    if (!parts) {
        parts = text.split(interpolationRegex);
        parsedTemplates.set(text, parts);
        if (parsedTemplates.size > 500) deleteItem(parsedTemplates, parsedTemplates.keys().next().value!);
    }
    return parts;
};

export function interpolateText(text: string, context: ExpressionScope): string {
    const parts = parse(text);
    let result = parts[0];
    for (let index = 1; index < getLength(parts); index += 2) {
        const value = evaluate(parts[index], context, 'text interpolation');
        result += (value === null || value === undefined ? '' : String(value)) + parts[index + 1];
    }
    return result;
}
