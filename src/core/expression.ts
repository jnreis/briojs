import { isFunction, ObjectConstructor, createTypeError, createSyntaxError, deleteItem, getLength, includesItem } from './native';
import { directiveError, describeNode, mark } from './errors';
import { untrack } from '../reactivity/effect';

export type ExpressionScope = Record<PropertyKey, any>;

const valueExpressions = new Map<string, Function>();
const statementExpressions = new Map<string, Function>();
const assignmentExpressions = new Map<string, Function>();
const functionExpressions = new Map<string, Function>();

const $CONTEXT: '$context' = '$context';

const contextNames = ['$data', '$el', '$event', '$id', '$ref', '$for', '$mutations', '$size', '$entry', '$props', '$slot', '$emit', '$insert', '$stores', '$provided', '$route', 'trustedHTML', 'flush', 'onCleanup'];

// Only names that appear in the source are destructured, so each evaluation reads just what it uses.
const contextBindings = (expression: string, extras: string[]): string => {
    const names = contextNames.filter(name => new RegExp(`(?<![\\w$])${name.replace('$', '\\$')}(?![\\w$])`).test(expression)).concat(extras);
    return `"use strict";${getLength(names) ? ` const { ${names.join(', ')} } = ${$CONTEXT};` : ''}\n`;
};

const customNames = new Map<string, string[]>();
// Other `$names` (app helpers, names added by plugin scope hooks) are bound only when the context has them,
// so a misspelled name still throws a ReferenceError.
const presentNames = (source: string, scope: ExpressionScope): string[] => {
    let names = customNames.get(source);
    if (!names) {
        names = [...new Set(source.match(/(?<![\w$])\$[\w$]+/g))]
            .filter(name => !includesItem(contextNames, name) && name !== $CONTEXT && name !== '$value');
        if (customNames.size > 500) customNames.clear();
        customNames.set(source, names);
    }
    return getLength(names) ? names.filter(name => name in scope) : names;
};

export function evaluateFunction(source: string, context: ExpressionScope, node?: Node): ($context: ExpressionScope) => unknown {
    const fn = compile(functionExpressions, source, (expression, bindings) =>
        new Function($CONTEXT, `${bindings} return (${expression.replace(/;\s*$/, '')});`), context, 'b-script', node,
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
        ? ObjectConstructor.assign(ObjectConstructor.create(null), sources[0])
        : sources[last];
    for (let index = last - 1; index >= 0; index--)
        scope = ObjectConstructor.assign(ObjectConstructor.create(scope), sources[index]);
    return scope;
}

const compile = (
    cache: Map<string, Function>,
    source: string,
    make: (source: string, bindings: string) => Function,
    scope: ExpressionScope,
    directive?: string,
    node?: Node,
): Function => {
    const extras = presentNames(source, scope);
    const key = getLength(extras) ? `${source}\0${extras}` : source;
    let fn = cache.get(key);
    if (!fn) {
        try {
            fn = make(source, contextBindings(source, extras));
        } catch (error) {
            throw mark(createSyntaxError(
                `Invalid Brio expression "${source}"${directive ? ` in ${directive}` : ''}${node ? ` on ${describeNode(node)}` : ''}: ${String(error)}`,
            ), node, directive);
        }
        cache.set(key, fn);
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
    const fn = compile(valueExpressions, source, (expression, bindings) =>
        new Function($CONTEXT, `${bindings} return (${expression});`), scope, directive, node,
    );
    try {
        return fn(scope);
    } catch (error) {
        throw directiveError(`Brio expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}

export function execute(source: string, scope: ExpressionScope, event?: Event, directive?: string, node: Node = scope.$el): void {
    const fn = compile(statementExpressions, source, (expression, bindings) =>
        new Function($CONTEXT, `${bindings} ${expression}`), scope, directive, node,
    );
    try {
        fn(event === undefined ? scope : createExpressionScope({ $event: event }, scope));
    } catch (error) {
        throw directiveError(`Brio event expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}

export function assign(source: string, scope: ExpressionScope, value: unknown, directive?: string, node: Node = scope.$el): void {
    const fn = compile(assignmentExpressions, source, (expression, bindings) =>
        new Function($CONTEXT, '$value', `${bindings} return (${expression} = $value);`), scope, directive, node,
    );
    try {
        fn(scope, value);
    } catch (error) {
        throw directiveError(`Brio model expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}
