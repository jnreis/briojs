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

export let addDirective = (directiveName: string) => (_: VNode, attrName: string) =>
    attrName == directiveName ? 1 : startsWith(attrName, directiveName) ? 2 : 0;

export let _directives: [ValidateDirective, HydrateDirective][] = [

    // Static directives
    // These directives do not have modifiers
    [addDirective('ignore'), (vnode: VNode) => vnode[STATUS] = SKIP],
    [addDirective(EACH), hydrateEach],
    [addDirective(PROPS), hydrateProps],
    [addDirective('init'), hydrateInit],
    [addDirective('uid'), hydrateUid],
    [addDirective('if'), hydrateIf],
    [addDirective('show'), hydrateShow],
    [addDirective('html'), hydrateHtml],
    [addDirective(TEXT), hydrateText],
    [addDirective('effect'), hydrateEffect],
    [addDirective(TELEPORT), hydrateTeleport],
    [addDirective(TRANSITION), hydrateTransition],

    // Dynamic directives
    // These directives may have modifiers
    [addDirective('on-enter'), hydrateIntersection], // on-enter-[modifiers] e.g. enter-once-[half|full-[threshold-number]]-margin-value-value?-value?-value?
    [addDirective('on-leave'), hydrateIntersection], // on-leave-[modifiers]
    [addDirective('on-'), hydrateOn], // on-[eventName]-[modifiers]
    [addDirective('b-'), hydrateBind], // b-[attributeName] (bind)
    [addDirective('model'), hydrateModel], // model-[modifiers]
    [addDirective('mask'), hydrateMask], // mask-[modifiers]
];