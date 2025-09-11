import { logError } from "../tools";
import { ATTR, B_, B_IF, B_SHOW, DIRECTIVE, MUST_BE, PAUSE, PLAY, REVERSE, TRANSITION } from "../tools/constants";
import { INFINITY } from "../tools/number";

export let hydrateTransition = (type: 'play'|'reverse'|'') => (bnode: BNode, attrName: string, attrValue: string) => {

    let _attrName = bnode[ATTR][B_IF] ? B_IF : bnode[ATTR][B_SHOW] ? B_SHOW : '';

    if (!_attrName)
        return logError('the', attrName, DIRECTIVE, MUST_BE, 'accompanied by an b-if or', B_SHOW, DIRECTIVE);

    let [setHook] = bnode.hook;
    let [playTransition, reverseTransition] = bnode[TRANSITION];

    // Evaluate the animation expression
    let animation = bnode.exec(bnode, attrValue)();

    console.log('Transition animation:', animation, 'attrValue:', attrValue, '_attrName:', _attrName);

    // Pause the animation
    // The animation will be played when the hook functions are called
    animation[PAUSE]();

    // This will play the transition before the main hook function
    if (type == PLAY || !type)
        setHook(bnode.el, _attrName, (ctx, controls) => playTransition(animation, ctx, controls), INFINITY);

    // This will play the transition after the main hook function
    if (type == REVERSE || !type)
        setHook(bnode.el, _attrName, (ctx, controls) => reverseTransition(animation, ctx, controls), -INFINITY);
}

export let transitionDirectives: Directive[] = [
    [B_+TRANSITION, hydrateTransition('')],
    [B_+TRANSITION+'-'+PLAY, hydrateTransition(PLAY)],
    [B_+TRANSITION+'-'+REVERSE, hydrateTransition(REVERSE)]
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