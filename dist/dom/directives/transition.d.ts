export declare function prepareTransition(element: Element, expression: string): void;
export declare function getTransitionName(element: Element): string | undefined;
export declare function cancelTransition(element: Element): void;
export declare function enterTransition(element: Element, name?: string): void;
export declare function leaveTransition(element: Element, name: string | undefined, onDone: () => void): void;
export declare function handleTransition(element: Element, expression: string, _modifiers: Record<string, boolean>, _context: Record<PropertyKey, any>): void;
