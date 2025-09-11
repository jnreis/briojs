// * TYPES

import { size } from "../tools";
import { isUndefined } from "../tools/typeCheck";


// * VARIABLES

// Enable tracking of accessed properties
export let trackProps = false;

// Store the accessed properties
export let accessedProps: AccessedProp[] = [];


/**
 * Get the accessed properties of an observed state
 *
 * @param trigger - The function to run to track the accessed properties
 */
export let getAccessedProps = (trigger: FunctionType): AccessedProp[] => {

    // Clear the accessed properties array
    accessedProps = [];

    // Start tracking
    trackProps = true;

    // Run the trigger
    trigger({});

    // Stop tracking
    trackProps = false;

    // Return a copy of the accessed properties
    // ? This is necessary because the accessedProps array is cleared each time the getAccessedProps function is called.
    return [...accessedProps];
}

/**
 * Get the accessed property of an observed state as a function.
 * When called with a value, the property is set to that value.
 */
export let getAccessedProp = (trigger: FunctionType) => {
    // Get the accessed properties
    let accessedProps = getAccessedProps(trigger);

    let accessedPropsSize = size(accessedProps);

    if (accessedPropsSize) {
        let [state, prop] = accessedProps[accessedPropsSize - 1];
        /**
         * If a new value is not defined, return the value of the property.
         * Otherwise, set the value of the property.
         */
        return (newValue?: any) => isUndefined(newValue) ? state[prop] : state[prop] = newValue;
    }
}