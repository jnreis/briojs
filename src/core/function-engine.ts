import { deleteItem, getLength, includesItem } from './native';
import { contextNames, $CONTEXT } from './expression';
import type { ExpressionEngine, ExpressionScope } from './expression';

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

const cached = (make: (expression: string, bindings: string) => Function) => {
    const cache = new Map<string, Function>();
    return (source: string, scope: ExpressionScope): any => {
        const extras = presentNames(source, scope);
        const key = getLength(extras) ? `${source}\0${extras}` : source;
        let fn = cache.get(key);
        if (!fn) {
            cache.set(key, fn = make(source, contextBindings(source, extras)));
            if (cache.size > 500) deleteItem(cache, cache.keys().next().value!);
        }
        return fn;
    };
};

/** Compiles expressions to native functions with `new Function`. Needs CSP `script-src 'unsafe-eval'`. */
export const functionEngine: ExpressionEngine = {
    value: cached((expression, bindings) => new Function($CONTEXT, `${bindings} return (${expression});`)),
    statement: cached((expression, bindings) => new Function($CONTEXT, `${bindings} ${expression}`)),
    assign: cached((expression, bindings) => new Function($CONTEXT, '$value', `${bindings} return (${expression} = $value);`)),
    function: cached((expression, bindings) =>
        new Function($CONTEXT, `${bindings} return (${expression.replace(/;\s*$/, '')});`)),
};
