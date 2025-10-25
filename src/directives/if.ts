import { saveToParent, updateDataLevelContext } from "../app";
import { $DEHYDRATE, $HYDRATE, AFTER, ATTR, B_IF, EVAL_EFFECT, OPTIONS, REPLACE_WITH, SKIP, UNDEFINED } from "../tools/constants";
import { cloneNode, createComment, insertNodes, nextFrame } from "../tools/dom";
import { B_TRANSITION_KEY } from "./transition";

/**
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
export let hydrateIf = (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLElement;

    // Create a placeholder comment node
    bnode.ph = createComment(attrName);

    // Hold the node's location with a placeholder
    insertNodes(el, REPLACE_WITH, bnode.ph);

    // Interrupt the hydration process for the remaining directives and child nodes
    bnode[SKIP] = 3;

    // Ensure the element will go through the cleanup process
    saveToParent(bnode, el);

    let [newBNode] = bnode.bnode;

    // The hydrated copy of the element
    let hydratedBnode: BNode | undefined;

    // Transition function, if any
    let transition: FunctionType | undefined;

    // Dehydrate the element
    let dehydrate = () => {
        // Dehydrates and removes the element
        bnode.gc[$DEHYDRATE](hydratedBnode!.el as HTMLElement);

        // Clear the reference
        hydratedBnode = UNDEFINED;
    }

    // Evaluate the attribute value as an effect
    bnode[EVAL_EFFECT](bnode, attrName, attrValue, () => (exp) => {
        // Get the value
        let value = exp();

        // Wait for the next tick.
        // * This is necessary for some directives to work properly (e.g. `on-click-outside`, `b-transition`, etc.)
        nextFrame(async () => {

            // Add
            if (value) {
                if (!hydratedBnode) {
                    // Make a copy of the non-hydrated element
                    let elCopy = cloneNode(el) as HTMLElement;

                    // Insert the non-hydrated element after the placeholder
                    insertNodes(bnode.ph as any, AFTER, elCopy);

                    // Create a new bnode
                    hydratedBnode = newBNode(elCopy, el);

                    // Mark the hydratedBnode as a b-if copy
                    hydratedBnode[ATTR][B_IF] = '';

                    // Update the $slots and $refs objects
                    await updateDataLevelContext(hydratedBnode);

                    // Hydrate the element
                    await bnode.gc[$HYDRATE](elCopy, el);

                    // Ensure the element copy will go through the cleanup process
                    saveToParent(bnode, elCopy);
                }

                // If there's a transition, play it
                transition = hydratedBnode[OPTIONS][B_TRANSITION_KEY];
                if (transition) transition(true);
            }
            // Remove existing copy
            else if (!value && hydratedBnode) {
                // Remove after the transition
                if (transition) transition(false, dehydrate);
                // Just remove
                else dehydrate();
            }
        });
    });
}

export let ifDirective: Directive = [B_IF, hydrateIf];