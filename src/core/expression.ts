import { isFunction, objectConstructor, createTypeError, createSyntaxError, deleteItem } from './native';
import { directiveError, describeNode, mark } from './errors';

export type ExpressionScope = Record<PropertyKey, any>;

const valueExpressions = new Map<string, Function>();
const statementExpressions = new Map<string, Function>();
const assignmentExpressions = new Map<string, Function>();
const functionExpressions = new Map<string, Function>();

const $CONTEXT: '$context' = '$context';

const contextBindings = `
"use strict";
const { $data, $el, $event, $id, $ref, $for, $mutations, $size, $entry, $props, $emit, $insert, $stores, $provided, trustedHTML, flush, onCleanup } = ${$CONTEXT};
`;

export function evaluateFunction(source: string, context: ExpressionScope, node?: Node): ($context: ExpressionScope) => unknown {
    const fn = compile(functionExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings} return (${expression.replace(/;\s*$/, '')});`), 'b-script', node,
    );
    const result = fn(context);
    if (!isFunction(result))
        throw createTypeError(`b-script must contain a function expression, such as (${$CONTEXT}) => { ... }.`);
    return result;
}

export function createExpressionScope(...sources: ExpressionScope[]): ExpressionScope {
    // Earlier sources win; the two-source form is the hot path for every hydrated element.
    if (sources.length === 2) return { __proto__: null, ...sources[1], ...sources[0] } as ExpressionScope;
    return objectConstructor.assign(objectConstructor.create(null), ...sources.reverse());
}

const compile = (
    cache: Map<string, Function>,
    source: string,
    make: (source: string) => Function,
    directive?: string,
    node?: Node,
): Function => {
    let fn = cache.get(source);
    if (!fn) {
        try {
            fn = make(source);
        } catch (error) {
            throw mark(createSyntaxError(
                `Invalid Brio expression "${source}"${directive ? ` in ${directive}` : ''}${node ? ` on ${describeNode(node)}` : ''}: ${String(error)}`,
            ), node, directive);
        }
        cache.set(source, fn);
        if (cache.size > 500)
            deleteItem(cache, cache.keys().next().value!);
    }
    return fn;
};

/**
 * `directive` names the attribute (e.g. `b-bind-href`) and `node` the element it sits on, so failures read
 * `Brio expression failed: "…" in b-bind-href on <a.nav>: TypeError: …`. The node defaults to `$el`.
 */
export function evaluate(source: string, scope: ExpressionScope, directive?: string, node: Node = scope.$el): any {
    const fn = compile(valueExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings} return (${expression});`), directive, node,
    );
    try {
        return fn(scope);
    } catch (error) {
        throw directiveError(`Brio expression failed: "${source}"`, error, directive, node);
    }
}

export function execute(source: string, scope: ExpressionScope, event?: Event, directive?: string, node: Node = scope.$el): void {
    const fn = compile(statementExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings} ${expression}`), directive, node,
    );
    try {
        fn(event === undefined ? scope : createExpressionScope({ $event: event }, scope));
    } catch (error) {
        throw directiveError(`Brio event expression failed: "${source}"`, error, directive, node);
    }
}

export function assign(source: string, scope: ExpressionScope, value: unknown, directive?: string, node: Node = scope.$el): void {
    const fn = compile(assignmentExpressions, source, expression =>
        new Function($CONTEXT, '$value', `${contextBindings} return (${expression} = $value);`), directive, node,
    );
    try {
        fn(scope, value);
    } catch (error) {
        throw directiveError(`Brio model expression failed: "${source}"`, error, directive, node);
    }
}
