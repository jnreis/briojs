// * TYPES

import { size } from "../tools";
import { arrayAdd } from "../tools/array";
import { isUndefined } from "../tools/typeCheck";


// * VARIABLES

// Enable tracking of accessed properties
export let trackProps = false;

// Store the accessed properties
export let accessedProps: PropRef[] = [];


/**
 * Get the accessed properties of an observed state
 *
 * @param trigger - The function to run to track the accessed properties
 */
export let getRefs = (trigger: FunctionType): PropRef[] => {

    // Clear the accessed properties
    accessedProps = [];

    // Start tracking
    trackProps = true;

    // Run the trigger
    trigger();

    // Stop tracking
    trackProps = false;

    // Navigate to the accessed properties.
    // ! This is because in a path like `a.b.c`, the last accessed property is `c` but the get trap will be called for `a`, `b` and `c`.
    let _refs: PropRef[] = [];
    for (let ref of accessedProps) {
        let i = size(_refs) - 1;
        let r = _refs[i];
        // Navigate if the last accessed property is equal to the current observed state
        if (r && r[0][r[1]] === ref[0]) _refs[i] = ref;
        // Otherwise, add the reference
        else arrayAdd(_refs, ref);
    }

    // Filter out the properties that are not in the observed state
    return _refs.filter(p => p[1] in p[0]);
}

export let getRef = (trigger: FunctionType) => {
    let _refs = getRefs(trigger);
    let _ref: FunctionType | undefined;

    if (size(_refs) == 1) {
        let [state, prop] = _refs[0];
        _ref = (newValue: any) => isUndefined(newValue) ? state[prop] : state[prop] = newValue;
    }

    return _ref;
}