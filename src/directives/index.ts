import { hydrateOn } from './on';
import { hydrateBind } from './bind';
import { hydrateModel } from './model';
import { hydrateMask } from "./mask";

import { hydrateEach } from './each';
import { hydrateContext } from "./context";
import { hydrateUid } from "./uid";
import { hydrateIf } from './if';
import { hydrateShow } from './show';
import { hydrateHtml } from './html';
import { hydrateEffect } from './effect';
import { hydrateTeleport } from './teleport';
import { hydrateTransition } from "./transition";
import { hydrateScripts } from './script';
import { hydrateStyles } from './styles';
import { hydrateIgnore } from './ignore';

import { B_, B_DATA, B_EACH, B_IF, B_PROPS, B_SHOW, HTML, INNER, SCRIPT, STYLE, TELEPORT, TEMPLATE, TEXT, TRANSITION } from "../tools/constants";
import { newRegExp } from '../tools/object';
import { isString } from '../tools/typeCheck';
import { findIndex } from '../tools/array';
import { startsWith, toString } from '../tools/string';
import { has } from '../tools';
import { hydrateTemplate } from './template';

let dynamicDirectivePattern = (directiveName: string) => newRegExp(`^(${directiveName})[\\w-]*$`);

/**
 * Active directives
 * [directiveName, hydrationFn][]
 */
export let directives: [string | RegExp, HydrationFunction][] = [

    // IMPORTANT: The `b-ignore` directive must be hydrated first because it stops the hydration of the element and its children.
    ['b-ignore', hydrateIgnore],


    // IMPORTANT: The `b-each` directive must be hydrated second because it hydrates other directives for each item it iterates over.
    [B_EACH, hydrateEach],

    // Context-related directives
    [B_PROPS, hydrateContext],
    [B_DATA, hydrateContext],
    ['b-uid', hydrateUid],

    [B_+HTML, hydrateHtml(INNER)],
    [B_+TEXT, hydrateHtml(TEXT)],
    [B_+TEMPLATE, hydrateTemplate],
    [B_+SCRIPT, hydrateScripts],
    [B_+STYLE, hydrateStyles],

    // IMPORTANT: The `b-teleport` directive must be hydrated before the `b-if` directive because `b-if` restores the element to its original position.
    [B_+TELEPORT, hydrateTeleport],

    // Conditional directives: These directives usually depend on values from the context
    [B_IF, hydrateIf],
    [B_SHOW, hydrateShow],

    // ['b-boost', hydrateBoost],
    [B_+TRANSITION, hydrateTransition],

    // b-on: used to create event listeners. Including special listeners such as `on-enter`, `on-exit`, and `on-resize`
    [dynamicDirectivePattern('b-on-|on-'), hydrateOn], // [b-on|on]-[eventName]-[...eventAlias]

    /**
     * Data binding directives
     * Used to bind data to an element's property or attribute
     * 
     * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
     * - The `b-mask` directive is used to format an input value using a mask.
     * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
     */
    [dynamicDirectivePattern('b-bind-|bind-'), hydrateBind], // [b-bind|bind]-[...attributeNames]
    ['b-model', hydrateModel],
    ['b-mask', hydrateMask],

    /**
     * b-effect: used to create one or more effects that run when their dependencies change.
     * It is perfect for small expressions, reactive or not.
     * Example: console.log(`Hello, ${$data.name}!`)
     */
    [dynamicDirectivePattern('b-effect'), hydrateEffect], // b-effect-[effectAlias]
];

/** Set a directive */
export let setDirective = (directiveName: string|RegExp, hydrationFunction: HydrationFunction, afterDirective?: string) => {

    // The index to add the directive
    let index = isString(afterDirective) && startsWith(afterDirective!, B_)
        ? findIndex(directives, ([name]) => has(toString(name), afterDirective!))
        : -1;

    // If the index was found, increment it by 1 to add this directive after the found directive
    if (index > -1) index = index + 1;

    // Add the new directive
    directives.splice(index, 0, [directiveName, hydrationFunction]);
}