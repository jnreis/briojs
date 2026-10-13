import { onCleanup } from '../../core/scope';

export function handleTransition(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    _context: Record<PropertyKey, any>,
): void {
    const el = element as HTMLElement;
    const name = expression.trim().replace(/^['"]|['"]$/g, '') || 'brio';

    el.classList.add(`${name}-enter`, `${name}-enter-active`);
    requestAnimationFrame(() => {
        el.classList.remove(`${name}-enter`);
        el.classList.add(`${name}-enter-to`);
        const onEnd = () => {
            el.classList.remove(`${name}-enter-active`, `${name}-enter-to`);
            el.removeEventListener('transitionend', onEnd);
        };
        el.addEventListener('transitionend', onEnd);
    });

    onCleanup(() => {
        el.classList.add(`${name}-leave`, `${name}-leave-active`);
        requestAnimationFrame(() => {
            el.classList.remove(`${name}-leave`);
            el.classList.add(`${name}-leave-to`);
            const onEnd = () => {
                el.classList.remove(`${name}-leave-active`, `${name}-leave-to`);
                el.removeEventListener('transitionend', onEnd);
            };
            el.addEventListener('transitionend', onEnd);
        });
    });
}
