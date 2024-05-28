import { animate } from "../api/animate";
import { getAttr } from "../tools/dom";
import { toNumber } from "../tools/number";
import { isFunction, isNull } from "../tools/typeCheck";
import { saveAttr, wrapper } from "../hydration";
import { GET_COMPUTED_STYLE, OPACITY } from "../tools/constants";
import { arrayAdd, each } from "../tools/array";

let TRANSFORM = 'transform';

// Core transitions
export let _transitions: [
    string, // The name of the transition
    string, // The CSS property
    (attrValue: string|number) => string|number, // The value of the CSS property
][] = [
    ['fade', OPACITY, value => value ? 1 - +value : 0], // 1 - 0 = 1 (show), 1 - 1 = 0 (hide)
    ['blur', 'filter', value => ` blur(${value || '8px'})`],
    ['slide', TRANSFORM, value => ` translate(${value || '0,16px'})`],
    ['scale', TRANSFORM, value => ` scale(${value || .85})`],
    ['rotate', TRANSFORM, value => ` rotate(${value || '25deg'})`],
    ['skew', TRANSFORM, value => ` skew(${value || '0,8deg'})`],
];

let _generatePropertyKeyframe = (element: HTMLElement, property: any, startValue: any) => {
    let currentValue = window[GET_COMPUTED_STYLE](element)[property];
    return [{[property]: currentValue}, {[property]: startValue}];
}

export let hydrateTransition = (vnode: VNode, attrName: string, attrValue: string) => {

    let $el = vnode.$el;

    let keyframes: ObjectType = {transform: ''};

    // Apply requested transitions
    each(_transitions, ([name, propName, propValue]) => {

        // Get the attribute value
        let value = getAttr($el, name);

        // If the attribute exists
        if (!isNull(value)) {

            // Save the attribute
            saveAttr(vnode, name, value as string);

            // Convert the value to a number, if possible
            value = toNumber(value);

            // Add the CSS property to the keyframes
            if (!(propName in keyframes)) keyframes[propName] = '';

            // Generate the keyframes
            keyframes[propName] += ` ${propValue(value as string | number)}`;
        }
    });

    let options: ObjectType = {};

    // Get the duration and easing, if available
    each(['duration', 'easing'], attr => {

        // Get the attribute value
        let value = getAttr($el, attr);

        // If the attribute exists and is not empty
        if (value) {
            // Convert the value to a number, if possible
            options[attr] = toNumber(value);

            // Save the attribute
            saveAttr(vnode, attr, value);
        }
    });

    // Create the transition
    let transition = (keyframes: Keyframe[]) => {
        let a = animate($el, keyframes, options);
        // Prevent the animation from playing
        a.pause();
        return a;
    }

    let transitions: any[] = [];

    // Generate the transitions
    for (let key in keyframes) {
        // Generate the keyframe
        let keyframe = _generatePropertyKeyframe($el, key, keyframes[key]);

        // Create the transition and save it
        arrayAdd(transitions, transition(keyframe));
    }

    let init = false;

    let callback = () => (ctx: any, next: FunctionType) => {

        let value = isFunction(ctx) ? ctx() : ctx;

        each(transitions, transition => {
            let playbackRate = transition.playbackRate;
            // Play forward  OR  Play backward
            if ((value && playbackRate < 0) || (!value && playbackRate > 0)) {
                // Reverse the transition
                transition.reverse();
            }
            // Play the transition (forward)
            else if (!init && value) {
                transition.play();
            }
            // console.warn('transition', value, playbackRate, transition);
        });
        if (!init) init = true;

        // Next lifecycle function
        next();
    }

    wrapper(vnode, attrName, attrValue, callback);
}