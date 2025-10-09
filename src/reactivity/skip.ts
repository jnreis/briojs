import { getStateObject, initProp } from ".";
import { SKIP, STATE } from "../tools/constants";

/**
 * Skip a specific property from being automatically observed.
 * 
 * Note that the property can still be observed manually.
 * 
 * @param value - The value to set the property to
 * @returns The property initialization function. This function will be called when the property is first set.
 */
export let skipProp = (value: any) => initProp(({ [STATE]: state, prop }: ListenerFunctionContext) => {

    // Prevent the property from being automatically observed
    getStateObject(state)[SKIP].add(prop);

    return value;
});