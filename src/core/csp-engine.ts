import { deleteItem, includesItem, isFunction, ObjectConstructor } from './native';
import { contextNames, $CONTEXT } from './expression';
import type { CompiledExpression, ExpressionEngine, ExpressionScope } from './expression';

/*
 * Brio's CSP expression engine: a small parser that compiles expression source to closures, so no code is ever
 * created with eval or `new Function`. It supports the expression subset Brio templates use: names, member access
 * and calls (including `?.`), literals, template literals, object and array literals, unary, binary, logical and
 * conditional operators, assignment and update to a name's member, and `;`-separated statements in handlers.
 * Arrow functions, `new`, `function`, `this`, spread, and regular expressions are not supported.
 */

type Get = (scope: ExpressionScope) => any;
// A reference can be read, written, and (for calls) supplies the `this` value.
type Ref = {
    get: Get;
    set?: (scope: ExpressionScope, value: unknown) => unknown;
    /** Member references: the base object (the call's `this`), the key, and whether the link was `?.`. */
    object?: Get;
    key?: Get;
    optional?: boolean;
    /** Name references, for call labels and assignment errors. */
    name?: string;
};

// Short-circuit marker for optional chains: `a?.b.c` stops at a nullish `a` and the whole chain is undefined.
const SHORT: unknown = Symbol('brio.short');
const blockedKeys = new Set(['constructor', '__proto__', 'prototype', '__defineGetter__', '__defineSetter__',
    '__lookupGetter__', '__lookupSetter__']);
const functionConstructors = new Set<unknown>([Function, ...[async () => {}, function* () {}, async function* () {}]
    .map(fn => ObjectConstructor.getPrototypeOf(fn).constructor), globalThis.eval]);

/** Plain-JavaScript names expressions may use without a `$`; everything else must come from the context. */
const table = <T>(entries: Record<string, T>): Record<string, T> =>
    ObjectConstructor.assign(ObjectConstructor.create(null), entries);

/** Plain-JavaScript names expressions may use without a `$`; everything else must come from the context. */
const globals = table<unknown>({
    Math, JSON, Number, String, Boolean, Array, Date,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
    console: globalThis.console, NaN, Infinity,
});

const statement = 'statements are not supported';
const unsupported = table<string>({
    '=>': 'Arrow functions are not supported', new: '"new" is not supported', function: 'Functions are not supported',
    class: 'Classes are not supported', this: '"this" is not supported',
    delete: '"delete" is not supported', await: '"await" is not supported', yield: '"yield" is not supported',
    import: '"import" is not supported', var: `Declarations are not supported`, let: 'Declarations are not supported',
    const: 'Declarations are not supported', if: `"if" ${statement}`, for: 'Loops are not supported',
    while: 'Loops are not supported', do: 'Loops are not supported', return: `"return" ${statement}`,
    throw: `"throw" ${statement}`, try: `"try" ${statement}`, switch: `"switch" ${statement}`,
});

const keyOf = (value: unknown): PropertyKey => {
    const key = typeof value === 'symbol' ? value : String(value);
    if (typeof key === 'string' && blockedKeys.has(key))
        throw new TypeError(`Brio CSP expressions cannot access "${key}".`);
    return key;
};

const read = (object: any, key: PropertyKey): unknown => {
    if (object === null || object === undefined)
        throw new TypeError(`Cannot read properties of ${object} (reading '${String(key)}')`);
    return object[key];
};

const lookup = (scope: ExpressionScope, name: string): unknown => {
    if (name === $CONTEXT) return scope;
    if (name[0] === '$' || includesItem(contextNames, name)) {
        if (name in scope) return scope[name];
        if (includesItem(contextNames, name)) return undefined;
    } else if (name in globals) {
        return globals[name];
    }
    throw ObjectConstructor.assign(new ReferenceError(`${name} is not defined`), {
        hint: `Brio CSP expressions only read $ names (such as $data and $props) and these globals: ${ObjectConstructor.keys(globals).join(', ')}.`,
    });
};

const call = (fn: unknown, self: unknown, args: unknown[], label: string): unknown => {
    if (!isFunction(fn)) throw new TypeError(`${label} is not a function`);
    if (functionConstructors.has(fn)) throw new TypeError('Brio CSP expressions cannot create functions from strings.');
    return (fn as Function).apply(self, args);
};

