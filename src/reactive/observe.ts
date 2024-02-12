import {
    isObj,
    defineBubblingProperties,
    getInstanceMethodKeys,
    setHiddenKey,
} from "./tools";
import { enqueue, __batched } from "./batch";

export const computedStack: ((...argsList: any[]) => any)[] = []
export const trackerSymbol = Symbol('tracker')

const observedSymbol = Symbol("__observed");

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
export function observe(obj: any, options: Options = {}): any {
    // 'deep' is slower but reasonable; 'shallow' a performance enhancement but with side-effects
    const { props, ignore, batch, deep = true, bubble, bind } = options;

    // Ignore if the object is already observed
    if (observedSymbol in obj) {
        return obj;
    }

    // If the prop is explicitely not excluded
    const isWatched = (prop: string | Symbol, value: any) =>
        prop !== observedSymbol &&
        (!props ||
            (props instanceof Array && props.includes(prop as string)) ||
            (typeof props === "function" && props(prop as string, value))) &&
        (!ignore ||
            (!(ignore instanceof Array && ignore.includes(prop as string)) &&
                !(typeof ignore === "function" && ignore(prop as string, value))));

    // If the deep flag is set, observe nested objects/arrays
    if (deep && !(obj instanceof Node)) {
        Object.entries(obj).forEach(function ([key, val]) {
            if (isObj(val) && isWatched(key, val)) {
                obj[key] = observe(val, options);
                // If bubble is set, we add keys to the object used to bubble up the mutation
                if (bubble) {
                    defineBubblingProperties(obj[key], key, obj);
                }
            }
        });
    }

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
                    if (tracker) {
                        let trackerSet = tracker.get(obj);
                        if (!trackerSet) {
                            trackerSet = new Set();
                            tracker.set(obj, trackerSet);
                        }
                        trackerSet.add(prop);
                    }
                    // Link the computed function and the property being accessed
                    let propertiesSet = propertiesMap.get(prop);
                    if (!propertiesSet) {
                        propertiesSet = new Set();
                        propertiesMap.set(prop, propertiesSet);
                    }
                    propertiesSet.add(computedFn);
                }
            }

            // Handle Set and Map methods
            if (obj instanceof Set || obj instanceof Map) {
                return (...args: string[]) => (obj as any)[prop](...args);
            }

            return obj[prop];
        },
        set(_, prop, value) {
            if (prop === "__handler") {
                // Don't track bubble handlers
                setHiddenKey(obj, "__handler", value);
            } else if (!isWatched(prop, value)) {
                // If the prop is ignored
                obj[prop] = value;
            } else if (
                (Array.isArray(obj) && prop === "length") ||
                obj[prop] !== value
            ) {
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
                    if (
                        parent.__handler &&
                        parent.__handler(ancestry, value, oldValue, proxy) ===
                            false
                    ) {
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

                const dependents = propertiesMap.get(prop);
                if (dependents) {
                    // Retrieve the computed functions depending on the prop
                    for (const dependent of dependents) {
                        const tracker = dependent[trackerSymbol];
                        const trackedObj = tracker && tracker.get(obj);
                        const tracked = trackedObj && trackedObj.has(prop);
                        // If the function has been disposed or if the prop has not been used
                        // during the latest function call, delete the function reference
                        if (dependent.__disposed || (tracker && !tracked)) {
                            dependents.delete(dependent);
                        } else if (dependent !== computedStack[0]) {
                            // Run the computed function
                            if (
                                typeof batch !== "undefined" &&
                                batch !== false
                            ) {
                                enqueue(dependent, batch);
                                dependent[__batched] = true;
                            } else {
                                dependent();
                            }
                        }
                    }
                }
            }

            return true;
        },
    });

    if (bind) {
        // Need this for binding es6 classes methods which are stored in the object prototype
        getInstanceMethodKeys(obj).forEach(
            (key) => (obj[key] = obj[key].bind(proxy))
        );
    }

    return proxy;
}
