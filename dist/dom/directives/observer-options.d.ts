import { ExpressionScope } from '../../core/expression.js';

export declare function observerOptions(element: Element, attrName: string, modifiers: Record<string, boolean>, context: ExpressionScope): Record<string, unknown>;
export declare function observerTarget(value: unknown, element: Element, label: string): Element | Document | Text;
export declare function observerBoolean(options: Record<string, unknown>, name: string, fallback: boolean): boolean;
export declare function observerDelay(options: Record<string, unknown>): number | undefined;
