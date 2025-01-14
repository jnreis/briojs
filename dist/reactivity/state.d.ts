/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param {Object|Array} target The object/array to observe
 * @param {Object} [options] Options for the state
 * @param {Object} [options.parent] The parent state object
 * @param {Array} [options.skip] Skip specific keys/indexes from being automatically observed
 * @returns proxied
*/
export declare let state: (target: any, options?: StateOptions) => any;
