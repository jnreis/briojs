import { evaluate } from "../tools/evaluation";
import { interceptor, saveCleanup } from "../tools/hydration";
import { debounce, has, size } from "../tools";
import { arrayAdd, each, join } from "../tools/array";
import { toNumber } from "../tools/number";
import { split } from "../tools/string";
import { isNumeric } from "../tools/typeCheck";

let DISCONNECT: 'disconnect' = 'disconnect';
let ONCE = 'once';
let HALF = 'half';
let FULL = 'full';
let THRESHOLD = 'threshold';
let MARGIN = 'margin';

export let hydrateIntersection = (vnode: VNode, attrName: string, attrValue: string) => {

    let [_, directiveName, ...modifiers] = split(attrName, '-');

    // Parse modifiers: once, half, full, threshold, margin
    let options: ObjectType = {};
    let mods = [ONCE, HALF, FULL, THRESHOLD, MARGIN];
    each(modifiers, (modifier, index) => {
        if (modifier == ONCE) options[ONCE] = true;
        else if (modifier == HALF) options[THRESHOLD] = 0.5;
        else if (modifier == FULL) options[THRESHOLD] = 1;
        else if (modifier == THRESHOLD) {
            // Get the threshold value
            let thresholdValue = modifiers[index + 1];
            // If the next modifier is a number, set the threshold
            if (isNumeric(thresholdValue)) options[THRESHOLD] = toNumber(thresholdValue);
        }
        else if (modifier == MARGIN) {
            // Get the margin value(s) (up to 4 values)
            let marginValue: string[] = [];
            let i = index + 1;

            // Run at most 4 times, or until the next modifier is found
            while (i < index + 5 && i < size(modifiers) && !has(mods, modifiers[i])) {
                arrayAdd(marginValue, modifiers[i]);
                i++;
            }
            // Set the margin
            if (size(marginValue)) options[MARGIN] = join(marginValue, ' ');
        }
    });

    let $el = vnode.$el;

    // Evaluate the expression
    let [ call, isRef ] = evaluate(vnode, attrValue, '$entry', true);

    // Create an interceptor
    let exp: Function = interceptor(vnode, attrName, (entry: IntersectionObserverEntry, next) => {
        // Execute the expression
        if (isRef == 1) call()
        else call(entry);

        // Next function
        next();
    });

    let observer = new IntersectionObserver(entries => {
        each(entries, entry => {
            // Ignore if intersecting and the directive is `leave`
            if (entry.isIntersecting == (directiveName == 'leave')) return;

            // Execute the expression
            exp(entry);

            // If the directive has the `once` option, disconnect the observer
            if (options.once) observer[DISCONNECT]();
        });
    }, options);

    // Wait for the next tick to observe the element
    let observe = debounce(() => observer.observe($el), 0);

    // Observe the element
    observe();

    // Save the cleanup function
    saveCleanup(vnode, () => observer[DISCONNECT]());
}