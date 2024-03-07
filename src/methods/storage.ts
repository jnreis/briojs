import { storage } from "../reactivity/storage";

export let $persist = (_: any) => (value: any, alias?: string) =>
    storage(localStorage, value, alias);

export let $session = (_: any) => (value: any, alias?: string) =>
    storage(sessionStorage, value, alias);