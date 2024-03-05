import { ObjectType, VNode } from "..";

import { evaluate } from "../evaluation";
import { saveAttr } from "../hydration";
import { $animate } from "../methods/animate";
import { has } from "../tools";
import { ATTRIBUTE, OBJECT, VALUE } from "../tools/constants";
import { capitalize } from "../tools/string";
import { isObject } from "../tools/typeCheck";

let _generatePropertyKeyframe = (element: HTMLElement, property: any, startValue: any) => {
    let currentValue = window.getComputedStyle(element)[property];
    return [{[property]: startValue}, {[property]: currentValue}];
}

export let hydrateTransition = (vnode: VNode, attrName: string, attrValue: string) => {

    let [TRANSITION, transitionName, ...modifiers] = attrName.split('-');

    let TRANSFORM = 'transform';

    let inOut = function (keyframes: Keyframe[], options: KeyframeAnimationOptions = {}) {
        options = {fill: 'none', ...options};
        return {
            in: () => $animate(vnode)(keyframes, options),
            out: () => $animate(vnode)(keyframes.reverse(), options),
        }
    }

    let transitions: ObjectType = {
        fade(options: KeyframeAnimationOptions) {
            let _opacity = _generatePropertyKeyframe(vnode.$el, 'opacity', 0);
            return inOut(_opacity, options);
        },
        blur(options: KeyframeAnimationOptions) {
            let _blur = _generatePropertyKeyframe(vnode.$el, 'filter', 'blur(8px)');
            return inOut(_blur, options);
        },
        slide(options: KeyframeAnimationOptions) {
            let axis = has(modifiers, 'x') ? 'X' : 'Y';
            let _transform = _generatePropertyKeyframe(vnode.$el, TRANSFORM, `translate${axis}(${axis == 'X' ? '2rem' : '1rem'})`);
            return inOut(_transform, options);
        },
        scale(options: KeyframeAnimationOptions) {
            let _scale = _generatePropertyKeyframe(vnode.$el, TRANSFORM, 'scale(0)');
            return inOut(_scale, options);
        },
    }

    if (!transitions[transitionName])
        return console.error(`${capitalize(TRANSITION)} ${transitionName} is not defined.`);

    let options = {};
    if (attrValue) {
        options = evaluate(vnode, attrValue);
    
        if (!isObject(options))
            return console.error(`The ${VALUE} of the ${attrName} ${ATTRIBUTE} must be an ${OBJECT}.`);
    }

    vnode.animate = vnode.animate || [];

    // Get the index of the next animation
    let animationIndex = vnode.animate.length;

    // Save the transition to the vnode
    vnode.animate![animationIndex] = transitions[transitionName](options);

    // Save to the vnode
    saveAttr(vnode, attrName, attrValue);
}


export let transitionControls = (vnode: VNode) => {

    let transition = {
        in: {
            loaded: false,
            list: [] as Animation[],
        },
        out: {
            loaded: false,
            list: [] as Animation[],
        }
    }

    let play = (type: 'in'|'out', callback?: () => void) => {
        if (!transition[type].loaded) {
            transition[type].loaded = true;
            transition[type].list = vnode.animate?.map(transition => transition[type]()) || [];
        }
        transition[type].list.forEach(transition => transition.play());
        Promise.all(transition[type].list.map(transition => transition.finished)).then(callback);
    }

    return {
        in: (callback?: () => void) => play('in', callback),
        out: (callback?: () => void) => play('out', callback),
    }
}