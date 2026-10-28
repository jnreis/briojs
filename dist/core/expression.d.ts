export type ExpressionScope = Record<PropertyKey, any>;
export declare const $CONTEXT: '$context';
export declare const contextNames: string[];
export type CompiledExpression = ($context: ExpressionScope, $value?: unknown) => any;
/**
 * Turns expression source into callable functions. Each method may cache by source; `scope` is the context the
 * expression will run in. `function` is optional: without it, `b-script` is unavailable.
 */
export type ExpressionEngine = {
    value(source: string, scope: ExpressionScope): CompiledExpression;
    statement(source: string, scope: ExpressionScope): CompiledExpression;
    assign(source: string, scope: ExpressionScope): CompiledExpression;
    function?(source: string, scope: ExpressionScope): CompiledExpression;
    /** Set by the CSP build's interpreter, which treats page markup as untrusted. */
    csp?: boolean;
};
/** The engine an app's contexts use; apps set it on their base context so every derived context inherits it. */
export declare const ENGINE: unique symbol;
/** Sets the engine for contexts that carry none, such as plain objects passed to `evaluate`. */
export declare const setDefaultEngine: (engine: ExpressionEngine) => void;
export declare const getDefaultEngine: () => ExpressionEngine | undefined;
export declare function evaluateFunction(source: string, context: ExpressionScope, node?: Node): ($context: ExpressionScope) => unknown;
/**
 * Earlier sources win. The last source becomes the prototype instead of being copied, so a child context costs
 * only its own keys; `Object.keys($context)` therefore lists own keys while reads see the whole chain.
 */
export declare function createExpressionScope(...sources: ExpressionScope[]): ExpressionScope;
/**
 * `directive` names the attribute (e.g. `b-bind-href`) and `node` the element it sits on, so failures read
 * `Brio expression failed: "…" in b-bind-href on <a.nav>: TypeError: …`. The node defaults to `$el`.
 */
export declare function evaluate(source: string, scope: ExpressionScope, directive?: string, node?: Node): any;
export declare function execute(source: string, scope: ExpressionScope, event?: Event, directive?: string, node?: Node): void;
export declare function assign(source: string, scope: ExpressionScope, value: unknown, directive?: string, node?: Node): void;
