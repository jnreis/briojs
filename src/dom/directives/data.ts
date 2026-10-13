import { evaluate, createExpressionScope } from '../../core/expression';
import { state } from '../../reactivity/state';

export function handleData(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    parentContext: Record<PropertyKey, any>,
): Record<PropertyKey, any> {
    const context = createExpressionScope({ $el: element }, parentContext);
    if (!expression.trim()) return context;
    const data = evaluate(expression, context);
    if (data === null || typeof data !== 'object')
        throw new TypeError('b-data must evaluate to an object.');
    const reactiveData = state(data);
    return createExpressionScope(
        { ...reactiveData, $data: reactiveData, $parent: parentContext },
        parentContext,
    );
}
