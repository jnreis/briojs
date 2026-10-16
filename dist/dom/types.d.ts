import { ContextValues } from '../core/context-values';
import { StoreMap } from '../core/types';
import { RefMap } from './refs';

export type ComponentContext = {
    el: Element;
    $props: Record<string, unknown>;
    $emit(name: string, detail?: unknown): void;
    $stores: Readonly<StoreMap>;
    $provided: ContextValues;
    $ref: RefMap;
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
