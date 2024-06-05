import { evaluate } from "../evaluation";
import { saveInterceptor } from "../hydration";
import { $in, $out } from "../methods/transition";
import { logger } from "../tools";
import { AFTER, ATTR, BEFORE, DIRECTIVE, MUST_BE, OPACITY, TRANSITION } from "../tools/constants";

export let hydrateTransition = (vnode: VNode, _: string, attrValue: string) => {

    let _attrName = vnode[ATTR].if ? 'if' : vnode[ATTR].show ? 'show' : '';

    if (!_attrName)
        return logger(`The ${TRANSITION} ${DIRECTIVE} ${MUST_BE} accompanied by an "if" or "show" ${DIRECTIVE}.`);

    // Evaluate the animation expression
    let animation = evaluate(vnode, attrValue)[0]();

    // Pause the animation
    // The animation will be played when the interceptor functions are called
    animation.pause();

    // Create instances of the $in and $out functions
    let _out = $out();
    let _in = $in();

    // Save the interceptor functions (before out, after in)
    saveInterceptor(vnode, _attrName, BEFORE, (ctx, next) => _out(animation, ctx, next));
    saveInterceptor(vnode, _attrName, AFTER, (ctx, next) => _in(animation, ctx, next));
}

/**
    // Web Animations API (WAAPI)
    $el.animate(
        [{ transform: 'translateY(16px)', opacity: 0 }],
        {duration: 400, fill: 'forwards'}
    )

    // Anime.js
    anime({
        targets: $el,
        translateY: 16,
        opacity: 0,
        duration: 400,
        easing: 'linear',
        autoplay: false,
    })

    // GSAP
    gsap.to($el, {
        y: 16,
        opacity: 0,
        duration: .4,
        ease: 'linear',
        paused: true,
    })
 */


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

// let _generatePropertyKeyframe = (element: HTMLElement, property: any, startValue: any) => {
//     let currentValue = window[GET_COMPUTED_STYLE](element)[property];
//     return [{[property]: currentValue}, {[property]: startValue}];
// }