import { saveCleanup } from "../app";
import { debounce, size } from "../tools";
import { filter } from "../tools/array";
import { DISCONNECT, OBSERVE, OPTIONS, DEBOUNCE, ON_, B_, TARGET, NODES, UNDEFINED } from "../tools/constants";


/**
 * Hydrate the "mutation" directives
 * 
 * @option `debounce`   The time in milliseconds to wait before executing the callback.
 * @option `target`     The target element to observe. If not provided, the element being hydrated will be observed.
 * @option `subtree`    If true, the observer will also observe mutations in the subtree of the element.
 * 
 * @option `attributeOldValue` If true, the observer will record the previous value of the attribute. Default is true. Only applicable for on-attrs.
 * @option `attributeFilter`   An array of attribute names to observe. If not provided, all attributes will be observed. Only applicable for on-attrs.
 * 
 * @option `characterDataOldValue` If true, the observer will record the previous value of the character data. Default is true. Only applicable for on-text.
 */
let hydrateMutationType = (mutationType: MutationRecordType, mutationOptions: ObjectType, mutationFilter: FunctionType) => (bnode: BNode, attrName: string, attrValue: string) => {

    let options = bnode[OPTIONS][attrName] || {};

    // Set up observer options
    let observerOptions: ObjectType = {
        [mutationType]: true
    };

    mutationOptions.subtree = false;
    
    // Get the mutation options related to the specific mutation type: childList, attributes, or characterData
    for (let key in mutationOptions) {
        observerOptions[key] = options[key] || mutationOptions[key];
    }

    // Evaluate the expression
    let expFn = bnode.exec(bnode, attrValue, "$mutations", false);

    let debouncedExpFn = debounce(expFn, options[DEBOUNCE] || 100);

    let observer = new MutationObserver(mutations => {

        // Filter mutations by type
        mutations = filterMutations(mutationType, mutationFilter, mutations);

        // Execute the expression
        if (size(mutations)) debouncedExpFn(mutations);
    });

    // Observe the element
    observer[OBSERVE](options[TARGET] || bnode.el, observerOptions);

    // Save the cleanup function
    saveCleanup(bnode, () => observer[DISCONNECT]());
};

// Helper to filter mutation records by type
let filterMutations = (mutationType: MutationRecordType, mutationFilter: FunctionType, mutations: MutationRecord[]) =>
    filter(mutations, m => m.type === mutationType && mutationFilter(m)) as MutationRecord[];

// Hydration for node added
let hydrateMutationAdd = hydrateMutationType(
    'childList',
    {},
    m => size(m.addedNodes)
);

// Hydration for node removed
let hydrateMutationRemove = hydrateMutationType(
    'childList',
    {},
    m => size(m.removedNodes)
);

// Hydration for attribute changes
let hydrateMutationAttrs = hydrateMutationType(
    'attributes',
    { attributeOldValue: true, attributeFilter: UNDEFINED },
    () => true
);

// Hydration for text changes
let hydrateMutationText = hydrateMutationType(
    'characterData',
    { characterDataOldValue: true },
    () => true
);

let ON_ADDED_NODES = ON_+"added"+NODES;
let ON_REMOVED_NODES = ON_+"removed"+NODES;
let ON_ATTRS = ON_+"attrs";
let ON_TEXT = ON_+"text";

export let mutationDirectives: Directive[] = [
    [ON_ADDED_NODES, hydrateMutationAdd],
    [B_+ON_ADDED_NODES, hydrateMutationAdd],

    [ON_REMOVED_NODES, hydrateMutationRemove],
    [B_+ON_REMOVED_NODES, hydrateMutationRemove],

    [ON_ATTRS, hydrateMutationAttrs],
    [B_+ON_ATTRS, hydrateMutationAttrs],

    [ON_TEXT, hydrateMutationText],
    [B_+ON_TEXT, hydrateMutationText],
];