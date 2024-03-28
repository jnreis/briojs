import { VNode, ValidateAttribute, HydrateDirective } from "..";

import { hydrateOn } from './on';
import { hydrateBind } from './bind';
import { hydrateModel } from './model';
import { hydrateMask } from "./mask";

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
import { $EL, EFFECT, TELEPORT, TEXT } from "../tools/constants";

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

let attrNameStartsWith = (prefix: string) => (attrName: string) => startsWith(attrName, prefix);
let attrNameEquals = (name: string) => (attrName: string) => attrName == name;

export let _directives: [ValidateAttribute, HydrateDirective][] = [

    // Dynamic directives
    // These directives have dynamic attribute names
    [attrNameStartsWith('on-'), hydrateOn], // on-[eventName]-[modifiers]
    [attrNameStartsWith('bind-'), hydrateBind], // bind-[attributeName]-[modifiers]
    [attrNameStartsWith('model'), hydrateModel], // model-[modifiers]
    [attrNameStartsWith('mask'), hydrateMask], // mask-[modifiers]

    // Regular directives
    // These directives have static attribute names
    [attrNameEquals('if'), hydrateIf],
    [attrNameEquals('show'), hydrateShow],
    [attrNameEquals('html'), hydrateHtml],
    [attrNameEquals(TEXT), hydrateText],
    [attrNameEquals(EFFECT), hydrateEffect],
    [attrNameEquals(TELEPORT), hydrateTeleport],
    [attrNameEquals('transition'), hydrateTransition],
    [attrNameEquals('enter'), hydrateIntersection],
    [attrNameEquals('leave'), hydrateIntersection],
];

export { hydrateEach } from './each';
export { hydrateProps } from './props';
export { hydrateInit } from './init';
export { hydrateUid } from './uid';