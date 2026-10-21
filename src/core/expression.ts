import { isFunction, objectConstructor, createTypeError, createSyntaxError, deleteItem } from './native';
import { causedError } from './errors';

export type ExpressionScope = Record<PropertyKey, any>;

const valueExpressions = new Map<string, Function>();
const statementExpressions = new Map<string, Function>();
const assignmentExpressions = new Map<string, Function>();
const functionExpressions = new Map<string, Function>();

const $CONTEXT: '$context' = '$context';

const contextBindings = `
"use strict";
const { $data, $el, $event, $id, $ref, $for, $mutations, $size, $entry, $props, $emit, $insert, $stores, $provided, trustedHTML, onCleanup } = ${$CONTEXT};
`;

export function evaluateFunction(source: string, context: ExpressionScope): ($context: ExpressionScope) => unknown {
    const fn = compile(functionExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings} return (${expression.replace(/;\s*$/, '')});`)
    );
    const result = fn(context);
    if (!isFunction(result))
        throw createTypeError(`b-script must contain a function expression, such as (${$CONTEXT}) => { ... }.`);
    return result;
}

export function createExpressionScope(...sources: ExpressionScope[]): ExpressionScope {
    return objectConstructor.assign(objectConstructor.create(null), ...sources.reverse());
}

const compile = (cache: Map<string, Function>, source: string, make: (source: string) => Function): Function => {
    let fn = cache.get(source);
    if (!fn) {
        try {
            fn = make(source);
        } catch (error) {
            throw createSyntaxError(`Invalid Brio expression "${source}": ${String(error)}`);
        }
        cache.set(source, fn);
        if (cache.size > 500)
            deleteItem(cache, cache.keys().next().value!);
    }
    return fn;
};

export function evaluate(source: string, scope: ExpressionScope): any {
    const fn = compile(valueExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings} return (${expression});`)
    );
    try {
        return fn(scope);
    } catch (error) {
        throw causedError(`Brio expression failed: "${source}"`, error);
    }
}

export function execute(source: string, scope: ExpressionScope, event?: Event): void {
    const fn = compile(statementExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings} ${expression}`)
    );
    try {
        fn(event === undefined ? scope : createExpressionScope({ $event: event }, scope));
    } catch (error) {
        throw causedError(`Brio event expression failed: "${source}"`, error);
    }
}

export function assign(source: string, scope: ExpressionScope, value: unknown): void {
    const fn = compile(assignmentExpressions, source, expression =>
        new Function($CONTEXT, '$value', `${contextBindings} return (${expression} = $value);`)
    );
    try {
        fn(scope, value);
    } catch (error) {
        throw causedError(`Brio model expression failed: "${source}"`, error);
    }
}
