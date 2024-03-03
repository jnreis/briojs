import { VNode } from "..";
import { $EL } from "../tools/constants";
import { emit } from "../tools/dom";

export let $emit = (vnode: VNode) => 
    (eventName: string, eventData?: any) => emit(vnode[$EL], eventName, eventData);