import { DirectiveBinding } from './registry.js';

/** Modifiers are shorthands for `true`; values from `.options` win. */
export declare function observerOptions(element: Element, { directive, modifiers, options }: DirectiveBinding): Record<string, unknown>;
export declare function observerTarget(value: unknown, element: Element, label: string): Element | Document | Text;
export declare function observerBoolean(options: Record<string, unknown>, name: string, fallback: boolean): boolean;
export declare function observerDelay(options: Record<string, unknown>): number | undefined;
