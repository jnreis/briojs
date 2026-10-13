import { DomRuntime } from '../types';

export declare function handleHtml(element: Element, expression: string, _modifiers: Record<string, boolean>, context: Record<PropertyKey, any>, runtime: DomRuntime, hydrateChildrenFn: (element: Element, context: Record<PropertyKey, any>, runtime: DomRuntime) => void): void;
export declare function handleText(element: Element, expression: string, _modifiers: Record<string, boolean>, context: Record<PropertyKey, any>): void;
