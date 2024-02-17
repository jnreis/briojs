import { RawElement, ObjectType } from '../index.d';

import { watch, saveProp, getPropOrExp } from '..';
import { isFunction, isStringFunction, delAttr, inArray, listen, getType, FUNCTION } from '../../tools';

export const hydrateOn = (rawNode: RawElement, attrName: string, attrValue: string) => {

    const [_, event, ...modifiers] = attrName.split('-')
    const {id, $el} = rawNode;

    // Wrap the expression in a function if it's not already
    const exp = isStringFunction(attrValue) ? attrValue : `$event=>{${attrValue}}`;

    // Get the function from the expression
    let fn = getPropOrExp(rawNode, attrValue, exp);

    // Check if `fn` is a function
    if (!isFunction(fn))
        throw new Error(`Only ${FUNCTION}s can be used as event listeners, but got ${getType(fn)} instead.`);

    // Wrap the function to handle modifiers
    const listenFn = function($e: Event) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        if (inArray(modifiers, 'prevent')) $e.preventDefault();

        // https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
        if (inArray(modifiers, 'stop')) $e.stopPropagation();

        // * Note: when using `once` and `self` together and the event is triggered from a child element, `self` will prevent from executing the event listener and `once` will remove the event listener after the first dispatch. That means the event listener will never be executed.
        if (inArray(modifiers, 'self') && $e.target !== $e.currentTarget) return;

        return fn($e);
    }

    // Other modifiers are passed as options to the event listener
    const options: ObjectType = {}
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
    modifiers.forEach((mod) => {
        if (inArray(['once','capture','passive'], mod)) {
            options[mod] = true;
        }
    });

    // Add the event listener
    const cleanup = listen($el, event, listenFn, options);

    // Add the cleanup function to the effect object
    watch(id, event, cleanup, false, false);

    // Save to the rawNode
    saveProp(rawNode, attrName, attrValue);

    // Remove the attribute from the node
    delAttr($el, attrName);
}