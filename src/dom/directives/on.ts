import { getLength, createSyntaxError, createTypeError, objectKeys, includesItem, isBoolean, isNumber } from '../../core/native';
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
export const eventModifiers = ['prevent', 'stop', 'self', 'outside', 'window', 'document', 'debounce', 'throttle',
    'capture', 'passive', 'once', 'ctrl', 'alt', 'shift', 'meta',
    'enter', 'esc', 'space', 'tab', 'up', 'down', 'left', 'right', 'delete'];

export function handleOn(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    options: Record<string, unknown> = {},
): void {
    const rawTarget = attrName.slice(getLength('b-on-'));
    if (!rawTarget) throw createSyntaxError(`Brio event directive "${attrName}" has no event name.`);
    const names = objectKeys(modifiers);
    for (const name of names)
        if (!includesItem(eventModifiers, name))
            throw createSyntaxError(`Unknown event modifier ".${name}" on "${attrName}". Supported: .${eventModifiers.join(', .')}.`);
    // Option values win over modifiers; debounce and throttle also accept a delay in milliseconds.
    const settings: Record<string, unknown> = { ...modifiers, ...options };
    for (const name of objectKeys(options)) {
        const value = options[name];
        const timed = name === 'debounce' || name === 'throttle';
        if (!isBoolean(value) && !(timed && isNumber(value) && value >= 0 && value < Infinity))
            throw createTypeError(`${attrName}.options ${name} must be ${timed ? 'a boolean or non-negative milliseconds' : 'a boolean'}.`);
    }
    const delay = (value: unknown) => value === true ? 150 : value as number;
    const keys = objectKeys(settings).flatMap(name => settings[name] && keyNames[name]?.split(',') || []);
    const required = systemKeys.filter(name => settings[name]);

    let target: EventTarget = element;
    // A click that opens a menu bubbles on to `document` after the menu's `.outside` listener is added; it must not close it.
    const opener = settings.outside ? dispatching ?? (globalThis as { event?: Event }).event : undefined;
    if (settings.outside) target = document;
    else if (settings.window) target = window;
    else if (settings.document) target = document;

    let debounceTimer: any;
    let throttleTimer: any;

    const handler = (event: Event) => {
        if (getLength(keys) && !includesItem(keys, (event as KeyboardEvent).key)) return;
        if (required.some(name => !(event as any)[`${name}Key`])) return;
        if (settings.prevent) event.preventDefault();
        if (settings.stop) event.stopPropagation();
        if (settings.self && event.target !== element) return;
        if (settings.outside && (event === opener || element.contains(event.target as Node) || !element.isConnected)) return;
        // Applied after the filters, so `.enter.once` waits for Enter rather than the first key.
        if (settings.once) removeEventListener(target, rawTarget, handler, listenerOptions);

        const invoke = () => {
            const previous = dispatching;
            dispatching = event;
            try {
                batch(() => execute(expression, context, event, attrName, element));
            } finally {
                dispatching = previous;
            }
        };

        if (settings.debounce) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(invoke, delay(settings.debounce));
            return;
        }

        if (settings.throttle) {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
            }, delay(settings.throttle));
            invoke();
            return;
        }

        invoke();
    };

    const listenerOptions: AddEventListenerOptions = {
        capture: Boolean(settings.capture),
        passive: Boolean(settings.passive),
    };

    addEventListener(target, rawTarget, handler, listenerOptions);
    onCleanup(() => {
        clearTimeout(debounceTimer);
        clearTimeout(throttleTimer);
        removeEventListener(target, rawTarget, handler, listenerOptions);
    });
}
