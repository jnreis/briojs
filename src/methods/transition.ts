import { has, logger } from "../tools";
import { each } from "../tools/array";
import { $ANIMATE, BLUR, COMPLETE, CURRENT_TIME, DURATION, EASING, EVENT_CALLBACK, FILTER, GET_COMPUTED_STYLE, NAME, NOT_FOUND, ON_COMPLETE, OPACITY, PAUSE, PLAY, PLAYBACK_RATE, REQUIRE, REVERSE, REVERSED, TRANSFORM, TRANSITION_ENGINE, VALIDATE, VALUE } from "../tools/constants";
import { hasOwnProperty } from "../tools/object";
import { camelCase } from "../tools/string";

/** ANIMATION ENGINES */
export let _engines: AnimationEngine[] = [
    {
        [NAME]: 'Web Animations API',
        [VALIDATE]: (animation) => animation instanceof Animation,
        [PLAY]: (animation, next) => {
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
        [REVERSE]: (animation, next) => {
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
        [ON_COMPLETE]: (animation, next) => {
            animation.onfinish = next;
        }
    },
    {
        [NAME]: 'Anime.js',
        // ? This validation can be improved
        validate: (animation) => ['animatables', 'autoplay'].every(key => hasOwnProperty(animation, key)),
        [PLAY]: (animation, next) => {
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
        [REVERSE]: (animation, next) => {
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
        [ON_COMPLETE]: (animation, next) => {
            animation[COMPLETE] = next;
        }
    },
    {
        [NAME]: 'GSAP',
        // ? This validation can be improved
        [VALIDATE]: (animation) => [EVENT_CALLBACK, 'yoyo'].every(key => key in animation),
        [PLAY]: (animation) => {
            animation[PLAY]();
        },
        [REVERSE]: (animation) => {
            animation[REVERSE]();
        },
        [ON_COMPLETE]: (animation, next) => {
            animation[EVENT_CALLBACK](ON_COMPLETE, next);
            animation[EVENT_CALLBACK](camelCase('on', REVERSE, COMPLETE), next);
        },
    }
]

/** ANIMATION CONTROLS */
let _animations: Map<any, NextFunction> = new Map();

export let getEngine = (animation: any) => _engines.find(engine => engine.validate(animation));

let transition = (animation: any, next: NextFunction) => {
    // Get the animation engine
    let engine = getEngine(animation);

    // If the engine is not found, skip the animation
    if (!engine) {
        logger(TRANSITION_ENGINE + ' ' + NOT_FOUND, animation);
        return;
    }

    // Set the `onComplete` callback for the animation
    if (!_animations.has(animation)) {
        engine.onComplete(animation, () => {
            // onComplete, call the `next` interceptor function
            _animations.get(animation)!();
        });
    }

    // Pass the `next` interceptor function to the `complete` callback
    _animations.set(animation, next);

    return engine;
}

/* The transition $in function should be with the `after` interceptor function */
export let $in = () => (animation: any, ctx: any = true, next: NextFunction = () => {}) => {

    // Prepare the transition
    let engine = transition(animation, next);

    // Reverse the animation
    if (engine && ctx) engine.reverse(animation, next);
    // Skip the animation
    else next();
}

/* The transition $out function should be with the `before` interceptor function */
export let $out = () => (animation: any, ctx: any = false, next: NextFunction = () => {}) => {

    // Skip the animation for the first time if the element is supposed to be removed
    if (!_animations.has(animation) && !ctx) next();

    // Prepare the transition
    let engine = transition(animation, next);

    // Skip the animation
    if (!engine || ctx) next();
    // Play the animation
    else engine.play(animation, next);
}

export let $animate = () => ($el: HTMLElement, options: ObjectType) => {

    let startPoint: ObjectType = {};
    let endPoint: ObjectType = {};

    if (OPACITY in options) {
        startPoint[OPACITY] = currentStyle($el, OPACITY);
        endPoint[OPACITY] = getValue(options[OPACITY], 0);
    }

    if (BLUR in options) {
        startPoint[FILTER] = currentStyle($el, FILTER);
        endPoint[FILTER] = BLUR + `(${getValue(options[BLUR], '8px')})`;
    }

    // Transform properties and their default values
    let transforms: [string, string|number][] = [['translate', '0,16px'], ['scale', .85], ['rotate', '25deg'], ['skew', '0,8deg'], ['perspective', '1000px']];

    for (let key in options) {
        let transform = transforms.find(([propName]) => has(key, propName));
        if (transform) {
            // If the property is not an exact match and the value is not provided, log an error
            // Example: 'translateX' is not an exact match for 'translate'. If a value is not provided, log an error because the default value can not be used
            if (transform[0] != key && !options[key])
                return logger(`The ${$ANIMATE} helper ${REQUIRE}s a ${VALUE} for the "${key}" property.`);

            // If the property doesn't exist, set it to an empty string
            if (!startPoint[TRANSFORM]) {
                startPoint[TRANSFORM] = '';
                endPoint[TRANSFORM] = '';
            }

            // Add the transform property to the start and end points
            startPoint[TRANSFORM] += currentStyle($el, TRANSFORM);
            endPoint[TRANSFORM] += key + `(${getValue(options[key], transform[1])})`;
        }
    }

    let opts: KeyframeAnimationOptions = {
        [DURATION]: 300,
        // Web Animations API easings are: 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'
        // Custom easing can be created with: 'steps(number, start|end)', 'cubic-bezier(x1, y1, x2, y2)'
        // Some custom easings can be found at: https://easings.net/
        [EASING]: 'ease-in-out',
        fill: 'forwards'
    };

    each([DURATION, EASING, 'delay', 'endDelay'], key => {
        if (key in options) opts[key as keyof KeyframeAnimationOptions] = options[key];
    });

    // Create the animation
    let animation = $el.animate([startPoint, endPoint], opts);

    // Pause the animation
    if (options[PAUSE]) animation[PAUSE]();

    return animation;
}


// Helper functions
export let getAnimateDuration = (animation: Animation) => {
    let effect = animation.effect;
    return effect ? Number(effect.getTiming()[DURATION]) : 0;
}

let currentStyle = ($el: HTMLElement, prop: any) => window[GET_COMPUTED_STYLE]($el)[prop];

let getValue = (value: any, defaultValue: string | number) => value || value === 0 ? value : defaultValue;