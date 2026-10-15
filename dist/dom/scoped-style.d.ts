import { DomRuntime } from './types';

export declare function markStyleBoundary(element: Element): void;
export declare function findStyleBoundary(node: Node, runtime: DomRuntime): Element | undefined;
export declare function getStyleClass(element: Element): string | undefined;
export declare function scopeCss(content: string, className: string, document: Document): string;
export declare function installScopedStyle(source: HTMLStyleElement, boundary: Element): void;
