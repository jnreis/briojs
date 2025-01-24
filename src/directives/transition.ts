import { logError } from "../tools";
import { ATTR, B_IF, B_SHOW, BOTH, DIRECTIVE, HOOKS, IN, MUST_BE, OUT, PAUSE, TRANSITION } from "../tools/constants";
import { evaluate } from "../tools/evaluation";
import { INFINITY } from "../tools/number";

export let hydrateTransition = (type: 'in'|'out'|'both') => (vnode: VNode, attrName: string, attrValue: string, tools: HydrationTools) => {

    let _attrName = vnode[ATTR][B_IF] ? B_IF : vnode[ATTR][B_SHOW] ? B_SHOW : '';

    if (!_attrName)
        return logError('the', attrName, DIRECTIVE, MUST_BE, 'accompanied by an b-if or', B_SHOW, DIRECTIVE);

    let [setHook] = tools[HOOKS];
    let [playTransition, reverseTransition]: [PlayTransition, ReverseTransition] = tools[TRANSITION];

    // Evaluate the animation expression
    let animation = evaluate(vnode, attrValue)[0]();

    // Pause the animation
    // The animation will be played when the hook functions are called
    animation[PAUSE]();

    // This will play the transition before the main hook function
    if (type == OUT || type == BOTH)
        setHook(vnode.el, _attrName, (ctx, controls) => playTransition(animation, ctx, controls), INFINITY);

    // This will play the transition after the main hook function
    if (type == IN || type == BOTH)
        setHook(vnode.el, _attrName, (ctx, controls) => reverseTransition(animation, ctx, controls), -INFINITY);
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