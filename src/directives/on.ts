import { evaluate } from '../evaluation';
import { lifecycle, saveCleanup } from '../hydration';
import { has, size, debounce, throttle, wait } from '../tools';
import { each } from '../tools/array';
import { BUT_GOT_INSTEAD, FUNCTION, MUST_BE } from '../tools/constants';
import { emit, isElementVisible, listen } from '../tools/dom';
import { deleteKey, deleteKeys, getKeys } from '../tools/object';
import { lower, split } from '../tools/string';
import { getType } from '../tools/typeCheck';

let KEYUP = 'keyup';
let KEYDOWN = 'keydown';
let DEBOUNCE = 'debounce';
let PREVENT = 'prevent';
let OUTSIDE = 'outside';
let DOCUMENT = 'document';
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
    space: ' ',
    spacebar: ' ',
    del: 'delete',
    slash: '/',
    up: ARROW+'up',
    down: ARROW+'down',
    left: ARROW+'left',
    right: ARROW+'right',
    period: '.',
    dot: '.',
    comma: ',',
    equal: '=',
    plus: '+',
    minus: '-',
    underscore: '_',
};

export let hydrateOn = (vnode: VNode, attrName: string, attrValue: string) => {

    let [_, event, ...modifiers] = split(attrName, '-');

    let $el = vnode.$el;

    // The target element
    let target = $el;

    // Get the reference, if any
    let [call, isRef] = evaluate(vnode, attrValue, '$event', true);

    // Check if the event handler is a function
    if (isRef)
        console.warn(`The event handler ${MUST_BE} a ${FUNCTION}, ${BUT_GOT_INSTEAD(getType(call()))}`);

    // Create the lifecycle function
    let fn = lifecycle(vnode, attrName, ($event: any, next: FunctionType) => {
        // Call the function
        call($event);

        // Next lifecycle function
        next();
    });

    // Other modifiers are passed as options to the event listener
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options
    let opts: ObjectType = {};

    // Modifiers that are not passed as options to the event listener
    let mods: ObjectType = {};

    // Watched keys
    let keys: ObjectType = {};

    // Loop through the modifiers
    each(modifiers, (mod, index) => {
        // Debounce and throttle modifiers
        if (has([DEBOUNCE,'throttle'], mod)) {
            // Get the delay, if any
            let delay = modifiers[index + 1];
            mods[mod] = isNaN(delay as any) ? 250 : +delay;

            // Wrap the function with debounce or throttle
            fn = DEBOUNCE == mod 
                ? debounce(fn, mods[mod]) 
                : throttle(fn, mods[mod]);
        }
        // Options modifiers
        else if (has(['once','capture','passive'], mod)) opts[mod] = true;
        // Prevent, stop, self, outside, document, window modifiers
        else if (has([PREVENT,OUTSIDE,DOCUMENT,WINDOW,'stop','self'], mod)) mods[mod] = true;
        // Any other modifier is a key when the event is `keydown` or `keyup`
        else if (has([KEYDOWN,KEYUP], event) && isNaN(mod as any)) keys[keysMap[mod] || mod] = true;
    });

    // The target element
    if (mods[OUTSIDE] || mods[DOCUMENT]) target = document as any;
    else if (mods[WINDOW]) target = window as any;

    // Keep track of the pressed keys
    let s = size(keys);
    let eventName = event;
    if (has([KEYDOWN,KEYUP], event) && s) {
        let pressedKeys: ObjectType = {};

        // Watch the pressed keys
        event = attrName;

        // * DEBOUNCE EMIT
        // * The debounce is only applied to the `keyup` event when there are more than one key to watch and the meta key is one of them.
        // * This is because the `keyup` event is not triggered on alphanumeric keys when the meta key is pressed.
        let debounceEmit = debounce((detail: any) => {
            emit(target, event, detail);
        }, 600);

        // Add keys
        saveCleanup(vnode, listen(target, KEYDOWN, (e: any) => {
            let key = lower(e.key);
            if (!pressedKeys[key]) pressedKeys[key] = true;
        
            // * Auto-remove non-single action key if the meta key is pressed
            // * This is because the `keyup` event is not triggered on alphanumeric keys when the meta key is pressed.
            wait(() => {
                if (pressedKeys.meta && !has(singleActionKeys, key))
                    delKey(e, pressedKeys);
            });

            let detail = getKeys(pressedKeys);

            // * If there are more than one key to watch and the meta key is one of them and a non-single action key is pressed, debounce the emit
            if (s > 1 && KEYUP == eventName && pressedKeys.meta && !has(singleActionKeys, key))
                debounceEmit(detail);

            // * Otherwise, emit the event immediately
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

    // Wrap the function to handle modifiers
    let listenFn = function(e: any) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
        if (mods[PREVENT]) e.preventDefault();

        // https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
        if (mods.stop) e.stopPropagation();

        // * Note: when using `once` and `self` together and the event is triggered from a child element, `self` will prevent from executing the event listener and `once` will remove the event listener after the first dispatch. That means the event listener will never be executed.
        if (mods.self && e.target !== e.currentTarget)
            return;

        // Outside modifier
        if (mods[OUTSIDE] && ($el.contains(e.target as Node) || !isElementVisible($el)))
            return;

        // Check if all the keys are pressed
        // ! NOTE: `keypress` has been deprecated, use `keydown` instead
        if (has([KEYDOWN,KEYUP], eventName)) {
            let pkeys = e.detail;
            if (!(size(keys) == size(pkeys) && getKeys(keys).every((k: string) => has(pkeys, k))))
                return;
        }

        // Run the function
        fn(e);
    };

    // Create listener and save the cleanup function
    saveCleanup(vnode, listen(target, event, listenFn, opts));
}

let delKey = (e: any, pressedKeys: ObjectType) => {
    let key = lower(e.key);
    if (pressedKeys[key]) deleteKey(pressedKeys, key);
}