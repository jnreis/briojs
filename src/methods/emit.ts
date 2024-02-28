import { emit } from "../tools/dom";

export let $emit = ($el: HTMLElement) => 
    (eventName: string, eventData?: any) => emit($el, eventName, eventData);