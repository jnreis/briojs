import { DomRuntime } from './types.js';
/**
 * CSP build page markup. Nothing in it is evaluated: registered components mount with static attributes as
 * props, and plugin directives that take no value or options (such as b-router-outlet) run.
 */
export declare function hydrateUntrusted(element: Element, parentContext: Record<PropertyKey, any>, runtime: DomRuntime): void;
