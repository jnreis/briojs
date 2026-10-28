import { DomRuntime } from './types.js';
export declare const componentNamePattern: RegExp;
export declare function hydrateChildren(element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime): void;
export declare function hydrateTextNode(node: Text, context: Record<PropertyKey, any>): void;
export declare function hydrateNode(node: Node, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): void;
export declare function elementContext(element: Element, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): Record<PropertyKey, any>;
