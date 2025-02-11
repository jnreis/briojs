import { logError } from "../tools";
import { ATTR, B_, B_IF, B_SHOW, BOTH, DIRECTIVE, IN, MUST_BE, OUT, PAUSE, TRANSITION } from "../tools/constants";
import { INFINITY } from "../tools/number";

export let hydrateTransition = (type: 'in'|'out'|'both') => (vnode: VNode, attrName: string, attrValue: string) => {

    let _attrName = vnode[ATTR][B_IF] ? B_IF : vnode[ATTR][B_SHOW] ? B_SHOW : '';

    if (!_attrName)
        return logError('the', attrName, DIRECTIVE, MUST_BE, 'accompanied by an b-if or', B_SHOW, DIRECTIVE);

    let [setHook] = vnode.hook;
    let [playTransition, reverseTransition] = vnode[TRANSITION];

    // Evaluate the animation expression
    let animation = vnode.exec(vnode, attrValue)();

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

export let transitionDirectives: Directive[] = [
    [B_+TRANSITION, hydrateTransition(BOTH)],
    [B_+TRANSITION+'-in', hydrateTransition(IN)],
    [B_+TRANSITION+'-out', hydrateTransition(OUT)]
];

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