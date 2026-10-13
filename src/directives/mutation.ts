import { saveCleanup } from "../app";
import { debounce, size } from "../tools";
import { filter } from "../tools/array";
import { DISCONNECT, OBSERVE, OPTIONS, DEBOUNCE, ON_, B_, TARGET, NODES, UNDEFINED } from "../tools/constants";
import { getProp } from "../tools/object";


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

    let baseAttrName = attrName.split('.')[0];
    let dotModifiers = attrName.includes('.') ? attrName.split('.').slice(1) : [];
    let options: ObjectType = {
        ...(bnode[OPTIONS][baseAttrName] || {}),
        ...(bnode[OPTIONS][attrName] || {})
    };
    for (let mod of dotModifiers) {
        options[mod] = true;
    }

    // Set up observer options
    let observerOptions: ObjectType = {
        [mutationType]: true
    };

    // Get the mutation options related to the specific mutation type: childList, attributes, or characterData
    for (let key in mutationOptions) {
        observerOptions[key] = key in options ? options[key] : mutationOptions[key];
    }

    // Evaluate the expression
    let expFn = bnode.exec(bnode, attrValue, "$mutations", false);

    let pendingMutations: MutationRecord[] = [];
    let debouncedExpFn = debounce(() => {
        let batch = pendingMutations;
        pendingMutations = [];
        expFn(batch);
    }, getProp(options, DEBOUNCE, 100));

    let observer = new MutationObserver(mutations => {

        // Filter mutations by type
        mutations = filterMutations(mutationType, mutationFilter, mutations);

        // Execute the expression
        if (size(mutations)) {
            pendingMutations.push(...mutations);
            debouncedExpFn();
        }
    });

    // Observe the element
    observer[OBSERVE](options[TARGET] || bnode.el, observerOptions);

    // Save the cleanup function
    saveCleanup(bnode, () => {
        observer[DISCONNECT]();
        debouncedExpFn.cancel();
        pendingMutations = [];
    });
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
    [/^(b-on-addednodes|on-addednodes)(\.[\w-]+)*$/, hydrateMutationAdd],
    [/^(b-on-removednodes|on-removednodes)(\.[\w-]+)*$/, hydrateMutationRemove],
    [/^(b-on-attrs|on-attrs)(\.[\w-]+)*$/, hydrateMutationAttrs],
    [/^(b-on-text|on-text)(\.[\w-]+)*$/, hydrateMutationText],
];