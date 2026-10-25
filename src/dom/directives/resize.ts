import { getOwnerDocument } from '../native';
import { createTypeError, createError } from '../../core/native';
import type { DirectiveBinding, DirectiveDefinition } from './registry';
import { observerOptions, observerBoolean, observerDelay } from './observer-options';

function handleResize(element: Element, binding: DirectiveBinding): void {
    const options = observerOptions(element, binding);
    const target = observerBoolean(options, 'document', false) ? getOwnerDocument(element).documentElement : element;
    const box = options.box ?? 'content-box';
    if (box !== 'content-box' && box !== 'border-box' && box !== 'device-pixel-content-box')
        throw createTypeError('Resize box must be content-box, border-box, or device-pixel-content-box.');
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
                throw createError(`ResizeObserver did not supply the requested ${box} measurement.`);
            const vertical = /^(vertical|sideways)/.test(
                getOwnerDocument(element).defaultView!.getComputedStyle(entry.target).writingMode);
            const size = {
                width: measured ? (vertical ? measured.blockSize : measured.inlineSize) : entry.contentRect.width,
                height: measured ? (vertical ? measured.inlineSize : measured.blockSize) : entry.contentRect.height,
            };
            binding.run({ $size: size, $entry: entry });
        };

        if (delay !== undefined) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(invoke, delay);
        } else {
            invoke();
        }
    });

    binding.onCleanup(() => {
        clearTimeout(debounceTimer);
        observer.disconnect();
    });
    observer.observe(target, { box });
}

export const resizeDirective: DirectiveDefinition = {
    name: 'b-on-resize', value: 'statement', mount: handleResize,
    modifiers: ['debounce', 'document'], options: ['box', 'document', 'debounce'],
};
