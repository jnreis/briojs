import { ComponentDefinition, DomRuntime } from './types';

export declare function takeProjectedContext(node: Node): Record<PropertyKey, any> | undefined;
export declare function cloneProjectedNode<T extends Node>(node: T): T;
export declare function fillSlots(host: Element, template: DocumentFragment, context: Record<PropertyKey, any>): void;
export declare function mountComponent(element: Element, definition: ComponentDefinition, context: Record<PropertyKey, any>, runtime: DomRuntime, hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void): void;
