import { evaluate, execute, createExpressionScope } from '../../core/expression';

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

    // Check if wrapped in an arrow function (with or without enclosing parentheses)
    const arrowRegex = /^\s*\(?\s*(?:(?:\(([^)]*)\)|([a-zA-Z_$][\w$]*))\s*=>\s*\{([\s\S]*)\})\s*;?\s*$/;
    const match = raw.match(arrowRegex);

    const scriptScope = createExpressionScope({ ctx: context, $ctx: context }, context);

    if (match) {
        // Compile the arrow function as a callable function to preserve parameter bindings and lexical closure
        try {
            const fn = evaluate(`(${raw.replace(/;\s*$/, '')})`, scriptScope);
            if (typeof fn === 'function') {
                fn(scriptScope, context.$data);
                return;
            }
        } catch {
            // Fallback to statement execution of the body if evaluating as an expression fails
            const body = match[3];
            execute(body, scriptScope);
            return;
        }
    }

    execute(raw, scriptScope);
}
