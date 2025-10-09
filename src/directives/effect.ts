import { EVAL_EFFECT } from "../tools/constants";
import { expToFn } from "../tools/evaluation";

/**
 * TODO:
 * - get all accessed properties using replaceUsedButNotDeclaredVariables and pass them as dependencies to the effect
 */

export let hydrateEffect = (bnode: BNode, attrName: string, attrValue: string) => {

    attrValue = expToFn(attrValue, '', false);

    // Evaluate the attribute value as an effect
    bnode[EVAL_EFFECT](bnode, attrName, attrValue, () => async (call) => {
        // Call the expression
        await call();
    });

}

export let effectDirective: Directive = ['b-effect', hydrateEffect];