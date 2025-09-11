/**
 * Hydrate the `b-resize` directive
 *
 * @option `document`   If true, the observer will observe the document instead of the element.
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `box`        The box type to observe: content-box, border-box, device-pixel-content-box
 */
export declare let hydrateResize: (bnode: BNode, attrName: string, attrValue: string) => void;
export declare let resizeDirectives: Directive[];
