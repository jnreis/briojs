import { hydrateOn } from './on';
import { hydrateBind } from './bind';
import { hydrateModel } from './model';
import { hydrateMask } from "./mask";

import { hydrateEach } from './each';
import { hydrateProps } from "./props";
import { hydrateInit } from './init';
import { hydrateUid } from "./uid";
import { hydrateIf } from './if';
import { hydrateShow } from './show';
import { hydrateHtml } from './html';
import { hydrateText } from './text';
import { hydrateEffect } from './effect';
import { hydrateTeleport } from './teleport';
import { hydrateTransition } from "./transition";
import { hydrateIntersection } from "./intersection";

import { startsWith } from "../tools/string";
import { EACH, PROPS, SKIP, STATUS, TELEPORT, TEXT, TRANSITION } from "../tools/constants";
import { findAttr, getAttr } from "../tools/dom";
import { isNull } from "../tools/typeCheck";

export let attrNameStartsWith = (startName: string) => (vnode: VNode) =>
    findAttr(vnode.$el, (attrName: string) => startsWith(attrName, startName));

export let attrNameEquals = (attrName: string) => (vnode: VNode): [string, string] | undefined => {
    let attrValue = getAttr(vnode.$el, attrName);
    if (!isNull(attrValue)) return [attrName, attrValue as string];
}

export let _directives: [ValidateDirective, HydrateDirective][] = [

    // Static directives
    // These directives do not have modifiers
    [attrNameEquals('ignore'), (vnode: VNode) => vnode[STATUS] = SKIP],
    [attrNameEquals(EACH), hydrateEach],
    [attrNameEquals(PROPS), hydrateProps],
    [attrNameEquals('init'), hydrateInit],
    [attrNameEquals('uid'), hydrateUid],
    [attrNameEquals('if'), hydrateIf],
    [attrNameEquals('show'), hydrateShow],
    [attrNameEquals('html'), hydrateHtml],
    [attrNameEquals(TEXT), hydrateText],
    [attrNameEquals('effect'), hydrateEffect],
    [attrNameEquals(TELEPORT), hydrateTeleport],
    [attrNameEquals(TRANSITION), hydrateTransition],

    // Dynamic directives
    // These directives may have modifiers
    [attrNameStartsWith('on-enter'), hydrateIntersection], // on-enter-[modifiers] e.g. enter-once-[half|full-[threshold-number]]-margin-value-value?-value?-value?
    [attrNameStartsWith('on-leave'), hydrateIntersection], // on-leave-[modifiers]
    [attrNameStartsWith('on-'), hydrateOn], // on-[eventName]-[modifiers]
    [attrNameStartsWith('b-'), hydrateBind], // b-[attributeName] (bind)
    [attrNameStartsWith('model'), hydrateModel], // model-[modifiers]
    [attrNameStartsWith('mask'), hydrateMask], // mask-[modifiers]
];