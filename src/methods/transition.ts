import { logger } from "../tools";
import { each } from "../tools/array";
import { $ANIMATE, BLUR, COMPLETE, CURRENT_TIME, DURATION, EASING, EVENT_CALLBACK, FILTER, GET_COMPUTED_STYLE, NAME, NOT_FOUND, ON_COMPLETE, PAUSE, PLAY, PLAYBACK_RATE, REQUIRE, REVERSE, REVERSED, TRANSFORM, TRANSITION_ENGINE, VALIDATE, VALUE } from "../tools/constants";
import { deleteKey, hasOwnProperty } from "../tools/object";
import { camelCase, startsWith } from "../tools/string";

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
];

/** ANIMATION CONTROLS */
let _animations: Map<any, NextFunction> = new Map();

export let getEngine = (animation: any) => _engines.find(engine => engine[VALIDATE](animation));

/* The transition $in function should be with the `after` interceptor function */
export let $in = () => (animation: any, ctx: any = true, next: NextFunction = () => {}) => {

    // Prepare the transition
    let engine = prepTransition(animation, next);

    // Reverse the animation
    if (engine && ctx) engine[REVERSE](animation, next);
    // Skip the animation
    else next();
}

/* The transition $out function should be with the `before` interceptor function */
export let $out = () => (animation: any, ctx: any = false, next: NextFunction = () => {}) => {

    // Skip the animation for the first time if the element is supposed to be removed
    if (!_animations.has(animation) && !ctx) next();

    // Prepare the transition
    let engine = prepTransition(animation, next);

    // Skip the animation
    if (!engine || ctx) next();
    // Play the animation
    else engine.play(animation, next);
}

/** A thin wrapper around the Web Animations API that allows `opacity`, `blur`, and all `transforms`, as well as `duration`, `easing`, `delay`, `endDelay`, and `pause` properties */
export let $animate = () => ($el: HTMLElement, options: ObjectType) => {

    let startPoint: ObjectType = {};
    let endPoint: ObjectType = {};

    let opts: KeyframeAnimationOptions = {
        [DURATION]: 300,
        // Web Animations API easings are: 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'
        // Custom easing can be created with: 'steps(number, start|end)', 'cubic-bezier(x1, y1, x2, y2)'
        // Some custom easings can be found at: https://easings.net/
        [EASING]: 'ease-in-out',
        fill: 'forwards'
    };

    // Update animation options, if provided
    each([DURATION, EASING, 'delay', 'endDelay'], key => {
        if (key in options) {
            opts[key as keyof KeyframeAnimationOptions] = options[key];
            deleteKey(options, key);
        }
    });

    // Convenience mappings. Allows the use of the "alias" property directly in the options
    each([['hue', 'hue-rotate']], ([alias, name]) => {
        if (alias in options) {
            options[name] = options[alias];
            deleteKey(options, alias);
        }
    });

    let saveValue = (cssProp: string, value: any, cssFn: string = '') => {
        // If the property is not an exact match and the value is not provided, log an error
        // Example: 'translateX' is not an exact match for 'translate'. If a value is not provided, log an error because the default value can not be used
        if (!(value || value === 0)) return logger(`The ${$ANIMATE} helper ${REQUIRE}s a ${VALUE} for the "${cssFn || cssProp}" property.`);

        // cssFn (e.g. 'translateX', 'rotate', 'blur', etc.)
        if (cssFn) value = cssFn + `(${value})`;

        // Save the start point for the property (only once)
        if (!(cssProp in startPoint)) startPoint[cssProp] = window[GET_COMPUTED_STYLE]($el)[cssProp as any];

        // Save the function value to the end point
        endPoint[cssProp] = (cssProp in endPoint) ? endPoint[cssProp] + ' ' + value : value;

        // Remove the property from the options
        deleteKey(options, cssFn || cssProp);
    }

    // Shorthand for some commonly animated properties that can take multiple values
    // Values with misleading names (e.g. invert), or that have equivalent CSS property (e.g. drop-shadow, opacity), or uncommon (e.g. url()) are not included.
    // Values that are not included can be added without the shorthand and will be merged with the shorthand values
    let cssFns: string[] = [
        // transform indexes: 0-4
        'translate', 'scale', 'rotate', 'skew', 'perspective',
        // filter indexes: 5-10
        BLUR, 'brightness', 'contrast', 'grayscale', 'hue-rotate', 'saturate', 'sepia'
    ];

    // Shorthand properties
    for (let option in options) {
        let cssFn = cssFns.find(cssFn => startsWith(option, cssFn));
        if (cssFn) {
            let cssProp = cssFns.indexOf(cssFn) < 5 ? TRANSFORM : FILTER;
            let value = options[option];

            // Save value
            saveValue(cssProp, value, option);
        }
    }

    // Other properties
    for (let cssProp in options) {
        let value = options[cssProp];

        // Check if the property is a valid CSS property
        if (cssProp in $el.style) {
            // Save value
            saveValue(cssProp, value);
        }
    }

    // Create the animation
    let animation = $el.animate([startPoint, endPoint], opts);

    // Pause the animation, if the `pause` property is provided
    if (options[PAUSE]) animation[PAUSE]();

    return animation;
}


// HELPER FUNCTIONS

/** Prepare the transition */
let prepTransition = (animation: any, next: NextFunction) => {
    // Get the animation engine
    let engine = getEngine(animation);

    // If the engine is not found, skip the animation
    if (!engine) {
        logger(TRANSITION_ENGINE + ' ' + NOT_FOUND, animation);
        return;
    }

    // Set the `onComplete` callback for the animation
    if (!_animations.has(animation)) {
        engine[ON_COMPLETE](animation, () => {
            // onComplete, call the `next` interceptor function
            _animations.get(animation)!();
        });
    }

    // Pass the `next` interceptor function to the `complete` callback
    _animations.set(animation, next);

    return engine;
}

/** Get the duration of the animation (Web Animations API) */
export let getAnimateDuration = (animation: Animation) => {
    let effect = animation.effect;
    return effect ? Number(effect.getTiming()[DURATION]) : 0;
}