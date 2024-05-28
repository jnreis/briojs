import { state, effect, watch, storage } from "../reactivity";

/** Wrapps an object/array in a Proxy to track changes and notify listeners */
export let $state = () => state; // ! not currently in use

/** Watches for changes on all the observed properties accessed during a function execution (`fn` or `deps`) */
export let $effect = () => effect; // ! not currently in use

/** Watches for and reacts to changes to a specific key/index or an entire observed object/array */
export let $watch = () => watch;

export let $persist = () => (value: any, alias?: string) => storage(localStorage, value, alias);

export let $session = () => (value: any, alias?: string) => storage(sessionStorage, value, alias);