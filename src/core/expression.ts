import { isFunction, ObjectConstructor, createError, createTypeError, createSyntaxError, getLength } from './native';
import { directiveError, describeNode, mark } from './errors';
import { untrack } from '../reactivity/effect';

export type ExpressionScope = Record<PropertyKey, any>;

export const $CONTEXT: '$context' = '$context';

export const contextNames = ['$data', '$el', '$event', '$id', '$ref', '$for', '$mutations', '$size', '$entry', '$props', '$slot', '$emit', '$insert', '$stores', '$provided', '$route', 'trustedHTML', 'flush', 'onCleanup'];

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
export const ENGINE = Symbol('brio.engine');
let defaultEngine: ExpressionEngine | undefined;
/** Sets the engine for contexts that carry none, such as plain objects passed to `evaluate`. */
export const setDefaultEngine = (engine: ExpressionEngine): void => {
    defaultEngine = engine;
};
export const getDefaultEngine = (): ExpressionEngine | undefined => defaultEngine;

export function evaluateFunction(source: string, context: ExpressionScope, node?: Node): ($context: ExpressionScope) => unknown {
    const fn = compile('function', source, context, 'b-script', node);
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
    kind: Exclude<keyof ExpressionEngine, 'csp'>,
    source: string,
    scope: ExpressionScope,
    directive?: string,
    node?: Node,
): CompiledExpression => {
    const engine: ExpressionEngine | undefined = scope[ENGINE] ?? defaultEngine;
    if (!engine) throw createError('No Brio expression engine is installed. Import createApp from @jnreis/briojs or @jnreis/briojs/csp.');
    const make = engine[kind];
    if (!make) throw mark(createError(
        `${directive ?? 'This expression'} is not available in the Brio CSP build. Move the code into component setup.`,
    ), node, directive);
    try {
        return make(source, scope);
    } catch (error) {
        throw mark(createSyntaxError(
            `Invalid Brio expression "${source}"${directive ? ` in ${directive}` : ''}${node ? ` on ${describeNode(node)}` : ''}: ${String(error)}`,
        ), node, directive);
    }
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
    const fn = compile('value', source, scope, directive, node);
    try {
        return fn(scope);
    } catch (error) {
        throw directiveError(`Brio expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}

export function execute(source: string, scope: ExpressionScope, event?: Event, directive?: string, node: Node = scope.$el): void {
    const fn = compile('statement', source, scope, directive, node);
    try {
        fn(event === undefined ? scope : createExpressionScope({ $event: event }, scope));
    } catch (error) {
        throw directiveError(`Brio event expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}

export function assign(source: string, scope: ExpressionScope, value: unknown, directive?: string, node: Node = scope.$el): void {
    const fn = compile('assign', source, scope, directive, node);
    try {
        fn(scope, value);
    } catch (error) {
        throw directiveError(`Brio model expression failed: "${source}"`, error, directive, node, referenceHint(error, scope));
    }
}
