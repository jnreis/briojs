import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { onCleanup } from '../../core/scope';
import { leaveTransition } from './transition';

export function handleShow(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const useDisplay = Boolean(modifiers.display);
    const el = element as HTMLElement;

    if (useDisplay) {
        const originalDisplay = el.style.display === 'none' ? '' : el.style.display;
        effect(() => {
            const value = evaluate(expression, context);
            const transitionAttr = el.getAttribute('b-transition');
            if (value) {
                el.style.display = originalDisplay;
            } else if (transitionAttr !== null && el.style.display !== 'none') {
                const name = transitionAttr.trim().replace(/^['"]|['"]$/g, '') || 'brio';
                leaveTransition(el, name, () => {
                    el.style.display = 'none';
                });
            } else {
                el.style.display = 'none';
            }
        });
        return;
    }

    // Default mode: remove element from DOM preserving its state/subscribers via placeholder comment
    const parent = element.parentNode;
    if (!parent) throw new Error('b-show requires an element with a parent node.');
    const placeholder = document.createComment('brio:show');
    let isAttached = true;
    let isLeaving = false;

    onCleanup(() => {
        placeholder.remove();
        if (element.parentNode) element.remove();
    });

    effect(() => {
        const visible = Boolean(evaluate(expression, context));
        if (visible) {
            isLeaving = false;
            if (!isAttached) {
                placeholder.parentNode?.insertBefore(element, placeholder.nextSibling);
                isAttached = true;
            }
        } else if (isAttached && !isLeaving) {
            const transitionAttr = element.getAttribute('b-transition');
            if (transitionAttr !== null) {
                isLeaving = true;
                const name = transitionAttr.trim().replace(/^['"]|['"]$/g, '') || 'brio';
                leaveTransition(element, name, () => {
                    if (!isAttached) return;
                    if (!placeholder.parentNode) {
                        element.parentNode?.replaceChild(placeholder, element);
                    } else {
                        element.remove();
                    }
                    isAttached = false;
                    isLeaving = false;
                });
            } else {
                if (!placeholder.parentNode) {
                    element.parentNode?.replaceChild(placeholder, element);
                } else {
                    element.remove();
                }
                isAttached = false;
            }
        }
    });
}
