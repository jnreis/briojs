import { causedError } from './errors';

export type ExpressionScope = Record<PropertyKey, any>;

const valueExpressions = new Map<string, Function>();
const statementExpressions = new Map<string, Function>();
const assignmentExpressions = new Map<string, Function>();
const functionExpressions = new Map<string, Function>();

export function evaluateFunction(source: string, context: ExpressionScope): (ctx: ExpressionScope) => unknown {
    const fn = compile(functionExpressions, source, expression =>
        new Function('ctx', `
            const { $data, $parent, $el, $event, $id, $for, props, emit, trustedHTML, onCleanup } = ctx;
            return (${expression.replace(/;\s*$/, '')});
        `)
    );
    const result = fn(context);
    if (typeof result !== 'function')
        throw new TypeError('b-script must contain a function expression, such as (ctx) => { ... }.');
    return result;
}

export function createExpressionScope(...sources: ExpressionScope[]): ExpressionScope {
    const globals = globalThis as ExpressionScope;
    return new Proxy(Object.create(null), {
        has(_target, key) {
            return key !== Symbol.unscopables;
        },
        get(_target, key) {
            if (key === Symbol.unscopables) return undefined;
            for (const source of sources) {
                if (Reflect.has(source, key)) return Reflect.get(source, key);
            }
            return Reflect.has(globals, key) ? Reflect.get(globals, key) : undefined;
        },
        set(_target, key, value) {
            for (const source of sources) {
                if (Reflect.has(source, key)) {
                    Reflect.set(source, key, value);
                    return true;
                }
            }
            if (sources.length) Reflect.set(sources[0], key, value);
            return true;
        },
    });
}

const compile = (cache: Map<string, Function>, source: string, make: (source: string) => Function): Function => {
    let fn = cache.get(source);
    if (!fn) {
        try {
            fn = make(source);
        } catch (error) {
            throw new SyntaxError(`Invalid Brio expression "${source}": ${String(error)}`);
        }
        cache.set(source, fn);
        if (cache.size > 500)
            cache.delete(cache.keys().next().value!);
    }
    return fn;
};

export function evaluate(source: string, scope: ExpressionScope): any {
    const fn = compile(valueExpressions, source, expression =>
        new Function('$scope', `with ($scope) { return (${expression}); }`)
    );
    try {
        return fn(scope);
    } catch (error) {
        throw causedError(`Brio expression failed: "${source}"`, error);
    }
}

export function execute(source: string, scope: ExpressionScope, event?: Event): void {
    const fn = compile(statementExpressions, source, expression =>
        new Function('$scope', '$event', `with ($scope) { ${expression} }`)
    );
    try {
        fn(createExpressionScope({ $event: event }, scope), event);
    } catch (error) {
        throw causedError(`Brio event expression failed: "${source}"`, error);
    }
}

export function assign(source: string, scope: ExpressionScope, value: unknown): void {
    const fn = compile(assignmentExpressions, source, expression =>
        new Function('$scope', '$value', `with ($scope) { return (${expression} = $value); }`)
    );
    try {
        fn(createExpressionScope({ $value: value }, scope), value);
    } catch (error) {
        throw causedError(`Brio model expression failed: "${source}"`, error);
    }
}
