export type DirectiveHandler = (element: Element, expression: string, modifiers: Record<string, boolean>, context: Record<PropertyKey, any>, runtime: any) => boolean | void;
export type DirectiveDefinition = {
    name: string | RegExp;
    handle: DirectiveHandler;
};
export declare function registerDirective(name: string | RegExp, handle: DirectiveHandler): void;
export declare function getRegisteredDirectives(): readonly DirectiveDefinition[];
export declare function parseDirectiveAttribute(attrName: string): {
    baseName: string;
    modifiers: Record<string, boolean>;
};
