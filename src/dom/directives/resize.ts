import { createExpressionScope, execute } from '../../core/expression';
import { onCleanup } from '../../core/scope';
import { observerOptions, observerBoolean, observerDelay } from './observer-options';

export function handleResize(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const options = observerOptions(element, attrName, modifiers, context);
    const target = observerBoolean(options, 'document', false) ? element.ownerDocument.documentElement : element;
    const box = options.box ?? 'content-box';
    if (box !== 'content-box' && box !== 'border-box' && box !== 'device-pixel-content-box')
        throw new TypeError('Resize box must be content-box, border-box, or device-pixel-content-box.');
    const delay = observerDelay(options);
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;

        const invoke = () => {
            const sizes = box === 'border-box' ? entry.borderBoxSize :
                box === 'device-pixel-content-box' ? entry.devicePixelContentBoxSize : entry.contentBoxSize;
            const measured = sizes?.[0];
            if (box !== 'content-box' && !measured)
                throw new Error(`ResizeObserver did not supply the requested ${box} measurement.`);
            const vertical = /^(vertical|sideways)/.test(
                element.ownerDocument.defaultView!.getComputedStyle(entry.target).writingMode);
            const size = {
                width: measured ? (vertical ? measured.blockSize : measured.inlineSize) : entry.contentRect.width,
                height: measured ? (vertical ? measured.inlineSize : measured.blockSize) : entry.contentRect.height,
            };
            execute(expression, createExpressionScope({ $size: size, $entry: entry }, context));
        };

        if (delay !== undefined) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(invoke, delay);
        } else {
            invoke();
        }
    });

    onCleanup(() => {
        clearTimeout(debounceTimer);
        observer.disconnect();
    });
    observer.observe(target, { box });
}
