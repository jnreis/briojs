export type ExpressionScope = Record<PropertyKey, any>;
export declare function evaluateFunction(source: string, context: ExpressionScope): (ctx: ExpressionScope) => unknown;
export declare function createExpressionScope(...sources: ExpressionScope[]): ExpressionScope;
export declare function evaluate(source: string, scope: ExpressionScope): any;
export declare function execute(source: string, scope: ExpressionScope, event?: Event): void;
export declare function assign(source: string, scope: ExpressionScope, value: unknown): void;
