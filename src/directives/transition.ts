import { saveCleanup } from "../app";
import { logError, wait } from "../tools";
import { ATTR, B_, B_IF, B_SHOW, DELETE, DIRECTIVE, ELEMENT, END, INVALID__$CAP, MUST_BE, NODES, OBJECT, REMOVE, STYLE, TARGET, TRANSITION } from "../tools/constants";
import { listen, nextFrame, getDeclaredStyles, splitTransitionStyles, delStyleProps, setStyleProps } from "../tools/dom";
import { hasProp, newMap, setProp } from "../tools/object";
import { isArray, isElementNode, isObject } from "../tools/typeCheck";

export let transitions = newMap() as Map<Node, FunctionType>;

let hydrateTransition = (bnode: BNode, attrName: string, attrValue: string) => {

    // b-transition cannot be used with b-template
    if (bnode[NODES]) return;

    let _attrName = hasProp(bnode[ATTR], B_IF) ? B_IF : hasProp(bnode[ATTR], B_SHOW) ? B_SHOW : '';

    if (!_attrName)
        return logError('the', attrName, DIRECTIVE, MUST_BE, 'used with', B_IF, 'or', B_SHOW + '.');

    // Evaluate the animation expression
    let styles = bnode.exec(bnode, attrValue)();

    // Just one object for both in and out styles
    if (!isArray(styles)) styles = [styles];

    // Get in and out styles
    let [inStyles, outStyles] = styles;

    // Make sure inStyles is an object
    if (!isObject(inStyles))
        return logError('the', attrName, MUST_BE, 'an', OBJECT + '.');

    // If outStyles is not an object, use inStyles as outStyles
    if (!isObject(outStyles))
        outStyles = inStyles;

    // Create a new transition for the element
    let transition = newTransition(bnode.el, inStyles, outStyles);

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
let toBase = (el: HTMLElement, oldStyles: StyleProps, fromStyles: StyleProps, disableTransition?: boolean) => {

    let [oldTransition, oldPosition] = splitTransitionStyles(oldStyles);
    let [fromTransition, fromPosition] = splitTransitionStyles(fromStyles);

    // Delete old position and transition classes
    delStyleProps(el, oldPosition, oldTransition, fromTransition);
    // Place the element at the starting position without transition
    setStyleProps(el, fromPosition, disableTransition ? {[TRANSITION]: 'none'} : {});
    // Move the element to the base position with transition, on the next frame
    return nextFrame(() => {
        setStyleProps(el, fromTransition);
        delStyleProps(el, fromPosition);
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
let fromBase = (el: HTMLElement, oldStyles: StyleProps, toStyles: StyleProps) => {

    let [oldTransition, oldPosition] = splitTransitionStyles(oldStyles);
    let [toTransition, toPosition] = splitTransitionStyles(toStyles);

    // Delete old position and transition classes
    delStyleProps(el, oldPosition, oldTransition);
    // Move the element to the end position with transition
    setStyleProps(el, toPosition, toTransition);
}

let now = () => new Date().getTime();

let newTransition = (el: HTMLElement, inStyles: StyleProps, outStyles: StyleProps) => {

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

    // Get initial inline styles to restore later
    let initialStyles = getDeclaredStyles(el[STYLE]);

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
    let playVersion = 0;

    let finishTransition = () => {
        if (status == PLAYING) status = PLAYED;
        else if (status == REVERSING) status = READY;

        delStyleProps(el, inStyles, outStyles);
        setStyleProps(el, initialStyles);

        let onEnd = _onEnd;
        _onEnd = undefined;
        if (onEnd) onEnd();
    }

    let cleanTransitionEnd = listen(el, TRANSITION+END, (e: Event) => {
        if (e[TARGET] === el) finishTransition();
    });
    let cleanTransitionCancel = listen(el, TRANSITION+'cancel', (e: Event) => {
        if (e[TARGET] === el && status == PLAYING) finishTransition();
    });
    let frameCleanup: FunctionType | undefined;

    let cleanup = () => {
        frameCleanup?.();
        cleanTransitionRun();
        cleanTransitionEnd();
        cleanTransitionCancel();
    }

    // Play the transition based on the current state
    let play = (context: any, onEnd?: FunctionType) => {

        // Set the _onEnd callback
        _onEnd = onEnd;

        let playAt = now();
        let currentPlay = ++playVersion;

        // Do nothing if already in the desired state
        // Played In or Played Out
        if ((context && isIn && status == PLAYED) || (!context && isIn === false && status == PLAYED)) return;

        // Play In
        if (context) {
            // Reverse the Out transition
            if (isIn === false && status == PLAYING) {
                status = REVERSING;
                frameCleanup?.();
                frameCleanup = toBase(el, inStyles, outStyles);
            }

            // Play in
            else {
                frameCleanup?.();
                frameCleanup = toBase(el, outStyles, inStyles, status == READY);
                isIn = true;
                status = PLAYING;
            }
        }
        // Play Out
        else {
            // Place the element at the end position without transition
            if (isIn === null) {
                isIn = false;
                status = PLAYED;
                let onEnd = _onEnd;
                _onEnd = undefined;
                if (onEnd) onEnd();
            }

            // Reverse the In transition
            else if (isIn && status == PLAYING) {
                status = REVERSING;
                fromBase(el, outStyles, inStyles);
            }

            // Play out
            else {
                isIn = false;
                status = PLAYING;
                fromBase(el, inStyles, outStyles);
            }
        }

        // If the transition didn't start, call the onEnd callback
        wait(() => {
            if (playVersion === currentPlay && ranAt < playAt && _onEnd)
                finishTransition();
        }, 50)
    }

    // Attach the cleanup function to the play function
    setProp(play, REMOVE, cleanup, 'wce');

    return play;
}