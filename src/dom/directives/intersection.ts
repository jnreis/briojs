import { createExpressionScope, execute } from '../../core/expression';
import { onCleanup } from '../../core/scope';
import { observerOptions, observerTarget, observerBoolean, observerDelay } from './observer-options';

export function handleIntersection(
    element: Element,
    attrName: string,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const isExit = attrName.split('.')[0].endsWith('-exit');
    const options = observerOptions(element, attrName, modifiers, context);
    const isOnce = observerBoolean(options, 'once', false);
    const delay = observerDelay(options);
    const root = options.root === undefined || options.root === null ? null :
        observerTarget(options.root, element, 'Intersection root');
    if (root?.nodeType === 3) throw new TypeError('Intersection root cannot be a text node.');
    if (options.rootMargin !== undefined && typeof options.rootMargin !== 'string')
        throw new TypeError('Intersection rootMargin must be a string.');
    const threshold = options.threshold;
    if (threshold !== undefined && !(typeof threshold === 'number'
        ? Number.isFinite(threshold) && threshold >= 0 && threshold <= 1
        : Array.isArray(threshold) && threshold.every(value =>
            typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1)))
        throw new TypeError('Intersection threshold must be a number or array of numbers between 0 and 1.');

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
                    execute(expression, createExpressionScope({ $entry: entry }, context));
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

    onCleanup(() => {
        clearTimeout(debounceTimer);
        stopped = true;
        observer.disconnect();
    });
    observer.observe(element);
}
