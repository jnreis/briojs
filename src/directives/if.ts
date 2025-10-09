import { saveToParent } from "../app";
import { wait } from "../tools";
import { AFTER, ATTR, B_IF, DEHYDRATE, EVAL_EFFECT, HYDRATE, OPTIONS, REPLACE_WITH, SKIP, UNDEFINED } from "../tools/constants";
import { cloneNode, createComment, insertNodes } from "../tools/dom";
import { B_TRANSITION_KEY } from "./transition";

/**
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
export let hydrateIf = (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLElement;
    let originalElement = cloneNode(el) as HTMLElement;

    // Hold the node's location with a placeholder
    bnode.ph = createComment(attrName);
    insertNodes(el, REPLACE_WITH, bnode.ph);

    // Interrupt the hydration process
    bnode[SKIP] = 3;

    // Ensure the element will go through the cleanup process
    saveToParent(bnode, el);

    let [newBNode] = bnode.bnode;

    // The hydrated copy
    let _bnode: BNode | undefined;
    let _transition: FunctionType | undefined;
    let _remove = () => {
        // Dehydrates and removes the element
        bnode[DEHYDRATE](_bnode!.el as HTMLElement);

        // Clear the reference
        _bnode = UNDEFINED;
    }

    // Evaluate the attribute value as an effect
    bnode[EVAL_EFFECT](bnode, attrName, attrValue, () => (call) => {
        // Get the value
        let value = call();

        // Wait for the next tick.
        // * This is necessary for some directives to work properly (e.g. `on-click-outside`, `b-transition`, etc.)
        wait(() => {

            // Add
            if (value) {
                if (!_bnode) {
                    // Make a copy of the non-hydrated element
                    let elCopy = cloneNode(originalElement) as HTMLElement;

                    // Insert the non-hydrated element after the placeholder
                    insertNodes(bnode.ph as any, AFTER, elCopy);

                    // Create a new bnode
                    _bnode = newBNode(elCopy, el);

                    // Mark the _bnode as a b-if copy
                    _bnode[ATTR][B_IF] = '';

                    // Hydrate the element
                    bnode[HYDRATE](elCopy, el);

                    // Ensure the element copy will go through the cleanup process
                    saveToParent(bnode, elCopy);
                }

                // If there's a transition, play it
                _transition = _bnode[OPTIONS][B_TRANSITION_KEY];
                if (_transition) _transition(true);
            }
            // Remove existing copy
            else if (!value && _bnode) {
                // Remove after the transition
                if (_transition) _transition(false, _remove);
                // Just remove
                else _remove();
            }
        });
    });
}

export let ifDirective: Directive = [B_IF, hydrateIf];