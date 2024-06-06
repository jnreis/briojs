import { addComponent } from './component';
import { addProps } from './props';
import { addMethod } from './method';
import { addDirective } from "./directive";
import { addTransitionEngine } from "./transition";

import { state, computed, removeComputed, effect, watch, storage, isStorage, getItem, setItem } from "../reactivity";
import { emit, listen } from "../tools/dom";
import { $PROPS, $REFS, $ROOT, $STORE, INIT } from "../tools/constants";
import { addStoreItem, data, store } from './store';

// Brio settings
export let _settings = {
    [INIT]: false,
    dev: false,
};

// List of reserved names
// * NOTE: _reservedNames will also include custom methods.
export let _reservedNames: string[] = [
    // Brio magic properties
    $STORE, '$data', '$el', $REFS, $PROPS, $ROOT,

    // Brio magic methods are added during initialization
];

// Brio API
export let api: Api = {
    // Methods that may only be called before Brio is initialized
    // Extend Brio
    addDirective,
    addMethod,
    addTransitionEngine,
    // Add assets
    addStoreItem: addStoreItem(store), // adds an item to the reactive data store
    addDataItem: addStoreItem(data), // adds an item to the non-reactive data store
    addComponent,
    addProps,
    // TODO: addTransition,

    // Helper functions
    emit,
    listen,

    // Reactivity methods
    state,
    computed,
    removeComputed,
    effect,
    watch,
    storage,
    isStorage,
    getItem,
    setItem,
};