import {
    isInstanceOf,
    getLength,
    isString,
    objectKeys,
    createSyntaxError,
    createError,
    isArray,
    createTypeError,
    removeElement,
    deleteItem,
    TEMPLATE,
    B_TELEPORT,
    TELEPORT,
} from '../../core/native';

import { getOwnerDocument, getParent } from '../native';
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
    if (getLength(objectKeys(modifiers))) throw createSyntaxError(B_TELEPORT + ' does not support modifiers.');
    const owner = getNodeOwner(element);
    if (!owner) throw createError(B_TELEPORT + ' requires an owned Brio element.');
    const range = ownElementRange(element, context, owner.runtime);
    const placeholder = getOwnerDocument(element).createComment('brio:' + TELEPORT);
    ownNode(placeholder, owner.context, owner.runtime);
    getParent(range.start)?.insertBefore(placeholder, range.start);
    getNodeOwner(range.start)![TELEPORT] = { source: placeholder, end: range.end };
    let stop: ReturnType<typeof effect> | undefined;
    let cancelPending: (() => void) | undefined;
    onCleanup(() => {
        stop?.();
        cancelPending?.();
        removeElement(range);
        removeElement(placeholder);
    });
    let lastTarget: Element | null | undefined;
    let lastPlacement: PortalDestination['placement'] | undefined;
    let missingSelector: string | undefined;
    stop = effect(() => {
        cancelPending?.();
        cancelPending = undefined;
        const value: unknown = evaluate(expression, context, B_TELEPORT, element);
        let target: unknown = value;
        let placement: unknown = 'after';
        if (isArray(value)) {
            if (getLength(value) !== 2) throw createTypeError(B_TELEPORT + ' expects a [target, placement] pair.');
            [target, placement] = value;
        }
        if (placement !== 'before' && placement !== 'after' && placement !== 'prepend' && placement !== 'append')
            throw createTypeError(B_TELEPORT + ' placement must be before, after, prepend, or append.');
        if (isString(target)) {
            const selector = target;
            target = getOwnerDocument(element).querySelector(selector);
            if (!target) {
                if (missingSelector !== selector) console.warn(B_TELEPORT + ` target "${selector}" not found.`);
                missingSelector = selector;
            } else missingSelector = undefined;
        } else missingSelector = undefined;
        if (target !== null && target !== undefined && !(isInstanceOf(target, getOwnerDocument(element).defaultView!.Element)))
            throw createTypeError(B_TELEPORT + ' target must be an Element, selector string, null, or undefined.');
        const resolved = target;
        if (resolved) {
            if (range.nodes(true).some(node => node === resolved || node.contains(resolved)))
                throw createError(B_TELEPORT + ' cannot target its own rendered output.');
            if ((placement === 'append' || placement === 'prepend') && resolved.localName === TEMPLATE)
                throw createError(B_TELEPORT + ' cannot insert children into a native template.');
            const { parent } = portalPosition({ target: resolved, placement });
            if (getNodeOwner(parent)?.controlsChildren)
                throw createError(B_TELEPORT + ' cannot insert into a container whose content is controlled by a directive.');
            const targetOwner = getNodeOwner(resolved);
            let pending = getPendingHydration(resolved);
            if (!targetOwner) {
                for (let ancestor = getParent(resolved); ancestor && !pending; ancestor = getParent(ancestor))
                    pending = getPendingHydration(ancestor);
            }
            if (pending) {
                const retry = () => stop?.run();
                pending.add(retry);
                cancelPending = () => { deleteItem(pending, retry); };
                return;
            }
        }
        if (lastTarget === resolved && lastPlacement === placement) return;
        range.redirect(resolved ? { target: resolved, placement } : undefined, placeholder);
        lastTarget = resolved;
        lastPlacement = placement;
    });
}
