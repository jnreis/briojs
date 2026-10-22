import { getLength, createSyntaxError, startsWith, objectKeys, includesItem } from '../../core/native';
import { addEventListener, removeEventListener } from '../native';
import { execute } from '../../core/expression';
import { batch } from '../../reactivity/effect';
import { onCleanup } from '../../core/scope';

// Comma-separated, since the space key's name is " ".
const keyNames: Record<string, string> = {
    enter: 'Enter', esc: 'Escape', space: ' ', tab: 'Tab',
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', delete: 'Delete,Backspace',
};
const systemKeys = ['ctrl', 'alt', 'shift', 'meta'];
/** The event whose Brio handler is running, so `.outside` listeners it creates can ignore that same event. */
let dispatching: Event | undefined;
const eventModifiers = ['prevent', 'stop', 'self', 'outside', 'window', 'document', 'debounce', 'throttle',
    'capture', 'passive', 'once', 'ctrl', 'alt', 'shift', 'meta',
    'enter', 'esc', 'space', 'tab', 'up', 'down', 'left', 'right', 'delete'];

export function handleOn(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const rawTarget = startsWith(attrName, 'b-on-')
        ? attrName.slice(getLength('b-on-'))
        : attrName.slice(getLength('on-'));
    if (!rawTarget) throw createSyntaxError(`Brio event directive "${attrName}" has no event name.`);
    const names = objectKeys(modifiers);
    for (const name of names)
        if (!includesItem(eventModifiers, name))
            throw createSyntaxError(`Unknown event modifier ".${name}" on "${attrName}". Supported: .${eventModifiers.join(', .')}.`);
    const keys = names.flatMap(name => keyNames[name]?.split(',') ?? []);
    const required = systemKeys.filter(name => modifiers[name]);

    let target: EventTarget = element;
    // A click that opens a menu bubbles on to `document` after the menu's `.outside` listener is added; it must not close it.
    const opener = modifiers.outside ? dispatching ?? (globalThis as { event?: Event }).event : undefined;
    if (modifiers.outside) target = document;
    else if (modifiers.window) target = window;
    else if (modifiers.document) target = document;

    let debounceTimer: any;
    let throttleTimer: any;

    const handler = (event: Event) => {
        if (getLength(keys) && !includesItem(keys, (event as KeyboardEvent).key)) return;
        if (required.some(name => !(event as any)[`${name}Key`])) return;
        if (modifiers.prevent) event.preventDefault();
        if (modifiers.stop) event.stopPropagation();
        if (modifiers.self && event.target !== element) return;
        if (modifiers.outside && (event === opener || element.contains(event.target as Node) || !element.isConnected)) return;
        // Applied after the filters, so `.enter.once` waits for Enter rather than the first key.
        if (modifiers.once) removeEventListener(target, rawTarget, handler, options);

        const invoke = () => {
            const previous = dispatching;
            dispatching = event;
            try {
                batch(() => execute(expression, context, event, attrName, element));
            } finally {
                dispatching = previous;
            }
        };

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
    };

    addEventListener(target, rawTarget, handler, options);
    onCleanup(() => {
        clearTimeout(debounceTimer);
        clearTimeout(throttleTimer);
        removeEventListener(target, rawTarget, handler, options);
    });
}
