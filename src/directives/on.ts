import { saveCleanup, sliceAttrName } from '../app';
import { has, debounce, throttle, wait } from '../tools';
import { each, every } from '../tools/array';
import { DELETE, PREVENT_DEFAULT, TARGET, EVENT, DOCUMENT, DEBOUNCE, OPTIONS, THROTTLE, PREVENT, $, SUPER } from '../tools/constants';
import { isElementVisible, listen } from '../tools/dom';
import { D, delProp, deleteKeys, getKeys, W, countKeys, getProp } from '../tools/object';
import { lower, split } from '../tools/string';
import { isFunction } from '../tools/typeCheck';

let KEYUP = 'keyup';
let KEYDOWN = 'keydown';
let OUTSIDE = 'outside';
let WINDOW = 'window';
let CONTROL = 'control';
let META = 'meta';
let ARROW = 'arrow';
let REPEAT = 'repeat';

// Modifier keys for key events
let modifierKeys = [
    META,
    CONTROL,
    'shift',
    'alt',
];

let keysMap: ObjectType = {
    ctrl: CONTROL,
    cmd: META,
    [SUPER]: META,
    esc: 'escape',
    del: DELETE,
    up: ARROW+'up',
    down: ARROW+'down',
    left: ARROW+'left',
    right: ARROW+'right',
}

/**
 * Hydrate the `b-on` directive
 * 
 * TODO: test every option
 * 
 * @option `capture`    If true, the event will be dispatched to the registered listener before being dispatched to any EventTarget beneath it in the DOM tree.
 * @option `once`       If true, the observer will only execute the callback once.
 * @option `passive`    If true, the listener will never call preventDefault().
 * @option `prevent`    If true, the event's default action will be prevented.
 * @option `stop`       If true, the event's propagation will be stopped.
 * @option `self`       If true, the event will only be dispatched if the target is the same as the currentTarget.
 * @option `outside`    If true, the event will only be dispatched if the target is outside the element.
 * @option `document`   If true, the event will only be dispatched if the target is the document.
 * @option `window`     If true, the event will only be dispatched if the target is the window.
 * @option `repeat`     If false, the event will not be dispatched if the event is a key event and the key is being held down (i.e. the event is being repeated).
 * 
 * @option `signal`     The AbortSignal to use to cancel the event listener.
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `throttle`   The time in milliseconds to wait before executing the callback.
 */
let hydrateOn = (bnode: BNode, attrName: string, attrValue: string) => {

    let _attrName = sliceAttrName(attrName); // 5: b-on-, 3: on-

    let [eventPart, ...dotModifiers] = split(_attrName, '.');
    let [eventName, ...dashOptions] = split(eventPart, '-');
    let booleanOptions = [...dashOptions, ...dotModifiers];

    let $el = bnode.el;

    // The target element
    let target = $el;

    // Get the function, if any
    let expFn = bnode.exec(bnode, attrValue, $+EVENT);

    // The function to call
    let fn = (e: any) => {
        let expResult = expFn(e);

        // Check if the event handler is a function
        if (isFunction(expResult)) expResult(e);
    };

    // Options
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
    let baseAttrName = attrName.split('.')[0];
    let options: ObjectType = {
        ...(bnode[OPTIONS][baseAttrName] || {}),
        ...(bnode[OPTIONS][attrName] || {})
    };

    // Merge quick boolean options
    each(booleanOptions, option => {
        options[option] = true;
    });

    // Wrap the function with debounce
    let debounceFn = DEBOUNCE in options
        ? debounce(fn, options[DEBOUNCE])
        : undefined;
    if (debounceFn) fn = debounceFn;

    // Wrap the function with throttle
    if (THROTTLE in options) fn = throttle(fn, options[THROTTLE]);
    let listeners: FunctionType[] = [];
    let disposed = false;
    let listenerOptions = {...options, once: false};

    let removeListeners = () => {
        if (disposed) return;
        disposed = true;
        for (let remove of listeners) remove();
        listeners = [];
    };
    let cleanup = () => {
        removeListeners();
        debounceFn?.cancel();
    };

    // The target element
    if (options[OUTSIDE] || options[DOCUMENT]) target = D as any;
    else if (options[WINDOW]) target = W as any;

    // Watched keys
    let keys: ObjectType = {};

    // Get the keys to watch for when the event is `keydown` or `keyup`
    if (has([KEYDOWN,KEYUP], eventName))
        each(getProp(options, 'keys', []), (key: string) => {
            keys[lower(keysMap[key] || key)] = true;
        });

    // Wrap the function to handle options
    let listenFn = (e: any) => {

        // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        if (options[PREVENT]) e[PREVENT_DEFAULT]();

        // https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
        if (options.stop) e.stopPropagation();

        // IMPORTANT: when using `once` and `self` together and the event is triggered from a child element, `self` will prevent from executing the event listener and `once` will remove the event listener after the first dispatch. That means the event listener will never be executed.
        if (options.self && e[TARGET] !== e.currentTarget)
            return;

        // Outside option
        if (options[OUTSIDE] && ($el.contains(e[TARGET] as Node) || !isElementVisible($el)))
            return;

        // Check if all the keys are pressed
        // WARNING: `keypress` has been deprecated, use `keydown` instead
        if (has([KEYDOWN,KEYUP], eventName)) {
            if (!(countKeys(keys) == countKeys(pressedKeys) && every(getKeys(keys), k => pressedKeys[k])))
                return;
        }

        // Run the function
        fn(e);
        if (options.once) removeListeners();
    }

    // Keep track of the pressed keys for key events
    let pressedKeys: ObjectType = {};
    let s = countKeys(keys);

    // Key events
    if (has([KEYDOWN,KEYUP], eventName) && s) {

        // Listen to keydown and track pressed keys
        listeners.push(listen(target, KEYDOWN, (e: any) => {

            if (options[REPEAT] === false && e[REPEAT]) return;

            let key = lower(e.key);

            // On keydown, add the key before emitting the event
            pressedKeys[key] = true;

            // Emit the event
            if (KEYDOWN == eventName) {
                listenFn(e);
            }

            /**
             * IMPORTANT NOTE:
             * Auto-remove non-modifier key if the meta key is pressed.
             * This is because the `keyup` event is not triggered on alphanumeric keys when the meta key is pressed.
             */
            if (pressedKeys.meta && !has(modifierKeys, key)) {
                deletePressedKey(e, pressedKeys);
            }
        }, listenerOptions));

        // Listen to keyup and track released keys
        listeners.push(listen(target, KEYUP, (e: any) => {

            // On keydown, remove the key before emitting the event
            if (KEYDOWN == eventName) deletePressedKey(e, pressedKeys);

            // Emit the event
            if (KEYUP == eventName) {
                listenFn(e);

                wait(() => deletePressedKey(e, pressedKeys));
            }
        }, listenerOptions));

        // Remove all keys when the target loses focus
        listeners.push(listen(target, 'focus', () => {
            deleteKeys(pressedKeys);
        }, listenerOptions));
    }
    else {
        listeners.push(listen(target, eventName, listenFn, listenerOptions));
    }

    saveCleanup(bnode, cleanup);
}

let deletePressedKey = (e: any, pressedKeys: ObjectType) => delProp(pressedKeys, lower(e.key));

export let onDirective: Directive = [/^(b-on|on)-([\w-$.]+)$/, hydrateOn]; // on-click="action" on-click-prevent on-click.prevent