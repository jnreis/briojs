import { EVAL_EFFECT } from "../tools/constants";
import { expToFn } from "../tools/evaluation";

export let hydrateEffect = (vnode: VNode, attrName: string, attrValue: string) => {

    /**
     * The `b-effect` directive requires the following function signature:
     * ($controls) => void
     */
    attrValue = expToFn(attrValue, '$controls', false);

    // Evaluate the attribute value as an effect
    vnode[EVAL_EFFECT](vnode, attrName, attrValue, () => async (call, controls: HookControls) => {
        // Call the expression
        await call(controls);
    });

}

export let effectDirective: Directive = ['b-effect', hydrateEffect];