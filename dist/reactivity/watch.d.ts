/**
 * Watches for changes to a specific prop or an entire observed object/array and executes a function when changes are detected.
 *
 * @param proxied - The observed object/array.
 * @param prop - The key/index to watch. If `falsy` and not 0, watch for all changes to the observed object/array.
 * @param listener - The function to execute when the prop is modified.
 * @returns cleanup - The disposer function to stop watching
 */
export declare let watch: (proxied: any, prop: string | number | null | undefined | symbol, listener: ListenerFunction, priority?: number) => () => void;
