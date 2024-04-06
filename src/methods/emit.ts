import { $EL } from "../tools/constants";
import { emit } from "../tools/dom";
import { alphaNumericOnly, lower } from "../tools/string";

export let $emit = (vnode: VNode) => 
    (eventName: string, eventData?: any) => emit(vnode[$EL], lower(alphaNumericOnly(eventName)), eventData);