export declare function prepareTransition(element: Element, expression: string): void;
export declare function getTransitionName(element: Element): string | undefined;
export declare function cancelTransition(element: Element): void;
export declare function enterTransition(element: Element, name?: string): void;
export declare function leaveTransition(element: Element, name: string | undefined, onDone: () => void): void;
/** Positions of keyed rows that animate moves, read before the DOM changes. */
export declare function measureMoves(elements: Iterable<Element>): Map<Element, DOMRect>;
/** FLIP: rows that shifted start at their old position and transition to the new one under `${name}-move`. */
export declare function moveTransitions(before: Map<Element, DOMRect>): void;
export declare function handleTransition(element: Element, expression: string, _modifiers: Record<string, boolean>, _context: Record<PropertyKey, any>): void;
