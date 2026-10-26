import { BrioApp } from '../core/types.js';
export type AstroAppProps = Readonly<Record<string, unknown>>;
export type AstroApp = Pick<BrioApp, 'roots' | 'mount' | 'dispose'>;
export type AstroAppFactory = (root: Element, props: AstroAppProps) => AstroApp;
declare const lazyMarker: unique symbol;
export type LazyAstroApp = {
    readonly [lazyMarker]: true;
    readonly load: () => Promise<{
        default: AstroAppFactory;
    }>;
};
export type AstroAppRegistry = Record<string, AstroAppFactory | LazyAstroApp>;
export type AstroEnhanceOptions = {
    apps: AstroAppRegistry;
    onError: (error: unknown, root: Element) => void;
};
export type AstroEnhancement = {
    dispose(): void;
};
export declare function lazyApp(load: LazyAstroApp['load']): LazyAstroApp;
export declare function enhanceAstro(options: AstroEnhanceOptions): AstroEnhancement;
export {};
