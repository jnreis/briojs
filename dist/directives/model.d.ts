/**
 *
 * @option `trim`   trims the value before setting it to the reactive state.
 * @option `raw`    prevents the value from being typecast to a number, boolean, or null.
 * @option `lazy`   listens for the change event instead of the input event.
 */
export declare let hydrateModel: (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => any;
