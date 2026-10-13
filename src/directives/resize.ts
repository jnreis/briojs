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
let hydrateResize = (bnode: BNode, attrName: string, attrValue: string) => {

    let _attrName = sliceAttrName(attrName); // 5: b-on-, 3: on-

    let [eventPart, ...dotModifiers] = split(_attrName, '.');
    let [_directiveName] = split(eventPart, '-');

    // Options
    let baseAttrName = attrName.split('.')[0];
    let options: ObjectType = {
        ...(bnode[OPTIONS][baseAttrName] || {}),
        ...(bnode[OPTIONS][attrName] || {})
    };
    for (let mod of dotModifiers) {
        options[mod] = true;
    }

    // Get the target element
    let target = options[DOCUMENT] ? query(HTML) as HTMLElement : bnode.el;

    // Evaluate the expression
    let expFn = bnode.exec(bnode, attrValue, '$size', false);

    // Set the directive hook
    let cb = debounce(expFn, options[DEBOUNCE] ?? 100);

    let observer = new ResizeObserver(entries => {
        let entry = entries[0];
        if (!entry) return;
        let boxSizes = options.box === 'content-box'
            ? entry.contentBoxSize
            : options.box === 'device-pixel-content-box'
                ? entry.devicePixelContentBoxSize
                : entry.borderBoxSize;
        let box = Array.isArray(boxSizes) ? boxSizes[0] : boxSizes;
        let size = box
            ? [box.inlineSize, box.blockSize]
            : [entry.contentRect.width, entry.contentRect.height];

        /**
         * Execute the expression
         * The expression will receive the width and height of the element
         */
        cb(size);
    });

    // Observe the element
    observer[OBSERVE](target, options);

    // Save the cleanup function
    saveCleanup(bnode, () => {
        observer[DISCONNECT]();
        cb.cancel();
    });
}

export let resizeDirectives: Directive[] = [
    [/^(b-on-resize|on-resize)(\.[\w-]+)*$/, hydrateResize],
];