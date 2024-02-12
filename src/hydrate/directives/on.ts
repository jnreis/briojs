import { RawElement, ObjectType } from '../index.d';

import { scope, inScope, getPropName, watch, rawNodeProp } from '..';
import { evaluate } from '../evaluate';
import { interpolate } from '../interpolate';
import { isFn, isStringFn, delAttr, inArray, listen } from '../../tools';

export function hydrateOn(rawNode: RawElement, name: string, value: string, settings = { wrap: true }) {

    const [_, event, ...modifiers] = name.split('-')

    // Get the prop name
    const propName = getPropName(value);

    // Check if the prop name is valid
    if (!propName) throw new Error(`The value of the event listener must be a valid prop, but got ${value} instead.`);

    const { scopes, node } = rawNode;

    // Get the scope where the prop is defined, if any
    const sid = inScope(scopes, propName);

    // The event listener function
    let fn: any;

    // Check if value matches a prop in the scope
    const prop = sid && scope[sid][value];
    if (prop) {
        // Check if prop is a function
        if (!isFn(prop)) throw new Error(`Only functions can be used as event listeners, but got ${typeof prop} instead.`);

        // Use the function as is
        fn = prop;
    }
    else {
        // Interpolate the value
        const interpolated = interpolate(value, scopes, settings);

        // Wrap the interpolated value in a function
        if (!isStringFn(interpolated.output)) {
            interpolated.output = `$e => { ${interpolated.output} }`;
        }

        // Evaluate the expression
        fn = evaluate(scope, interpolated.output, node);
    }

    // Wrap the function to handle modifiers
    const wrappedFn = ($e: Event) => {
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
    const cleanup = listen(rawNode.node, event, wrappedFn, options);

    // Add the cleanup function to the effect object
    watch(rawNode.id, event, cleanup, false, false);

    // Save to the rawNode
    rawNodeProp(rawNode, 'on', {event, modifiers});

    // Remove the attribute from the node
    delAttr(rawNode.node, name);
}