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

import { getRefOrEvaluate } from "../evaluation";
import { saveAttr, saveEffect } from "../hydration";
import { startsWith } from "../tools/string";
import { $EL, EACH, EFFECT, PROPS, TELEPORT, TEXT } from "../tools/constants";
import { findAttr, getAttr } from "../tools/dom";
import { isNull } from "../tools/typeCheck";

export let hydrationWrapper = (
    vnode: VNode,
    attrName: string,
    attrValue: string,
    callback: (node: HTMLElement) => (...args: any) => any
) => {

    // The callback returns the function to watch (watchFn).
    // The `watchFn` receives the prop or expression.
    // If the prop or expression contains observed value(s), the `watchFn` will be called when the observed value(s) change.
    let watchFn = callback(vnode[$EL]);

    // Watch the prop or expression
    saveEffect(vnode, () => watchFn(getRefOrEvaluate(vnode, attrValue)), false);

    // Save attribute
    saveAttr(vnode, attrName, attrValue);
}

let attrNameStartsWith = (startName: string) => (vnode: VNode) =>
    findAttr(vnode[$EL], (attrName: string) => startsWith(attrName, startName));

let attrNameEquals = (attrName: string) => (vnode: VNode): [string, string] | undefined => {
    let attrValue = getAttr(vnode[$EL], attrName);
    if (!isNull(attrValue)) return [attrName, attrValue as string];
}

export let _directives: [ValidateDirective, HydrateDirective][] = [

    // Static directives
    // These directives do not have modifiers
    [attrNameEquals('ignore'), () => false],
    [attrNameEquals(EACH), hydrateEach],
    [attrNameEquals(PROPS), hydrateProps],
    [attrNameEquals('init'), hydrateInit],
    [attrNameEquals('uid'), hydrateUid],
    [attrNameEquals('if'), hydrateIf],
    [attrNameEquals('show'), hydrateShow],
    [attrNameEquals('html'), hydrateHtml],
    [attrNameEquals(TEXT), hydrateText],
    [attrNameEquals(EFFECT), hydrateEffect],
    [attrNameEquals(TELEPORT), hydrateTeleport],
    [attrNameEquals('transition'), hydrateTransition],
    [attrNameEquals('enter'), hydrateIntersection],
    [attrNameEquals('leave'), hydrateIntersection],

    // Dynamic directives
    // These directives may have modifiers
    [attrNameStartsWith('on-'), hydrateOn], // on-[eventName]-[modifiers]
    [attrNameStartsWith('b-'), hydrateBind], // b-[attributeName] (bind)
    [attrNameStartsWith('model'), hydrateModel], // model-[modifiers]
    [attrNameStartsWith('mask'), hydrateMask], // mask-[modifiers]
];