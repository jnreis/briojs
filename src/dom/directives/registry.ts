import { extractModifiers } from './modifier';

export type DirectiveHandler = (
    element: Element,
    expression: string,
    modifiers: Record<string, boolean>,
    context: Record<PropertyKey, any>,
    runtime: any,
) => boolean | void;

export type DirectiveDefinition = {
    name: string | RegExp;
    handle: DirectiveHandler;
};

const directives: DirectiveDefinition[] = [];

export function registerDirective(name: string | RegExp, handle: DirectiveHandler): void {
    directives.push({ name, handle });
}

export function getRegisteredDirectives(): readonly DirectiveDefinition[] {
    return directives;
}

export function parseDirectiveAttribute(attrName: string): { baseName: string; modifiers: Record<string, boolean> } {
    return extractModifiers(attrName);
}
