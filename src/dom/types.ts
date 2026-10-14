import type { ContextValues } from '../core/context-values';
import type { StoreMap } from '../core/types';

export type ComponentContext = {
    el: Element;
    $props: Record<string, unknown>;
    $emit(name: string, detail?: unknown): void;
    $stores: Readonly<StoreMap>;
    $provided: ContextValues;
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

const trustedMarkup = Symbol('brio.trustedMarkup');

export type TrustedMarkup = { readonly [trustedMarkup]: string };

export function trustedHTML(markup: string): TrustedMarkup {
    return { [trustedMarkup]: markup };
}

export function isTrustedHTML(value: unknown): value is TrustedMarkup {
    return value !== null && typeof value === 'object' && trustedMarkup in value;
}

export function getTrustedHTMLString(value: TrustedMarkup): string {
    return value[trustedMarkup];
}
