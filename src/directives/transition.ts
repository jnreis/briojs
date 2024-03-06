import { ObjectType, VNode } from "..";

import { hydrationWrapper } from ".";
import { animate } from "../api/animate";
import { getAttr } from "../tools/dom";
import { toNumber } from "../tools/number";
import { isNull } from "../tools/typeCheck";
import { saveAttr } from "../hydration";

let TRANSFORM = 'transform';

// Core transitions
export let _transitions: [
    string, // The name of the transition
    string, // The CSS property
    (attrValue: string|number) => string|number, // The value of the CSS property
][] = [
    ['fade', 'opacity', value => value],
    ['blur', 'filter', value => ` blur(${value || '8px'})`],
    ['slide', TRANSFORM, value => ` translate(${value || '0,16px'})`],
    ['scale', TRANSFORM, value => ` scale(${value || 0})`],
    ['rotate', TRANSFORM, value => ` rotate(${value || '25deg'})`],
    ['skew', TRANSFORM, value => ` skew(${value || '0,12deg'})`],
];

let _generatePropertyKeyframe = (element: HTMLElement, property: any, startValue: any) => {
    let currentValue = window.getComputedStyle(element)[property];
    return [{[property]: currentValue}, {[property]: startValue}];
}

export let hydrateTransition = (vnode: VNode, attrName: string, attrValue: string) => {

    let $el = vnode.$el;

    let keyframes: ObjectType = {transform: ''};

    // Apply requested transitions
    _transitions.forEach(([name, propName, propValue]) => {

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
    ['duration', 'easing'].forEach(attr => {

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
        transitions.push(transition(keyframe));
    }

    let init = false;

    let callback = () => (value: any) => {
        // Initial state
        if (!init) {
            init = true;

            // If the value is not `true`, set the time to the end
            if (!value) {
                transitions.forEach(transition => {
                    transition.currentTime = transition.effect.getComputedTiming().duration;
                });
            }
        }

        // Reverse: play the transitions in the opposite direction they are currently going in
        transitions.forEach(transition => transition.reverse());
    }

    hydrationWrapper(vnode, attrName, attrValue, callback);
}