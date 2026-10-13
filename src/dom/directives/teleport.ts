import { onCleanup } from '../../core/scope';

export function handleTeleport(
    element: Element,
    expression: string,
    _modifiers: Record<string, boolean>,
    _context: Record<PropertyKey, any>,
): void {
    const targetSelector = expression.trim().replace(/^['"]|['"]$/g, '');
    const target = document.querySelector(targetSelector);
    if (!target) {
        console.warn(`b-teleport target "${targetSelector}" not found.`);
        return;
    }

    const placeholder = document.createComment('brio:teleport');
    element.parentNode?.replaceChild(placeholder, element);
    target.appendChild(element);

    onCleanup(() => {
        if (placeholder.parentNode) {
            placeholder.parentNode.replaceChild(element, placeholder);
        } else {
            element.remove();
        }
        placeholder.remove();
    });
}
