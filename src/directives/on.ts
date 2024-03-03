import { VNode, ObjectType } from '..';

import { saveAttr } from '../hydration';
import { listen } from '../tools/dom';
import { isStringFunction } from '../tools/string';
import { isFunction } from '../tools/typeCheck';
import { evaluate, ref } from '../evaluation';
import { $EL, EFFECT } from '../tools/constants';

export let hydrateOn = (vnode: VNode, attrName: string, attrValue: string) => {

    let [_, event, ...modifiers] = attrName.split('-');

    let fn: any = ref(vnode, attrValue) || attrValue;

    // If the `fn` is the reference of a function, make it executable
    if (isFunction(fn))
        fn = `${attrValue}($event)`;

    // Evaluate the expression
    fn = evaluate(vnode, isStringFunction(fn) ? fn : `$event=>{${fn}}`);

    // Modifiers that are not passed as options to the event listener
    let mods: ObjectType = {
        prevent: false,
        stop: false,
        self: false,
    };
    // Other modifiers are passed as options to the event listener
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
    let opts: ObjectType = {
        once: false,
        capture: false,
        passive: false,
    };
    modifiers.forEach((mod) => {
        if (mod in mods) {
            mods[mod] = true;
        }
        else if (mod in opts) {
            opts[mod] = true;
        }
    });
    // Wrap the function to handle modifiers
    let listenFn = function($e: Event) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        if (mods.prevent) $e.preventDefault();

        // https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
        if (mods.stop) $e.stopPropagation();

        // * Note: when using `once` and `self` together and the event is triggered from a child element, `self` will prevent from executing the event listener and `once` will remove the event listener after the first dispatch. That means the event listener will never be executed.
        if (mods.self && $e.target !== $e.currentTarget) return;

        // Run the function
        fn($e);
    };

    // Add the event listener
    let cleanup = listen(vnode[$EL], event, listenFn, opts);

    // Add the cleanup function to the effect object
    vnode[EFFECT][attrName] = cleanup;

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}