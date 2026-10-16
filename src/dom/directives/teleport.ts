import { onCleanup } from '../../core/scope';
import { getNodeOwner, ownNode } from '../ownership';
import { ownElementRange } from '../range';

export function handleTeleport(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    const targetSelector = expression.trim().replace(/^['"]|['"]$/g, '');
    const target = element.ownerDocument.querySelector(targetSelector);
    if (!target) {
        console.warn(`b-teleport target "${targetSelector}" not found.`);
        return;
    }

    const owner = getNodeOwner(element);
    if (!owner) throw new Error('b-teleport requires an owned Brio element.');
    const range = ownElementRange(element, context, owner.runtime);
    if (range.nodes().some(node => node === target || node.contains(target)))
        throw new Error('b-teleport cannot target its own rendered output.');
    const placeholder = element.ownerDocument.createComment('brio:teleport');
    ownNode(placeholder, owner.context, owner.runtime);
    range.start.parentNode?.insertBefore(placeholder, range.start);
    range.moveBefore(target, null);

    onCleanup(() => {
        if (placeholder.parentNode) {
            range.moveBefore(placeholder.parentNode, placeholder);
        } else {
            range.remove();
        }
        placeholder.remove();
    });
}
