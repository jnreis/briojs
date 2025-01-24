/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param {Object|Array} target The object/array to observe
 * @param {Object} [options] Options for the state
 * @param {Object} [options.parent] The parent state object
 * @returns proxied
*/
export declare let state: State;
