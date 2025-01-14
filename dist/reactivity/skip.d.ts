/**
 * Skip a specific property from being automatically observed.
 *
 * Note that the property can still be observed manually.
 *
 * @param value - The value to set the property to
 * @returns The property initialization function
 */
export declare let skipProp: (value: any) => (_: any, prop: string, options: StateOptions) => any;
