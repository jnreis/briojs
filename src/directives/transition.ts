import { saveCleanup } from "../app";
import { logError, size, uid } from "../tools";
import { ATTR, B_, B_IF, B_SHOW, DIRECTIVE, ELEMENT, END, INVALID__$CAP, MUST_BE, OPTIONS, REMOVE, SELECT, STYLE, TARGET, TRANSITION } from "../tools/constants";
import { delStyleProps, getStylesFromSelector, getDeclaredStyles, listen, nextFrame, setStyleProps, splitTransitionStyles } from "../tools/dom";
import { hasProp, setProp } from "../tools/object";
import { isArray, isElementNode } from "../tools/typeCheck";

export let B_TRANSITION_KEY = uid();

export let hydrateTransition = (bnode: BNode, attrName: string, attrValue: string) => {

    let _attrName = hasProp(bnode[ATTR], B_IF) ? B_IF : hasProp(bnode[ATTR], B_SHOW) ? B_SHOW : '';

    if (!_attrName)
        return logError('the', attrName, DIRECTIVE, MUST_BE, 'used with', B_IF, 'or', B_SHOW + '.');

    // Evaluate the animation expression
    let selectors = bnode.exec(bnode, attrValue)();

    if (isArray(selectors) || size(selectors) == 2) {
        let transition = newTransition(bnode.el, ...selectors as [string, string]);
        bnode[OPTIONS][B_TRANSITION_KEY] = transition;

        // Save cleanup: stop listening to the transitionend event when the element is dehydrated
        saveCleanup(bnode, transition[REMOVE]);
    }
}

export let transitionDirective: Directive = [B_+TRANSITION, hydrateTransition];

