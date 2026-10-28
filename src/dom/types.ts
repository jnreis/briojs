import { isObjectType } from '../core/native';
import type { ContextValues } from '../core/context-values';
import type { StoreMap } from '../core/types';
import type { RefMap } from './refs';
import type { RouteState } from '../plugins/router';
import type { DirectiveRegistry } from './directives/registry';

export type ComponentContext = {
    el: Element;
    $props: Record<string, unknown>;
    $emit(name: string, detail?: unknown): void;
    $stores: Readonly<StoreMap>;
    $provided: ContextValues;
    $ref: RefMap;
    /** The router's reactive route, when the app has a router. */
    route?: RouteState;
    app: unknown;
};

export type PropType = BooleanConstructor | NumberConstructor | StringConstructor;

export type ComponentDefinition = {
    /** Markup, a `#id` selector for a `<template>` in the page, or a `<template>` element. */
    template: string | HTMLTemplateElement;
    /** Coerces static host attributes; undeclared props stay strings. */
    props?: Record<string, PropType>;
    setup?: (context: ComponentContext) => Record<string, unknown> | void;
};

export type DomRuntime = {
    app: unknown;
    state: Record<string, unknown>;
    components: Map<string, ComponentDefinition>;
    router?: any;
    root?: Element;
    directives?: DirectiveRegistry;
    textInterpolation?: boolean;
};

const trustedMarkup = Symbol('brio.trustedMarkup');

export type TrustedMarkup = { readonly [trustedMarkup]: string };

export function trustedHTML(markup: string): TrustedMarkup {
    return { [trustedMarkup]: markup };
}

export function isTrustedHTML(value: unknown): value is TrustedMarkup {
    return value !== null && isObjectType(value) && trustedMarkup in value;
}

export function getTrustedHTMLString(value: TrustedMarkup): string {
    return value[trustedMarkup];
}