const binary = table<(left: any, right: any) => unknown>({
    '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b, '%': (a, b) => a % b,
    '**': (a, b) => a ** b, '==': (a, b) => a == b, '!=': (a, b) => a != b, '===': (a, b) => a === b,
    '!==': (a, b) => a !== b, '<': (a, b) => a < b, '>': (a, b) => a > b, '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b, '&': (a, b) => a & b, '|': (a, b) => a | b, '^': (a, b) => a ^ b,
    '<<': (a, b) => a << b, '>>': (a, b) => a >> b, '>>>': (a, b) => a >>> b,
    in: (a, b) => keyOf(a) in b, instanceof: (a, b) => a instanceof b,
});
const precedence = table<number>({
    '??': 1, '||': 2, '&&': 3, '|': 4, '^': 5, '&': 6, '==': 7, '!=': 7, '===': 7, '!==': 7,
    '<': 8, '>': 8, '<=': 8, '>=': 8, in: 8, instanceof: 8, '<<': 9, '>>': 9, '>>>': 9,
    '+': 10, '-': 10, '*': 11, '/': 11, '%': 11, '**': 12,
});
const assignment = new Set(['=', '+=', '-=', '*=', '/=', '%=', '**=', '??=', '||=', '&&=']);
// Longest first, so `===` wins over `==` and `=`.
const punctuators = ['>>>=', '...', '===', '!==', '**=', '>>>', '<<=', '>>=', '??=', '||=', '&&=', '=>', '==', '!=',
    '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '**', '<<', '>>',
    '+', '-', '*', '/', '%', '<', '>', '=', '!', '~', '&', '|', '^', '?', ':', '(', ')', '[', ']', '{', '}', ',', '.', ';'];

type Token = { type: 'name' | 'number' | 'string' | 'punct' | 'template' | 'end'; value: string; start: number };

