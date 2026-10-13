import { createExpressionScope, execute } from '../../core/expression';
import { batch } from '../../reactivity/effect';
import { onCleanup } from '../../core/scope';

export function handleOn(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const rawTarget = attrName.startsWith('b-on-')
        ? attrName.slice('b-on-'.length)
        : attrName.slice('on-'.length);
    if (!rawTarget) throw new SyntaxError(`Brio event directive "${attrName}" has no event name.`);

    let target: EventTarget = element;
    if (modifiers.outside) target = document;
    else if (modifiers.window) target = window;
    else if (modifiers.document) target = document;

    let debounceTimer: any;
    let throttleTimer: any;

    const handler = (event: Event) => {
        if (modifiers.prevent) event.preventDefault();
        if (modifiers.stop) event.stopPropagation();
        if (modifiers.self && event.target !== element) return;
        if (modifiers.outside && (element.contains(event.target as Node) || !element.isConnected)) return;

        const invoke = () => batch(() => {
            execute(expression, createExpressionScope({ $event: event }, context), event);
        });

        if (modifiers.debounce) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(invoke, 150);
            return;
        }

        if (modifiers.throttle) {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
            }, 150);
            invoke();
            return;
        }

        invoke();
    };

    const options: AddEventListenerOptions = {
        capture: Boolean(modifiers.capture),
        passive: Boolean(modifiers.passive),
        once: Boolean(modifiers.once),
    };

    target.addEventListener(rawTarget, handler, options);
    onCleanup(() => {
        clearTimeout(debounceTimer);
        clearTimeout(throttleTimer);
        target.removeEventListener(rawTarget, handler, options);
    });
}
