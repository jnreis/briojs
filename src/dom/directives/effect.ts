import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';

export function handleEffect(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    effect(() => {
        evaluate(expression, context, 'b-effect', element);
    });
}
