import { createExpressionScope, execute } from '../../core/expression';
import { onCleanup } from '../../core/scope';

export function handleResize(
    element: Element,
    _attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    let debounceTimer: any;

    const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;

        const invoke = () => {
            const size = {
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            };
            execute(expression, createExpressionScope({ $size: size, $entry: entry }, context));
        };

        if (modifiers.debounce) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(invoke, 100);
        } else {
            invoke();
        }
    });

    observer.observe(element);
    onCleanup(() => {
        clearTimeout(debounceTimer);
        observer.disconnect();
    });
}
