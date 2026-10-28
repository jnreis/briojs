import { AppOptions, BrioApp, StoreMap } from './types.js';
/**
 * Creates an app for pages with a strict Content Security Policy. Expressions are interpreted without eval,
 * and only component templates defined in JavaScript hydrate; page markup only mounts registered components.
 */
export declare function createApp<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap>(options?: AppOptions<T, S>): BrioApp<T, S>;
