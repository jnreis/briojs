import { enqueue, __batched } from "./batch";
import { isObj, defineBubblingProperties, getInstanceMethodKeys, setHiddenKey } from "./tools";

import { entries, has } from "../tools";
import { isArray, isFunction, isMap, isSet } from "../tools/typeCheck";
import { UNDEFINED } from "../tools/constants";

export const computedStack: ((...argsList: any[]) => any)[] = []
export const trackerSymbol = Symbol('tracker')

export const observedSymbol = Symbol("__observed");
const HANDLER = '__handler';

/**
 * @typedef {Object} Options - Observe options.
 * @property {string[]} [props] - Observe only the properties listed.
 * @property {string[]} [ignore] - Ignore the properties listed.
 * @property {boolean | number} [batch] -
 *  Batch computed properties calls, wrapping them in a queueMicrotask and
 *  executing them in a new context and preventing excessive calls.
 *  If batch is an integer, the calls will be debounced by the value in milliseconds using setTimemout.
 * @prop {boolean} [deep] - Recursively observe nested objects and when setting new properties.
 * @prop {boolean} [bind] - Automatically bind methods to the observed object.
 */

type ComputedFunction = Function & {
    [trackerSymbol]?: WeakMap<any, any>; // Adjust the any types as needed
};

type PropsOrIgnore = string[] | ((prop: string, value: any) => boolean);

type Options = {
    props?: PropsOrIgnore;
    ignore?: PropsOrIgnore;
    batch?: boolean | number;
    deep?: boolean;
    bind?: boolean;
    bubble?: boolean;
};

/**
 * Observes an object or an array and returns a proxified version which reacts on mutations.
 *
 * @template O
 * @param {O} obj - The object to observe.
 * @param {Options} options - Options
 * @returns {O} - A proxy wrapping the object.
 */
export const observe = (obj: any, options: Options = {}): any => {
    // 'deep' is slower but reasonable; 'shallow' a performance enhancement but with side-effects
    const { props, ignore, batch, deep = true, bubble, bind } = options;

    // Ignore if the object is already observed
    if (observedSymbol in obj) {
        return obj;
    }

    // If the prop is explicitely not excluded
    const isWatched = (prop: string | symbol, value: any) =>
        prop !== observedSymbol &&
        (!props || arrayHas(props, prop) || isValidFn(props, prop, value)) &&
        (!ignore || (!arrayHas(ignore, prop) && !isValidFn(ignore, prop, value)));

    // If the deep flag is set, observe nested objects/arrays
    if (deep && !(obj instanceof Node)) {
        for (const [key, val] of entries(obj)) {
            if (isObj(val) && isWatched(key, val)) {
                obj[key] = observe(val, options);
                // If bubble is set, we add keys to the object used to bubble up the mutation
                if (bubble) {
                    defineBubblingProperties(obj[key], key, obj);
                }
            }
        };
    }

    const runComputedFunction = (dependent: any) => {
        // Run the computed function
        if (typeof batch !== UNDEFINED && batch !== false) {
            enqueue(dependent, batch as any);
            dependent[__batched] = true;
        } else {
            dependent();
        }
    };

    const eachDependent = (prop: string | symbol, removeProp: boolean, callback: any) => {
        const dependents = propertiesMap.get(prop);
        if (dependents) {
            // Retrieve the computed functions depending on the prop
            for (const dependent of dependents) {
                callback(dependent, dependents);
            }
        }
        // Remove the property's dependents
        if (removeProp) propertiesMap.delete(prop);
    };

    // For each observed object, each property is mapped with a set of computed functions depending on this property.
    // Whenever a property is set, we re-run each one of the functions stored inside the matching Set.
    const propertiesMap = new Map();

    // Proxify the object in order to intercept get/set on props
    const proxy = new Proxy(obj, {
        get(_, prop) {
            if (prop === observedSymbol) return true;

            // If the prop is watched
            if (isWatched(prop, obj[prop])) {
                // If a computed function is being run
                if (computedStack.length) {
                    const computedFn = computedStack[0];
                    // Tracks object and properties accessed during the function call
                    const tracker = (computedFn as ComputedFunction)[
                        trackerSymbol
                    ];
                    if (tracker) setTracker(tracker, obj, prop);
                    // Link the computed function and the property being accessed
                    setTracker(propertiesMap, prop, computedFn);
                }
            }

            // Handle Set and Map methods
            if (isSet(obj) || isMap(obj)) {
                return (...args: string[]) => (obj as any)[prop](...args);
            }

            return obj[prop];
        },
        set(_, prop, value) {
            if (prop === HANDLER) {
                // Don't track bubble handlers
                setHiddenKey(obj, HANDLER, value);
            }
            else if (!isWatched(prop, value)) {
                // If the prop is ignored
                obj[prop] = value;
            }
            else if ((isArray(obj) && prop === "length") || obj[prop] !== value) {
                // If the new/old value are not equal
                const deeper = deep && isObj(value);

                // Remove bubbling infrastructure and pass old value to handlers
                const oldValue = obj[prop];
                if (isObj(oldValue)) delete obj[prop];

                // If the deep flag is set we observe the newly set value
                obj[prop] = deeper ? observe(value, options) : value;

                // Co-opt assigned object into bubbling if appropriate
                if (deeper && bubble) {
                    defineBubblingProperties(obj[prop], prop as string, obj);
                }

                const ancestry = [prop];
                let parent = obj;
                while (parent) {
                    // If a handler explicitly returns 'false' then stop propagation
                    if (parent[HANDLER] && parent[HANDLER](ancestry, value, oldValue, proxy) === false) {
                        break;
                    }
                    // Continue propagation, traversing the mutated property's object hierarchy & call any __handlers along the way
                    if (parent.__key && parent.__parent) {
                        ancestry.unshift(parent.__key);
                        parent = parent.__parent;
                    } else {
                        parent = null;
                    }
                }

                // Notify the dependents
                setTimeout(() => {
                    eachDependent(prop, false, (dependent: any, dependents: any) => {
                        if (dependent.__disposed) {
                            dependents.delete(dependent);
                        }
                        else if (dependent !== computedStack[0]) {
                            runComputedFunction(dependent);
                        }
                    });
                }, 0);
            }

            return true;
        },
        deleteProperty(_, prop) {
            // Delete the property
            const deleted = delete obj[prop];

            if (deleted) {
                // Notify the dependents and remove the property from the properties map to prevent any further calls
                eachDependent(prop, true, (dependent: any) => {
                    if (!dependent.__disposed) runComputedFunction(dependent);
                });
            }

            // Return the result of the deletion
            return deleted;
        },

    });

    if (bind) {
        // Need this for binding es6 classes methods which are stored in the object prototype
        getInstanceMethodKeys(obj).forEach(
            (key: string) => (obj[key] = obj[key].bind(proxy))
        );
    }

    return proxy;
}

// Helper functions
const arrayHas = (poi: PropsOrIgnore, prop: string | symbol) => isArray(poi) && has(poi, prop as string);
const isValidFn = (poi: PropsOrIgnore, prop: string | symbol, value: any) => isFunction(poi) && (poi as Function)(prop as string, value);
const setTracker = (source: WeakMap<any,any> | Map<any,any>, key: any, value: any) => {
    let trackerSet = source.get(key);
    if (!trackerSet) {
        trackerSet = new Set();
        source.set(key, trackerSet);
    }
    // Only add it if it's not already there
    if (!trackerSet.has(value)) trackerSet.add(value);
};