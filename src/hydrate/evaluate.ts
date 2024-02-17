import { PROPS, newObject } from "../tools";
import { $uid } from "./directives";

const EXPRESSION = 'expression';

const evalCache: Record<string, Function> = newObject();

export const evaluate = (vNode: any, exp: string) => 
    execute(vNode, `return(${exp})`);

export const execute = (vNode: any, exp: string) => {
    const fn = evalCache[exp] || (evalCache[exp] = toFunction(exp));
    try {
        const { $props, $refs, $el, $emit, uids } = vNode;
        return fn($props, $refs, $el, $emit, $uid(uids));
    } catch (e) {
        if (import.meta.env.DEV) {
            console.warn(`Error when evaluating ${EXPRESSION} "${exp}":`);
        }
        console.error(e);
    }
};

const toFunction = (exp: string): Function => {
    try {
        return new Function(`$${PROPS}`, `$refs`, `$el`, `$emit`, `$uid`, `with($${PROPS}){${exp}}`);
    } catch (e) {
        console.error(`${(e as Error).message} in ${EXPRESSION}: ${exp}`);
        return () => {};
    }
};
