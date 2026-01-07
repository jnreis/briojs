import { saveCleanup, sliceAttrName } from "../app";
import { debounce } from "../tools";
import { DISCONNECT, HTML, OBSERVE, DOCUMENT, OPTIONS, DEBOUNCE, ON_RESIZE, B_ } from "../tools/constants";
import { query } from "../tools/dom";
import { split } from "../tools/string";

/**
 * Hydrate the `b-resize` directive
 * 
 * @option `document`   If true, the observer will observe the document instead of the element.
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `box`        The box type to observe: content-box, border-box, device-pixel-content-box
 */
export let hydrateResize = (bnode: BNode, attrName: string, attrValue: string) => {

    let _attrName = sliceAttrName(attrName); // 5: b-on-, 3: on-

    let [_directiveName] = split(_attrName, '-');

    // Options
    let options = bnode[OPTIONS][attrName] || {};

    // Get the target element
    let target = options[DOCUMENT] ? query(HTML) as HTMLElement : bnode.el;

    // Evaluate the expression
    let expFn = bnode.exec(bnode, attrValue, '$size', false);

    // Set the directive hook
    let cb = debounce(expFn, options[DEBOUNCE] || 100);

    let observer = new ResizeObserver(entries => {

        let box = entries[0].borderBoxSize[0];

        /**
         * Execute the expression
         * The expression will receive the width and height of the element
         */
        cb([ box.inlineSize, box.blockSize ]);
    });

    // Observe the element
    observer[OBSERVE](target, options);

    // Save the cleanup function
    saveCleanup(bnode, () => observer[DISCONNECT]());
}

export let resizeDirectives: Directive[] = [
    [ON_RESIZE, hydrateResize],
    [B_+ON_RESIZE, hydrateResize],
];