import { isFunction, objectConstructor, createTypeError, createSyntaxError, deleteItem, getLength } from './native';
import { directiveError, describeNode, mark } from './errors';
import { untrack } from '../reactivity/effect';

export type ExpressionScope = Record<PropertyKey, any>;

const valueExpressions = new Map<string, Function>();
const statementExpressions = new Map<string, Function>();
const assignmentExpressions = new Map<string, Function>();
const functionExpressions = new Map<string, Function>();

const $CONTEXT: '$context' = '$context';

const contextNames = ['$data', '$el', '$event', '$id', '$ref', '$for', '$mutations', '$size', '$entry', '$props', '$emit', '$insert', '$stores', '$provided', '$route', 'trustedHTML', 'flush', 'onCleanup'];

// Only names that appear in the source are destructured, so each evaluation reads just what it uses.
const contextBindings = (expression: string): string => {
    const names = contextNames.filter(name => new RegExp(`(?<![\\w$])${name.replace('$', '\\$')}(?![\\w$])`).test(expression));
    return `"use strict";${getLength(names) ? ` const { ${names.join(', ')} } = ${$CONTEXT};` : ''}\n`;
};

export function evaluateFunction(source: string, context: ExpressionScope, node?: Node): ($context: ExpressionScope) => unknown {
    const fn = compile(functionExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings(expression)} return (${expression.replace(/;\s*$/, '')});`), 'b-script', node,
    );
    const result = fn(context);
    if (!isFunction(result))
        throw createTypeError(`b-script must contain a function expression, such as (${$CONTEXT}) => { ... }.`);
    return result;
}

/**
 * Earlier sources win. The last source becomes the prototype instead of being copied, so a child context costs
 * only its own keys; `Object.keys($context)` therefore lists own keys while reads see the whole chain.
 */
export function createExpressionScope(...sources: ExpressionScope[]): ExpressionScope {
    const last = getLength(sources) - 1;
    let scope: ExpressionScope = last < 1
        ? objectConstructor.assign(objectConstructor.create(null), sources[0])
        : sources[last];
    for (let index = last - 1; index >= 0; index--)
        scope = objectConstructor.assign(objectConstructor.create(scope), sources[index]);
    return scope;
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

const holds = (value: unknown, name: string): boolean =>
    value !== null && typeof value === 'object' && name in (value as object);

/** Suggests the context path for a bare name that is a loop variable, state key, or prop. */
const referenceHint = (error: unknown, scope: ExpressionScope): string => {
    const name = error instanceof ReferenceError && /^(\S+) is not defined$/.exec(error.message)?.[1];
    if (!name) return '';
    return untrack(() => {
        try {
            for (let loop = scope.$for, path = '$for.'; loop; loop = loop.$parent, path += '$parent.')
                if (holds(loop, name)) return `. Loop variables are read through $for: use ${path}${name}.`;
            for (const owner of ['$props', '$data'])
                if (holds(scope[owner], name)) return `. Use ${owner}.${name}.`;
        } catch {}
        return '';
    });
};

/**
 * `directive` names the attribute (e.g. `b-bind-href`) and `node` the element it sits on, so failures read
 * `Brio expression failed: "…" in b-bind-href on <a.nav>: TypeError: …`. The node defaults to `$el`.
 */
export function evaluate(source: string, scope: ExpressionScope, directive?: string, node: Node = scope.$el): any {
    const fn = compile(valueExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings(expression)} return (${expression});`), directive, node,
    );
    try {
        return fn(scope);
    } catch (error) {
        throw directiveError(`Brio expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}

export function execute(source: string, scope: ExpressionScope, event?: Event, directive?: string, node: Node = scope.$el): void {
    const fn = compile(statementExpressions, source, expression =>
        new Function($CONTEXT, `${contextBindings(expression)} ${expression}`), directive, node,
    );
    try {
        fn(event === undefined ? scope : createExpressionScope({ $event: event }, scope));
    } catch (error) {
        throw directiveError(`Brio event expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}

export function assign(source: string, scope: ExpressionScope, value: unknown, directive?: string, node: Node = scope.$el): void {
    const fn = compile(assignmentExpressions, source, expression =>
        new Function($CONTEXT, '$value', `${contextBindings(expression)} return (${expression} = $value);`), directive, node,
    );
    try {
        fn(scope, value);
    } catch (error) {
        throw directiveError(`Brio model expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}
