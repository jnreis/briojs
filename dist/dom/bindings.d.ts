import { DomRuntime } from './types';

export declare function mountRouterOutlet(element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime, hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void): void;
export declare function hydrateChildren(element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime): void;
export declare function hydrateTextNode(node: Text, context: Record<PropertyKey, any>): void;
export declare function hydrateNode(node: Node, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): void;
