import { store } from "./store";
import { addMethod } from './method'
import { addProps } from './props'
import { addDirective } from "./directive";
import { addTransition } from "./transition";
import { animate, afterAnimations } from "./animate";

import { state, computed, removeComputed, effect, watch, storage, isStorage, getItem, setItem } from "../reactivity";
import { emit, listen } from "../tools/dom";
import { $EL, $PROPS, $REFS, $ROOT, $STORE, INIT } from "../tools/constants";

// Brio settings
export let _settings = {
    [INIT]: false,
    dev: false,
};

// List of reserved names
// * NOTE: _reservedNames will also include custom methods.
export let _reservedNames: string[] = [
    // Brio magic properties
    $STORE, $EL, $REFS, $PROPS, $ROOT,

    // Brio magic methods are added during initialization
];

// Brio API
export let api = {
    // Global data store
    store,

    // Methods that may only be called before Brio is initialized
    addProps,
    addMethod,
    addDirective,
    addTransition,

    // Animate helpers
    animate,
    afterAnimations,

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