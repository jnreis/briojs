import { storage, watch } from "../reactivity";

export let $watch = () => watch;

export let $persist = () => (value: any, alias?: string) => storage(localStorage, value, alias);

export let $session = () => (value: any, alias?: string) => storage(sessionStorage, value, alias);