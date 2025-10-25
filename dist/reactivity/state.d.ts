/**
 * State wrapps an object/array in a Proxy to track changes and notify listeners.
 * @param {Object|Array} target The object/array to observe
 * @param {Object} [parent] The parent state object, if any
 * @returns proxied
*/
export declare let state: State;
