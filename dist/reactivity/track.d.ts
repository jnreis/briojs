export declare let trackProps: boolean;
export declare let accessedProps: AccessedProp[];
/**
 * Get the accessed properties of an observed state
 *
 * @param trigger - The function to run to track the accessed properties
 */
export declare let getAccessedProps: (trigger: FunctionType) => AccessedProp[];
/**
 * Get the accessed property of an observed state as a function.
 * When called with a value, the property is set to that value.
 */
export declare let getAccessedProp: (trigger: FunctionType) => [any?, Prop?];
