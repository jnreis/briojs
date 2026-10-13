import { evalEffect, saveCleanup, saveToParent, updateDataLevelContext } from "../app";
import { $DEHYDRATE, $HYDRATE, AFTER, ATTR, B_IF, REPLACE_WITH, SKIP, UNDEFINED } from "../tools/constants";
import { cloneNode, createComment, insertNodes, nextFrame } from "../tools/dom";
import { transitions } from "./transition";

/**
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
let hydrateIf = (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLElement;

    // Create a placeholder comment node
    bnode.ph = createComment(attrName);

    // Hold the node's location with a placeholder
    insertNodes(el, REPLACE_WITH, bnode.ph as Comment);

    // Interrupt the hydration process for the remaining directives and child nodes
    bnode[SKIP] = 3;

    // Ensure the element will go through the cleanup process
    saveToParent(bnode, el);

    let {n: newBNode} = bnode.bnode;

    // The hydrated copy of the element
    let hydratedBnode: BNode | undefined;

    // Transition function, if any
    let transition: FunctionType | undefined;
    let disposed = false;
    let revision = 0;
    let frameCleanup: FunctionType | undefined;

    saveCleanup(bnode, () => {
        disposed = true;
        revision++;
        frameCleanup?.();
    });

    // Dehydrate the element
    let dehydrate = () => {
        // Dehydrates and removes the element
        if (hydratedBnode)
            bnode.gc[$DEHYDRATE](hydratedBnode.el as HTMLElement);

        // Clear the reference
        hydratedBnode = UNDEFINED;
    }

    // Evaluate the attribute value as an effect
    evalEffect(bnode, attrValue, (ctxFn) => {
        // Get the value
        let value = ctxFn();
        let currentRevision = ++revision;

        // Wait for the next frame
        // * This is necessary for some directives to work properly (e.g. `on-click-outside`, `b-transition`, etc.)
        frameCleanup?.();
        frameCleanup = nextFrame(async () => {
            frameCleanup = undefined;
            if (disposed || currentRevision !== revision) return;
            // Add
            if (value) {
                if (!hydratedBnode) {
                    // Make a copy of the non-hydrated element
                    let elCopy = cloneNode(el) as HTMLElement;

                    // Insert the non-hydrated element after the placeholder
                    insertNodes(bnode.ph as any, AFTER, elCopy);

                    // Create a new bnode
                    hydratedBnode = newBNode(elCopy, el);
                    saveToParent(bnode, elCopy);

                    // Mark the hydratedBnode as a b-if copy
                    hydratedBnode[ATTR][B_IF] = '';

                    // Update the $slot and $ref objects
                    await updateDataLevelContext(hydratedBnode);
                    if (disposed || currentRevision !== revision) {
                        dehydrate();
                        return;
                    }

                    // Hydrate the element
                    await bnode.gc[$HYDRATE](elCopy, el);
                    if (disposed || currentRevision !== revision) {
                        dehydrate();
                        return;
                    }
                }

                // If there's a transition, play it
                transition = transitions.get(hydratedBnode.el);
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