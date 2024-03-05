import { VNode } from "..";

export let $animate = (vnode: VNode) => (keyframes: Keyframe[], options: KeyframeAnimationOptions = {}) => 
    vnode.$el.animate(keyframes, options = {
        duration: 300, 
        easing: 'ease-in-out', 
        fill: 'forwards', 
        ...options
    });