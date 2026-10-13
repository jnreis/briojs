import { execute } from '../../core/expression';

/**
 * Handles b-script directive execution.
 *
 * Only processes <script> elements that have the b-script directive.
 * Expects the textContent of the script to be an unassigned arrow function:
 * (ctx) => { ... } or () => { ... }
 */
export function handleScript(
    element: Element,
    _expression: string,
    _modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
): void {
    if (element.tagName.toLowerCase() !== 'script') return;

    const raw = (element.textContent || '').trim();
    if (!raw) return;

    const arrowMatch = raw.match(/^\s*(?:\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>\s*\{([\s\S]*)\}\s*;?\s*$/);
    if (arrowMatch) {
        execute(arrowMatch[1], context);
    }
}
