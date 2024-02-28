// * TYPES

export type PropRef = [any, string|number|symbol];



// * VARIABLES

// Enable tracking of accessed properties
export let trackProps = false;

// Store the accessed properties
export let accessedProps: PropRef[] = [];


/**
 * Track the accessed properties of an object/array
 *
 * @param trigger - The function to run to track the accessed properties
 */
export let trackAccessedProps = (trigger: () => any): PropRef[] => {

    // Clear the accessed properties
    accessedProps = [];

    // Start tracking
    trackProps = true;

    // Run the trigger
    trigger();

    // Stop tracking
    trackProps = false;


    // Navigate to the accessed properties.
    // This is because in a path like `a.b.c`, the last accessed property is `c` but the get trap will be called for `a`, `b` and `c`.
    let refs: PropRef[] = [];
    for (let ref of accessedProps) {
        let i = refs.length - 1;
        let r = refs[i];
        // Navigate if the last accessed property is equal to the current observed state
        if (r && r[0][r[1]] === ref[0]) refs[i] = ref;
        // Otherwise, add the reference
        else refs.push(ref);
    }

    // Filter out the properties that are not in their observed state, and return the references.
    // This ensure that invalid references are not returned.
    return refs.filter(p => p[1] in p[0]);
}