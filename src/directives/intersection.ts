import { saveCleanup } from "../app";
import { evaluate } from "../tools/evaluation";
import { debounce, logError, slice } from "../tools";
import { each } from "../tools/array";
import { split, startsWith } from "../tools/string";
import { getType } from "../tools/typeCheck";
import { B_, DISCONNECT, OBSERVE, ONCE, REQUIRES_ACTION_TYPE, EVENT, FUNCTION, OPTIONS, DEBOUNCE, HOOKS } from "../tools/constants";

/**
 * Hydrate the `b-intersect` directive
 * 
 * @option `once`       If true, the observer will only execute the callback once.
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `root`       The element that is used as the viewport for checking visibility of the target.
 * @option `rootMargin` Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).
 * @option `threshold`  Either a single number or an array of numbers which indicate at what percentage of the target's visibility the observer's callback should be
 */
export let hydrateIntersection = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let [setHook, playHook] = tools[HOOKS];

    let _attrName = slice(attrName, startsWith(attrName, B_) ? 5 : 3) as string; // 5: b-on-, 3: on-

    let [directiveName] = split(_attrName, '-');

    // Options
    let options = vnode[OPTIONS][attrName] || {};

    let $el = vnode.el;

    // Evaluate the expression
    let [ expFn, isRef ] = evaluate(vnode, attrValue, '$entry', true);

    // Set the directive hook
    setHook($el, attrName, debounce(expFn, options[DEBOUNCE] || 100));

    let observer = new IntersectionObserver(entries => {
        each(entries, async (entry: IntersectionObserverEntry) => {
            // Ignore if intersecting and the directive is `exit`
            if (entry.isIntersecting == (directiveName == 'exit')) return;

            // Execute the expression, if the event handler is a function
            if (isRef != 1) await playHook($el, attrName, entry);

            // If the event handler is not a function, log an error
            else logError(REQUIRES_ACTION_TYPE(EVENT, attrName, 'a ' + FUNCTION, getType(expFn())));

            // If the directive has the `once` option, disconnect the observer
            if (options[ONCE]) observer[DISCONNECT]();
        });
    }, options);

    // Observe the element
    observer[OBSERVE]($el);

    // Save the cleanup function
    saveCleanup(vnode, () => observer[DISCONNECT]());
}