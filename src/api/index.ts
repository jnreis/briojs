import { addComponent } from './component';
import { addProps } from './props';
import { addMethod } from './method';
import { addDirective } from "./directive";
import { addTransitionEngine } from "./transition";

import { state, computed, removeComputed, effect, watch, storage } from "../reactivity";
import { emit, listen } from "../tools/dom";
import { $PROPS, $REFS, $ROOT, INIT } from "../tools/constants";
import { _storeNames, addStore } from './store';
import { _methods } from '../methods';
import { arrayMerge } from '../tools/array';

// Brio settings
export let _settings = {
    [INIT]: false,
    dev: false,
};

// Static list of reserved names including $el, $props, $refs, $root, and all global stores and magic methods
export let reservedNames: string[] = [];

/** Dynamic list of reserved names. This is only used during initialization. */
export let getReservedNames = () => arrayMerge(
    ['$el', $PROPS, $REFS, $ROOT], // Magic properties
    _methods.map(([name, _]) => name), // Magic methods
    _storeNames, // Global stores
) as string[];

// Brio API
export let api: Api = {
    // Methods that may only be called before Brio is initialized
    // To extend Brio
    addDirective,
    addMethod,
    addTransitionEngine,
    // To add assets
    addComponent,
    addProps,
    addStore,

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
};