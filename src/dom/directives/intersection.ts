import { createExpressionScope, execute } from '../../core/expression';
import { onCleanup } from '../../core/scope';

export function handleIntersection(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const isExit = attrName.includes('exit');
    const isOnce = Boolean(modifiers.once);

    let debounceTimer: any;

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const matches = isExit ? !entry.isIntersecting : entry.isIntersecting;
            if (matches) {
                const invoke = () => {
                    execute(expression, createExpressionScope({ $entry: entry }, context));
                    if (isOnce) observer.disconnect();
                };

                if (modifiers.debounce) {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(invoke, 100);
                } else {
                    invoke();
                }
            }
        }
    });

    observer.observe(element);
    onCleanup(() => {
        clearTimeout(debounceTimer);
        observer.disconnect();
    });
}
