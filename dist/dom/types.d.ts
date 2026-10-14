export type ComponentContext = {
    el: Element;
    $props: Record<string, unknown>;
    $emit(name: string, detail?: unknown): void;
    app: unknown;
};
export type ComponentDefinition = {
    template: string;
    style?: string;
    setup?: (context: ComponentContext) => Record<string, unknown> | void;
};
export type DomRuntime = {
    app: unknown;
    state: Record<string, unknown>;
    components: Map<string, ComponentDefinition>;
    router?: any;
    root?: Element;
};
declare const trustedMarkup: unique symbol;
export type TrustedMarkup = {
    readonly [trustedMarkup]: string;
};
export declare function trustedHTML(markup: string): TrustedMarkup;
export declare function isTrustedHTML(value: unknown): value is TrustedMarkup;
export declare function getTrustedHTMLString(value: TrustedMarkup): string;
export {};
