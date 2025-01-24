import { DELETE, ON_SET } from "../tools/constants";

/**
 * Set state property
 */
export let setStateProperty = (stateObject: StateObject, prop: string, propFn: FunctionType) => {
    // Prevent the property from being automatically observed
    if (!stateObject[ON_SET][prop])
        stateObject[ON_SET][prop] = new Set();

    // Add the property initialization function to the set
    stateObject[ON_SET][prop].add(propFn);
}


/**
 * Remove state property function
 */
export let removeStateProperty = (stateObject: StateObject, prop: string, propFn: FunctionType) => {
    // Remove the property initialization function from the set
    if (stateObject[ON_SET][prop])
        stateObject[ON_SET][prop][DELETE](propFn);
}

/**
 * Clear state property
 */
export let clearStateProperty = (stateObject: StateObject, prop: string) => {
    // Clear the property initialization functions
    if (stateObject[ON_SET][prop])
        stateObject[ON_SET][prop].clear();
}