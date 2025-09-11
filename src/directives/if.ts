import { wait } from "../tools";
import { find } from "../tools/array";
import { B_IF, BEFORE, DEHYDRATE, EVAL_EFFECT, HYDRATE, REPLACE_WITH, SKIP } from "../tools/constants";
import { cloneNode, createComment, getParent, insertNodes } from "../tools/dom";

/**
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
export let hydrateIf = (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLElement;
    let originalElement = cloneNode(el) as HTMLElement;

    // Placeholder
    bnode.ph = createComment(attrName);

    // Replace the element with the placeholder
    insertNodes(el, REPLACE_WITH, bnode.ph);

    // Interrupt the hydration process
    bnode[SKIP] = true;

    let elCopy: HTMLElement | undefined;

    // Evaluate the attribute value as an effect
    bnode[EVAL_EFFECT](bnode, attrName, attrValue, () => {

        // Return the watch function
        return (call) => {
            // Get the value
            let value = call();

            // Wait for the next tick.
            // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
            wait(() => {
                // Add
                if (value) {
                    // Make a copy of the non-hydrated element
                    elCopy = cloneNode(originalElement) as HTMLElement;

                    bnode.nodes = [elCopy];

                    // Replace the element or placeholder with the non-hydrated element
                    insertNodes(bnode.ph as any, REPLACE_WITH, elCopy);

                    // Hydrate the element
                    bnode[HYDRATE](elCopy, el);
                }
                // Remove existing copy
                else if (elCopy) {
                    let bnodeCopy = bnode.bnodes.get(elCopy) as BNode;

                    // Find the top node of the copy available in the DOM
                    let topNode = find(bnodeCopy.nodes || [elCopy], n => getParent(n));

                    // Place the placeholder in the DOM
                    if (topNode) insertNodes(topNode, BEFORE, bnode.ph!);

                    // TODO: make sure to delete any b-ref and b-uid associated with the removed nodes

                    bnode[DEHYDRATE](elCopy);
                }
            });
        }
    });
}

export let ifDirective: Directive = [B_IF, hydrateIf];