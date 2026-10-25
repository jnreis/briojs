import { DomRuntime } from './types.js';

export declare function hydrateChildren(element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime): void;
export declare function hydrateTextNode(node: Text, context: Record<PropertyKey, any>): void;
export declare function hydrateNode(node: Node, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): void;
