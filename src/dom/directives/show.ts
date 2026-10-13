import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { onCleanup } from '../../core/scope';

export function handleShow(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const useDisplay = Boolean(modifiers.display);

    if (useDisplay) {
        const originalDisplay = (element as HTMLElement).style.display === 'none' ? '' : (element as HTMLElement).style.display;
        effect(() => {
            const value = evaluate(expression, context);
            (element as HTMLElement).style.display = value ? originalDisplay : 'none';
        });
        return;
    }

    // Default mode: remove element from DOM preserving its state/subscribers via placeholder comment
    const parent = element.parentNode;
    if (!parent) throw new Error('b-show requires an element with a parent node.');
    const placeholder = document.createComment('brio:show');
    let isAttached = true;

    onCleanup(() => {
        placeholder.remove();
        if (element.parentNode) element.remove();
    });

    effect(() => {
        const visible = Boolean(evaluate(expression, context));
        if (visible && !isAttached) {
            placeholder.parentNode?.insertBefore(element, placeholder.nextSibling);
            isAttached = true;
        } else if (!visible && isAttached) {
            if (!placeholder.parentNode) {
                element.parentNode?.replaceChild(placeholder, element);
            } else {
                element.remove();
            }
            isAttached = false;
        }
    });
}
