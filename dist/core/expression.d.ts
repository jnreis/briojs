export type ExpressionScope = Record<PropertyKey, any>;
export declare function evaluateFunction(source: string, context: ExpressionScope, node?: Node): ($context: ExpressionScope) => unknown;
export declare function createExpressionScope(...sources: ExpressionScope[]): ExpressionScope;
/**
 * `directive` names the attribute (e.g. `b-bind-href`) and `node` the element it sits on, so failures read
 * `Brio expression failed: "…" in b-bind-href on <a.nav>: TypeError: …`. The node defaults to `$el`.
 */
export declare function evaluate(source: string, scope: ExpressionScope, directive?: string, node?: Node): any;
export declare function execute(source: string, scope: ExpressionScope, event?: Event, directive?: string, node?: Node): void;
export declare function assign(source: string, scope: ExpressionScope, value: unknown, directive?: string, node?: Node): void;