let newTransition = (el: HTMLElement, inSelector: string, outSelector: string) => {

    // Make sure the element exists
    if (!isElementNode(el))
        return logError(INVALID__$CAP, TRANSITION, ELEMENT, el);

    /**
     * Current transition:
     * - in: true
     * - out: false
     * - none: null
     */
    let isIn: boolean | null = null;

    /** 
     * Transition status:
     * - ready
     * - playing
     * - reversing
     * - played
     */
    let READY = 1;
    let PLAYING = 2;
    let REVERSING = 3;
    let PLAYED = 4;
    let status = READY;

    /** Disable transitions */
    let noTransition: StyleProps = {
        [TRANSITION]: ['none', 'important']
    };

    // Get initial inline styles to restore later
    let initialStyles = getDeclaredStyles(el[STYLE]);

    // Get styles from classes
    let inStyles: StyleProps, 
        inTransition: StyleProps, 
        inPosition: StyleProps,

        outStyles: StyleProps, 
        outTransition: StyleProps, 
        outPosition: StyleProps;

    let updateClassStyles = () => {
        inStyles = getStylesFromSelector(inSelector) as StyleProps;
        outStyles = getStylesFromSelector(outSelector) as StyleProps;

        // Make sure both selectors returned some styles
        if (!inStyles || !outStyles)
            return logError(INVALID__$CAP, TRANSITION, SELECT+'ors:', `'${inSelector}' and '${outSelector}'`, MUST_BE, 'valid CSS', SELECT+'ors.');

        [inTransition, inPosition] = splitTransitionStyles(inStyles);
        [outTransition, outPosition] = splitTransitionStyles(outStyles);
    }

    // On complete callback
    let _onEnd: FunctionType | undefined;

    // Reset the state on transition end
    let cleanup = listen(el, TRANSITION+END, (e: Event) => {

        // Make sure the event is for this element
        if (e[TARGET] === el) {

            if (status == PLAYING) {
                status = PLAYED;
                // Remove all IN styles after arriving at the base position
                if (isIn) {
                    delStyleProps(el, inStyles);
                    // Restore initial styles
                    setStyleProps(el, initialStyles);
                }
            }
            else if (status == REVERSING) {
                status = READY;
                if (!isIn) {
                    // Remove all OUT styles after arriving at the base position
                    delStyleProps(el, outStyles);
                    // Restore initial styles
                    setStyleProps(el, initialStyles);
                }
            }

            // Call the _onEnd callback if provided
            if (_onEnd) _onEnd();
        }
    });

    // Play the transition based on the current state
    let play = (context: any, onEnd?: FunctionType) => {

        // Set the _onEnd callback
        _onEnd = onEnd;

        // Do nothing if already in the desired state
        // Played In or Played Out
        if ((context && isIn && status == PLAYED) || (!context && isIn === false && status == PLAYED)) return;

        // Update styles in case they changed
        updateClassStyles();

        // Play In
        if (context) {
            // Play from the start position to the base position
            if (isIn === null || (isIn && status == READY) || (isIn === false && status == PLAYED)) {
                isIn = true;
                status = PLAYING;
                // Place the element at the start IN position without transition
                delStyleProps(el, outStyles, inTransition);
                setStyleProps(el, inPosition, noTransition);
                nextFrame(() => {
                    // This will trigger the IN transition
                    delStyleProps(el, inPosition, noTransition);
                    setStyleProps(el, inTransition);
                });
            }
            // Reverse the OUT transition and go back to the base position
            else if (!isIn && status == PLAYING) {
                status = REVERSING;
                delStyleProps(el, outPosition);
                setStyleProps(el, outTransition);
            }
            // Cancel the reversing of the IN transition and go back to the base position
            else if (isIn && status == REVERSING) {
                status = PLAYING;
                delStyleProps(el, inPosition);
                setStyleProps(el, inTransition);
            }
        }
        // Play Out
        else {
            // Place it at the end position without transition
            if (isIn === null) {
                isIn = false;
                status = PLAYED;
                delStyleProps(el, inStyles, outTransition);
                setStyleProps(el, outPosition, noTransition);
                nextFrame(() => {
                    delStyleProps(el, noTransition);
                    _onEnd && _onEnd();
                });
            }

            // Play Out from the base position to the end position
            if ((!isIn && status == READY) || (isIn && status == PLAYED)) {
                isIn = false;
                status = PLAYING;
                // Place the element at the start position without transition
                delStyleProps(el, inStyles);
                setStyleProps(el, noTransition);
                nextFrame(() => {
                    // This will trigger the OUT transition
                    delStyleProps(el, noTransition);
                    setStyleProps(el, outStyles);
                });
            }

            // Reverse the IN transition back to its start position
            else if (isIn && status == PLAYING) {
                status = REVERSING;
                setStyleProps(el, inStyles);
            }

            // Cancel the reversing of the OUT transition and play it to the end position
            else if (!isIn && status == REVERSING) {
                status = PLAYING;
                setStyleProps(el, outStyles);
            }
        }
    }

    // Attach the cleanup function to the play function
    setProp(play, REMOVE, cleanup);

    return play;
}

// let parseTimes = (timeStr: string): number[] => filter(map(split(timeStr, ','), item => {
//     let matched = match(trim(item), /^(-?\d*\.?\d+)(ms|s)/);
//     if (matched) {
//         let [_, value, unit] = matched;
//         return toNumber(value) * (unit == 's' ? 1000 : 1)
//     }
// }), item => item);

// let getTransitionDuration = (transitionProps: StyleProps): number => {
//     let total = 0;

//     each(['duration', 'delay'], prop => {
//         let key = TRANSITION+'-'+prop;
//         if (transitionProps[key]) {
//             total += M.max(...parseTimes(transitionProps[key][0]), 0);
//         }
//     });

//     return total;
// }

// let splitTransitionProps = (styleProps: Record<string, string>): [StyleProps, StyleProps] => {

//     let _IMPORTANT = '!' + IMPORTANT as '!important';

//     let transitionProps: StyleProps = {};
//     let otherProps: StyleProps = {};

//     for (let prop in styleProps) {
//         let priority = has(styleProps[prop], _IMPORTANT) ? IMPORTANT : '';
//         let value = trim(replace(styleProps[prop], _IMPORTANT, ''));

//         // Separate transition properties from other style properties
//         (startsWith(prop, TRANSITION) ? transitionProps : otherProps)[prop] = [value, priority];
//     }

//     return [transitionProps, otherProps];
// }
