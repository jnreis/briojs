import { evaluateFunction, createExpressionScope } from '../../core/expression';
import { causedError } from '../../core/errors';
import { onCleanup } from '../../core/scope';

export function handleScript(
    element: Element,
    _expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void | Promise<void> {
    if (element.tagName.toLowerCase() !== 'script')
        throw new TypeError('b-script can only be used on script elements.');
    const raw = (element.textContent || '').trim();
    if (!raw) throw new SyntaxError('b-script requires a function expression.');
    const $context = createExpressionScope({ onCleanup }, context);
    try {
        const result = evaluateFunction(raw, $context)($context);
        if (result instanceof Promise)
            return result.then(() => {}, error => {
                throw causedError('Brio b-script execution failed.', error);
            });
    } catch (error) {
        throw causedError('Brio b-script execution failed.', error);
    }
}
