import { ignoreDirective } from './ignore';
import { eachDirective } from './each';
import { dataDirective, propsDirective } from './context';
import { uidDirective } from './uid';
import { htmlDirective, textDirective } from './html';
import { templateDirective } from './template';
import { scriptDirective } from './script';
import { styleDirective } from './styles';
import { teleportDirective } from './teleport';
import { ifDirective } from './if';
import { showDirective } from './show';
import { transitionDirective } from './transition';
import { intersectionDirectives } from './intersection';
import { resizeDirectives } from './resize';
import { onDirective } from './on';
import { bindDirective } from './bind';
import { modelDirective } from './model';
import { maskDirective, moneyMask, setDefaultMaskTokens } from './mask';
import { effectDirective } from './effect';
import { arrayAdd, each } from '../tools/array';
import { DIRECTIVES } from '../tools/constants';

/**
 * Active directives
 * [directiveName, hydrationFn][]
 */
export let allDirectives: [string | RegExp, HydrateDirective][] = [

    /**
     * The b-ignore directive is used to stop the hydration of the element and its children.
     */
    ignoreDirective,

    /**
     * Conditional hydration
     * Notes:
     * - b-if stops the hydration flow of the element and starts a new hydration flow with a copy of the element whenever the condition evaluates to true
     * - the original element is replaced with a placeholder comment node to hold its location in the DOM
     * - whenever the condition evaluates to false, the copy of the element is dehydrated and removed from the DOM
     */
    ifDirective,

    /**
     * Context directives
     * Notes:
     * - the order of inference is: $each, $uid, $data, $props, $store, $tools
     */
    propsDirective,
    dataDirective,

    /** List rendering
     * Notes:
     * - b-each stops the hydration flow of the element and starts a new hydration flow for each item it creates
     */
    eachDirective,

    /**
     * Unique ID generator
     */
    uidDirective,

    /**
     * Static template hydration
     * Notes:
     * - the inner HTML of the element is used as a template and it may include more than one root element
     * - the element that contains the b-template directive is removed from the DOM and its content is inserted in its place
     *   and because of that:
     *   - the b-template directive SHOULD NOT be used with elements that are self-closing (e.g. <img />, <input />, etc.)
     *   - the b-template directive CANNOT be used with: b-show, b-html, b-text, b-style, bind-*, b-model, b-mask, b-transition, on-*
     *     this is because these directives need to be hydrated on the element itself and not on its content
     *   - the b-template directive CAN be used with: b-ignore, b-props, b-data, b-ref, b-slot, b-if, b-each, b-uid, b-teleport, b-script, b-effect
     */
    templateDirective,

    /**
     * Conditional display
     * Notes:
     * - the element is hydrated regardless of the condition
     * - the b-show directive toggles the `display` of the element based on the condition
     */
    showDirective,

    /**
     * The b-teleport moves the element to a different location in the DOM.
     * Notes:
     * - b-teleport also works with the b-if and b-template directives
     */
    teleportDirective,

    /**
     * Run one or more scripts on the element
     * Notes:
     * - the b-script directive may hold one script or an array of scripts
     * - the script(s) are executed in order and awaited
     * - when b-script is in a script element the content of the src file or text content is added to the list of scripts to be executed
     */
    scriptDirective,

    /**
     * Dynamic hydration of HTML or text content and styles
     * Notes:
     * - if the element has a b-html and b-text directive, the b-html directive is hydrated and the b-text directive is ignored
     * - b-style always hydrates regardless of the b-html and b-text directives
     */
    htmlDirective,
    textDirective,

    /**
     * Dynamic insertion of styles
     * Notes:
     * - the style element is inserted after the element that contains the b-style directive
     */
    styleDirective,

    /**
     * Data binding directives
     * Used to bind data to an element's property or attribute
     * 
     * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute
     * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property
     * - The `b-mask` directive is used to format an input value using a mask
     */
    bindDirective, // [b-bind|bind]-[attributeName]
    modelDirective,
    maskDirective,

    // ['b-boost', hydrateBoost],
    transitionDirective, // b-transition, b-transition-play, b-transition-reverse

    ...intersectionDirectives, // [b-on|on]-enter, [b-on|on]-exit

    ...resizeDirectives, // [b-on|on]-resize

    onDirective, // [b-on|on]-[eventName]

    /**
     * b-effect: used to create an effect that run when its dependencies change.
     * It is perfect for small expressions, reactive or not.
     * Example: console.log(`Hello, ${$data.name}!`)
     */
    effectDirective,
];

export let setAllDirectives = (app: AppObject) => {
    each(allDirectives, directive => arrayAdd(app[DIRECTIVES], directive));

    // Load the money mask
    app.masks.money = moneyMask;

    // Set the default mask tokens
    setDefaultMaskTokens(app.maskTokens);
}