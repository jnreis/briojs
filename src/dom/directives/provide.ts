import { createExpressionScope, evaluate } from '../../core/expression';
import type { ExpressionScope } from '../../core/expression';
import { createProvidedValues } from '../../core/context-values';

export function handleProvide(expression: string, context: ExpressionScope): ExpressionScope {
    const $provided = createProvidedValues(() => evaluate(expression, context), context.$provided);
    return createExpressionScope({ $provided }, context);
}
