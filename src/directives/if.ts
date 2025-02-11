import { wait } from "../tools";
import { B_IF, EVAL_EFFECT, REMOVE } from "../tools/constants";
import { getParent, restorePosition } from "../tools/dom";

/**
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
export let hydrateIf = (vnode: VNode, attrName: string, attrValue: string) => {

    // Evaluate the attribute value as an effect
    vnode[EVAL_EFFECT](vnode, attrName, attrValue, (node: HTMLElement) => {

        // Cache the node position: parent node, sibling nodes before and after
        let parent = getParent(node);
        let insertClosest = restorePosition(node)!;

        // Return the watch function
        return (call) => {
            // Get the value
            let value = call();

            // Wait for the next tick.
            // * This is necessary for some directives to work properly (e.g. `on-click-outside`)
            wait(() => {
                // Add
                if (value) insertClosest();
                // Remove
                else {
                    let _parent = getParent(node);
                    if (_parent) {
                        // Recache the node position
                        if (_parent != parent) {
                            parent = _parent;
                            insertClosest = restorePosition(node)!;
                        }
                        // Remove the node
                        node[REMOVE]();
                    }
                }
            });
        }
    });
}

export let ifDirective: Directive = [B_IF, hydrateIf];