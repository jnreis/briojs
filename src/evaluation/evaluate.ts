import { _reservedNames } from "../api";
import { store } from "../api/store";
import { _methods } from "../methods";
import { newObject } from "../tools/object";
import { $EL, $PROPS, $REFS, $ROOT, EXPRESSION } from "../tools/constants";
import { arrayAdd, each } from "../tools/array";

// Inspired by code from petite-vue (https://github.com/vuejs/petite-vue/blob/main/src/eval.ts)
// Original code licensed under MIT License

let evalCache: Record<string, Function> = newObject();

export let evaluate = (vnode: VNode, exp: string) => 
    execute(vnode, `return(${exp})`);

let execute = (vnode: VNode, exp: string) => {
    let fn = evalCache[exp] || (evalCache[exp] = toFunction(exp));
    try {
        let $s: any[] = [];
        // Properties in the vnode that start with "$" must be passed to the function
        each([$EL,$REFS,$PROPS,$ROOT], name => arrayAdd($s, vnode[name as keyof VNode]));
        // Methods must be passed to the function
        each(_methods, ([_, fn]) => arrayAdd($s, fn(vnode)));
        // The store must be passed to the function
        return fn(store, ...$s);
    } catch (e) {
        // ! DEVELOPMENT ONLY
        console.warn(`Error when evaluating ${EXPRESSION} "${exp}":`);

        console.error(e);
    }
};

let toFunction = (exp: string): Function => {
    try {
        return new Function(..._reservedNames, `with(${$PROPS}){${exp}}`);
    } catch (e) {
        console.error(`${(e as Error).message} in ${EXPRESSION}: ${exp}`);
        return () => {};
    }
};