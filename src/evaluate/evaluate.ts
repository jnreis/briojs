import { VNode } from "..";

import { store } from "../hydrate";
import { $emit, $uid, $watch } from "../methods";
import { newObject } from "../tools/object";
import { EXPRESSION, RESERVED_NAMES } from "../tools/constants";

let evalCache: Record<string, Function> = newObject();

export let evaluate = (vnode: VNode, exp: string) => 
    execute(vnode, `return(${exp})`);

let execute = (vnode: VNode, exp: string) => {
    let fn = evalCache[exp] || (evalCache[exp] = toFunction(exp));
    try {
        let { $el, $props, $refs, $root, uid } = vnode;
        return fn($el, $emit, $props, $refs, $root, store, $uid(uid), $watch(vnode));
    } catch (e) {
        // ! DEVELOPMENT ONLY
        console.warn(`Error when evaluating ${EXPRESSION} "${exp}":`);

        console.error(e);
    }
};

let toFunction = (exp: string): Function => {
    try {
        return new Function(...RESERVED_NAMES, `with($props){${exp}}`);
    } catch (e) {
        console.error(`${(e as Error).message} in ${EXPRESSION}: ${exp}`);
        return () => {};
    }
};