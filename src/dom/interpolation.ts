import { evaluate } from '../core/expression';
import type { ExpressionScope } from '../core/expression';

const interpolationRegex = /\$\{([^}]+)\}/g;

export function interpolateText(text: string, context: ExpressionScope): string {
    return text.replace(interpolationRegex, (_, expression) => {
        const value = evaluate(expression, context, 'text interpolation');
        return value === null || value === undefined ? '' : String(value);
    });
}
