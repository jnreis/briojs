import { autoFillContextName, saveCleanup } from "../app";
import { effect } from "../reactivity";
import { expToFn } from "../tools/evaluation";

export let hydrateEffect = async (bnode: BNode, _attrName: string, attrValue: string) => {

    // Auto-fill context name
    attrValue = autoFillContextName(bnode, attrValue);

    attrValue = expToFn(attrValue, '', false);

    // Evaluate the expression to get the function
    let fn = bnode.exec(bnode, attrValue);

    // Create an effect for the function and save the cleanup
    // Note: the effect does not work on async functions
    saveCleanup(bnode, effect(() => fn()));
}

export let effectDirective: Directive = ['b-effect', hydrateEffect];