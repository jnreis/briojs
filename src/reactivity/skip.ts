import { propertyInitFns } from ".";
import { arrayAdd } from "../tools/array"
import { DELETE } from "../tools/constants";

/**
 * Skip a specific property from being automatically observed.
 * 
 * Note that the property can still be observed manually.
 * 
 * @param value - The value to set the property to
 * @returns The property initialization function
 */
export let skipProp = (value: any) => {

    // Property initialization function
    // This function will be called when the state object is created or set
    let fn = (_: any, prop: string, options: StateOptions) => {
        // Prevent the property from being automatically observed
        arrayAdd(options.skip!, prop);

        // Remove the property initialization function from the set
        propertyInitFns[DELETE](fn);

        return value;
    }

    // Add the tracking callback to the storage functions
    propertyInitFns.add(fn);

    return fn;
}