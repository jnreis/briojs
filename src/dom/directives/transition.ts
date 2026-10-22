import { getLength, deleteItem } from '../../core/native';
import { getOwnerDocument, removeEventListener, addEventListener } from '../native';
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
    const style = getOwnerDocument(element).defaultView!.getComputedStyle(element);
    const milliseconds = (value: string) =>
        (parseFloat(value) || 0) * (value.trim().endsWith('ms') ? 1 : 1000);
    const durations = style.transitionDuration.split(',').map(milliseconds);
    const delays = style.transitionDelay.split(',').map(milliseconds);
    return Math.max(0, ...style.transitionProperty.split(',').map((property, index) =>
        property.trim() === 'none' ? 0 :
            durations[index % getLength(durations)] + delays[index % getLength(delays)]
    ));
}

function runTransition(element: Element, name: string, phase: 'enter' | 'leave', onDone?: () => void): void {
    const interrupted = running.has(element);
    cancelTransition(element);
    const view = getOwnerDocument(element).defaultView!;
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
        removeEventListener(element, 'transitionrun', onRun);
        removeEventListener(element, 'transitionend', onEnd);
        removeEventListener(element, 'transitioncancel', onEnd);
        element.classList.remove(...classes);
        if (running.get(element) === cleanup) deleteItem(running, element);
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
        deleteItem(pending, transition.propertyName);
        if (started && pending.size === 0) {
            view.cancelAnimationFrame(completionFrame);
            completionFrame = view.requestAnimationFrame(() => {
                if (pending.size === 0) finish();
            });
        }
    };

    running.set(element, cleanup);
    addEventListener(element, 'transitionrun', onRun);
    addEventListener(element, 'transitionend', onEnd);
    addEventListener(element, 'transitioncancel', onEnd);
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

const moving = new WeakMap<Element, () => void>();

/** Positions of keyed rows that animate moves, read before the DOM changes. */
export function measureMoves(elements: Iterable<Element>): Map<Element, DOMRect> {
    const rects = new Map<Element, DOMRect>();
    for (const element of elements) {
        if (getTransitionName(element) && element.isConnected) rects.set(element, element.getBoundingClientRect());
    }
    return rects;
}

/** FLIP: rows that shifted start at their old position and transition to the new one under `${name}-move`. */
export function moveTransitions(before: Map<Element, DOMRect>): void {
    if (!before.size) return;
    for (const element of before.keys()) moving.get(element)?.();
    const shifted: [HTMLElement, string, string][] = [];
    for (const [element, rect] of before) {
        const name = getTransitionName(element);
        if (!name || !element.isConnected) continue;
        const after = element.getBoundingClientRect();
        const dx = rect.left - after.left;
        const dy = rect.top - after.top;
        if (!dx && !dy) continue;
        const { style } = element as HTMLElement;
        shifted.push([element as HTMLElement, name, style.transitionDuration]);
        style.transitionDuration = '0s';
        style.transform = `translate(${dx}px, ${dy}px)`;
    }
    if (!getLength(shifted)) return;
    // One forced reflow commits every inverted position before the transitions start.
    void getOwnerDocument(shifted[0][0]).body?.offsetHeight;
    for (const [element, name, duration] of shifted) {
        const moveClass = `${name}-move`;
        const { style } = element;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const done = () => {
            clearTimeout(timer);
            removeEventListener(element, 'transitionend', onEnd);
            removeEventListener(element, 'transitioncancel', onEnd);
            element.classList.remove(moveClass);
            if (moving.get(element) === done) deleteItem(moving, element);
        };
        const onEnd = (event: Event) => {
            if (event.target === element && (event as TransitionEvent).propertyName === 'transform') done();
        };
        moving.set(element, () => {
            done();
            style.transform = '';
        });
        addEventListener(element, 'transitionend', onEnd);
        addEventListener(element, 'transitioncancel', onEnd);
        element.classList.add(moveClass);
        style.transitionDuration = duration;
        style.transform = '';
        const timeout = transitionTimeout(element);
        if (timeout > 0) timer = setTimeout(done, timeout + 50);
        else done();
    }
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
        deleteItem(names, element);
    });
    if (element.isConnected) {
        for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
            if ((ancestor as HTMLElement).style?.display === 'none') return;
        }
        enterTransition(element, getTransitionName(element));
    }
}
