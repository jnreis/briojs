import { onCleanup } from '../../core/scope';
import { evaluate } from '../../core/expression';
import { effect } from '../../reactivity/effect';
import { getNodeOwner, getPendingHydration, ownNode } from '../ownership';
import { ownElementRange, portalPosition } from '../range';
import type { PortalDestination } from '../range';

export function handleTeleport(
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    if (Object.keys(modifiers).length) throw new SyntaxError('b-teleport does not support modifiers.');
    const owner = getNodeOwner(element);
    if (!owner) throw new Error('b-teleport requires an owned Brio element.');
    const range = ownElementRange(element, context, owner.runtime);
    const placeholder = element.ownerDocument.createComment('brio:teleport');
    ownNode(placeholder, owner.context, owner.runtime);
    range.start.parentNode?.insertBefore(placeholder, range.start);
    getNodeOwner(range.start)!.teleport = { source: placeholder, end: range.end };
    let stop: ReturnType<typeof effect> | undefined;
    let cancelPending: (() => void) | undefined;
    onCleanup(() => {
        stop?.();
        cancelPending?.();
        range.remove();
        placeholder.remove();
    });
    let lastTarget: Element | null | undefined;
    let lastPlacement: PortalDestination['placement'] | undefined;
    let missingSelector: string | undefined;
    stop = effect(() => {
        cancelPending?.();
        cancelPending = undefined;
        const value: unknown = evaluate(expression, context);
        let target: unknown = value;
        let placement: unknown = 'after';
        if (Array.isArray(value)) {
            if (value.length !== 2) throw new TypeError('b-teleport expects a [target, placement] pair.');
            [target, placement] = value;
        }
        if (placement !== 'before' && placement !== 'after' && placement !== 'prepend' && placement !== 'append')
            throw new TypeError('b-teleport placement must be before, after, prepend, or append.');
        if (typeof target === 'string') {
            const selector = target;
            target = element.ownerDocument.querySelector(selector);
            if (!target) {
                if (missingSelector !== selector) console.warn(`b-teleport target "${selector}" not found.`);
                missingSelector = selector;
            } else missingSelector = undefined;
        } else missingSelector = undefined;
        if (target !== null && target !== undefined && !(target instanceof element.ownerDocument.defaultView!.Element))
            throw new TypeError('b-teleport target must be an Element, selector string, null, or undefined.');
        const resolved = target;
        if (resolved) {
            if (range.nodes(true).some(node => node === resolved || node.contains(resolved)))
                throw new Error('b-teleport cannot target its own rendered output.');
            if ((placement === 'append' || placement === 'prepend') && resolved.localName === 'template')
                throw new Error('b-teleport cannot insert children into a native template.');
            const { parent } = portalPosition({ target: resolved, placement });
            if (getNodeOwner(parent)?.controlsChildren)
                throw new Error('b-teleport cannot insert into a container whose content is controlled by a directive.');
            const targetOwner = getNodeOwner(resolved);
            let pending = getPendingHydration(resolved);
            if (!targetOwner) {
                for (let ancestor = resolved.parentNode; ancestor && !pending; ancestor = ancestor.parentNode)
                    pending = getPendingHydration(ancestor);
            }
            if (pending) {
                const retry = () => stop?.run();
                pending.add(retry);
                cancelPending = () => { pending.delete(retry); };
                return;
            }
        }
        if (lastTarget === resolved && lastPlacement === placement) return;
        range.redirect(resolved ? { target: resolved, placement } : undefined, placeholder);
        lastTarget = resolved;
        lastPlacement = placement;
    });
}
