/** Recovers the casing the HTML parser removed from the attribute name. */
export declare const resolveBindTarget: (element: Element, name: string, forceProp: boolean) => string;
export declare const setBoundValue: (element: Element, name: string, value: unknown, forceProp?: boolean) => void;
export declare function handleBind(element: Element, attrName: string, expression: string, modifiers: Record<string, boolean>, context: Record<PropertyKey, any>): void;
