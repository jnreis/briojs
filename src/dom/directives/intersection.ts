import { isString, isNumber, createTypeError, isArray } from '../../core/native';
import type { DirectiveBinding, DirectiveDefinition } from './registry';
import { observerOptions, observerTarget, observerBoolean, observerDelay } from './observer-options';

function handleIntersection(element: Element, binding: DirectiveBinding): void {
    const isExit = binding.directive === 'b-on-exit';
    const options = observerOptions(element, binding);
    const isOnce = observerBoolean(options, 'once', false);
    const delay = observerDelay(options);
    const root = options.root === undefined || options.root === null ? null :
        observerTarget(options.root, element, 'Intersection root');
    if (root?.nodeType === 3) throw createTypeError('Intersection root cannot be a text node.');
    if (options.rootMargin !== undefined && !isString(options.rootMargin))
        throw createTypeError('Intersection rootMargin must be a string.');
    const threshold = options.threshold;
    if (threshold !== undefined && !(isNumber(threshold)
        ? Number.isFinite(threshold) && threshold >= 0 && threshold <= 1
        : isArray(threshold) && threshold.every(value =>
            isNumber(value) && Number.isFinite(value) && value >= 0 && value <= 1)))
        throw createTypeError('Intersection threshold must be a number or array of numbers between 0 and 1.');

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (stopped) return;
            const matches = isExit ? !entry.isIntersecting : entry.isIntersecting;
            if (matches) {
                const invoke = () => {
                    if (isOnce) {
                        stopped = true;
                        observer.disconnect();
                    }
                    binding.run({ $entry: entry });
                };

                if (delay !== undefined) {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(invoke, delay);
                } else {
                    invoke();
                }
            }
        }
    }, { root: root as Element | Document | null, rootMargin: options.rootMargin as string | undefined,
        threshold: threshold as number | number[] | undefined });

    binding.onCleanup(() => {
        clearTimeout(debounceTimer);
        stopped = true;
        observer.disconnect();
    });
    observer.observe(element);
}

const intersection = (name: string): DirectiveDefinition => ({
    name, value: 'statement', mount: handleIntersection,
    modifiers: ['once', 'debounce'], options: ['root', 'rootMargin', 'threshold', 'once', 'debounce'],
});
export const enterDirective = intersection('b-on-enter');
export const exitDirective = intersection('b-on-exit');
