import { Router } from './router';

export type ComponentContext = {
    el: Element;
    props: Record<string, unknown>;
    emit(name: string, detail?: unknown): void;
    app: unknown;
};
export type ComponentDefinition = {
    template: string;
    setup?: (context: ComponentContext) => Record<string, unknown> | void;
};
export type DomRuntime = {
    app: unknown;
    state: Record<string, unknown>;
    components: Map<string, ComponentDefinition>;
    router?: Router;
};
declare const trustedMarkup: unique symbol;
export type TrustedMarkup = {
    readonly [trustedMarkup]: string;
};
export declare function trustedHTML(markup: string): TrustedMarkup;
export declare function hydrateNode(node: Node, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): void;
export declare function hydrateRoot(root: Element, context: Record<PropertyKey, any>, runtime: DomRuntime): void;
export {};
