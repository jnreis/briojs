import { evaluate, createExpressionScope } from '../../core/expression';
import { state } from '../../reactivity/state-v4';

export function handleData(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    parentContext: Record<PropertyKey, any>,
): Record<PropertyKey, any> {
    const context = createExpressionScope({ $el: element }, parentContext);
    if (!expression.trim()) return context;
    const data = evaluate(expression, context);
    if (data === null || typeof data !== 'object')
        throw new TypeError('b-data must evaluate to an object.');
    return createExpressionScope(state(data), parentContext);
}
