import { enhanceAstro, lazyApp } from '../../../../dist/astro-entry.js';
import { createCounter } from './apps/counter.js';

// Fixture-only diagnostics: pulses reveal duplicate/leaked window listeners.
window.brioLifecycle = { mounted: 0, disposed: 0, aborted: 0, pulses: 0, live: 0 };
window.lazyLifecycle = { loads: 0, calls: [], errors: [] };

export function enhance() {
    return enhanceAstro({
        apps: {
            counter: createCounter,
            broken: lazyApp(() => import('./apps/broken.js')),
            delayed: lazyApp(async () => {
                window.lazyLifecycle.loads++;
                await new Promise(resolve => { window.releaseLazy = resolve; });
                return import('./apps/delayed.js');
            }),
        },
        onError(error, root) {
            window.lazyLifecycle.errors.push({ message: error.message, name: root.getAttribute('b-app') });
            console.error('Brio Astro enhancement failed', root, error);
        },
    });
}
