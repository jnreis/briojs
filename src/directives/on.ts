import { saveCleanup } from '../app';
import { hydrateIntersection } from './intersection';
import { hydrateResize } from './resize';
import { has, debounce, throttle, wait, slice, logError } from '../tools';
import { each, every } from '../tools/array';
import { B_, DELETE, FUNCTION, PREVENT_DEFAULT, TARGET, REQUIRES_ACTION_TYPE, EVENT, DOCUMENT, DEBOUNCE, OPTIONS, THROTTLE, PREVENT, HOOKS } from '../tools/constants';
import { emit, isElementVisible, listen } from '../tools/dom';
import { evaluate } from '../tools/evaluation';
import { D, deleteKey, deleteKeys, getKeys, W, countKeys, getKey } from '../tools/object';
import { lower, split, startsWith } from '../tools/string';
import { getType, isFunction } from '../tools/typeCheck';

let KEYUP = 'keyup';
let KEYDOWN = 'keydown';
let OUTSIDE = 'outside';
let WINDOW = 'window';
let CONTROL = 'control';
let META = 'meta';
let ARROW = 'arrow';

let singleActionKeys = [
    META,
    CONTROL,
    'shift',
    'alt',
    'fn',
];

let keysMap: ObjectType = {
    ctrl: CONTROL,
    cmd: META,
    super: META,
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
 * @option `signal`     The AbortSignal to use to cancel the event listener.
 * 
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `throttle`   The time in milliseconds to wait before executing the callback.
 * 
 * @option `prevent`    If true, the event's default action will be prevented.
 * @option `stop`       If true, the event's propagation will be stopped.
 * @option `self`       If true, the event will only be dispatched if the target is the same as the currentTarget.
 * @option `outside`    If true, the event will only be dispatched if the target is outside the element.
 * @option `document`   If true, the event will only be dispatched if the target is the document.
 * @option `window`     If true, the event will only be dispatched if the target is the window.
 */
export let hydrateOn = (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let [setHook, playHook] = tools[HOOKS];

    let _attrName = slice(attrName, startsWith(attrName, B_) ? 5 : 3) as string; // 5: b-on-, 3: on-

    let [event] = split(_attrName, '-');

    // Enter or exit event (IntersectionObserver)
    if (event == 'enter' || event == 'exit')
        return hydrateIntersection(vnode, attrName, attrValue, tools);

    // Resize event (ResizeObserver)
    if (event == 'resize')
        return hydrateResize(vnode, attrName, attrValue, tools);

    let $el = vnode.el;

    // The target element
    let target = $el;

    // The function to call
    let fn = (e: any) => {
        // Get the function, if any
        let [call] = evaluate(vnode, attrValue, '$event', true);
    
        // Check if the event handler is a function
        if (isFunction(call)) call(e);
        else logError(REQUIRES_ACTION_TYPE(EVENT, attrName, 'a ' + FUNCTION, getType(call())));
    };

    // Options
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
    let options: ObjectType = vnode[OPTIONS][attrName] || {};

    // Wrap the function with debounce
    if (DEBOUNCE in options) fn = debounce(fn, options[DEBOUNCE]);

    // Wrap the function with throttle
    if (THROTTLE in options) fn = throttle(fn, options[THROTTLE]);

    // Set the hook
    setHook($el, attrName, fn);

    // The target element
    if (options[OUTSIDE] || options[DOCUMENT]) target = D as any;
    else if (options[WINDOW]) target = W as any;

    // Watched keys
    let keys: ObjectType = {};

    // Get the keys to watch for when the event is `keydown` or `keyup`
    if (has([KEYDOWN,KEYUP], event))
        each(getKey(options, 'keys', []), (key: string) => {
            keys[keysMap[key] || key] = true;
        });

    // Keep track of the pressed keys
    let s = countKeys(keys);
    let eventName = event;
    if (has([KEYDOWN,KEYUP], event) && s) {
        let pressedKeys: ObjectType = {};

        // Watch the pressed keys
        event = attrName;

        /**
         * IMPORTANT NOTE:
         * The debounce is only applied to the `keyup` event when there are more than one key to watch and the meta key is one of them.
         * This is because the `keyup` event is not triggered on alphanumeric keys when the meta key is pressed.
         */
        let debounceEmit = debounce((detail: any) => {
            emit(target, event, detail);
        }, 600);

        // Add keys
        saveCleanup(vnode, listen(target, KEYDOWN, (e: any) => {
            let key = lower(e.key);
            if (!pressedKeys[key]) pressedKeys[key] = true;

            /**
             * IMPORTANT NOTE:
             * Auto-remove non-single action key if the meta key is pressed.
             * This is because the `keyup` event is not triggered on alphanumeric keys when the meta key is pressed.
             */
            wait(() => {
                if (pressedKeys.meta && !has(singleActionKeys, key))
                    delKey(e, pressedKeys);
            });

            let detail = getKeys(pressedKeys);

            // If there are more than one key to watch and the meta key is one of them and a non-single action key is pressed, debounce the emit
            if (s > 1 && KEYUP == eventName && pressedKeys.meta && !has(singleActionKeys, key))
                debounceEmit(detail);

            // Otherwise, emit the event immediately
            else if (KEYDOWN == eventName)
                emit(target, event, detail);
        }));

        // Remove keys
        saveCleanup(vnode, listen(target, KEYUP, (e: any) => {

            // On keydown, remove the key before emitting the event
            if (KEYDOWN == eventName) delKey(e, pressedKeys);

            // Emit the event
            emit(target, event, getKeys(pressedKeys));

            // On keyup, remove the key after emitting the event
            if (KEYUP == eventName) delKey(e, pressedKeys);
        }));

        // Remove all keys when the target loses focus
        saveCleanup(vnode, listen(target, 'focus', () => {
            deleteKeys(pressedKeys);
        }));
    }

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
            let pkeys = e.detail;
            if (!(countKeys(keys) == countKeys(pkeys) && every(getKeys(keys), k => has(pkeys, k))))
                return;
        }

        // Run the function
        playHook($el, attrName, e);
    }

    // Create listener and save the cleanup function
    saveCleanup(vnode, listen(target, event, listenFn, options));
}

let delKey = (e: any, pressedKeys: ObjectType) => {
    let key = lower(e.key);
    if (pressedKeys[key]) deleteKey(pressedKeys, key);
}