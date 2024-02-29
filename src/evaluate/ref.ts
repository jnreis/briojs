import { VNode } from "..";

import { evaluate } from ".";
import { PropRef, trackAccessedProps } from "../reactivity";
import { trim } from "../tools/string";
import { has, uid } from "../tools";
import { isUndefined } from "../tools/typeCheck";


/**
 * Get the reference of a property in a vnode
 * @param vnode 
 * @param exp - The expression to evaluate
 * @returns [object, property] or [0, 0]
 */
export let getPropRef = (vnode: VNode, exp: string): PropRef => {
    let ref = trackAccessedProps(() => evaluate(vnode, exp));

    // ! DEVELOPMENT ONLY
    if (ref.length > 1) console.warn(`The expression "${exp}" has more than one reference.`, ref);

    // If one reference is found, return it.
    // Otherwise, return an empty reference.
    return ref.length == 1 ? ref[0] : [0, 0];
}

/**
 * Get the reference or evaluate the expression
 * @param vnode 
 * @param exp - The expression to evaluate
 * @returns The reference or the evaluated expression
 */
export let getRefOrExp = (vnode: any, exp: string) => {
    let value = ref(vnode, exp);
    return isUndefined(value) ? evaluate(vnode, exp) : value;
}

export let getPropOrExp = (vnode: VNode, prop: string, exp?: string) => {
    // Get the last part of the path
    let propName = splitPath(prop).pop()!;

    // Get the props
    let {$props} = vnode;

    return (propName in $props)
        ? $props[propName]
        : evaluate(vnode, exp || prop);
}

/**
 * Split a path into its parts
 * @param exp - The expression to split
 * @returns The parts of the path
 */
export let splitPath = (exp: string) => 
    trim(exp).split(/[\[\].]+/).filter(i => i);

export let pathSegments = (exp: string) => {
    let m = trim(exp).match(/(\[?[^\[\]]+\]?)/g);
    return m ? [...m] : [];
}

let setVariable = 'v'+uid(4, ()=>true);

export let ref = (vnode: VNode, exp: string, set: boolean = false) => {

    // If the expression contains a function or an assignment, return
    if (has(exp, '(') || has(exp, '=')) return;

    let path = splitPath(exp);

    if (path.length && (has(['$store','$props'], path[0]) || path[0] in vnode.$props)) {
        if (set) exp = `${setVariable}=>${exp}=${setVariable}`;
        return evaluate(vnode, exp);
    }
}

export let validVariableName = (name: string) => 
    /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);