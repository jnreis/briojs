import { evaluate } from "../evaluation";
import { saveInterceptor } from "../hydration";
import { $in, $out } from "../methods/transition";
import { logger } from "../tools";
import { AFTER, ATTR, BEFORE, DIRECTIVE, MUST_BE, PAUSE, TRANSITION } from "../tools/constants";

export let hydrateTransition = (vnode: VNode, _: string, attrValue: string) => {

    let _attrName = vnode[ATTR].if ? 'if' : vnode[ATTR].show ? 'show' : '';

    if (!_attrName)
        return logger(`The ${TRANSITION} ${DIRECTIVE} ${MUST_BE} accompanied by an "if" or "show" ${DIRECTIVE}.`);

    // Evaluate the animation expression
    let animation = evaluate(vnode, attrValue)[0]();

    // Pause the animation
    // The animation will be played when the interceptor functions are called
    animation[PAUSE]();

    // Create instances of the $in and $out functions
    let _out = $out();
    let _in = $in();

    // Save the interceptor functions (before out, after in)
    saveInterceptor(vnode, _attrName, BEFORE, (ctx, next) => _out(animation, ctx, next));
    saveInterceptor(vnode, _attrName, AFTER, (ctx, next) => _in(animation, ctx, next));
}

/**
    // Web Animations API
    $el.animate(
        [{ transform: 'translateY(16px)', opacity: 0 }],
        {duration: 400, fill: 'forwards'}
    )

    // Web Animations API - $animate helper
    $animate($el, {translateY: '16px', opacity: '0'})

    // Anime.js
    anime({
        targets: $el,
        translateY: 16,
        opacity: 0,
        duration: 400,
        easing: 'easeInOutQuad',
    })

    // GSAP
    gsap.to($el, {
        y: 16,
        opacity: 0,
        duration: .4,
        ease: "power1.inOut",
    })
*/