import { logger } from "../tools";
import { $ROOT, ELEMENT, NOT_FOUND } from "../tools/constants";
import { emit } from "../tools/dom";
import { closestProps } from "../tools/hydration";
import { alphaNumericOnly, lower } from "../tools/string";

export let $emit = (vnode: VNode) => 
    (eventName: string, eventData?: any) => emit(vnode.$el, lower(alphaNumericOnly(eventName)), eventData);

export let $root = (_: any) => ($el: HTMLElement|Text) => {
    let _vnode = closestProps($el);
    if (!_vnode) logger($ROOT + ` ${ELEMENT} ` + NOT_FOUND);
    return _vnode?.$el;
};