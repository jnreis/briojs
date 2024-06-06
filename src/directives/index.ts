import { hydrateOn } from './on';
import { hydrateBind } from './bind';
import { hydrateModel } from './model';
import { hydrateMask } from "./mask";
import { hydrateIntersection } from "./intersection";

import { hydrateComponent } from './component';
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

import { startsWith } from "../tools/string";
import { COMPONENT, EACH, PROPS, SKIP, STATUS, TELEPORT, TEXT, TRANSITION } from "../tools/constants";

export let regDirective = (directiveName: string, hasModifiers: boolean = false) => (_: VNode, attrName: string) =>
    hasModifiers
        // Returns 2 if the attribute name starts with the directive name
        ? startsWith(attrName, directiveName) 
            ? 2 : 0
        // Returns 1 if the attribute name is the same as the directive name
        : attrName == directiveName
            ? 1 : 0;

export let _directives: [ValidateDirective, HydrateDirective][] = [

    // Static directives
    // These directives do not have modifiers
    [regDirective('ignore'), (vnode: VNode) => vnode[STATUS] = SKIP],
    [regDirective(COMPONENT), hydrateComponent],
    [regDirective(EACH), hydrateEach],
    [regDirective(PROPS), hydrateProps],
    [regDirective('init'), hydrateInit],
    [regDirective('uid'), hydrateUid],
    [regDirective('if'), hydrateIf],
    [regDirective('show'), hydrateShow],
    [regDirective('html'), hydrateHtml],
    [regDirective(TEXT), hydrateText],
    [regDirective('effect'), hydrateEffect],
    [regDirective(TELEPORT), hydrateTeleport],
    [regDirective(TRANSITION), hydrateTransition],

    // Dynamic directives
    // These directives may have modifiers
    [regDirective('on-enter', true), hydrateIntersection], // on-enter-[modifiers] e.g. enter-once-[half|full-[threshold-number]]-margin-value-value?-value?-value?
    [regDirective('on-leave', true), hydrateIntersection], // on-leave-[modifiers]
    [regDirective('on-', true), hydrateOn], // on-[eventName]-[modifiers]
    [regDirective('b-', true), hydrateBind], // b-[attributeName] (bind)
    [regDirective('model', true), hydrateModel], // model-[modifiers]
    [regDirective('mask', true), hydrateMask], // mask-[modifiers]
];