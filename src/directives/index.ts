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
import { transitionDirectives } from './transition';
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

    // IMPORTANT: The `b-ignore` directive must be hydrated first because it stops the hydration of the element and its children.
    ignoreDirective,

    // IMPORTANT: The `b-each` directive must be hydrated second because it hydrates other directives for each item it iterates over.
    eachDirective,

    // Context-related directives
    propsDirective,
    dataDirective,
    uidDirective,

    htmlDirective,
    textDirective,
    templateDirective,
    scriptDirective,
    styleDirective,

    // IMPORTANT: The `b-teleport` directive must be hydrated before the `b-if` directive because `b-if` restores the element to its original position.
    teleportDirective,

    // Conditional directives: These directives usually depend on values from the context
    ifDirective,
    showDirective,

    // ['b-boost', hydrateBoost],
    ...transitionDirectives, // b-transition, b-transition-in, b-transition-out

    ...intersectionDirectives, // [b-on|on]-enter, [b-on|on]-exit

    ...resizeDirectives, // [b-on|on]-resize

    onDirective, // [b-on|on]-[eventName]

    /**
     * Data binding directives
     * Used to bind data to an element's property or attribute
     * 
     * - The `b-bind-|bind-` directive is a general directive used to bind data to an element property or attribute.
     * - The `b-model` directive is used to create a two-way data binding between an input value and a reactive property.
     * - The `b-mask` directive is used to format an input value using a mask.
     */
    bindDirective, // [b-bind|bind]-[attributeName]
    modelDirective,
    maskDirective,

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