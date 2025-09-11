import { logWarn } from "../tools";
import { B_TEMPLATE, BEFORE, INNER_HTML, INSERT, INVALID__$CAP, TEMPLATE, VALUE } from "../tools/constants";
import { removeNode } from "../tools/dom";
import { isString } from "../tools/typeCheck";
import { updateDataLevelContext } from "./context";

export let hydrateTemplate = async (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el;

    // Evaluate the attribute value, if it does not match a saved template
    let template = attrValue ? bnode[TEMPLATE][attrValue] || bnode.exec(bnode, attrValue)() : el[INNER_HTML];

    let [setHook, playHook] = bnode.hook;

    // Set the hook
    setHook(el, attrName, async () => {

        // Hydrate HTML content
        if (isString(template)) {

            // Insert and hydrate the template content
            await bnode[INSERT](template, BEFORE, el, {
                then: (insertedNodes: Node[]) => {
                    // The nodes that were inserted
                    bnode.nodes = insertedNodes;
                }
            });

            // Remove the wrapper element
            removeNode(el);

            // Update the $refs and $slots objects
            await updateDataLevelContext(bnode);
        }
        else logWarn(attrName + ':', INVALID__$CAP, VALUE, '\n', template);
    });

    // Play the hook
    await playHook(el, attrName);
}

export let templateDirective: Directive = [B_TEMPLATE, hydrateTemplate];