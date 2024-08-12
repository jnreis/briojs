import { evaluate } from "../tools/evaluation";
import { $in, $out } from "../methods/transition";
import { logger } from "../tools";
import { ATTR, DIRECTIVE, MUST_BE, PAUSE, TRANSITION } from "../tools/constants";
import { setHook } from "../tools/hook";
import { INFINITY } from "../tools/number";

export let hydrateTransition = (vnode: VNode, _: string, attrValue: string) => {

    let _attrName = vnode[ATTR]['b-if'] ? 'b-if' : vnode[ATTR]['b-show'] ? 'b-show' : '';

    if (!_attrName)
        return logger(`The ${TRANSITION} ${DIRECTIVE} ${MUST_BE} accompanied by an b-if or b-show ${DIRECTIVE}.`);

    // Evaluate the animation expression
    let animation = evaluate(vnode, attrValue)[0]();

    // Pause the animation
    // The animation will be played when the hook functions are called
    animation[PAUSE]();

    // Create instances of the $in and $out functions
    let _out = $out();
    let _in = $in();

    // Save the hook functions (before out, after in)
    setHook(vnode.$el, _attrName, (ctx, controls) => _out(animation, ctx, controls), INFINITY);
    setHook(vnode.$el, _attrName, (ctx, controls) => _in(animation, ctx, controls), -INFINITY);
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