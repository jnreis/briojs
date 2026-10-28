import { buildApp } from './app';
import { setDefaultEngine } from './expression';
import { functionEngine } from './function-engine';
import type { AppOptions, BrioApp, StoreMap } from './types';

setDefaultEngine(functionEngine);

/** Creates an app whose expressions compile with `new Function`. */
export function createApp<
    T extends Record<string, unknown> = Record<string, unknown>,
    S extends StoreMap = StoreMap,
>(options?: AppOptions<T, S>): BrioApp<T, S> {
    return buildApp({ engine: functionEngine }, options);
}
