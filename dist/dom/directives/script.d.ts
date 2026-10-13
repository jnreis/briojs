/**
 * Handles b-script directive execution.
 *
 * Only processes <script> elements that have the b-script directive.
 * Expects the textContent of the script to be an unassigned arrow function:
 * (ctx) => { ... } or () => { ... }
 */
export declare function handleScript(element: Element, _expression: string, _modifiers: Record<string, boolean>, context: Record<PropertyKey, any>): void;
