import { saveCleanup } from "../app";
import { logError, wait } from "../tools";
import { ATTR, B_, B_IF, B_SHOW, DELETE, DIRECTIVE, ELEMENT, END, INVALID__$CAP, MUST_BE, NODES, REMOVE, TARGET, TRANSITION } from "../tools/constants";
import { listen, nextFrame, delClass, setClass } from "../tools/dom";
import { hasProp, newMap, setProp } from "../tools/object";
import { isElementNode } from "../tools/typeCheck";

export let transitions = newMap() as Map<Node, FunctionType>;

export let hydrateTransition = (bnode: BNode, attrName: string, attrValue: string) => {

    // b-transition cannot be used with b-template
    if (bnode[NODES]) return;

    let _attrName = hasProp(bnode[ATTR], B_IF) ? B_IF : hasProp(bnode[ATTR], B_SHOW) ? B_SHOW : '';

    if (!_attrName)
        return logError('the', attrName, DIRECTIVE, MUST_BE, 'used with', B_IF, 'or', B_SHOW + '.');

    // Evaluate the animation expression
    let [inOptions, outOptions] = bnode.exec(bnode, attrValue)();

    // if (isArray(selectors) || size(selectors) == 2) {
    let transition = newTransition(bnode.el, inOptions, outOptions);

    // Save the transition function
    transitions.set(bnode.el, transition);

    // Save cleanup: stop listening to the transitionend event when the element is dehydrated
    saveCleanup(bnode, transition[REMOVE]);
    saveCleanup(bnode, () => transitions[DELETE](bnode.el));
}

export let transitionDirective: Directive = [B_+TRANSITION, hydrateTransition];

/**
 * Move the element towards the base position
 * @param el HTMLElement
 * @param oldPosition to clear
 * @param oldTransition to clear
 * @param fromPosition to come from
 * @param fromTransition to come from
 */
let toBase = (el: HTMLElement, oldPosition: string, oldTransition: string, fromPosition: string, fromTransition: string) => {
    // Delete old position and transition classes
    delClass(el, oldPosition, oldTransition, fromTransition);
    // Place the element at the starting position
    setClass(el, fromPosition);
    // Move the element to the base position with transition, on the next frame
    nextFrame(() => {
        setClass(el, fromTransition);
        delClass(el, fromPosition);
    });
}

/**
 * Move the element away from the base position
 * @param el HTMLElement
 * @param oldPosition to clear
 * @param oldTransition to clear
 * @param toPosition to go to
 * @param toTransition to go to
 */
let fromBase = (el: HTMLElement, oldPosition: string, oldTransition: string, toPosition: string, toTransition: string) => {
    // Delete old position and transition classes
    delClass(el, oldPosition, oldTransition);
    // Move the element to the end position with transition
    setClass(el, toPosition, toTransition);
}

let now = () => new Date().getTime();

let newTransition = (el: HTMLElement, inOptions: [string, string], outOptions: [string, string]) => {

    let [inPosition, inTransition] = inOptions;
    let [outPosition, outTransition] = outOptions;

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

    let READY = 1;
    let PLAYING = 2;
    let REVERSING = 3;
    let PLAYED = 4;

    /** 
     * Transition status:
     * 1. ready
     * 2. playing
     * 3. reversing
     * 4. played
     */
    let status = READY;

    // On run callback
    let ranAt = 0;

    let cleanTransitionRun = listen(el, TRANSITION+'run', (e: Event) => {
        // Make sure the event is for this element
        if (e[TARGET] === el) {
            ranAt = now();
        }
    });

    // On complete callback
    let _onEnd: FunctionType | undefined;

    // Reset the state on transition end
    let cleanTransitionEnd = listen(el, TRANSITION+END, (e: Event) => {

        // Make sure the event is for this element
        if (e[TARGET] === el) {

            if (status == PLAYING) {
                status = PLAYED;
            }
            else if (status == REVERSING) {
                status = READY;
            }

            // Call the _onEnd callback if provided
            if (_onEnd) _onEnd();
        }
    });

    let cleanup = () => {
        cleanTransitionRun();
        cleanTransitionEnd();
    }

    // Play the transition based on the current state
    let play = (context: any, onEnd?: FunctionType) => {

        // Set the _onEnd callback
        _onEnd = onEnd;

        let playAt = now();

        // Do nothing if already in the desired state
        // Played In or Played Out
        if ((context && isIn && status == PLAYED) || (!context && isIn === false && status == PLAYED)) return;

        // Play In
        if (context) {
            // Reverse the Out transition
            if (isIn === false && status == PLAYING) {
                status = REVERSING;
                toBase(el, inPosition, inTransition, outPosition, outTransition);
            }

            // Play in
            else {
                isIn = true;
                status = PLAYING;
                toBase(el, outPosition, outTransition, inPosition, inTransition);
            }
        }
        // Play Out
        else {
            // Place the element at the end position without transition
            if (isIn === null) {
                isIn = false;
                status = PLAYED;
                _onEnd && _onEnd();
            }

            // Reverse the In transition
            else if (isIn && status == PLAYING) {
                status = REVERSING;
                fromBase(el, outPosition, outTransition, inPosition, inTransition);
            }

            // Play out
            else {
                isIn = false;
                status = PLAYING;
                fromBase(el, inPosition, inTransition, outPosition, outTransition);
            }
        }

        // If the transition didn't start, call the onEnd callback
        wait(() => {
            if (ranAt < playAt && _onEnd) {
                _onEnd();
            }
        }, 50)
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
