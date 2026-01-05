import { effect, initProp } from ".";
import { STATE } from "../tools/constants";

/**
 * Create a computed property that automatically updates whenever its dependencies change.
 * 
 * @param fn - The function that computes the value
 * @returns The property initialization function. This function will be called when the property is first set.
 */
export let computed = (fn: FunctionType) => initProp(({ [STATE]: state, prop }: ListenerFunctionContext) => {

    // Create a reactive effect that updates the property whenever the computed value changes
    effect(() => state[prop] = fn(), fn);

    return fn();
});