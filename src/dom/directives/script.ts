import { isInstanceOf, createTypeError, createSyntaxError } from '../../core/native';

import { evaluateFunction, createExpressionScope } from '../../core/expression';
import { directiveError } from '../../core/errors';
import { onCleanup } from '../../core/scope';

export function handleScript(
    element: Element,
    _expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void | Promise<void> {
    if (element.tagName.toLowerCase() !== 'script')
        throw createTypeError('b-script can only be used on script elements.');
    const raw = (element.textContent || '').trim();
    if (!raw) throw createSyntaxError('b-script requires a function expression.');
    const $context = createExpressionScope({ onCleanup }, context);
    try {
        const result = evaluateFunction(raw, $context, element)($context);
        if (isInstanceOf(result, Promise))
            return result.then(() => {}, error => {
                throw directiveError('Brio b-script execution failed', error, 'b-script', element);
            });
    } catch (error) {
        throw directiveError('Brio b-script execution failed', error, 'b-script', element);
    }
}
