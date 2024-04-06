import { evaluate } from ".";
import { split, test, trim } from "../tools/string";
import { has, size, uid } from "../tools";
import { isUndefined } from "../tools/typeCheck";
import { $PROPS, $STORE } from "../tools/constants";

/**
 * Get the reference or evaluate the expression
 * @param vnode 
 * @param exp - The expression to evaluate
 * @returns The reference or the evaluated expression
 */
export let getRefOrEvaluate = (vnode: any, exp: string) => {
    let value = ref(vnode, exp);
    return isUndefined(value) ? evaluate(vnode, exp) : value;
}

/**
 * Split a path into its parts
 * @param exp - The expression to split
 * @returns The parts of the path
 */
export let splitPath = (exp: string) => 
    split(trim(exp), /[\[\].]+/).filter(i => i);

export let pathSegments = (exp: string) => {
    let m = trim(exp).match(/(\[?[^\[\]]+\]?)/g);
    return m ? [...m] : [];
}

let setVariable = uid();

export let ref = (vnode: VNode, exp: string, set: boolean = false) => {

    // If the expression contains a function or an assignment, return
    if (has(exp, '(') || has(exp, '=')) return;

    let path = splitPath(exp);

    if (size(path) && (has([$STORE,$PROPS], path[0]) || path[0] in vnode[$PROPS])) {
        if (set) exp = `${setVariable}=>${exp}=${setVariable}`;
        return evaluate(vnode, exp);
    }
}

export let validVariableName = (name: string) => 
    test(name, /^[a-zA-Z_$][0-9a-zA-Z_$]*$/);