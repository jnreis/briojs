import { saveCleanup, sliceAttrName } from "../app";
import { debounce } from "../tools";
import { each } from "../tools/array";
import { split } from "../tools/string";
import { DISCONNECT, OBSERVE, ONCE, OPTIONS, DEBOUNCE, EXIT, ON_ENTER, B_, ON_EXIT } from "../tools/constants";

/**
 * Hydrate the `b-intersect` directive
 * 
 * @option `once`       If true, the observer will only execute the callback once.
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `root`       The element that is used as the viewport for checking visibility of the target.
 * @option `rootMargin` Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).
 * @option `threshold`  Either a single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be
 */
export let hydrateIntersection = (bnode: BNode, attrName: string, attrValue: string) => {

    let [setHook, playHook] = bnode.hook;
    
    let _attrName = sliceAttrName(attrName, 5); // 5: b-on-, 3: on-
    
    let [directiveName] = split(_attrName, '-');
    
    // Options
    let options = bnode[OPTIONS][attrName] || {};
    
    let $el = bnode.el;
    
    // Evaluate the expression
    let expFn = bnode.exec(bnode, attrValue, '$entry', false);

    // Set the directive hook
    setHook($el, attrName, debounce(expFn, options[DEBOUNCE] || 100));

    let observer = new IntersectionObserver(entries => {
        each(entries, async (entry: IntersectionObserverEntry) => {
            // Ignore if intersecting and the directive is `exit`
            if (entry.isIntersecting == (directiveName == EXIT)) return;

            // Execute the expression, if the event handler is a function
            await playHook($el, attrName, entry);

            // If the directive has the `once` option, disconnect the observer
            if (options[ONCE]) observer[DISCONNECT]();
        });
    }, options);

    // Observe the element
    observer[OBSERVE]($el);

    // Save the cleanup function
    saveCleanup(bnode, () => observer[DISCONNECT]());
}

export let intersectionDirectives: Directive[] = [
    [ON_ENTER, hydrateIntersection],
    [B_+ON_ENTER, hydrateIntersection],

    [ON_EXIT, hydrateIntersection],
    [B_+ON_EXIT, hydrateIntersection],
];