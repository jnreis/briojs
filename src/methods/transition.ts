import { logError } from "../tools";
import { arrayAdd, each, every, findIndex } from "../tools/array";
import { NOT_FOUND, ON_COMPLETE, PAUSE, PLAY, REQUIRES, REVERSE, VALIDATE, VALUE, NAME, INVALID__$CAP, STYLE, NEW_LINE, ANIMATION, ENGINE__$CAP } from "../tools/constants";
import { getStyle } from "../tools/dom";
import { deleteKey, getKey, newMap } from "../tools/object";
import { lower, startsWith } from "../tools/string";

/** Animation Engines */
let animationEngines: AnimationEngine[] = [];

export let newTransitions = (): [PlayTransition, ReverseTransition] => {
    /**
     * Animations Map
     * Stores the `play` hook function for each animation
     * This function will be called when the animation is complete and ensures that the next hook is played
     */
    let _animations: Map<any, FunctionType> = newMap();

    /**
     * Get the animation engine and set the `onComplete` callback for the animation
     */
    let getEngine = (animation: any, play: FunctionType) => {
        // Get the animation engine
        let engine = animationEngines.find(engine => engine[VALIDATE](animation));

        if (engine) {
            // Set the `onComplete` callback for the animation
            // This callback will be called when the animation is complete at the start or end
            // This is only set once for each animation
            if (!_animations.has(animation)) {
                engine[ON_COMPLETE](animation, () => {
                    // onComplete, play the next hook
                    _animations.get(animation)!();
                });
            }

            // Save the `play` hook function to the `_animations` map
            // This function will be called when the animation is complete
            _animations.set(animation, play);

            return engine;
        }

        // If the engine is not found, skip the animation
        logError(ANIMATION, lower(ENGINE__$CAP), NOT_FOUND, NEW_LINE, animation);
    }

    return [
        /**
         * Plays the animation towards the end
         * 
         * When used with $hook, this function is usually called before the main hook function
         * 
         * This allows the animation to transition the element out of view
         */
        (animation: any, ctx: any = false, controls: HookControls) => {

            let play = getKey(controls, PLAY, () => {});
            let pause = getKey(controls, PAUSE, () => {});

            // Skip the animation for the first time if the element is supposed to be removed
            if (!_animations.has(animation) && !ctx) play();

            // Prepare the transition
            let engine = getEngine(animation, play);

            // Skip the animation
            if (!engine || ctx) play();
            // Play the animation
            else {
                // Pause the next hook
                pause();
                
                // Play the animation
                engine.play(animation, play);
            }
        },

        /**
         * Plays the animation towards the start (in reverse)
         * 
         * When used with hook, this function is usually called after the main hook function
         * 
         * This allows the animation to transition the element into view
         */
        (animation: any, ctx: any = true, controls: HookControls) => {

            let play = getKey(controls, PLAY, () => {});
            let pause = getKey(controls, PAUSE, () => {});

            // Prepare the transition
            let engine = getEngine(animation, play);

            // Reverse the animation
            if (engine && ctx) {
                // Pause the next hook
                pause();

                // Reverse the animation
                engine[REVERSE](animation, play);
            }
            // Skip the animation
            else play();
        }
    ];
}

export let addAnimationEngine = (engine: AnimationEngine) => {

    // Validate the engine properties
    if (!engine || !every([NAME, VALIDATE, PLAY, REVERSE, ON_COMPLETE], key => key in engine))
        logError(INVALID__$CAP, ANIMATION, lower(ENGINE__$CAP), engine ? engine[NAME] : '');

    else {
        // Check if the engine already exists
        let engineIndex = findIndex(animationEngines, item => item[NAME] == engine[NAME]);

        // Overwrite the engine
        if (engineIndex >= 0) animationEngines[engineIndex] = engine;
        // Add new engine
        else arrayAdd(animationEngines, engine);
    }
}


/** 
 * ! Experimental !
 * A thin wrapper around the Web Animations API that allows `opacity`, `blur`, and all `transforms`, as well as `duration`, `easing`, `delay`, `endDelay`, and `pause` properties
 */
export let $animate = () => ($el: HTMLElement, options: ObjectType) => {

    let startPoint: ObjectType = {};
    let endPoint: ObjectType = {};

    let opts: KeyframeAnimationOptions = {
        duration: 300,
        // Web Animations API easings are: 'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'
        // Custom easing can be created with: 'steps(number, start|end)', 'cubic-bezier(x1, y1, x2, y2)'
        // Some custom easings can be found at: https://easings.net/
        'easing': 'ease-in-out',
        fill: 'forwards'
    }

    // Update animation options, if provided
    each(['duration', 'easing', 'delay', 'endDelay'], key => {
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
        if (!(value || value === 0)) return logError(`The $animate helper ${REQUIRES} a ${VALUE} for the "${cssFn || cssProp}" property.`);

        // cssFn (e.g. 'translateX', 'rotate', 'blur', etc.)
        if (cssFn) value = cssFn + `(${value})`;

        // Save the start point for the property (only once)
        if (!(cssProp in startPoint)) startPoint[cssProp] = getStyle($el)[cssProp as any];

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
        'blur', 'brightness', 'contrast', 'grayscale', 'hue-rotate', 'saturate', 'sepia'
    ];

    // Shorthand properties
    for (let option in options) {
        let cssFn = cssFns.find(cssFn => startsWith(option, cssFn));
        if (cssFn) {
            let cssProp = cssFns.indexOf(cssFn) < 5 ? 'transform' : 'filter';
            let value = options[option];

            // Save value
            saveValue(cssProp, value, option);
        }
    }

    // Other properties
    for (let cssProp in options) {
        let value = options[cssProp];

        // Check if the property is a valid CSS property
        if (cssProp in $el[STYLE]) {
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