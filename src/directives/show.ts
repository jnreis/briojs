import { evalEffect, getFirstInsertedNode, getInsertedNodes, removeInsertedNodes, saveCleanup, saveToParent } from '../app';
import { has } from '../tools';
import { filter } from '../tools/array';
import { AFTER, B_SHOW, BEFORE, OPTIONS } from '../tools/constants';
import { createComment, insertNodes, nextFrame } from '../tools/dom';
import { newMap } from '../tools/object';
import { transitions } from './transition';

let hiddenNodes: Map<Node, BNode> = newMap();

/**
 * b-show is the same as b-if but the element is not dehydrated when the condition is false,
 * and is removed from the DOM by default.
 * 
 * Supports options/modifiers:
 * - `.display` (or `options.display`): uses CSS display: none instead of removing element from DOM.
 * 
 * Must reference a prop, method, or be an expression that returns a value that can be converted to a boolean
 */
let hydrateShow = (bnode: BNode, attrName: string, attrValue: string) => {

    let el = bnode.el as HTMLElement;

    // Options & modifiers
    let baseAttrName = attrName.split('.')[0];
    let dotModifiers = attrName.includes('.') ? attrName.split('.').slice(1) : [];
    let options: Record<string, any> = {
        ...(bnode[OPTIONS][baseAttrName] || {}),
        ...(bnode[OPTIONS][attrName] || {})
    };
    for (let mod of dotModifiers) {
        options[mod] = true;
    }

    let useDisplay = Boolean(options.display);

    // If using CSS display mode
    if (useDisplay) {
        let originalDisplay = el.style.display === 'none' ? '' : el.style.display;
        evalEffect(bnode, attrValue, (ctxFn: FunctionType) => {
            let value = ctxFn();
            el.style.display = value ? originalDisplay : 'none';
        });
        return;
    }

    // Default mode: remove from DOM while keeping hydrated
    // Create a placeholder comment node
    bnode.ph = createComment(attrName);

    // Hold the node's location with a placeholder
    insertNodes(getFirstInsertedNode(bnode), BEFORE, bnode.ph as Comment);
    saveToParent(bnode, bnode.el);

    // Transition function, if any
    let transition: FunctionType | undefined;
    let disposed = false;
    let frameCleanup: FunctionType | undefined;

    let hideNodes = () => {
        if (disposed) return;
        // Remove the inserted nodes
        removeInsertedNodes(bnode);

        // Mark this bnode as hidden
        hiddenNodes.set(bnode.ph as Comment, bnode);
    };

    saveCleanup(bnode, () => {
        disposed = true;
        frameCleanup?.();
        hiddenNodes.delete(bnode.ph as Comment);
    });

    // Evaluate the attribute value as an effect
    evalEffect(bnode, attrValue, (ctxFn: FunctionType) => {

        // Get the value
        let value = ctxFn();

        // Wait for the next tick.
        // * This is necessary for some directives to work properly (e.g. `on-click-outside`, `b-transition`, etc.)
        frameCleanup?.();
        frameCleanup = nextFrame(() => {
            frameCleanup = undefined;
            if (disposed) return;
            // Get the nodes to insert or remove
            let nodes = getInsertedNodes(bnode);

            // Get the transition function, if any
            transition = transitions.get(bnode.el);

            // Show the node(s)
            if (value) {
                // Reinstate the node(s) if they are hidden
                if (hiddenNodes.has(bnode.ph as Comment)) {
                    // Trigger the show effect for nested b-show directives
                    // This ensures that hidden nested b-show remain hidden
                    for (let node of nodes) {
                        if (hiddenNodes.has(node) && node !== bnode.ph) {
                            let nestedBnode = hiddenNodes.get(node)!;
    
                            let nestedHiddenNodes = getInsertedNodes(nestedBnode);
    
                            // Remove the hidden nodes from the `nodes` list, except the placeholder
                            nodes = filter(nodes, n => !has(nestedHiddenNodes, n) || n === nestedBnode.ph);
                        }
                    }
    
                    // Remove this bnode from the hidden nodes map
                    hiddenNodes.delete(bnode.ph as Comment);
    
                    // Insert the nodes after the placeholder
                    insertNodes(bnode.ph as any, AFTER, ...nodes);
                }

                // Play the transition in, if any
                if (transition) transition!(true);
            }

            // Hide the nodes(s) after transition out, if any
            else if (transition) transition(false, hideNodes);

            // Immediately hide the nodes if no transition
            else hideNodes();
        });
    });
}

export let showDirective: Directive = [/^(b-show|show)(\.[\w-]+)*$/, hydrateShow];