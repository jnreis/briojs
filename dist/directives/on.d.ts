/**
 * Hydrate the `b-on` directive
 *
 * TODO: test every option
 *
 * @option `capture`    If true, the event will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
 * @option `once`       If true, the observer will only execute the callback once.
 * @option `passive`    If true, the listener will never call preventDefault().
 * @option `signal`     The AbortSignal to use to cancel the event listener.
 *
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `throttle`   The time in milliseconds to wait before executing the callback.
 *
 * @option `prevent`    If true, the event's default action will be prevented.
 * @option `stop`       If true, the event's propagation will be stopped.
 * @option `self`       If true, the event will only be dispatched if the target is the same as the currentTarget.
 * @option `outside`    If true, the event will only be dispatched if the target is outside the element.
 * @option `document`   If true, the event will only be dispatched if the target is the document.
 * @option `window`     If true, the event will only be dispatched if the target is the window.
 */
export declare let hydrateOn: (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => void;
