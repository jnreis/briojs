/**
 * Hydrate the `b-intersect` directive
 *
 * @option `once`       If true, the observer will only execute the callback once.
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `root`       The element that is used as the viewport for checking visibility of the target.
 * @option `rootMargin` Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).
 * @option `threshold`  Either a single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be
 */
export declare let hydrateIntersection: (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => void;
