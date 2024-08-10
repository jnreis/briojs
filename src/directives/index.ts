import { hydrateOn } from './on';
import { hydrateBind } from './bind';
import { hydrateModel } from './model';
import { hydrateMask } from "./mask";
import { hydrateIntersection } from "./intersection";

import { hydrateEach } from './each';
import { hydrateProps } from "./props";
import { hydrateInit } from './init';
import { hydrateUid } from "./uid";
import { hydrateIf } from './if';
import { hydrateShow } from './show';
import { hydrateHtml } from './html';
import { hydrateEffect } from './effect';
import { hydrateTeleport } from './teleport';
import { hydrateTransition } from "./transition";

import { startsWith } from "../tools/string";
import { EACH, PROPS, SKIP, STATUS, TELEPORT, TRANSITION } from "../tools/constants";

/** Register a directive with or without modifiers */
export let regDirective = (directiveName: string, hasModifiers: boolean = false) => (_: VNode, attrName: string) => {

    let prefix = startsWith(directiveName, 'on-') ? '' : 'b-';

    return hasModifiers
        // Returns 2 if the attribute name starts with the directive name
        ? startsWith(attrName, prefix + directiveName) 
            ? 2 : 0
        // Returns 1 if the attribute name is the same as the directive name
        : attrName == prefix + directiveName
            ? 1 : 0;
}

/** Active directives */
export let _directives: [ValidateDirective, HydrateDirective][] = [

    // Static directives
    // These directives do not have modifiers
    [regDirective('ignore'), (vnode: VNode) => vnode[STATUS] = SKIP],
    [regDirective('if'), hydrateIf],
    [regDirective('show'), hydrateShow],
    [regDirective(EACH), hydrateEach],
    [regDirective(PROPS), hydrateProps],
    [regDirective('init'), hydrateInit],
    [regDirective('uid'), hydrateUid],
    [regDirective('html'), hydrateHtml],
    [regDirective('effect'), hydrateEffect],
    [regDirective(TELEPORT), hydrateTeleport],
    [regDirective(TRANSITION), hydrateTransition],

    // Dynamic directives
    // These directives may have modifiers
    [regDirective('on-enter', true), hydrateIntersection], // on-enter-[modifiers] e.g. enter-once-[half|full-[threshold-number]]-margin-value-value?-value?-value?
    [regDirective('on-leave', true), hydrateIntersection], // on-leave-[modifiers]
    [regDirective('on-', true), hydrateOn], // on-[eventName]-[modifiers]
    [regDirective('model', true), hydrateModel], // b-model-[modifiers]
    [regDirective('mask', true), hydrateMask], // b-mask-[modifiers]
    [regDirective('', true), hydrateBind], // b-[attributeName] (bind)
];