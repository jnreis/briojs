import { DomRuntime } from '../types';

export declare function handleIf(element: Element, expression: string, modifiers: Record<string, boolean>, context: Record<PropertyKey, any>, runtime: DomRuntime, hydrateNodeFn: (node: Node, context: Record<PropertyKey, any>, runtime: DomRuntime) => void): void;
