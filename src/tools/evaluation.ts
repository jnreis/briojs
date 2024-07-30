import { reservedNames } from "../api";
import { _storeNames, stores } from "../api/store";
import { _methods } from "../methods";
import { getAllKeys, newObject } from "./object";
import { $PROPS, $REFS, $ROOT, DELETE, EXPRESSION } from "./constants";
import { arrayAdd, each } from "./array";
import { isStringFunction, isPath, startsWith, replace } from "./string";
import { getAccessedProp } from "../reactivity/track";
import { isFunction } from "./typeCheck";
import { logger } from ".";

// Inspired by code from petite-vue (https://github.com/vuejs/petite-vue/blob/main/src/eval.ts)
// Original code licensed under MIT License

let cache: Record<string, FunctionType> = newObject();

/** Evaluate an expression using vnode properties */
export let evaluate = (vnode: VNode, exp: string, args: string = '', isVoid: boolean = false): [FunctionType, 0|1|2] => {

    let isRef: 0|1|2 = 0;
    let _ref: FunctionType | undefined;

    // The expression is a path
    // ? Since a delete statement matches the path regex, the expression needs to be checked for a delete statement.
    // ? This is done to prevent the expression from being evaluated immediately. E.g. `delete $props.count` would delete the prop immediately.
    if (isPath(exp) && !isDelete(exp)) {
        // Get the reference, if any
        _ref = getAccessedProp(() => execute(vnode, exp));

        // Reference found
        if (_ref) {
            isRef = 1;

            // Reference is a function
            if (isFunction(_ref())) {
                isRef = 2;
                // Call the function with the arguments
                exp = makeFunction(`${exp}(${args})`, args, isVoid);
            }
        }
        // Reference not found. Wrap the expression in a function
        else exp = makeFunction(exp, args, isVoid);
    }

    // The expression is not a function. Wrap the expression in a function
    // ? This is done to prevent the expression from being evaluated immediately. E.g. `count++` would change the value of `count` immediately.
    else if (!isStringFunction(exp)) exp = makeFunction(exp, args, isVoid);

    return [isRef == 1 ? _ref : execute(vnode, exp), isRef];
}

/** Execute an expression */
let execute = (vnode: VNode, exp: string) => {
    let fn = cache[exp] || (cache[exp] = toFunction(exp));
    try {
        return fn(...getArgValues(vnode));
    } catch (e) {
        return getError(e as Error, exp);
    }
};

/** Convert an expression string to a function that takes the "reserved names" as arguments and uses the keys of the `$props` object as variables in its scope */
let toFunction = (exp: string): FunctionType => {
    try {
        return new Function(...reservedNames, `with(${$PROPS}){return(${exp})}`) as FunctionType;
    } catch (e) {
        return getError(e as Error, exp);
    }
};

let getError = (e: Error, exp: string) => {
    logger(e.message + ` in ${EXPRESSION}:`, exp);
    return () => {};
}

/** Get the argument values for the function */
let getArgValues = (vnode: VNode) => {
    // ! Props written without `$props` can not start with JS reserved keywords (arguments, await, true, false, break, case, catch, class, const, continue, default?, delete, do, else, eval, extends, finally, for, function, if, in, instanceof, let, new, null, return, static, super, switch, this, throw, try, typeof, var, void, while, with, yield)
    // ! E.g. `super` must be written as `$props.super`
    let $s: any[] = [];

    // Magic properties
    each(['$el', $PROPS, $REFS, $ROOT], name => arrayAdd($s, vnode[name as keyof VNode]));

    // Magic methods
    each(_methods, ([_, fn]) => arrayAdd($s, fn(vnode)));

    // Global stores
    each(_storeNames, store => arrayAdd($s, stores[store]));

    return $s;
}

/** Check if the expression is a delete statement */
let isDelete = (exp: string) => startsWith(exp, DELETE+' ');

export let makeFunction = (exp: string, args: string = '', isVoid: boolean = false) =>
    `(${ args })=>${ isVoid ? '{' : '(' }${ exp }${ isVoid ? '}' : ')' }`;

/** 
 * ! Experimental
 */
export let getAccessedProps = (vnode: VNode, exp: string) => {
    let accessedProps: string[] = [];

    // Get all the potentially accessed properties
    let potentialProps = exp.match(/([a-z_$](\w|\.|\$|`|'|"|(\[(.|\s)+?\]))*;?)/gi);

    for (let potentialProp of potentialProps || []) {

        for (let name of [...reservedNames, 'this', ...getAllKeys(vnode.$props)]) {
            // Check if the property is accessed
            if (
                potentialProp == name ||
                startsWith(potentialProp, name + '.') ||
                startsWith(potentialProp, name + '[')
            ) {
                if (name == 'this') {
                    potentialProp = replace(potentialProp, 'this', $PROPS);
                }
                arrayAdd(accessedProps, potentialProp);
                break;
            }
        };
    };

    return accessedProps;
};