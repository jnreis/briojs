import { logger } from "../tools";
import { COMPLETE, CURRENT_TIME, DURATION, EVENT_CALLBACK, NAME, NOT_FOUND, ON_COMPLETE, PAUSE, PLAY, PLAYBACK_RATE, REVERSE, REVERSED, TRANSITION_ENGINE, VALIDATE } from "../tools/constants";
import { hasOwnProperty } from "../tools/object";
import { camelCase, capitalize } from "../tools/string";

/** ANIMATION ENGINES */
export let _engines: AnimationEngine[] = [
    {
        [NAME]: 'Web Animations API (WAAPI)',
        [VALIDATE]: (animation: any) => animation instanceof Animation,
        [PLAY]: (animation: any, next: FunctionType) => {
            // Animation is set backwards
            if (animation[PLAYBACK_RATE] < 0) {
                animation[REVERSE]();
                animation[PAUSE]();
            }

            // Play the animation, if it's not completed
            if (animation[CURRENT_TIME] != getAnimateDuration(animation)) animation[PLAY]();

            // Skip the animation, if it's completed
            else next();
        },
        [REVERSE]: (animation: any, next: FunctionType) => {
            // The animation is already at the beginning
            if (animation[CURRENT_TIME] == 0) next();

            // Animation is set forward
            else if (animation[PLAYBACK_RATE] > 0) {
                animation[REVERSE]();
                animation[PAUSE]();
            }

            // Play the animation, if it's not completed
            if (animation[CURRENT_TIME] != 0) animation[PLAY]();

            // Skip the animation, if it's completed
            else next();
        },
        [ON_COMPLETE]: (animation: any, next: FunctionType) => {
            animation.onfinish = next;
        }
    },
    {
        [NAME]: 'Anime.js',
        // ? This validation can be improved
        validate: (animation: any) => ['animatables', 'autoplay'].every(key => hasOwnProperty(animation, key)),
        [PLAY]: (animation: any, next: FunctionType) => {
            // Animation is set backwards
            if (animation[REVERSED]) {
                // Pause the animation before reversing
                // ! This is necessary because reversing the animation while it's playing will cause the animation to play forward 
                // ! and may not fire the `complete` callback because the animation will never reach the end that it was set to
                animation[PAUSE]();
    
                // Set the animation forward
                animation[REVERSE]();
            }
    
            // Play the animation, if it's not completed
            if (animation[CURRENT_TIME] != animation[DURATION]) animation[PLAY]();

            // Skip the animation, if it's completed
            else next();
        },
        [REVERSE]: (animation: any, next: FunctionType) => {
            // Animation is set forward
            if (!animation[REVERSED]) {
                // Pause the animation before reversing
                // ! This is necessary because reversing the animation while it's playing will cause the animation to play forward 
                // ! and may not fire the `complete` callback because the animation will never reach the end that it was set to
                animation[PAUSE]();
    
                // Set the animation backwards
                animation[REVERSE]();
            }
    
            // Play the animation, if it's not completed
            if (animation[CURRENT_TIME] != 0) animation[PLAY]();

            // Skip the animation, if it's completed
            else next();
        },
        [ON_COMPLETE]: (animation: any, next: FunctionType) => {
            animation[COMPLETE] = next;
        }
    },
    {
        [NAME]: 'GSAP',
        // ? This validation can be improved
        [VALIDATE]: (animation: any) => [EVENT_CALLBACK, 'yoyo'].every(key => key in animation),
        [PLAY]: (animation: any) => {
            animation[PLAY]();
        },
        [REVERSE]: (animation: any) => {
            animation[REVERSE]();
        },
        [ON_COMPLETE]: (animation: any, next: FunctionType) => {
            animation[EVENT_CALLBACK](ON_COMPLETE, next);
            animation[EVENT_CALLBACK](camelCase('on', REVERSE, COMPLETE), next);
        },
    }
]

/** ANIMATION CONTROLS */
let _animations: Map<any, FunctionType> = new Map();

export let getEngine = (animation: any) => _engines.find(engine => engine.validate(animation));

let transition = (animation: any, next: FunctionType) => {
    // Get the animation engine
    let engine = getEngine(animation);

    // If the engine is not found, skip the animation
    if (!engine) {
        logger(capitalize(TRANSITION_ENGINE) + ` ${NOT_FOUND}`, animation);
        return;
    }

    // Set the `onComplete` callback for the animation
    if (!_animations.has(animation)) {
        engine.onComplete(animation, () => {
            // onComplete, call the `next` lifecycle function
            _animations.get(animation)!();
        });
    }

    // Pass the `next` lifecycle function to the `complete` callback
    _animations.set(animation, next);

    return engine;
}

/* The transition $in function should be with the `after` lifecycle function */
export let $in = () => (animation: any, ctx: any, next: FunctionType) => {

    // Prepare the transition
    let engine = transition(animation, next);

    // Reverse the animation
    if (engine && ctx) engine.reverse(animation, next);
    // Skip the animation
    else next();
}

/* The transition $out function should be with the `before` lifecycle function */
export let $out = () => (animation: any, ctx: any, next: FunctionType) => {

    // Skip the animation for the first time if the element is supposed to be removed
    if (!_animations.has(animation) && !ctx) next();

    // Prepare the transition
    let engine = transition(animation, next);

    // Skip the animation
    if (!engine || ctx) next();
    // Play the animation
    else engine.play(animation, next);
}


// Helper functions
export let getAnimateDuration = (animation: Animation) => {
    let effect = animation.effect;
    return effect ? Number(effect.getTiming().duration) : 0;
}