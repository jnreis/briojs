import { VNode } from "..";
import { $EL } from "../tools/constants";
import { emit } from "../tools/dom";
import { alphaOnly, lower } from "../tools/string";

export let $emit = (vnode: VNode) => 
    (eventName: string, eventData?: any) => emit(vnode[$EL], lower(alphaOnly(eventName)), eventData);