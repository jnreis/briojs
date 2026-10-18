import { createApp } from 'briojs';
import { enhanceAstro, lazyApp } from 'briojs/astro';
import type { AstroAppFactory, AstroAppProps, AstroEnhancement } from 'briojs/astro';

const factory: AstroAppFactory = (root, props: AstroAppProps) => createApp({
    state: () => ({ text: typeof props.text === 'string' ? props.text : root.id }),
});
const handle: AstroEnhancement = enhanceAstro({
    apps: {
        eager: factory,
        lazy: lazyApp(async () => ({ default: factory })),
        plain: () => createApp({ state: () => ({ count: 0 }) }),
    },
    onError(error, root) { console.error(error, root); },
});
handle.dispose();
// @ts-expect-error Error reporting is required.
enhanceAstro({ apps: {} });
// @ts-expect-error A lazy module must default-export a factory.
lazyApp(async () => ({ default: 123 }));
// @ts-expect-error Direct factories must be synchronous.
const bad: AstroAppFactory = async () => createApp();
void bad;
