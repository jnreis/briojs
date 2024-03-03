import { ObjectType } from "..";

import { store } from "./store";
import { addMethod } from './method'
import { addProps } from './props'
import { addDirective } from "./directive";

// import { hydrate, hydrateTextNode, hydrateElementNode, dehydrate, saveAttr, saveEffect, saveVNode, closestVNode, newVNode } from "../hydration";
// import { evaluate, ref, getRefOrEvaluate } from "../evaluation";

import { state, computed, removeComputed, effect, watch } from "../reactivity";
import { emit, listen } from "../tools/dom";
import { $EL, $EMIT, $PROPS, $REFS, $ROOT, $STORE, $UID, $WATCH } from "../tools/constants";

// Brio settings
export let _settings = {
    init: false,
    dev: false,
}

// Brio API
export let api: ObjectType = {
    // Global data store
    store,

    // To register props, custom methods, and custom directives during initialization
    addProps,
    addMethod,
    addDirective,

    // Helper functions
    emit,
    listen,

    // Reactivity methods
    state,
    computed,
    removeComputed,
    effect,
    watch,
}

// List of reserved names
// * NOTE: _reservedNames will also include custom methods.
export let _reservedNames = [
    // Brio magic properties
    $STORE, $EL, $REFS, $PROPS, $ROOT,

    // Brio magic methods.
    $EMIT, $UID, $WATCH
];