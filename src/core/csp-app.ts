import { buildApp } from './app';
import { createTypeError, isString } from './native';
import { setDefaultEngine } from './expression';
import { cspEngine } from './csp-engine';
import { hydrateUntrusted } from '../dom/untrusted';
import type { AppOptions, BrioApp, StoreMap } from './types';

setDefaultEngine(cspEngine);

// Page markup is untrusted in the CSP build, so templates must come from JavaScript.
const checkComponent = (name: string, template: unknown) => {
    if (!isString(template) || /^#[A-Za-z][\w-]*$/.test(template))
        throw createTypeError(`Component "${name}" needs a template string in the Brio CSP build; "#id" selectors and <template> elements read page markup.`);
};

/**
 * Creates an app for pages with a strict Content Security Policy. Expressions are interpreted without eval,
 * and only component templates defined in JavaScript hydrate; page markup only mounts registered components.
 */
export function createApp<
    T extends Record<string, unknown> = Record<string, unknown>,
    S extends StoreMap = StoreMap,
>(options?: AppOptions<T, S>): BrioApp<T, S> {
    return buildApp({ engine: cspEngine, untrusted: hydrateUntrusted, checkComponent }, options);
}
