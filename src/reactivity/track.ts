// * TYPES

import { size } from "../tools";
import { arrayAdd } from "../tools/array";
import { BRIO_DEFAULT_VALUE } from "../tools/constants";


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
    trigger();

    // Stop tracking
    trackProps = false;

    // Return a copy of the accessed properties
    // ? This is necessary because the accessedProps array is cleared each time the getAccessedProps function is called.
    return [...accessedProps];
}

/** Get the accessed property of an observed state as a function. When called with a value, the property is set to that value. */
export let getAccessedProp = (trigger: FunctionType) => {
    // Get the accessed properties
    let accessedProps = getAccessedProps(trigger);

    // Navigate to the accessed properties
    // ! This is because in a path like `a.b.c`, the last accessed property is `c` but the get trap will be called for `a`, `b`, and `c`.
    let accessed: AccessedProp[] = [];
    for (let accessedProp of accessedProps) {
        // Get the last accessed property
        let i = size(accessed) - 1;
        let lastAccessedProp = accessed[i];

        // Navigate if the last accessed property is equal to the current observed state
        if (lastAccessedProp && lastAccessedProp[0][lastAccessedProp[1]] === accessedProp[0]) accessed[i] = accessedProp;

        // Otherwise, add the accessed property
        else arrayAdd(accessed, accessedProp);
    }

    // Clean up the accessed properties
    accessed = accessed
        // Filter out the properties that are not in the observed state
        .filter(accessedProp => accessedProp[1] in accessedProp[0])
        // Filter out duplicates
        .filter(([state1, prop1], i, array) => array.findIndex(([state2, prop2]) => state1 === state2 && prop1 == prop2) == i);

    // The accessed property. If there are multiple accessed properties, return undefined.
    let accessedProp: FunctionType | undefined;
    if (size(accessed) == 1) {
        let [state, prop] = accessed[0];
        // The default value is a string that is unlikely to be used as a value. It represents the Primitive Irish spelling of 'BRIO'.
        // ? This is done to determine if the accessed property is being set or accessed. And it also allows the accessed property to be set to undefined.
        accessedProp = (newValue: any = BRIO_DEFAULT_VALUE) => newValue == BRIO_DEFAULT_VALUE ? state[prop] : state[prop] = newValue;
    }

    return accessedProp;
}