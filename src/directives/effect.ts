import { EVAL_EFFECT } from "../tools/constants";
import { expToFn } from "../tools/evaluation";

/**
 * TODO:
 * - get all accessed properties using replaceUsedButNotDeclaredVariables and pass them as dependencies to the effect
 */

export let hydrateEffect = (bnode: BNode, attrName: string, attrValue: string) => {

    /**
     * The `b-effect` directive requires the following function signature:
     * ($controls) => void
     */
    attrValue = expToFn(attrValue, '$controls', false);

    // Evaluate the attribute value as an effect
    bnode[EVAL_EFFECT](bnode, attrName, attrValue, () => async (call, controls: HookControls) => {
        // Call the expression
        await call(controls);
    });

}

export let effectDirective: Directive = ['b-effect', hydrateEffect];