const escapes = table<string>({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', 0: '\0' });

function parse(source: string, mode: 'value' | 'statement' | 'assign'): CompiledExpression {
    let position = 0;
    let token = { type: 'end', value: '', start: 0 } as Token;

    const fail = (message: string, at = token?.start ?? position, advice = ''): never => {
        throw new SyntaxError(`${message} (at position ${at})${advice}`);
    };
    const space = () => {
        while (position < source.length) {
            const char = source[position];
            if (/\s/.test(char)) position++;
            else if (source.startsWith('//', position)) {
                while (position < source.length && source[position] !== '\n') position++;
            } else if (source.startsWith('/*', position)) {
                const end = source.indexOf('*/', position + 2);
                if (end < 0) fail('Unterminated comment');
                position = end + 2;
            } else break;
        }
    };
    const escape = (quote: string): string => {
        const char = source[position++];
        if (char === undefined) fail(`Unterminated ${quote === '`' ? 'template' : 'string'}`);
        if (char === 'x' || char === 'u') {
            const braced = char === 'u' && source[position] === '{';
            const end = braced ? source.indexOf('}', position) : position + (char === 'x' ? 2 : 4);
            const hex = source.slice(braced ? position + 1 : position, end);
            if (!/^[0-9a-fA-F]+$/.test(hex)) fail('Invalid escape sequence');
            position = braced ? end + 1 : end;
            return String.fromCodePoint(parseInt(hex, 16));
        }
        if (char === '\r' && source[position] === '\n') position++;
        return char === '\n' || char === '\r' ? '' : escapes[char] ?? char;
    };
    const string = (quote: string): string => {
        let value = '';
        while (true) {
            const char = source[position++];
            if (char === undefined || char === '\n' && quote !== '`') fail('Unterminated string');
            if (char === quote) return value;
            value += char === '\\' ? escape(quote) : char;
        }
    };
    const next = (): Token => {
        space();
        const start = position;
        if (position >= source.length) return token = { type: 'end', value: '', start };
        const char = source[position];
        if (/[A-Za-z_$]/.test(char)) {
            const name = /^[\w$]+/.exec(source.slice(position))![0];
            position += name.length;
            return token = { type: 'name', value: name, start };
        }
        if (/\d/.test(char) || char === '.' && /\d/.test(source[position + 1] ?? '')) {
            const match = /^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)/
                .exec(source.slice(position))![0];
            position += match.length;
            if (/[\w$]/.test(source[position] ?? '')) fail('Invalid number');
            return token = { type: 'number', value: match.replace(/_/g, ''), start };
        }
        if (char === '"' || char === "'") {
            position++;
            return token = { type: 'string', value: string(char), start };
        }
        if (char === '`') {
            position++;
            return token = { type: 'template', value: '', start };
        }
        const punct = punctuators.find(candidate => source.startsWith(candidate, position));
        if (!punct) fail(`Unexpected character "${char}"`);
        // `a?.5:b` is a conditional, not optional chaining.
        if (punct === '?.' && /\d/.test(source[position + 2] ?? '')) {
            position++;
            return token = { type: 'punct', value: '?', start };
        }
        position += punct!.length;
        return token = { type: 'punct', value: punct!, start };
    };
    const is = (value: string) => (token.type === 'punct' || token.type === 'name') && token.value === value;
    const expect = (value: string) => {
        if (!is(value)) unexpected();
        next();
    };
    const unexpected = (): never => {
        const reason = unsupported[token.value];
        if (reason && (token.type === 'name' || token.type === 'punct'))
            fail(`${reason} in the Brio CSP build`, undefined, '; move this logic into component setup.');
        return fail(token.type === 'end' ? 'Unexpected end of expression' : `Unexpected token "${token.value}"`);
    };

    // Template literal: the opening backtick is consumed; read quasis and `${...}` parts directly from the source.
    const template = (): Get => {
        const parts: (string | Get)[] = [];
        let text = '';
        while (true) {
            const char = source[position++];
            if (char === undefined) fail('Unterminated template');
            if (char === '`') break;
            if (char === '\\') text += escape('`');
            else if (char === '$' && source[position] === '{') {
                position++;
                parts.push(text);
                text = '';
                next();
                parts.push(expression().get);
                if (!is('}')) unexpected();
            } else text += char;
        }
        parts.push(text);
        next();
        return scope => {
            let result = '';
            for (const part of parts) result += typeof part === 'string' ? part : String(part(scope));
            return result;
        };
    };

    // Array items and call arguments; `...` spreads any iterable in place.
    const items = (close: string): ((scope: ExpressionScope) => unknown[]) => {
        const parts: [Get, boolean][] = [];
        while (!is(close)) {
            const spread = is('...');
            if (spread) next();
            parts.push([assign().get, spread]);
            if (!is(close)) expect(',');
        }
        next();
        return scope => {
            const list: unknown[] = [];
            for (const [get, spread] of parts) {
                if (!spread) list.push(get(scope));
                else for (const item of get(scope) as Iterable<unknown>) list.push(item);
            }
            return list;
        };
    };
    const args = () => items(')');

    const primary = (): Ref => {
        const current = token;
        if (current.type === 'number') {
            next();
            const value = Number(current.value);
            return { get: () => value };
        }
        if (current.type === 'string') {
            next();
            return { get: () => current.value };
        }
        if (current.type === 'template') return { get: template() };
        if (is('(')) {
            next();
            const inner = expression();
            expect(')');
            if (is('=>')) unexpected();
            return { get: inner.get };
        }
        if (is('[')) {
            next();
            return { get: items(']') };
        }
        if (is('{')) {
            next();
            // A null key marks a spread entry.
            const entries: [Get | null, Get][] = [];
            while (!is('}')) {
                if (is('...')) {
                    next();
                    entries.push([null, assign().get]);
                    if (!is('}')) expect(',');
                    continue;
                }
                let key: Get;
                let value: Get | undefined;
                const keyToken = token;
                if (is('[')) {
                    next();
                    key = assign().get;
                    expect(']');
                } else if (keyToken.type === 'name' || keyToken.type === 'string' || keyToken.type === 'number') {
                    next();
                    const name = keyToken.type === 'number' ? String(Number(keyToken.value)) : keyToken.value;
                    key = () => name;
                    if (keyToken.type === 'name' && (is(',') || is('}'))) value = scope => lookup(scope, name);
                } else return unexpected();
                if (!value) {
                    if (is('(')) unexpected();
                    expect(':');
                    value = assign().get;
                }
                entries.push([key, value]);
                if (!is('}')) expect(',');
            }
            next();
            return {
                get: scope => {
                    const object: Record<PropertyKey, unknown> = {};
                    // defineProperty, so a "__proto__" key is an own property rather than the prototype.
                    const define = (name: PropertyKey, value: unknown) => ObjectConstructor.defineProperty(object, name,
                        { value, enumerable: true, configurable: true, writable: true });
                    for (const [key, value] of entries) {
                        if (key) define(keyOf(key(scope)), value(scope));
                        else {
                            // Native spread copies own enumerable data, never the prototype.
                            const copy = { ...value(scope) as object };
                            for (const name of Reflect.ownKeys(copy)) define(name, copy[name as keyof typeof copy]);
                        }
                    }
                    return object;
                },
            };
        }
        if (current.type === 'name' && !unsupported[current.value]) {
            next();
            const name = current.value;
            if (is('=>')) unexpected();
            if (name === 'true' || name === 'false') return { get: () => name === 'true' };
            if (name === 'null') return { get: () => null };
            if (name === 'undefined') return { get: () => undefined };
            if (precedence[name] || name === 'typeof' || name === 'void') unexpected();
            return { get: scope => lookup(scope, name), name };
        }
        return unexpected();
    };

    // Calls read the base once: it is both the function's owner and `this`.
    const invoke = (callee: Ref, list: (scope: ExpressionScope) => unknown[], optionalCall: boolean): Ref => ({
        get: scope => {
            let fn: unknown;
            let self: unknown;
            let label = callee.name ?? 'expression';
            if (callee.object) {
                self = callee.object(scope);
                if (self === SHORT || callee.optional && (self === null || self === undefined)) return SHORT;
                const key = keyOf(callee.key!(scope));
                label = String(key);
                fn = read(self, key);
            } else {
                fn = callee.get(scope);
                if (fn === SHORT) return SHORT;
            }
            if (optionalCall && (fn === null || fn === undefined)) return SHORT;
            return call(fn, self, list(scope), label);
        },
    });

    const member = (object: Get, key: Get, optional: boolean): Ref => ({
        object, key, optional,
        get: scope => {
            const target = object(scope);
            if (target === SHORT || optional && (target === null || target === undefined)) return SHORT;
            return read(target, keyOf(key(scope)));
        },
        set: (scope, value) => {
            const target = object(scope);
            if (target === null || target === undefined)
                throw new TypeError(`Cannot set properties of ${target} (setting '${String(key(scope))}')`);
            return target[keyOf(key(scope))] = value;
        },
    });

    // Member access and calls. A nullish base under `?.` returns SHORT, which every later link passes through.
    const postfix = (): Ref => {
        let ref = primary();
        let optional = false;
        while (true) {
            if (is('?.')) {
                optional = true;
                next();
                if (is('(')) {
                    next();
                    ref = invoke(ref, args(), true);
                } else if (is('[')) {
                    next();
                    const key = expression().get;
                    expect(']');
                    ref = member(ref.get, key, true);
                } else {
                    if (token.type !== 'name') unexpected();
                    const name = token.value;
                    next();
                    ref = member(ref.get, () => name, true);
                }
            } else if (is('.')) {
                next();
                if (token.type !== 'name') unexpected();
                const name = token.value;
                next();
                ref = member(ref.get, () => name, false);
            } else if (is('[')) {
                next();
                const key = expression().get;
                expect(']');
                ref = member(ref.get, key, false);
            } else if (is('(')) {
                next();
                ref = invoke(ref, args(), false);
            } else if (token.type === 'template') {
                return fail('Tagged templates are not supported in the Brio CSP build');
            } else break;
        }
        if (!optional) return ref;
        const inner = ref;
        return { ...inner, get: scope => {
            const value = inner.get(scope);
            return value === SHORT ? undefined : value;
        } };
    };

    const unary = (): Ref => {
        const operator = token.value;
        if (token.type === 'punct' && (operator === '!' || operator === '-' || operator === '+' || operator === '~')) {
            next();
            const operand = unary().get;
            if (is('**')) fail('Unary operators need parentheses before "**"');
            return { get: operator === '!' ? scope => !operand(scope) : operator === '-' ? scope => -operand(scope)
                : operator === '+' ? scope => +operand(scope) : scope => ~operand(scope) };
        }
        if (token.type === 'name' && (operator === 'typeof' || operator === 'void')) {
            next();
            const operand = unary().get;
            return {
                get: operator === 'void' ? scope => void operand(scope) : scope => {
                    try {
                        return typeof operand(scope);
                    } catch (error) {
                        if (error instanceof ReferenceError) return 'undefined';
                        throw error;
                    }
                },
            };
        }
        if (is('++') || is('--')) {
            next();
            const target = unary();
            return update(target, operator === '++' ? 1 : -1, true);
        }
        const ref = postfix();
        if (is('++') || is('--')) {
            const delta = is('++') ? 1 : -1;
            next();
            return update(ref, delta, false);
        }
        return ref;
    };

    const update = (target: Ref, delta: number, prefix: boolean): Ref => {
        const set = writable(target);
        return {
            get: scope => {
                const old = Number(target.get(scope));
                set(scope, old + delta);
                return prefix ? old + delta : old;
            },
        };
    };

    const writable = (target: Ref) => {
        if (!target.set) fail(target.name
            ? `Cannot assign to "${target.name}"; assign to a property instead, such as $data.name`
            : 'Invalid assignment target');
        return target.set!;
    };

    const binaryExpression = (minimum: number): Ref => {
        let left = unary();
        while (true) {
            const operator = token.value;
            const level = token.type === 'punct' || token.type === 'name' ? precedence[operator] : undefined;
            if (!level || level < minimum) return left;
            next();
            // `**` is right-associative.
            const right = binaryExpression(operator === '**' ? level : level + 1).get;
            const leftGet = left.get;
            if (operator === '&&') left = { get: scope => leftGet(scope) && right(scope) };
            else if (operator === '||') left = { get: scope => leftGet(scope) || right(scope) };
            else if (operator === '??') left = { get: scope => leftGet(scope) ?? right(scope) };
            else {
                const apply = binary[operator];
                left = { get: scope => apply(leftGet(scope), right(scope)) };
            }
        }
    };

    const conditional = (): Ref => {
        const test = binaryExpression(1);
        if (!is('?')) return test;
        next();
        const yes = assign().get;
        expect(':');
        const no = assign().get;
        return { get: scope => test.get(scope) ? yes(scope) : no(scope) };
    };

    const assign = (): Ref => {
        const target = conditional();
        if (token.type !== 'punct' || !assignment.has(token.value)) return target;
        const operator = token.value;
        const set = writable(target);
        next();
        const value = assign().get;
        if (operator === '=') return { get: scope => set(scope, value(scope)) };
        const get = target.get;
        if (operator === '??=') return { get: scope => get(scope) ?? set(scope, value(scope)) };
        if (operator === '||=') return { get: scope => get(scope) || set(scope, value(scope)) };
        if (operator === '&&=') return { get: scope => get(scope) && set(scope, value(scope)) };
        const apply = binary[operator.slice(0, -1)];
        return { get: scope => set(scope, apply(get(scope), value(scope))) };
    };

    const expression = (): Ref => {
        const ref = assign();
        if (is(',')) fail('The comma operator is not supported in the Brio CSP build');
        return ref;
    };

    const atEnd = () => token.type === 'end';
    next();
    if (mode === 'statement') {
        const statements: Get[] = [];
        while (!atEnd()) {
            if (is(';')) {
                next();
                continue;
            }
            statements.push(expression().get);
            if (!atEnd()) expect(';');
        }
        return scope => {
            for (const statement of statements) statement(scope);
        };
    }
    const ref = expression();
    if (!atEnd()) unexpected();
    if (mode === 'assign') {
        const set = writable(ref);
        return (scope, value) => set(scope, value);
    }
    return ref.get;
}

const cached = (mode: 'value' | 'statement' | 'assign') => {
    const cache = new Map<string, CompiledExpression>();
    return (source: string): CompiledExpression => {
        let fn = cache.get(source);
        if (!fn) {
            cache.set(source, fn = parse(source, mode));
            if (cache.size > 500) deleteItem(cache, cache.keys().next().value!);
        }
        return fn;
    };
};

/** Interprets expressions without eval or `new Function`. Has no `function` compiler, so `b-script` is unavailable. */
export const cspEngine: ExpressionEngine = {
    value: cached('value'),
    statement: cached('statement'),
    assign: cached('assign'),
    csp: true,
};
