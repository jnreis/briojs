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
export let hydrateResize = (vnode: VNode, attrName: string, attrValue: string) => {

    let [setHook, playHook] = vnode.hook;

    let _attrName = sliceAttrName(attrName, 5); // 5: b-on-, 3: on-

    let [_directiveName] = split(_attrName, '-');

    let $el = vnode.el;

    // Options
    let options = vnode[OPTIONS][attrName] || {};

    // Get the target element
    let target = options[DOCUMENT] ? query(HTML) as HTMLElement : $el;

    // Evaluate the expression
    let expFn = vnode.exec(vnode, attrValue, '$size', false);

    // Set the directive hook
    setHook($el, attrName, debounce(expFn, options[DEBOUNCE] || 100));

    let observer = new ResizeObserver(entries => {

        let box = entries[0].borderBoxSize[0];

        /**
         * Execute the expression
         * The expression will receive the width and height of the element
         */
        playHook($el, attrName, [ box.inlineSize, box.blockSize ]);
    });

    // Observe the element
    observer[OBSERVE](target, options);

    // Save the cleanup function
    saveCleanup(vnode, () => observer[DISCONNECT]());
}

export let resizeDirectives: Directive[] = [
    [ON_RESIZE, hydrateResize],
    [B_+ON_RESIZE, hydrateResize],
];