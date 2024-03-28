import { ObjectType, VNode } from "..";

import { evaluate } from "../evaluation";
import { saveAttr, saveEffect } from "../hydration";
import { debounce } from "../tools";
import { each } from "../tools/array";
import { ATTRIBUTE, OBJECT, VALUE, OPTION, MUST_BE } from "../tools/constants";
import { getAttr } from "../tools/dom";
import { isStringFunction } from "../tools/string";
import { isNull, isObject } from "../tools/typeCheck";

let DISCONNECT: 'disconnect' = 'disconnect';

export let hydrateIntersection = (vnode: VNode, attrName: string, attrValue: string) => {

    let $el = vnode.$el;

    // The name of the options attribute
    let attrOptions = `${attrName}-${OPTION}s`;

    // The value of the options attribute
    let optionsValue = getAttr($el, attrOptions);

    // Save the options attribute, if it exists
    if (!isNull(optionsValue))
        saveAttr(vnode, attrOptions, optionsValue as string);

    // Evaluate the options attribute
    let options: ObjectType = evaluate(vnode, optionsValue || '{}');

    // Make sure the options is an object
    if (!isObject(options))
        return console.error(`The ${VALUE} of the ${attrOptions} ${ATTRIBUTE} ${MUST_BE} an ${OBJECT}.`);

    // // Convert the threshold to a number between 0 and 1
    // if (THRESHOLD in options)
    //     options[THRESHOLD] = toNumber(options[THRESHOLD]) / 100;

    // Make sure the attrValue is a function
    let exp: any;
    if (!isStringFunction(attrValue))
        exp = `()=>{${attrValue}}`;

    // Evaluate the expression
    exp = evaluate(vnode, exp);

    let observer = new IntersectionObserver(entries => {
        each(entries, entry => {
            // Ignore if intersecting and the directive is `leave`
            if (entry.isIntersecting == (attrName == 'leave')) return;

            // Execute the expression
            exp();

            // If the directive has the `once` option, disconnect the observer
            if (options.once) observer[DISCONNECT]();
        });
    }, options);

    // Wait for the next tick to observe the element
    let observe = debounce(() => observer.observe($el), 0);

    // Observe the element
    observe();

    // Save the effect
    saveEffect(vnode, () => observer[DISCONNECT]());

    // Save Attrinute
    saveAttr(vnode, attrName, attrValue);
}