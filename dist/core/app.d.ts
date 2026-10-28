import { ExpressionEngine } from './expression.js';
import { DomRuntime } from '../dom/types.js';
import { AppOptions, BrioApp, StoreMap } from './types.js';
/** How an app evaluates expressions, and whether it hydrates only templates defined in JavaScript. */
export type AppMode = {
    engine: ExpressionEngine;
    untrusted?: DomRuntime['untrusted'];
    /** Extra rules for component templates, run on every registration path. */
    checkComponent?: (name: string, template: unknown) => void;
};
/** Builds an app in the given mode. The public `createApp` functions supply the mode for their build. */
export declare function buildApp<T extends Record<string, unknown> = Record<string, unknown>, S extends StoreMap = StoreMap>(mode: AppMode, options?: AppOptions<T, S>): BrioApp<T, S>;
