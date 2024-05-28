import { emit } from "../tools/dom";
import { alphaNumericOnly, lower } from "../tools/string";

export let $emit = (vnode: VNode) => 
    (eventName: string, eventData?: any) => emit(vnode.$el, lower(alphaNumericOnly(eventName)), eventData);