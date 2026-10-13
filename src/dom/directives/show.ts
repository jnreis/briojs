import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { onCleanup } from '../../core/scope';
import { cancelTransition, enterTransition, getTransitionName, leaveTransition } from './transition';

export function handleShow(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const useDisplay = Boolean(modifiers.display);
    const el = element as HTMLElement;
    const originalDisplay = el.style.display === 'none' ? '' : el.style.display;
    const placeholder = document.createComment('brio:show');
    if (!useDisplay) {
        if (!element.parentNode) throw new Error('b-show requires an element with a parent node.');
        element.before(placeholder);
    }
    let previous: boolean | undefined;

    onCleanup(() => {
        cancelTransition(element);
        placeholder.remove();
        if (!useDisplay) element.remove();
    });

    effect(() => {
        const visible = Boolean(evaluate(expression, context));
        if (visible === previous) return;
        const initial = previous === undefined;
        previous = visible;
        cancelTransition(element);
        const name = getTransitionName(element);
        if (visible) {
            if (useDisplay) el.style.display = originalDisplay;
            else placeholder.parentNode?.insertBefore(element, placeholder.nextSibling);
            if (!initial && name) enterTransition(element, name);
        } else {
            const hide = () => {
                if (useDisplay) el.style.display = 'none';
                else element.remove();
            };
            if (!initial && name) leaveTransition(element, name, hide);
            else hide();
        }
    });
}
