import { ContextValues } from '../core/context-values.js';
import { StoreMap } from '../core/types.js';
import { RefMap } from './refs.js';
import { RouteState } from '../plugins/router.js';
import { DirectiveRegistry } from './directives/registry.js';
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
};
declare const trustedMarkup: unique symbol;
export type TrustedMarkup = {
    readonly [trustedMarkup]: string;
};
export declare function trustedHTML(markup: string): TrustedMarkup;
export declare function isTrustedHTML(value: unknown): value is TrustedMarkup;
export declare function getTrustedHTMLString(value: TrustedMarkup): string;
export {};
