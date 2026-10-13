export function enterTransition(element: Element, name: string = 'brio'): void {
    const el = element as HTMLElement;
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
}

export function leaveTransition(element: Element, name: string = 'brio', onDone: () => void): void {
    const el = element as HTMLElement;
    el.classList.add(`${name}-leave`, `${name}-leave-active`);

    let done = false;
    const finish = () => {
        if (done) return;
        done = true;
        el.classList.remove(`${name}-leave-active`, `${name}-leave-to`);
        el.removeEventListener('transitionend', finish);
        onDone();
    };

    requestAnimationFrame(() => {
        el.classList.remove(`${name}-leave`);
        el.classList.add(`${name}-leave-to`);
        el.addEventListener('transitionend', finish);

        // Fallback safety timeout in case no transition properties exist on element
        setTimeout(finish, 1000);
    });
}

export function handleTransition(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    _context: Record<PropertyKey, any>,
): void {
    const name = expression.trim().replace(/^['"]|['"]$/g, '') || 'brio';
    enterTransition(element, name);
}

