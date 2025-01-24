import { propertyInitFns } from ".";
import { DELETE, SKIP } from "../tools/constants";

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
    let fn = ({ prop }: ListenerFunctionContext, stateObject: StateObject) => {

        // Remove the property initialization function from the set
        propertyInitFns[DELETE](fn);

        // Prevent the property from being automatically observed
        stateObject[SKIP].add(prop);

        return value;
    }

    // Add the tracking callback to the storage functions
    propertyInitFns.add(fn);

    return fn;
}