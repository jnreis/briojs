import { addComponent } from './component';
import { addProps } from './props';
import { addMethod } from './method';
import { addDirective } from "./directive";
import { addTransitionEngine } from "./transition";
import { addStore } from './store';
import { state, isState, computed, removeComputed, effect, watch, storage } from "../reactivity";
import { $PROPS, $REFS, INIT, $STORE } from "../tools/constants";

// Brio settings
export let _settings = {
    [INIT]: false
};

// Static list of reserved names including $el, $props, $refs, and all global stores and magic methods
export let reservedNames: string[] = ['$el', $PROPS, $REFS, $STORE];

export let api = {
    // To extend Brio.js
    // * Node: this methods may only be called before Brio.js is initialized
    addDirective,
    addMethod,
    addTransitionEngine,

    // To add assets
    addComponent,
    addProps,
    addStore,

    // Reactivity methods
    state,
    isState,
    computed,
    removeComputed,
    effect,
    watch,
    storage,
};