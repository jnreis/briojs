import { ComponentDefinition, DomRuntime } from './types.js';
export declare function takeProjectedContext(node: Node): Record<PropertyKey, any> | undefined;
export declare function cloneProjectedNode<T extends Node>(node: T): T;
/** A `<template>` carrying any `b-` directive (other than b-cloak, and unless b-ignore) renders in place, like `b-template`. */
export declare const isFragmentTemplate: (element: Element) => boolean;
export declare function fillSlots(host: Element, template: DocumentFragment, context: Record<PropertyKey, any>): void;
export declare function hydrateScopedSlot(element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime, hydrate: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void): void;
export declare function mountComponent(element: Element, definition: ComponentDefinition, context: Record<PropertyKey, any>, runtime: DomRuntime, hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void, 
/** CSP build page markup: `b-*` host attributes are ignored and only static attributes become props. */
pageHost?: boolean): void;
