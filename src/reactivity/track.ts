// * TYPES

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
    let previousTrackProps = trackProps;
    let previousAccessedProps = accessedProps;
    accessedProps = [];
    trackProps = true;
    try {
        trigger({});
        return [...accessedProps];
    } finally {
        trackProps = previousTrackProps;
        accessedProps = previousAccessedProps;
    }
}

/**
 * Get the accessed property of an observed state as a function.
 * When called with a value, the property is set to that value.
 */
export let getAccessedProp = (trigger: FunctionType): [any?, Prop?] => {
    // Get the accessed properties
    let accessedProps = getAccessedProps(trigger);

    let [state, prop] = accessedProps[accessedProps.length - 1] || [];

    /**
     * If a new value is not defined, return the value of the property.
     * Otherwise, set the value of the property.
     */
    return [state, prop];
}