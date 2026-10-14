import { onCleanup } from '../../core/scope';

const names = new WeakMap<Element, string>();
const running = new WeakMap<Element, () => void>();

export function prepareTransition(element: Element, expression: string): void {
    names.set(element, expression.trim().replace(/^['"]|['"]$/g, '') || 'brio');
}

export function getTransitionName(element: Element): string | undefined {
    return names.get(element);
}

export function cancelTransition(element: Element): void {
    running.get(element)?.();
}

function transitionTimeout(element: Element): number {
    const style = element.ownerDocument.defaultView!.getComputedStyle(element);
    const milliseconds = (value: string) =>
        parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000);
    const durations = style.transitionDuration.split(',').map(milliseconds);
    const delays = style.transitionDelay.split(',').map(milliseconds);
    return Math.max(0, ...style.transitionProperty.split(',').map((property, index) =>
        property.trim() === 'none' ? 0 :
            durations[index % durations.length] + delays[index % delays.length]
    ));
}

function runTransition(element: Element, name: string, phase: 'enter' | 'leave', onDone?: () => void): void {
    const interrupted = running.has(element);
    cancelTransition(element);
    const view = element.ownerDocument.defaultView!;
    const classes = [`${name}-${phase}`, `${name}-${phase}-active`, `${name}-${phase}-to`];
    const pending = new Set<string>();
    let started = false;
    let activated = false;
    let settled = false;
    let frame = 0;
    let completionFrame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
        if (settled) return;
        settled = true;
        view.cancelAnimationFrame(frame);
        view.cancelAnimationFrame(completionFrame);
        clearTimeout(timer);
        element.removeEventListener('transitionrun', onRun);
        element.removeEventListener('transitionend', onEnd);
        element.removeEventListener('transitioncancel', onEnd);
        element.classList.remove(...classes);
        if (running.get(element) === cleanup) running.delete(element);
    };
    const finish = () => {
        if (settled) return;
        cleanup();
        onDone?.();
    };
    const isOwnEvent = (event: TransitionEvent) => event.target === element && !event.pseudoElement;
    const onRun = (event: Event) => {
        const transition = event as TransitionEvent;
        if (!activated || !isOwnEvent(transition)) return;
        started = true;
        pending.add(transition.propertyName);
    };
    const onEnd = (event: Event) => {
        const transition = event as TransitionEvent;
        if (!activated || !isOwnEvent(transition)) return;
        pending.delete(transition.propertyName);
        if (started && pending.size === 0) {
            view.cancelAnimationFrame(completionFrame);
            completionFrame = view.requestAnimationFrame(() => {
                if (pending.size === 0) finish();
            });
        }
    };

    running.set(element, cleanup);
    element.addEventListener('transitionrun', onRun);
    element.addEventListener('transitionend', onEnd);
    element.addEventListener('transitioncancel', onEnd);
    const activate = () => {
        activated = true;
        element.classList.remove(classes[0]);
        element.classList.add(classes[1], classes[2]);
        const timeout = transitionTimeout(element);
        if (timeout > 0) timer = setTimeout(finish, timeout + 50);
        else finish();
    };
    if (interrupted) {
        // Retarget the existing CSS transition without rendering the opposite starting pose.
        activate();
    } else {
        element.classList.add(classes[0], classes[1]);
        frame = view.requestAnimationFrame(() => {
            frame = view.requestAnimationFrame(activate);
        });
    }
}

export function enterTransition(element: Element, name: string = 'brio'): void {
    runTransition(element, name, 'enter');
}

export function leaveTransition(element: Element, name: string = 'brio', onDone: () => void): void {
    runTransition(element, name, 'leave', onDone);
}

export function handleTransition(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    _context: Record<PropertyKey, any>,
): void {
    prepareTransition(element, expression);
    onCleanup(() => {
        cancelTransition(element);
        names.delete(element);
    });
    if (element.isConnected) {
        for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
            if ((ancestor as HTMLElement).style?.display === 'none') return;
        }
        enterTransition(element, getTransitionName(element));
    }
}
