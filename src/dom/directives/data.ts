import { isObjectType, createTypeError } from '../../core/native';
import { evaluate, createExpressionScope } from '../../core/expression';
import { createScopedState } from '../../core/scoped-state';

export function handleData(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    parentContext: Record<PropertyKey, any>,
): Record<PropertyKey, any> {
    const context = createExpressionScope({ $el: element }, parentContext);
    if (!expression.trim()) return context;
    const data = evaluate(expression, context, 'b-data', element);
    if (data === null || !isObjectType(data))
        throw createTypeError('b-data must evaluate to an object.');
    const reactiveData = createScopedState(data, parentContext.$data);
    const scopeObj = {
        $data: reactiveData,
        $el: element,
    };
    return createExpressionScope(
        scopeObj,
        parentContext,
    );
}
